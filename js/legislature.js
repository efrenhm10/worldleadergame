// ── LEGISLATURE — bills take weeks, not clicks ──────────────────────
//
// A bill is introduced, goes to committee (whose chair can bottle it up),
// is debated on the floor, then voted on. While it moves you lobby the
// chair, fast-track, give speeches, whip, amend, hand out pork and trade
// favors. Other factions introduce their own bills. Presidents can sign
// or veto what passes.

const STAGES = [["committee", "Committee"], ["floor", "Floor debate"], ["vote", "Vote"], ["law", "Law"]];

function hasLegislature() {
    const m = policyMethod("economy").m;
    return m === "bill";
}

function newBillId() { G.billSeq = (G.billSeq || 0) + 1; return `b${G.billSeq}`; }

function pickChair() {
    // Committee chairs come mostly from the governing side, weighted by seats.
    const pool = G.factions.filter(f => f.seats > 0);
    const gov = pool.filter(f => f.gov);
    const list = (G.gov.cohabitation || chance(0.25)) ? pool.filter(f => !f.gov).concat(gov) : gov.length ? gov : pool;
    const tot = list.reduce((s, f) => s + f.seats, 0);
    let r = Math.random() * tot;
    for (const f of list) { r -= f.seats; if (r <= 0) return f.k; }
    return list[0] ? list[0].k : null;
}

function introduceBill(o) {
    const b = Object.assign({
        id: newBillId(), stage: "committee", wk: 0, sponsor: "player", position: 1, whip: false, conc: {}, favor: {},
        momentum: 0, chairLobby: 0, amends: [], introduced: G.t
    }, o);
    const fast = ["parliamentary", "occupied"].includes(G.gov.type) && b.sponsor === "player";
    b.cwk = b.kind === "budget" ? 2 : fast ? 1 + Math.floor(Math.random() * 2) : 2 + Math.floor(Math.random() * 3);
    b.fwk = 2;
    b.chair = pickChair();
    G.bills = G.bills || [];
    G.bills.push(b);
    if (b.sponsor === "player") log(`✍️ You introduce the ${b.title}. It goes to committee.`, "policy");
    else log(`📜 The ${factionName(b.sponsor)} introduce the ${b.title}.`, "policy");
    return b;
}

const factionName = k => (G.factions.find(f => f.k === k) || { name: "opposition" }).name;
const activeBills = () => (G.bills || []).filter(b => ["committee", "floor", "stuck"].includes(b.stage));

// ── Stances ─────────────────────────────────────────────────────────

function billStance(b, ideo) {
    let s = 0;
    if (b.kind === "law") {
        const d = lawDef(b.lawKey), st = (d.st || {})[ideo] || 0;
        const delta = b.level - b.prev;
        s = st * clamp(Math.abs(delta) * 3, 0.6, 2) * Math.sign(delta);
    } else if (b.kind === "framework") {
        s = 2 * ideoStance(ideo, b.k) - ideoStance(ideo, b.cur);
    } else if (b.kind === "program") {
        s = (b.def.stance || {})[ideo] || 0;
    } else if (b.kind === "budget") {
        s = budgetStance(b.draft, ideo);
    }
    // Deficit hawks resist new spending when the books are already red.
    const cost = billCost(b), def = G.econ.deficit || 0;
    if (cost > 0 && def > 2) s -= cost * (["liberal", "conservative"].includes(ideo) ? 0.5 : 0.15) * Math.min(3, def / 2);
    if (b.kind === "law" && lawDef(b.lawKey).tax && b.level > b.prev && def > 3) s += ["socdem", "socialist", "communist"].includes(ideo) ? 0.8 : 0.3;
    (b.amends || []).forEach(a => {
        if (a.type === "water") s *= 0.6;
        if (a.type === "sweeten" && a.ideo === ideo) s += 1.5;
        if (a.type === "sunset" && ["conservative", "liberal", "traditionalist"].includes(ideo)) s += 0.7;
        if (a.type === "audit" && ["liberal", "socdem"].includes(ideo)) s += 0.5;
    });
    return clamp(s, -3, 3);
}

function billPopularity(b) {
    let p = {};
    if (b.kind === "law") { const d = lawDef(b.lawKey); Object.entries(d.p || {}).forEach(([k, v]) => { p[k] = v * (b.level - b.prev) * 5; }); }
    if (b.kind === "framework") p = changeReaction(b.area, b.k);
    if (b.kind === "program") p = b.def.g || {};
    if (b.kind === "budget") p = budgetReaction(b.draft);
    let s = 0, w = 0;
    Object.entries(GT().pillars).forEach(([k, wt]) => { s += (p[k] || 0) * wt * (k === "people" ? 1.5 : 1); w += wt; });
    let pop = clamp(s / Math.max(1, w) / 8, -1.5, 1.5);
    if ((b.amends || []).some(a => a.type === "water")) pop *= 0.7;
    return pop;
}

function factionYes(b, f) {
    const st = billStance(b, f.ideo);
    const pop = billPopularity(b);
    const pos = b.position || 0;
    const leg = skill("legislation");
    let p;
    if (f.gov) p = 0.36 + st * 0.09 + pop * 0.08 + pos * (0.16 + f.loyalty / 400) + (b.whip && pos > 0 ? 0.12 : 0) + (pos > 0 ? leg * 0.02 : 0);
    else p = 0.2 + st * 0.11 + pop * 0.12 + pos * (f.loyalty - 30) / 300;
    if (b.kind === "budget") p += f.gov ? 0.12 : -0.05;
    if (b.sponsor === f.k) p += 0.35;
    if (b.conc[f.k]) p += 0.22;
    if (b.favor[f.k]) p += 0.3;
    p += clamp(b.momentum, -15, 15) * 0.01;
    if (G.gov.cohabitation && !f.gov && pos > 0) p -= 0.08;
    return clamp(p, 0.02, 0.98);
}

function forecast(b) {
    let yes = 0, varsum = 0;
    const rows = G.factions.map(f => { const p = factionYes(b, f); yes += f.seats * p; varsum += f.seats * p * (1 - p); return { f, p, exp: f.seats * p }; });
    const need = majority();
    const sd = Math.sqrt(varsum) * 1.6 + G.leg.total * 0.015;
    const prob = 1 / (1 + Math.exp(-1.7 * (yes - need + 0.5) / Math.max(1, sd)));
    return { rows, yes, need, sd, prob };
}

function chairOdds(b) {
    const ch = G.factions.find(f => f.k === b.chair);
    if (!ch) return 0.9;
    const st = billStance(b, ch.ideo);
    let p = 0.55 + st * 0.12 + (ch.gov ? 0.15 : -0.1) + b.chairLobby + (b.sponsor === ch.k ? 0.3 : 0);
    if (b.sponsor === "player") p += (ch.loyalty - 50) / 200;
    if (b.kind === "budget") p += 0.2;
    return clamp(p, 0.05, 0.97);
}

// ── Weekly movement ─────────────────────────────────────────────────

function legislatureTick() {
    if (!G.bills) return;
    G.bills.forEach(b => {
        if (b.stage === "committee") {
            b.wk++;
            if (b.wk >= b.cwk) {
                if (chance(chairOdds(b))) { b.stage = "floor"; b.wk = 0; if (b.sponsor === "player") log(`📜 The ${b.title} clears committee.`, "policy"); }
                else {
                    b.stage = "stuck"; b.wk = 0;
                    if (b.sponsor === "player" || b.position > 0) { log(`🗄️ The committee chair (${factionName(b.chair)}) is bottling up the ${b.title}.`, "bad"); toast("Stuck in committee", `${factionName(b.chair)} won't report out the ${b.title}. Lobby, discharge or withdraw it.`); }
                }
            }
        } else if (b.stage === "stuck") {
            b.wk++;
            if (b.sponsor !== "player" && b.wk > 12) { b.stage = "dead"; }
            if (b.kind === "budget" && b.wk > 3) { b.stage = "floor"; b.wk = 0; }
        } else if (b.stage === "floor") {
            b.wk++;
            if (b.wk >= b.fwk) holdVote(b);
        }
    });
    G.bills = G.bills.filter(b => ["committee", "floor", "stuck"].includes(b.stage) || G.t - (b.ended || G.t) < 26);
    if (G.month !== G.lastNpcMonth && hasLegislature()) {
        G.lastNpcMonth = G.month;
        if (activeBills().filter(b => b.sponsor !== "player").length < 3 && chance(0.4)) npcBill();
    }
}

function holdVote(b) {
    const fc = forecast(b);
    const yes = Math.round(clamp(fc.yes + gauss() * fc.sd, 0, G.leg.total));
    const passed = yes >= fc.need;
    b.result = { yes, no: G.leg.total - yes };
    b.ended = G.t;
    Object.keys(b.favor).forEach(fk => G.ious.push({ f: fk, t: G.t, due: G.t + 26 + Math.floor(rnd(0, 30)) }));
    if (passed) {
        if (b.sponsor !== "player" && GT().execOrders && b.position <= 0 && b.kind !== "budget") { b.stage = "desk"; queueScene("sign_or_veto", { id: b.id }); return; }
        b.stage = "law";
        enactBill(b);
        const mine = b.sponsor === "player" || b.position > 0;
        toast(mine ? "Bill passes" : "Bill passes", `The ${b.title} passes, ${yes}–${b.result.no}.`);
        if (b.sponsor === "player") record(`Passed the ${b.title}, ${yes}–${b.result.no} (${G.year}).`);
    } else {
        b.stage = "failed";
        log(`❌ The ${b.title} is defeated, ${yes}–${b.result.no}.`, b.position > 0 ? "bad" : "info");
        if (b.sponsor === "player") { applyEffects({ p: { party: -3, coalition: -2 }, legitimacy: -1 }); toast("Bill defeated", `The ${b.title} fails, ${yes}–${b.result.no}.`); }
        if (b.kind === "budget") budgetRejected(b);
        if (b.sponsor === "player" && G.gov.type === "parliamentary" && fc.prob < 0.3 && chance(0.25)) queueScene("no_confidence", { cause: "bill" });
    }
}

function enactBill(b) {
    if (b.kind === "law") {
        const d = lawDef(b.lawKey);
        if (d.tax && b.level > 0 && !G.budget.rates[d.tax]) G.budget.rates[d.tax] = Math.round(d.max * b.level);
        if (d.tax && b.level > 0) G.budget.rates[d.tax] = Math.round(d.max * b.level * 10) / 10;
        setLaw(b.lawKey, b.level, `${G.leg.name} passes`);
    } else if (b.kind === "framework") enactPolicy(b.area, b.k, `${G.leg.name} passes`);
    else if (b.kind === "program") enactProgram(b.def, b);
    else if (b.kind === "budget") budgetPassed(b);
}

// ── Player actions on bills ─────────────────────────────────────────

function billById(id) { return (G.bills || []).find(b => b.id === id); }

const BILL_ACTIONS = {
    lobby: { name: "Lobby the committee chair", cost: 3, when: b => b.stage === "committee", run: b => { b.chairLobby += 0.2 + skill("legislation") * 0.03; } },
    fasttrack: { name: "Fast-track to the floor", cost: 8, when: b => b.stage === "committee" && b.sponsor === "player" && ["parliamentary", "occupied", "semi_presidential"].includes(G.gov.type), run: b => { b.stage = "floor"; b.wk = 0; applyEffects({ p: { party: -2 } }); } },
    discharge: { name: "Discharge petition", cost: 8, when: b => b.stage === "stuck" && b.position > 0, run: b => { if (forecast(b).prob > 0.45 && chance(0.7)) { b.stage = "floor"; b.wk = 0; toast("Discharged", "A majority signs. The bill goes to the floor."); } else toast("Petition fails", "Not enough signatures."); } },
    speech: { name: "Floor speech", cost: 4, when: b => ["committee", "floor"].includes(b.stage) && b.position !== 0, run: b => { b.momentum += b.position * (3 + skill("oratory") * 1.2 + (trait("charismatic") ? 2 : 0)); } },
    whip: { name: "Whip your side", cost: 0, when: b => b.position > 0 && !b.whip && ["committee", "floor", "stuck"].includes(b.stage), run: b => { if (G.capital < whipCost()) return toast("Not enough political capital", ""); G.capital -= whipCost(); b.whip = true; } },
    support: { name: "Back this bill", cost: 2, when: b => b.sponsor !== "player" && b.position <= 0, run: b => { b.position = 1; const f = G.factions.find(x => x.k === b.sponsor); if (f) f.loyalty = clamp(f.loyalty + 5); } },
    oppose: { name: "Oppose this bill", cost: 2, when: b => b.sponsor !== "player" && b.position >= 0, run: b => { b.position = -1; const f = G.factions.find(x => x.k === b.sponsor); if (f) f.loyalty = clamp(f.loyalty - 5); } },
    withdraw: { name: "Withdraw", cost: 0, when: b => b.sponsor === "player" && ["committee", "floor", "stuck"].includes(b.stage), run: b => { b.stage = "withdrawn"; b.ended = G.t; if (b.kind === "budget") G.budget.status = "drafting"; } }
};

function billAction(id, k) {
    const b = billById(id), a = BILL_ACTIONS[k];
    if (!b || !a || !a.when(b)) return;
    if (a.cost && G.capital < a.cost) return toast("Not enough political capital", `You need ${a.cost}.`);
    G.capital -= a.cost;
    a.run(b);
}

function billPork(id, fk) {
    const b = billById(id);
    if (!b) return;
    if (b.conc[fk]) { delete b.conc[fk]; return; }
    b.conc[fk] = true;
    G.econ.debt += G.econ.gdp * 0.0015;
    const f = G.factions.find(x => x.k === fk);
    const r = G.regions[Math.abs(fk.split("").reduce((s, c) => s + c.charCodeAt(0), 0)) % G.regions.length];
    if (r) r.mod += 2;
    log(`🏗️ Pork for the ${f ? f.name : "faction"}'s districts to win votes on the ${b.title}.`, "policy");
}

function billFavor(id, fk) { const b = billById(id); if (!b) return; if (b.favor[fk]) delete b.favor[fk]; else b.favor[fk] = true; }

const AMENDMENTS = {
    water: { name: "Water it down", desc: "Weaker law, milder reactions on both sides.", ok: b => !b.amends.some(a => a.type === "water") && b.kind !== "budget" },
    sunset: { name: "Add a sunset clause", desc: "Expires in 5 years unless renewed. Wins fiscal conservatives.", ok: b => ["program"].includes(b.kind) && !b.amends.some(a => a.type === "sunset") },
    audit: { name: "Add an independent audit", desc: "Costs 5% more; less risk of theft. Liberals like it.", ok: b => b.kind === "program" && !b.amends.some(a => a.type === "audit") },
    sweeten: { name: "Sweeten it for a faction", desc: "Add provisions and earmarks a faction wants (+10% cost).", ok: b => b.kind !== "budget" }
};

function amendBill(id, type, ideo) {
    const b = billById(id);
    if (!b || !AMENDMENTS[type] || !AMENDMENTS[type].ok(b)) return;
    if (G.capital < 3) return toast("Not enough political capital", "Amendments cost 3.");
    G.capital -= 3;
    b.amends.push({ type, ideo });
    if (type === "water") { if (b.kind === "law") b.level = Math.round((b.prev + (b.level - b.prev) * 0.6) * 10) / 10 || 0.1; if (b.kind === "program") { b.def.cost *= 0.7; Object.keys(b.def.eff).forEach(k => { b.def.eff[k] *= 0.7; }); } }
    if (type === "sunset" && b.kind === "program") b.def.years = 5;
    if (type === "audit" && b.kind === "program") { b.def.cost *= 1.05; b.def.riskKeys = (b.def.riskKeys || []).filter(r => r !== "misuse"); }
    if (type === "sweeten" && b.kind === "program") b.def.cost *= 1.1;
    log(`✏️ Amendment to the ${b.title}: ${AMENDMENTS[type].name.toLowerCase()}.`, "policy");
}

// ── Starting bills ──────────────────────────────────────────────────

function lawBillTitle(k, level, prev) {
    const d = lawDef(k);
    if (level === 0) return `${d.name} Repeal Act`;
    if (prev === 0) return `${d.name} Act`;
    return `${d.name} (Amendment) Act`;
}

function proposeLawBill(k, level) {
    if (lawPending(k)) return toast("Already before the legislature", "A bill on this law is already moving.");
    const cost = 4;
    if (G.capital < cost) return toast("Not enough political capital", `Introducing a bill costs ${cost}.`);
    G.capital -= cost;
    const prev = lawLevel(k);
    introduceBill({ kind: "law", lawKey: k, level, prev, title: lawBillTitle(k, level, prev), desc: lawDef(k).desc });
}

const fwTitle = (area, o) => `${POLICY[area].name} Act (${optName(o)})`;

function proposeFrameworkBill(area, k) {
    if ((G.bills || []).some(b => b.area === area && ["committee", "floor", "stuck"].includes(b.stage))) return toast("Already before the legislature", "");
    const cost = policyCost(area);
    if (G.capital < cost) return toast("Not enough political capital", `A reform bill costs ${cost}.`);
    G.capital -= cost;
    const o = policyOpt(area, k);
    introduceBill({ kind: "framework", area, k, cur: G.pol[area], title: fwTitle(area, o), desc: `Change national policy on ${POLICY[area].name.toLowerCase()} to: ${optName(o)}.` });
}

function proposeProgram(spec) {
    const def = compileBill(spec);
    const cost = 5;
    if (G.capital < cost) return toast("Not enough political capital", `Introducing legislation costs ${cost}.`);
    if (!hasLegislature()) {
        if (G.capital < 8) return toast("Not enough political capital", "A decree costs 8.");
        G.capital -= 8;
        enactProgram(def, null);
        toast("Decree issued", def.title);
        return true;
    }
    G.capital -= cost;
    introduceBill({ kind: "program", def, title: def.title, desc: def.desc });
    return true;
}

// Programs from the builder become laws in the lawbook.
function enactProgram(def, b) {
    const key = `prog_${G.t}_${Math.floor(Math.random() * 1e4)}`;
    const cat = { health: "health", environment: "health", education: "education", universities: "education", culture: "society", housing: "welfare", jobs: "welfare", poverty: "welfare",
                  farms: "farms", industry: "economy", transport: "infra", energy: "infra", police: "order", rights: "society", defense: "defense", veterans: "defense" }[def.cat] || "society";
    G.customLaws[key] = {
        key, cat, name: def.title, custom: true, cost: def.cost, fx: def.eff, p: def.g, st: def.stance, desc: def.desc,
        dept: ISSUES[def.cat].dept, until: def.years ? G.year + def.years : null, risks: def.riskKeys || [], fund: def.spec.fund, region: def.region
    };
    G.laws[key] = { level: 1, since: G.t };
    if (def.spec.fund === "cuts") {
        const d = pick(Object.keys(DEPTS).filter(x => x !== ISSUES[def.cat].dept));
        G.budget.depts[d] = Math.max(0.7, G.budget.depts[d] - def.cost / 6);
        applyEffects({ p: { [DEPTS[d].pillar]: -4 } });
        log(`✂️ To pay for it, ${DEPTS[d].name} funding is cut.`, "policy");
    }
    if (def.spec.fund === "aid") applyEffects({ align: patronOf() === "usa" ? 5 : -5, rel: { [patronOf()]: 5 } });
    if (def.region != null && G.regions[def.region]) G.regions[def.region].mod += 8;
    if (def.spec.provs.includes("earmark")) G.factions.forEach(f => { if (f.gov) f.loyalty = clamp(f.loyalty + 5); });
    const p = {};
    Object.entries(def.g || {}).forEach(([k, v]) => { p[k] = v * 0.6; });
    applyEffects({ p });
    log(`📜 New law: ${def.title}.`, "policy");
    record(`Enacted the ${def.title}, ${G.year}.`);
}

// Revenue raised by programs funded with new taxes or fees.
function programRevenue() {
    let r = 0;
    Object.keys(G.laws).forEach(k => { const d = G.customLaws && G.customLaws[k]; if (d && ["newtax", "fees", "aid"].includes(d.fund)) r += d.cost * lawLevel(k) * (d.fund === "aid" ? 0.9 : 1); });
    return r;
}

// Yearly: programs expire, overrun, get misused or create demand.
function programsYearly() {
    Object.keys(G.laws).forEach(k => {
        const d = G.customLaws && G.customLaws[k];
        if (!d) return;
        if (d.until && G.year >= d.until) { queueScene("program_expiry", { k }); return; }
        if (d.risks.includes("misuse") && chance(0.15)) queueScene("program_misuse", { k });
        else if (d.risks.includes("contractor") && chance(0.15)) { d.cost *= 1.25; log(`💸 Contractors on the ${d.name} report cost overruns: +25%.`, "bad"); }
        else if (d.risks.includes("bureaucracy") && chance(0.25)) { d.cost *= 1.08; log(`🗂️ The agency running the ${d.name} keeps growing.`, "warn"); }
        else if (d.risks.includes("demand") && chance(0.12)) queueScene("program_demand", { k });
    });
}

SCENES.program_expiry = a => {
    const d = G.customLaws[a.k];
    if (!d) return S("📜", "", "", "", [ch("OK", {}, "")]);
    return S("📜", `${dateStr()} · Sunset`, `The ${d.name} expires`, "Its sunset date has arrived. Unless it is renewed, it lapses.",
        [ch(hasLegislature() ? "Introduce a renewal bill" : "Renew it by decree", {}, "", { run: () => { d.until = null; if (hasLegislature()) { d.until = G.year + 1; introduceBill({ kind: "program", def: { title: d.name + " Renewal", cost: 0, eff: {}, g: d.p, stance: d.st, desc: "Renew the program.", years: 0, spec: { fund: "budget", provs: [] }, cat: "health", riskKeys: [] }, title: `${d.name} Reauthorization Act`, desc: d.desc, renew: a.k }); } return "Renewal is underway."; } }),
         ch("Let it lapse", { p: Object.fromEntries(Object.entries(d.p || {}).filter(([, v]) => v > 0).map(([k, v]) => [k, -v * 0.5])) }, "", { run: () => { delete G.laws[a.k]; } })]);
};
SCENES.program_misuse = a => {
    const d = G.customLaws[a.k];
    if (!d) return S("📜", "", "", "", [ch("OK", {}, "")]);
    return S("💸", `${dateStr()} · Investigation`, `Funds stolen from the ${d.name}`, "Auditors find that officials and their friends have pocketed a share of the money.",
        [ch("Prosecute and add an audit", { scandal: 4, corruption: -2, capital: -3 }, "", { run: () => { d.risks = d.risks.filter(r => r !== "misuse"); } }),
         ch("Hush it up", { scandal: 10, corruption: 2 }, "")]);
};
SCENES.program_demand = a => {
    const d = G.customLaws[a.k];
    if (!d) return S("📜", "", "", "", [ch("OK", {}, "")]);
    return S("📈", `${dateStr()} · Success`, `The ${d.name} is oversubscribed`, "It works, and now everyone wants more of it. Waiting lists are growing.",
        [ch("Expand it by 30%", { p: Object.fromEntries(Object.entries(d.p || {}).filter(([, v]) => v > 0).map(([k, v]) => [k, v * 0.4])) }, "", { run: () => { d.cost *= 1.3; Object.keys(d.fx).forEach(k => { d.fx[k] *= 1.3; }); } }),
         ch("Keep it as it is", { p: { people: -2 } }, "")]);
};

SCENES.sign_or_veto = a => {
    const b = billById(a.id);
    if (!b) return S("📜", "", "", "", [ch("OK", {}, "")]);
    const override = forecast(b).yes >= G.leg.total * 2 / 3;
    return S("✒️", `${dateStr()} · Your desk`, `The ${b.title} awaits your signature`,
        `The ${G.leg.name} passed it ${b.result.yes}–${b.result.no}. ${b.desc || ""} If you veto it, overriding needs two-thirds${override ? ", and they may have the votes" : ""}.`,
        [ch("Sign it into law", {}, "", { run: () => { b.stage = "law"; enactBill(b); const f = G.factions.find(x => x.k === b.sponsor); if (f) f.loyalty = clamp(f.loyalty + 4); return "Signed."; } }),
         ch("Veto it", { capital: -4 }, "", { run: () => { const f = G.factions.find(x => x.k === b.sponsor); if (f) f.loyalty = clamp(f.loyalty - 8); if (forecast(b).yes + gauss() * 10 >= G.leg.total * 2 / 3) { b.stage = "law"; enactBill(b); applyEffects({ legitimacy: -3 }); return "Your veto is overridden."; } b.stage = "vetoed"; return "The veto holds."; } })]);
};

// ── Other factions' bills ───────────────────────────────────────────

// Tax bills from the floor: governing parties raise revenue when deficits
// mount; tax-cutters push the other way when the books allow it.
function fiscalBill(f) {
    const def = G.econ.deficit, left = ["socialist", "socdem", "communist"].includes(f.ideo);
    const taxes = Object.values(LAWS).filter(d => d.tax && lawAvailable(d.key) && !lawPending(d.key));
    let d = null, level;
    if (def > 3 && (f.gov || left)) {
        const fresh = taxes.filter(t => !lawOn(t.key) && ["vat", "sales_tax", "payroll_tax", "income_tax", "corporate_tax", "sin_tax", "fuel_tax"].includes(t.key));
        const room = taxes.filter(t => lawOn(t.key) && lawLevel(t.key) < 0.8 && t.key !== "wealth_tax");
        if (fresh.length && chance(0.5)) { d = pick(fresh); level = 0.3; }
        else if (room.length) { d = pick(room); level = Math.round((lawLevel(d.key) + 0.1) * 10) / 10; }
    } else if (def < 1 && ["liberal", "conservative", "traditionalist"].includes(f.ideo)) {
        const cut = taxes.filter(t => lawOn(t.key) && lawLevel(t.key) > 0.3 && ["income_tax", "corporate_tax", "wealth_tax"].includes(t.key));
        if (cut.length) { d = pick(cut); level = Math.round((lawLevel(d.key) - 0.1) * 10) / 10; }
    }
    if (!d) return false;
    introduceBill({ kind: "law", lawKey: d.key, level, prev: lawLevel(d.key), title: lawBillTitle(d.key, level, lawLevel(d.key)), desc: d.desc, sponsor: f.k, position: 0 });
    return true;
}

// Annual cost (% of GDP) a bill adds.
function billCost(b) {
    if (b.kind === "law") { const d = lawDef(b.lawKey); return d.tax ? 0 : (d.cost || 0) * (b.level - b.prev); }
    if (b.kind === "framework") return ((policyOpt(b.area, b.k).spend || 0) - (policyOpt(b.area, b.cur).spend || 0)) * 0.7;
    if (b.kind === "program") return b.def.cost || 0;
    return 0;
}

function npcBill() {
    const fs = G.factions.filter(f => f.seats > 0);
    const tot = fs.reduce((s, f) => s + f.seats * (f.gov ? 1.3 : 1), 0);
    let r = Math.random() * tot, f = fs[0];
    for (const x of fs) { r -= x.seats * (x.gov ? 1.3 : 1); if (r <= 0) { f = x; break; } }
    if (!f || f.core) return;
    if (chance(0.2) && fiscalBill(f)) return;
    if (chance(0.6)) {
        const cand = Object.values(LAWS).filter(d => !d.tax && lawAvailable(d.key) && !lawPending(d.key));
        const enact = cand.filter(d => (d.st[f.ideo] || 0) >= 1 && !lawOn(d.key) && !lawRival(d.key) && (G.econ.deficit < 4 || !d.cost));
        const repeal = cand.filter(d => (d.st[f.ideo] || 0) <= -1 && lawOn(d.key));
        const choice = (repeal.length && chance(0.35)) ? { d: pick(repeal), level: 0 } : enact.length ? { d: pick(enact), level: 0.5 } : null;
        if (!choice) return;
        introduceBill({ kind: "law", lawKey: choice.d.key, level: choice.level, prev: lawLevel(choice.d.key), title: lawBillTitle(choice.d.key, choice.level, lawLevel(choice.d.key)), desc: choice.d.desc, sponsor: f.k, position: 0 });
    } else {
        const areas = POLICY_AREAS.filter(a => !(G.bills || []).some(b => b.area === a.key && ["committee", "floor", "stuck"].includes(b.stage)));
        for (const a of areas.sort(() => Math.random() - 0.5)) {
            const want = a.options.find(o => IDEOLOGIES[f.ideo].likes.includes(o.k) && o.k !== G.pol[a.key] && (!o.req || o.req(G.gov.type, G)));
            if (want && !IDEOLOGIES[f.ideo].likes.includes(G.pol[a.key])) {
                introduceBill({ kind: "framework", area: a.key, k: want.k, cur: G.pol[a.key], title: fwTitle(a.key, want), desc: `Change national policy on ${a.name.toLowerCase()} to: ${optName(want)}.`, sponsor: f.k, position: 0 });
                return;
            }
        }
    }
}
