# ACC — Membri v0.3: anagrafica unica senza stelle tattiche (30/10/2026)

**Stato:** schema Supabase modificato **solamente in acc-test**; frontend su ZIP privata DEV, **non pubblicato**. Fase 4 v0.8.4.1 separata e non modificata.

## Decisione di prodotto

Il campo `tactical_power` da 1–5 stelle e il campo `is_active` sono eliminati dal registro Last War. Classificazione Nucleo/Forti/Rotazione da progettare **solo in Gestione DS**, senza duplicazioni in Membri.

Unica lista: nickname Last War, rango di gioco, potenza T1 numerica, tipo T1, stato di collegamento ACC. I ranghi Last War **non** assegnano permessi ACC. R4/R5 gestiscono, altri membri consultano. R4/R5 possono collegare esplicitamente un account ACC della stessa alleanza.

## Backend realmente aggiornato (solo acc-test)

- Migrazione registrata: `acc_members_single_roster_t1_no_tactical_stars_20261030`.
- Riutilizzata `public.alliance_members` preesistente, vuota al momento della migrazione. Nessuna nuova tabella `acc_roster_players`.
- Nuovi campi: `t1_power bigint`, `squad_type text`, `acc_user_id uuid`. Campi `tactical_power`, `is_active` rimossi **dopo controllo tabella vuota**.
- FK su `(alliance_id,acc_user_id)` → `alliance_memberships(alliance_id,user_id)`, `ON DELETE SET NULL (acc_user_id)`; unicità nickname case-insensitive e account collegato una sola volta per alleanza.
- Trigger `SECURITY INVOKER` applica max 100 giocatori ed evita cambi diretti di alleanza della riga. RLS originale conservata, `alliance_members` con 0 righe dopo i test.
- Nessun utente, membership, alleanza o invito creato/cancellato.
- Nessuna modifica a Supabase produzione `gxpfultivhwxkjffvbjx`.

## Frontend

- ZIP in Library privata: `/Alliance Command Center/ACC_Membri_Lista_Unica_DEV_v0_3_ACC_TEST.zip`.
- `roster.js` usa ora tabella `alliance_members` e colonna `game_name` in tutte le CRUD, XLSX allineato, testi di valutazione tattica rimossi.
- Test vecchio del modello a due schede rimosso perché non più applicabile.
- Excel modello resta quello v0.2, senza stelle e senza stato attivo.

## Test

- **1.684/1.684** controlli browser offline generali, Supabase mock.
- **35/35** controlli mirati della lista unica, Supabase mock.
- Node syntax e core checks: PASS.
- SQL su `acc-test` eseguiti come ruolo `authenticated` con contesto `auth.uid()` impostato artificialmente e **transazioni annullate**: R5 può inserire/leggere/collegare, R4 può inserire dopo promozione temporanea, R3 non può inserire; link fuori membership e duplicati case-insensitive negati. **Non sono test di login JWT autentico via client**.
- Fine controlli: zero righe persistenti, rango account sintetico ripristinato; migrazione strutturale persistita.

## Limiti e attività ancora necessarie

1. Smoke test reale frontend con Supabase REST/Auth su staging privato, previa autorizzazione al deploy; matrice R1/R4/R5 e isolamento cross-alliance.
2. Controllare comportamenti in errore/import XLSX reali, concorrenza al limite 100 e smarrimento membership.
3. Risolvere separatamente i problemi della Fase 4 su email Auth e fixture QA; non toccare i dati QA preesistenti senza autorizzazione.
4. Non pubblicare codice della ZIP nel repository GitHub pubblico.

La revisione 1.20 e precedenti descrivono il percorso storico: **la nuova fonte di verità è la presente rev. 1.21**.
