// functions/_lib/keypad-page.js
// Pagina pubblica: codice di accesso, istruzioni e tastierino di apertura.

import { BASE_STYLES, jsonForScript } from "./html.js";

const KEYPAD_STYLES = `
  body {
    display: flex; align-items: center; justify-content: center;
    min-height: 100vh; min-height: 100dvh; padding: 2rem 1rem;
    background: linear-gradient(145deg, #f8f4ec 0%, #fbfaf7 48%, #eef4ef 100%);
    font-size: 18px;
  }
  .box {
    text-align: center; padding: 3rem 2.25rem 2.5rem; border-radius: 24px;
    background: rgba(255, 255, 255, 0.98); border: 2px solid #2d2b27;
    box-shadow: 0 18px 50px rgba(42, 37, 29, 0.14), 5px 5px 0 #2d2b27;
    width: 100%; max-width: 430px; position: relative; overflow: hidden;
  }
  .box::before {
    content: ""; position: absolute; inset: 0 0 auto; height: 6px;
    background: linear-gradient(90deg, #b79355, #d4bd8a 52%, #2f6b4f);
  }
  .lang-switch {
    position: absolute; top: 1rem; right: 1rem; margin: 0; z-index: 30;
  }
  .lang-switch button {
    min-height: 44px; font-size: 0.92rem; font-weight: 800;
    background: #fff; color: #34322e; border: 2px solid #d8d2c7;
    cursor: pointer; touch-action: manipulation;
  }
  .lang-toggle {
    min-width: 106px; padding: 0.45rem 0.7rem; border-radius: 999px;
    display: flex; align-items: center; justify-content: space-between; gap: 0.45rem;
  }
  .lang-toggle .chevron { font-size: 0.72rem; color: #66615a; }
  .lang-menu {
    display: none; position: absolute; top: calc(100% + 0.5rem); right: 0;
    width: 220px; padding: 0.45rem; background: #fff;
    border: 2px solid #2d2b27; border-radius: 14px;
    box-shadow: 0 12px 30px rgba(42, 37, 29, 0.2);
  }
  .lang-switch.open .lang-menu { display: block; }
  .lang-menu button {
    width: 100%; min-height: 48px; padding: 0.65rem 0.8rem; border: 0;
    border-radius: 9px; display: flex; align-items: center; gap: 0.7rem;
    text-align: left; letter-spacing: 0;
  }
  .lang-menu button:hover, .lang-menu button:focus-visible { background: #f4f1ea; }
  .lang-menu button[aria-current="true"] { background: #2d2b27; color: #fff; }
  .logo { max-width: 165px; height: auto; margin: 0 auto 1.15rem; display: block; }
  .box .badge {
    font-size: 0.78rem; line-height: 1.4; letter-spacing: 0.14em;
    color: #966232; margin-bottom: 0.3rem;
  }
  h1 {
    font-size: 1.65rem; font-weight: 800; margin: 0.35rem 0 1.5rem;
    line-height: 1.25; letter-spacing: -0.02em;
  }
  .instructions {
    text-align: left; background: #f8f5ee; border: 2px solid #ded7ca;
    border-left: 6px solid #b79355; border-radius: 14px;
    padding: 1.05rem 1.1rem; margin-bottom: 1.3rem;
  }
  .instructions .heading {
    font-size: 0.82rem; font-weight: 800; text-transform: uppercase;
    letter-spacing: 0.09em; color: #7b522d; margin-bottom: 0.45rem;
  }
  .instructions p {
    margin: 0; font-size: 1.05rem; line-height: 1.65; white-space: pre-wrap;
    color: #292824;
  }
  input {
    min-height: 64px; font-size: 1.5rem; text-align: center; letter-spacing: 0.3rem;
    padding: 0.9rem; border: 2px solid #2d2b27; border-radius: 12px;
    margin-bottom: 1rem; background: #fbfaf7;
  }
  button.action {
    width: 100%; min-height: 62px; padding: 0.95rem 1rem;
    font-size: 1.1rem; line-height: 1.25; font-weight: 800; color: #fff;
    background: #2d2b27; border: 2px solid #2d2b27; border-radius: 14px;
    margin-bottom: 0.8rem; cursor: pointer; touch-action: manipulation;
  }
  button:focus-visible, input:focus-visible, a:focus-visible {
    outline: 4px solid rgba(47, 107, 79, 0.3); outline-offset: 3px;
  }
  button.action:active { transform: scale(0.98); }
  button.action:disabled {
    background: #a1a1aa; border-color: #a1a1aa; box-shadow: none; cursor: not-allowed;
  }
  button.action.btn-open {
    background: #2f6b4f; border-color: #24543e; color: #fff;
    box-shadow: 0 4px 0 #1d422f; font-size: 1.15rem;
  }
  button.action.btn-open:hover { background: #285f46; }
  button.action.btn-open:active { box-shadow: 0 1px 0 #1d422f; transform: translateY(3px); }
  button.action.btn-choice {
    background: #fff; color: #262521; border-color: #45423c;
    box-shadow: 0 3px 0 #45423c;
  }
  button.action.btn-choice:hover { background: #f7f4ed; border-color: #2f6b4f; }
  button.action.btn-choice:active { box-shadow: 0 1px 0 #45423c; transform: translateY(2px); }
  button.action.btn-back {
    background: #f4f2ed; color: #3f3d38; border-color: #cbc5ba; box-shadow: none;
  }
  button.action.btn-back:hover { background: #ebe8e1; }
  .hint {
    font-size: 1.05rem; color: #57544e; line-height: 1.65; margin: 0 0 1.2rem;
  }
  #statusMessage {
    margin-top: 1.25rem; font-weight: 800; font-size: 1.05rem;
    line-height: 1.5; min-height: 26px; word-break: break-word;
  }
  .emergency {
    position: fixed; left: 50%; bottom: max(0.75rem, env(safe-area-inset-bottom));
    transform: translateX(-50%); z-index: 20; width: max-content;
    max-width: calc(100% - 2rem); margin: 0; padding: 0;
  }
  .emergency a {
    display: flex; align-items: center; justify-content: center; min-height: 48px;
    padding: 0 0.4rem; color: #923b2b; text-decoration: none;
    font-size: 1rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.035em;
  }
  .setup-hint a { color: #2f6b4f; font-weight: 800; }

  @media (max-width: 480px) {
    body { align-items: flex-start; padding: 0; background: #fff; }
    .box {
      max-width: none; min-height: 100vh; min-height: 100dvh;
      padding: 4.75rem 1.25rem 2rem; border: 0; border-radius: 0;
      box-shadow: none; overflow: visible;
    }
    .box::before { height: 5px; }
    .lang-switch { top: 1rem; right: 1rem; }
    .logo { max-width: 155px; margin-bottom: 1.1rem; }
    h1 { font-size: 1.55rem; margin-bottom: 1.35rem; }
    .instructions { padding: 1rem; margin-bottom: 1.15rem; }
    button.action { min-height: 64px; }
    .emergency {
      top: 0.75rem; left: 0.75rem; bottom: auto; transform: none;
      width: auto; max-width: calc(100% - 8.25rem);
    }
    .emergency a {
      justify-content: flex-start; min-height: 40px; padding: 0;
      font-size: 0.9rem; letter-spacing: 0.02em; white-space: nowrap;
    }
  }

  @media (max-width: 360px) {
    .box { padding-left: 1rem; padding-right: 1rem; }
    .lang-toggle { min-width: 96px; padding-inline: 0.6rem; }
    .emergency a { font-size: 0.86rem; }
    .logo { max-width: 145px; }
    h1 { font-size: 1.48rem; }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { scroll-behavior: auto !important; transition: none !important; }
  }
`

export function renderKeypadPage({ data }) {
  return `<!DOCTYPE html>
<html lang="${data.lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>Apertura Smart</title>
  <style>${BASE_STYLES}${KEYPAD_STYLES}</style>
</head>
<body>
  <div class="box">
    <div class="lang-switch" id="langSwitch"></div>
    <img src="/logo.png" class="logo" alt="Quintessenza" onerror="this.style.display='none'">
    <span class="badge" id="badge"></span>
    <h1 id="title"></h1>
    <div id="actionArea"></div>
    <div id="statusMessage" role="status" aria-live="polite"></div>
    <div id="emergencySection" class="emergency" style="display:none;">
      <a id="emergencyLink" href="#"></a>
    </div>
  </div>

  <script>
    var data = ${jsonForScript(data)};
    var lang = data.lang;
    var unlocked = !data.locked;
    var content = data.content;
    var selected = null;
    var currentStep = 0;

    try {
      var saved = window.localStorage.getItem('sc_lang');
      if (saved && data.languages.indexOf(saved) !== -1) lang = saved;
    } catch (error) { /* localStorage non disponibile: si usa la lingua del server */ }

    function T(key, params) {
      var table = data.ui[lang] || data.ui[data.languages[0]];
      var text = table[key] != null ? table[key] : key;
      if (params) {
        Object.keys(params).forEach(function (name) {
          text = text.split('{' + name + '}').join(String(params[name]));
        });
      }
      return text;
    }

    function text(field) {
      if (!field) return '';
      if (typeof field === 'string') return field;
      var order = [lang].concat(data.languages);
      for (var i = 0; i < order.length; i++) {
        if (field[order[i]] && field[order[i]].trim()) return field[order[i]].trim();
      }
      return '';
    }

    function h(tag, className, textContent) {
      var node = document.createElement(tag);
      if (className) node.className = className;
      if (textContent != null) node.textContent = textContent;
      return node;
    }

    function area() { return document.getElementById('actionArea'); }
    function title(value) { document.getElementById('title').textContent = value; }
    function status(value, color) {
      var node = document.getElementById('statusMessage');
      node.textContent = value || '';
      node.style.color = color || 'var(--text-subtle)';
    }

    function actionButton(label, extraClass, onClick) {
      var node = h('button', 'action' + (extraClass ? ' ' + extraClass : ''), label);
      node.type = 'button';
      node.addEventListener('click', onClick);
      return node;
    }

    function pinField(placeholder) {
      var node = document.createElement('input');
      node.type = 'password';
      node.id = 'pinCode';
      node.setAttribute('inputmode', 'numeric');
      node.setAttribute('pattern', '[0-9]*');
      node.setAttribute('autocomplete', 'off');
      node.maxLength = 12;
      node.placeholder = placeholder;
      return node;
    }

    function instructionsBlock(value) {
      if (!value) return null;
      var wrap = h('div', 'instructions');
      wrap.appendChild(h('div', 'heading', T('instructions_title')));
      wrap.appendChild(h('p', null, value));
      return wrap;
    }

    /* ---------------- richieste al server ---------------- */

    function post(payload) {
      payload.lang = lang;
      return fetch(window.location.pathname, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (response) { return response.json(); });
    }

    /* ---------------- schermate ---------------- */

    function renderLangSwitch() {
      var container = document.getElementById('langSwitch');
      container.innerHTML = '';
      if (data.languages.length < 2) return;

      var toggle = h('button', 'lang-toggle');
      toggle.type = 'button';
      toggle.setAttribute('aria-haspopup', 'listbox');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', T('language_selector'));
      toggle.appendChild(h('span', null, (data.languageFlags[lang] || '🌐') + ' ' + (data.languageLabels[lang] || lang)));
      toggle.appendChild(h('span', 'chevron', '▼'));

      var menu = h('div', 'lang-menu');
      menu.setAttribute('role', 'listbox');
      menu.setAttribute('aria-label', T('languages_available'));
      menu.hidden = true;

      data.languages.forEach(function (code) {
        var option = h('button', null, (data.languageFlags[code] || '🌐') + ' ' + (data.languageLabels[code] || code));
        option.type = 'button';
        option.setAttribute('role', 'option');
        option.setAttribute('aria-current', code === lang ? 'true' : 'false');
        option.addEventListener('click', function () {
          if (code !== lang) {
            lang = code;
            try { window.localStorage.setItem('sc_lang', code); } catch (error) { /* ignora */ }
            status('');
            render();
          }
        });
        menu.appendChild(option);
      });

      toggle.addEventListener('click', function (event) {
        event.stopPropagation();
        var open = container.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        menu.hidden = !open;
      });
      menu.addEventListener('click', function (event) { event.stopPropagation(); });
      container.addEventListener('keydown', function (event) {
        if (event.key !== 'Escape') return;
        container.classList.remove('open');
        menu.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      });
      container.appendChild(toggle);
      container.appendChild(menu);
    }

    document.addEventListener('click', function () {
      var container = document.getElementById('langSwitch');
      if (!container || !container.classList.contains('open')) return;
      container.classList.remove('open');
      var toggle = container.querySelector('.lang-toggle');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
      var menu = container.querySelector('.lang-menu');
      if (menu) menu.hidden = true;
    });

    function renderLocked() {
      title(T('locked_title'));
      area().appendChild(h('p', 'hint', T('locked_hint')));
      var input = pinField(T('pin_placeholder'));
      area().appendChild(input);
      var submit = actionButton(T('locked_button'), null, function () {
        if (!input.value) return;
        submit.disabled = true;
        status(T('opening'));
        post({ action: 'unlock', pin: input.value }).then(function (result) {
          if (result.success) {
            unlocked = true;
            content = result.content;
            status('');
            render();
            return;
          }
          status(result.msg, 'var(--danger)');
          input.value = '';
          input.focus();
        }).catch(function () {
          status(T('connection_error'), 'var(--danger)');
        }).then(function () { submit.disabled = false; });
      });
      area().appendChild(submit);
      input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') submit.click();
      });
      input.focus();
    }

    function renderNoDoors() {
      title(T('no_doors_title'));
      var parts = T('no_doors_hint').split('{setup}');
      var paragraph = h('p', 'hint setup-hint', parts[0]);
      var link = h('a', null, data.setupPath);
      link.href = data.setupPath;
      paragraph.appendChild(link);
      if (parts[1]) paragraph.appendChild(document.createTextNode(parts[1]));
      area().appendChild(paragraph);
    }

    function renderMenu() {
      title(T('choose_title'));
      var general = instructionsBlock(text(content.instructions));
      if (general) area().appendChild(general);
      content.doors.forEach(function (door, index) {
        area().appendChild(actionButton(text(door.name), 'btn-choice', function () {
          // Apertura diretta solo se non c'è nulla da mostrare o da verificare.
          if (!door.requiresPin && !text(door.instructions)) {
            open(index);
            return;
          }
          selected = index;
          status('');
          render();
        }));
      });
    }

    function renderDoorScreen(index, canGoBack) {
      var door = content.doors[index];
      title(text(door.name));

      var doorInstructions = text(door.instructions) || (canGoBack ? '' : text(content.instructions));
      var block = instructionsBlock(doorInstructions);
      if (block) area().appendChild(block);

      var input = null;
      if (door.requiresPin) {
        input = pinField(T('pin_placeholder'));
        area().appendChild(input);
      }

      var submit = actionButton(door.requiresPin ? T('open_verify') : T('open_now'), 'btn-open', function () {
        open(index, input ? input.value : '', submit);
      });
      area().appendChild(submit);

      if (input) {
        input.addEventListener('keydown', function (event) {
          if (event.key === 'Enter') submit.click();
        });
        input.focus();
      }

      if (canGoBack) {
        area().appendChild(actionButton(T('back'), 'btn-back', function () {
          selected = null;
          status('');
          render();
        }));
      }
    }

    function renderSequence() {
      if (currentStep >= content.doors.length) {
        title(T('sequence_done'));
        return;
      }
      renderDoorScreen(currentStep, false);
    }

    function render() {
      renderLangSwitch();
      document.documentElement.lang = lang;
      document.getElementById('badge').textContent = T('badge');
      area().innerHTML = '';

      var emergency = document.getElementById('emergencySection');
      var emergencyContact = data.emergencyContact || (content && content.emergency_contact) || '';
      if (emergencyContact) {
        var link = document.getElementById('emergencyLink');
        link.href = 'tel:' + emergencyContact;
        link.textContent = T('emergency');
        emergency.style.display = 'block';
      } else {
        emergency.style.display = 'none';
      }

      if (!unlocked) return renderLocked();
      if (!content.doors.length) return renderNoDoors();
      if (content.mode === 'sequence') return renderSequence();
      if (selected === null) return renderMenu();
      return renderDoorScreen(selected, true);
    }

    function open(index, pin, button) {
      var door = content.doors[index];
      if (button) button.disabled = true;
      status(T('opening'));
      post({ action: 'open', doorId: door.id, doorIndex: index, pin: pin || '' })
        .then(function (result) {
          if (result.locked) {
            // Il codice di accesso è scaduto o è cambiato: si riparte dallo sblocco.
            unlocked = false;
            content = null;
            selected = null;
            render();
            status(result.msg, 'var(--danger)');
            return;
          }
          if (result.success) {
            status(result.msg, 'var(--brand-green)');
            if (content.mode === 'sequence') {
              currentStep++;
              setTimeout(function () { status(''); render(); }, 2000);
            } else {
              selected = null;
              setTimeout(function () { status(''); render(); }, 3000);
            }
            return;
          }
          status(result.msg, 'var(--danger)');
          var field = document.getElementById('pinCode');
          if (field) { field.value = ''; field.focus(); }
        })
        .catch(function () { status(T('connection_error'), 'var(--danger)'); })
        .then(function () { if (button) button.disabled = false; });
    }

    render();
  </script>
</body>
</html>`;
}
