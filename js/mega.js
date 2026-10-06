// ── MEGAPROJECTS — the big bets ─────────────────────────────────────
//
// A handful of huge, nation-defining projects: great dams, railways,
// ports, steel complexes, special economic zones, new capitals. Each one:
// - must be unlocked (the ladder: a steel mill needs power and rail first);
// - starts with a feasibility study that firms up the cost;
// - needs financing: competing offers from the World Bank, the superpowers,
//   export-credit agencies, oil-backed lenders, bond markets, China or your
//   own diaspora, each with its own rate, strings and risks;
// - is built over years, with overruns, delays, scandals and protests;
// - opens with a ribbon-cutting, and pays off only as far as the country
//   can use it (a dam with no industry to buy its power is a white elephant).

const MEGA_TYPES = {
    dam:      { name: "Great dam", icon: "🌊", cost: 10, years: 7, from: 1950, desc: "Power and irrigation on a national scale.", benefit: "Power +25, irrigation +15 coverage; faster industry and farming for 10 years; prestige.",
                infra: { power: 25, irrigation: 15 }, ind: { all: 0.5, agriculture: 0.8 }, prestige: 6, protest: 0.5 },
    railway:  { name: "National railway", icon: "🚆", cost: 6, years: 5, from: 1950, desc: "Opens the interior to mines, farms and markets.", benefit: "Rail +25 coverage; mining and farming grow faster; +0.2 growth for 10 years.",
                infra: { rail: 25, roads: 5 }, ind: { mining: 1, agriculture: 0.6 }, growth: 0.2, prestige: 3 },
    highway:  { name: "National highway network", icon: "🛣️", cost: 8, years: 8, from: 1955, desc: "Motorways linking every major city.", benefit: "Roads +30 coverage; +0.3 growth for 10 years.",
                infra: { roads: 30 }, growth: 0.3, prestige: 3 },
    port:     { name: "Deep-water port", icon: "⚓", cost: 4, years: 3, from: 1950, desc: "A container-age port for the export trade.", benefit: "Ports +30 coverage; export industries grow faster; +0.2 growth.",
                infra: { ports: 30 }, ind: { textiles: 0.6, mining: 0.4, agriculture: 0.3, electronics: 0.6, autos: 0.4 }, growth: 0.2, prestige: 2, req: () => G.res.includes("coast") ? null : "Needs a coastline" },
    steel:    { name: "Integrated steel complex", icon: "🏗️", cost: 6, years: 4, from: 1950, desc: "Blast furnaces, rolling mills and a company town.", benefit: "Steel output jumps; steel and machinery grow faster for 10 years; industrialization.",
                ind: { steel: 2, machinery: 1 }, steelOut: 0.015, prestige: 3, req: () => cov("power") < 40 ? `Power coverage 40% (now ${Math.round(cov("power"))}%)` : cov("rail") < 30 ? `Rail coverage 30% (now ${Math.round(cov("rail"))}%)` : null },
    sez:      { name: "Special economic zone", icon: "🏭", cost: 2, years: 2, from: 1959, desc: "Low taxes and fast permits for foreign factories near a port.", benefit: "Many more foreign companies; light industry and electronics boom; +0.3 growth for 10 years.",
                ind: { textiles: 1.5, electronics: 1.5 }, growth: 0.3, odds: 0.15, prestige: 2, req: () => cov("ports") < 40 ? `Ports coverage 40% (now ${Math.round(cov("ports"))}%)` : G.dev.lit < 40 ? `Literacy 40% (now ${Math.round(G.dev.lit)}%)` : null },
    capital:  { name: "New capital city", icon: "🏛️", cost: 12, years: 8, from: 1950, desc: "A planned capital in the interior: a statement of national purpose.", benefit: "Urbanization +4; a regional boom; big prestige and stability.",
                urban: 4, prestige: 8, stability: 3, protest: 0.2, req: () => G.s.stability < 50 ? `Stability 50 (now ${Math.round(G.s.stability)})` : null },
    green:    { name: "Green Revolution program", icon: "🌾", cost: 3, years: 4, from: 1965, desc: "High-yield seeds, fertilizer and canals for millions of farms.", benefit: "Farm growth +2.5 for 10 years; poverty −5; health +2.",
                ind: { agriculture: 2.5 }, poverty: -5, health: 2, prestige: 3, req: () => cov("irrigation") < 30 ? `Irrigation coverage 30% (now ${Math.round(cov("irrigation"))}%)` : null },
    univ:     { name: "National university & research city", icon: "🎓", cost: 2, years: 4, from: 1950, desc: "A flagship university with engineering and science institutes.", benefit: "More graduates and faster technology for good.",
                uni: 0.1, tech: 0.6, prestige: 2, req: () => G.dev.lit < 35 ? `Literacy 35% (now ${Math.round(G.dev.lit)}%)` : null },
    nuclear:  { name: "Nuclear power program", icon: "⚛️", cost: 5, years: 6, from: 1956, desc: "Reactors for electricity, and a club few countries belong to.", benefit: "Power +20 coverage; technology +3; prestige. Raises world tension a little.",
                infra: { power: 20 }, techNow: 3, prestige: 4, tension: 2, req: () => G.dev.tech < 50 ? `Technology 50 (now ${Math.round(G.dev.tech)})` : G.dev.uni < 3 ? `University-educated 3% (now ${fmt(G.dev.uni, 1)}%)` : null }
};

// Real projects, by country (name, and a neighbour that objects).
const MEGA_NAMES = {
    ethiopia: { dam: ["Grand Renaissance Dam on the Blue Nile", "egypt", 2010, "Blue Nile (Abay) hydro dam"], railway: ["Addis Ababa–Djibouti railway"], capital: null, green: ["Highland irrigation scheme"], univ: ["Haile Selassie I University"] },
    brazil: { dam: ["Itaipu Dam"], capital: ["Brasília"], highway: ["Trans-Amazonian Highway"], steel: ["Volta Redonda expansion"], nuclear: ["Angra nuclear plant"] },
    india: { dam: ["Bhakra Nangal Dam", "pakistan"], steel: ["Bhilai Steel Plant"], green: ["Green Revolution in the Punjab"], univ: ["Indian Institutes of Technology"], nuclear: ["Tarapur atomic plant"] },
    china: { dam: ["Three Gorges Dam", null, 1990, "Yangtze gorges dam"], sez: ["Shenzhen Special Economic Zone", null, 1979, "Coastal export processing zone"], railway: ["Qinghai–Tibet railway"], steel: ["Baosteel complex"] },
    nigeria: { dam: ["Kainji Dam"], capital: ["Abuja"], port: ["Apapa port expansion"], steel: ["Ajaokuta steel complex"] },
    pakistan: { dam: ["Tarbela Dam", "india"], capital: ["Islamabad"], port: ["Gwadar port"] },
    southkorea: { steel: ["POSCO Pohang steelworks"], highway: ["Gyeongbu Expressway"], sez: ["Masan Free Export Zone"], nuclear: ["Kori nuclear plant"] },
    turkey: { dam: ["Atatürk Dam (Southeast Anatolia Project)", "iraq"], highway: ["Bosphorus bridge and motorways"] },
    indonesia: { dam: ["Jatiluhur Dam"], sez: ["Batam free trade zone"], steel: ["Krakatau Steel"] },
    usa: { highway: ["Interstate Highway System"], nuclear: ["Atoms for Peace reactors"] },
    uae: { port: ["Jebel Ali port", null, 1976, "Dubai deep-water port"], sez: ["Jebel Ali Free Zone", null, 1984, "Dubai free trade zone"] },
    saudi: { capital: ["King Abdullah Economic City", null, 2005, "Riyadh new government district"], port: ["Jubail industrial port"] },
    iran: { dam: ["Karaj Dam"], steel: ["Isfahan steel mill"], nuclear: ["Bushehr reactor"] },
    argentina: { dam: ["El Chocón Dam"], nuclear: ["Atucha nuclear plant"] },
    mexico: { dam: ["Malpaso Dam"], highway: ["National toll motorways"] },
    southafrica: { dam: ["Orange River Project"], steel: ["Sasol oil-from-coal works"], nuclear: ["Koeberg nuclear plant"] },
    australia: { dam: ["Snowy Mountains Scheme"], railway: ["Trans-Australian standard gauge"] },
    japan: { railway: ["Shinkansen bullet train"], highway: ["Meishin Expressway"] },
    uk: { railway: ["Channel Tunnel", null, 1985, "Cross-Channel rail link"], nuclear: ["Calder Hall reactors"] },
    france: { nuclear: ["Messmer nuclear plan"], railway: ["TGV high-speed lines"] },
    germany: { highway: ["Autobahn expansion"] },
    israel: { green: ["National Water Carrier"], univ: ["Technion & Weizmann expansion"] },
    singapore: { sez: ["Jurong Industrial Estate"], port: ["Container port at Tanjong Pagar"] },
    venezuela: { dam: ["Guri Dam"], steel: ["SIDOR steelworks"] },
    russia: { dam: ["Bratsk Dam"], railway: ["Baikal–Amur Mainline"] },
    canada: { port: ["St. Lawrence Seaway"], dam: ["Churchill Falls"] },
    philippines: { dam: ["Magat Dam"] }, cambodia: { dam: ["Prek Thnot Dam"] }, norway: { dam: ["Tokke hydropower"] }
};
// Entries: [name, objecting neighbour, year the real name applies from, earlier name].
function megaName(type) { const n = MEGA_NAMES[G.ck] && MEGA_NAMES[G.ck][type]; return n ? (n[2] && G.year < n[2] ? n[3] : n[0]) : `${C().name} ${MEGA_TYPES[type].name.toLowerCase()}`; }
const UTIL_HINT = { dam: "rises with industry and cities to buy the power", steel: "rises with literacy and power coverage", port: "rises with trade agreements and free trade", sez: "rises with stability and literacy", green: "rises with irrigation", univ: "rises with literacy", nuclear: "rises with graduates", railway: "rises with mining and farm output", highway: "rises with urbanization", capital: "is high" };
const megaRival = type => { const n = MEGA_NAMES[G.ck] && MEGA_NAMES[G.ck][type]; return n && n[1] && G.nations[n[1]] ? n[1] : null; };

// Policy rate of the world's lenders, roughly (US rates).
function worldRate() { const y = G.year; return y < 1966 ? 3 : y < 1973 ? 5 : y < 1979 ? 7 : y < 1985 ? 13 : y < 1991 ? 8 : y < 2001 ? 5.5 : y < 2008 ? 3.5 : y < 2022 ? 0.5 : 4.5; }

function mega() {
    if (!G.mega) G.mega = { list: [], loans: [], done: [], seq: 0 };
    return G.mega;
}
const megaActive = () => mega().list.filter(p => p.stage !== "done" && p.stage !== "cancelled");

function megaLock(type) {
    const T = MEGA_TYPES[type], m = mega();
    if (G.year < T.from) return `From ${T.from}`;
    if (m.list.some(p => p.type === type && p.stage !== "cancelled")) return "Already built or under way";
    if (MEGA_NAMES[G.ck] && MEGA_NAMES[G.ck][type] === null) return "Not suited to your country";
    return T.req ? T.req() : null;
}

function startStudy(type) {
    const lock = megaLock(type);
    if (lock) return toast("Not yet", lock);
    if (megaActive().length >= 2) return toast("Too much at once", "You can run two megaprojects at a time.");
    const studyCost = G.econ.gdp * 0.002;
    if (G.capital < 4) return toast("Not enough political capital", "A feasibility study costs 4.");
    G.capital -= 4;
    treasuryPay(studyCost);
    const m = mega(), T = MEGA_TYPES[type];
    const p = { id: ++m.seq, type, name: megaName(type), stage: "study", t: G.t, until: G.t + 26, region: bestMegaRegion(type),
        est: T.cost * rnd(0.85, 1.25), weeks: Math.round(T.years * 52 * rnd(0.9, 1.15)) };
    m.list.push(p);
    log(`📐 Engineers begin a feasibility study for the ${p.name}. Results in about six months.`, "policy");
}

function bestMegaRegion(type) {
    const want = { dam: "agrarian", green: "agrarian", port: "industrial", sez: "industrial", steel: "industrial", railway: "mining", capital: "agrarian" }[type];
    let best = 0, bs = -1;
    G.regions.forEach((r, i) => { const s = (want && r.t.includes(want) ? 10 : 0) + (type === "capital" ? -r.pop / 5 : r.pop / 10); if (s > bs) { bs = s; best = i; } });
    return best;
}

// ── Financing ───────────────────────────────────────────────────────
// Each offer: max share of the cost, interest, years, conditions, approval odds.
function megaOffers(p) {
    const T = MEGA_TYPES[p.type], y = G.year, area = C().area, out = [];
    const ratio = gdpPerCapita() / Math.max(1, frontierPC()), al = G.align, cold = y >= 1950 && y < 1991;
    const spread = ratingSpread(), corr = G.s.corruption;
    const bidding = p.bidding && cold;
    const add = o => out.push(Object.assign({ approve: 0.9, time: 1, jobs: 1 }, o));
    if (G.inst && instMember("wb")) {
        add({ k: "ibrd", name: "World Bank (IBRD)", icon: "🏦", share: 0.5, rate: 4 + Math.min(2, spread * 0.3), years: 20, conc: true,
              note: `Slow and careful: ${p.type === "dam" ? "environmental and resettlement review adds time, " : ""}international tender for contracts.`, approve: clamp(0.85 - Math.max(0, corr - 40) / 60, 0.1, 0.95), time: p.type === "dam" ? 1.15 : 1.05 });
        if (y >= 1960 && ratio < 0.2) add({ k: "ida", name: "World Bank (IDA)", icon: "🏦", share: 0.35, rate: 0.75, years: 40, conc: true, note: "Near-free credit for the poorest countries, with policy conditions.", approve: clamp(0.8 - Math.max(0, corr - 45) / 60, 0.1, 0.9) });
        const rdb = area === "Americas" && y >= 1960 ? "Inter-American Development Bank" : area === "Africa" && y >= 1966 ? "African Development Bank" : area === "Asia" && y >= 1966 ? "Asian Development Bank" : null;
        if (rdb) add({ k: "rdb", name: rdb, icon: "🏦", share: 0.3, rate: 4.5, years: 20, conc: true, note: "Regional development lender.", approve: 0.8 });
    }
    if (cold && G.ck !== "usa" && al > -20 && getRel(G.ck, "usa") >= 15) add({ k: "usaid", name: "US aid & Export-Import Bank", icon: "🦅", share: bidding ? 0.55 : 0.4, rate: bidding ? 2 : 3, years: 25, conc: true,
        note: "Generous if you stand with the West. Washington can pull out if you drift toward Moscow.", strings: { align: 8, rel: { russia: -8 } }, approve: clamp(0.5 + getRel(G.ck, "usa") / 120 + al / 300, 0.1, 0.95), cold: "west" });
    if (cold && y >= 1955 && G.ck !== "russia" && al < 40 && !(G.blocs.nato || []).includes(G.ck) && getRel(G.ck, "russia") >= 5) add({ k: "soviet", name: "Soviet state credits", icon: "☭", share: bidding ? 0.6 : 0.5, rate: bidding ? 1.5 : 2.5, years: 12, conc: true,
        note: "Cheap credit, Soviet engineers and equipment (technology +2). Moscow expects friendship.", strings: { align: -8, rel: { usa: -8 } }, approve: clamp(0.5 + getRel(G.ck, "russia") / 120 - al / 300, 0.1, 0.95), jobs: 0.8, tech: 2, cold: "east" });
    if (y >= 1955 && area === "Asia" && G.ck !== "japan" && G.nations.japan && getRel(G.ck, "japan") >= 5) add({ k: "japan", name: "Japanese yen loans", icon: "🇯🇵", share: 0.3, rate: 3, years: 25, conc: true, note: "Reparations and yen loans; Japanese firms win many contracts.", approve: 0.8, jobs: 0.85 });
    if (y >= 1960 && ratio < 0.7) add({ k: "eca", name: "European export credits", icon: "🇪🇺", share: 0.3, rate: 6 + spread * 0.3, years: 12, note: "French, British and German export agencies lend if their firms build it.", approve: 0.85, jobs: 0.85 });
    if (y >= 1974 && ["pakistan", "indonesia", "turkey", "nigeria", "iran", "egypt", "malaya"].includes(G.ck)) add({ k: "opec", name: "OPEC & Gulf development funds", icon: "🛢️", share: 0.2, rate: 2.5, years: 20, conc: true, note: "Petrodollars recycled to friendly states.", approve: 0.75 });
    const resShare = (indValue("oil") + indValue("mining")) / G.econ.gdp;
    if (y >= 1970 && resShare > 0.05) add({ k: "resource", name: "Oil- or ore-backed loan", icon: "⛏️", share: 0.6, rate: 3, years: 15, note: "Repaid in future exports. Fast money, but you mortgage your resources and corruption creeps in.", approve: 0.9, strings: { corruption: 2 }, collateral: true });
    if (y >= 1973 && y < 1986) add({ k: "syndicated", name: "Syndicated bank loans (petrodollars)", icon: "💵", share: 0.5, rate: worldRate() + 1.5 + spread, years: 8, floating: true,
        note: "Western banks awash with oil money lend freely, at floating rates. If world interest rates spike, so does your bill.", approve: clamp(0.4 + (mon().score - 30) / 60, 0.05, 0.95) });
    if (y >= 1991 && mon().score >= 35) add({ k: "eurobond", name: "Eurobond issue", icon: "📈", share: 0.7, rate: worldRate() + 2 + spread * 1.2, years: 10, note: `Sell bonds to international investors. Your ${mon().rating} rating sets the price.`, approve: 0.95 });
    if (y >= 2000 && G.nations.china && G.ck !== "china" && getRel(G.ck, "china") >= 5) add({ k: "china", name: "China Exim Bank & Chinese contractors", icon: "🇨🇳", share: 0.85, rate: 2.5, years: 20,
        note: "Fast and few questions asked. Chinese firms build it (fewer local jobs), and if you default the asset can be taken.", approve: 0.9, time: 0.8, jobs: 0.4, collateral: true, strings: { rel: { china: 8 } } });
    if (y >= 1985 && ["port", "railway", "highway", "dam"].includes(p.type)) add({ k: "ppp", name: "Private concession (build–operate–transfer)", icon: "🤝", share: 0.5, rate: 8, years: 25, note: "A consortium builds and runs it for 30 years, paid by tolls and guaranteed tariffs.", approve: clamp(0.3 + G.s.stability / 150 + (mon().score - 40) / 100, 0.05, 0.9), strings: { p: { business: 3, people: -3 } } });
    const dias = typeof diasporaShare === "function" ? diasporaShare() : 0;
    if ((G.ck === "israel" && y >= 1951) || dias > 0.01 || (G.ck === "india" && y >= 1991)) add({ k: "diaspora", name: "Diaspora bonds", icon: "🌍", share: clamp(G.ck === "israel" ? 0.3 : dias * 6, 0.05, 0.3), rate: 3, years: 10, note: "Citizens abroad buy bonds out of patriotism.", approve: 0.95, strings: { p: { people: 2 } } });
    return out;
}

function megaToggle(id, k) {
    const p = mega().list.find(x => x.id === id);
    if (!p || p.stage !== "financing") return;
    p.pick = p.pick || {};
    p.pick[k] = !p.pick[k];
}
function megaTreasury(id, f) { const p = mega().list.find(x => x.id === id); if (p) p.useCash = clamp(+f, 0, 1); }

// The plan: picked offers in order, then treasury cash, then domestic bonds for the rest.
function megaPlan(p) {
    const cost = p.cost, offers = megaOffers(p).filter(o => p.pick && p.pick[o.k]);
    let left = cost;
    const parts = offers.map(o => { const x = Math.min(left, cost * o.share); left -= x; return Object.assign({}, o, { amt: x }); });
    const cash = Math.min(left, tre().cash * (p.useCash || 0)); left -= cash;
    const domRate = mon().avgRate + 1;
    return { parts, cash, dom: Math.max(0, left), domRate, cost };
}

function megaSign(id) {
    const p = mega().list.find(x => x.id === id);
    if (!p || p.stage !== "financing") return;
    if (G.capital < 5) return toast("Not enough political capital", "Signing the financing costs 5.");
    G.capital -= 5;
    const plan = megaPlan(p), declined = [];
    let dom = plan.dom;
    const src = [];
    plan.parts.forEach(o => {
        if (chance(o.approve)) { src.push({ k: o.k, name: o.name, amt: o.amt, rate: o.rate, years: o.years, conc: !!o.conc, floating: !!o.floating, collateral: !!o.collateral, cold: o.cold || null, jobs: o.jobs, tech: o.tech || 0 }); if (o.strings) applyEffects(o.strings); }
        else { declined.push(o.name); dom += o.amt; }
    });
    if (plan.cash > 0) { tre().cash -= plan.cash; book("out", "projects", plan.cash); ledger(p.name, -plan.cash); src.push({ k: "treasury", name: "Treasury", amt: plan.cash, rate: 0, years: 0, paid: true }); }
    if (dom > 0) src.push({ k: "domestic", name: "Domestic bonds", amt: dom, rate: plan.domRate, years: 10 });
    p.src = src;
    const tf = src.reduce((s, x) => s + (x.k === "china" ? 0.8 * x.amt : x.k === "ibrd" && p.type === "dam" ? 1.15 * x.amt : x.amt), 0) / Math.max(1e-9, p.cost);
    p.weeks = Math.round(p.weeks * tf);
    p.stage = "building"; p.start = G.t; p.done = 0; p.spent = 0; p.events = [];
    p.jobsMult = src.reduce((s, x) => s + (x.jobs || 1) * x.amt, 0) / p.cost;
    src.forEach(x => { if (x.tech) G.dev.tech += x.tech; });
    addJobs(jobsFor(p.cost * 0.15, "machinery") * p.jobsMult, true);
    if (G.regions[p.region]) G.regions[p.region].mod += 4;
    log(`🏗️ Ground broken on the ${p.name}! Financing: ${src.map(x => `${x.name} ${nominal(x.amt)}`).join(", ")}.${declined.length ? ` Turned down: ${declined.join(", ")} (covered by domestic bonds).` : ""}`, "major");
    record(`Broke ground on the ${p.name}, ${G.year}.`);
    if (declined.length) toast("Some lenders said no", `${declined.join(", ")} declined. Domestic bonds cover the gap.`);
    const T = MEGA_TYPES[p.type];
    if (T.protest && chance(T.protest)) queueScene("mega_protest", { id: p.id });
    const rival = megaRival(p.type);
    if (rival) { addRel(G.ck, rival, -20); log(`⚠️ ${nationName(rival)} protests: the ${p.name} threatens its water. Relations sour.`, "bad"); }
}

// ── Weekly construction ─────────────────────────────────────────────
function megaWeek() {
    const m = mega();
    m.list.forEach(p => {
        if (p.stage === "study" && G.t >= p.until) {
            p.stage = "financing"; p.cost = G.econ.gdp * p.est / 100; p.pick = {}; p.useCash = 0.5;
            log(`📐 Feasibility study done: the ${p.name} would cost about ${nominal(p.cost)} (${fmt(p.est, 1)}% of GDP) and take ${Math.round(p.weeks / 52)} years. Time to find the money (🏗️ Megaprojects tab).`, "major");
            toast("Feasibility study complete", `${p.name}: ${nominal(p.cost)}. Open the Megaprojects tab to arrange financing.`);
        }
        if (p.stage !== "building") return;
        const halted = G.s.stability < 25 || playerWars().some(w => commitOf(w) >= 3);
        if (halted) { p.halted = true; return; }
        p.halted = false;
        const step = p.cost / p.weeks;
        p.done = Math.min(p.cost, p.done + step); p.spent += step;
        // Money flows as work proceeds: loans and domestic bonds become debt.
        p.src.forEach(x => {
            if (x.paid) return;
            const w = step * x.amt / p.cost;
            G.econ.debt += w;
            if (x.conc && typeof credAdd === "function") credAdd(x.k, w);
            else { const L = m.loans.find(l => l.k === x.k && l.pid === p.id); if (L) L.bn += w; else m.loans.push({ k: x.k, pid: p.id, name: x.name, bn: w, rate: x.rate, years: x.years, floating: x.floating }); }
            if (G.money) G.money.reserves += x.k !== "domestic" ? w * 0.5 : 0;   // foreign loans bring dollars
        });
        if (p.done >= p.cost - 1e-9) megaOpen(p);
    });
    // Special-rate loans: floating rates follow the world; principal slowly becomes ordinary debt.
    m.loans.forEach(l => { if (l.floating) l.rate = worldRate() + 1.5 + ratingSpread(); l.bn *= 1 - 1 / Math.max(1, l.years * 52); });
    m.loans = m.loans.filter(l => l.bn > 1e-6);
}

function megaMonthly() {
    mega().list.filter(p => p.stage === "building" && !p.halted).forEach(p => {
        const corr = G.s.corruption / 50;
        if (chance(0.03 * corr)) megaEvent(p, "overrun");
        else if (chance(0.016 * (1.6 - G.econ.taxCap))) megaEvent(p, "delay");
        else if (G.s.corruption > 50 && chance(0.02)) megaEvent(p, "scandal");
        // A superpower walks away if you switch sides (Aswan, 1956).
        p.src.forEach(x => {
            if (x.cold === "west" && G.align < -25 && !x.pulled) { x.pulled = true; megaEvent(p, "pullout", x); }
            if (x.cold === "east" && G.align > 40 && !x.pulled) { x.pulled = true; megaEvent(p, "pullout", x); }
        });
    });
    // Collateral: default and lenders take the asset.
    if (G.flags.defaulted_year === G.year) mega().list.filter(p => p.src && p.src.some(x => x.collateral) && !p.seized && (p.stage === "done" || p.stage === "building")).forEach(p => {
        p.seized = true;
        applyEffects({ prestige: -8, legitimacy: -5, p: { people: -5 } });
        log(`🔒 After the default, creditors take control of the ${p.name} under the loan's collateral terms. Its income now flows abroad.`, "bad");
    });
}

function megaEvent(p, kind, x) {
    const left = p.cost - p.done;
    if (kind === "overrun") {
        const add = p.cost * rnd(0.12, 0.3);
        p.cost += add; p.src.push({ k: "domestic", name: "Domestic bonds (overrun)", amt: add, rate: mon().avgRate + 1, years: 10 });
        p.events.push(`${dateStr()}: cost overrun +${nominal(add)}`);
        log(`💸 The ${p.name} is over budget by ${nominal(add)}. Domestic bonds cover it.`, "bad");
    } else if (kind === "delay") {
        const w = Math.round(p.weeks * rnd(0.08, 0.2)); p.weeks += w;
        p.events.push(`${dateStr()}: delayed ${Math.round(w / 4.3)} months`);
        log(`⏳ Engineering problems delay the ${p.name} by ${Math.round(w / 4.3)} months.`, "bad");
    } else if (kind === "scandal") {
        const add = p.cost * 0.1; p.cost += add; p.src.push({ k: "domestic", name: "Domestic bonds (stolen funds)", amt: add, rate: mon().avgRate + 1, years: 10 });
        applyEffects({ scandal: 8, legitimacy: -3 });
        p.events.push(`${dateStr()}: kickback scandal`);
        log(`🕵️ Kickbacks on the ${p.name}: contractors and officials skimmed ${nominal(add)}. The press is on it.`, "bad");
    } else if (kind === "pullout") {
        const share = x.amt / p.cost, gone = left * share;
        x.amt -= gone; p.src.push({ k: "domestic", name: `Domestic bonds (replacing ${x.name})`, amt: gone, rate: mon().avgRate + 1, years: 10 });
        p.events.push(`${dateStr()}: ${x.name} pulled out`);
        applyEffects({ prestige: -2 });
        log(`🚪 ${x.name} withdraws from the ${p.name} over your foreign policy. You must find ${nominal(gone)} yourself.`, "major");
        toast("A lender pulls out", `${x.name} walks away from the ${p.name}. Domestic bonds fill the gap.`);
    }
}

// ── Opening and payoff ──────────────────────────────────────────────
// How much of the project the country can actually use.
function megaUtil(type) {
    const cap = deliveryCap();
    const f = {
        dam: () => 0.4 + G.dev.ind / 100 * 0.6 + G.dev.urban / 200,
        steel: () => 0.3 + G.dev.lit / 150 + cov("power") / 200,
        port: () => 0.4 + tradeDeals().length * 0.12 + (G.pol.trade === "trade_free" ? 0.2 : 0),
        sez: () => 0.3 + G.s.stability / 150 + G.dev.lit / 200,
        capital: () => 0.8, green: () => 0.5 + cov("irrigation") / 150, univ: () => 0.4 + G.dev.lit / 150,
        nuclear: () => 0.5 + G.dev.uni / 20, railway: () => 0.5 + (indShare("mining") + indShare("agriculture")) / 40, highway: () => 0.5 + G.dev.urban / 150
    }[type];
    return clamp((f ? f() : 0.7) * (0.6 + 0.4 * cap), 0.2, 1);
}

function megaOpen(p) {
    const T = MEGA_TYPES[p.type];
    p.stage = "done"; p.opened = G.year; p.until = G.year + 10; p.util = megaUtil(p.type);
    const u = p.util;
    const fx = {};
    if (T.prestige) fx.prestige = Math.round(T.prestige * (0.5 + u / 2));
    if (T.stability) fx.stability = T.stability;
    if (T.tension) fx.tension = T.tension;
    applyEffects(fx);
    if (T.urban) G.dev.urban = Math.min(100, G.dev.urban + T.urban);
    if (T.techNow) G.dev.tech += T.techNow;
    if (T.steelOut) G.ind.steel.out += G.econ.gdp * T.steelOut * u;
    if (G.regions[p.region]) G.regions[p.region].mod += 8;
    addJobs(jobsFor(p.cost * 0.05, p.type === "steel" ? "steel" : "machinery") * u);
    log(`🎉 The ${p.name} opens! ${u < 0.5 ? "But there isn't yet enough industry and trade to use it fully: critics call it a white elephant." : u > 0.85 ? "It is put to work at once." : "It will take time to use it fully."}`, "major");
    record(`Opened the ${p.name}, ${G.year}.`);
    queueScene("mega_open", { id: p.id });
}

// Lasting effects of finished projects, for the rest of the game's formulas.
function megaFx(key) {
    let s = 0;
    (G.mega ? G.mega.list : []).forEach(p => {
        if (p.stage !== "done") return;
        const T = MEGA_TYPES[p.type], u = (p.seized ? 0.5 : 1) * p.util, live = G.year < p.until;
        if (key === "growth" && T.growth && live) s += T.growth * u;
        if (key === "poverty" && T.poverty) s += T.poverty * u;
        if (key === "health" && T.health) s += T.health * u;
        if (key === "uni" && T.uni) s += T.uni * u;
        if (key === "tech" && T.tech) s += T.tech * u;
        if (key === "odds" && T.odds) s += T.odds * u;
    });
    if (key === "growth") s += megaActive().filter(p => p.stage === "building" && !p.halted).length * 0.15;   // construction spending
    return s;
}
function megaInfra(k) { return (G.mega ? G.mega.list : []).filter(p => p.stage === "done" && MEGA_TYPES[p.type].infra && MEGA_TYPES[p.type].infra[k]).reduce((s, p) => s + MEGA_TYPES[p.type].infra[k] * p.util * (p.seized ? 0.5 : 1), 0); }
function megaInd(k) {
    return (G.mega ? G.mega.list : []).filter(p => p.stage === "done" && G.year < p.until && MEGA_TYPES[p.type].ind).reduce((s, p) => { const I = MEGA_TYPES[p.type].ind; return s + ((I[k] || 0) + (I.all && INDUSTRIES[k].heavy ? I.all : 0)) * p.util; }, 0);
}
// Interest on special-rate loans (% of GDP), and their total.
const megaLoanTotal = () => G.mega ? G.mega.loans.reduce((s, l) => s + l.bn, 0) : 0;
function megaInterest() { return G.mega ? G.mega.loans.reduce((s, l) => s + l.bn * l.rate / 100, 0) / G.econ.gdp * 100 : 0; }

// ── Scenes ──────────────────────────────────────────────────────────
SCENES.mega_protest = a => {
    const p = mega().list.find(x => x.id === a.id);
    if (!p) return S("🏗️", "", "", "", [ch("OK", {}, "")]);
    const r = G.regions[p.region];
    return S("📢", `${dateStr()} · ${r ? r.n : ""}`, `Protests against the ${p.name}`,
        p.type === "dam" ? "Tens of thousands of villagers face resettlement as the reservoir floods their valleys. Activists and the foreign press have arrived." : "Families cleared for the new city are camped outside the ministry, demanding fair compensation.",
        [ch("Pay generous compensation", { stability: 1, p: { people: 3 } }, "", { run: () => { const add = p.cost * 0.05; p.cost += add; p.src.push({ k: "domestic", name: "Domestic bonds (compensation)", amt: add, rate: mon().avgRate + 1, years: 10 }); return `Compensation adds ${nominal(add)} to the bill. The protests fade.`; } }),
         ch("Move them anyway", { liberty: -3, legitimacy: -2, p: { people: -5 }, prestige: -2 }, "The work goes on over their heads."),
         ch("Redesign to flood less land", {}, "", { run: () => { p.weeks += 26; return "Engineers redraw the plans. Six months lost, but goodwill gained."; } })]);
};
SCENES.mega_open = a => {
    const p = mega().list.find(x => x.id === a.id);
    if (!p) return S("🏗️", "", "", "", [ch("OK", {}, "")]);
    const T = MEGA_TYPES[p.type];
    return S(T.icon, `${dateStr()} · Opening day`, `The ${p.name} opens`,
        `Flags, bands and the world's press. ${T.benefit} ${p.util < 0.5 ? "For now, the country can use only part of it." : ""}`,
        [ch("Cut the ribbon yourself", { prestige: 2, p: { people: 3 } }, "A day the nation will remember."),
         ch("Dedicate it to the workers who built it", { p: { labor: 4, people: 2 } }, "The workers cheer.")]);
};

// ── The Megaprojects tab ────────────────────────────────────────────
function viewMega() {
    const m = mega(), act = megaActive();
    const offerRow = (p, o) => {
        const on = p.pick && p.pick[o.k];
        return `<div class="offer ${on ? "on" : ""}"><div><b>${o.icon} ${esc(o.name)}</b> <span class="tiny muted">up to ${Math.round(o.share * 100)}% · ${fmt(o.rate, 1)}%${o.floating ? " floating" : ""} · ${o.years} yrs · approval ~${Math.round(o.approve * 100)}%</span><p class="tiny">${esc(o.note)}${o.strings && o.strings.align ? ` <span class="${o.strings.align > 0 ? "good" : "bad"}">${o.strings.align > 0 ? "Tilts you West." : "Tilts you East."}</span>` : ""}</p></div><button class="mini ${on ? "" : "secondary"}" data-act="megaPick" data-id="${p.id}" data-k="${o.k}">${on ? "✓ In" : "Add"}</button></div>`;
    };
    const cur = act.map(p => {
        const T = MEGA_TYPES[p.type], r = G.regions[p.region];
        let body = "";
        if (p.stage === "study") body = `<p class="small">📐 Feasibility study under way: results in about ${Math.max(1, Math.round((p.until - G.t) / 4.3))} months.</p>`;
        if (p.stage === "financing") {
            const offers = megaOffers(p), plan = megaPlan(p), cold = G.year < 1991 && Math.abs(G.align) < 40 && G.ck !== "usa" && G.ck !== "russia";
            const pctOf = x => Math.round(x / plan.cost * 100);
            body = `<p class="small">Cost: <b>${nominal(p.cost)}</b> (${fmt(p.est, 1)}% of GDP) · about ${Math.round(p.weeks / 52)} years. Pick lenders; your treasury and domestic bonds cover the rest.</p>
                ${offers.map(o => offerRow(p, o)).join("") || "<p class='tiny muted'>No foreign lender will touch it. Join the World Bank, improve relations or your credit rating.</p>"}
                ${cold && !p.bidding ? `<button class="mini" data-act="megaBid" data-id="${p.id}">🎲 Play the superpowers against each other (4 ⚡)</button>` : p.bidding ? `<p class="tiny good">You've set Washington and Moscow bidding: both offers are sweeter.</p>` : ""}
                <div class="budget-row tre-row"><span>Treasury cash to use</span><select data-change="megaCash" data-id="${p.id}">${[0, 0.25, 0.5, 1].map(f => `<option value="${f}" ${p.useCash === f ? "selected" : ""}>${f * 100}% (${moneyFine(tre().cash * f * cpi())})</option>`).join("")}</select></div>
                <div class="fin-bar">${plan.parts.map(o => `<i style="width:${pctOf(o.amt)}%" class="f-loan" title="${esc(o.name)}"></i>`).join("")}<i style="width:${pctOf(plan.cash)}%" class="f-cash" title="Treasury"></i><i style="width:${pctOf(plan.dom)}%" class="f-dom" title="Domestic bonds"></i></div>
                <p class="tiny">${plan.parts.map(o => `${esc(o.name)} ${pctOf(o.amt)}%`).join(" · ")}${plan.cash > 0 ? ` · Treasury ${pctOf(plan.cash)}%` : ""}${plan.dom > 0 ? ` · <span class="warn">Domestic bonds ${pctOf(plan.dom)}% at ${fmt(plan.domRate, 1)}%</span>` : ""}</p>
                <div class="row"><button class="primary" data-act="megaSign" data-id="${p.id}" ${G.capital < 5 ? "disabled" : ""}>Sign and break ground (5 ⚡)</button><button class="mini secondary danger" data-act="megaCancel" data-id="${p.id}">Shelve it</button></div>`;
        }
        if (p.stage === "building") {
            const pct = Math.round(p.done / p.cost * 100), yrs = Math.max(0, (p.weeks - (G.t - p.start)) / 52);
            body = `${meter(`${p.halted ? "⏸️ Work halted (unrest or war)" : "Construction"}`, p.done / p.cost, true, pct + "%")}
                <p class="tiny">${nominal(p.done)} of ${nominal(p.cost)} spent · about ${fmt(yrs, 1)} years to go · expected use when it opens: <b class="${megaUtil(p.type) < 0.5 ? "bad" : "good"}">${Math.round(megaUtil(p.type) * 100)}%</b> <span class="muted">(${UTIL_HINT[p.type]}, and with state capacity)</span></p>
                <p class="tiny">Paid by: ${p.src.map(x => `${esc(x.name)} ${nominal(x.amt)}${x.rate ? ` (${fmt(x.rate, 1)}%)` : ""}`).join(" · ")}</p>
                ${p.events.length ? `<p class="tiny bad">${p.events.slice(-4).map(esc).join(" · ")}</p>` : ""}`;
        }
        return `<div class="mega-card"><h4>${T.icon} ${esc(p.name)} <span class="tiny muted">${esc(r ? r.n : "")}</span></h4>${body}</div>`;
    }).join("");
    const avail = Object.entries(MEGA_TYPES).filter(([k]) => !m.list.some(p => p.type === k && p.stage !== "cancelled") && !(MEGA_NAMES[G.ck] && MEGA_NAMES[G.ck][k] === null)).map(([k, T]) => {
        const lock = megaLock(k), est = G.econ.gdp * T.cost / 100;
        return `<div class="mega-row ${lock ? "locked" : ""}"><div><b>${T.icon} ${esc(megaName(k))}</b> <span class="tiny muted">~${nominal(est)} (${T.cost}% of GDP) · ${T.years} yrs</span><p class="tiny">${esc(T.desc)} ${esc(T.benefit)}</p>${lock ? `<p class="tiny warn">🔒 ${esc(lock)}</p>` : ""}</div>${lock ? "" : `<button class="mini" data-act="megaStudy" data-k="${k}" ${G.capital < 4 || act.length >= 2 ? "disabled" : ""}>Feasibility study (4 ⚡)</button>`}</div>`;
    }).join("");
    const done = m.list.filter(p => p.stage === "done").map(p => `<div class="budget-row tre-row"><span>${MEGA_TYPES[p.type].icon} ${esc(p.name)} <span class="tiny muted">opened ${p.opened}${p.seized ? " · seized by creditors" : ""}</span></span><b class="${p.util < 0.5 ? "bad" : "good"}">${Math.round(p.util * 100)}% used</b></div>`).join("");
    const loans = m.loans.filter(l => l.bn * 1000 * cpi() >= 0.5).map(l => `<div class="budget-row tre-row"><span>${esc(l.name)} <span class="tiny muted">${fmt(l.rate, 1)}%${l.floating ? " floating" : ""}</span></span><b>${nominal(l.bn)}</b></div>`).join("");
    return `<div class="cols2"><div>
        ${panel("Megaprojects under way", cur || "<p class='small muted'>None yet. Pick a project below: a feasibility study firms up the cost, then you find the money.</p>")}
        ${done ? panel("Completed", done + `<p class="tiny muted">Use rises with industry, trade, skills and state capacity. Under 50% is a white elephant.</p>`) : ""}
        ${loans ? panel("Project loans at special rates", loans + `<p class="tiny muted">Concessional loans (World Bank, aid, Soviet credits) are counted with your official debt at low interest.</p>`) : ""}
        </div><div>${panel("The big bets", `<p class="small muted">Nation-defining projects, up to two at a time. Each unlocks as your country develops.</p>${avail || "<p class='muted small'>You've built them all.</p>"}`)}</div></div>`;
}

function megaBid(id) {
    const p = mega().list.find(x => x.id === id);
    if (!p || p.bidding) return;
    if (G.capital < 4) return toast("Not enough political capital", "It costs 4.");
    G.capital -= 4;
    p.bidding = true;
    addRel(G.ck, "usa", -4); addRel(G.ck, "russia", -4);
    applyEffects({ prestige: 2 });
    log(`🎲 You let it be known that Washington and Moscow are both bidding for the ${p.name}. Both sweeten their offers, and both resent you a little.`, "policy");
}
function megaCancel(id) { const p = mega().list.find(x => x.id === id); if (p && p.stage === "financing") { p.stage = "cancelled"; log(`🗄️ The ${p.name} is shelved.`, "policy"); } }
