# Alliance Command Center · LADG

Prima base funzionante prevista: accesso Supabase, dashboard, elenco membri, ricerca, filtri, modifica, attivazione/disattivazione e potenza tattica da 1 a 5.

## Configurazione
1. Apri `config.js`.
2. Inserisci il **Project URL** Supabase in `SUPABASE_URL`.
3. Inserisci la chiave pubblica **publishable** oppure la vecchia chiave **anon** in `SUPABASE_ANON_KEY`.
4. Non inserire mai `service_role` o una secret key nel frontend.
5. Pubblica i file su GitHub Pages tramite HTTPS.

Esempio di formato (valori fittizi):
```js
window.APP_CONFIG = {
  SUPABASE_URL: "https://xxxxxxxx.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_xxxxxxxxx"
};
```

## Accesso
L'app usa email e password già creati in Supabase Authentication. La registrazione pubblica non è esposta nell'interfaccia. Per autorizzare altri responsabili, crea i loro utenti in Supabase Auth e aggiungi una riga in `alliance_memberships` con il ruolo appropriato. Le policy RLS del database restano la barriera di sicurezza.

## Nota sulla sicurezza
La chiave publishable/anon è destinata all'uso nel browser. La sicurezza dei dati dipende dalle policy Row Level Security (RLS) e dai permessi già impostati nel database. Non disattivare RLS. Il frontend non contiene né richiede la chiave `service_role`.

## Stato
Le voci Iscrizioni, Formazioni DS, Storico e Stats sono segnaposto dichiarati come "In arrivo", non funzionalità già implementate. Verificare login e CRUD dei membri con un utente autorizzato prima di inserire dati reali.
