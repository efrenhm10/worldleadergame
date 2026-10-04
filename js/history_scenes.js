// ── HISTORY SCENES — the player's side of historical events ─────────

const D = () => dateStr();
function koreaWar() { return warNamed("Korean War"); }
function joinWar(name, side, level) { const w = warNamed(name); if (!w) return null; if (!w[side].includes(G.ck)) w[side].push(G.ck); w.commit[G.ck] = level; G.flags.at_war_ever = true; return w; }
function nuclearWar(text) { G.flags.nuclear_war = true; fallFromPower("nuclear", text); }
FALL_TEXT.nuclear = "Nuclear war";

// ── 1950 ──
hscene("sinosoviet_china", () => S("🤝", `${D()} · Moscow`, "The treaty with Stalin",
    "After weeks of waiting at a dacha, Stalin will sign an alliance. In exchange he wants special rights in Manchuria's railway and Port Arthur, and joint mining companies in Xinjiang.",
    [ch("Sign on Soviet terms", { cash: 1.5, align: -10, prestige: -3, rel: { russia: 25 }, p: { politburo: 5 } }, "$300 million in credits and thousands of Soviet advisers.", { run: () => { joinBloc("sinosov", "china"); joinBloc("sinosov", "russia"); G.dev.tech += 3; } }),
     ch("Bargain hard for better terms", {}, "", { run: () => { if (chance(0.35 + skill("diplomacy") * 0.08)) { joinBloc("sinosov", "china"); joinBloc("sinosov", "russia"); applyEffects({ cash: 1.5, prestige: 4, rel: { russia: 15 } }); return "Stalin grudgingly agrees to return Port Arthur by 1952."; } applyEffects({ rel: { russia: -15 } }); return "Stalin is offended. No treaty for now."; } }),
     ch("Go it alone", { rel: { russia: -25 }, prestige: 5, p: { politburo: -10 } }, "China stands independent, and isolated.")]));
hscene("sinosoviet_russia", () => S("🤝", `${D()} · The Kremlin`, "Mao wants an alliance",
    "Mao Zedong has been in Moscow for weeks. He wants a mutual defense treaty, credits and help building heavy industry.",
    [ch("Sign: the socialist camp stands united", { cost: 0.4, rel: { china: 25 }, prestige: 4 }, "", { run: () => { joinBloc("sinosov", "china"); joinBloc("sinosov", "russia"); } }),
     ch("Sign, but keep the Manchurian concessions", { rel: { china: 10 } }, "", { run: () => { joinBloc("sinosov", "china"); joinBloc("sinosov", "russia"); } }),
     ch("Refuse: another Tito in the making", { rel: { china: -30 } }, "")]));
hscene("mccarthy", () => S("🗞️", `${D()} · Wheeling, West Virginia`, "\"I have here in my hand a list...\"",
    "Senator Joseph McCarthy claims 205 communists work in the State Department. The press is in a frenzy, and many in your own party want to look tough.",
    [ch("Denounce him as a demagogue", { liberty: 3, p: { press: 8, people: -3 }, fac: { "rep:0": -10 } }, "History may thank you. The polls won't, yet."),
     ch("Stay above the fray", { scandal: 3 }, "The witch-hunt grows."),
     ch("Launch loyalty investigations of your own", { liberty: -8, p: { press: -10, people: 5, security: 5 }, fac: { "dem:1": 6 } }, "The Red Scare becomes government policy.")]));
hscene("apartheid_laws", () => S("📜", `${D()} · Cape Town`, "The apartheid bills",
    "Your ministers have drafted the Population Registration Act (classifying every citizen by race) and the Group Areas Act (segregating where people may live). The party demands them.",
    [ch("Pass them", { prestige: -6, p: { party: 6, people: 4 }, fac: { "np:1": 8 } }, "Apartheid becomes the law of the land.", { run: () => { G.flags.apartheid_laws = true; addRel("southafrica", "india", -10); } }),
     ch("Water them down", { p: { party: -8 }, fac: { "np:1": -15 } }, "Hardliners are furious."),
     ch("Abandon apartheid", { p: { party: -25, people: -15 }, fac: { "np:1": -40, "np:0": -15 }, prestige: 10 }, "", { run: () => { G.pol.rights = "statusquo"; return "Your party is in uproar. A leadership challenge is surely coming."; } })]));
hscene("kim_request", () => S("🇰🇵", `${D()} · Secret cable from Pyongyang`, "Kim Il-sung asks for permission to invade the South",
    `Kim promises victory in three weeks; the Americans, he says, will not intervene. ${isP("china") ? "Stalin has told Kim he must get your consent." : "Mao may help if things go wrong."}`,
    [ch("Approve the invasion", { tension: 3 }, "Kim's army prepares.", { run: () => { G.flags.korea_approved = true; } }),
     ch("Refuse", { rel: { northkorea: -20 } }, "The invasion is called off.", { run: () => { G.flags.korea_denied = true; } })]));
hscene("nsc68", () => S("📑", `${D()} · National Security Council`, "NSC-68",
    "A top-secret report argues the Soviets seek world domination and calls for tripling the defense budget.",
    [ch("Adopt it: massive rearmament", { p: { military: 12, business: 4 }, tension: 4 }, "", { run: () => { G.pol.military = "high_mil"; } }),
     ch("Shelve it", { p: { military: -5 } }, "Defense spending stays where it is.")]));
hscene("schuman_france", () => S("🇪🇺", `${D()} · Quai d'Orsay`, "The Schuman Plan",
    "Robert Schuman and Jean Monnet propose pooling French and German coal and steel under a supranational authority, making war between them 'materially impossible'.",
    [ch("Launch it", { prestige: 6, growth: 0.3, rel: { germany: 25 } }, "", { run: () => { ["france", "germany", "italy"].forEach(k => joinBloc("ecsc", k)); record("Founded the European Coal and Steel Community."); } }),
     ch("Too risky: Germany must be contained", { rel: { germany: -10 } }, "")]));
hscene("schuman_germany", () => S("🇪🇺", `${D()} · Bonn`, "France offers partnership",
    "Paris proposes pooling coal and steel with Germany as equals. It would be your country's first step back into the community of nations.",
    [ch("Accept with enthusiasm", { prestige: 8, growth: 0.3, rel: { france: 25 }, p: { occupation: 8 } }, "", { run: () => { ["france", "germany", "italy"].forEach(k => joinBloc("ecsc", k)); } }),
     ch("Hold out for unification first (the SPD line)", { rel: { france: -10 }, p: { occupation: -5 } }, "")]));
hscene("schuman_uk", () => S("🇪🇺", `${D()} · Whitehall`, "The Schuman Plan",
    "France and Germany are pooling coal and steel and invite Britain to join, on condition it accepts a supranational authority.",
    [ch("Join", { growth: 0.2, rel: { france: 10 }, p: { labor: -5 } }, "", { run: () => { ["france", "germany", "italy", "uk"].forEach(k => joinBloc("ecsc", k)); } }),
     ch("Stay out: we have the Commonwealth", {}, "", { run: () => { ["france", "germany", "italy"].forEach(k => joinBloc("ecsc", k)); } })]));
hscene("june25", () => S("🚨", `${D()} · 4:00 AM`, "The North has invaded",
    "North Korean tanks are pouring across the 38th parallel. Your army has no anti-tank weapons. Seoul may fall within days.",
    [ch("Defend Seoul to the last", { p: { people: 6, military: 6 } }, "", { run: () => { const w = koreaWar(); if (w) w.mom -= 3; return "Your troops dig in north of the capital."; } }),
     ch("Move the government to Busan and appeal to the UN", { p: { foreign: 10 }, prestige: 2 }, "", { run: () => { const w = koreaWar(); if (w && !w.b.includes("usa") && G.nations.usa.status === "sovereign") { w.b.push("usa"); w.commit.usa = 2; } return "The UN Security Council votes to defend South Korea."; } }),
     ch("Blow the Han River bridge", { p: { people: -6 } }, "", { run: () => { const w = koreaWar(); if (w) w.mom -= 5; return "The bridge goes down with refugees on it. The advance slows."; } })]));
hscene("korea_usa", () => S("🚨", `${D()} · Blair House`, "Korea",
    "North Korea has invaded the South. The Soviets are boycotting the UN Security Council, so a resolution could pass.",
    [ch("Commit US forces under the UN flag", { p: { people: 6, military: 6 }, tension: 4 }, "", { run: () => { joinWar("Korean War", "b", 2); G.flags.seventh_fleet = true; return "MacArthur takes command."; } }),
     ch("Air and naval support only", { tension: 2 }, "", { run: () => { joinWar("Korean War", "b", 1); G.flags.seventh_fleet = true; } }),
     ch("Stay out: Korea is not vital", { prestige: -10, p: { military: -8 }, rel: { southkorea: -40 } }, "")]));
hscene("un_call", () => S("🇺🇳", `${D()} · United Nations`, "The UN calls for troops in Korea",
    "The Security Council has asked member states to help repel the North Korean invasion.",
    [ch("Send a brigade", { rel: { usa: 12, southkorea: 15 }, p: { military: 4 } }, "", { run: () => { joinWar("Korean War", "b", 1); } }),
     ch("Send a medical unit", { rel: { usa: 4 }, prestige: 2 }, ""),
     ch("Decline", { rel: { usa: -6 } }, "")]));
hscene("taiwan_china", () => S("🌊", `${D()} · Fujian coast`, "Taiwan",
    "The Americans have not committed to defend Taiwan. Your generals say an amphibious invasion could succeed this summer, at enormous cost.",
    [ch("Invade", { tension: 8, p: { military: 6 } }, "", { run: () => { startWar({ name: "Battle for Taiwan", a: [G.ck], b: ["taiwan"], type: "conquest", front: 5, onEnd: "taiwan" }); return "The armada sails."; } }),
     ch("Wait and build up", {}, "")]));
hscene("taiwan_usa", () => S("🌊", `${D()} · State Department`, "Mao prepares to invade Taiwan",
    "Intelligence shows Communist forces massing opposite Taiwan. Chiang Kai-shek begs for help.",
    [ch("Send the Seventh Fleet into the Strait", { tension: 6, rel: { taiwan: 25, china: -25 } }, "The invasion is called off.", { run: () => { G.flags.seventh_fleet = true; } }),
     ch("Let the civil war end", { rel: { taiwan: -40 }, p: { people: -6 } }, "", { run: () => { startWar({ name: "Battle for Taiwan", a: ["china"], b: ["taiwan"], type: "conquest", front: 10, onEnd: "taiwan" }); } })]));
hscene("china_korea", () => S("🇨🇳", `${D()} · Zhongnanhai`, "UN troops approach the Yalu",
    "American-led forces have crossed the 38th parallel and are driving toward your border. Kim's regime is collapsing.",
    [ch("Send the People's Volunteers", { tension: 10, rel: { usa: -40, northkorea: 30 }, p: { military: 6 } }, "", { run: () => { const w = joinWar("Korean War", "a", 2); if (w) w.mom += 4; return "300,000 men cross the Yalu at night."; } }),
     ch("Send weapons only", { rel: { northkorea: 5 } }, ""),
     ch("Stay out", { rel: { northkorea: -30, russia: -10 }, p: { politburo: -5 } }, "")]));
hscene("tibet_china", () => S("🏔️", `${D()} · Chamdo`, "Tibet",
    "Tibet has been effectively independent since 1913. Your army is ready to 'liberate' it.",
    [ch("March on Lhasa", { prestige: 3, rel: { india: -15 }, p: { military: 4 } }, "", { run: () => { G.flags.tibet = true; } }),
     ch("Negotiate autonomy under Chinese sovereignty", { prestige: 2, rel: { india: -5 }, legitimacy: 3 }, "", { run: () => { G.flags.tibet = true; } }),
     ch("Leave Tibet alone", { p: { politburo: -6, military: -4 }, rel: { india: 10 } }, "")]));
hscene("tibet_india", () => S("🏔️", `${D()} · New Delhi`, "China enters Tibet",
    "The People's Liberation Army has entered Tibet, India's buffer with China.",
    [ch("Protest strongly", { rel: { china: -12 }, prestige: 2 }, ""),
     ch("Accept it: Hindi-Chini bhai-bhai", { rel: { china: 8 }, p: { press: -3 } }, "")]));
hscene("aramco", () => S("🛢️", `${D()} · Dhahran`, "The Aramco question",
    "Venezuela won a 50/50 profit split from the oil companies. Your finance minister says Aramco can afford the same.",
    [ch("Demand 50/50", { p: { royals: 6, people: 4 }, rel: { usa: -3 } }, "Aramco agrees. Revenue soars.", { run: () => { G.pol.resources = "partnership"; } }),
     ch("Nationalize outright", { p: { people: 8 }, rel: { usa: -25 }, growth: -1 }, "", { run: () => { G.pol.resources = "nationalized"; } }),
     ch("Keep the old deal", { p: { royals: -5 }, rel: { usa: 5 } }, "")]));

// ── 1951–1953 ──
hscene("iran_oil", () => S("🛢️", `${D()} · The Majlis`, "The Majlis votes to nationalize oil",
    "Prime Minister Razmara has been assassinated. The Majlis has unanimously voted to nationalize the Anglo-Iranian Oil Company, and the bill awaits your signature. Mossadegh is the hero of the streets.",
    [ch("Sign it and appoint Mossadegh", { p: { people: 12, clergy: 5, royals: -5 }, prestige: 6, rel: { uk: -35 } }, "", { run: () => { G.pol.resources = "nationalized"; G.flags.iran_nationalized = true; queueScene("nationalization_backlash", {}); return "Iran's oil belongs to Iran."; } }),
     ch("Veto it", { p: { people: -20, clergy: -10 }, stability: -10, rel: { uk: 15 } }, "Riots in Tehran."),
     ch("Push a 50/50 compromise", { p: { people: -4 }, rel: { uk: -5 } }, "", { run: () => { G.pol.resources = "partnership"; } })]));
hscene("abadan", () => S("🛢️", `${D()} · Cabinet room`, "Iran has seized our oil",
    "Mossadegh has nationalized the Anglo-Iranian Oil Company and its refinery at Abadan, the largest in the world.",
    [ch("Send paratroopers to seize Abadan", { tension: 6, rel: { iran: -40, usa: -10 }, prestige: 3 }, "", { run: () => { startWar({ name: "Abadan Crisis", a: [G.ck], b: ["iran"], type: "limited", front: 10 }); } }),
     ch("Boycott Iranian oil and plot with the Americans", { rel: { iran: -20 } }, "", { run: () => { G.flags.ajax_planned = true; } }),
     ch("Negotiate a settlement", { prestige: -6, p: { press: 4 } }, "")]));
hscene("macarthur", () => S("🎖️", `${D()} · Tokyo`, "MacArthur wants to bomb China",
    "General MacArthur publicly demands authority to bomb Manchuria and unleash Chiang Kai-shek, defying your policy of limited war.",
    [ch("Fire him", { p: { military: -8, people: -6 }, legitimacy: 4 }, "The general comes home to ticker-tape parades. You take the heat."),
     ch("Back him: bomb Manchuria", { tension: 20, rel: { china: -30, russia: -20 } }, "", { run: () => { const w = koreaWar(); if (w) w.mom -= 8; if (G.tension >= 98 && chance(0.25)) nuclearWar("Soviet bombers retaliated. The Korean War became the Third World War."); } })]));
hscene("sanfran_japan", () => S("✍️", `${D()} · San Francisco`, "The peace treaty",
    "Washington offers a peace treaty ending the occupation. The price is a Security Treaty letting US forces stay in Japan indefinitely. The Soviets will not sign.",
    [ch("Sign both treaties", { align: 10, rel: { usa: 15, russia: -15 }, p: { occupation: 10, people: 2 } }, "Sovereignty returns in April 1952.", { run: () => { G.flags.sf_treaty = true; } }),
     ch("Demand a neutral peace including Moscow", { p: { occupation: -20, people: 4 } }, "The occupation continues.", { run: () => { G.fired.japan_sov = "skipped"; } })]));
hscene("anzus", () => S("🦘", `${D()} · San Francisco`, "ANZUS",
    "The Americans offer a security treaty with Australia and New Zealand. It doesn't include Britain.",
    [ch("Sign ANZUS", { rel: { usa: 15 }, prestige: 3 }, "", { run: () => { ["usa", "australia", "newzealand"].forEach(k => joinBloc("anzus", k)); } }),
     ch("Rely on Britain", { rel: { uk: 5 } }, "")]));
hscene("colegiado", () => S("🏔️", `${D()} · Montevideo`, "The Colegiado plebiscite",
    "Batlle's heirs and the Blancos have agreed a constitutional reform replacing the presidency with a nine-member National Council of Government. It goes to a plebiscite.",
    [ch("Back the reform", { capital: -5 }, "", { run: () => { if (chance(0.55)) { changeGovType("directorial"); G.leader.title = "President of the National Council"; G.gov.nextElection = [G.year + 4, G.month]; G.gov.termLimit = null; return "The voters approve. Uruguay is governed by a council."; } return "The plebiscite fails."; } }),
     ch("Oppose it", { p: { party: -5 } }, "")]));
hscene("nato_turkey", () => S("🛡️", `${D()} · Ankara`, "NATO membership",
    `NATO is ready to admit Turkey${warNamed("Korean War") && inWar(warNamed("Korean War"), G.ck) ? ", impressed by your brigade in Korea" : ""}.`,
    [ch("Join NATO", { align: 10, rel: { usa: 15, russia: -20 }, p: { military: 8 } }, "", { run: () => { joinBloc("nato", G.ck); record("Joined NATO, 1952."); } }),
     ch("Stay neutral", { rel: { russia: 10 } }, "")]));
hscene("stalin_note", () => S("✉️", `${D()} · Bonn`, "The Stalin Note",
    "Stalin proposes a reunified, neutral Germany with its own army and free elections. The Western Allies think it is a trick to stop you joining the West.",
    [ch("Explore the offer seriously", { rel: { usa: -20, russia: 15 }, p: { occupation: -15, people: 10 } }, "", { run: () => { if (chance(0.25)) { G.flags.reunified = true; G.flags.neutral_germany = true; G.econ.gdp += G.nations.eastgermany.gdp; G.econ.services += G.nations.eastgermany.gdp; G.econ.pop += 18; G.nations.eastgermany.status = "annexed"; ME().name = "Germany"; record("Reunified Germany as a neutral state, 1952."); return "Astonishingly, the talks succeed. Germany is reunified, and neutral."; } return "The talks collapse in mutual accusation."; } }),
     ch("Reject it: Westbindung first", { rel: { usa: 8 }, p: { occupation: 8, people: -3 } }, "")]));
hscene("sk_crisis", () => S("🇰🇷", `${D()} · Busan (wartime capital)`, "The constitutional crisis",
    "The National Assembly will elect the next president in August, and it won't be you. Your allies propose declaring martial law and forcing through an amendment for direct popular elections, which you would win.",
    [ch("Martial law and the amendment", { liberty: -10, legitimacy: -6, p: { party: 10, press: -10 } }, "The amendment passes with legislators surrounded by troops.", { run: () => { G.flags.direct_election = true; G.campaign.bonus += 10; } }),
     ch("Accept the Assembly's verdict", { legitimacy: 6 }, "", { run: () => { G.campaign.bonus -= 8; } })]));
hscene("evita", () => S("🕯️", `${D()} · Buenos Aires`, "Evita is dead",
    "Eva Perón has died of cancer at 33. Millions line the streets. The descamisados have lost their Santa Evita.",
    [ch("A state funeral of unprecedented scale", { cost: 0.2, p: { people: 6, labor: 5, clergy: -3 }, pm: { labor: -6 } }, "Grief binds the movement, for now.")]));
hscene("eritrea", () => S("🇪🇷", `${D()} · Addis Ababa`, "The Eritrean federation",
    "The UN has federated Eritrea with Ethiopia under your crown, with its own parliament. Your ministers want to absorb it entirely.",
    [ch("Respect the federation", { prestige: 4, legitimacy: 2 }, "", { run: () => { G.res.includes("coast") || G.res.push("coast"); } }),
     ch("Plan for full annexation", { p: { military: 4 } }, "", { run: () => { G.flags.eritrea_plan = true; G.res.includes("coast") || G.res.push("coast"); } })]));
hscene("eg_uprising", () => S("🇩🇪", `${D()} · East Berlin`, "Uprising in East Germany",
    "Construction workers on the Stalinallee have gone on strike, and hundreds of thousands are demonstrating across the GDR.",
    [ch("Send in the tanks", { tension: 5, prestige: -4, p: { politburo: 5, security: 5 } }, "Order is restored. Dozens are dead."),
     ch("Force Ulbricht to make concessions", { p: { politburo: -6 }, liberty: 2 }, "", { run: () => { G.nations.eastgermany.stab += 10; } })]));
hscene("armistice", a => S("🕊️", `${D()} · Panmunjom`, "Armistice talks",
    "Negotiators have agreed armistice terms: a ceasefire on the current front line and a demilitarized zone.",
    [ch("Sign the armistice", {}, "The guns fall silent in Korea.", { run: () => { const w = G.wars.find(x => x.id === a.id); if (w) endWar(w, "draw"); } }),
     ch("Fight on for total victory", { p: { military: 4 }, weariness: 5 }, "")]));
hscene("ajax_iran", () => S("🕵️", `${D()} · Tehran`, "A coup is brewing",
    "Your security chief reports that American and British agents are paying mobs and bribing officers to overthrow you over the oil nationalization.",
    [ch("Arrest the plotters", { p: { security: 6 } }, "", { run: () => chance(0.4 + skill("intrigue") * 0.08) ? (applyEffects({ rel: { usa: -15, uk: -15 }, legitimacy: 6 }), "The plot is smashed. Western agents are expelled.") : (fallFromPower("coup", "The CIA-backed coup succeeded. You are under arrest."), "") }),
     ch("Do a deal: return to 50/50", { p: { people: -12 }, rel: { usa: 20, uk: 20 } }, "", { run: () => { G.pol.resources = "partnership"; G.flags.iran_nationalized = false; } }),
     ch("Flee abroad and wait", {}, "", { run: () => fallFromPower("coup", "You fled. A new government took power with Western backing.") })]));
hscene("ajax_west", () => S("🕵️", `${D()} · Secret meeting`, "Operation Ajax",
    "Intelligence chiefs propose overthrowing Iran's Prime Minister Mossadegh and restoring Western control of Iranian oil.",
    [ch("Approve the coup", { scandal: 3 }, "", { run: () => { if (chance(0.7)) { G.flags.iran_nationalized = false; G.nations.iran.align = 80; addRel("iran", G.ck, 30); return "Mossadegh is overthrown. The Shah returns with full powers."; } addRel("iran", G.ck, -40); return "The coup fails. Iran expels your diplomats."; } }),
     ch("Refuse", {}, "")]));

// ── 1954–1957 ──
hscene("brown", () => S("⚖️", `${D()} · Supreme Court`, "Brown v. Board of Education",
    "The Supreme Court has ruled unanimously that segregated public schools are unconstitutional. The South vows 'massive resistance'.",
    [ch("Enforce the ruling", { prestige: 6, p: { press: 6 }, fac: { "dem:1": -15 }, region: { 1: -10 } }, "", { run: () => { G.pol.rights = "statusquo"; } }),
     ch("Say nothing", { prestige: -4 }, ""),
     ch("Side with the South", { prestige: -10, fac: { "dem:1": 10 }, p: { press: -8 } }, "")]));
hscene("dbp_france", a => S("🇻🇳", `${D()} · Dien Bien Phu`, "The siege of Dien Bien Phu",
    "General Giap has surrounded 15,000 French troops in a remote valley. The garrison cannot hold for long.",
    [ch("Ask Washington for air strikes (Operation Vulture)", {}, "", { run: () => { const w = G.wars.find(x => x.id === a.id); if (chance(0.3)) { if (w) w.mom -= 15; applyEffects({ rel: { usa: 5 } }); return "American bombers break the siege."; } if (w) w.mom += 6; return "Eisenhower refuses. The garrison falls."; } }),
     ch("Pour in reinforcements", { cost: 1, weariness: 8 }, "", { run: () => { const w = G.wars.find(x => x.id === a.id); if (w) { w.commit[G.ck] = 3; w.mom -= 4; } } }),
     ch("Negotiate at Geneva", { prestige: -6, weariness: -20 }, "Vietnam is partitioned; Cambodia and Laos become independent.", { run: () => { const w = G.wars.find(x => x.id === a.id); if (w) endWar(w, "draw"); } })]));
hscene("vulture", a => S("✈️", `${D()} · The Pentagon`, "Operation Vulture",
    "France begs for US air strikes to save Dien Bien Phu. Some advisers even mention atomic bombs.",
    [ch("Launch conventional air strikes", { tension: 5, rel: { france: 15, china: -10 } }, "", { run: () => { const w = G.wars.find(x => x.id === a.id); if (w) { w.b.push(G.ck); w.commit[G.ck] = 1; w.mom -= 10; } } }),
     ch("Use atomic weapons", { tension: 30, prestige: -20, rel: { india: -40, china: -40, russia: -30 } }, "", { req: G.mil.nukes >= 2, run: () => { const w = G.wars.find(x => x.id === a.id); if (w) w.mom -= 30; if (G.tension >= 100 && chance(0.3)) nuclearWar("Your atomic strike in Vietnam triggered a chain of escalation."); return "The world recoils in horror."; } }),
     ch("Refuse", { rel: { france: -10 } }, "")]));
hscene("seato", () => S("🌏", `${D()} · Manila`, "SEATO",
    "Washington proposes a Southeast Asian defense pact to contain communism.",
    [ch("Join SEATO", { align: 8, rel: { usa: 10, china: -10 } }, "", { run: () => joinBloc("seato", G.ck) }),
     ch("Stay out", {}, "")]));
hscene("algeria", () => S("🇩🇿", `${D()} · Algiers`, "Toussaint Rouge",
    "FLN insurgents have struck across Algeria. Algeria is legally part of France, with a million European settlers.",
    [ch("'Algeria is France': send the army", { p: { military: 6 }, weariness: 5 }, "", { run: () => { const w = warNamed("Algerian War"); if (w) w.commit[G.ck] = 3; } }),
     ch("Open secret talks with the nationalists", { p: { military: -10, people: -4 }, prestige: 2 }, "", { run: () => { G.flags.coup_pressure = (G.flags.coup_pressure || 0) + 10; } })]));
hscene("peron_church", () => S("⛪", `${D()} · Buenos Aires`, "Perón against the Church",
    "Your feud with the Catholic hierarchy is escalating. Your allies want to legalize divorce and end religious education.",
    [ch("Escalate: divorce law, expel the bishops", { p: { clergy: -30, military: -10, labor: 5 } }, "Catholic officers start talking to each other.", { run: () => { G.flags.coup_pressure = (G.flags.coup_pressure || 0) + 15; } }),
     ch("Seek reconciliation", { p: { clergy: 10, labor: -3 } }, "")]));
hscene("baghdad", () => S("🏺", `${D()} · Baghdad`, "The Baghdad Pact",
    "Britain proposes an alliance of Turkey, Iraq, Iran and Pakistan against Soviet expansion.",
    [ch("Join the pact", { align: 8, rel: { uk: 8, russia: -12 } }, "", { run: () => joinBloc("cento", G.ck) }),
     ch("Stay out", {}, "")]));
hscene("bandung", () => S("🕊️", `${D()} · Bandung`, isP("indonesia") ? "You host the world's new nations" : "The Bandung Conference",
    "29 nations of Asia and Africa, representing half of humanity, gather to oppose colonialism and to steer between the blocs.",
    [ch(isP("indonesia") ? "Give the opening speech" : "Champion non-alignment", { prestige: isP("indonesia") ? 10 : 5, align: G.align > 0 ? -5 : 5, rel: { india: 6, china: 6 } }, "", { run: () => { G.flags.bandung_star = true; } }),
     ch("Attend as a loyal Western ally", { rel: { usa: 5 } }, ""),
     ch("Stay home", {}, "")]));
hscene("paris_agreements", () => S("🇩🇪", `${D()} · Paris`, "Sovereignty",
    "The Western Allies will end the occupation, restore sovereignty and admit West Germany to NATO, with a new army, the Bundeswehr.",
    [ch("Accept: sovereignty, NATO and rearmament", { prestige: 12, rel: { usa: 10, russia: -20 }, p: { people: 4 } }, "", { run: () => { changeGovType("parliamentary"); G.mil.noArmy = false; G.pol.military = "moderate_mil"; joinBloc("nato", G.ck); record("Restored sovereignty and joined NATO, 1955."); } }),
     ch("Sovereignty yes, but stay neutral and unarmed", { prestige: 6, rel: { usa: -10, russia: 10 } }, "", { run: () => { changeGovType("parliamentary"); } })]));
hscene("warsaw", () => S("⭐", `${D()} · Warsaw`, "A Warsaw Pact",
    "West Germany has joined NATO. Your advisers propose a formal military alliance of the socialist states.",
    [ch("Found the Warsaw Pact", { tension: 3, prestige: 3 }, "", { run: () => ["russia", "eastgermany", "poland"].forEach(k => joinBloc("warsaw", k)) }),
     ch("No need", {}, "")]));
hscene("montgomery", () => S("🚌", `${D()} · Montgomery, Alabama`, "The bus boycott",
    "Rosa Parks has been arrested for refusing to give up her seat. A young minister, Martin Luther King Jr., is leading a boycott.",
    [ch("Speak up for the boycotters", { prestige: 4, p: { press: 5 }, fac: { "dem:1": -8 }, region: { 1: -5 } }, ""),
     ch("Call it a local matter", { prestige: -2 }, "")]));
hscene("secret_speech", () => S("📜", `${D()} · 20th Party Congress`, "The secret speech",
    "You could denounce Stalin's crimes (the purges, the cult of personality) before the Party congress. It would free the country, and shake the bloc.",
    [ch("Denounce Stalin", { liberty: 10, legitimacy: 5, p: { people: 6, politburo: -8 }, fac: { "cpsu:0": -25 }, rel: { china: -10 } }, "Prisoners stream home from the camps.", { run: () => { G.flags.destalinization = true; if (G.pol.security === "terror") G.pol.security = "political"; } }),
     ch("Keep the cult", { fac: { "cpsu:0": 8 } }, "")]));
hscene("suez_ally", () => S("🇪🇬", `${D()} · Sèvres`, "Operation Musketeer",
    "Nasser has nationalized the Suez Canal. Britain, France and Israel have secretly agreed a plan: Israel invades Sinai, then Anglo-French forces 'separate the combatants' and seize the canal.",
    [ch("Go ahead", { tension: 8 }, "", { run: () => { startWar({ name: "Suez Crisis", a: ["israel", "uk", "france"].filter(k => alive(k) || k === G.ck), b: ["egypt"], type: "limited", front: 30, onEnd: "suez" }); G.flags.suez_end = G.t + 8; return "Paratroopers drop on Port Said. Washington is furious."; } }),
     ch("Refuse", { rel: { egypt: 5 } }, "")]));
hscene("suez_usa", () => S("🇪🇬", `${D()} · Washington`, "Your allies have attacked Egypt",
    "Britain, France and Israel have invaded Egypt without telling you. The Soviets threaten rockets. Sterling is collapsing.",
    [ch("Force them to withdraw", { prestige: 6, rel: { egypt: 20, uk: -15, france: -15, israel: -15 } }, "", { run: () => { G.flags.suez_end = G.t + 2; } }),
     ch("Back your allies", { tension: 10, rel: { egypt: -30, uk: 10, france: 10 } }, "", { run: () => { G.flags.suez_end = G.t + 30; } })]));
hscene("suez_russia", () => S("🚀", `${D()} · The Kremlin`, "Suez",
    "Britain and France are attacking Egypt. You could threaten them with rockets.",
    [ch("Threaten London and Paris", { tension: 10, prestige: 6, rel: { egypt: 25 } }, ""),
     ch("Stay quiet", {}, "")]));
hscene("hungary", () => S("🇭🇺", `${D()} · Budapest`, "The Hungarian Revolution",
    "Hungarians have overthrown their Stalinist government. Imre Nagy announces Hungary will leave the Warsaw Pact.",
    [ch("Crush it", { tension: 6, prestige: -6, p: { politburo: 6, military: 4 } }, "Soviet tanks retake Budapest."),
     ch("Let Hungary go neutral", { p: { politburo: -20, military: -10 }, prestige: 4 }, "The bloc trembles.")]));
hscene("eec_outside", () => S("🇪🇺", `${D()} · Brussels`, "The Common Market",
    "The European Community is booming. Your business leaders want to join.",
    [ch("Apply for membership", { capital: -5 }, "", { run: () => { if (G.year < 1969 && G.nations.france.gov === "semi_presidential" && G.ck === "uk" && chance(0.7)) return "De Gaulle says 'Non'."; joinBloc("ecsc", G.ck); applyEffects({ growth: 0.4 }); return "You are in."; } }),
     ch("Stay out", {}, "")]));
hscene("sputnik_usa", () => S("🛰️", `${D()} · A beep from space`, "Sputnik",
    "The Soviets have put a satellite in orbit. Americans are in shock: if they can launch a satellite, they can launch a warhead.",
    [ch("Crash program: NASA, science, education", { cost: 0.5, p: { people: 4 } }, "", { run: () => { G.pol.space = "satellites"; setLaw("national_labs", 1, "Emergency program"); setLaw("universities", Math.max(0.8, lawLevel("universities")), "Emergency program"); } }),
     ch("Downplay it", { prestige: -6 }, "")]));
hscene("little_rock", () => S("🏫", `${D()} · Little Rock, Arkansas`, "Little Rock Central High",
    "Arkansas' governor has used the National Guard to stop nine Black students entering a desegregated school.",
    [ch("Send the 101st Airborne", { prestige: 6, fac: { "dem:1": -10 }, region: { 1: -8 } }, "", { run: () => { G.flags.little_rock = true; } }),
     ch("Let the governor have his way", { prestige: -8, liberty: -3 }, "", { run: () => { G.flags.little_rock = true; } })]));

// ── 1958–1962 ──
hscene("glf", () => S("🔥", `${D()} · Beijing`, "The Great Leap Forward",
    "Overtake Britain in 15 years! Backyard furnaces, giant communes, impossible grain targets. The cadres are enthusiastic; some planners are terrified.",
    [ch("Launch the Great Leap", { growth: 3, p: { cadres: 10, peasants: -10 } }, "", { run: () => { G.pol.economy = "collectivized"; G.pol.land = "collective"; G.flags.glf = true; } }),
     ch("Stick with careful Soviet-style planning", { p: { cadres: -6 }, fac: { "ccp:0": -10, "ccp:1": 10 } }, "")]));
hscene("famine", () => S("💀", `${D()} · The countryside`, "Famine",
    "Grain reports were exaggerated and the state took too much. Peasants are starving by the millions.",
    [ch("Admit the disaster and retreat", { p: { politburo: -8, peasants: 15 }, legitimacy: -6 }, "", { run: () => { G.pol.economy = "planned"; G.econ.pop *= 0.98; } }),
     ch("Blame saboteurs and press on", { p: { peasants: -25, people: -15 }, stability: -15, growth: -6 }, "", { run: () => { G.econ.pop *= 0.95; G.s.health = clamp(G.s.health - 10); } })]));
hscene("algiers58", () => S("🪂", `${D()} · Algiers`, "The generals revolt",
    "Generals in Algiers have seized power there and threaten to drop paratroopers on Paris unless de Gaulle returns.",
    [ch("Hand power to de Gaulle", {}, "", { run: () => fallFromPower("retired", "You stepped aside for General de Gaulle and a new constitution.", true) }),
     ch("Write a strong presidency yourself", {}, "", { run: () => { if (G.s.legitimacy > 40 || chance(0.4)) { changeGovType("semi_presidential"); G.leader.title = "President"; G.gov.termYears = 7; G.gov.nextElection = [G.year + 7, G.month]; G.gov.legEvery = 5; G.gov.legNext = [G.year + 5, G.month]; return "The Fifth Republic is yours."; } fallFromPower("coup", "The paratroopers landed. The Fourth Republic is dead."); return ""; } }),
     ch("Defy the generals", { p: { military: -20 } }, "", { run: () => { G.flags.coup_pressure = (G.flags.coup_pressure || 0) + 40; } })]));
hscene("cuba_usa", () => S("🇨🇺", `${D()} · Havana`, "Castro takes power",
    "Fidel Castro's rebels have overthrown Batista. He promises elections and land reform.",
    [ch("Recognize him and offer aid", { rel: { cuba: 30 } }, "", { run: () => { G.nations.cuba.align = -10; G.nations.cuba.diverged = true; G.nations.cuba.gov = "dominant_party"; } }),
     ch("Embargo the revolution", { rel: { cuba: -40 } }, "", { run: () => { G.nations.cuba.align = -90; } })]));
hscene("dalai_lama", () => S("🏔️", `${D()} · Tawang`, "The Dalai Lama flees to India",
    "After a failed uprising in Lhasa, the Dalai Lama has crossed into India and asks for asylum.",
    [ch("Grant asylum", { prestige: 4, rel: { china: -20, usa: 5 } }, ""),
     ch("Send him on elsewhere", { prestige: -5, rel: { china: 5 } }, "")]));
hscene("guided_dem", () => S("🇮🇩", `${D()} · Jakarta`, "Guided Democracy",
    "Parliamentary democracy has produced chaos and rebellion. You could dissolve the Constituent Assembly and restore the 1945 constitution with a strong presidency.",
    [ch("Decree Guided Democracy", { liberty: -10, p: { military: 6, party: 6, press: -10 } }, "", { run: () => { changeGovType("dominant_party"); } }),
     ch("Keep parliamentary government", { legitimacy: 3 }, "")]));
hscene("sharpeville", () => S("🩸", `${D()} · Sharpeville`, "Massacre at Sharpeville",
    "Police opened fire on a crowd protesting the pass laws, killing 69. The world is horrified.",
    [ch("Ban the ANC and PAC, declare emergency", { stability: 5, liberty: -10, prestige: -15, p: { party: 6, security: 8 } }, "Mandela and others go underground."),
     ch("Appoint an inquiry and relax the pass laws", { prestige: 4, p: { party: -12, people: -6 } }, "")]));
hscene("u2", () => S("✈️", `${D()} · Over Sverdlovsk`, "The U-2 incident",
    isP("usa") ? "A CIA U-2 spy plane has been shot down over the Soviet Union, and the pilot captured alive." : "Your air defenses have shot down an American U-2 spy plane, and captured the pilot alive.",
    [ch(isP("usa") ? "Admit it" : "Expose the lie at the Paris summit", { prestige: isP("usa") ? -3 : 6, tension: 5 }, ""),
     ch(isP("usa") ? "Claim it was a weather plane" : "Quietly trade the pilot", { prestige: isP("usa") ? -8 : 0, tension: isP("usa") ? 3 : -3 }, "")]));
hscene("sinosplit", () => S("💔", `${D()} · Bucharest`, "The Sino-Soviet split",
    isP("china") ? "Khrushchev calls you an adventurist and threatens to withdraw all Soviet advisers." : "Mao attacks your 'revisionism' and coexistence with the West.",
    [ch("Break openly", { prestige: 4, p: { politburo: 4 } }, "", { run: () => { G.blocs.sinosov = []; addRel("china", "russia", -40); } }),
     ch("Paper over the differences", { p: { politburo: -4 } }, "")]));
hscene("opec", () => S("🛢️", `${D()} · Baghdad`, "OPEC",
    "Oil exporters propose an organization to coordinate production and defend prices against the Western majors.",
    [ch("Join OPEC", { rel: { usa: -4 } }, "", { run: () => joinBloc("opec", G.ck) }),
     ch("Stay out", {}, "")]));
hscene("bay_pigs", () => S("🏝️", `${D()} · The CIA`, "The Bay of Pigs",
    "The CIA has trained 1,400 Cuban exiles to invade Cuba. They say the Cuban people will rise up.",
    [ch("Approve it", {}, "", { run: () => { if (chance(0.25)) { G.nations.cuba.align = 50; G.nations.cuba.leader = "Provisional government"; G.nations.cuba.diverged = true; return "Against the odds, Castro falls."; } applyEffects({ prestige: -10, p: { military: -4 } }); addRel("cuba", "usa", -20); return "The invasion is crushed in three days."; } }),
     ch("Cancel it", { p: { military: -3 } }, "")]));
hscene("sa_republic", () => S("🏳️", `${D()} · Referendum`, "A republic",
    "Afrikaner nationalists have dreamed of leaving the British Crown since the Boer War.",
    [ch("Hold the referendum and leave the Commonwealth", { p: { party: 8 }, rel: { uk: -10 } }, "", { run: () => { G.flags.republic = true; leaveBloc("commonwealth", G.ck); } }),
     ch("Not yet", { p: { party: -6 } }, "")]));
hscene("wall_russia", () => S("🧱", `${D()} · East Berlin`, "The refugee flood",
    "Three million East Germans have fled west through Berlin. Ulbricht wants to seal the border.",
    [ch("Build the wall", { tension: 6, prestige: -5 }, "", { run: () => { G.nations.eastgermany.stab += 20; } }),
     ch("Leave it open", { prestige: 3 }, "", { run: () => { G.nations.eastgermany.stab -= 25; G.nations.eastgermany.gdp *= 0.9; } })]));
hscene("wall_germany", () => S("🧱", `${D()} · Berlin`, "The Wall",
    "East Germany has sealed West Berlin behind barbed wire. Families are divided overnight.",
    [ch("Rally the West: protest and ask for American guarantees", { rel: { usa: 5 }, p: { people: 4 } }, ""),
     ch("Begin a long policy of talking to the East (Ostpolitik)", { rel: { russia: 8, eastgermany: 10 }, p: { people: -2 } }, "")]));
hscene("nam", () => S("🕊️", `${D()} · Belgrade`, "The Non-Aligned Movement",
    "Tito, Nehru, Nasser, Sukarno and Nkrumah are founding a movement of nations belonging to neither bloc.",
    [ch("Join", { prestige: 4, align: G.align > 0 ? -8 : 8 }, "", { run: () => joinBloc("nam", G.ck) }),
     ch("Decline", {}, "")]));
hscene("goa", () => S("🇮🇳", `${D()} · Goa`, "Portuguese Goa",
    "Portugal refuses to leave its colonial enclaves in India.",
    [ch("Send in the army", { prestige: 4, p: { people: 6 }, rel: { usa: -5 } }, "Goa is liberated in 36 hours."),
     ch("Keep negotiating", {}, "")]));
hscene("anadyr", () => S("🚀", `${D()} · The Kremlin`, "Operation Anadyr",
    "Castro fears an American invasion. You could secretly place nuclear missiles in Cuba, 150 km from Florida.",
    [ch("Deploy the missiles", { tension: 5 }, "", { run: () => { G.flags.missiles_in_cuba = true; } }),
     ch("Don't", {}, "")]));
hscene("missiles_usa", () => S("☢️", `${D()} · The White House`, "Missiles in Cuba",
    "U-2 photographs show Soviet nuclear missile sites under construction in Cuba. They will be operational within days. The Joint Chiefs want air strikes.",
    [ch("Naval blockade ('quarantine')", { tension: 8 }, "", { run: () => { if (chance(0.85)) { applyEffects({ prestige: 10, tension: -20 }); return "Khrushchev blinks. The missiles go home."; } if (chance(0.15)) nuclearWar("A Soviet submarine fired a nuclear torpedo at the blockade line. Escalation followed."); return "A tense standoff drags on."; } }),
     ch("Air strikes on the missile sites", { tension: 25 }, "", { run: () => { if (chance(0.3)) { nuclearWar("Soviet commanders in Cuba fired their missiles."); return ""; } applyEffects({ prestige: 4, rel: { russia: -30 } }); return "The sites are destroyed. Moscow, incredibly, backs down."; } }),
     ch("Secret deal: our missiles in Turkey for theirs", { prestige: 2, tension: -18, rel: { turkey: -5 } }, "The crisis ends quietly.")]));
hscene("missiles_russia", () => S("☢️", `${D()} · The Kremlin`, "The Americans have found the missiles",
    "Kennedy has announced a naval blockade of Cuba. Your ships are approaching the line. The world holds its breath.",
    [ch("Withdraw the missiles for a no-invasion pledge", { prestige: -6, tension: -18, p: { politburo: -10, military: -8 } }, "The world exhales. Your colleagues remember."),
     ch("Secret deal: Jupiter missiles out of Turkey too", { tension: -15, p: { politburo: -4 } }, ""),
     ch("Run the blockade", { tension: 25 }, "", { run: () => { if (chance(0.35)) { nuclearWar("Shots at the blockade line escalated to nuclear war."); return ""; } applyEffects({ prestige: 8 }); return "The Americans let the ships through. Unbelievably, you win."; } })]));
hscene("sino_indian_india", () => S("🏔️", `${D()} · The Himalayas`, "China attacks",
    "Chinese troops are pouring across the McMahon Line and through Aksai Chin. Your army is unprepared.",
    [ch("Ask the Americans for help", { align: 10, rel: { usa: 15 }, prestige: -4 }, "", { run: () => { const w = warNamed("Sino-Indian War"); if (w && ai("usa")) { w.b.push("usa"); w.commit.usa = 1; } } }),
     ch("Fight alone", { p: { people: 4 } }, "")]));
hscene("ptbt", () => S("☢️", `${D()} · Moscow`, "The Partial Test Ban Treaty",
    "The US, USSR and UK propose banning nuclear tests in the atmosphere, underwater and in space.",
    [ch("Sign", { tension: -8, prestige: 3 }, ""),
     ch("Refuse", { prestige: 1, tension: 2 }, "")]));
hscene("malaysia", () => S("🇲🇾", `${D()} · Kuala Lumpur`, "Merger with Malaysia",
    "Britain will grant independence through merger with Malaya, Sabah and Sarawak in a new Federation of Malaysia.",
    [ch("Join Malaysia", {}, "", { run: () => { G.flags.malaysia = true; G.colony.progress = 100; G.flags.final_conf = true; queueScene("independence_conference", {}); } }),
     ch("Hold out for separate independence", { colony: { progress: -10 } }, "")]));
hscene("konfrontasi", () => S("⚔️", `${D()} · Jakarta`, "Konfrontasi",
    "Britain is creating Malaysia on your borders. Your generals and the PKI urge confrontation.",
    [ch("Crush Malaysia! Launch Konfrontasi", { prestige: 3, rel: { uk: -25, malaya: -40 }, p: { military: 4 } }, "", { run: () => { startWar({ name: "Konfrontasi", a: [G.ck], b: ["malaya", "uk"], type: "limited", front: 0 }); } }),
     ch("Accept Malaysia", { p: { military: -4 } }, "")]));
hscene("civil_rights_act", () => S("⚖️", `${D()} · The Capitol`, "The Civil Rights Act",
    "After the March on Washington, a sweeping civil rights bill is ready. Southern Democrats are filibustering.",
    [ch("Twist every arm", { capital: -15, prestige: 8, p: { press: 8 }, fac: { "dem:1": -30 }, region: { 1: -15 } }, "", { req: capOK(15), run: () => { G.pol.rights = "equal"; record("Signed the Civil Rights Act."); } }),
     ch("Not now", { prestige: -4, p: { press: -6 } }, "")]));
hscene("tonkin", () => S("🇻🇳", `${D()} · Gulf of Tonkin`, "The Gulf of Tonkin",
    "North Vietnamese patrol boats have reportedly attacked US destroyers. Congress will pass whatever you ask.",
    [ch("Full escalation: combat troops", { tension: 6, p: { military: 6 } }, "", { run: () => { joinWar("Vietnam War", "b", 2); } }),
     ch("Advisers and air power only", {}, "", { run: () => { joinWar("Vietnam War", "b", 1); } }),
     ch("Stay out of a land war in Asia", { rel: { southvietnam: -30 }, prestige: -4 }, "")]));
hscene("vietnam_ally", a => S("🇻🇳", `${D()} · Saigon`, "Washington asks for troops",
    "The US wants allied combat troops in Vietnam.",
    [ch("Send a task force", { rel: { usa: 12 }, p: { people: -4 } }, "", { run: () => { joinWar("Vietnam War", "b", 1); } }),
     ch("Decline", { rel: { usa: -8 } }, "")]));

// ── 1965–1979 ──
hscene("gibraltar", () => S("⚔️", `${D()} · Rawalpindi`, "Operation Gibraltar",
    "Your generals propose infiltrating Kashmir to spark an uprising. India is still weak after its defeat by China.",
    [ch("Launch it", { tension: 5 }, "", { run: () => { const w = startWar({ name: "Indo-Pakistani War of 1965", a: [G.ck], b: ["india"], type: "limited", front: 0, onEnd: "kashmir" }); G.flags.indopak_end = G.t + 7; return "War with India."; } }),
     ch("Too risky", { p: { military: -5 } }, "")]));
hscene("indopak_india", () => S("⚔️", `${D()} · Lahore front`, "Pakistan attacks in Kashmir",
    "Pakistani forces have crossed into Kashmir.",
    [ch("Counter-attack toward Lahore", { p: { people: 6 } }, "", { run: () => { const w = warNamed("Indo-Pakistani War of 1965"); if (w) w.mom -= 5; } }),
     ch("Hold the line and appeal to the UN", { prestige: 2 }, "")]));
hscene("g30s", () => S("🇮🇩", `${D()} · Jakarta, 1 October`, "The 30 September Movement",
    "Leftist officers have murdered six generals in a coup attempt. General Suharto blames the PKI and is moving troops. Everyone looks to you.",
    [ch("Side with the army against the PKI", { liberty: -20, legitimacy: -10, align: 30, p: { military: 15 }, rel: { usa: 20, china: -30 } }, "", { run: () => { G.flags.pki_destroyed = true; return "A massacre engulfs the country. The PKI is annihilated."; } }),
     ch("Defend the PKI", { p: { military: -30 }, align: -20 }, "", { run: () => { G.flags.coup_pressure = (G.flags.coup_pressure || 0) + 40; return "The generals are livid."; } }),
     ch("Stay above it", { p: { military: -10 } }, "", { run: () => queueScene("coup_rumors", {}) })]));
hscene("separation", () => S("😢", `${D()} · Kuala Lumpur`, "Expelled from Malaysia",
    "After bitter racial tensions, Kuala Lumpur has voted to expel Singapore from Malaysia. You are on your own: no hinterland, no water, no army.",
    [ch("Weep on television, then get to work", { p: { people: 10 }, stability: -5, prestige: 2 }, "", { run: () => { G.flags.malaysia = false; ME().name = "Republic of Singapore"; } })]));
hscene("cultural_rev", () => S("📕", `${D()} · Beijing`, "The Cultural Revolution",
    "You could unleash the Red Guards against 'capitalist roaders' in the Party, purging your rivals and renewing the revolution.",
    [ch("Bombard the headquarters!", { stability: -25, liberty: -20, growth: -3, p: { politburo: 10, people: -6, cadres: -10 } }, "", { run: () => { G.factions.forEach(f => { if (!f.name.includes("Maoist")) f.loyalty = clamp(f.loyalty + 15); }); G.dev.uni *= 0.7; return "Universities close. Your rivals are paraded in dunce caps."; } }),
     ch("No more mass campaigns", { p: { cadres: 5 } }, "")]));
hscene("france_nato", () => S("🇫🇷", `${D()} · Élysée`, "NATO's command",
    "France has the bomb now. De Gaulle's heirs argue that an independent France cannot have its army under American command.",
    [ch("Withdraw from NATO's integrated command", { prestige: 6, rel: { usa: -15 } }, "", { run: () => leaveBloc("nato", G.ck) }),
     ch("Stay", {}, "")]));
hscene("six_day", () => S("⚔️", `${D()} · Tel Aviv`, "Egypt blockades the Straits of Tiran",
    "Nasser has expelled UN peacekeepers and massed troops in Sinai. Arab armies are mobilizing.",
    [ch("Strike first", { tension: 6 }, "", { run: () => { const w = startWar({ name: "Six-Day War", a: [G.ck], b: ["egypt"], type: "limited", front: 40 }); if (w) w.mom = 15; G.flags.six_day_end = G.t + 2; return "The Egyptian air force is destroyed on the ground."; } }),
     ch("Wait for diplomacy", {}, "", { run: () => { const w = startWar({ name: "Six-Day War", a: ["egypt"], b: [G.ck], type: "limited", front: 0 }); G.flags.six_day_end = G.t + 4; return "Egypt strikes first."; } })]));
hscene("biafra", () => S("🇳🇬", `${D()} · Enugu`, "Biafra secedes",
    "After massacres of Igbo in the North, the Eastern Region has declared independence as the Republic of Biafra.",
    [ch("'To keep Nigeria one': federal war", { p: { military: 8 } }, "", { run: () => { const reb = ensureRebels(G.ck, "Republic of Biafra", 4); startWar({ name: "Nigerian Civil War", a: [reb], b: [G.ck], type: "insurgency", front: 0, onEnd: "biafra" }); G.flags.civil_war = true; } }),
     ch("Negotiate a loose confederation", { legitimacy: -5, p: { military: -10 } }, ""),
     ch("Let Biafra go", { prestige: -10 }, "", { run: () => { G.flags.biafra_free = true; G.econ.gdp *= 0.78; G.econ.services *= 0.78; G.econ.pop *= 0.78; Object.values(G.ind).forEach(i => { i.out *= 0.78; }); G.ind.oil.out *= 0.3; } })]));
hscene("tet", () => S("💥", `${D()} · Saigon`, "The Tet Offensive",
    "Communist forces have attacked cities across South Vietnam, even the US embassy. Militarily they lost, but Americans are asking why their sons are dying.",
    [ch("Send 200,000 more troops", { weariness: 15, p: { people: -8, military: 6 } }, "", { run: () => { const w = warNamed("Vietnam War"); if (w) { w.commit[G.ck] = 3; w.mom -= 5; } } }),
     ch("Vietnamization: begin withdrawal", { weariness: -10, p: { military: -6 } }, "", { run: () => { const w = warNamed("Vietnam War"); if (w) { w.commit[G.ck] = 1; w.mom += 3; } } })]));
hscene("prague", () => S("🇨🇿", `${D()} · Prague`, "The Prague Spring",
    "Czechoslovakia's Alexander Dubček promises 'socialism with a human face': free press, reforms. Hardliners demand intervention.",
    [ch("Invade", { tension: 5, prestige: -6, p: { politburo: 6 } }, ""),
     ch("Tolerate it", { p: { politburo: -15 }, prestige: 5 }, "")]));
hscene("may68", () => S("🧱", `${D()} · Paris`, "May '68",
    "Students have occupied the Sorbonne, and ten million workers are on strike. The country is paralyzed.",
    [ch("Big wage increases (Grenelle accords)", { inflation: 2, p: { labor: 10, business: -6 } }, ""),
     ch("Dissolve parliament and call an election", {}, "", { run: () => { if (G.gov.type === "parliamentary") callSnapElection(); else { G.gov.legNext = [G.year, Math.min(12, G.month + 1)]; } applyEffects({ campaign: 0 }); G.campaign.bonus += 6; } }),
     ch("Send in the riot police", { liberty: -5, p: { press: -10, people: -5 } }, "")]));
hscene("tlatelolco", () => S("🏟️", `${D()} · Mexico City`, "Students before the Olympics",
    "A student movement has filled the Zócalo. The Olympics open in ten days.",
    [ch("Negotiate with the students", { p: { press: 10, party: -6, people: 4 }, liberty: 4 }, ""),
     ch("Clear Tlatelolco square by force", { liberty: -10, legitimacy: -15, p: { press: -20, security: 6 }, prestige: -6 }, "Hundreds die. The Games go on.")]));
hscene("npt", () => S("☢️", `${D()} · The NPT`, "The Non-Proliferation Treaty",
    "The nuclear powers ask non-nuclear states to renounce nuclear weapons for good.",
    [ch("Sign and end our weapons program", { prestige: 4, tension: -3, rel: { usa: 6, russia: 6 } }, "", { run: () => { G.pol.nuclear = G.pol.nuclear === "weapons" ? "research" : G.pol.nuclear; G.mil.prog = Math.min(G.mil.prog, 20); } }),
     ch("Refuse to sign", { rel: { usa: -5 } }, "")]));
hscene("bangladesh", () => S("🇧🇩", `${D()} · Dhaka`, "East Pakistan votes",
    "The Awami League, led by Sheikh Mujibur Rahman, has won an absolute majority in the national election, all from East Pakistan. The army and West Pakistani politicians refuse to let him govern.",
    [ch("Honor the election: Mujib becomes Prime Minister", { legitimacy: 15, fac: { "ml:0": -25 }, p: { military: -20 } }, "", { run: () => { G.flags.coup_pressure = (G.flags.coup_pressure || 0) + 25; } }),
     ch("Crack down (Operation Searchlight)", { liberty: -15, prestige: -15, p: { military: 6 }, rel: { india: -40 } }, "", { run: () => { const reb = ensureRebels(G.ck, "Mukti Bahini", 3); const w = startWar({ name: "Bangladesh Liberation War", a: [reb, "india"], b: [G.ck], type: "insurgency", front: 10, onEnd: "bangladesh" }); if (w) w.mom = 4; } }),
     ch("Offer a confederation", { legitimacy: 4, p: { military: -10 } }, "")]));
hscene("bangladesh_india", () => S("🇧🇩", `${D()} · Calcutta`, "Ten million refugees",
    "Ten million refugees have fled into India from the Pakistani army's crackdown.",
    [ch("Intervene and liberate Bangladesh", { prestige: 8, rel: { pakistan: -30, usa: -10 } }, "", { run: () => { const w = warNamed("Bangladesh Liberation War"); if (w) { w.commit[G.ck] = 3; w.mom += 8; } } }),
     ch("Help the refugees only", { cost: 0.5, prestige: 2 }, "")]));
hscene("nixon_shock", () => S("💵", `${D()} · Camp David`, "The dollar and gold",
    "Foreign governments are demanding gold for their dollars faster than Fort Knox can supply it.",
    [ch("Close the gold window", { inflation: 2, growth: 0.5, prestige: -2 }, "Bretton Woods is over."),
     ch("Defend the dollar with austerity", { growth: -1.5, p: { people: -5 } }, "")]));
hscene("rapprochement", () => S("🤝", `${D()} · Beijing`, "Ping-pong diplomacy",
    isP("usa") ? "Secret contacts suggest Mao would welcome a presidential visit, to balance against Moscow." : "The Americans want to normalize relations, to balance against Moscow.",
    [ch("Open relations", { tension: -6, prestige: 5, rel: { [isP("usa") ? "china" : "usa"]: 30, russia: -10, taiwan: -20 } }, ""),
     ch("Not yet", {}, "")]));
hscene("salt", () => S("✍️", `${D()} · Moscow`, "SALT I",
    "A treaty to freeze the number of strategic missiles and limit missile defenses.",
    [ch("Sign", { tension: -10, prestige: 3, p: { military: -4 } }, ""),
     ch("Refuse", { tension: 3, p: { military: 4 } }, "")]));
hscene("yom_kippur", () => S("🚨", `${D()} · Yom Kippur`, "Surprise attack",
    "Egypt and Syria have attacked on the holiest day of the year. Egyptian troops have crossed the Suez Canal.",
    [ch("Full mobilization", { p: { people: 6 } }, "", { run: () => { const w = warNamed("Yom Kippur War"); if (w) w.mom -= 6; } }),
     ch("Ask Washington for an airlift", { rel: { usa: 10 } }, "", { run: () => { const w = warNamed("Yom Kippur War"); if (w) w.mom -= 10; } })]));
hscene("embargo", () => S("🛢️", `${D()} · Riyadh`, "The oil weapon",
    "Egypt and Syria are at war with Israel. Arab states want to embargo oil to countries supporting Israel.",
    [ch("Impose the embargo", { prestige: 10, rel: { usa: -25 }, p: { clergy: 6, people: 6 } }, "", { run: () => { G.oilPrice *= 3.5; G.flags.embargo = true; return "Oil prices quadruple overnight."; } }),
     ch("Refuse", { prestige: -8, rel: { usa: 10, egypt: -20 } }, "", { run: () => { G.flags.no_embargo = true; } })]));
hscene("wollo", () => S("🌾", `${D()} · Wollo`, "Famine",
    "Drought has brought famine to Wollo and Tigray. Tens of thousands are dying. A British documentary is about to expose it.",
    [ch("Admit it and appeal for aid", { prestige: -5, p: { people: 6 } }, ""),
     ch("Cover it up", { p: { people: -20 }, legitimacy: -15 }, "", { run: () => { G.flags.coup_pressure = (G.flags.coup_pressure || 0) + 15; } })]));
hscene("cyprus", () => S("🇨🇾", `${D()} · Ankara`, "Coup in Cyprus",
    "The Greek junta has backed a coup in Cyprus aiming at union with Greece. Turkish Cypriots fear for their lives.",
    [ch("Invade Cyprus", { prestige: 6, p: { people: 10, military: 6 }, rel: { usa: -10, uk: -8 } }, ""),
     ch("Negotiate through London", {}, "")]));
hscene("soweto", () => S("✊", `${D()} · Soweto`, "The Soweto uprising",
    "Schoolchildren protesting against Afrikaans instruction have been shot by police. Unrest is spreading.",
    [ch("Crush it", { liberty: -8, prestige: -10, p: { security: 6 }, stability: 4 }, ""),
     ch("Scrap the Afrikaans decree and open talks", { prestige: 3, p: { party: -8 } }, "")]));
hscene("camp_david", () => S("🕊️", `${D()} · Camp David`, "Peace with Egypt",
    "Egypt's Sadat offers full peace and recognition in exchange for the return of Sinai.",
    [ch("Make peace", { prestige: 10, rel: { egypt: 60, usa: 10 }, p: { people: 4 } }, "", { run: () => { G.flags.israel_egypt_peace = true; record("Signed peace with Egypt."); } }),
     ch("Keep Sinai", { rel: { egypt: -10 } }, "")]));
hscene("deng", () => S("🇨🇳", `${D()} · Third Plenum`, "Reform and opening",
    "Colleagues argue that it doesn't matter whether a cat is black or white, as long as it catches mice. Decollectivize farms, open special economic zones, welcome foreign capital.",
    [ch("Reform and open up", { growth: 3, p: { peasants: 15, cadres: -6 }, fac: { "ccp:0": -15 } }, "", { run: () => { G.pol.economy = "mixed"; G.pol.land = "reform"; G.pol.trade = "managed"; record("Launched reform and opening up."); } }),
     ch("Stay the course", {}, "")]));
hscene("afghan_russia", () => S("🇦🇫", `${D()} · Kabul`, "Afghanistan",
    "The communist government in Kabul is collapsing in infighting and facing an Islamist revolt. It begs for Soviet troops.",
    [ch("Invade", { tension: 10, rel: { usa: -25, pakistan: -20 } }, "", { run: () => { const reb = ensureRebels("afghanistan", "Mujahideen", 4); G.nations[reb].area = "Asia"; startWar({ name: "Soviet–Afghan War", a: [reb], b: [G.ck], type: "insurgency", front: -10, commit: { [G.ck]: 2 } }); return "The 40th Army crosses the Amu Darya."; } }),
     ch("Let them fend for themselves", { p: { military: -5 } }, "")]));
hscene("mujahideen", () => S("🇦🇫", `${D()} · Peshawar`, "The mujahideen",
    "The Soviet Union has invaded Afghanistan. Afghan resistance fighters want weapons.",
    [ch("Arm them", { rel: { usa: 10, russia: -15 }, scandal: 2 }, ""),
     ch("Stay out", {}, "")]));

// ── 1980s–1990 ──
hscene("falklands_arg", () => S("🇦🇷", `${D()} · Casa Rosada`, "Las Malvinas",
    "The junta is unpopular, inflation is out of control, and the British seem to have lost interest in the Falklands.",
    [ch("Invade the Malvinas", { p: { people: 20, military: 8 } }, "", { run: () => { const w = startWar({ name: "Falklands War", a: [G.ck], b: ["uk"], type: "limited", front: 40, onEnd: "falklands" }); if (w) w.mom = -8; return "The islands fall in a day. London sends a task force."; } }),
     ch("Don't", {}, "")]));
hscene("falklands_uk", a => S("🇬🇧", `${D()} · Downing Street`, "Argentina invades the Falklands",
    "Argentine forces have seized the Falkland Islands, 12,000 km away.",
    [ch("Send a task force", { p: { people: 10, military: 8 } }, "", { run: () => { const w = G.wars.find(x => x.id === a.id); if (w) { w.commit[G.ck] = 3; w.mom -= 10; } } }),
     ch("Negotiate", { prestige: -12, p: { people: -10 } }, "", { run: () => { const w = G.wars.find(x => x.id === a.id); if (w) endWar(w, "a"); } })]));
hscene("able_archer", () => S("☢️", `${D()} · War scare`, "Able Archer 83",
    isP("usa") ? "Intelligence suggests the Soviets think our NATO exercise is cover for a real first strike. Their forces are on alert." : "Your intelligence says the NATO exercise could be cover for a real nuclear first strike.",
    [ch(isP("usa") ? "Tone it down and reassure Moscow" : "Stand down", { tension: -10 }, ""),
     ch(isP("usa") ? "Carry on" : "Prepare a launch-on-warning posture", { tension: 10 }, "", { run: () => { if (G.tension >= 100 && chance(0.2)) nuclearWar("A false warning was taken for real."); } })]));
hscene("perestroika", () => S("🇷🇺", `${D()} · Plenum`, "Perestroika",
    "The economy is stagnating, the war in Afghanistan is lost, and the oil money is drying up. Reformers propose openness (glasnost) and restructuring (perestroika).",
    [ch("Reform", { liberty: 20, legitimacy: 6, stability: -10, tension: -12, p: { politburo: -12, people: 8, security: -10 } }, "", { run: () => { G.pol.press = "restricted"; G.pol.security = "police"; G.flags.perestroika = true; } }),
     ch("Stagnation is stability", { growth: -1 }, "")]));
hscene("chernobyl", () => S("☢️", `${D()} · Chernobyl`, "Reactor No. 4",
    "A reactor has exploded at Chernobyl in Ukraine. Radiation is spreading across Europe.",
    [ch("Tell the truth", { prestige: 4, p: { politburo: -6, people: 4 }, liberty: 4 }, ""),
     ch("Cover it up", { prestige: -8, scandal: 15 }, "")]));
hscene("june_struggle", () => S("✊", `${D()} · Seoul`, "The June Democratic Struggle",
    "Millions of students and office workers are demonstrating for direct presidential elections. The Olympics are next year.",
    [ch("Concede direct elections", {}, "", { run: () => { attemptReform("democratize", "decree"); } }),
     ch("Crack down", { liberty: -10, prestige: -8, p: { people: -15 } }, "")]));
hscene("tiananmen", () => S("🇨🇳", `${D()} · Tiananmen Square`, "The students in the square",
    "A million people have filled Tiananmen Square demanding democracy and an end to corruption. Some Politburo members want dialogue; others want martial law.",
    [ch("Martial law: clear the square", { stability: 8, liberty: -10, prestige: -15, rel: { usa: -20 }, p: { politburo: 8, people: -10 } }, ""),
     ch("Open dialogue with the students", { liberty: 15, p: { politburo: -25, people: 10 }, prestige: 6 }, "", { run: () => { G.flags.purge_warned = true; } })]));
hscene("reunification", () => S("🧱", `${D()} · Berlin`, "The Wall is open",
    "East Germans are dancing on the Berlin Wall. The GDR is collapsing. Reunification is suddenly possible.",
    [ch("Push for rapid reunification", { prestige: 15, p: { people: 10 }, cost: 3 }, "", { run: () => { G.flags.reunified = true; G.econ.gdp += G.nations.eastgermany.gdp * 0.6; G.econ.services += G.nations.eastgermany.gdp * 0.6; G.econ.pop += 16; G.nations.eastgermany.status = "annexed"; ME().name = "Germany"; record("Reunified Germany, 1990."); return "Germany is one."; } }),
     ch("Go slowly: a confederation first", { prestige: 4 }, "")]));
hscene("wall_falls_russia", () => S("🧱", `${D()} · Berlin`, "The Wall has fallen",
    "East Berliners have breached the Wall. The GDR's leaders ask for Soviet troops.",
    [ch("Let it happen", { prestige: 8, tension: -10, p: { military: -10, politburo: -8 } }, "", { run: () => { G.nations.eastgermany.status = "annexed"; G.nations.germany.gdp += G.nations.eastgermany.gdp; } }),
     ch("Send in the tanks", { tension: 25, prestige: -15 }, "")]));
hscene("mandela", () => S("✊", `${D()} · Victor Verster Prison`, "Release Mandela?",
    "Sanctions are crippling the economy, the townships are in revolt, and Nelson Mandela has been in prison for 27 years.",
    [ch("Release Mandela and negotiate a new constitution", { prestige: 15, p: { party: -10 } }, "", { run: () => { G.pol.rights = "equal"; G.flags.apartheid_ended = true; record("Released Nelson Mandela and ended apartheid."); } }),
     ch("Hold on", { prestige: -10, growth: -1, stability: -8 }, "")]));
hscene("gulf", () => S("⚔️", `${D()} · Kuwait`, "Iraq invades Kuwait",
    "Saddam Hussein has annexed Kuwait. A US-led coalition is forming under UN authority.",
    [ch("Join the coalition", { rel: { usa: 10, iraq: -30 } }, "", { run: () => { let w = warNamed("Gulf War"); if (!w) { w = startWar({ name: "Gulf War", a: ["usa", "uk", "france", "saudi"].filter(alive), b: ["iraq"], type: "limited", front: 20 }); } if (w) { if (!w.a.includes(G.ck)) w.a.push(G.ck); w.commit[G.ck] = 2; w.mom = 15; } } }),
     ch("Stay out", { rel: { usa: -6 } }, "", { run: () => { if (!warNamed("Gulf War")) { const w = startWar({ name: "Gulf War", a: ["usa", "uk", "france", "saudi"].filter(k => alive(k) && k !== G.ck), b: ["iraq"], type: "limited", front: 20 }); if (w) w.mom = 15; } } })]));
