// ── ACTIONS — what you can do each week ─────────────────────────────

function spend(cap, fn) {
    if (G.capital < cap) { toast("Not enough political capital", `You need ${cap}; you have ${Math.floor(G.capital)}.`); return false; }
    G.capital -= cap;
    fn();
    return true;
}

// ── Power-base actions (depend on your system) ─────────────────────

const POWER_ACTIONS = [
    { k: "speech", name: "Address the nation", icon: "📻", cost: 6, types: "all", desc: "A radio (later television) address. Better with oratory.",
      run: () => applyEffects({ p: { people: 3 + skill("oratory") * 0.8 + (trait("charismatic") ? 2 : 0) } }) },
    { k: "propaganda", name: "Propaganda campaign", icon: "📢", cost: 8, types: ["one_party", "military_junta", "monarchy", "dominant_party"], desc: "Posters, newsreels and loyal editors.",
      run: () => applyEffects({ p: { people: G.pol.press === "state" ? 6 : 3, press: -3 }, legitimacy: 2 }) },
    { k: "patronage", name: "Spread patronage", icon: "🎁", cost: 6, types: "all", desc: "Jobs, contracts and favors for the people who matter.",
      run: () => applyEffects({ cost: trait("corrupt") ? 0.1 : 0.2, corruption: 2, scandal: 2, p: { party: 6, tribes: 6, royals: 6, cadres: 6, military: 3 }, fac: { gov: 4 } }) },
    { k: "anticorruption", name: "Anti-corruption drive", icon: "🧹", cost: 10, types: "all", desc: "Arrest a few big fish. Popular, but your allies have fish too.",
      run: () => applyEffects({ corruption: -6, scandal: -5, p: { people: 5, party: -4, tribes: -5, royals: -5, business: -3 }, pm: { corruption: -4 } }) },
    { k: "crackdown", name: "Crack down on dissent", icon: "⛓️", cost: 8, types: "all", desc: "Arrest agitators, ban newspapers, break up meetings.",
      run: () => { applyEffects({ stability: 6, liberty: -6, legitimacy: GT().democracy ? -8 : -3, p: { security: 6, press: -10, people: -4 } }); if (trait("ruthless")) G.capital += 3; } },
    { k: "amnesty", name: "Political amnesty", icon: "🕊️", cost: 8, types: "all", desc: "Release political prisoners and let exiles return.",
      run: () => applyEffects({ liberty: 6, legitimacy: 4, p: { press: 8, people: 4, security: -8 }, stability: -2 }) },
    { k: "milpay", name: "Raise military pay", icon: "🎖️", cost: 5, types: "all", desc: "Keep the officers happy.", req: () => !G.mil.noArmy,
      run: () => applyEffects({ cost: 0.3, p: { military: 10 } }) },
    { k: "purge_officers", name: "Purge the officer corps", icon: "🪓", cost: 10, types: "all", desc: "Remove disloyal officers. Lowers coup risk but weakens the army.", req: () => !G.mil.noArmy,
      run: () => { applyEffects({ readiness: -15, mil: -8, p: { military: -6 }, pm: { military: 8 } }); G.flags.coup_pressure = 0; G.flags.coup_warned = false; } },
    { k: "clergy", name: "Endow the clergy", icon: "🕌", cost: 6, types: "all", desc: "Fund religious schools and shrines.", req: () => !!G.pillars.clergy,
      run: () => applyEffects({ cost: 0.15, p: { clergy: 10, press: -2 } }) },
    { k: "stipends", name: "Raise royal stipends", icon: "👑", cost: 5, types: ["monarchy"], desc: "The princes expect to live like princes.",
      run: () => applyEffects({ cost: 0.3, corruption: 1, p: { royals: 12, people: -2 } }) },
    { k: "majlis", name: "Hold a tribal majlis", icon: "🏜️", cost: 6, types: ["monarchy", "military_junta"], desc: "Meet the chiefs, hear grievances, distribute subsidies.",
      run: () => applyEffects({ cost: 0.15, p: { tribes: 10 } }) },
    { k: "heir", name: "Name a crown prince", icon: "🤴", cost: 8, types: ["monarchy"], desc: "Settle the succession. Some princes will be disappointed.", req: () => !G.leader.heir,
      run: () => { G.leader.heir = { name: `Crown Prince ${randomLeaderName(G.ck).split(" ")[0]}`, age: Math.max(18, G.leader.age - 25) }; applyEffects({ stability: 5, p: { royals: -4 }, legitimacy: 4 }); } },
    { k: "purge_rivals", name: "Purge a rival faction", icon: "🩸", cost: 14, types: ["one_party", "military_junta"], desc: "Arrest the least loyal faction's leaders. Survivors are loyal, out of fear.",
      run: () => {
          const f = G.factions.slice().sort((a, b) => a.loyalty - b.loyalty)[0];
          if (!f) return;
          if (chance(0.7 + skill("intrigue") * 0.05 + (trait("ruthless") ? 0.15 : 0))) {
              G.factions.forEach(x => { x.loyalty = clamp(x.loyalty + (x === f ? 40 : 8)); });
              applyEffects({ legitimacy: -6, liberty: -5, p: { politburo: 8, security: 6, cadres: -4 } });
              log(`🩸 The leaders of the ${f.name} are arrested.`, "major");
          } else { applyEffects({ p: { politburo: -15 }, fac: { all: -10 } }); log(`🩸 Your move against the ${f.name} fails. Everyone saw it.`, "bad"); }
      } },
    { k: "cult", name: "Cult of personality", icon: "🖼️", cost: 10, types: ["one_party", "military_junta", "dominant_party"], desc: "Statues, portraits, songs about you.",
      run: () => applyEffects({ p: { people: 6, politburo: -4, cadres: 4 }, legitimacy: 3 }) },
    { k: "woo_opposition", name: "Woo opposition legislators", icon: "🤝", cost: 8, types: ["presidential", "parliamentary", "semi_presidential", "directorial", "occupied"], desc: "Lunches, flattery and committee seats.",
      run: () => applyEffects({ fac: { opp: 8 }, p: { party: -2 } }) },
    { k: "whip_party", name: "Rally your party", icon: "🎗️", cost: 6, types: ["presidential", "parliamentary", "semi_presidential", "occupied", "dominant_party"], desc: "Caucus meetings, promotions, a stern word.",
      run: () => applyEffects({ fac: { mine: 8 }, p: { party: 5 } }) },
    { k: "court_partner", name: "Court your coalition partner", icon: "💐", cost: 6, types: ["parliamentary", "occupied"], desc: "Give a junior partner a policy win.", req: () => G.parties.some(p => p.gov && p.k !== G.leader.party),
      run: () => applyEffects({ p: { coalition: 10, party: -2 }, fac: { gov: 3 } }) },
    { k: "snap", name: "Call a snap election", icon: "🗳️", cost: 10, types: ["parliamentary", "occupied"], desc: "Strike while the polls are good.", req: () => !G.gov.noSnap && G.gov.nextElection && weeksUntil(G.gov.nextElection) > 10,
      run: () => callSnapElection() },
    { k: "occupation", name: "Cooperate with the occupation authority", icon: "🤝", cost: 6, types: ["occupied"], desc: "Show the occupiers you can be trusted.",
      run: () => applyEffects({ p: { occupation: 10, people: -3 } }) },
    { k: "consensus", name: "Seek Federal Council consensus", icon: "🏔️", cost: 6, types: ["directorial"], desc: "Hours of patient meetings.",
      run: () => applyEffects({ p: { party: 8, tribes: 3 } }) },
    { k: "rig", name: "Rig the next election", icon: "🗳️", cost: 12, types: ["presidential", "semi_presidential", "dominant_party", "parliamentary"], desc: "Stuff ballot boxes, intimidate voters. Huge risk if exposed.", req: () => !G.flags.rigging,
      run: () => { G.flags.rigging = true; applyEffects({ scandal: 8, legitimacy: -6 }); if (chance(GT().democracy ? 0.35 : 0.1)) { applyEffects({ scandal: 20, p: { people: -10, press: -15 } }); log("🗳️ Your vote-rigging plans have leaked!", "bad"); } } }
];

function powerActions() {
    return POWER_ACTIONS.filter(a => (a.types === "all" || a.types.includes(G.gov.type)) && G.gov.type !== "colony" && (!a.req || a.req()));
}

function doPowerAction(k) {
    const a = POWER_ACTIONS.find(x => x.k === k);
    if (!a) return;
    spend(a.cost, () => { a.run(); log(`${a.icon} ${a.name}.`, "policy"); toast(a.name, a.desc); });
}

function wooFaction(k) {
    const f = G.factions.find(x => x.k === k);
    if (!f) return;
    spend(5, () => { f.loyalty = clamp(f.loyalty + 8 + skill("legislation") * 1.5); toast("Faction courted", `${f.name} loyalty is now ${Math.round(f.loyalty)}.`); });
}

// ── Campaigning ─────────────────────────────────────────────────────

function campaignRally(i) {
    const r = G.regions[i];
    spend(4, () => { const gain = 2.5 + skill("oratory") * 0.6 + (trait("charismatic") ? 1 : 0); r.mod += gain; G.campaign.bonus += 0.4; toast(`Rally in ${r.n}`, `Support in ${r.n} +${fmt(gain, 1)}.`); });
}

function campaignAds() {
    if (G.funds < 25) return toast("Not enough party funds", "Ad blitzes cost $25M.");
    G.funds -= 25; G.campaign.bonus += 2.5;
    toast("Ad blitz", "Posters, radio spots and (later) TV ads everywhere. Campaign bonus +2.5.");
}

function fundraise() {
    spend(4, () => { const amt = Math.round(10 + (G.pillars.business ? G.pillars.business.l : 50) / 4); G.funds += amt; applyEffects({ scandal: 1 }); toast("Fundraiser", `Raised $${amt}M.`); });
}

// ── Industry ────────────────────────────────────────────────────────

function setSupport(k, lvl) {
    const i = G.ind[k];
    if (!i || lvl === i.sup) return;
    if (lvl > i.sup) { if (!spend(3, () => {})) return; }
    i.sup = clamp(lvl, 0, 3);
    log(`${INDUSTRIES[k].icon} ${INDUSTRIES[k].name}: ${SUPPORT_LEVELS[i.sup].name}.`, "policy");
}

function setOwnership(k, own) {
    const i = G.ind[k];
    if (!i || i.own === own) return;
    const cost = 8;
    spend(cost, () => {
        const was = i.own;
        i.own = own;
        if (own === "state") applyEffects({ p: { business: -8, labor: 4, cadres: 3 }, rel: was === "foreign" ? { usa: -6, uk: -6 } : {} });
        if (own === "private") applyEffects({ p: { business: 6, labor: -4 } });
        if (own === "foreign") applyEffects({ p: { business: 2, people: -3 }, cash: 0.3 });
        log(`${INDUSTRIES[k].icon} ${INDUSTRIES[k].name} is now ${OWNERSHIP[own].name.toLowerCase()}.`, "policy");
    });
}


// ── Diplomacy ───────────────────────────────────────────────────────

const DIPLO = [
    { k: "envoy", name: "Send an envoy", icon: "✉️", cost: 3, desc: "Improve relations a little.", ok: n => true,
      run: n => { addRel(G.ck, n.key, 6 + skill("diplomacy") + minBonus("foreign")); } },
    { k: "visit", name: "State visit", icon: "🤝", cost: 8, desc: "A big boost to relations and some prestige.", ok: n => getRel(G.ck, n.key) > -40,
      run: n => { addRel(G.ck, n.key, 14 + skill("diplomacy") * 2 + minBonus("foreign") * 2); applyEffects({ prestige: 1 }); } },
    { k: "trade", name: "Trade agreement", icon: "🚢", cost: 8, desc: "Needs relations of +20. Boosts growth.", ok: n => getRel(G.ck, n.key) >= 20 && !G.treaties.some(t => t.type === "trade" && t.with === n.key),
      run: n => { G.treaties.push({ type: "trade", with: n.key, t: G.t }); applyEffects({ growth: 0.15 + Math.min(0.6, n.gdp / G.econ.gdp * 0.1), p: { business: 2 } }); addRel(G.ck, n.key, 8); } },
    { k: "aid", name: "Give economic aid", icon: "💵", cost: 4, desc: "Costs 0.3% of GDP. Buys goodwill and pulls them toward your bloc.", ok: n => n.gdp < G.econ.gdp,
      run: n => { applyEffects({ cost: 0.3, prestige: 1 }); addRel(G.ck, n.key, 15); n.align = clamp(n.align + (G.align - n.align) * 0.1, -100, 100); } },
    { k: "askaid", name: "Request aid", icon: "🙏", cost: 6, desc: "Ask a richer friend for money. Needs relations of +25.", ok: n => n.gdp > G.econ.gdp * 2 && getRel(G.ck, n.key) >= 25,
      run: n => { if (chance(0.4 + getRel(G.ck, n.key) / 150)) { applyEffects({ cash: 1.2, align: n.align > G.align ? 5 : -5, p: { foreign: 5 } }); toast("Aid granted", `${n.name} sends money.`); } else toast("Aid refused", `${n.name} declines.`); } },
    { k: "arms", name: "Buy arms", icon: "🛩️", cost: 4, desc: "Costs 0.5% of GDP. +8% military strength.", ok: n => getRel(G.ck, n.key) >= 30 && n.mil > G.mil.strength,
      run: n => { applyEffects({ cost: 0.5, mil: 8, p: { military: 4 } }); addRel(G.ck, n.key, 4); } },
    { k: "denounce", name: "Denounce", icon: "📣", cost: 2, desc: "Rally nationalists at home; anger them abroad.", ok: n => true,
      run: n => { addRel(G.ck, n.key, -15); applyEffects({ p: { people: 2 } }); } },
    { k: "sanctions", name: "Impose sanctions", icon: "🚫", cost: 6, desc: "Hurts their economy and a little of yours.", ok: n => !G.treaties.some(t => t.type === "sanctions" && t.with === n.key),
      run: n => { G.treaties.push({ type: "sanctions", with: n.key, t: G.t }); addRel(G.ck, n.key, -25); n.gdp *= 0.98; n.stab -= 4; applyEffects({ growth: -0.1 }); } },
    { k: "covert", name: "Covert operation", icon: "🕵️", cost: 12, desc: "Destabilize their government. If it is already weak, your agents might topple it.", ok: n => true,
      run: n => {
          const odds = clamp(0.35 + skill("intrigue") * 0.07 + (trait("cunning") ? 0.1 : 0) + (50 - n.stab) / 100, 0.1, 0.85);
          if (chance(odds)) {
              n.stab -= 15;
              if (n.stab < 30 && chance(0.4)) { n.gov = "military_junta"; n.leader = `General ${randomLeaderName(n.playable ? n.key : G.ck).split(" ").pop()}`; n.align = G.align; n.diverged = true; n.stab = 45; log(`🕵️ Your agents help topple the government of ${n.name}. ${n.leader} takes power.`, "major"); record(`Organized a coup in ${n.name}, ${dateStr()}.`); }
              else toast("Operation succeeds", `${n.name} is destabilized.`);
          } else { addRel(G.ck, n.key, -25); applyEffects({ scandal: 6, prestige: -4 }); toast("Operation blown", `${n.name} exposes your agents.`); }
      } },
    { k: "war", name: "Declare war", icon: "⚔️", cost: 20, desc: "Needs relations below -50.", ok: n => getRel(G.ck, n.key) < -50 && !G.wars.some(w => !w.over && inWar(w, n.key) && inWar(w, G.ck)) && !G.mil.noArmy && G.gov.type !== "colony",
      run: n => queueScene("declare_war", { who: n.key }) }
];

function diploAction(k, nk) {
    const a = DIPLO.find(x => x.k === k), n = G.nations[nk];
    if (!a || !n || !a.ok(n)) return;
    spend(a.cost, () => { a.run(n); log(`${a.icon} ${a.name}: ${n.name}.`, "policy"); });
}

const BLOC_REQ = {
    nato: () => G.align >= 50 && ["Europe", "Americas"].includes(C().area) || (G.ck === "turkey" && G.align >= 40),
    warsaw: () => G.align <= -60 && C().area === "Europe",
    sinosov: () => G.align <= -60 && ["china", "russia"].includes(G.ck),
    seato: () => G.align >= 40 && ["Asia", "Oceania"].includes(C().area),
    cento: () => G.align >= 30 && ["Middle East", "Asia"].includes(C().area),
    anzus: () => ["usa", "australia", "newzealand"].includes(G.ck),
    nam: () => Math.abs(G.align) < 50 && G.year >= 1961,
    ecsc: () => C().area === "Europe" && G.year >= 1951 && GT().democracy,
    opec: () => G.res.includes("oil") && G.year >= 1960,
    commonwealth: () => ["uk", "canada", "australia", "newzealand", "india", "pakistan", "southafrica", "nigeria", "singapore", "barbados", "fiji"].includes(G.ck)
};

function toggleBloc(b) {
    const inIt = G.blocs[b].includes(G.ck);
    if (!inIt && !BLOC_REQ[b]()) return toast("Not eligible", "You don't meet the requirements to join.");
    spend(10, () => {
        if (inIt) {
            leaveBloc(b, G.ck);
            const side = BLOCS[b].side;
            G.blocs[b].forEach(k => addRel(G.ck, k, -10));
            if (side === "west") G.align = clamp(G.align - 15, -100, 100);
            if (side === "east") G.align = clamp(G.align + 15, -100, 100);
            log(`🚪 You leave ${BLOCS[b].name}.`, "major");
        } else {
            joinBloc(b, G.ck);
            G.blocs[b].forEach(k => addRel(G.ck, k, 10));
            if (BLOCS[b].side === "west") { G.align = clamp(G.align + 10, -100, 100); addRel(G.ck, "russia", -12); }
            if (BLOCS[b].side === "east") { G.align = clamp(G.align - 10, -100, 100); addRel(G.ck, "usa", -12); }
            if (BLOCS[b].econ) applyEffects({ growth: 0.3 });
            log(`✍️ You join ${BLOCS[b].name}.`, "major");
            record(`Joined ${BLOCS[b].name}, ${G.year}.`);
        }
    });
}

SCENES.declare_war = a => {
    const n = G.nations[a.who];
    const legVote = GT().democracy && G.gov.type !== "directorial";
    return S("⚔️", `${dateStr()} · War cabinet`, `War with ${n.name}?`,
        `Your forces: ${Math.round(G.mil.strength)}. Theirs: ${Math.round(n.mil)}.${legVote ? ` The ${G.leg.name} must authorize it.` : ""}`,
        [ch("Limited war: seize disputed territory", { tension: 6 }, "", { run: () => { if (legVote && !chance(clamp(govSeats() / G.leg.total + (approval() - 50) / 100, 0.1, 0.95))) return "The legislature refuses to authorize war."; startWar({ name: `${C().name}–${n.name} War`, a: [G.ck], b: [a.who], type: "limited", front: 0 }); applyEffects({ p: { people: 4 } }); return "The war begins."; } }),
         ch("War of conquest", { tension: 12, prestige: -6 }, "", { run: () => { if (legVote && !chance(clamp(govSeats() / G.leg.total + (approval() - 60) / 100, 0.05, 0.9))) return "The legislature refuses."; startWar({ name: `${C().name}–${n.name} War`, a: [G.ck], b: [a.who], type: "conquest", front: 0 }); return "The invasion begins."; } }),
         ch("Stand down", {}, "")]);
};

// ── Military ────────────────────────────────────────────────────────

function setCommit(id, lvl) {
    const w = G.wars.find(x => x.id === id);
    if (!w || w.over) return;
    const main = w.a[0] === G.ck || w.b[0] === G.ck;
    w.commit[G.ck] = clamp(lvl, main ? 1 : 0, 3);
    if (!main && lvl === 0) { w.a = w.a.filter(k => k !== G.ck); w.b = w.b.filter(k => k !== G.ck); applyEffects({ prestige: -3, weariness: -10 }); log(`🏳️ You withdraw from the ${w.name}.`, "policy"); }
}

function proposePeace(id) {
    const w = G.wars.find(x => x.id === id);
    if (!w || w.over) return;
    spend(6, () => {
        const mine = w.a.includes(G.ck) ? w.front : -w.front;
        const odds = clamp(0.35 + mine / 150 + w.weeks / 300 + skill("diplomacy") * 0.04, 0.05, 0.9);
        if (chance(odds)) { endWar(w, mine > 50 ? (w.a.includes(G.ck) ? "a" : "b") : "draw"); toast("Peace", `The ${w.name} is over.`); }
        else toast("Peace rejected", "The enemy thinks it can still win.");
    });
}

function useNukes(id) { queueScene("nuke_use", { id }); }

SCENES.nuke_use = a => {
    const w = G.wars.find(x => x.id === a.id);
    if (!w) return S("☢️", "", "", "", [ch("OK", {}, "")]);
    const enemy = w.a.includes(G.ck) ? w.b : w.a;
    const enemyNuke = enemy.some(k => (G.nations[k] && G.nations[k].nukes >= 2)) || enemy.some(k => Object.entries(G.blocs).some(([b, m]) => BLOCS[b].defense && m.includes(k) && m.some(x => G.nations[x] && G.nations[x].nukes >= 2 && x !== G.ck)));
    return S("☢️", `${dateStr()} · The button`, "Use nuclear weapons?",
        `This would be the first use of nuclear weapons in war${G.flags.nuke_used ? " since your last strike" : " since 1945"}. ${enemyNuke ? "The enemy, or its allies, can retaliate in kind." : "The enemy cannot retaliate in kind."}`,
        [ch("Authorize a strike", { tension: 40, prestige: -25 }, "", { run: () => {
            G.flags.nuke_used = true;
            Object.keys(G.nations).forEach(k => addRel(G.ck, k, -30));
            w.front += w.a.includes(G.ck) ? 60 : -60; w.front = clamp(w.front, -100, 100);
            record(`Used nuclear weapons in the ${w.name}, ${dateStr()}.`);
            if (enemyNuke && (G.tension >= 95 || chance(0.4))) { nuclearWar("Your strike was answered in kind. Within hours, the exchange became general."); return ""; }
            return "The world will never forget what you have done.";
        } }),
         ch("No", {}, "")]);
};

function mobilize() { spend(6, () => { applyEffects({ readiness: 15, cost: 0.4, tension: 2, p: { military: 4, people: -2 } }); toast("Mobilization", "Reservists report to their units."); }); }

// ── Resignation ─────────────────────────────────────────────────────

function resign() { queueScene("resign_confirm", {}); }
SCENES.resign_confirm = () => S("🚪", dateStr(), "Resign?", "You can step down, handing power to a successor (whom you can then play as), or end the game here.",
    [ch("Resign", {}, "", { run: () => fallFromPower("retired", "You resigned.", true) }),
     ch("Stay", {}, "")]);
