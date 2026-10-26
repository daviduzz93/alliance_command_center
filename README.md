# Alliance Command Center v0.2 — multi-alleanza

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
