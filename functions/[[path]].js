// functions/[[path]].js
// Router unico del progetto:
//   /setup  -> login + pannello di configurazione (persistente su KV)
//   /*      -> tastierino pubblico (GET) e comando di apertura (POST)

import { htmlResponse, jsonResponse } from "./_lib/html.js";
import { loadConfig, saveConfig, normalizeConfig, validateConfig, resolveDoor } from "./_lib/store.js";
import {
  isAuthenticated, createSessionToken, sessionCookie, clearSessionCookie, safeEqual,
  createGuestToken, guestCookie, hasGuestAccess,
} from "./_lib/auth.js";
import { STRINGS, LANGUAGE_LABELS, LANGUAGE_FLAGS, LANGUAGES, DEFAULT_LANGUAGE, resolveLanguage, pickText, t } from "./_lib/i18n.js";
import { openDoor } from "./_lib/shelly.js";
import { renderLoginPage, renderSetupPage } from "./_lib/setup-page.js";
import { renderKeypadPage } from "./_lib/keypad-page.js";

const SETUP_PATH = "/setup";

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  // Serve the branding image instead of the catch-all keypad page.
  if (url.pathname === "/logo.png" && (request.method === "GET" || request.method === "HEAD")) {
    return env.ASSETS.fetch(request);
  }
  const setupPassword = env.SETUP_PASSWORD || "admin";

  if (url.pathname === SETUP_PATH || url.pathname.endsWith("/setup")) {
    return handleSetup({ request, env, url, setupPassword });
  }
  return handlePublic({ request, env, url });
}

/* ------------------------------------------------------------------ */
/* Pannello di configurazione                                          */
/* ------------------------------------------------------------------ */

function redirect(location, cookie) {
  const headers = { Location: location, "Cache-Control": "no-store" };
  if (cookie) headers["Set-Cookie"] = cookie;
  return new Response(null, { status: 303, headers });
}

async function handleSetup({ request, env, url, setupPassword }) {
  const setupPath = url.pathname;

  if (request.method === "POST") {
    const contentType = request.headers.get("Content-Type") || "";

    // Richieste dell'interfaccia (salvataggio, test): richiedono sessione valida.
    if (contentType.includes("application/json")) {
      if (!(await isAuthenticated(request, setupPassword))) {
        return jsonResponse({ ok: false, msg: "Sessione scaduta." }, { status: 401 });
      }
      return handleSetupAction({ request, env });
    }

    // Login dal form.
    const form = await request.formData();
    if (safeEqual(String(form.get("password") || ""), setupPassword)) {
      return redirect(setupPath, sessionCookie(url, await createSessionToken(setupPassword)));
    }
    return htmlResponse(
      renderLoginPage({ actionPath: setupPath, error: "Password errata! ❌" }),
      { status: 401 }
    );
  }

  if (url.searchParams.has("logout")) {
    return redirect(setupPath, clearSessionCookie(url));
  }

  // Compatibilità con i vecchi link /setup?key=PASSWORD: la password viene
  // convertita in sessione e rimossa dall'URL (e quindi dalla cronologia).
  const legacyKey = url.searchParams.get("key");
  if (legacyKey !== null) {
    if (safeEqual(legacyKey, setupPassword)) {
      return redirect(setupPath, sessionCookie(url, await createSessionToken(setupPassword)));
    }
    return htmlResponse(
      renderLoginPage({ actionPath: setupPath, error: "Password errata! ❌" }),
      { status: 401 }
    );
  }

  if (!(await isAuthenticated(request, setupPassword))) {
    return htmlResponse(renderLoginPage({ actionPath: setupPath, error: "" }));
  }

  const { config, source, storeName, writable } = await loadConfig(env);
  return htmlResponse(
    renderSetupPage({ config, storage: { source, storeName, writable }, actionPath: setupPath })
  );
}

const TRANSLATION_MODEL = "@cf/meta/m2m100-1.2b";

function translatedValue(result) {
  if (!result || typeof result !== "object") return "";
  return String(result.translated_text || result.translation || result.response || "").trim();
}

/** Traduce dal testo italiano master e conserva i risultati nella configurazione. */
async function translateConfig(env, config) {
  if (!env.AI || typeof env.AI.run !== "function") {
    throw new Error("il binding Workers AI denominato AI non è disponibile");
  }

  const fields = [config.instructions];
  for (const door of config.doors) fields.push(door.name, door.instructions);
  const targets = LANGUAGES.filter((code) => code !== DEFAULT_LANGUAGE);

  for (const language of targets) {
    const translated = await Promise.all(fields.map(async (field) => {
      const source = String(field[DEFAULT_LANGUAGE] || "").trim();
      if (!source) return "";
      const result = await env.AI.run(TRANSLATION_MODEL, {
        text: source,
        source_lang: DEFAULT_LANGUAGE,
        target_lang: language,
      });
      const value = translatedValue(result);
      if (!value) throw new Error("risposta vuota per la lingua " + language);
      return value;
    }));
    fields.forEach((field, index) => { field[language] = translated[index]; });
  }

  config.translation_updated_at = new Date().toISOString();
  return config;
}

async function handleSetupAction({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ ok: false, msg: "Richiesta non valida." }, { status: 400 });
  }

  if (body.action === "save") {
    const config = normalizeConfig(body.config);
    const errors = validateConfig(config);
    if (errors.length) {
      return jsonResponse({ ok: false, msg: errors[0], errors });
    }
    try {
      await translateConfig(env, config);
      await saveConfig(env, config);
    } catch (error) {
      return jsonResponse({ ok: false, msg: "Traduzione o salvataggio non riusciti: " + error.message });
    }
    // La configurazione normalizzata e tradotta torna al client.
    return jsonResponse({ ok: true, msg: "Configurazione e traduzioni salvate ✅", config });
  }

  if (body.action === "test") {
    const door = body.door && typeof body.door === "object" ? body.door : {};
    const name = String(door.name || "Porta").trim() || "Porta";
    const result = await openDoor({
      name,
      server: String(door.server || "").trim(),
      device_id: String(door.device_id || "").trim(),
      auth_key: String(door.auth_key || "").trim(),
    });
    // Il pannello amministrativo è in italiano.
    return jsonResponse({
      success: result.success,
      msg: t("it", result.code, { name, status: result.status }),
    });
  }

  return jsonResponse({ ok: false, msg: "Azione sconosciuta." }, { status: 400 });
}

/* ------------------------------------------------------------------ */
/* Tastierino pubblico                                                 */
/* ------------------------------------------------------------------ */

/** Piccolo ritardo sui codici errati, per rallentare i tentativi automatici. */
function slowDown() {
  return new Promise((resolve) => setTimeout(resolve, 500));
}

/** Solo i dati che l'ospite può vedere: nessuna credenziale, nessun PIN. */
function publicContent(config) {
  return {
    mode: config.mode,
    emergency_contact: config.emergency_contact,
    instructions: config.instructions,
    doors: config.doors.map((door) => ({
      id: door.id,
      name: door.name,
      instructions: door.instructions,
      requiresPin: !!door.pin,
    })),
  };
}

/** Dizionario dell'interfaccia limitato alle lingue attivate. */
function uiStrings(languages) {
  const subset = {};
  for (const code of languages) subset[code] = STRINGS[code];
  return subset;
}

function languageFor(config, { explicit }) {
  // Per i nuovi visitatori parte sempre l'italiano, se attivo.
  // Una scelta esplicita (?lang= o selettore) continua ad avere precedenza.
  const initialLanguage = config.languages.includes("it") ? "it" : config.default_language;
  return resolveLanguage({
    explicit,
    acceptLanguage: "",
    fallback: initialLanguage,
    available: config.languages,
  });
}

async function handlePublic({ request, env, url }) {
  const { config } = await loadConfig(env);

  if (request.method === "POST") {
    return handleGuestRequest({ request, url, config });
  }

  const lang = languageFor(config, { explicit: url.searchParams.get("lang"), request });
  const unlocked = await hasGuestAccess(request, config.access_pin);

  return htmlResponse(
    renderKeypadPage({
      data: {
        lang,
        languages: config.languages,
        languageLabels: LANGUAGE_LABELS,
        languageFlags: LANGUAGE_FLAGS,
        ui: uiStrings(config.languages),
        locked: !unlocked,
        setupPath: SETUP_PATH,
        // Il contatto di assistenza deve essere disponibile anche prima dello sblocco.
        emergencyContact: config.emergency_contact,
        // Finché il codice di accesso non è superato, l'elenco delle porte
        // non viene nemmeno inviato al browser.
        content: unlocked ? publicContent(config) : null,
      },
    })
  );
}

async function handleGuestRequest({ request, url, config }) {
  let body;
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const lang = languageFor(config, { explicit: body.lang, request });

  if (body.action === "unlock") {
    if (!config.access_pin) {
      return jsonResponse({ success: true, content: publicContent(config) });
    }
    if (!safeEqual(String(body.pin || ""), config.access_pin)) {
      await slowDown();
      return jsonResponse({ success: false, msg: t(lang, "locked_error") });
    }
    return jsonResponse(
      { success: true, content: publicContent(config) },
      { headers: { "Set-Cookie": guestCookie(url, await createGuestToken(config.access_pin)) } }
    );
  }

  // Apertura: il codice di accesso va superato anche qui, non solo a schermo.
  if (!(await hasGuestAccess(request, config.access_pin))) {
    return jsonResponse(
      { success: false, locked: true, msg: t(lang, "locked_expired") },
      { status: 401 }
    );
  }

  const door =
    config.doors.find((candidate) => body.doorId && candidate.id === body.doorId) ||
    config.doors[body.doorIndex];

  if (!door) {
    return jsonResponse({ success: false, msg: t(lang, "door_not_found") }, { status: 404 });
  }

  if (door.pin && !safeEqual(String(body.pin || ""), door.pin)) {
    await slowDown();
    return jsonResponse({ success: false, msg: t(lang, "pin_wrong") });
  }

  const result = await openDoor(resolveDoor(config, door));
  return jsonResponse({
    success: result.success,
    msg: t(lang, result.code, {
      name: pickText(door.name, lang, config.default_language),
      status: result.status,
    }),
  });
}
