# Alliance Command Center (ACC) — Documento tecnico di continuità

**Revisione documento:** 1.13  
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

## Fase 4: nickname Last War per alleanza IMPLEMENTATI SU ACC-TEST (28/10/2026)

**Dettaglio tecnico e matrice test:** [`REPORT_NOMI_GIOCATORE_FASE4.md`](./REPORT_NOMI_GIOCATORE_FASE4.md).

- **Migrazione eseguita sul solo Supabase `acc-test`:** `acc_phase4_game_player_names_v1`, risposta `success:true`. **Produzione invariata.**
- Aggiunta colonna `alliance_memberships.game_player_name` (nullable per membri legacy), con vincolo SQL che esclude nomi vuoti/oltre 64 caratteri, leading/trailing whitespace e caratteri di controllo. **1–64 è limite provvisorio dell'app, non una specifica verificata di Last War**.
- Creazione/ingresso con nickname: nuove RPC `acc_create_alliance_with_player_name` e `acc_join_alliance_with_player_name`. Il creatore entra R5 e il nuovo membro tramite invito R1. Le vecchie RPC restano operative per retrocompatibilità.
- Editing nickname: nuova `acc_set_game_player_name` con controllo sul server: un membro modifica sé, R4/R5 modificano gli altri **della stessa alleanza**. Autorizzazione su appartenenza e ruoli dal database, non dalla UI.
- Elenco: nuova `acc_list_members_v2` restituisce il nickname nullable insieme al nome visibile; `acc_list_members` mantiene firma a 4 colonne ma dà precedenza al nickname quando valorizzato.
- **22/22 test reali PostgreSQL superati** con ruolo `authenticated` e JWT simulato mediante GUC, sotto `BEGIN/ROLLBACK`: sicurezza per ruolo e per alleanza, validazione, vecchia/nuova lista, creazione e ingresso, isolamento dei nickname di uno stesso account in alleanze diverse. **Non sono ancora test con sessioni browser Supabase Auth reali.**
- Baseline verificata dopo rollback: **3 alleanze, 6 memberships, 0 nickname confermati**; i membri legacy conservano accesso e nome fallback.
- Verificati grant: nuove RPC applicative utilizzabili da `authenticated`, non da `anon`; validatore interno non esposto. Scrittura diretta `alliance_memberships` negata a `authenticated`.
- Security Advisor attuale: **12** warning relativi a funzioni `SECURITY DEFINER` accessibili ad autenticati, protezione password compromesse disabilitata, un info su `alliance_invites` RLS senza policy. Confrontare e risolvere gli avvisi rilevanti prima di produzione.
- **Limite esplicito di transizione:** i vecchi endpoint create/join possono ancora aggiungere membri con `game_player_name=NULL`, per non rompere la build attuale. L'obbligo di nickname non è ancora universale finché non saranno migrati frontend e vecchi endpoint.
- **Da completare:** integrazione frontend cumulativa, richiesta nickname nei moduli, UI editor R1–R5, conferma account legacy, cinque lingue e sei temi, cambio alleanza, staging reale. **Nessun nuovo ZIP** prodotto e nessun upload di sorgenti sul repository GitHub pubblico.

## Fase 4: frontend cumulativo v0.8.3 pronto per collaudo remoto (28/10/2026)

**Rapporto e criteri:** [`VERIFICHE_BUILD_V083.md`](./VERIFICHE_BUILD_V083.md).

- Build candidata unica `ACC_v0_8_3_Fase4_Nickname_CambioAlleanza_TEST.zip`, test-only, **creata e salvata nella Library privata** `/Alliance Command Center/`. Non caricata nel repository GitHub pubblico e non pubblicata su Pages.
- Codice frontend da v0.8.2: input nickname in crea/entra alleanza con RPC nuove `acc_create_alliance_with_player_name` e `acc_join_alliance_with_player_name`; elenco `acc_list_members_v2`, editor personale e R4/R5 via `acc_set_game_player_name`, avviso per nickname legacy NULL.
- Refactoring in un solo renderer della schermata Cambia alleanza; titolo autonomo e tessere **sempre su due colonne**, lingua a destra e Indietro nella toolbar, anche su mobile.
- Preservati fix v0.8.2 login, Light, Impostazioni, rinomina alleanza solo R5 e server immutabile, temi e 5 lingue.
- Test: `node --check` su `app.js` e `theme.js` PASS; **9/9 scenari browser simulati** per R1/R4/R5 × 1280/375/320 px PASS senza errori JS, test create/join nickname PASS mock, **54/54** contrasti titoli Light PASS.
- Archivio ZIP integro; SHA256 `86237a5abd938b6e9fdf33c7306eece32650a10fc108bc7e46e1fe3d09b10411`. `config.js` contiene solo URL e **chiave publishable** di `acc-test`, non segreti.
- **Da fare obbligatoriamente:** login/browser reali con Supabase Auth, staging protetto, test RLS/HTTP, verifica temi e refresh, dismissione controllata RPC legacy senza nickname, privacy repository sorgente, approvazione produzione.
- **Stato produzione invariato:** nessun deploy e nessuna scrittura su Supabase produzione / branch `main`.

## Correzione strutturale «Cambia alleanza» (28/10/2026)

**Segnalazione utente:** benché siano stati allineati i controlli nella v0.8.3, «Cambia alleanza» appare ancora diversa dalle altre sezioni. La causa verificata è architetturale: nella build v0.8.3, il comando di cambio alleanza chiama `showOnboard()` e mostra il contenitore `<main id="onboard">` **fuori da `<div id="app">`**, con larghezza massima 850px e barra superiore propria. I veri moduli sono `section.page` dentro `main.content` e condividono barra/header/sidebar. Cambiare solo margini non elimina questa differenza.

**Correzione implementata nel workspace, non ancora distribuita:**
- Nuovo modulo `#page-alliances` nella struttura comune `#app > main.content`, usando **lo stesso header superiore, menu laterale, titolo, lingua, pulsante Indietro e selettore alleanza** dei moduli esistenti.
- Un unico contenuto DOM `#alliance-flow` (azioni crea/entra, elenco alleanze e moduli con nickname) può vivere nel nuovo `#page-alliances` quando il cambio avviene da un'app già attiva, oppure nel `#onboard` per il primo accesso quando manca ancora la scelta dell'alleanza.
- Una sola griglia a due colonne sotto «LE TUE ALLEANZE», anche su schermi 320/375px; nessuna duplicazione di tasto lingua o form. Introdotti testi del titolo in IT/EN/FR/ES/DE.
- Il pulsante Indietro comune torna a Home; il tasto Indietro dei form torna all'elenco **restando nella stessa struttura dell'app**.
- **Non è stata creata una nuova build ZIP.** Le modifiche sono state conservate come patch privata `ACC_CambioAlleanza_stessa_struttura.patch` nella Library `/Alliance Command Center/`. Si applica sui sorgenti della build candidata v0.8.3 (file `index.html`, `app.js`, `styles.css`) e non sostituisce una nuova distribuzione.
- Patch verificata: riprodotta su una copia indipendente dei file v0.8.3, `node --check app.js` PASS e confronto byte-a-byte con i file modificati PASS.

**Test Chromium realizzati (mock Supabase, non login remoto):** **9/9** casi R5/R4/R1 × viewport 1280/375/320px PASS: schermata dentro `#app`, stesso elemento DOM header, `#onboard` nascosto, tasto Indietro comune e `#lang-app` visibili, 2 colonne, assenza overflow orizzontale, apertura e chiusura form in-app, ritorno a Home e selezione di un'altra alleanza. Nessun `pageerror`. Verificato il cambio lingua IT/EN nel titolo e cinque traduzioni predisposte. Screenshot di controllo visuale prodotti localmente, non distribuiti.

**Limiti:** applicazione patch + test mock nel workspace locale; nessun cambio alla build v0.8.3 già salvata, nessun nuovo archivio e **nessuna pubblicazione** su repository pubblico, GitHub Pages o produzione. Un E2E reale e le regressioni integrali rimangono necessari prima del prossimo rilascio cumulativo.

## Bug conferma email / redirect Auth test (28/10/2026)

**Analisi completa:** [`REPORT_CONFERMA_EMAIL_ACC_TEST.md`](./REPORT_CONFERMA_EMAIL_ACC_TEST.md).

- Due account registrati il 27/10 hanno **email confermata** sul database `acc-test` (primo 21:16:00 UTC, secondo 22:22:48 UTC) e hanno effettuato login. Non sono necessarie nuove conferme.
- Log Auth: prima verifica HTTP **303** riuscita; tentativi successivi dello stesso link hanno generato **403: Email link is invalid or has expired**. La causa esatta delle aperture successive (preview/scanner/doppio clic) non è accertata.
- Redirect registrato nei link: `http://localhost:3000` per un gruppo e `http://127.0.0.1:5500/` per l'altro. Entrambi sono indirizzi di test locali, non un vero staging HTTPS: **errore di configurazione concretamente verificato**.
- La build v0.8.3 chiama `auth.signUp({email,password})` senza `options.emailRedirectTo`; Supabase usa il redirect impostato nel progetto.
- **Patch privata predisposta**: `/Alliance Command Center/ACC_EmailConferma_HTTPS_test.patch`, applicabile dopo la patch strutturale Cambia alleanza, aggiunge URL di conferma esplicita `AUTH_REDIRECT_URL` e blocca il signup quando non è disponibile un URL HTTPS valido. Sintassi Node PASS, 9/9 unit test URL PASS, applicazione patch verificata. **Nessuna nuova build distribuita.**
- **Blocco prima dello staging E2E:** pubblicare frontend di prova su HTTPS, impostare la Site URL e le Redirect URLs nel [pannello Authentication di `acc-test`](https://supabase.com/dashboard/project/tehijaphavnemchizzbm/auth/url-configuration), configurare `AUTH_REDIRECT_URL`, poi rifare due registrazioni realmente complete. **URL Configuration non modificato**, in quanto non disponibile un'azione di gestione attraverso i plugin correnti.
- Non mettere in produzione o nel repository pubblico la build di test. Nessuna modifica al DB di `acc-test`, a Supabase produzione, `main` o hosting effettuata per questa indagine.

## UI Membri: modifica nickname personale meno invasiva (28/10/2026)

**Richiesta:** non mettere la modifica del nickname proprio in primo piano: è rara e deve richiedere un'azione deliberata, senza rischi di cambio accidentale.

**Implementazione preparata nel workspace privato, NON ancora distribuita:**
- Rimossa la scheda di input `member-profile-card` posta **sopra** l'elenco Membri, inclusi il campo sempre editabile `#member-nickname` e il pulsante Salva sempre visibile.
- Il proprio nome è visualizzato come normale riga nell'elenco Membri, contrassegnata «Tu» e dal rango; sulla stessa riga compare una **piccola icona a matita** con `aria-label` localizzato, tooltip e focus accessibile. Nessun campo aperto di default.
- Solo dopo il click sulla matita si apre un editor inline con **Salva** e **Annulla**. **Invio non salva**, Esc annulla, nome invariato non genera una RPC, nessuna modifica al semplice passaggio di focus.
- `R1/R2/R3/R4/R5` possono sempre correggere il proprio nickname; i comandi esistenti di R4/R5 per il nickname degli altri membri restano utilizzabili. I permessi server-side su `acc-test` non sono stati modificati.
- Patch privata `/Alliance Command Center/ACC_Nickname_ModificaDiscreta_Membri.patch`, applicabile sui file `index.html`, `app.js`, `styles.css` della candidata v0.8.3 **dopo** `ACC_CambioAlleanza_stessa_struttura.patch` e `ACC_EmailConferma_HTTPS_test.patch`. L'applicazione patch con `patch -p1 --dry-run` è stata verificata, con confronto byte-a-byte.
- Test effettuati con Chromium e Supabase simulato: **9/9** combinazioni R1/R4/R5 × 1280/375/320px, verifica editor inizialmente assente, apertura manuale, Esc/Annulla, Invio senza salvataggio, Salva esplicito, visibilità e permessi sugli altri membri, zero errori JS. Passati anche i **9/9 test di regressione** del modulo Cambia alleanza con la stessa base.
- `node --check app.js` e `node --check theme.js` **PASS**. Le prove sono solo browser mock, **non** un collaudo end-to-end autenticato reale.

**Nessun nuovo ZIP, nessun commit di sorgenti nel GitHub pubblico, nessuna modifica a `acc-test`, Supabase produzione, `main` o GitHub Pages.** La modifica entrerà nella prossima build cumulativa, con test di regressione e approvazione per il rilascio.

## Decisioni UX e codici d'invito (28/10/2026)

**Correzione esplicita dell'utente, prevale su specifiche precedenti: R4 e R5 possono ENTRAMBI inviare e condividere codici d'invito alla propria alleanza.** La UI di onboarding deve indicare «Entra con il codice ricevuto da un R4 o R5» (localizzare nelle 5 lingue), non «dal tuo R5». R4 e R5 devono poter consultare/copiare/condividere il **codice attivo della propria alleanza**; R1–R3 non devono avere accesso alle azioni di distribuzione.

**Aggiornamento successivo del requisito (28/10/2026):** l'utente ha chiarito che R4 e R5 devono entrambi poter **generare/rigenerare**, visualizzare, copiare e condividere il codice attivo. La migrazione `acc_phase4_invite_management_r4_r5` ha applicato le autorizzazioni sul solo `acc-test`; vedere i test sotto. Questa nota sostituisce il precedente vincolo di rotazione riservata a R5. **Il frontend non è ancora aggiornato**: non considerare completata la funzionalità end-to-end.

**Direzione grafica concordata senza ancora intervenire sul codice:** login essenziale e cinematografico, mantenendo lo sfondo esistente un po' più luminoso, logo Last War riconoscibile insieme al marchio Alliance Command Center, soli campi email/password, Accedi, Registrati, recupero password e lingua (eventuale slogan breve). Tutte le spiegazioni dettagliate su creazione/ingresso alleanza devono comparire **solo nell'onboarding dopo primo login**. Il pannello login deve comunque riutilizzare i componenti e la tipografia del design system ACC; nessun redesign della dashboard richiesto. Verificare eventuali diritti d'uso del logo originale prima della distribuzione pubblica.

**Stato:** requisiti documentati; **nessuna nuova build, nessuna modifica al DB o alla produzione**.

## Fase 4: R4/R5 generano e condividono inviti; sfondo login sostituibile (28/10/2026)

**Decisione definitiva sulle autorizzazioni:** **R4 e R5 possono entrambi consultare, copiare, condividere e generare/rigenerare il codice invito attivo della propria alleanza.** Gli R1–R3 non possono farlo; un R4/R5 non può leggere o rigenerare i codici di altre alleanze. Questa decisione **sostituisce esplicitamente** la precedente restrizione di generazione al solo R5.

**Backend `acc-test`: IMPLEMENTATO e verificato.**
- Migrazione `acc_phase4_invite_management_r4_r5` applicata con successo. `public.rotate_alliance_invite(uuid)` ora accetta R4 (manager) e R5 (owner) della specifica alleanza e mantiene la firma/forma della risposta. Mantiene **un solo invito attivo** e **invalida quelli precedenti**; aggiunto un lock della riga alleanza per serializzare generazioni simultanee.
- Nuova RPC `acc_get_active_alliance_invite(p_alliance_id uuid)` che ritorna `{'invite_code': ...}` (o NULL) esclusivamente a R4/R5 autenticati della propria alleanza. Non apre la tabella `alliance_invites` a letture dirette.
- `EXECUTE` concesso solo a `authenticated`, non ad `anon`.
- **13/13 verifiche su PostgreSQL reale con ruolo `authenticated` e JWT simulato in transazioni rollback:** R5 legge/rigenera, R4 legge/rigenera, codici precedenti non funzionano dopo rotazione, R5 vede il codice creato da R4, R1 non può leggere/generare, R5 di un'altra alleanza non può leggere/generare, sessione senza `auth.uid()` non può generare. **Nessun codice attivo permanente è stato modificato dai test.** Gli utenti non hanno accesso SQL diretto alla tabella inviti.
- Security Advisor su `acc-test`: 13 warning relativi a RPC `SECURITY DEFINER` eseguibili da autenticati; valutare per funzione prima della produzione. Verifiche di autorizzazione SQL non sostituiscono una prova browser con sessione reale.
- **Da integrare nel frontend cumulativo:** R4/R5 vedono il codice attivo e possono copiarlo/condividerlo; «Genera nuovo codice» chiede conferma esplicita perché invalida il precedente; tradurre in IT/EN/FR/ES/DE. Nessuna visibilità per R1–R3. Nuova build **non generata**.

**Nuova decisione UX per il login:** mantenere **l'immagine di sfondo attuale** e la luminosità attuale. Costruire il nuovo login essenziale e cinematografico separando il background dalla UI, con riferimento a risorsa grafica configurabile e trattamento/overlay gestibile indipendentemente. In futuro permettere al **gestore dell'app**, non necessariamente a ogni membro, di sostituirla facilmente per eventi stagionali o refresh grafici. Nessun pannello pubblico per cambiare sfondo, nessuna modifica visiva immediata, niente nuova build ora.

**Produzione e GitHub `main`: non modificati.**

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
