// ── BUDGET & CAPITAL IMPROVEMENT PROGRAM ────────────────────────────
//
// Every September the budget season opens. You set funding for each
// department (70–130% of baseline: stronger or weaker laws), tax rates for
// the taxes that exist in law, and the capital budget. In a democracy the
// budget must pass the legislature by December; if it doesn't, the year
// starts under a continuing resolution: last year's numbers and no money
// for new capital projects.
//
// The capital budget funds the CIP: a prioritized queue of projects
// (roads, power, schools, hospitals, factories...). Each January projects
// are funded in queue order until the money runs out.

// ── Infrastructure coverage ─────────────────────────────────────────

const INFRA = {
    roads:      { name: "Highways & roads", icon: "🛣️", cost: 0.4, weeks: 78, units: 6, desc: "Faster growth; farmers reach markets." },
    rail:       { name: "Railways", icon: "🚆", cost: 0.5, weeks: 104, units: 6, desc: "Moves coal, steel and people. Heavy industry needs it." },
    ports:      { name: "Ports & harbors", icon: "⚓", cost: 0.3, weeks: 78, units: 7, desc: "Trade, shipbuilding and exports.", res: "coast" },
    airports:   { name: "Airports", icon: "🛫", cost: 0.25, weeks: 78, units: 8, from: 1955, desc: "Tourism, business travel, air freight." },
    power:      { name: "Power stations & dams", icon: "⚡", cost: 0.5, weeks: 104, units: 6, desc: "Every factory needs electricity." },
    schools:    { name: "Schools", icon: "🏫", cost: 0.3, weeks: 52, units: 7, desc: "Literacy grows faster with enough classrooms." },
    hospitals:  { name: "Hospitals", icon: "🏥", cost: 0.3, weeks: 78, units: 7, desc: "Better health and life expectancy." },
    universities:{ name: "Universities", icon: "🎓", cost: 0.25, weeks: 104, units: 8, desc: "Graduates, research and technology." },
    housing:    { name: "Housing estates", icon: "🏘️", cost: 0.35, weeks: 78, units: 6, desc: "Less poverty and crime in growing cities." },
    irrigation: { name: "Irrigation schemes", icon: "💧", cost: 0.3, weeks: 104, units: 7, desc: "Bigger harvests, fewer famines." },
    telecom:    { name: "Telephone & data networks", icon: "📡", cost: 0.35, weeks: 78, units: 7, from: 1960, desc: "Finance, computing and modern business." }
};

// The coverage a country of this development level keeps up through routine
// department spending. Capital projects push coverage above it; underfunding
// a department lets it slide below.
function infraTarget(k) {
    const d = G.dev, coast = G.res.includes("coast");
    const agri = G.ind.agriculture ? G.ind.agriculture.out / G.econ.gdp : 0.3;
    const pc = clamp(Math.log(Math.max(1, gdpPerCapita() / 300)) * 18, 0, 60);
    const t = {
        roads: d.urban * 0.5 + d.ind * 0.4 + pc * 0.3, rail: d.ind * 0.6 + d.urban * 0.2, ports: coast ? 25 + d.ind * 0.5 + pc * 0.2 : 0,
        airports: G.year < 1955 ? d.urban * 0.2 : d.urban * 0.3 + pc * 0.5, power: d.ind * 0.7 + d.urban * 0.3 + pc * 0.2, schools: d.lit * 0.9,
        hospitals: G.s.health * 0.9, universities: d.uni * 5, housing: 100 - G.s.poverty, irrigation: 20 + agri * 60 + pc * 0.2,
        telecom: G.year < 1960 ? d.urban * 0.3 + d.ind * 0.2 - 10 : d.urban * 0.3 + d.ind * 0.2 + pc * 0.6 - 10
    }[k];
    const dept = { schools: "education", universities: "education", hospitals: "health", housing: "welfare", irrigation: "agriculture" }[k] || "infra";
    return clamp(t * (0.85 + 0.15 * fundMult(dept)));
}

function initInfra() {
    G.infra = {};
    Object.keys(INFRA).forEach(k => { G.infra[k] = infraTarget(k); });
}

const cov = k => (G.infra && G.infra[k] != null) ? G.infra[k] : 50;
const covEff = (k, mid = 50) => (cov(k) - mid) / 50;   // −1..+1
// Coverage relative to what a country at this level normally has.
const covRel = k => !G.infra ? 0 : clamp((cov(k) - infraTarget(k)) / 30, -1, 1);

function infraGrowth() {
    return (covRel("roads") + covRel("rail") + covRel("ports") * 0.5 + covRel("airports") * 0.3 + covRel("power") * 1.5 + covRel("telecom") * 0.5) * 0.3;
}

function infraYearly() {
    // Routine spending keeps coverage near the normal level for the country's
    // development; anything above it wears down without new investment.
    Object.keys(INFRA).forEach(k => {
        const t = infraTarget(k), c = G.infra[k];
        G.infra[k] = clamp(c < t ? c + (t - c) * 0.15 : c - Math.min(1.5, (c - t) * 0.08));
    });
}

// ── Projects ────────────────────────────────────────────────────────

function projectInfo(type) {
    if (type.startsWith("ind:")) { const k = type.slice(4); const I = INDUSTRIES[k]; return { name: I.project, icon: I.icon, cost: 0.6, weeks: 90, desc: `New ${I.name.toLowerCase()} capacity and jobs.` }; }
    if (type.startsWith("asset:")) { const [, sec, a] = type.split(":"); const A = SECTOR_ASSETS[sec][a]; return { name: A.name, icon: INDUSTRIES[sec].icon, cost: A.cost, weeks: A.weeks || 78, desc: A.desc }; }
    return INFRA[type];
}

function projectCostBn(type) { return Math.max(0.005, G.econ.gdp * projectInfo(type).cost / 100); }

function proposeProject(type, region, src = "player", free = false) {
    if (!G.cip) initCip();
    if (!free) {
        if (G.capital < 2) return toast("Not enough political capital", "Adding a project to the program costs 2.");
        G.capital -= 2;
    }
    const info = projectInfo(type);
    const item = { id: `p${G.t}_${Math.floor(Math.random() * 1e5)}`, type, region, cost: projectCostBn(type), src, added: G.t };
    G.cip.queue.push(item);
    if (!free) log(`📋 ${info.name} in ${G.regions[region] ? G.regions[region].n : "the country"} added to the capital program (${nominal(item.cost)}).`, "policy");
    fundQueue();
    return item;
}

function initCip() {
    G.cip = { queue: [], active: [], pool: G.econ.gdp * G.budget.capital / 100 * 0.5, spentFY: 0 };
}

function fundQueue() {
    if (!G.cip) return;
    let changed = true;
    while (changed) {
        changed = false;
        for (let i = 0; i < G.cip.queue.length; i++) {
            const it = G.cip.queue[i];
            if (it.cost <= G.cip.pool) {
                G.cip.pool -= it.cost; G.cip.spentFY += it.cost;
                G.cip.queue.splice(i, 1);
                const info = projectInfo(it.type);
                const weeks = Math.round(info.weeks * rnd(0.85, 1.25) + (it.type.startsWith("ind:") ? indGap(it.type.slice(4)) * 6 : 0));
                G.cip.active.push(Object.assign(it, { left: weeks, total: weeks, start: G.t }));
                addJobs(jobsFor(it.cost * 0.3, "machinery") * 0.5);
                if (it.src.startsWith("fac:")) { const f = G.factions.find(x => x.k === it.src.slice(4)); if (f) { f.loyalty = clamp(f.loyalty + 6); } }
                if (G.regions[it.region]) G.regions[it.region].mod += 2;
                changed = true;
                break;
            }
        }
    }
}

function cipMove(id, d) {
    const q = G.cip.queue, i = q.findIndex(x => x.id === id), j = i + d;
    if (i < 0 || j < 0 || j >= q.length) return;
    [q[i], q[j]] = [q[j], q[i]];
    fundQueue();
}

function cipRemove(id) {
    const i = G.cip.queue.findIndex(x => x.id === id);
    if (i < 0) return;
    const it = G.cip.queue.splice(i, 1)[0];
    if (it.src.startsWith("fac:")) { const f = G.factions.find(x => x.k === it.src.slice(4)); if (f) f.loyalty = clamp(f.loyalty - 8); }
}

function cipTick() {
    if (!G.cip) return;
    G.cip.active.forEach(p => {
        p.left--;
        if (p.left > 0) return;
        p.done = true;
        const info = projectInfo(p.type), r = G.regions[p.region];
        if (p.type.startsWith("ind:")) {
            const k = p.type.slice(4), i = G.ind[k], before = i.out;
            i.out += p.cost * (k === "oil" ? 0.6 : 0.4);
            if (i.out0 === 0) i.out0 = before || i.out * 0.5;
            addJobs(jobsFor(p.cost * 0.4, k) * 1.5);
        } else if (p.type.startsWith("asset:")) {
            const [, sec, a] = p.type.split(":");
            G.assets = G.assets || {};
            G.assets[`${sec}:${a}`] = true;
            addJobs(jobsFor(p.cost * 0.2, sec));
        } else G.infra[p.type] = clamp(G.infra[p.type] + info.units * (G.econ.pop > 100 ? 0.7 : 1));
        if (r) r.mod += 5;
        log(`✂️ ${info.name} opens in ${r ? r.n : "the country"}.`, "good");
        if (chance(0.35)) queueScene("ribbon", { name: info.name, region: r ? r.n : "" });
    });
    G.cip.active = G.cip.active.filter(p => !p.done);
    // Faction-requested projects that sit unfunded for a year cause resentment.
    G.cip.queue.forEach(it => {
        if (it.src.startsWith("fac:") && !it.nagged && G.t - it.added > 52) { it.nagged = true; const f = G.factions.find(x => x.k === it.src.slice(4)); if (f) { f.loyalty = clamp(f.loyalty - 5); log(`😠 The ${f.name} complain their project has waited a year for funding.`, "warn"); } }
    });
}

// ── The annual budget ───────────────────────────────────────────────

function budgetSeasonCheck() {
    const b = G.budget;
    if (G.month === 9 && ["adopted", "cr"].includes(b.status) && b.fy <= G.year) {
        b.status = "drafting";
        b.draft = JSON.parse(JSON.stringify({ depts: b.depts, rates: b.rates, capital: b.capital }));
        b.fy = G.year + 1;
        b.autoSent = false;
        b.notes = treasuryDraft(b.draft);
        queueScene("budget_season", {});
    }
    if (G.month === 11 && b.status === "drafting" && hasLegislature() && !G.budget.autoSent) {
        // The treasury won't let the deadline slip: it sends the draft as it stands.
        G.capital += 4;
        submitBudget();
        G.budget.autoSent = true;
        log(`💰 With the deadline near, the finance ministry sends the FY${b.fy} draft to the ${G.leg.name} as it stands.`, "warn");
    }
    if (G.month === 12 && b.status === "drafting" && !hasLegislature()) { adoptDraft(); }
}

function budgetNewYear() {
    const b = G.budget;
    if (!G.cip) initCip();
    if (b.status === "passed") adoptDraft();
    else if (["drafting", "submitted", "rejected"].includes(b.status)) {
        if (hasLegislature()) {
            b.status = "cr";
            b.draft = null;
            G.bills && G.bills.forEach(x => { if (x.kind === "budget" && ["committee", "floor", "stuck"].includes(x.stage)) { x.stage = "dead"; x.ended = G.t; } });
            applyEffects({ legitimacy: -3, p: { business: -3 } });
            log("⏸️ No budget passed. The government runs on a continuing resolution: last year's spending and no new capital projects.", "bad");
            toast("Continuing resolution", "Last year's budget carries over. No money for new capital projects this year.");
        } else adoptDraft();
    }
    // New fiscal year: refund unspent capital money, open the new pool.
    G.econ.debt = Math.max(0, G.econ.debt - G.cip.pool);
    G.cip.pool = b.status === "cr" ? 0 : G.econ.gdp * b.capital / 100;
    G.cip.spentFY = 0;
    fundQueue();
}

function adoptDraft() {
    const b = G.budget, d = b.draft;
    if (!d) { b.status = "adopted"; return; }
    Object.entries(d.depts).forEach(([k, v]) => {
        const diff = v - b.depts[k];
        if (Math.abs(diff) > 0.01 && G.pillars[DEPTS[k].pillar]) G.pillars[DEPTS[k].pillar].l = clamp(G.pillars[DEPTS[k].pillar].l + diff * 25, 1, 99);
    });
    b.depts = d.depts; b.rates = d.rates; b.capital = d.capital;
    b.status = "adopted"; b.draft = null;
    log(`💰 The FY${G.year} budget takes effect.`, "policy");
}

function setDraft(kind, key, v) {
    const b = G.budget;
    if (!b.draft || !isFinite(v)) return;
    if (kind === "dept") b.draft.depts[key] = clamp(Math.round(v * 20) / 20, 0.7, 1.3);
    if (kind === "rate") { const law = Object.values(LAWS).find(d => d.tax === key); b.draft.rates[key] = clamp(Math.round(v * 2) / 2, 0, law.max); }
    if (kind === "capital") b.draft.capital = clamp(Math.round(v * 4) / 4, 0, 5);
}

// Projected revenue and spending (% of GDP) for a draft.
function projectBudget(d) {
    const saved = { depts: G.budget.depts, rates: G.budget.rates, capital: G.budget.capital };
    Object.assign(G.budget, { depts: d.depts, rates: d.rates, capital: d.capital });
    const tb = taxBase(), rev = tb.total + programRevenue();
    const sp = governmentSpend();
    Object.assign(G.budget, saved);
    const cut = G.gov.type === "colony" ? 0.6 : 1;
    const taxes = { income: tb.income * cut, payroll: tb.payroll * cut, corporate: tb.corp * cut, sales: tb.sales * cut, land: tb.land * cut, wealth: tb.wealth * cut };
    return { rev, spend: sp.total, lines: sp.lines, net: rev - sp.total, taxes };
}

function governmentSpend() {
    const e = G.econ;
    const stateCap = clamp(e.taxCap * (0.6 + 0.4 * formalShare()) + ({ planned: 0.25, collectivized: 0.35 }[G.pol.economy] || 0), 0.25, 1);
    const lines = {};
    lines.admin = 3 * stateCap;
    Object.keys(DEPTS).forEach(k => { lines[k] = 0; });
    Object.keys(G.laws).forEach(k => {
        const d = lawDef(k);
        if (!d || !d.cost) return;
        const dept = d.dept || (LAW_CATS[d.cat] && LAW_CATS[d.cat].dept) || "admin";
        lines[dept] = (lines[dept] || 0) + d.cost * lawMult(k) * stateCap;
    });
    let fw = 0;
    POLICY_AREAS.forEach(a => { const o = curOpt(a.key); if (o.spend) fw += o.spend * (a.key === "military" || a.key === "draft" || a.key === "nuclear" || a.key === "space" ? fundMult("defense") : 1); });
    lines.defense += fw * stateCap;
    Object.values(G.ind).forEach(i => { lines.industry += SUPPORT_LEVELS[i.sup].spend * 0.5 * fundMult("industry"); });
    lines.capital = G.budget.status === "cr" ? 0 : G.budget.capital;
    lines.war = playerWars().reduce((s, w) => s + [0, 0.6, 2, 5][commitOf(w)], 0);
    lines.interest = Math.min(e.debt / e.gdp * 100, 250) * 0.03;
    const total = Object.values(lines).reduce((a, b) => a + b, 0) - minBonus("finance") * 0.2;
    return { lines, total };
}

// How a faction's ideology sees a draft budget.
function budgetStance(d, ideo) {
    if (!d) return 0;
    // Factions judge a budget against the one in force: what it adds or cuts.
    const cur = G.budget;
    const dep = k => (d.depts[k] - cur.depts[k]) * 10;   // −6..+6
    const r = d.rates, r0 = cur.rates, dr = k => (r[k] || 0) - (r0[k] || 0);
    const pr = projectBudget(d);
    let s = 0;
    const id = ideo;
    if (["socialist", "socdem", "communist"].includes(id)) s += dep("welfare") * 0.15 + dep("health") * 0.15 + dep("education") * 0.1 + dr("corporate") * 0.05 + dr("wealth") * 0.3 - dep("defense") * 0.05;
    if (["liberal", "conservative"].includes(id)) s += -dr("income") * 0.06 - dr("corporate") * 0.05 + Math.min(0, pr.net + 3) * 0.12 - dep("welfare") * 0.05;
    if (["nationalist", "militarist"].includes(id)) s += dep("defense") * 0.25 + dep("industry") * 0.08;
    if (id === "traditionalist") s += dep("agriculture") * 0.1 + dep("police") * 0.1 - dr("land") * 0.4;
    s += (d.capital - cur.capital) * 0.3 + 0.3;   // projects in their districts; a routine budget is must-pass
    return clamp(s, -3, 3);
}

function budgetReaction(d) {
    if (!d) return {};
    const p = {};
    Object.entries(d.depts).forEach(([k, v]) => { const pk = DEPTS[k].pillar; p[pk] = (p[pk] || 0) + (v - 1) * 20; });
    p.business = (p.business || 0) - (d.rates.corporate - G.budget.rates.corporate) * 0.5;
    p.people = (p.people || 0) - (d.rates.income - G.budget.rates.income) * 0.4 - (d.rates.sales - G.budget.rates.sales) * 0.4;
    return p;
}

// The finance ministry's draft: it tries to keep the deficit near 2% of GDP
// by moving tax rates toward ordinary levels and trimming overfunded
// departments, or hands back a surplus. You can change all of it.
const NORMAL_RATE = { income: 30, payroll: 12, sales: 15, corporate: 35, land: 2, wealth: 0 };
function treasuryDraft(d) {
    const notes = [];
    const law = kind => Object.values(LAWS).find(x => x.tax === kind);
    const lawKey = kind => Object.keys(LAWS).find(x => LAWS[x].tax === kind);
    let net = projectBudget(d).net;
    if (net < -2) {
        Object.keys(d.depts).forEach(k => { if (d.depts[k] > 1 && net < -2) { d.depts[k] = Math.max(1, d.depts[k] - 0.1); notes.push(`trim ${DEPTS[k].name.toLowerCase()} to ${Math.round(d.depts[k] * 100)}%`); net = projectBudget(d).net; } });
        for (const kind of ["sales", "income", "payroll", "corporate"]) {
            if (net >= -2 || !lawOn(lawKey(kind))) continue;
            const cap = Math.min(law(kind).max, NORMAL_RATE[kind]);
            const before = d.rates[kind] || 0;
            let r = before;
            while (net < -2 && r < cap && r - before < 3) { r = Math.min(cap, r + 0.5); d.rates[kind] = r; net = projectBudget(d).net; }
            if (r > before) notes.push(`raise ${law(kind).name.toLowerCase()} to ${fmt(r, 1)}%`);
        }
    } else if (net > 2) {
        for (const kind of ["income", "corporate", "sales"]) {
            if (net <= 1 || !lawOn(lawKey(kind)) || !d.rates[kind]) continue;
            const before = d.rates[kind];
            let r = before;
            while (net > 1 && r > 0 && before - r < 2) { r = Math.max(0, r - 0.5); d.rates[kind] = r; net = projectBudget(d).net; }
            if (r < before) notes.push(`cut ${law(kind).name.toLowerCase()} to ${fmt(r, 1)}%`);
        }
    }
    return notes;
}

function submitBudget() {
    const b = G.budget;
    if (!b.draft || !["drafting", "rejected"].includes(b.status)) return;
    if (!hasLegislature()) { b.status = "passed"; log(`💰 You decree the FY${b.fy} budget. It takes effect in January.`, "policy"); toast("Budget decreed", `The FY${b.fy} budget takes effect on 1 January.`); return; }
    if (G.capital < 4) return toast("Not enough political capital", "Submitting the budget costs 4.");
    G.capital -= 4;
    const pr = projectBudget(b.draft);
    const bill = introduceBill({ kind: "budget", draft: JSON.parse(JSON.stringify(b.draft)), title: `FY${b.fy} Appropriations Act`, desc: `Revenue ${fmt(pr.rev, 1)}% of GDP, spending ${fmt(pr.spend, 1)}%: ${pr.net >= 0 ? "a surplus" : "a deficit"} of ${fmt(Math.abs(pr.net), 1)}%.` });
    b.status = "submitted"; b.billId = bill.id;
    toast("Budget submitted", `The ${bill.title} goes to the ${G.leg.name}. It must pass before 1 January.`);
}

function budgetPassed(bill) {
    const b = G.budget;
    b.draft = bill.draft; b.status = "passed";
    log(`✅ The ${bill.title} passes. It takes effect on 1 January.`, "good");
    record(`Passed the FY${b.fy} budget.`);
}

function budgetRejected(bill) {
    G.budget.status = "rejected";
    applyEffects({ capital: -2, legitimacy: -2 });
    toast("Budget rejected", G.month >= 12 ? "No time left to resubmit. The year will start under a continuing resolution." : "Revise the budget and resubmit before 1 January, or govern under a continuing resolution.");
}

SCENES.budget_season = () => S("💰", `${dateStr()} · Treasury`, `Budget season: FY${G.budget.fy}`,
    `Your finance minister has the draft for next year${G.budget.notes && G.budget.notes.length ? `. To hold the deficit down the treasury proposes to ${G.budget.notes.join(", ")}` : ""}. Set department funding, tax rates and the capital budget on the Budget tab${hasLegislature() ? `, then send it to the ${G.leg.name}. It must pass by 31 December or the year starts under a continuing resolution` : ". It takes effect on 1 January"}.`,
    [ch("To the budget", {}, "", { run: () => { view = "budget"; } }), ch("Later", {}, "")]);
