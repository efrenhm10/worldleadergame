// ── EXPORTS: FROM RAW TO REFINED ────────────────────────────────────
//
// A country that sells green coffee beans keeps a sliver of what the
// world pays for a cup. Each export good climbs a value chain:
//   raw commodity → processed goods (roasted coffee, leather, refined
//   metal, garments) → branded and luxury goods (single-origin coffee,
//   designer bags, fine chocolate, jewellery).
// Processing needs plants (state-owned or joint ventures with foreign
// firms); branding needs processing first, plus design talent, quality
// standards, culture and markets. Raw commodity prices swing hard; value
// added cushions the blows.

// [name, icon, raw sector, processing sector, processed ×value, branded ×value, raw / processed / branded names]
const GOODS = {
    coffee: ["Coffee", "☕", "agriculture", "textiles", 2.5, 7, "green coffee beans", "roasted & packaged coffee", "specialty single-origin coffee brands"],
    tea: ["Tea", "🍵", "agriculture", "textiles", 2, 5, "bulk tea leaf", "blended & packaged tea", "premium estate teas"],
    cocoa: ["Cocoa", "🍫", "agriculture", "textiles", 2.2, 8, "cocoa beans", "cocoa butter & powder", "fine chocolate"],
    cotton: ["Cotton", "🧵", "agriculture", "textiles", 2.5, 8, "raw cotton", "yarn, cloth & garments", "fashion labels"],
    leather: ["Hides & leather", "👜", "agriculture", "textiles", 2.5, 9, "raw hides & skins", "finished leather & shoes", "luxury leather goods"],
    wool: ["Wool", "🐑", "agriculture", "textiles", 2.2, 6, "greasy wool", "woollen cloth & carpets", "luxury knitwear & carpets"],
    sugar: ["Sugar", "🍬", "agriculture", "textiles", 2, 5, "raw cane sugar", "refined sugar & rum", "premium spirits"],
    beef: ["Beef", "🥩", "agriculture", "textiles", 1.8, 4, "live cattle", "packed & frozen beef", "premium steak brands"],
    dairy: ["Dairy", "🧀", "agriculture", "textiles", 2, 4.5, "milk", "butter, cheese & milk powder", "premium dairy brands"],
    wine: ["Wine", "🍷", "agriculture", "textiles", 2.5, 8, "grapes", "bulk wine", "fine wine labels"],
    fruit: ["Fruit & flowers", "🌸", "agriculture", "textiles", 1.8, 4, "bulk fruit", "packed fresh fruit, juice & cut flowers", "premium branded produce"],
    rubber: ["Rubber", "🌳", "agriculture", "chemicals", 2, 4, "raw latex", "tyres & gloves", "branded rubber products"],
    fish: ["Fish", "🐟", "agriculture", "textiles", 2, 4.5, "whole fish", "frozen & canned fish", "premium seafood brands"],
    timber: ["Timber", "🪵", "agriculture", "textiles", 2, 6, "logs", "sawn timber & furniture", "design furniture"],
    oil: ["Oil", "🛢️", "oil", "chemicals", 1.8, 3.5, "crude oil", "refined fuels & petrochemicals", "plastics & specialty chemicals"],
    ore: ["Metal ores", "⛏️", "mining", "steel", 2, 4, "ores & concentrates", "refined metals", "cables, parts & machinery"],
    gems: ["Gold & diamonds", "💎", "mining", "textiles", 1.5, 5, "rough gold & diamonds", "cut & polished stones", "jewellery brands"]
};
// Export goods by country: share of GDP in 1950 (raw value). [good, % of GDP, from year]
const EXPORT_GOODS = {
    ethiopia: [["coffee", 8], ["leather", 3], ["fruit", 0.3, 1995]], brazil: [["coffee", 5], ["sugar", 2], ["cotton", 1], ["ore", 1], ["beef", 1]],
    india: [["tea", 2], ["cotton", 3], ["gems", 0.5], ["leather", 1]], pakistan: [["cotton", 4], ["leather", 1]], nigeria: [["cocoa", 3], ["oil", 0, 1958], ["leather", 1]],
    indonesia: [["rubber", 3], ["oil", 2], ["coffee", 1], ["tea", 0.5]], southafrica: [["gems", 6], ["wool", 1], ["wine", 0.5], ["fruit", 0.5]], argentina: [["beef", 4], ["wool", 1], ["wine", 1], ["leather", 1]],
    australia: [["wool", 5], ["beef", 1.5], ["ore", 1], ["wine", 0.3]], newzealand: [["wool", 5], ["dairy", 5], ["beef", 1]], uruguay: [["beef", 4], ["wool", 4], ["leather", 1]],
    saudi: [["oil", 30]], uae: [["oil", 0, 1962]], iran: [["oil", 12], ["wool", 1]], venezuela: [["oil", 20], ["coffee", 0.5]], mexico: [["oil", 2], ["cotton", 1], ["coffee", 1], ["fruit", 0.5]],
    philippines: [["sugar", 2], ["fruit", 1], ["timber", 1]], cambodia: [["rubber", 2], ["timber", 0.5]], fiji: [["sugar", 8]], barbados: [["sugar", 10]], turkey: [["cotton", 2], ["fruit", 1]],
    china: [["tea", 1], ["cotton", 2]], norway: [["fish", 3], ["timber", 1], ["oil", 0, 1971]], canada: [["timber", 3], ["ore", 2], ["oil", 0.5]], russia: [["timber", 1], ["oil", 1], ["ore", 1]],
    israel: [["fruit", 2], ["gems", 0.5]], singapore: [["rubber", 1]], usa: [["cotton", 0.5], ["beef", 0.3]], france: [["wine", 2]], uk: [["wool", 0.2]], japan: [["fish", 0.5]], germany: [], switzerland: [],
    southkorea: [["fish", 0.5]]
};

function exState() {
    if (!G.ex) {
        const base = clamp(0.05 + G.dev.ind / 100 * 0.8, 0.02, 0.85);
        G.ex = { goods: {}, quality: 0, plants: [] };
        (EXPORT_GOODS[G.ck] || []).forEach(([k, pct, from]) => {
            const S = GOODS[k][2], sec = G.ind[S] ? G.ind[S].out / G.econ.gdp * 100 : 0;
            G.ex.goods[k] = { frac: sec > 0 ? Math.min(0.9, (pct || 1) / sec) : 0.3, from: from || 1950, p1: base, p2: G.dev.tech > 70 ? base * 0.25 : 0, price: 1, brands: 0 };
            if (k === "wine" && G.ck === "france") G.ex.goods[k].p2 = 0.5;
            if (k === "oil") G.ex.goods[k].frac = 0.8;
        });
    }
    return G.ex;
}
const exGoods = () => Object.entries(exState().goods).filter(([, g]) => G.year >= g.from);
const rawValue = k => { const g = exState().goods[k], S = GOODS[k][2]; return G.ind[S] ? G.ind[S].out * g.frac * (k === "oil" ? G.oilPrice : g.price) : 0; };
const valueMult = (k, g = exState().goods[k]) => 1 + g.p1 * (GOODS[k][4] - 1) + g.p2 * (GOODS[k][5] - GOODS[k][4]);
const exportValue = k => rawValue(k) * valueMult(k);
const captured = k => valueMult(k) / GOODS[k][5];

// How far branding can go: design talent, quality, culture, royal favour, rich markets.
function brandCap() {
    const design = typeof cultureFx === "function" ? cultureFx("design") : 0;
    const q = lawOn("quality_standards") ? lawMult("quality_standards") : 0;
    const cult = typeof cultureScore === "function" ? cultureScore() / 400 : 0;
    const royal = G.culture && G.culture.warrants ? 0.1 : 0;
    const rich = tradeDeals().filter(t => G.nations[t.with] && nationPc(G.nations[t.with]) > gdpPerCapita() * 2).length * 0.03;
    const fairs = typeof cultureFx === "function" ? cultureFx("brand") : 0;
    return clamp(0.12 + design * 0.25 + q * 0.15 + cult + royal + rich + fairs, 0, 0.75);
}

// Add processing (or branding) capacity and the value it creates.
function addValue(k, dp1, dp2, why) {
    const g = exState().goods[k], G0 = GOODS[k];
    const was = valueMult(k);
    g.p1 = clamp(g.p1 + (dp1 || 0), 0, 0.92);
    g.p2 = clamp(g.p2 + (dp2 || 0), 0, g.p1 * brandCap());
    const add = rawValue(k) * (valueMult(k) - was);
    if (add <= 0) return 0;
    const ind = G.ind[G0[3]];
    ind.out += add * (dp2 ? 0.7 : 1);
    if (dp2) G.econ.services += add * 0.3;
    if (ind.out0 === 0) ind.out0 = add;
    addJobs(jobsFor(add, G0[3]));
    if (why) log(`${G0[1]} ${why}: ${nominal(add)} a year of new value from ${G0[0].toLowerCase()}.`, "good");
    return add;
}

// State-owned plants and joint ventures (built over two years).
function exPlant(k, kind) {
    const g = exState().goods[k];
    if (!g) return;
    if (G.ex.plants.some(p => p.k === k && !p.done)) return toast("Already building", "A plant for this good is under construction.");
    if (g.p1 >= 0.9) return toast("Fully processed", "Almost all of it is already processed at home.");
    const jv = kind === "jv";
    if (jv && G.pol.trade === "autarky") return toast("No partners", "Foreign firms won't invest under autarky.");
    const cost = Math.max(G.econ.gdp * 0.001, rawValue(k) * (jv ? 0.3 : 0.6));
    if (G.capital < 3) return toast("Not enough political capital", "It costs 3.");
    G.capital -= 3;
    G.ex.plants.push({ k, kind, cost, spent: 0, weeks: 104, done: false, start: G.t });
    log(`🏭 ${jv ? "A joint venture with a foreign processor" : "A state-owned plant"} to process ${GOODS[k][0].toLowerCase()} is under construction (${nominal(cost)}).`, "policy");
}
function exBrand(k) {
    const g = exState().goods[k];
    if (!g || g.p1 < 0.15) return toast("Process it first", "You can't brand what you only export raw. Build processing first.");
    if (g.p2 >= g.p1 * brandCap() - 0.005) return toast("Brand at its limit", "Raise the ceiling: design schools, quality standards, culture, fashion weeks, royal warrants, trade deals with rich markets.");
    const cost = Math.max(G.econ.gdp * 0.0008, rawValue(k) * 0.25);
    if (G.capital < 3) return toast("Not enough political capital", "It costs 3.");
    G.capital -= 3;
    treasuryPay(cost);
    g.brands++;
    const add = addValue(k, 0, 0.06, `National brand campaign for ${GOODS[k][8]}`);
    applyEffects({ prestige: 1 });
    toast("Brand launched", `${GOODS[k][1]} ${GOODS[k][8]}: +${nominal(add)} a year.`);
}

function exWeek() {
    if (!G.ex) return;
    G.ex.plants.forEach(p => {
        if (p.done) return;
        const step = p.cost / p.weeks;
        treasuryPay(step); p.spent += step;
        if (p.spent >= p.cost - 1e-9) {
            p.done = true;
            const eff = p.kind === "jv" ? 1 : clamp(1 - G.s.corruption / 120, 0.4, 1);
            addValue(p.k, (p.kind === "jv" ? 0.1 : 0.14) * eff, 0, p.kind === "jv" ? "Joint-venture processing plant opens" : `State processing plant opens${eff < 0.7 ? " (badly run: patronage hires and missing parts)" : ""}`);
            if (p.kind === "jv") G.dev.tech += 0.5;
        }
    });
}

// Commodity prices: swings, plus the famous booms and busts.
const PRICE_SHOCKS = { coffee: { 1954: 0.6, 1977: 1, 1980: -0.4, 1989: -0.45, 2001: -0.4, 2011: 0.5, 2014: -0.3 }, cocoa: { 1977: 0.8, 1980: -0.4, 2016: -0.3 }, sugar: { 1974: 1.5, 1975: -0.6, 1980: 0.8, 1981: -0.5 }, wool: { 1951: 1, 1952: -0.5 }, ore: { 1974: 0.4, 1975: -0.3, 2005: 0.8, 2011: 0.3, 2013: -0.3 }, gems: { 1980: 0.6, 1981: -0.4 }, beef: { 1973: 0.4, 1974: -0.3 } };
function exMonthly() {
    if (!G.ex) return;
    let shock = 0;
    exGoods().forEach(([k, g]) => {
        if (k === "oil") return;
        const was = g.price;
        g.price = clamp(g.price * (1 + gauss() * 0.03) + (1 - g.price) * 0.02, 0.3, 4);
        const s = PRICE_SHOCKS[k] && PRICE_SHOCKS[k][G.year];
        if (s && G.month === 3 && !(g.shocked === G.year)) { g.shocked = G.year; g.price = clamp(g.price * (1 + s), 0.3, 4); log(`${GOODS[k][1]} World ${GOODS[k][0].toLowerCase()} prices ${s > 0 ? "soar" : "collapse"} (${s > 0 ? "+" : ""}${Math.round(s * 100)}%).`, s > 0 ? "good" : "bad"); }
        // Raw exporters feel the swing; processed and branded goods much less.
        const rawShare = rawValue(k) / g.price / G.econ.gdp * (1 - g.p1 * 0.6);
        shock += rawShare * (g.price - was) * 30;
    });
    G.econ.shock += clamp(shock, -3, 3);
}
// Balance of payments boost from export prices (% of GDP).
function exportsCA() { return G.ex ? exGoods().reduce((s, [k, g]) => k === "oil" ? s : s + rawValue(k) / g.price / G.econ.gdp * 100 * (g.price - 1) * 0.5, 0) : 0; }

// A new processor arrives: private firms lift processing too.
function exportsOnFirm(f) {
    if (!G.ex || !f) return;
    const k = exGoods().filter(([gk]) => GOODS[gk][3] === f.sector).sort((a, b) => rawValue(b[0]) - rawValue(a[0]))[0];
    if (k && k[1].p1 < 0.9) addValue(k[0], 0.03, 0);
}

// ── The Exports & Jobs tab panel ────────────────────────────────────
function exportsPanel() {
    const list = exGoods();
    if (!list.length) return panel("Exports: from raw to refined", "<p class='small muted'>Your exports are manufactured goods and services; there's no big commodity to add value to. Trade agreements on the World tab set which industries sell abroad.</p>");
    const tot = list.reduce((s, [k]) => s + exportValue(k), 0), raw = list.reduce((s, [k]) => s + rawValue(k), 0);
    const p1v = list.reduce((s, [k, g]) => s + rawValue(k) * g.p1 * (GOODS[k][4] - 1), 0), p2v = Math.max(0, tot - raw - p1v);
    const cap = brandCap();
    const rows = list.sort((a, b) => exportValue(b[0]) - exportValue(a[0])).map(([k, g]) => {
        const G0 = GOODS[k], seg = (w, cls, t) => `<i style="width:${Math.max(0, w * 100)}%" class="${cls}" title="${esc(t)}"></i>`;
        const building = G.ex.plants.find(p => p.k === k && !p.done);
        const pr = k === "oil" ? G.oilPrice : g.price;
        return `<div class="ex-row"><div class="row" style="justify-content:space-between"><b>${G0[1]} ${esc(G0[0])}</b><span class="tiny">${nominal(exportValue(k))}/yr · price <b class="${pr >= 1.1 ? "good" : pr <= 0.9 ? "bad" : ""}">${pr >= 1 ? "▲" : "▼"} ${Math.round(pr * 100)}</b></span></div>
            <div class="fin-bar">${seg(1 - g.p1, "f-raw", `Exported raw: ${G0[6]}`)}${seg(g.p1 - g.p2, "f-proc", `Processed: ${G0[7]}`)}${seg(g.p2, "f-brand", `Branded: ${G0[8]}`)}</div>
            <p class="tiny">Raw ${Math.round((1 - g.p1) * 100)}% (${esc(G0[6])}) · processed ${Math.round((g.p1 - g.p2) * 100)}% (${esc(G0[7])}) · branded ${Math.round(g.p2 * 100)}% (${esc(G0[8])}). You keep <b>${Math.round(captured(k) * 100)}%</b> of the final value.</p>
            ${building ? meter(`🏗️ ${building.kind === "jv" ? "Joint venture" : "State plant"}`, building.spent / building.cost, true, Math.round(building.spent / building.cost * 100) + "%") : `<div class="row"><button class="mini" data-act="exPlant" data-k="${k}" data-x="state" ${G.capital < 3 || g.p1 >= 0.9 ? "disabled" : ""}>🏭 State plant (~${nominal(Math.max(G.econ.gdp * 0.001, rawValue(k) * 0.6))})</button><button class="mini secondary" data-act="exPlant" data-k="${k}" data-x="jv" ${G.capital < 3 || g.p1 >= 0.9 ? "disabled" : ""}>🤝 Joint venture (~${nominal(Math.max(G.econ.gdp * 0.001, rawValue(k) * 0.3))})</button><button class="mini secondary" data-act="exBrand" data-k="${k}" ${G.capital < 3 || g.p1 < 0.15 || g.p2 >= g.p1 * cap - 0.005 ? "disabled" : ""} title="${g.p1 < 0.15 ? "Process at least 15% first" : ""}">✨ Brand campaign</button></div>`}</div>`;
    }).join("");
    return panel("Exports: from raw to refined", `
        <div class="budget"><div><small>Commodity exports</small><b>${nominal(tot)}</b><span class="tiny muted">a year</span></div><div><small>Value added at home</small><b>${Math.round((tot - raw) / Math.max(1e-9, tot) * 100)}%</b></div><div><small>Branding ceiling</small><b>${Math.round(cap * 100)}%</b><span class="tiny muted">of processed</span></div></div>
        ${rows}
        <p class="tiny muted">🟫 raw · 🟦 processed · 🟪 branded. State plants employ more but run worse where corruption is high; joint ventures are cheaper and bring know-how. Branding needs processing first, then design schools, quality standards, culture, fashion weeks${G.gov.type === "monarchy" ? ", royal warrants" : ""} and trade deals with rich markets.</p>
        <div class="row"><button class="mini secondary" data-act="lawGo" data-k="quality_standards">Quality standards agency</button></div>`);
}
