// functions/[[path]].js (o functions/index.js / apri.js)

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const SETUP_PASSWORD = env.SETUP_PASSWORD || "admin";

  // --- 1. GESTIONE ACCESSO PROTETTO AL SETUP (/setup) ---
  if (url.pathname.endsWith("/setup")) {
    const key = url.searchParams.get("key");

    if (!key || key !== SETUP_PASSWORD) {
      return new Response(
        `<!DOCTYPE html>
        <html lang="it">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Accesso Limitato</title>
          <style>
            :root {
              --bg: #fbf9f5;
              --card-bg: #ffffff;
              --border: #e5e0d8;
              --border-dark: #18181b;
              --text-main: #18181b;
              --text-subtle: #71717a;
              --brand: #e05d38;
              --radius: 14px;
            }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display:flex; align-items:center; justify-content:center; min-height:100vh; margin:0; background: var(--bg); color: var(--text-main); padding: 1rem; box-sizing: border-box; }
            .box { text-align:center; padding:2rem 2.5rem; border-radius: var(--radius); background: var(--card-bg); border: 2px solid var(--border-dark); box-shadow: 4px 4px 0px var(--border-dark); width:100%; max-width: 320px; }
            .badge { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--brand); margin-bottom: 0.5rem; display: block; }
            h1 { color: var(--text-main); font-size: 1.4rem; margin:0 0 1.5rem 0; font-weight: 800; }
            input { width:100%; box-sizing:border-box; padding:0.85rem; font-size:1.1rem; text-align:center; border: 2px solid var(--border); border-radius: 8px; margin-bottom: 1rem; outline:none; background: #faf8f5; transition: border-color 0.2s; }
            input:focus { border-color: var(--border-dark); }
            button { width:100%; padding:0.85rem; font-size:1rem; font-weight:700; color:white; background: var(--border-dark); border:none; border-radius:8px; cursor:pointer; transition: transform 0.1s, opacity 0.2s; }
            button:active { transform: scale(0.98); }
            .error-msg { color: #dc2626; font-size: 0.85rem; margin-bottom: 0.75rem; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="box">
            <span class="badge">Sicurezza</span>
            <h1>Area Riservata</h1>
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

    return new Response(
      `<!DOCTYPE html>
      <html lang="it">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Configuratore Smart</title>
        <style>
          :root {
            --bg: #fbf9f5;
            --card-bg: #ffffff;
            --section-bg: #f6f3ed;
            --border: #e5e0d8;
            --border-dark: #18181b;
            --text-main: #18181b;
            --text-subtle: #71717a;
            --brand: #e05d38;
            --brand-green: #15803d;
            --radius: 14px;
          }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: var(--bg); margin:0; padding: 2.5rem 1rem; color: var(--text-main); }
          .container { max-width: 620px; margin: 0 auto; background: var(--card-bg); padding: 2.5rem; border-radius: var(--radius); border: 2px solid var(--border-dark); box-shadow: 4px 4px 0px var(--border-dark); }
          .badge { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--brand); margin-bottom: 0.25rem; display: block; }
          h1 { font-size: 1.6rem; margin: 0; font-weight: 800; }
          .header-bar { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--border); padding-bottom: 1.25rem; margin-bottom: 1.5rem; }
          .section { margin-bottom: 1.5rem; background: var(--section-bg); padding: 1.25rem; border-radius: 10px; border: 2px solid var(--border); }
          .section-title { font-weight: 700; font-size: 1.05rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; }
          label { display: block; font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.35rem; color: var(--text-subtle); }
          input, select { width: 100%; box-sizing: border-box; padding: 0.75rem; border: 2px solid var(--border); border-radius: 8px; margin-bottom: 1rem; font-size: 0.95rem; background: #ffffff; color: var(--text-main); }
          input:focus, select:focus { border-color: var(--border-dark); outline: none; }
          button { padding: 0.75rem 1.2rem; font-weight: 700; border-radius: 8px; cursor: pointer; border: 2px solid var(--border-dark); font-size: 0.95rem; transition: transform 0.1s; }
          button:active { transform: scale(0.98); }
          .btn-primary { background: var(--border-dark); color: white; width: 100%; font-size: 1rem; padding: 0.9rem; margin-top: 1rem; }
          .btn-secondary { background: #ffffff; color: var(--text-main); }
          .btn-danger { background: #ef4444; color: white; border-color: #b91c1c; padding: 0.35rem 0.75rem; font-size: 0.8rem; }
          #outputArea { margin-top: 2rem; display: none; }
          textarea { width: 100%; height: 140px; font-family: monospace; box-sizing: border-box; padding: 0.75rem; border: 2px solid var(--border-dark); border-radius: 8px; background: #18181b; color: #38bdf8; resize: none; font-size: 0.9rem; }
          .copy-success { color: var(--brand-green); font-weight: 700; font-size: 0.9rem; margin-top: 0.5rem; display: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header-bar">
            <div>
              <span class="badge">Pannello Amministrativo</span>
              <h1>Configuratore Smart</h1>
            </div>
            <a href="${url.pathname}" style="color: var(--text-subtle); text-decoration: none; font-size: 0.9rem; font-weight: 700;">Esci 🚪</a>
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

          <button class="btn-secondary" onclick="addDoor()" style="width:100%; margin-bottom:1.5rem;">＋ Aggiungi Porta</button>

          <button class="btn-primary" onclick="generateConfig()">Genera Codice di Configurazione</button>

          <div id="outputArea">
            <label style="color: var(--brand); font-size:0.95rem; margin-bottom:0.5rem;">▼ Copia questo codice e incollalo su Cloudflare</label>
            <textarea id="jsonOutput" readonly></textarea>
            <button class="btn-secondary" onclick="copyToClipboard()" style="width:100%; margin-top:0.75rem;">📋 Copia negli appunti</button>
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
              <label>Nome identificativo</label>
              <input type="text" class="door-name" value="\${name}" placeholder="Es. Portone Esterno" required>

              <label>Server Shelly</label>
              <input type="text" class="door-server" value="\${server}" placeholder="shelly-xxx-eu" required>

              <label>Shelly Device ID</label>
              <input type="text" class="door-id" value="\${deviceId}" placeholder="Es. 78eesdgdfg9d0" required>

              <label>Shelly Auth Key (Token)</label>
              <input type="password" class="door-token" value="\${authKey}" placeholder="Inserisci il token lungo" required>

              <label>PIN di sblocco (Opzionale)</label>
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
            toggle_after: 2
          })
        }
      );

      if (shellyResponse.ok) {
        return new Response(JSON.stringify({ success: true, msg: `${door.name} aperta! ✅` }), {
          headers: { "Content-Type": "application/json" }
        });
      } else {
        return new Response(JSON.stringify({ success: false, msg: "Errore Shelly Cloud" }), {
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
        :root {
          --bg: #fbf9f5;
          --card-bg: #ffffff;
          --border-dark: #18181b;
          --border-soft: #e5e0d8;
          --text-main: #18181b;
          --text-subtle: #71717a;
          --brand: #e05d38;
          --brand-green: #15803d;
          --radius: 16px;
        }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display:flex; align-items:center; justify-content:center; min-height:100vh; margin:0; background: var(--bg); color: var(--text-main); padding:1.5rem; box-sizing:border-box; }
        .box { text-align:center; padding: 2.25rem 2rem; border-radius: var(--radius); background: var(--card-bg); border: 2px solid var(--border-dark); box-shadow: 4px 4px 0px var(--border-dark); width: 100%; max-width: 320px; box-sizing: border-box; }
        .logo { max-width: 110px; height: auto; margin-bottom: 1.25rem; display: block; margin-left: auto; margin-right: auto; }
        .badge { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--brand); margin-bottom: 0.5rem; display: block; }
        h1 { color: var(--text-main); font-size: 1.35rem; font-weight: 800; margin: 0 0 1.5rem 0; line-height: 1.3; }
        input { width: 100%; box-sizing: border-box; padding: 0.85rem; font-size: 1.4rem; text-align: center; letter-spacing: 0.3rem; border: 2px solid var(--border-dark); border-radius: 10px; margin-bottom: 1rem; outline: none; background: #faf8f5; }
        button { width: 100%; padding: 0.9rem 1rem; font-size: 1rem; font-weight: 700; color: white; background: var(--border-dark); border: 2px solid var(--border-dark); border-radius: 10px; cursor: pointer; margin-bottom: 0.75rem; transition: transform 0.1s, background 0.2s; }
        button:active { transform: scale(0.97); }
        button:disabled { background: #a1a1aa; border-color: #a1a1aa; cursor: not-allowed; }
        .btn-choice { background: #ffffff; color: var(--text-main); border: 2px solid var(--border-dark); box-shadow: 2px 2px 0px var(--border-dark); }
        .btn-choice:active { box-shadow: 0px 0px 0px var(--border-dark); }
        #statusMessage { margin-top: 1.25rem; font-weight: 700; font-size: 1rem; min-height: 24px; word-break: break-word; }
        .emergency { margin-top: 1.75rem; border-t: 2px solid var(--border-soft); padding-top: 1.25rem; }
        .emergency a { color: var(--brand); text-decoration: none; font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
      </style>
    </head>
    <body>
      <div class="box">
        <img src="/logo.png" id="logoImg" class="logo" onerror="this.style.display='none'">
        <span class="badge">Controllo Ingressi</span>
        <h1 id="title">Inizializzazione...</h1>
        <div id="actionArea"></div>
        <div id="statusMessage"></div>
        <div id="emergencySection" class="emergency" style="display:none;">
          <a id="emergencyLink" href="#">📞 Assistenza Immediata</a>
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
          document.getElementById('title').innerText = "Seleziona ingresso";
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
          document.getElementById('title').innerText = "PIN per " + door.name;
          const area = document.getElementById('actionArea');
          area.innerHTML = \`
            <input type="password" id="pinCode" inputmode="numeric" pattern="[0-9]*" maxlength="6" autofocus placeholder="••••">
            <button id="btnInvia">Verifica e Apri</button>
          \`;
          if (fallbackToMenu) {
            area.innerHTML += \`<button style="background: transparent; color: var(--text-subtle); border: 2px solid var(--border-soft); margin-top: 0.25rem;" onclick="loadChoiceMenu()">Indietro</button>\`;
          }
          document.getElementById('btnInvia').onclick = () => {
            const pin = document.getElementById('pinCode').value;
            eseguiApertura(doorIndex, pin, fallbackToMenu);
          };
        }

        async function eseguiApertura(doorIndex, pin, fallbackToMenu = false) {
          const statusDiv = document.getElementById('statusMessage');
          statusDiv.style.color = "var(--text-subtle)";
          statusDiv.innerText = "Apertura in corso...";
          try {
            const res = await fetch(window.location.pathname, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ doorIndex, pin })
            });
            const data = await res.json();
            if (data.success) {
              statusDiv.style.color = "var(--brand-green)";
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
