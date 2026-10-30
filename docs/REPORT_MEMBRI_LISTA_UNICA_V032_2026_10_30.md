# ACC Membri v0.3.2 — affidabilità badge ACC in caso di errori Auth/RPC

**Data:** 30 ottobre 2026. **Stato:** sviluppo privato, **non pubblicato su staging**, build privata archiviata nella Library.

## Cosa è stato corretto

La lista unica v0.3.1 classificava erroneamente i giocatori come «Non registrato ACC» se falliva la RPC `acc_list_members_v2`. Era possibile anche perdere il collegamento `acc_user_id` durante una modifica T1, perché la lista degli account non era disponibile e il selettore si azzerava.

La v0.3.2 distingue tre stati per il badge: **in verifica / stato verificato / ACC non verificabile**. In assenza della risposta RPC, un collegamento esistente viene conservato durante le modifiche. L'export XLSX lascia la colonna di registrazione **vuota**, senza attribuire erroneamente «No». Traduzioni in 5 lingue.

## Collaudi

- **46/46** test browser specifici (includono simulazione RPC fallita, export Excel senza falso «No», conservazione `acc_user_id` dopo modifica T1, ripristino dopo ritorno RPC).
- **1.684/1.684** test browser regressione, totale **1.730/1.730 PASS**; Supabase **simulato**.
- `node --check` e `check-core.cjs` **PASS**.
- Pacchetto ZIP verificato: **34 file**, SHA256 `75a7f3cb00d0d4cf9bd3e7942e480c90d68913e5f751fe4f9d5f104f01511a7d`.
- File Library: `ACC_Membri_Lista_Unica_DEV_v0_3_2_PRIVATO.zip`, `ACC_REPORT_MEMBRI_LISTA_UNICA_v0_3_2.md`, `ACC_CHECKLIST_COLLAUDO_REALE_MEMBRI_V032.md`.

## Verifiche eseguite con Supabase effettivo

Sul progetto `acc-test` è stata confermata **in sola lettura** la migrazione v0.3, i campi della tabella e lo schema dell'RPC `acc_list_members_v2`. La sandbox non risolve il dominio HTTPS REST del progetto Supabase e non possiede una sessione browser Work autenticata: **nessuna chiamata Auth REST con JWT reale eseguita**. Non è stato effettuato deploy nello staging.

## Prossimo passo vincolante

Eseguire la checklist su staging privato con Work, previa autorizzazione del proprietario, con R1/R4/R5 reali e prova di cambio alleanza. Nessuna promozione in produzione senza collaudo. Lo schema `acc-test` è invariato rispetto alla migrazione v0.3. Nessun inserimento, eliminazione o modifica di dati; non toccate le fixture QA pregresse. Sorgenti e archivio rimangono **privati** (non pubblicare nel repository GitHub pubblico).

**Non dichiarare Fase 4 o Membri rilasciati.**
