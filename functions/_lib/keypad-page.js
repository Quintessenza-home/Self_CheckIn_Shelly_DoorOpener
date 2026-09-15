// functions/_lib/keypad-page.js
// Pagina pubblica: tastierino di apertura per gli ospiti.

import { BASE_STYLES, jsonForScript } from "./html.js";

const KEYPAD_STYLES = `
  body { display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 1.5rem; }
  .box {
    text-align: center; padding: 2.25rem 2rem; border-radius: 16px; background: var(--card-bg);
    border: 2px solid var(--border-dark); box-shadow: 4px 4px 0px var(--border-dark);
    width: 100%; max-width: 340px;
  }
  .logo { max-width: 110px; height: auto; margin: 0 auto 1.25rem; display: block; }
  h1 { font-size: 1.35rem; font-weight: 800; margin: 0.5rem 0 1.5rem; line-height: 1.3; }
  input {
    font-size: 1.4rem; text-align: center; letter-spacing: 0.3rem; padding: 0.85rem;
    border-color: var(--border-dark); margin-bottom: 1rem; background: #faf8f5;
  }
  button {
    width: 100%; padding: 0.9rem 1rem; font-size: 1rem; color: #fff;
    background: var(--border-dark); margin-bottom: 0.75rem;
  }
  button:disabled { background: #a1a1aa; border-color: #a1a1aa; }
  .btn-choice { background: #fff; color: var(--text-main); box-shadow: 2px 2px 0px var(--border-dark); }
  .btn-choice:active { box-shadow: 0px 0px 0px var(--border-dark); }
  .btn-back { background: transparent; color: var(--text-subtle); border-color: var(--border); }
  #statusMessage { margin-top: 1.25rem; font-weight: 700; font-size: 1rem; min-height: 24px; word-break: break-word; }
  .emergency { margin-top: 1.75rem; border-top: 2px solid var(--border); padding-top: 1.25rem; }
  .emergency a {
    color: var(--brand); text-decoration: none; font-size: 0.85rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.05em;
  }
  .setup-hint { font-size: 0.9rem; color: var(--text-subtle); line-height: 1.5; }
  .setup-hint a { color: var(--brand); font-weight: 700; }
`;

export function renderKeypadPage({ config, setupPath }) {
  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Apertura Smart</title>
  <style>${BASE_STYLES}${KEYPAD_STYLES}</style>
</head>
<body>
  <div class="box">
    <img src="/logo.png" class="logo" alt="" onerror="this.style.display='none'">
    <span class="badge">Controllo Ingressi</span>
    <h1 id="title">Inizializzazione…</h1>
    <div id="actionArea"></div>
    <div id="statusMessage" role="status" aria-live="polite"></div>
    <div id="emergencySection" class="emergency" style="display:none;">
      <a id="emergencyLink" href="#">📞 Assistenza Immediata</a>
    </div>
  </div>

  <script>
    var config = ${jsonForScript(config)};
    var setupPath = ${jsonForScript(setupPath)};
    var currentStep = 0;

    function title(text) { document.getElementById('title').textContent = text; }
    function area() { return document.getElementById('actionArea'); }
    function status(text, color) {
      var node = document.getElementById('statusMessage');
      node.textContent = text;
      node.style.color = color || 'var(--text-subtle)';
    }

    function button(label, className, onClick) {
      var node = document.createElement('button');
      node.textContent = label;
      if (className) node.className = className;
      node.addEventListener('click', onClick);
      return node;
    }

    function init() {
      if (config.emergency_contact) {
        document.getElementById('emergencyLink').href = 'tel:' + config.emergency_contact;
        document.getElementById('emergencySection').style.display = 'block';
      }
      if (!config.doors.length) {
        title('Nessuna porta configurata');
        var hint = document.createElement('p');
        hint.className = 'setup-hint';
        hint.innerHTML = 'Apri la pagina <a href="' + setupPath + '">/setup</a> per configurare i dispositivi.';
        area().appendChild(hint);
        return;
      }
      if (config.mode === 'sequence') loadSequenceStep();
      else loadChoiceMenu();
    }

    function loadChoiceMenu() {
      title('Seleziona ingresso');
      area().innerHTML = '';
      config.doors.forEach(function (door, index) {
        area().appendChild(button(door.name, 'btn-choice', function () {
          if (door.requiresPin) showPinScreen(index, true);
          else apri(index, '');
        }));
      });
    }

    function loadSequenceStep() {
      if (currentStep >= config.doors.length) {
        title('Tutto aperto! Benvenuto');
        area().innerHTML = '';
        return;
      }
      var door = config.doors[currentStep];
      if (door.requiresPin) {
        showPinScreen(currentStep, false);
        return;
      }
      title(door.name);
      area().innerHTML = '';
      var step = currentStep;
      area().appendChild(button('Apri ora', '', function () { apri(step, ''); }));
    }

    function showPinScreen(doorIndex, fallbackToMenu) {
      var door = config.doors[doorIndex];
      title('PIN per ' + door.name);
      area().innerHTML = '';

      var pin = document.createElement('input');
      pin.type = 'password';
      pin.id = 'pinCode';
      pin.setAttribute('inputmode', 'numeric');
      pin.setAttribute('pattern', '[0-9]*');
      pin.maxLength = 10;
      pin.placeholder = '••••';
      pin.autocomplete = 'off';
      area().appendChild(pin);

      var submit = button('Verifica e Apri', '', function () { apri(doorIndex, pin.value); });
      area().appendChild(submit);
      pin.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') submit.click();
      });

      if (fallbackToMenu) {
        area().appendChild(button('Indietro', 'btn-back', function () {
          status('');
          loadChoiceMenu();
        }));
      }
      pin.focus();
    }

    function apri(doorIndex, pin) {
      var door = config.doors[doorIndex];
      status('Apertura in corso…');
      fetch(window.location.pathname, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doorIndex: doorIndex, doorId: door && door.id, pin: pin })
      }).then(function (response) {
        return response.json();
      }).then(function (data) {
        if (data.success) {
          status(data.msg, 'var(--brand-green)');
          if (config.mode === 'sequence') {
            currentStep++;
            setTimeout(function () { status(''); loadSequenceStep(); }, 2000);
          } else {
            setTimeout(function () { status(''); loadChoiceMenu(); }, 3000);
          }
          return;
        }
        status(data.msg, 'var(--danger)');
        var pinField = document.getElementById('pinCode');
        if (pinField) { pinField.value = ''; pinField.focus(); }
      }).catch(function () {
        status('Errore di connessione.', 'var(--danger)');
      });
    }

    init();
  </script>
</body>
</html>`;
}
