// ── BILL BUILDER — write your own legislation ───────────────────────
//
// Pick the problem, how to tackle it, who benefits, how much to spend,
// how to pay for it, who runs it, how long it lasts and what strings are
// attached. The builder compiles that into a bill with a title, a yearly
// cost, yearly effects, a list of supporters and opponents, and risks.

// eff: yearly effect of a standard program (0.5% of GDP, "fund services").
// Stats with targets (health, poverty, crime, unemp, liberty, stability,
// legitimacy, prestige) take these as a standing pull while the law is in
// force; lit/uni/tech/agri/indAll/growth/mil act as rates.
const ISSUES = {
    health:      { name: "Public health", icon: "⚕️", bill: "Health Services", dept: "health", eff: { health: 3 }, g: { people: 2 }, st: { socdem: 1, socialist: 1 } },
    education:   { name: "Schools & literacy", icon: "🏫", bill: "Education", dept: "education", eff: { lit: 0.6 }, g: { press: 2, people: 1 }, st: { socdem: 1, liberal: 1 } },
    universities:{ name: "Universities & research", icon: "🎓", bill: "Higher Education and Research", dept: "education", eff: { uni: 0.2, tech: 0.5 }, g: { press: 2 }, st: { liberal: 1, socdem: 1 } },
    housing:     { name: "Housing", icon: "🏘️", bill: "Housing", dept: "welfare", eff: { poverty: -2.5, crime: -1 }, g: { people: 2, labor: 1 }, st: { socdem: 1, socialist: 1 } },
    jobs:        { name: "Jobs & unemployment", icon: "👷", bill: "Employment", dept: "welfare", eff: { unemp: -0.8 }, g: { labor: 2 }, st: { socdem: 1, nationalist: 1 } },
    poverty:     { name: "Poverty & pensions", icon: "🤲", bill: "Social Security", dept: "welfare", eff: { poverty: -3.5 }, g: { people: 2, labor: 1 }, st: { socialist: 1, socdem: 1, conservative: -1 } },
    farms:       { name: "Agriculture", icon: "🌾", bill: "Agricultural", dept: "agriculture", eff: { agri: 1.5 }, g: { peasants: 3 }, st: { traditionalist: 1, conservative: 1 } },
    industry:    { name: "Industrial development", icon: "🏭", bill: "Industrial Development", dept: "industry", eff: { indAll: 0.8 }, g: { business: 2, labor: 1 }, st: { nationalist: 1, conservative: 1 } },
    transport:   { name: "Roads & railways", icon: "🛤️", bill: "Transport", dept: "infra", eff: { growth: 0.25 }, g: { business: 1, people: 1 }, st: {} },
    energy:      { name: "Electrification & energy", icon: "⚡", bill: "Electrification", dept: "infra", eff: { growth: 0.2, poverty: -1 }, g: { peasants: 1, business: 1 }, st: { nationalist: 1 } },
    police:      { name: "Crime & policing", icon: "🚔", bill: "Public Safety", dept: "police", eff: { crime: -3, liberty: -1 }, g: { security: 2, people: 1, press: -1 }, st: { conservative: 1, militarist: 1, liberal: -1 } },
    defense:     { name: "National defense", icon: "🎖️", bill: "National Defense", dept: "defense", eff: { mil: 4 }, g: { military: 3 }, st: { militarist: 2, nationalist: 1, socialist: -1 } },
    veterans:    { name: "Veterans", icon: "🪖", bill: "Veterans' Benefits", dept: "defense", eff: { poverty: -0.5 }, g: { military: 2, people: 1 }, st: { conservative: 1, nationalist: 1 } },
    rights:      { name: "Civil rights & equality", icon: "⚖️", bill: "Civil Rights", dept: "police", eff: { liberty: 2, stability: 0.5, prestige: 1 }, g: { press: 2 }, st: { socdem: 1, liberal: 1, traditionalist: -2, nationalist: -1 } },
    environment: { name: "Environment", icon: "🌳", bill: "Clean Air and Water", dept: "health", from: 1962, eff: { health: 1.5 }, g: { press: 2, business: -1 }, st: { socdem: 1, liberal: 1, conservative: -1 } },
    culture:     { name: "Religion & heritage", icon: "🕌", bill: "National Heritage", dept: "education", eff: { legitimacy: 2 }, g: { clergy: 3, press: -1 }, st: { traditionalist: 2, conservative: 1, communist: -2, liberal: -1 } }
};

const MECHS = {
    fund:        { name: "Fund services", noun: "Act", eff: 1, cost: 1, st: { socdem: 2, socialist: 1, liberal: -1, conservative: -1 } },
    program:     { name: "Create a national program", noun: "Program Act", eff: 1.2, cost: 1.2, st: { socialist: 2, socdem: 1, liberal: -1, conservative: -1 } },
    subsidize:   { name: "Subsidize producers", noun: "Assistance Act", eff: 0.9, cost: 1, st: { nationalist: 1, traditionalist: 1, liberal: -2 } },
    taxcredit:   { name: "Offer tax credits", noun: "Tax Credit Act", eff: 0.7, cost: 0.8, st: { liberal: 2, conservative: 2, socialist: -1 } },
    regulate:    { name: "Regulate", noun: "Standards Act", eff: 0.5, cost: 0.15, st: { socdem: 1, liberal: -2 }, g: { business: -2 } },
    restrict:    { name: "Restrict or ban", noun: "Control Act", eff: 0.5, cost: 0.1, st: { traditionalist: 1, militarist: 1, liberal: -2 }, extra: { liberty: -1 } },
    deregulate:  { name: "Deregulate", noun: "Modernization Act", eff: 0.4, cost: 0, st: { liberal: 3, conservative: 1, socialist: -2, socdem: -1 }, g: { business: 3 }, extra: { growth: 0.15 } },
    nationalize: { name: "Bring under state control", noun: "Public Ownership Act", eff: 0.8, cost: 1.4, st: { communist: 3, socialist: 2, nationalist: 1, liberal: -3, conservative: -3 }, g: { business: -4, cadres: 2 } }
};

const BENEFICIARIES = {
    everyone: { name: "Everyone", adj: "National" },
    poor: { name: "The poor", adj: "Low-Income", g: { people: 2 } },
    workers: { name: "Industrial workers", adj: "Workers'", g: { labor: 3 } },
    farmers: { name: "Farmers & peasants", adj: "Farmers'", g: { peasants: 3 } },
    business: { name: "Business & industry", adj: "Enterprise", g: { business: 3 } },
    youth: { name: "Students & young people", adj: "Youth", g: { press: 2 } },
    elderly: { name: "The elderly", adj: "Senior Citizens'", g: { people: 2 } },
    veterans: { name: "Veterans & soldiers", adj: "Servicemen's", g: { military: 3 } },
    minorities: { name: "Minorities", adj: "Minority", g: { press: 2, people: -1 } }
};

const FUNDS = {
    budget: { name: "The general budget (adds to the deficit)", st: {} },
    newtax: { name: "A new tax", st: { liberal: -2, conservative: -2, socialist: 1 }, g: { business: -2, people: -2 } },
    borrowing: { name: "Borrowing (bonds)", st: { conservative: -1, liberal: -1 }, g: {} },
    cuts: { name: "Cuts to another department", st: { conservative: 1, liberal: 1 }, g: {} },
    fees: { name: "Fees on industry", st: { liberal: -2, conservative: -1, socialist: 1 }, g: { business: -3 } },
    aid: { name: "Foreign aid from your patron", st: { nationalist: -2, communist: 0 }, g: { foreign: 3 }, req: () => getRel(G.ck, patronOf()) >= 30 && !["usa", "russia"].includes(G.ck) }
};

const AGENCIES_W = {
    ministry: { name: "The ministry", st: {} },
    newagency: { name: "A new national agency", st: { socialist: 1, conservative: -1, liberal: -1 }, eff: 1.1, cost: 1.1, risk: "bureaucracy" },
    regions: { name: "Regional and local governments", st: { conservative: 1, traditionalist: 1 }, eff: 0.9, g: { tribes: 2 } },
    contractors: { name: "Private contractors", st: { liberal: 2, conservative: 1, socialist: -2 }, eff: 1.05, g: { business: 2 }, risk: "contractor" },
    army: { name: "The armed forces", st: { militarist: 2 }, eff: 0.9, g: { military: 3 }, req: () => ["military_junta", "one_party", "monarchy"].includes(G.gov.type) },
    party: { name: "The party apparatus", st: { communist: 1 }, eff: 0.85, g: { cadres: 3, party: 2 }, req: () => ["one_party", "dominant_party"].includes(G.gov.type) }
};

const PROVS = {
    sunset: { name: "Sunset clause (expires unless renewed)", st: { conservative: 1, traditionalist: 1, liberal: 1 } },
    audit: { name: "Independent audit", st: { liberal: 1, socdem: 1 }, cost: 1.05 },
    localhire: { name: "Local hiring requirement", st: { nationalist: 1 }, g: { labor: 1 }, eff: 0.95 },
    meanstest: { name: "Means-testing (help the poorest first)", st: { conservative: 1, liberal: 1, socialist: -1 }, extra: { poverty: -1 }, g: { people: -1 } },
    worker: { name: "Worker protections", st: { socialist: 1, socdem: 1, liberal: -1 }, g: { labor: 2, business: -2 } },
    matching: { name: "Private matching funds", st: { liberal: 1, conservative: 1 }, cost: 0.7, eff: 0.9, g: { business: 1 } },
    earmark: { name: "Earmarks for every governing faction", st: {}, cost: 1.15, earmark: true }
};

const DURATIONS = [[2, "2 years"], [5, "5 years"], [10, "10 years"], [0, "Permanent"]];

function builderDefaults(cat = "health") {
    return { cat, mech: "fund", ben: "everyone", amount: 0.5, fund: "budget", agency: "ministry", years: 5, provs: [] };
}

function benOptions() {
    const out = Object.entries(BENEFICIARIES).map(([k, b]) => [k, b.name]);
    G.regions.forEach((r, i) => out.push([`region:${i}`, `${r.n} (region)`]));
    return out;
}

function compileBill(spec) {
    const I = ISSUES[spec.cat], M = MECHS[spec.mech], A = AGENCIES_W[spec.agency], Fu = FUNDS[spec.fund];
    const st = {};
    Object.keys(IDEOLOGIES).forEach(k => { st[k] = 0; });
    const addSt = o => Object.entries(o || {}).forEach(([k, v]) => { st[k] = (st[k] || 0) + v; });
    addSt(I.st); addSt(M.st); addSt(A.st); addSt(Fu.st);
    spec.provs.forEach(p => addSt(PROVS[p].st));
    const g = {};
    const addG = (o, m = 1) => Object.entries(o || {}).forEach(([k, v]) => { if (G.pillars[k]) g[k] = (g[k] || 0) + v * m; });
    const scale = spec.amount / 0.5;
    addG(I.g, Math.min(2, scale)); addG(M.g); addG(A.g); addG(Fu.g);
    spec.provs.forEach(p => addG(PROVS[p].g));
    let region = null;
    if (spec.ben.startsWith("region:")) region = +spec.ben.split(":")[1];
    else addG(BENEFICIARIES[spec.ben].g, Math.min(2, scale));
    // Effect multipliers: mechanism, agency competence and corruption.
    let effM = M.eff * (A.eff || 1) * (1 + minBonus(I.dept === "defense" ? "defense" : I.dept === "police" ? "interior" : I.dept === "industry" || I.dept === "infra" || I.dept === "agriculture" ? "industry" : I.dept === "welfare" || I.dept === "health" ? "health" : "education") * 0.08);
    effM *= 1 - G.s.corruption / 250;
    let costM = M.cost * (A.cost || 1);
    spec.provs.forEach(p => { effM *= PROVS[p].eff || 1; costM *= PROVS[p].cost || 1; });
    if (region != null) effM *= 0.6;   // a regional program helps one region, nationally it counts for less
    const eff = {};
    Object.entries(I.eff).forEach(([k, v]) => { eff[k] = v * scale * effM; });
    Object.entries(M.extra || {}).forEach(([k, v]) => { eff[k] = (eff[k] || 0) + v * Math.min(2, scale); });
    spec.provs.forEach(p => Object.entries(PROVS[p].extra || {}).forEach(([k, v]) => { eff[k] = (eff[k] || 0) + v * Math.min(2, scale); }));
    if (spec.ben === "poor") eff.poverty = (eff.poverty || 0) - 0.8 * scale;
    if (spec.ben === "minorities") { eff.liberty = (eff.liberty || 0) + 0.5; eff.stability = (eff.stability || 0) + 0.3; }
    const cost = spec.amount * costM;   // % of GDP per year
    Object.keys(st).forEach(k => { st[k] = clamp(Math.round(st[k]), -3, 3); });
    const risks = [];
    if (A.risk) risks.push(A.risk);
    if (!spec.provs.includes("audit") && cost >= 0.6) risks.push("misuse");
    if (spec.fund === "borrowing" && cost >= 0.5) risks.push("debt");
    if (["fund", "program"].includes(spec.mech) && scale >= 1) risks.push("demand");
    if (["regulate", "restrict"].includes(spec.mech)) risks.push("compliance");
    const benAdj = region != null ? G.regions[region].n : BENEFICIARIES[spec.ben].adj;
    const title = `${benAdj} ${I.bill} ${M.noun}`.replace(/\s+/g, " ");
    const fac = f => f.name;
    const supporters = G.factions.filter(f => st[f.ideo] >= 1).map(fac).concat(Object.entries(g).filter(([, v]) => v > 0).map(([k]) => pillarName(k)));
    const opponents = G.factions.filter(f => st[f.ideo] <= -1).map(fac).concat(Object.entries(g).filter(([, v]) => v < 0).map(([k]) => pillarName(k)));
    const riskText = { bureaucracy: "The new agency may grow beyond its mission", contractor: "Contractors may cut corners or overcharge", misuse: "Without an audit, funds may be stolen", debt: "Borrowing adds to the debt and its interest", demand: "Success creates demand for more", compliance: "Businesses will complain of compliance costs" };
    return {
        title, cat: spec.cat, spec, stance: st, g, eff, cost, region, years: spec.years,
        desc: `${M.name} to tackle ${I.name.toLowerCase()} for ${region != null ? "the " + G.regions[region].n + " region" : BENEFICIARIES[spec.ben].name.toLowerCase()}, run by ${A.name.toLowerCase()}, paid for by ${Fu.name.replace(/ \(.*\)/, "").toLowerCase()}.${spec.provs.length ? " Provisions: " + spec.provs.map(p => PROVS[p].name.replace(/ \(.*\)/, "").toLowerCase()).join("; ") + "." : ""}`,
        supporters, opponents, risks: risks.map(r => riskText[r]), riskKeys: risks
    };
}

const EFF_LABELS = { health: ["Health", 1], poverty: ["Poverty", -1], crime: ["Crime", -1], unemp: ["Unemployment", -1], liberty: ["Liberty", 1], stability: ["Stability", 1], legitimacy: ["Legitimacy", 1], prestige: ["Prestige", 1], lit: ["Literacy/yr", 1], uni: ["University/yr", 1], tech: ["Technology/yr", 1], agri: ["Farm output growth", 1], indAll: ["Industrial growth", 1], growth: ["GDP growth", 1], mil: ["Military strength %", 1] };

function effSummary(eff) {
    return Object.entries(eff).filter(([, v]) => Math.abs(v) > 0.01).map(([k, v]) => {
        const [n, dir] = EFF_LABELS[k] || [k, 1];
        return `<span class="${v * dir > 0 ? "good" : "bad"}">${n} ${v > 0 ? "+" : ""}${fmt(v, Math.abs(v) < 1 ? 2 : 1)}</span>`;
    }).join(" · ");
}
