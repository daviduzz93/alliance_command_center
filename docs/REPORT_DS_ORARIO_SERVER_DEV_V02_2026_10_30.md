# ACC — DS Iscrizioni DEV v0.2: ora server fissa, fasce settimanali configurabili

**Data:** 30/10/2026 — **Stato:** build DEV privata. **NESSUN deploy o migrazione applicata.**

## Rettifica del calendario

La precedente v0.1 assumeva `Europe/Rome`, chiusura giovedì alle 03:00 e fasce 12:00/21:00 italiane. **Queste assunzioni sono superate dalla v0.2**: il gioco usa normalmente ora server fissa **UTC−02:00**, indipendente dall'ora legale europea, ma gli slot Desert Storm non sono recuperabili in modo affidabile da un catalogo `numero server → slot`.

R4/R5 configurano le due fasce DS **per alleanza e per settimana (venerdì)**, utilizzando l'orario mostrato in Last War. È configurabile anche l'offset UTC di quella settimana, se il server richiede un'eccezione. L'interfaccia mostra **ora server e conversione nell'ora locale** del giocatore.

**Periodo di iscrizione:** lunedì 00:00 → giovedì 00:00, **orario del server**. Con UTC−02:00 fisso, in Italia il reset di giovedì avviene alle 03:00 CET e alle 04:00 CEST. Gli identificativi interni passano da `12/21` a `a/b`, per evitare di attribuire loro ore universali.

## Implementazione e sicurezza previste

- `acc_ds_week_schedule` registra `alliance_id,event_friday,server_utc_offset_minutes,slot_a_time,slot_b_time`: un **snapshot per venerdì**, senza riscrivere retroattivamente i turni passati.
- R4/R5 impostano la settimana prima di raccogliere risposte; slot distinti e non null; nessuna iscrizione prima della configurazione.
- L'SQL preview aggiunge `acc_ds_registrations` (scelte `a`, `b`, `both`, `none`) e `acc_ds_week_locks`, con RLS e trigger server-side; trigger e lock transazionale prevengono modifiche dei turni dopo la prima iscrizione, dopo scadenza o finalizzazione. Preservati gli snapshot degli ex giocatori.
- Corrette anche le condizioni RLS di correlazione esplicita all'alleanza sulla tabella iscrizioni.
- **Non applicare la vecchia SQL v0.1.** La preview v0.2 è archiviata separatamente e va revisionata prima di qualsiasi migrazione. In `acc-test` nessuna tabella `acc_ds_*` risulta presente (sola lettura).

## Test offline

- **34/34** prove calendario (offset server, periodi settimanali, DST Italia).
- **47/47** prove browser DS (mock Supabase), incluse UI configurazione slot, ora italiana invernale/estiva, R1/R4, 4 viewport × 5 lingue.
- **46/46** regressioni Membri (mock).
- **1.684/1.684** regressioni generali eseguite con successo prima dell'ultimo ritocco di etichetta server; **58/58** smoke test mirati di navigazione dopo quel ritocco. Il nuovo tentativo di matrice completa è andato in timeout senza riportare fail specifici, quindi non dichiararlo nuovo PASS integrale.
- Sintassi JavaScript e core test PASS. **Zero test REST/Auth/JWT reali**.

## Materiale SOLO nella Library privata

- `ACC_DS_Iscrizioni_OrarioServer_DEV_v0_2_PRIVATO.zip` (codice ACC completo, nuovi test, SQL preview e report)
- `ACC_REPORT_DS_ORARIO_SERVER_DEV_v0_2.md`
- `ACC_DS_ISCRIZIONI_ORARIO_SERVER_SQL_NON_APPLICATA_v0_2.sql`

SHA256 ZIP `69ad48c4f7cf30572ad1c469fd3fa11c552f65f1061319af54d59f92f2c68c83`.

## Da fare

Review schema SQL su `acc-test`, applicazione test autorizzata, verifiche RLS con utenti/JWT reali e browser Work su staging privato; poi collegamento a Formazioni DS con vincolo massimo un team per persona. **Nessun cambio a GitHub main/Pages, staging, produzione Supabase, Fase 4 v0.8.4.1 o Membri v0.3.3**.

Fonti: https://lastwarsurvival.com/guides/event-calendar-reset-times ; https://www.lastwartutorial.com/desert-storm/ ; https://www.atreusgaming.com/lastwar/alliance_scheduler.html .
