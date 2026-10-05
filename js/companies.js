// ── COMPANIES — courting investment, jobs and the tax base ──────────
//
// The chain: bring in a company → a plant opens in one of your regions →
// it hires workers (unemployment falls) → formal jobs and corporate
// profits widen your tax base → more revenue for schools and clinics →
// health, education and living standards rise. Tax holidays and grants
// win investors but delay the payoff.

const COMPANIES = [
    // name, sector, home, from, to, size (S/M/L)
    ["Ford Motor Company", "autos", "usa", 1950, 2026, "L"], ["General Motors", "autos", "usa", 1950, 2026, "L"], ["Volkswagen", "autos", "germany", 1956, 2026, "L"],
    ["Fiat", "autos", "italy", 1950, 2026, "M"], ["Renault", "autos", "france", 1950, 2026, "M"], ["Toyota", "autos", "japan", 1965, 2026, "L"], ["Hyundai Motor", "autos", "southkorea", 1985, 2026, "M"],
    ["Philips", "electronics", null, 1953, 2026, "M"], ["Siemens", "machinery", "germany", 1952, 2026, "L"], ["General Electric", "machinery", "usa", 1950, 2026, "L"],
    ["Sony", "electronics", "japan", 1960, 2026, "M"], ["Texas Instruments", "electronics", "usa", 1960, 2026, "M"], ["Samsung Electronics", "electronics", "southkorea", 1985, 2026, "L"],
    ["Intel", "electronics", "usa", 1975, 2026, "L"], ["TSMC", "electronics", "taiwan", 1995, 2026, "L"], ["Foxconn", "electronics", "taiwan", 2000, 2026, "L"],
    ["IBM", "computing", "usa", 1965, 2026, "L"], ["Apple", "computing", "usa", 1985, 2026, "M"], ["Microsoft", "computing", "usa", 1990, 2026, "M"], ["Infosys", "computing", "india", 1995, 2026, "M"],
    ["Google", "computing", "usa", 2005, 2026, "L"], ["Nvidia", "ai", "usa", 2016, 2026, "L"], ["OpenAI", "ai", "usa", 2023, 2026, "M"], ["DeepMind", "ai", "uk", 2016, 2026, "S"],
    ["Royal Dutch Shell", "oil", "uk", 1950, 2026, "L"], ["Standard Oil of New Jersey (Exxon)", "oil", "usa", 1950, 2026, "L"], ["British Petroleum", "oil", "uk", 1954, 2026, "L"], ["ENI", "oil", "italy", 1953, 2026, "M"],
    ["Unilever", "agriculture", null, 1950, 2026, "M"], ["Nestlé", "agriculture", "switzerland", 1950, 2026, "M"], ["United Fruit", "agriculture", "usa", 1950, 1970, "M"], ["Cargill", "agriculture", "usa", 1960, 2026, "M"],
    ["DuPont", "chemicals", "usa", 1950, 2026, "L"], ["Bayer", "chemicals", "germany", 1952, 2026, "L"], ["Hoechst", "chemicals", "germany", 1952, 1999, "M"], ["Roche", "chemicals", "switzerland", 1950, 2026, "M"], ["Pfizer", "chemicals", "usa", 1955, 2026, "M"],
    ["U.S. Steel", "steel", "usa", 1950, 2026, "L"], ["Krupp", "steel", "germany", 1953, 1999, "M"], ["Nippon Steel", "steel", "japan", 1970, 2026, "L"], ["POSCO", "steel", "southkorea", 1975, 2026, "L"], ["Tata Steel", "steel", "india", 1950, 2026, "M"],
    ["Boeing", "aerospace", "usa", 1950, 2026, "L"], ["Lockheed", "aerospace", "usa", 1950, 2026, "M"], ["Dassault", "aerospace", "france", 1955, 2026, "M"], ["Airbus", "aerospace", "france", 1972, 2026, "L"], ["Embraer", "aerospace", "brazil", 1975, 2026, "M"],
    ["Hilton Hotels", "tourism", "usa", 1950, 2026, "M"], ["Club Med", "tourism", "france", 1955, 2026, "S"], ["Marriott", "tourism", "usa", 1960, 2026, "M"], ["Accor", "tourism", "france", 1970, 2026, "M"],
    ["Citibank", "finance", "usa", 1950, 2026, "M"], ["HSBC", "finance", "uk", 1950, 2026, "M"], ["Union Bank of Switzerland", "finance", "switzerland", 1950, 2026, "M"], ["Goldman Sachs", "finance", "usa", 1980, 2026, "M"],
    ["Mitsubishi Heavy Industries", "shipbuilding", "japan", 1955, 2026, "L"], ["Harland & Wolff", "shipbuilding", "uk", 1950, 1975, "M"], ["Hyundai Heavy Industries", "shipbuilding", "southkorea", 1975, 2026, "L"],
    ["Levi Strauss", "textiles", "usa", 1950, 2026, "S"], ["Courtaulds", "textiles", "uk", 1950, 1990, "M"], ["Nike", "textiles", "usa", 1975, 2026, "M"], ["Inditex (Zara)", "textiles", null, 1990, 2026, "M"],
    ["Rio Tinto", "mining", "uk", 1950, 2026, "L"], ["Anglo American", "mining", "southafrica", 1950, 2026, "L"], ["Alcoa", "mining", "usa", 1950, 2026, "M"], ["BHP", "mining", "australia", 1960, 2026, "L"], ["Vale", "mining", "brazil", 1975, 2026, "L"],
    ["Vestas", "renewables", null, 2000, 2026, "M"], ["Tesla", "renewables", "usa", 2015, 2026, "L"], ["BYD", "renewables", "china", 2015, 2026, "L"], ["CATL", "renewables", "china", 2018, 2026, "L"],
    ["Paramount Pictures", "film", "usa", 1950, 2026, "M"], ["Metro-Goldwyn-Mayer", "film", "usa", 1950, 2005, "M"], ["Warner Bros.", "film", "usa", 1950, 2026, "M"], ["Walt Disney Productions", "film", "usa", 1955, 2026, "M"],
    ["Rank Organisation", "film", "uk", 1950, 1985, "S"], ["Pathé", "film", "france", 1950, 2026, "S"], ["Toho", "film", "japan", 1955, 2026, "S"], ["Televisa", "film", "mexico", 1973, 2026, "M"],
    ["TV Globo", "film", "brazil", 1965, 2026, "M"], ["Sony Pictures", "film", "japan", 1989, 2026, "M"], ["Netflix", "film", "usa", 2015, 2026, "L"],
    ["Caterpillar", "machinery", "usa", 1950, 2026, "M"], ["Komatsu", "machinery", "japan", 1965, 2026, "M"], ["Bosch", "machinery", "germany", 1952, 2026, "M"]
].map(([name, sector, home, from, to, size]) => ({ name, sector, home, from, to, size }));

const PRIORITIES = {
    taxes: "low taxes and long tax holidays",
    labor: "cheap labor and few labor rules",
    stability: "political stability",
    skills: "an educated workforce",
    market: "a large domestic market",
    infra: "good infrastructure"
};

const INCENTIVES = {
    holiday: { name: "Tax holiday", opts: ["None", "5 years", "10 years"], odds: [0, 0.12, 0.2], prio: "taxes" },
    grant: { name: "Capital grant", opts: ["None", "15% of cost", "35% of cost"], odds: [0, 0.08, 0.16], cost: [0, 0.15, 0.35] },
    local: { name: "Local hiring requirement", opts: ["None", "50% local managers", "80% local + tech transfer"], odds: [0, -0.05, -0.12] },
    labor: { name: "Labor-rule waivers", opts: ["No", "Yes"], odds: [0, 0.08], prio: "labor" },
    site: { name: "Build site roads & power", opts: ["No", "Yes"], odds: [0, 0.1], cost: [0, 0.1], prio: "infra" }
};

function laborForce() { return G.econ.pop * 0.42; } // millions
function formalShare() { return clamp(0.2 + 0.8 * G.dev.urban / 100, 0.2, 1); }

// Thousands of jobs a plant of `out` ($bn, 1950 dollars) creates.
function jobsFor(out, sector) {
    const pc = Math.max(50, gdpPerCapita());
    return out * (INDUSTRIES[sector] ? INDUSTRIES[sector].jobs : 1) * 120000 / Math.max(1, pc / 400) / 1000;
}

function plantSize(c) {
    const base = { S: 0.02, M: 0.05, L: 0.12 }[c.size] * Math.pow(1.03, G.year - 1950);
    return Math.min(base, G.econ.gdp * 0.03);
}

function companyAvailable(c) {
    if (G.year < c.from || G.year > c.to) return false;
    if (c.home === G.ck) return false;
    if (!indAvailable(c.sector) || indGap(c.sector) > 4) return false;
    if (c.home && G.nations[c.home] && (G.nations[c.home].status !== "sovereign" || getRel(G.ck, c.home) < -30)) return false;
    if (c.home && G.wars.some(w => !w.over && ((w.a.includes(G.ck) && w.b.includes(c.home)) || (w.b.includes(G.ck) && w.a.includes(c.home))))) return false;
    if (G.firms && G.firms.some(f => f.name === c.name)) return false;
    return true;
}

function refreshProspects(force) {
    if (!G.prospects || force || G.t >= (G.prospectsT || 0)) {
        const pool = COMPANIES.filter(companyAvailable);
        const out = [];
        while (out.length < 3 && pool.length) {
            const i = Math.floor(Math.random() * pool.length);
            const c = pool.splice(i, 1)[0];
            out.push({ name: c.name, sector: c.sector, home: c.home, size: c.size, prio: pick(Object.keys(PRIORITIES)), known: false, inc: { holiday: 0, grant: 0, local: 0, labor: 0, site: 0 } });
        }
        G.prospects = out;
        G.prospectsT = G.t + 26;
    }
    return G.prospects;
}

function prospectOdds(p) {
    const I = INDUSTRIES[p.sector];
    const pr = p.prio;
    const dbl = k => (pr === k ? 2 : 1);
    let o = 0.22;
    Object.entries(INCENTIVES).forEach(([k, inc]) => { o += inc.odds[p.inc[k]] * (inc.prio ? dbl(inc.prio) : 1); });
    o += (G.dev.lit - I.lit) / 120 * dbl("skills") - indGap(p.sector) * 0.05;
    o += (G.s.stability - 50) / 150 * dbl("stability");
    o += Math.log10(Math.max(0.05, G.econ.gdp)) * 0.04 * dbl("market");
    o += clamp((30 - taxRate("corporate")) * 0.006, -0.15, 0.12) * dbl("taxes");
    o += ({ restrict: 0.05, bargaining: -0.02, state_unions: -0.04 }[G.pol.labor] || 0) * dbl("labor");
    o += (covEff("power") + covEff("roads")) * 0.04 * dbl("infra") + sectorBonus(p.sector) * 0.03;
    o += ({ planned: -0.15, collectivized: -0.45, market: 0.05 }[G.pol.economy] || 0);
    o += ({ trade_free: 0.06, protection: -0.02, autarky: -0.35 }[G.pol.trade] || 0);
    if (G.pol.resources === "nationalized" && ["oil", "mining"].includes(p.sector)) o -= 0.15;
    if (p.home && G.nations[p.home]) o += getRel(G.ck, p.home) / 400;
    o += skill("economics") * 0.015 + minBonus("industry") * 0.03 + (p.known ? 0.05 : 0);
    if (G.gov.type === "colony") o -= 0.1;
    o += instInvestBonus();
    return clamp(o, 0.02, 0.95);
}

function offerCost(p) {
    const size = plantSize(p);
    return size * (INCENTIVES.grant.cost[p.inc.grant] + INCENTIVES.site.cost[p.inc.site]);
}

function offerTerms(p) {
    const out = plantSize(p);
    const jobs = jobsFor(out, p.sector) * (p.inc.local === 2 ? 1.15 : 1);
    const annualTax = out * taxRate("corporate") * 0.2 / 100 * G.econ.taxCap;
    const holidayYrs = [0, 5, 10][p.inc.holiday];
    const cost = offerCost(p);
    const payback = annualTax > 0 ? holidayYrs + cost / annualTax : 99;
    return { out, jobs, annualTax, holidayYrs, cost, payback };
}

function visitHQ(i) {
    const p = G.prospects[i];
    if (!p || p.known) return;
    spend(4, () => { p.known = true; toast(`Visit to ${p.name}`, `Their CEO cares most about ${PRIORITIES[p.prio]}.`); if (p.home) addRel(G.ck, p.home, 2); });
}

function setIncentive(i, k, v) { const p = G.prospects[i]; if (p) p.inc[k] = clamp(v, 0, INCENTIVES[k].opts.length - 1); }

function makeOffer(i) {
    const p = G.prospects[i];
    if (!p) return;
    if (G.capital < 5) return toast("Not enough political capital", "An investment offer costs 5.");
    G.capital -= 5;
    const odds = prospectOdds(p), t = offerTerms(p);
    if (!chance(odds)) {
        G.prospects.splice(i, 1);
        log(`🏢 ${p.name} turns down your offer and builds elsewhere.`, "bad");
        return toast("Offer declined", `${p.name} chose another country.`);
    }
    G.econ.debt += t.cost;
    const ri = bestRegionFor(p.sector);
    openFirm({ name: p.name, sector: p.sector, home: p.home, out: t.out, jobs: t.jobs, holidayUntil: G.year + t.holidayYrs, local: p.inc.local, region: ri, foreign: true });
    if (p.inc.labor) applyEffects({ p: { labor: -5 }, liberty: -1 });
    if (p.home) addRel(G.ck, p.home, 6);
    G.prospects.splice(i, 1);
}

function bestRegionFor(sector) {
    const want = { oil: "oil", mining: "mining", tourism: "tourism", finance: "finance", agriculture: "agrarian" }[sector] || "industrial";
    let best = 0, bs = -1;
    G.regions.forEach((r, i) => { const s = (r.t.includes(want) ? 10 : 0) + r.pop / 10 - (G.firms || []).filter(f => f.region === i).length * 2; if (s > bs) { bs = s; best = i; } });
    return best;
}

function openFirm(f) {
    G.firms = G.firms || [];
    f.since = G.t;
    G.firms.push(f);
    const i = G.ind[f.sector];
    if (i.out0 === 0) i.out0 = Math.max(f.out * 0.5, 0.0001);
    i.out += f.out;
    addJobs(f.jobs);
    const r = G.regions[f.region];
    if (r) r.mod += 4 + Math.min(6, f.jobs / Math.max(1, laborForce() * 1000) * 400);
    if (f.local === 2) G.dev.tech += 0.8; else if (f.local === 1) G.dev.tech += 0.3;
    const where = r ? r.n : "the country";
    log(`🏢 ${f.name} opens a ${INDUSTRIES[f.sector].name.toLowerCase()} plant in ${where}: ${fmtJobs(f.jobs)} jobs.`, "good");
    record(`Brought ${f.name} to ${where} (${fmtJobs(f.jobs)} jobs), ${G.year}.`);
    toast(`${f.name} is coming!`, `A new ${INDUSTRIES[f.sector].name.toLowerCase()} plant in ${where}. ${fmtJobs(f.jobs)} jobs${f.holidayUntil > G.year ? `; taxes from ${f.holidayUntil}` : "; pays taxes from day one"}.`);
}

function addJobs(thousands) {
    const pct = thousands / Math.max(1, laborForce() * 1000) * 100;
    G.econ.jobsAdded = (G.econ.jobsAdded || 0) + pct;
    G.econ.jobsCreated = (G.econ.jobsCreated || 0) + thousands;
}

const fmtJobs = k => k >= 1000 ? `${fmt(k / 1000, 1)} million` : k >= 1 ? `${Math.round(k).toLocaleString()},000` : `${Math.max(1, Math.round(k * 1000)).toLocaleString()}`;

// Homegrown firms: back a local entrepreneur.
const LOCAL_SUFFIX = { film: "Studios", agriculture: "Agro", mining: "Mining", oil: "Petroleum", textiles: "Textiles", steel: "Steel", machinery: "Engineering", chemicals: "Chemicals", shipbuilding: "Shipyards", autos: "Motors", electronics: "Electronics", aerospace: "Aviation", computing: "Systems", finance: "Bank", tourism: "Resorts", renewables: "Energy", ai: "AI Labs" };

function backEntrepreneur(sector, way = "grant") {
    const W = LOCAL_WAYS[way];
    if (!indAvailable(sector) || !W || (W.req && !W.req())) return;
    if (G.capital < 6) return toast("Not enough political capital", "Backing a startup costs 6.");
    G.capital -= 6;
    const cost = G.econ.gdp * W.cost / 100;
    G.econ.debt += cost;
    const odds = localOdds(sector, way);
    const founder = randomLeaderName(G.ck).split(" ").pop();
    const name = way === "coop" ? `${G.regions[bestRegionFor(sector)].n} ${LOCAL_SUFFIX[sector] || "Industries"} Cooperative` : way === "stake" ? `National ${LOCAL_SUFFIX[sector] || "Industries"} Corporation` : `${founder} ${LOCAL_SUFFIX[sector] || "Industries"}`;
    if (W.p) applyEffects({ p: W.p });
    if (!chance(odds)) { log(`💼 ${name} fails despite state backing.`, "bad"); return toast("It didn't work", `${name} went under. ${money(cost * cpi())} lost.`); }
    const out = Math.min(plantSize({ size: "S" }) * 0.6, G.econ.gdp * 0.015);
    openFirm({ name, sector, home: G.ck, out, jobs: jobsFor(out, sector) * (way === "coop" ? 1.2 : 1), holidayUntil: G.year, local: 2, region: bestRegionFor(sector), foreign: false, way });
    applyEffects({ p: { business: way === "stake" ? 0 : 3 } });
}

// ── The tax base ────────────────────────────────────────────────────

function taxBase() {
    const e = G.econ;
    const eff = e.taxCap * (1 - G.s.corruption / 250);
    const formal = formalShare();
    const income = taxRate("income") * 0.55 * (0.35 + 0.65 * formal) * eff;
    const payroll = taxRate("payroll") * 0.8 * formal * eff;
    const sales = taxRate("sales") * 0.35 * eff;
    const agriShare = G.ind.agriculture.out / e.gdp;
    const land = taxRate("land") * (0.5 + agriShare * 3) * eff;
    const wealth = taxRate("wealth") * 1.2 * eff;
    let corpOut = 0, holidayOut = 0;
    Object.keys(G.ind).forEach(k => {
        if (["agriculture", "oil"].includes(k) || !indAvailable(k)) return;
        if (G.ind[k].own !== "state") corpOut += indValue(k);
    });
    (G.firms || []).forEach(f => { if (f.foreign && !f.closed && f.holidayUntil > G.year) holidayOut += f.out; });
    const corp = Math.max(0, corpOut - holidayOut) / e.gdp * taxRate("corporate") * 0.2 * eff;
    const holidayLoss = holidayOut / e.gdp * taxRate("corporate") * 0.2 * eff;
    const stateRev = ({ planned: 8, collectivized: 12 }[G.pol.economy] || 0) * Math.min(1, e.taxCap + 0.3);
    const royalty = { concessions: 0.15, partnership: 0.45, nationalized: 0.7 }[G.pol.resources] || 0.15;
    const resources = (indValue("oil") * royalty + indValue("mining") * royalty * 0.3) / e.gdp * 100;
    const tariffs = ({ protection: 1.5, managed: 0.8, trade_free: 0.2, autarky: 0.5 }[G.pol.trade] || 0.8) * eff * gattTariffMult();
    const colonyCut = G.gov.type === "colony" ? 0.6 : 1;
    const total = (income + payroll + sales + land + wealth + corp + stateRev + resources + tariffs) * colonyCut;
    return { income, payroll, sales, land, wealth, corp, stateRev, resources, tariffs, holidayLoss, total, formal };
}

function livingStandards(pc = gdpPerCapita() * cpi(), health = G.s.health, poverty = G.s.poverty, lit = G.dev.lit) {
    return clamp(log01(pc, 50, 60000) * 40 + health * 0.25 + (100 - poverty) * 0.2 + lit * 0.15);
}
