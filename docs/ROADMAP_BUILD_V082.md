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

### Azioni da riprendere

1. Creare uno staging privato/protetto collegato a `acc-test` e verificare le sessioni reali R5/R4/R1 in browser.
2. Verificare tutte le combinazioni palette/Light-Dark su mobile e persistenza al refresh.
3. Aggiornare il repository sorgente **privato** con la build v0.8.2, non il pubblico.
4. Soltanto dopo approvazione, preparare le corrispondenti modifiche su produzione e la pubblicazione.

