# ACC — Addendum alla continuità tecnica: Iscrizioni DS v0.2.1

**Data:** 31 ottobre 2026 (Europe/Rome)  
**Ambito:** solo Supabase di prova `acc-test` e branch GitHub `test/acc-phase4-ranghi-r1-r5`  
**Documento principale:** `docs/CONTINUITA_TECNICA_ACC.md`, rev. 1.28. Questo addendum ne aggiorna lo stato DS dopo i test e sostituisce le precedenti dichiarazioni «migrazione non applicata».

## Stato verificato

- Migrazione **applicata con successo soltanto a `acc-test`**: `acc_ds_week_schedule_registrations_v021_test_20261031` (versione registrata `20261030232655`).
- Tabelle presenti: `acc_ds_week_schedule`, `acc_ds_registrations`, `acc_ds_week_locks`.
- Tutte e tre hanno **Row Level Security attiva**; sette policy complessive, rispettivamente tre, tre e una.
- **Zero righe DS** nelle tre tabelle, alla verifica successiva alla migrazione.
- La nuova build frontend **non è stata distribuita** sullo staging; produzione, GitHub `main` e GitHub Pages **non modificati**.

## Cosa è stato collaudato

- Prima della migrazione, SQL in transazioni annullate (`ROLLBACK`): creazione schema, comportamento R5/R4/R3/R1, isolamento fra alleanze.
- Per la prova positiva di iscrizione è stato usato un **orologio di test simulato**, solo nella transazione annullata: inserimento e aggiornamento per un R3 associato al proprio giocatore; divieto di modifica di un altro giocatore; immutabilità del timestamp; impossibilità di cambiare gli orari dopo la prima iscrizione.
- Le prove con claim simulati non sono test Supabase Auth/JWT reali.
- Un successivo tentativo di prova DML sullo schema installato è stato bloccato dai controlli della connessione: **non dichiararlo superato**.

## Prossimi passaggi e vincoli

1. Collaudare con login Auth reali R1/R3/R4/R5 e richieste API sul progetto di prova, verificando anche i divieti di accesso fra alleanze.
2. Provare iscrizioni nella finestra di apertura del server, verificando timestamp, aggiornamento e concorrenza, senza alterare dati preesistenti.
3. Verificare e approvare separatamente l'integrazione del frontend in staging; non distribuire in produzione prima di collaudo completo.

**Fonte privata di dettaglio:** `ACC_DS_REPORT_MIGRAZIONE_ACC_TEST_2026_10_31.md` nella Library del progetto.

**Versionamento:** documento additivo indipendente per evitare il reinvio completo del documento principale di 68 KB; il documento principale rimane alla rev. 1.28 fino a un aggiornamento distinto verificato.
