// ── CABINET — ministers who generate political capital ──────────────
//
// Every minister adds political capital each month (more if competent)
// and improves their department. Appointing from a faction pleases it;
// sacking its minister angers it. Disloyal ministers leak and plot.

const MINISTRIES = [
    { k: "finance",   icon: "💰", name: "Finance",              effect: "Faster growth, smaller deficits" },
    { k: "foreign",   icon: "🌐", name: "Foreign Affairs",      effect: "Bigger gains from diplomacy" },
    { k: "defense",   icon: "🎖️", name: "Defense",              effect: "Readiness and military loyalty" },
    { k: "interior",  icon: "🛡️", name: "Interior & Police",    effect: "Lower crime, earlier warning of plots" },
    { k: "health",    icon: "⚕️", name: "Health & Welfare",     effect: "Better health, less poverty" },
    { k: "industry",  icon: "🏭", name: "Industry & Trade",     effect: "Faster industrial growth" },
    { k: "education", icon: "🎓", name: "Education & Science",  effect: "Faster literacy and technology" }
];

const MIN_TITLES = {
    usa: { finance: "Secretary of the Treasury", foreign: "Secretary of State", defense: "Secretary of Defense", interior: "Attorney General", health: "Federal Security Administrator", industry: "Secretary of Commerce", education: "Commissioner of Education" },
    uk: { finance: "Chancellor of the Exchequer", foreign: "Foreign Secretary", defense: "Minister of Defence", interior: "Home Secretary", health: "Minister of Health", industry: "President of the Board of Trade", education: "Minister of Education" },
    russia: { finance: "People's Commissar of Finance", foreign: "Foreign Minister", defense: "Minister of the Armed Forces", interior: "Minister of State Security", health: "Minister of Health", industry: "Chairman of Gosplan", education: "Minister of Higher Education" }
};

function ministerTitle(k) {
    const t = MIN_TITLES[G.ck];
    if (t && t[k]) return t[k];
    const m = MINISTRIES.find(x => x.k === k);
    if (G.gov.type === "colony") return `Shadow spokesman for ${m.name}`;
    if (G.gov.type === "monarchy" && !G.gov.sub) return `Minister of ${m.name} (royal appointee)`;
    return `Minister of ${m.name}`;
}

// Real 1950 office-holders for some countries (offered if you keep the historical leader).
const HIST_CABINET = {
    usa: { finance: ["John W. Snyder", 3], foreign: ["Dean Acheson", 5], defense: ["Louis A. Johnson", 2], interior: ["J. Howard McGrath", 2], health: ["Oscar R. Ewing", 4], industry: ["Charles Sawyer", 3], education: ["Earl J. McGrath", 3] },
    uk: { finance: ["Sir Stafford Cripps", 4], foreign: ["Ernest Bevin", 5], defense: ["Emanuel Shinwell", 3], interior: ["James Chuter Ede", 3], health: ["Aneurin Bevan", 5], industry: ["Harold Wilson", 4], education: ["George Tomlinson", 3] },
    russia: { finance: ["Arseny Zverev", 3], foreign: ["Andrei Vyshinsky", 3], defense: ["Aleksandr Vasilevsky", 5], interior: ["Lavrentiy Beria", 5], health: ["Yefim Smirnov", 3], industry: ["Maksim Saburov", 4], education: ["Sergei Kaftanov", 3] },
    china: { finance: ["Bo Yibo", 4], foreign: ["Zhou Enlai", 5], defense: ["Zhu De", 4], interior: ["Luo Ruiqing", 3], health: ["Li Dequan", 3], industry: ["Chen Yun", 5], education: ["Ma Xulun", 3] },
    india: { finance: ["John Matthai", 4], foreign: ["Girija Shankar Bajpai", 4], defense: ["Baldev Singh", 2], interior: ["Vallabhbhai Patel", 5], health: ["Rajkumari Amrit Kaur", 4], industry: ["Syama Prasad Mookerjee", 3], education: ["Maulana Abul Kalam Azad", 5] }
};

const MIN_FLAVOR = ["veteran administrator", "rising star", "party fixer", "former professor", "ex-banker", "war veteran", "union organizer", "provincial governor", "lawyer", "engineer", "journalist", "old family friend"];

function cabinetFactions() {
    const fs = G.factions.filter(f => f.gov);
    return fs.length ? fs : G.factions.slice(0, 3);
}

function makeCandidate(post, idx, ck, preferFac) {
    const fs = cabinetFactions();
    const f = preferFac || fs[(idx + Math.floor(Math.random() * fs.length)) % fs.length];
    const comp = clamp(Math.round(rnd(1, 5.4)), 1, 5);
    return {
        name: randomLeaderName(ck), comp, loyalty: Math.round(rnd(40, 80)), fac: f ? f.k : null, facName: f ? f.name : "Independent",
        ideo: f ? f.ideo : "liberal", flavor: pick(MIN_FLAVOR), post
    };
}

function cabinetCandidates(post) {
    const out = [];
    const hist = G.leader.historical && G.t === 0 && HIST_CABINET[G.ck] && HIST_CABINET[G.ck][post];
    if (hist) {
        const mine = G.factions.find(f => f.mine) || G.factions[0];
        out.push({ name: hist[0], comp: hist[1], loyalty: 70, fac: mine.k, facName: mine.name, ideo: mine.ideo, flavor: "historical office-holder", post, hist: true });
    }
    const fs = cabinetFactions();
    while (out.length < 3) out.push(makeCandidate(post, out.length, G.ck, fs[out.length % fs.length]));
    return out;
}

function initCabinetDraft() {
    const d = {};
    MINISTRIES.forEach(m => { d[m.k] = { cands: cabinetCandidates(m.k), pick: 0 }; });
    return d;
}

function appointCabinet(draft) {
    G.cabinet = {};
    MINISTRIES.forEach(m => {
        const c = draft[m.k].cands[draft[m.k].pick];
        G.cabinet[m.k] = Object.assign({}, c, { since: G.t });
        const f = G.factions.find(x => x.k === c.fac);
        if (f) f.loyalty = clamp(f.loyalty + 4);
    });
    // Balance: factions left out of cabinet resent it.
    cabinetFactions().forEach(f => { if (!Object.values(G.cabinet).some(c => c.fac === f.k)) f.loyalty = clamp(f.loyalty - 8); });
}

function minComp(k) { if (!G.cabinet) return 3; return G.cabinet[k] ? G.cabinet[k].comp : 1; }
function minBonus(k) { return minComp(k) - 3; }

function cabinetCapital() {
    if (!G.cabinet) return 0;
    return Object.values(G.cabinet).filter(Boolean).reduce((s, c) => s + 0.3 + c.comp * 0.3, 0);
}

function sackMinister(post) {
    const c = G.cabinet[post];
    if (!c) return;
    if (G.capital < 4) return toast("Not enough political capital", "Reshuffles cost 4.");
    G.capital -= 4;
    const f = G.factions.find(x => x.k === c.fac);
    if (f) f.loyalty = clamp(f.loyalty - 8);
    G.reshuffle = G.reshuffle || {};
    G.reshuffle[post] = cabinetCandidates(post);
    log(`👔 You dismiss ${c.name} as ${ministerTitle(post)}.`, "policy");
    G.cabinet[post] = null;
}

function appointMinister(post, i) {
    const c = G.reshuffle && G.reshuffle[post] && G.reshuffle[post][i];
    if (!c) return;
    G.cabinet[post] = Object.assign({}, c, { since: G.t });
    const f = G.factions.find(x => x.k === c.fac);
    if (f) f.loyalty = clamp(f.loyalty + 5);
    delete G.reshuffle[post];
    log(`👔 ${c.name} becomes ${ministerTitle(post)}.`, "policy");
}

function cabinetMonthly() {
    if (!G.cabinet) return;
    Object.entries(G.cabinet).forEach(([post, c]) => {
        if (!c) return;
        c.loyalty = clamp(c.loyalty + (approval() - 50) * 0.02 + rnd(-1, 1));
        if (c.loyalty < 25 && chance(0.06)) queueScene("minister_trouble", { post });
    });
}

// ── National indicators: health, crime, poverty ─────────────────────

function gdpPerCapita(gdp = G.econ.gdp, pop = G.econ.pop) { return gdp * 1000 / Math.max(0.01, pop); }

// What income and schooling alone give a country, before any policy.
const healthBase = () => 20 + 28 * Math.log10(Math.max(1, gdpPerCapita() / 20)) + (G.dev.lit - 50) * 0.1;
const povertyBase = () => 100 - 32 * Math.log10(Math.max(1, gdpPerCapita() / 15));
// Anti-poverty programs reach more people where more people are poor.
const povertyReach = () => clamp(povertyBase() / 35, 0.6, 1.8);
// Where most people farm, rural roads and irrigation lift them out of poverty.
const ruralShare = () => clamp(G.ind.agriculture.out / G.econ.gdp * 2, 0.2, 1);
const ruralPoverty = () => -(Math.max(0, covRel("irrigation")) * 4 + Math.max(0, covRel("roads")) * 2) * ruralShare();

function healthTarget() {
    let t = healthBase() + megaFx("health") + lmFx("health") + cultureFx("health");
    t += lawFx("health") + covRel("hospitals") * 4 + taxHealth();
    t += minBonus("health") * 1.5 - G.s.weariness * 0.05;
    return clamp(t, 5, 98);
}

function povertyTarget() {
    let t = povertyBase();
    const lp = lawFx("poverty");
    t += (lp < 0 ? lp * povertyReach() : lp) - covRel("housing") * 3 + ruralPoverty() + remittancePoverty() + megaFx("poverty") + wagePoverty() + devFx("poverty");
    t -= G.pol.land === "reform" ? 3 * povertyReach() : 0;
    t += (G.econ.unemp - 6) * 0.8 - minBonus("health");
    if (G.pol.economy === "collectivized" || G.pol.economy === "planned") t -= 4;
    return clamp(t, 2, 98);
}

function crimeTarget() {
    let t = 15 + G.econ.unemp * 1.2 + G.dev.urban * 0.15 + G.s.poverty * 0.2 + (G.s.liberty > 60 ? 4 : 0) - (G.s.stability - 50) * 0.15;
    t -= { political: 8, terror: 15 }[G.pol.security] || 0;
    t -= minBonus("interior") * 2;
    t += lawFx("crime") - covRel("housing") * 1.5 + cultureFx("crime");
    return clamp(t, 2, 95);
}

// Indicator profile for the country picker, from 1950 data.
function countryProfile(ck) {
    const c = COUNTRIES[ck], e = c.econ;
    const pc = e.gdp * 1000 / e.pop;
    const preset = Object.assign({}, PRESETS[c.preset], c.pol || {});
    const health = clamp(20 + 28 * Math.log10(Math.max(1, pc / 20)) + (c.dev.lit - 50) * 0.1 + ({ private: -4, subsidized: 2, national: 7 }[preset.health] || 0));
    const poverty = clamp(100 - 32 * Math.log10(Math.max(1, pc / 15)) - ({ safety: 5, welfare: 11 }[preset.welfare] || 0));
    const unemp = c.status === "colony" || c.dev.tech < 30 ? 8 : 5;
    const crime = clamp(15 + unemp * 1.2 + c.dev.urban * 0.15 + poverty * 0.2 + (c.s.liberty > 60 ? 4 : 0) - (c.s.stability - 50) * 0.15 - ({ political: 8, terror: 15 }[preset.security] || 0));
    return { ls: livingStandards(pc, health, poverty, c.dev.lit), gdp: e.gdp, pc, health, lit: c.dev.lit, unemp, crime, poverty, stability: c.s.stability, mil: c.mil.base, liberty: c.s.liberty };
}
