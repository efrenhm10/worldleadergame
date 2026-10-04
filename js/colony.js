// ── COLONY — the independence path ──────────────────────────────────
//
// Stage 0: colony. Build the movement, unite the communities, win
// concessions. Stage 1 (progress 45+): self-government — your ministers
// run some domestic departments. Stage 2 (progress 80+): independence
// talks. At 100 you negotiate the final conference and write a
// constitution, choosing the system you will then have to survive.

function initColony(c) {
    G.colony = { master: c.master, progress: 8, stage: 0, militancy: 10, unity: 50, support: 45, detained: 0, indep: c.indepDate };
    G.flags.colony_start = true;
}

function colonyWillingness() {
    const c = G.colony;
    const y = c.indep ? c.indep[0] : 1965;
    let w = 0.35 + (G.year - (y - 12)) * 0.06;
    if (G.year >= 1957) w += 0.1;
    if (G.year >= 1960) w += 0.15;
    if (G.nations[c.master] && G.nations[c.master].stab < 40) w += 0.1;
    return clamp(w, 0.15, 1.4);
}

const COLONY_STAGES = ["Colony", "Self-government", "Independence talks"];

function colonyTick() {
    const c = G.colony;
    if (c.detained > 0) { c.detained--; if (c.detained === 0) { log("🔓 You are released from detention to a hero's welcome.", "good"); applyEffects({ p: { people: 8 }, colony: { support: 6 } }); } return; }
    const w = colonyWillingness();
    const col = G.pillars.colonial.l, intl = G.pillars.foreign.l;
    let r = (c.support / 50) * 1.6 * w + (intl - 50) * 0.02 + (c.unity - 50) * 0.02 + (col - 50) * 0.015 + c.militancy * 0.01;
    if (c.unity < 30) r *= 0.5;
    c.progress = clamp(c.progress + Math.max(0, r) / 52 * 6);
    c.militancy = clamp(c.militancy - 0.25);
    c.support = clamp(c.support + (approval() - c.support) * 0.01);
    const st = c.progress >= 80 ? 2 : c.progress >= 45 ? 1 : 0;
    if (st > c.stage) {
        c.stage = st;
        queueScene(st === 1 ? "self_government" : "talks_open", {});
    }
    if (c.progress >= 100 && !G.flags.final_conf) { G.flags.final_conf = true; queueScene("independence_conference", {}); }
}

function colonyMonth() {
    const c = G.colony;
    if (!c || c.detained) return;
    if (c.militancy > 45 && chance((c.militancy - 40) / 300 * (1.4 - G.pillars.colonial.l / 100))) queueScene("arrest", {});
    if (approval() < 15 && chance(0.15)) fallFromPower("movement", "Your followers have abandoned you for more radical leaders.");
}

const COLONY_ACTIONS = [
    { k: "rally", name: "Mass rally", icon: "📣", cost: 5, desc: "Fill the stadium. Builds support; the police take notes.",
      fx: { p: { people: 3 }, colony: { support: 4, militancy: 3 } } },
    { k: "organize", name: "Organize party branches", icon: "🗂️", cost: 8, funds: 8, desc: "Branches in every town and village. Slow, durable strength.",
      fx: { colony: { support: 6, progress: 1 }, p: { tribes: 2 } } },
    { k: "press", name: "Newspaper campaign", icon: "📰", cost: 5, desc: "Editorials, pamphlets and letters to London's papers.",
      fx: { colony: { support: 3 }, p: { foreign: 4 } } },
    { k: "petition", name: "Petition the colonial government", icon: "✉️", cost: 6, desc: "The respectable route. Pleases the Governor; bores the radicals.",
      fx: { p: { colonial: 6, labor: -2 }, colony: { militancy: -4, progress: 1.5 } } },
    { k: "conference", name: "Demand a constitutional conference", icon: "🏛️", cost: 15, desc: "Force the next step toward self-government. Works best with a united front.",
      run: () => { const w = colonyWillingness(), u = G.colony.unity / 60; const gain = Math.round(rnd(4, 10) * w * u); applyEffects({ colony: { progress: gain }, p: { colonial: gain > 5 ? 2 : -4 } }); return `The conference grants concessions worth +${gain} progress.`; } },
    { k: "strike", name: "General strike & boycott", icon: "✊", cost: 10, desc: "Shut the colony down. Fast progress, high risk.",
      fx: { colony: { progress: 5, militancy: 12 }, p: { colonial: -10, labor: 8, business: -6 }, growth: -0.6 } },
    { k: "unite", name: "Unite the communities", icon: "🤝", cost: 10, desc: "Court rival regions, chiefs and minorities to present one front.",
      fx: { colony: { unity: 8 }, p: { tribes: 5 } } },
    { k: "un", name: "Lobby the UN & world opinion", icon: "🌐", cost: 8, desc: "Washington, Delhi and Moscow all claim to oppose colonialism.",
      fx: { p: { foreign: 8 }, colony: { progress: 1.5 }, rel: { usa: 3, india: 4 } } },
    { k: "institutions", name: "Train an indigenous civil service", icon: "🎓", cost: 8, desc: "A state needs administrators. Prove you can govern.",
      fx: { colony: { progress: 2 }, legitimacy: 3, cost: 0.2, p: { colonial: 3 } } },
    { k: "armed", name: "Launch armed struggle", icon: "🔥", cost: 18, desc: "Take to the bush. A liberation war can win independence fast, or destroy the movement.",
      run: () => {
          const reb = ensureRebels(G.ck, "Liberation army", 2 + G.colony.support / 20);
          G.wars.push({ id: "lib_" + G.t, name: "War of Independence", a: [G.ck], b: [G.colony.master], type: "liberation", front: -10, weeks: 0, cas: { a: 0, b: 0 }, mom: 0, commit: { [G.ck]: 3 }, over: false, onEnd: "colony_lib" });
          G.flags.at_war_ever = true;
          applyEffects({ colony: { militancy: 40 }, p: { colonial: -30, foreign: -5, people: 5 } });
          return "The war of independence has begun.";
      }, req: () => !G.wars.some(w => !w.over && w.onEnd === "colony_lib") }
];

WAR_HOOKS.colony_lib = (w, win) => {
    if (win === "a") { G.colony.progress = 100; G.flags.final_conf = true; queueScene("independence_conference", { won: true }); }
    else { G.colony.progress = Math.max(0, G.colony.progress - 30); G.colony.militancy = 20; applyEffects({ p: { people: -15 }, colony: { support: -20 } }); }
};

function colonyAction(k) {
    const a = COLONY_ACTIONS.find(x => x.k === k);
    if (!a || G.colony.detained) return;
    if (G.capital < a.cost) return toast("Not enough political capital", `You need ${a.cost}.`);
    if (a.funds && G.funds < a.funds) return toast("Not enough party funds", `You need $${a.funds}M.`);
    G.capital -= a.cost;
    if (a.funds) G.funds -= a.funds;
    const ch = applyEffects(a.fx);
    const res = a.run ? a.run() : "";
    toast(a.name, res || a.desc, ch);
    log(`${a.icon} ${a.name}.`, "policy");
}

// What each colony's politics looks like after independence.
const POST_INDEP = {
    nigeria: { leg: "House of Representatives", parties: [P("npc", "Northern People's Congress", "traditionalist", 148, false, "The North's party, led by the Sardauna of Sokoto."), P("ncnc", "NCNC", "nationalist", 89, true, "Your party."), P("ag", "Action Group", "socdem", 73, false, "Awolowo's Western party.")] },
    singapore: { leg: "Parliament", parties: [P("pap", "People's Action Party", "socdem", 37, true, "Your party."), P("bs", "Barisan Sosialis", "communist", 13, false, "The left wing that split from the PAP."), P("upp", "United People's Party", "liberal", 1, false, "")] },
    barbados: { leg: "House of Assembly", parties: [P("blp", "Barbados Labour Party", "socdem", 13, true, "Your party."), P("dlp", "Democratic Labour Party", "socdem", 11, false, "Errol Barrow's breakaway party.")] },
    fiji: { leg: "House of Representatives", parties: [P("alliance", "Alliance Party", "conservative", 33, true, "Chiefs, Europeans and moderate Indo-Fijians."), P("nfp", "National Federation Party", "socdem", 19, false, "Indo-Fijian cane farmers' party.")] },
    cambodia: { leg: "National Assembly", parties: [P("crown", "Royalists", "traditionalist", 50, true, "The King's supporters."), P("dem", "Democratic Party", "liberal", 20, false, "Constitutionalists."), P("prach", "Pracheachon", "communist", 8, false, "The communists' legal front.")] },
    uae: { leg: "Federal Supreme Council", parties: null }
};

function constitutionChoices() {
    const ck = G.ck;
    const list = [
        { gov: "parliamentary", name: "Westminster parliamentary democracy", desc: "A prime minister answerable to an elected parliament. You start with a majority, but you can be voted out." },
        { gov: "presidential", name: "Presidential republic", desc: "A directly elected executive president with a fixed term. Strong, but checked by the legislature." },
        { gov: "dominant_party", name: "Dominant-party democracy", desc: "Elections continue, but your party's machine dominates them, as in Singapore or Mexico." },
        { gov: "one_party", name: "One-party state", desc: "'African socialism' or national unity: one legal party, no opposition. You decree; the Party can turn on you." }
    ];
    if (["cambodia", "uae"].includes(ck)) list.unshift({ gov: "monarchy", name: ck === "uae" ? "Federation of emirates" : "Royal government", desc: ck === "uae" ? "The seven rulers form a Supreme Council and elect you President. Power stays with the ruling families." : "Keep the throne and govern directly as King." });
    return list;
}

function achieveIndependence(gov) {
    const ck = G.ck, c = C();
    const master = G.colony.master;
    G.colony = null;
    ME().status = "sovereign";
    ME().name = { uae: "United Arab Emirates", cambodia: "Kingdom of Cambodia", nigeria: "Federation of Nigeria", singapore: "Singapore", barbados: "Barbados", fiji: "Fiji" }[ck] || c.name;
    ME().master = null;
    if (master === "uk" && !G.blocs.commonwealth.includes(ck)) G.blocs.commonwealth.push(ck);
    changeGovType(gov);
    const post = POST_INDEP[ck];
    if (gov === "monarchy") {
        G.gov.sub = ck === "uae" ? null : "constitutional";
        if (ck === "cambodia") { G.parties = post.parties; G.leader.party = "crown"; G.leg = { name: post.leg, detail: "", total: 78, system: "fptp" }; G.gov.sub = "constitutional"; }
        G.leader.title = ck === "uae" ? "President of the UAE" : "King of Cambodia";
    } else if (gov === "one_party") {
        G.parties = makeGenericParties("one_party", G.leader.ideology); G.leader.party = G.parties[0].k;
        G.leg = { name: "Party Central Committee", detail: "", total: 100, system: "party" };
        G.leader.title = "President";
    } else {
        if (post && post.parties) {
            G.parties = deep(post.parties);
            if (!G.parties.find(p => p.k === G.leader.party)) G.leader.party = G.parties.find(p => p.gov).k;
        } else { G.parties = makeGenericParties(gov, G.leader.ideology); G.leader.party = G.parties[0].k; }
        if (ck === "nigeria") G.parties.find(p => p.k === "npc").gov = true;
        if (gov === "dominant_party") { const m = G.parties.find(p => p.k === G.leader.party); m.seats = Math.round(G.parties.reduce((s, p) => s + p.seats, 0) * 0.8); }
        G.leg = { name: post ? post.leg : "Parliament", detail: "", total: G.parties.reduce((s, p) => s + p.seats, 0), system: "fptp" };
        G.leader.title = gov === "presidential" ? "President" : "Prime Minister";
    }
    buildFactions();
    G.gov.termYears = gov === "presidential" ? 5 : gov === "dominant_party" ? null : null;
    G.gov.termLimit = gov === "presidential" ? 2 : null;
    G.gov.termsServed = 1;
    G.gov.maxTerm = 5;
    G.gov.nextElection = GOV_TYPES[gov].democracy ? [G.year + (gov === "presidential" ? 5 : 4), G.month] : null;
    G.gov.termEnds = gov === "presidential" ? [G.year + 5, G.month] : null;
    Object.keys(G.pillars).forEach(k => { G.pillars[k].l = clamp(pillarTarget(k) + 8, 20, 90); });
    G.s.legitimacy = clamp(G.s.legitimacy + 25); G.s.prestige = clamp(G.s.prestige + 10);
    G.mil.base = Math.max(G.mil.base, 2);
    G.pol.military = "moderate_mil";
    addRel(ck, master, 15);
    G.capital = Math.max(G.capital, 30);
    record(`Led ${ME().name} to independence, ${dateStr()}.`);
    log(`🎉 ${ME().name} is independent! ${GOV_TYPES[gov].name}.`, "major");
}
