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

## Piano PNG completo DEV v0.6 — 31 ottobre 2026

- Preparata **candidata privata integrale** `ACC_Formazioni_DS_PianoCompleto_DEV_v0_6_PRIVATO.zip` (67 file), rapporto `ACC_DS_PIANO_COMPLETO_v0_6_REPORT.md` e **demo PNG reale** `ACC_DS_PIANO_COMPLETO_v0_6_DEMO.png`. Tutti conservati nella Library privata, non caricati nel repository pubblico.
- Nuovo pulsante **«Esporta piano completo (3 fasi)»** nel laboratorio mappa, indipendente per DS A/B. Genera un unico PNG con tre mappe (0–10, 10–25, 25–30), totali e nickname degli incaricati per ogni edificio, squadre mobili/casse elencate separatamente e riserve sotto. Rimane disponibile l'export di fase singola v0.5.
- Esempio esportato da Chromium con dati mock: **2047 × 6310 pixel**. Nickname e lista incarichi con adattamento delle righe per evitare troncamenti; nessuna T1, classificazione riservata, UUID/email o credenziale nell'esportazione. Identità/permessi/alleanza sono ricontrollati al termine del caricamento immagine; se cambiano il download non parte.
- Indicazione **BOZZA NON UFFICIALE** nel PNG; conferma posizioni sulla mappa v1.6.3 invariata, numerazione ospedali 1–3 ancora provvisoria. Cinque lingue; interfaccia smartphone.
- Test locali **PASS**: 121 unit map; 184 browser map con export PNG A/B e race cambio alleanza; tactical 629; browser playbooks 100; engine Formazioni 9686; browser Formazioni 84; persistenza mock 15; DS calendario 39; browser iscrizioni 59; browser Membri 46; matrice generale 1684; race account/roster, core/sintassi PASS.
- **No migrazioni Supabase, no scritture acc-test**, no staging/produzione/GitHub main/Pages. Nessuna finalizzazione o snapshot ufficiale. Collaudo con JWT Auth reali e ora precisa del blocco settimanale ancora aperti.

## Mappa DS v0.7 — nomi ufficiali e soli movimenti successivi (31/10/2026)

- Build integrale privata `ACC_Formazioni_DS_PianoMovimenti_DEV_v0_7_PRIVATO.zip` e report `ACC_DS_MAPPA_NOMI_E_MOVIMENTI_v0_7_REPORT.md` archiviati in Library ACC.
- Nomi edifici riportati **esattamente** dalla schermata utente: Oil Refinery 1/2, Info Center, Arsenal, Field Hospital 1/2/3/4, Nuclear Silo, Mercenary Factory, Science Hub. Eliminati marcatori numerici e denominazioni Our/Enemy dal componente e sincronizzato il catalogo tattico.
- PNG completo: Fase 1 lista completa; Fase 2 elenco **soli movimenti rispetto a Fase 1**; Fase 3 elenco **soli movimenti rispetto a Fase 2**. Confronto attraverso ID giocatore e codice incarico; Strikers/casse trattati come incarichi mobili. Le mappe delle tre fasi rimangono per orientamento; riserve alla fine.
- Test PASS: nomi e delta v0.7, map unit 121, map browser 184, tattiche 629, formazioni engine 9686, calendario 39, core, matrice UI 1684. ZIP verificato.
- Nessun deploy, nessuna scrittura o migrazione Supabase; staging, main, Pages e produzione invariati. Bozza non ufficiale in attesa di finalizzazione e collaudi Auth.

## Validazione piano DS DEV v0.8 — 31 ottobre 2026

- Candidata PRIVATA in Library `ACC_Formazioni_DS_ValidazionePiano_DEV_v0_8_PRIVATO.zip` e report `ACC_DS_VALIDAZIONE_EXPORT_v0_8_REPORT.md`; base v0.7, nessun deploy né modifiche DB.
- Prima del PNG completo delle tre fasi il client controlla: 20 titolari per fase, dieci riserve distinte, assenza di titolari duplicati o fra riserve, codici incarichi riconosciuti, e stessa identità dei 20 titolari nelle tre fasi. Cambi incarico consentiti, sostituzioni titolari/riserve ancora non modellate e quindi bloccate per prevenire incongruenze. L'export PNG singola fase resta invariato.
- Test PASS: nuovo validatore 10/10, mappa 121, browser mappa 184, engine Formazioni 9.686, strategie 629, UI 1.684, core/sintassi. ZIP verificato.
- **Non è una convalida ufficiale backend**; Auth con JWT reali, storico, sostituzioni autorizzate e finalizzazione restano da sviluppare. Supabase, GitHub main, staging e produzione invariati.

## Contromisure rapide DS DEV v0.9 (31/10/2026)

- Nuova candidata **privata**: `ACC_Formazioni_DS_ContromisureRapide_DEV_v0_9_PRIVATO.zip` e report `ACC_DS_CONTROMISURE_RAPIDE_v0_9_REPORT.md` archiviati nella Library ACC. Base v0.8.
- Pannello officer-only nel laboratorio mappa: lettura manuale della concentrazione avversaria, controllo Nuclear Silo e punteggio; proposta di **fino a due** trasferimenti condizionati da Strikers verso Oil Refinery 1/2, soltanto se verificati sul campo. DS A e DS B trattati separatamente; niente spostamenti automatici, nessuna modifica al piano originale, nessun invio al gioco.
- Il suggeritore legge la bozza della fase di riferimento; se manca una formazione valida da 20, si blocca; se mancano giocatori mobili, non inventa spostamenti. La reale disponibilità delle raffinerie e le posizioni live non sono note a ACC.
- Test locali PASS: quick advisor 12/12; mappa unit 121; mappa delta v0.7; validatore v0.8 10; playbook 629; engine Formazioni 9686; calendario 39; core; matrice generale browser 1684. ZIP 72 file, test integrità PASS.
- Limiti: nuova UI tradotta IT/EN (fallback IT per altre lingue), test Auth/JWT reale e browser specifico ancora necessari. No installazione SQL, no staging, no produzione, GitHub main e Pages invariati.

## Ordini rapidi DS DEV v1.0 — proposta non operativa (31/10/2026)

- Build **privata** `ACC_Formazioni_DS_OrdiniRapidi_DEV_v1_0_PRIVATO.zip`, rapporto `ACC_DS_ORDINI_RAPIDI_v1_0_REPORT.md` archiviati in Library. Base v0.9; nessun codice privato su GitHub.
- Schermata Contromisure: checkbox manuale **edificio critico sotto attacco**; sospende le proposte offensive, dà priorità alla verifica difensiva. Motore ora distingue priorità `hold`/`assess`/`intervene`.
- Nuovo testo chat breve, massimo **200 caratteri**, con domanda di verifica destinazione e messaggio `Altri fermi`; copia abilitata soltanto dopo checkbox manuale di verifica da parte dell'ufficiale. Nessun invio automatico in Last War, nessuna modifica della formazione o dei dati.
- **Sviluppo volutamente limitato:** al massimo due spostamenti suggeriti da gruppo mobile, non vengono svuotati automaticamente edifici critici. Nessun presunto dato live.
- Test locali: quick 18/18, mappa 121, strategie 629, calendario 39, UI mock 1684, core e sintassi JS PASS; ZIP 72 file integro. Non ancora test end-to-end browser Auth/JWT. Stringhe nuove IT/EN, fallback IT per altre lingue.
- Rimangono da progettare: coordinatore operativo live, cronologia decisioni, soglie di presidio configurabili, finalizzazione. Nessun deploy, SQL, cambi acc-test, staging, Pages, main o produzione.

## Live semplice DS DEV v1.1 (31/10/2026)

- Build privata `ACC_Formazioni_DS_LiveSemplice_DEV_v1_1_PRIVATO.zip`, report `ACC_DS_LIVE_SEMPLICE_v1_1_REPORT.md` nella Library ACC.
- Dalla v1.0: piano iniziale IMMUTABILE, stato locale distinto per DS A/B con copia delle assegnazioni *previste* e cronologia degli ordini **comunicati**. L'R4 verifica, usa «Copia e registra», e viene aggiornato lo stato previsto solo dopo copia riuscita; nessun controllo di effettivo movimento, né iter approvativo tra R4. Ordini obsoleti scartati.
- Avvertenza: stato SOLO in memoria pagina, non persistente e non condiviso; aggiornamenti si riferiscono alla fase 10–25; ancora non adatto a coordinamento sincrono tra ufficiali. Non confondere ordine comunicato con movimento eseguito.
- Test: 13 nuovi, quick 18, mappa 121/browser 184, validazione 10, motore 9686, playbook 629, UI 1684. ZIP integro. Nessuna modifica a SQL, Supabase, staging, produzione, main o Pages.

## Storico DS Live ed esito DEV v1.2 (31/10/2026)

- Pacchetto PRIVATO Library `ACC_Formazioni_DS_StoricoLiveEsiti_DEV_v1_2_PRIVATO.zip` e rapporto `ACC_DS_STORICO_LIVE_ESITI_v1_2_REPORT.md`.
- Modulo Live: snapshot immutabile del piano iniziale, assegnazioni previste aggiornate e log datato degli ordini dichiarati come comunicati. Selezione manuale **Vittoria/Sconfitta**. Stato separato per alleanza, settimana, DS A/B. Esportazione resoconto JSON.
- **Attenzione:** salvataggio soltanto in localStorage del browser, NON Supabase, NON storico condiviso. La ricarica richiede rigenerare esattamente lo stesso piano; se il fingerprint del piano cambia il registro non viene associato. Nessun controllo dell'esecuzione reale. Ancora senza formazione ufficiale finalizzata.
- Test locali PASS: storico 16, contromisure 18, live v1.1 13, mappa 121, validazione 10, playbook 629, formazioni 9686, calendario 39, UI 1684, core. Archivio ZIP integro.
- Prossimo passo backend da validare separatamente: snapshot formazioni e log append-only per evento, outcome, RLS e concorrenza via Supabase. Nessuna modifica SQL, staging, Pages, main o produzione.

## Storico condiviso DS v1.3 — preparazione NON applicata (31/10/2026)

- Preview privata `ACC_DS_StoricoCondiviso_PREVIEW_v1_3_PRIVATO.zip`, rapporto `ACC_DS_STORICO_CONDIVISO_v1_3_REPORT.md` conservati in Library ACC.
- Su acc-test (`tehijaphavnemchizzbm`) controllate **in sola lettura** le tabelle attuali: ancora assenti tabelle formazioni/storico ufficiale. SQL **NON APPLICATA** `sql/ACC_DS_STORICO_CONDIVISO_v1_3_PREVIEW_NON_APPLICATA.sql` definisce `acc_ds_battle_records` e `acc_ds_battle_orders`, RLS R4/R5, snapshot iniziale immutabile, ordini append-only, esito victory/defeat, contatore revisioni e vincoli evento A/B.
- Adapter opzionale `ds-shared-history.js` include load/create/update outcome ma **non è chiamato dal frontend**. La scrittura condivisa ordini non è ancora implementata: serve RPC transazionale per aggiornare expected_plan + append order atomicamente, con controllo revisione e autorizzazione, e test con account Auth reali, incluso isolamento altre alleanze.
- Regressioni locali PASS: shared adapter 6, storico locale 16, quick 18, live 13, core PASS; ZIP integro. Vecchia funzionalità localStorage v1.2 resta operativa.
- Non è una v1.3 attiva in produzione. Nessun deploy, nessuna migrazione neppure su acc-test, GitHub main/Pages/staging/produzione invariati.

## Storico atomico DS v1.4 — preview NON installata (31/10/2026)
- Pacchetto privato in Library: `ACC_DS_StoricoAtomico_PREVIEW_v1_4_PRIVATO.zip` e `ACC_DS_STORICO_ATOMICO_v1_4_REPORT.md`.
- RPC SQL proposta `public.acc_ds_record_live_order`: lock FOR UPDATE del record evento, controllo revision, autorizzazione ufficiali R4/R5, insert ordine append-only e update expected_plan nella stessa transazione; conflitti rifiutati. Adapter JS `recordOrder` + 9 test mock nuovi, 6 precedenti, 16 storico locale, 18 quick: PASS.
- **Nessuna modifica a Supabase** (test/prod), nessuna attivazione UI della RPC. Ancora da verificare RLS/JWT e conflitti con due utenti reali, revisioni outcome, vincoli e semantica JSON. Cronologia operativa resta localStorage come v1.2. Non descrivere come sincronizzato.
- Staging/main/Pages e produzione invariati.

## Security gate storico DS v1.5 — PREVIEW NON APPLICATA
- Build privata `ACC_DS_StoricoSicurezza_PREVIEW_v1_5_PRIVATO.zip`, rapporto `ACC_DS_STORICO_SICUREZZA_v1_5_REPORT.md` in Library.
- Rilevato blocco critico nella v1.4: grant diretti `UPDATE` a record e `INSERT` a ordini permettono di bypassare la transazione RPC; anche `expected_plan` veniva accettato dal client senza riconciliazione server-side. Non dichiarare sincronizzazione sicura.
- Hardening SQL di revisione preparato: revoca mutazioni dirette e accesso alla RPC vecchia, intenzionalmente non attiva la funzione live. Test statici e adapter PASS. Va prima riscritta RPC autorizzata, con validazione movimenti, audit RLS, conflitti e test autenticati cross-alliance.
- Nessuna migrazione applicata neppure su acc-test, nessun deploy. Storico locale ancora operativo. Non applicare SQL v1.4 senza correzioni.

## RPC storico DS v1.6 — REVIEW NON INSTALLATA (31/10/2026)
- Build PRIVATA Library: `ACC_DS_StoricoRPC_Sicura_PREVIEW_v1_6_PRIVATO.zip`; rapporto `ACC_DS_RPC_SICURA_v1_6_REPORT.md`.
- Script review `sql/ACC_DS_RPC_SICURA_v1_6_REVIEW_ONLY.sql`: revoca UPDATE record / INSERT ordini al client; nuova RPC SECURITY DEFINER con auth.uid + membership R4/R5, lock, revisione, verifica moves per singolo giocatore/fase ed elaborazione expected_plan sul server, log ordine atomico, prevenzione replay e blocco dopo outcome. Nuova RPC `acc_ds_set_battle_outcome` per Vittoria/Sconfitta con verifica concorrenza.
- Adapter JS usa solo delta nella RPC, esito via RPC; test mock e statici PASS. **Non ancora SQL runtime verificata su PostgreSQL, non applicata a acc-test**. La UI Live resta su localStorage, non sincronizzata. Prima del deploy: test JWT/RLS con due R4 + R1–R3 + alleanza diversa, controlli creazione snapshot, traduzione etichette in codici e integrazione frontend.
- Nessun deploy, nessuna modifica DB, main, Pages, staging o produzione.

## Storico DS v1.7 — creazione protetta, NON DEPLOYATA
- Build privata `ACC_DS_StoricoCreazioneProtetta_PREVIEW_v1_7_PRIVATO.zip`, rapporto `ACC_DS_CREAZIONE_PROTETTA_v1_7_REPORT.md`, entrambi in Library.
- Nuova RPC preparatoria `acc_ds_create_battle` con controllo membro R4/R5, 20 titolari identici nelle tre fasi e `initial_plan=expected_plan` alla creazione; revoca DML dirette sui registri. Adapter `ds-shared-history.js` aggiornato alla RPC, cinque suite shared PASS (static/mock).
- SQL in `sql/ACC_DS_CREAZIONE_PROTETTA_v1_7_REVIEW_ONLY.sql`, **non applicata neppure ad acc-test**. Integrazione Live ancora locale, nessun test Auth/JWT reale o concorrenza DB; occorre revisione cumulativa v1.3+v1.6+v1.7 prima di installare. Nessun cambiamento a produzione, staging, Pages e main.

## Storico DS v1.8 — SQL consolidata REVIEW ONLY
- Library privata: `ACC_DS_StoricoConsolidato_PREVIEW_v1_8_PRIVATO.zip`, `ACC_DS_STORICO_CONSOLIDATO_v1_8_REPORT.md`.
- `sql/ACC_DS_STORICO_CONSOLIDATO_v1_8_REVIEW_ONLY.sql` consolida tabelle v1.3 e RPC v1.6/v1.7 in una transazione, senza reintrodurre i GRANT diretti INSERT/UPDATE della v1.3 e senza vecchia RPC v1.4 insicura. Esito e ordini previsti con controllo della revisione.
- Test static/mock adapter PASS: shared-history 6, atomic 9, secure-v16, create-v17; ZIP 91 file integro.
- **NON ESEGUITA** SQL su PostgreSQL, **NON DEPLOYATA** e NON attiva nella UI. Ancora da validare JSON assignments del frontend, RLS e privilege definer, test JWT multi-utente, concorrenza. LocalStorage Live rimane modalità effettiva. Nessun cambiamento su acc-test, prod, staging o main.

## v1.9 — verifica schema e hardening JSON (31/10/2026)
- Library privata `ACC_DS_StoricoVerifica_PREVIEW_v1_9_PRIVATO.zip`, report `ACC_DS_STORICO_VERIFICA_v1_9_REPORT.md`.
- Verificato in sola lettura su acc-test che esiste `has_alliance_role(uuid, alliance_role[])` e NON esistono ancora le tabelle dello storico DS.
- SQL **REVIEW ONLY** `sql/ACC_DS_STORICO_CONSOLIDATO_v1_9_HARDENED_REVIEW_ONLY.sql`: rispetto a v1.8 controlla l'insieme esatto delle tre fasi e rifiuta campi extra nelle mosse `playerId/from/to`.
- Suite locali shared history, atomic, secure, create e preflight + test statici PASS; ZIP integro. SQL **NON eseguita**; niente test JWT/RLS live, niente UI Supabase live. Nessuna modifica a db, staging o produzione.
