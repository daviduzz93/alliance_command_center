# ACC — Frontend cumulativo v0.8.3: implementazione e verifiche (28/10/2026)

**Versione:** `ACC_v0_8_3_Fase4_Nickname_CambioAlleanza_TEST.zip`  
**Ambiente:** Supabase **`acc-test`** / progetto `tehijaphavnemchizzbm`  
**Archivio:** conservato nella Library privata `/Alliance Command Center/ACC_v0_8_3_Fase4_Nickname_CambioAlleanza_TEST.zip`. SHA256 `86237a5abd938b6e9fdf33c7306eece32650a10fc108bc7e46e1fe3d09b10411`; test integrità ZIP superato.  
**Stato di rilascio:** **CANDIDATA LOCALE, NON PUBBLICATA**. Nessun upload del codice nel repository GitHub pubblico, nessun deploy Pages, nessuna modifica al DB produzione o a `main`.

## Frontend modificato rispetto alla candidata locale v0.8.2

- `index.html`: input obbligatorio «Nome giocatore in Last War» su entrambi i form `#make-form` e `#join-form`; sezione `#alliance-list-section` separata dalla griglia di azioni `#choices`; `#alliance-cards` a due colonne e `#onboard-topbar` con pulsante Indietro e slot del selettore lingua.
- `app.js`:
  - nuove RPC in creazione `acc_create_alliance_with_player_name`, ingresso `acc_join_alliance_with_player_name`, elenco `acc_list_members_v2` ed editing `acc_set_game_player_name`;
  - nickname per l'appartenenza all'alleanza, distinto dal profilo account; valori legacy `NULL` riconosciuti, senza fingere che il fallback `display_name` sia un nickname confermato;
  - modifica personale per tutti i ranghi, editing inline degli altri membri da R4/R5, compreso il nome R5 (non il rango), con aggiornamento della lista dopo salvataggio;
  - unico `renderAllianceChoices()` per schermata di ingresso con più alleanze e cambio alleanza dalla dashboard; nomi alleanze inseriti con `textContent` e mai come HTML;
  - lingua unica per autenticazione/selezione alleanza spostata nello slot della barra superiore, stessa preferenza `lang-app` in dashboard; indietro mostrato solo quando è possibile tornare all'app;
  - traduzioni IT/EN/FR/ES/DE per nuovi campi, messaggi ed azioni; scelta del server riservata alla creazione.
- `styles.css`: griglia di alleanze `repeat(2,minmax(0,1fr))` mantenuta fino a 320px, toolbar coerente e editor inline responsive; preservati i fix Light di v0.8.2.
- `config.js`: contiene **solo URL e chiave publishable CLIENT-SAFE** di `acc-test`. Non service-role o chiavi segrete; non pubblicare altrove assumendo sia un ambiente di produzione.
- `README.md`, `ISTRUZIONI_TEST.txt`: aggiornati per il pacchetto v0.8.3 e con vincoli di non pubblicazione.

## Test eseguiti

### JavaScript e pacchetto
- `node --check app.js`: **PASS**.
- `node --check theme.js`: **PASS**.
- ZIP: **8 file**, test `zipfile.testzip()` senza errori.

### Test Chromium/Playwright del frontend

L'app è stata caricata con HTML/CSS reali e **mock della libreria Supabase**, senza login reale e senza comunicazioni al progetto remoto.

- **9/9 scenari:** R5, R4, R1 × viewport 1280, 375 e 320px. Nessun errore JS.
- Titolo «LE TUE ALLEANZE» sopra le tessere; tessere su **due colonne**, anche su mobile.
- Barra selezione alleanze: lingua allineata a destra, Indietro a sinistra quando proviene dall'app; assenza di Indietro alla prima selezione dopo login con più alleanze.
- Scelta dell'alleanza dal selettore: apre quella corretta.
- R5 e R4 hanno editor sui nomi degli altri due membri nel dataset di prova; R1 non ha editor sugli altri.
- R5 modifica il nickname di R4, R5 e R1 possono modificare il proprio, aggiornando la visualizzazione.
- Nickname legacy `NULL`: compare indicazione «da confermare».
- Creazione: input obbligatorio, chiama `acc_create_alliance_with_player_name` con nome, server e nickname.
- Ingresso: input obbligatorio, chiama `acc_join_alliance_with_player_name` con invito e nickname.
- Cinque lingue verificate nella schermata di selezione.
- **54/54** misurazioni contrasto intestazioni Light, sei palette e nove elementi: rapporto minimo misurato circa **14,27:1** rispetto allo sfondo del corpo. Non è un audit WCAG completo di tutti gli elementi.
- Sono stati analizzati screenshot desktop e mobile; la versione di test non è stata distribuita online.

### Backend già verificato

Migrazione `acc_phase4_game_player_names_v1` **applicata su `acc-test` nel precedente intervento**. **22/22** prove SQL con ruolo `authenticated` e JWT simulato, sotto transazioni `ROLLBACK`. Non interpretare questi test come sessioni HTTP/Auth reali. Risultati in [`REPORT_NOMI_GIOCATORE_FASE4.md`](./REPORT_NOMI_GIOCATORE_FASE4.md).

## Limiti e lavori ancora necessari prima del rilascio

1. E2E browser su staging collegato ad `acc-test` **con autentiche sessioni Supabase Auth**; test inviti, permessi e reali aggiornamenti lato DB.
2. Refresh/Ctrl+F5, sessioni persistenti, cambio dispositivo e test di tutti i temi/lingue anche fuori dal mock.
3. Prima di esporre il codice, configurare repository **sorgente privato** e hosting; il repo attuale è pubblico.
4. Sostituire/revocare gradualmente gli endpoint legacy create/join che ancora permettono nickname `NULL`, dopo migrazione di tutti i client. Confermare anche nickname legacy esistenti.
5. Valutare gli advisor Supabase e test di autorizzazione con sessioni reali.
6. Nessuna modifica alla produzione prima di approvazione esplicita.

**Conclusione:** frontend cumulativo implementato, test mock superati, build candidata disponibile nella Library privata; **Fase 4 NON ancora rilasciata né collaudata E2E reale.**
