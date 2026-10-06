// ── IMPACT — every decision says what it moves ──────────────────────
//
// Before a decision we photograph where the country is heading: the target
// of every stat, growth, revenue and spending, each power base, each
// infrastructure line and each industry's growth rate. Afterwards the
// difference becomes "+3"-style chips on the toast and a line in the log,
// and the Office shows what is pushing each line.

// [key, label, target function, lower-is-better, smallest change worth showing, unit]
const IMPACT_STATS = [
    ["health", "Health", () => healthTarget(), false, 0.5, ""],
    ["poverty", "Poverty", () => povertyTarget(), true, 0.5, ""],
    ["crime", "Crime", () => crimeTarget(), true, 0.5, ""],
    ["unemp", "Unemployment", () => unempTarget(), true, 0.1, "%"],
    ["stability", "Stability", () => stabilityTarget(), false, 0.5, ""],
    ["liberty", "Civil liberties", () => libertyTarget(), false, 0.5, ""],
    ["corruption", "Corruption", () => corruptionTarget(), true, 0.5, ""],
    ["legitimacy", "Legitimacy", () => legitimacyTarget(), false, 0.5, ""],
    ["prestige", "Prestige", () => prestigeTarget(), false, 0.5, ""],
    ["lit", "Literacy", () => literacyRate(), false, 0.05, "/yr"],
    ["tech", "Technology", () => techRate(), false, 0.05, "/yr"],
    ["growth", "Growth", () => potentialGrowth(), false, 0.05, "%/yr"],
    ["rev", "Revenue", () => taxBase().total + programRevenue(), false, 0.05, "% GDP"],
    ["spend", "Spending", () => governmentSpend().total, true, 0.05, "% GDP"]
];

// Money with enough precision for small amounts ($bn nominal in).
function moneyFine(bn) { const m = bn * 1000; return Math.abs(m) >= 10 ? money(bn) : Math.abs(m) >= 1 ? `$${fmt(m, 1)}M` : `$${Math.max(1, Math.round(m * 1000))}K`; }
const TAX_LINES = [["income", "Income tax"], ["payroll", "Contributions"], ["corp", "Corporate tax"]];

function impactSnapshot() {
    if (!G || !G.econ || !G.nations) return null;
    const snap = { stats: {}, pillars: {}, infra: {}, ind: {}, taxes: {} };
    try {
        const tb = taxBase(), gdpN = G.econ.gdp * cpi();
        TAX_LINES.forEach(([k]) => { snap.taxes[k] = (tb[k] || 0) / 100 * gdpN; });
        snap.taxes.total = tb.total / 100 * gdpN;
        IMPACT_STATS.forEach(([k, , fn]) => { snap.stats[k] = fn(); });
        Object.keys(G.pillars).forEach(k => { snap.pillars[k] = pillarTarget(k); });
        if (G.infra) Object.keys(INFRA).forEach(k => { snap.infra[k] = infraTarget(k); });
        Object.keys(G.ind).forEach(k => { if (indAvailable(k) && G.ind[k].out > 0) snap.ind[k] = indRate(k); });
    } catch (e) { return null; }
    return snap;
}

function impactDiff(before, why, quiet) {
    if (!before) return [];
    const after = impactSnapshot();
    if (!after) return [];
    const out = [];
    IMPACT_STATS.forEach(([k, label, , lowGood, min, unit]) => {
        const d = after.stats[k] - before.stats[k];
        if (Math.abs(d) < min) return;
        const v = Math.abs(d) >= 1 ? Math.round(d) : Math.round(d * 100) / 100;
        const lab = { lit: "Literacy gain/yr", tech: "Tech progress/yr", growth: "Growth (pts/yr)", rev: "Revenue (% GDP)", spend: "Spending (% GDP)" }[k] || `${label} (trend)`;
        out.push({ label: lab, v, good: lowGood ? d < 0 : d > 0, unit, kind: "stat" });
    });
    const totalN = Math.max(1e-9, after.taxes.total);
    TAX_LINES.forEach(([k, label]) => {
        const d = after.taxes[k] - (before.taxes[k] || 0);
        if (Math.abs(d) >= totalN * 0.0004 && Math.abs(d) * 1000 >= 0.05) out.push({ label: `${label}/yr`, v: (d > 0 ? "+" : "−") + moneyFine(Math.abs(d)), good: d > 0, raw: true, kind: "tax" });
    });
    Object.keys(after.pillars).forEach(k => {
        const d = after.pillars[k] - (before.pillars[k] != null ? before.pillars[k] : after.pillars[k]);
        if (Math.abs(d) >= 1) out.push({ label: `${pillarName(k)} (trend)`, v: Math.round(d), good: d > 0, kind: "pillar" });
    });
    Object.keys(after.infra).forEach(k => {
        const d = after.infra[k] - before.infra[k];
        if (Math.abs(d) >= 0.5) out.push({ label: `${INFRA[k].name} target`, v: Math.round(d), good: d > 0, kind: "infra" });
    });
    Object.keys(after.ind).forEach(k => {
        const d = after.ind[k] - (before.ind[k] != null ? before.ind[k] : after.ind[k]);
        if (Math.abs(d) >= 0.15) out.push({ label: `${INDUSTRIES[k].name} growth`, v: Math.round(d * 10) / 10, good: d > 0, kind: "ind" });
    });
    const order = { tax: 0, stat: 1, infra: 2, ind: 3, pillar: 4 };
    out.sort((a, b) => order[a.kind] - order[b.kind]);
    if (out.length && why && !quiet) log(`📊 ${why}: ${impactText(out)}.`, "policy");
    return out;
}

// "Health +3, Poverty −2 (targets) · Growth +0.2%/yr · Business ▲ +4 · Highways & roads coverage +12"
function impactText(list) {
    return list.map(c => c.raw ? `${c.label} ${c.v}` : `${c.label.replace(" (trend)", "")} ${c.v > 0 ? "+" : "−"}${Math.abs(c.v)}`).join(", ");
}

// Wrap any decision: run it, then report what it moved.
function withImpact(why, fn) {
    const before = impactSnapshot();
    const r = fn();
    const chips = impactDiff(before, why);
    return { r, chips };
}

// ── What is pushing each line (Office panel) ────────────────────────

// Contributions to a stat's target: frameworks, laws, coverage, taxes,
// ministers; the rest is "economy & society".
function statParts(k) {
    const parts = [];
    const usesPolicy = ["stability", "liberty", "corruption", "legitimacy", "unemp"].includes(k);
    if (usesPolicy) POLICY_AREAS.forEach(a => { const o = curOpt(a.key); if (o.fx && o.fx[k]) parts.push([optName(o), o.fx[k]]); });
    Object.keys(G.laws).forEach(lk => { const d = lawDef(lk); if (d && d.fx && d.fx[k] && !d.tax) parts.push([d.name, d.fx[k] * lawMult(lk) * (k === "poverty" && d.fx[k] < 0 ? povertyReach() : 1)]); });
    if (k === "health") { parts.push(["Hospitals coverage", covRel("hospitals") * 4], ["Excise & green taxes", taxHealth()], ["Health minister", minBonus("health") * 1.5]); }
    if (k === "poverty") { parts.push(["Housing coverage", -covRel("housing") * 3], ["Unemployment", (G.econ.unemp - 6) * 0.8], ["Rural roads & irrigation", ruralPoverty()], ["Land reform", G.pol.land === "reform" ? -3 * povertyReach() : 0]); }
    if (k === "crime") { parts.push(["Housing coverage", -covRel("housing") * 1.5], ["Unemployment", G.econ.unemp * 1.2 - 7], ["Interior minister", -minBonus("interior") * 2]); }
    if (k === "stability") { parts.push(["Approval", (approval() - 50) * 0.3], ["Growth", (G.econ.growth - 3) * 1.2], ["Inflation & jobless", -(Math.max(0, G.econ.inflation - 8) * 0.8 + Math.max(0, G.econ.unemp - 8) * 0.8)], ["Poll tax", taxStability()]); }
    if (k === "unemp") parts.push(["Jobs you created", -(G.econ.jobsAdded || 0) * 0.7], ["Growth", -(G.econ.growth - 3) * 0.5]);
    const min = ["lit", "tech", "uni"].includes(k) ? 0.05 : 0.5;
    return parts.filter(([, v]) => Math.abs(v) >= min).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
}

function growthParts() {
    const parts = [["Catching up with the richest", convergence()], ["Laws & national policy", policyFx("growth") * 0.4], ["Stability", (G.s.stability - 50) * 0.03], ["Infrastructure above normal", infraGrowth()], ["Taxes", -taxGrowthDrag()],
        ["Debt", -Math.min(4, Math.max(0, G.econ.debt / G.econ.gdp * 100 - 70) * 0.03)], ["Inflation", -Math.min(4, Math.max(0, G.econ.inflation - 10) * 0.08)], ["Shocks & events", clamp(G.econ.shock, -12, 8)],
        ["Your economics skill & ministers", skill("economics") * 0.1 + minBonus("finance") * 0.15 + minBonus("industry") * 0.1], ["Sanctions", -instGrowthDrag()]];
    return parts.filter(([, v]) => Math.abs(v) >= 0.05).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
}

// Monthly history of the main stats for "+3 in the past year".
function statsMonthly() {
    const s = { health: G.s.health, poverty: G.s.poverty, crime: G.s.crime, unemp: G.econ.unemp, stability: G.s.stability, liberty: G.s.liberty, corruption: G.s.corruption, lit: G.dev.lit, tech: G.dev.tech, growth: G.econ.growth };
    G.statHist = (G.statHist || []).concat([s]).slice(-13);
}
function statChange(k) {
    if (!G.statHist || !G.statHist.length) return 0;
    const now = { health: G.s.health, poverty: G.s.poverty, crime: G.s.crime, unemp: G.econ.unemp, stability: G.s.stability, liberty: G.s.liberty, corruption: G.s.corruption, lit: G.dev.lit, tech: G.dev.tech, growth: G.econ.growth }[k];
    return now - G.statHist[0][k];
}

function viewDrivers() {
    const row = (k, label, val, target, lowGood, parts, unit = "", extra = "") => {
        const ch = statChange(k);
        const chTxt = Math.abs(ch) >= (unit === "%" ? 0.1 : 0.5) ? ` <span class="${(lowGood ? ch < 0 : ch > 0) ? "good" : "bad"}">${ch > 0 ? "+" : ""}${unit === "%" ? fmt(ch, 1) : Math.round(ch)}</span>` : "";
        const head = target != null && Math.abs(target - val) >= (unit === "%" ? 0.2 : 1) ? ` · heading ${target > val ? "up" : "down"} to ${unit === "%" ? fmt(target, 1) : Math.round(target)}${unit}` : "";
        const ps = parts.slice(0, 5).map(([l, v]) => { const good = lowGood ? v < 0 : v > 0; return `${esc(l)} <b class="${good ? "good" : "bad"}">${v > 0 ? "+" : ""}${Math.abs(v) < 1 ? fmt(v, 1) : Math.round(v)}</b>`; }).join(" · ");
        return `<div class="driver"><div class="meter-top"><span>${label}</span><b>${unit === "%" ? fmt(val, 1) : Math.round(val)}${unit}${chTxt}</b></div><p class="tiny muted">${ps || "No big pushes either way."}${head}${extra}</p></div>`;
    };
    const pcTxt = `$${Math.round(gdpPerCapita() * cpi()).toLocaleString("en-US")} a head`;
    return row("health", "⚕️ Health", G.s.health, healthTarget(), false, statParts("health"), "", `<br>Starting point from income (${pcTxt}) and literacy: <b>${Math.round(clamp(healthBase(), 5, 98))}</b>. Growth raises it; the items above add to it.`)
        + row("poverty", "🤲 Poverty", G.s.poverty, povertyTarget(), true, statParts("poverty"), "", `<br>Starting point from income (${pcTxt}): <b>${Math.round(clamp(povertyBase(), 2, 98))}%</b>. Doubling income per head cuts it by about 10 points. ${povertyReach() > 1.05 ? `With so many poor, anti-poverty programs count ${fmt(povertyReach(), 1)}× as much here.` : ""}`)
        + row("crime", "🚔 Crime", G.s.crime, crimeTarget(), true, statParts("crime"))
        + row("unemp", "👷 Unemployment", G.econ.unemp, unempTarget(), true, statParts("unemp"), "%")
        + row("stability", "🏛️ Stability", G.s.stability, stabilityTarget(), false, statParts("stability"))
        + row("liberty", "🗽 Civil liberties", G.s.liberty, libertyTarget(), false, statParts("liberty"))
        + row("corruption", "💰 Corruption", G.s.corruption, corruptionTarget(), true, statParts("corruption"))
        + row("lit", "📚 Literacy", G.dev.lit, null, false, statParts("lit"), "%", ` · rising ${fmt(literacyRate(), 1)} pts/yr${covRel("schools") ? ` (schools coverage ${covRel("schools") > 0 ? "+" : ""}${Math.round(covRel("schools") * 40)}% speed)` : ""}`)
        + row("growth", "📈 Growth", G.econ.growth, potentialGrowth(), false, growthParts(), "%")
        + `<p class="tiny muted">Lines move gradually toward where your laws, budget, projects and conditions are pushing them. Every decision reports its effect in the log (📊) and on its notice.</p>`;
}

// Chips for views (same look as on notices).
function chipsHtml(list, max = 10) { return (list || []).slice(0, max).map(c => `<span class="chg ${c.good ? "good" : "bad"}">${esc(c.label)} ${c.raw ? esc(String(c.v)) : (c.v > 0 ? "+" : "") + c.v}</span>`).join(""); }

// What-if: apply a change, measure, undo.
function impactPreview(apply, undo) {
    const before = impactSnapshot();
    if (!before) return [];
    let out = [];
    try { apply(); out = impactDiff(before, null, true); } finally { undo(); }
    return out;
}
function lawPreview(k, level) {
    const had = G.laws[k], d = lawDef(k), rate = d.tax ? G.budget.rates[d.tax] : null;
    return impactPreview(() => { if (level > 0) G.laws[k] = { level, since: G.t }; else delete G.laws[k]; if (d.tax) G.budget.rates[d.tax] = Math.round(d.max * level * 10) / 10; },
        () => { if (had) G.laws[k] = had; else delete G.laws[k]; if (d.tax) G.budget.rates[d.tax] = rate; });
}
function programPreview(def) {
    return impactPreview(() => { G.customLaws.__preview = { key: "__preview", cat: "society", issue: def.cat, name: def.title, custom: true, cost: def.cost, fx: def.eff, p: def.g, dept: ISSUES[def.cat].dept, region: def.region }; G.laws.__preview = { level: 1, since: G.t }; },
        () => { delete G.customLaws.__preview; delete G.laws.__preview; });
}
function frameworkPreview(area, k) { const was = G.pol[area]; return impactPreview(() => { G.pol[area] = k; }, () => { G.pol[area] = was; }); }
function budgetPreview(d) {
    const b = G.budget, saved = { depts: b.depts, rates: b.rates, capital: b.capital };
    return impactPreview(() => { Object.assign(b, { depts: d.depts, rates: d.rates, capital: d.capital }); }, () => { Object.assign(b, saved); });
}
