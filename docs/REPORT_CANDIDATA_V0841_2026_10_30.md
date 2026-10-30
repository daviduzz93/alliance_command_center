# ACC — Candidata cumulativa privata v0.8.4.1, 30 ottobre 2026

## Risultato e stato
**Pacchetto in Library privata:** `/Alliance Command Center/ACC_v0_8_4_1_Fase4_Cumulativa_PRIVATA_TEST.zip` (2.489.997 byte, 23 elementi). **Non pubblicato.**

**SHA-256 ZIP:** `d98c552d8a65b5c39d593d973d7af3a6ce0d5f4f62705c06d3200b7db0235851`.

**Provenienza:** ZIP privata v0.8.4 originaria + due patch, applicate nell'ordine con `git apply --check` e `git apply` senza conflitti:

1. `ACC_v084_Login_NotaNonUfficiale_UI_fix(2).patch`: login e registrazione di pari altezza, breve nota non ufficiale in cinque lingue, onboarding con R5 e invito R4/R5.
2. `ACC_v084_mobile_and_browser_regression_v1.patch`: sistemazione file input emblema a 320px, avvolgimento testo della Home tedesca a 320px, aggiunta suite Playwright mock.

**Differenze dal pacchetto v0.8.4 precedente:** `index.html`, `app.js`, `styles.css` e documenti `README.md`, `ISTRUZIONI_TEST.txt`; nuovi `tests/browser-matrix.py`, `docs/REPORT_BUILD_V0841.md`. **Nessun altro sorgente o asset modificato.**

## Verifica eseguita

- ZIP validato (`zipfile.testzip()` e confronto byte-per-byte di ogni file estratto): PASS.
- `node --check` su `app.js`, `theme.js`, `config.js`: PASS.
- `node tests/check-core.cjs`: PASS (12 temi/modalità, redirect HTTPS, 163 riferimenti × 5 lingue).
- `python tests/browser-matrix.py`: PASS **1.684/1.684** (4 larghezze × 5 lingue × 6 palette × 2 varianti luce × 7 pagine, più 4 controlli login/registrazione).
- Isolamento configurazione: il client contiene esclusivamente l'URL di `acc-test`, non l'ID progetto di produzione; **`AUTH_REDIRECT_VERIFIED=false`**; nessuna chiave `sb_secret_` o `service_role` in `config.js`.

**ATTENZIONE:** browser test con Supabase **simulato**, non collaudo reale login/email/RLS. I 78/78 test API originali sono stati eseguiti prima di questa build e NON nuovamente eseguiti oggi.

## Da completare prima di promuovere la build

1. Test in browser Work sullo **staging HTTPS privato** con account Auth reali e ruoli R1/R4/R5. Sostituire l'attuale staging soltanto con autorizzazione e piano rollback.
2. Verificare in Supabase **acc-test → Authentication → URL Configuration** Site URL e Redirect URLs, template email e prove reali di signup/conferma/recovery. Solo allora valutare `AUTH_REDIRECT_VERIFIED=true` in una build di test successiva.
3. Ripulire la fixture `ACC QA UI 20261029` e i quattro account sintetici mediante accesso amministrativo autorizzato; **non toccare l'utente originale**. La cancellazione è stata bloccata dai controlli del connettore e non è stata eseguita.
4. Nessun deploy pubblico o modifica di `main`, GitHub Pages, Supabase produzione.

## Effetto sul lavoro futuro
Questa candidata continua a consolidare **la Fase 4**. Guide, Arena e DS sono prototipi separati, da non dichiarare integrati.
