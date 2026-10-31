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

## Formazioni DS DEV v0.1 — laboratorio privato (31/10/2026)

- **Nuova candidata privata completa**: `ACC_Formazioni_DS_Laboratorio_DEV_v0_1_PRIVATO.zip` nella Library ACC, basata su Iscrizioni v0.2.3. Rapporto: `ACC_FORMATIONS_DEV_v0_1_REPORT.md`.
- **Integrazione UI reale nella copia privata dell'app**: pannello laboratorio Formazioni DS disponibile solo a sessioni con permesso tecnico `owner/manager`. Carica orari, elenco giocatori e iscrizioni della settimana dal progetto di test, senza modificare alcun dato.
- **Bozze temporanee**: generazione A/B con 20 titolari + 10 riserve di default, un solo evento per giocatore incluso come riserva, rispetto delle disponibilità, Nucleo/Forti garantiti salvo conflitti dichiarati, elenco disponibili non selezionati. Confronto sommario T1 e mediana dei titolari; scambi euristici solo fra giocatori flessibili dello stesso gruppo, non predizioni tattiche.
- **Classificazioni/precedenti esclusi**: input manuali soltanto in memoria della sessione R4/R5. Nessun backend, nessun salvataggio o accesso a queste informazioni riservate per R1–R3. Storico reale, alternanza Forti, strategie per fasi e snapshot non ancora integrati.
- **Test mock/locali PASS**: motore 9.686 verifiche con 65 scenari sintetici; browser Formazioni 84 controlli (4 viewport, 5 lingue), DS 59/59, calendario 39/39, Membri 46/46, matrice generale 1.684/1.684, sintassi/core/race PASS.
- **Nessuna modifica a Supabase acc-test, produzione, GitHub main, Pages o staging**; codici privati conservati esclusivamente in Library. Il laboratorio **NON** genera formazioni ufficiali né può essere finalizzato.
- **Prossimo lavoro**: schema dati/RLS privato R4/R5 e finalizzazione transazionale entro mercoledì ora server, integrazione piano tattico per fasi e collaudo Auth/JWT reale in Work quando disponibile.

## Formazioni DS DEV v0.2 — persistenza privata proposta (31/10/2026)

- Build completa privata `ACC_Formazioni_DS_Persistenza_DEV_v0_2_PRIVATO.zip` e rapporto `ACC_FORMATIONS_DEV_v0_2_REPORT.md` archiviati nella **Library ACC**, senza pubblicazione dei sorgenti.
- Nuovi comandi R4/R5 `Salva gruppi` e `Salva bozza A/B` nella copia frontend; lettura e ricaricamento di bozza già salvata; conflitti di revisione. In assenza di schema backend, comandi non attivi e generazione solo in memoria.
- La proposta `ACC_DS_FORMAZIONI_PERSISTENZA_PREVIEW_NON_APPLICATA_v0_2.sql` è **soltanto nella Library privata e nello ZIP**. Schema previsto: gruppi officer-only con audit, bozze settimanali R4/R5 con controlli DB su unicità, disponibilità, capienza, orario e revisioni; nessuna finalizzazione o storico ufficiale.
- SQL **verificata mediante DDL in ROLLBACK su acc-test**. Test PostgreSQL RLS con claim e ruoli **simulati**, R4 scrive/audit, revisioni stale negate, viewer non può leggere o inserire gruppi: PASS. **Non test JWT Auth reale**, non confermata scrittura reale delle bozze in finestra aperta.
- Test locali: motore 9.686/9.686, Formazioni browser 84/84, persistenza mock 15/15, calendario 39/39, DS 59/59, Membri 46/46, matrice UI 1.684/1.684, core e race PASS.
- **Postflight acc-test:** nessuna nuova tabella Formazioni installata, iscrizioni/orari/locks 0 righe; produzione, GitHub `main`, Pages e staging invariati. Prima dell'eventuale deploy servono review SQL, approvazione della migrazione test, collaudo JWT/RLS e scelta dell'ora precisa del blocco di mercoledì in ora server.

## Strategie e contromisure DS DEV v0.4 — build privata, 31 ottobre 2026

- Preparata e archiviata **solo in Library privata** la build `ACC_Formazioni_DS_Strategie_DEV_v0_4_PRIVATO.zip`, rapporto `ACC_DS_Strategie_v0_4_RAPPORTO.md`, catalogo JSON `ACC_DS_Strategie_v0_4_CONFIG.json`. La v0.4 continua Formazioni DEV v0.2 con integrazione tattica sperimentale non rilasciata della v0.3.
- **Otto playbook** per DS A/B: Equilibrata, Difesa ospedali, Pressione raffinerie, Logoramento, Dominio economico, Silo ritardato, Anti-Silo, Disturbo mobile. Quote per fase (0–10, 10–25, 25–30 minuti) con 20 incarichi attivi unici per fase; riserve escluse.
- **Contromisura manuale distinta per DS A e B**: nessuna / Silo ritardato / Anti-Silo. Si sovrascrivono soltanto le quote degli ultimi cinque minuti. Cambio strategia invalida la bozza tattica precedente finché non è rigenerata. Non si inferiscono dati live di punteggio/possesso Silo; R4/R5 devono valutare in gioco la convenienza. Coordinatore tattico manuale scelto solo fra i titolari, senza consumare una posizione extra; preferenze tattiche esplicite, non dedotte da T1.
- **Riservatezza interfaccia:** il pannello resta limitato al permesso tecnico owner/manager; al passaggio a un'altra alleanza come ufficiale vengono cancellati da memoria/schermata i dati di quella precedente. Controlli RLS/backend ancora da provare con JWT reali.
- **Regressioni complete PASS** in ambiente locale/mock: tactical engine 629; browser playbooks 100 (4 viewport, 5 lingue, ruoli e cambio alleanza); Formazioni engine 9.686; Formazioni browser 84; persistenza mock 15; DS browser 59; Membri 46; calendario 39; matrice generale 1.684; core, sintassi JS e race PASS. Archivio ZIP 60 file verificato.
- **Non è stato applicato alcun SQL**, non sono stati scritti dati su Supabase, non sono state attivate finalizzazioni o assegnazioni ufficiali, nessun deploy su staging/produzione; `main` e Pages invariati. Futura integrazione tattica con storico, mappe/ruoli e verifica Auth reale restano aperte.
- Guide community consultate per le ipotesi tattiche: Last War Codex, Last War Tutorial e MrKrox; valori/strategie non sono universali, verificare in gioco.

## Mappa tattica DS DEV v0.5 — integrazione privata (31 ottobre 2026)

- Build completa e privata `ACC_Formazioni_DS_MappaTattica_DEV_v0_5_PRIVATO.zip`, rapporto `ACC_DS_MAPPA_INTEGRATA_v0_5_REPORT.md` e screenshot dimostrativo nella **Library ACC**. Basata su Formazioni + Strategie DEV v0.4, non rilasciata.
- **Nuova mappa collegata alle formazioni e agli otto playbook**: DS A/B e tre fasi (0–10, 10–25, 25–30 minuti), numeri per edificio su mappa annotata v1.6.3, click per nomi titolari; mobile/Strikers e raccoglitori casse in elenco separato senza coordinate inventate; riserve senza incarichi attivi.
- Mappa ricavata dalla versione **v1.6.3 fornita dall'utente**, coordinate sorgente 2047 × 1198. Solo `info`, `hospital_4` e `science` erano nominati e confermati dal giocatore; numeri ospedali 1/2/3 ancora provvisori, avviso presente in UI e PNG.
- **Esportazione PNG per una singola fase** con mappa, nicknames, incarichi, riserve e avvisi; esclusi gruppi riservati, T1, email e UUID. Nessuna pubblicazione o finalizzazione automatica. I cambiamenti a piano, formazione, permessi o alleanza invalidano le viste obsolete. UI in cinque lingue, mobile con scorrimento interno.
- Test locali/mock PASS: coordinate/privacy 116, browser mappa ed export 116, tactical 629, browser playbooks 100, formazioni engine 9.686, browser formazioni 84, persistenza browser 15, calendario 39, DS browser 59, membri 46, matrice UI 1.684; race account/roster e sintassi core PASS. La prima esecuzione cumulativa è scaduta per timeout; la matrice UI e i race check ripetuti separatamente hanno superato.
- **Nessuna nuova migrazione Supabase, nessun deploy**; staging, produzione, GitHub main e Pages invariati. L'autenticazione Supabase Auth con JWT reali e la finalizzazione restano da testare; lo schema delle bozze Formazioni NON è ancora installato.
