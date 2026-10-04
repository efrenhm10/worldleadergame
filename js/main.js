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
    crLook: d => { readCreatorInputs(); const opts = LOOK_OPTIONS[d.k]; ui.creator.look[d.k] = (ui.creator.look[d.k] + (+d.d) + opts.length) % opts.length; renderCreator(); },
    crRandName: () => { readCreatorInputs(); ui.creator.name = randomLeaderName(ui.setupCk); ui.creator.historical = false; renderCreator(); },
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

    // Policy
    area: d => { ui.area = d.k; ui.bill = null; render(); },
    propose: d => { ui.bill = { area: d.a, k: d.k, old: G.pol[d.a], whip: false, conc: {}, favor: {}, cost: policyCost(d.a) }; render(); },
    cancelBill: () => { ui.bill = null; render(); },
    billWhip: () => { ui.bill.whip = !ui.bill.whip; render(); },
    billConc: d => { ui.bill.conc[d.k] = !ui.bill.conc[d.k]; if (!ui.bill.conc[d.k]) delete ui.bill.conc[d.k]; render(); },
    billFavor: d => { ui.bill.favor[d.k] = !ui.bill.favor[d.k]; if (!ui.bill.favor[d.k]) delete ui.bill.favor[d.k]; render(); },
    billVote: () => { const b = ui.bill; ui.bill = null; voteOnBill(b); render(); },
    billEO: () => { const b = ui.bill; ui.bill = null; executiveOrder(b.area, b.k); render(); },
    decree: () => { const b = ui.bill; ui.bill = null; decreePolicy(b.area, b.k); render(); },

    // Economy
    visitHQ: d => { visitHQ(+d.i); render(); },
    offer: d => { makeOffer(+d.i); render(); },
    startup: () => { const s = $("#startupSector"); if (s) backEntrepreneur(s.value); render(); },
    projectPick: d => { ui.projInd = d.k; render(); },
    projectCancel: () => { ui.projInd = null; render(); },
    project: d => { ui.projInd = null; startProject(d.k, +d.i); render(); },

    // Power
    power: d => { doPowerAction(d.k); render(); },
    woo: d => { wooFaction(d.k); render(); },
    sack: d => { sackMinister(d.k); render(); },
    appoint: d => { appointMinister(d.k, +d.i); render(); },
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
    if (el.dataset.change === "own") { setOwnership(el.dataset.k, el.value); render(); }
    if (el.dataset.change === "inc") { setIncentive(+el.dataset.i, el.dataset.k, +el.value); render(); }
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
