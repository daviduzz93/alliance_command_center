# ACC — Specifiche e verifiche per la build candidata v0.8.2

**Data:** 28 ottobre 2026  
**Ambiente frontend:** ZIP locale di test, **non caricato nel repository pubblico**  
**Database:** solo Supabase `acc-test` (`tehijaphavnemchizzbm`); produzione invariata  
**Branch GitHub:** `test/acc-phase4-ranghi-r1-r5` (solo documentazione in questa fase)

## Richieste dell'utente e stato

1. **Login:** rimuovere interamente «MULTI-ALLIANCE · AMBIENTE DEMO». **Realizzato nella build candidata**; rimosso anche il riferimento nelle cinque traduzioni. Restano titolo, slogan, descrizione e scelta lingua.
2. **Light:** alcune intestazioni dei menu risultavano bianche su sfondo bianco. **Corretto nella build candidata:** titoli scuri e accenti contrastanti per Command, Midnight, Emerald, Sunburst, Inferno, Violet; senza alterare la resa Dark.
3. **Impostazioni / lingua:** eliminare il selettore duplicato; conservare quello in alto a destra (e quello del login). **Realizzato nella build candidata**; rimossi controllo e handler superflui.
4. **Nome alleanza:** solo R5 può modificare il nome, non il numero del server. **UI candidata e backend applicato a `acc-test`**: card «Identità dell'alleanza» con nome editabile soltanto per R5, read-only per R1–R4, numero server visualizzato come testo immutabile.

### Dettagli backend e sicurezza

Migrazione Supabase **`acc_phase4_owner_only_alliance_rename`** applicata con esito `success:true` al progetto di test.

- RPC `public.acc_rename_alliance(p_alliance_id uuid, p_new_name text)`, eseguibile soltanto da utenti autenticati.
- Internamente controlla `auth.uid()` e il ruolo owner **nella specifica alleanza**; non si affida a JavaScript, email o ai dati modificabili del JWT.
- Nome: spazi normalizzati, da 2 a 50 caratteri; aggiorna **solo `name` e `updated_at`**, restituisce anche `server_number` senza modificarlo.
- Revocato il permesso diretto `UPDATE` su `public.alliances` a `anon` e `authenticated`; anche R5 non può modificare direttamente `server_number` via API.
- `GRANT EXECUTE` su RPC solo a `authenticated`; verificato che `anon` non abbia accesso.
- La policy RLS storica `alliances_update_owner` resta presente ma la revoca dei privilegi diretti prevale. Verificare eventuali futuri moduli che dovessero usare update diretti e prevedere specifiche RPC, senza ripristinare aggiornamenti generici.

### Test realizzati

| Test | Esito | Ambiente |
| --- | --- | --- |
| Sintassi JavaScript `app.js` e `theme.js` | **PASS** | Node.js |
| Rimozione testo DEMO e selettore lingua nelle Impostazioni | **PASS** | Ispezione DOM + test Chromium |
| UI R5: può rinominare, aggiorna subito il nome nella barra | **PASS simulato** | Chromium, mock Supabase |
| UI R1/R4: campo sola lettura e nessun bottone Salva | **PASS simulato** | Chromium, mock Supabase |
| UI server: numero mostrato come testo, non input | **PASS simulato** | Chromium, mock Supabase |
| Cinque lingue di interfaccia | **PASS simulato** | Chromium, mock Supabase |
| Contrasto intestazioni Light (6 palette × 9 elementi) | **54/54 PASS**, contrasto minimo misurato 4,5:1 | Chromium, CSS reale, mock Supabase |
| R5 rinomina tramite funzione SQL con `authenticated` | **PASS**, test con JWT simulato e `ROLLBACK` | PostgreSQL reale `acc-test` |
| Nomi vuoti/troppo corti vietati | **PASS** | PostgreSQL reale `acc-test` |
| Numero server invariato e UPDATE diretto negato | **PASS** | PostgreSQL reale `acc-test` |
| R4 e R1 non possono rinominare la propria alleanza | **PASS** | PostgreSQL reale `acc-test` |
| ZIP locale candidata v0.8.2 | **Creato, integrità ZIP verificata** | Artefatto di questa conversazione |

**Limiti:** i test Chromium usano Supabase simulato. I test PostgreSQL usano contesto `authenticated` con JWT simulato in una transazione di cui è stato eseguito `ROLLBACK`; non sostituiscono login utente reale, controlli per dispositivi diversi e test su staging accessibile. La persistenza completa dopo Ctrl+F5 va ricontrollata nel nuovo pacchetto.

### Distribuzione

- **Non pubblicare sul branch pubblico** i sorgenti v0.8.2 prima di completare la separazione del repository privato, concordata con l'utente.
- Il file `config.js` nel pacchetto contiene ancora un **segnaposto publishable key** dell'ambiente `acc-test`; prima di test reali occorre inserire esclusivamente la publishable/anon key di **`acc-test`**, mai una service-role/secret key.
- La migrazione è applicata solo su `acc-test`, non in produzione. Prima di pubblicare occorrerà migrare sul database produzione dopo approvazione.
- Conservare la versione già utilizzata dall'utente come possibilità di rollback.
- I componenti DS, Treni, Notifiche e Guide restano nelle fasi già precedentemente documentate.

### Richieste aggiuntive da includere nel prossimo rilascio cumulativo (28/10/2026)

**Richiesta esplicita del proprietario:** NON creare un nuovo ZIP/build/versione per questa singola modifica. Registrare e aggregare con le prossime correzioni. **Stato: da implementare, non ancora testato.**

**Schermata «Cambia alleanza» / selezione alleanza:**
1. I due riquadri di azione «Crea una nuova alleanza» e «Unisciti a un'alleanza» rimangono all'inizio, nel layout corrente.
2. Posizionare il titolo «LE TUE ALLEANZE» su una **riga autonoma** a tutta larghezza, **sopra** i riquadri delle alleanze già associate al giocatore; nessun riquadro di alleanza deve apparire a fianco della scritta.
3. Disporre i riquadri delle alleanze **sempre su due colonne**, anche alle dimensioni mobili previste (adattare gap, padding, parole lunghe e dimensioni minime evitando overflow).
4. L'opzione di cambio lingua nella schermata di cambio alleanza deve comparire nella stessa posizione **in alto a destra** della barra utilizzata nelle altre pagine ACC, con gli stessi margini/stili e senza sovrapporsi ad altri controlli.
5. Il tasto **Indietro** deve comparire **nella barra superiore**, nella stessa posizione e stile delle altre sezioni, non come elemento isolato sopra il contenuto. Deve riportare alla pagina principale senza perdere l'alleanza corrente; confermare comportamento anche da mobile.
6. Verificare che queste regole funzionino sia quando si apre il cambio alleanza dalla dashboard sia quando il giocatore con più alleanze accede inizialmente; il tasto Indietro deve essere visibile solo quando c'è una pagina applicativa a cui tornare.

**Punti tecnici osservati nella build v0.8.2:** `index.html` contiene `#onboard`, `#back-to-app`, `#choices`, mentre l'app usa `#back-page` e `.header-right`; `app.js` genera attualmente gli elementi «LE TUE ALLEANZE» e le card in una stessa griglia `#choices`, in *due* percorsi distinti: `afterAuth()` e click di `#switch-alliance`. Refactoring consigliato in un unico renderer per impedire differenze tra i due flussi. `styles.css` contiene `.choices{grid-template-columns:1fr 1fr}` ma il breakpoint mobile forza `1fr`; la nuova sezione delle alleanze dovrà avere una griglia specifica `repeat(2,minmax(0,1fr))` invece di ereditare la colonna singola. `#language-wrap` è ora esterno alla barra, con posizionamento `fixed`. Prevedere allineamento coerente anche quando `#onboard` è attivo e senza cambiare l'aspetto del login.

**Criteri di accettazione da collaudare nella prossima build:**
- Titolo sempre sopra le tessere, non affiancato.
- Griglia esattamente a due colonne per ogni numero di alleanze, con ultima tessera sola a sinistra se dispari.
- Lingua a destra e tasto Indietro a sinistra sulla stessa barra, desktop e mobile.
- Nessuna regressione di selezione alleanza, login, inviti, navigazione, lingue e temi Light/Dark.

### Nuovo requisito: nome giocatore in Last War per ogni alleanza (28/10/2026)

**Stato: APPROVATO COME REQUISITO, DA IMPLEMENTARE NEL PROSSIMO PACCHETTO CUMULATIVO. NON creare un nuovo ZIP per questa singola richiesta. Non è stata applicata una migrazione.**

**Comportamento desiderato**
1. **Creazione alleanza:** nel modulo richiedere il **«Nome giocatore (Last War)»** dell'utente che crea l'alleanza, oltre al nome dell'alleanza e al numero del server. Il proprietario entra come R5 con quel nome.
2. **Ingresso tramite codice invito:** richiedere il **«Nome giocatore (Last War)»** nello stesso flusso, oltre al codice. Il nuovo membro entra R1 con il proprio nickname, senza poter selezionare/modificare il server dell'alleanza.
3. **Modifica successiva:** ogni giocatore può modificare **il proprio nome** in quella alleanza, indipendentemente dal rango. I membri **R4 e R5** possono correggere il nome degli **altri membri della stessa alleanza** dalla sezione «Membri». Questi permessi riguardano SOLO il nickname, non rango, server, account o appartenenza; non permettono interventi su altre alleanze.
4. **Visibilità:** usare il nome di gioco nell'elenco Membri e nei riferimenti al giocatore nell'alleanza; mantenere distinta l'identità interna dell'account ACC per login e permessi. Le future formazioni DS devono riferirsi all'identificativo del membro e mostrare il nickname aggiornato.

**Scelta dati motivata da verifica reale del backend `acc-test`:**
- Oggi `public.profiles.display_name` è associato a `user_id` e quindi **globale all'account**.
- Oggi `public.alliance_memberships` possiede `alliance_id`, `user_id`, `role`, `rank` ma **nessun nome giocatore per appartenenza**.
- `acc_list_members` mostra ora il nome dal profilo globale; `create_alliance_with_invite(p_name,p_server_number)` e `join_alliance_with_invite(p_invite_code)` non richiedono il nome gioco.
- **Decisione D-011:** memorizzare il nuovo `game_player_name` (nome definitivo da scegliere in migrazione) a livello di **`alliance_memberships`**, cioè un valore per coppia (utente, alleanza). Non sovrascrivere automaticamente `profiles.display_name`: così lo stesso account può appartenere a due alleanze con nomi differenti.

**Proposta di implementazione backend, da validare prima di eseguire SQL:**
- Migrazione non distruttiva che aggiunge `game_player_name` alle appartenenze; gestire utenti esistenti e nome non ancora valorizzato senza bloccare improvvisamente accessi attuali. Per gli account migrati si può proporre un valore dal profilo, richiedendo comunque conferma esplicita quando accedono al modulo.
- Estendere i flussi RPC create/join in modo compatibile con il frontend nuovo, verificando il comportamento delle firme PostgREST esistenti; validare lato server i nomi inseriti. Vietare valori vuoti, spazi non significativi, caratteri di controllo e markup non sanitizzato; non impedire accenti o caratteri ammessi nel gioco. Limite caratteri da allineare alle regole di Last War e ai test; non ipotizzarlo come già verificato.
- Nuova RPC per cambiare **solo `game_player_name`**: autenticazione obbligatoria; destinatario membro della specifica alleanza; autore == destinatario **oppure** autore R4/R5 della stessa alleanza. Un R4 che corregge il nickname di un R5 NON sta cambiando il suo rango; salvo nuova decisione il permesso di editare il nome resta quello espresso dall'utente.
- Denegare scritture dirette sulla colonna ai client; evitare RPC `SECURITY DEFINER` senza verifiche; preservare `rank`, `role`, `server_number`, `user_id`, `alliance_id`.
- Aggiornare `acc_list_members` e i componenti UI, preservando compatibilità e traduzioni IT/EN/FR/ES/DE.

**Test di accettazione per la prossima build cumulativa**
- Creazione come nuovo R5: nome richiesto, validato e salvato sull'appartenenza.
- Ingresso con invito: nome richiesto, validato e visibile nell'elenco Membri; server ereditato correttamente.
- Aggiornamento del proprio nome da R1/R2/R3/R4/R5; correzione da R4/R5 dei nomi degli altri membri della propria alleanza.
- Prove negative: R1 che tenta di cambiare il nome di un altro, R4/R5 che tenta di cambiare il nome di un'altra alleanza, sessione non autenticata, input vuoto/eccessivo, update diretto, tentativo di modificare server/rango tramite update nome.
- Multi-alleanza: un solo account con nomi di gioco differenti, cambio alleanza e nomi sempre corretti.
- Migrazione legacy: account già presenti non perdono l'accesso e sono invitati a completare/confermare il nome.
- Regressioni UI: tema Light/Dark, 6 palette, 5 lingue, menu Cambia alleanza, R1–R5, inviti e logout.

**Nessuna modifica applicata finora:** codice della v0.8.2, database `acc-test`, database produzione o branch `main`. Questa annotazione non equivale a funzionalità già sviluppata o testata.

### Stato backend aggiornato: nomi giocatore per alleanza (28/10/2026)

**IMPLEMENTATO E VERIFICATO IN DATABASE `acc-test`**, ma **NON ANCORA INTEGRATO NEL FRONTEND**. Riferimento ai contratti, test e limiti: [`REPORT_NOMI_GIOCATORE_FASE4.md`](./REPORT_NOMI_GIOCATORE_FASE4.md).

- Migrazione applicata `acc_phase4_game_player_names_v1`: colonna nullable `alliance_memberships.game_player_name`; valori storici non sovrascritti.
- Nuove RPC `acc_create_alliance_with_player_name`, `acc_join_alliance_with_player_name`, `acc_set_game_player_name`, `acc_list_members_v2`. La RPC precedente `acc_list_members` visualizza il nome di gioco quando valorizzato, mantenendo le stesse quattro colonne.
- **22/22 test PostgreSQL superati**, ruoli R1/R4/R5, input, nuova creazione, nuovo ingresso, isolamento fra alleanze e divieto di update diretto. Transazioni di prova annullate; restano 3 alleanze e 6 appartenenze.
- Le RPC vecchie di creazione/ingresso rimangono attive per compatibilità: **per ora possono ancora essere usate per creare/entrare senza nickname**. Prima di passare in produzione, aggiornare frontend e gestire la loro dismissione o restrizione; l'obbligatorietà non è ancora garantita globalmente.
- **Da implementare nel frontend cumulativo:** input dei nomi nei due form, sezione Membri con edit R4/R5 e edit personale, flusso di conferma dei nomi legacy, localizzazione, test reali HTTP/browser.
- **Non è stata prodotta una nuova build e la produzione non è stata toccata.**

### Frontend cumulativo v0.8.3 completato in candidata locale (28/10/2026)

**Documento di verifica:** [`VERIFICHE_BUILD_V083.md`](./VERIFICHE_BUILD_V083.md). **Stato: implementato nel pacchetto, test Chromium mock passati; E2E reale da fare.**

- Integrati tutti i requisiti accodati in questo documento: nome giocatore nella creazione e nell'ingresso, modifica nome personale e R4/R5, nomi specifici per alleanza, 2 colonne sotto «LE TUE ALLEANZE», lingua/Indietro nella toolbar.
- Pacchetto unico `ACC_v0_8_3_Fase4_Nickname_CambioAlleanza_TEST.zip` in Library privata del progetto; **non caricato nel GitHub pubblico**.
- 9/9 scenari UI (R1/R4/R5 × desktop/mobile 1280/375/320px), test creazione e ingresso con backend simulato, 5 lingue, 54/54 contrasti Light e sintassi Node superati.
- La build include l'URL e **la chiave publishable** di `acc-test` (mai service-role).
- **NON è un test browser autenticato reale.** Prima della produzione: E2E su staging, completamento nickname legacy e restrizione vecchie RPC, repository privato e approvazione.
- Nota: le righe precedenti descrivono lo stato alla data della v0.8.2 o i requisiti allora ancora da implementare; questo aggiornamento attesta la nuova candidata v0.8.3.

### Correzione strutturale «Cambia alleanza» senza nuova build (28/10/2026)

**Stato:** patch pronta, browser mock verificato, **da includere nel prossimo rilascio cumulativo**, non nella ZIP v0.8.3 già creata. La v0.8.3 mostrava il selettore come `#onboard` separato; il nuovo approccio lo porta come `#page-alliances` nello stesso contenitore `#app` degli altri moduli. Il primo accesso senza alleanza resta nella schermata iniziale.

- Patch privata salvata in Library `/Alliance Command Center/ACC_CambioAlleanza_stessa_struttura.patch`.
- Test `9/9` in Chromium con dati simulati: R1/R4/R5 e 1280/375/320px, header condiviso, barra laterale, tasto Indietro, lingua in alto a destra, due colonne, form e ritorno al modulo Home. Test sintassi e applicazione patch superati.
- **Da fare:** applicare la patch alla candidata prima del prossimo rilascio, eseguire test completa regressione UI/Auth/staging. Nessuna modifica a Supabase e produzione.

### Problema riscontrato nelle email di conferma (28/10/2026)

**Stato:** causa locale verificata, patch frontend preparata ma NON distribuita. Report [`REPORT_CONFERMA_EMAIL_ACC_TEST.md`](./REPORT_CONFERMA_EMAIL_ACC_TEST.md).

- Entrambi gli account prova 27/10 confermati correttamente; log di prime aperture 303, seconde aperture 403 per link monouso già consumati.
- Link di conferma indirizzavano a `localhost:3000` e `127.0.0.1:5500` anziché a uno staging ACC HTTPS.
- Patch privata `ACC_EmailConferma_HTTPS_test.patch` pronta in Library per applicazione **dopo** `ACC_CambioAlleanza_stessa_struttura.patch`. Aggiunge `options.emailRedirectTo`, URL obbligatorio HTTPS in `config.js`, messaggio chiaro quando manca configurazione. Validazione Node e 9 unit test superati.
- **Da completare:** hosting test HTTPS, aggiornamento URL Configuration del Supabase `acc-test` in Dashboard, configurazione `AUTH_REDIRECT_URL`, collaudo con nuove email e sessioni reali. Nessun intervento su produzione.

### Azioni da riprendere

1. Creare uno staging privato/protetto collegato a `acc-test` e verificare le sessioni reali R5/R4/R1 in browser.
2. Verificare tutte le combinazioni palette/Light-Dark su mobile e persistenza al refresh.
3. Aggiornare il repository sorgente **privato** con la build v0.8.2, non il pubblico.
4. Soltanto dopo approvazione, preparare le corrispondenti modifiche su produzione e la pubblicazione.

