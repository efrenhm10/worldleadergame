// ── WORLD — other nations, relations, blocs, wars ───────────────────
//
// Every other country is simulated: it grows, wobbles, changes leaders
// on the historical schedule (unless the sandbox has diverged), signs
// deals, picks fights, and sometimes comes after you.

function setupWorld() {
    G.nations = {};
    Object.entries(COUNTRIES).forEach(([k, c]) => {
        G.nations[k] = {
            key: k, name: c.name, flag: c.flag, area: c.area, gdp: c.econ.gdp, pop: c.econ.pop, growth: c.econ.growth,
            mil: c.mil.base * (c.mil.noArmy ? 0.1 : 1), stab: c.s.stability, nukes: c.mil.nukes, gov: c.gov, leader: c.leader.name,
            align: c.align, status: c.status, master: c.master || null, indepDate: c.indepDate || null, tech: c.dev.tech,
            oil: (c.res || []).includes("oil"), playable: true, hi: 0, diverged: false
        };
    });
    Object.entries(NPC_NATIONS).forEach(([k, n]) => {
        G.nations[k] = Object.assign({ key: k, playable: false, hi: 0, diverged: false, nukes: 0, tech: 30, status: n.dormant ? "dormant" : n.gov === "colony" ? "colony" : "sovereign" }, deep(n));
    });
    G.rel = {};
    const keys = Object.keys(G.nations);
    keys.forEach((a, i) => keys.slice(i + 1).forEach(b => {
        const A = G.nations[a], B = G.nations[b];
        let v = 40 - Math.abs(A.align - B.align) * 0.45;
        if (A.area === B.area) v += 5;
        if (A.master === b || B.master === a) v += 25;
        setRel(a, b, v);
    }));
    RIVALRIES.forEach(([a, b, v]) => setRel(a, b, v));
    G.blocs = {};
    Object.keys(BLOCS).forEach(k => { G.blocs[k] = []; });
    Object.entries(COUNTRIES).forEach(([k, c]) => (c.blocs || []).forEach(b => G.blocs[b].push(k)));
    G.blocs.nato.push("italy");
    G.wars = [];
}

// ── Wars ────────────────────────────────────────────────────────────

let WAR_ID = 1;

function ensureRebels(of, name, mil) {
    const k = `reb_${of}`;
    if (!G.nations[k]) G.nations[k] = { key: k, name, flag: "🏴", area: G.nations[of] ? G.nations[of].area : "", gdp: 0.1, pop: 0, mil, stab: 50, nukes: 0, gov: "rebels", leader: "", align: -60, status: "rebel", rebel: true, of, playable: false };
    else { G.nations[k].mil = mil; G.nations[k].status = "rebel"; G.nations[k].name = name; }
    return k;
}

function startWar(o) {
    const w = Object.assign({ id: WAR_ID++ + "_" + G.t, start: G.t, front: 0, weeks: 0, cas: { a: 0, b: 0 }, mom: 0, commit: {}, over: false }, o);
    if (G.wars.some(x => !x.over && x.name === w.name)) return null;
    G.wars.push(w);
    if (w.a.includes(G.ck) || w.b.includes(G.ck)) {
        G.flags.at_war_ever = true;
        if (w.commit[G.ck] == null) w.commit[G.ck] = (w.a[0] === G.ck || w.b[0] === G.ck) ? 3 : 1;
    }
    G.tension = clamp(G.tension + (w.type === "insurgency" ? 1 : 6));
    return w;
}

function commitOf(w, k = G.ck) {
    if (w.commit[k] != null) return w.commit[k];
    return (w.a[0] === k || w.b[0] === k) ? 3 : 1;
}

function sideStrength(w, side) {
    const list = w[side];
    return list.reduce((s, k, i) => {
        const n = G.nations[k];
        if (!n || n.status === "annexed") return s;
        let m = k === G.ck ? G.mil.strength : n.mil;
        let share;
        if (k === G.ck) share = [0.05, 0.2, 0.5, 1][commitOf(w)];
        else share = i === 0 ? 1 : (w.commit[k] != null ? [0.05, 0.2, 0.5, 1][w.commit[k]] : 0.3);
        if (["usa", "russia", "uk", "france"].includes(k) && i > 0 && n.area !== G.nations[w[side === "a" ? "b" : "a"][0]].area) share *= 0.7;
        if (k === G.ck && side === "a" ? false : false) share *= 1;
        if (k === G.ck) m *= 1 + skill("military") * 0.04;
        return s + m * share;
    }, 0.1);
}

function warWeekTick(w) {
    w.weeks++;
    const A = sideStrength(w, "a"), B = sideStrength(w, "b");
    let d = 2.3 * (A - B) / (A + B) + gauss() * 1.6 + w.mom;
    if (w.type === "insurgency") d *= 0.6;
    w.mom *= 0.9;
    w.front = clamp(w.front + d, -100, 100);
    const intensity = (A + B) * 0.002 * (w.type === "insurgency" ? 0.3 : 1);
    w.cas.a += Math.round(intensity * (1 + Math.max(0, -d)) * 100);
    w.cas.b += Math.round(intensity * (1 + Math.max(0, d)) * 100);
    // Rebels grow when the government is unstable.
    if (w.type === "insurgency") {
        const govK = w.b[0], reb = G.nations[w.a[0]];
        const stab = govK === G.ck ? G.s.stability : (G.nations[govK] ? G.nations[govK].stab : 50);
        reb.mil = Math.max(0.2, reb.mil * (1 + (50 - stab) * 0.0006));
    }
    if (w.a.includes(G.ck) || w.b.includes(G.ck)) {
        const mine = w.a.includes(G.ck) ? d : -d;
        G.s.prestige = clamp(G.s.prestige + mine * 0.03);
        if (commitOf(w) >= 2) G.mil.strength *= 0.9995;
    }
    if (w.front >= 100) endWar(w, "a");
    else if (w.front <= -100) endWar(w, "b");
    else if (w.weeks > 52 && Math.abs(w.front) < 50) {
        const playerIn = w.a.includes(G.ck) || w.b.includes(G.ck);
        if (!playerIn && chance(0.006)) endWar(w, "draw");
        else if (playerIn && w.weeks % 26 === 0 && chance(0.5)) queueScene("peace_offer", { id: w.id });
    }
    if (w.type === "insurgency" && w.weeks > 30 && G.nations[w.a[0]].mil < 0.6 && chance(0.05)) endWar(w, "b");
}

function endWar(w, winner, quiet) {
    if (w.over) return;
    w.over = true; w.result = winner; w.ended = G.t;
    const pa = w.a.includes(G.ck), pb = w.b.includes(G.ck);
    const playerSide = pa ? "a" : pb ? "b" : null;
    let text;
    if (winner === "draw") text = `🕊️ ${w.name} ends in an armistice.`;
    else text = `⚔️ ${w.name} ends: ${w[winner].map(nationName).filter(n => n).slice(0, 2).join(" and ")} prevail${w[winner].length > 1 ? "" : "s"}.`;
    log(text, "major");
    G.tension = clamp(G.tension - 5);
    if (w.onEnd && WAR_HOOKS[w.onEnd]) WAR_HOOKS[w.onEnd](w, winner);
    if (winner === "draw") {
        if (playerSide) { applyEffects({ weariness: -20, p: { people: 4 } }); record(`Signed an armistice ending the ${w.name}.`); }
        return;
    }
    const loserSide = winner === "a" ? "b" : "a";
    const loser = w[loserSide][0], win = w[winner][0];
    if (w.type === "conquest") {
        if (G.nations[loser] && loser !== G.ck) { G.nations[loser].status = "annexed"; G.nations[loser].diverged = true; }
        if (loser === G.ck) { fallFromPower("conquered", `${nationName(win)} has overrun the country. Your government has fallen.`); return; }
    }
    if (w.type === "insurgency") {
        if (winner === "a") {
            if (loser === G.ck) { fallFromPower("revolution", `The insurgents have taken the capital.`); return; }
            const n = G.nations[loser];
            if (n) { n.gov = "one_party"; n.align = Math.min(n.align, -60); n.leader = "Revolutionary Council"; n.diverged = true; n.stab = 40; }
        } else if (G.nations[w.a[0]]) G.nations[w.a[0]].status = "defeated";
    }
    if (w.type === "liberation" && winner === "a") {
        if (loser === G.ck) G.flags.colonial_defeat = true;
    }
    if (playerSide) {
        if (playerSide === winner) {
            applyEffects({ prestige: 10, p: { military: 10, people: 8 }, legitimacy: 5, weariness: -25 });
            record(`Victory in the ${w.name}.`);
            toast("Victory", `${w.name} is over. ${C().name} prevails.`);
        } else {
            applyEffects({ prestige: -12, p: { military: -12, people: -8 }, legitimacy: -6, weariness: -15 });
            record(`Defeat in the ${w.name}.`);
            toast("Defeat", `${w.name} is lost.`);
            if (w.type === "liberation" || w.type === "limited") G.flags.coup_pressure = (G.flags.coup_pressure || 0) + 10;
        }
    }
}

const WAR_HOOKS = {
    korea: (w, win) => {
        if (win === "a") { G.flags.korea_red = true; }
        if (win === "b") { G.nations.northkorea.status = "annexed"; G.flags.korea_unified = true; }
        G.flags.korea_over = true;
    },
    indochina: (w, win) => {
        G.flags.indochina_over = true;
        if (win !== "b") { G.flags.vietnam_partition = true; activateSouthVietnam(); }
    },
    huk: (w, win) => { if (win === "b") G.flags.huks_defeated = true; },
    algeria: (w, win) => { G.flags.algeria_over = true; },
    suez: (w, win) => { G.flags.suez_over = true; },
    taiwan: (w, win) => { if (win === "a") G.flags.taiwan_taken = true; },
    falklands: (w, win) => { if (win === "a") G.flags.falklands = true; },
    vietnam: (w, win) => { if (win === "a") { G.nations.southvietnam.status = "annexed"; G.flags.saigon_fell = true; } },
    biafra: (w, win) => { if (win === "a") G.flags.biafra_free = true; },
    bangladesh: (w, win) => { if (win === "a") G.flags.bangladesh = true; },
    kashmir: (w, win) => { if (win === "a" && w.a[0] === "pakistan") G.flags.kashmir = true; }
};

function activateSouthVietnam() {
    const n = G.nations.southvietnam;
    if (n && n.status === "dormant") { n.status = "sovereign"; log("🇻🇳 Vietnam is partitioned at the 17th parallel. A State of Vietnam rules the South.", "major"); }
}

function setupInitialWars() {
    const viet = startWar({ name: "Indochina War", a: ["vietnam"], b: ["france"], type: "liberation", front: 5, onEnd: "indochina", target: "Indochina" });
    if (viet) viet.weeks = 160;
    const rm = ensureRebels("malaya", "Malayan communists (MNLA)", 2.5);
    startWar({ name: "Malayan Emergency", a: [rm], b: ["malaya", "uk"], type: "insurgency", front: -5 });
    const rh = ensureRebels("philippines", "Hukbalahap guerrillas", 4);
    startWar({ name: "Huk Rebellion", a: [rh], b: ["philippines"], type: "insurgency", front: 10, onEnd: "huk" });
    const ri = ensureRebels("indonesia", "Darul Islam & regional rebels", 3);
    startWar({ name: "Indonesian regional rebellions", a: [ri], b: ["indonesia"], type: "insurgency", front: 0 });
}

// ── Weekly and monthly world ticks ──────────────────────────────────

function worldWeekTick() {
    const frontier = Math.max(frontierPC(), G.ck === "usa" ? gdpPerCapita() : 0);
    Object.values(G.nations).forEach(n => {
        if (n.key === G.ck || n.rebel || n.status === "annexed" || n.status === "dormant") return;
        // AI growth: catch-up toward the frontier plus a country-specific push
        // (n.growth), which events change (the Great Leap, Deng's reforms...).
        const pc = n.gdp * 1000 / Math.max(0.05, n.pop);
        const gap = Math.log10(Math.max(1, frontier / Math.max(1, pc)));
        let g = 1.3 + (gap < 0.15 ? -0.4 : clamp(gap * 2.2, 0, 4.5) * Math.pow(clamp((n.tech || 30) / 100, 0.05, 1), 1.2) * clamp(n.stab / 60, 0.3, 1.2)) + (n.growth - 3) * 0.6;
        if (G.year >= 1974) g -= 0.8;
        n.gdp *= 1 + (g + gauss() * 0.5) / 100 / 52;
        // Demographic transition: births fall with income and, worldwide, over time.
        let popR = clamp(2.6 - 0.9 * Math.log10(Math.max(1, pc / 60)) - Math.max(0, G.year - 1965) * 0.02, 0, 3);
        if (["usa", "canada", "australia"].includes(n.key)) popR += 0.5;
        if (n.key === "china" && G.year >= 1980) popR = Math.min(popR, 0.7);
        n.pop *= 1 + popR / 100 / 52;
        n.stab = clamp(n.stab + (55 - n.stab) * 0.004 + gauss() * 0.4);
        n.tech = Math.min(200, (n.tech || 30) + (n.gdp / n.pop > 1 ? 1.2 : 0.5) / 52);
    });
    G.wars.forEach(w => { if (!w.over) warWeekTick(w); });
}

function worldMonthTick() {
    // The occupation of Japan ends in April 1952 even if no one signs at San Francisco.
    const jp = G.nations.japan;
    if (jp && G.ck !== "japan" && jp.status === "occupied" && (G.year > 1952 || (G.year === 1952 && G.month >= 5))) { jp.status = "sovereign"; jp.gov = "parliamentary"; }
    // Historical leader changes for AI nations.
    Object.values(G.nations).forEach(n => {
        if (n.key === G.ck || n.diverged || n.rebel) return;
        const list = n.playable ? (COUNTRIES[n.key].hist || []) : (NPC_HIST[n.key] || []);
        while (n.hi < list.length) {
            const [y, m, name, gov, align] = list[n.hi];
            if (ymNum(y, m) > nowYM()) break;
            n.hi++;
            if (n.status === "annexed") continue;
            const changed = n.leader !== name;
            n.leader = name;
            if (gov) n.gov = gov;
            if (align != null) n.align = align;
            if (changed && (n.playable || ["egypt", "cuba", "iraq"].includes(n.key))) log(`${n.flag} ${n.name}: ${name} now leads${gov ? ` (${GOV_TYPES[gov] ? GOV_TYPES[gov].short.toLowerCase() : gov})` : ""}.`, "world");
        }
    });
    // AI colonies become independent on schedule.
    Object.values(G.nations).forEach(n => {
        if (n.key === G.ck || n.status !== "colony" || !n.indepDate) return;
        if (n.master === G.ck) {
            if (!G.fired[`demand_${n.key}`] && nowYM() >= ymNum(n.indepDate[0], n.indepDate[1]) - 18) { G.fired[`demand_${n.key}`] = true; queueScene("colony_demand", { key: n.key }); }
            if (G.flags[`grant_${n.key}`] && nowYM() >= G.flags[`grant_${n.key}`]) grantIndependence(n.key);
            return;
        }
        if (nowYM() >= ymNum(n.indepDate[0], n.indepDate[1])) grantIndependence(n.key);
    });
    // Tension drifts back toward a baseline.
    G.tension = clamp(G.tension + (55 - G.tension) * 0.02 + gauss() * 0.6);
    G.oilPrice = Math.max(0.6, G.oilPrice * (1 + gauss() * 0.01));
    // AI-to-AI diplomacy (headlines).
    for (let i = 0; i < 2; i++) aiInteraction();
    // AI coups in unstable states.
    Object.values(G.nations).forEach(n => {
        if (n.key === G.ck || n.rebel || n.status !== "sovereign") return;
        if (n.stab < 28 && !["presidential", "parliamentary"].includes(n.gov) && chance(0.01) || n.stab < 20 && chance(0.012)) {
            n.gov = "military_junta"; n.leader = `General ${pick(NAME_POOLS[COUNTRIES[n.key] ? COUNTRIES[n.key].names : "anglo"] || NAME_POOLS.anglo).split(" ").pop()}`;
            n.stab = 45; n.diverged = true;
            log(`${n.flag} Coup in ${n.name}. ${n.leader} seizes power.`, "world");
        }
    });
    // Sandbox wars between rivals.
    RIVALRIES.forEach(([a, b]) => {
        const A = G.nations[a], B = G.nations[b];
        if (!A || !B || A.status !== "sovereign" || B.status !== "sovereign") return;
        if (G.wars.some(w => !w.over && ((w.a.includes(a) && w.b.includes(b)) || (w.a.includes(b) && w.b.includes(a))))) return;
        const r = getRel(a, b);
        if (r > -65) return;
        const ma = a === G.ck ? G.mil.strength : A.mil, mb = b === G.ck ? G.mil.strength : B.mil;
        const [att, def, ratio] = ma >= mb ? [a, b, ma / Math.max(0.1, mb)] : [b, a, mb / Math.max(0.1, ma)];
        if (att === G.ck) return;
        if (ratio < 1.5 || !chance(0.0025 * (G.tension / 50))) return;
        if (G.nations[def].nukes >= 2 && G.nations[att].nukes < 2) return;
        const w = startWar({ name: `${G.nations[att].name}–${G.nations[def].name} War`, a: [att], b: [def], type: "limited", front: 0 });
        if (w) {
            log(`⚔️ War! ${G.nations[att].name} attacks ${G.nations[def].name}.`, "major");
            if (def === G.ck) queueScene("invaded", { id: w.id });
            else if (alliedWith(G.ck, def)) queueScene("ally_attacked", { id: w.id });
        }
    });
    // Other nations approach you.
    if (!G.scenes.length && chance(0.13)) aiApproach();
    // Superpower pressure on you.
    superpowerPressure();
}

function grantIndependence(key) {
    const n = G.nations[key];
    if (!n || n.status !== "colony") return;
    const master = n.master;
    n.status = "sovereign";
    n.name = { uae: "United Arab Emirates", cambodia: "Cambodia", singapore: "Singapore", nigeria: "Nigeria", barbados: "Barbados", fiji: "Fiji", malaya: "Malaysia" }[key] || n.name.replace(/\s*\(.*\)/, "");
    if (n.gov === "colony") n.gov = { uae: "monarchy", cambodia: "monarchy", malaya: "parliamentary" }[key] || "parliamentary";
    n.master = null;
    if (master === "uk") G.blocs.commonwealth.push(key);
    log(`🎉 ${n.flag} ${n.name} is independent.`, "major");
    if (master === G.ck) { G.flags.indep_granted = (G.flags.indep_granted || 0) + 1; record(`Granted independence to ${n.name}.`); }
}

function alliedWith(a, b) {
    return Object.entries(G.blocs).some(([k, m]) => BLOCS[k].defense && m.includes(a) && m.includes(b));
}

function blocSide(k) {
    const n = k === G.ck ? { align: G.align } : G.nations[k];
    if (!n) return "nonaligned";
    if (k !== G.ck && n.status === "colony") return "colony";
    if (G.blocs.nam.includes(k)) return "nonaligned";
    if (n.align >= 35) return "west";
    if (n.align <= -35) return "east";
    return "nonaligned";
}

const HEADLINES_GOOD = ["sign a trade agreement", "exchange state visits", "agree a cultural exchange", "announce joint development projects", "settle a border question"];
const HEADLINES_BAD = ["expel each other's diplomats", "trade accusations at the UN", "clash over fishing rights", "recall their ambassadors", "impose tariffs on each other"];

function aiInteraction() {
    const ks = Object.keys(G.nations).filter(k => k !== G.ck && G.nations[k].status === "sovereign");
    const a = pick(ks), b = pick(ks);
    if (!a || !b || a === b) return;
    const r = getRel(a, b);
    if (r > 0 ? chance(0.6) : chance(0.3)) {
        addRel(a, b, 4);
        if (chance(0.3)) log(`📰 ${G.nations[a].name} and ${G.nations[b].name} ${pick(HEADLINES_GOOD)}.`, "world");
    } else {
        addRel(a, b, -5);
        if (chance(0.3)) log(`📰 ${G.nations[a].name} and ${G.nations[b].name} ${pick(HEADLINES_BAD)}.`, "world");
    }
}

function aiApproach() {
    const ks = Object.keys(G.nations).filter(k => k !== G.ck && G.nations[k].status === "sovereign" && !G.nations[k].rebel);
    if (!ks.length) return;
    const weighted = ks.map(k => ({ k, w: Math.sqrt(G.nations[k].gdp) * (1 + Math.abs(getRel(G.ck, k)) / 40) }));
    let tot = weighted.reduce((s, x) => s + x.w, 0), r = Math.random() * tot, who = weighted[0].k;
    for (const x of weighted) { r -= x.w; if (r <= 0) { who = x.k; break; } }
    const rel = getRel(G.ck, who);
    let kind;
    if (rel >= 30) kind = pick(["trade", "aid_offer", "arms", "visit"]);
    else if (rel <= -30) kind = pick(["demand", "threat", "border"]);
    else kind = pick(["trade", "visit", "demand", "aid_offer"]);
    if (["usa", "russia"].includes(who) && blocSide(G.ck) === "nonaligned" && G.gov.type !== "colony") kind = "courting";
    if (G.gov.type === "colony" && !["usa", "russia", "india", "egypt"].includes(who)) return;
    queueScene("approach", { who, kind });
}

function superpowerPressure() {
    if (["usa", "russia", "china"].includes(G.ck) || G.gov.type === "colony") return;
    const usa = G.nations.usa, ussr = G.nations.russia;
    let foe = null;
    if (G.align <= -40 && getRel(G.ck, "usa") < -20 && usa.key !== G.ck) foe = "usa";
    if (G.align >= 40 && getRel(G.ck, "russia") < -20) foe = "russia";
    if (G.pol.resources === "nationalized" && C().res.includes("oil") && getRel(G.ck, "uk") < 0 && G.year < 1960) foe = foe || "usa";
    if (!foe) return;
    if (chance(0.03)) queueScene("covert_op", { who: foe });
}
