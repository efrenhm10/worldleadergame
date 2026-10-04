// ── GOVERNMENT — lawmaking, elections, threats, succession, reform ──

// ── How a policy change happens under your system ───────────────────

function policyMethod(area) {
    const type = G.gov.type, a = POLICY[area];
    if (type === "colony") {
        if (!G.colony || G.colony.stage < 1) return { m: "blocked", why: "The colonial government controls policy. Win self-government first." };
        if (!["education", "health", "welfare", "labor", "land", "infra"].includes(area)) return { m: "blocked", why: "Reserved to the colonial power until independence." };
        return { m: "council", why: "Your ministers can propose this to the Legislative Council, subject to the Governor's assent." };
    }
    if (type === "occupied" && ["military", "draft", "nuclear", "security"].includes(area)) return { m: "blocked", why: `Reserved to the ${pillarName("occupation")} until sovereignty is restored.` };
    if (G.mil.noArmy && ["military", "draft", "nuclear"].includes(area) && type !== "occupied") return { m: "blocked", why: "You have no armed forces. Rearmament needs a constitutional change." };
    if (type === "monarchy" && G.gov.sub !== "constitutional") return { m: "decree", why: "By royal decree." };
    if (type === "military_junta") return { m: "decree", why: "By decree of the junta." };
    if (type === "one_party") return { m: "politburo", why: "By Party decree, if the Politburo goes along." };
    if (type === "dominant_party") return { m: "rubber", why: "The party's congress will approve it, at a price in favors." };
    return { m: "bill", eo: !!a.eo && GT().execOrders, why: `Must pass the ${G.leg.name}.` };
}

function policyCost(area) {
    const base = POLICY[area].cost;
    const m = policyMethod(area).m;
    return Math.round(base * ({ decree: 0.8, politburo: 0.9, rubber: 0.9, bill: 0.6, council: 0.7 }[m] || 1));
}

// How much each pillar likes a change from the current option to `o`.
function changeReaction(area, k) {
    const cur = curOpt(area), nu = policyOpt(area, k);
    const r = {};
    Object.keys(G.pillars).forEach(p => {
        const d = ((nu.p && nu.p[p]) || 0) - ((cur.p && cur.p[p]) || 0);
        if (d) r[p] = d;
    });
    return r;
}

function changePopularity(area, k) {
    const r = changeReaction(area, k);
    let s = 0, w = 0;
    Object.entries(GT().pillars).forEach(([p, wt]) => { s += (r[p] || 0) * wt * (p === "people" ? 1.5 : 1); w += wt; });
    return clamp(s / w / 10, -1.5, 1.5);
}

function ideoStance(ideo, k) {
    const id = IDEOLOGIES[ideo];
    if (!id) return 0;
    if (id.likes.includes(k)) return 1;
    if (id.hates.includes(k)) return -1;
    return 0;
}

// Projected vote of each faction on a bill.
function billForecast(bill) {
    const pop = changePopularity(bill.area, bill.k);
    const cur = G.pol[bill.area];
    const leg = skill("legislation");
    let yes = 0, varsum = 0;
    const rows = G.factions.map(f => {
        let st = ideoStance(f.ideo, bill.k) - ideoStance(f.ideo, cur) * 0.5;
        let p;
        if (f.gov) p = 0.5 + f.loyalty / 220 + st * 0.2 + pop * 0.08 + (bill.whip ? 0.12 : 0) + leg * 0.02;
        else p = 0.12 + st * 0.28 + pop * 0.12 + (f.loyalty - 30) / 300;
        if (bill.conc && bill.conc[f.k]) p += 0.22;
        if (bill.favor && bill.favor[f.k]) p += 0.3;
        if (G.gov.cohabitation && !f.gov) p -= 0.08;
        p = clamp(p, 0.02, 0.98);
        yes += f.seats * p; varsum += f.seats * p * (1 - p);
        return { f, p, exp: f.seats * p };
    });
    const need = majority();
    const sd = Math.sqrt(varsum) * 1.6 + G.leg.total * 0.015;
    const z = (yes - need + 0.5) / Math.max(1, sd);
    const prob = 1 / (1 + Math.exp(-1.7 * z));
    return { rows, yes, need, prob, sd };
}

function bumpCooldown(area) { G.polCool[area] = G.t + 12; }
function onCooldown(area) { return G.polCool[area] && G.polCool[area] > G.t; }

function enactPolicy(area, k, how) {
    const reaction = changeReaction(area, k);
    const p = {};
    Object.entries(reaction).forEach(([pk, v]) => { p[pk] = v * 0.5; });
    const ch = applyEffects({ p });
    // Ideology consistency.
    const st = ideoStance(G.leader.ideology, k);
    const mult = trait("idealist") ? 2 : trait("pragmatist") && st < 0 ? 0.5 : 1;
    const partyPillar = G.pillars.politburo ? "politburo" : G.pillars.party ? "party" : null;
    if (st && partyPillar) {
        ch.push(...applyEffects({ p: { [partyPillar]: (st > 0 ? 3 : -6) * mult }, fac: { mine: (st > 0 ? 3 : -5) * mult } }));
    }
    const old = curOpt(area);
    G.pol[area] = k;
    bumpCooldown(area);
    const o = policyOpt(area, k);
    log(`${POLICY[area].icon} ${how}: ${POLICY[area].name} changed from "${optName(old)}" to "${optName(o)}".`, "policy");
    if (area === "nuclear" && k === "weapons" && G.mil.nukes < 2) G.tension = clamp(G.tension + 2);
    if (area === "resources" && k === "nationalized" && C().res.includes("oil") && G.year < 1975) queueScene("nationalization_backlash", {});
    return ch;
}

function voteOnBill(bill) {
    const fc = billForecast(bill);
    const yes = Math.round(clamp(fc.yes + gauss() * fc.sd, 0, G.leg.total));
    const passed = yes >= fc.need;
    G.capital -= bill.cost;
    if (bill.whip) G.capital -= whipCost();
    Object.keys(bill.conc || {}).forEach(fk => { G.econ.debt += G.econ.gdp * 0.0015; });
    Object.keys(bill.favor || {}).forEach(fk => { G.ious.push({ f: fk, t: G.t, due: G.t + 26 + Math.floor(rnd(0, 30)) }); });
    G.factions.forEach(f => {
        const r = fc.rows.find(x => x.f === f);
        if (f.gov && r.p < 0.4 && passed) f.loyalty -= 2;
    });
    const o = policyOpt(bill.area, bill.k);
    if (passed) {
        const ch = enactPolicy(bill.area, bill.k, `${G.leg.name} passes`);
        record(`Passed: ${optName(o)} (${POLICY[bill.area].name}), ${yes}–${G.leg.total - yes}.`);
        toast("Bill passes", `${optName(o)} passes the ${G.leg.name}, ${yes} to ${G.leg.total - yes}.`, ch);
        if (GT().referendums && chance(clamp(0.2 - changePopularity(bill.area, bill.k) * 0.25, 0.05, 0.6))) queueScene("referendum", { area: bill.area, k: bill.k, old: bill.old });
    } else {
        bumpCooldown(bill.area);
        const ch = applyEffects({ capital: -2, p: { party: -3, coalition: -3 }, legitimacy: -1 });
        log(`📜 Bill defeated: ${optName(o)}, ${yes}–${G.leg.total - yes}.`, "bad");
        toast("Bill defeated", `The ${G.leg.name} votes down ${optName(o)}, ${yes} to ${G.leg.total - yes}.`, ch);
        if (G.gov.type === "parliamentary" && fc.prob < 0.35 && chance(0.25)) queueScene("no_confidence", { cause: "bill" });
    }
    return passed;
}

const whipCost = () => Math.max(3, 8 - skill("legislation"));

function decreePolicy(area, k) {
    const m = policyMethod(area).m;
    const cost = policyCost(area);
    if (G.capital < cost) return toast("Not enough political capital", `You need ${cost}.`);
    if (m === "politburo") {
        const st = G.factions.reduce((s, f) => s + f.seats * clamp(0.45 + f.loyalty / 200 + (ideoStance(f.ideo, k) - ideoStance(f.ideo, G.pol[area]) * 0.5) * 0.25, 0, 1), 0) / G.leg.total;
        if (st < 0.5 && !chance(st * 1.4)) {
            G.capital -= Math.round(cost / 2);
            queueScene("politburo_resists", { area, k });
            return;
        }
    }
    G.capital -= cost;
    if (m === "rubber") applyEffects({ p: { party: -2 } });
    if (m === "council") {
        const ok = chance(clamp((G.pillars.colonial ? G.pillars.colonial.l : 50) / 70, 0.15, 0.95));
        if (!ok) { bumpCooldown(area); log("The Governor withholds assent.", "bad"); return toast("Governor refuses assent", "The colonial government blocks your bill."); }
    }
    const ch = enactPolicy(area, k, m === "decree" ? "Decree" : m === "politburo" ? "Party decree" : m === "rubber" ? "Congress approves" : "Council passes");
    toast("Policy enacted", `${optName(policyOpt(area, k))}`, ch);
}

function executiveOrder(area, k) {
    const cost = policyCost(area) + 6;
    if (G.capital < cost) return toast("Not enough political capital", `You need ${cost}.`);
    G.capital -= cost;
    const ch = enactPolicy(area, k, "Executive order");
    ch.push(...applyEffects({ legitimacy: -3, p: { party: -2, press: -3 } }));
    toast("Executive order signed", optName(policyOpt(area, k)), ch);
    if (G.s.liberty > 55 && chance(0.25)) G.flags.court_challenge = { area, old: G.pol[area] === k ? null : null, k, prev: null, due: G.t + 10 };
}

// ── Elections ───────────────────────────────────────────────────────

function campaignSeason() {
    const next = nextVote();
    return next && next.weeks <= 16;
}

function nextVote() {
    const opts = [];
    if (G.gov.nextElection) opts.push({ ym: G.gov.nextElection, kind: GT().democracy && G.gov.type !== "parliamentary" && G.gov.type !== "occupied" && G.gov.type !== "directorial" ? "presidential" : G.gov.type === "directorial" ? "council" : "general" });
    if (G.gov.legNext) opts.push({ ym: G.gov.legNext, kind: "legislative" });
    if (G.gov.type === "dominant_party" && G.gov.termEnds) opts.push({ ym: G.gov.termEnds, kind: "sexenio" });
    if (!opts.length) return null;
    opts.sort((a, b) => ymNum(...a.ym) - ymNum(...b.ym));
    const o = opts[0];
    return Object.assign(o, { weeks: weeksUntil(o.ym) });
}

// Vote share. Presidential races are two-way contests (win at 50%);
// party shares start from the party's current strength in the legislature.
function electionShare(kind, noise = true) {
    const swing = (approval() - 50) * 0.65 + (G.econ.growth - 3) * 1.1 - Math.max(0, G.econ.inflation - 5) * 0.45 - Math.max(0, G.econ.unemp - 7) * 0.45
        + G.campaign.bonus + skill("oratory") * 0.5 - G.s.scandal * 0.07 + 1.5;
    let s;
    if (kind === "presidential") s = 50 + swing;
    else {
        const seatShare = 100 * mySeats() / Math.max(1, G.leg.total);
        s = 24 + seatShare * 0.38 + swing * 0.6;
        if (kind === "legislative" && ["presidential", "semi_presidential"].includes(G.gov.type)) s -= 2;
    }
    if (G.gov.type === "dominant_party") s = Math.max(s, 55) + (G.pillars.party.l - 50) * 0.3;
    if (G.flags.rigging) s += 10;
    return clamp(s + (noise ? gauss() * 3 : 0), 5, 92);
}

function allocateSeats(share) {
    const parties = G.parties;
    const mine = parties.find(p => p.k === G.leader.party);
    const others = parties.filter(p => p !== mine);
    const otherTot = others.reduce((s, p) => s + Math.max(1, p.seats), 0) || 1;
    const fptp = G.leg.system === "fptp";
    const res = {};
    parties.forEach(p => { res[p.k] = 0; });
    G.regions.forEach(r => {
        const sr = clamp(share + (r.lean[G.leader.party] || 0) * 0.8 + r.mod * 0.4 + regionAffinity(r) * 0.5, 3, 95);
        const shares = { [mine.k]: sr };
        others.forEach(p => { shares[p.k] = (100 - sr) * Math.max(1, p.seats) / otherTot * rnd(0.8, 1.2) * Math.max(0.2, 1 + ((r.lean[p.k] || 0) / 40)); });
        let weights = {};
        // FPTP exaggerates the leader's margin; regional strongholds keep small parties alive.
        Object.entries(shares).forEach(([k, v]) => { weights[k] = fptp ? Math.pow(Math.max(0.1, v), 2.2) : v; });
        const wt = Object.values(weights).reduce((a, b) => a + b, 0);
        const seats = G.leg.total * r.pop / 100;
        Object.entries(weights).forEach(([k, v]) => { res[k] += seats * v / wt; });
    });
    let total = 0;
    parties.forEach(p => { p.seats = Math.round(res[p.k]); total += p.seats; });
    const diff = G.leg.total - total;
    mine.seats += diff;
    if (mine.seats < 0) mine.seats = 0;
    buildFactions();
}

function runElection(kind) {
    const share = electionShare(kind);
    G.campaign.bonus = 0;
    G.flags.rigging = false;
    const name = { presidential: "Presidential election", general: "General election", legislative: `${G.leg.name} elections`, council: "Federal Council election" }[kind];
    if (kind === "council") {
        const ok = G.pillars.party.l >= 30;
        G.gov.nextElection = [G.gov.nextElection[0] + 4, G.gov.nextElection[1]];
        if (!ok) return fallFromPower("not_reelected", "The Federal Assembly declined to re-elect you to the Federal Council.", true);
        log("🏔️ The Federal Assembly re-elects you to the Federal Council.", "good");
        applyEffects({ legitimacy: 4 });
        return;
    }
    if (kind === "legislative" || kind === "general") {
        const before = mySeats();
        allocateSeats(share);
        const after = mySeats();
        log(`🗳️ ${name}: your party ${after >= before ? "gains" : "loses"} ${Math.abs(after - before)} seats (${after} of ${G.leg.total}). Vote share ${fmt(share, 1)}%.`, "major");
        if (kind === "legislative") G.gov.legNext = [G.gov.legNext[0] + G.gov.legEvery, G.gov.legNext[1]];
    }
    if (kind === "legislative") {
        if (G.gov.type === "semi_presidential") {
            const was = G.gov.cohabitation;
            G.gov.cohabitation = govSeats() < majority();
            if (G.gov.cohabitation && !was) queueScene("cohabitation", {});
        }
        queueScene("election_result", { kind, share: Math.round(share), seats: mySeats() });
        return;
    }
    if (kind === "presidential") {
        let ps = share + G.campaign.bonus * 0.5;
        let won;
        if (G.ck === "usa") {
            let ev = 0;
            G.regions.forEach(r => { if (clamp(ps + (r.lean[G.leader.party] || 0) * 0.6 + r.mod * 0.4 + regionAffinity(r) * 0.4) > 50) ev += r.pop; });
            won = ev > 50;
        } else won = ps > 50;
        if (G.gov.legNext && ymNum(...G.gov.legNext) <= nowYM()) { allocateSeats(share); G.gov.legNext = [G.gov.legNext[0] + G.gov.legEvery, G.gov.legNext[1]]; }
        const running = G.flags.successor_running;
        G.flags.successor_running = false;
        if (!won) {
            if (running) return fallFromPower("successor_lost", `Your chosen successor lost the presidential election with ${fmt(ps, 1)}% of the vote. The opposition takes power.`, true);
            return fallFromPower("election", `You lost the presidential election with ${fmt(ps, 1)}% of the vote.`, true);
        }
        if (running) { G.over = null; return beginSuccession("successor_won"); }
        G.gov.termsServed++;
        G.gov.nextElection = [G.gov.nextElection[0] + G.gov.termYears, G.gov.nextElection[1]];
        if (G.gov.termEnds) G.gov.termEnds = [G.gov.termEnds[0] + G.gov.termYears, G.gov.termEnds[1]];
        log(`🗳️ You win the presidential election with ${fmt(ps, 1)}% of the vote.`, "major");
        record(`Re-elected ${G.leader.title}, ${G.year} (${fmt(ps, 1)}%).`);
        applyEffects({ legitimacy: 8, capital: 15, p: { people: 3, party: 5 } });
        queueScene("election_result", { kind, share: Math.round(ps), won: true });
        return;
    }
    // Parliamentary general election.
    G.gov.nextElection = [G.year + (G.gov.maxTerm || 4), G.month];
    const gs = govSeats();
    if (mySeats() >= majority()) {
        G.parties.forEach(p => { if (p.k !== G.leader.party) p.gov = p.gov && ideoDist(p.ideo, G.leader.ideology) <= 1.5; });
        buildFactions();
        record(`Won the ${G.year} general election with a majority (${mySeats()} seats).`);
        applyEffects({ legitimacy: 8, capital: 15, p: { party: 8, people: 3 } });
        queueScene("election_result", { kind, share: Math.round(share), seats: mySeats(), won: true });
    } else if (gs >= majority()) {
        record(`Won the ${G.year} general election as head of a coalition.`);
        applyEffects({ legitimacy: 5, capital: 10, p: { party: 4 } });
        queueScene("election_result", { kind, share: Math.round(share), seats: mySeats(), won: true, coalition: true });
    } else {
        const largest = G.parties.slice().sort((a, b) => b.seats - a.seats)[0];
        if (largest.k !== G.leader.party && largest.seats > mySeats() * 1.25) return fallFromPower("election", `Your party won only ${mySeats()} seats. ${largest.name} will form the next government.`, true);
        queueScene("hung_parliament", {});
    }
}

function callSnapElection() {
    G.gov.nextElection = [G.month + 1 > 12 ? G.year + 1 : G.year, G.month + 1 > 12 ? 1 : G.month + 1];
    log("📣 You ask for a dissolution. A general election is called for next month.", "major");
}

// ── Weekly government checks ────────────────────────────────────────

function govWeekCheck() {
    const g = G.gov;
    // Elections (they fall on the first weekly tick of their month).
    if (g.nextElection && nowYM() >= ymNum(...g.nextElection) && GT().democracy !== undefined) {
        const type = G.gov.type;
        if (["presidential", "semi_presidential"].includes(type) && g.termYears) {
            if (G.flags.retire_at_term) { G.flags.retire_at_term = false; return fallFromPower("term", "Your term has ended. You hand over power peacefully.", true); }
            if (g.termLimit && g.termsServed >= g.termLimit && !G.flags.successor_running) {
                if (!G.flags.term_handled) { G.flags.term_handled = true; queueScene("term_limit", {}); return; }
            }
            G.flags.term_handled = false;
            runElection("presidential");
        } else if (["parliamentary", "occupied"].includes(type)) runElection("general");
        else if (type === "directorial") runElection("council");
        else g.nextElection = null;
        if (G.over) return;
    }
    if (g.legNext && nowYM() >= ymNum(...g.legNext) && GT().democracy) runElection("legislative");
    if (G.over) return;
    if (g.type === "dominant_party" && g.termEnds && nowYM() >= ymNum(...g.termEnds) - 5 && !G.flags.dedazo_done) {
        G.flags.dedazo_done = true;
        queueScene("dedazo", {});
    }
    // IOUs come due.
    G.ious = G.ious.filter(iou => {
        if (G.t < iou.due) return true;
        queueScene("iou_due", { f: iou.f });
        return false;
    });
    if (G.flags.court_challenge && G.t >= G.flags.court_challenge.due) {
        const cc = G.flags.court_challenge; G.flags.court_challenge = null;
        queueScene("court_ruling", { area: cc.area, k: cc.k });
    }
    if (G.t % 4 === 0 && G.t > 6) threatCheck();
}

// ── Threats: how you can fall ───────────────────────────────────────

function coupRisk() {
    if (["directorial", "colony"].includes(G.gov.type)) return 0;
    const mil = G.pillars.military ? G.pillars.military.l : 55;
    let r = (50 - mil) * 0.9 + (50 - G.s.stability) * 0.45 + (50 - G.s.legitimacy) * 0.35 + (G.flags.coup_pressure || 0);
    r -= { police: 0, political: 6, terror: 14 }[G.pol.security] || 0;
    const bg = BACKGROUNDS[G.leader.bg];
    if (bg && bg.coupRisk) r += bg.coupRisk;
    G.leader.traits.forEach(t => { if (TRAITS[t].coupRisk) r += TRAITS[t].coupRisk; });
    if (GT().democracy && G.s.legitimacy > 65) r -= 15;
    if (G.gov.type === "one_party") r *= 0.5;
    if (G.gov.type === "military_junta") r = r * 1.3 + 8;
    if (G.mil.noArmy) r = 0;
    r -= skill("intrigue") * 2 + minBonus("interior") * 2;
    return clamp(r, 0, 95);
}

function govThreats() {
    const t = [];
    const type = G.gov.type, a = approval();
    const lv = (name, level, desc) => t.push({ name, level: Math.round(clamp(level)), desc });
    if (GT().democracy && type !== "directorial") {
        const nv = nextVote();
        if (nv) lv("Election", clamp(60 - (a - 40) * 2.5), `${nv.weeks} weeks to the ${nv.kind === "legislative" ? "legislative" : "next"} election. Approval ${Math.round(a)}%.`);
    }
    if (["presidential", "semi_presidential"].includes(type)) {
        const opp = G.leg.total - govSeats();
        lv("Impeachment", G.s.scandal * 0.8 + (opp > G.leg.total / 2 ? 20 : 0) + (40 - a) * 0.6, `Scandal ${Math.round(G.s.scandal)}. Opposition holds ${opp} of ${G.leg.total} seats.`);
        if (G.gov.termLimit) lv("Term limit", G.gov.termsServed >= G.gov.termLimit ? 80 : 20, `Term ${G.gov.termsServed} of ${G.gov.termLimit}.`);
    }
    if (["parliamentary", "occupied"].includes(type)) {
        const margin = govSeats() - majority();
        lv("No-confidence vote", (margin < 0 ? 70 : 30 - margin * 2) + (50 - a) * 0.5, margin >= 0 ? `Government majority: ${margin + 1}.` : `Minority government: ${-margin} seats short.`);
        if (G.pillars.party) lv("Leadership challenge", (45 - G.pillars.party.l) * 2.2, `${pillarName("party")} loyalty ${Math.round(G.pillars.party.l)}.`);
        if (G.pillars.coalition && G.parties.some(p => p.gov && p.k !== G.leader.party)) lv("Coalition collapse", (40 - G.pillars.coalition.l) * 2.2, `${pillarName("coalition")} loyalty ${Math.round(G.pillars.coalition.l)}.`);
    }
    if (type === "semi_presidential") lv("Cohabitation", G.gov.cohabitation ? 100 : clamp((majority() - govSeats()) * 2 + 30), G.gov.cohabitation ? "The opposition controls the assembly." : "You control the assembly.");
    if (type === "monarchy") {
        lv("Palace coup", (45 - G.pillars.royals.l) * 2.2, `${pillarName("royals")} loyalty ${Math.round(G.pillars.royals.l)}.`);
    }
    if (type === "one_party") {
        lv("Politburo purge", (45 - G.pillars.politburo.l) * 2 + (45 - factionLoyaltyAvg(false)) * 1.2, `Politburo loyalty ${Math.round(G.pillars.politburo.l)}.`);
    }
    if (type === "dominant_party") {
        lv("Party revolt", (45 - G.pillars.party.l) * 2.2, `${pillarName("party")} loyalty ${Math.round(G.pillars.party.l)}.`);
        if (G.gov.termEnds) lv("End of term", 100 - weeksUntil(G.gov.termEnds) / 3, `Your term ends ${monthStr(G.gov.termEnds[0], G.gov.termEnds[1])}.`);
    }
    if (type === "directorial") {
        lv("Assembly re-election", (40 - G.pillars.party.l) * 2.5, `${pillarName("party")} support ${Math.round(G.pillars.party.l)}.`);
        lv("Referendum defeats", G.gov.refLosses * 30, `${G.gov.refLosses} defeats this term.`);
    }
    if (type === "occupied") lv("Removal by occupiers", (40 - G.pillars.occupation.l) * 2.5, `${pillarName("occupation")} confidence ${Math.round(G.pillars.occupation.l)}.`);
    if (type === "colony") {
        lv("Arrest", G.colony ? G.colony.militancy * 0.9 - G.pillars.colonial.l * 0.3 + 10 : 0, "Militancy draws the police.");
        lv("Losing the movement", (40 - approval()) * 2.5, `Popular support ${Math.round(approval())}.`);
    }
    if (type !== "colony" && type !== "directorial") lv(type === "military_junta" ? "Counter-coup" : "Military coup", coupRisk() * 1.4, `Armed forces loyalty ${G.pillars.military ? Math.round(G.pillars.military.l) : "n/a"}.`);
    if (!["directorial"].includes(type)) lv("Revolution", clamp((30 - a) * 2 + (35 - G.s.stability) * 2), `Approval ${Math.round(a)}, stability ${Math.round(G.s.stability)}.`);
    return t.filter(x => x.level > 0 || ["Election", "No-confidence vote", "Military coup", "Politburo purge", "Palace coup"].includes(x.name));
}

function threatCheck() {
    const type = G.gov.type, a = approval();
    const cool = k => (G.rcool[k] || -999) > G.t;
    const setCool = (k, w) => { G.rcool[k] = G.t + w; };
    if (["presidential", "semi_presidential"].includes(type) && G.s.scandal >= 55 && G.leg.total - govSeats() > G.leg.total / 2 && a < 40 && !cool("impeach") && chance(0.18)) { setCool("impeach", 40); queueScene("impeachment", {}); }
    if (["parliamentary", "occupied"].includes(type)) {
        const effective = G.factions.filter(f => f.gov && f.loyalty >= 28).reduce((s, f) => s + f.seats, 0);
        const factor = G.ck === "germany" ? 0.4 : 1;
        if (effective < majority() && a < 52 && !cool("noconf") && chance(0.2 * factor)) { setCool("noconf", 20); queueScene("no_confidence", { cause: "minority" }); }
        if (G.pillars.party && G.pillars.party.l < 25 && !cool("challenge") && chance(0.25)) { setCool("challenge", 30); queueScene("leadership_challenge", {}); }
        if (G.pillars.coalition && G.pillars.coalition.l < 22 && G.parties.some(p => p.gov && p.k !== G.leader.party) && !cool("coal") && chance(0.2)) { setCool("coal", 26); queueScene("coalition_crisis", {}); }
    }
    if (type === "occupied" && G.pillars.occupation.l < 18 && chance(0.2)) return fallFromPower("removed", `The ${pillarName("occupation")} has lost confidence in your government and forces your resignation.`);
    if (type === "dominant_party" && G.pillars.party.l < 24 && !cool("revolt") && chance(0.25)) { setCool("revolt", 30); queueScene("party_revolt", {}); }
    if (type === "monarchy" && G.pillars.royals.l < 26 && !cool("palace") && chance(0.25)) { setCool("palace", 30); queueScene(G.flags.palace_warned ? "palace_coup" : "palace_intrigue", {}); }
    if (type === "one_party" && (G.pillars.politburo.l < 26 || factionLoyaltyAvg(false) < 28) && !cool("purge") && chance(0.25)) { setCool("purge", 30); queueScene(G.flags.purge_warned ? "purge_meeting" : "politburo_plot", {}); }
    if (type === "directorial" && G.gov.refLosses >= 3 && !cool("refcrisis")) { setCool("refcrisis", 52); queueScene("referendum_crisis", {}); }
    const cr = coupRisk();
    if (cr > 28 && !cool("coup")) {
        setCool("coup", 26);
        queueScene(G.flags.coup_warned && cr > 40 ? "coup_attempt" : "coup_rumors", {});
    }
    if (a < 18 && G.s.stability < 24 && type !== "directorial" && !cool("uprising") && chance(GT().democracy ? 0.08 : 0.2)) { setCool("uprising", 26); queueScene("uprising", {}); }
    let assn = 0.0012 + (100 - G.s.stability) / 100 * 0.002 - ({ political: 0.0008, terror: 0.0012 }[G.pol.security] || 0);
    if (chance(Math.max(0.0003, assn)) && !cool("assn")) { setCool("assn", 52); queueScene("assassination", {}); }
    if (G.flags.coup_pressure) G.flags.coup_pressure = Math.max(0, G.flags.coup_pressure - 1);
}

// ── Losing power ────────────────────────────────────────────────────

const FALL_TEXT = {
    election: "Voted out", successor_lost: "Party lost the election", noconfidence: "Lost a confidence vote", challenge: "Ousted as party leader",
    coalition: "Coalition collapsed", impeached: "Impeached and removed", coup: "Overthrown in a coup", purge: "Purged by the Politburo",
    palace: "Deposed by the royal family", revolution: "Overthrown by revolution", assassinated: "Assassinated", natural: "Died in office",
    conquered: "Country conquered", term: "Term ended", retired: "Retired", removed: "Removed by occupation authority", arrested: "Arrested and exiled",
    not_reelected: "Not re-elected", revolt: "Dropped by the party", referendum: "Resigned after referendum defeats", movement: "Lost control of the movement"
};

function fallFromPower(reason, text, legit = false) {
    if (G.over) return;
    G.over = { reason, text, legit, t: G.t, label: FALL_TEXT[reason] || reason };
    G.tenures.push({ name: G.leader.name, from: G.leader.since, to: G.t, how: FALL_TEXT[reason] || reason, gov: G.gov.type, party: G.leader.party });
    record(`${FALL_TEXT[reason] || "Left office"}, ${dateStr()}.`);
    log(`⚠️ ${text}`, "major");
    G.scenes = [];
    save();
}

function leaderDies(how) {
    const text = how === "natural" ? `${G.leader.name} has died at the age of ${G.leader.age}.` : `${G.leader.name} has been assassinated.`;
    fallFromPower(how === "natural" ? "natural" : "assassinated", text, how === "natural");
}

// What kind of government follows a fall, and who leads it.
function successionPlan(reason) {
    const type = G.gov.type;
    const plan = { gov: type, party: G.leader.party, title: G.leader.title, bg: null, note: "" };
    const opp = G.parties.filter(p => p.k !== G.leader.party).sort((a, b) => b.seats - a.seats)[0];
    if (["election", "successor_lost", "noconfidence", "coalition", "impeached", "not_reelected"].includes(reason) && opp) {
        plan.party = opp.k; plan.note = `You take over as leader of the ${opp.name}, now in government.`;
    }
    if (reason === "coup") { plan.gov = "military_junta"; plan.title = "Head of the Military Government"; plan.bg = "general"; plan.party = "junta"; plan.note = "The officers who seized power need a face. You are it."; }
    if (reason === "revolution" || reason === "movement") {
        plan.gov = G.align < 0 || type === "monarchy" && G.ck === "ethiopia" ? "one_party" : type === "monarchy" ? "presidential" : type === "one_party" ? "presidential" : "one_party";
        if (G.ck === "iran" && type === "monarchy") plan.gov = "one_party";
        plan.title = plan.gov === "one_party" ? "Chairman of the Revolutionary Council" : "Provisional President"; plan.bg = "revolutionary"; plan.party = "rev";
        plan.note = "The old regime is gone. You lead what replaces it.";
    }
    if (reason === "purge") { plan.note = "The faction that removed your predecessor puts you in charge."; plan.bg = "loyalist"; }
    if (reason === "palace" || (type === "monarchy" && ["natural", "assassinated", "retired"].includes(reason))) { plan.title = G.leader.title; plan.bg = "aristocrat"; plan.note = G.leader.heir ? `${G.leader.heir.name} ascends the throne.` : "The family chooses a new monarch."; }
    if (reason === "conquered") { plan.gov = "one_party"; plan.title = "Head of the occupation regime"; plan.note = "Your country has been conquered. Play on as the puppet government installed by the victors."; plan.bg = "loyalist"; }
    if (reason === "arrested") { plan.note = "With you in exile, a new leader takes over the movement."; }
    if (["term", "successor_won", "retired", "revolt", "challenge", "natural", "assassinated", "removed", "referendum"].includes(reason) && plan.gov !== "monarchy") plan.note = plan.note || "Your party chooses a new leader.";
    return plan;
}

function beginSuccession(reason) {
    G.pendingSuccession = Object.assign({ reason }, successionPlan(reason));
    G.over = null;
    if (typeof showSuccessionCreator === "function") showSuccessionCreator();
}

function makeGenericParties(gov, ideo) {
    if (gov === "military_junta") return [P("junta", "Armed Forces", "militarist", 100, true, "The officers in power.", [F("Hardline officers", 0.45, "militarist", "No elections, no mercy."), F("Moderate officers", 0.35, "conservative", "Restore order, then go back to barracks."), F("Navy & air force", 0.2, "nationalist", "Rival services with their own ambitions.")])];
    if (gov === "one_party") return [P("rev", "Ruling Party", ideo === "traditionalist" ? "traditionalist" : "communist", 100, true, "The only legal party.", [F("Hardliners", 0.35, ideo === "traditionalist" ? "traditionalist" : "communist", "Ideological purists."), F("Pragmatists", 0.3, "socialist", "Want results more than slogans."), F("Security chiefs", 0.2, "militarist", "Control the secret police."), F("Army men", 0.15, "militarist", "Represent the officers.")])];
    if (gov === "monarchy") return [P("court", "Royal Court", "traditionalist", 100, true, "The court.", [F("Elder princes", 0.4, "traditionalist", "Guard the family's interests."), F("Modernizers", 0.3, "conservative", "Want a modern administration."), F("Guard officers", 0.3, "militarist", "Command the palace troops.")])];
    return [
        P("rev", "National Renewal Party", ideo, 55, true, "The movement that brought you to power."),
        P("opp", "Democratic Opposition", ideo === "conservative" ? "socdem" : "conservative", 35, false, "The main opposition."),
        P("minor", "Minor parties", "liberal", 10, false, "")
    ];
}

function applySuccession(opts) {
    const plan = G.pendingSuccession;
    const prevGov = G.gov.type;
    G.leader = {
        name: opts.name, age: opts.age, gender: opts.gender, bg: opts.bg, traits: opts.traits.slice(),
        skills: Object.assign({ oratory: 0, legislation: 0, economics: 0, diplomacy: 0, military: 0, intrigue: 0 }, opts.skills),
        look: opts.look, ideology: opts.ideology, party: plan.party, title: plan.title, health: clamp(95 - Math.max(0, opts.age - 45) * 0.9, 30, 98), since: G.t,
        heir: G.leader.heir && plan.gov === "monarchy" ? null : G.leader.heir
    };
    if (plan.gov !== prevGov) {
        G.gov.type = plan.gov;
        G.gov.sub = null;
        G.gov.cohabitation = false;
        G.parties = makeGenericParties(plan.gov, opts.ideology);
        G.leader.party = G.parties[0].k;
        G.leg = { name: { military_junta: "Junta", one_party: "Politburo", monarchy: "Royal Court" }[plan.gov] || "National Assembly", detail: "", total: G.parties.reduce((s, p) => s + p.seats, 0), system: GOV_TYPES[plan.gov].democracy ? "fptp" : "party" };
        G.gov.termYears = plan.gov === "presidential" ? 5 : null;
        G.gov.termLimit = plan.gov === "presidential" ? 2 : null;
        G.gov.termsServed = 1;
        G.gov.nextElection = GOV_TYPES[plan.gov].democracy ? [G.year + (plan.gov === "presidential" ? 5 : 4), G.month] : null;
        G.gov.legNext = null; G.gov.legEvery = null;
        G.gov.maxTerm = 4;
        G.gov.termEnds = plan.gov === "presidential" ? [G.year + 5, G.month] : null;
        buildFactions();
        if (plan.gov === "one_party" && prevGov !== "one_party") Object.assign(G.pol, { press: "state", security: "political", economy: G.align < 0 ? "planned" : G.pol.economy });
        if (plan.gov === "military_junta") Object.assign(G.pol, { press: "restricted", security: "political" });
        if (plan.reason === "revolution" && G.align > -30 && plan.gov === "one_party") G.align = -50;
        G.flags.coup_suffered = G.flags.coup_suffered || plan.reason === "coup";
    } else {
        if (plan.party !== G.leader.party || G.parties.find(p => p.k === plan.party && !p.gov)) {
            G.parties.forEach(p => { p.gov = p.k === plan.party; });
            const mine = G.parties.find(p => p.k === plan.party);
            if (mine) G.parties.forEach(p => { if (p !== mine && ideoDist(p.ideo, mine.ideo) <= 1.5 && govSeatsOf(mine) < majority()) p.gov = true; });
        }
        G.leader.party = plan.party;
        buildFactions();
        G.factions.forEach(f => { f.loyalty = f.gov ? 58 : 30; });
        if (["presidential", "semi_presidential"].includes(G.gov.type) && G.gov.termYears) {
            G.gov.termsServed = 1;
            if (plan.reason !== "successor_won") { G.gov.nextElection = [G.year + G.gov.termYears, G.month]; G.gov.termEnds = [G.year + G.gov.termYears, G.month]; }
            else { G.gov.nextElection = [G.gov.nextElection[0] + G.gov.termYears, G.gov.nextElection[1]]; if (G.gov.termEnds) G.gov.termEnds = [G.gov.termEnds[0] + G.gov.termYears, G.gov.termEnds[1]]; }
        }
        if (G.gov.type === "dominant_party") { G.gov.termEnds = [G.year + (G.gov.termYears || 6), G.month]; G.flags.dedazo_done = false; }
        if (["parliamentary", "occupied"].includes(G.gov.type) && ["election", "noconfidence", "coalition"].includes(plan.reason)) G.gov.nextElection = [G.year + (G.gov.maxTerm || 4), G.month];
    }
    G.pmods = {};
    setupPillars();
    applyBackground();
    G.capital = 25;
    G.s.scandal = 5;
    G.s.legitimacy = clamp(G.s.legitimacy + (plan.reason === "coup" || plan.reason === "revolution" ? -15 : 0));
    G.campaign = { bonus: 0 };
    G.ious = [];
    G.gov.refLosses = 0;
    G.flags.coup_warned = false; G.flags.purge_warned = false; G.flags.palace_warned = false; G.flags.term_handled = false;
    G.rcool = {};
    G.pendingSuccession = null;
    G.over = null;
    recomputeDerived();
    log(`${G.leader.name} becomes ${G.leader.title} (${GOV_TYPES[G.gov.type].name}).`, "major");
    record(`${G.leader.name} took office as ${G.leader.title}, ${dateStr()}.`);
    save();
}

function govSeatsOf(mine) { return G.parties.filter(p => p.gov).reduce((s, p) => s + p.seats, 0); }

// ── Constitutional reform ───────────────────────────────────────────

const CROWN_REALMS = ["canada", "australia", "newzealand", "southafrica", "pakistan", "barbados", "fiji"];

const REFORMS = [
    { k: "no_limits", name: "Abolish presidential term limits", icon: "♾️", from: ["presidential", "semi_presidential", "dominant_party"],
      desc: "Rewrite the constitution so you can run again. Your rivals will call it a power grab, and they will be right.",
      ok: () => !!G.gov.termLimit, stance: { militarist: 1, nationalist: 1, liberal: -1, socdem: -1, conservative: -0.5 },
      apply: () => { G.gov.termLimit = null; G.flags.limits_abolished = true; applyEffects({ legitimacy: -15, p: { press: -15, people: -5, military: -4 }, liberty: -5 }); } },
    { k: "emergency", name: "Rule by emergency decree (self-coup)", icon: "🛑", from: ["presidential", "parliamentary", "semi_presidential"],
      desc: "Suspend the legislature and rule by decree, backed by the army and police. Your system becomes a dominant-party regime. If the army isn't with you, it may remove you instead.",
      ok: () => true, decreeOnly: true,
      apply: () => {
          const mil = G.pillars.military ? G.pillars.military.l : 50;
          if (mil < 55 && chance(0.6)) { fallFromPower("coup", "You tried to suspend the constitution. The army refused and arrested you instead."); return false; }
          changeGovType("dominant_party"); applyEffects({ legitimacy: -25, liberty: -20, p: { press: -30, people: -10, military: 5, security: 10 } }); G.pol.press = "restricted"; G.pol.security = "political";
      } },
    { k: "fifth_republic", name: "Strong presidency (semi-presidential)", icon: "⚜️", from: ["parliamentary"],
      desc: "Create a directly elected president with real powers, alongside a prime minister. Ends the instability of shifting coalitions. You become President.",
      ok: () => true, stance: { conservative: 1, nationalist: 1, socdem: -1, communist: -1, liberal: -0.5 },
      apply: () => { changeGovType("semi_presidential"); G.leader.title = "President"; G.gov.termYears = 7; G.gov.termLimit = null; G.gov.nextElection = [G.year + 7, G.month]; G.gov.legEvery = 5; G.gov.legNext = [G.year + 5, G.month]; applyEffects({ legitimacy: 8, capital: 10 }); } },
    { k: "to_parliamentary", name: "Parliamentary system", icon: "🏛️", from: ["presidential", "semi_presidential"],
      desc: "Make the government answer to the legislature. You become Prime Minister, removable by a vote of no confidence but no longer term-limited.",
      ok: () => true, stance: { socdem: 1, liberal: 1, socialist: 0.5, nationalist: -1, militarist: -1 },
      apply: () => { changeGovType("parliamentary"); G.leader.title = "Prime Minister"; G.gov.termLimit = null; G.gov.maxTerm = 5; G.gov.nextElection = [G.year + 4, G.month]; G.gov.legNext = null; applyEffects({ legitimacy: 5, p: { party: 5 } }); } },
    { k: "to_presidential", name: "Presidential system", icon: "🦅", from: ["parliamentary"],
      desc: "Separate the executive from the legislature. A fixed term protects you from no-confidence votes, but laws still need the legislature.",
      ok: () => true, stance: { nationalist: 1, conservative: 0.5, socdem: -0.5, socialist: -1 },
      apply: () => { changeGovType("presidential"); G.leader.title = "President"; G.gov.termYears = 5; G.gov.termLimit = 2; G.gov.termsServed = 1; G.gov.nextElection = [G.year + 5, G.month]; G.gov.termEnds = [G.year + 5, G.month]; G.gov.legEvery = 5; G.gov.legNext = [G.year + 5, G.month]; } },
    { k: "colegiado", name: "Collegial executive (Colegiado)", icon: "🏔️", from: ["presidential"],
      desc: "Replace the presidency with a council, as Switzerland has. No more strongmen, and no more decisive leadership either.",
      ok: () => true, stance: { socdem: 1, liberal: 0.5, conservative: -0.5, nationalist: -1 },
      apply: () => { changeGovType("directorial"); G.leader.title = "President of the National Council"; G.gov.nextElection = [G.year + 4, G.month]; G.gov.termLimit = null; applyEffects({ legitimacy: 5, p: { party: 6 } }); } },
    { k: "republic", name: "Become a republic", icon: "🏳️", from: ["parliamentary"],
      desc: "Replace the British monarch with your own president as head of state. A symbolic break with the Crown.",
      ok: () => CROWN_REALMS.includes(G.ck) && !G.flags.republic, stance: { nationalist: 1, socdem: 0.5, conservative: -0.5, traditionalist: -1 },
      apply: () => { G.flags.republic = true; applyEffects({ legitimacy: 6, prestige: 3, p: { people: 4 }, rel: { uk: -8 } }); } },
    { k: "const_monarchy", name: "Constitutional monarchy", icon: "📜", from: ["monarchy"],
      desc: "Grant a constitution and an elected assembly with power over laws. Your family will be furious; the young and educated will cheer.",
      ok: () => G.gov.sub !== "constitutional",
      apply: () => {
          G.gov.sub = "constitutional";
          G.parties = [P("loyal", "Loyalist bloc", "traditionalist", 55, true, "Deputies loyal to the crown."), P("reform", "Reformist bloc", "liberal", 30, false, "Constitutionalists and modernizers."), P("rad", "Radicals", "nationalist", 15, false, "Nationalists and leftists.")];
          G.leg = { name: "National Assembly", detail: "Elected assembly", total: 100, system: "fptp" };
          G.leader.party = "loyal"; buildFactions();
          applyEffects({ legitimacy: 10, liberty: 10, p: { royals: -15, press: 15, people: 8, clergy: -5 } });
      } },
    { k: "abdicate", name: "Abdicate and lead a party", icon: "🎭", from: ["monarchy"],
      desc: "Hand the throne to a relative and enter politics as a commoner, leading your own mass movement. This is what Sihanouk did in 1955. You become Prime Minister of a dominant-party state.",
      ok: () => true, decreeOnly: true,
      apply: () => {
          changeGovType("dominant_party"); G.leader.title = "Prime Minister";
          G.parties = [P("sangkum", "National Movement", G.leader.ideology, 85, true, "Your mass movement.", [F("Royalist loyalists", 0.5, "traditionalist", "Followed you off the throne."), F("Young modernizers", 0.3, "socdem", "Educated recruits."), F("Provincial notables", 0.2, "conservative", "Local power brokers.")]), P("opp", "Opposition", "liberal", 15, false, "Democrats and leftists.")];
          G.leader.party = "sangkum"; G.leg = { name: "National Assembly", detail: "", total: 100, system: "fptp" }; buildFactions();
          G.gov.termEnds = null; G.gov.termYears = null;
          applyEffects({ legitimacy: 5, p: { people: 10, royals: -10 } });
      } },
    { k: "managed", name: "Managed elections", icon: "🗳️", from: ["one_party", "military_junta"],
      desc: "Allow controlled elections and tame opposition parties. Your party will always win, more or less. Becomes a dominant-party state.",
      ok: () => true, decreeOnly: true,
      apply: () => { changeGovType("dominant_party"); G.gov.termYears = null; G.gov.termEnds = null; applyEffects({ legitimacy: 10, liberty: 8, p: { people: 6, security: -8, military: -4 } }); } },
    { k: "democratize", name: "Democratic transition", icon: "🕊️", from: ["one_party", "military_junta", "dominant_party", "monarchy"],
      desc: "Hold free, competitive elections in one year's time under a new presidential constitution. You can run. You can also lose.",
      ok: () => true, decreeOnly: true,
      apply: () => {
          changeGovType("presidential"); G.leader.title = "President";
          G.gov.termYears = 5; G.gov.termLimit = 2; G.gov.termsServed = 0; G.gov.nextElection = [G.year + 1, G.month]; G.gov.termEnds = [G.year + 6, G.month];
          G.gov.legEvery = 5; G.gov.legNext = [G.year + 1, G.month];
          Object.assign(G.pol, { press: "free", security: "police" });
          applyEffects({ legitimacy: 20, liberty: 20, prestige: 8, p: { people: 12, press: 20, military: -8, security: -15 } });
      } },
    { k: "pr", name: "Proportional representation (MMP)", icon: "⚖️", from: ["parliamentary"],
      desc: "Replace first-past-the-post with mixed-member proportional voting. Fairer, and coalitions become the norm.",
      ok: () => G.leg.system === "fptp", stance: { socdem: 0.5, liberal: 1, socialist: 1, conservative: -1 },
      apply: () => { G.leg.system = "pr"; G.flags.mmp = true; applyEffects({ legitimacy: 5, p: { party: -4 } }); } },
    { k: "write_constitution", name: "Adopt a written constitution", icon: "📘", from: ["parliamentary"],
      desc: "End the provisional arrangements and adopt a permanent constitution.",
      ok: () => ["pakistan", "israel"].includes(G.ck) && !G.flags.constitution_written, stance: {},
      apply: () => { G.flags.constitution_written = true; applyEffects({ legitimacy: 10, stability: 4 }); } },
    { k: "women_vote", name: "Women's suffrage", icon: "🗳️", from: ["directorial"],
      desc: "Give women the vote in federal elections, by referendum of the (male) electorate.",
      ok: () => G.ck === "switzerland" && !G.flags.women_vote, stance: { socdem: 1, liberal: 1, traditionalist: -1, conservative: -0.5 },
      apply: () => { G.flags.women_vote = true; applyEffects({ legitimacy: 6, prestige: 5, liberty: 4 }); } },
    { k: "rearm", name: "Rearmament amendment", icon: "🎖️", from: ["parliamentary", "occupied"],
      desc: "Amend the constitution to allow armed forces again.",
      ok: () => G.mil.noArmy && G.gov.type !== "occupied", stance: { conservative: 1, nationalist: 1, socdem: -1, socialist: -1, communist: -1 },
      apply: () => { G.mil.noArmy = false; G.pol.military = "moderate_mil"; applyEffects({ p: { military: 15, people: -5 }, prestige: 5, tension: 2 }); } }
];

function changeGovType(t) {
    G.gov.type = t;
    G.gov.cohabitation = false;
    const old = G.pillars;
    G.pillars = {};
    Object.keys(GOV_TYPES[t].pillars).forEach(k => { G.pillars[k] = { l: old[k] ? old[k].l : clamp(pillarTarget(k)) }; });
    Object.keys(G.pillars).forEach(k => { if (!old[k]) G.pillars[k].l = clamp(pillarTarget(k), 10, 90); });
    record(`Changed the system of government to: ${GOV_TYPES[t].name}.`);
    log(`📜 New constitution: ${GOV_TYPES[t].name}.`, "major");
}

function reformForecast(r) {
    if (!GT().democracy || r.decreeOnly) return null;
    let yes = 0;
    G.factions.forEach(f => {
        let p = f.gov ? 0.45 + f.loyalty / 250 : 0.15;
        p += ((r.stance || {})[f.ideo] || 0) * 0.3;
        yes += f.seats * clamp(p, 0.02, 0.98);
    });
    const need = Math.ceil(G.leg.total * 2 / 3);
    return { yes, need, prob: clamp(1 / (1 + Math.exp(-(yes - need) / Math.max(2, G.leg.total * 0.05))), 0.01, 0.99) };
}

function referendumOdds(r) {
    const s = 50 + (approval() - 50) * 0.5 + ((r.stance || {})[G.leader.ideology] || 0) * 3 + skill("oratory");
    return clamp(s / 100, 0.05, 0.95);
}

function attemptReform(k, route) {
    const r = REFORMS.find(x => x.k === k);
    const cost = 35;
    if (G.capital < cost) return toast("Not enough political capital", `Constitutional change needs ${cost}.`);
    G.capital -= cost;
    let ok = true, how = "decree";
    if (route === "vote") {
        const f = reformForecast(r);
        const yes = Math.round(clamp(f.yes + gauss() * G.leg.total * 0.05, 0, G.leg.total));
        ok = yes >= f.need; how = `${G.leg.name} vote ${yes}–${G.leg.total - yes} (needed ${f.need})`;
    } else if (route === "referendum") {
        const pct = clamp(referendumOdds(r) * 100 + gauss() * 6, 5, 95);
        ok = pct >= 50; how = `referendum, ${fmt(pct, 1)}% in favor`;
    } else {
        applyEffects({ legitimacy: -6, p: { press: -6 } });
    }
    if (!ok) {
        applyEffects({ legitimacy: -5, p: { party: -5, people: -3 } });
        log(`📜 Constitutional reform fails: ${r.name} (${how}).`, "bad");
        return toast("Reform defeated", `${r.name} fails: ${how}.`);
    }
    const res = r.apply();
    if (G.over) return;
    if (res === false) return;
    log(`📜 Constitutional reform adopted: ${r.name} (${how}).`, "major");
    record(`Constitutional reform: ${r.name}.`);
    toast("Constitution amended", `${r.name} (${how}).`);
}
