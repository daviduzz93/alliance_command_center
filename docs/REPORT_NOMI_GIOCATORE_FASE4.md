# ACC — Sistema nomi giocatore per alleanza: implementazione test

**Data:** 28 ottobre 2026  
**Ambiente:** solo Supabase `acc-test` (`tehijaphavnemchizzbm`)  
**Migrazione applicata:** `acc_phase4_game_player_names_v1` — **SUCCESS**  
**Branch:** `test/acc-phase4-ranghi-r1-r5`  
**Produzione, `main`, hosting pubblico:** INVARIATI.

## Decisione dati D-011

Un giocatore può avere un nickname Last War diverso per ogni alleanza. È stato aggiunto `public.alliance_memberships.game_player_name text`, **nullable soltanto per compatibilità con i membri legacy**; il valore non sostituisce `profiles.display_name`, che resta relativo al profilo account ACC.

La validazione applicativa ammette da 1 a 64 caratteri Unicode, conserva lettere accentate ed emoji, rimuove spazi esterni e comprime sequenze di spazi, rifiuta stringhe vuote o caratteri di controllo. **Il limite di 64 caratteri è un limite ACC provvisorio e NON una regola Last War verificata.** Un vincolo SQL controlla lunghezza/trim/caratteri di controllo sui valori memorizzati. Le interfacce devono renderli come testo, non HTML.

Nessun backfill automatico dei sei membri attualmente presenti; `game_player_name IS NULL` segnala che il nickname è ancora da confermare. **Non cambiare i ranghi dei membri legacy.**

## API Supabase aggiunte (solo `acc-test`)

| RPC | Parametri | Risultato e permessi |
| --- | --- | --- |
| `acc_create_alliance_with_player_name` | `p_name` text, `p_server_number` integer, `p_game_player_name` text | Crea alleanza e registra nome del creatore **R5**, restituisce dati legacy più `game_player_name`; autenticazione richiesta |
| `acc_join_alliance_with_player_name` | `p_invite_code` text, `p_game_player_name` text | Entra R1, registra il nickname specifico della nuova alleanza; autenticazione richiesta |
| `acc_set_game_player_name` | `p_alliance_id` uuid, `p_target_user_id` uuid, `p_new_name` text | Modifica nickname: membro sempre sul proprio; R4/R5 su altri membri della **stessa** alleanza |
| `acc_list_members_v2` | `p_alliance_id` uuid | Tabella con `user_id`, `display_name` (nome visibile), `game_player_name` (nullable), `rank`, `joined_at`; solo membri della medesima alleanza |
| `acc_validate_game_player_name` | `p_name` text | Helper interno di validazione; **nessun EXECUTE da anon/authenticated** |

`acc_list_members` **resta con identica firma a 4 colonne** ma preferisce il nickname di gioco, quando presente, al profilo globale. Le vecchie RPC `create_alliance_with_invite` e `join_alliance_with_invite` **rimangono operative** per non rompere subito il frontend attuale. **Attenzione: questo significa che l'obbligatorietà del nickname non è ancora garantita sui vecchi endpoint.** Nella prossima fase di migrazione frontend andrà pianificata la loro dismissione o restrizione dopo prova di compatibilità.

I nuovi endpoint richiedono `authenticated` e controllano `auth.uid()` / ruoli realmente presenti su `alliance_memberships`. Le scritture dirette alla tabella restano negate a `authenticated`, anche per proprietari R5. Nessuna modifica a `user_id`, `alliance_id`, `role`, `rank` o `server_number` da `acc_set_game_player_name`.

## Test eseguiti sul PostgreSQL reale di `acc-test`

**18/18** test funzionali con `SET LOCAL ROLE authenticated`, `request.jwt.claim.sub` di account esistenti (identità simulate **dentro SQL**, non sessioni browser), **BEGIN/ROLLBACK**:
- R5 cambia proprio nome; ruolo/rango invariati.
- R5 modifica un nome R1.
- La vecchia lista e la nuova lista restituiscono correttamente il nickname.
- R1 cambia il proprio nome; R1 non modifica quello di R5 o una alleanza altrui.
- R4 può modificare nome di R5 della propria alleanza, oltre al proprio.
- Input vuoti, troppo lunghi e contenenti newline rifiutati.
- UPDATE diretto al campo negato.
- Nome Unicode, emoji ed accenti accettati.
- Creazione alleanza con nickname R5 e ingresso con invito con nickname R1 **realmente eseguiti in transazione**, poi annullati.
- Server correttamente ereditato, senza variazioni.
- Un nickname modificato in una nuova alleanza non modifica quello dello stesso account in un'altra.

**4/4** test addizionali in transazione **rollback**:
- R4 non modifica nickname di un'altra alleanza.
- R4 non può elencare i membri di una seconda alleanza tramite la nuova lista.
- La nuova RPC creazione rifiuta nickname vuoti.
- La nuova RPC ingresso con invito rifiuta nickname vuoti.

**Totale: 22/22 controlli funzionali / negativi superati**, oltre al controllo grant: `anon` senza esecuzione su nuovi endpoint, `authenticated` con accesso alle RPC applicative; validatore interno non esposto.

**Baseline dopo test, dati non alterati:** 3 alleanze, 6 appartenenze, 0 nomi gioco valorizzati (tutti legacy in attesa di conferma).

**Limiti:** i test SQL con JWT simulato NON equivalgono a test HTTP/PostgREST con token Supabase Auth reali. Nessun login o flusso browser nuovo è stato collaudato; frontend ZIP v0.8.2 non ancora modificato per chiamare le nuove RPC.

## Sicurezza: advisor dopo la migrazione

Supabase Security Advisor rileva:
- **12** funzioni `SECURITY DEFINER` eseguibili da `authenticated`. Sono soprattutto gli endpoint RPC applicativi; è necessario mantenere controlli interni rigorosi, ridurre la superficie pubblica quando possibile e testare anche con sessioni reali.
- **1 INFO** `alliance_invites` con RLS ma senza policy (RPC only).
- **1 WARN** protezione password compromesse disabilitata.

Non interpretare questi warning come errori di autorizzazione già provati; restano un rischio da riesaminare prima della produzione.

## Lavoro frontend (DA REALIZZARE, non concluso)

1. Form «Crea alleanza»: richiedere `p_game_player_name` e usare `acc_create_alliance_with_player_name` su `acc-test`.
2. Form «Unisciti»: richiedere `p_game_player_name` e usare `acc_join_alliance_with_player_name`.
3. Lista Membri: usare `acc_list_members_v2`; nickname come campo principale e indicazione «Da completare» se ancora NULL, senza confondere il fallback del profilo con un nickname confermato.
4. Cambia nickname: da ogni rango per sé, R4/R5 per gli altri membri della stessa alleanza con `acc_set_game_player_name`; dopo salvataggio aggiornare elenco, barra laterale, riferimenti al giocatore.
5. Casi legacy: invitare ogni membro con nickname NULL a confermarlo; senza bloccare login, inviti o accessi ai membri già presenti.
6. Includere contemporaneamente gli altri interventi UI richiesti: «LE TUE ALLEANZE» sopra griglia di due colonne, allineamento lingua e tasto Indietro, correzioni Light e sezioni Impostazioni.
7. Test responsive, 6 palette e 5 lingue; collaudo con account autentici; staging protetto. **Nessun ZIP separato** da produrre per questa modifica isolata.
8. Prima del rilascio, gestire la transizione e la restrizione degli endpoint legacy che ancora permettono il join senza nickname.

## Vincoli di distribuzione

**Non** pubblicare sorgenti della prossima build nel repository attualmente pubblico mentre è in corso la separazione dei sorgenti privati. **Non** eseguire alcuna migrazione su Supabase produzione o modifica a `main` senza approvazione esplicita.
