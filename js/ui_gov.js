// ── UI: legislature, bill builder, lawbook, budget & CIP, development ──

const STAGE_LABEL = { committee: "In committee", floor: "Floor debate", stuck: "Stuck in committee", law: "Law", failed: "Defeated", withdrawn: "Withdrawn", vetoed: "Vetoed", dead: "Died", desk: "On your desk" };
const pct = v => `${Math.round(v * 100)}%`;

function stageTracker(b) {
    const order = ["committee", "floor", "vote", "law"];
    const at = b.stage === "stuck" ? 0 : b.stage === "floor" ? 1 : ["law"].includes(b.stage) ? 3 : b.stage === "committee" ? 0 : 2;
    return `<div class="stages">${STAGES.map(([k, n], i) => `<span class="${i < at || (i === at && b.stage !== "failed") ? "on" : ""}${b.stage === "stuck" && i === 0 ? " warnstage" : ""}">${n}</span>`).join("")}</div>`;
}

// ── Legislature ─────────────────────────────────────────────────────

function viewLegislature() {
    const legName = G.leg.name;
    const demo = hasLegislature();
    const bills = (G.bills || []).slice().reverse();
    const row = b => {
        const fc = ["committee", "floor", "stuck"].includes(b.stage) ? forecast(b) : null;
        return `<button class="bill-row ${ui.billSel === b.id ? "on" : ""}" data-act="billSel" data-id="${b.id}">
            <div><b>${esc(b.title)}</b><div class="tiny muted">${b.sponsor === "player" ? "Your bill" : esc(factionName(b.sponsor))}${b.position > 0 && b.sponsor !== "player" ? " · you back it" : b.position < 0 ? " · you oppose it" : ""}</div></div>
            <div class="bill-meta"><span class="pill stage-${b.stage}">${STAGE_LABEL[b.stage] || b.stage}</span>${fc ? `<span class="tiny">${Math.round(fc.prob * 100)}% to pass</span>` : b.result ? `<span class="tiny">${b.result.yes}–${b.result.no}</span>` : ""}</div></button>`;
    };
    const mine = bills.filter(b => b.sponsor === "player"), others = bills.filter(b => b.sponsor !== "player");
    const left = panel(`${esc(legName)}`, `
        ${demo ? `<p class="small muted">Bills move through committee, floor debate and a vote over several weeks. Majority: ${majority()} of ${G.leg.total}. Government side: ${govSeats()}.</p>` : `<p class="small muted">You govern by decree. Programs you write take effect at once, at a cost in political capital.</p>`}
        <div class="row"><button class="primary" data-act="builderOpen">✍️ Bill Builder</button><button class="secondary" data-act="view" data-v="lawbook">📚 Lawbook</button><button class="secondary" data-act="view" data-v="budget">💰 Budget</button></div>
        <h4>Your bills</h4>${mine.map(row).join("") || "<p class='muted small'>None yet. Use the Bill Builder, or propose a law from the Lawbook.</p>"}
        ${demo ? `<h4>Other bills</h4>${others.map(row).join("") || "<p class='muted small'>No other bills before the house.</p>"}` : ""}`);
    let right = "";
    if (ui.builder) right = builderPanel();
    else if (ui.billSel && billById(ui.billSel)) right = billDetail(billById(ui.billSel));
    else right = panel("How a bill becomes law", `<ol class="small"><li><b>Introduce</b> it from the Bill Builder (new programs), the Lawbook (enact, amend or repeal a law, or reform a national policy) or the Budget.</li><li><b>Committee</b>: the chair decides whether it reaches the floor. Lobby the chair, or fast-track it if you lead the government.</li><li><b>Floor debate</b>: give speeches, amend it, whip your side, hand out pork and trade favors.</li><li><b>Vote</b>: it needs a majority. If it fails, it's gone. ${GT().execOrders ? "Bills you didn't back land on your desk to sign or veto." : ""}</li></ol>`);
    return `<div class="cols2 wide-right"><div>${left}</div><div>${right}</div></div>`;
}

function billDetail(b) {
    const live = ["committee", "floor", "stuck"].includes(b.stage);
    const fc = live ? forecast(b) : null;
    let body = `${stageTracker(b)}<p class="small">${esc(b.desc || "")}</p>`;
    if (b.kind === "program") body += `<p class="tiny">${effSummary(b.def.eff)} · cost ${fmt(b.def.cost, 2)}% of GDP a year${b.def.years ? ` for ${b.def.years} years` : ""}</p>`;
    if (b.kind === "law") body += `<p class="tiny">${lawDef(b.lawKey).name}: ${b.prev ? pct(b.prev) : "not in force"} → ${b.level ? pct(b.level) : "repealed"}</p>`;
    if (b.kind === "budget") { const pr = projectBudget(b.draft); body += `<p class="tiny">Revenue ${fmt(pr.rev, 1)}% · spending ${fmt(pr.spend, 1)}% · ${pr.net >= 0 ? "surplus" : "deficit"} ${fmt(Math.abs(pr.net), 1)}% of GDP</p>`; }
    if (b.amends.length) body += `<p class="tiny">Amendments: ${b.amends.map(a => AMENDMENTS[a.type].name + (a.ideo ? ` (${IDEOLOGIES[a.ideo].name})` : "")).join(", ")}</p>`;
    if (live) {
        const ch = G.factions.find(f => f.k === b.chair);
        body += `<p class="small">Committee chair: <b>${esc(ch ? ch.name : "?")}</b>${b.stage === "committee" ? ` · chance it reports the bill out: <b>${Math.round(chairOdds(b) * 100)}%</b> · decision in ${Math.max(0, b.cwk - b.wk)} wk` : b.stage === "floor" ? ` · vote in ${Math.max(0, b.fwk - b.wk)} wk` : " · <span class='bad'>bottled up</span>"}</p>
        <p>Projected yes: <b>${Math.round(fc.yes)}</b> of ${G.leg.total} (need ${fc.need}) · chance of passing: <b class="${fc.prob > 0.6 ? "good" : fc.prob < 0.4 ? "bad" : "warn"}">${Math.round(fc.prob * 100)}%</b>${b.momentum ? ` · momentum ${b.momentum > 0 ? "+" : ""}${Math.round(b.momentum)}` : ""}</p>
        <div class="whipbar"><i style="width:${clamp(fc.yes / G.leg.total * 100, 0, 100)}%"></i><span style="left:${fc.need / G.leg.total * 100}%"></span></div>
        <div class="table-wrap"><table class="whip"><tr><th>Faction</th><th>Seats</th><th>Loyalty</th><th>Yes</th><th>Deal</th></tr>${fc.rows.map(r => {
            const lean = r.p >= 0.65 ? "for" : r.p <= 0.35 ? "against" : "und";
            return `<tr><td><i class="dot" style="background:${ideoColor(r.f.ideo)}"></i> ${esc(r.f.name)}${r.f.gov ? " <span class='tiny muted'>gov</span>" : ""}${b.sponsor === r.f.k ? " <span class='tiny'>sponsor</span>" : ""}</td><td>${r.f.seats}</td><td>${Math.round(r.f.loyalty)}</td><td class="c-${lean}">${Math.round(r.p * 100)}%</td>
                <td>${b.position > 0 ? `<button class="mini ${b.conc[r.f.k] ? "on" : ""}" data-act="billPork" data-id="${b.id}" data-k="${r.f.k}" title="Projects in their districts: 0.15% of GDP">🏗️</button><button class="mini ${b.favor[r.f.k] ? "on" : ""}" data-act="billFavor" data-id="${b.id}" data-k="${r.f.k}" title="Owe them a favor">🤝</button><button class="mini" data-act="amend" data-id="${b.id}" data-t="sweeten" data-k="${r.f.ideo}" title="Sweeten the bill for them (3 ⚡)">✏️</button>` : ""}</td></tr>`;
        }).join("")}</table></div>
        <div class="row">${Object.entries(BILL_ACTIONS).filter(([, a]) => a.when(b)).map(([k, a]) => `<button class="${k === "withdraw" ? "secondary" : ""}" data-act="billAct" data-id="${b.id}" data-k="${k}" ${a.cost && G.capital < a.cost ? "disabled" : ""}>${a.name}${a.cost ? ` (${a.cost} ⚡)` : k === "whip" ? ` (${whipCost()} ⚡)` : ""}</button>`).join("")}</div>
        ${b.position > 0 ? `<h4>Amend</h4><div class="row">${Object.entries(AMENDMENTS).filter(([k, a]) => k !== "sweeten" && a.ok(b)).map(([k, a]) => `<button class="mini" data-act="amend" data-id="${b.id}" data-t="${k}" title="${esc(a.desc)}">${a.name} (3 ⚡)</button>`).join("") || "<span class='tiny muted'>Use ✏️ in the table to sweeten it for a faction.</span>"}</div>` : ""}`;
    }
    return panel(esc(b.title), body);
}

// ── Bill Builder ────────────────────────────────────────────────────

function builderPanel() {
    const s = ui.builder || (ui.builder = builderDefaults());
    const def = compileBill(s);
    const sel = (field, opts, val) => `<select data-change="builder" data-f="${field}">${opts.map(([k, n]) => `<option value="${k}" ${String(val) === String(k) ? "selected" : ""}>${esc(n)}</option>`).join("")}</select>`;
    const issues = Object.entries(ISSUES).filter(([, i]) => !i.from || G.year >= i.from).map(([k, i]) => [k, `${i.icon} ${i.name}`]);
    const mechs = Object.entries(MECHS).map(([k, m]) => [k, m.name]);
    const funds = Object.entries(FUNDS).filter(([, f]) => !f.req || f.req()).map(([k, f]) => [k, f.name]);
    const ags = Object.entries(AGENCIES_W).filter(([, a]) => !a.req || a.req()).map(([k, a]) => [k, a.name]);
    const provs = Object.entries(PROVS).map(([k, p]) => `<label class="check"><input type="checkbox" data-change="builderProv" data-k="${k}" ${s.provs.includes(k) ? "checked" : ""}> ${esc(p.name)}</label>`).join("");
    const demo = hasLegislature();
    return panel("✍️ Bill Builder", `
        <div class="builder-grid">
            <label>The problem${sel("cat", issues, s.cat)}</label>
            <label>How to tackle it${sel("mech", mechs, s.mech)}</label>
            <label>Who benefits${sel("ben", benOptions(), s.ben)}</label>
            <label>How much a year: <b>${fmt(s.amount, 2)}% of GDP</b> (${money(G.econ.gdp * cpi() * s.amount / 100)})<input type="range" min="0.1" max="2" step="0.05" value="${s.amount}" data-change="builder" data-f="amount"></label>
            <label>Paid for by${sel("fund", funds, s.fund)}</label>
            <label>Run by${sel("agency", ags, s.agency)}</label>
            <label>Duration${sel("years", DURATIONS, s.years)}</label>
        </div>
        <h4>Provisions</h4><div class="checks">${provs}</div>
        <div class="bill-preview">
            <div class="kicker">Draft</div>
            <h3 class="bill-title">${esc(def.title)}</h3>
            <p class="small">${esc(def.desc)}</p>
            <p class="small"><b>Cost:</b> ${fmt(def.cost, 2)}% of GDP a year (${money(G.econ.gdp * cpi() * def.cost / 100)})${def.years ? ` for ${def.years} years` : ", permanent"}</p>
            <p class="small"><b>Effects while in force:</b> ${effSummary(def.eff) || "<span class='muted'>negligible</span>"}</p>
            <p class="small"><b>Expected impact once in force:</b> ${chipsHtml(programPreview(def), 12) || "<span class='muted'>little measurable change</span>"}</p>
            ${PROGRAM_INFRA[def.cat] ? `<p class="small"><b>Builds coverage (target):</b> ${Object.entries(PROGRAM_INFRA[def.cat]).map(([ik, w]) => `<span class="good">${INFRA[ik].icon} ${INFRA[ik].name} +${Math.round(Math.min(20, def.cost / 0.5 * 8) * w * (def.region != null ? 0.5 : 1))}</span> <span class="tiny muted">(now ${Math.round(cov(ik))}%)</span>`).join(" · ")}</p>` : ""}
            <p class="small"><b class="good">Supporters:</b> ${esc(def.supporters.join(", ") || "none")}</p>
            <p class="small"><b class="bad">Opponents:</b> ${esc(def.opponents.join(", ") || "none")}</p>
            ${def.risks.length ? `<p class="small"><b class="warn">Risks:</b> ${esc(def.risks.join(". "))}.</p>` : ""}
            ${demo ? `<p class="small">Projected chance of passing as drafted: <b>${Math.round(forecast({ kind: "program", def, sponsor: "player", position: 1, conc: {}, favor: {}, momentum: 0, amends: [] }).prob * 100)}%</b></p>` : ""}
        </div>
        <div class="row"><button class="primary" data-act="builderSubmit" ${G.capital < (demo ? 5 : 8) ? "disabled" : ""}>${demo ? `Introduce the bill (5 ⚡)` : "Issue by decree (8 ⚡)"}</button><button class="secondary" data-act="builderClose">Close</button></div>`, "bill");
}

// ── Lawbook ─────────────────────────────────────────────────────────

function lawControls(k) {
    const d = lawDef(k), lvl = lawLevel(k), demo = hasLegislature();
    if (G.gov.type === "colony" && (!G.colony || G.colony.stage < 1 || !["health", "welfare", "education", "farms", "infra"].includes(d.cat))) return `<p class="small muted">The colonial government controls this. ${G.colony && G.colony.stage < 1 ? "Win self-government first." : "Reserved until independence."}</p>`;
    if (!lawAvailable(k) && !lvl) return `<p class="small muted">Not available until ${d.from}.</p>`;
    if (lawPending(k)) return `<p class="small warn">A bill on this law is before the ${esc(G.leg.name)}. <button class="mini" data-act="view" data-v="legislature">To the floor →</button></p>`;
    const target = ui.lawLevel != null ? ui.lawLevel : lvl > 0 ? lvl : 0.3;
    const slider = d.tax
        ? `<label class="small">Rate: <b>${fmt(target * d.max, 1)}${TAX_UNIT[d.tax] || "%"}</b> · would raise about <b>${fmt(taxRevenueAt(k, target * d.max), 2)}% of GDP</b> (${money(G.econ.gdp * cpi() * taxRevenueAt(k, target * d.max) / 100)}) a year<input type="range" min="0.05" max="1" step="0.05" value="${target}" data-change="lawLevel"></label>`
        : `<label class="small">Level: <b>${pct(target)}</b><input type="range" min="0.1" max="1" step="0.1" value="${target}" data-change="lawLevel"></label>`;
    const pv = lawPreview(k, target);
    const preview = `<p class="tiny">${lvl ? `At ${d.tax ? fmt(target * d.max, 1) + (TAX_UNIT[d.tax] || "%") : pct(target)} instead` : `If it passes at ${d.tax ? fmt(target * d.max, 1) + (TAX_UNIT[d.tax] || "%") : pct(target)}`}: ${pv.length ? chipsHtml(pv) : "<span class='muted'>little measurable change</span>"}</p>`;
    if (!demo) return `${slider}${preview}<div class="row"><button class="primary" data-act="lawDecree" data-k="${k}">${lvl ? "Decree new level" : "Enact by decree"} (${d.tax ? 8 : 6} ⚡)</button>${lvl ? `<button class="secondary" data-act="lawDecree" data-k="${k}" data-repeal="1">Repeal (6 ⚡)</button>` : ""}</div>`;
    if (!lvl) return `<p class="small">This law does not exist yet. Draft it, choose how strong it starts, and pass it.</p>${slider}${preview}<div class="row"><button class="primary" data-act="lawBill" data-k="${k}">Draft the ${esc(d.name)} Act (4 ⚡)</button></div>`;
    const adj = canAdjust(k);
    return `${!d.tax ? `<h4>Executive adjustment</h4><p class="tiny muted">Once a year, within the law's authority: ±10%.${adj ? "" : " Used this year."}</p><div class="row"><button class="secondary" data-act="lawAdj" data-k="${k}" data-d="-1" ${!adj || G.capital < 3 ? "disabled" : ""}>− 10% (3 ⚡)</button><button class="secondary" data-act="lawAdj" data-k="${k}" data-d="1" ${!adj || G.capital < 3 ? "disabled" : ""}>+ 10% (3 ⚡)</button></div>` : `<p class="tiny muted">The rate is set in the annual budget. Amend or repeal the tax itself here.</p>`}
        <h4>Amend or repeal</h4>${slider}${preview}<p class="tiny">Repealing it: ${chipsHtml(lawPreview(k, 0)) || "<span class='muted'>little measurable change</span>"}</p><div class="row"><button class="secondary" data-act="lawBill" data-k="${k}">Propose amendment (4 ⚡)</button><button class="secondary danger" data-act="lawBill" data-k="${k}" data-repeal="1">Propose repeal (4 ⚡)</button></div>`;
}

function lawEffectsAt(d, lvl) {
    if (d.tax) return lawOn(d.key) ? `<span class="muted">Rate now ${fmt(taxRate(d.tax), 1)}${TAX_UNIT[d.tax] || "%"}, raising about ${fmt(taxRevenueAt(d.key, taxRate(d.tax)), 2)}% of GDP a year.</span>` : `<span class="muted">Not collected yet.</span>`;
    const m = lvl * fundMult(d.dept || (LAW_CATS[d.cat] && LAW_CATS[d.cat].dept));
    const eff = {};
    Object.entries(d.fx || {}).forEach(([k, v]) => { eff[k] = v * m; });
    const ps = Object.entries(d.p || {}).filter(([k]) => G.pillars[k]).map(([k, v]) => `<span class="${v > 0 ? "good" : "bad"}">${pillarName(k)} ${v > 0 ? "▲" : "▼"}</span>`).join(" · ");
    const builds = Object.entries(INFRA_LAWS).filter(([, m2]) => m2[d.key]).map(([ik, m2]) => `<span class="good">${INFRA[ik].icon} ${INFRA[ik].name} +${Math.round(m2[d.key] * m)}</span>`).join(" · ");
    return `${effSummary(eff)}${d.cost ? ` · <span class="muted">${fmt(d.cost * m, 2)}% of GDP</span>` : ""}${ps ? " · " + ps : ""}${builds ? `<br>Builds coverage (target): ${builds}` : ""}`;
}

// One infrastructure line: coverage, the past year's change, where it is
// heading and everything pushing it there.
function infraRow(k) {
    const x = INFRA[k], c = cov(k), t = infraTarget(k), ch = Math.round(infraChange(k));
    const parts = infraParts(k).map(([l, v]) => `${esc(l)} <b class="${v >= 0 ? "good" : "bad"}">${v >= 0 ? "+" : ""}${Math.round(v)}</b>`);
    const proj = (G.cip ? G.cip.active : []).filter(p => p.type === k);
    const head = Math.abs(t - c) >= 1 ? ` · heading ${t > c ? "up" : "down"} to ${Math.round(t)}%` : "";
    return `<div class="infra-row">${meter(`${x.icon} ${x.name}`, c / 100, true, `${Math.round(c)}%${ch ? ` <span class="${ch > 0 ? "good" : "bad"}">${ch > 0 ? "+" : ""}${ch}</span>` : ""}`, x.desc)}
        <p class="tiny muted">Normal for your level ${Math.round(infraNormal(k))}%${parts.length ? " · " + parts.join(" · ") : ""}${head}${proj.length ? ` · <span class="good">${proj.length} project${proj.length > 1 ? "s" : ""} under construction (+${Math.round(proj.reduce((s2, p) => s2 + projectGain(k, p.region), 0))})</span>` : ""}</p></div>`;
}

function viewLawbook() {
    const cats = Object.entries(LAW_CATS).map(([ck, c]) => {
        const laws = lawsInCat(ck).filter(d => lawAvailable(d.key) || lawOn(d.key) || (d.from && d.from > G.year));
        return `<div class="lawcat"><h4>${c.icon} ${c.name}${c.dept ? ` <span class="tiny muted">funding ${pct(fundMult(c.dept))}</span>` : ""}</h4>
            ${laws.map(d => { const l = lawLevel(d.key), locked = !l && d.from && d.from > G.year; return `<button class="law-row ${ui.law === d.key ? "on" : ""} ${l ? "" : "off"} ${locked ? "locked" : ""}" data-act="lawSel" data-k="${d.key}"><span>${esc(d.name)}${locked ? ` <span class='tiny muted'>from ${d.from}</span>` : ""}${d.custom ? " <span class='tiny badge'>yours</span>" : ""}${lawPending(d.key) ? " <span class='tiny warn'>bill pending</span>" : ""}</span><span class="lvl">${l ? (d.tax ? fmt(taxRate(d.tax), 1) + "%" : pct(l)) : "—"}</span>${l && !d.tax ? `<i class="lvlbar" style="width:${l * 100}%"></i>` : ""}</button>`; }).join("")}</div>`;
    }).join("");
    let detail = panel("The lawbook", `<p class="small">Laws don't exist until you pass them. Each has a strength from 10% to 100%: its cost and effects scale with that level and with its department's funding in the budget. Once a year the executive may adjust a law by ±10%; anything bigger needs an amendment, and ending one needs a repeal.${hasLegislature() ? "" : " You rule by decree, so you can set any law directly."}</p>`);
    if (ui.law && lawDef(ui.law)) {
        const d = lawDef(ui.law), l = lawLevel(ui.law);
        const st = Object.entries(d.st || {}).filter(([, v]) => v).map(([k, v]) => `<span class="${v > 0 ? "good" : "bad"}">${IDEOLOGIES[k].name} ${v > 0 ? "for" : "against"}</span>`).join(" · ");
        detail = panel(esc(d.name), `<p class="small">${esc(d.desc || "")}</p>
            <p class="tiny"><b>${l ? `In force at ${d.tax ? fmt(taxRate(d.tax), 1) + "%" : pct(l)}${G.laws[ui.law] && G.laws[ui.law].since ? `, since ${dateStr(G.laws[ui.law].since).split(" ").pop()}` : ""}` : "Not in force"}.</b> ${l ? lawEffectsAt(d, l) : d.tax ? lawEffectsAt(d, 0) : "At 100%: " + lawEffectsAt(d, 1)}</p>
            ${st ? `<p class="tiny">Ideologies: ${st}</p>` : ""}${d.until ? `<p class="tiny warn">Expires ${d.until}.</p>` : ""}
            ${lawControls(ui.law)}`);
    }
    const fw = POLICY_AREAS.map(a => { const o = curOpt(a.key); return `<button class="policy-row ${ui.area === a.key ? "on" : ""}" data-act="area" data-k="${a.key}"><span>${a.icon} ${a.name}</span><b>${esc(optName(o))}</b></button>`; }).join("");
    const fwDetail = ui.area ? frameworkDetail(ui.area) : "";
    return `<div class="cols2 wide-right"><div>${panel("Laws in force & available", cats)}${panel("National frameworks", `<p class="tiny muted">System-wide choices. Changing one is a major reform.</p>${fw}`)}</div><div>${detail}${fwDetail}</div></div>`;
}

function frameworkDetail(area) {
    const a = POLICY[area], m = policyMethod(area);
    const pending = (G.bills || []).some(b => b.area === area && ["committee", "floor", "stuck"].includes(b.stage));
    const opts = a.options.map(o => {
        const allowed = !o.req || o.req(G.gov.type, G), cur = G.pol[area] === o.k;
        return `<div class="opt ${cur ? "cur" : ""}"><div><b>${esc(optName(o))}</b>${cur ? ` <span class="badge small">Current</span>` : ""}${o.desc ? `<p class="small">${esc(o.desc)}</p>` : ""}<p class="tiny">${optEffects(o)}</p>${!cur && allowed ? `<p class="tiny">${chipsHtml(frameworkPreview(area, o.k), 8)}</p>` : ""}</div>
            ${cur || !allowed || m.m === "blocked" || pending ? (allowed ? "" : `<span class="tiny muted">Not under your system</span>`) : m.m === "bill" ? `<div class="col-btns"><button data-act="fwBill" data-a="${area}" data-k="${o.k}" ${G.capital < policyCost(area) ? "disabled" : ""}>Reform bill (${policyCost(area)} ⚡)</button>${m.eo ? `<button class="secondary" data-act="fwEO" data-a="${area}" data-k="${o.k}">Executive order</button>` : ""}</div>` : `<button data-act="fwDecree" data-a="${area}" data-k="${o.k}" ${G.capital < policyCost(area) ? "disabled" : ""}>Decree (${policyCost(area)} ⚡)</button>`}</div>`;
    }).join("");
    return panel(`${a.icon} ${a.name}`, `<p class="small muted">${esc(m.why)}${pending ? " <b>A reform bill is already before the legislature.</b>" : ""}</p>${opts}`);
}

// ── Budget & CIP ────────────────────────────────────────────────────

function viewBudget() {
    const b = G.budget, editing = b.draft && ["drafting", "rejected"].includes(b.status);
    const d = editing ? b.draft : { depts: b.depts, rates: b.rates, capital: b.capital };
    const pr = projectBudget(d);
    const gdpN = G.econ.gdp * cpi();
    const statusText = { adopted: `FY${G.year} budget in force.`, drafting: `Drafting the FY${b.fy} budget.`, submitted: `The FY${b.fy} budget is before the ${G.leg.name}.`, passed: `The FY${b.fy} budget has passed and takes effect on 1 January.`, rejected: `The ${G.leg.name} rejected your budget. Revise and resubmit before 1 January.`, cr: "Continuing resolution: no budget passed. No money for new capital projects." }[b.status];
    const deptRows = Object.entries(DEPTS).map(([k, dp]) => `<div class="budget-row"><span>${dp.name}</span>${editing ? `<input type="range" min="0.7" max="1.3" step="0.05" value="${d.depts[k]}" data-change="draft" data-kind="dept" data-k="${k}">` : `<i class="lvlbar inline" style="width:${(d.depts[k] - 0.7) / 0.6 * 100}%"></i>`}<b class="${d.depts[k] > 1 ? "good" : d.depts[k] < 1 ? "bad" : ""}">${pct(d.depts[k])}</b><span class="tiny muted">${fmt(pr.lines[k] || 0, 1)}%</span></div>`).join("");
    const taxRows = Object.values(LAWS).filter(l => l.tax && lawOn(l.key)).map(l => `<div class="budget-row"><span>${l.name}</span>${editing ? `<input type="range" min="0" max="${l.max}" step="${l.max <= 10 ? 0.1 : 0.5}" value="${d.rates[l.tax] || 0}" data-change="draft" data-kind="rate" data-k="${l.tax}">` : "<span></span>"}<b>${fmt(d.rates[l.tax] || 0, 1)}${TAX_UNIT[l.tax] || "%"}</b><span class="tiny muted">${fmt(pr.taxes[l.tax] || 0, 1)}%</span></div>`).join("") || "<p class='tiny muted'>No taxes in law. Enact them in the Lawbook.</p>";
    const cip = G.cip || { queue: [], active: [], pool: 0 };
    const regionName = i => G.regions[i] ? G.regions[i].n : "";
    const srcTag = s => s.startsWith("fac:") ? `<span class="tiny warn">requested by ${esc(factionName(s.slice(4)))}</span>` : s === "event" ? "<span class='tiny muted'>emergency</span>" : "";
    let running = cip.pool;
    const queue = cip.queue.map((p, i) => { const info = projectInfo(p.type); const fits = p.cost <= running; return `<div class="cip-row ${fits ? "" : "unfunded"}"><span>${info.icon} ${esc(info.name)} <span class="tiny muted">${esc(regionName(p.region))}${G.regions[p.region] && regionFit(p.type, G.regions[p.region]) > 0 ? " ★" : ""}</span> ${srcTag(p.src)}</span><span class="tiny">${INFRA[p.type] ? `<span class="good">+${Math.round(projectGain(p.type, p.region))}</span> · ` : ""}${nominal(p.cost)}${p.fin ? ` · <span class="warn">appraisal: ${esc(LENDERS[p.fin.lender].name)}</span>` : ""}</span><span>${!p.fin && G.inst && bestLender(p.type) ? `<button class="mini" data-act="finProject" data-id="${p.id}" title="Ask ${esc(LENDERS[bestLender(p.type)].name)} to finance it (2 ⚡)">🏦</button>` : ""}<button class="mini" data-act="cipMove" data-id="${p.id}" data-d="-1" ${i === 0 ? "disabled" : ""}>▲</button><button class="mini" data-act="cipMove" data-id="${p.id}" data-d="1" ${i === cip.queue.length - 1 ? "disabled" : ""}>▼</button><button class="mini danger" data-act="cipRemove" data-id="${p.id}">✕</button></span></div>`; }).join("") || "<p class='tiny muted'>The queue is empty. Propose projects below, or from an industry's page.</p>";
    const active = cip.active.map(p => { const info = projectInfo(p.type); return `<div class="cip-row"><span>${info.icon} ${esc(info.name)} <span class="tiny muted">${esc(regionName(p.region))}</span></span><span class="tiny">${Math.round((1 - p.left / p.total) * 100)}% built · ${Math.max(1, Math.round(p.left / 4.3))} mo left</span></div>`; }).join("") || "<p class='tiny muted'>Nothing under construction.</p>";
    const infra = Object.entries(INFRA).filter(([, x]) => (!x.from || G.year >= x.from) && (!x.res || G.res.includes(x.res))).map(([k]) => infraRow(k)).join("");
    const types = Object.entries(INFRA).filter(([, x]) => (!x.from || G.year >= x.from) && (!x.res || G.res.includes(x.res))).map(([k, x]) => `<option value="${k}">${x.icon} ${x.name} (${nominal(projectCostBn(k))})</option>`).join("");
    return `<div class="cols2">
        <div>${panel(`Budget ${editing ? `· draft FY${b.fy}` : ""}`, `<p class="small"><b>${statusText}</b></p>
            <div class="budget"><div><small>Revenue</small><b>${fmt(pr.rev, 1)}%</b><span class="tiny muted">${money(gdpN * pr.rev / 100)}</span></div><div><small>Spending</small><b>${fmt(pr.spend, 1)}%</b><span class="tiny muted">${money(gdpN * pr.spend / 100)}</span></div><div class="${pr.net < 0 ? "bad" : "good"}"><small>${pr.net < 0 ? "Deficit" : "Surplus"}</small><b>${fmt(Math.abs(pr.net), 1)}%</b></div><div><small>Debt</small><b>${Math.round(G.econ.debt / G.econ.gdp * 100)}%</b></div></div>
            <h4>Department funding <span class="tiny muted">(70–130%: weaker or stronger laws)</span></h4>${deptRows}
            ${editing ? `<p class="tiny"><b>If this draft is adopted:</b> ${chipsHtml(budgetPreview(d), 12) || "<span class='muted'>no measurable change from this year's budget</span>"}</p>` : ""}
            <div class="budget-row"><span>Administration, interest & war</span><span></span><b></b><span class="tiny muted">${fmt((pr.lines.admin || 0) + (pr.lines.interest || 0) + (pr.lines.war || 0), 1)}%</span></div>
            <h4>Tax rates <span class="tiny muted">(rate · revenue, % of GDP)</span></h4>${taxRows}
            <h4>Capital budget (funds the CIP)</h4><div class="budget-row"><span>Capital projects</span>${editing ? `<input type="range" min="0" max="5" step="0.25" value="${d.capital}" data-change="draft" data-kind="capital">` : "<span></span>"}<b>${fmt(d.capital, 2)}%</b><span class="tiny muted">${money(gdpN * d.capital / 100)}/yr</span></div>
            <div class="row">${editing ? `<button class="primary" data-act="submitBudget" ${hasLegislature() && G.capital < 4 ? "disabled" : ""}>${hasLegislature() ? `Send to the ${esc(G.leg.name)} (4 ⚡)` : "Decree the budget"}</button>` : b.status === "submitted" ? `<button data-act="billSel" data-id="${b.billId}" data-goto="1">Follow the budget bill →</button>` : `<span class="tiny muted">The next budget season opens in September.</span>`}</div>`)}</div>
        <div>
            ${panel("Capital Improvement Program", `<p class="small">This year's capital money left: <b>${nominal(cip.pool)}</b>. Projects are funded in queue order each January, or as soon as money is free. Reorder to set priorities.</p>
                <h4>Queue</h4>${queue}
                <h4>Under construction</h4>${active}
                <h4>Propose a project <span class="tiny muted">(2 ⚡)</span></h4>
                <div class="row nowrap"><select id="cipType">${types}</select><button data-act="cipPropose" ${G.capital < 2 ? "disabled" : ""}>Choose a region…</button></div>`)}
            ${panel("Regions", G.regions.map((r, i) => { const n = cip.queue.concat(cip.active).filter(p => p.region === i).length; return `<div class="region-row"><div><b>${esc(r.n)}</b> <span class="tiny muted">${r.pop}% of the people · support ${Math.round(regionSupport(r))}%${n ? ` · ${n} project${n > 1 ? "s" : ""}` : ""}</span></div><p class="tiny">${esc(r.d || "")}</p>${r.t.length ? `<p class="tiny muted">${r.t.map(t => REGION_TAG_NAMES[t] || t).join(" · ")}</p>` : ""}</div>`; }).join("") + `<p class="tiny muted">Projects in a region that suits them (★ in the picker) do 25% more good.</p>`)}
            ${panel("Infrastructure coverage", infra + `<p class="tiny muted">Routine department spending keeps coverage at the normal level for a country like yours. Capital projects push it above that, which speeds growth, literacy, health and industry. Underfunding a department lets it slide.</p>`)}
        </div>
    </div>`;
}

// ── Industry development panel ──────────────────────────────────────

function industryPanel(k) {
    const I = INDUSTRIES[k];
    const fit = sectorFit(k);
    const conds = sectorConditions(k);
    const assets = Object.entries(SECTOR_ASSETS[k] || {}).filter(([, a]) => !a.from || G.year >= a.from).map(([ak, a]) => {
        const built = assetBuilt(k, ak), q = assetQueued(k, ak);
        return `<div class="asset ${built ? "built" : ""}"><span>${built ? "✅" : q ? "🏗️" : "⬜"} <b>${esc(a.name)}</b><div class="tiny muted">${esc(a.desc)}</div></span>${built ? "<span class='tiny good'>Built</span>" : q ? "<span class='tiny'>In the CIP</span>" : `<button class="mini" data-act="assetPropose" data-k="${k}" data-a="${ak}" ${G.capital < 2 ? "disabled" : ""}>Add to CIP · ${nominal(G.econ.gdp * a.cost / 100)}</button>`}</div>`;
    }).join("");
    const firms = (G.firms || []).filter(f => f.sector === k && !f.closed).map(f => `${f.home && f.home !== G.ck ? flagOf(f.home) : "🏠"} ${esc(f.name)}`).join(", ");
    const ways = Object.entries(LOCAL_WAYS).filter(([, w]) => !w.req || w.req()).map(([wk, w]) => `<button class="mini" data-act="startup" data-k="${k}" data-w="${wk}" title="${esc(w.desc)}" ${G.capital < 6 ? "disabled" : ""}>${w.name} · ${Math.round(localOdds(k, wk) * 100)}%</button>`).join("");
    const share = indShare(k);
    return panel(`${I.icon} ${I.name}`, `<p class="small">${esc(I.desc)}</p>
        <div class="budget"><div><small>Natural fit</small><b class="stars">${"★".repeat(Math.floor(fit))}${fit % 1 ? "½" : ""}</b></div><div><small>Share of GDP</small><b>${fmt(share, 1)}%</b></div><div><small>Growth</small><b>${fmt(G.ind[k].rate || 0, 1)}%</b></div><div><small>Development bonus</small><b class="${sectorBonus(k) >= 0 ? "good" : "bad"}">${sectorBonus(k) >= 0 ? "+" : ""}${fmt(sectorBonus(k), 1)}</b></div></div>
        ${meter("Industry strength", clamp(share / 12), true, `${fmt(share, 1)}%`)}
        <h4>Conditions to flourish</h4><ul class="conds">${conds.map(c => `<li class="${c.met ? "good" : "bad"}">${c.met ? "✔" : "✘"} ${esc(c.label)}${c.met ? "" : ` <span class="tiny muted">${esc(c.fix)}</span>`}</li>`).join("")}</ul>
        <h4>Public investments</h4>${assets}
        <div class="row"><button class="mini" data-act="projectPick" data-k="${k}" ${G.capital < 2 ? "disabled" : ""}>🏗️ Add a ${esc(I.project.toLowerCase())} to the CIP</button></div>
        <h4>Homegrown firms</h4><p class="tiny muted">Back a local entrepreneur (6 ⚡). Odds shown.</p><div class="row">${ways}</div>
        ${firms ? `<p class="tiny">Firms here: ${firms}</p>` : ""}`);
}

// ── International institutions ──────────────────────────────────────

function viewInstitutions() {
    if (!G.inst) initInstitutions();
    const I = G.inst;
    const cards = Object.entries(INST).map(([k, x]) => {
        const member = I.m[k], why = instEligible(k), hist = (INST_JOIN[k] || {})[G.ck];
        const talks = I.talks && I.talks.k === k;
        let action = "";
        if (member) action = x.invite ? `<span class="tiny good">Member</span>` : `<span class="tiny good">Member</span> <button class="mini secondary danger" data-act="instLeave" data-k="${k}">Withdraw (6 ⚡)</button>`;
        else if (talks) action = `<span class="tiny warn">Accession talks: about ${Math.max(1, Math.round((I.talks.until - G.t) / 4.3))} months left</span>`;
        else if (!instFounded(k)) action = `<span class="tiny muted">Founded in ${x.from}</span>`;
        else if (x.invite) action = `<span class="tiny muted">${why || "By invitation"}</span>`;
        else action = why ? `<span class="tiny muted">${esc(why)}</span>` : `<button class="mini" data-act="instJoin" data-k="${k}" ${G.capital < 5 ? "disabled" : ""}>Apply to join (5 ⚡)</button>`;
        return `<div class="inst ${member ? "member" : ""}"><div class="inst-head"><b>${x.icon} ${esc(instName(k))}</b>${action}</div><p class="tiny muted">${esc(x.desc)}</p>${hist && !member && instFounded(k) ? `<p class="tiny">Historically joined: ${hist}</p>` : hist === undefined && !member && !x.invite && k !== "oecd" ? "" : ""}</div>`;
    }).join("");
    // IMF
    const pr = I.program, crisis = imfCrisis();
    let imf;
    if (!I.m.imf) imf = `<p class="small muted">You are not an IMF member${INST_JOIN.imf[G.ck] ? ` (historically joined ${INST_JOIN.imf[G.ck]})` : ""}.</p>`;
    else if (pr) {
        const due = pr.reviews[pr.next] + pr.start - G.t;
        imf = `<p class="small"><b>${esc(pr.kind)}</b>: ${fmt(pr.amount, 1)}% of GDP. Review ${pr.next + 1} of ${pr.reviews.length} in <b>${Math.max(0, Math.round(due / 4.3))} months</b>. Waivers left: ${pr.waivers}. Interest saved: ${fmt(imfRelief(), 2)}% of GDP a year.</p>
            <ul class="conds">${pr.conds.map(c => { const ok = IMF_CHECK[c.k](c); return `<li class="${ok ? "good" : "bad"}">${ok ? "✔" : "✘"} ${esc(c.t)}</li>`; }).join("")}</ul>
            <p class="tiny muted">Meet every condition by the review (one miss can be waived) or the program is suspended and capital flees. Deficit now ${fmt(G.econ.deficit, 1)}%, inflation ${fmt(G.econ.inflation, 1)}%, revenue ${fmt(G.econ.rev, 1)}% of GDP.</p>`;
    } else imf = `<p class="small">${crisis ? `<b class="warn">${esc(crisis)}.</b> You qualify for Fund support.` : "No crisis: the Fund only lends to countries in balance-of-payments or debt trouble."}</p>
        <p class="tiny muted">Conditions follow the era: devaluation and credit limits before 1980, structural adjustment (subsidies, privatization, free trade, VAT) in the 1980s–90s, social-spending floors and governance from 2000.</p>
        <div class="row"><button data-act="imfRequest" ${!crisis || G.capital < 4 ? "disabled" : ""}>Request an IMF program (4 ⚡)</button></div>`;
    // Lenders
    const lenders = Object.entries(LENDERS).filter(([, l]) => G.year >= l.from).map(([k, l]) => {
        const ok = sovereignNow() && l.ok() && !I.sanctions;
        const used = I.lent.year === G.year ? (I.lent[k] || 0) : 0, cap = G.econ.gdp * l.env / 100;
        return `<div class="cip-row"><span>${esc(l.name)} <span class="tiny muted">${l.share < 0.5 ? "near-grant terms" : `you repay ${Math.round(l.share * 100)}%`}</span></span><span class="tiny ${ok ? "good" : "muted"}">${ok ? `${nominal(Math.max(0, cap - used))} left this year` : "not eligible"}</span></div>`;
    }).join("");
    const queued = (G.cip ? G.cip.queue : []).filter(it => WB_TYPES.includes(it.type)).map(it => {
        const info = projectInfo(it.type), lk = bestLender(it.type);
        return `<div class="cip-row"><span>${info.icon} ${esc(info.name)} <span class="tiny muted">${nominal(it.cost)}</span></span>${it.fin ? `<span class="tiny warn">Appraisal by ${esc(LENDERS[it.fin.lender].name)}</span>` : lk ? `<button class="mini" data-act="finProject" data-id="${it.id}" ${G.capital < 2 ? "disabled" : ""}>Ask ${esc(LENDERS[lk].name)} (2 ⚡)</button>` : `<span class="tiny muted">no lender</span>`}</div>`;
    }).join("") || "<p class='tiny muted'>No infrastructure projects in your capital program queue. Add some on the Budget tab.</p>";
    // Debt relief and the UN
    const dp = Math.round(G.econ.debt / G.econ.gdp * 100);
    const relief = `<p class="small">Debt: <b>${dp}% of GDP</b>.</p>
        <div class="row"><button class="mini" data-act="parisClub" ${!parisClubOk() ? "disabled" : ""}>Paris Club rescheduling (4 ⚡)</button>${G.year >= 1996 ? `<button class="mini" data-act="hipc" ${!hipcOk() ? "disabled" : ""}>Apply for HIPC debt relief (5 ⚡)</button>` : ""}</div>
        <p class="tiny muted">The Paris Club (from 1956) reschedules debts owed to creditor governments, but only alongside an IMF program. HIPC (from 1996) cancels most debt of the poorest countries that follow a poverty-reduction strategy for three years.${I.hipc ? ` Your HIPC completion point: ${I.hipc.done ? "reached" : I.hipc.completion}.` : ""}</p>`;
    const un = `<p class="small">${I.m.un ? `Member${P5().includes(G.ck) ? ", <b>permanent member of the Security Council with a veto</b>" : ""}. You address the General Assembly each September.` : "Not a UN member."}</p>
        ${I.sanctions ? `<p class="small bad">🚫 ${esc(I.sanctions.why)}. Lifted in about ${Math.max(1, Math.round((I.sanctions.until - G.t) / 52))} year(s). Development banks won't lend; growth and investment suffer.</p>` : ""}
        <p class="tiny muted">Start a war and the victim will take you to the Security Council. Permanent members can veto; friends may veto for you.</p>`;
    return `<div class="cols2">
        <div>${panel("Membership", cards)}</div>
        <div>${panel("💵 IMF", imf)}${panel("🏦 Development banks", `${lenders}<h4>Finance projects from your capital program</h4>${queued}<p class="tiny muted">An approved loan starts construction at once, outside your capital budget. Contracts go to international tender. Big dams need environmental and resettlement reviews after 1990.</p>`)}${panel("⚖️ Debt relief", relief)}${panel("🇺🇳 United Nations", un)}</div>
    </div>`;
}
