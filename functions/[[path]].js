// functions/apri.js o  functions/index.js
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const SETUP_PASSWORD = env.SETUP_PASSWORD || "admin"; // Se non configurata, la password di default è "admin"

  // --- 1. GESTIONE ACCESSO PROTETTO AL SETUP (/setup) ---
  if (url.pathname.endsWith("/setup")) {
    const key = url.searchParams.get("key");
 
    // Se la chiave è assente o errata, mostra la schermata di Login
    if (!key || key !== SETUP_PASSWORD) {
      return new Response(
        `<!DOCTYPE html>
        <html lang="it">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Accesso Limitato</title>
          <style>
            body { font-family: -apple-system, sans-serif; display:flex; align-items:center;
                   justify-content:center; height:100vh; margin:0; background:#f4f4f5; }
            .box { text-align:center; padding:2rem 2.5rem; border-radius:12px; background:white;
                   box-shadow:0 2px 10px rgba(0,0,0,0.08); width:260px; }
            h1 { color:#27272a; font-size:1.3rem; margin:0; margin-bottom:1.5rem; }
            input { width:100%; box-sizing:border-box; padding:0.75rem; font-size:1.1rem;
                   text-align:center; border:1px solid #d4d4d8; border-radius:8px; margin-bottom:0.75rem; outline:none; }
            button { width:100%; padding:0.75rem; font-size:1rem; font-weight:600; color:white;
                     background:#2563eb; border:none; border-radius:8px; cursor:pointer; }
            .error-msg { color: #dc2626; font-size: 0.9rem; margin-bottom: 0.75rem; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="box">
            <h1>🛠️ Area Riservata</h1>
            ${key ? `<div class="error-msg">Password errata! ❌</div>` : ""}
            <form action="${url.pathname}" method="GET">
              <input type="password" name="key" autofocus placeholder="Inserisci Password" required>
              <button type="submit">Accedi al Setup</button>
            </form>
          </div>
        </body>
        </html>`,
        { headers: { "Content-Type": "text/html;charset=UTF-8" } }
      );
    }

    // Se la password è corretta, mostra il configuratore (passando la chiave anche nell'action del form interno per non perderla)
    return new Response(
      `<!DOCTYPE html>
      <html lang="it">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Configuratore Smart</title>
        <style>
          body { font-family: -apple-system, sans-serif; background:#f4f4f5; margin:0; padding:2rem 1rem; color:#27272a; }
          .container { max-width: 600px; margin: 0 auto; background:white; padding:2rem; border-radius:12px; box-shadow:0 4px 15px rgba(0,0,0,0.05); }
          h1 { font-size: 1.5rem; margin-top:0; border-bottom: 2px solid #f4f4f5; padding-bottom: 1rem; }
          .section { margin-bottom: 1.5rem; background:#fafafa; padding:1rem; border-radius:8px; border:1px solid #e4e4e7; }
          .section-title { font-weight:600; font-size:1.1rem; margin-bottom:1rem; display:flex; justify-content:space-between; align-items:center; }
          label { display:block; font-size:0.9rem; font-weight:600; margin-bottom:0.25rem; color:#52525b; }
          input, select { width:100%; box-sizing:border-box; padding:0.6rem; border:1px solid #d4d4d8; border-radius:6px; margin-bottom:0.75rem; font-size:0.95rem; }
          button { padding:0.6rem 1rem; font-weight:600; border-radius:6px; cursor:pointer; border:none; font-size:0.9rem; }
          .btn-primary { background:#16a34a; color:white; width:100%; font-size:1rem; padding:0.8rem; }
          .btn-secondary { background:#e4e4e7; color:#27272a; }
          .btn-danger { background:#dc2626; color:white; padding:0.4rem 0.8rem; font-size:0.8rem; }
          #outputArea { margin-top: 1.5rem; display:none; }
          textarea { width:100%; height:120px; font-family:monospace; box-sizing:border-box; padding:0.5rem; border:1px solid #a1a1aa; border-radius:6px; background:#f8fafc; resize:none; }
          .copy-success { color:#16a34a; font-weight:600; font-size:0.9rem; margin-top:0.5rem; display:none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f4f4f5; padding-bottom: 1rem; margin-bottom: 1rem;">
            <h1 style="margin:0; border:none; padding:0;">🛠️ Configuratore Tastierino</h1>
            <a href="${url.pathname}" style="color: #71717a; text-decoration: none; font-size: 0.9rem; font-weight: 600;">Esci 🚪</a>
          </div>
          
          <div class="section">
            <div class="section-title">Impostazioni Generali</div>
            <label>Modalità di Apertura</label>
            <select id="mode">
              <option value="sequence">Sequenziale (Porta 1 -> Porta 2)</option>
              <option value="choice">Selezione Libera (Scegli quale aprire)</option>
            </select>
            
            <label>Telefono Assistenza (Opzionale)</label>
            <input type="text" id="emergency" placeholder="Es. +393331234567">
          </div>

          <div id="doorsContainer"></div>
          
          <button class="btn-secondary" onclick="addDoor()" style="margin-bottom:1.5rem;">＋ Aggiungi Porta</button>
          
          <button class="btn-primary" onclick="generateConfig()">Genera Codice di Configurazione</button>

          <div id="outputArea">
            <label style="color:#16a34a; font-size:1rem;">▼ Copia questo codice e incollalo su Cloudflare</label>
            <textarea id="jsonOutput" readonly></textarea>
            <button class="btn-secondary" onclick="copyToClipboard()" style="width:100%; margin-top:0.5rem;">📋 Copia negli appunti</button>
            <div id="copyMsg" class="copy-success">✓ Codice copiato! Incollalo nella variabile "CONFIG" su Cloudflare.</div>
          </div>
        </div>

        <script>
          let doorCount = 0;

          function addDoor(name = "", server = "shelly-281-eu", deviceId = "", authKey = "", pin = "") {
            doorCount++;
            const container = document.getElementById('doorsContainer');
            const div = document.createElement('div');
            div.className = 'section';
            div.id = 'door_' + doorCount;
            div.innerHTML = \`
              <div class="section-title">
                <span>Porta #\${doorCount}</span>
                \${doorCount > 1 ? \`<button class="btn-danger" onclick="removeDoor(\${doorCount})">Rimuovi</button>\` : ''}
              </div>
              <label>Nome identificativo (es. Portone Esterno)</label>
              <input type="text" class="door-name" value="\${name}" placeholder="Es. Cancello Principale" required>
              
              <label>Server Shelly (es. shelly-281-eu)</label>
              <input type="text" class="door-server" value="\${server}" placeholder="shelly-xxx-eu" required>
              
              <label>Shelly Device ID</label>
              <input type="text" class="door-id" value="\${deviceId}" placeholder="Es. 78eesdgdfg9d0" required>
              
              <label>Shelly Auth Key (Token)</label>
              <input type="password" class="door-token" value="\${authKey}" placeholder="Inserisci il token lungo" required>
              
              <label>PIN di sblocco (Lascia VUOTO se non vuoi password)</label>
              <input type="text" class="door-pin" value="\${pin}" placeholder="Es. 1234 (opzionale)">
            \`;
            container.appendChild(div);
          }

          function removeDoor(id) {
            document.getElementById('door_' + id).remove();
          }

          function generateConfig() {
            const config = {
              mode: document.getElementById('mode').value,
              emergency_contact: document.getElementById('emergency').value,
              doors: []
            };

            const names = document.querySelectorAll('.door-name');
            const servers = document.querySelectorAll('.door-server');
            const ids = document.querySelectorAll('.door-id');
            const tokens = document.querySelectorAll('.door-token');
            const pins = document.querySelectorAll('.door-pin');

            for (let i = 0; i < names.length; i++) {
              config.doors.push({
                name: names[i].value,
                server: servers[i].value,
                device_id: ids[i].value,
                auth_key: tokens[i].value,
                pin: pins[i].value
              });
            }

            document.getElementById('jsonOutput').value = JSON.stringify(config, null, 2);
            document.getElementById('outputArea').style.display = 'block';
            document.getElementById('jsonOutput').scrollIntoView({ behavior: 'smooth' });
          }

          function copyToClipboard() {
            const textarea = document.getElementById('jsonOutput');
            textarea.select();
            document.execCommand('copy');
            const msg = document.getElementById('copyMsg');
            msg.style.display = 'block';
            setTimeout(() => { msg.style.display = 'none'; }, 4000);
          }

          // Avvia con una porta di default
          addDoor();
        </script>
      </body>
      </html>`,
      { headers: { "Content-Type": "text/html;charset=UTF-8" } }
    );
  }

  // --- 2. LOGICA OPERATIVA DEL SITO (Tastierino e Apertura) ---
  let config;
  try {
    config = JSON.parse(env.CONFIG);
  } catch (e) {
    return new Response("Nessuna configurazione trovata. Vai su /setup per generarne una e inseriscila nelle variabili di Cloudflare.", { status: 200 });
  }

  if (request.method === "POST") {
    try {
      const body = await request.json();
      const { doorIndex, pin } = body;

      const door = config.doors[doorIndex];
      if (!door) {
        return new Response(JSON.stringify({ success: false, msg: "Porta non trovata" }), { status: 400 });
      }

      if (door.pin && door.pin !== "" && pin !== door.pin) {
        return new Response(JSON.stringify({ success: false, msg: "PIN errato ❌" }), {
          headers: { "Content-Type": "application/json" }
        });
      }

      const shellyResponse = await fetch(
        `https://${door.server}/v2/devices/api/set/switch?auth_key=${door.auth_key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: door.device_id,
            channel: 0,
            on: true,
            toggle_after: 0.5
          })
        }
      );

      if (shellyResponse.ok) {
        return new Response(JSON.stringify({ success: true, msg: `${door.name} aperta! ✅` }), {
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

  const safeConfig = {
    mode: config.mode || "sequence",
    emergency_contact: config.emergency_contact || "",
    doors: config.doors.map(d => ({ name: d.name, requiresPin: !!d.pin }))
  };

  return new Response(
    `<!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Apertura Smart</title>
      <style>
        body { font-family: -apple-system, sans-serif; display:flex; align-items:center;
               justify-content:center; min-height:100vh; margin:0; background:#f4f4f5; padding:1rem; box-sizing:border-box; }
        .box { text-align:center; padding:2rem 2.5rem; border-radius:12px; background:white;
               box-shadow:0 2px 10px rgba(0,0,0,0.08); width:280px; }
        .logo { max-width: 120px; height: auto; margin-bottom: 1.5rem; display: block; margin-left: auto; margin-right: auto; }
        h1 { color:#27272a; font-size:1.2rem; margin:0; margin-bottom:1.5rem; }
        input { width:100%; box-sizing:border-box; padding:0.75rem; font-size:1.3rem;
               text-align:center; letter-spacing:0.2rem; border:1px solid #d4d4d8;
               border-radius:8px; margin-bottom:0.75rem; outline:none; }
        button { width:100%; padding:0.75rem; font-size:1rem; font-weight:600; color:white;
                 background:#16a34a; border:none; border-radius:8px; cursor:pointer; margin-bottom:0.5rem; }
        button:disabled { background:#a1a1aa; }
        .btn-choice { background: #2563eb; }
        #statusMessage { margin-top: 1rem; font-weight: 600; font-size: 1.1rem; min-height: 24px; }
        .emergency { margin-top: 2rem; border-top: 1px solid #e4e4e7; padding-top: 1rem; }
        .emergency a { color: #dc2626; text-decoration: none; font-size: 0.9rem; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="box">
        <img src="/logo.png" id="logoImg" class="logo" onerror="this.style.display='none'">
        <h1 id="title">Inizializzazione...</h1>
        <div id="actionArea"></div>
        <div id="statusMessage"></div>
        <div id="emergencySection" class="emergency" style="display:none;">
          <a id="emergencyLink" href="#">📞 Serve aiuto? Chiama l'assistenza</a>
        </div>
      </div>

      <script>
        const config = ${JSON.stringify(safeConfig)};
        let currentStep = 0;

        function init() {
          if (config.emergency_contact) {
            const section = document.getElementById('emergencySection');
            const link = document.getElementById('emergencyLink');
            link.href = 'tel:' + config.emergency_contact;
            section.style.display = 'block';
          }
          if (config.mode === "sequence") {
            loadSequenceStep();
          } else {
            loadChoiceMenu();
          }
        }

        function loadChoiceMenu() {
          document.getElementById('title').innerText = "Seleziona cosa aprire";
          const area = document.getElementById('actionArea');
          area.innerHTML = "";
          config.doors.forEach((door, index) => {
            const btn = document.createElement('button');
            btn.className = "btn-choice";
            btn.innerText = door.name;
            btn.onclick = () => {
              if (door.requiresPin) {
                showPinScreen(index, true);
              } else {
                eseguiApertura(index, "");
              }
            };
            area.appendChild(btn);
          });
        }

        function loadSequenceStep() {
          if (currentStep >= config.doors.length) {
            document.getElementById('title').innerText = "Tutto aperto! Benvenuto";
            document.getElementById('actionArea').innerHTML = "";
            return;
          }
          const door = config.doors[currentStep];
          if (door.requiresPin) {
            showPinScreen(currentStep, false);
          } else {
            document.getElementById('title').innerText = door.name;
            const area = document.getElementById('actionArea');
            area.innerHTML = \`<button onclick="eseguiApertura(\${currentStep}, '')">Apri ora</button>\`;
          }
        }

        function showPinScreen(doorIndex, fallbackToMenu) {
          const door = config.doors[doorIndex];
          document.getElementById('title').innerText = "Inserisci PIN per " + door.name;
          const area = document.getElementById('actionArea');
          area.innerHTML = \`
            <input type="password" id="pinCode" inputmode="numeric" pattern="[0-9]*" maxlength="6" autofocus placeholder="••••">
            <button id="btnInvia">Verifica e Apri</button>
          \`;
          if (fallbackToMenu) {
            area.innerHTML += \`<button style="background:#71717a; margin-top:0.5rem;" onclick="loadChoiceMenu()">Indietro</button>\`;
          }
          document.getElementById('btnInvia').onclick = () => {
            const pin = document.getElementById('pinCode').value;
            eseguiApertura(doorIndex, pin, fallbackToMenu);
          };
        }

        async function eseguiApertura(doorIndex, pin, fallbackToMenu = false) {
          const statusDiv = document.getElementById('statusMessage');
          statusDiv.style.color = "#71717a";
          statusDiv.innerText = "Apertura in corso...";
          try {
            const res = await fetch(window.location.pathname, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ doorIndex, pin })
            });
            const data = await res.json();
            if (data.success) {
              statusDiv.style.color = "#16a34a";
              statusDiv.innerText = data.msg;
              if (config.mode === "sequence") {
                currentStep++;
                setTimeout(() => {
                  statusDiv.innerText = "";
                  loadSequenceStep();
                }, 2000);
              } else {
                setTimeout(() => {
                  statusDiv.innerText = "";
                  loadChoiceMenu();
                }, 3000);
              }
            } else {
              statusDiv.style.color = "#dc2626";
              statusDiv.innerText = data.msg;
              if (document.getElementById('pinCode')) {
                document.getElementById('pinCode').value = "";
                document.getElementById('pinCode').focus();
              }
            }
          } catch (err) {
            statusDiv.style.color = "#dc2626";
            statusDiv.innerText = "Errore di connessione.";
          }
        }

        window.onload = init;
      </script>
    </body>
    </html>`,
    { headers: { "Content-Type": "text/html;charset=UTF-8" } }
  );
}
