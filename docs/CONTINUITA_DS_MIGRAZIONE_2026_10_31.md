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

## Aggiornamento DEV DS v0.2.2 — 31 ottobre 2026

- Preparata e archiviata in **Library privata** la build `ACC_DS_Iscrizioni_OrarioServer_DEV_v0_2_2_PRIVATO.zip` e il rapporto `ACC_DS_REPORT_BUILD_v0_2_2.md`.
- Corretti i **contatori per fascia**: A e B includono le risposte `both`; `both` rimane una categoria informativa sovrapposta, non equivale a due assegnazioni. Aggiunta nota esplicativa nelle cinque lingue.
- Il selettore **offset orario** usa incrementi di 15 minuti, coerenti con i vincoli SQL.
- Test locali mock PASS: calendario 37/37, browser DS 51/51, Membri 46/46, regressione interfaccia 1.684/1.684, core/JS/race checks PASS.
- Nessuna migrazione nuova, nessun deploy né modifica a `main` o produzione. Rimangono necessari i test con JWT Auth reali e salvataggi verificati su `acc-test`.

## Aggiornamento DEV DS v0.2.3 — 31 ottobre 2026

- **Build privata conservata in Library:** `ACC_DS_Iscrizioni_OrarioServer_DEV_v0_2_3_PRIVATO.zip` e report `ACC_DS_REPORT_BUILD_v0_2_3.md`.
- **Correzione concorrenza client:** prima risposta con INSERT, aggiornamento di iscrizione o orari tramite UPDATE condizionato al `updated_at` precedentemente letto. Se la versione è cambiata o l'inserimento è duplicato, la UI mostra un conflitto e ricarica i dati. Nessuna scrittura cieca tramite upsert.
- **Autorizzazioni UI:** ufficiali determinati dal ruolo tecnico `owner/manager` e non dal rango R4/R5 visualizzato, che da solo non conferisce permessi.
- **Riepilogo:** include la nota sui conteggi inclusivi `A/B` per i disponibili a entrambi.
- **Test locali con mock:** calendario 39/39; browser DS 59/59, Membri 46/46, matrice responsive/lingue/temi 1.684/1.684; controlli sintassi, core e race PASS.
- **Acc-test:** confermata in sola lettura la presenza delle tabelle/policy e di `updated_at` sulle due tabelle modificabili. Nessun deploy e nessuna nuova migrazione.
- **Blocco prima del rilascio:** test end-to-end con JWT Supabase Auth reali, due client concorrenti e scritture nella finestra di iscrizione effettiva. Non dichiarare la build pronta per produzione.
