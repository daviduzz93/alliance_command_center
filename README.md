# Alliance Command Center v0.7.1 — multi-alleanza

Questa versione aggiunge il flusso registrazione, creazione alleanza, scelta server (solo durante la creazione), ingresso tramite codice invito e dashboard con i quattro menu principali.

## Prima di pubblicare
1. Conserva una copia dei file attualmente pubblicati.
2. Copia i valori reali di `SUPABASE_URL` e della chiave publishable/anon dal `config.js` attuale nel nuovo `config.js`. Non usare mai `service_role` o una secret key.
3. Verifica che le tre funzioni SQL siano presenti (il controllo con `to_regprocedure` restituisce `true`).
4. Carica i cinque file nella root del repository GitHub, sovrascrivendo quelli precedenti, e attendi GitHub Pages.
5. Testa prima con un account di prova e un'alleanza temporanea, non con dati reali.

## Note
- L'utente che crea un'alleanza diventa `owner`.
- L'ingresso con invito assegna il ruolo `viewer` (sola lettura).
- Il codice invito viene creato dalla funzione SQL quando si crea un'alleanza. La schermata invito consente all'Owner di generare un nuovo codice; il precedente viene disattivato.
- I quattro moduli sono ancora scheletri UI, non funzionalità operative.
- L'utente già associato a LADG sul server 2010 dovrebbe entrare direttamente nella dashboard.
- Se Supabase Auth richiede conferma email, l'utente dovrà confermare l'indirizzo prima di poter accedere.


## Version 0.4: design system foundation

- `styles.css` now starts with centralized design tokens for colors, spacing, radii and text.
- `theme.js` is a small, isolated theme service; the main app does not implement theme persistence itself.
- Four dark palettes are available: Command (default), Midnight, Emerald and Violet.
- Theme choice is stored locally in the current browser. It is not yet synchronized across devices or saved to the Supabase profile.
- This is the first refactoring step, not a full rewrite of the authentication and module code. The next safe step is to split auth, localization, navigation and module logic into separate files while preserving the existing Supabase RPC contract.
- Do not run SQL migrations for this UI update.


## Versione 0.6.1 — navigazione e identità visiva

- Riordinato il menu: Home, Membri, Gestione DS, Gestione Treni, Notifiche, Guide, Impostazioni.
- Membri è una sezione autonoma, non un sottomenu della Desert Storm.
- Selettori lingua con bandiere per italiano, inglese e francese nella schermata di accesso, nella dashboard e nelle impostazioni.
- Introdotte intestazioni descrittive e schede coerenti con il riferimento visivo approvato.
- Aggiornato il numero di versione nella UI e nella documentazione.
- I moduli DS, Membri, Treni, Notifiche e Guide restano segnaposto UI in questa versione; non sono state eseguite migrazioni SQL né modificate le tabelle Supabase.

## Pubblicazione

Mantieni `config.js` con l'URL Supabase e la chiave publishable/anon già utilizzati. Pubblica i file del pacchetto nella root del repository GitHub, sostituendo quelli della versione precedente solo dopo aver conservato una copia locale. Esegui un test di accesso prima di considerare la pubblicazione verificata.


## v0.7.1
- Barra superiore mantenuta su una sola riga su desktop e mobile.
- Hamburger sempre visibile nella barra superiore quando il menu laterale è chiuso; nascosto solo mentre il menu è aperto.
- Pulsante Indietro disponibile in tutte le sezioni tranne Home e login.
- Titolo e descrizione dedicati alla personalizzazione dello stemma in italiano, inglese e francese.

## v0.7.0
- Barra superiore e navigazione consolidate.
- Hamburger non resta in primo piano quando il menu laterale è aperto; la X chiude il pannello.
- Stemma personalizzabile con anteprima e rimozione. In questa build lo stemma è salvato localmente nel browser per ciascuna alleanza; la condivisione tra membri richiede uno storage condiviso Supabase da configurare separatamente.
- Normalizzazione delle sequenze di newline visibili nei testi.
