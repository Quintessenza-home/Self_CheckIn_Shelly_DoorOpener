// functions/apri.js (o rinominalo in index.js se vuoi che sia la home del sito!)
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // Carichiamo la configurazione JSON
  let config;
  try {
    config = JSON.parse(env.CONFIG);
  } catch (e) {
    return new Response("Errore nella configurazione CONFIG su Cloudflare. Verifica il formato JSON.", { status: 500 });
  }

  // --- GESTIONE DELLE RICHIESTE DI APERTURA (POST) ---
  if (request.method === "POST") {
    try {
      const body = await request.json();
      const { doorIndex, pin } = body;

      const door = config.doors[doorIndex];
      if (!door) {
        return new Response(JSON.stringify({ success: false, msg: "Porta non trovata" }), { status: 400 });
      }

      // Se la porta richiede un PIN, lo verifichiamo
      if (door.pin && door.pin !== "" && pin !== door.pin) {
        return new Response(JSON.stringify({ success: false, msg: "PIN errato ❌" }), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // Chiamata allo Shelly specifico di questa porta
      const shellyResponse = await fetch(
        `https://${door.server}/v2/devices/api/set/switch?auth_key=${door.auth_key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: door.device_id,
            channel: 0,
            on: true,
            toggle_after: 5
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

  // --- INTERFACCIA DINAMICA (GET) ---
  
  // Passiamo la configurazione (senza i PIN segreti!) al frontend
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
        .btn-choice { background: #2563eb; } /* Blu per la modalità selezione */
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
        let currentStep = 0; // Usato per la modalità "sequence"

        function init() {
          // Configura contatto d'emergenza
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

        // --- GESTIONE MODALITÀ: SCELTA LIBERA ---
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

        // --- GESTIONE MODALITÀ: SEQUENZA ---
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

        // --- SCHERMATA INSERIMENTO PIN ---
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

        // --- CHIAMATA DI APERTURA ---
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
