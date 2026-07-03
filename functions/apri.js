// 
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const pin = url.searchParams.get("pin");

  const VALID_PIN = env.VALID_PIN;
  const SHELLY_SERVER = env.SHELLY_SERVER;
  const SHELLY_AUTH_KEY = env.SHELLY_AUTH_KEY;
  const SHELLY_DEVICE_ID = env.SHELLY_DEVICE_ID;

  // 
  if (url.searchParams.has("ajax")) {
    if (!pin || pin !== VALID_PIN) {
      return new Response(JSON.stringify({ success: false, msg: "PIN errato ❌" }), {
        headers: { "Content-Type": "application/json" }
      });
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
            toggle_after: 0.5 //This to set time for the switch to go back to off state 
          })
        }
      );

      if (shellyResponse.ok) {
        return new Response(JSON.stringify({ success: true, msg: "Porta aperta ✅" }), {
          headers: { "Content-Type": "application/json" }
        });
      } else {
        return new Response(JSON.stringify({ success: false, msg: "Errore Shelly" }), {
          headers: { "Content-Type": "application/json" }
        });
      }
    } catch (err) {
      return new Response(JSON.stringify({ success: false, msg: "Errore di rete" }), {
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  // 
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
        h1 { color:#27272a; font-size:1.3rem; margin:0; margin-bottom:1.5rem; }
        input { width:100%; box-sizing:border-box; padding:0.75rem; font-size:1.3rem;
               text-align:center; letter-spacing:0.2rem; border:1px solid #d4d4d8;
               border-radius:8px; margin-bottom:0.75rem; outline:none; }
        button { width:100%; padding:0.75rem; font-size:1rem; font-weight:600; color:white;
                 background:#16a34a; border:none; border-radius:8px; cursor:pointer; }
        button:disabled { background:#a1a1aa; }
        #statusMessage { margin-top: 1rem; font-weight: 600; font-size: 1.1rem; }
      </style>
    </head>
    <body>
      <div class="box">
        <h1 id="title">Inserisci PIN</h1>
        
        <input type="tel" id="pinCode" inputmode="numeric" pattern="[0-9]*" maxlength="6" autofocus placeholder="••••">
        <button id="btn" onclick="inviaCodice()">Apri porta</button>
        
        <div id="statusMessage"></div>
      </div>

      <script>
        async function inviaCodice() {
          const pinInput = document.getElementById('pinCode');
          const statusDiv = document.getElementById('statusMessage');
          const btn = document.getElementById('btn');
          const pin = pinInput.value;

          if(!pin) return;

          statusDiv.style.color = "#71717a";
          statusDiv.innerText = "Verifica in corso...";
          btn.disabled = true;

          try {
            // Chiamiamo la stessa pagina in background senza ricaricarla
            const res = await fetch(\`/apri?pin=\${pin}&ajax=1\`);
            const data = await res.json();

            if (data.success) {
              statusDiv.style.color = "#16a34a";
              statusDiv.innerText = data.msg;
              // 
              pinInput.style.display = "none";
              btn.style.display = "none";
              document.getElementById('title').innerText = "Benvenuto!";
            } else {
              statusDiv.style.color = "#dc2626";
              statusDiv.innerText = data.msg;
              pinInput.value = ""; // 
              pinInput.focus();
              btn.disabled = false;
            }
          } catch (err) {
            statusDiv.style.color = "#dc2626";
            statusDiv.innerText = "Errore di connessione.";
            btn.disabled = false;
          }
        }
      </script>
    </body>
    </html>`,
    { headers: { "Content-Type": "text/html;charset=UTF-8" } }
  );
}
