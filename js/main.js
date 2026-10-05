// ── MAIN — boot and input ───────────────────────────────────────────

function advance(n) {
    for (let i = 0; i < n; i++) {
        advanceWeek();
        if (G.scenes.length || G.over) break;
    }
    render();
}

const ACTIONS = {
    // Setup
    newGame: () => { renderCountries(); showScreen("countries"); },
    continueGame: () => { if (load()) { view = "office"; render(); } },
    pickCountry: d => { ui.setupCk = d.k; renderDossier(); showScreen("dossierScreen"); },
    toCountries: () => showScreen("countries"),
    toDossier: () => { renderDossier(); showScreen("dossierScreen"); },
    toCreator: () => openCreator(true),
    crHistorical: () => openCreator(true),
    crCustom: () => openCreator(false),
    crParty: d => { readCreatorInputs(); ui.creator.party = d.k; const p = COUNTRIES[ui.setupCk].parties.find(x => x.k === d.k); if (p) ui.creator.ideology = p.fac ? p.fac[0].ideo : p.ideo; renderCreator(); },
    crIdeo: d => { readCreatorInputs(); ui.creator.ideology = d.k; renderCreator(); },
    crBg: d => { readCreatorInputs(); ui.creator.bg = d.k; renderCreator(); },
    crTrait: d => { readCreatorInputs(); const t = ui.creator.traits; const i = t.indexOf(d.k); if (i >= 0) t.splice(i, 1); else { if (t.length >= 2) t.shift(); t.push(d.k); } renderCreator(); },
    crSkill: d => { readCreatorInputs(); const s = ui.creator.skills; const v = (s[d.k] || 0) + (+d.d); if (v < 0 || v > 5) return; if (+d.d > 0 && skillTotal() >= SKILL_POINTS) return; s[d.k] = v; renderCreator(); },
    crLook: d => { readCreatorInputs(); const opts = LOOK_OPTIONS[d.k]; ui.creator.look[d.k] = ((ui.creator.look[d.k] || 0) + (+d.d) + opts.length) % opts.length; renderCreator(); },
    crRandName: () => { readCreatorInputs(); ui.creator.name = randomLeaderName(ui.setupCk, ui.creator.gender); ui.creator.historical = false; renderCreator(); },
    crBegin: () => {
        readCreatorInputs();
        const cr = ui.creator;
        if (cr.traits.length !== 2) return;
        if (cr.name !== COUNTRIES[ui.setupCk].leader.name) cr.historical = false;
        if (ui.mode === "successor") {
            applySuccession(cr);
            ui.draft = initCabinetDraft(); renderCabinetSetup(); showScreen("cabinet");
            return;
        }
        newGame({ ck: ui.setupCk, name: cr.name, age: cr.age, gender: cr.gender, bg: cr.bg, traits: cr.traits, skills: cr.skills, look: cr.look, ideology: cr.ideology, party: cr.party, historical: cr.historical });
        ui.draft = initCabinetDraft();
        renderCabinetSetup();
        showScreen("cabinet");
    },
    cabPick: d => { ui.draft[d.k].pick = +d.i; renderCabinetSetup(); },
    cabBegin: () => { appointCabinet(ui.draft); ui.draft = null; view = "office"; ui.area = null; ui.bill = null; save(); showScreen("play"); render(); },

    // Play
    next: d => advance(+d.n),
    view: d => { view = d.v; ui.bill = null; render(); window.scrollTo(0, 0); },
    scene: d => sceneChoose(+d.i),
    menu: () => { save(); bootScreen(); },
    succession: () => beginSuccession(G.over.reason),

    // Legislature, lawbook, budget
    billSel: d => { ui.billSel = d.id; ui.builder = null; if (d.goto) view = "legislature"; render(); },
    billAct: d => { billAction(d.id, d.k); render(); },
    billPork: d => { billPork(d.id, d.k); render(); },
    billFavor: d => { billFavor(d.id, d.k); render(); },
    amend: d => { amendBill(d.id, d.t, d.k); render(); },
    builderOpen: () => { ui.builder = builderDefaults(); view = "legislature"; render(); },
    builderClose: () => { ui.builder = null; render(); },
    builderSubmit: () => { if (proposeProgram(ui.builder)) { ui.builder = null; const b = (G.bills || []).slice(-1)[0]; if (b && b.sponsor === "player" && b.stage === "committee") ui.billSel = b.id; } render(); },
    lawSel: d => { ui.law = d.k; ui.lawLevel = null; ui.area = null; render(); },
    lawAdj: d => { adjustLaw(d.k, +d.d); render(); },
    lawBill: d => { const def = lawDef(d.k); const lvl = d.repeal ? 0 : (ui.lawLevel != null ? ui.lawLevel : lawLevel(d.k) || 0.3); if (!d.repeal && lvl === lawLevel(d.k)) return toast("No change", "Pick a different level first."); proposeLawBill(d.k, lvl); ui.lawLevel = null; render(); },
    lawDecree: d => { decreeLaw(d.k, d.repeal ? 0 : (ui.lawLevel != null ? ui.lawLevel : lawLevel(d.k) || 0.3)); ui.lawLevel = null; render(); },
    area: d => { ui.area = d.k; ui.law = null; render(); },
    fwBill: d => { proposeFrameworkBill(d.a, d.k); render(); },
    fwEO: d => { executiveOrder(d.a, d.k); render(); },
    fwDecree: d => { decreePolicy(d.a, d.k); render(); },
    submitBudget: () => { submitBudget(); render(); },
    cipMove: d => { cipMove(d.id, +d.d); render(); },
    cipRemove: d => { cipRemove(d.id); render(); },
    cipPropose: () => { const t = $("#cipType"); if (t) { ui.cipType = t.value; openRegionPicker(t.value); } render(); },
    tradeCancel: d => { cancelTrade(d.k); render(); },
    famMarry: () => { seekSpouse(); render(); },
    famDivorce: () => { divorce(); render(); },
    famLaw: () => { changeSuccessionLaw(); render(); },
    buildInfra: d => { openRegionPicker(d.k); render(); },
    gotoLaw: d => { view = "lawbook"; ui.law = d.k; ui.lawLevel = null; render(); },
    assetPropose: d => { openRegionPicker(`asset:${d.k}:${d.a}`); render(); },

    // Economy
    indSel: d => { ui.ind = ui.ind === d.k ? null : d.k; render(); },
    instJoin: d => { applyToInst(d.k); render(); },
    instLeave: d => { leaveInst(d.k); render(); },
    imfRequest: () => { requestImf(); render(); },
    finProject: d => { askFinancing(d.id); render(); },
    cipTreasury: d => { payProjectFromTreasury(d.id); render(); },
    treCapital: d => { treasuryToCapital(+d.f); render(); },
    treRepay: d => { treasuryRepay(+d.f); render(); },
    parisClub: () => { parisClub(); render(); },
    hipc: () => { hipcApply(); render(); },
    ceoTalk: d => { startCeoTalk(+d.i); render(); },
    offer: d => { makeOffer(+d.i); render(); },
    startup: d => { backEntrepreneur(d.k, d.w); render(); },
    projectPick: d => { openRegionPicker("ind:" + d.k); render(); },
    projectCancel: () => { ui.projInd = null; render(); },
    project: d => { ui.projInd = null; proposeProject("ind:" + d.k, +d.i); render(); },

    // Power
    power: d => { doPowerAction(d.k); render(); },
    woo: d => { wooFaction(d.k); render(); },
    sack: d => { const r = withImpact("Cabinet change", () => sackMinister(d.k)); if (r.chips.length) toast("Cabinet change", "", r.chips); render(); },
    appoint: d => { const r = withImpact("New minister", () => appointMinister(d.k, +d.i)); if (r.chips.length) toast("New minister", "", r.chips); render(); },
    newCands: d => { G.reshuffle = G.reshuffle || {}; G.reshuffle[d.k] = cabinetCandidates(d.k); render(); },
    reform: d => { attemptReform(d.k, d.r); render(); },
    rally: d => { campaignRally(+d.i); render(); },
    ads: () => { campaignAds(); render(); },
    fundraise: () => { fundraise(); render(); },
    resign: () => { resign(); render(); },
    colony: d => { colonyAction(d.k); render(); },

    // World & military
    nation: d => { ui.nation = d.k; render(); },
    wfilter: d => { ui.worldFilter = d.k; render(); },
    diplo: d => { diploAction(d.k, d.n); render(); },
    bloc: d => { toggleBloc(d.k); render(); },
    commit: d => { setCommit(d.id, +d.l); render(); },
    peace: d => { proposePeace(d.id); render(); },
    nuke: d => { useNukes(d.id); render(); },
    mobilize: () => { mobilize(); render(); },
    lfilter: d => { ui.logFilter = d.k; render(); }
};

document.addEventListener("click", e => {
    const el = e.target.closest("[data-act]");
    if (!el || el.disabled) return;
    const fn = ACTIONS[el.dataset.act];
    if (fn) { e.preventDefault(); fn(el.dataset); }
});

document.addEventListener("change", e => {
    const el = e.target;
    if (el.dataset.change === "support") { setSupport(el.dataset.k, +el.value); render(); }
    if (el.dataset.change === "treOpt") { treasuryOpt(el.dataset.k, el.value); render(); }
    if (el.dataset.change === "own") { setOwnership(el.dataset.k, el.value); render(); }
    if (el.dataset.change === "inc") { setIncentive(+el.dataset.i, el.dataset.k, +el.value); render(); }
    if (el.dataset.change === "lawLevel") { ui.lawLevel = +el.value; render(); }
    if (el.dataset.change === "builder") { const f = el.dataset.f; ui.builder[f] = ["amount", "years"].includes(f) ? +el.value : el.value; render(); }
    if (el.dataset.change === "builderProv") { const k = el.dataset.k, p = ui.builder.provs; const i = p.indexOf(k); if (el.checked && i < 0) p.push(k); if (!el.checked && i >= 0) p.splice(i, 1); render(); }
    if (el.id === "crGender" && ui.creator) {
        const cr = ui.creator, was = cr.gender;
        readCreatorInputs();
        // A woman can't keep a man's name (and vice versa): offer a fitting one.
        if (cr.gender !== was) { cr.name = randomLeaderName(cr.ck || ui.setupCk, cr.gender); cr.historical = false; }
        renderCreator();
    }
    if (el.dataset.change === "draft") { setDraft(el.dataset.kind, el.dataset.k, +el.value); render(); }
});

document.addEventListener("keydown", e => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return;
    if (!G || !$("#play").classList.contains("active")) return;
    if (e.key === " " && !G.scenes.length) { e.preventDefault(); advance(1); }
    if (G.scenes.length && /^[1-9]$/.test(e.key)) sceneChoose(+e.key - 1);
});

function bootScreen() {
    $("#continueBtn").style.display = hasSave() ? "" : "none";
    showScreen("boot");
}

bootScreen();
