// functions/apri.js
// Endpoint pubblico: https://tuoprogetto.pages.dev/apri?pin=1234
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const pin = url.searchParams.get("pin");

  const VALID_PIN = env.VALID_PIN;
  const SHELLY_SERVER = env.SHELLY_SERVER;
  const SHELLY_AUTH_KEY = env.SHELLY_AUTH_KEY;
  const SHELLY_DEVICE_ID = env.SHELLY_DEVICE_ID;

  function htmlResponse(message, ok) {
    const color = ok ? "#16a34a" : "#dc2626";

    // Se è andato tutto bene, mostriamo solo il messaggio di successo.
    // Se c'è stato un errore (PIN sbagliato, mancante, o problema tecnico),
    // mostriamo anche un campo per riprovare subito e un link per tornare alla home.
    const retrySection = ok
      ? ""
      : `
        <form action="/apri" method="GET" style="margin-top:1.5rem;">
          <input
            type="tel"
            name="pin"
            inputmode="numeric"
            pattern="[0-9]*"
            maxlength="6"
            autofocus
            required
            placeholder="Inserisci PIN"
            style="width:100%; box-sizing:border-box; padding:0.75rem; font-size:1.3rem;
                   text-align:center; letter-spacing:0.2rem; border:1px solid #d4d4d8;
                   border-radius:8px; margin-bottom:0.75rem;"
          >
          <button type="submit" style="width:100%; padding:0.75rem; font-size:1rem;
                   font-weight:600; color:white; background:#16a34a; border:none;
                   border-radius:8px; cursor:pointer;">
            Riprova
          </button>
        </form>
        <a href="/" style="display:inline-block; margin-top:1rem; color:#71717a;
                   font-size:0.9rem; text-decoration:none;">
          ← Torna alla home
        </a>
      `;

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
          .box { text-align:center; padding:2rem 2.5rem; border-radius:12px; background:white;
                 box-shadow:0 2px 10px rgba(0,0,0,0.08); width:260px; }
          h1 { color:${color}; font-size:1.3rem; margin:0; }
        </style>
      </head>
      <body>
        <div class="box">
          <h1>${message}</h1>
          ${retrySection}
        </div>
      </body>
      </html>`,
      { headers: { "Content-Type": "text/html;charset=UTF-8" }, status: ok ? 200 : 403 }
    );
  }

  if (!pin) {
    return htmlResponse("Inserisci il PIN per aprire", false);
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
}
