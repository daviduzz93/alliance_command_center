# ACC — Piano di protezione sorgenti e pubblicazione sicura

**Data:** 2026-10-28  
**Stato:** preparazione. **Non eseguito** lo spostamento hosting né il cambio di visibilità.  
**Branch di lavoro:** `test/acc-phase4-ranghi-r1-r5`  
**Produzione:** intoccata. Vietato applicare cambi di visibilità o distribuzione senza verifica di impatto e approvazione.

## 1. Baseline verificata

- Repository `daviduzz93/alliance_command_center`: **pubblico**; branch predefinito `main`.
- `main/index.html` è frontend statico e carica `styles.css`, `config.js`, `theme.js`, `app.js` e Supabase JS via CDN.
- `main/config.js`: analisi preliminare della presenza di stringhe che indicano service-role/secret: non trovate. **Non è una scansione completa** del codice o cronologia.
- `.github/workflows/pages.yml`, `.github/workflows/deploy.yml`, `CNAME`, `.nojekyll`, `package.json` non risultano presenti nei percorsi controllati su `main`. Questo **non dimostra** che Pages sia disabilitato o che non esistano altri workflows.
- La URL convenzionale `https://daviduzz93.github.io/alliance_command_center/` non è stata verificata come raggiungibile via controllo pubblico; **non assumere** questo sia l'URL reale.
- `docs/CONTINUITA_TECNICA_ACC.md` esiste sul branch di test. `.gitignore` aggiunto solo sul branch di test.
- Supabase: `acc-test` per prove e `alliance-command-center` per produzione; **nessun cambio backend in questa fase**.

## 2. Minacce e limiti della soluzione

| Rischio | Mitigazione | Limite |
| --- | --- | --- |
| Download/clonazione repository pubblico | Repository sorgente privato | Cloni e fork storici già esistenti non spariscono |
| Ispezione del JS nel browser | Spostare *algoritmi proprietari* sul backend | Qualsiasi JS eseguito nel browser resta visibile, anche con repository privato |
| Visibilità di dati/utenti tra alleanze | RLS + RPC autorizzate + test cross-alliance | Login da solo non garantisce isolamento dati |
| Perdite di chiavi in commit | Secret scanning, revoca/rotazione, .gitignore | .gitignore non protegge file già tracciati o cronologia |
| Interruzione Pages | Determinare fonte e piano, test prima del cambio | Repository privato con GitHub Free può impedire Pages |
| Appropriazione del brand | Verifica marchi/nome e registrazione se opportuna | L'idea astratta di un gestionale non è monopolizzabile |

## 3. Architettura obiettivo consigliata

### Repository sorgente (privato)
- Codice completo di sviluppo.
- Test, documentazione interna, migrazioni SQL, piani e log di modifica.
- Nessuna chiave secret in Git; usare secret store dedicati.
- Branch di sviluppo e controlli automatici prima del rilascio.

### Pubblicazione frontend
- Host statico con file minimi: `index.html`, `styles.css`, `app.js`, `theme.js`, `config.js` contenente **solo** URL Supabase e chiave publishable, asset necessari.
- Se si usa ancora GitHub Pages con un repository pubblico di distribuzione, il frontend *resta pubblicamente visibile*, quindi NON pubblicare lì la logica proprietaria.
- Alternativa: host statico separato collegato al sorgente privato con build/deploy protetto; l'output frontend resta comunque ispezionabile.
- I controlli di permesso e gli algoritmi proprietari riservati vivono nel backend (RPC/Funzioni Edge con privilegi e verifiche ben definiti).

### Database
- `acc-test` per prove, `alliance-command-center` per produzione.
- Le migrazioni passano nel test e vengono registrate nel documento prima della produzione.
- Proteggere RLS e non mettere `service_role` nei file serviti al browser.

## 4. Sequenza sicura di lavoro

1. Identificare URL reale dell'app e fonte attuale in **GitHub → Settings → Pages**; registrare tipo di deploy, branch/cartella, eventuale dominio e piano GitHub.
2. Fare un backup completo e controllare che la versione distribuita possa essere ripristinata.
3. Fare una scansione di segreti nell'ultimo albero **e nella storia Git**; in caso di token segreti esposti, revocarli e ruotarli. Le publishable/anon key per client non sono, da sole, credenziali secret.
4. Identificare che cosa contiene vera logica proprietaria, separarlo dal JS browser e progettare API con autentificazione/autorizzazione.
5. Preparare un repository *privato* per sorgenti, test, documenti e migrazioni. Non renderlo pubblico automaticamente e non includervi segreti.
6. Preparare una distribuzione statica minima e un ambiente di staging collegato a `acc-test`. **Non eseguire il deploy della test build verso Supabase produzione.**
7. Testare su staging: login, inviti, cambio alleanza, ranghi R1–R5, tutti i temi, lingue, reset/reload, autorizzazioni reali e accesso tra alleanze.
8. Confrontare UI e funzionalità con la baseline. Documentare possibilità di rollback e verificare la URL finale.
9. Proporre all'utente la migrazione di hosting e il cambio visibilità. Eseguirli **solo dopo approvazione esplicita**.
10. Aggiornare documento di continuità e verificare nuovamente che sito pubblico e Supabase funzionino.

## 5. Criteri di completamento

- [ ] L'app di produzione resta raggiungibile all'indirizzo concordato.
- [ ] È disponibile un repository sorgente privato contenente i file di sviluppo.
- [ ] Il repository destinato alla pubblicazione contiene esclusivamente output distribuibile e asset autorizzati.
- [ ] Le parti sensibili non sono implementate esclusivamente nel JavaScript client.
- [ ] Non ci sono segreti nel frontend o nella cronologia sorgente; eventuali chiavi compromesse sono state ruotate.
- [ ] Controlli RLS/RPC e test end-to-end superati su `acc-test`.
- [ ] Rollback scritto e verificato.
- [ ] Approvazione del proprietario registrata prima della modifica alla produzione.
- [ ] Documento tecnico aggiornato con commit, esiti, problemi residui.

## 6. Punti da determinare prima del cambio di visibilità

- Quale indirizzo viene usato oggi per ACC?
- La fonte Pages è `main`, un'altra branch/cartella o una GitHub Action?
- Quale piano GitHub ha l'account?
- Se presente, qual è il dominio personalizzato?
- Per le sezioni non ancora implementate, quali logiche dovranno essere mantenute riservate?

Questi dati vanno recuperati da impostazioni e sorgenti verificate, senza deduzioni non confermate.

## Riferimenti ufficiali

- [GitHub: configurazione fonte Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [GitHub: creazione sito Pages e requisiti per repository privati](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)
- [GitHub: modifica visibilità repository](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility)
