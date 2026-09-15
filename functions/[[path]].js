// functions/[[path]].js
// Router unico del progetto:
//   /setup  -> login + pannello di configurazione (persistente su KV)
//   /*      -> tastierino pubblico (GET) e comando di apertura (POST)

import { htmlResponse, jsonResponse } from "./_lib/html.js";
import { loadConfig, saveConfig, normalizeConfig, validateConfig, resolveDoor } from "./_lib/store.js";
import {
  isAuthenticated, createSessionToken, sessionCookie, clearSessionCookie, safeEqual,
} from "./_lib/auth.js";
import { openDoor } from "./_lib/shelly.js";
import { renderLoginPage, renderSetupPage } from "./_lib/setup-page.js";
import { renderKeypadPage } from "./_lib/keypad-page.js";

const SETUP_PATH = "/setup";

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
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
      await saveConfig(env, config);
    } catch (error) {
      return jsonResponse({ ok: false, msg: error.message });
    }
    // La configurazione normalizzata torna al client, che si riallinea
    // (es. credenziali comuni promosse ad account condiviso).
    return jsonResponse({ ok: true, msg: "Configurazione salvata ✅", config });
  }

  if (body.action === "test") {
    const door = body.door && typeof body.door === "object" ? body.door : {};
    return jsonResponse(
      await openDoor({
        name: String(door.name || "Porta").trim() || "Porta",
        server: String(door.server || "").trim(),
        device_id: String(door.device_id || "").trim(),
        auth_key: String(door.auth_key || "").trim(),
      })
    );
  }

  return jsonResponse({ ok: false, msg: "Azione sconosciuta." }, { status: 400 });
}

/* ------------------------------------------------------------------ */
/* Tastierino pubblico                                                 */
/* ------------------------------------------------------------------ */

async function handlePublic({ request, env, url }) {
  const { config } = await loadConfig(env);

  if (request.method === "POST") {
    return handleOpenRequest(request, config);
  }

  const publicConfig = {
    mode: config.mode,
    emergency_contact: config.emergency_contact,
    doors: config.doors.map((door) => ({
      id: door.id,
      name: door.name,
      requiresPin: !!door.pin,
    })),
  };

  return htmlResponse(renderKeypadPage({ config: publicConfig, setupPath: SETUP_PATH }));
}

async function handleOpenRequest(request, config) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ success: false, msg: "Richiesta non valida." }, { status: 400 });
  }

  const door =
    config.doors.find((candidate) => body.doorId && candidate.id === body.doorId) ||
    config.doors[body.doorIndex];

  if (!door) {
    return jsonResponse({ success: false, msg: "Porta non trovata" }, { status: 404 });
  }

  if (door.pin && !safeEqual(String(body.pin || ""), door.pin)) {
    return jsonResponse({ success: false, msg: "PIN errato ❌" });
  }

  return jsonResponse(await openDoor(resolveDoor(config, door)));
}
