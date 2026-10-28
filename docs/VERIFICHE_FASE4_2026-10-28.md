# ACC — Report test Fase 4 (28 ottobre 2026)

**Branch:** `test/acc-phase4-ranghi-r1-r5`  
**Supabase:** solo `acc-test` (project ref `tehijaphavnemchizzbm`)  
**Build esaminata:** `ACC_Fase4_Ranghi_R1_R5_TEST.zip`, v0.8.1, recuperata dalla Library del progetto.  
**Produzione:** non modificata. Repository GitHub attualmente pubblico: non pubblicare l'intero sorgente privato senza un piano di riservatezza.

## 1. Audit build

- Pacchetto locale v0.8.1 recuperato e ispezionato: `app.js`, `index.html`, `styles.css`, `theme.js`, `config.js`, script SQL, immagini e mock.
- `node --check app.js` **PASS**.
- `node --check theme.js` **PASS**.
- **Attenzione:** `config.js` nella build v0.8.1 contiene il segnaposto `INCOLLA_QUI_LA_PUBLISHABLE_KEY_DI_ACC_TEST`. La build **non è utilizzabile per login reale senza una corretta chiave publishable**. L'URL presente è quello di `acc-test`.
- Build v0.8.1 **non pubblicata** su GitHub: il repository è pubblico e la protezione del codice sorgente non è stata ancora completata.

## 2. Test backend di autorizzazione (database reale, JWT simulato a livello SQL)

Eseguiti tramite query sul PostgreSQL reale `acc-test`, con `SET LOCAL ROLE authenticated` e identificativo utente in claim temporaneo, dentro `BEGIN ... ROLLBACK`. **Non sono test end-to-end con login Supabase Auth da browser**.

**11/11 controlli eseguiti senza errori:** R5 legge membri della propria alleanza, promuove R1→R2 e R1/R2→R4, blocco assegnazione R5, blocco modifica di sé come R5, blocco uscita R5, lettura membri da parte di R4, divieto R4 di modificare R5, divieto R4 di modificare il proprio rango, divieto R1 di cambiare ranghi, uscita consentita a R1. Dati modificati soltanto nella transazione, poi rollback.

**3/3 controlli tra alleanze diverse superati:** R5 di una alleanza non può leggere lista membri, cambiare rango o eseguire uscita su una seconda alleanza. Anche qui `ROLLBACK`.

Lo stato dati verificato dopo i test mostra **3 alleanze e 6 appartenenze**; potrebbero essere presenti modifiche provenienti da altre sessioni di test. Non attribuire quelle modifiche a questi test, che usano rollback.

## 3. Test frontend con dati simulati

Test DOM eseguiti in Chromium/Playwright in container, caricando la build v0.8.1 con Supabase simulato, **senza un'istanza HTTP pubblicata**.

Verificato nel primo passaggio (senza foglio CSS applicato nel harness):
- R5: 3 righe membri, 2 selettori di rango per gli altri membri.
- R4: 3 righe membri, 1 selettore di rango per altro membro non R5.
- R1: 3 righe membri, **0** selettori.
- Test con R5: scelta di R4 per un membro, visualizzazione rango aggiornata.
- Nessuna eccezione JS segnalata nei tre scenari.
- Selettore tema Rosso / Light controllato nello stato corrente, **non** verificata la persistenza dopo ricaricamento.

**Limiti e problemi del banco prova:** navigazione reale a `http://127.0.0.1` e `file://` bloccata dal container (`ERR_BLOCKED_BY_ADMINISTRATOR`). Il tentativo successivo di applicare il CSS ai test `set_content` non si è concluso entro il timeout, quindi i controlli di visibilità con CSS reale e la regressione completa **restano da verificare**. Non riportare come 'PASS' la persistenza del tema al refresh da questi test.

## 4. Sicurezza (advisor aggiornato)

- `public.rls_auto_enable()`: chiamata diretta per `anon` e `authenticated` ora risulta **già non autorizzata**; evento `ensure_rls` resta attivo. Non è stata applicata una nuova migrazione per questa voce.
- Advisor `acc-test`: **7 segnalazioni** relative a funzioni `SECURITY DEFINER` accessibili da utenti autenticati, da valutare funzione per funzione; non revocare indiscriminatamente perché alcune RPC sono richieste dal frontend. [Advisor](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable).
- Advisor: protezione password compromesse disabilitata. [Impostazione](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).
- `alliance_invites`: RLS senza policy, gestione tramite RPC; informativo.

## 5. Verifiche ancora aperte

1. Testare **login reale in browser** con account autorizzati, senza registrare credenziali in report/chat.
2. Testare la v0.8.1 con chiave publishable acc-test e hosting locale/staging sicuro, senza pubblicare codice privato sul repository pubblico.
3. Verificare UI responsive, palette (6), lingue (5), modalità Dark/Light e persistenza Ctrl+F5 con CSS caricato.
4. Eseguire da utenti R1, R4, R5 reali l'intera sequenza Membri, inviti e uscita; confermare HTTP e RLS.
5. Audit credenziali in tutta la storia Git, chiarimento fonte GitHub Pages, separazione sorgente privato/artefatto pubblico.
6. Prima di qualsiasi merge su `main`, richiedere approvazione esplicita e confermare configurazione Supabase produzione.

**Esito complessivo:** logica DB di rango e isolamento fra alleanze verificata tramite transazioni SQL con identità simulate. Browser realmente autenticato e distribuzione v0.8.1 **non ancora verificati**.
