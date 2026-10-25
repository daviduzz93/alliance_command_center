(() => {
  const cfg = window.APP_CONFIG || {};
  const configMissing = !cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY ||
    cfg.SUPABASE_URL.includes("INCOLLA_QUI") || cfg.SUPABASE_ANON_KEY.includes("INCOLLA_QUI");
  const $ = (id) => document.getElementById(id);
  const ui = {
    login: $("login-screen"), shell: $("app-shell"), warning: $("config-warning"),
    loginForm: $("login-form"), loginError: $("login-error"), membersBody: $("members-tbody"),
    modal: $("member-modal"), memberForm: $("member-form"), formError: $("member-form-error"),
    toast: $("toast"), message: $("members-message")
  };
  const translations = {
    it: {loginSubtitle:"Gestione operativa dell’alleanza LADG.",email:"Email",password:"Password",login:"Accedi",accessNote:"Accesso riservato agli utenti autorizzati.",home:"Home",members:"Membri",registrations:"Iscrizioni",formations:"Formazioni DS",history:"Storico",stats:"Stats",soon:"In arrivo",logout:"Esci",dashboard:"Dashboard",connected:"Database connesso",commandCenter:"CENTRO DI COMANDO",welcome:"Bentornato nell’alleanza,",homeIntro:"La base operativa è pronta. Da qui si parte con la gestione dei membri.",manageMembers:"Gestisci membri",overview:"PANORAMICA",allianceStatus:"Stato alleanza",activeMembers:"Membri attivi",activeMembersDesc:"Giocatori registrati nell’alleanza",registeredMembers:"Membri totali",registeredMembersDesc:"Inclusi i membri inattivi",yourRole:"Il tuo ruolo",yourRoleDesc:"Permessi sul database condiviso",firstMilestone:"Prima versione operativa",firstMilestoneText:"Login e gestione membri sono il primo blocco. Iscrizioni, formazioni, storico e statistiche saranno collegati nei passaggi successivi, senza fingere che pulsanti vuoti siano funzionalità.",roster:"ROSTER ALLEANZA",membersDirectory:"Elenco membri",membersIntro:"Gestisci nickname, grado e potenza tattica. Le modifiche vengono salvate nel database condiviso.",addMember:"Aggiungi membro",searchMembers:"Cerca un membro...",allRanks:"Tutti i gradi",activeOnly:"Solo attivi",allStatuses:"Tutti gli stati",inactiveOnly:"Solo inattivi",memberList:"Membri registrati",refresh:"Aggiorna",player:"Giocatore",rank:"Grado",tacticalPower:"Potenza tattica",status:"Stato",actions:"Azioni",loading:"Caricamento membri...",memberRecord:"SCHEDA MEMBRO",gameNickname:"Nickname in gioco",notesOptional:"Note (facoltative)",activeMember:"Membro attivo",cancel:"Annulla",saveMember:"Salva membro",active:"Attivo",inactive:"Inattivo",edit:"Modifica",deactivate:"Disattiva",activate:"Riattiva",noMembers:"Nessun membro trovato.",saved:"Membro salvato.",loadError:"Impossibile caricare i membri.",duplicate:"Esiste già un membro con questo nickname.",requiredName:"Inserisci il nickname del giocatore.",roleOwner:"Owner",roleManager:"Manager",roleViewer:"Viewer",saving:"Salvataggio...",logoutError:"Errore durante l’uscita.",loginError:"Accesso non riuscito. Controlla email e password.",noAlliance:"Il tuo utente non è associato ad alcuna alleanza.",sessionExpired:"Sessione scaduta. Accedi di nuovo."},
    en: {loginSubtitle:"LADG alliance operations management.",email:"Email",password:"Password",login:"Sign in",accessNote:"Access restricted to authorized users.",home:"Home",members:"Members",registrations:"Registrations",formations:"DS Lineups",history:"History",stats:"Stats",soon:"Coming soon",logout:"Sign out",dashboard:"Dashboard",connected:"Database connected",commandCenter:"COMMAND CENTER",welcome:"Welcome back to the alliance,",homeIntro:"The operations base is ready. Member management starts here.",manageMembers:"Manage members",overview:"OVERVIEW",allianceStatus:"Alliance status",activeMembers:"Active members",activeMembersDesc:"Players registered in the alliance",registeredMembers:"Total members",registeredMembersDesc:"Including inactive members",yourRole:"Your role",yourRoleDesc:"Permissions on the shared database",firstMilestone:"First working release",firstMilestoneText:"Login and member management are the first block. Registrations, lineups, history and stats will be connected in later steps.",roster:"ALLIANCE ROSTER",membersDirectory:"Member directory",membersIntro:"Manage nicknames, rank and tactical power. Changes are saved to the shared database.",addMember:"Add member",searchMembers:"Search members...",allRanks:"All ranks",activeOnly:"Active only",allStatuses:"All statuses",inactiveOnly:"Inactive only",memberList:"Registered members",refresh:"Refresh",player:"Player",rank:"Rank",tacticalPower:"Tactical power",status:"Status",actions:"Actions",loading:"Loading members...",memberRecord:"MEMBER RECORD",gameNickname:"In-game nickname",notesOptional:"Notes (optional)",activeMember:"Active member",cancel:"Cancel",saveMember:"Save member",active:"Active",inactive:"Inactive",edit:"Edit",deactivate:"Deactivate",activate:"Reactivate",noMembers:"No members found.",saved:"Member saved.",loadError:"Unable to load members.",duplicate:"A member with this nickname already exists.",requiredName:"Enter the player's nickname.",roleOwner:"Owner",roleManager:"Manager",roleViewer:"Viewer",saving:"Saving...",logoutError:"Sign-out failed.",loginError:"Sign-in failed. Check your email and password.",noAlliance:"Your user is not linked to an alliance.",sessionExpired:"Session expired. Sign in again."},
    fr: {loginSubtitle:"Gestion opérationnelle de l’alliance LADG.",email:"E-mail",password:"Mot de passe",login:"Connexion",accessNote:"Accès réservé aux utilisateurs autorisés.",home:"Accueil",members:"Membres",registrations:"Inscriptions",formations:"Compositions DS",history:"Historique",stats:"Statistiques",soon:"Bientôt",logout:"Déconnexion",dashboard:"Tableau de bord",connected:"Base de données connectée",commandCenter:"CENTRE DE COMMANDEMENT",welcome:"Bon retour dans l’alliance,",homeIntro:"La base opérationnelle est prête. La gestion des membres commence ici.",manageMembers:"Gérer les membres",overview:"APERÇU",allianceStatus:"État de l’alliance",activeMembers:"Membres actifs",activeMembersDesc:"Joueurs enregistrés dans l’alliance",registeredMembers:"Membres au total",registeredMembersDesc:"Membres inactifs inclus",yourRole:"Votre rôle",yourRoleDesc:"Autorisations sur la base partagée",firstMilestone:"Première version opérationnelle",firstMilestoneText:"La connexion et la gestion des membres constituent le premier bloc. Les inscriptions, compositions, archives et statistiques seront ajoutées ensuite.",roster:"LISTE DE L’ALLIANCE",membersDirectory:"Liste des membres",membersIntro:"Gérez les pseudos, grades et puissance tactique. Les modifications sont enregistrées dans la base partagée.",addMember:"Ajouter un membre",searchMembers:"Rechercher un membre...",allRanks:"Tous les grades",activeOnly:"Actifs uniquement",allStatuses:"Tous les états",inactiveOnly:"Inactifs uniquement",memberList:"Membres enregistrés",refresh:"Actualiser",player:"Joueur",rank:"Grade",tacticalPower:"Puissance tactique",status:"État",actions:"Actions",loading:"Chargement des membres...",memberRecord:"FICHE MEMBRE",gameNickname:"Pseudo en jeu",notesOptional:"Notes (facultatif)",activeMember:"Membre actif",cancel:"Annuler",saveMember:"Enregistrer",active:"Actif",inactive:"Inactif",edit:"Modifier",deactivate:"Désactiver",activate:"Réactiver",noMembers:"Aucun membre trouvé.",saved:"Membre enregistré.",loadError:"Impossible de charger les membres.",duplicate:"Un membre avec ce pseudo existe déjà.",requiredName:"Saisissez le pseudo du joueur.",roleOwner:"Propriétaire",roleManager:"Gestionnaire",roleViewer:"Lecteur",saving:"Enregistrement...",logoutError:"Échec de la déconnexion.",loginError:"Échec de connexion. Vérifiez l’e-mail et le mot de passe.",noAlliance:"Votre utilisateur n’est associé à aucune alliance.",sessionExpired:"Session expirée. Reconnectez-vous."}
  };
  let lang = "it", supabase = null, currentUser = null, currentAlliance = null, currentRole = null, members = [], toastTimer = null;

  function t(key) { return (translations[lang] && translations[lang][key]) || translations.it[key] || key; }
  function applyLanguage() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(el => { const key = el.dataset.i18n; if (t(key)) el.textContent = t(key); });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => { el.placeholder = t(el.dataset.i18nPlaceholder); });
    renderMembers();
    if ($("modal-title")) $("modal-title").textContent = $("member-id").value ? t("edit") : t("addMember");
  }
  function showToast(message, isError=false) {
    ui.toast.textContent = message; ui.toast.classList.toggle("error-toast", isError); ui.toast.classList.remove("hidden");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => ui.toast.classList.add("hidden"), 3500);
  }
  function showConfigError() {
    ui.warning.classList.remove("hidden");
    ui.warning.textContent = "Configurazione necessaria: apri config.js e inserisci il Project URL e la chiave pubblica (publishable/anon) del progetto Supabase. Non usare la service_role key. Poi ricarica la pagina.";
    ui.login.classList.add("hidden"); ui.shell.classList.add("hidden");
  }
  function showApp() { ui.login.classList.add("hidden"); ui.shell.classList.remove("hidden"); ui.warning.classList.add("hidden"); }
  function showLogin() { ui.shell.classList.add("hidden"); ui.login.classList.remove("hidden"); }
  function friendlyRole(role) { return t(role === "owner" ? "roleOwner" : role === "manager" ? "roleManager" : "roleViewer"); }
  function setPage(page) {
    if (["registrations","formations","history","stats"].includes(page)) { showToast(t("soon")); return; }
    document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
    $(page + "-page").classList.remove("hidden");
    document.querySelectorAll(".nav-item").forEach(n => n.classList.toggle("active", n.dataset.page === page));
    $("page-title").textContent = page === "members" ? t("members") : t("dashboard");
    $("top-eyebrow").textContent = page === "members" ? "LADG / MEMBERS" : "LADG / OVERVIEW";
    $("sidebar").classList.remove("open");
    if (page === "members") loadMembers();
  }
  async function initializeUser(user) {
    currentUser = user;
    $("user-email").textContent = user.email || "Utente";
    const { data: memberships, error: memError } = await supabase.from("alliance_memberships").select("alliance_id,role").eq("user_id", user.id).limit(1);
    if (memError) throw memError;
    if (!memberships || memberships.length === 0) throw new Error(t("noAlliance"));
    currentRole = memberships[0].role;
    const { data: alliance, error: allianceError } = await supabase.from("alliances").select("id,name,server_number").eq("id", memberships[0].alliance_id).single();
    if (allianceError) throw allianceError;
    currentAlliance = alliance;
    $("alliance-label").textContent = alliance.name;
    $("welcome-alliance").textContent = alliance.name + ".";
    $("user-role").textContent = friendlyRole(currentRole);
    $("role-card").textContent = friendlyRole(currentRole);
    showApp();
    await loadMembers();
  }
  async function loadMembers() {
    if (!currentAlliance) return;
    ui.membersBody.innerHTML = `<tr><td colspan="5" class="empty-state">${t("loading")}</td></tr>`;
    ui.message.textContent = "";
    const { data, error } = await supabase.from("alliance_members").select("id,alliance_id,game_name,rank,tactical_power,is_active,notes,created_at,updated_at").eq("alliance_id", currentAlliance.id).order("game_name", {ascending:true});
    if (error) {
      ui.membersBody.innerHTML = `<tr><td colspan="5" class="empty-state">${escapeHtml(t("loadError"))}</td></tr>`;
      ui.message.textContent = error.message; return;
    }
    members = data || [];
    $("active-count").textContent = members.filter(m => m.is_active).length;
    $("total-count").textContent = members.length;
    $("member-count-label").textContent = String(members.length);
    renderMembers();
  }
  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  }
  function renderMembers() {
    if (!ui.membersBody) return;
    const search = ($("member-search")?.value || "").trim().toLowerCase();
    const rank = $("rank-filter")?.value || "";
    const status = $("status-filter")?.value || "active";
    const shown = members.filter(m => (!search || m.game_name.toLowerCase().includes(search)) && (!rank || m.rank === rank) && (status === "all" || (status === "active" ? m.is_active : !m.is_active)));
    if (!shown.length) { ui.membersBody.innerHTML = `<tr><td colspan="5" class="empty-state">${escapeHtml(t("noMembers"))}</td></tr>`; return; }
    ui.membersBody.innerHTML = shown.map(m => {
      const initials = escapeHtml(m.game_name.trim().slice(0,1).toUpperCase() || "?");
      const stars = "★".repeat(Number(m.tactical_power)) + `<span class="off">${"★".repeat(5-Number(m.tactical_power))}</span>`;
      return `<tr>
        <td><div class="player-cell"><div class="player-avatar">${initials}</div><div class="player-name">${escapeHtml(m.game_name)}</div></div></td>
        <td><span class="rank-pill rank-${escapeHtml(m.rank)}">${escapeHtml(m.rank)}</span></td>
        <td><span class="stars" aria-label="${Number(m.tactical_power)} / 5">${stars}</span></td>
        <td><span class="state-pill ${m.is_active ? "" : "inactive"}">${m.is_active ? t("active") : t("inactive")}</span></td>
        <td><div class="row-actions"><button class="mini-action" data-edit="${m.id}">${t("edit")}</button><button class="mini-action" data-toggle="${m.id}">${m.is_active ? t("deactivate") : t("activate")}</button></div></td>
      </tr>`;
    }).join("");
    ui.membersBody.querySelectorAll("[data-edit]").forEach(btn => btn.addEventListener("click", () => openMemberModal(members.find(m => m.id === btn.dataset.edit))));
    ui.membersBody.querySelectorAll("[data-toggle]").forEach(btn => btn.addEventListener("click", () => toggleMember(btn.dataset.toggle)));
  }
  function openMemberModal(member=null) {
    ui.memberForm.reset(); ui.formError.textContent = "";
    $("member-id").value = member?.id || "";
    $("game-name").value = member?.game_name || "";
    $("member-rank").value = member?.rank || "R1";
    $("member-power").value = String(member?.tactical_power || 3);
    $("member-notes").value = member?.notes || "";
    $("member-active").checked = member ? !!member.is_active : true;
    $("modal-title").textContent = member ? t("edit") : t("addMember");
    ui.modal.classList.remove("hidden"); $("game-name").focus();
  }
  function closeMemberModal() { ui.modal.classList.add("hidden"); }
  async function saveMember(event) {
    event.preventDefault(); ui.formError.textContent = "";
    if (currentRole === "viewer") { ui.formError.textContent = "Il tuo ruolo consente solo la lettura."; return; }
    const id = $("member-id").value;
    const gameName = $("game-name").value.trim();
    if (!gameName) { ui.formError.textContent = t("requiredName"); return; }
    const duplicate = members.find(m => m.game_name.toLowerCase() === gameName.toLowerCase() && m.id !== id);
    if (duplicate) { ui.formError.textContent = t("duplicate"); return; }
    const payload = { alliance_id: currentAlliance.id, game_name: gameName, rank: $("member-rank").value, tactical_power: Number($("member-power").value), notes: $("member-notes").value.trim() || null, is_active: $("member-active").checked };
    const submit = ui.memberForm.querySelector('button[type="submit"]'); submit.disabled = true; submit.textContent = t("saving");
    const result = id ? await supabase.from("alliance_members").update(payload).eq("id", id).eq("alliance_id", currentAlliance.id) : await supabase.from("alliance_members").insert(payload);
    submit.disabled = false; submit.textContent = t("saveMember");
    if (result.error) { ui.formError.textContent = result.error.message; return; }
    closeMemberModal(); showToast(t("saved")); await loadMembers();
  }
  async function toggleMember(id) {
    if (currentRole === "viewer") { showToast("Il tuo ruolo consente solo la lettura.", true); return; }
    const member = members.find(m => m.id === id); if (!member) return;
    const { error } = await supabase.from("alliance_members").update({is_active: !member.is_active}).eq("id", id).eq("alliance_id", currentAlliance.id);
    if (error) { showToast(error.message, true); return; }
    showToast(member.is_active ? t("deactivate") : t("activate")); await loadMembers();
  }
  async function signIn(event) {
    event.preventDefault(); ui.loginError.textContent = "";
    const button = ui.loginForm.querySelector('button[type="submit"]'); button.disabled = true;
    const { error } = await supabase.auth.signInWithPassword({email:$("email").value.trim(),password:$("password").value});
    button.disabled = false;
    if (error) ui.loginError.textContent = t("loginError");
  }
  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) { showToast(t("logoutError"), true); return; }
    currentUser = null; currentAlliance = null; currentRole = null; members = []; showLogin();
  }
  function bindEvents() {
    ui.loginForm.addEventListener("submit", signIn);
    ui.memberForm.addEventListener("submit", saveMember);
    $("add-member").addEventListener("click", () => openMemberModal());
    $("go-members").addEventListener("click", () => setPage("members"));
    $("refresh-members").addEventListener("click", loadMembers);
    $("member-search").addEventListener("input", renderMembers);
    $("rank-filter").addEventListener("change", renderMembers);
    $("status-filter").addEventListener("change", renderMembers);
    $("logout-button").addEventListener("click", signOut);
    document.querySelectorAll(".nav-item").forEach(n => n.addEventListener("click", () => setPage(n.dataset.page)));
    document.querySelectorAll("[data-close-modal]").forEach(el => el.addEventListener("click", closeMemberModal));
    $("open-menu").addEventListener("click", () => $("sidebar").classList.add("open"));
    $("close-menu").addEventListener("click", () => $("sidebar").classList.remove("open"));
    $("language-select").addEventListener("change", e => { lang = e.target.value; applyLanguage(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeMemberModal(); });
  }
  async function boot() {
    bindEvents();
    if (configMissing) { showConfigError(); return; }
    if (!window.supabase?.createClient) { ui.warning.classList.remove("hidden"); ui.warning.textContent = "La libreria Supabase non è stata caricata. Controlla la connessione e ricarica la pagina."; return; }
    supabase = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) { showLogin(); return; }
    if (session?.user) {
      try { await initializeUser(session.user); }
      catch (err) { showLogin(); ui.loginError.textContent = err.message || t("noAlliance"); }
    } else showLogin();
    supabase.auth.onAuthStateChange(async (event, sessionNow) => {
      if (event === "SIGNED_IN" && sessionNow?.user && !currentAlliance) {
        try { await initializeUser(sessionNow.user); } catch (err) { showLogin(); ui.loginError.textContent = err.message || t("noAlliance"); }
      }
      if (event === "SIGNED_OUT") { currentUser = null; currentAlliance = null; showLogin(); }
    });
  }
  document.addEventListener("DOMContentLoaded", boot);
})();