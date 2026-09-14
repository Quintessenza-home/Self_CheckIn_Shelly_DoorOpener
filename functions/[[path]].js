// functions/[[path]].js

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // ---------------------------------------------------------------------------
  // 1. GESTIONE ROUTE: /setup (Interfaccia di configurazione)
  // ---------------------------------------------------------------------------
  if (url.pathname === "/setup") {
    const setupPassword = env.SETUP_PASSWORD || "";

    // Gestione salvataggio / verifica via POST
    if (request.method === "POST") {
      try {
        const body = await request.json();
        if (body.password !== setupPassword) {
          return new Response(JSON.stringify({ error: "Password errata" }), {
            status: 401,
            headers: { "Content-Type": "application/json" }
          });
        }
        return new Response(JSON.stringify({ success: true }), {
          headers: { "Content-Type": "application/json" }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: "Richiesta non valida" }), { status: 400 });
      }
    }

    // Rendering dell'interfaccia HTML di Setup
    const setupHtml = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Setup - Opendoor</title>
  <style>
    :root { --primary: #2563eb; --bg: #f8fafc; --card: #ffffff; --text: #0f172a; }
    body { font-family: system-ui, -apple-system, sans-serif; background: var(--bg); color: var(--text); margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: var(--card); padding: 24px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    h1, h2 { color: var(--text); margin-top: 0; }
    label { display: block; font-weight: 600; margin-top: 14px; margin-bottom: 4px; font-size: 0.9rem; }
    input, select, textarea { width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font-size: 1rem; }
    small { color: #64748b; font-size: 0.8rem; display: block; margin-top: 2px; }
    .door-card { background: #f1f5f9; padding: 16px; border-radius: 8px; margin-top: 16px; position: relative; border: 1px solid #e2e8f0; }
    .btn { background: var(--primary); color: white; border: none; padding: 12px 20px; border-radius: 6px; font-weight: 600; cursor: pointer; width: 100%; margin-top: 20px; font-size: 1rem; }
    .btn-secondary { background: #64748b; margin-top: 10px; }
    .btn-danger { background: #ef4444; width: auto; padding: 6px 12px; font-size: 0.85rem; margin-top: 10px; }
    #auth-sec, #config-sec { display: none; }
    pre { background: #0f172a; color: #38bdf8; padding: 16px; border-radius: 8px; overflow-x: auto; white-space: pre-wrap; word-break: break-all; }
  </style>
</head>
<body>
  <div class="container">
    <h1>⚙️ Setup Opendoor</h1>
    
    <div id="login-sec">
      <label>Inserisci SETUP_PASSWORD</label>
      <input type="password" id="pwd-input" placeholder="Password di amministrazione">
      <button class="btn" onclick="checkAuth()">Accedi</button>
      <p id="login-err" style="color:red; display:none; margin-top:10px;">Password errata.</p>
    </div>

    <div id="config-sec">
      <label>Modalità di Apertura</label>
      <select id="mode-select">
        <option value="sequence">Sequenziale (Guida passo-passo)</option>
        <option value="free">Selezione Libera (Tutti i pulsanti visibili)</option>
      </select>

      <label>Telefono Assistenza (Opzionale)</label>
      <input type="tel" id="contact-input" placeholder="Es. +393331234567">

      <h2>Porte / Cancelli</h2>
      <div id="doors-container"></div>
      
      <button class="btn btn-secondary" onclick="addDoor()">+ Aggiungi Porta</button>
      <button class="btn" onclick="generateConfig()">Genera Codice di Configurazione</button>

      <div id="result-sec" style="display:none; margin-top:20px;">
        <h3>Configurazione Generata</h3>
        <p>Copia questo testo e incollalo nella variabile <strong>CONFIG</strong> su Cloudflare Pages:</p>
        <pre id="json-output"></pre>
        <button class="btn btn-secondary" onclick="copyConfig()">📋 Copia negli appunti</button>
      </div>
    </div>
  </div>

  <script>
    let savedPwd = '';

    async function checkAuth() {
      const pwd = document.getElementById('pwd-input').value;
      const res = await fetch('/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd })
      });
      if (res.ok) {
        savedPwd = pwd;
        document.getElementById('login-sec').style.display = 'none';
        document.getElementById('config-sec').style.display = 'block';
        addDoor(); // Ne aggiunge una vuota di default
      } else {
        document.getElementById('login-err').style.display = 'block';
      }
    }

    function addDoor(data = {}) {
      const container = document.getElementById('doors-container');
      const div = document.createElement('div');
      div.className = 'door-card';
      div.innerHTML = \`
        <label>Nome Porta / Cancello</label>
        <input type="text" class="d-name" value="\${data.name || ''}" placeholder="Es. Portoncino Ingresso">
        
        <label>Server Shelly</label>
        <input type="text" class="d-server" value="\${data.server || ''}" placeholder="Es. shelly-281-eu.shelly.cloud">
        
        <label>Device ID Shelly</label>
        <input type="text" class="d-id" value="\${data.device_id || ''}" placeholder="Es. 34845d62a12c">
        
        <label>Auth Key (Token) Shelly</label>
        <input type="password" class="d-key" value="\${data.auth_key || ''}" placeholder="Chiave API Shelly">
        
        <label>PIN di Sicurezza (Opzionale)</label>
        <input type="text" class="d-pin" value="\${data.pin || ''}" placeholder="Es. 1234 (lascia vuoto se non richiesto)">

        <label>Durata Impulso Apertura (in secondi)</label>
        <input type="number" class="d-duration" value="\${data.duration || 0.5}" step="0.1" min="0.1" max="60" placeholder="Es. 0.5">
        <small>Esempi: 0.5 o 0.3 per portoncini elettrici; 2.0 per cancelli automatici.</small>
        
        <button class="btn btn-danger" onclick="this.parentElement.remove()">Elimina Porta</button>
      \`;
      container.appendChild(div);
    }

    function generateConfig() {
      const names = document.querySelectorAll('.d-name');
      const servers = document.querySelectorAll('.d-server');
      const ids = document.querySelectorAll('.d-id');
      const keys = document.querySelectorAll('.d-key');
      const pins = document.querySelectorAll('.d-pin');
      const durations = document.querySelectorAll('.d-duration');

      const config = {
        mode: document.getElementById('mode-select').value,
        emergency_contact: document.getElementById('contact-input').value.trim(),
        doors: []
      };

      for(let i=0; i<names.length; i++) {
        if(names[i].value.trim()) {
          config.doors.push({
            name: names[i].value.trim(),
            server: servers[i].value.trim(),
            device_id: ids[i].value.trim(),
            auth_key: keys[i].value.trim(),
            pin: pins[i].value.trim(),
            duration: parseFloat(durations[i].value) || 0.5
          });
        }
      }

      const jsonStr = JSON.stringify(config, null, 2);
      document.getElementById('json-output').textContent = jsonStr;
      document.getElementById('result-sec').style.display = 'block';
    }

    function copyConfig() {
      const text = document.getElementById('json-output').textContent;
      navigator.clipboard.writeText(text);
      alert('Configurazione copiata negli appunti!');
    }
  </script>
</body>
</html>`;

    return new Response(setupHtml, {
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  }

  // ---------------------------------------------------------------------------
  // 2. GESTIONE API POST: Esecuzione Comando Apertura Porta
  // ---------------------------------------------------------------------------
  if (request.method === "POST" && url.pathname === "/open") {
    try {
      const body = await request.json();
      const doorIndex = parseInt(body.doorIndex);
      const userPin = body.pin || "";

      const rawConfig = env.CONFIG;
      if (!rawConfig) {
        return new Response(JSON.stringify({ error: "Sistema non configurato (CONFIG mancante)" }), { status: 500 });
      }

      const config = JSON.parse(rawConfig);
      const door = config.doors[doorIndex];

      if (!door) {
        return new Response(JSON.stringify({ error: "Porta non trovata" }), { status: 404 });
      }

      // Check PIN
      if (door.pin && door.pin !== userPin) {
        return new Response(JSON.stringify({ error: "PIN errato" }), { status: 403 });
      }

      // Imposta la durata d'impulso (default 0.5s per portoncini se non definita)
      const durationSeconds = door.duration ? parseFloat(door.duration) : 0.5;

      // Normalizzazione URL Server Shelly
      let serverUrl = door.server.replace(/^https?:\/\//, "").replace(/\/$/, "");

      // Chiamata Server-to-Server alle API Cloud di Shelly
      const shellyResponse = await fetch(`https://${serverUrl}/v2/devices/api/set/switch?auth_key=${door.auth_key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: door.device_id,
          channel: 0,
          on: true,
          toggle_after: durationSeconds
        })
      });

      if (!shellyResponse.ok) {
        return new Response(JSON.stringify({ error: "Errore di comunicazione con lo Shelly" }), { status: 502 });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" }
      });

    } catch (e) {
      return new Response(JSON.stringify({ error: "Errore interno server" }), { status: 500 });
    }
  }

  // ---------------------------------------------------------------------------
  // 3. RENDERING HOME PAGE (Tastierino di Apertura)
  // ---------------------------------------------------------------------------
  const rawConfig = env.CONFIG || '{"mode":"free","doors":[],"emergency_contact":""}';
  let configData = {};
  try { configData = JSON.parse(rawConfig); } catch(e){}

  const mainHtml = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Apertura Porte</title>
  <style>
    :root { --primary: #10b981; --bg: #0f172a; --card: #1e293b; --text: #f8fafc; }
    body { font-family: system-ui, -apple-system, sans-serif; background: var(--bg); color: var(--text); margin: 0; padding: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; box-sizing: border-box; }
    .container { max-width: 400px; width: 100%; background: var(--card); padding: 24px; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); text-align: center; }
    .logo { max-width: 120px; margin-bottom: 20px; }
    h1 { font-size: 1.5rem; margin-bottom: 20px; color: #ffffff; }
    .btn-door { background: #2563eb; color: white; border: none; padding: 16px; border-radius: 10px; font-size: 1.1rem; font-weight: 600; cursor: pointer; width: 100%; margin-bottom: 12px; transition: background 0.2s, transform 0.1s; }
    .btn-door:active { transform: scale(0.98); }
    .btn-door.success { background: #10b981; }
    .btn-door.error { background: #ef4444; }
    .pin-input { width: 100%; padding: 12px; margin-bottom: 12px; border-radius: 8px; border: 1px solid #475569; background: #0f172a; color: white; text-align: center; font-size: 1.2rem; box-sizing: border-box; }
    .emergency { margin-top: 20px; display: inline-block; color: #94a3b8; text-decoration: none; font-size: 0.9rem; }
    .status { margin-top: 10px; font-size: 0.9rem; min-height: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <img src="/logo.png" alt="Logo" class="logo" onerror="this.style.display='none'">
    <h1>Apertura Ingressi</h1>

    <div id="doors-list"></div>
    <div id="status" class="status"></div>

    ${configData.emergency_contact ? `<a href="tel:${configData.emergency_contact}" class="emergency">📞 Chiama Assistenza</a>` : ''}
  </div>

  <script>
    const config = ${JSON.stringify(configData)};

    function renderUI() {
      const list = document.getElementById('doors-list');
      list.innerHTML = '';

      if (!config.doors || config.doors.length === 0) {
        list.innerHTML = '<p style="color:#94a3b8;">Nessun ingresso configurato. Vai su /setup per iniziare.</p>';
        return;
      }

      config.doors.forEach((door, idx) => {
        const div = document.createElement('div');
        div.style.marginBottom = "16px";
        
        let pinHtml = '';
        if (door.pin) {
          pinHtml = \`<input type="password" id="pin-\${idx}" class="pin-input" placeholder="Inserisci PIN" maxlength="10">\`;
        }

        div.innerHTML = \`
          \${pinHtml}
          <button class="btn-door" id="btn-\${idx}" onclick="openDoor(\${idx})">Apri \${door.name}</button>
        \`;
        list.appendChild(div);
      });
    }

    async function openDoor(idx) {
      const btn = document.getElementById(\`btn-\${idx}\`);
      const status = document.getElementById('status');
      const pinInput = document.getElementById(\`pin-\${idx}\`);
      const pin = pinInput ? pinInput.value : '';

      const originalText = btn.textContent;
      btn.textContent = "Invio comando...";
      btn.disabled = true;
      status.textContent = "";

      try {
        const res = await fetch('/open', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ doorIndex: idx, pin: pin })
        });

        const data = await res.json();

        if (res.ok && data.success) {
          btn.textContent = "Aperto! ✓";
          btn.classList.add('success');
          if(pinInput) pinInput.value = '';
        } else {
          btn.textContent = "Errore!";
          btn.classList.add('error');
          status.style.color = "#ef4444";
          status.textContent = data.error || "Impossibile aprire";
        }
      } catch (e) {
        btn.textContent = "Errore!";
        btn.classList.add('error');
        status.style.color = "#ef4444";
        status.textContent = "Errore di connessione";
      }

      setTimeout(() => {
        btn.textContent = originalText;
        btn.classList.remove('success', 'error');
        btn.disabled = false;
        status.textContent = "";
      }, 3000);
    }

    renderUI();
  </script>
</body>
</html>`;

  return new Response(mainHtml, {
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}
