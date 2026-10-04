// ── RANDOM EVENTS — the texture of governing ────────────────────────

const RANDOM_EVENTS = [
    { id: "r_strike", w: () => (G.pillars.labor && G.pillars.labor.l < 50 ? 3 : 1) * (G.pol.labor === "state_unions" ? 0.3 : 1) },
    { id: "r_scandal", w: () => G.s.corruption > 30 ? 1 + G.s.corruption / 25 : 0.3 },
    { id: "r_disaster", w: () => 1.5 },
    { id: "r_harvest", w: () => G.ind.agriculture.out / G.econ.gdp > 0.2 ? 1.5 : 0.5 },
    { id: "r_investor", w: () => G.gov.type !== "colony" && G.pol.economy !== "collectivized" ? 1.5 : 0 },
    { id: "r_students", w: () => G.dev.uni > 1 && G.s.liberty < 60 ? 1.2 : 0.4 },
    { id: "r_expose", w: () => G.pol.press === "free" && G.s.scandal > 15 ? 1.5 : 0 },
    { id: "r_generals", w: () => G.pillars.military && G.pillars.military.l < 50 && !G.mil.noArmy ? 1.5 : 0 },
    { id: "r_clergy", w: () => G.pillars.clergy ? 1.2 : 0 },
    { id: "r_princes", w: () => G.pillars.royals ? 1.2 : 0 },
    { id: "r_feud", w: () => ["one_party", "military_junta", "monarchy"].includes(G.gov.type) ? 1.4 : 0 },
    { id: "r_separatists", w: () => G.regions.some(r => r.t.includes("minority") && regionSupport(r) < 40) ? 1.2 : 0 },
    { id: "r_epidemic", w: () => G.s.health < 40 ? 1.2 : 0.2 },
    { id: "r_crime", w: () => G.s.crime > 45 ? 1.5 : 0.2 },
    { id: "r_inflation", w: () => G.econ.inflation > 9 ? 2 : 0 },
    { id: "r_debt", w: () => G.econ.debt / G.econ.gdp > 0.9 ? 1.5 : 0 },
    { id: "r_boom", w: () => (G.ind.mining.out + G.ind.agriculture.out + indValue("oil")) / G.econ.gdp > 0.25 ? 1 : 0.2 },
    { id: "r_breakthrough", w: () => G.dev.tech > 50 ? 1 : 0.1 },
    { id: "r_pork", w: () => GT().democracy && G.factions.length > 1 ? 2.5 : 0 },
    { id: "r_lobby", w: () => GT().democracy || G.gov.type === "dominant_party" ? 1.5 : 0 },
    { id: "r_rival", w: () => GT().democracy ? 1 : 0 },
    { id: "r_refugees", w: () => G.wars.some(w => !w.over && w.weeks > 4) ? 0.8 : 0.2 },
    { id: "r_sports", w: () => 0.6 },
    { id: "r_spy", w: () => G.year > 1950 ? 0.6 : 0 },
    { id: "r_wages", w: () => G.econ.inflation > 5 ? 1 : 0.3 },
    { id: "r_bribe", w: () => trait("corrupt") ? 1.5 : 0.3 },
    { id: "r_famine", w: () => G.s.poverty > 60 && G.ind.agriculture.out / G.econ.gdp > 0.3 ? 0.8 : 0 },
    { id: "r_youth", w: () => G.year >= 1956 ? 0.7 : 0 },
    { id: "r_minister", w: () => G.cabinet ? 0.8 : 0 },
    { id: "r_infrastructure", w: () => Math.min(cov("roads"), cov("power")) < 35 ? 1 : 0.3 }
];

function randomEvent() {
    if (G.gov.type === "colony" && chance(0.5)) return;
    const pool = RANDOM_EVENTS.filter(e => (G.rcool[e.id] || 0) <= G.t).map(e => ({ e, w: Math.max(0, e.w()) })).filter(x => x.w > 0);
    const tot = pool.reduce((s, x) => s + x.w, 0);
    if (!tot) return;
    let r = Math.random() * tot;
    for (const x of pool) { r -= x.w; if (r <= 0) { G.rcool[x.e.id] = G.t + 30; queueScene(x.e.id, { r: Math.floor(Math.random() * 1000) }); return; } }
}

const regionPick = seed => G.regions[seed % G.regions.length];
const facPick = (seed, gov) => { const fs = G.factions.filter(f => gov == null || f.gov === gov); return fs.length ? fs[seed % fs.length] : G.factions[0]; };

SCENES.r_strike = a => S("✊", `${dateStr()} · ${regionPick(a.r).n}`, "General strike",
    `Dockers, miners and railwaymen in ${regionPick(a.r).n} have walked out demanding higher wages. The economy is grinding to a halt.`,
    [ch("Meet their demands", { inflation: 0.8, p: { labor: 10, business: -6 } }, "The strike ends."),
     ch("Send in the troops to run the docks", { growth: -0.3, p: { labor: -12, business: 6 }, liberty: -2 }, "The strike is broken. Bitterness lingers."),
     ch("Appoint an arbitration board", { capital: -4, p: { labor: 3 } }, "Months of hearings.", { req: capOK(4) })]);

SCENES.r_scandal = a => {
    const f = facPick(a.r, true);
    return S("💸", `${dateStr()} · The newspapers`, "Corruption scandal",
        `A minister from the ${f ? f.name : "government"} has been caught taking kickbacks on road contracts.`,
        [ch("Sack him publicly", { scandal: -6, p: { people: 3 }, fac: f ? { [f.k]: -10 } : {} }, "Your image survives; the faction is bruised."),
         ch("Cover it up", { scandal: 8, corruption: 2 }, "", { run: () => chance(0.4) ? (applyEffects({ scandal: 10, p: { press: -6 } }), "The cover-up is exposed.") : "It goes away, for now." }),
         ch("Launch an anti-corruption commission", { capital: -6, corruption: -4, p: { business: -3, press: 4 } }, "", { req: capOK(6) })]);
};

const DISASTERS = { "Americas": ["hurricane", "earthquake", "floods"], "Asia": ["typhoon", "floods", "earthquake"], "Europe": ["floods", "harsh winter"], "Africa": ["drought", "floods"], "Middle East": ["earthquake", "drought"], "Oceania": ["cyclone", "bushfires"] };
SCENES.r_disaster = a => {
    const kind = pick(DISASTERS[C().area] || ["floods"]), reg = regionPick(a.r);
    return S("🌪️", `${dateStr()} · ${reg.n}`, `${kind[0].toUpperCase() + kind.slice(1)} strikes ${reg.n}`,
        `A ${kind} has devastated ${reg.n}. Thousands are homeless.`,
        [ch("Massive relief and reconstruction", { cost: 0.6, p: { people: 4 }, region: { [G.regions.indexOf(reg)]: 8 } }, "Your response is praised."),
         ch("Standard relief", { cost: 0.2 }, ""),
         ch("Let local authorities cope", { region: { [G.regions.indexOf(reg)]: -10 }, p: { people: -4 } }, "Locals feel abandoned.")]);
};

SCENES.r_harvest = a => a.r % 2 ? S("🌾", dateStr(), "Bumper harvest", "Perfect weather has produced a record harvest.",
        [ch("Export the surplus", { growth: 0.5, p: { peasants: 4 } }, ""), ch("Build grain reserves", { cost: 0.1, stability: 3, p: { peasants: 2 } }, "")])
    : S("🥀", dateStr(), "Harvest failure", "Drought and blight have ruined the harvest. Food prices are soaring.",
        [ch("Import food and subsidize bread", { cost: 0.5, inflation: 0.5, p: { people: 2 } }, ""),
         ch("Ration food", { p: { people: -6, peasants: -4 }, stability: -3 }, ""),
         ch("Let prices rise", { inflation: 2, p: { people: -8, peasants: 4 }, stability: -5 }, "")]);

SCENES.r_investor = a => {
    const choices = Object.keys(INDUSTRIES).filter(k => indAvailable(k) && indGap(k) < 4 && !["agriculture", "oil"].includes(k));
    const k = choices.length ? choices[a.r % choices.length] : "textiles";
    const firms = COMPANIES.filter(c => c.sector === k && G.year >= c.from && G.year <= c.to && c.home !== G.ck);
    const corp = firms.length ? firms[a.r % firms.length].name : `A foreign ${INDUSTRIES[k].name.toLowerCase()} consortium`;
    const reg = regionPick(a.r);
    return S("🏢", `${dateStr()} · Foreign investment`, `${corp} wants to build in ${C().name}`,
        `${corp} proposes a large ${INDUSTRIES[k].name.toLowerCase()} plant in ${reg.n}, if you offer a tax holiday and look the other way on labor rules.`,
        [ch("Accept their terms (10-year tax holiday)", { p: { business: 5, labor: -3 } }, "", { run: () => { const out = Math.min(G.econ.gdp * 0.005, plantSize({ size: "M" })); openFirm({ name: corp, sector: k, home: null, out, jobs: jobsFor(out, k), holidayUntil: G.year + 10, local: 0, region: G.regions.indexOf(reg), foreign: true }); return ""; } }),
         ch("Accept, but demand local hiring and tech transfer", { capital: -4 }, "", { req: capOK(4), run: () => { if (!chance(0.5 + skill("economics") * 0.07)) return "They walk away."; const out = Math.min(G.econ.gdp * 0.004, plantSize({ size: "M" })); openFirm({ name: corp, sector: k, home: null, out, jobs: jobsFor(out, k) * 1.15, holidayUntil: G.year + 5, local: 2, region: G.regions.indexOf(reg), foreign: true }); return ""; } }),
         ch("Refuse: no foreign capitalists", { p: { people: 2, business: -3 } }, "")]);
};

SCENES.r_students = () => S("🎓", dateStr(), "Students in the streets",
    "University students are demonstrating against censorship and for more democracy.",
    [ch("Meet their leaders", { liberty: 3, p: { press: 6, security: -4 } }, ""),
     ch("Close the universities", { liberty: -5, p: { press: -8 }, stability: 2 }, "", { run: () => { G.dev.uni *= 0.98; } }),
     ch("Arrest the ringleaders", { liberty: -6, p: { press: -10, security: 5, people: -3 } }, "")]);

SCENES.r_expose = () => S("📰", dateStr(), "An exposé",
    "A crusading newspaper is about to publish documents embarrassing to your government.",
    [ch("Get ahead of it with a press conference", { scandal: -4, p: { press: 3 } }, ""),
     ch("Seek an injunction", { scandal: 4, liberty: -3, p: { press: -8 } }, ""),
     ch("Leak something worse about the opposition", { scandal: 2, fac: { opp: -8 }, p: { press: -4 } }, "")]);

SCENES.r_generals = () => S("🎖️", dateStr(), "The generals want more",
    "The chiefs of staff demand new jets, higher pay and a bigger budget, and they are not asking politely.",
    [ch("Give them what they want", { cost: 0.5, p: { military: 12 } }, ""),
     ch("A compromise", { cost: 0.2, p: { military: 4 } }, ""),
     ch("Refuse", { p: { military: -8 } }, "", { run: () => { G.flags.coup_pressure = (G.flags.coup_pressure || 0) + 4; } })]);

SCENES.r_clergy = () => S("🕌", dateStr(), "The clergy speak",
    `Religious leaders denounce ${G.pol.religion === "secular" ? "your secular laws" : "immodest films and Western music"} from the pulpit.`,
    [ch("Concede: new morality laws", { liberty: -3, p: { clergy: 10, press: -5 } }, ""),
     ch("Fund new mosques, churches and temples", { cost: 0.15, p: { clergy: 6 } }, ""),
     ch("Tell them to stay out of politics", { p: { clergy: -10, press: 4 } }, "")]);

SCENES.r_princes = () => S("👑", dateStr(), "Royal extravagance",
    "A prince has been photographed losing a fortune in a European casino. The family wants its allowances raised anyway.",
    [ch("Raise the allowances", { cost: 0.3, corruption: 2, p: { royals: 10, people: -3 } }, ""),
     ch("Rein in the family", { p: { royals: -10, people: 5 } }, ""),
     ch("Send the prince on a long diplomatic mission", { p: { royals: -3 } }, "")]);

SCENES.r_feud = a => {
    const f1 = G.factions[a.r % G.factions.length], f2 = G.factions[(a.r + 1) % G.factions.length];
    return S("🗡️", dateStr(), "A feud in the inner circle",
        `The ${f1.name} and the ${f2.name} are at each other's throats over appointments.`,
        [ch(`Side with the ${f1.name}`, { fac: { [f1.k]: 12, [f2.k]: -12 } }, ""),
         ch(`Side with the ${f2.name}`, { fac: { [f2.k]: 12, [f1.k]: -12 } }, ""),
         ch("Knock their heads together", { capital: -5, fac: { [f1.k]: -3, [f2.k]: -3 } }, "", { req: capOK(5) })]);
};

SCENES.r_separatists = () => {
    const reg = G.regions.filter(r => r.t.includes("minority")).sort((a, b) => regionSupport(a) - regionSupport(b))[0] || G.regions[0];
    const i = G.regions.indexOf(reg);
    return S("🏴", `${dateStr()} · ${reg.n}`, "Separatist unrest",
        `Activists in ${reg.n} demand autonomy, or independence.`,
        [ch("Grant regional autonomy", { region: { [i]: 15 }, p: { tribes: 5, military: -4 }, stability: 2 }, ""),
         ch("Pour in development money", { cost: 0.4, region: { [i]: 8 } }, ""),
         ch("Send the army", { region: { [i]: -15 }, liberty: -4, stability: -3, p: { military: 4 } }, "", { run: () => { if (G.s.stability < 40 && chance(0.3)) { const reb = ensureRebels(G.ck, `${reg.n} separatists`, 1.5); startWar({ name: `${reg.n} insurgency`, a: [reb], b: [G.ck], type: "insurgency", front: -20 }); return "An insurgency breaks out."; } return ""; } })]);
};

SCENES.r_epidemic = () => S("🦠", dateStr(), "Epidemic",
    `${pick(["Cholera", "Polio", "Smallpox", "Influenza", "Typhoid", "Malaria"])} is spreading through crowded towns.`,
    [ch("Mass vaccination and clinics", { cost: 0.3, p: { people: 4 } }, "", { run: () => { G.s.health = clamp(G.s.health + 2); } }),
     ch("Quarantine the affected areas", { growth: -0.3, p: { people: -2 } }, ""),
     ch("Do little", { p: { people: -6 } }, "", { run: () => { G.s.health = clamp(G.s.health - 3); } })]);

SCENES.r_crime = () => S("🚔", dateStr(), "Crime wave",
    "Robberies and gang violence are terrifying the cities.",
    [ch("Tough on crime: more police", { cost: 0.2, liberty: -2, p: { people: 4 } }, "", { run: () => { G.s.crime = clamp(G.s.crime - 5); } }),
     ch("Tough on the causes: youth programs", { cost: 0.3, p: { press: 3 } }, "", { run: () => { G.s.crime = clamp(G.s.crime - 2); G.s.poverty = clamp(G.s.poverty - 1); } }),
     ch("Death squads", { liberty: -10, legitimacy: -8, p: { security: 6, press: -10 } }, "", { req: !GT().democracy, run: () => { G.s.crime = clamp(G.s.crime - 10); } })]);

SCENES.r_inflation = () => S("📈", dateStr(), "Runaway prices",
    `Inflation is ${fmt(G.econ.inflation, 1)}%. Housewives are marching with empty pots.`,
    [ch("Tight money: raise interest rates", { inflation: -4, growth: -1.5, unemp: 1.5, p: { business: -3 } }, ""),
     ch("Price and wage controls", { inflation: -2, growth: -0.5, p: { business: -8, labor: 3 } }, ""),
     ch("Print money and hope", { inflation: 2, growth: 0.3 }, "")]);

SCENES.r_debt = () => S("🏦", dateStr(), "Debt crisis",
    `Public debt is ${Math.round(G.econ.debt / G.econ.gdp * 100)}% of GDP and creditors are nervous.`,
    [ch("IMF program: austerity", { cash: 4, growth: -1.5, p: { people: -8, labor: -6, business: 4 } }, ""),
     ch("Default on foreign debts", { cash: 10, prestige: -10, growth: -2, rel: { usa: -15, uk: -10 } }, ""),
     ch("Inflate it away", { inflation: 6, cash: 3 }, "")]);

SCENES.r_boom = () => S("💎", dateStr(), "Commodity boom",
    "World prices for your main exports have shot up.",
    [ch("Spend it on development", { growth: 0.6, p: { people: 3 } }, "", { run: () => { G.econ.debt = Math.max(0, G.econ.debt - G.econ.gdp * 0.01); } }),
     ch("Save it in a stabilization fund", { legitimacy: 2, cash: 1.5 }, "")]);

SCENES.r_breakthrough = () => S("🔬", dateStr(), "Scientific breakthrough",
    `Your scientists have made a breakthrough in ${pick(["transistors", "antibiotics", "jet engines", "plastics", "nuclear power", "computing", "rocketry", "crop genetics"])}.`,
    [ch("Fund development", { cost: 0.2, prestige: 3 }, "", { run: () => { G.dev.tech += 2; } }),
     ch("License it to industry", { growth: 0.3, p: { business: 4 } }, "", { run: () => { G.dev.tech += 1; } })]);

SCENES.r_pork = a => {
    const f = facPick(a.r, true) || G.factions[0];
    const reg = regionPick(a.r + 3), i = G.regions.indexOf(reg);
    const ind = pick(Object.keys(INDUSTRIES).filter(k => indAvailable(k) && indGap(k) < 3)) || "agriculture";
    return S("🏗️", `${dateStr()} · ${G.leg.name}`, `The ${f.name} wants a project`,
        `Legislators from the ${f.name} say their votes depend on a ${INDUSTRIES[ind].project.toLowerCase()} in ${reg.n}.`,
        [ch("Put it at the top of the capital program", { fac: { [f.k]: 8 } }, "", { run: () => { const it = proposeProject("ind:" + ind, i, "fac:" + f.k, true); const qi = G.cip.queue.indexOf(it); if (qi > 0) { G.cip.queue.unshift(G.cip.queue.splice(qi, 1)[0]); fundQueue(); } return G.cip.active.includes(it) ? "Funded. Construction begins." : "It's first in line for next year's capital money."; } }),
         ch("Add it to the back of the queue", { fac: { [f.k]: 3 } }, "", { run: () => { proposeProject("ind:" + ind, i, "fac:" + f.k, true); return "It joins the queue."; } }),
         ch("Refuse: no pork", { fac: { [f.k]: -10 }, p: { press: 2 } }, "")]);
};

SCENES.r_lobby = () => {
    const area = pick(["labor", "trade", "resources", "economy"]);
    const want = { labor: "restrict", trade: "protection", resources: "concessions", economy: "market" }[area];
    return S("💼", dateStr(), "A lobbyist calls",
        `Industry associations offer a large donation to your party if you move toward "${optName(policyOpt(area, want))}" on ${POLICY[area].name.toLowerCase()}.`,
        [ch("Take the money and promise to try", { funds: 40, scandal: 4, p: { business: 6 } }, ""),
         ch("Take the money, promise nothing", { funds: 20, p: { business: -4 } }, ""),
         ch("Show them the door", { p: { business: -3, press: 2 } }, "")]);
};

SCENES.r_rival = () => {
    const opp = G.parties.filter(p => !p.gov).sort((a, b) => b.seats - a.seats)[0];
    return S("🌟", dateStr(), "A rising star in the opposition",
        `A charismatic new leader of the ${opp ? opp.name : "opposition"} is drawing huge crowds.`,
        [ch("Attack him early", { capital: -3, scandal: 2, fac: { opp: -5 } }, "", { req: capOK(3), run: () => { G.campaign.bonus += 2; } }),
         ch("Steal his best ideas", { p: { people: 3 }, fac: { mine: -3 } }, ""),
         ch("Ignore him", {}, "", { run: () => { G.campaign.bonus -= 3; } })]);
};

SCENES.r_refugees = () => S("🚶", dateStr(), "Refugees at the border",
    "Tens of thousands of people fleeing a war nearby are arriving at your borders.",
    [ch("Open the borders", { cost: 0.2, prestige: 4, p: { people: -3 } }, "", { run: () => { G.econ.pop *= 1.003; } }),
     ch("Set up camps and ask the UN for help", { cost: 0.1, prestige: 1 }, ""),
     ch("Close the border", { prestige: -4, p: { people: 2 } }, "")]);

SCENES.r_sports = () => S("🏆", dateStr(), "Sporting triumph",
    `${C().name}'s team has won a major international ${pick(["football", "athletics", "cricket", "rugby", "boxing", "chess"])} championship.`,
    [ch("Greet them at the airport", { p: { people: 4 }, prestige: 2 }, "Great photos."), ch("Send a telegram", { p: { people: 1 } }, "")]);

SCENES.r_spy = () => S("🕵️", dateStr(), "Spy scandal",
    `A senior official has been unmasked as a ${G.align >= 0 ? "Soviet" : "Western"} agent.`,
    [ch("Public trial", { p: { security: 5, people: 2 }, rel: { [G.align >= 0 ? "russia" : "usa"]: -8 } }, ""),
     ch("Quietly swap him for one of ours", { p: { security: -2 } }, ""),
     ch("Use him to feed disinformation", { capital: -3 }, "", { req: capOK(3) })]);

SCENES.r_wages = () => S("⚖️", dateStr(), "Wage dispute",
    "Unions and employers are deadlocked over a national wage agreement.",
    [ch("Side with labor", { inflation: 0.5, p: { labor: 8, business: -6 } }, ""),
     ch("Side with business", { p: { labor: -8, business: 6 } }, ""),
     ch("Impose a settlement", { capital: -4, p: { labor: -2, business: -2 } }, "", { req: capOK(4) })]);

SCENES.r_bribe = () => S("💰", dateStr(), "An envelope",
    "A contractor leaves an envelope of cash in your office, 'for the campaign'.",
    [ch("Keep it", { funds: 15, scandal: 6, corruption: 1 }, ""),
     ch("Return it", { p: { press: 1 } }, ""),
     ch("Turn him in", { scandal: -3, p: { business: -3, press: 4 } }, "")]);

SCENES.r_famine = () => S("💀", dateStr(), "Famine in the countryside",
    "Crop failures and poverty have brought famine to rural districts.",
    [ch("Emergency food aid", { cost: 0.5, p: { peasants: 8, people: 4 } }, ""),
     ch("Request international aid", { prestige: -4, p: { peasants: 4 } }, ""),
     ch("Deny there is a famine", { p: { peasants: -15, people: -8 }, legitimacy: -6 }, "", { run: () => { G.econ.pop *= 0.995; } })]);

SCENES.r_youth = () => S("🎸", dateStr(), "The youth are restless",
    `${pick(["Rock 'n' roll", "Long hair and protest songs", "Television", "Hip-hop", "The internet"])} is changing how young people think, and their parents are alarmed.`,
    [ch("Embrace the new culture", { p: { press: 4, clergy: -4 }, liberty: 2 }, ""),
     ch("Ban it", { p: { clergy: 4, press: -6 }, liberty: -3 }, "")]);

SCENES.r_minister = a => {
    if (!G.cabinet) return S("👔", "", "", "", [ch("OK", {}, "")]);
    const posts = MINISTRIES.filter(m => G.cabinet[m.k]);
    const m = posts[a.r % posts.length], c = G.cabinet[m.k];
    return S("👔", dateStr(), `Your ${ministerTitle(m.k)} wants more power`,
        `${c.name} (${"★".repeat(c.comp)}) asks for a bigger budget and a say over appointments.`,
        [ch("Grant it", { cost: 0.15 }, "", { run: () => { c.loyalty = clamp(c.loyalty + 15); } }),
         ch("Refuse", {}, "", { run: () => { c.loyalty = clamp(c.loyalty - 15); } })]);
};

SCENES.minister_trouble = a => {
    const c = G.cabinet && G.cabinet[a.post];
    if (!c) return S("👔", "", "", "", [ch("OK", {}, "")]);
    return S("👔", dateStr(), "A disloyal minister",
        `${c.name}, your ${ministerTitle(a.post)}, is briefing against you and meeting your rivals.`,
        [ch("Sack them", {}, "", { run: () => { const f = G.factions.find(x => x.k === c.fac); if (f) f.loyalty = clamp(f.loyalty - 8); G.reshuffle = G.reshuffle || {}; G.reshuffle[a.post] = cabinetCandidates(a.post); G.cabinet[a.post] = null; return "Appoint a replacement on the Power tab."; } }),
         ch("Win them back with a promotion", { capital: -4 }, "", { req: capOK(4), run: () => { c.loyalty = clamp(c.loyalty + 25); } }),
         ch("Keep your enemies close", { scandal: 3 }, "")]);
};

SCENES.r_infrastructure = () => S("🌉", dateStr(), "Crumbling infrastructure",
    "A bridge has collapsed. Engineers warn that roads and power lines are decades behind.",
    [ch("Emergency repairs, then rebuild through the capital program", { cost: 0.1 }, "", { run: () => { proposeProject(cov("roads") < cov("power") ? "roads" : "power", 0, "event", true); return "A project joins the capital program."; } }),
     ch("Patch it up", { cost: 0.05, p: { people: -2 } }, "")]);
