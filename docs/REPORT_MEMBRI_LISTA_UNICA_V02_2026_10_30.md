# ACC — Decisione e candidata privata Membri v0.2 (lista unica)

**Data:** 30 ottobre 2026  
**Stato:** sviluppo privato, **non integrato nella Fase 4, non pubblicato**, nessuna migrazione SQL applicata.

## Nuovo requisito UX, confermato dall'utente

Non creare due elenchi separati «Giocatori Last War» e «Account ACC». In **Membri** deve esserci un'unica lista dei **giocatori effettivi Last War**, ciascuno con nickname, rango di gioco, potenza T1, tipo T1 e indicazione **ACC registrato / non registrato**. R4/R5 gestiscono la lista e collegano esplicitamente un account ACC a un giocatore. Il collegamento è per `acc_user_id`, non per semplice somiglianza dei nickname, ed è valido solo se la membership esiste nell'alleanza corrente. Un account non può essere collegato a due giocatori della stessa alleanza. I ranghi Last War e i ranghi/permessi ACC restano indipendenti.

**Rimosso «Attivo»** come campo del registro. Si tengono nell'elenco soltanto i giocatori attualmente presenti; il futuro storico DS terrà i riferimenti alle partecipazioni passate indipendentemente dalla rimozione dal registro corrente. Massimo 100 giocatori per alleanza, non «100 attivi».

## Lavoro effettuato

- Partendo dal pacchetto privato `ACC_Membri_RegistroGioco_DEV_v0_1_PRIVATO.zip`, creato `ACC_Membri_Lista_Unica_DEV_v0_2_PRIVATO.zip`.
- Nella stessa riga del giocatore compaiono stato ACC e, quando registrato, azioni per il relativo account già disponibili nell'app, rispettando i permessi.
- Aggiornati import/export XLSX, modello Excel, 5 lingue, responsive.
- Candidata migrazione rivista con `acc_user_id`, RLS per alleanza, vincoli di unicità, limite 100 e verifica dell'appartenenza; **salvata solo in Library privata**, nessuna applicazione.

## Verifiche

- Browser Chromium **35/35 test specifici PASS**, Supabase **simulato**.
- Regression UI **1.684/1.684 PASS**, Supabase **simulato**.
- Node syntax + `tests/check-core.cjs`: PASS.
- XLSX import/export nel browser simulato: PASS.
- ZIP verificato: SHA-256 `030c559d5be3f7956480ae513f0323a20eca79d94edff6e2e6711fd0bd5a233b`.

## Stato database e limite di integrazione

Ispezione in **sola lettura** di `acc-test`: `public.alliance_memberships` con PK `(alliance_id,user_id)`, enum `member_rank` R1–R5; esiste inoltre una tabella precedente `public.alliance_members`, attualmente vuota nel progetto di test, con schema differente. Prima di adottare definitivamente `acc_roster_players` occorre decidere come evitare ridondanze con la tabella storica. Nessun deploy, no modifiche a `main`, Pages, staging, test DB o produzione.

**File nella Library privata:**
- `ACC_Membri_Lista_Unica_DEV_v0_2_PRIVATO.zip`
- `ACC_Modello_Giocatori_LISTA_UNICA.xlsx`
- `ACC_REPORT_MEMBRI_LISTA_UNICA_v0_2.md`
- `ACC_ROSTER_LISTA_UNICA_PREVIEW_NON_APPLICATA.sql`

**Nota:** la candidata cumulativa Fase 4 v0.8.4.1 rimane invariata e non è sostituita dalla candidata Membri.
