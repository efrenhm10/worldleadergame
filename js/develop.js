// ── ECONOMIC DEVELOPMENT — fit, conditions, public investments ──────
//
// Every industry has a natural fit for your country, a checklist of
// conditions it needs to flourish (power, rail, schools, universities,
// stability...), and three public investments you can build through the
// capital program. Meet the conditions and build the investments, and the
// sector grows faster and attracts companies.

const C_ = (label, ok, fix, go) => ({ label, ok, fix, go });
const covOk = (k, n) => C_(`${INFRA[k].name} coverage ${n}%+ (now ${Math.round(cov(k))}%)`, () => cov(k) >= n, `Build ${INFRA[k].name.toLowerCase()} through the capital program`, { infra: k });
const litOk = n => C_(`Literacy ${n}%+ (now ${Math.round(G.dev.lit)}%)`, () => G.dev.lit >= n, "Schools, literacy campaigns and school buildings", { law: "literacy_campaign", infra2: "schools" });
const uniOk = n => C_(`University-educated ${n}%+ (now ${fmt(G.dev.uni, 1)}%)`, () => G.dev.uni >= n, "Public universities and university buildings", { law: "universities", infra2: "universities" });
const techOk = n => C_(`Technology ${n}+ (now ${Math.round(G.dev.tech)})`, () => G.dev.tech >= n, "Research council, national labs, R&D credits", { law: "research_council" });
const stabOk = n => C_(`Stability ${n}+ (now ${Math.round(G.s.stability)})`, () => G.s.stability >= n, "Keep order and the economy steady");
const shareOk = (k, n) => C_(`${INDUSTRIES[k].name} at least ${n}% of GDP (now ${fmt(indShare(k), 1)}%)`, () => indShare(k) >= n, `Grow the ${INDUSTRIES[k].name.toLowerCase()} industry first`, { ind: k });

const SECTOR_CONDITIONS = {
    agriculture: () => [covOk("irrigation", 40), covOk("roads", 30), stabOk(40)],
    mining: () => [covOk("rail", 40), covOk("power", 30), stabOk(40)],
    oil: () => [G.res.includes("coast") ? covOk("ports", 40) : covOk("rail", 40), stabOk(45), techOk(15)],
    textiles: () => [covOk("power", 30), litOk(30), G.res.includes("coast") ? covOk("ports", 30) : covOk("rail", 30)],
    steel: () => [covOk("rail", 50), covOk("power", 50), litOk(40)],
    machinery: () => [covOk("power", 50), litOk(55), covOk("rail", 40)],
    chemicals: () => [covOk("power", 50), uniOk(4), G.res.includes("coast") ? covOk("ports", 40) : covOk("rail", 40)],
    shipbuilding: () => [covOk("ports", 60), shareOk("steel", 3), litOk(45)],
    autos: () => [covOk("roads", 60), shareOk("steel", 3), litOk(65)],
    electronics: () => [covOk("power", 60), uniOk(6), covOk("telecom", 40)],
    aerospace: () => [uniOk(8), techOk(65), covOk("airports", 50)],
    computing: () => [uniOk(12), covOk("telecom", 60), techOk(75)],
    finance: () => [stabOk(60), litOk(60), covOk("telecom", 40)],
    tourism: () => [covOk("airports", 40), stabOk(55), C_("Crime 45 or less", () => G.s.crime <= 45, "Policing, jobs and housing")],
    renewables: () => [covOk("power", 60), uniOk(15)],
    ai: () => [uniOk(25), covOk("telecom", 80), techOk(130)],
    // Film needs city audiences, a press regime that lets stories be told, and
    // the power grid (cinemas), then broadcast and data networks (TV, streaming).
    film: () => [C_("Censorship short of state control", () => G.pol.press !== "state", "Loosen press controls. State-run cinema makes propaganda, not hits"),
                 C_("Urban population 40%+", () => G.dev.urban >= 40, "Cinemas need city crowds. Industry and services draw people to cities"),
                 G.year < 1960 ? covOk("power", 40) : covOk("telecom", G.year < 1995 ? 40 : 60)]
};

const SECTOR_ASSETS = {
    agriculture: { college: { name: "Agricultural college", cost: 0.15, desc: "Trains the extension agents and farm managers." }, silos: { name: "Grain silos & cold storage", cost: 0.2, desc: "Less waste, steadier prices." }, markets: { name: "Farm-to-market roads", cost: 0.25, desc: "Farmers can sell beyond the village." } },
    mining: { survey: { name: "National geological survey", cost: 0.1, desc: "Find what is under the ground." }, ore_rail: { name: "Ore railway", cost: 0.3, desc: "Get the ore to the smelters and ports." }, school: { name: "School of mines", cost: 0.15, desc: "Engineers and geologists." } },
    oil: { refinery: { name: "National refinery", cost: 0.35, desc: "Sell products, not just crude." }, pipeline: { name: "Pipeline network", cost: 0.3, desc: "Move oil cheaply to the coast." }, institute: { name: "Petroleum institute", cost: 0.15, desc: "Your own petroleum engineers." } },
    textiles: { board: { name: "Cotton marketing board", cost: 0.1, desc: "Reliable supplies of fiber." }, design: { name: "Textile & design school", cost: 0.1, desc: "Higher-value garments." }, epz: { name: "Export processing zone", cost: 0.2, desc: "Duty-free factories for export." } },
    steel: { coke: { name: "Coking coal mines & ovens", cost: 0.3, desc: "Fuel for the blast furnaces." }, institute: { name: "Metallurgy institute", cost: 0.15, desc: "Better alloys, fewer accidents." }, spurs: { name: "Industrial rail spurs", cost: 0.2, desc: "Rail into every mill." } },
    machinery: { tools: { name: "Machine-tool institute", cost: 0.15, desc: "Precision engineering know-how." }, estate: { name: "Industrial estate", cost: 0.2, desc: "Serviced plots with power and water." }, standards: { name: "Standards bureau", cost: 0.05, desc: "Parts that fit, products that sell." } },
    chemicals: { faculty: { name: "Chemistry faculty", cost: 0.15, desc: "The chemists the industry needs." }, terminal: { name: "Chemical port terminal", cost: 0.25, desc: "Import feedstocks, export products." }, pharma: { name: "Pharmaceutical laboratory", cost: 0.15, desc: "Make medicines at home." } },
    shipbuilding: { drydock: { name: "Giant dry dock", cost: 0.35, desc: "Build supertankers." }, naval: { name: "Naval architecture school", cost: 0.1, desc: "Design your own ships." }, credit: { name: "Ship export credit agency", cost: 0.15, desc: "Finance foreign buyers." } },
    autos: { suppliers: { name: "Auto supplier park", cost: 0.25, desc: "Parts makers next to the assembly line." }, highway: { name: "Highway link to the plants", cost: 0.25, desc: "Get cars to market." }, testing: { name: "Engineering test center", cost: 0.1, desc: "Design and safety testing." } },
    electronics: { park: { name: "Electronics research park", cost: 0.25, desc: "Labs and factories side by side." }, engineering: { name: "Electrical engineering faculty", cost: 0.15, desc: "Engineers by the thousand." }, fab: { name: "Semiconductor fabrication plant", cost: 0.4, desc: "Make your own chips.", from: 1975 } },
    aerospace: { tunnel: { name: "Wind tunnel & test range", cost: 0.2, desc: "Test aircraft and missiles." }, school: { name: "Aeronautics institute", cost: 0.15, desc: "Aircraft designers." }, airfield: { name: "Factory airfield", cost: 0.15, desc: "Fly what you build." } },
    computing: { cs: { name: "Computer science departments", cost: 0.15, desc: "Programmers and researchers." }, hub: { name: "Technology hub & incubators", cost: 0.15, desc: "Where startups grow." }, fiber: { name: "Fiber-optic backbone", cost: 0.3, desc: "Fast data everywhere.", from: 1985 } },
    finance: { exchange: { name: "Modern stock exchange", cost: 0.1, desc: "Let companies raise capital." }, central: { name: "Independent central bank", cost: 0.05, desc: "Investors trust the currency." }, school: { name: "School of finance", cost: 0.1, desc: "Bankers, accountants, actuaries." } },
    tourism: { airport: { name: "International airport terminal", cost: 0.3, desc: "Jets full of visitors." }, hotel: { name: "Hotel & tourism school", cost: 0.1, desc: "Service that brings people back." }, heritage: { name: "Heritage site restoration", cost: 0.15, desc: "Ruins, temples and old towns." } },
    renewables: { grid: { name: "Smart grid", cost: 0.3, desc: "Handle wind and solar power." }, factory: { name: "Solar panel factory", cost: 0.25, desc: "Build panels at home." }, battery: { name: "Battery research lab", cost: 0.15, desc: "Store the power." } },
    film: { studios: { name: "Studio lot & sound stages", cost: 0.15, desc: "Stages, backlots and post-production. Foreign shoots come too." }, school: { name: "National film school", cost: 0.06, desc: "Directors, cinematographers and editors trained at home." }, fund: { name: "Film fund & production rebate", cost: 0.08, desc: "Co-finances local films and refunds part of what foreign productions spend here." } },
    ai: { datacenter: { name: "National data centers", cost: 0.35, desc: "Compute for researchers and companies." }, institute: { name: "AI research institute", cost: 0.2, desc: "Attract the best researchers." }, grants: { name: "Compute grants for startups", cost: 0.1, desc: "Lower the cost of building models." } }
};

function sectorConditions(k) { return (SECTOR_CONDITIONS[k] ? SECTOR_CONDITIONS[k]() : []).map(c => Object.assign({ met: c.ok() }, c)); }
function assetBuilt(k, a) { return !!(G.assets && G.assets[`${k}:${a}`]); }
function assetQueued(k, a) { return G.cip && (G.cip.queue.concat(G.cip.active)).some(p => p.type === `asset:${k}:${a}`); }

// Natural fit: 1–5 stars from resources, geography and the 1950 economy.
function sectorFit(k) {
    if (G.fit && G.fit[k] != null) return G.fit[k];
    if (k === "film" && FILM_FIT[G.ck]) { G.fit = G.fit || {}; return (G.fit[k] = FILM_FIT[G.ck]); }
    const c = C(), sh = (c.econ.inds[k] || 0);
    let f = sh >= 8 ? 5 : sh >= 4 ? 4 : sh >= 1.5 ? 3 : sh > 0 ? 2.5 : 2;
    const d = INDUSTRIES[k];
    if (d.res && (c.res || []).includes(d.res)) f += 1;
    if (k === "tourism" && (c.res || []).includes("tourism")) f += 0.5;
    if (k === "agriculture" && ["Africa", "Asia", "Americas"].includes(c.area)) f += 0.5;
    if (k === "shipbuilding" && (c.res || []).includes("coast")) f += 0.5;
    if (["finance", "computing", "electronics"].includes(k) && c.econ.pop < 6) f += 0.5;
    G.fit = G.fit || {};
    G.fit[k] = clamp(Math.round(f * 2) / 2, 1, 5);
    return G.fit[k];
}

function sectorBonus(k) {
    const conds = sectorConditions(k);
    // Natural fit pulls a small sector up toward its potential; it doesn't make
    // a big one grow forever (and farming shrinks as incomes rise regardless).
    let b = k === "agriculture" ? 0 : (sectorFit(k) - 3) * 0.4 * clamp(1 - indShare(k) / 6, 0, 1);
    conds.forEach(c => { if (c.met) b += 0.4; });
    Object.keys(SECTOR_ASSETS[k] || {}).forEach(a => { if (assetBuilt(k, a)) b += 0.8; });
    return clamp(b, -2, 3);
}

// ── CEO negotiation ─────────────────────────────────────────────────

const CEO_STYLES = { hardnosed: "Hard-nosed: cares about the bottom line", visionary: "Visionary: wants to be part of something big", cautious: "Cautious: hates risk and surprises", patriotic: "Patriotic: listens to their own government" };
const CEO_PITCHES = {
    skills: "“Our workforce is educated and ready.”",
    taxes: "“We'll give you tax certainty for a decade.”",
    infra: "“We'll build whatever infrastructure you need.”",
    stability: "“This country is stable and safe.”",
    market: "“You'll have a huge market right here.”",
    labor: "“No labor trouble. I guarantee it.”",
    vision: "“Imagine what we could build together.”",
    local: "“Our people must get these jobs.”"
};

function ensureCeo(p) {
    if (!p.ceo) p.ceo = { name: randomLeaderName(p.home && COUNTRIES[p.home] ? p.home : G.ck), style: pick(Object.keys(CEO_STYLES)), round: 0, bonus: 0, said: [] };
    return p.ceo;
}

// Is the pitch true? CEOs check.
function pitchTruth(k, p) {
    const I = INDUSTRIES[p.sector];
    return {
        skills: G.dev.lit >= I.lit && G.dev.uni >= I.uni * 0.8,
        taxes: taxRate("corporate") <= 35,
        infra: true,
        stability: G.s.stability >= 55,
        market: G.econ.gdp >= 20,
        labor: G.pol.labor !== "bargaining" || (G.pillars.labor && G.pillars.labor.l > 55),
        vision: true,
        local: true
    }[k];
}

function ceoPitch(i, pitch) {
    const p = G.prospects[i];
    if (!p) return "";
    const ceo = ensureCeo(p);
    if (ceo.round >= 3) return "";
    ceo.round++;
    let d = 0, reply;
    const truth = pitchTruth(pitch, p);
    if (pitch === p.prio && truth) { d = 0.11; reply = "That is exactly what we need to hear."; p.known = true; }
    else if (pitch === p.prio && !truth) { d = 0.02; reply = "That matters to us, but our analysts have seen your numbers. They don't back you up."; p.known = true; }
    else if (!truth) { d = -0.06; reply = "Our people have checked that claim. It isn't true, and now I wonder what else isn't."; }
    else if (pitch === "vision") { d = ceo.style === "visionary" ? 0.09 : -0.02; reply = ceo.style === "visionary" ? "Now you're talking. I want to build something that matters." : "Spare me the poetry. Show me the numbers."; }
    else if (pitch === "local") { d = -0.04; p.inc.local = Math.max(p.inc.local, 1); reply = "We can hire locally, but it raises our costs."; }
    else { d = 0.02; reply = "Good to know, but it isn't what keeps me up at night."; }
    if (ceo.style === "hardnosed" && ["taxes", "labor"].includes(pitch)) d += 0.03;
    if (ceo.style === "cautious" && pitch === "stability") d += 0.04;
    if (ceo.style === "patriotic" && p.home) d += getRel(G.ck, p.home) / 600;
    d += skill("diplomacy") * 0.01 + (trait("charismatic") ? 0.01 : 0);
    ceo.bonus += d;
    ceo.said.push({ pitch, reply, d });
    if (ceo.round === 3 && !p.known) { p.known = true; ceo.said.push({ pitch: null, reply: `As you leave, an aide lets slip what really matters to them: ${PRIORITIES[p.prio]}.`, d: 0 }); }
    return reply;
}

function startCeoTalk(i) {
    const p = G.prospects[i];
    if (!p) return;
    if (p.ceo && p.ceo.round > 0) return;
    if (G.capital < 4) return toast("Not enough political capital", "A trip to headquarters costs 4.");
    G.capital -= 4;
    ensureCeo(p);
    if (p.home) addRel(G.ck, p.home, 2);
    queueScene("ceo_talk", { i, name: p.name });
}

SCENES.ceo_talk = a => {
    const p = G.prospects && G.prospects[a.i];
    if (!p || p.name !== a.name) return S("🏢", "", "Meeting over", "", [ch("OK", {}, "")]);
    const ceo = ensureCeo(p);
    const last = ceo.said[ceo.said.length - 1];
    const intro = `${ceo.name}, chief executive of ${p.name}. ${CEO_STYLES[ceo.style]}.`;
    if (ceo.round >= 3) return S("🏢", `${p.home ? flagOf(p.home) : "🏳️"} ${p.name} headquarters`, "The meeting ends",
        `${last ? `“${last.reply}”` : ""}\n\nYou now know what they care about most: **${PRIORITIES[p.prio]}**. Overall the meeting ${ceo.bonus > 0.1 ? "went very well" : ceo.bonus > 0 ? "went reasonably well" : "went badly"}.`,
        [ch("Back to the investment desk", {}, "", { run: () => { view = "economy"; } })]);
    return S("🏢", `${p.home ? flagOf(p.home) : "🏳️"} ${p.name} headquarters · round ${ceo.round + 1} of 3`, `Pitch to ${ceo.name}`,
        `${intro}${last ? `\n\nLast answer: “${last.reply}”` : "\n\nThey give you twenty minutes. What do you lead with?"}`,
        Object.entries(CEO_PITCHES).map(([k, t]) => ch(t, {}, "", { run: () => { ceoPitch(a.i, k); queueScene("ceo_talk", a); return ""; } })));
};

// ── Homegrown firms ─────────────────────────────────────────────────

const LOCAL_WAYS = {
    grant: { name: "Startup grant", desc: "A one-off grant to a promising founder.", cost: 0.1, odds: 0, own: "private" },
    bank: { name: "Development bank loan", desc: "Cheaper, if you have a national development bank.", cost: 0.05, odds: 0.08, own: "private", req: () => lawOn("dev_bank") },
    coop: { name: "Worker cooperative", desc: "Owned by its workers. Unions love it; returns are modest.", cost: 0.08, odds: -0.04, own: "coop", p: { labor: 4, business: -1 } },
    stake: { name: "Public stake", desc: "The state takes a share. Safer, but business grumbles.", cost: 0.15, odds: 0.1, own: "state", p: { business: -3, cadres: 2 } }
};

function localOdds(sector, way) {
    const W = LOCAL_WAYS[way];
    return clamp(0.32 + G.dev.lit / 250 + (G.s.stability - 50) / 200 + G.ind[sector].sup * 0.05 - indGap(sector) * 0.06 + skill("economics") * 0.02 + W.odds + sectorBonus(sector) * 0.03, 0.05, 0.9);
}

function yearlyFirms() {
    (G.firms || []).forEach(f => {
        if (f.foreign || f.closed) return;
        const b = sectorBonus(f.sector);
        if (b > 0.5 && chance(0.25)) { const add = f.out * 0.3; f.out += add; G.ind[f.sector].out += add; const j = jobsFor(add, f.sector); f.jobs += j; addJobs(j); log(`📈 ${f.name} expands: ${fmtJobs(j)} new jobs.`, "good"); }
        else if (b < -0.5 && chance(0.12)) { f.closed = true; G.ind[f.sector].out = Math.max(0.0001, G.ind[f.sector].out - f.out * 0.8); G.econ.jobsAdded -= f.jobs / Math.max(1, laborForce() * 1000) * 100; G.econ.formalAdded = Math.max(0, (G.econ.formalAdded || 0) - f.jobs / Math.max(1, laborForce() * 1000) * 100); log(`📉 ${f.name} goes bankrupt. ${fmtJobs(f.jobs)} jobs lost.`, "bad"); }
    });
}

// Film industries of 1950 (share of GDP) and where film naturally thrives.
const FILM_1950 = { usa: 0.6, uk: 0.3, france: 0.3, india: 0.25, japan: 0.35, mexico: 0.4, argentina: 0.3, brazil: 0.1, germany: 0.2, russia: 0.15, china: 0.05, turkey: 0.1, philippines: 0.15, egypt: 0.2, southkorea: 0.05, canada: 0.05, australia: 0.05, iran: 0.05, israel: 0.05, singapore: 0.1, uruguay: 0.05, southafrica: 0.05, pakistan: 0.05, indonesia: 0.05, norway: 0.05, switzerland: 0.05, nigeria: 0.02 };
const FILM_FIT = { usa: 5, india: 5, japan: 4, uk: 4, france: 4, mexico: 4, nigeria: 4, southkorea: 4, argentina: 3.5, brazil: 3.5, philippines: 3.5, turkey: 3.5, iran: 3.5, china: 3.5, germany: 3.5, australia: 3.5, canada: 3.5 };
Object.entries(FILM_1950).forEach(([k, v]) => { if (COUNTRIES[k]) COUNTRIES[k].econ.inds.film = v; });
