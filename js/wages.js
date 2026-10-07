// ── WAGES, TALENT & THE MIDDLE-INCOME TRAP ──────────────────────────
//
// - Wages: an absolute ruler can decree them higher; elsewhere it takes a
//   law. Pay that runs ahead of what workers' skills justify makes cheap
//   manufacturing uncompetitive: factories move to cheaper neighbours
//   before the country is skilled enough for high-tech work.
// - Talent: graduates need high-skill jobs. Educate people without
//   creating those jobs, while pay lags the rich world, and the brightest
//   take their state-funded degrees to the US or Brazil. Create the jobs
//   and they stay, or come home.
// - Development projects: workforce housing, state research parks and
//   vocational institutes that build the skills and jobs to climb.

// Share of each sector's jobs that are high-skill, high-paying.
const HS_SHARE = { agriculture: 0.03, mining: 0.12, oil: 0.3, textiles: 0.06, steel: 0.12, machinery: 0.25, chemicals: 0.35, shipbuilding: 0.15, autos: 0.2, electronics: 0.3, aerospace: 0.5, computing: 0.6, renewables: 0.4, ai: 0.75, finance: 0.55, film: 0.35, tourism: 0.1 };
// Sectors that live on cheap labour, and those that live on skills.
const LABOR_INTENSIVE = ["textiles", "agriculture", "tourism", "autos", "electronics", "shipbuilding"];
const SKILL_INTENSIVE = ["machinery", "chemicals", "aerospace", "computing", "renewables", "ai", "finance", "film"];

// ── Wages ───────────────────────────────────────────────────────────
// How much skills justify paying above a poor country's going rate.
function skillLevel() { return clamp(G.dev.lit / 100 * 0.35 + Math.min(1, G.dev.uni / 15) * 0.35 + Math.min(1, G.dev.tech / 150) * 0.3 + (lawOn("vocational") ? lawMult("vocational") * 0.06 : 0) + devFx("skill"), 0, 1); }
const skillPremium = () => 0.02 + skillLevel() * 0.35;
// The premium the law forces on employers.
function wagePremium() {
    let p = 0;
    if (lawOn("wage_decree")) p += lawMult("wage_decree") * 0.4;
    if (lawOn("minimum_wage")) p += Math.max(0, (20 + lawLevel("minimum_wage") * 60) - 45) / 100 * 0.6;
    p += { bargaining: 0.04, restrict: -0.05 }[G.pol.labor] || 0;
    return p;
}
// Positive = pay outruns skills (factories leave); negative = cheap labour advantage.
const wageGap = () => wagePremium() - skillPremium();

function wageInd(k) {
    const gap = wageGap();
    if (LABOR_INTENSIVE.includes(k) && !(k === "electronics" && G.dev.tech > 100)) return gap > 0 ? -gap * 15 : k === "agriculture" ? 0 : clamp((-gap - 0.1) * 3, 0, 0.5);
    if (SKILL_INTENSIVE.includes(k)) return Math.max(0, skillLevel() - 0.5) * 1.2;
    return 0;
}
const wageUnemp = () => Math.max(0, wageGap()) * 15;
const wagePoverty = () => -wagePremium() * 8;
const wageInflation = () => Math.max(0, wagePremium()) * 3;
const wageOdds = sector => LABOR_INTENSIVE.includes(sector) ? -Math.max(0, wageGap()) * 0.8 : SKILL_INTENSIVE.includes(sector) ? (skillLevel() - 0.5) * 0.2 : 0;

// Average monthly wage (nominal dollars).
function avgWage() { return G.econ.gdp * cpi() * 1e9 * 0.5 / Math.max(0.01, laborForce() * 1e6) / 12 * (1 + wagePremium()); }
function jobSplit(jobsK, sector) {
    const hs = HS_SHARE[sector] || 0.1, w = avgWage();
    return { high: jobsK * hs, low: jobsK * (1 - hs), highPay: w * 2.8, lowPay: w * 0.8 };
}
function jobSplitText(jobsK, sector) {
    const s = jobSplit(jobsK, sector);
    return `${fmtJobs(s.high)} high-paying (~$${Math.round(s.highPay).toLocaleString("en-US")}/mo) · ${fmtJobs(s.low)} lower-wage (~$${Math.round(s.lowPay).toLocaleString("en-US")}/mo)`;
}

// Cheaper neighbours competing for the same factories.
function cheaperRivals() {
    const myPc = gdpPerCapita() * (1 + wagePremium());
    return Object.values(G.nations).filter(n => n.key !== G.ck && n.area === C().area && n.status === "sovereign" && !n.rebel && n.pop > 2 && nationPc(n) < myPc * 0.8).sort((a, b) => nationPc(a) - nationPc(b)).slice(0, 3);
}

// Middle-income trap: past cheap-labour growth, not yet skilled enough for more.
function trapRisk() {
    const ratio = gdpPerCapita() / Math.max(1, frontierPC()), s = skillLevel();
    if (ratio < 0.1 || ratio > 0.55) return null;
    const structural = [], active = [];
    if (s < 0.55) structural.push(`skills are still low (${Math.round(s * 100)}/100)`);
    const hsShare = SKILL_INTENSIVE.reduce((t, k) => t + (indAvailable(k) ? indShare(k) : 0), 0);
    if (hsShare < 8) structural.push(`high-skill industries are only ${fmt(hsShare, 1)}% of GDP`);
    if (wageGap() > 0.05) active.push("wages are outrunning skills");
    if (talentFlow().drain > 1) active.push("graduates are leaving");
    if (G.econ.growth < 3 && G.year > 1955) active.push(`growth has slowed to ${fmt(G.econ.growth, 1)}%`);
    return structural.length && active.length ? active.concat(structural) : null;
}

// Yearly: labour-intensive foreign factories leave when wages outrun skills.
function wagesYearly() {
    const gap = wageGap();
    if (gap <= 0.05) return;
    (G.firms || []).filter(f => f.foreign && !f.closed && LABOR_INTENSIVE.includes(f.sector)).forEach(f => {
        if (!chance(gap * 0.3)) return;
        f.closed = true;
        G.ind[f.sector].out = Math.max(0.0001, G.ind[f.sector].out - f.out * 0.8);
        G.econ.jobsAdded = (G.econ.jobsAdded || 0) - f.jobs / Math.max(1, laborForce() * 1000) * 100;
        const to = cheaperRivals()[0];
        log(`🏭 ${f.name} closes its plant${to ? ` and moves to ${to.name}, where wages are lower` : ""}: ${fmtJobs(f.jobs)} jobs lost.`, "bad");
    });
}

// ── Talent ──────────────────────────────────────────────────────────
// Graduates (% of workforce) vs high-skill jobs (% of workforce).
function hsJobs() {
    let s = 0;
    Object.keys(G.ind).forEach(k => { if (indAvailable(k)) s += indShare(k) * (HS_SHARE[k] || 0.1) * 0.45; });
    s += G.econ.services / G.econ.gdp * 100 * 0.06;
    // A poor economy has few posts that need a degree, whatever its industries.
    s *= clamp(0.1 + skillLevel() * 1.5, 0.1, 1.2);
    s += devFx("hsJobs") + (typeof cultureFx === "function" ? cultureFx("hsJobs") : 0);
    return Math.max(0.05, s);
}
function gradSupply() { return G.dev.uni + (typeof cultureFx === "function" ? cultureFx("grads") : 0); }

function talentFlow() {
    const grads = gradSupply(), jobs = hsJobs();
    const ratio = clamp(gdpPerCapita() * (1 + Math.max(0, wagePremium())) / Math.max(1, frontierPC()), 0, 1.2);
    const pull = clamp(1 - ratio, 0, 1);                       // how much better pay is abroad
    const surplus = Math.max(0, grads - jobs) / Math.max(0.1, grads);
    const shortage = Math.max(0, jobs - grads) / Math.max(0.1, jobs);
    let stay = 1;
    if (lawOn("bonded_scholarships")) stay -= lawMult("bonded_scholarships") * 0.5;
    if (typeof cultureFx === "function") stay -= Math.min(0.3, cultureFx("retain"));
    if (G.culture && G.culture.royalScholars) stay -= 0.15;
    // % of graduates leaving / arriving per year.
    const drain = Math.max(0, (surplus * 4 + 0.5) * pull * Math.max(0.3, stay) * (G.pol.immigration === "exit_ban" ? 0.15 : 1));
    const gain = shortage * 3 * clamp(ratio, 0.1, 1) * (lawOn("diaspora_return") ? 1 + lawMult("diaspora_return") : 1) * (G.pol.immigration === "skilled" ? 1.5 : 1);
    return { grads, jobs, drain, gain, pull, surplus, shortage };
}

function talentMonthly() {
    const t = talentFlow(), p = typeof popl === "function" ? popl() : null;
    const out = G.dev.uni * t.drain / 100 / 12, inn = G.dev.uni * t.gain / 100 / 12;
    G.dev.uni = clamp(G.dev.uni - out + inn, 0, 55);
    G.dev.tech += inn * 0.8 - out * 0.4;
    if (p) {
        const people = laborForce() * out / 100;   // millions
        p.year.brainOut = (p.year.brainOut || 0) + people;
        p.year.brainIn = (p.year.brainIn || 0) + laborForce() * inn / 100;
        if (people > 0 && typeof migrantDestinations === "function") { const d = migrantDestinations(); if (d[0]) p.year.brainTo = p.year.brainTo || {}, d.slice(0, 3).forEach(([k], i) => { p.year.brainTo[k] = (p.year.brainTo[k] || 0) + people * [0.5, 0.3, 0.2][i]; }); }
    }
}

// ── Development projects ────────────────────────────────────────────
const DEV_PROJECTS = {
    workforce: { name: "Workforce housing", icon: "🏘️", cost: 0.4, years: 2, desc: "Decent homes next to the industrial zones: workers move in, factories can hire.", benefit: "Housing +8, unemployment −0.4, more investors (+4% odds), poverty −1.", housing: 8, unemp: -0.4, odds: 0.04, poverty: -1 },
    research: { name: "State research park", icon: "🔬", cost: 0.8, years: 3, desc: "Labs, incubators and a science university side by side.", benefit: "High-skill jobs for 0.5% of the workforce; technology +0.5/yr; tech companies far more likely to come.", hsJobs: 0.5, tech: 0.5, odds: 0.03, oddsHS: 0.1, req: () => G.dev.uni < 1 ? `University-educated 1% (now ${fmt(G.dev.uni, 2)}%)` : null },
    vocational: { name: "National vocational institutes", icon: "🛠️", cost: 0.4, years: 2, desc: "Welders, electricians, machinists and nurses, trained to industry standards.", benefit: "Skills +0.05 (wages can rise without losing factories); more investors.", skill: 0.05, odds: 0.03 },
    techhub: { name: "State tech & design campus", icon: "💡", cost: 1, years: 3, from: 1975, desc: "A campus for software, design and engineering firms, with state-owned anchor tenants.", benefit: "High-skill jobs for 0.6% of the workforce; computing and electronics grow faster.", hsJobs: 0.6, ind: { computing: 1, electronics: 0.8 }, tech: 0.3, req: () => G.dev.uni < 2 ? `University-educated 2% (now ${fmt(G.dev.uni, 1)}%)` : null },
    logistics: { name: "Cold-chain & logistics hub", icon: "🚚", cost: 0.5, years: 2, from: 1960, desc: "Refrigerated warehouses, packing houses and freight links for fresh exports.", benefit: "Farm exports grow faster; processed and fresh exports easier to build.", ind: { agriculture: 0.6 }, chain: 0.05 }
};
function devState() { if (!G.devp) G.devp = { list: [] }; return G.devp; }
function devLock(k) {
    const D = DEV_PROJECTS[k];
    if (D.from && G.year < D.from) return `From ${D.from}`;
    return D.req ? D.req() : null;
}
function devBuild(k, region) {
    const D = DEV_PROJECTS[k], lock = devLock(k);
    if (lock) return toast("Not yet", lock);
    if (G.capital < 3) return toast("Not enough political capital", "It costs 3.");
    G.capital -= 3;
    const r = +region || 0, cost = G.econ.gdp * D.cost / 100;
    devState().list.push({ k, region: r, cost, done: 0, weeks: Math.round(D.years * 52), stage: "building" });
    log(`🏗️ Work begins on ${D.name.toLowerCase()} in ${G.regions[r] ? G.regions[r].n : "the capital"} (${nominal(cost)}).`, "policy");
}
function devWeek() {
    if (!G.devp) return;
    G.devp.list.forEach(x => {
        if (x.stage !== "building" || G.s.stability < 25) return;
        const step = x.cost / x.weeks;
        treasuryPay(step); x.done += step;
        if (x.done >= x.cost - 1e-9) {
            x.stage = "open"; x.opened = G.year;
            const D = DEV_PROJECTS[x.k];
            if (G.regions[x.region]) G.regions[x.region].mod += 4;
            addJobs(jobsFor(x.cost * 0.1, D.hsJobs ? "computing" : "machinery"));
            log(`✅ ${D.name} opens in ${G.regions[x.region] ? G.regions[x.region].n : "the capital"}. ${D.benefit}`, "good");
        }
    });
}
const devOpen = () => G.devp ? G.devp.list.filter(x => x.stage === "open") : [];
function devFx(key) {
    return devOpen().reduce((s, x) => { const D = DEV_PROJECTS[x.k]; return s + (D[key] || 0); }, 0);
}
function devInd(k) { return devOpen().reduce((s, x) => s + ((DEV_PROJECTS[x.k].ind || {})[k] || 0), 0); }

// ── The Exports & Jobs tab ──────────────────────────────────────────
function viewExports() { return `<div class="cols2"><div>${exportsPanel()}${devPanel()}</div><div>${wagesPanel()}${talentPanel()}</div></div>`; }
function wagesPanel() {
    const gap = wageGap(), prem = wagePremium(), sp = skillPremium(), riv = cheaperRivals(), trap = trapRisk();
    const status = gap > 0.12 ? ["bad", "Wages are well ahead of skills: cheap factories are leaving and jobs are disappearing."] : gap > 0.03 ? ["warn", "Wages are a little ahead of skills: labour-intensive industry is starting to suffer."] : gap < -0.1 ? ["good", "Labour is cheap for its skill level: factories want to come, but pay is low and graduates look abroad."] : ["", "Wages are in line with skills."];
    return panel("Wages & competitiveness", `
        <div class="budget"><div><small>Average wage</small><b>$${Math.round(avgWage()).toLocaleString("en-US")}</b><span class="tiny muted">a month</span></div><div><small>Legal wage push</small><b class="${prem > sp ? "bad" : ""}">${prem >= 0 ? "+" : ""}${Math.round(prem * 100)}%</b><span class="tiny muted">above market</span></div><div><small>Skills justify</small><b>+${Math.round(sp * 100)}%</b><span class="tiny muted">skill level ${Math.round(skillLevel() * 100)}/100</span></div></div>
        <p class="tiny ${status[0]}">${status[1]}</p>
        ${riv.length ? `<p class="tiny">Competing for the same factories: ${riv.map(n => `${n.flag} ${esc(n.name)} (about ${Math.round(nationPc(n) / Math.max(1, gdpPerCapita() * (1 + prem)) * 100)}% of your pay)`).join(", ")}.</p>` : ""}
        <p class="tiny">Labour-intensive industries (textiles, farming, tourism, assembly) ${gap > 0 ? `grow <b class="bad">${fmt(gap * 15, 1)} pts/yr slower</b>` : `get a <b class="good">+${fmt(Math.min(1, -gap * 4), 1)} pts/yr</b> cost edge`}; skill-intensive industries ${skillLevel() >= 0.5 ? "<b class='good'>gain</b>" : "<b class='bad'>lag</b>"} with your skill level.</p>
        ${trap ? `<p class="small bad">⚠️ <b>Middle-income trap risk:</b> ${trap.join("; ")}. Raise skills and high-skill jobs before pushing wages.</p>` : ""}
        <div class="row"><button class="mini" data-act="lawGo" data-k="wage_decree">📜 Wage decree</button><button class="mini secondary" data-act="lawGo" data-k="minimum_wage">Minimum wage</button><button class="mini secondary" data-act="lawGo" data-k="vocational">Vocational training</button></div>
        <p class="tiny muted">${hasLegislature() ? "Wage laws must pass the legislature." : "As the sovereign, you can decree wages directly."} Skills (literacy, graduates, technology, vocational training) raise what the economy can afford to pay.</p>`);
}

function talentPanel() {
    const t = talentFlow(), p = typeof popl === "function" ? popl() : null, last = p && p.hist[p.hist.length - 1];
    const to = (p && p.year.brainTo && Object.keys(p.year.brainTo).length ? p.year.brainTo : last && last.brainTo) || {};
    const dest = Object.entries(to).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => `${G.nations[k] ? G.nations[k].flag : ""} ${esc(nationName(k))}`).join(", ");
    const leaving = laborForce() * G.dev.uni * t.drain / 100 / 100, arriving = laborForce() * G.dev.uni * t.gain / 100 / 100;
    return panel("Talent: brain drain & brain gain", `
        <div class="budget"><div><small>Graduates</small><b>${fmt(t.grads, t.grads < 1 ? 2 : 1)}%</b><span class="tiny muted">of the workforce</span></div><div><small>High-skill jobs</small><b>${fmt(t.jobs, t.jobs < 1 ? 2 : 1)}%</b><span class="tiny muted">of the workforce</span></div><div><small>Leaving / yr</small><b class="${t.drain > t.gain ? "bad" : ""}">${fmtPeople(leaving)}</b><span class="tiny muted">${fmt(t.drain, 1)}% of graduates</span></div></div>
        ${t.gain > 0.05 ? `<p class="tiny good">Brain gain: about ${fmtPeople(arriving)} graduates arriving or coming home each year.</p>` : ""}
        <p class="tiny">${t.surplus > 0.2 ? `<b class="bad">More graduates than high-skill jobs:</b> ${Math.round(t.surplus * 100)}% can't find work that uses their degree` : t.shortage > 0.2 ? `<b class="good">More high-skill jobs than graduates:</b> employers are recruiting abroad` : "Graduates and high-skill jobs are roughly in balance"}. ${t.pull > 0.5 ? "Pay abroad is many times higher." : ""}${dest ? ` Most go to ${dest}.` : ""}</p>
        <p class="tiny muted">Keep talent by creating high-skill jobs (research parks, tech campuses, value-added plants, foreign tech firms, a lively culture) before or alongside new universities. Bonded scholarships and diaspora return programs help.</p>
        <div class="row"><button class="mini secondary" data-act="lawGo" data-k="bonded_scholarships">Bonded scholarships</button><button class="mini secondary" data-act="lawGo" data-k="diaspora_return">Diaspora return</button></div>`);
}

function devPanel() {
    const L = devState();
    const built = L.list.map(x => { const D = DEV_PROJECTS[x.k], r = G.regions[x.region]; return x.stage === "open" ? `<div class="budget-row tre-row"><span>${D.icon} ${esc(D.name)} <span class="tiny muted">${esc(r ? r.n : "")} · ${x.opened}</span></span><b class="good">open</b></div>` : meter(`${D.icon} ${esc(D.name)} <span class="tiny muted">${esc(r ? r.n : "")}</span>`, x.done / x.cost, true, Math.round(x.done / x.cost * 100) + "%"); }).join("");
    const opts = Object.entries(DEV_PROJECTS).map(([k, D]) => {
        const lock = devLock(k);
        return `<div class="mega-row ${lock ? "locked" : ""}"><div style="flex:1"><b>${D.icon} ${esc(D.name)}</b> <span class="tiny muted">~${nominal(G.econ.gdp * D.cost / 100)} · ${D.years} yrs</span><p class="tiny">${esc(D.desc)} ${esc(D.benefit)}</p>${lock ? `<p class="tiny warn">🔒 ${esc(lock)}</p>` : `<select data-change="devRegion" data-k="${k}">${G.regions.map((r, i) => `<option value="${i}">${esc(r.n)}</option>`).join("")}</select>`}</div>${lock ? "" : `<button class="mini" data-act="devBuild" data-k="${k}" ${G.capital < 3 ? "disabled" : ""}>Build (3 ⚡)</button>`}</div>`;
    }).join("");
    return panel("Development projects", `${built ? `${built}<h4>Start another</h4>` : ""}${opts}<p class="tiny muted">Projects can be built more than once, in different regions. Subsidized commercial rent and start-up grants are programs in the Lawbook.</p><div class="row"><button class="mini secondary" data-act="lawGo" data-k="commercial_rent">Subsidized commercial rent</button><button class="mini secondary" data-act="lawGo" data-k="small_business">Start-up grants</button></div>`);
}
