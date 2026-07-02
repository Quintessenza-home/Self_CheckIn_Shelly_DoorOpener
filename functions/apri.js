// functions/apri.js
// Endpoint pubblico: https://tuoprogetto.pages.dev/apri?pin=1234

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const pin = url.searchParams.get("pin");

  // Variabili impostate su Cloudflare Pages > Settings > Environment variables
  // VALID_PIN, SHELLY_SERVER, SHELLY_AUTH_KEY, SHELLY_DEVICE_ID
  const VALID_PIN = env.1407;
  const SHELLY_SERVER = env.https://shelly-209-eu.shelly.cloud;       // es: shelly-103-eu.shelly.cloud
  const SHELLY_AUTH_KEY = env.MzgyZjg4dWlk77F691A7BEE97A7BE12CC22373DB911915505BE797AE19AFED3868514EEB47F7E30CDC7B6FCCFD10;
  const SHELLY_DEVICE_ID = env.78ee4cc4a9d0;

  function htmlResponse(message, ok) {
    const color = ok ? "#16a34a" : "#dc2626";
    return new Response(
      `<!DOCTYPE html>
      <html lang="it">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Apertura porta</title>
        <style>
          body { font-family: -apple-system, sans-serif; display:flex; align-items:center;
                 justify-content:center; height:100vh; margin:0; background:#f4f4f5; }
          .box { text-align:center; padding:2rem 3rem; border-radius:12px; background:white;
                 box-shadow:0 2px 10px rgba(0,0,0,0.08); }
          h1 { color:${color}; font-size:1.4rem; }
        </style>
      </head>
      <body>
        <div class="box"><h1>${message}</h1></div>
      </body>
      </html>`,
      { headers: { "Content-Type": "text/html;charset=UTF-8" }, status: ok ? 200 : 403 }
    );
  }

  if (!pin) {
    return htmlResponse("PIN mancante nel link", false);
  }

  if (pin !== VALID_PIN) {
    return htmlResponse("PIN errato ❌", false);
  }

  try {
    const shellyResponse = await fetch(
      `https://${SHELLY_SERVER}/v2/devices/api/set/switch?auth_key=${SHELLY_AUTH_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: SHELLY_DEVICE_ID,
          channel: 0,
          on: true,
          toggle_after: 2 // la porta si "sblocca" per 2 secondi poi torna off in automatico
        })
      }
    );

    const data = await shellyResponse.json();

    if (data.isok) {
      return htmlResponse("Porta aperta ✅", true);
    } else {
      return htmlResponse("Errore nell'apertura, riprova", false);
    }
  } catch (err) {
    return htmlResponse("Errore di comunicazione con lo Shelly", false);
  }
}
