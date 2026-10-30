# ACC — Verifica Fase 4 del 30/10/2026 (sessione senza Astra)

**Ambiente:** solo repository GitHub `daviduzz93/alliance_command_center` branch `test/acc-phase4-ranghi-r1-r5`, letture Supabase **`acc-test`** `tehijaphavnemchizzbm`; sorgenti della build privata v0.8.4 in copia locale. **Nessun cambiamento a main, Pages, staging o Supabase produzione**.

## Stato verificato

- Confermata la build privata `ACC_v0_8_4_Fase4_Cumulativa_PRIVATA_TEST.zip` nella Library `/Alliance Command Center/`. Archivio ZIP integro; `docs/REPORT_BUILD_V084.md` contenuto nella build coerente col documento di continuità rev. 1.15.
- Il documento rev. 1.15 riporta 78/78 test reali API, login autenticato e prove UI su membri, ranghi, inviti R4/R5, temi, cambio alleanza. **Questa sessione non ha rieseguito** i 78 casi remoti.
- `acc-test` al controllo: 4 alleanze, 11 appartenenze, 10 utenti Auth e 11 record invito. Alleanze preesistenti: ACC TEST, ACC E2E A, ACC E2E B. Unica QA recente: `ACC QA UI 20261029` (server #2308), 5 appartenenze; quattro appartenenti sono account sintetici di QA, uno è un account esistente che **non deve** essere eliminato.
- Report privato della ZIP v0.8.4 identifica l'alleanza QA in modo esatto, e gli account sintetici con il marcatore `raw_user_meta_data.acc_qa=ui084-oct29` ed email nel formato `acc-ui-<UUID>@example.invalid`. Query aggregata (senza riportare email né UUID individuali) conferma **4 utenti marcati, 4 appartenenze QA, 0 appartenenze esterne, 0 altre alleanze create, 0 inviti esterni, proprietario QA non marcato, 3 altre alleanze con 6 appartenenze**.
- **Pulizia NON eseguita**: la richiesta di cancellazione transazionale, con precondizioni esplicite, è stata **bloccata dai controlli di sicurezza del connettore**. Nessun record è stato cancellato. Non aggirare la restrizione né confondere la verifica del target con l'eliminazione effettiva. Prima della pulizia servirà una modalità amministrativa autorizzata, per esempio il pannello Supabase `acc-test` con verifica degli identificativi, e successivo controllo del baseline (3 alleanze, 6 appartenenze, 6 account). **Non eliminare l'account originale**.
- **Email:** in `config.js` privato l'`AUTH_REDIRECT_URL` punta già allo staging HTTPS ma `AUTH_REDIRECT_VERIFIED=false`. In `app.js` registrazione e recupero password richiedono URL HTTPS stessa origine e flag verificato. Il flag è correttamente bloccato in attesa della verifica **Authentication → URL Configuration** per il solo progetto `acc-test`. Nessun invio email o recupero password eseguito, nessuna impostazione Auth modificata. Richiesti Site URL e Redirect URLs dello staging; poi verificare template e callback email con una casella di test, **solo successivamente** portare il flag a `true` nella prossima build.
- Dall'audit offline della v0.8.4 risultano ancora i riferimenti `Owner` nelle spiegazioni di creazione/ingresso; il login è privo della nota di non ufficialità. L'area `Password dimenticata?` non riservava altezza costante fra form login e registrazione.

## Patch locale pronta, non integrata nello staging

`ACC_v084_Login_NotaNonUfficiale_UI_fix.patch` (diff `index.html`, `app.js`, `styles.css`) preparata su copia della ZIP privata, senza creare nuova build. La patch:

**Library:** copia verificata archiviata come `/Alliance Command Center/ACC_v084_Login_NotaNonUfficiale_UI_fix(2).patch` (nome assegnato automaticamente dalla Library). `git apply --check` sulla v0.8.4 originale: PASS. Rieseguiti `node --check`, suite `check-core.cjs` e Chromium statico a quattro viewport: tutti PASS. Nessun deploy o merge eseguito.

1. Riserva la stessa area per il link di recupero password tra Accedi e Crea account, così il riquadro mantiene dimensioni e posizione.
2. Aggiunge nel pannello un disclaimer **breve, traducibile IT/EN/FR/ES/DE** di app indipendente/non ufficiale e non affiliata agli sviluppatori, con riferimento ai diritti sui marchi. La nota non costituisce licenza per usare il logo o asset ufficiali.
3. Sostituisce le descrizioni di primo accesso: il creatore diventa **R5**; invito proveniente da **R4 o R5**; eventuale stringa `owner-only` uniformata a R4/R5.
4. **Test effettuati**: `node --check` su `app.js`, `theme.js`, `config.js`: PASS. Suite `tests/check-core.cjs`: 12 temi/modalità, URL redirect e **163 riferimenti HTML di traduzione × 5 lingue PASS**. Browser Chromium statico (nessuna chiamata Auth): viewport 1280, 768, 375, 320px, riquadro login e registrazione di larghezza e altezza identiche, nota visibile, no overflow: **4/4 PASS**.

Il test del pannello è **offline**; non è una prova sulla versione staging o sul login reale. Prima di includere la patch nella prossima build cumulativa, verificare con Work nel browser autenticato.

## Ordine delle attività residue

1. **Pulizia fixture QA** mediante percorso amministrativo autorizzato; controllare prima e dopo, non toccare alleanze/account originali.
2. Verificare in dashboard **acc-test → Authentication → URL Configuration** Site URL, Redirect URLs e template email. Nessuna azione consentita nella sessione di sola lettura; non abilitare la registrazione finché mancano verifiche.
3. Collaudo email reale (signup, conferma una volta, ritorno staging, recupero password, riuso link con messaggio chiaro). Separare link monouso da redirect sbagliati.
4. Integrare nella build cumulativa la patch di testo/login e provare l'esito in browser reale, inclusi smartphone.
5. Finire matrice mobile e cinque lingue su tutte le sezioni; non promuovere il modulo Guide/Arena ancora prototipale alla Fase 4.

**Nessuna nuova build ZIP, nessun deploy e nessun intervento in produzione.**
