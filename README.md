# 🚪 Opendoor Cloudflare Pages — Guida Completa all'Installazione

Benvenuto! Questa guida è pensata per accompagnarti **passo dopo passo** nella configurazione di un sistema di apertura remota per cancelli, portoni o porte gestiti da relè **Shelly**.

Non è richiesta alcuna competenza di programmazione: ti basterà seguire le istruzioni nell'ordine riportato.

> 💡 **La configurazione è persistente.** Porte, PIN e credenziali vengono salvati direttamente dalla pagina `/setup` e restano memorizzati: non devi più reinserirli ogni volta, né copiare-incollare codice, né rifare il deploy.

---

## 📋 Indice
1. [Prerequisiti](#1-prerequisiti)
2. [Recuperare i dati da Shelly Cloud](#2-recuperare-i-dati-da-shelly-cloud)
3. [Preparare i file su GitHub](#3-preparare-i-file-su-github)
4. [Configurare Cloudflare Pages](#4-configurare-cloudflare-pages)
5. [Impostare la Password di Setup](#5-impostare-la-password-di-setup)
6. [Attivare il salvataggio permanente (KV)](#6-attivare-il-salvataggio-permanente-kv)
7. [Configurare le porte (`/setup`)](#7-configurare-le-porte-setup)
8. [Utilizzo Quotidiano](#8-utilizzo-quotidiano)
9. [Risoluzione Problemi Frequenti](#9-risoluzione-problemi-frequenti)
10. [Struttura del progetto](#10-struttura-del-progetto)

---

## 1. Prerequisiti

Prima di iniziare, assicurati di avere:
- Un **account GitHub** (gratuito).
- Un **account Cloudflare** (gratuito).
- Un relè **Shelly** (es. Shelly Plus 1, Shelly 1PM, ecc.) già installato, collegato al Wi-Fi di casa e associato al tuo account **Shelly Cloud**.

---

## 2. Recuperare i dati da Shelly Cloud

Per fare in modo che il sito possa inviare il comando di apertura al tuo cancello, devi recuperare tre informazioni fondamentali dal tuo account Shelly.

> ℹ️ **Buona notizia:** Auth Key e Server si inseriscono **una sola volta** (sono condivisi da tutte le porte). Per ogni dispositivo aggiuntivo ti servirà solo il **Device ID**.

### A. Trovare la Chiave di Autorizzazione (Auth Key / Token)
1. Apri l'applicazione **Shelly Smart Control** sul tuo smartphone (oppure vai su [home.shelly.cloud](https://home.shelly.cloud/) dal computer).
2. Clicca sull'icona del tuo **Profilo** o sul menu in alto a destra (☰).
3. Clicca su **Impostazioni account** (User Settings).
4. Clicca sulla voce **Authorization Key** (Chiave di autorizzazione / API Key).
5. Clicca sul pulsante **Get Key** (o *Create/Re-generate* se non ne hai mai creata una).
6. Sullo schermo apparirà un codice alfanumerico molto lungo (es. `M2Y0ODk2N...`). **Copialo interamente e salvalo in un luogo sicuro**.

### B. Individuare il Server Cloud
Nella stessa schermata in cui hai recuperato la chiave, o guardando la barra degli indirizzi del browser quando sei connesso a Shelly Cloud, troverai l'indicazione del tuo server assegnato (es. `shelly-281-eu.shelly.cloud` oppure `shelly-281-eu`). Annotalo: **vanno bene entrambe le forme**, il sistema completa l'indirizzo automaticamente.

### C. Trovare l'ID del Dispositivo (Device ID)
1. Dall'app Shelly, apri la scheda del dispositivo che aziona il cancello o la porta.
2. Clicca sull'icona delle **Impostazioni** (l'ingranaggio ⚙️ in alto a destra).
3. Scorri fino alla sezione **Device Information** (Informazioni dispositivo).
4. Troverai la voce **Device ID** (un codice alfanumerico di 12 caratteri, es. `34845d62a12c`). Copialo.

---

## 3. Preparare i file su GitHub

1. Entra nel tuo account **GitHub** ed entra nel repository del progetto.
2. Assicurati che la cartella **`functions/`** contenga il file `functions/[[path]].js` **e** la sottocartella `functions/_lib/` con i suoi file.

   > ⚠️ **Perché `[[path]].js`?** Questo nome speciale dice a Cloudflare di usare lo stesso file sia per la pagina del tastierino principale (`/`), sia per la pagina di configurazione (`/setup`).
   >
   > ⚠️ **Perché `_lib/`?** Il trattino basso iniziale dice a Cloudflare che quei file sono codice di supporto e non pagine pubbliche. Non rinominare la cartella.

3. *(Opzionale)* Se vuoi mostrare un logo personalizzato in cima alla pagina, carica la tua immagine chiamata `logo.png` dentro la cartella `public/` (quindi il percorso sarà `public/logo.png`).

---

## 4. Configurare Cloudflare Pages

Ora dobbiamo collegare il tuo codice GitHub a Cloudflare in modo da pubblicare il sito web.

1. Accedi a [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Dal menu laterale a sinistra, clicca su **Workers & Pages**.
3. Clicca sul pulsante blu **Create application** e poi seleziona la scheda **Pages**.
4. Clicca su **Connect to Git**.
5. Seleziona il tuo account GitHub e poi scegli il repository di questo progetto.
6. Clicca su **Begin setup**.
7. Nelle opzioni della pagina che appare:
   - **Framework preset:** Seleziona *None*.
   - **Build command:** Lascia **completamente vuoto**.
   - **Build output directory:** Lascia **completamente vuoto**.
8. Clicca su **Save and Deploy**. Attendi un paio di minuti finché Cloudflare non completa la creazione del sito.

---

## 5. Impostare la Password di Setup

Per evitare che chiunque possa accedere alla schermata di configurazione e modificare le impostazioni dei tuoi cancelli, devi impostare una password segreta.

1. Rimani all'interno del tuo progetto su Cloudflare.
2. Clicca sulla scheda **Settings** (Impostazioni) in alto.
3. Nel menu a sinistra, seleziona **Environment variables** (Variabili d'ambiente).
4. Clicca su **Add variable** (o *Edit variables* se la schermata è diversa).
5. Inserisci questi dati:
   - **Variable name (Nome):** `SETUP_PASSWORD` *(scrivilo tutto in maiuscolo)*
   - **Value (Valore):** Scrivi la password personale che userai per accedere al setup (es. `MiaPasswordSicura2026`).
6. Clicca sul pulsante **Save** in fondo alla pagina per confermare.

> 🔒 Se non imposti questa variabile, la password predefinita è `admin`: impostane una tua prima di mettere online il sistema.

---

## 6. Attivare il salvataggio permanente (KV)

Questo passaggio si esegue **una volta sola** ed è ciò che rende la configurazione persistente: da quel momento le porte si aggiungono e si modificano direttamente dal browser, senza più toccare Cloudflare.

1. Dal menu laterale di Cloudflare clicca su **Storage & Databases** ➔ **KV**.
2. Clicca su **Create instance / Create a namespace**.
3. Dai un nome qualsiasi al namespace (es. `opendoor-config`) e conferma.
4. Torna nel tuo progetto Pages ➔ scheda **Settings** ➔ sezione **Bindings** (in alcune versioni: *Functions* ➔ *KV namespace bindings*).
5. Clicca su **Add binding** e inserisci:
   - **Variable name (nome del binding):** `CONFIG_KV`
   - **KV namespace:** seleziona il namespace appena creato.
6. Salva, poi vai su **Deployments**, clicca i **tre pallini (`...`)** sull'ultimo deploy e scegli **Retry deployment**.

> ✅ **Come verificare:** apri `/setup`, fai login e controlla il riquadro in alto. Se è **verde** ("Salvataggio automatico attivo") tutto è a posto. Se è **giallo**, il binding non è stato riconosciuto: ricontrolla il nome `CONFIG_KV` e rifai il *Retry deployment*.

> 🔄 **Stai aggiornando da una versione precedente?** Se avevi già la variabile `CONFIG`, al primo accesso dopo il collegamento del KV la tua configurazione viene **importata automaticamente**: la ritroverai già compilata dentro `/setup`. A quel punto la variabile `CONFIG` non serve più e puoi rimuoverla.

---

## 7. Configurare le porte (`/setup`)

### Passo 1: Aprire il configuratore
Vai all'indirizzo del tuo sito aggiungendo `/setup` alla fine.
Esempio: `https://opendoor-8id.pages.dev/setup`

Inserisci la password scelta al punto 5. La sessione resta attiva per 8 ore, quindi non dovrai ridigitarla a ogni modifica.

### Passo 2: Compilare i dati
La pagina si apre **già compilata con la configurazione attuale**: modifichi solo ciò che ti serve.

1. **Impostazioni Generali**
   - *Modalità Sequenziale:* utile con due ingressi consecutivi (es. Cancello Pedonale ➔ Portone d'Ingresso). Il sito guida l'ospite ad aprire prima uno e poi l'altro.
   - *Modalità Selezione Libera:* mostra l'elenco dei pulsanti e lascia scegliere quale aprire.
   - *Telefono Assistenza (Opzionale):* fa comparire un pulsante "Chiama Assistenza" sul sito.

2. **Account Shelly Condiviso** — inserisci **una sola volta** Server e Auth Key. Tutte le porte li erediteranno.

3. **Porte e Dispositivi** — clicca **Aggiungi Porta** e compila:
   - **Nome identificativo** (es. *Cancello Esterno*).
   - **Shelly Device ID** recuperato al punto 2.C.
   - **PIN di sblocco** *(opzionale)*: da 3 a 10 cifre; lascia vuoto per aprire senza codice.

   Per ogni porta hai a disposizione:
   - **↑ ↓** per riordinarle (conta nella modalità sequenziale);
   - **⧉** per duplicare una porta mantenendo le impostazioni;
   - **✕** per rimuoverla;
   - **🔌 Prova apertura** per testare subito il dispositivo, ancora prima di salvare;
   - **Credenziali specifiche per questa porta**, da usare solo nel caso raro di un secondo account Shelly.

### Passo 3: Salvare
Clicca **Salva configurazione** nella barra in basso. Fine: la modifica è immediatamente attiva sul sito pubblico. **Nessun copia-incolla e nessun nuovo deploy.**

### Backup (opzionale)
Nella sezione **Backup e opzioni avanzate** trovi la configurazione in formato testo: copiala per conservarne una copia di sicurezza, o incolla un backup e premi *Importa dal testo* per ripristinarla.

---

## 8. Utilizzo Quotidiano

Il tuo sistema è pronto!

- **Per gli utenti / ospiti:** basta collegarsi all'indirizzo base del sito (es. `https://opendoor-8id.pages.dev/`). Apparirà il tastierino con i pulsanti per aprire le porte e l'eventuale richiesta del PIN.
- **Per modificare la configurazione:** torna su `/setup`, cambia ciò che ti serve e premi **Salva configurazione**. Le modifiche sono immediate.

---

## 9. Risoluzione Problemi Frequenti

#### ❓ Errore 404 / Pagina non trovata
- **Causa:** il file del codice non si chiama esattamente `[[path]].js` dentro `functions/`, oppure manca la cartella `functions/_lib/`.
- **Risoluzione:** verifica i nomi su GitHub e fai un commit.

#### ❓ Il riquadro in `/setup` è giallo e il pulsante "Salva" è disattivato
- **Causa:** nessun namespace KV collegato al progetto.
- **Risoluzione:** esegui il [punto 6](#6-attivare-il-salvataggio-permanente-kv) e ricordati del *Retry deployment*.

#### ❓ Ho dimenticato la password di setup
- **Risoluzione:** cambia il valore di `SETUP_PASSWORD` su Cloudflare (*Settings* ➔ *Environment variables*) e fai *Retry deployment*. La configurazione salvata su KV non viene toccata.

#### ❓ Premendo il pulsante la porta non si apre
- **Risoluzione:** usa il pulsante **🔌 Prova apertura** dentro `/setup`: il messaggio d'errore ti dice esattamente dove sta il problema.
  - *"Auth Key rifiutata"* ➔ il token è errato o scaduto: rigeneralo dall'app Shelly.
  - *"Device ID non trovato"* ➔ controlla il Device ID nell'app Shelly.
  - *"Server Shelly non valido"* ➔ il server deve essere nella forma `shelly-281-eu` o `shelly-281-eu.shelly.cloud`.
  - *"Shelly Cloud non raggiungibile"* ➔ il relè è offline: verifica il Wi-Fi del dispositivo.

#### ❓ Ho perso la configurazione
- **Risoluzione:** se avevi fatto un backup dalla sezione *Backup e opzioni avanzate*, incollalo lì e premi *Importa dal testo*, poi *Salva configurazione*.

---

## 10. Struttura del progetto

```
functions/
├── [[path]].js          Router: /setup (pannello) e /* (tastierino + apertura)
└── _lib/
    ├── store.js         Lettura/scrittura della configurazione (KV, fallback CONFIG)
    ├── auth.js          Sessione amministrativa firmata (cookie HttpOnly)
    ├── shelly.js        Chiamate a Shelly Cloud e validazione del server
    ├── setup-page.js    Pagina di login e pannello di configurazione
    ├── keypad-page.js   Pagina pubblica di apertura
    └── html.js          Stili condivisi e utilità HTML
```

### Variabili e binding

| Nome | Tipo | Obbligatorio | Descrizione |
|---|---|---|---|
| `SETUP_PASSWORD` | Variabile d'ambiente | Consigliato | Password di accesso a `/setup` (default: `admin`). |
| `CONFIG_KV` | Binding KV | Consigliato | Namespace in cui viene salvata la configurazione. Senza, `/setup` è in sola lettura. |
| `CONFIG` | Variabile d'ambiente | No | Vecchio metodo, ancora supportato in sola lettura. Usato per la migrazione automatica verso KV. |
