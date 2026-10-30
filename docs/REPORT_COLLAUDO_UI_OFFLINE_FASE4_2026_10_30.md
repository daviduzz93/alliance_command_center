# ACC — Collaudo offline UI autenticata e patch responsive

**Data:** 30 ottobre 2026  
**Branch di documentazione:** `test/acc-phase4-ranghi-r1-r5`  
**Build di riferimento:** `ACC_v0_8_4_Fase4_Cumulativa_PRIVATA_TEST.zip` (Library privata, **nessuna modifica a staging**).

## Perimetro del lavoro

Su **copia locale** dei sorgenti ZIP privati:
1. Applicata con successo la patch preesistente `ACC_v084_Login_NotaNonUfficiale_UI_fix(2).patch` (disclaimer cinque lingue, allineamento dei pannelli login/registrazione, correzioni R4/R5).
2. Creato un nuovo test Chromium Playwright `tests/browser-matrix.py` con una **sessione Supabase simulata** e tre membri fittizi R5/R4/R1. Non contatta Supabase e non sostituisce i test Auth reali.
3. Collaudati quattro viewport 1280/768/375/320 CSS px × cinque lingue IT/EN/FR/ES/DE × sei palette Command/Midnight/Emerald/Sunburst/Inferno/Violet × due modalità Dark/Light × sette pagine Home/Membri/DS/Treni/Notifiche/Guide/Impostazioni = **1.680 controlli**.
4. Verificati, inoltre, i pannelli Accedi e Crea account in quattro viewport: stessa larghezza e altezza, nota di non ufficialità visibile (**4 controlli**).

## Problemi realmente trovati

- **320px, pagina Impostazioni, tutte le lingue/temi:** il campo HTML `input[type=file]` per lo stemma aveva una larghezza minima intrinseca di 299px e provocava overflow orizzontale. Correzione CSS: contenitore flex con `min-width:0` e file input `width:100%;max-width:100%;min-width:0;box-sizing:border-box`.
- **320px, Home, lingua tedesca:** l'etichetta `Benachrichtigungen` forzava un overflow perché non andava a capo. Correzione CSS: `.home-tile b{max-width:100%;overflow-wrap:anywhere}`.

## Risultati

- Prima delle correzioni: **72 fallimenti UI** (Impostazioni a 320 px).
- Dopo prima correzione: **12 fallimenti UI** (Home in tedesco a 320 px).
- Dopo entrambe: **1.684/1.684 controlli Chromium PASS**, nessun errore `pageerror` nel contesto simulato.
- `node --check app.js` PASS.
- `node tests/check-core.cjs` PASS: 12 combinazioni palette/modalità con persistenza per alleanza, guardia HTTPS redirect, 163 riferimenti HTML tradotti × cinque lingue.
- Test di applicabilità patch: estratta di nuovo la ZIP **originale**, applicata la vecchia patch del login e poi la nuova con `git apply --check` e `git apply`: entrambe PASS; rieseguito l'intero collaudo PASS.

## File preparati in Library privata

- `/Alliance Command Center/ACC_v084_mobile_and_browser_regression_v1.patch`: **incrementale**, applicare **DOPO** `ACC_v084_Login_NotaNonUfficiale_UI_fix(2).patch`. Aggiunge i due fix CSS e il test Python.
- `/Alliance Command Center/ACC_v084_browser_matrix_test_v1.py`: script di test separato per revisione e futura integrazione.

**Nessuna nuova build cumulativa ZIP** per due fix CSS. Non è stata modificata la v0.8.4 dello staging, GitHub main, Pages o Supabase produzione. Non sono stati creati/eliminati utenti su `acc-test`.

## Limiti e prossimi passi

Il collaudo è **UI offline con Supabase simulato**: non afferma autenticazione riuscita, RLS corretta, inviti realmente ruotati, email consegnate, notifiche browser mobile fisico o recupero password. Queste prove restano in Work/Staging dopo le autorizzazioni necessarie.

Work dovrà, quando pronto: integrare entrambe le patch nella successiva build cumulativa privata, pubblicarla nel solo staging di test, eseguire uno smoke test con Auth reale R1/R4/R5, e verificare le email su `acc-test` senza abilitare `AUTH_REDIRECT_VERIFIED` prima della configurazione corretta. La pulizia della fixture `ACC QA UI 20261029` è ancora bloccata e non è stata riprovata.
