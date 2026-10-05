// ── DATA — government types, power bases, ideologies, policies, blocs ──
//
// The country you pick sets the starting situation. The *government type*
// sets the rules: who you answer to, how laws get made, and how you can
// lose power. Two countries with the same system play alike; the same
// country under a different system (after a coup, a revolution or your own
// constitutional reform) plays very differently.

const START_YEAR = 1950;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// ── Power bases ("pillars") ─────────────────────────────────────────
// Each government type leans on a different mix. Loyalty drifts toward a
// target set by conditions, policies and your ideology; events shock it.
// `needs` weights refer to STAT_SCORE in engine.js.

const PILLARS = {
    people:     { name: "The Public", icon: "👥", desc: "Ordinary citizens. In a democracy they vote you out; anywhere else they fill the streets.",
                  needs: { growth: 2, unemp: 1.5, inflation: 1.5, stability: 1, liberty: 0.6, prestige: 1, weariness: 1.5, scandal: 1, corruption: 0.5, health: 0.8, poverty: 0.8, crime: 0.8 } },
    party:      { name: "Your Party", icon: "🎗️", desc: "Your own legislators and party machine. When they turn, leadership challenges follow.",
                  needs: { approval: 2, scandal: 1.5, legitimacy: 0.5, stability: 0.5 } },
    coalition:  { name: "Coalition Partners", icon: "🤝", desc: "The junior party keeping you in office. They can walk out and take your majority with them.",
                  needs: { approval: 1, scandal: 1, stability: 0.5 } },
    military:   { name: "Armed Forces", icon: "🎖️", desc: "The generals. They like budgets, readiness and victories, and they own the guns.",
                  needs: { milspend: 2, readiness: 1.5, prestige: 1, stability: 1 } },
    business:   { name: "Business & Finance", icon: "🏦", desc: "Industrialists, bankers and merchants. They want growth, low taxes and order.",
                  needs: { growth: 2, inflation: 1, stability: 1.5 } },
    labor:      { name: "Labor & Workers", icon: "⚒️", desc: "Unions and industrial workers. Jobs, wages and the right to organize.",
                  needs: { unemp: 2, inflation: 1, liberty: 0.5, poverty: 1 } },
    press:      { name: "Press & Intellectuals", icon: "📰", desc: "Newspapers, universities and students. They value freedom and punish scandal.",
                  needs: { liberty: 2.5, scandal: 0.7, corruption: 1 } },
    clergy:     { name: "Religious Establishment", icon: "🕌", desc: "The clergy. Custodians of tradition and of your legitimacy in the eyes of the faithful.",
                  needs: { stability: 1, legitimacy: 0.5 } },
    royals:     { name: "Royal Family", icon: "👑", desc: "Princes, cousins and courtiers. They expect their share, and a family council can depose a king.",
                  needs: { graft: 1, stability: 1, legitimacy: 1 } },
    tribes:     { name: "Regional Elites", icon: "🏜️", desc: "Chiefs, sheikhs, landlords and provincial bosses who deliver their regions.",
                  needs: { graft: 0.8, stability: 1 } },
    politburo:  { name: "Politburo", icon: "☭", desc: "The handful of men at the top of the Party. They chose you and they can unmake you.",
                  needs: { growth: 1, stability: 1.5, prestige: 1, legitimacy: 0.5 } },
    security:   { name: "Security Services", icon: "🕵️", desc: "The secret police. Indispensable, and dangerous to whoever holds their leash.",
                  needs: { repression: 2, stability: 1 } },
    cadres:     { name: "Party Cadres", icon: "📕", desc: "Millions of rank-and-file members who carry out (or quietly sabotage) your line.",
                  needs: { growth: 0.5, prestige: 0.5, stability: 0.5 } },
    peasants:   { name: "Peasants & Farmers", icon: "🌾", desc: "Most of the population in 1950. Land, prices and being left alone.",
                  needs: { inflation: 1, stability: 1 } },
    occupation: { name: "Occupation Authority", icon: "🪖", desc: "The foreign power that still holds final authority over your government.",
                  needs: { stability: 2, liberty: 1, growth: 1 } },
    colonial:   { name: "Colonial Office", icon: "🏛️", desc: "The colonial administration. It controls the police, the budget and the timetable for independence.",
                  needs: { stability: 2 } },
    foreign:    { name: "Foreign Patron", icon: "🌐", desc: "The outside power whose money and goodwill keep you afloat.",
                  needs: { stability: 1 } }
};

// ── Government types ────────────────────────────────────────────────

const GOV_TYPES = {
    presidential: {
        name: "Presidential republic", short: "Presidential", icon: "🦅",
        desc: "You are elected separately from the legislature for a fixed term. You cannot be removed by a simple vote, but laws must pass a legislature you do not control.",
        pillars: { people: 3, party: 2, military: 1.5, business: 1.5, labor: 1, press: 1 },
        democracy: true, lawmaking: "bill", execOrders: true,
        fall: ["Lose an election", "Impeachment and removal", "Military coup", "Term limits"],
        capitalBonus: 0
    },
    parliamentary: {
        name: "Parliamentary system", short: "Parliamentary", icon: "🏛️",
        desc: "You govern only while you command a majority in parliament. You can call elections when you like, but you can be voted out between them.",
        pillars: { people: 3, party: 2.5, coalition: 1.5, business: 1, labor: 1, press: 1 },
        democracy: true, lawmaking: "bill", canCallElection: true,
        fall: ["Lose an election", "Vote of no confidence", "Party leadership challenge", "Coalition collapse", "Military coup"],
        capitalBonus: 0
    },
    semi_presidential: {
        name: "Semi-presidential system", short: "Semi-presidential", icon: "⚜️",
        desc: "A strong president alongside a prime minister who answers to the assembly. Lose the assembly and you face cohabitation with your rivals running the government.",
        pillars: { people: 3, party: 2, military: 1.2, business: 1, labor: 1, press: 1 },
        democracy: true, lawmaking: "bill", execOrders: true,
        fall: ["Lose an election", "Cohabitation (lose domestic power)", "Impeachment", "Military coup"],
        capitalBonus: 2
    },
    monarchy: {
        name: "Monarchy", short: "Monarchy", icon: "👑",
        desc: "You rule by birth and by the consent of the family, the clergy and the tribes. You decree law, but a palace coup, an army plot or a revolution can end a dynasty.",
        pillars: { royals: 2.5, clergy: 2, tribes: 2, military: 2, people: 1.5, business: 1 },
        democracy: false, lawmaking: "decree",
        fall: ["Palace coup by the royal family", "Military coup", "Revolution", "Assassination"],
        capitalBonus: 4
    },
    one_party: {
        name: "One-party state", short: "One-party", icon: "☭",
        desc: "The Party is the state. You decree, plan and purge, but the Politburo that elevated you can remove you at a single meeting.",
        pillars: { politburo: 3, military: 2, security: 2, cadres: 1.5, people: 1.5, peasants: 1 },
        democracy: false, lawmaking: "decree",
        fall: ["Purged by the Politburo", "Military coup", "Popular uprising"],
        capitalBonus: 5
    },
    dominant_party: {
        name: "Dominant-party state", short: "Dominant party", icon: "🎗️",
        desc: "Elections happen and your party always wins them. The real politics happens inside the party machine, which picks leaders and can drop them.",
        pillars: { party: 3, people: 2, business: 1.5, labor: 1.5, military: 1, peasants: 1 },
        democracy: false, lawmaking: "rubberstamp",
        fall: ["Revolt of the party bosses", "Mass protests", "End of your term (the party picks your successor)"],
        capitalBonus: 3
    },
    military_junta: {
        name: "Military government", short: "Junta", icon: "🎖️",
        desc: "You rule because the officers let you. You decree what you like, but the men who put you in power can take it away.",
        pillars: { military: 4, business: 2, foreign: 1.5, people: 1.5, clergy: 1 },
        democracy: false, lawmaking: "decree",
        fall: ["Counter-coup by rival officers", "Popular uprising", "Abandonment by your foreign patron"],
        capitalBonus: 4
    },
    directorial: {
        name: "Collegial executive", short: "Directorial", icon: "🏔️",
        desc: "Power is shared by a council. You cannot be voted out mid-term, but nothing happens without consensus, and the voters can overturn any law by referendum.",
        pillars: { party: 3, people: 3, tribes: 2, business: 1.5, labor: 1 },
        democracy: true, lawmaking: "bill", referendums: true,
        fall: ["Not re-elected by the Federal Assembly", "Repeated referendum defeats"],
        capitalBonus: -1
    },
    occupied: {
        name: "Parliament under occupation", short: "Occupied", icon: "🪖",
        desc: "You lead an elected government, but a foreign occupation authority still has the final word. Win back sovereignty first.",
        pillars: { occupation: 3, people: 2.5, party: 2, business: 1.5, labor: 1 },
        democracy: true, lawmaking: "bill", canCallElection: true,
        fall: ["Lose an election", "Vote of no confidence", "Removed by the occupation authority"],
        capitalBonus: 0
    },
    colony: {
        name: "Colony: the independence path", short: "Colony", icon: "⛓️",
        desc: "You lead a nationalist movement, not a state. The colonial power controls the budget and the police. Build a movement, win concessions and negotiate (or fight) your way to independence. Then write the constitution yourself.",
        pillars: { people: 3, colonial: 2.5, tribes: 2, labor: 1.5, foreign: 1 },
        democracy: false, lawmaking: "none",
        fall: ["Arrest and exile", "Losing control of the movement"],
        capitalBonus: 2
    }
};

// ── Ideologies ──────────────────────────────────────────────────────
// `likes`/`hates` are policy option keys. Acting on your ideology keeps
// your party (or Politburo) behind you; betraying it costs you.

const IDEOLOGIES = {
    communist:      { desc: "Marxist-Leninist. The Party owns the economy and runs the state on behalf of the working class. Private business, landlords and religion are enemies; rivals are purged.", name: "Communist", icon: "☭", motto: "From each according to his ability, to each according to his needs.",
                      likes: ["planned", "collectivized", "confiscatory", "high", "national", "mass", "collective", "state_unions", "autarky", "state", "secular", "nationalized"],
                      hates: ["market", "low", "private", "landlords", "free", "restrict", "concessions", "theocratic"],
                      p: { labor: 8, business: -20, clergy: -15, politburo: 5, cadres: 5, royals: -20 } },
    socialist:      { desc: "Democratic socialist. Wants the state to own key industries and plan the economy, but through elections and parliaments rather than revolution.", name: "Democratic Socialist", icon: "🌹", motto: "Planning for the many, freedom for all.",
                      likes: ["planned", "mixed", "high", "welfare", "national", "mass", "reform", "bargaining", "nationalized", "equal"],
                      hates: ["market", "low", "minimal", "private", "landlords", "restrict", "terror"],
                      p: { labor: 10, business: -12, peasants: 4 } },
    socdem:         { desc: "Social democrat. Keeps a market economy but taxes it to pay for a welfare state, public health care and strong unions. The dominant centre-left of postwar Europe.", name: "Social Democrat", icon: "🕊️", motto: "A fair share of a growing pie.",
                      likes: ["mixed", "moderate", "high", "welfare", "safety", "national", "subsidized", "expanded", "mass", "bargaining", "free", "equal"],
                      hates: ["collectivized", "minimal", "restrict", "terror", "state", "segregation"],
                      p: { labor: 7, business: -4, press: 3 } },
    liberal:        { desc: "Classical or market liberal. Free trade, low taxes, individual rights, a free press and limited government. (In the US, 'liberal' later came to mean centre-left.)", name: "Liberal", icon: "🗽", motto: "Free markets, free people.",
                      likes: ["market", "low", "moderate", "free", "trade_free", "secular", "equal", "police"],
                      hates: ["planned", "collectivized", "confiscatory", "state", "terror", "political", "autarky", "theocratic"],
                      p: { business: 6, press: 6, clergy: -3 } },
    conservative:   { desc: "Conservative or Christian democrat. Private enterprise, tradition, religion, strong defence and gradual change. The main centre-right of the postwar West.", name: "Conservative", icon: "🏛️", motto: "Order, enterprise and the wisdom of tradition.",
                      likes: ["market", "mixed", "low", "moderate", "safety", "established", "tolerant", "high_mil", "concessions"],
                      hates: ["planned", "collectivized", "confiscatory", "collective", "secular"],
                      p: { business: 8, military: 4, clergy: 4, labor: -6 } },
    nationalist:    { desc: "Nationalist or populist. National independence and pride come first: state-led development, control of natural resources, and suspicion of foreign powers.", name: "Nationalist", icon: "🏴", motto: "The nation first, and the nation free.",
                      likes: ["mixed", "planned", "protection", "nationalized", "high_mil", "conscription", "grand", "reform"],
                      hates: ["concessions", "trade_free", "minimal_mil"],
                      p: { military: 6, people: 3, foreign: -8 } },
    traditionalist: { desc: "Traditionalist or monarchist. Legitimacy comes from God, the dynasty and custom. Resists secular reform, mass politics and outside influence.", name: "Traditionalist", icon: "📿", motto: "God, crown and custom.",
                      likes: ["established", "theocratic", "landlords", "restricted", "low", "volunteer"],
                      hates: ["secular", "collectivized", "free", "equal", "reform"],
                      p: { clergy: 10, royals: 8, tribes: 6, press: -8 } },
    militarist:     { desc: "Militarist. The armed forces are the backbone of the nation. Order, discipline and security matter more than elections or civil liberties.", name: "Militarist", icon: "⚔️", motto: "Discipline, strength, order.",
                      likes: ["high_mil", "total", "conscription", "political", "restricted", "protection", "restrict"],
                      hates: ["minimal_mil", "free", "bargaining"],
                      p: { military: 12, press: -10, labor: -5 } }
};

// ── Policies ────────────────────────────────────────────────────────
// fx are steady-state pulls on national stats; p are pillar modifiers.
// spend = % of GDP; rev = tax revenue as % of GDP (scaled by tax capacity).
// req(gov, G) gates options. eo = can be changed by executive order.

const POLICY_AREAS = [
    { key: "economy", name: "Economic system", icon: "🏭", cost: 14, options: [
        { k: "market", name: "Free market", desc: "Private enterprise, light regulation.", fx: { growth: 0.7, unemp: 1, inflation: -0.3 }, p: { business: 15, labor: -8, politburo: -30, cadres: -30 } },
        { k: "mixed", name: "Mixed economy", desc: "Private industry with state-owned utilities and planning boards.", fx: { growth: 0.3, stability: 3 }, p: { labor: 5 } },
        { k: "planned", name: "Five-Year Plans", desc: "State ownership of heavy industry and central planning targets.", fx: { growth: 0.5, unemp: -2, inflation: -0.5, liberty: -5, corruption: 5 }, p: { business: -25, labor: 6, politburo: 10, cadres: 10, military: 3 } },
        { k: "collectivized", name: "Total collectivization", desc: "Everything belongs to the state. Spectacular targets, and the risk of catastrophe.", fx: { growth: 0.2, unemp: -3, stability: -8, liberty: -15 }, p: { peasants: -30, politburo: 15, cadres: 15, business: -40 },
          req: g => ["one_party"].includes(g) }
    ]},
    { key: "land", name: "Land & agriculture", icon: "🌾", cost: 12, options: [
        { k: "landlords", name: "Leave the landlords", fx: { stability: -2 }, p: { peasants: -12, tribes: 8, business: 3, royals: 4, clergy: 3 } },
        { k: "reform", name: "Land reform", desc: "Break up the great estates and give land to the tiller.", fx: { growth: 0.2, stability: 2 }, p: { peasants: 15, tribes: -12, business: -5, royals: -8, people: 3 } },
        { k: "collective", name: "Collective farms", fx: { growth: -0.3, stability: -5, liberty: -5 }, p: { peasants: -25, politburo: 10, cadres: 8 }, req: g => ["one_party", "military_junta"].includes(g) },
        { k: "mechanize", name: "Agricultural modernization", desc: "Tractors, fertilizer and new seed varieties.", spend: 1.5, fx: { growth: 0.3, unemp: 0.5 }, p: { peasants: 5, business: 3 } }
    ]},
    { key: "trade", name: "Trade", icon: "🚢", cost: 10, eo: true, options: [
        { k: "protection", name: "Protection & import substitution", fx: { growth: 0.1, unemp: -0.5, inflation: 0.5 }, p: { business: 4, labor: 3 } },
        { k: "managed", name: "Managed trade", fx: {}, p: {} },
        { k: "trade_free", name: "Free trade", fx: { growth: 0.5, unemp: 0.5 }, p: { labor: -6, business: 6, peasants: -3 } },
        { k: "autarky", name: "Autarky", fx: { growth: -0.5, stability: 1 }, p: { politburo: 5, business: -10 }, req: g => ["one_party", "military_junta"].includes(g) }
    ]},
    { key: "labor", name: "Labor relations", icon: "⚒️", cost: 10, options: [
        { k: "restrict", name: "Restrict unions", fx: { growth: 0.2, liberty: -5, stability: -1 }, p: { business: 10, labor: -18 } },
        { k: "bargaining", name: "Collective bargaining", fx: { stability: 1 }, p: { labor: 8, business: -5 } },
        { k: "state_unions", name: "State-run unions", fx: { liberty: -5, stability: 2 }, p: { labor: 2, cadres: 5 }, req: g => ["one_party", "dominant_party", "military_junta", "monarchy"].includes(g) }
    ]},
    { key: "military", name: "Defense spending", icon: "🎖️", cost: 12, options: [
        { k: "minimal_mil", name: "Minimal", spend: 1.5, ready: 30, mult: 0.6, fx: { growth: 0.2 }, p: { military: -15 } },
        { k: "moderate_mil", name: "Moderate", spend: 4, ready: 50, mult: 1, fx: {}, p: {} },
        { k: "high_mil", name: "High", spend: 8, ready: 70, mult: 1.4, fx: { growth: -0.3 }, p: { military: 12, business: 2 } },
        { k: "total", name: "Total mobilization", spend: 15, ready: 90, mult: 2, fx: { growth: -1, inflation: 2 }, p: { military: 18, people: -6, labor: -3 } }
    ]},
    { key: "draft", name: "Conscription", icon: "🪖", cost: 8, options: [
        { k: "volunteer", name: "Volunteer army", mult: 0.9, ready: -3, fx: {}, p: { military: -3, people: 2 } },
        { k: "conscription", name: "Conscription", mult: 1.15, ready: 5, fx: {}, p: { military: 3, people: -2 } }
    ]},
    { key: "nuclear", name: "Nuclear program", icon: "☢️", cost: 14, eo: true, options: [
        { k: "no_nukes", name: "No program", fx: {}, p: {} },
        { k: "research", name: "Atomic research", spend: 0.4, rate: 0.35, fx: { prestige: 1 }, p: { press: 1 } },
        { k: "weapons", name: "Weapons program", spend: 1.5, rate: 1.2, fx: { prestige: 2 }, p: { military: 4 } },
        { k: "arsenal", name: "Arsenal expansion", spend: 3, rate: 1.0, fx: { prestige: 5 }, p: { military: 6 }, req: (g, s) => s && s.mil.nukes >= 2 }
    ]},
    { key: "press", name: "Press & speech", icon: "📰", cost: 10, options: [
        { k: "free", name: "Free press", fx: { liberty: 20, stability: -3 }, p: { press: 15, security: -10 } },
        { k: "restricted", name: "Censorship laws", fx: { liberty: -5, stability: 2 }, p: { press: -10 } },
        { k: "state", name: "State-controlled media", fx: { liberty: -25, stability: 5 }, p: { press: -30, security: 10, politburo: 5 } }
    ]},
    { key: "security", name: "Internal security", icon: "🕵️", cost: 12, eo: true, options: [
        { k: "police", name: "Ordinary policing", fx: { liberty: 5 }, p: { security: -5 } },
        { k: "political", name: "Political police", spend: 1, fx: { liberty: -15, stability: 6 }, p: { security: 15, people: -4, press: -8 } },
        { k: "terror", name: "Terror apparatus", spend: 2, fx: { liberty: -35, stability: 12, legitimacy: -10 }, p: { security: 25, people: -10, press: -20, politburo: 3 },
          req: g => ["one_party", "military_junta", "monarchy"].includes(g) }
    ]},
    { key: "religion", name: "Religion & state", icon: "🕌", cost: 12, options: [
        { k: "secular", name: "Strict secularism", fx: { liberty: 3 }, p: { clergy: -15, press: 5 } },
        { k: "tolerant", name: "Religious tolerance", fx: {}, p: {} },
        { k: "established", name: "Established religion", fx: { liberty: -3, stability: 1 }, p: { clergy: 12, press: -3 } },
        { k: "theocratic", name: "Religious law", fx: { liberty: -12, stability: 2 }, p: { clergy: 25, press: -15, business: -5, people: -2 } }
    ]},
    { key: "rights", name: "Civil rights", icon: "⚖️", cost: 14, eo: true, options: [
        { k: "segregation", name: "Discriminatory laws", fx: { liberty: -10, stability: -4, prestige: -8 }, p: { party: 3 } },
        { k: "statusquo", name: "Status quo", fx: {}, p: {} },
        { k: "equal", name: "Equal rights law", fx: { liberty: 8, stability: 2, prestige: 6 }, p: { press: 6, people: -2 } }
    ]},
    { key: "resources", name: "Oil & resources", icon: "🛢️", cost: 14, options: [
        { k: "concessions", name: "Foreign concessions", fx: { growth: 0.2, prestige: -3 }, p: { business: 5, people: -3, foreign: 8 } },
        { k: "partnership", name: "50/50 profit sharing", fx: { growth: 0.1 }, p: { people: 2 } },
        { k: "nationalized", name: "Nationalized", fx: { growth: -0.3, prestige: 4 }, p: { people: 8, business: -10, foreign: -15, cadres: 4 } }
    ]},
    { key: "space", name: "Space program", icon: "🚀", cost: 10, options: [
        { k: "no_space", name: "None", fx: {}, p: {} },
        { k: "satellites", name: "Rockets & satellites", spend: 0.5, fx: { prestige: 2 }, p: { military: 2, press: 2 }, req: (g, s) => s && s.year >= 1954 },
        { k: "crewed", name: "Crewed spaceflight", spend: 1.3, fx: { prestige: 4 }, p: { military: 2, press: 4, people: 2 }, req: (g, s) => s && s.year >= 1958 }
    ]}
];

const POLICY = {};
POLICY_AREAS.forEach(a => { POLICY[a.key] = a; a.options.forEach(o => { o.area = a.key; }); });
const policyOpt = (area, k) => POLICY[area].options.find(o => o.k === k);

// Country-specific names for some options.
function optName(o) {
    const c = typeof C === "function" && G ? C() : null;
    if (c && c.optNames && c.optNames[o.k]) return c.optNames[o.k];
    return o.name;
}

// ── Policy presets — a country's 1950 starting laws ─────────────────

const PRESETS = {
    west:       { economy: "mixed", tax: "moderate", welfare: "safety", health: "subsidized", education: "expanded", infra: "public", land: "mechanize", trade: "managed", labor: "bargaining", military: "moderate_mil", draft: "conscription", nuclear: "no_nukes", science: "universities", press: "free", security: "police", religion: "tolerant", rights: "statusquo", resources: "concessions", space: "no_space" },
    communist:  { economy: "planned", tax: "high", welfare: "safety", health: "national", education: "mass", infra: "grand", land: "collective", trade: "autarky", labor: "state_unions", military: "high_mil", draft: "conscription", nuclear: "research", science: "state_rd", press: "state", security: "political", religion: "secular", rights: "statusquo", resources: "nationalized", space: "no_space" },
    developing: { economy: "mixed", tax: "low", welfare: "minimal", health: "private", education: "basic", infra: "maintenance", land: "landlords", trade: "protection", labor: "restrict", military: "moderate_mil", draft: "conscription", nuclear: "no_nukes", science: "no_rd", press: "restricted", security: "political", religion: "established", rights: "statusquo", resources: "concessions", space: "no_space" },
    monarchy:   { economy: "market", tax: "low", welfare: "minimal", health: "private", education: "basic", infra: "maintenance", land: "landlords", trade: "managed", labor: "restrict", military: "moderate_mil", draft: "volunteer", nuclear: "no_nukes", science: "no_rd", press: "state", security: "political", religion: "theocratic", rights: "statusquo", resources: "concessions", space: "no_space" },
    colony:     { economy: "market", tax: "low", welfare: "minimal", health: "private", education: "basic", infra: "maintenance", land: "landlords", trade: "managed", labor: "restrict", military: "minimal_mil", draft: "volunteer", nuclear: "no_nukes", science: "no_rd", press: "restricted", security: "police", religion: "tolerant", rights: "statusquo", resources: "concessions", space: "no_space" }
};

// ── Blocs and organizations ─────────────────────────────────────────

const BLOCS = {
    nato:     { name: "NATO", icon: "🛡️", side: "west", defense: true, desc: "North Atlantic Treaty. An attack on one is an attack on all." },
    warsaw:   { name: "Warsaw Pact", icon: "⭐", side: "east", defense: true, desc: "The Soviet bloc's military alliance." },
    sinosov:  { name: "Sino-Soviet Treaty", icon: "🤝", side: "east", defense: true, desc: "The 1950 alliance between Moscow and Beijing." },
    seato:    { name: "SEATO", icon: "🌏", side: "west", defense: true, desc: "Southeast Asia Treaty Organization." },
    cento:    { name: "Baghdad Pact / CENTO", icon: "🏺", side: "west", defense: true, desc: "Western alliance on the Soviet Union's southern flank." },
    anzus:    { name: "ANZUS", icon: "🦘", side: "west", defense: true, desc: "Pacific security treaty of Australia, New Zealand and the United States." },
    nam:      { name: "Non-Aligned Movement", icon: "🕊️", side: "nonaligned", defense: false, desc: "Nations refusing to join either Cold War camp." },
    ecsc:     { name: "European Community", icon: "🇪🇺", side: null, defense: false, econ: true, desc: "Coal and steel pooled in 1951, a common market from 1957." },
    opec:     { name: "OPEC", icon: "🛢️", side: null, defense: false, econ: true, desc: "Oil exporters coordinating production and prices." },
    commonwealth: { name: "Commonwealth", icon: "👑", side: null, defense: false, econ: true, desc: "The former British Empire's club of nations." }
};

const SIDE_COLORS = { west: "#4f8fe0", east: "#e05a4f", nonaligned: "#d8a83a", colony: "#8a7fa8" };

// Leader name pools for successors and new regimes.
const NAME_POOLS = {
    anglo: ["Arthur Hale", "Margaret Lowell", "Edward Crane", "Thomas Whitcombe", "Helen Ashby", "Robert Kincaid", "James Prentice", "Ruth Calder"],
    slavic: ["Andrei Volkov", "Pyotr Sokolov", "Mikhail Orlov", "Grigory Belov", "Nikolai Zhukovsky", "Yuri Kirilenko"],
    chinese: ["Wang Zhenming", "Li Desheng", "Zhou Hanyu", "Chen Boda", "Liu Jianguo", "Zhang Weimin"],
    hindi: ["Rajendra Varma", "Govind Patil", "Kamala Iyer", "Suresh Mehta", "Arun Desai"],
    french: ["Jean-Pierre Marchand", "Louis Duval", "Henri Mercier", "Claude Fontaine", "Pierre Lefebvre"],
    german: ["Ludwig Hartmann", "Ernst Becker", "Karl Neumann", "Walter Scholz", "Gerda Vogel"],
    japanese: ["Takeo Morita", "Ichiro Sakamoto", "Hayato Kondo", "Eisaku Hara", "Kenji Murata"],
    iberian: ["Carlos Medina", "João Ferreira", "Ricardo Alves", "Luis Echeverría Ruiz", "Ana Duarte", "Jorge Salgado", "Hernán Roca"],
    arabic: ["Faisal bin Khalid", "Abdullah al-Rashid", "Khalid bin Fahd", "Hamad al-Nahyan", "Sultan bin Mansour"],
    persian: ["Ali Amini", "Hossein Ala", "Fazlollah Shirazi", "Reza Ghaffari", "Jamshid Farzan"],
    turkish: ["Kemal Aydın", "Celal Arslan", "Adnan Yılmaz", "Fuat Demir"],
    hebrew: ["Moshe Avidan", "Golda Halevi", "Yitzhak Ben-Ami", "Levi Shapira"],
    african: ["Obafemi Adeyemi", "Chukwuma Okafor", "Abubakar Bello", "Nnamdi Eze", "Yakubu Danjuma", "Olusegun Bankole"],
    ethiopian: ["Tafari Wolde", "Mengistu Alemu", "Haile Tesfaye", "Getachew Bekele", "Abebe Girma", "Mesfin Haile"],
    afrikaans: ["Hendrik Strijdom", "Johannes Botha", "Pieter van Wyk", "Frederik du Plessis"],
    malay: ["Abdul Rahman Hashim", "Goh Keng Seng", "Lim Boon Huat", "Ahmad Nasution", "Bambang Suryo", "Teodoro Reyes", "Ramon Aquino"],
    nordic: ["Trygve Lund", "Per Borten", "Kari Haugland", "Hans Rüegg", "Ueli Brunner", "Max Keller"],
    khmer: ["Sisowath Monireth", "Son Ngoc Lim", "Chea Sophal", "Norodom Kantol"],
    pacific: ["Ratu Kamisese", "Sitiveni Tora", "Jai Ram Reddy", "Peter Fraser Jr.", "Errol Walcott", "Wiremu Tane"]
};

// ── Industries ──────────────────────────────────────────────────────
// Each sector's output is tracked in $bn. It grows with world demand
// (trend), your support level, and whether your country has the
// technology, literacy, universities and resources it needs.
// res: needs that resource tag. heavy: counts toward industrialization.
// jobs: workers per unit of output (agriculture and textiles employ many).

const INDUSTRIES = {
    agriculture:  { name: "Agriculture", icon: "🌾", tech: 0, lit: 0, uni: 0, jobs: 3.0, heavy: false, project: "Irrigation dam & canals",
                    desc: "Farming, ranching and fishing. Employs most people in poor countries; its share of the economy shrinks as you industrialize." },
    mining:       { name: "Mining", icon: "⛏️", tech: 5, lit: 0, uni: 0, jobs: 1.2, heavy: true, res: "minerals", project: "Mine & ore railway",
                    desc: "Coal, iron, copper, tin, gold. Needs mineral deposits." },
    oil:          { name: "Oil & gas", icon: "🛢️", tech: 10, lit: 0, uni: 0, jobs: 0.3, heavy: false, res: "oil", project: "Oil field & refinery",
                    desc: "Few jobs, enormous revenue. Its value moves with the world oil price." },
    textiles:     { name: "Textiles & light industry", icon: "🧵", tech: 10, lit: 20, uni: 0, jobs: 2.2, heavy: true, project: "Textile mills",
                    desc: "The first rung of industrialization: cheap labor, simple machines, export markets." },
    steel:        { name: "Steel & heavy industry", icon: "🏗️", tech: 25, lit: 40, uni: 1, jobs: 1.1, heavy: true, project: "Integrated steelworks",
                    desc: "Steel, cement and heavy chemicals. The backbone of every 1950s plan." },
    machinery:    { name: "Machinery & engineering", icon: "⚙️", tech: 35, lit: 55, uni: 2, jobs: 1.0, heavy: true, project: "Machine-tool plant",
                    desc: "Engines, tractors, turbines and machine tools." },
    chemicals:    { name: "Chemicals & pharmaceuticals", icon: "🧪", tech: 40, lit: 60, uni: 4, jobs: 0.7, heavy: true, project: "Petrochemical complex",
                    desc: "Fertilizer, plastics and medicine. Needs chemists." },
    shipbuilding: { name: "Shipbuilding", icon: "🚢", tech: 30, lit: 45, uni: 1, jobs: 1.2, heavy: true, res: "coast", project: "Shipyard",
                    desc: "Tankers and freighters for booming world trade." },
    autos:        { name: "Automobiles", icon: "🚗", tech: 45, lit: 65, uni: 3, jobs: 1.0, heavy: true, project: "Automobile plant",
                    desc: "The great consumer industry of the postwar boom." },
    electronics:  { name: "Electronics", icon: "📻", tech: 55, lit: 75, uni: 6, jobs: 0.9, heavy: true, from: 1953, project: "Electronics industrial park",
                    desc: "Radios, televisions and transistors. Unlocks in the 1950s." },
    aerospace:    { name: "Aerospace & arms", icon: "✈️", tech: 65, lit: 80, uni: 8, jobs: 0.6, heavy: true, project: "Aircraft works",
                    desc: "Jet aircraft, missiles and arms exports. Feeds military strength." },
    computing:    { name: "Computers & software", icon: "💻", tech: 75, lit: 90, uni: 12, jobs: 0.5, heavy: false, from: 1965, project: "Computer research campus",
                    desc: "The industry of the future. Unlocks in the mid-1960s and needs a deep university system." },
    renewables:   { name: "Renewable energy", icon: "🌞", tech: 95, lit: 90, uni: 15, jobs: 0.6, heavy: true, from: 2000, project: "Solar & wind farm complex",
                    desc: "Solar panels, wind turbines and batteries. Unlocks in 2000." },
    ai:           { name: "Artificial intelligence", icon: "🤖", tech: 130, lit: 95, uni: 25, jobs: 0.3, heavy: false, from: 2015, project: "AI research campus & data centers",
                    desc: "Machine learning and data centers. The frontier industry of the 2020s." },
    finance:      { name: "Banking & finance", icon: "🏦", tech: 30, lit: 60, uni: 3, jobs: 0.5, heavy: false, project: "Financial district & exchange",
                    desc: "Banks, insurance and trade finance. Thrives on stability and open trade." },
    film:         { name: "Film & media", icon: "🎬", tech: 20, lit: 40, uni: 1, jobs: 1.0, heavy: false, project: "Film studio complex",
                    desc: "Cinema, then television, then streaming. Censorship stifles it; a hit industry is soft power." },
    tourism:      { name: "Tourism", icon: "🏝️", tech: 5, lit: 20, uni: 0, jobs: 1.6, heavy: false, res: "tourism", project: "Resort & jet airport",
                    desc: "Hotels, beaches and airlines. Needs attractions and peace." }
};

// Annual world-demand growth for each sector, by era.
function industryTrend(k, year) {
    const e = year < 1973 ? 0 : year < 1985 ? 1 : year < 2008 ? 2 : 3;
    const T = {
        agriculture: [2, 1.5, 1.5, 1.5], mining: [3.5, 1.5, 1, 2], oil: [7, 2, 1, 1], textiles: [4, 2, 1.5, 1], steel: [6, 0.5, 0, 0.5],
        machinery: [6, 3, 2.5, 2], chemicals: [7, 3.5, 3, 2.5], shipbuilding: [6, -2, -1, 0], autos: [8, 3, 3, 2], electronics: [11, 8, 7, 4],
        aerospace: [7, 4, 3, 3], computing: [18, 16, 14, 8], finance: [5, 5, 6, 3], tourism: [8, 6, 5, 4], film: [5, 4, 5, 6], renewables: [0, 0, 12, 14], ai: [0, 0, 0, 25]
    };
    return T[k][e];
}

const SUPPORT_LEVELS = [
    { name: "Hands off", bonus: 0, spend: 0 },
    { name: "Subsidized", bonus: 1.8, spend: 0.25 },
    { name: "Priority sector", bonus: 3.5, spend: 0.6 },
    { name: "National crusade", bonus: 5.5, spend: 1.2 }
];

const OWNERSHIP = {
    private: { name: "Private", desc: "Market-driven. Business likes it." },
    state:   { name: "State-owned", desc: "Run by the state. Efficient under good planners, a jobs program under bad ones." },
    foreign: { name: "Foreign-owned", desc: "Brings capital and technology, but profits leave the country." }
};

const DEV_STAGES = [
    [0, "Agrarian"], [15, "Early industrial"], [35, "Industrializing"], [60, "Industrial"], [85, "Advanced industrial"]
];
