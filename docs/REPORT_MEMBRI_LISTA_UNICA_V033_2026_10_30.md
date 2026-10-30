# ACC — Membri v0.3.3: protezione dalle risposte fuori ordine

**Data:** 30 ottobre 2026. **Stato:** build privata DEV **non pubblicata**, su base `ACC_Membri_Lista_Unica_DEV_v0_3_2_PRIVATO.zip`.

## Risultato concreto
- In `roster.js` è stato riprodotto e corretto un bug: due chiamate alla lettura `alliance_members` per la stessa alleanza, con risposte invertite, lasciavano visualizzati dati obsoleti. Un contatore di richieste applica soltanto l'ultima risposta; `reset()` invalida le chiamate ancora in volo.
- In `app.js`, `acc_list_members_v2` ha analoga protezione tramite contatore; si invalida anche al cambio alleanza e alla disconnessione, evitando nickname/rango/collegamenti ACC superati.
- Nessuna modifica a SQL, database, RPC server, gestione ruolo R4/R5, impostazioni Auth o classificazione DS; lista unica Last War confermata.

## Validazioni
- Test differito roster: **FAIL prima della modifica, PASS dopo**.
- Test differito account ACC: **PASS** anche in caso di risposta vecchia completata dopo quella nuova.
- Sintassi JavaScript `app.js` e `roster.js`: PASS.
- `tests/check-core.cjs`: PASS.
- Test UI Membri offline con backend mock: **46/46 PASS**.
- Test matrice UI generali offline con backend mock: **1.684/1.684 PASS**.
- ZIP verificato byte-per-byte: 37 elementi, SHA256 `9735773f357e0e0b75e0769035a3a2fb441ed6882264e5d2de0e3fdbf27eff7c`.

## Library privata
- `ACC_Membri_Lista_Unica_DEV_v0_3_3_PRIVATO.zip`
- `ACC_REPORT_MEMBRI_LISTA_UNICA_v0_3_3.md`
- La checklist `ACC_CHECKLIST_COLLAUDO_REALE_MEMBRI_V032.md` rimane valida per i test Auth reali.

## Blocco e prossimo passaggio

Lo staging HTTPS protetto è accessibile al browser Work, non in questa conversazione. **Nessun test Auth/JWT REST con login reale** e **nessun deploy** sono stati effettuati in questa fase. Il passo successivo è usare Work per il solo collaudo autenticato sul sito di test, con autorizzazione per ogni eventuale aggiornamento dello staging. Non interferire con la fixture QA preesistente.

**Sicurezza:** zero modifiche allo schema `acc-test` migrato in v0.3; nessuna modifica a GitHub main, Pages, Supabase produzione o candidata Fase 4 v0.8.4.1. Non inserire gli ZIP privati nel repository GitHub pubblico.
