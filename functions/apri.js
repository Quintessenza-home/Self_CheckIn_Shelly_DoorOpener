// functions/apri.js
// Endpoint pubblico: https://tuoprogetto.pages.dev/apri?pin=1234

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const pin = url.searchParams.get("pin");

  // Variabili impostate su Cloudflare Pages > Settings > Environment variables
  // VALID_PIN, SHELLY_SERVER, SHELLY_AUTH_KEY, SHELLY_DEVICE_ID
  const VALID_PIN = env.VALID_PIN;
  const SHELLY_SERVER = env.SHELLY_SERVER;       // es: shelly-103-eu.shelly.cloud
  const SHELLY_AUTH_KEY = env.SHELLY_AUTH_KEY;
  const SHELLY_DEVICE_ID = env.SHELLY_DEVICE_ID;

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
        toggle_after: 5
      })
    }
  );

  if (shellyResponse.ok) {
    return htmlResponse("Porta aperta ✅", true);
  } else {
    const errorText = await shellyResponse.text();
    return htmlResponse("Errore: " + errorText, false);
  }
} catch (err) {
  return htmlResponse("Errore: " + err.message, false);
}

