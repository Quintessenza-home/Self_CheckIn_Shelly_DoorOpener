# 🚪 Opendoor Cloudflare Pages — Guida Completa all'Installazione

Benvenuto! Questa guida è pensata per accompagnarti **passo dopo passo** nella configurazione di un sistema di apertura remota per cancelli, portoni o porte gestiti da relè **Shelly**.

Non è richiesta alcuna competenza di programmazione: ti basterà seguire le istruzioni nell'ordine riportato.

---

## 📋 Indice
1. [Prerequisiti](#1-prerequisiti)
2. [Recuperare i dati da Shelly Cloud](#2-recuperare-i-dati-da-shelly-cloud)
3. [Preparare i file su GitHub](#3-preparare-i-file-su-github)
4. [Configurare Cloudflare Pages](#4-configurare-cloudflare-pages)
5. [Impostare la Password di Setup](#5-impostare-la-password-di-setup)
6. [Generare e Salvare la Configurazione (`/setup`)](#6-generare-e-salvare-la-configurazione-setup)
7. [Utilizzo Quotidiano](#7-utilizzo-quotidiano)
8. [Risoluzione Problemi Frequenti](#8-risoluzione-problemi-frequenti)

---

## 1. Prerequisiti

Prima di iniziare, assicurati di avere:
- Un **account GitHub** (gratuito).
- Un **account Cloudflare** (gratuito).
- Un relè **Shelly** (es. Shelly Plus 1, Shelly 1PM, ecc.) già installato, collegato al Wi-Fi di casa e associato al tuo account **Shelly Cloud**.

---

## 2. Recuperare i dati da Shelly Cloud

Per fare in modo che il sito possa inviare il comando di apertura al tuo cancello, devi recuperare tre informazioni fondamentali dal tuo account Shelly:

### A. Trovare la Chiave di Autorizzazione (Auth Key / Token)
1. Apri l'applicazione **Shelly Smart Control** sul tuo smartphone (oppure vai su [home.shelly.cloud](https://home.shelly.cloud/) dal computer).
2. Clicca sull'icona del tuo **Profilo** o sul menu in alto a destra (☰).
3. Clicca su **Impostazioni account** (User Settings).
4. Clicca sulla voce **Authorization Key** (Chiave di autorizzazione / API Key).
5. Clicca sul pulsante **Get Key** (o *Create/Re-generate* se non ne hai mai creata una).
6. Sullo schermo apparirà un codice alfanumerico molto lungo (es. `M2Y0ODk2N...`). **Copialo interamente e salvalo in un luogo sicuro**.

### B. Individuare il Server Cloud
Nella stessa schermata in cui hai recuperato la chiave, o guardando la barra degli indirizzi del browser quando sei connesso a Shelly Cloud, troverai l'indicazione del tuo server assegnato (es. `shelly-281-eu.shelly.cloud` oppure `shelly-281-eu`). Annotalo.

### C. Trovare l'ID del Dispositivo (Device ID)
1. Dall'app Shelly, apri la scheda del dispositivo che aziona il cancello o la porta.
2. Clicca sull'icona delle **Impostazioni** (l'ingranaggio ⚙️ in alto a destra).
3. Scorri fino alla sezione **Device Information** (Informazioni dispositivo).
4. Troverai la voce **Device ID** (un codice alfanumerico di 12 caratteri, es. `34845d62a12c`). Copialo.

---

## 3. Preparare i file su GitHub

1. Entra nel tuo account **GitHub** ed entra nel repository del progetto.
2. Assicurati che all'interno della cartella **`functions/`** ci sia il file del codice rinominato esattamente così:  
   `functions/[[path]].js`
   
   > ⚠️ **Perché `[[path]].js`?** Questo nome speciale dice a Cloudflare di usare lo stesso file sia per la pagina del tastierino principale (`/`), sia per la pagina di configurazione (`/setup`).

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

---

## 6. Generare e Salvare la Configurazione (`/setup`)

Adesso utilizzeremo la pagina d'interfaccia visuale per generare la configurazione delle tue porte.

### Passo 1: Aprire il configuratore
Apri il tuo browser web e vai all'indirizzo del tuo sito Cloudflare aggiungendo `/setup` alla fine.  
Esempio: `https://opendoor-8id.pages.dev/setup`

### Passo 2: Compilare i dati
1. Inserisci la password che hai scelto al punto 5 (`SETUP_PASSWORD`).
2. **Modalità di Apertura:**
   - *Sequenziale:* Utile se hai due ingressi consecutivi (es. Cancello Pedonale ➔ Portone d'Ingresso). Il sito guiderà l'utente ad aprire prima uno e poi l'altro.
   - *Selezione Libera:* Utile se vuoi mostrare un elenco di pulsanti e far scegliere all'utente quale cancello aprire.
3. **Telefono Assistenza (Opzionale):** Inserisci un numero di telefono. Sul sito apparirà un comodo pulsante "Chiama Assistenza" in caso di problemi.
4. **Configurazione Porte:**
   - Clicca su **Aggiungi Porta**.
   - Inserisci il **Nome Porta** (es. *Cancello Esterno*).
   - Inserisci il **Server Shelly** recuperato al punto 2.B (es. `shelly-281-eu`).
   - Inserisci il **Device ID** recuperato al punto 2.C.
   - Inserisci la **Auth Key** recuperata al punto 2.A.
   - *(Opzionale)* Inserisci un **PIN di sicurezza** se vuoi che l'utente debba digitare un codice numerico prima che la porta si apra.
5. Quando hai terminato, clicca sul pulsante **Genera Codice di Configurazione**.
6. Clicca sul pulsante **Copiare negli appunti** per salvare il testo generato.

### Passo 3: Incollare la configurazione su Cloudflare
1. Torna nel pannello di Cloudflare sotto **Settings** ➔ **Environment variables**.
2. Clicca su **Add variable** (o *Edit variables*).
3. Aggiungi la nuova variabile:
   - **Variable name:** `CONFIG` *(tutto maiuscolo)*
   - **Value:** Incolla l'intero testo copiato dalla pagina di setup.
4. Clicca su **Save**.

### Passo 4: Applicare i cambiamenti (Riavvio Deploy)
⚠️ **Passo Fondamentale:** Quando modifichi le variabili d'ambiente su Cloudflare, il sito non si aggiorna da solo finché non esegui un nuovo "deploy".
1. Clicca sulla scheda **Deployments** in alto su Cloudflare.
2. Trova il primo elemento della lista (l'ultimo deploy effettuato) e clicca sui **tre pallini (`...`)** a destra.
3. Clicca su **Retry deployment**.
4. Attendi circa 10-15 secondi che lo stato ritorni verde ("Active").

---

## 7. Utilizzo Quotidiano

Il tuo sistema è pronto!

- **Per gli utenti / ospiti:** Basta collegarsi all'indirizzo base del sito (es. `https://opendoor-8id.pages.dev/`). Sullo schermo apparirà il tastierino visuale con i pulsanti per aprire le porte e l'eventuale richiesta del PIN.
- **Per modificare la configurazione in futuro:** Torna su `https://opendoor-8id.pages.dev/setup`, modifica i dati desiderati, rigenera il codice e incollalo nuovamente nella variabile `CONFIG` su Cloudflare, ricordandoti poi di fare il **Retry deployment**.

---

## 8. Risoluzione Problemi Frequenti

#### ❓ Errore 404 / Pagina non trovata
- **Causa:** Il file del codice su GitHub non si chiama esattamente `[[path]].js` all'interno della cartella `functions/`.
- **Risoluzione:** Rinomina il file in `functions/[[path]].js` su GitHub e fai un commit.

#### ❓ Ho aggiornato le variabili su Cloudflare ma il sito non cambia
- **Causa:** Non è stato fatto il *Retry deployment*.
- **Risoluzione:** Vai su Cloudflare ➔ *Deployments* ➔ Clicca `...` sull'ultimo deploy ➔ *Retry deployment*.

#### ❓ Premendo il pulsante la porta non si apre
- **Causa:** Il Device ID, il Server o la Auth Key di Shelly contengono un errore di battitura, oppure il dispositivo Shelly è offline (senza connessione Wi-Fi).
- **Risoluzione:** Verifica dall'app ufficiale Shelly che il relè sia online e funzionante, quindi controlla i dati inseriti nella pagina di `/setup`.
