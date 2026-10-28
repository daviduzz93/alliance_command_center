# ACC — Analisi conferma email in `acc-test` (28 ottobre 2026)

**Ambiente analizzato:** Supabase `acc-test` (`tehijaphavnemchizzbm`), registrazioni 27/10/2026. **Produzione non consultata né modificata.**  
**Stato:** causa principale dei messaggi identificata; patch di prevenzione preparata, NON ancora integrata in una build pubblicata. Configurazione Auth URL ancora da aggiornare nello staging.

## 1. Segnalazione
Due registrazioni di prova hanno ricevuto la mail di conferma. L'apertura del link ha restituito un errore, ma entrambi gli account potevano successivamente effettuare l'accesso.

## 2. Riscontri nel database (senza esporre email/identità)
- **Primo account:** creato il 27/10/2026 alle 21:15:19 UTC; prima conferma registrata alle **21:16:00 UTC**, 41 secondi dopo la registrazione.
- **Secondo account:** creato alle 22:22:24 UTC; prima conferma registrata alle **22:22:48 UTC**, 24 secondi dopo.
- Entrambi hanno `email_confirmed_at` valorizzato e successivi accessi riusciti. **Non serve ripetere la conferma per questi due account.**

## 3. Riscontri nei log Auth/HTTP (27/10/2026)

- Primo account: `/auth/v1/verify` con redirect HTTP **303** alle 21:16:00 UTC, e richieste successive alle 21:16:17, 21:17:08, 21:18:35, 21:47:06 e 21:48:18.
- Secondo: prima verifica con redirect **303** alle 22:22:48 UTC, seguita da richieste alle 22:22:52 e 22:23:11.
- Le richieste dopo il primo uso sono associate a messaggi nel log Auth **`403: Email link is invalid or has expired`**, compatibili con il riutilizzo di link monouso; non indicano che la prima conferma sia fallita.
- La query degli URL di redirect incorporati nei link restituisce, per il primo gruppo, **`http://localhost:3000`** (6 richieste) e per il secondo **`http://127.0.0.1:5500/`** (3 richieste). Entrambi sono indirizzi locali e non uno staging HTTPS stabile. Questi risultati spiegano perché l'app non veniva aperta correttamente dopo la conferma.
- L'esatta origine delle richieste successive non è determinabile dai riscontri aggregati. Possibili motivi: doppio clic, anteprima dell'app di posta, scansione anti-phishing dei link, o una seconda apertura manuale. **Non attribuire la causa a uno di questi scenari senza prova.**

## 4. Audit del frontend locale

Nella candidata v0.8.3, la chiamata è:
`sb.auth.signUp({email, password})`

**Manca `options.emailRedirectTo`**: Supabase utilizza la Site URL configurata, o altro redirect generato dai flussi precedenti, che nei test era una URL locale.

Documentazione ufficiale:
- [Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)
- [Password-based Auth](https://supabase.com/docs/guides/auth/passwords)

## 5. Patch preparata (non applicata a produzione / nessuna nuova ZIP)

**File nella Library privata:** `/Alliance Command Center/ACC_EmailConferma_HTTPS_test.patch`.

La patch si applica **sulla candidata v0.8.3 con la patch strutturale Cambia alleanza già integrata**, e modifica soltanto `app.js` e `config.js`:

1. Aggiunge il parametro `options.emailRedirectTo` a `signUp()`.
2. Legge l'indirizzo da `window.APP_CONFIG.AUTH_REDIRECT_URL` (da impostare esclusivamente sullo staging HTTPS reale).
3. Impedisce l'invio di una nuova mail se la configurazione è assente, locale (`localhost` / `127.0.0.1`), senza HTTPS o contiene user-info/query/fragment; mostra un messaggio esplicativo in IT/EN/FR/ES/DE, senza bloccare gli accessi di account già verificati.
4. Evita di generare messaggi di successo quando il link di verifica finirebbe certamente sulla URL predefinita di sviluppo.

**Test patch:** `node --check app.js` e `theme.js`: PASS; **9/9** casi unitari per URL ammessi/vietati: PASS; 5 stringhe localizzate presenti; `patch --dry-run` sui sorgenti con correzione del cambio alleanza: PASS.

**Limite:** non dimostra il funzionamento end-to-end della conferma via email. Prima di abilitare la registrazione serve hosting staging raggiungibile e corretta allowlist di redirect su Supabase; la patch è intenzionalmente configurata con `AUTH_REDIRECT_URL=""` fino a quel momento.

## 6. Passaggi di configurazione ancora aperti

1. Pubblicare la build di test, senza esporre sorgenti riservati, su un URL HTTPS **staging** raggiungibile e collegato soltanto a `acc-test`.
2. In [Supabase acc-test → Authentication → URL Configuration](https://supabase.com/dashboard/project/tehijaphavnemchizzbm/auth/url-configuration), impostare la **Site URL** allo staging HTTPS e includere l'indirizzo esatto nelle **Redirect URLs**. **Questo intervento nelle impostazioni Auth non è stato eseguito**: i plugin attualmente disponibili non offrono un'azione di modifica della configurazione URL.
3. Impostare `AUTH_REDIRECT_URL` in `config.js` della build di staging esattamente all'URL permesso.
4. Verificare con una nuova email di prova: richiesta signup, consegna, primo clic, ritorno nell'app, sessione autenticata, eventuale secondo clic con messaggio chiaro; controllare audit log e stato confermato. Non salvare né riportare token di conferma o email nei log di test.
5. Se una sola apertura manuale causa ancora link già usato, considerare un **codice OTP da digitare** anziché un link cliccabile, per ridurre i problemi di scansione preventiva dei link.
6. Dopo collaudo ripetere le verifiche con differenze di browser/dispositivo e cinque lingue.

**Nessun nuovo ZIP e nessuna modifica a Supabase produzione, GitHub `main`, Pages o progetto `acc-test` in questo intervento.** Sono state eseguite solo letture di DB/log, patch in Library e aggiornamento documenti GitHub sul branch di test.
