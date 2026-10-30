# ACC — Gestione DS, Iscrizioni DEV v0.1 (30 ottobre 2026)

**Stato:** nuova sezione integrata in una **build privata di sviluppo** derivata da Membri v0.3.3. **Nessun deploy**. SQL Supabase predisposto ma **NON applicato**.

## Funzionalità

- Gestione DS → Iscrizioni nella vera app ACC, unica fonte giocatori `public.alliance_members`.
- Disponibilità settimanale per venerdì: solo 12:00, solo 21:00, entrambe, nessuna; assenza di risposta distinta da `none`.
- Da **lunedì 00:00 fino a giovedì 03:00, Europe/Rome**, orario deciso per il reset; la scadenza viene validata anche lato database nello script proposto. Date passate/future e settimane finalizzate in sola lettura.
- R4/R5 inseriscono disponibilità per qualsiasi giocatore della propria alleanza (anche senza account ACC); R1–R3 possono modificarla solo per il giocatore espressamente collegato al loro account ACC. RLS e trigger devono essere testati con JWT reali prima della prima migrazione.
- Calendario con cambio settimana, ricerca giocatori, filtri risposto/non risposto, contatori distinti, testo riepilogativo copiabile, cinque lingue, UI responsive.
- Iscrizione a entrambi gli orari **non equivale a due partecipazioni né a due assegnazioni**. Formazioni, classificazione DS, storico e blocco definitivo ancora non implementati.

## Backend proposto, non applicato

File privato `sql/ACC_DS_ISCRIZIONI_PREVIEW_NON_APPLICATA.sql` crea `acc_ds_registrations` e una tabella `acc_ds_week_locks` predisposta per la finalizzazione futura. Prevede RLS isolate per alleanza, write riservato a R4/R5 o al proprio giocatore collegato, trigger lato server su finestra iscrizioni ed eventuale blocco anticipato. Storico dei nomi via snapshot anche in caso di cancellazione dal roster.

**Verifica in sola lettura su `acc-test`**: nessuna tabella DS preesistente. Nessuna migrazione eseguita, dati, fixture QA e produzioni invariati.

## Test offline

- 23/23 asserzioni calendario, inclusa ora legale.
- 36/36 browser mock Iscrizioni: R5/R4/R1, nessuna vs mancata risposta, settimana chiusa/finalizzata, assenza backend, 4 viewport × 5 lingue.
- 1.684/1.684 regressioni browser app, Supabase simulato.
- 46/46 regressioni browser Membri, Supabase simulato.
- Node syntax e `check-core.cjs` PASS.
- **Totale 1.789/1.789 asserzioni browser/calendario PASS** (senza test JWT REST o migrazione reale).

## File in Library privata

- `ACC_DS_Iscrizioni_DEV_v0_1_PRIVATO.zip`
- Il report tecnico dettagliato è **dentro lo ZIP**, `docs/REPORT_DS_ISCRIZIONI_DEV_v0_1.md`
- Lo SQL è nella cartella `sql/`, da non applicare senza review e test preliminari.

**Non promuovere questa candidata a staging/prod.** Restano separati la candidata Fase 4 v0.8.4.1 e il modulo Membri v0.3.3. Prossimo passaggio prima del collaudo reale: autorizzare review e applicazione SQL soltanto su `acc-test`, poi testare con utenti e JWT reali. Nessun inserimento di sorgenti riservati nel repo GitHub pubblico.
