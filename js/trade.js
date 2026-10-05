// ── TRADE AGREEMENTS — who sells what to whom ───────────────────────
//
// A trade deal isn't a flat growth bonus. Sector by sector:
// - where you're strong and the partner isn't, you export: that industry
//   grows faster, more so the bigger the partner's market;
// - where they're strong and you're weak, their goods compete with yours:
//   that industry is squeezed and its workers notice;
// - what they make and you don't gets cheaper: a little growth, lower prices;
// - tariffs fall, and so does tariff revenue.
// Your trade policy (protection or free trade) scales all of it, and you can
// shield one sector at the price of smaller export gains.

// Export profiles (% of GDP) for the non-playable countries.
const NPC_TRADE = {
    northkorea: { agriculture: 25, mining: 10, steel: 6 }, eastgermany: { agriculture: 10, machinery: 12, chemicals: 8, steel: 5 },
    taiwan: { agriculture: 30, textiles: 8 }, egypt: { agriculture: 30, textiles: 6, tourism: 2, oil: 2 }, cuba: { agriculture: 30, tourism: 5 },
    vietnam: { agriculture: 40, textiles: 3 }, southvietnam: { agriculture: 40, textiles: 3 }, yugoslavia: { agriculture: 25, machinery: 5, mining: 4, tourism: 2 },
    italy: { agriculture: 20, textiles: 7, machinery: 7, chemicals: 4, autos: 4, tourism: 3 }, poland: { agriculture: 25, mining: 8, steel: 6, shipbuilding: 2 },
    iraq: { agriculture: 20, oil: 25 }, malaya: { agriculture: 25, mining: 10 }, ukraine: { agriculture: 15, steel: 8, machinery: 6 }
};

function tradeProfile(k) {
    const base = Object.assign({}, (COUNTRIES[k] && COUNTRIES[k].econ.inds) || NPC_TRADE[k] || { agriculture: 30, textiles: 3 });
    const n = G.nations[k] || {};
    // Advanced economies pick up new industries as the decades pass.
    if ((n.tech || 0) >= 90 && G.year >= 1960) base.electronics = Math.max(base.electronics || 0, 3);
    if ((n.tech || 0) >= 110 && G.year >= 1975) base.computing = Math.max(base.computing || 0, 2.5);
    if ((n.tech || 0) >= 90 && G.year >= 1960 && !base.autos) base.autos = 1.5;
    if ((n.tech || 0) >= 140 && G.year >= 2015) base.ai = 1.5;
    if (G.year >= 2005 && ["china", "germany", "usa", "denmark"].includes(k)) base.renewables = 2;
    return base;
}

// Farm exports come from land-rich countries, not from wherever farming is a
// big share of a poor economy.
const FOOD_EXPORTERS = ["usa", "canada", "australia", "argentina", "newzealand", "brazil", "uruguay", "southafrica", "thailand", "cuba", "malaya", "ukraine", "russia", "france"];
const FOOD_IMPORTERS = ["japan", "uk", "germany", "switzerland", "israel", "singapore", "saudi", "uae", "norway", "egypt", "southkorea", "taiwan", "italy"];
const agriWeight = k => FOOD_EXPORTERS.includes(k) ? 1.6 : FOOD_IMPORTERS.includes(k) ? 0.25 : 0.6;
const tradeStrength = (k, s, share) => s === "agriculture" ? share * agriWeight(k) : share;

// Work out a deal's terms with partner k. guard = a sector you protect.
function tradeTerms(k, guard) {
    const n = G.nations[k];
    if (!n) return { exports: {}, imports: {}, cheaper: {}, growth: 0, inflation: 0, tariff: 0 };
    const theirs = tradeProfile(k);
    const market = clamp(Math.sqrt(n.gdp / Math.max(0.01, G.econ.gdp)) * 0.6, 0.1, 1.5);
    const pol = { protection: [0.8, 0.5], managed: [0.85, 0.8], trade_free: [1, 1], autarky: [0, 0] }[G.pol.trade] || [0.85, 0.8];
    const ex = {}, im = {}, cheap = {};
    Object.keys(INDUSTRIES).forEach(s => {
        if (!indAvailable(s)) return;
        const mine = tradeStrength(G.ck, s, indShare(s)), their = tradeStrength(k, s, theirs[s] || 0), adv = mine - their;
        if (mine >= 1.5 && adv > 0.5) ex[s] = clamp(adv / 10, 0.1, 1) * market * pol[0];
        else if (their >= 1.5 && adv < -0.5 && mine > 0.3) im[s] = clamp(-adv / 12, 0.05, 0.8) * clamp(market * 0.8, 0.1, 1.2) * pol[1];
        else if (their >= 2 && mine <= 0.3) cheap[s] = 1;
    });
    const top = (o, n2) => Object.fromEntries(Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n2).map(([s, v]) => [s, Math.round(v * 100) / 100]));
    const exports = top(ex, 3), imports = top(im, 3), cheaper = top(cheap, 3);
    if (guard && imports[guard] != null) { delete imports[guard]; Object.keys(exports).forEach(s => { exports[s] = Math.round(exports[s] * 0.75 * 100) / 100; }); }
    const nc = Object.keys(cheaper).length;
    return { exports, imports, cheaper, guard: guard || null, growth: Math.round(nc * 0.06 * pol[1] * 100) / 100, inflation: -Math.round(nc * 0.08 * pol[1] * 100) / 100, tariff: Math.round(market * 0.06 * 100) / 100 };
}

const tradeDeals = () => (G.treaties || []).filter(t => t.type === "trade" && G.nations[t.with]);
function refreshTrade() { tradeDeals().forEach(t => { t.terms = tradeTerms(t.with, t.terms ? t.terms.guard : null); }); }
const dealTerms = t => t.terms || (t.terms = tradeTerms(t.with));

// Effects, summed over every deal in force.
function tradeIndEffect(k) { return clamp(tradeDeals().reduce((s, t) => { const x = dealTerms(t); return s + (x.exports[k] || 0) - (x.imports[k] || 0); }, 0), -2, 2.5); }
function tradeGrowth() { return Math.min(0.4, tradeDeals().reduce((s, t) => s + dealTerms(t).growth, 0)); }
function tradeInflation() { return Math.max(-0.8, tradeDeals().reduce((s, t) => s + dealTerms(t).inflation, 0)); }
function tradeTariffMult() { return clamp(1 - tradeDeals().reduce((s, t) => s + dealTerms(t).tariff, 0), 0.4, 1); }
function tradePillar(pk) {
    if (pk !== "labor" && pk !== "business" && pk !== "peasants") return 0;
    let ex = 0, im = 0;
    tradeDeals().forEach(t => { const x = dealTerms(t); Object.entries(x.exports).forEach(([s, v]) => { ex += v; }); Object.entries(x.imports).forEach(([s, v]) => { im += v * (s === "agriculture" ? 0 : 1); if (s === "agriculture" && pk === "peasants") im += v * 3; }); });
    if (pk === "business") return Math.min(6, ex * 2);
    if (pk === "labor") return -Math.min(8, im * 4);
    return -Math.min(6, im);
}

function termsText(x, partner) {
    const nm = s => `${INDUSTRIES[s].icon} ${INDUSTRIES[s].name}`;
    const e = Object.entries(x.exports).map(([s, v]) => `${nm(s)} +${fmt(v, 2)}%/yr`).join(", ");
    const i = Object.entries(x.imports).map(([s, v]) => `${nm(s)} −${fmt(v, 2)}%/yr`).join(", ");
    const c = Object.keys(x.cheaper).map(nm).join(", ");
    return [
        e ? `You sell ${partner}: ${e}.` : `Little you make sells in ${partner}.`,
        i ? `${partner} competes with you: ${i}.` : "",
        c ? `Cheaper imports of ${c} (growth +${fmt(x.growth, 2)}, inflation ${fmt(x.inflation, 2)}).` : "",
        `Tariff revenue −${Math.round(x.tariff * 100)}%.`,
        x.guard ? `${nm(x.guard)} is protected by a safeguard clause.` : ""
    ].filter(Boolean).join(" ");
}

// Signed from the trade_deal scene, which shows the knock-on effects itself.
function signTrade(k, guard, offered) {
    const t = { type: "trade", with: k, t: G.t };
    t.terms = tradeTerms(k, guard);
    G.treaties.push(t);
    addRel(G.ck, k, offered ? 10 : 8);
    log(`🚢 Trade agreement with ${nationName(k)}. ${termsText(t.terms, nationName(k))}`, "major");
    record(`Signed a trade agreement with ${nationName(k)}, ${G.year}.`);
    return `Signed. Business welcomes the new markets${Object.keys(t.terms.imports).length ? "; the unions in the exposed industries do not" : ""}.`;
}

function cancelTrade(k) {
    const i = G.treaties.findIndex(t => t.type === "trade" && t.with === k);
    if (i < 0) return;
    const before = impactSnapshot();
    G.treaties.splice(i, 1);
    addRel(G.ck, k, -12);
    const ch = impactDiff(before, `Ending the trade agreement with ${nationName(k)}`);
    log(`✂️ You tear up the trade agreement with ${nationName(k)}.`, "major");
    toast("Trade agreement cancelled", nationName(k), ch);
}

SCENES.trade_deal = a => {
    const n = G.nations[a.who];
    if (!n) return S("🚢", "", "", "", [ch("OK", {}, "")]);
    const full = tradeTerms(a.who), worst = Object.entries(full.imports).sort((x, y) => y[1] - x[1])[0];
    const safe = worst ? tradeTerms(a.who, worst[0]) : null;
    return S("🚢", `${n.flag} ${dateStr()} · Trade talks`, `${a.offered ? `${n.name} proposes` : "Negotiating"} a trade agreement`,
        `Your negotiators have the draft. ${termsText(full, n.name)}`,
        [ch("Sign the full agreement", { p: { business: 2 } }, "", { run: () => signTrade(a.who, null, a.offered) }),
         ch(worst ? `Sign, but protect ${INDUSTRIES[worst[0]].name.toLowerCase()}` : "Sign with a safeguard clause", { p: { business: 2 } }, "", { req: !!worst, hint: safe ? `Exports gain 25% less. ${INDUSTRIES[worst[0]].name} faces no new competition.` : "", run: () => signTrade(a.who, worst[0], a.offered) }),
         ch("Walk away", a.offered ? { rel: { [a.who]: -3 } } : {}, "No deal.")]);
};

// Economy tab: your deals and what they do.
function tradePanel() {
    const deals = tradeDeals();
    if (!deals.length) return panel("Trade agreements", `<p class="small muted">No trade agreements yet. Sign them from the World tab (relations of +20 needed). Each deal is worked out sector by sector: what you can sell them, what of theirs competes with you, what gets cheaper.</p>`);
    const rows = deals.map(t => { const x = dealTerms(t), n = G.nations[t.with]; return `<div class="trade-deal"><b>${n.flag} ${esc(n.name)}</b> <span class="tiny muted">since ${dateOf(t.t).getFullYear()}</span> <button class="mini secondary danger" data-act="tradeCancel" data-k="${t.with}">End it</button><p class="tiny">${esc(termsText(x, n.name))}</p></div>`; }).join("");
    const sums = {};
    Object.keys(INDUSTRIES).forEach(s => { const v = tradeIndEffect(s); if (Math.abs(v) >= 0.05) sums[s] = v; });
    const tot = Object.entries(sums).sort((a, b) => b[1] - a[1]).map(([s, v]) => `<span class="chg ${v > 0 ? "good" : "bad"}">${INDUSTRIES[s].icon} ${INDUSTRIES[s].name} ${v > 0 ? "+" : ""}${fmt(v, 2)}%/yr</span>`).join("");
    return panel("Trade agreements", `${tot ? `<p class="tiny"><b>Net effect on your industries:</b> ${tot}</p>` : ""}${rows}<p class="tiny muted">Terms are recalculated each January as economies change. Your trade policy (${optName(curOpt("trade"))}) scales the gains and the competition.</p>`);
}
