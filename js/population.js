// ── POPULATION — births, deaths, and who comes and goes ─────────────
//
// Natural growth (births minus deaths) runs every week in economyTick.
// Migration runs monthly:
// - people come when you're richer, safer and freer than where they live,
//   and when your immigration policy lets them in;
// - people leave when home is poor, unstable, at war or repressive, and
//   richer countries will take them (later decades make it easier);
// - neighbours at war send refugees.
// Every flow is booked by country, so the Population tab can show who is
// moving in and where emigrants go.

const IMM_DEFAULT = { usa: "restrictive", canada: "open", australia: "open", newzealand: "open", israel: "open", uae: "guest", saudi: "guest", switzerland: "guest" };
function immDefault() {
    const k = IMM_DEFAULT[G.ck] || (C().preset === "communist" ? "exit_ban" : "restrictive");
    const o = policyOpt("immigration", k);
    return o && (!o.req || o.req(G.gov.type, G)) ? k : "restrictive";
}

// Share of residents born abroad in 1950.
const FOREIGN_1950 = { israel: 0.6, australia: 0.1, canada: 0.15, newzealand: 0.12, usa: 0.07, uk: 0.04, france: 0.05, argentina: 0.15, brazil: 0.03, switzerland: 0.06, venezuela: 0.04, southafrica: 0.03, uruguay: 0.1, singapore: 0.3 };

// Post-war emigration to kin countries overseas (Britons to the dominions, Germans to the Americas).
const KIN_EMIGRATION = { uk: 0.25, germany: 0.12, japan: 0.02 };
const KIN_DEST = { uk: { canada: 3, australia: 3, newzealand: 1.5, southafrica: 1, usa: 1 }, germany: { usa: 2, canada: 1.5, australia: 1, brazil: 0.5, argentina: 0.5 }, japan: { brazil: 2, usa: 1 } };
// Settler countries chose Europeans until their national-origin quotas ended.
const QUOTAS_END = { usa: 1965, canada: 1967, australia: 1973, newzealand: 1974 };

// Where emigrants like to go (relative pull of each destination).
const DEST_PULL = { usa: 2.2, canada: 1.4, australia: 1.4, uk: 1.3, germany: 1.1, france: 1.1, newzealand: 0.8, switzerland: 0.7, israel: 0.3, italy: 0.6, saudi: 0.8, uae: 0.9, singapore: 0.6, argentina: 0.5, brazil: 0.4, southafrica: 0.4, venezuela: 0.5 };
const destPull = k => (DEST_PULL[k] || 0.4) * ((k === "germany" && G.year < 1960) || ((k === "saudi" || k === "uae") && G.year < 1973) ? 0.3 : 1);

function popl() {
    if (!G.popl) G.popl = { stockIn: G.econ.pop * (FOREIGN_1950[G.ck] || 0.01), stockOut: 0, hist: [], year: null };
    const p = G.popl;
    if (!G.pol.immigration) G.pol.immigration = immDefault();
    if (!p.year || p.year.y !== G.year) {
        if (p.year) { p.hist.push(Object.assign({}, p.year, { pop: G.econ.pop })); if (p.hist.length > 30) p.hist.shift(); }
        p.year = { y: G.year, births: 0, deaths: 0, imm: 0, emi: 0, refugees: 0, from: {}, to: {} };
    }
    return p;
}

// Deaths per 100 people a year, from health (an ageing population adds a little late on).
function deathRate() { return clamp(2.9 - G.s.health * 0.028, 0.5, 3) + (G.year > 1990 && G.dev.lit > 90 ? 0.3 : 0); }

// Weekly natural growth (called from economyTick with this year's rate).
function popWeek(popR) {
    const p = popl(), e = G.econ;
    const dr = deathRate(), br = popR + dr;
    p.year.births += e.pop * br / 100 / 52;
    p.year.deaths += e.pop * dr / 100 / 52;
    e.pop *= 1 + popR / 100 / 52;
}

const nationPc = n => n.gdp / Math.max(0.01, n.pop) * 1000;
const nationAtWar = k => G.wars.some(w => !w.over && (w.a.includes(k) || w.b.includes(k)));
const sameClub = (a, b) => Object.entries(G.blocs || {}).some(([bk, m]) => bk === "commonwealth" && m.includes(a) && m.includes(b));

// Rates in % of your population per year.
function migrationRates() {
    const o = curOpt("immigration"), ratio = clamp(gdpPerCapita() / Math.max(1, frontierPC()), 0.01, 1.2);
    const war = playerWars().some(w => commitOf(w) >= 2);
    const why = [];
    let attract = Math.pow(ratio, 1.2) * clamp(G.s.stability / 60, 0.3, 1.3) * (G.econ.unemp > 10 ? 0.5 : G.econ.unemp > 7 ? 0.8 : 1) * (war ? 0.3 : 1) * (0.7 + 0.3 * G.s.liberty / 100);
    let imm = (o.imm || 0.35) * attract * 1.1;
    // The Law of Return: the mass aliyah of 1948-51, a steady flow after, and the Soviet exodus of the 1990s.
    if (G.ck === "israel") imm += 12 * Math.exp(-(G.year - 1950) / 3) + (G.year < 1975 ? 1.2 : 0.5) + (G.year >= 1990 && G.year <= 1995 ? 2.5 : 0);
    const era = clamp((G.year - 1950) / 45, 0.1, 1), gap = clamp(1 - ratio * 2, 0, 1);
    // The very poorest can't afford to leave; big countries send a smaller share.
    const hump = clamp(ratio * 8, 0.3, 1), size = clamp(Math.sqrt(40 / Math.max(1, G.econ.pop)), 0.25, 1.5);
    let emi = (0.02 + 0.35 * gap * era) * hump * size + (KIN_EMIGRATION[G.ck] || 0) * clamp((1972 - G.year) / 22, 0, 1);
    if (gap > 0.3) why.push("better pay abroad");
    if (G.s.stability < 35) { emi += 0.4; why.push("instability"); }
    if (war) { emi += 0.5; why.push("war"); }
    if (G.s.liberty < 20) { emi += 0.15; why.push("repression"); }
    if (G.econ.unemp > 12) { emi += 0.2; why.push("joblessness"); }
    emi *= o.emi != null ? o.emi : 1;
    return { imm, emi, attract, why };
}

function migrantSources() {
    const myPc = gdpPerCapita(), area = C().area;
    if (G.ck === "israel" && G.year < 1968) {
        const w = { iraq: 3, poland: 2, egypt: 1.2, iran: 1, russia: 1, uk: 0.3, usa: 0.3 };
        return Object.entries(w).filter(([k]) => G.nations[k]).map(([k, v]) => [k, v]);
    }
    return Object.values(G.nations).filter(n => n.key !== G.ck && !n.rebel && n.pop > 0.05 && n.gdp > 0 && nationPc(n) < myPc * 0.8).map(n => {
        const push = 1 + (n.stab < 40 ? 1 : 0) + (nationAtWar(n.key) ? 2 : 0) + clamp(1 - nationPc(n) / myPc, 0, 1);
        const quota = QUOTAS_END[G.ck] && G.year < QUOTAS_END[G.ck] ? (n.area === "Europe" ? 4 : 0.15) : 1;
        const exitBan = n.gov === "one_party" ? 0.12 : 1;   // communist states rarely let people go
        return [n.key, Math.sqrt(n.pop) * push * (n.area === area ? 3 : 1) * (sameClub(n.key, G.ck) ? 2.5 : 1) * quota * exitBan];
    }).sort((a, b) => b[1] - a[1]).slice(0, 8);
}

function migrantDestinations() {
    const myPc = gdpPerCapita(), area = C().area, kin = G.year < 1972 ? KIN_DEST[G.ck] || {} : {};
    return Object.values(G.nations).filter(n => n.key !== G.ck && n.status === "sovereign" && !n.rebel && n.gdp > 0 && (nationPc(n) > myPc * 1.5 || kin[n.key])).map(n =>
        [n.key, Math.sqrt(n.gdp) * destPull(n.key) * (n.area === area ? 2.5 : 1) * (sameClub(n.key, G.ck) ? 2 : 1) * (kin[n.key] ? kin[n.key] * 3 : 1)]
    ).sort((a, b) => b[1] - a[1]).slice(0, 8);
}

function spread(list, total, book, sign) {
    const sum = list.reduce((s, [, w]) => s + w, 0);
    if (!sum || total <= 0) return;
    list.forEach(([k, w]) => {
        const x = total * w / sum;
        book[k] = (book[k] || 0) + x;
        const n = G.nations[k];
        if (n) n.pop = Math.max(0.01, n.pop + sign * x);
    });
}

function populationMonthly() {
    const p = popl(), e = G.econ, r = migrationRates(), o = curOpt("immigration");
    const src = migrantSources(), dst = migrantDestinations();
    const inn = src.length ? e.pop * r.imm / 100 / 12 : 0;
    const out = dst.length ? e.pop * r.emi / 100 / 12 : 0;
    spread(src, inn, p.year.from, -1);
    spread(dst, out, p.year.to, 1);
    p.year.imm += inn; p.year.emi += out;
    e.pop += inn - out;
    p.stockIn = p.stockIn * (1 - 0.015 / 12) + inn;
    p.stockOut = p.stockOut * (1 - 0.015 / 12) + out;
    // Skilled immigrants bring know-how; emigrants take some with them.
    if (o.skilled) { G.dev.tech += r.imm * 0.4 / 12; G.dev.uni = Math.min(55, G.dev.uni + r.imm * 0.05 / 12); }
    G.dev.uni = Math.max(0, G.dev.uni - r.emi * 0.01 / 12);
    // Refugees from wars next door.
    if (!G.scenes.some(s => s.id === "refugees") && chance(0.025)) {
        const n = Object.values(G.nations).find(x => x.key !== G.ck && x.area === C().area && !x.rebel && nationAtWar(x.key) && x.pop > 1 && !playerWars().some(w => w.a.includes(x.key) || w.b.includes(x.key)));
        if (n) queueScene("refugees", { who: n.key });
    }
}

// Pulls on other stats.
const foreignShare = () => G.popl ? G.popl.stockIn / Math.max(0.01, G.econ.pop) : 0;
const diasporaShare = () => G.popl ? G.popl.stockOut / Math.max(0.01, G.econ.pop) : 0;
// Money sent home by citizens abroad lifts families out of poverty.
const remittancePoverty = () => -Math.min(4, diasporaShare() * 100 * 0.5);
// Newcomers add workers; leavers take them away.
function migrationGrowth() { if (!G.popl || !G.popl.year) return 0; const r = migrationRates(); return clamp((r.imm - r.emi) * 0.3, -0.8, 1.5); }

SCENES.refugees = a => {
    const n = G.nations[a.who];
    if (!n) return S("🏕️", "", "", "", [ch("OK", {}, "")]);
    const size = Math.min(n.pop * 0.01, G.econ.pop * 0.008);
    const take = (share, extra) => () => {
        const p = popl(), x = size * share;
        G.econ.pop += x; p.year.imm += x; p.year.refugees += x; p.year.from[a.who] = (p.year.from[a.who] || 0) + x; p.stockIn += x;
        n.pop = Math.max(0.01, n.pop - x);
        log(`🏕️ ${fmtPeople(x)} refugees from ${n.name} find shelter in ${C().name}.`, "major");
        return extra || "";
    };
    return S("🏕️", `${n.flag} ${dateStr()} · The border`, `Refugees from ${n.name}`,
        `War in ${n.name} has sent ${fmtPeople(size)} people fleeing toward your border. Camps are filling; the UN refugee agency is ready to help if you let them in.`,
        [ch("Open the border and ask the UN for help", { prestige: 3, stability: -2, aid: 0.15, p: { people: -2 } }, "", { run: take(1, "The UN refugee agency sends tents, food and money (into the treasury).") }),
         ch("Take in a limited number", { prestige: 1, stability: -1 }, "", { run: take(0.35) }),
         ch("Close the border", { prestige: -3, rel: { [a.who]: -5 }, p: { people: 1 } }, "The army turns them back.")]);
};

function fmtPeople(m) {
    if (m >= 1) return `${fmt(m, m >= 10 ? 0 : 1)} million`;
    const n = Math.round(m * 1e6);
    return n >= 1000 ? `${Math.round(n / 1000).toLocaleString("en-US")},000` : n.toLocaleString("en-US");
}

// ── The Population tab ──────────────────────────────────────────────
function viewPopulation() {
    const p = popl(), e = G.econ, r = migrationRates(), y = p.year;
    const dr = deathRate(), popR = e.popR != null ? e.popR : 0, br = popR + dr, net = r.imm - r.emi, total = popR + net;
    const under15 = clamp(5 + br * 9, 12, 50), over65 = clamp(14 - br * 2.6 + (G.s.health - 50) * 0.05, 2, 28), work = 100 - under15 - over65;
    const life = Math.round(30 + G.s.health * 0.5);
    const perK = x => fmt(x * 10, 1);
    const flagList = (o, n) => Object.entries(o).filter(([, v]) => v > 0.000005).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => `<div class="budget-row tre-row"><span>${G.nations[k] ? G.nations[k].flag : ""} ${esc(nationName(k))}</span><b>${fmtPeople(v)}</b></div>`).join("");
    const last = p.hist[p.hist.length - 1];
    const fromList = flagList(y.from, 8) || (last ? flagList(last.from, 8) : "");
    const toList = flagList(y.to, 6) || (last ? flagList(last.to, 6) : "");
    const shownYear = Object.keys(y.from).length ? G.year : last ? last.y : G.year;
    const o = curOpt("immigration");
    const peoplePanel = panel("Population", `
        <div class="standing"><div class="st-rank pop-big">${fmtPeople(e.pop)}</div><div><b class="${total >= 0 ? "good" : "bad"}">${total >= 0 ? "+" : ""}${fmt(total, 1)}% a year</b> <span class="tiny muted">(${total >= 0 ? "+" : "−"}${fmtPeople(Math.abs(e.pop * total / 100))})</span><div class="tiny muted">Natural growth ${fmt(popR, 1)}% · migration ${net >= 0 ? "+" : ""}${fmt(net, 2)}%</div></div></div>
        <div class="budget"><div><small>Births / yr</small><b>${fmtPeople(e.pop * br / 100)}</b><span class="tiny muted">${perK(br)} per 1,000</span></div><div><small>Deaths / yr</small><b>${fmtPeople(e.pop * dr / 100)}</b><span class="tiny muted">${perK(dr)} per 1,000</span></div><div><small>Life expectancy</small><b>${life} yrs</b></div></div>
        <h4>Ages</h4>
        ${meter("Children (under 15)", under15 / 100, true, Math.round(under15) + "%")}
        ${meter("Working age (15–64)", work / 100, true, Math.round(work) + "%")}
        ${meter("Elderly (65+)", over65 / 100, true, Math.round(over65) + "%")}
        <h4>Cities, countryside and work</h4>
        <div class="budget"><div><small>In cities</small><b>${fmtPeople(e.pop * G.dev.urban / 100)}</b><span class="tiny muted">${Math.round(G.dev.urban)}%</span></div><div><small>Countryside</small><b>${fmtPeople(e.pop * (1 - G.dev.urban / 100))}</b></div><div><small>Workforce</small><b>${fmtPeople(laborForce())}</b><span class="tiny muted">${fmt(e.unemp, 1)}% jobless · ${Math.round(formalShare() * 100)}% formal</span></div></div>
        <div class="spark-row"><small>Population</small>${sparkline("p", "#7bd88f") || "<span class='tiny muted'>history builds as you play</span>"}</div>
        <p class="tiny muted">Births fall as literacy and cities spread (and with family planning); deaths fall as health improves. Poor countries grow fastest once health improves but schooling hasn't yet caught up.</p>`);
    const regionsPanel = panel("Where people live", G.regions.map(rg => `<div class="budget-row tre-row"><span>${esc(rg.n)} <span class="tiny muted">support ${Math.round(regionSupport(rg))}%</span></span><b>${fmtPeople(e.pop * rg.pop / 100)}</b></div>`).join(""));
    const migPanel = panel("Migration", `
        <div class="budget"><div><small>Arriving / yr</small><b class="good">${fmtPeople(e.pop * r.imm / 100)}</b><span class="tiny muted">${fmt(r.imm, 2)}%</span></div><div><small>Leaving / yr</small><b class="bad">${fmtPeople(e.pop * r.emi / 100)}</b><span class="tiny muted">${fmt(r.emi, 2)}%</span></div><div><small>Born abroad</small><b>${fmtPeople(p.stockIn)}</b><span class="tiny muted">${fmt(foreignShare() * 100, 1)}% of residents</span></div></div>
        <p class="tiny">🛂 Policy: <b>${esc(optName(o))}</b>. ${r.attract > 0.5 ? "Your wealth and stability draw people from far away." : r.attract > 0.15 ? "Some people want to come: you're richer than your neighbours." : "Few want to come: incomes are low compared with richer countries."}${r.why.length ? ` People leave because of ${r.why.join(", ")}.` : ""}</p>
        <h4>Who's moving in${shownYear !== G.year ? ` (${shownYear})` : ` (${G.year} so far)`}</h4>${fromList || "<p class='tiny muted'>Hardly anyone yet.</p>"}
        ${y.refugees > 0 ? `<p class="tiny">🏕️ Including ${fmtPeople(y.refugees)} refugees this year.</p>` : ""}
        <h4>Where emigrants go</h4>${toList || "<p class='tiny muted'>Hardly anyone leaves.</p>"}
        ${p.stockOut > 0.0005 ? `<p class="tiny">🌍 Citizens living abroad: ${fmtPeople(p.stockOut)}. ${remittancePoverty() < -0.4 ? `Money they send home cuts poverty by ${fmt(-remittancePoverty(), 1)} points.` : ""}</p>` : ""}`);
    const rows = p.hist.slice(-10).reverse().map(h => `<tr><td>${h.y}</td><td>${fmtPeople(h.pop)}</td><td>${fmtPeople(h.births)}</td><td>${fmtPeople(h.deaths)}</td><td class="good">${fmtPeople(h.imm)}</td><td class="bad">${fmtPeople(h.emi)}</td></tr>`).join("");
    const histPanel = rows ? panel("Year by year", `<div class="table-wrap"><table><tr><th>Year</th><th>People</th><th>Births</th><th>Deaths</th><th>Arrived</th><th>Left</th></tr>${rows}</table></div>`) : "";
    return `<div class="cols2"><div>${peoplePanel}${peoplesPanel()}${histPanel}</div><div>${migPanel}${frameworkDetail("immigration")}</div></div>`;
}
