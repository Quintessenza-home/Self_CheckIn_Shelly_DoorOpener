# Self CheckIn Shelly DoorOpener  🔓

A simple, free, no-login system to open a door/gate remotely by sharing a link and a PIN. Built on Cloudflare Pages Functions and the Shelly Cloud API.

Sistema semplice e gratuito per aprire una porta/cancello da remoto condividendo un link e un PIN, senza bisogno di login. Basato su Cloudflare Pages Functions e le API Cloud di Shelly.

---

## 🇬🇧 English

### How it works

- A visitor opens the site's homepage, which redirects to `/apri`.
- They type in a PIN and press the button.
- The page calls a serverless function (`functions/apri.js`) that checks the PIN and, if correct, tells your Shelly device (via Shelly's Cloud API) to activate the relay for a few seconds.
- No accounts, no app installs — just a link.

### What you need before starting

1. A **Shelly device** (Shelly 1, Shelly Plus 1, etc.) wired to your door/gate relay, already set up and connected to WiFi via the Shelly app.
2. A **Shelly Cloud account** (created automatically when you set up the device in the app) — this gives you the credentials below.
3. A **GitHub account** (free) — [github.com](https://github.com).
4. A **Cloudflare account** (free) — [cloudflare.com](https://cloudflare.com).

### Step 1 — Get your Shelly credentials

Open the Shelly app (or [control.shelly.cloud](https://control.shelly.cloud)):

1. Go to **Settings → User Settings** (or your profile icon).
2. Find and copy your **Auth Key** — this is your `SHELLY_AUTH_KEY`.
3. On the same screen you'll see your **Server URI** (e.g. `shelly-103-eu.shelly.cloud`) — this is your `SHELLY_SERVER`. **Do not include `https://`**, just the hostname.
4. Open the specific device's settings page and find its **Device ID** — this is your `SHELLY_DEVICE_ID`.

Keep these three values handy, you'll need them in Step 4.

### Step 2 — Fork or upload this repository to GitHub

- Fork this repo, or create a new repository and upload these files, keeping this exact structure:

```
your-repo/
├── functions/
│   └── apri.js
├── _redirects
└── README.md
```

The repo can be **private** — Cloudflare can still connect to it.

### Step 3 — Create a Cloudflare Pages project

1. Log into [dash.cloudflare.com](https://dash.cloudflare.com) (sign up if you don't have an account — it's free, no credit card required).
2. Go to **Workers & Pages → Create application → Pages tab** (not "Workers").
3. Click **Connect to Git**, authorize GitHub, and select your repository.
4. In the build settings, leave everything at its default / empty:
   - Framework preset: **None**
   - Build command: *(leave empty)*
   - Build output directory: `/`
5. Click **Save and Deploy**.

Cloudflare will give you a public URL like `https://your-project.pages.dev`.

### Step 4 — Add your environment variables

1. In your Cloudflare Pages project, go to **Settings → Environment variables**.
2. Add these four variables (Production environment):

| Variable name | Value |
|---|---|
| `VALID_PIN` | the PIN you want to use, e.g. `1234` |
| `SHELLY_SERVER` | your server hostname, e.g. `shelly-103-eu.shelly.cloud` |
| `SHELLY_AUTH_KEY` | your Shelly auth key |
| `SHELLY_DEVICE_ID` | your device ID |

3. Save. Then trigger a new deployment (Deployments tab → Retry deployment on the latest one, or just push any small commit) so the variables take effect.

### Step 5 — Test it

Open:
```
https://your-project.pages.dev/
```
You should see a PIN entry screen. Enter the PIN you configured and confirm the relay activates.

### Changing the PIN later

Go to **Settings → Environment variables**, edit `VALID_PIN`, save, and redeploy. No code changes needed.

### Security notes

- The PIN is checked server-side, but there's no rate-limiting by default — anyone could try many PINs in a row. Consider adding rate-limiting if this matters for your use case.
- Use a PIN that isn't trivially guessable (avoid `0000`, `1234`, etc.) for anything beyond casual/low-risk use.
- All traffic is served over HTTPS by Cloudflare automatically.

---

## 🇮🇹 Italiano

### Come funziona

- Chi visita la homepage del sito viene reindirizzato a `/apri`.
- Inserisce un PIN e preme il pulsante.
- La pagina chiama una funzione serverless (`functions/apri.js`) che verifica il PIN e, se corretto, comanda al dispositivo Shelly (tramite le API Cloud di Shelly) di attivare il relè per qualche secondo.
- Nessun account, nessuna app da installare — solo un link.

### Cosa serve prima di iniziare

1. Un **dispositivo Shelly** (Shelly 1, Shelly Plus 1, ecc.) collegato al relè della porta/cancello, già configurato e connesso al WiFi tramite l'app Shelly.
2. Un **account Shelly Cloud** (creato automaticamente quando configuri il dispositivo nell'app) — da qui recuperi le credenziali.
3. Un **account GitHub** (gratuito) — [github.com](https://github.com).
4. Un **account Cloudflare** (gratuito) — [cloudflare.com](https://cloudflare.com).

### Passo 1 — Recupera le credenziali Shelly

Apri l'app Shelly (o [control.shelly.cloud](https://control.shelly.cloud)):

1. Vai su **Impostazioni → Impostazioni utente** (o l'icona del profilo).
2. Trova e copia la tua **Auth Key** — sarà il tuo `SHELLY_AUTH_KEY`.
3. Nella stessa schermata trovi il **Server URI** (es. `shelly-103-eu.shelly.cloud`) — sarà il tuo `SHELLY_SERVER`. **Non includere `https://`**, solo il nome host.
4. Apri le impostazioni del dispositivo specifico e trova il suo **Device ID** — sarà il tuo `SHELLY_DEVICE_ID`.

Tieni a portata di mano questi tre valori, ti serviranno al Passo 4.

### Passo 2 — Carica questa repository su GitHub

- Fai un fork di questa repo, oppure creane una nuova e carica questi file, mantenendo esattamente questa struttura:

```
tua-repo/
├── functions/
│   └── apri.js
├── _redirects
└── README.md
```

La repo può essere **privata** — Cloudflare riesce comunque a collegarsi.

### Passo 3 — Crea un progetto Cloudflare Pages

1. Accedi a [dash.cloudflare.com](https://dash.cloudflare.com) (registrati se non hai un account — è gratuito, non serve carta di credito).
2. Vai su **Workers & Pages → Create application → tab Pages** (non "Workers").
3. Clicca **Connect to Git**, autorizza GitHub e seleziona la tua repository.
4. Nelle impostazioni di build, lascia tutto vuoto/default:
   - Framework preset: **None**
   - Build command: *(lascia vuoto)*
   - Build output directory: `/`
5. Clicca **Save and Deploy**.

Cloudflare ti assegnerà un URL pubblico tipo `https://tuo-progetto.pages.dev`.

### Passo 4 — Inserisci le variabili d'ambiente

1. Nel progetto Cloudflare Pages, vai su **Settings → Environment variables**.
2. Aggiungi queste quattro variabili (ambiente Production):

| Nome variabile | Valore |
|---|---|
| `VALID_PIN` | il PIN che vuoi usare, es. `1234` |
| `SHELLY_SERVER` | il tuo hostname server, es. `shelly-103-eu.shelly.cloud` |
| `SHELLY_AUTH_KEY` | la tua auth key Shelly |
| `SHELLY_DEVICE_ID` | l'ID del tuo dispositivo |

3. Salva. Poi avvia un nuovo deployment (tab Deployments → Retry deployment sull'ultimo, oppure fai un piccolo commit) affinché le variabili vengano applicate.

### Passo 5 — Testa il sistema

Apri:
```
https://tuo-progetto.pages.dev/
```
Dovresti vedere la schermata di inserimento PIN. Inserisci il PIN configurato e verifica che il relè si attivi.

### Cambiare il PIN in futuro

Vai su **Settings → Environment variables**, modifica `VALID_PIN`, salva e rifai il deploy. Nessuna modifica al codice necessaria.

### Note sulla sicurezza

- Il PIN viene verificato lato server, ma di default non c'è un limite ai tentativi — chiunque potrebbe provare molti PIN di seguito. Valuta di aggiungere un rate-limiting se questo aspetto è rilevante per il tuo caso d'uso.
- Usa un PIN non banalmente indovinabile (evita `0000`, `1234`, ecc.) per usi che vadano oltre il semplice contesto informale/basso rischio.
- Tutto il traffico è servito automaticamente in HTTPS da Cloudflare.
