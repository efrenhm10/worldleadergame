// ── MONEY & THE CURRENCY ────────────────────────────────────────────
//
// - Interest rates: set by you, or by an independent central bank that
//   follows its own rule. Real rates (rate minus inflation) cool or heat
//   inflation and growth, pull capital in or push it out, and set what new
//   debt costs.
// - The exchange rate: pegged (the norm under Bretton Woods until 1971),
//   managed, or floating. Inflation above the world's makes a pegged
//   currency overvalued: exports suffer and reserves drain until you
//   devalue or the market forces you to.
// - Foreign reserves and the balance of payments: trade, oil, remittances,
//   aid and capital flows fill or empty them.
// - A credit rating, from AAA to D, that prices your borrowing.

const CURRENCIES = {
    usa: ["US dollar", "$", 1], china: ["yuan", "¥", 2.46], russia: ["ruble", "₽", 4], india: ["rupee", "₹", 4.76], uk: ["pound sterling", "£", 0.357],
    france: ["franc", "₣", 350], germany: ["Deutsche Mark", "DM", 4.2], japan: ["yen", "¥", 360], brazil: ["cruzeiro", "Cr$", 18.7], canada: ["Canadian dollar", "C$", 1.1],
    australia: ["Australian pound", "A£", 0.446], southkorea: ["hwan", "₩", 60], mexico: ["peso", "Mex$", 8.65], indonesia: ["rupiah", "Rp", 11.4], turkey: ["lira", "₺", 2.8],
    saudi: ["riyal", "SR", 3.75], nigeria: ["West African pound", "£", 0.357], southafrica: ["South African pound", "£", 0.357], argentina: ["peso", "m$n", 14], iran: ["rial", "﷼", 32],
    israel: ["Israeli pound", "I£", 0.357], pakistan: ["rupee", "Rs", 3.31], philippines: ["peso", "₱", 2], ethiopia: ["Ethiopian dollar", "Br", 2.48], venezuela: ["bolívar", "Bs", 3.35],
    norway: ["krone", "kr", 7.14], switzerland: ["franc", "Fr", 4.37], fiji: ["Fijian pound", "F£", 0.4], newzealand: ["New Zealand pound", "NZ£", 0.357], barbados: ["BWI dollar", "BWI$", 1.71],
    singapore: ["Malayan dollar", "M$", 3.06], uae: ["Gulf rupee", "Rs", 4.76], cambodia: ["riel", "៛", 35], uruguay: ["peso", "$U", 1.9]
};
const currency = () => CURRENCIES[G.ck] || ["national currency", "", 1];
const RESERVE_CURRENCY = ["usa", "uk", "switzerland"];

// World inflation, roughly, for exchange-rate drift.
function worldInflation() { const y = G.year; return y < 1971 ? 2.5 : y < 1983 ? 8 : y < 2001 ? 3.5 : y >= 2021 && y <= 2023 ? 6 : 2.5; }
const importShare = () => clamp(0.22 - 0.06 * Math.log10(Math.max(0.1, G.econ.gdp)), 0.05, 0.35);

const FX_REGIMES = {
    peg: { name: "Fixed peg to the dollar", desc: "A stable currency that traders trust, defended with reserves. If your inflation outruns the world's, it becomes overvalued." },
    managed: { name: "Managed / crawling peg", desc: "The central bank lets the currency slide gradually to keep exports competitive." },
    float: { name: "Free float", desc: "The market sets the rate. No reserves needed to defend it, but it can swing hard." }
};

function mon() {
    if (!G.money) {
        const c = currency(), poor = gdpPerCapita() < frontierPC() * 0.25;
        G.money = { rate: 3.5, avgRate: 3, independent: false, regime: G.ck === "usa" ? "float" : "peg", fx: c[2], fxEq: c[2], fx0: c[2], controls: poor || C().preset === "communist",
            reserves: G.econ.gdp * importShare() * (G.res.includes("oil") ? 6 : poor ? 3 : 4) / 12, ca: 0, cap: 0, score: 50, rating: "BBB", crisisT: -999, hist: [] };
        G.money.score = ratingParts().reduce((s, [, v]) => s + v, 50);
        G.money.rating = ratingOf(G.money.score)[1];
    }
    return G.money;
}

const realRate = () => mon().rate - G.econ.inflation;
// Positive = undervalued (cheap currency, competitive exports); negative = overvalued.
const misalign = () => { const m = mon(); return G.ck === "usa" ? 0 : clamp(m.fx / m.fxEq - 1, -0.6, 0.6); };
const reserveMonths = () => mon().reserves / Math.max(0.0001, G.econ.gdp * importShare() / 12);

// The rule an independent central bank follows (a Taylor rule).
function taylorRate() { const e = G.econ; return clamp(e.inflation + 1 + 0.5 * (e.inflation - 3) + 0.4 * (e.growth - potentialGrowthBase()), 0.25, 25); }
function potentialGrowthBase() { return 2.2 + convergence(); }

// ── Effects on the rest of the economy ──────────────────────────────
function moneyInflation() {
    const m = mon();
    let t = -clamp((realRate() - 0.5) * 0.35, -4, 6);
    t += Math.max(0, misalign()) * 4;           // a cheap currency imports inflation
    if (m.independent) t -= 1;                  // credibility
    return t;
}
function moneyGrowth() {
    const m = mon();
    let g = -clamp((realRate() - 0.5) * 0.15, -1, 2);
    g += clamp(misalign(), -0.4, 0.3) * 1.5;    // export competitiveness
    if (m.controls) g -= 0.2;
    if (m.independent) g += 0.1;
    if (reserveMonths() < 1 && m.regime !== "float") g -= 1;
    return g;
}
// Interest on the debt, % of GDP: concessional loans at 1.5%, the rest at your market rate.
function debtInterest() {
    const e = G.econ, m = mon();
    const official = G.treasury ? Object.values(G.treasury.cred || {}).reduce((s, v) => s + v, 0) : 0;
    const market = Math.max(0, Math.min(e.debt, e.gdp * 2.5) - official - (typeof megaLoanTotal === "function" ? megaLoanTotal() : 0));
    return (market * m.avgRate / 100 + Math.min(official, e.debt) * 0.015) / e.gdp * 100;
}

// ── Credit rating ───────────────────────────────────────────────────
const RATINGS = [[85, "AAA", 0.2], [75, "AA", 0.5], [65, "A", 1], [55, "BBB", 1.8], [45, "BB", 3], [35, "B", 4.5], [22, "CCC", 7], [10, "CC", 10], [-999, "D", 15]];
function ratingParts() {
    const e = G.econ, ratio = clamp(gdpPerCapita() / Math.max(1, frontierPC()), 0, 1), dp = e.debt / e.gdp * 100;
    const parts = [
        ["Debt", -Math.min(35, dp * 0.35 * (1.3 - ratio))],
        ["Wealth", ratio * 25 - (1 - ratio) * 10],
        ["Low debt", dp < 30 ? 8 : 0],
        ["Reserves", Math.min(15, reserveMonths() * 2)],
        ["Tax collection", e.taxCap * 10],
        ["Corruption", -(G.s.corruption - 30) * 0.3],
        ["Inflation", -Math.max(0, e.inflation - 5) * 1.5],
        ["Stability", G.s.stability < 40 ? -15 : 0],
        ["War", playerWars().length ? -10 : 0],
        ["Past default", G.flags.defaulted_year && G.year - G.flags.defaulted_year < 10 ? -30 : 0],
        ["Reserve currency", RESERVE_CURRENCY.includes(G.ck) ? 15 : 0],
        ["IMF program on track", G.inst && G.inst.program ? 5 : 0]
    ];
    return parts.filter(([, v]) => Math.abs(v) >= 0.5);
}
function ratingOf(score) { return RATINGS.find(([t]) => score >= t); }
const ratingSpread = () => ratingOf(mon().score)[2];

// ── Weekly ──────────────────────────────────────────────────────────
function moneyWeek() {
    const m = mon(), e = G.econ;
    if (m.independent) m.rate += (taylorRate() - m.rate) * 0.05;
    // Debt rolls over slowly at today's price.
    m.avgRate += (1 + 0.6 * m.rate + ratingSpread() - m.avgRate) * 0.002;
    // Equilibrium rate drifts with inflation relative to the world's.
    if (G.ck !== "usa") m.fxEq *= 1 + (e.inflation - worldInflation()) / 100 / 52;
    const mis = misalign(), oilShare = indValue("oil") / e.gdp;
    // Balance of payments, % of GDP a year.
    let ca = mis * 8 - Math.max(0, e.deficit - 3) * 0.3 - Math.max(0, e.growth - 5) * 0.2;
    // Net oil exporters gain when prices rise; everyone else pays.
    ca += oilShare > 0.08 && G.ck !== "usa" ? oilShare * (G.oilPrice - 1) * 25 : -(G.oilPrice - 1) * 1.5 * importShare() / 0.15 * (1 - oilShare / 0.08);
    if (typeof diasporaShare === "function") ca += Math.min(5, diasporaShare() * 100 * 0.3);
    let cap = (realRate() - 0.5) * 0.15 + (m.score - 50) * 0.02 - (G.s.stability < 35 ? 1.5 : 0) - (m.regime === "peg" && mis < -0.15 ? 1.5 : 0);
    if (m.controls) cap = cap > 0 ? cap * 0.5 : Math.max(cap, -0.3);
    m.ca = ca; m.cap = cap;
    const flow = e.gdp * (ca + cap) / 100 / 52;
    if (G.ck === "usa") { m.fx = 1; m.fxEq = 1; m.reserves = Math.max(0, m.reserves + flow * 0.1); }
    else if (m.regime === "float") {
        m.reserves = Math.max(0, m.reserves + flow * 0.1);
        m.fx += (m.fxEq * (1 - (ca + cap) * 0.02) - m.fx) * 0.05;
    } else {
        m.reserves = Math.max(0, m.reserves + flow);
        if (m.regime === "managed") m.fx += (m.fxEq - m.fx) * 0.3 / 52;
    }
    // Reserves hold their real value only loosely.
    m.reserves *= 1 - Math.max(0, worldInflation() - 2) / 100 / 52;
    m.score += (ratingParts().reduce((s, [, v]) => s + v, 50) - m.score) * 0.02;
    m.rating = ratingOf(m.score)[1];
    // A run on a pegged currency.
    if (m.regime !== "float" && G.ck !== "usa" && reserveMonths() < 1.5 && G.t - m.crisisT > 104 && !G.scenes.some(s => s.id === "fx_crisis")) { m.crisisT = G.t; queueScene("fx_crisis", {}); }
    if (m.regime !== "float" && G.ck !== "usa" && m.reserves <= 0.0001) { devalue(0.4, true); m.regime = "managed"; }
}

function moneyYearly() {
    const m = mon();
    m.hist.push({ y: G.year, fx: m.fx, rate: Math.round(m.rate * 10) / 10, rating: m.rating, res: reserveMonths() });
    if (m.hist.length > 80) m.hist.shift();
    if (G.year === 1971 && m.regime === "peg" && G.ck !== "usa") log("💵 The Nixon shock: the dollar is no longer convertible to gold, and the Bretton Woods system of fixed exchange rates is breaking up. Floating is now an ordinary choice.", "major");
}

// ── Player actions ──────────────────────────────────────────────────
function devalue(x, forced) {
    const m = mon(), c = currency(), was = m.fx;
    m.fx *= 1 + x;
    G.econ.inflation += x * 100 * importShare() * 0.8;
    if (!forced) applyEffects({ prestige: -1, p: { people: -2, business: 1 } });
    else applyEffects({ prestige: -4, stability: -4, p: { people: -5, business: -5 } });
    log(`💱 ${forced ? "The reserves are gone: the market forces a" : "You order a"} ${Math.round(x * 100)}% devaluation of the ${c[0]}. A dollar now buys ${fmtFx(m.fx)} instead of ${fmtFx(was)}. Exports get cheaper abroad; imports and prices rise at home.`, forced ? "bad" : "policy");
}
function fmtFx(v) { const c = currency(); return `${c[1]}${v >= 100 ? Math.round(v).toLocaleString("en-US") : fmt(v, v >= 10 ? 1 : 2)}`; }

function setRate(v) { const m = mon(); if (m.independent) return; m.rate = clamp(+v, 0, 40); }
function setRegime(k) {
    const m = mon();
    if (!FX_REGIMES[k] || m.regime === k || G.ck === "usa") return;
    if (G.capital < 4) return toast("Not enough political capital", "Changing the exchange-rate regime costs 4.");
    G.capital -= 4;
    if (k === "peg") { m.fxEq = Math.max(m.fxEq, m.fx); m.fx = Math.max(m.fx, m.fxEq); }
    m.regime = k;
    log(`💱 New exchange-rate regime: ${FX_REGIMES[k].name.toLowerCase()}.`, "policy");
}
function toggleIndependence() {
    const m = mon(), cost = m.independent ? 8 : 5;
    if (G.capital < cost) return toast("Not enough political capital", `It costs ${cost}.`);
    G.capital -= cost;
    m.independent = !m.independent;
    if (m.independent) { applyEffects({ p: { business: 4 }, prestige: 1 }); log("🏦 The central bank becomes independent. Interest rates are now set by its governor, to keep inflation down.", "policy"); }
    else { applyEffects({ p: { business: -6 }, legitimacy: -2 }); log("🏦 You bring the central bank back under the finance ministry. Markets take note.", "policy"); }
}
function toggleControls() {
    const m = mon();
    if (G.capital < 3) return toast("Not enough political capital", "It costs 3.");
    G.capital -= 3;
    m.controls = !m.controls;
    applyEffects(m.controls ? { p: { business: -4 } } : { p: { business: 3 } });
    log(m.controls ? "🛃 Capital controls: moving money abroad now needs permission." : "🛃 Capital controls lifted: money moves freely in and out.", "policy");
}

SCENES.fx_crisis = () => {
    const c = currency();
    return S("💱", `${dateStr()} · Central bank`, `A run on the ${c[0]}`,
        `Reserves are down to ${fmt(reserveMonths(), 1)} months of imports and traders are betting on a devaluation. The governor needs a decision.`,
        [ch("Devalue by 30% now", {}, "", { run: () => { devalue(0.3); return "The pressure eases as exporters regain their edge."; } }),
         ch("Let it float", {}, "", { run: () => { mon().regime = "float"; return "The currency finds its own level, and the reserves stop draining."; } }),
         ch("Call in the IMF", {}, "", { run: () => { mon().reserves += G.econ.gdp * 0.03; return imfFromEvent(); } }),
         ch("Impose capital controls and ration dollars", { growth: -1, p: { business: -6 } }, "", { run: () => { mon().controls = true; mon().reserves += G.econ.gdp * 0.005; return "Queues form at the banks, but the peg holds for now."; } })]);
};

// ── Finance tab panel ───────────────────────────────────────────────
function moneyPanel() {
    const m = mon(), c = currency(), e = G.econ, mis = misalign(), usa = G.ck === "usa";
    const rr = realRate(), r = ratingOf(m.score);
    const fxRow = usa ? `<p class="tiny">The dollar is the world's anchor currency${G.year < 1971 ? ", convertible to gold for foreign central banks" : ""}.</p>` :
        `<div class="budget"><div><small>1 US dollar</small><b>${fmtFx(m.fx)}</b><span class="tiny muted">${fmtFx(m.fx0)} in 1950</span></div><div><small>Valuation</small><b class="${Math.abs(mis) < 0.08 ? "" : mis < 0 ? "bad" : "good"}">${Math.abs(mis) < 0.03 ? "fair" : `${Math.round(Math.abs(mis) * 100)}% ${mis < 0 ? "over" : "under"}`}</b><span class="tiny muted">${mis < -0.07 ? "exports suffer" : mis > 0.07 ? "exports cheap abroad, prices rise" : "about right"}</span></div><div><small>Reserves</small><b class="${reserveMonths() < 2 ? "bad" : ""}">${nominal(m.reserves)}</b><span class="tiny muted">${fmt(reserveMonths(), 1)} months of imports</span></div></div>`;
    const regimes = usa ? "" : `<div class="row">${Object.entries(FX_REGIMES).map(([k, x]) => `<button class="mini ${m.regime === k ? "" : "secondary"}" data-act="fxRegime" data-k="${k}" title="${esc(x.desc)}" ${m.regime === k ? "disabled" : ""}>${esc(x.name)}${m.regime === k ? " ✓" : ""}</button>`).join("")}</div>
        ${m.regime !== "float" ? `<div class="row"><span class="tiny">Devalue:</span>${[0.1, 0.25, 0.5].map(x => `<button class="mini secondary" data-act="devalue" data-x="${x}">${x * 100}%</button>`).join("")}</div>` : ""}`;
    return panel(`The ${c[0]} & the central bank`, `
        <div class="standing"><div class="st-rank rating-${r[1].replace(/\W/g, "")}">${r[1]}</div><div><b>Credit rating</b><div class="tiny muted">New borrowing costs about ${fmt(1 + 0.6 * m.rate + r[2], 1)}% a year. ${ratingParts().sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).slice(0, 4).map(([l, v]) => `${l} <b class="${v > 0 ? "good" : "bad"}">${v > 0 ? "+" : ""}${Math.round(v)}</b>`).join(" · ")}</div></div></div>
        <h4>Interest rates</h4>
        <div class="budget-row tre-row"><span>Central bank rate ${m.independent ? `<span class="tiny muted">(set by the independent governor)</span>` : ""}</span><b>${fmt(m.rate, 1)}%</b></div>
        ${m.independent ? "" : `<input type="range" min="0" max="25" step="0.25" value="${fmt(m.rate, 2)}" data-change="rate" style="width:100%">`}
        <p class="tiny">Real rate (after inflation): <b class="${rr < -2 ? "bad" : rr > 5 ? "warn" : ""}">${fmt(rr, 1)}%</b>. ${rr < -1 ? "Cheap money: faster growth now, higher inflation, money flows abroad." : rr > 4 ? "Tight money: inflation falls, but growth and jobs suffer; foreign money flows in." : "About neutral."} Average rate on your debt: ${fmt(m.avgRate, 1)}%.</p>
        <div class="row"><button class="mini secondary" data-act="cbIndep">${m.independent ? "Take back control of rates (8 ⚡)" : "Make the central bank independent (5 ⚡)"}</button></div>
        <h4>Exchange rate</h4>${fxRow}${regimes}
        <h4>Balance of payments <span class="tiny muted">(% of GDP a year)</span></h4>
        <div class="budget-row tre-row"><span>Trade & income (current account)</span><b class="${m.ca >= 0 ? "good" : "bad"}">${m.ca >= 0 ? "+" : ""}${fmt(m.ca, 1)}%</b></div>
        <div class="budget-row tre-row"><span>Investment & capital flows</span><b class="${m.cap >= 0 ? "good" : "bad"}">${m.cap >= 0 ? "+" : ""}${fmt(m.cap, 1)}%</b></div>
        <div class="row"><button class="mini secondary" data-act="capControls">${m.controls ? "Lift capital controls (3 ⚡)" : "Impose capital controls (3 ⚡)"}</button></div>
        <p class="tiny muted">${m.controls ? "Capital controls are on: money can't flee, but foreign investors are wary. " : ""}${m.regime === "peg" && !usa ? "A peg holds only while reserves last; inflation above the world's slowly overvalues it. " : ""}Oil prices, remittances, aid and your budget deficit all move the balance.</p>`);
}
