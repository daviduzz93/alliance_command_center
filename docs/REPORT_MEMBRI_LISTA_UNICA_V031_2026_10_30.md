# ACC — Membri v0.3.1: collaudo aggiuntivo e recupero funzionalità Fase 4

**Data:** 30 ottobre 2026. **Stato:** build DEV privata e verificata in offline, **NON distribuita** sullo staging.

## Problema risolto

Con la lista unica Last War della v0.3, gli account ACC non ancora associati a un giocatore del registro avevano perso l'accesso ad alcune funzioni della Fase 4. Un utente non collegato non riusciva più a modificare il proprio nickname ACC; gli ufficiali R4/R5 non avevano più un punto di gestione per gli account non collegati.

### Correzioni
- Unica lista giocatori Last War confermata, senza tabella separata degli account.
- Piccolo pannello espandibile «Account ACC» per il nickname personale, accessibile anche a un utente ACC non collegato al roster.
- R4/R5: selettore mirato ai soli account non collegati, per gestirli finché non vengono associati a un giocatore. I permessi ACC restano governati dal ruolo in `alliance_memberships`.
- I controlli per gli account già collegati restano direttamente nelle rispettive righe; niente doppioni.
- Controlli e traduzioni IT/EN/FR/ES/DE; nessuna valutazione tattica 1–5 stelle e nessuna classificazione DS in Membri.
- Nessuna modifica SQL in v0.3.1; `public.alliance_members` su `acc-test` resta allo schema della migrazione v0.3.

## Verifiche

- **42/42** Playwright mock specifici, comprese modifica del nickname ACC non collegato, visualizzazione gestione R4 non collegati e divieto di cambiare rango dell'R5.
- **1.684/1.684** controlli generali offline/mock, totale **1.726/1.726**.
- Check sintassi Node.js e `tests/check-core.cjs`: PASS.
- `acc-test`: SQL in transazioni `ROLLBACK` con `SET LOCAL ROLE authenticated` e claim `auth.uid()` simulato: importazione di **101 righe negata** (limite 100), R3 della stessa alleanza può leggere ma non modificare/cancellare, utente senza membership non può leggere; nessuna riga QA persistita. **Test SQL ≠ login Auth JWT autentico**.
- ZIP controllato, cambiamenti confinati a `index.html`, `styles.css`, `roster.js`, test e note; `config.js` invariato.
- Pacchetto privato: `/Alliance Command Center/ACC_Membri_Lista_Unica_DEV_v0_3_1_PRIVATO.zip`, report privato allegato. SHA256 pacchetto `43c4ead42807ca9f2ce5abace127d4d098a07146d73494e80a43071271ade657`.

## Non testato, non pubblicato

- Nessuna sessione browser autenticata sullo staging privato Work né test REST con JWT Auth reale, perché Work/browser cloud non è disponibile in questa sessione.
- Nessun aggiornamento a staging, `main`, Pages o Supabase produzione.
- `acc-test` schema v0.3 già applicato in sessione precedente e invariato in questa; fixture QA preesistente non eliminata.
- Successiva verifica: Work su staging privato autorizzato con login reale R1/R4/R5, cambio alleanza, import/export Excel con browser reale, controlli SQL/REST cross-alliance e conferma email della Fase 4.

**Nota:** `v0.8.4.1` Fase 4 continua a essere la candidata separata; non considerare v0.3.1 un rilascio pubblicato.
