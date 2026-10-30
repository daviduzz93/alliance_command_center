# ACC — Registro giocatori Last War, candidata privata di sviluppo (30/10/2026)

**Stato:** implementato su copia privata della v0.8.4.1, **non integrato in staging e nessuna migrazione database applicata**.

## Materiale nella Library privata
- `ACC_Membri_RegistroGioco_DEV_v0_1_PRIVATO.zip` (codice completo, SQL, report e test)
- `ACC_Modello_Giocatori.xlsx` (importazione dei giocatori)
- `ACC_REPORT_MEMBRI_ROSTER_DEV.md` (specifica e test completi)
- `ACC_ROSTER_PREVIEW_NOT_APPLIED.sql` (migration candidate solo da rivedere)

## Funzionalità preparate
- Dentro `Membri`, due viste autonome: `Giocatori Last War` e `Account ACC`.
- Registro indipendente dagli account ACC: nickname, rango di gioco, potenza T1, tipo T1 e attivo. Ricerca, ordinamento, aggiunta, modifica e cancellazione.
- Excel XLSX vero per import/export con duplicati saltati; limite massimo di 100 giocatori attivi, trasparente all'utente.
- Proposta di RLS Supabase: lettura agli appartenenti all'alleanza, scrittura riservata a R4/R5 secondo le membership ACC. Sono regole ancora **da verificare con utenti Auth reali**.
- Niente dati Desert Storm nel registro: iscrizioni e rotazioni restano nel modulo DS.

## Prove effettuate
- 1.684/1.684 controlli browser di regressione UI, **mock Supabase**.
- 36/36 prove browser specifiche del nuovo roster, **mock Supabase**.
- Sintassi JavaScript e core test: PASS.
- File Excel esportato dal browser verificato tramite importatore di spreadsheet separato: contenuti corretti.
- Archivio ZIP integrity check: PASS.

## Limiti e prossimi passi
- Nessun test vero delle nuove policy RLS, nessuna migrazione applicata, nessun dato nuovo su acc-test o produzione.
- Prima di qualsiasi deploy: rivedere SQL, provarlo in transazione su acc-test, migrazione autorizzata, RLS test con R1/R4/R5 e membro estraneo, test Excel browser reale e collaudo regressione.
- La candidata Fase 4 v0.8.4.1 resta separata e non è sostituita.
- Non pubblicare sorgenti o ZIP nel repository GitHub pubblico; conservarli soltanto in Library privata.
