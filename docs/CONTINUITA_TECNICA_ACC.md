# Alliance Command Center (ACC) — Documento tecnico di continuità

**Revisione documento:** 1.6  
**Aggiornato al:** 28 ottobre 2026 (Europe/Rome)  
**Stato:** Fase 4, implementazione gestione ranghi R1–R5, ambiente di test  
**Responsabile prodotto:** Daviduzz  
**Scopo:** una fonte consultabile e versionata per riprendere lo sviluppo senza perdere decisioni, test, stato delle build o problemi aperti.

> **Regola fondamentale:** distinguere sempre ciò che è concordato, ciò che è implementato nel codice, ciò che è applicato al database, ciò che è testato e ciò che è pubblicato. Un test UI simulato non equivale a un test backend reale. Questo documento non contiene password, token, codici invito né chiavi segrete.

## 1. Riferimenti e ambienti

| Risorsa | Identificativo | Utilizzo / stato |
| --- | --- | --- |
| Repository GitHub | [daviduzz93/alliance_command_center](https://github.com/daviduzz93/alliance_command_center) | Repository con branch principale `main` |
| Branch di integrazione e test | `test/acc-phase4-ranghi-r1-r5` | Creato il 28/10/2026, separato da `main` |
| Supabase produzione | `alliance-command-center` (`gxpfultivhwxkjffvbjx`) | **Non modificare durante i test** |
| Supabase test | `acc-test` (`tehijaphavnemchizzbm`) | Migrazione ranghi applicata il 28/10/2026 |
| Alleanza reale di riferimento | LADG / Les Anges de Guerre, server #2010 | Dati reali da proteggere |
| Alleanza di prova | ACC TEST, server #2308 | Usata nei test della Fase 4 |
| Ultima build locale preparata | `ACC_Fase4_Ranghi_R1_R5_TEST.zip` | **v0.8.1 candidata**; non ancora caricata nel branch GitHub |
| Build base verificata dall'utente | `ACC_Phase4_integrata_temi_test.zip` | Login, pagina, temi, persistenza e invito verificati a livello utente |
| Migrazione di riferimento locale | `ACC_Fase4_Ranghi_acc-test.sql` | Verificare sempre il contenuto rispetto alla migrazione effettivamente applicata |

**Attenzione al versionamento:** il README attualmente presente in `main` e nel branch di test riporta ancora **v0.7.1**. Il pacchetto locale di prova contiene invece il codice **v0.8.1**. Il branch creato NON include ancora i sorgenti v0.8.1. Non descriverlo come versione pubblicata. La documentazione storica nel README può contenere riferimenti a moduli segnaposto.

## 2. Obiettivo del prodotto

ACC è un'applicazione web multi-alleanza per Last War: gestione dell'identità e delle alleanze, membri/ranghi, Desert Storm (DS), treni, notifiche, guide e impostazioni. Non limitare il prodotto alla sola alleanza LADG. Il server viene scelto quando si crea l'alleanza; l'ingresso tramite invito eredita l'alleanza e il server.

**Navigazione concordata:** Home; Membri; Gestione DS; Gestione Treni; Notifiche; Guide; Impostazioni. «Membri» resta sezione indipendente da «Gestione DS». Le funzioni DS/Treni/Notifiche/Guide previste non vanno descritte come operative in ACC senza test specifici.

**Lingue previste nella build più recente:** italiano, inglese, francese, spagnolo, tedesco. **Aspetto:** sei palette, varianti Dark/Light, navigazione laterale, componente di selezione alleanza. La preferenza visiva permane al ricaricamento nel browser già testato; non presumere sincronizzazione cloud fra dispositivi.

**Tecnologie osservate:** frontend statico HTML/CSS/JavaScript (`index.html`, `styles.css`, `app.js`, `theme.js`, `config.js`), Supabase Auth/PostgreSQL/RPC e hosting tramite GitHub Pages. `config.js` nel browser può contenere soltanto URL e chiave publishable/anon, **mai service_role o chiavi secret**. Il pacchetto v0.8.1 contiene anche `assets/login-last-war.png`.

## 3. Decisioni consolidate (registro ADR sintetico)

| ID | Decisione | Stato |
| --- | --- | --- |
| D-001 | Applicazione multi-alleanza, non esclusiva LADG | Confermata |
| D-002 | Rango visibile nel menu laterale: **solo** R1–R5; mai `owner/manager/viewer` | Confermata |
| D-003 | Mapping autorizzazioni: **R5 = owner**, **R4 = manager**, **R1/R2/R3 = viewer** | Confermata |
| D-004 | Nuovo membro entrato tramite invito: **R1 predefinito**; creatore: R5 | Confermata |
| D-005 | R4 e R5 possono cambiare i ranghi di **altri** membri tra R1 e R4; nessuna autopromozione; R5 non modificabile con il normale selettore | Confermata |
| D-006 | Solo R5 può generare/rigenerare codici invito | Confermata |
| D-007 | Membri R1–R4 possono abbandonare l'alleanza; il R5 deve prima trasferire la proprietà (da implementare) | Confermata |
| D-008 | Cancellazione alleanza riservata a R5, con conferma rafforzata; **non ancora implementata** | Confermata |
| D-009 | Separare struttura di gioco/ranghi dai privilegi applicativi e dal roster DS | Confermata |
| D-010 | Pubblicazione su produzione soltanto dopo test su `acc-test` e approvazione | Confermata |

## 4. Backend: schema e contratti osservati

### 4.1 Tabelle principali (Supabase `acc-test`)

- `public.alliances`: dati dell'alleanza, server e creatore.
- `public.alliance_memberships`: chiave di relazione `alliance_id` + `user_id`; `role` enum `alliance_role` = owner/manager/viewer; **`rank` enum `member_rank` = R1–R5**, default R1; `invited_by`, `created_at`.
- `public.profiles`: `user_id`, `display_name`, timestamp.
- `public.alliance_invites`: codice invito, alleanza, stato attivo, creatore e timestamp. Gestita via RPC, non con accesso diretto alle righe.

L'elenco membri autenticati nella nuova UI **non è** necessariamente il roster di 100 giocatori della Desert Storm; sono concetti distinti.

### 4.2 Funzioni/RPC

**Preesistenti:** `create_alliance_with_invite`, `join_alliance_with_invite`, `rotate_alliance_invite`, `has_alliance_role`.

**Fase 4 ranghi, applicate su `acc-test` il 28/10/2026:**
- `acc_list_members(p_alliance_id uuid)`: lista degli account membri della propria alleanza, con rango e nome.
- `acc_set_member_rank(p_alliance_id uuid, p_target_user_id uuid, p_new_rank member_rank)`: cambio rango autorizzato per R4/R5, vietata modifica di se stessi e del R5; R5 non assegnabile con questa RPC.
- `acc_leave_alliance(p_alliance_id uuid)`: uscita autonoma di membri R1–R4; blocca il proprietario.
- `acc_sync_membership_rank()`: trigger di coerenza tra `role` e `rank`.

La migrazione include controllo di coerenza ruolo/rango, indice univoco parziale per impedire più owner sulla medesima alleanza e revoca INSERT/UPDATE/DELETE diretti sulla tabella delle appartenenze per `authenticated`, mantenendo l'accesso tramite RPC autorizzate. Non sono state eliminate tabelle o alleanze.

### 4.3 Stato confermato dal database al 28/10/2026

- `acc-test`: **1 alleanza, 2 appartenenze**.
- R5/owner: **1**; R1/viewer: **1**; nessun duplicato R5 rilevato.
- RLS attiva per `alliance_memberships`, `profiles`, `alliance_invites`.
- L'utente `authenticated` non possiede INSERT/UPDATE/DELETE diretti su `alliance_memberships`, ma ha EXECUTE su `acc_set_member_rank`.
- Funzioni RPC elencate nell'istanza di test dopo la migrazione.

**Limite di verifica:** questa ricognizione NON equivale ad aver eseguito come R1/R4/R5 tutte le chiamate RPC con sessioni reali. Restano necessari test positivi e negativi lato server.

## 5. Matrice dei test e delle evidenze

| ID | Scenario | Esito / fonte | Note |
| --- | --- | --- | --- |
| T-001 | Accesso e Home «ACC TEST» | **PASS** dichiarato dall'utente | Build base Fase 4 |
| T-002 | Nessuna pagina vuota/errore UI durante il test base | **PASS** dichiarato dall'utente | Non è un audit completo |
| T-003 | Selezione tema Rosso + Light e persistenza dopo Ctrl+F5 | **PASS** dichiarato dall'utente | Persistenza locale browser |
| T-004 | Generazione codice invito come proprietario | **PASS** dichiarato dall'utente | Esito R1/R4 da verificare con richieste dirette |
| T-005 | UI Membri R5/R1 in browser con backend simulato | **PASS simulato**, da precedente fase | Non conferma backend remoto |
| T-006 | Migrazione ranghi su Supabase `acc-test` | **PASS**, risposta API `success:true` | 28/10/2026 |
| T-007 | Stato dei due account R5/R1 su Supabase | **PASS**, query lettura DB | 28/10/2026 |
| T-008 | Revoca delle scritture dirette sugli appartenenti | **PASS**, controllo privilegi DB | 28/10/2026 |
| T-009 | Promozioni/retrocessioni tramite UI su backend reale | **DA TESTARE** | R5 → membro; R4 → altro membro |
| T-010 | Divieto autopromozione/R5/operazioni viewer tramite RPC | **PASS in SQL con JWT simulato; login reale DA TESTARE** | Vedi report verifiche 28/10 |
| T-011 | Abbandono R1 e blocco R5 tramite RPC | **PASS in SQL con JWT simulato; altre casistiche browser DA TESTARE** | Rollback DB |
| T-012 | Regressione: 6 palette, Dark/Light, lingue, inviti, logout, cambio alleanza | **DA RIPETERE** sulla build v0.8.1 con backend reale | Prima della pubblicazione |

## 6. Sicurezza: risultati e debito tecnico

Il controllo advisor Supabase su `acc-test` ha rilevato:
1. **WARN:** `public.rls_auto_enable()` (`SECURITY DEFINER`) eseguibile da `anon` e `authenticated`: verificare e revocare EXECUTE ai ruoli applicativi se non necessario. [Riferimento](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable).
2. **WARN:** RPC `SECURITY DEFINER` eseguibili da `authenticated`. Per le RPC dell'app è intenzionale **soltanto con controlli interni rigorosi**, permessi minimi e test di abuso. [Riferimento](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable).
3. **INFO:** `alliance_invites` ha RLS senza policy: previsto per gestione esclusiva via RPC, da rivalutare se cambia l'architettura. [Riferimento](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).
4. **WARN:** protezione password compromesse disabilitata in Supabase Auth. Valutare attivazione. [Riferimento](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

**Prima della produzione:** test di autorizzazione per ruolo e alleanza, controllo cross-alliance, verifica grant/RLS su tutte le tabelle esposte e nessuna esposizione di segreti nel frontend o nella documentazione.

## 7. Problemi aperti, roadmap e priorità

| Priorità | Lavoro | Stato |
| --- | --- | --- |
| P0 | Caricare i sorgenti v0.8.1 nel branch di test GitHub (senza aggiornare `main`) | Aperto |
| P0 | Eseguire test end-to-end su `acc-test` con due account, RPC e interfaccia | Aperto |
| P0 | Eliminare/esaminare warning `rls_auto_enable` e validare permessi RPC | Aperto |
| P1 | Completare aggiornamenti e traduzioni nella sezione Membri | Da validare |
| P1 | Implementare trasferimento del proprietario R5 | Non implementato |
| P1 | Implementare cancellazione alleanza solo R5, con doppia conferma e protezione dati | Non implementato |
| P2 | Sincronizzazione cloud delle preferenze e dello stemma tra dispositivi | Da progettare |
| P2 | Sviluppare realmente i moduli DS, Treni, Notifiche, Guide oltre ai segnaposto | Roadmap |

### Requisiti DS storici da preservare

Due fasce del venerdì (13:00/22:00), 20 titolari + 10 riserve per fascia, 100 membri circa, rotazioni e storico, generazione formazioni e ruoli, strategie per fasi ed esportazione grafica; localizzazione dell'interfaccia. Sono requisiti di prodotto, **non** prova di funzionalità della nuova app multi-alleanza.

## 8. Procedura per ogni intervento futuro

1. **Prima di cambiare:** leggere questo file, `README.md`, codice sul branch attivo e stato reale di Supabase; registrare la baseline.
2. **Modificare solo il test:** branch dedicato, migrazioni su `acc-test`, backup/snapshot quando necessario; nessuna modifica implicita alla produzione.
3. **Verificare:** test funzionali e regressioni, privilegi/RLS e advisor Supabase; distinguere test simulati da quelli reali.
4. **Aggiornare questo documento nello stesso intervento:** versione, file/commit, migrazioni, test PASS/FAIL/BLOCCATO, decisioni, rischi, prossimo passo.
5. **Pubblicare solo dopo via libera:** confrontare branch con `main`, verificare che nessuna chiave segreta sia inclusa, aprire PR quando appropriato.
6. **Non promettere aggiornamenti automatici:** il documento viene aggiornato mentre lavoriamo insieme sul progetto, non tramite un processo in background.

Formato del diario: `AAAA-MM-GG | versione/build | modifica | ambiente | test | link commit/migrazione | prossima azione`.

## Risultati successivi (28/10/2026): verifiche Fase 4

Il report dettagliato dei controlli è disponibile in [`VERIFICHE_FASE4_2026-10-28.md`](./VERIFICHE_FASE4_2026-10-28.md).

- Recuperata e analizzata la **build locale v0.8.1** dalla Library; `node --check` su `app.js` e `theme.js`: **PASS**.
- `acc-test`: **11 verifiche delle regole R1-R5**, più **3 verifiche di isolamento tra alleanze**, superate mediante chiamate reali alle funzioni SQL con contesto `authenticated` e JWT simulato, in transazioni rollback. **Non equivale a login Supabase Auth reale nel browser**.
- Test DOM con backend simulato: R5, R4, R1 mostrano rispettivamente 2, 1, 0 selettori di rango nell'esempio con tre membri; promozione UI R5→R4 rispecchiata nel mock; nessun errore JS rilevato in quel passaggio.
- **Limitazione:** il browser nel container blocca navigazione `localhost` e `file://`; il test con caricamento CSS e refresh non è concluso. Non segnare PASS un test e2e reale, layout responsive o la persistenza tema da questi nuovi tentativi.
- La build ZIP locale usa ancora una **publishable key segnaposto** per `acc-test`; è necessario configurare la vera chiave pubblica prima del login.
- Il conteggio corrente osservato in `acc-test` è **3 alleanze e 6 appartenenze**, non più la baseline storica di 1/2. Non attribuire variazioni ad altre sessioni senza evidenza; non modificare quei dati fuori da transazioni di test.
- Audit: `rls_auto_enable()` ora non è eseguibile da `anon` o `authenticated`, e il trigger `ensure_rls` rimane attivo; niente nuova migrazione richiesta per quella specifica segnalazione. Restano avvisi advisor sulle altre RPC `SECURITY DEFINER` e la protezione password compromesse.
- **Per proteggere il progetto**, non è stato caricato il codice della build v0.8.1 sul branch pubblico. Il branch continua ad avere la precedente base, oltre alla documentazione e alle impostazioni non sensibili.
- **Prossimo step:** risolvere pubblicazione/staging con sorgenti riservati e test browser reali, quindi allineare il codice su un repository privato senza compromettere GitHub Pages.

## Fase 4: prossima versione candidata v0.8.2 (28/10/2026)

**Specifiche/test completi:** [`ROADMAP_BUILD_V082.md`](./ROADMAP_BUILD_V082.md).

**Nuove richieste approvate:**
- Rimuovere «MULTI-ALLIANCE · AMBIENTE DEMO» dalla schermata login, in ogni lingua.
- Correggere i titoli e gli accenti in modalità Light, anche su palette gialla.
- Togliere il doppio selettore lingua dalla pagina Impostazioni. Mantenere login e selettore superiore a destra in tutti i menu.
- Consentire a **R5 soltanto** di rinominare l'alleanza; **il server è immutabile**. R1–R4 vedono il nome in sola lettura.

**Stato verificato:**
- Preparato archivio locale `ACC_v0_8_2_Fase4_R5_nome_Light_TEST.zip`, **conservato anche nella Library privata** in `/Alliance Command Center/`. Non caricato nel repository pubblico, né distribuito in produzione.
- Modificati `index.html`, `app.js`, `styles.css`, README e istruzioni del pacchetto; mock di debug e migrazione precedente già applicata rimossi dall'archivio.
- Sintassi JavaScript verificata via Node.
- Browser Chromium con Supabase **simulato**: R5 può inviare la rinomina e aggiornare la barra; R1/R4 hanno campo di sola lettura e nessun tasto Salva. Nessun errore JS. Traduzioni per 5 lingue testate.
- Contrasto delle intestazioni in Light: **54/54 verifiche ≥ 4.5:1** su 6 palette e 9 intestazioni di Home, DS, Membri, Treni, Notifiche, Guide, Impostazioni.
- Sul solo Supabase `acc-test` applicata con successo migrazione `acc_phase4_owner_only_alliance_rename`: RPC `acc_rename_alliance(uuid,text)`, controllo server-side proprietario R5 e aggiornamento esclusivo del nome, con restrizione a 2–50 caratteri. `UPDATE` diretto su `alliances` revocato ai client `anon` e `authenticated`.
- Test PostgreSQL in rollback con JWT simulato: R5 può rinominare, normalizzazione whitespace, invalid name bloccati, numero server invariato, UPDATE diretto vietato, R4/R1 negati anche sulla propria alleanza. **Non equivale a test con login reale Supabase Auth.**
- **Configurazione mancante:** `config.js` della build candidata conserva un segnaposto per la publishable key di `acc-test`; login remoto richiede impostazione chiave pubblica corretta. Mai usare chiavi `service_role`.
- Advisor di sicurezza dopo la migrazione: **8 avvisi** per RPC `SECURITY DEFINER` accessibili da `authenticated` (inclusa la nuova RPC autorizzata; controlli interni verificati in SQL), più protezione password compromesse disabilitata e un avviso informativo sulle policy di `alliance_invites`. Vedere [documentazione advisor](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable).\n- **Non modificati:** database di produzione, branch `main`, repository pubblico con sorgenti v0.7.1. Per il rilascio completare hosting/staging sicuro e approvazione.

**Prossimo passo:** collaudo browser con account Supabase reali su staging collegato a `acc-test`, controllo responsive e persistenza tema a refresh, successiva pubblicazione soltanto con autorizzazione dell'utente.

## Modifiche UI accodate per la prossima build cumulativa (28/10/2026)

L'utente ha richiesto di **non produrre una build separata** per questo intervento. Vedere i criteri completi in [`ROADMAP_BUILD_V082.md`](./ROADMAP_BUILD_V082.md), sezione «Richieste aggiuntive da includere nel prossimo rilascio cumulativo».

**Da implementare:** schermata Cambia alleanza con «LE TUE ALLEANZE» a tutta larghezza e sopra le tessere in griglia **sempre a due colonne**; selezione lingua coerente in alto a destra; tasto Indietro nella barra superiore coerente con gli altri menu. Adeguare entrambi i renderer `afterAuth()` e `#switch-alliance`; attenzione al breakpoint mobile che oggi rende `.choices` a una colonna.

**Stato:** requisiti documentati, nessun codice o ZIP generato per questa richiesta, nessuna modifica a `acc-test`, `main` o produzione. Test UI da eseguire insieme alla successiva build cumulativa.

## Nuovo requisito in coda alla prossima versione cumulativa: nome giocatore (28/10/2026)

**Da implementare, nessuna nuova build per questo requisito isolato.** La creazione di un'alleanza e l'ingresso con invito dovranno richiedere il **Nome giocatore in Last War**; ogni membro potrà cambiare il proprio nome, gli R4/R5 potranno modificare quello degli altri membri della propria alleanza.

**D-011:** nickname del gioco **per appartenenza all'alleanza**, da memorizzare in `public.alliance_memberships`, non nel solo `public.profiles.display_name` (che è comune all'account). Verificato sullo schema attuale di `acc-test`: né il campo né i parametri nelle funzioni RPC di creazione/ingresso esistono ancora. Le funzioni `acc_list_members`, `create_alliance_with_invite`, `join_alliance_with_invite` richiederanno adeguamento e test di compatibilità con i membri già esistenti.

**Criteri e sicurezza:** registrati nella sezione «Nuovo requisito: nome giocatore in Last War per ogni alleanza» di [`ROADMAP_BUILD_V082.md`](./ROADMAP_BUILD_V082.md): modifiche proprie e di R4/R5, confini tra alleanze, validazione nickname, preservazione ruoli/server, migrazione non distruttiva, doppia modalità Light/Dark e localizzazione.

**Stato:** specifiche documentate; **nessuna modifica al frontend, a `acc-test` o alla produzione**, nessun nuovo ZIP. Prossima build cumulativa da verificare integralmente prima del rilascio.

## 9. Diario cronologico

### 2026-10-28 — Documento e migrazione ranghi
- Riprese decisioni dalla conversazione **R4 LADG** e dalle build precedenti.
- Confermati ruoli R5/owner, R4/manager, R1–R3/viewer, nuovi iscritti R1 e sola visibilità del rango nel menu.
- Trovati entrambi i progetti Supabase e il repository GitHub collegati.
- Creata branch `test/acc-phase4-ranghi-r1-r5` da `main`.
- Applicata **con successo** migrazione `acc_phase4_member_ranks_r1_r5` a `acc-test`, non a produzione.
- Verificati R5 e R1 presenti, grant di scrittura diretta negati per `authenticated`.
- Eseguito advisor di sicurezza con warning elencati sopra.
- Creato il presente documento sul branch di test; questa operazione non distribuisce l'interfaccia v0.8.1.
- **Prossimo passo:** pubblicare il codice v0.8.1 sul branch di test e controllare allineamento configurazione con il progetto `acc-test`.


### 2026-10-28 — Piano separazione sorgenti e pubblicazione
- Preparato e committato [`docs/PROTEZIONE_SORGENTI_E_DEPLOY.md`](./PROTEZIONE_SORGENTI_E_DEPLOY.md) sul branch di test (commit `4332437e1a750ee33144add12e6accdd0524de31`).
- Verificato che `main/index.html` serve frontend statico caricando `app.js`, `theme.js`, `styles.css` e `config.js`.
- Non trovati, nei percorsi esaminati su `main`, `.github/workflows/pages.yml`, `.github/workflows/deploy.yml`, `CNAME`, `.nojekyll`, `package.json`; fonte effettiva di GitHub Pages da confermare tramite impostazioni.
- **Nessuna modifica** alla visibilità del repository, ai servizi Pages o alla produzione; rimangono aperti scelta hosting, separazione sorgenti e test di regressione.

### Storico precedente (sintesi)
- **Fino al 27/10/2026:** iterazioni grafiche e funzionali su ACC Fase 4, recupero temi e Dark/Light, login e inviti.
- **28/10/2026, prima del nuovo intervento:** utente conferma persistenza Rosso + Light dopo Ctrl+F5 e generazione invito da proprietario.
- **28/10/2026:** preparato ZIP locale v0.8.1 con UI Membri e SQL per ranghi; validazione browser con backend simulato, non ancora deployment del frontend.

## 10. Piano di protezione del codice e della proprietà intellettuale (28/10/2026)

**Decisione del prodotto:** mantenere ACC funzionante, separare progressivamente i sorgenti riservati dal frontend distribuito e limitare l'accesso alle operazioni/data lato backend.

### Verifiche eseguite
- Il repository `daviduzz93/alliance_command_center` risulta **pubblico**. Non è stata cambiata la visibilità.
- Il file `config.js` su `main` è stato controllato per la presenza di indicatori di chiavi `service_role` o `sb_secret_`: **nessun indicatore rilevato in quel file**. Questo NON è uno scan completo della cronologia Git o del repository.
- È stata creata una regola `.gitignore` sul **branch di test** per evitare nuovi commit accidentali di `.env`, chiavi private e artefatti locali; i file eventualmente già tracciati non vengono rimossi automaticamente.
- **GitHub Pages:** su GitHub Free, rendere privato il repository può annullare la pubblicazione del sito; su piani che supportano Pages da repository privato, il sito pubblicato può comunque rimanere pubblico. Verificare piano e hosting prima di intervenire.
- Il codice JavaScript scaricato dal browser resta ispezionabile dai visitatori: per proteggere la logica proprietaria occorre eseguirla lato server, non affidarsi al solo repository privato.

### Piano di migrazione (nessuna di queste azioni è già stata eseguita)
1. Verificare fonte di pubblicazione Pages, dominio, account/piano GitHub e dipendenze di deploy.
2. Sottoporre il repository e la cronologia a scansione credenziali; in caso di esposizione di vere chiavi secret, revocarle e ruotarle.
3. Separare il repository privato per sorgenti, test, documenti e migrazioni dal pacchetto statico minimo distribuibile; se la privacy è prioritaria, scegliere un hosting compatibile prima di cambiare visibilità.
4. Mantenere gli algoritmi riservati e i controlli di autorizzazione in Supabase o in un backend server-side, mai come unica verifica nel frontend.
5. Eseguire test di regressione e login sull'URL distribuito prima di spostare il sito o renderlo privato.
6. Solo dopo i test e l'approvazione esplicita, migrare la pubblicazione e rendere privato il repository sorgente.
7. Valutare documentazione di provenienza (commit, backup, prova temporale) e verifica del marchio prima del lancio commerciale.

**Stato al 28/10/2026:** audit preliminare svolto, `.gitignore` aggiunto sul branch di test, repository e produzione invariati. Obiettivo di riservatezza **non ancora raggiunto**.

### Riferimenti
- [GitHub: modifica della visibilità del repository](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility)
- [GitHub: creazione sito Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)

---

**Nota di continuità:** al riavvio di una chat, aprire questo file GitHub e verificarne la revisione, poi confrontare direttamente repository e database. In caso di discrepanza, lo stato effettivo del codice e del database ha precedenza; aggiornare il documento segnalando la correzione.
