// ── THE TREASURY — the state's cash account ─────────────────────────
//
// Money the government actually holds, separate from the yearly budget:
// - in: development aid, budget surpluses you choose to save, capital money
//   left unspent at the end of the fiscal year, windfalls and asset sales;
// - out: projects you pay for outright (on top of the capital budget),
//   transfers into the capital budget, debt repayments and, if you allow
//   it, deficits.
// Cash above 2% inflation slowly loses value, so hoarding has a cost.
// Amounts are in billions of 1950 dollars, like the rest of the economy.

const TREASURY_IN = { aid: "Development aid", surplus: "Budget surpluses", refund: "Unspent capital money", windfall: "Windfalls & sales" };
const TREASURY_OUT = { projects: "Projects paid outright", capital: "Moved to the capital budget", debt: "Debt repaid", deficit: "Deficits covered", costs: "One-off costs", inflation: "Lost to inflation" };

function tre() {
    if (!G.treasury) G.treasury = { cash: G.econ.gdp * 0.01, surplus: "debt", cover: false, pledges: [], ledger: [], cred: {}, book: { y: G.year, in: {}, out: {} }, last: null };
    const t = G.treasury;
    t.cred = t.cred || {};
    if (t.book.y !== G.year) { t.last = t.book; t.book = { y: G.year, in: {}, out: {} }; }
    return t;
}
const cashNow = () => tre().cash;
function book(dir, k, bn) { const b = tre().book[dir]; b[k] = (b[k] || 0) + bn; }
function ledger(text, bn) { const t = tre(); t.ledger.unshift({ d: dateStr(), text, bn }); if (t.ledger.length > 12) t.ledger.pop(); }

function treasuryAdd(bn, src, text) {
    if (!(bn > 0)) return;
    tre().cash += bn;
    book("in", src, bn);
    if (text) ledger(text, bn);
}

// A one-off bill: from the treasury if you let deficits draw on it, otherwise borrowed.
function treasuryPay(bn) {
    const t = tre();
    if (t.cover && t.cash > 0) { const x = Math.min(t.cash, bn); t.cash -= x; book("out", "costs", x); bn -= x; }
    G.econ.debt += bn;
}

// Each week: the budget balance flows through the treasury.
function treasuryWeek(need) {
    const t = tre(), e = G.econ;
    if (need > 0) {
        if (t.cover && t.cash > 0) { const x = Math.min(t.cash, need); t.cash -= x; book("out", "deficit", x); need -= x; }
        e.debt += need;
    } else if (need < 0) {
        let s = -need;
        if (t.surplus === "debt" && e.debt > 0) { const x = Math.min(e.debt, s); e.debt -= x; s -= x; }
        if (s > 0) { t.cash += s; book("in", "surplus", s); }
    }
    // Official loans are repaid over about 30 years and inflated away like the rest.
    const f = (1 - Math.max(0, e.inflation) / 100 / 52) * (1 - 0.033 / 52);
    let off = 0;
    Object.keys(t.cred).forEach(k => { t.cred[k] *= f; off += t.cred[k]; });
    if (off > e.debt * 0.95) Object.keys(t.cred).forEach(k => { t.cred[k] *= e.debt * 0.95 / off; });
    const ero = t.cash * Math.max(0, e.inflation - 2) / 100 / 52;
    if (ero > 0) { t.cash -= ero; book("out", "inflation", ero); }
}

// ── Development aid ─────────────────────────────────────────────────
// Rich friends pledge aid each January to poorer countries; it arrives in
// monthly tranches. The Marshall Plan and American aid to Japan and Korea
// cover the early 1950s.
const MARSHALL = ["uk", "france", "germany", "italy", "norway", "turkey", "japan", "southkorea", "taiwan"];

function aidPledges() {
    if (G.colony || G.gov.type === "colony") return [];
    const my = G.econ.gdp, ratio = gdpPerCapita() / Math.max(1, frontierPC());
    const out = [];
    if (G.year <= 1952 && MARSHALL.includes(G.ck) && G.ck !== "usa" && getRel(G.ck, "usa") >= 10 && !atWarWith("usa"))
        out.push({ k: "usa", kind: G.year <= 1951 && ["japan", "southkorea", "taiwan"].includes(G.ck) ? "US economic aid" : "Marshall Plan", amt: my * 0.012 });
    const need = sovereignNow() ? clamp((0.25 - ratio) / 0.2, 0, 1) : 0;
    if (need > 0) {
        const era = G.year < 1960 ? 0.5 : 1;
        const gov = G.s.corruption > 55 ? 0.6 : 1;
        const maxGdp = Math.max(...Object.values(G.nations).map(n => n.gdp || 0));
        Object.values(G.nations).forEach(n => {
            if (n.key === G.ck || n.status !== "sovereign" || n.rebel || out.some(o => o.k === n.key)) return;
            // Donors are rich countries, plus the communist giants courting friends.
            const pc = n.gdp / Math.max(0.1, n.pop) * 1000;
            const donor = pc >= frontierPC() * 0.4 || (n.key === "russia" && G.year < 1991) || (n.key === "china" && G.year >= 2000);
            const rel = getRel(G.ck, n.key);
            if (!donor || rel < 15 || n.gdp < my * 4 || pc < gdpPerCapita() * 2 || atWarWith(n.key)) return;
            const size = clamp(Math.sqrt(n.gdp / Math.max(0.01, maxGdp)) * 1.5, 0.25, 1.5);
            out.push({ k: n.key, kind: "development aid", amt: my * 0.006 * size * clamp(rel / 50, 0.3, 1.5) * need * era * gov });
        });
    }
    if (G.inst && G.inst.sanctions) return [];
    out.sort((a, b) => b.amt - a.amt);
    const total = out.reduce((s, o) => s + o.amt, 0), cap = my * 0.03;
    if (total > cap) out.forEach(o => { o.amt *= cap / total; });
    return out.filter(o => o.amt >= my * 0.0002);
}
const atWarWith = k => playerWars().some(w => (w.a.includes(G.ck) ? w.b : w.a).includes(k));

function treasuryYearly() {
    const t = tre();
    t.pledges = aidPledges();
    if (!t.pledges.length) return;
    const total = t.pledges.reduce((s, o) => s + o.amt, 0);
    const who = t.pledges.slice(0, 4).map(o => `${G.nations[o.k].flag} ${nominal(o.amt)}`).join(", ");
    log(`🤝 ${t.pledges.some(o => o.kind === "Marshall Plan") ? "Marshall Plan and donor" : "Donors"} pledges for ${G.year}: ${nominal(total)} in aid (${who}). It arrives in the treasury month by month.`, "good");
}

function treasuryMonthly() {
    const t = tre();
    t.pledges.forEach(o => {
        if (!G.nations[o.k] || getRel(G.ck, o.k) < 0) return;    // a donor you've fallen out with stops paying
        treasuryAdd(o.amt / 12, "aid");
    });
}

// ── Spending it ─────────────────────────────────────────────────────

function payProjectFromTreasury(id) {
    const it = G.cip.queue.find(p => p.id === id);
    if (!it || it.fin) return;
    const t = tre();
    if (t.cash < it.cost) return toast("Not enough in the treasury", `${projectInfo(it.type).name} costs ${nominal(it.cost)}; the treasury holds ${nominal(t.cash)}.`);
    if (G.capital < 1) return toast("Not enough political capital", "Spending treasury money costs 1.");
    G.capital -= 1;
    t.cash -= it.cost;
    book("out", "projects", it.cost);
    ledger(`${projectInfo(it.type).name} (${G.regions[it.region] ? G.regions[it.region].n : ""})`, -it.cost);
    G.cip.queue.splice(G.cip.queue.indexOf(it), 1);
    it.treasury = true;
    activateProject(it);
    log(`💰 Paid for ${projectInfo(it.type).name} outright from the treasury (${nominal(it.cost)}). Construction starts.`, "policy");
    toast("Paid from the treasury", `${projectInfo(it.type).icon} ${projectInfo(it.type).name}: construction starts.`, [{ label: "Treasury", v: "−" + nominal(it.cost), good: false, raw: true }]);
}

function treasuryToCapital(frac) {
    const t = tre(), x = t.cash * frac;
    if (x <= 0) return;
    if (G.capital < 1) return toast("Not enough political capital", "It costs 1.");
    G.capital -= 1;
    t.cash -= x; book("out", "capital", x); ledger("Moved to the capital budget", -x);
    G.cip.pool += x;
    fundQueue();
    toast("Capital budget topped up", `${nominal(x)} moved from the treasury. Waiting projects start as the money allows.`, [{ label: "Treasury", v: "−" + nominal(x), good: false, raw: true }]);
}

function treasuryRepay(frac) {
    const t = tre(), x = Math.min(t.cash * frac, G.econ.debt);
    if (x <= 0) return;
    const before = impactSnapshot();
    t.cash -= x; book("out", "debt", x); ledger("Debt repaid", -x);
    G.econ.debt -= x;
    toast("Debt repaid", `${nominal(x)} of public debt paid off.`, [{ label: "Treasury", v: "−" + nominal(x), good: false, raw: true }, ...impactDiff(before, "Repaying debt")]);
}

function credAdd(k, bn) { const c = tre().cred; c[k] = (c[k] || 0) + bn; }

function treasuryOpt(k, v) {
    const t = tre();
    if (k === "surplus") t.surplus = v === "save" ? "save" : "debt";
    if (k === "cover") t.cover = v === "yes";
}

// Budget tab panel.
function treasuryPanel() {
    const t = tre(), gdpPct = t.cash / G.econ.gdp * 100;
    const lines = (o, names, sign) => Object.entries(o).filter(([, v]) => v * 1000 * cpi() >= 0.05).sort((a, b) => b[1] - a[1]).map(([k, v]) => `<div class="budget-row tre-row"><span>${names[k]}</span><b class="${sign > 0 ? "good" : "bad"}">${sign > 0 ? "+" : "−"}${moneyFine(v * cpi())}</b></div>`).join("");
    const inn = lines(t.book.in, TREASURY_IN, 1), out = lines(t.book.out, TREASURY_OUT, -1);
    const pledged = t.pledges.reduce((s, o) => s + o.amt, 0);
    const donors = t.pledges.map(o => `<span class="chg good">${G.nations[o.k] ? G.nations[o.k].flag : ""} ${esc(nationName(o.k))} ${moneyFine(o.amt * cpi())}${o.kind !== "development aid" ? ` · ${esc(o.kind)}` : ""}</span>`).join("");
    const waiting = G.cip ? G.cip.queue.filter(p => !p.fin).length : 0;
    const qs = [0.25, 0.5, 1];
    return panel("Treasury", `
        <div class="standing"><div class="st-rank tre-cash">${moneyFine(t.cash * cpi())}</div><div><b>Cash in the treasury</b><div class="tiny muted">${fmt(gdpPct, 1)}% of GDP · public debt ${nominal(G.econ.debt)}</div></div></div>
        ${pledged > 0 ? `<p class="tiny"><b>🤝 Aid pledged for ${G.year}:</b> ${moneyFine(pledged * cpi())}, paid monthly. ${donors}</p>` : `<p class="tiny muted">No aid pledged this year. Donors help countries much poorer than themselves that they're on good terms with. You can also ask a richer friend for aid from the World tab.</p>`}
        ${inn || out ? `<h4>So far in ${G.year}</h4>${inn}${out}` : ""}
        <h4>Spend it</h4>
        <p class="tiny">${waiting ? `Pay for any waiting CIP project outright with its 💰 button, on top of the capital budget.` : `Add projects to the CIP below, then pay for them outright with their 💰 button.`} Each transfer costs 1 ⚡.</p>
        <div class="row"><span class="tiny">Top up the capital budget:</span>${qs.map(f => `<button class="mini" data-act="treCapital" data-f="${f}" ${t.cash <= 0 || G.capital < 1 ? "disabled" : ""}>${f === 1 ? "all" : f * 100 + "%"} (${moneyFine(t.cash * f * cpi())})</button>`).join("")}</div>
        <div class="row"><span class="tiny">Repay debt:</span>${qs.map(f => `<button class="mini secondary" data-act="treRepay" data-f="${f}" ${t.cash <= 0 || G.econ.debt <= 0 ? "disabled" : ""}>${f === 1 ? "all" : f * 100 + "%"}</button>`).join("")}</div>
        <h4>Rules</h4>
        <div class="budget-row tre-row"><span>Budget surpluses</span><select data-change="treOpt" data-k="surplus"><option value="debt" ${t.surplus === "debt" ? "selected" : ""}>Pay down debt first</option><option value="save" ${t.surplus === "save" ? "selected" : ""}>Save in the treasury</option></select></div>
        <div class="budget-row tre-row"><span>Deficits & one-off costs</span><select data-change="treOpt" data-k="cover"><option value="no" ${!t.cover ? "selected" : ""}>Borrow, keep the cash</option><option value="yes" ${t.cover ? "selected" : ""}>Draw on the treasury first</option></select></div>
        ${t.ledger.length ? `<h4>Recent</h4>${t.ledger.slice(0, 6).map(l => `<div class="budget-row tre-row"><span class="tiny">${esc(l.d)} · ${esc(l.text)}</span><b class="${l.bn > 0 ? "good" : "bad"}">${l.bn > 0 ? "+" : "−"}${moneyFine(Math.abs(l.bn) * cpi())}</b></div>`).join("")}` : ""}
        <p class="tiny muted">Unspent capital money comes back here each January. Cash loses value when inflation is above 2%.</p>`);
}

// ── The Finance tab: treasury, debt and the year's money in one place ──
function viewFinance() {
    const e = G.econ, t = tre(), N = cpi(), gdpN = e.gdp * N;
    const debtPct = e.debt / e.gdp * 100, sp = governmentSpend();
    const interest = sp.lines.interest || 0, bal = e.rev - e.spend;
    const perHead = e.debt * N * 1e3 / Math.max(0.01, e.pop);   // dollars per person
    const off = Object.entries(t.cred).filter(([, v]) => v * N * 1000 >= 0.05).sort((a, b) => b[1] - a[1]);
    const offSum = off.reduce((s, [, v]) => s + v, 0);
    const lname = k => LENDERS[k] ? LENDERS[k].name : k;
    const row = (label, v, cls = "", note = "") => `<div class="budget-row tre-row"><span>${label}${note ? ` <span class="tiny muted">${note}</span>` : ""}</span><b class="${cls}">${v}</b></div>`;
    const risk = debtPct > 200 ? ["bad", "Default is close: above 220% of GDP creditors stop lending."] : debtPct > 90 ? ["bad", "Debt crisis territory: creditors are nervous and a crisis can strike any time."] : debtPct > 70 ? ["warn", "High: interest is starting to drag on growth."] : debtPct > 40 ? ["", "Moderate."] : ["good", "Low: markets and lenders are comfortable."];
    const debtPanel = panel("National debt", `
        <div class="standing"><div class="st-rank">${nominal(e.debt)}</div><div><b>${Math.round(debtPct)}% of GDP</b><div class="tiny ${risk[0]}">${risk[1]}</div></div></div>
        ${row("Per person", "$" + Math.round(perHead).toLocaleString("en-US"))}
        ${row("Interest this year", moneyFine(gdpN * interest / 100), interest > 3 ? "bad" : "", `${fmt(interest, 1)}% of GDP · ${e.rev > 0 ? Math.round(interest / e.rev * 100) : 0}% of revenue`)}
        ${row("Years of revenue to repay it", e.rev > 0 ? fmt(debtPct / e.rev, 1) : "–")}
        <h4>Who you owe</h4>
        ${off.map(([k, v]) => row(`🏦 ${esc(lname(k))}`, nominal(v), "", "project loans")).join("")}
        ${row(G.dev.ind >= 40 || G.year >= 1980 ? "🏛️ Government bonds & banks" : "🏛️ Banks, bonds & foreign creditors", nominal(Math.max(0, e.debt - offSum)))}
        ${G.inst && G.inst.program ? `<p class="tiny">💵 IMF program in force: ${fmt(G.inst.program.amount, 1)}% of GDP of support while you meet its conditions (Institutions tab).</p>` : ""}
        <div class="spark-row"><small>Debt % of GDP</small>${sparkline("d", "#e07a5f") || "<span class='tiny muted'>history builds as you play</span>"}</div>
        <p class="tiny muted">Deficits add to the debt; inflation shrinks it in real terms. Above 70% of GDP interest drags on growth, above 90% a debt crisis can strike, and above 220% you default. ${G.inst && G.inst.m && G.inst.m.imf ? "Paris Club and HIPC relief are on the Institutions tab." : ""}</p>`);
    const flowPanel = panel(`Money in & out · ${G.year}`, `
        ${row("Revenue", money(gdpN * e.rev / 100) + " a year", "good", `${fmt(e.rev, 1)}% of GDP`)}
        ${row("Spending", money(gdpN * e.spend / 100) + " a year", "bad", `${fmt(e.spend, 1)}% of GDP`)}
        ${row(bal >= 0 ? "Surplus" : "Deficit", money(Math.abs(gdpN * bal / 100)) + " a year", bal >= 0 ? "good" : "bad", `${fmt(Math.abs(bal), 1)}% of GDP · ${bal >= 0 ? (t.surplus === "save" ? "saved in the treasury" : e.debt > 0 ? "paying down debt" : "saved in the treasury") : (t.cover && t.cash > 0 ? "drawn from the treasury" : "borrowed")}`)}
        <h4>Where it goes</h4>
        ${Object.entries(sp.lines).filter(([, v]) => v >= 0.05).sort((a, b) => b[1] - a[1]).map(([k, v]) => row(k === "admin" ? "Administration" : k === "interest" ? "Interest on the debt" : k === "capital" ? "Capital budget (CIP)" : k === "war" ? "War" : DEPTS[k] ? DEPTS[k].name : k, money(gdpN * v / 100), "", `${fmt(v, 1)}%`)).join("")}
        <p class="tiny muted">Taxes are set in the Budget tab; the Economy tab breaks down where revenue comes from.</p>
        <div class="row"><button class="mini" data-act="view" data-v="budget">💰 Budget</button><button class="mini secondary" data-act="view" data-v="economy">🏭 Taxes & jobs</button></div>`);
    return `<div class="cols2"><div>${treasuryPanel()}</div><div>${debtPanel}${flowPanel}</div></div>`;
}
