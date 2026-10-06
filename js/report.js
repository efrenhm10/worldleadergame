// ── THE STATE OF THE NATION — a yearly report ───────────────────────
//
// Every January: what changed over the past year, why, what happened, what
// your advisers recommend, and how you compare with what really happened
// to your country.

// What really happened (approximate): life expectancy and literacy in
// 1950/1970/1990/2010, and real income per person vs 1950 in 1970/1990/2010.
const HIST_REAL = {
    usa: [[68, 71, 75, 78], [97, 99, 99, 99], [1.6, 2.4, 3.2]], china: [[41, 58, 69, 75], [20, 53, 78, 95], [1.7, 4, 17]], russia: [[57, 68, 69, 69], [90, 99, 99, 99], [2.4, 2.8, 3.4]],
    india: [[36, 48, 58, 66], [18, 34, 48, 69], [1.4, 2.1, 5.4]], uk: [[69, 72, 76, 80], [98, 99, 99, 99], [1.7, 2.5, 3.4]], france: [[67, 72, 77, 81], [96, 99, 99, 99], [2.4, 3.4, 4.1]],
    germany: [[67, 71, 75, 80], [99, 99, 99, 99], [2.9, 4.3, 5.5]], japan: [[60, 72, 79, 83], [97, 99, 99, 99], [5.5, 9.4, 11.5]], brazil: [[48, 59, 66, 73], [49, 67, 81, 90], [2, 3, 3.8]],
    canada: [[69, 72, 77, 81], [97, 99, 99, 99], [1.9, 2.6, 3.2]], australia: [[69, 71, 77, 82], [97, 99, 99, 99], [1.7, 2.3, 3.3]], southkorea: [[41, 62, 72, 80], [30, 88, 96, 99], [2.2, 9, 22]],
    mexico: [[49, 61, 70, 75], [57, 74, 88, 93], [1.8, 2.6, 3.1]], indonesia: [[38, 52, 62, 70], [20, 56, 82, 93], [1.4, 2.7, 5]], turkey: [[42, 54, 64, 75], [33, 52, 78, 93], [1.9, 3.1, 5.1]],
    saudi: [[40, 52, 69, 74], [5, 15, 71, 94], [6, 6, 7.5]], nigeria: [[36, 41, 46, 51], [10, 20, 48, 58], [1.4, 1.3, 2.1]], southafrica: [[45, 53, 62, 56], [45, 60, 81, 93], [1.5, 1.5, 1.9]],
    argentina: [[61, 66, 71, 75], [87, 93, 96, 98], [1.5, 1.4, 2.2]], iran: [[40, 51, 64, 74], [15, 29, 63, 85], [2.8, 2.2, 3.5]], israel: [[69, 71, 76, 81], [90, 88, 95, 97], [2.8, 4, 5.5]],
    pakistan: [[38, 51, 59, 65], [16, 21, 35, 55], [1.4, 2.2, 2.8]], philippines: [[47, 58, 64, 69], [60, 83, 93, 96], [1.6, 1.7, 2.4]], ethiopia: [[33, 43, 47, 61], [5, 8, 28, 39], [1.5, 1.4, 2.6]],
    venezuela: [[51, 64, 71, 74], [50, 77, 89, 95], [1.6, 1.4, 1.5]], norway: [[72, 74, 77, 81], [99, 99, 99, 99], [2, 3.6, 4.9]], switzerland: [[70, 73, 77, 82], [99, 99, 99, 99], [1.8, 2.1, 2.5]],
    fiji: [[52, 60, 65, 68], [50, 75, 88, 94], [1.5, 2, 2.4]], newzealand: [[69, 71, 75, 81], [98, 99, 99, 99], [1.4, 1.6, 2.1]], barbados: [[55, 68, 73, 75], [90, 98, 99, 99], [2, 3.2, 3.6]],
    singapore: [[60, 68, 76, 82], [50, 70, 89, 96], [2.3, 6.6, 13]], uae: [[45, 61, 72, 77], [10, 30, 71, 93], [10, 8, 6]], cambodia: [[39, 42, 54, 67], [30, 40, 65, 78], [1.3, 0.9, 2.3]],
    uruguay: [[66, 69, 73, 77], [92, 94, 96, 98], [1.2, 1.5, 2.4]]
};
// Interpolate a value for the given year from points at the given years.
function interp(ys, vs, y) {
    if (y <= ys[0]) return vs[0];
    for (let i = 1; i < ys.length; i++) if (y <= ys[i]) return vs[i - 1] + (vs[i] - vs[i - 1]) * (y - ys[i - 1]) / (ys[i] - ys[i - 1]);
    return vs[vs.length - 1];
}
function realHistory(y) {
    const h = HIST_REAL[G.ck];
    if (!h) return null;
    return { le: interp([1950, 1970, 1990, 2010], h[0], y), lit: interp([1950, 1970, 1990, 2010], h[1], y), inc: interp([1950, 1970, 1990, 2010], [1].concat(h[2]), y) };
}

function yearSnap() {
    const me = typeof myStanding === "function" ? myStanding() : null;
    return { y: G.year, pc: gdpPerCapita(), pcN: gdpPerCapita() * cpi(), gdp: G.econ.gdp * cpi(), pop: G.econ.pop, poverty: G.s.poverty, health: G.s.health, life: 30 + G.s.health * 0.5,
        lit: G.dev.lit, urban: G.dev.urban, ind: G.dev.ind, tech: G.dev.tech, unemp: G.econ.unemp, inflation: G.econ.inflation, debt: G.econ.debt / G.econ.gdp * 100,
        stability: G.s.stability, approval: approval(), crime: G.s.crime, corruption: G.s.corruption, rank: me ? me.rank : null, cash: G.treasury ? G.treasury.cash * cpi() : 0,
        rating: G.money ? G.money.rating : "", cap: G.econ.taxCap * 100, unrest: G.idn ? Object.values(G.idn).filter(x => x.str >= 25).length : 0 };
}

function annualReport() {
    G.annual = G.annual || [];
    const cur = yearSnap(), prev = G.annual[G.annual.length - 1];
    G.annual.push(cur);
    if (G.annual.length > 80) G.annual.shift();
    if (!prev) return;
    const y = prev.y, rep = buildReport(prev, cur, y);
    G.reports = G.reports || [];
    G.reports.push(rep);
    if (G.reports.length > 80) G.reports.shift();
    if (!G.over && !G.pendingSuccession) queueScene("sotn", { y });
}

function buildReport(a, b, y) {
    const inc = (b.pc / a.pc - 1) * 100;
    const score = inc * 1.2 - (b.poverty - a.poverty) * 0.6 + (b.health - a.health) * 0.6 + (b.lit - a.lit) * 0.3 + (b.stability - a.stability) * 0.15 + (b.approval - a.approval) * 0.08 - Math.max(0, b.inflation - 10) * 0.2 - b.unrest * 0.8;
    const grade = score > 4 ? ["an excellent year", "🌟"] : score > 1.5 ? ["a good year", "👍"] : score > -0.5 ? ["a mixed year", "⚖️"] : score > -3 ? ["a hard year", "⚠️"] : ["a bad year", "📉"];
    const row = (label, k, unit, lowGood, dec = 0) => [label, a[k], b[k], unit, lowGood, dec];
    const rows = [
        row("Income per person (1950 $)", "pc", "$", false), row("Population", "pop", "M", false, 1), row("Poverty", "poverty", "%", true), row("Life expectancy", "life", " yrs", false),
        row("Literacy", "lit", "%", false), row("Cities", "urban", "%", false), row("Industrialization", "ind", "", false, 1), row("Technology", "tech", "", false),
        row("Unemployment", "unemp", "%", true, 1), row("Inflation", "inflation", "%", true, 1), row("Debt (% of GDP)", "debt", "%", true), row("Tax collection", "cap", "%", false),
        row("Stability", "stability", "", false), row("Approval", "approval", "%", false), row("Crime", "crime", "", true), row("Corruption", "corruption", "", true)
    ];
    if (a.rank && b.rank) rows.push(["World power rank", a.rank, b.rank, "#", true, 0]);
    // Why: the biggest pushes on growth and poverty right now.
    const why = [];
    try {
        growthParts().sort((p, q) => Math.abs(q[1]) - Math.abs(p[1])).slice(0, 3).forEach(([l, v]) => why.push(`📈 Growth ${v > 0 ? "lifted" : "held back"} by ${l.toLowerCase()} (${v > 0 ? "+" : ""}${fmt(v, 1)} pts)`));
        statParts("poverty").slice(0, 2).forEach(([l, v]) => why.push(`🤲 Poverty ${v < 0 ? "cut" : "raised"} by ${l.toLowerCase()} (${v > 0 ? "+" : ""}${fmt(v, 1)})`));
        const popR = G.econ.popR || 0;
        if (popR > 2 && inc < 2) why.push(`👥 Population grew ${fmt(popR, 1)}% a year, eating most of the economy's growth`);
    } catch (e) { /* drivers unavailable */ }
    const events = G.log.filter(l => l.type === "major" && dateOf(l.t).getFullYear() === y).slice(0, 7).map(l => l.text);
    const first = (G.annual && G.annual[0]) || a;
    return { y, grade, score, rows, why, events, advice: reportAdvice(), hist: realHistory(y + 1), hist0: realHistory(first.y), life0: first.life, pcStart: G.ref ? G.ref.pc : null, inc };
}

// Concrete next steps from the weakest spots.
function reportAdvice() {
    const out = [], e = G.econ, m = G.money;
    if (e.taxCap < 0.5) out.push("🏛️ Build state capacity: a revenue authority, merit civil service and ID cards (Lawbook → State & administration).");
    if (m && reserveMonths() < 2 && m.regime !== "float") out.push("💱 Reserves are thin: raise interest rates, devalue, or float before the market forces it (Finance tab).");
    if (e.inflation > 10) out.push("🏦 Inflation is high: raise interest rates or make the central bank independent (Finance tab).");
    if (e.debt / e.gdp > 0.7) out.push("💸 Debt is heavy: trim spending or raise taxes before creditors lose patience.");
    if (G.dev.lit < 60 && covRel("schools") < 0.2) out.push("🏫 Literacy is the slowest lever and the most important: build schools and pass primary schooling.");
    if ((e.popR || 0) > 2.3) out.push("👥 Population growth eats your gains: literacy, cities and family planning (from 1960) slow it.");
    if (G.idn) Object.entries(G.idn).filter(([, x]) => x.griev > 55).slice(0, 1).forEach(([n, x]) => out.push(`🏴 The ${x.g} of ${n} are restless (grievance ${Math.round(x.griev)}): consider autonomy or a development fund (Population tab).`));
    if (typeof megaActive === "function" && !megaActive().length && !(G.mega && G.mega.list.some(p => p.stage === "done"))) {
        const ok = Object.keys(MEGA_TYPES).filter(k => !megaLock(k));
        if (ok.length) out.push(`🏗️ You could start a megaproject: the ${megaName(ok[0])} is within reach (Megaprojects tab).`);
    }
    if (!tradeDeals().length && G.pol.trade !== "autarky") out.push("🚢 No trade agreements yet: a deal with a big market lifts your export industries (World tab).");
    try { advisories().slice(0, 2).forEach(t => out.push(t)); } catch (e2) { /* none */ }
    return out.slice(0, 6);
}

SCENES.sotn = a => {
    const r = (G.reports || []).find(x => x.y === a.y);
    if (!r) return S("📜", "", "", "", [ch("OK", {}, "")]);
    const get = l => r.rows.find(x => x[0] === l) || [];
    const pov = get("Poverty"), life = get("Life expectancy"), lit = get("Literacy");
    const others = r.rows.filter(([l]) => !["Income per person (1950 $)", "Poverty", "Life expectancy", "Literacy", "Population"].includes(l) && l)
        .map(([l, x, y2, u, low]) => [l, (y2 - x) / Math.max(1, Math.abs(x)) * (low ? -1 : 1), x, y2, u]).sort((p, q) => Math.abs(q[1]) - Math.abs(p[1]))[0];
    const lines = `Income per person ${r.inc >= 0 ? "rose" : "fell"} ${fmt(Math.abs(r.inc), 1)}%. Poverty ${fmtRep(pov[1], "%")} → ${fmtRep(pov[2], "%")}; life expectancy ${fmtRep(life[1], " yrs")} → ${fmtRep(life[2], " yrs")}; literacy ${fmtRep(lit[1], "%")} → ${fmtRep(lit[2], "%")}.${others ? ` Biggest other change: ${others[0].toLowerCase()} ${fmtRep(others[2], others[4])} → ${fmtRep(others[3], others[4])}.` : ""}`;
    return S(r.grade[1], `January ${r.y + 1} · The State of the Nation`, `${r.y} was ${r.grade[0]}`,
        `${lines} Your advisers have prepared the full report.`,
        [ch("Read the full report", {}, "", { run: () => { view = "report"; ui.reportY = r.y; return ""; } }),
         ch("Later (it's in the Record tab)", {}, "")]);
};

function fmtRep(v, u, dec = 0) {
    if (v == null) return "–";
    if (u === "$") return "$" + Math.round(v).toLocaleString("en-US");
    if (u === "#") return "#" + v;
    if (u === "M") return fmtPeople(v);
    return fmt(v, dec) + u;
}

function viewReport() {
    const reps = G.reports || [];
    if (!reps.length) return panel("The State of the Nation", "<p class='muted'>Your first report arrives next January.</p>");
    const r = reps.find(x => x.y === ui.reportY) || reps[reps.length - 1];
    const rows = r.rows.map(([l, x, y2, u, low, dec]) => {
        const d = y2 - x, good = low ? d < 0 : d > 0, tiny = Math.abs(d) < (dec ? 0.05 : 0.5);
        return `<tr><td>${esc(l)}</td><td>${fmtRep(x, u, dec)}</td><td><b>${fmtRep(y2, u, dec)}</b></td><td class="${tiny ? "muted" : good ? "good" : "bad"}">${tiny ? "–" : `${d > 0 ? "▲" : "▼"} ${u === "$" ? "$" + Math.round(Math.abs(d)) : u === "M" ? fmtPeople(Math.abs(d)) : fmt(Math.abs(d), dec || (Math.abs(d) < 1 ? 1 : 0))}`}</td></tr>`;
    }).join("");
    const last = r.rows;
    const val = l => (last.find(x => x[0] === l) || [])[2];
    const h = r.hist;
    const histHtml = h ? `<table><tr><th></th><th>You</th><th>Real ${esc(C().name)}, ${r.y + 1}</th></tr>
        <tr><td>Life expectancy gained since 1950</td><td><b>${(val("Life expectancy") - r.life0) >= 0 ? "+" : ""}${fmt(val("Life expectancy") - r.life0, 1)} yrs</b></td><td>${r.hist0 ? `${h.le - r.hist0.le >= 0 ? "+" : ""}${fmt(h.le - r.hist0.le, 1)} yrs` : "–"}</td></tr>
        <tr><td>Literacy</td><td><b>${Math.round(val("Literacy"))}%</b></td><td>${Math.round(h.lit)}%</td></tr>
        ${r.pcStart ? `<tr><td>Income vs 1950</td><td><b>×${fmt(val("Income per person (1950 $)") / r.pcStart, 1)}</b></td><td>×${fmt(h.inc, 1)}</td></tr>` : ""}</table>
        <p class="tiny muted">Real figures are approximate (UN, Maddison, UNESCO estimates).</p>` : "";
    const nav = reps.slice(-12).map(x => `<button class="mini ${x.y === r.y ? "" : "secondary"}" data-act="report" data-y="${x.y}">${x.y}</button>`).join("");
    return `<div class="cols2"><div>
        ${panel(`${r.grade[1]} The State of the Nation, ${r.y}`, `<p class="small"><b>${r.y} was ${r.grade[0]}.</b></p><div class="table-wrap"><table><tr><th></th><th>Jan ${r.y}</th><th>Jan ${r.y + 1}</th><th>Change</th></tr>${rows}</table></div><div class="row">${nav}</div>`)}
        </div><div>
        ${h ? panel("How you compare with history", histHtml) : ""}
        ${panel("Why", r.why.length ? r.why.map(t => `<p class="tiny">${esc(t)}</p>`).join("") : "<p class='tiny muted'>No single big driver.</p>")}
        ${r.events.length ? panel("The year's big moments", r.events.map(t => `<p class="cable major tiny">${esc(t)}</p>`).join("")) : ""}
        ${panel("Your advisers recommend", r.advice.map(t => `<p class="advice">${esc(t)}</p>`).join("") || "<p class='muted'>Stay the course.</p>")}
        </div></div>`;
}
