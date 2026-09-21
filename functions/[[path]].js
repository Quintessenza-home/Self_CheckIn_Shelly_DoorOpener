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

const TRANSLATION_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

const TRANSLATION_TARGETS = {
  en: { name: "English", openNow: "OPEN NOW", glossary: "cancello = gate or vehicle gate; cancellino = pedestrian gate; citofono = intercom; portoncino = entrance door" },
  de: { name: "German", openNow: "JETZT ÖFFNEN", glossary: "cancello = Einfahrtstor; cancellino = Fußgängertor; citofono = Gegensprechanlage; portoncino = Eingangstür" },
  fr: { name: "French", openNow: "OUVRIR MAINTENANT", glossary: "cancello = portail; cancellino = portillon; citofono = interphone; portoncino = porte d’entrée" },
  es: { name: "Spanish", openNow: "ABRIR AHORA", glossary: "cancello = portón; cancellino = puerta peatonal; citofono = interfono; portoncino = puerta de entrada" },
  nl: { name: "Dutch", openNow: "NU OPENEN", glossary: "cancello = poort; cancellino = voetgangerspoort; citofono = intercom; portoncino = toegangsdeur" },
};

const CURATED_TRANSLATIONS = {
  "Questo sistema ti permette di aprire il cancello elettrico automatico, il portoncino esterno e quello interno. Per qualunque problema contattaci al numero di assistenza.": {
    "en": "This system allows you to open the automatic electric gate, the external entrance door and the internal entrance door. If you need help, please contact us using the assistance number.",
    "de": "Mit diesem System können Sie das automatische Einfahrtstor sowie die äußere und die innere Eingangstür öffnen. Bei Problemen kontaktieren Sie uns bitte über die Hilfenummer.",
    "fr": "Ce système vous permet d’ouvrir le portail électrique automatique ainsi que la porte d’entrée extérieure et la porte intérieure. En cas de problème, contactez-nous au numéro d’assistance.",
    "es": "Este sistema permite abrir el portón eléctrico automático, la puerta de entrada exterior y la puerta interior. Si tiene algún problema, póngase en contacto con nosotros mediante el número de asistencia.",
    "nl": "Met dit systeem kunt u de automatische elektrische poort, de buitendeur en de binnendeur openen. Neem bij problemen contact met ons op via het assistentienummer."
  },
  "Cancello Esterno": {
    "en": "External Gate",
    "de": "Außentor",
    "fr": "Portail extérieur",
    "es": "Portón exterior",
    "nl": "Buitenpoort"
  },
  "clicca sul pulsante APRI ORA per aprire il cancello esterno": {
    "en": "Tap OPEN NOW to open the external gate.",
    "de": "Tippen Sie auf JETZT ÖFFNEN, um das Außentor zu öffnen.",
    "fr": "Appuyez sur OUVRIR MAINTENANT pour ouvrir le portail extérieur.",
    "es": "Pulse ABRIR AHORA para abrir el portón exterior.",
    "nl": "Tik op NU OPENEN om de buitenpoort te openen."
  },
  "Cancellini": {
    "en": "Pedestrian Gates",
    "de": "Fußgängertore",
    "fr": "Portillons",
    "es": "Puertas peatonales",
    "nl": "Voetgangerspoorten"
  },
  "1) Suona il citofono \"Quintessenza Home\" \n2) Clicca sul pulsante APRI ORA\n(la procedura è la stessa sia per cancellino esterno che per quello interno)": {
    "en": "1) Ring the “Quintessenza Home” intercom.\n2) Tap OPEN NOW.\n(The procedure is the same for both the external and internal pedestrian gates.)",
    "de": "1) Klingeln Sie an der Gegensprechanlage „Quintessenza Home“.\n2) Tippen Sie auf JETZT ÖFFNEN.\n(Der Ablauf ist für das äußere und das innere Fußgängertor gleich.)",
    "fr": "1) Sonnez à l’interphone « Quintessenza Home ».\n2) Appuyez sur OUVRIR MAINTENANT.\n(La procédure est la même pour le portillon extérieur et le portillon intérieur.)",
    "es": "1) Llame al interfono « Quintessenza Home ».\n2) Pulse ABRIR AHORA.\n(El procedimiento es el mismo para la puerta peatonal exterior y la interior.)",
    "nl": "1) Bel aan via de intercom “Quintessenza Home”.\n2) Tik op NU OPENEN.\n(De werkwijze is hetzelfde voor de buitenste en de binnenste voetgangerspoort.)"
  }
};

function applyCuratedTranslations(field) {
  const source = String(field[DEFAULT_LANGUAGE] || "").trim();
  const curated = CURATED_TRANSLATIONS[source];
  if (!curated) return;
  for (const language of LANGUAGES) {
    if (language !== DEFAULT_LANGUAGE && curated[language]) field[language] = curated[language];
  }
}

function parseTranslation(result) {
  let value = result && typeof result === "object" ? result.response : result;
  if (value && typeof value === "object") return value;
  value = String(value || "").trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  if (!value) throw new Error("risposta di traduzione vuota");
  return JSON.parse(value);
}

function validateTranslation(value, source, language) {
  if (!value || typeof value.general_instructions !== "string" || !Array.isArray(value.doors)) {
    throw new Error("formato non valido per la lingua " + language);
  }
  if (value.doors.length !== source.doors.length) {
    throw new Error("numero di porte non valido per la lingua " + language);
  }
  const byId = new Map(value.doors.map((door) => [String(door.id || ""), door]));
  return {
    general_instructions: value.general_instructions.trim(),
    doors: source.doors.map((door) => {
      const translated = byId.get(door.id);
      if (!translated || typeof translated.name !== "string" || typeof translated.instructions !== "string") {
        throw new Error("porta mancante nella lingua " + language);
      }
      return {
        id: door.id,
        name: translated.name.trim(),
        instructions: translated.instructions.trim(),
      };
    }),
  };
}

/** Traduce in un unico passaggio contestuale tutti i testi italiani della configurazione. */
async function translateConfig(env, config) {
  if (!env.AI || typeof env.AI.run !== "function") {
    throw new Error("il binding Workers AI denominato AI non è disponibile");
  }

  const source = {
    general_instructions: String(config.instructions[DEFAULT_LANGUAGE] || "").trim(),
    doors: config.doors.map((door) => ({
      id: door.id,
      name: String(door.name[DEFAULT_LANGUAGE] || "").trim(),
      instructions: String(door.instructions[DEFAULT_LANGUAGE] || "").trim(),
    })),
  };

  for (const language of LANGUAGES.filter((code) => code !== DEFAULT_LANGUAGE)) {
    const target = TRANSLATION_TARGETS[language];
    if (!target) throw new Error("lingua di destinazione non supportata: " + language);
    const prompt = [
      "Translate this Italian guest-access configuration into natural, concise " + target.name + ".",
      "Return only a JSON object with exactly this shape: {\"general_instructions\":\"...\",\"doors\":[{\"id\":\"...\",\"name\":\"...\",\"instructions\":\"...\"}]}",
      "Keep every door id unchanged and keep the doors in the same order.",
      "Preserve every numbered step, line break, parenthetical note and assistance sentence.",
      "Keep the brand name Quintessenza Home unchanged.",
      "Translate the button words APRI ORA exactly as " + target.openNow + ".",
      "Use this terminology: " + target.glossary + ".",
      "Use polite language suitable for guests of all ages. Do not add or remove information.",
      "Italian source JSON:",
      JSON.stringify(source),
    ].join("\n");
    const result = await env.AI.run(TRANSLATION_MODEL, {
      messages: [
        { role: "system", content: "You are a precise hospitality translator. Output valid JSON only." },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            general_instructions: { type: "string" },
            doors: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                  instructions: { type: "string" },
                },
                required: ["id", "name", "instructions"],
              },
            },
          },
          required: ["general_instructions", "doors"],
        },
      },
      temperature: 0.1,
      max_tokens: 1800,
    });
    const translated = validateTranslation(parseTranslation(result), source, language);
    config.instructions[language] = translated.general_instructions;
    translated.doors.forEach((door, index) => {
      config.doors[index].name[language] = door.name;
      config.doors[index].instructions[language] = door.instructions;
    });
  }

  applyCuratedTranslations(config.instructions);
  for (const door of config.doors) {
    applyCuratedTranslations(door.name);
    applyCuratedTranslations(door.instructions);
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
