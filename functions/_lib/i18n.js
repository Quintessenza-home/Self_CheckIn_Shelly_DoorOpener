// functions/_lib/i18n.js
// Traduzioni dell'interfaccia pubblica (ospiti) e dei messaggi di apertura.
//
// I testi scritti dall'amministratore (nomi porte, istruzioni) NON stanno qui:
// sono campi localizzati salvati in configurazione, vedi pickText().

export const LANGUAGES = ["it", "en", "de", "fr", "es", "nl"];
export const DEFAULT_LANGUAGE = "it";

export const STRINGS = {
  it: {
    badge: "Controllo Ingressi",
    locked_title: "Codice di accesso",
    locked_hint: "Inserisci il codice che hai ricevuto.",
    locked_button: "Entra",
    locked_error: "Codice errato ❌",
    locked_expired: "Sessione scaduta: reinserisci il codice di accesso.",
    choose_title: "Seleziona ingresso",
    sequence_done: "Tutto aperto! Benvenuto",
    instructions_title: "Come fare",
    open_now: "Apri ora",
    open_verify: "Verifica e Apri",
    back: "Indietro",
    pin_title: "PIN per {name}",
    pin_placeholder: "••••",
    opening: "Apertura in corso…",
    connection_error: "Errore di connessione.",
    emergency: "📞 Assistenza Immediata",
    language_selector: "Seleziona lingua",
    languages_available: "Lingue disponibili",
    no_doors_title: "Nessuna porta configurata",
    no_doors_hint: "Apri la pagina {setup} per configurare i dispositivi.",
    door_opened: "{name} aperta! ✅",
    door_not_found: "Porta non trovata",
    pin_wrong: "PIN errato ❌",
    bad_request: "Richiesta non valida.",
    shelly_bad_server: "Server Shelly non valido ⚠️",
    shelly_not_configured: "Dispositivo non configurato correttamente ⚠️",
    shelly_unreachable: "Shelly Cloud non raggiungibile 📡",
    shelly_bad_auth: "Auth Key rifiutata da Shelly Cloud 🔑",
    shelly_device_not_found: "Device ID non trovato su Shelly Cloud ❓",
    shelly_error: "Errore Shelly Cloud ({status})",
  },
  en: {
    badge: "Entry Control",
    locked_title: "Access code",
    locked_hint: "Enter the code you were given.",
    locked_button: "Enter",
    locked_error: "Wrong code ❌",
    locked_expired: "Session expired: please enter the access code again.",
    choose_title: "Select entrance",
    sequence_done: "All open! Welcome",
    instructions_title: "What to do",
    open_now: "Open now",
    open_verify: "Check and open",
    back: "Back",
    pin_title: "PIN for {name}",
    pin_placeholder: "••••",
    opening: "Opening…",
    connection_error: "Connection error.",
    emergency: "📞 Immediate assistance",
    language_selector: "Select language",
    languages_available: "Available languages",
    no_doors_title: "No doors configured",
    no_doors_hint: "Open {setup} to configure your devices.",
    door_opened: "{name} open! ✅",
    door_not_found: "Door not found",
    pin_wrong: "Wrong PIN ❌",
    bad_request: "Invalid request.",
    shelly_bad_server: "Invalid Shelly server ⚠️",
    shelly_not_configured: "Device not configured correctly ⚠️",
    shelly_unreachable: "Shelly Cloud unreachable 📡",
    shelly_bad_auth: "Auth Key rejected by Shelly Cloud 🔑",
    shelly_device_not_found: "Device ID not found on Shelly Cloud ❓",
    shelly_error: "Shelly Cloud error ({status})",
  },
  de: {
    "badge": "Zugangskontrolle",
    "locked_title": "Zugangscode",
    "locked_hint": "Geben Sie den erhaltenen Code ein.",
    "locked_button": "Eintreten",
    "locked_error": "Falscher Code ❌",
    "locked_expired": "Sitzung abgelaufen: Bitte geben Sie den Zugangscode erneut ein.",
    "choose_title": "Eingang auswählen",
    "sequence_done": "Alles geöffnet! Willkommen",
    "instructions_title": "So funktioniert es",
    "open_now": "Jetzt öffnen",
    "open_verify": "Prüfen und öffnen",
    "back": "Zurück",
    "pin_title": "PIN für {name}",
    "pin_placeholder": "••••",
    "opening": "Wird geöffnet…",
    "connection_error": "Verbindungsfehler.",
    "emergency": "📞 Soforthilfe",
    "language_selector": "Sprache auswählen",
    "languages_available": "Verfügbare Sprachen",
    "no_doors_title": "Keine Eingänge eingerichtet",
    "no_doors_hint": "Öffnen Sie {setup}, um die Geräte einzurichten.",
    "door_opened": "{name} geöffnet! ✅",
    "door_not_found": "Eingang nicht gefunden",
    "pin_wrong": "Falsche PIN ❌",
    "bad_request": "Ungültige Anfrage.",
    "shelly_bad_server": "Ungültiger Shelly-Server ⚠️",
    "shelly_not_configured": "Gerät nicht korrekt eingerichtet ⚠️",
    "shelly_unreachable": "Shelly Cloud nicht erreichbar 📡",
    "shelly_bad_auth": "Auth Key von Shelly Cloud abgelehnt 🔑",
    "shelly_device_not_found": "Device ID in Shelly Cloud nicht gefunden ❓",
    "shelly_error": "Shelly-Cloud-Fehler ({status})"
  },
  fr: {
    "badge": "Contrôle des accès",
    "locked_title": "Code d’accès",
    "locked_hint": "Saisissez le code qui vous a été communiqué.",
    "locked_button": "Entrer",
    "locked_error": "Code incorrect ❌",
    "locked_expired": "Session expirée : saisissez à nouveau le code d’accès.",
    "choose_title": "Sélectionnez l’entrée",
    "sequence_done": "Tout est ouvert ! Bienvenue",
    "instructions_title": "Comment faire",
    "open_now": "Ouvrir maintenant",
    "open_verify": "Vérifier et ouvrir",
    "back": "Retour",
    "pin_title": "Code PIN pour {name}",
    "pin_placeholder": "••••",
    "opening": "Ouverture en cours…",
    "connection_error": "Erreur de connexion.",
    "emergency": "📞 Assistance immédiate",
    "language_selector": "Choisir la langue",
    "languages_available": "Langues disponibles",
    "no_doors_title": "Aucune entrée configurée",
    "no_doors_hint": "Ouvrez {setup} pour configurer les appareils.",
    "door_opened": "{name} est ouvert ! ✅",
    "door_not_found": "Entrée introuvable",
    "pin_wrong": "Code PIN incorrect ❌",
    "bad_request": "Demande non valide.",
    "shelly_bad_server": "Serveur Shelly non valide ⚠️",
    "shelly_not_configured": "Appareil mal configuré ⚠️",
    "shelly_unreachable": "Shelly Cloud est inaccessible 📡",
    "shelly_bad_auth": "Auth Key refusée par Shelly Cloud 🔑",
    "shelly_device_not_found": "Device ID introuvable sur Shelly Cloud ❓",
    "shelly_error": "Erreur Shelly Cloud ({status})"
  },
  es: {
    "badge": "Control de accesos",
    "locked_title": "Código de acceso",
    "locked_hint": "Introduce el código que has recibido.",
    "locked_button": "Entrar",
    "locked_error": "Código incorrecto ❌",
    "locked_expired": "La sesión ha caducado: vuelve a introducir el código de acceso.",
    "choose_title": "Selecciona la entrada",
    "sequence_done": "¡Todo abierto! Bienvenido",
    "instructions_title": "Cómo hacerlo",
    "open_now": "Abrir ahora",
    "open_verify": "Verificar y abrir",
    "back": "Atrás",
    "pin_title": "PIN para {name}",
    "pin_placeholder": "••••",
    "opening": "Abriendo…",
    "connection_error": "Error de conexión.",
    "emergency": "📞 Asistencia inmediata",
    "language_selector": "Seleccionar idioma",
    "languages_available": "Idiomas disponibles",
    "no_doors_title": "No hay entradas configuradas",
    "no_doors_hint": "Abre {setup} para configurar los dispositivos.",
    "door_opened": "¡{name} está abierta! ✅",
    "door_not_found": "Entrada no encontrada",
    "pin_wrong": "PIN incorrecto ❌",
    "bad_request": "Solicitud no válida.",
    "shelly_bad_server": "Servidor Shelly no válido ⚠️",
    "shelly_not_configured": "El dispositivo no está configurado correctamente ⚠️",
    "shelly_unreachable": "No se puede acceder a Shelly Cloud 📡",
    "shelly_bad_auth": "Shelly Cloud ha rechazado la Auth Key 🔑",
    "shelly_device_not_found": "Device ID no encontrado en Shelly Cloud ❓",
    "shelly_error": "Error de Shelly Cloud ({status})"
  },
  nl: {
    "badge": "Toegangscontrole",
    "locked_title": "Toegangscode",
    "locked_hint": "Voer de code in die u hebt ontvangen.",
    "locked_button": "Doorgaan",
    "locked_error": "Onjuiste code ❌",
    "locked_expired": "De sessie is verlopen: voer de toegangscode opnieuw in.",
    "choose_title": "Kies een ingang",
    "sequence_done": "Alles is open! Welkom",
    "instructions_title": "Wat moet u doen",
    "open_now": "Nu openen",
    "open_verify": "Controleren en openen",
    "back": "Terug",
    "pin_title": "Pincode voor {name}",
    "pin_placeholder": "••••",
    "opening": "Bezig met openen…",
    "connection_error": "Verbindingsfout.",
    "emergency": "📞 Directe hulp",
    "language_selector": "Taal kiezen",
    "languages_available": "Beschikbare talen",
    "no_doors_title": "Geen ingangen ingesteld",
    "no_doors_hint": "Open {setup} om de apparaten in te stellen.",
    "door_opened": "{name} is geopend! ✅",
    "door_not_found": "Ingang niet gevonden",
    "pin_wrong": "Onjuiste pincode ❌",
    "bad_request": "Ongeldig verzoek.",
    "shelly_bad_server": "Ongeldige Shelly-server ⚠️",
    "shelly_not_configured": "Apparaat is niet correct ingesteld ⚠️",
    "shelly_unreachable": "Shelly Cloud is niet bereikbaar 📡",
    "shelly_bad_auth": "Auth Key geweigerd door Shelly Cloud 🔑",
    "shelly_device_not_found": "Device ID niet gevonden in Shelly Cloud ❓",
    "shelly_error": "Shelly Cloud-fout ({status})"
  }

};

/** Nome della lingua nella lingua stessa, per il selettore. */
export const LANGUAGE_LABELS = { it: "Italiano", en: "English", de: "Deutsch", fr: "Français", es: "Español", nl: "Nederlands" };
export const LANGUAGE_FLAGS = { it: "🇮🇹", en: "🇬🇧", de: "🇩🇪", fr: "🇫🇷", es: "🇪🇸", nl: "🇳🇱" };

export function isLanguage(value) {
  return LANGUAGES.includes(value);
}

/** Traduce una chiave, sostituendo i segnaposto {nome}. */
export function t(lang, key, params) {
  const table = STRINGS[isLanguage(lang) ? lang : DEFAULT_LANGUAGE];
  let text = table[key] ?? STRINGS[DEFAULT_LANGUAGE][key] ?? key;
  if (params) {
    for (const name of Object.keys(params)) {
      text = text.split("{" + name + "}").join(String(params[name]));
    }
  }
  return text;
}

/**
 * Sceglie la lingua da usare: preferenza esplicita (?lang=), poi header
 * Accept-Language, poi lingua predefinita della configurazione.
 * `available` limita la scelta alle lingue attivate dall'amministratore.
 */
export function resolveLanguage({ explicit, acceptLanguage, fallback, available }) {
  const allowed = Array.isArray(available) && available.length ? available : LANGUAGES;
  const preferred = isLanguage(fallback) && allowed.includes(fallback) ? fallback : allowed[0];

  if (isLanguage(explicit) && allowed.includes(explicit)) return explicit;

  if (acceptLanguage) {
    const ranked = String(acceptLanguage)
      .split(",")
      .map((part) => {
        const [tag, ...rest] = part.trim().split(";");
        const quality = rest.find((piece) => piece.trim().startsWith("q="));
        return {
          code: tag.trim().toLowerCase().split("-")[0],
          weight: quality ? parseFloat(quality.split("=")[1]) || 0 : 1,
        };
      })
      .sort((a, b) => b.weight - a.weight);
    for (const entry of ranked) {
      if (allowed.includes(entry.code)) return entry.code;
    }
  }

  return preferred;
}

/**
 * Estrae un testo localizzato da un campo { it, en }, con ricadute
 * successive per non lasciare mai l'ospite davanti a un campo vuoto.
 */
export function pickText(field, lang, fallback) {
  if (!field) return "";
  if (typeof field === "string") return field;
  const order = [lang, fallback, DEFAULT_LANGUAGE, ...LANGUAGES];
  for (const code of order) {
    if (code && typeof field[code] === "string" && field[code].trim()) return field[code].trim();
  }
  return "";
}
