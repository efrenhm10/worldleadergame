// ── ENGINE — state, weekly simulation, effects ──────────────────────
//
// One turn is one week. Economic and political quantities move a little
// every week toward targets set by your policies and circumstances;
// decisions and events shock them. Monthly and yearly processes
// (historical events, elections, aging) hang off the weekly tick.

let G = null;
const SAVE_KEY = "worldleader-1950/v2";

const clamp = (v, a = 0, b = 100) => Math.max(a, Math.min(b, v));
const rnd = (a, b) => a + Math.random() * (b - a);
const chance = p => Math.random() < p;
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const fmt = (v, d = 1) => (Math.round(v * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d);
const sgn = v => (v > 0 ? "+" : "") + v;
const money = bn => {
    const a = Math.abs(bn), sg = bn < 0 ? "-" : "";
    if (a >= 1000) return `${sg}$${fmt(a / 1000, 2)}T`;
    if (a >= 1) return `${sg}$${fmt(a, a >= 100 ? 0 : 1)}B`;
    if (a * 1000 >= 10 || a === 0) return `${sg}$${fmt(a * 1000, 0)}M`;
    if (a * 1000 >= 1) return `${sg}$${fmt(a * 1000, 1)}M`;
    return `${sg}$${Math.max(1, Math.round(a * 1e6))}K`;
};

// GDP is simulated in constant 1950 dollars; displays convert to nominal
// dollars with the US price level.
const CPI = [[1950, 1], [1960, 1.23], [1970, 1.61], [1975, 2.24], [1980, 3.42], [1985, 4.47], [1990, 5.42], [2000, 7.14], [2010, 9.06], [2020, 10.7], [2023, 12.7], [2026, 13.4]];
function cpi(y = (G ? G.year : 1950)) {
    for (let i = 1; i < CPI.length; i++) if (y <= CPI[i][0]) { const [y0, v0] = CPI[i - 1], [y1, v1] = CPI[i]; return v0 + (v1 - v0) * (y - y0) / (y1 - y0); }
    return CPI[CPI.length - 1][1] * Math.pow(1.025, y - 2026);
}
const nominal = bn => money(bn * cpi());
const C = () => COUNTRIES[G.ck];
const GT = () => GOV_TYPES[G.gov.type];
const ME = () => G.nations[G.ck];
const isDemocracy = () => !!GT().democracy;
const hasPillar = k => !!G.pillars[k];
const approval = () => hasPillar("people") ? G.pillars.people.l : 50;
const dateOf = t => new Date(1950, 0, 2 + 7 * t);
const dateStr = (t = G.t) => { const d = dateOf(t); return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; };
const monthStr = (y, m) => `${MONTHS_LONG[m - 1]} ${y}`;
const ymNum = (y, m) => y * 12 + (m - 1);
const nowYM = () => ymNum(G.year, G.month);
const weeksUntil = ym => Math.max(0, Math.round(((ym[0] * 12 + ym[1] - 1) - nowYM()) * 4.345 - (dateOf(G.t).getDate() - 1) / 7));
const trait = k => G.leader.traits.includes(k);
const skill = k => G.leader.skills[k] || 0;
const nationName = k => G.nations[k] ? G.nations[k].name : k;
const flagOf = k => G.nations[k] ? G.nations[k].flag : "🏳️";
const indShare = k => G && G.ind[k] ? indValue(k) / G.econ.gdp * 100 : 0;
const indValue = k => G.ind[k].out * (k === "oil" ? G.oilPrice : 1);
const pillarName = k => (C().pillarNames && C().pillarNames[k]) || PILLARS[k].name;
const relKey = (a, b) => a < b ? `${a}|${b}` : `${b}|${a}`;
function getRel(a, b) { if (a === b) return 100; const v = G.rel[relKey(a, b)]; return v == null ? 0 : v; }
function addRel(a, b, d) { if (a === b) return; G.rel[relKey(a, b)] = clamp(getRel(a, b) + d, -100, 100); }
function setRel(a, b, v) { G.rel[relKey(a, b)] = clamp(v, -100, 100); }
function playerAtWarWithRebels() { return G.wars.some(w => !w.over && w.type === "insurgency" && w.b.includes(G.ck)); }
function playerWars() { return G.wars.filter(w => !w.over && (w.a.includes(G.ck) || w.b.includes(G.ck))); }

// ── Log ─────────────────────────────────────────────────────────────

function log(text, type = "info", key = null) {
    G.log.unshift({ t: G.t, text, type, key });
    if (G.log.length > 400) G.log.length = 400;
}
function record(text) { G.record.push({ t: G.t, text }); }

// ── New game ────────────────────────────────────────────────────────

function deep(o) { return JSON.parse(JSON.stringify(o)); }

function newGame(opts) {
    const ck = opts.ck, c = COUNTRIES[ck];
    G = {
        v: 1, ck, t: 0, year: 1950, month: 1,
        leader: {
            name: opts.name, age: opts.age, gender: opts.gender || "m", bg: opts.bg, traits: opts.traits.slice(),
            skills: Object.assign({ oratory: 0, legislation: 0, economics: 0, diplomacy: 0, military: 0, intrigue: 0 }, opts.skills),
            look: opts.look, ideology: opts.ideology, party: opts.party, title: genderTitle(c.leader.title, opts.gender), health: 80, since: 0, historical: !!opts.historical,
            heir: c.heir ? deep(c.heir) : null
        },
        gov: { type: c.gov, sub: c.monarchy || null },
        flags: {}, fired: {}, scenes: [], log: [], record: [], tenures: [], goalsDone: {}, hist: [], rcool: {}, ious: [],
        pmods: {}, capital: 25, funds: 20, polCool: {}, projects: [], treaties: [], over: null,
        tension: 72, oilPrice: 1, campaign: { bonus: 0 }, events: 0
    };
    G.leader.health = clamp(95 - Math.max(0, opts.age - 45) * 0.9 + (trait("hardy") ? 10 : 0), 30, 98);
    setupGovTerms(c);
    setupParties(c, opts.party);
    setupEconomy(c);
    initLaws(c);
    G.bills = []; G.assets = {};
    G.cabinet = null;
    G.s.poverty = povertyTarget(); G.s.health = healthTarget(); G.s.crime = crimeTarget();
    G.ref = { health: G.s.health, poverty: G.s.poverty, crime: G.s.crime, pc: gdpPerCapita() };
    recomputeDerived(); initInfra(); initCip();
    setupWorld();
    initInstitutions();
    G.powerHist = []; powerYearly();
    G.leader.family = initFamily(!!opts.historical);
    tre(); treasuryYearly();
    G.econ.rev = taxBase().total; G.econ.spend = governmentSpend().total; G.econ.deficit = G.econ.spend - G.econ.rev;
    setupPillars();
    if (c.status === "colony") initColony(c);
    if (typeof setupInitialWars === "function") setupInitialWars();
    // Backstory and traits: who already trusts you.
    applyBackground();
    recomputeDerived();
    G.hist.push(snapshot());
    log(`${G.leader.name} takes office as ${G.leader.title} of ${c.name}.`, "major");
    record(`Took office as ${G.leader.title} of ${c.name}, January 1950.`);
    if (typeof openingScenes === "function") openingScenes();
    return G;
}

function setupGovTerms(c) {
    const t = c.term || {};
    Object.assign(G.gov, {
        termYears: t.years || null, termLimit: t.limit || null, termsServed: t.served || 1,
        termEnds: t.ends || null, nextElection: t.next || null,
        legEvery: t.legEvery || null, legNext: t.legNext || null,
        noSnap: !!c.noSnap, refLosses: 0, cohabitation: false
    });
    if (G.gov.type === "parliamentary" || G.gov.type === "occupied") G.gov.maxTerm = 5;
    if (["newzealand", "australia"].includes(G.ck)) G.gov.maxTerm = 3;
    if (G.gov.type === "dominant_party") G.gov.termYears = G.gov.termYears || 6;
}

const IDEO_POS = { communist: 0, socialist: 1, socdem: 2, liberal: 3, conservative: 4, nationalist: 4.5, traditionalist: 5, militarist: 5.5 };
const ideoDist = (a, b) => Math.abs(IDEO_POS[a] - IDEO_POS[b]);

function setupParties(c, partyKey) {
    G.parties = deep(c.parties);
    const hist = c.leader.party;
    if (partyKey && partyKey !== hist && G.parties.find(p => p.k === partyKey)) {
        // Alternate history: your party won instead. Swap seat counts.
        const mine = G.parties.find(p => p.k === partyKey), old = G.parties.find(p => p.k === hist);
        const s = mine.seats; mine.seats = old.seats; old.seats = s;
        mine.gov = true; old.gov = false;
        G.parties.forEach(p => { if (p !== mine && p.gov && ideoDist(p.ideo, mine.ideo) > 2) p.gov = false; });
        G.flags.altStart = true;
    }
    G.leader.party = partyKey || hist;
    const total = G.parties.reduce((s, p) => s + p.seats, 0);
    G.leg = { name: c.leg.name, detail: c.leg.detail, total, system: c.leg.system };
    buildFactions();
}

function buildFactions() {
    const old = {};
    (G.factions || []).forEach(f => { old[f.k] = f.loyalty; });
    G.factions = [];
    G.parties.forEach(p => {
        const list = p.fac || [F(p.name, 1, p.ideo, p.desc)];
        list.forEach((f, i) => {
            const k = `${p.k}:${i}`;
            G.factions.push({
                k, party: p.k, name: f.n, ideo: f.ideo, desc: f.d || p.desc, seats: Math.round(p.seats * f.share), gov: p.gov,
                mine: p.k === G.leader.party,
                loyalty: old[k] != null ? old[k] : (p.k === G.leader.party ? 62 : p.gov ? 52 : 28) - (ideoDist(f.ideo, G.leader.ideology || p.ideo) * 4)
            });
        });
    });
    // Your own faction: the one in your party closest to your ideology.
    const mine = G.factions.filter(f => f.mine);
    if (mine.length) mine.reduce((a, b) => ideoDist(b.ideo, G.leader.ideology || b.ideo) < ideoDist(a.ideo, G.leader.ideology || a.ideo) ? b : a).core = true;
}

function setupEconomy(c) {
    const e = c.econ;
    G.econ = { gdp: e.gdp, gdp0: e.gdp, pop: e.pop, growth: e.growth, inflation: 3, unemp: c.status === "colony" || (c.dev.ind || 0) < 20 ? 8 : 5, debt: e.debt / 100 * e.gdp, shock: 0, deficit: 0, rev: 0, spend: 0 };
    G.res = (c.res || []).slice();
    G.ind = {};
    let sum = 0;
    Object.keys(INDUSTRIES).forEach(k => {
        const out = (e.inds[k] || 0) / 100 * e.gdp;
        sum += out;
        const own = c.preset === "communist" ? "state" : (k === "oil" && ["nationalized"].includes((c.pol || {}).resources)) ? "state" : (c.status === "colony" && ["mining", "oil"].includes(k)) ? "foreign" : (k === "oil" && (c.pol || {}).resources !== "nationalized") ? "foreign" : "private";
        G.ind[k] = { out, out0: out, sup: 0, own };
    });
    G.econ.services = Math.max(e.gdp * 0.1, e.gdp - sum);
    G.pol = Object.assign({}, PRESETS[c.preset], c.pol || {});
    G.dev = Object.assign({ ind: 0 }, deep(c.dev));
    G.mil = { strength: c.mil.base * (c.mil.noArmy ? 0.1 : 1), base: c.mil.base, nukes: c.mil.nukes, prog: c.mil.prog || 0, noArmy: !!c.mil.noArmy };
    G.s = Object.assign({ corruption: e.corruption, scandal: 5, readiness: 50, weariness: 0 }, deep(c.s));
    G.regions = c.regions.map(r => Object.assign(deep(r), { mod: 0 }));
    G.align = c.align;
    G.econ.taxCap = e.taxCap;
}

function setupPillars() {
    G.pillars = {};
    Object.keys(GT().pillars).forEach(k => { G.pillars[k] = { l: 50 }; });
    Object.keys(G.pillars).forEach(k => { G.pillars[k].l = clamp(pillarTarget(k) + rnd(-5, 5), 5, 95); });
}

function applyBackground() {
    const bg = BACKGROUNDS[G.leader.bg];
    if (bg) {
        Object.entries(bg.p || {}).forEach(([k, v]) => { if (G.pillars[k]) { G.pillars[k].l = clamp(G.pillars[k].l + v, 3, 97); G.pmods[k] = (G.pmods[k] || 0) + v * 0.5; } });
        if (bg.approval && G.pillars.people) G.pillars.people.l = clamp(G.pillars.people.l + bg.approval, 3, 97);
        G.factions.forEach(f => {
            if (bg.fac.gov && f.gov) f.loyalty += bg.fac.gov;
            if (bg.fac.opp && !f.gov) f.loyalty += bg.fac.opp;
        });
        if (bg.legitimacy) G.s.legitimacy = clamp(G.s.legitimacy + bg.legitimacy);
        if (bg.prestige) G.s.prestige = clamp(G.s.prestige + bg.prestige);
        if (bg.scandal) G.s.scandal += bg.scandal;
        Object.entries(bg.skills || {}).forEach(([k, v]) => { G.leader.skills[k] = Math.min(6, (G.leader.skills[k] || 0) + v); });
    }
    G.leader.traits.forEach(tk => {
        const t = TRAITS[tk];
        Object.entries(t.p || {}).forEach(([k, v]) => { if (G.pillars[k]) { G.pillars[k].l = clamp(G.pillars[k].l + v, 3, 97); G.pmods[k] = (G.pmods[k] || 0) + v * 0.6; } });
    });
    G.factions.forEach(f => { f.loyalty = clamp(f.loyalty, 5, 95); });
}

// ── Policy aggregates ───────────────────────────────────────────────

function curOpt(area) { return policyOpt(area, G.pol[area]) || POLICY[area].options[0]; }

// National frameworks plus every law in force.
function policyFx(key) {
    let s = 0;
    POLICY_AREAS.forEach(a => { const o = curOpt(a.key); if (o.fx && o.fx[key]) s += o.fx[key]; });
    return s + lawFx(key);
}

function policySpend() { return governmentSpend().total; }

function milSpend() { return (curOpt("military").spend || 0); }

// ── Derived scores ──────────────────────────────────────────────────

const STAT_SCORE = {
    growth: () => (G.econ.growth - 3) * 7,
    unemp: () => -(G.econ.unemp - 6) * 5,
    inflation: () => -(G.econ.inflation - 4) * 3.5,
    stability: () => G.s.stability - 50,
    liberty: () => G.s.liberty - 50,
    repression: () => 50 - G.s.liberty,
    corruption: () => -(G.s.corruption - 30),
    graft: () => G.s.corruption - 30,
    prestige: () => G.s.prestige - 50,
    weariness: () => -G.s.weariness,
    readiness: () => G.s.readiness - 50,
    scandal: () => -G.s.scandal,
    legitimacy: () => G.s.legitimacy - 50,
    approval: () => approval() - 50,
    milspend: () => (milSpend() - 4) * 6,
    // People judge health, poverty and crime mostly against what they have
    // grown used to (G.ref drifts toward current values over ~7 years).
    health: () => (G.s.health - G.ref.health) * 2.5 + (G.s.health - 50) * 0.2,
    poverty: () => -(G.s.poverty - G.ref.poverty) * 2.5 - (G.s.poverty - 40) * 0.15,
    crime: () => -(G.s.crime - G.ref.crime) * 2 - (G.s.crime - 35) * 0.3
};

function pillarTarget(k) {
    const def = PILLARS[k];
    let t = 50, s = 0, w = 0;
    Object.entries(def.needs).forEach(([stat, wt]) => {
        let wt2 = wt;
        if (k === "people" && stat === "liberty") wt2 = isDemocracy() ? 1 : 0.35;
        s += wt2 * clamp(STAT_SCORE[stat](), -50, 50); w += Math.abs(wt2);
    });
    if (w) t += s / w * 0.85;
    POLICY_AREAS.forEach(a => { const o = curOpt(a.key); if (o.p && o.p[k]) t += o.p[k] * 0.6; });
    t += lawPillar(k) * 0.6 + taxPillarEffect(k) + familyPillar(k) + tradePillar(k);
    const id = IDEOLOGIES[G.leader.ideology];
    if (id && id.p && id.p[k]) t += id.p[k] * 0.5;
    t += G.pmods[k] || 0;
    // Special cases.
    if (k === "occupation") t += G.align > 50 ? 8 : -15;
    if (k === "foreign") {
        const patron = patronOf();
        if (patron) t += getRel(G.ck, patron) * 0.25;
    }
    if (k === "colonial" && G.colony) t -= G.colony.militancy * 0.4;
    if (k === "coalition") t = G.parties.some(p => p.gov && p.k !== G.leader.party) ? t - Math.max(0, partnerIdeoGap() - 1) * 6 : 60 + (t - 50) * 0.3;
    if (k === "politburo" || k === "party") t += (factionLoyaltyAvg(true) - 50) * 0.3;
    if (k === "military") t += skill("military") * 1.5 + playerWarScore() * 0.2 + minBonus("defense") * 1.5;
    if (k === "people" && G.gov.type === "monarchy") t += 5;
    if (k === "people" && C().excluded && G.pol.rights === "segregation") t += 4;
    return clamp(t, 3, 97);
}

function patronOf() { return G.align >= 0 ? "usa" : "russia"; }

function partnerIdeoGap() {
    const mine = G.parties.find(p => p.k === G.leader.party);
    const partners = G.parties.filter(p => p.gov && p.k !== G.leader.party);
    if (!mine || !partners.length) return 0;
    return Math.max(...partners.map(p => ideoDist(p.ideo, G.leader.ideology)));
}

function factionLoyaltyAvg(govOnly) {
    const fs = G.factions.filter(f => !govOnly || f.gov);
    const tot = fs.reduce((s, f) => s + f.seats, 0);
    if (!tot) return 50;
    return fs.reduce((s, f) => s + f.loyalty * f.seats, 0) / tot;
}

function playerWarScore() {
    let s = 0;
    playerWars().forEach(w => { s += w.a.includes(G.ck) ? w.front : -w.front; });
    return clamp(s, -60, 60);
}

function govSeats() { return G.factions.filter(f => f.gov).reduce((s, f) => s + f.seats, 0); }
function mySeats() { return G.factions.filter(f => f.mine).reduce((s, f) => s + f.seats, 0); }
function majority() { return Math.floor(G.leg.total / 2) + 1; }

function stabilityTarget() {
    let t = 50 + policyFx("stability") + (approval() - 50) * 0.3 + (G.econ.growth - 3) * 1.2;
    t -= Math.max(0, G.econ.inflation - 8) * 0.8 + Math.max(0, G.econ.unemp - 8) * 0.8 + G.s.weariness * 0.12;
    if (playerAtWarWithRebels()) t -= 10;
    t -= Math.max(0, G.s.crime - 40) * 0.12;
    t += taxStability();
    if (C().excluded && G.pol.rights === "segregation") t -= 6 + Math.max(0, G.year - 1950) * 0.3;
    if (G.pol.rights === "segregation" && G.ck === "usa") t -= Math.max(0, G.year - 1954) * 0.4;
    if (G.gov.type === "military_junta") t -= 4;
    return clamp(t, 3, 97);
}

function legitimacyTarget() {
    const a = approval(), type = G.gov.type;
    let t;
    if (GT().democracy) t = 55 + (a - 50) * 0.4 + (G.s.liberty - 50) * 0.2;
    else if (type === "monarchy") t = 55 + ((G.pillars.clergy ? G.pillars.clergy.l : 50) - 50) * 0.3 + (a - 50) * 0.25;
    else if (type === "one_party") t = 45 + (G.econ.growth - 3) * 2 + (G.s.prestige - 50) * 0.3 + (a - 50) * 0.2;
    else if (type === "dominant_party") t = 50 + (G.econ.growth - 3) * 1.5 + (a - 50) * 0.3;
    else if (type === "military_junta") t = 30 + (G.s.stability - 50) * 0.3 + (a - 50) * 0.3;
    else t = 40 + (a - 50) * 0.4;
    t += policyFx("legitimacy") + (BACKGROUNDS[G.leader.bg] && BACKGROUNDS[G.leader.bg].legitimacy || 0) * 0.5;
    return clamp(t, 3, 97);
}

function prestigeTarget() {
    let t = 22 + 14 * Math.log10(Math.max(0.05, G.econ.gdp)) + G.mil.nukes * 6 + policyFx("prestige");
    if (G.ck === "usa" || G.ck === "russia") t += 10;
    if (G.flags.first_satellite) t += 6;
    if (G.flags.first_human_space) t += 5;
    if (G.flags.moon) t += 8;
    if (G.gov.type === "colony") t = Math.min(t, 25);
    if (G.gov.type === "occupied") t -= 15;
    t += (G.pmods.prestige || 0) + Math.min(6, indShare("film") * 3);
    return clamp(t, 2, 98);
}

function recomputeDerived() {
    const heavy = Object.entries(G.ind).filter(([k]) => INDUSTRIES[k].heavy).reduce((s, [k]) => s + indValue(k), 0);
    const agri = G.ind.agriculture.out;
    // Heavy industry's weight in the economy, discounted while most people still farm.
    G.dev.ind = clamp(Math.round(heavy / G.econ.gdp * 2.6 * (1 - agri / G.econ.gdp) * 1000) / 10, 0, 100);
    if (G.nations && ME()) { ME().gdp = G.econ.gdp; ME().mil = G.mil.strength; ME().stab = G.s.stability; ME().nukes = G.mil.nukes; ME().pop = G.econ.pop; ME().gov = G.gov.type; ME().leader = G.leader.name; ME().align = G.align; ME().tech = G.dev.tech; }
}

function devStage(v = G.dev.ind) { let s = DEV_STAGES[0][1]; DEV_STAGES.forEach(([t, n]) => { if (v >= t) s = n; }); return s; }

function snapshot() {
    return { t: G.t, a: Math.round(approval()), g: +fmt(G.econ.growth, 1), s: Math.round(G.s.stability), gdp: +fmt(G.econ.gdp, 2), i: +fmt(G.econ.inflation, 1), d: Math.round(G.econ.debt / G.econ.gdp * 100),
        dv: [G.dev.ind, G.dev.tech, G.dev.lit, G.dev.uni, G.dev.urban].map(v => Math.round(v * 100) / 100) };
}

// ── Industry availability ───────────────────────────────────────────

function indAvailable(k) {
    const d = INDUSTRIES[k];
    if (d.from && G.year < d.from) return false;
    if (d.res && !G.res.includes(d.res)) return false;
    return true;
}

function indGap(k) {
    const d = INDUSTRIES[k];
    return Math.max(0, d.tech - G.dev.tech) * 0.15 + Math.max(0, d.lit - G.dev.lit) * 0.08 + Math.max(0, d.uni - G.dev.uni) * 0.6;
}

// Conditional convergence: poorer countries catch up if their people are
// educated and the state is stable; the richest economies face a drag.
function frontierPC() {
    const pcs = Object.values(G.nations).filter(n => n.key !== G.ck && n.pop >= 8 && !n.oil && !n.rebel && n.gdp > 0 && n.status === "sovereign").map(n => n.gdp * 1000 / n.pop);
    // The technological frontier advances about 2% a year per person.
    return Math.max(1974 * Math.pow(1.02, G.year - 1950 + (G.month - 1) / 12), ...pcs);
}

function convergence() {
    // Above the frontier (richest large economy), growth slows sharply.
    const fr = frontierPC();
    if (gdpPerCapita() > fr * 1.05 && fr > 1) return clamp(-0.6 - Math.log10(gdpPerCapita() / fr) * 6, -5, -0.6);
    const frontier = Math.max(gdpPerCapita(), fr);
    const gap = Math.log10(frontier / Math.max(1, gdpPerCapita()));
    if (gap < 0.15) return -0.6;
    return clamp(gap * 2.6, 0, 5) * Math.pow(G.dev.lit / 100, 1.3) * clamp(G.s.stability / 60, 0.3, 1.2);
}

function indRate(k) {
    const d = INDUSTRIES[k], i = G.ind[k];
    let r = industryTrend(k, G.year) * 0.72;
    r += policyFx("growth") * 0.9;
    r += SUPPORT_LEVELS[i.sup].bonus * wtoSupportMult() + gattIndBonus(k);
    r -= Math.min(9, indGap(k));
    const econ = G.pol.economy;
    if (i.own === "state") r += (econ === "planned" || econ === "collectivized") ? (d.heavy ? 1.2 : -0.5) : -0.8;
    if (i.own === "foreign") r += 1.2;
    r += (G.s.stability - 50) * 0.04;
    r += d.heavy ? covRel("power") * 0.8 + (covRel("rail") + covRel("roads")) * 0.3 : covRel("roads") * 0.3;
    if (k === "agriculture") r += ({ landlords: -0.4, reform: 0.5, collective: -1.6, mechanize: 1.2 }[G.pol.land] || 0) + lawFx("agri") + covRel("irrigation") * 1.5;
    else r += lawFx("indAll");
    r += sectorBonus(k) + taxIndEffect(k) + tradeIndEffect(k);
    if (k === "film") r += { free: 1, restricted: -0.8, state: -2.5 }[G.pol.press] || 0;
    if (["textiles", "autos", "electronics", "finance", "tourism"].includes(k)) r += { trade_free: 1, protection: -0.6, autarky: -2 }[G.pol.trade] || 0;
    if (d.heavy && G.pol.trade === "protection") r += 0.4;
    if (["steel", "aerospace", "shipbuilding", "machinery"].includes(k) && playerWars().length) r += 1.5;
    if (k === "tourism" && (playerWars().length || G.s.stability < 35)) r -= 4;
    if (k === "finance") r += (G.s.stability - 50) * 0.04 + (G.pol.economy === "market" ? 1 : G.pol.economy === "planned" ? -2 : 0);
    if (k === "oil") r += { concessions: 1, partnership: 0.5, nationalized: -0.8 }[G.pol.resources] || 0;
    r += convergence();
    r += skill("economics") * 0.12 + minBonus("finance") * 0.15 + minBonus("industry") * (d.heavy ? 0.25 : 0.1);
    r -= Math.min(4, Math.max(0, G.econ.debt / G.econ.gdp * 100 - 70) * 0.03);
    r -= Math.min(4, Math.max(0, G.econ.inflation - 10) * 0.08);
    r += clamp(G.econ.shock, -12, 8);
    if (G.gov.type === "colony") r -= 0.5;
    return clamp(r, -25, 40);
}

// ── Weekly tick ─────────────────────────────────────────────────────

function advanceWeek() {
    if (G.over) return;
    if (G.scenes.length) return;
    const oldMonth = G.month, oldYear = G.year;
    G.t++;
    const d = dateOf(G.t);
    G.year = d.getFullYear(); G.month = d.getMonth() + 1;
    const newMonth = G.month !== oldMonth, newYear = G.year !== oldYear;

    economyTick();
    devTick();
    statsTick();
    pillarsTick();
    regionsTick();
    cipTick();
    legislatureTick();
    if (G.colony) colonyTick();
    capitalTick();
    worldWeekTick();
    recomputeDerived();

    if (newMonth) monthlyTick(newYear);
    if (!G.over) govWeekCheck();
    if (!G.over && !G.scenes.length && chance(0.075)) randomEvent();
    if (G.t % 4 === 0) { G.hist.push(snapshot()); if (G.hist.length > 700) G.hist.shift(); }
    save();
}

function monthlyTick(newYear) {
    if (newYear) {
        G.leader.age++;
        G.factions.forEach(f => { f.loyalty += (50 - f.loyalty) * 0.05; });
        yearlyTick();
    }
    healthCheck();
    cabinetMonthly();
    budgetSeasonCheck();
    histEventsTick();
    worldMonthTick();
    goalsCheck();
    institutionsMonth();
    treasuryMonthly();
    infraMonthly();
    statsMonthly();
    if (G.colony) colonyMonth();
    if (G.gov.cohabitation && chance(0.15)) log("Cohabitation: the opposition-led government blocks your domestic agenda.", "warn");
}

function yearlyTick() {
    budgetNewYear();
    treasuryYearly();
    programsYearly();
    yearlyFirms();
    holidaysEnd();
    powerYearly();
    familyYearly();
    refreshTrade();
    // Sovereign default when debt spirals out of control.
    const dp = G.econ.debt / G.econ.gdp * 100;
    if (dp > (G.inst && G.inst.program ? 260 : 220)) {
        G.econ.debt *= 0.45;
        G.flags.defaulted_year = G.year;
        applyEffects({ prestige: -10, growth: -3, inflation: 5, p: { business: -10, people: -6 } });
        log(`💥 ${C().name} defaults on its debts. Creditors take a 55% haircut.`, "major");
        record(`Defaulted on the national debt, ${G.year}.`);
    }
    if (G.gov.type === "occupied" && G.year >= 1957) {
        changeGovType("parliamentary");
        log("🕊️ The occupation formally ends. Full sovereignty is restored.", "major");
    }
    // Industries that had no output can appear once conditions are met.
    Object.keys(INDUSTRIES).forEach(k => {
        const i = G.ind[k];
        if (i.out < G.econ.gdp * 0.0005 && indAvailable(k) && indGap(k) < 2 && (i.sup > 0 || chance(0.25))) {
            i.out = Math.max(i.out, G.econ.gdp * 0.003);
            log(`${INDUSTRIES[k].icon} A ${INDUSTRIES[k].name.toLowerCase()} industry is taking root.`, "good");
        }
    });
    // Future resources (oil discoveries etc.)
    const fr = C().futureRes || {};
    Object.entries(fr).forEach(([res, yr]) => {
        if (G.year >= yr && !G.res.includes(res) && !G.flags[`found_${res}`]) {
            G.flags[`found_${res}`] = true;
            queueScene("discovery", { res });
        }
    });
    G.econ.gdpYearAgo = G.econ.gdp;
}

// Aggregate growth comes from fundamentals; industries set the mix.
function potentialGrowth() {
    let g = 2.2 + convergence() + policyFx("growth") * 0.4 + (G.s.stability - 50) * 0.03 + infraGrowth() - taxGrowthDrag();
    g += skill("economics") * 0.1 + minBonus("finance") * 0.15 + minBonus("industry") * 0.1;
    let sup = 0, tot = 0;
    Object.keys(G.ind).forEach(k => { if (!indAvailable(k)) return; const v = indValue(k); sup += v * SUPPORT_LEVELS[G.ind[k].sup].bonus; tot += v; });
    g += tot ? sup / (tot + G.econ.services) * 0.35 : 0;
    g -= Math.min(4, Math.max(0, G.econ.debt / G.econ.gdp * 100 - 70) * 0.03);
    g -= Math.min(4, Math.max(0, G.econ.inflation - 10) * 0.08);
    g += clamp(G.econ.shock, -12, 8);
    if (playerWars().some(w => commitOf(w) >= 3)) g -= 1;
    if (G.gov.type === "colony") g -= 0.5;
    if (G.year >= 1974) g -= 0.5;
    g -= instGrowthDrag();
    g += tradeGrowth();
    return clamp(g, -15, 14);
}

function economyTick() {
    const e = G.econ;
    const before = e.gdp;
    const gp = potentialGrowth();
    const raw = {};
    let wsum = 0, rsum = 0;
    Object.keys(G.ind).forEach(k => {
        const i = G.ind[k];
        if (!indAvailable(k)) { if (i.out > 0 && INDUSTRIES[k].res && !G.res.includes(INDUSTRIES[k].res)) i.out *= 0.995; return; }
        raw[k] = indRate(k);
        const v = indValue(k); wsum += v; rsum += raw[k] * v;
    });
    const svcRaw = (wsum ? rsum / wsum : 2) * 0.9 + (G.dev.urban < 75 ? 0.6 : 0.2);
    rsum += svcRaw * e.services; wsum += e.services;
    const avg = wsum ? rsum / wsum : gp;
    let indSum = 0;
    Object.keys(raw).forEach(k => {
        const i = G.ind[k];
        const r = clamp(gp + (raw[k] - avg) * 0.6, -30, 40);
        i.rate = r;
        i.out = Math.max(i.out * (1 + r / 100 / 52), i.out > 0 ? 0.00005 : 0);
        indSum += indValue(k);
    });
    e.services = Math.max(e.services * (1 + clamp(gp + (svcRaw - avg) * 0.6, -20, 30) / 100 / 52), 0.001);
    e.gdp = indSum + e.services;
    const inst = (e.gdp / before - 1) * 52 * 100;
    e.growth = e.growth * 0.94 + inst * 0.06;
    e.shock *= 0.97;
    // Population.
    // Demographic transition: births fall as literacy and cities spread;
    // where health is poor, high death rates hold growth down at first.
    let popR = clamp(3.1 - G.dev.lit * 0.022 - G.dev.urban * 0.005 - Math.max(0, 45 - G.s.health) * 0.03, 0.1, 3);
    if (G.year > 1990 && G.dev.lit > 95) popR -= 0.4;
    if (G.ck === "usa") popR += 0.5;
    if (lawOn("nhs") || lawOn("nhi")) popR += 0.2;
    if (["israel"].includes(G.ck) && G.year < 1965) popR += 5;
    if (["australia", "canada"].includes(G.ck)) popR += 1;
    e.pop *= 1 + popR / 100 / 52;
    e.popR = popR;
    // Budget (annual % of GDP).
    // Revenue comes from the tax base: formal wages, company profits,
    // resource royalties and tariffs. Industry and jobs widen it.
    e.rev = taxBase().total + programRevenue();
    const capT = 0.25 + 0.75 * clamp(G.dev.lit / 100 * 0.6 + G.dev.urban / 100 * 0.4, 0, 1);
    if (capT > e.taxCap) e.taxCap += (capT - e.taxCap) * 0.004;
    const war = playerWars().reduce((s, w) => s + [0, 0.6, 2, 5][commitOf(w)], 0);
    const debtPct = e.debt / e.gdp * 100;
    e.spend = governmentSpend().total;
    e.deficit = e.spend - e.rev;
    e.debt = Math.max(0, e.debt * (1 - Math.max(0, e.inflation) / 100 / 52));
    treasuryWeek(e.gdp * e.deficit / 100 / 52);
    // Inflation and unemployment drift.
    const oilImp = G.res.includes("oil") ? -0.5 : 1.2;
    let infT = 3 + policyFx("inflation") + Math.max(0, e.deficit) * 0.45 + Math.max(0, e.growth - 6) * 0.4 + (G.oilPrice - 1) * oilImp * 0.6 + Math.min(15, Math.max(0, debtPct - 100) * 0.03) + war * 0.4;
    if (G.year >= 1971 && G.year <= 1982) infT += 3;
    infT += tradeInflation();
    e.inflation += (clamp(infT, -3, 60) - e.inflation) * 0.035;
    e.jobsAdded = (e.jobsAdded || 0) * 0.9985;
    e.formalAdded = (e.formalAdded || 0) * 0.9995;
    e.unemp += (unempTarget() - e.unemp) * 0.04;
}

// Targets the weekly simulation drifts toward (also used to show the player
// what each decision moves).
function unempTarget() { const e = G.econ; return clamp(5.5 + policyFx("unemp") - (e.growth - 3) * 0.5 + G.ind.agriculture.out / e.gdp * 4 - (e.jobsAdded || 0) * 0.7, 1, 28); }
function libertyTarget() { return clamp(50 + policyFx("liberty")); }
function corruptionTarget() { return clamp(C().econ.corruption + policyFx("corruption") + (trait("honest") ? -8 : 0) + (trait("corrupt") ? 8 : 0) + (G.s.liberty < 30 ? 5 : 0) - (G.pol.press === "free" ? 4 : 0) + (G.pmods.corruption || 0), 1, 95); }
// Literacy points a year at today's level.
function literacyRate() { return (0.2 + lawFx("lit")) * (1 + covRel("schools") * 0.4) * 2.2 * (1 - G.dev.lit / 100) * (G.gov.type === "colony" ? 0.5 : 1) * (1 + minBonus("education") * 0.1); }
// Foreign companies bring know-how: each open one speeds up catching up with the frontier.
const firmTech = () => Math.min(0.6, (G.firms || []).filter(f => !f.closed && f.foreign).length * 0.04);
function techRate() {
    const frontier = Math.max(...Object.values(G.nations).filter(n => n.tech != null).map(n => n.tech), G.dev.tech);
    const openness = { trade_free: 1.5, managed: 1, protection: 0.7, autarky: 0.3 }[G.pol.trade] || 1;
    const fdi = Object.values(G.ind).filter(i => i.own === "foreign" && i.out > 0).length * 0.1 + firmTech();
    return lawFx("tech") + covEff("telecom") * 0.2 + G.dev.uni * 0.05 + (frontier - G.dev.tech) * 0.025 * (openness + fdi) + (trait("intellectual") ? 0.3 : 0) + minBonus("education") * 0.15;
}

function devTick() {
    const uniRate = (0.02 + lawFx("uni")) * (1 + covRel("universities") * 0.4);
    const colony = G.gov.type === "colony" ? 0.5 : 1;
    G.dev.lit = clamp(G.dev.lit + literacyRate() / 52, 0, 99.5);
    G.dev.uni = clamp(G.dev.uni + uniRate * 2 * (1 - G.dev.uni / 55) / 52 * colony, 0, 55);
    G.dev.tech = clamp(G.dev.tech + techRate() / 52, 0, 200);
    const target = 12 + G.dev.ind * 0.55 + (G.econ.services / G.econ.gdp) * 25 + Math.min(10, (G.econ.formalAdded || 0) * 1.5);
    G.dev.urban = clamp(G.dev.urban + (target - G.dev.urban) * 0.03 / 52 * 4, 0, 100);
}

function statsTick() {
    const s = G.s;
    s.stability += (stabilityTarget() - s.stability) * 0.02;
    s.liberty += (libertyTarget() - s.liberty) * 0.025;
    s.corruption += (corruptionTarget() - s.corruption) * 0.01;
    s.legitimacy += (legitimacyTarget() - s.legitimacy) * 0.015;
    s.prestige += (prestigeTarget() - s.prestige) * 0.01;
    const mo = curOpt("military"), dr = curOpt("draft");
    s.readiness += (clamp((mo.ready || 50) + (dr.ready || 0) + skill("military") * 2 + minBonus("defense") * 3) - s.readiness) * 0.03;
    s.health += (healthTarget() - s.health) * 0.004;
    if (!G.ref) G.ref = { health: s.health, poverty: s.poverty, crime: s.crime, pc: gdpPerCapita() };
    ["health", "poverty", "crime"].forEach(k => { G.ref[k] += (s[k] - G.ref[k]) * 0.002; });
    s.poverty += (povertyTarget() - s.poverty) * 0.006;
    s.crime += (crimeTarget() - s.crime) * 0.012;
    const wars = playerWars();
    if (wars.length) {
        wars.forEach(w => {
            const c = commitOf(w);
            s.weariness += c * 0.35;
            const mine = w.a.includes(G.ck) ? w.front : -w.front;
            if (mine < -20) s.weariness += 0.4;
        });
    } else s.weariness -= 0.6;
    s.weariness = clamp(s.weariness);
    s.scandal = clamp(s.scandal - 0.35 + Math.max(0, s.corruption - 45) * 0.015 * (trait("honest") ? 0.5 : trait("corrupt") ? 1.6 : 1));
    // Military strength.
    let t = G.mil.base * (1 + lawFx("mil") / 100) * (mo.mult || 1) * (dr.mult || 1) * Math.sqrt(G.econ.gdp / G.econ.gdp0) * (0.6 + s.readiness / 125);
    if (G.mil.noArmy) t *= 0.1;
    t += (G.ind.aerospace.out / G.econ.gdp) * G.mil.base * 3;
    G.mil.strength += (t - G.mil.strength) * 0.02;
    // Nuclear program.
    const nk = curOpt("nuclear");
    if (nk.rate && G.mil.nukes < 3) {
        const scale = clamp(Math.sqrt(G.econ.gdp / 25), 0.25, 2) * clamp(G.dev.tech / 60, 0.3, 1.6);
        G.mil.prog += nk.rate * scale * (G.mil.nukes >= 2 ? 0.5 : 1) * 1.2 / 4.33;
        if (G.mil.prog >= 100) {
            G.mil.prog = 0;
            G.mil.nukes = G.mil.nukes < 2 ? 2 : 3;
            queueScene("nuke_test", { level: G.mil.nukes });
        }
    }
}

function pillarsTick() {
    Object.keys(G.pillars).forEach(k => {
        const p = G.pillars[k];
        p.l += (pillarTarget(k) - p.l) * 0.035;
        p.l = clamp(p.l, 1, 99);
    });
    Object.keys(G.pmods).forEach(k => { G.pmods[k] *= 0.995; if (Math.abs(G.pmods[k]) < 0.1) delete G.pmods[k]; });
}

// How a region's character reacts to your policies.
const REGION_TRAITS = {
    agrarian: { land: { reform: 4, mechanize: 3, collective: -10, landlords: -2 } },
    industrial: { labor: { bargaining: 3, restrict: -5 }, trade: { protection: 2 } },
    finance: { economy: { market: 4, planned: -6, collectivized: -10 }, trade: { trade_free: 3 } },
    religious: { religion: { established: 4, theocratic: 3, secular: -7 } },
    minority: { rights: { equal: 6, segregation: -8 } },
    segregated: { rights: { segregation: 8, equal: -14 } },
    oil: { resources: { nationalized: 2, concessions: -1 } },
    mining: { labor: { bargaining: 3, restrict: -4 } },
    tribal: { land: { landlords: 3, reform: -4 } },
    poor: { welfare: { welfare: 5, minimal: -4 } },
    tourism: {}, frontier: {}, coast: {}, divided: {}, colonial: {}, minerals: {}, aerospace: {}, chemicals: {}, textiles: {}
};

function regionAffinity(r) {
    let s = 0;
    r.t.forEach(tr => {
        const rule = REGION_TRAITS[tr];
        if (!rule) return;
        Object.entries(rule).forEach(([area, opts]) => { s += opts[G.pol[area]] || 0; });
    });
    return s;
}

function regionSupport(r) {
    return clamp(approval() + (r.lean[G.leader.party] || 0) + r.mod + regionAffinity(r), 2, 98);
}

function regionsTick() { G.regions.forEach(r => { r.mod *= 0.992; }); }

function capitalIncome() {
    const ps = Object.values(G.pillars);
    const avg = ps.reduce((s, p) => s + p.l, 0) / ps.length;
    let inc = 5 + avg / 12 + GT().capitalBonus + skill("oratory") * 0.3;
    G.leader.traits.forEach(t => { inc += (TRAITS[t].capital || 0) * 4; });
    if (G.gov.cohabitation) inc -= 3;
    inc += cabinetCapital() + familyCapital();
    return Math.max(2, inc);
}
const capitalCap = () => 45 + (trait("charismatic") ? 10 : 0);

function capitalTick() {
    G.capital = Math.min(capitalCap(), G.capital + capitalIncome() / 4.33);
    G.funds = Math.min(999, G.funds + (G.pillars.business ? G.pillars.business.l / 100 : 0.3) * 0.6);
}


function healthCheck() {
    const L = G.leader;
    let decline = Math.max(0, L.age - 55) * 0.012;
    G.leader.traits.forEach(t => { decline -= (TRAITS[t].health || 0) * 1; });
    L.health = clamp(L.health - decline + (L.age < 55 ? 0.05 : 0) + rnd(-0.3, 0.3), 5, 100);
    let p = 0;
    if (L.age >= 60) p = 0.0012 * Math.pow(1.11, L.age - 60);
    p *= (130 - L.health) / 60;
    if (chance(p)) { leaderDies("natural"); }
    else if (L.health < 30 && chance(0.04)) queueScene("health_scare", {});
}

// ── Effects ─────────────────────────────────────────────────────────

const STAT_NAMES = { health: "Public health", crime: "Crime", poverty: "Poverty", stability: "Stability", liberty: "Civil liberties", corruption: "Corruption", legitimacy: "Legitimacy", prestige: "Prestige", scandal: "Scandal", readiness: "Military readiness", weariness: "War weariness" };
const BAD_STATS = ["corruption", "scandal", "weariness", "crime", "poverty"];

function applyEffects(e, mult = 1) {
    const out = [];
    if (!e) return out;
    const push = (label, v, bad) => { if (!v) return; const r = Math.round(v * 10) / 10; if (!r) return; out.push({ label, v: r, good: bad ? r < 0 : r > 0 }); };
    Object.keys(STAT_NAMES).forEach(k => {
        if (e[k] != null) { const v = e[k] * mult; G.s[k] = clamp(G.s[k] + v); push(STAT_NAMES[k], v, BAD_STATS.includes(k)); }
    });
    if (e.growth) { G.econ.shock += e.growth * mult; push("Growth", e.growth * mult); }
    if (e.inflation) { G.econ.inflation = Math.max(-5, G.econ.inflation + e.inflation * mult); push("Inflation", e.inflation * mult, true); }
    if (e.unemp) { G.econ.unemp = clamp(G.econ.unemp + e.unemp * mult, 0.5, 40); push("Unemployment", e.unemp * mult, true); }
    if (e.cost) { const bn = G.econ.gdp * e.cost * mult / 100; treasuryPay(bn); out.push({ label: "Cost", v: nominal(bn), good: false, raw: true }); }
    if (e.cash) { const bn = G.econ.gdp * e.cash * mult / 100; treasuryAdd(bn, "windfall", "Windfall"); out.push({ label: "Treasury", v: "+" + nominal(bn), good: true, raw: true }); }
    if (e.aid) { const bn = G.econ.gdp * e.aid * mult / 100; treasuryAdd(bn, "aid", e.aidFrom ? `Aid from ${nationName(e.aidFrom)}` : "Foreign aid"); out.push({ label: "Treasury (aid)", v: "+" + nominal(bn), good: true, raw: true }); }
    if (e.debtCut) { const bn = Math.min(G.econ.debt, G.econ.gdp * e.debtCut * mult / 100); G.econ.debt -= bn; out.push({ label: "Debt", v: "−" + nominal(bn), good: true, raw: true }); }
    if (e.capital) { G.capital = clamp(G.capital + e.capital * mult, -20, 99); push("Political capital", e.capital * mult); }
    if (e.funds) { G.funds = Math.max(0, G.funds + e.funds * mult); push("Party funds ($M)", e.funds * mult); }
    if (e.mil) { G.mil.strength = Math.max(0, G.mil.strength * (1 + e.mil * mult / 100)); push("Military strength %", e.mil * mult); }
    if (e.align) { G.align = clamp(G.align + e.align * mult, -100, 100); push(e.align > 0 ? "Tilt West" : "Tilt East", Math.abs(e.align * mult)); }
    if (e.tension) { G.tension = clamp(G.tension + e.tension * mult); push("World tension", e.tension * mult, true); }
    if (e.oil) { G.oilPrice = Math.max(0.5, G.oilPrice * (1 + e.oil * mult / 100)); push("Oil price %", e.oil * mult); }
    if (e.health) { G.leader.health = clamp(G.leader.health + e.health * mult); push("Your health", e.health * mult); }
    if (e.p) Object.entries(e.p).forEach(([k, v]) => {
        if (k === "all") { Object.keys(G.pillars).forEach(pk => { G.pillars[pk].l = clamp(G.pillars[pk].l + v * mult, 1, 99); }); push("All power bases", v * mult); return; }
        if (!G.pillars[k]) return;
        G.pillars[k].l = clamp(G.pillars[k].l + v * mult, 1, 99);
        push(pillarName(k), v * mult);
    });
    if (e.pm) Object.entries(e.pm).forEach(([k, v]) => { G.pmods[k] = (G.pmods[k] || 0) + v * mult; if (G.pillars[k]) push(pillarName(k) + " (lasting)", v * mult); });
    if (e.fac) Object.entries(e.fac).forEach(([k, v]) => {
        G.factions.forEach(f => {
            if (k === "all" || (k === "gov" && f.gov) || (k === "opp" && !f.gov) || (k === "mine" && f.mine) || f.k === k || f.party === k) f.loyalty = clamp(f.loyalty + v * mult, 0, 100);
        });
        push(k === "gov" ? "Government factions" : k === "opp" ? "Opposition factions" : k === "mine" ? "Your party" : k === "all" ? "All factions" : (G.factions.find(f => f.k === k || f.party === k) || {}).name || k, v * mult);
    });
    if (e.region) Object.entries(e.region).forEach(([k, v]) => {
        if (k === "all") G.regions.forEach(r => { r.mod += v * mult; });
        else if (G.regions[k]) G.regions[k].mod += v * mult;
    });
    if (e.rel) Object.entries(e.rel).forEach(([k, v]) => { if (G.nations[k]) { addRel(G.ck, k, v * mult); push(`Relations: ${G.nations[k].name}`, v * mult); } });
    if (e.flags) Object.assign(G.flags, e.flags);
    if (e.colony && G.colony) Object.entries(e.colony).forEach(([k, v]) => { G.colony[k] = clamp((G.colony[k] || 0) + v * mult); push({ progress: "Independence progress", militancy: "Militancy", unity: "Regional unity", support: "Movement strength" }[k] || k, v * mult, k === "militancy"); });
    return out;
}

// ── Scenes queue ────────────────────────────────────────────────────

function queueScene(id, args = {}) {
    if (!SCENES[id]) { console.warn("No scene", id); return; }
    if (G.scenes.some(s => s.id === id && JSON.stringify(s.args) === JSON.stringify(args))) return;
    G.scenes.push({ id, args });
}

// ── Goals ───────────────────────────────────────────────────────────

function goalsCheck() {
    (C().goals || []).forEach((g, i) => {
        if (G.goalsDone[i]) return;
        let ok = false;
        try { ok = g.chk(G); } catch (e) { ok = false; }
        if (ok) {
            G.goalsDone[i] = G.t;
            const ch = applyEffects(g.reward);
            log(`🏆 National goal achieved: ${g.n}.`, "major");
            record(`Achieved a national goal: ${g.n}.`);
            toast("National goal achieved", g.n, ch);
        }
    });
}

// ── Save / load ─────────────────────────────────────────────────────

function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(G)); } catch (e) { /* storage unavailable */ } }
function load() {
    try {
        const s = localStorage.getItem(SAVE_KEY); if (!s) return false; G = JSON.parse(s);
        if (G && G.scenes) G.scenes = G.scenes.filter(q => q.id !== "cip_region");   // pickers never outlive a session
        if (G && G.firms) G.firms.forEach(f => { if (f.foreign && !f.home) { const c = COMPANIES.find(x => x.name === f.name); if (c) f.home = c.home; } });
        return !!G && G.v === 1;
    } catch (e) { return false; }
}
function hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } }
