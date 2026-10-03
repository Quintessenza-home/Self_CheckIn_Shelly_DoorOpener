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
  .lang-current-short { display: none; }
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
  .access-pin-entry { margin-bottom: 1rem; }
  .access-pin-entry input { margin-bottom: 0.65rem; }
  .keypad {
    display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.55rem; margin-bottom: 0.65rem;
  }
  .keypad button {
    min-height: 58px; padding: 0.45rem; border-radius: 12px;
    border: 2px solid #cbc5ba; background: #fff; color: #262521;
    font-size: 1.35rem; font-weight: 800; touch-action: manipulation;
  }
  .keypad button:active { background: #e9f2ec; border-color: #2f6b4f; }
  .keypad button.control { font-size: 0.9rem; color: #57544e; }
  .keypad-mode {
    width: 100%; min-height: 44px; padding: 0.45rem; margin: 0;
    border: 0; background: transparent; color: #2f6b4f; font-size: 0.9rem;
    text-decoration: underline; text-underline-offset: 3px;
  }
  .guide-progress { margin: -0.7rem 0 0.75rem; color: #6b665e; font-size: 0.88rem; font-weight: 800; }
  .guide-card {
    text-align: left; background: #f8f5ee; border: 2px solid #ded7ca;
    border-radius: 16px; padding: 0.75rem; margin-bottom: 0.9rem;
  }
  .guide-card img {
    display: block; width: 100%; max-height: 42vh; object-fit: contain;
    background: #ebe7df; border-radius: 11px; margin-bottom: 0.85rem;
  }
  .guide-card h2 { margin: 0 0 0.45rem; font-size: 1.25rem; line-height: 1.3; }
  .guide-card p { margin: 0; color: #36332f; font-size: 1rem; line-height: 1.55; white-space: pre-wrap; }
  .key-box-code {
    margin-top: 0.85rem; padding: 0.8rem; border-radius: 10px; text-align: center;
    background: #fff; border: 2px solid #2f6b4f;
  }
  .key-box-code span { display: block; color: #57544e; font-size: 0.82rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; }
  .key-box-code strong { display: block; margin-top: 0.25rem; font-size: 1.7rem; letter-spacing: 0.22rem; color: #183d2d; }
  .guide-nav { display: grid; grid-template-columns: 1fr 1.35fr; gap: 0.65rem; }
  .guide-nav .action { margin-bottom: 0; }
  .route-choice-view .hint { margin-bottom: 1.35rem; }
  .route-choice-actions {
    display: grid; gap: 0.9rem; padding: 0.2rem 0 0.3rem;
  }
  .route-choice-actions .action {
    min-height: 72px; margin-bottom: 0; font-size: 1.12rem;
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
  button.action.btn-guide {
    min-height: 48px; padding: 0.65rem; background: transparent; color: #2f6b4f;
    border-color: #9bb8a6; box-shadow: none; font-size: 0.95rem;
  }
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
    .guide-card img { max-height: 38vh; }
    button.action { min-height: 64px; }
    .box.showing-guide { padding-top: 4.25rem; }
    .box.showing-guide .logo { max-width: 105px; margin-bottom: 0.35rem; }
    .box.showing-guide .badge { display: none; }
    .box.showing-guide h1 { font-size: 1.45rem; margin: 0.2rem 0 0.65rem; }
    .box.showing-guide .hint { font-size: 0.95rem; line-height: 1.4; margin-bottom: 0.55rem; }
    .box.showing-guide .guide-card img { max-height: 31vh; }
    .box.showing-choice { padding-top: 5.5rem; }
    .box.showing-choice .logo { max-width: 175px; margin-bottom: 1rem; }
    .box.showing-choice h1 { margin-bottom: 0.9rem; }
    .box.showing-choice .route-choice-actions .action { min-height: 74px; }
    .emergency {
      position: absolute; top: 0.75rem; left: 0.75rem; bottom: auto; transform: none;
      width: auto; max-width: calc(100% - 8.25rem);
    }
    .emergency a {
      justify-content: flex-start; min-height: 40px; padding: 0;
      font-size: 0.9rem; letter-spacing: 0.02em; white-space: nowrap;
    }
  }

  @media (max-width: 360px) {
    .box { padding-left: 1rem; padding-right: 1rem; }
    .lang-toggle { min-width: 86px; padding-inline: 0.55rem; }
    .lang-current-full { display: none; }
    .lang-current-short { display: inline; }
    .emergency a { font-size: 0.86rem; }
    .logo { max-width: 145px; }
    h1 { font-size: 1.48rem; }
  }


  @media (orientation: landscape) and (max-height: 500px) {
    body { align-items: flex-start; padding: 0.5rem 1rem; font-size: 16px; }
    .box {
      max-width: 520px; padding: 2.9rem 1.25rem 0.85rem;
      border-radius: 18px; box-shadow: 0 10px 30px rgba(42, 37, 29, 0.12), 4px 4px 0 #2d2b27;
    }
    .logo { max-width: 82px; margin-bottom: 0.25rem; }
    .box .badge { font-size: 0.68rem; margin-bottom: 0.1rem; }
    h1 { font-size: 1.3rem; margin: 0.15rem 0 0.45rem; }
    .hint { font-size: 0.95rem; line-height: 1.35; margin-bottom: 0.45rem; }
    #actionArea.locked {
      display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      gap: 0.55rem;
    }
    #actionArea.locked .hint { grid-column: 1 / -1; margin-bottom: 0; }
    #actionArea.locked .access-pin-entry { grid-column: 1 / -1; margin-bottom: 0; }
    #actionArea.locked input,
    #actionArea.locked button.action { min-height: 54px; margin-bottom: 0; }
    .keypad { grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 0.4rem; }
    .keypad button { min-height: 48px; font-size: 1.05rem; }
    .guide-card { display: grid; grid-template-columns: minmax(170px, 0.9fr) 1.1fr; gap: 0.8rem; align-items: center; }
    .guide-card img { max-height: 44vh; margin: 0; }
    .guide-card .guide-copy { min-width: 0; }
    .box.showing-guide { padding-top: 2.65rem; }
    .box.showing-guide .logo { display: none; }
    .box.showing-guide .badge { display: none; }
    .box.showing-guide h1 { margin: 0 0 0.2rem; font-size: 1.25rem; }
    .box.showing-guide .hint { margin-bottom: 0.2rem; }
    .box.showing-guide .guide-progress { margin: -0.15rem 0 0.35rem; }
    .box.showing-guide .guide-card { padding: 0.5rem; margin-bottom: 0.45rem; }
    .box.showing-guide .guide-card img { max-height: 30vh; }
    .box.showing-guide .guide-nav .action { min-height: 48px; padding-block: 0.5rem; }
    .box.showing-choice { padding-top: 2.65rem; }
    .box.showing-choice .logo { max-width: 76px; margin-bottom: 0.2rem; }
    .box.showing-choice .badge { display: none; }
    .box.showing-choice h1 { margin: 0 0 0.25rem; font-size: 1.25rem; }
    .box.showing-choice .hint { margin-bottom: 0.45rem; }
    .box.showing-choice .route-choice-actions { grid-template-columns: 1fr 1fr; gap: 0.55rem; }
    .box.showing-choice .route-choice-actions .action { min-height: 56px; padding: 0.55rem; }
    #statusMessage { margin-top: 0.45rem; min-height: 22px; font-size: 0.9rem; }
    .lang-switch { top: 0.65rem; right: 0.75rem; }
    .lang-menu {
      max-height: calc(100dvh - 4.5rem); overflow-y: auto;
      overscroll-behavior: contain;
    }
    .emergency { position: absolute; top: 0.65rem; left: 0.75rem; bottom: auto; transform: none; }
    .emergency a { min-height: 44px; font-size: 0.9rem; }
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
    var guideIndex = 0;
    var guideOpen = false;
    var routeChoiceOpen = !!(unlocked && content && content.arrival_guide && content.arrival_guide.length);

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

    function accessPinEntry(placeholder) {
      var wrap = h('div', 'access-pin-entry');
      var input = pinField(placeholder);
      input.maxLength = 6;
      input.readOnly = true;
      input.setAttribute('aria-label', T('locked_title'));
      input.addEventListener('input', function () {
        input.value = input.value.replace(/[^0-9]/g, '').slice(0, 6);
      });
      wrap.appendChild(input);

      var keypad = h('div', 'keypad');
      keypad.setAttribute('aria-label', T('keypad_screen'));
      function addDigit(value) {
        if (input.value.length >= 6) return;
        input.value += value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
      ['1','2','3','4','5','6','7','8','9'].forEach(function (digit) {
        var button = h('button', null, digit);
        button.type = 'button';
        button.setAttribute('aria-label', digit);
        button.addEventListener('click', function () { addDigit(digit); });
        keypad.appendChild(button);
      });
      var clear = h('button', 'control', 'C');
      clear.type = 'button'; clear.setAttribute('aria-label', T('keypad_clear'));
      clear.addEventListener('click', function () { input.value = ''; input.dispatchEvent(new Event('input', { bubbles: true })); });
      keypad.appendChild(clear);
      var zero = h('button', null, '0');
      zero.type = 'button'; zero.setAttribute('aria-label', '0');
      zero.addEventListener('click', function () { addDigit('0'); });
      keypad.appendChild(zero);
      var backspace = h('button', 'control', '⌫');
      backspace.type = 'button'; backspace.setAttribute('aria-label', T('keypad_delete'));
      backspace.addEventListener('click', function () {
        input.value = input.value.slice(0, -1);
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });
      keypad.appendChild(backspace);
      wrap.appendChild(keypad);

      var mode = h('button', 'keypad-mode', T('keypad_phone'));
      mode.type = 'button';
      mode.addEventListener('click', function () {
        input.readOnly = !input.readOnly;
        if (input.readOnly) {
          input.blur();
          mode.textContent = T('keypad_phone');
        } else {
          input.focus();
          mode.textContent = T('keypad_screen');
        }
      });
      wrap.appendChild(mode);
      return { wrap: wrap, input: input };
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

    function guideTitleKey(id) { return 'guide_' + id + '_title'; }
    function guideDefaultKey(id) { return 'guide_' + id + '_default'; }

    function closeGuide() {
      guideOpen = false;
      routeChoiceOpen = false;
      guideIndex = 0;
      status('');
      render();
    }

    function guideReviewButton() {
      if (!content || !content.arrival_guide || !content.arrival_guide.length) return null;
      return actionButton(T('guide_review'), 'btn-guide', function () {
        routeChoiceOpen = false;
        guideOpen = true;
        guideIndex = 0;
        status('');
        render();
      });
    }

    function renderRouteChoice() {
      area().className = 'route-choice-view';
      title(T('guide_choice_title'));
      area().appendChild(h('p', 'hint', T('guide_choice_intro')));

      var actions = h('div', 'route-choice-actions');
      actions.appendChild(actionButton(T('guide_choice_view'), 'btn-choice', function () {
        routeChoiceOpen = false;
        guideOpen = true;
        guideIndex = 0;
        status('');
        render();
      }));
      actions.appendChild(actionButton(T('guide_choice_skip'), 'btn-open', function () {
        routeChoiceOpen = false;
        guideOpen = false;
        status('');
        render();
      }));
      area().appendChild(actions);
    }

    function renderGuide() {
      var steps = content.arrival_guide || [];
      if (!steps.length) return closeGuide();
      if (guideIndex >= steps.length) guideIndex = steps.length - 1;
      var step = steps[guideIndex];

      area().className = 'guide-view';
      title(T('guide_title'));
      if (guideIndex === 0) area().appendChild(h('p', 'hint', T('guide_intro')));
      area().appendChild(h('div', 'guide-progress', T('guide_step', {
        current: guideIndex + 1,
        total: steps.length
      })));

      var card = h('div', 'guide-card');
      var image = document.createElement('img');
      image.src = step.image;
      image.alt = T(guideTitleKey(step.id));
      card.appendChild(image);
      var copy = h('div', 'guide-copy');
      copy.appendChild(h('h2', null, T(guideTitleKey(step.id))));
      copy.appendChild(h('p', null, text(step.note) || T(guideDefaultKey(step.id))));
      if (step.id === 'key_box' && content.key_box_pin) {
        var pin = h('div', 'key-box-code');
        pin.appendChild(h('span', null, T('guide_key_box_pin')));
        pin.appendChild(h('strong', null, content.key_box_pin));
        copy.appendChild(pin);
      }
      card.appendChild(copy);
      area().appendChild(card);

      var nav = h('div', 'guide-nav');
      var previous = actionButton(T('guide_previous'), 'btn-back', function () {
        if (guideIndex > 0) { guideIndex--; render(); }
      });
      previous.disabled = guideIndex === 0;
      nav.appendChild(previous);
      if (guideIndex === steps.length - 1) {
        nav.appendChild(actionButton(T('guide_finish'), 'btn-open', closeGuide));
      } else {
        nav.appendChild(actionButton(T('guide_next'), 'btn-open', function () {
          guideIndex++;
          render();
        }));
      }
      area().appendChild(nav);
    }

    function renderLangSwitch() {
      var container = document.getElementById('langSwitch');
      container.innerHTML = '';
      if (data.languages.length < 2) return;

      var toggle = h('button', 'lang-toggle');
      toggle.type = 'button';
      toggle.setAttribute('aria-haspopup', 'listbox');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', T('language_selector'));
      toggle.appendChild(h('span', 'lang-current-full', (data.languageFlags[lang] || '🌐') + ' ' + (data.languageLabels[lang] || lang)));
      toggle.appendChild(h('span', 'lang-current-short', (data.languageFlags[lang] || '🌐') + ' ' + lang.toUpperCase()));
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
      area().className = 'locked';
      title(T('locked_title'));
      area().appendChild(h('p', 'hint', T('locked_hint')));
      var entry = accessPinEntry(T('pin_placeholder'));
      var input = entry.input;
      area().appendChild(entry.wrap);
      var submit = actionButton(T('locked_button'), null, function () {
        if (!input.value) return;
        submit.disabled = true;
        status(T('opening'));
        post({ action: 'unlock', pin: input.value }).then(function (result) {
          if (result.success) {
            unlocked = true;
            content = result.content;
            guideIndex = 0;
            guideOpen = false;
            routeChoiceOpen = !!(content.arrival_guide && content.arrival_guide.length);
            status('');
            render();
            return;
          }
          status(result.msg, 'var(--danger)');
          input.value = '';
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }).catch(function () {
          status(T('connection_error'), 'var(--danger)');
        }).then(function () { submit.disabled = false; syncSubmit(); });
      });
      area().appendChild(submit);
      function syncSubmit() { submit.disabled = input.value.length < 4; }
      input.addEventListener('input', syncSubmit);
      input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') submit.click();
      });
      syncSubmit();
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
      var review = guideReviewButton();
      if (review) area().appendChild(review);
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

      var review = guideReviewButton();
      if (review) area().appendChild(review);

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
      area().className = '';
      var showingChoice = !!(unlocked && routeChoiceOpen && content && content.arrival_guide && content.arrival_guide.length);
      var showingGuide = !!(unlocked && guideOpen && content && content.arrival_guide && content.arrival_guide.length);
      var box = document.querySelector('.box');
      box.classList.toggle('showing-choice', showingChoice);
      box.classList.toggle('showing-guide', showingGuide);

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
      if (showingChoice) return renderRouteChoice();
      if (showingGuide) return renderGuide();
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
