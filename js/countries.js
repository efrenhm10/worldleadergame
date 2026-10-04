// ── COUNTRIES (part 1) — the world of January 1950 ──────────────────
//
// Each entry maps a country's *real* 1950 system: who is head of state
// and government, the actual legislature and parties (with 1950 seat
// counts, rounded where sources differ), internal party factions, the
// country's regions, its industries, and its strengths and weaknesses.
//
// Industry figures are approximate shares of GDP in 1950 (%); anything
// not listed counts as services and trade. GDP is in billions of 1950 US
// dollars (estimates).

const P = (k, name, ideo, seats, gov, desc, fac) => ({ k, name, ideo, seats, gov: !!gov, desc, fac: fac || null });
const F = (n, share, ideo, d) => ({ n, share, ideo, d });
const R = (n, pop, lean, t, d) => ({ n, pop, lean: lean || {}, t: t || [], d: d || "" });
const goal = (n, d, chk, reward) => ({ n, d, chk, reward: reward || { prestige: 6, legitimacy: 5 } });

const COUNTRIES = {

// ═══════════════════ MAJOR POWERS ═══════════════════

usa: {
    name: "United States", flag: "🇺🇸", tier: "major", area: "Americas", status: "sovereign", gov: "presidential",
    system: "Federal presidential republic",
    hos: "The President is both head of state and head of government.",
    how: [
        "The President is elected every 4 years through the Electoral College and runs the executive branch.",
        "Congress has two chambers: the House of Representatives (435 seats, elected every 2 years) and the Senate (96 seats, two per state). A bill must pass both before you can sign it.",
        "You can veto bills; Congress overrides with a two-thirds vote. You can issue executive orders, but the Supreme Court can strike them down.",
        "The House can impeach you by simple majority; the Senate removes you with a two-thirds vote.",
        "No term limit yet in 1950: the 22nd Amendment (two terms) is still being ratified by the states."
    ],
    leader: { name: "Harry S. Truman", age: 65, title: "President", party: "dem" },
    leg: { name: "Congress", detail: "House 435 + Senate 96 (combined)", system: "fptp" },
    parties: [
        P("dem", "Democratic Party", "liberal", 317, true, "Franklin Roosevelt's New Deal coalition: Northern workers, immigrants, Black voters in the North, and the segregationist 'Solid South'.",
            [F("Northern Democrats", 0.6, "socdem", "New Deal liberals and labor allies. They want civil rights, public housing and national health insurance."),
             F("Southern Democrats", 0.4, "conservative", "Segregationist 'Dixiecrats' who chair key committees and filibuster civil rights bills.")]),
        P("rep", "Republican Party", "conservative", 214, false, "The party of business, small towns and the Midwest. Out of the White House since 1933.",
            [F("Taft Republicans", 0.6, "conservative", "Midwestern conservatives: balanced budgets, anti-union, wary of foreign entanglements."),
             F("Eastern Establishment", 0.4, "liberal", "Dewey-style internationalists who back NATO and the Marshall Plan.")])
    ],
    term: { years: 4, limit: null, served: 1, ends: [1953, 1], next: [1952, 11], legEvery: 2, legNext: [1950, 11] },
    regions: [
        R("Northeast", 26, { dem: 2, rep: -2 }, ["industrial", "finance"], "Factories, Wall Street, immigrant cities."),
        R("South", 31, { dem: 16, rep: -16 }, ["agrarian", "segregated"], "One-party Democratic, segregated, poor and rural."),
        R("Midwest", 29, { dem: -5, rep: 5 }, ["industrial", "agrarian"], "Steel, autos and farms. The swing heartland."),
        R("West", 14, { dem: 0, rep: 0 }, ["oil", "aerospace"], "Booming California, oil, defense plants.")
    ],
    econ: { gdp: 300, pop: 152, growth: 3.6, taxCap: 1, corruption: 20, debt: 85,
            inds: { agriculture: 7, mining: 2.5, oil: 3, textiles: 3, steel: 6, machinery: 7, chemicals: 4, shipbuilding: 0.7, autos: 5, electronics: 1.5, aerospace: 2, finance: 9, tourism: 1.5 } },
    res: ["oil", "minerals", "coast", "tourism"],
    dev: { tech: 85, lit: 97, uni: 14, urban: 64 },
    mil: { base: 100, nukes: 2, prog: 20 },
    s: { stability: 72, liberty: 70, legitimacy: 82, prestige: 92 },
    align: 100, blocs: ["nato"], preset: "west",
    pol: { economy: "market", tax: "high", health: "private", rights: "segregation", nuclear: "arsenal", science: "national_labs" },
    optNames: { segregation: "Jim Crow segregation" },
    pillarNames: { party: "Congressional Democrats", military: "The Pentagon", business: "Wall Street & Industry", labor: "AFL & CIO unions" },
    strengths: ["Half the world's industrial output", "Only nuclear arsenal of any size", "Allies on every continent and the dollar as world currency"],
    weaknesses: ["Segregation shames you abroad and splits your party", "The Red Scare poisons domestic politics", "Global commitments stretch the budget"],
    goals: [
        goal("Pass a civil rights law", "Replace segregation with an equal rights law.", g => g.pol.rights === "equal"),
        goal("Win the space race", "Put a crewed program into orbit and reach the Moon.", g => !!g.flags.moon),
        goal("Contain communism", "Keep every NATO member in the alliance through 1970.", g => g.year >= 1970 && g.blocs.nato.length >= 12)
    ],
    blurb: "You lead the most powerful nation on Earth, and the most anxious. The Soviets broke your atomic monopoly last August, China fell to Mao in October, and a junior senator from Wisconsin is about to claim the State Department is full of communists.",
    drama: ["The Soviets tested an atomic bomb in August 1949.", "China 'lost' to Mao. Congress wants someone to blame.", "Korea is divided at the 38th parallel, and US troops have left the South."],
    names: "anglo",
    hist: [[1953, 1, "Dwight D. Eisenhower"], [1961, 1, "John F. Kennedy"], [1963, 11, "Lyndon B. Johnson"], [1969, 1, "Richard Nixon"], [1974, 8, "Gerald Ford"], [1977, 1, "Jimmy Carter"], [1981, 1, "Ronald Reagan"], [1989, 1, "George H. W. Bush"]]
},

china: {
    name: "People's Republic of China", flag: "🇨🇳", tier: "major", area: "Asia", status: "sovereign", gov: "one_party",
    system: "Communist one-party state",
    hos: "The Chairman of the Communist Party is the supreme leader. Mao is also chairman of the Central People's Government and of the Military Commission.",
    how: [
        "The Chinese Communist Party (CCP) holds all real power. Its Politburo, a small committee of top leaders, makes the big decisions.",
        "A National People's Congress will be created in 1954, but it approves whatever the Party decides.",
        "The People's Liberation Army answers to the Party's Military Commission, which you chair.",
        "There are no elections to lose. You fall if the Politburo turns against you or the army does."
    ],
    leader: { name: "Mao Zedong", age: 56, title: "Chairman of the Communist Party", party: "ccp" },
    leg: { name: "Politburo", detail: "Inner circle factions (by influence)", system: "party" },
    parties: [
        P("ccp", "Chinese Communist Party", "communist", 100, true, "Victors of the civil war. Some 4.5 million members, growing fast.",
            [F("Maoists", 0.35, "communist", "Radicals loyal to the Chairman personally. They favor mass campaigns and permanent revolution."),
             F("Planners (Liu Shaoqi, Zhou Enlai)", 0.3, "socialist", "Administrators who want Soviet-style planning, order and expertise."),
             F("Northeast faction (Gao Gang)", 0.15, "communist", "Manchuria's boss: closest to Moscow, controls the industrial heartland."),
             F("PLA Marshals", 0.2, "militarist", "Zhu De, Peng Dehuai, Lin Biao. Heroes of the revolution who command the army.")])
    ],
    regions: [
        R("North China Plain", 30, {}, ["agrarian"], "The ancient heartland, Beijing, wheat and millet."),
        R("Manchuria", 9, {}, ["industrial"], "Japanese-built heavy industry, close to the Soviet border."),
        R("East Coast", 22, {}, ["industrial", "finance"], "Shanghai's mills and merchants, suspect to the Party."),
        R("South", 30, {}, ["agrarian"], "Rice paddies and recently 'liberated' provinces with bandit remnants."),
        R("West & Tibet", 9, {}, ["minority"], "Xinjiang, Tibet and minority lands, barely under control.")
    ],
    econ: { gdp: 35, pop: 546, growth: 5.5, taxCap: 0.5, corruption: 30, debt: 5,
            inds: { agriculture: 45, mining: 3, textiles: 6, steel: 2, machinery: 1, chemicals: 0.5, shipbuilding: 0.2, finance: 0.5 } },
    res: ["minerals", "coast"],
    dev: { tech: 15, lit: 20, uni: 0.3, urban: 12 },
    mil: { base: 80, nukes: 0, prog: 0 },
    s: { stability: 50, liberty: 15, legitimacy: 70, prestige: 55 },
    align: -90, blocs: [], preset: "communist",
    pol: { land: "reform", trade: "managed", security: "political", economy: "mixed" },
    pillarNames: { military: "People's Liberation Army", security: "Public Security Bureau" },
    strengths: ["Largest population on Earth", "Battle-hardened army with high morale", "Revolutionary legitimacy and a disciplined Party"],
    weaknesses: ["Ruined by 40 years of war, desperately poor", "80% illiterate peasants", "Taiwan still held by Chiang Kai-shek's Nationalists"],
    goals: [
        goal("Build the bomb", "Join the nuclear club.", g => g.mil.nukes >= 2),
        goal("Industrialize", "Reach the 'Industrializing' development stage.", g => g.dev.ind >= 35),
        goal("Reunify with Taiwan", "Bring Taiwan under Beijing's control.", g => !!g.flags.taiwan_taken)
    ],
    blurb: "The Chinese people have stood up. You proclaimed the People's Republic three months ago from Tiananmen. Now you must feed half a billion people, rebuild a shattered country, and decide how much to trust Stalin.",
    drama: ["Chiang Kai-shek has fled to Taiwan with the gold reserves and an army.", "You are in Moscow negotiating a treaty with Stalin, who is keeping you waiting.", "Land reform is starting in the villages, and landlords are being tried before crowds."],
    names: "chinese",
    hist: [[1976, 10, "Hua Guofeng"], [1978, 12, "Deng Xiaoping"]]
},

russia: {
    name: "Soviet Union", flag: "🇷🇺", tier: "major", area: "Europe", status: "sovereign", gov: "one_party",
    system: "Communist one-party state (federation of 16 Soviet republics)",
    hos: "The General Secretary of the Communist Party rules. Stalin is also Chairman of the Council of Ministers.",
    how: [
        "The Communist Party of the Soviet Union (CPSU) runs everything. The Politburo (renamed Presidium in 1952) is the real government.",
        "The Supreme Soviet is a rubber-stamp parliament elected from single-candidate lists.",
        "The economy runs on Five-Year Plans set by Gosplan. The MGB/MVD security organs run the Gulag labor camps.",
        "You fall if your Politburo colleagues unite against you. That is how Khrushchev will be removed in 1964."
    ],
    leader: { name: "Joseph Stalin", age: 71, title: "General Secretary", party: "cpsu" },
    leg: { name: "Politburo", detail: "Inner circle factions (by influence)", system: "party" },
    parties: [
        P("cpsu", "Communist Party of the Soviet Union", "communist", 100, true, "Six million members. The vanguard of the proletariat and the only legal party.",
            [F("Old Guard (Molotov, Kaganovich)", 0.25, "communist", "Stalinist hardliners: heavy industry, no compromise with the West."),
             F("Malenkov's apparatus", 0.25, "socialist", "Technocrats who want more consumer goods and less tension."),
             F("Beria's security organs", 0.2, "communist", "The secret police empire. Feared by all the others."),
             F("Khrushchev & regional secretaries", 0.15, "socialist", "Party bosses from Ukraine and the provinces: agriculture, populism."),
             F("The Marshals", 0.15, "militarist", "Zhukov and the victors of 1945, sidelined by Stalin but revered.")])
    ],
    regions: [
        R("Russia (RSFSR)", 55, {}, ["industrial"], "The core: Moscow, Leningrad, the Urals."),
        R("Ukraine & Belarus", 23, {}, ["agrarian", "industrial"], "Breadbasket and Donbas coal, still scarred by war."),
        R("Baltic states", 3, {}, ["minority"], "Annexed in 1940; forest guerrillas still active."),
        R("Caucasus", 5, {}, ["oil", "minority"], "Baku oil, Georgia, Armenia."),
        R("Central Asia & Siberia", 14, {}, ["minerals", "minority"], "Cotton, camps, coal and the coming Virgin Lands.")
    ],
    econ: { gdp: 130, pop: 180, growth: 6, taxCap: 0.9, corruption: 25, debt: 10,
            inds: { agriculture: 22, mining: 6, oil: 3, textiles: 5, steel: 9, machinery: 9, chemicals: 3, shipbuilding: 1, autos: 1, aerospace: 3, finance: 0.5 } },
    res: ["oil", "minerals", "coast"],
    dev: { tech: 65, lit: 90, uni: 4, urban: 43 },
    mil: { base: 120, nukes: 2, prog: 10 },
    s: { stability: 70, liberty: 5, legitimacy: 65, prestige: 85 },
    align: -100, blocs: [], preset: "communist",
    pol: { security: "terror", space: "no_space", nuclear: "arsenal", economy: "planned", land: "collective" },
    pillarNames: { security: "MGB / MVD", military: "Red Army" },
    strengths: ["Largest army in the world", "Atomic bomb since August 1949", "Total control of Eastern Europe"],
    weaknesses: ["20+ million war dead and devastated western regions", "Collective farms barely feed the country", "A leader who is old, ill and paranoid"],
    goals: [
        goal("Thermonuclear parity", "Build the hydrogen bomb.", g => g.mil.nukes >= 3),
        goal("First in space", "Launch the first satellite.", g => !!g.flags.first_satellite),
        goal("Overtake America", "Match the US economy in size.", g => g.econ.gdp >= (g.nations.usa ? g.nations.usa.gdp : 1e9))
    ],
    blurb: "You won the greatest war in history and paid for it with tens of millions of lives. Now you hold half of Europe, you have the bomb, and Mao is in Moscow asking for a treaty. You are 71 years old, and your lieutenants are already measuring the chair.",
    drama: ["Mao is in Moscow seeking an alliance and aid.", "Kim Il-sung is pressing for permission to invade South Korea.", "Tito's Yugoslavia has defied you and survived."],
    names: "slavic",
    hist: [[1953, 3, "Georgy Malenkov"], [1955, 2, "Nikita Khrushchev"], [1964, 10, "Leonid Brezhnev"], [1982, 11, "Yuri Andropov"], [1984, 2, "Konstantin Chernenko"], [1985, 3, "Mikhail Gorbachev"]]
},

india: {
    name: "India", flag: "🇮🇳", tier: "major", area: "Asia", status: "sovereign", gov: "parliamentary",
    system: "Federal parliamentary republic (since 26 January 1950)",
    hos: "The President (Rajendra Prasad) is a ceremonial head of state. The Prime Minister leads the government.",
    how: [
        "India became a republic this month under one of the world's longest constitutions.",
        "The Prime Minister must keep a majority in the Lok Sabha (lower house). The Rajya Sabha represents the states.",
        "Until the first general election (late 1951), the Constituent Assembly sits as a Provisional Parliament.",
        "That election will have 173 million voters, most of them illiterate, voting by party symbol: the largest election ever held.",
        "States have their own elected governments, and language politics will redraw their borders."
    ],
    leader: { name: "Jawaharlal Nehru", age: 60, title: "Prime Minister", party: "inc" },
    leg: { name: "Provisional Parliament", detail: "Constituent Assembly sitting as parliament", system: "fptp" },
    parties: [
        P("inc", "Indian National Congress", "socdem", 282, true, "The party of Gandhi and independence: a vast umbrella from socialists to Hindu traditionalists.",
            [F("Nehruvians", 0.55, "socialist", "Secular planners: Five-Year Plans, heavy industry, non-alignment."),
             F("Congress conservatives (Patel wing)", 0.45, "conservative", "Business-friendly, Hindu-traditional, tough on Pakistan and on communists.")]),
        P("oth", "Independents & minor parties", "liberal", 31, false, "Socialists, Hindu nationalists, regional and princely-state members.")
    ],
    term: { next: [1951, 12] },
    regions: [
        R("Hindi heartland", 38, { inc: 4 }, ["agrarian"], "Uttar Pradesh, Bihar, Madhya Pradesh. Congress's base."),
        R("South", 25, { inc: -3 }, ["agrarian", "minority"], "Madras and the Dravidian movement's resentment of Hindi."),
        R("West (Bombay)", 15, { inc: 2 }, ["industrial", "finance"], "Textile mills and India's commercial capital."),
        R("East (Bengal)", 14, { inc: -4 }, ["industrial"], "Calcutta, jute, refugees from East Pakistan, communists."),
        R("Punjab & Kashmir", 8, { inc: 0 }, ["agrarian", "minority"], "Partition's wounds and the Kashmir dispute.")
    ],
    econ: { gdp: 25, pop: 357, growth: 3.5, taxCap: 0.5, corruption: 30, debt: 30,
            inds: { agriculture: 50, mining: 2, textiles: 8, steel: 1.5, machinery: 1, chemicals: 0.5, finance: 1, tourism: 0.5 } },
    res: ["minerals", "coast", "tourism"],
    dev: { tech: 25, lit: 18, uni: 0.8, urban: 17 },
    mil: { base: 25, nukes: 0, prog: 0 },
    s: { stability: 52, liberty: 65, legitimacy: 80, prestige: 60 },
    align: 0, blocs: ["commonwealth"], preset: "developing",
    pol: { economy: "mixed", press: "free", security: "police", religion: "secular", rights: "equal", education: "basic", science: "universities" },
    pillarNames: { party: "Congress Party", labor: "Trade unions", business: "Industrialists (Tata, Birla)" },
    strengths: ["Enormous moral prestige from the independence struggle", "A capable civil service and army inherited from the Raj", "Nehru's personal popularity"],
    weaknesses: ["Mass poverty: life expectancy is 32", "Partition refugees and communal violence", "Kashmir war with Pakistan frozen, not settled"],
    goals: [
        goal("Temples of modern India", "Triple steel output.", g => g.ind.steel && g.ind.steel.out >= g.ind.steel.out0 * 3),
        goal("Feed the nation", "Double agricultural output.", g => g.ind.agriculture.out >= g.ind.agriculture.out0 * 2),
        goal("Lead the non-aligned", "Help found and stay in the Non-Aligned Movement.", g => g.blocs.nam.includes(g.ck))
    ],
    blurb: "Two and a half years ago you spoke of a tryst with destiny. This month India became a republic. Now you must hold together 357 million people, 14 languages and a dozen religions, and lift them out of a poverty the British left behind.",
    drama: ["The Constitution came into force on 26 January.", "Refugees still pour across the Bengal border.", "Your deputy, Sardar Patel, is ill. He has held the conservatives in line."],
    names: "hindi",
    hist: [[1964, 6, "Lal Bahadur Shastri"], [1966, 1, "Indira Gandhi"], [1977, 3, "Morarji Desai"], [1980, 1, "Indira Gandhi"], [1984, 10, "Rajiv Gandhi"], [1989, 12, "V. P. Singh"]]
},

uk: {
    name: "United Kingdom", flag: "🇬🇧", tier: "major", area: "Europe", status: "sovereign", gov: "parliamentary",
    system: "Constitutional monarchy, Westminster parliamentary system",
    hos: "King George VI is head of state but has no political power. The Prime Minister governs.",
    how: [
        "The Prime Minister leads the party with a majority in the House of Commons (625 seats, first-past-the-post).",
        "If you lose a vote of confidence, you must resign or call an election.",
        "You can ask the King to dissolve Parliament and call an election whenever you choose, within 5 years.",
        "The House of Lords can delay bills by a year, but not block them.",
        "Your own MPs can remove you as party leader, and that removes you as Prime Minister."
    ],
    leader: { name: "Clement Attlee", age: 67, title: "Prime Minister", party: "lab" },
    leg: { name: "House of Commons", detail: "640 seats (1945 Parliament)", system: "fptp" },
    parties: [
        P("lab", "Labour Party", "socdem", 393, true, "Built the welfare state and the NHS and nationalized coal, rail and steel since its 1945 landslide.",
            [F("Labour right", 0.7, "socdem", "Attlee, Morrison, Gaitskell: mixed economy, NATO, careful spending."),
             F("Bevanite left", 0.3, "socialist", "Nye Bevan's followers: more nationalization, free NHS, suspicious of America.")]),
        P("con", "Conservative Party", "conservative", 213, false, "Churchill's party: the wartime leader wants his job back.",
            [F("One-nation Tories", 0.65, "conservative", "Accept the welfare state, promise to run it better."),
             F("Imperial right", 0.35, "nationalist", "Defend the Empire and sterling at all costs.")]),
        P("lib", "Liberal Party", "liberal", 12, false, "The great party of Gladstone, reduced to a handful of seats in the Celtic fringe."),
        P("oth", "Others", "socdem", 22, false, "Ulster Unionists, independents, Irish nationalists.")
    ],
    term: { next: [1950, 2] },
    regions: [
        R("London & the South", 36, { lab: -6, con: 6 }, ["finance"], "The City, the suburbs, the shires."),
        R("Midlands", 18, { lab: 1, con: -1 }, ["industrial"], "Cars, engineering, marginal seats."),
        R("North of England", 24, { lab: 8, con: -8 }, ["industrial"], "Mills, mines, shipyards. Labour heartland."),
        R("Scotland", 10, { lab: 2, con: -2 }, ["industrial"], "Clydeside yards and Highland crofts."),
        R("Wales & Northern Ireland", 12, { lab: 4, con: -4 }, ["mining"], "Valleys and Ulster.")
    ],
    econ: { gdp: 37, pop: 50, growth: 2.6, taxCap: 1, corruption: 10, debt: 74,
            inds: { agriculture: 5, mining: 4, textiles: 6, steel: 6, machinery: 8, chemicals: 4, shipbuilding: 2, autos: 3, electronics: 1, aerospace: 2, finance: 8, tourism: 1.5 } },
    res: ["minerals", "coast", "tourism"],
    dev: { tech: 82, lit: 98, uni: 4, urban: 79 },
    mil: { base: 50, nukes: 0, prog: 45 },
    s: { stability: 70, liberty: 85, legitimacy: 85, prestige: 80 },
    align: 85, blocs: ["nato", "commonwealth"], preset: "west",
    pol: { economy: "mixed", tax: "high", welfare: "welfare", health: "national", nuclear: "weapons", science: "state_rd", infra: "public" },
    pillarNames: { party: "Parliamentary Labour Party", labor: "Trades Union Congress", business: "The City" },
    strengths: ["Global empire and Commonwealth network", "Special relationship with Washington", "First-class science, intelligence and navy"],
    weaknesses: ["Debt of nearly 200% of national income from the war (counted here in dollars at the 1949 rate)", "Rationing continues five years after victory", "An empire that is costing more than it earns"],
    goals: [
        goal("An independent deterrent", "Test a British atomic bomb.", g => g.mil.nukes >= 2),
        goal("Join Europe", "Become a member of the European Community.", g => g.blocs.ecsc.includes(g.ck)),
        goal("Graceful retreat", "See five colonies reach independence without a colonial war lost.", g => (g.flags.indep_granted || 0) >= 5 && !g.flags.colonial_defeat)
    ],
    blurb: "You won the war and built the welfare state, and the country is exhausted. Rationing goes on, the pound was devalued last autumn, and Parliament's five years are up: an election is due in February, and Churchill is waiting.",
    drama: ["A general election must be held in February 1950.", "Sterling was devalued 30% in September 1949.", "Malaya's communist insurgency is tying down your troops."],
    names: "anglo",
    colonies: ["nigeria", "singapore", "barbados", "fiji", "uae", "malaya"],
    hist: [[1951, 10, "Winston Churchill"], [1955, 4, "Anthony Eden"], [1957, 1, "Harold Macmillan"], [1963, 10, "Alec Douglas-Home"], [1964, 10, "Harold Wilson"], [1970, 6, "Edward Heath"], [1974, 3, "Harold Wilson"], [1976, 4, "James Callaghan"], [1979, 5, "Margaret Thatcher"], [1990, 11, "John Major"]]
},

france: {
    name: "France", flag: "🇫🇷", tier: "major", area: "Europe", status: "sovereign", gov: "parliamentary",
    system: "Fourth Republic: parliamentary republic",
    hos: "President Vincent Auriol is elected by Parliament and is largely ceremonial. The Président du Conseil (prime minister) governs.",
    how: [
        "The National Assembly (618 seats, proportional representation) dominates. You need its confidence to govern.",
        "No party comes close to a majority. Every government is a fragile coalition of the 'Third Force' centrist parties.",
        "The Communists (the largest party) and de Gaulle's movement both oppose the Republic itself.",
        "Governments fall on average every six months. Surviving a year is an achievement.",
        "A future crisis could replace this system with a strong presidency, as happened in 1958."
    ],
    leader: { name: "Georges Bidault", age: 50, title: "Président du Conseil", party: "mrp" },
    leg: { name: "National Assembly", detail: "618 seats, proportional", system: "pr" },
    parties: [
        P("mrp", "MRP (Christian Democrats)", "conservative", 167, true, "Catholic, pro-European centrists of the Resistance generation."),
        P("sfio", "SFIO (Socialists)", "socdem", 102, true, "The old socialist party: secular, anti-communist, pro-welfare."),
        P("rad", "Radicals & UDSR", "liberal", 70, true, "The Third Republic's pivot party: secular, small-business, endlessly flexible."),
        P("mod", "Moderates (Independents)", "conservative", 70, true, "Business and agrarian conservatives."),
        P("pcf", "Communist Party (PCF)", "communist", 182, false, "The largest party, loyal to Moscow, with a quarter of the vote and the CGT unions behind it."),
        P("rpf", "Gaullists (RPF)", "nationalist", 27, false, "De Gaulle's rally against the 'regime of parties'. Waiting for the Republic to fail.")
    ],
    term: { next: [1951, 6] },
    regions: [
        R("Paris region", 18, { mrp: -2 }, ["finance", "industrial"], "Capital of everything, red suburbs."),
        R("North & East", 22, { mrp: 1 }, ["industrial", "mining"], "Coal, steel, Lorraine, the German border."),
        R("West", 20, { mrp: 8 }, ["agrarian", "religious"], "Catholic Brittany and Normandy: MRP country."),
        R("South", 32, { mrp: -5 }, ["agrarian"], "Wine, the anticlerical Midi, Marseille."),
        R("Algeria (settler vote)", 8, { mrp: -2 }, ["colonial"], "Legally three French departments, with a million settlers.")
    ],
    econ: { gdp: 29, pop: 42, growth: 4.8, taxCap: 0.85, corruption: 18, debt: 60,
            inds: { agriculture: 14, mining: 3, textiles: 5, steel: 5, machinery: 6, chemicals: 4, shipbuilding: 1, autos: 3, aerospace: 1.5, finance: 5, tourism: 3 } },
    res: ["minerals", "coast", "tourism"],
    dev: { tech: 75, lit: 96, uni: 4, urban: 55 },
    mil: { base: 35, nukes: 0, prog: 5 },
    s: { stability: 48, liberty: 78, legitimacy: 55, prestige: 65 },
    align: 70, blocs: ["nato"], preset: "west",
    pol: { welfare: "welfare", health: "subsidized", nuclear: "research", science: "state_rd", infra: "grand", economy: "mixed" },
    pillarNames: { coalition: "Third Force partners", labor: "CGT & Force Ouvrière", military: "The Army" },
    strengths: ["Monnet's modernization plan is rebuilding industry", "A seat on the UN Security Council and a worldwide empire", "Agricultural abundance and cultural prestige"],
    weaknesses: ["A paralyzed political system", "The Indochina war is bleeding the army", "A quarter of voters back the Communists"],
    goals: [
        goal("End the Indochina war", "Bring the war to an end, by victory or negotiation.", g => !!g.flags.indochina_over),
        goal("Force de frappe", "Build an independent nuclear force.", g => g.mil.nukes >= 2),
        goal("Build Europe", "Found the European Community with Germany.", g => g.blocs.ecsc.includes(g.ck))
    ],
    blurb: "France is free, but hardly at peace with itself. Your coalition has a majority on paper and no unity in practice. In Indochina, 150,000 men fight the Viet Minh. Across the Rhine, the Germans are recovering faster than anyone expected.",
    drama: ["The Indochina war is in its fourth year.", "Your coalition partners disagree on taxes, church schools and the war.", "Foreign minister Robert Schuman is drafting a plan to pool coal and steel with Germany."],
    names: "french",
    colonies: ["cambodia"],
    hist: [[1950, 7, "René Pleven"], [1952, 3, "Antoine Pinay"], [1954, 6, "Pierre Mendès France"], [1955, 2, "Edgar Faure"], [1956, 2, "Guy Mollet"], [1958, 6, "Charles de Gaulle", "semi_presidential"], [1969, 6, "Georges Pompidou"], [1974, 5, "Valéry Giscard d'Estaing"], [1981, 5, "François Mitterrand"]]
},

germany: {
    name: "West Germany", flag: "🇩🇪", tier: "major", area: "Europe", status: "occupied", gov: "occupied",
    system: "Federal Republic of Germany: parliamentary democracy under the Occupation Statute",
    hos: "Federal President Theodor Heuss is ceremonial. The Chancellor governs, subject to the Allied High Commission.",
    how: [
        "The Chancellor is elected by the Bundestag. You won by a single vote: your own.",
        "The 'constructive vote of no confidence' means parliament can only remove you by electing a successor at the same time. That makes you harder to topple.",
        "The Bundesrat represents the states (Länder), which run schools, police and much of the administration.",
        "The American, British and French High Commissioners still hold reserved powers over foreign affairs, the Ruhr and security. You have no army.",
        "Germany is divided. The Soviet zone has become the German Democratic Republic, and Berlin is an island inside it."
    ],
    leader: { name: "Konrad Adenauer", age: 74, title: "Federal Chancellor", party: "cdu" },
    leg: { name: "Bundestag", detail: "402 seats, mixed system", system: "pr" },
    parties: [
        P("cdu", "CDU/CSU (Christian Democrats)", "conservative", 139, true, "A new cross-confessional party of Catholics and Protestants: social market economy and Western integration.",
            [F("CDU", 0.75, "conservative", "Adenauer's Rhineland Christian democrats."), F("CSU (Bavaria)", 0.25, "traditionalist", "The Bavarian sister party: more Catholic, more conservative, very independent.")]),
        P("fdp", "FDP (Free Democrats)", "liberal", 52, true, "Liberals and some nationalists. Your coalition partner, and the free-market conscience."),
        P("dp", "German Party (DP)", "conservative", 17, true, "Lower Saxon conservatives in your coalition."),
        P("spd", "SPD (Social Democrats)", "socdem", 131, false, "Kurt Schumacher's party: socialist, anti-communist, insisting on unity before Western integration."),
        P("kpd", "Communist Party (KPD)", "communist", 15, false, "Moscow's voice in the West. Banned in 1956."),
        P("oth", "Bavaria Party & others", "traditionalist", 48, false, "Bavarian separatists, refugee parties, Centre Party.")
    ],
    term: { next: [1953, 9] },
    regions: [
        R("Ruhr & Rhineland", 30, { cdu: 2, spd: 0 }, ["industrial", "mining"], "Coal and steel, under Allied control."),
        R("Bavaria", 18, { cdu: 6, spd: -6 }, ["agrarian", "religious"], "Catholic, conservative and proud."),
        R("North (Hamburg, Lower Saxony)", 24, { cdu: -5, spd: 5 }, ["industrial", "coast"], "Ports, shipyards, Protestant, SPD."),
        R("Southwest (Baden-Württemberg, Hesse)", 24, { cdu: 0 }, ["industrial"], "Engineering, cars and inventive small firms."),
        R("West Berlin", 4, { cdu: -6, spd: 6 }, ["divided"], "Besieged in 1948–49 and still the front line.")
    ],
    econ: { gdp: 23, pop: 50, growth: 7.5, taxCap: 0.9, corruption: 10, debt: 20,
            inds: { agriculture: 10, mining: 5, textiles: 5, steel: 7, machinery: 9, chemicals: 6, shipbuilding: 1.5, autos: 3, electronics: 1, finance: 3, tourism: 1 } },
    res: ["minerals", "coast"],
    dev: { tech: 78, lit: 99, uni: 3, urban: 70 },
    mil: { base: 45, nukes: 0, prog: 0, noArmy: true },
    s: { stability: 60, liberty: 75, legitimacy: 60, prestige: 25 },
    align: 80, blocs: [], preset: "west",
    pol: { economy: "market", military: "minimal_mil", draft: "volunteer", welfare: "safety", tax: "moderate" },
    pillarNames: { occupation: "Allied High Commission", party: "CDU/CSU caucus", coalition: "FDP & DP partners", labor: "DGB unions" },
    strengths: ["Skilled workforce and engineering tradition", "Ludwig Erhard's currency reform has unleashed growth", "Marshall Plan aid and American backing"],
    weaknesses: ["Divided country with 8 million expellees and refugees", "No army, limited sovereignty", "The shadow of the Nazi past"],
    goals: [
        goal("Economic miracle", "Become Europe's largest economy.", g => g.econ.gdp > Math.max(g.nations.uk.gdp, g.nations.france.gdp)),
        goal("Sovereignty and NATO", "End the occupation and join NATO.", g => g.gov.type !== "occupied" && g.blocs.nato.includes(g.ck)),
        goal("Reunification", "Reunite Germany.", g => !!g.flags.reunified)
    ],
    blurb: "Five years ago Germany was rubble. Today the shops are full again, and you lead a democracy that the Allies still do not fully trust. Your coalition holds by a handful of votes. The Russians are 150 kilometers from the Rhine.",
    drama: ["The Allies dismantle factories and control the Ruhr.", "The SPD accuses you of trading unity for Western approval.", "8 million refugees from the East need homes and work."],
    names: "german",
    hist: [[1963, 10, "Ludwig Erhard"], [1966, 12, "Kurt Georg Kiesinger"], [1969, 10, "Willy Brandt"], [1974, 5, "Helmut Schmidt"], [1982, 10, "Helmut Kohl"]]
},

japan: {
    name: "Japan", flag: "🇯🇵", tier: "major", area: "Asia", status: "occupied", gov: "occupied",
    system: "Constitutional monarchy under Allied occupation",
    hos: "Emperor Hirohito is 'the symbol of the State' with no political power. The Prime Minister governs, under General MacArthur.",
    how: [
        "The 1947 constitution, drafted by MacArthur's staff, created a parliamentary democracy. The Diet chooses the Prime Minister.",
        "The House of Representatives (466 seats) can pass a no-confidence motion. You can dissolve it and call an election.",
        "Article 9 renounces war and forbids armed forces. Any change needs a two-thirds Diet vote and a referendum.",
        "SCAP (the Supreme Commander for the Allied Powers) can overrule your government until a peace treaty takes effect.",
        "Zaibatsu conglomerates are being broken up, land reform has given farmers their fields, and unions are legal."
    ],
    leader: { name: "Shigeru Yoshida", age: 71, title: "Prime Minister", party: "dlp" },
    leg: { name: "National Diet", detail: "House of Representatives, 466 seats", system: "fptp" },
    parties: [
        P("dlp", "Democratic Liberal Party", "conservative", 264, true, "Yoshida's conservatives: ex-bureaucrats, business, farmers. The future core of the LDP."),
        P("dem", "Democratic Party", "liberal", 69, false, "Rival conservatives, some purged pre-war politicians waiting to return."),
        P("jsp", "Japan Socialist Party", "socialist", 48, false, "Pacifists and unionists, soon to split into left and right."),
        P("jcp", "Japanese Communist Party", "communist", 35, false, "Just ordered by Moscow to turn militant. SCAP is about to purge its leaders."),
        P("oth", "Others", "liberal", 50, false, "Independents and minor parties.")
    ],
    term: { next: [1953, 1] },
    regions: [
        R("Kanto (Tokyo)", 25, { dlp: -2 }, ["finance", "industrial"], "The capital, rebuilt from firebombing."),
        R("Kansai (Osaka)", 18, { dlp: -1 }, ["industrial", "textiles"], "Merchants and mills."),
        R("Chubu (Nagoya)", 15, { dlp: 2 }, ["industrial"], "Machine shops and a future auto industry."),
        R("Kyushu", 15, { dlp: 1 }, ["mining", "industrial"], "Coal mines and steel, plus Nagasaki."),
        R("Tohoku & Hokkaido", 27, { dlp: 5 }, ["agrarian"], "Rice farmers: newly landowners, newly conservative.")
    ],
    econ: { gdp: 11, pop: 83, growth: 8.5, taxCap: 0.85, corruption: 22, debt: 15,
            inds: { agriculture: 23, mining: 3, textiles: 8, steel: 4, machinery: 4, chemicals: 3, shipbuilding: 1.5, autos: 0.3, electronics: 0.5, finance: 3, tourism: 0.5 } },
    res: ["coast", "tourism"],
    dev: { tech: 60, lit: 97, uni: 2, urban: 37 },
    mil: { base: 30, nukes: 0, prog: 0, noArmy: true },
    s: { stability: 55, liberty: 65, legitimacy: 55, prestige: 15 },
    align: 70, blocs: [], preset: "west",
    pol: { military: "minimal_mil", draft: "volunteer", land: "reform", economy: "mixed", trade: "protection" },
    pillarNames: { occupation: "SCAP (MacArthur)", business: "Business federations (Keidanren)", labor: "Sōhyō unions" },
    strengths: ["Disciplined, educated workforce", "Strong industrial base under the rubble", "MITI bureaucrats with a plan for growth"],
    weaknesses: ["No sovereignty and no army", "Few natural resources: everything must be imported", "Deflation and unemployment from the Dodge Line austerity"],
    goals: [
        goal("Restore sovereignty", "End the occupation.", g => g.gov.type !== "occupied"),
        goal("Income doubling", "Double the size of the economy.", g => g.econ.gdp >= g.econ.gdp0 * 2),
        goal("Export powerhouse", "Autos and electronics reach 8% of GDP.", g => indShare("autos") + indShare("electronics") >= 8)
    ],
    blurb: "Defeated, occupied and hungry, Japan is nonetheless rebuilding faster than anyone predicted. You are a prewar diplomat who opposed the war, and you have one goal: get the Americans out of your government while keeping them in your harbors.",
    drama: ["MacArthur still has the final word on everything.", "The Dodge Line austerity is causing bankruptcies and strikes.", "A peace treaty is being discussed in Washington, but without the Soviets."],
    names: "japanese",
    hist: [[1954, 12, "Ichirō Hatoyama"], [1956, 12, "Tanzan Ishibashi"], [1957, 2, "Nobusuke Kishi"], [1960, 7, "Hayato Ikeda"], [1964, 11, "Eisaku Satō"], [1972, 7, "Kakuei Tanaka"], [1974, 12, "Takeo Miki"], [1976, 12, "Takeo Fukuda"], [1978, 12, "Masayoshi Ōhira"], [1980, 7, "Zenkō Suzuki"], [1982, 11, "Yasuhiro Nakasone"], [1987, 11, "Noboru Takeshita"], [1989, 8, "Toshiki Kaifu"]]
},

brazil: {
    name: "Brazil", flag: "🇧🇷", tier: "major", area: "Americas", status: "sovereign", gov: "presidential",
    system: "Federal presidential republic (1946 constitution)",
    hos: "The President is head of state and government, elected directly for a 5-year term.",
    how: [
        "The President cannot run for immediate re-election.",
        "Congress has a Chamber of Deputies and a Senate. Your PSD party leads, but needs allies.",
        "Illiterate citizens (about half of adults) cannot vote.",
        "The army sees itself as the nation's 'moderating power' and has removed presidents before, including Vargas in 1945.",
        "Getúlio Vargas, the populist ex-dictator, is campaigning to return in October's election."
    ],
    leader: { name: "Eurico Gaspar Dutra", age: 66, title: "President", party: "psd" },
    leg: { name: "National Congress", detail: "Chamber 304 + Senate 63", system: "pr" },
    parties: [
        P("psd", "PSD (Social Democratic Party)", "conservative", 151, true, "Despite the name, the party of rural bosses and state machines built under Vargas."),
        P("udn", "UDN (National Democratic Union)", "liberal", 87, true, "Anti-Vargas liberals of the urban middle class, in your 'interparty agreement'."),
        P("ptb", "PTB (Brazilian Labor Party)", "nationalist", 51, false, "Vargas's labor party: unions, nationalism, the urban poor."),
        P("psp", "PSP (Social Progressive Party)", "nationalist", 26, false, "Adhemar de Barros's São Paulo populists."),
        P("oth", "Others", "conservative", 52, false, "Republicans, Christian democrats and regional parties.")
    ],
    term: { years: 5, limit: 1, served: 1, ends: [1951, 1], next: [1950, 10] },
    regions: [
        R("São Paulo", 18, { psd: -4 }, ["industrial"], "Coffee money turning into factories."),
        R("Rio & Minas Gerais", 25, { psd: 4 }, ["finance", "mining"], "The capital and the iron mountains."),
        R("Northeast", 35, { psd: 3 }, ["agrarian", "poor"], "Drought, sugar estates and landless migrants."),
        R("South", 15, { psd: -2 }, ["agrarian"], "Gaúcho ranchers and immigrant farmers: Vargas's home."),
        R("Center-West & Amazon", 7, { psd: 2 }, ["frontier"], "Almost empty. A capital may be built here someday.")
    ],
    econ: { gdp: 12, pop: 54, growth: 6, taxCap: 0.6, corruption: 35, debt: 15,
            inds: { agriculture: 27, mining: 2, oil: 0.2, textiles: 6, steel: 1.5, machinery: 1, chemicals: 1, autos: 0.2, finance: 3, tourism: 0.5 } },
    res: ["minerals", "coast", "tourism"],
    dev: { tech: 35, lit: 49, uni: 0.7, urban: 36 },
    mil: { base: 15, nukes: 0, prog: 0 },
    s: { stability: 55, liberty: 55, legitimacy: 60, prestige: 40 },
    align: 50, blocs: [], preset: "developing",
    pol: { trade: "protection", press: "free", labor: "state_unions" },
    pillarNames: { military: "The Army ('moderating power')", business: "Paulista industrialists", labor: "Unions (Vargas's base)" },
    strengths: ["Vast land, minerals and hydropower", "Fast-growing industry in São Paulo", "No external enemies"],
    weaknesses: ["Half the population cannot read or vote", "Extreme regional inequality", "An army that intervenes in politics"],
    goals: [
        goal("Fifty years in five", "Reach the 'Industrializing' stage.", g => g.dev.ind >= 35),
        goal("O petróleo é nosso", "Create a national oil industry.", g => g.pol.resources === "nationalized" && g.ind.oil.out > g.ind.oil.out0 * 3),
        goal("A democracy that lasts", "Avoid any military coup through 1970.", g => g.year >= 1970 && !g.flags.coup_suffered)
    ],
    blurb: "You are a general who became a constitutional president, and you have kept your promise to respect the 1946 constitution. It forbids you a second term. The man you helped overthrow in 1945, Getúlio Vargas, is coming back, and he is very popular.",
    drama: ["You cannot run in October's election.", "Vargas is campaigning on nationalism and workers' rights.", "Inflation is creeping up as coffee prices boom."],
    names: "iberian",
    hist: [[1951, 1, "Getúlio Vargas"], [1954, 8, "Café Filho"], [1956, 1, "Juscelino Kubitschek"], [1961, 1, "Jânio Quadros"], [1961, 9, "João Goulart"], [1964, 4, "Humberto Castelo Branco", "military_junta"], [1967, 3, "Artur da Costa e Silva"], [1969, 10, "Emílio Médici"], [1974, 3, "Ernesto Geisel"], [1979, 3, "João Figueiredo"], [1985, 3, "José Sarney", "presidential"], [1990, 3, "Fernando Collor"]]
},

// ═══════════════════ REGIONAL HEAVYWEIGHTS ═══════════════════

canada: {
    name: "Canada", flag: "🇨🇦", tier: "regional", area: "Americas", status: "sovereign", gov: "parliamentary",
    system: "Constitutional monarchy, federal Westminster parliament",
    hos: "King George VI, represented by the Governor General, is head of state. The Prime Minister governs.",
    how: [
        "The Prime Minister needs the confidence of the House of Commons (262 seats, first-past-the-post).",
        "The Senate is appointed for life and rarely blocks anything.",
        "Provinces have powerful governments of their own. Quebec guards its language, Catholic church and autonomy.",
        "You can call an election at any time within 5 years."
    ],
    leader: { name: "Louis St. Laurent", age: 67, title: "Prime Minister", party: "lib" },
    leg: { name: "House of Commons", detail: "262 seats", system: "fptp" },
    parties: [
        P("lib", "Liberal Party", "liberal", 190, true, "'The natural governing party': bilingual, business-friendly, in power since 1935."),
        P("pc", "Progressive Conservatives", "conservative", 41, false, "Anglo-Protestant Ontario and the Prairies. Waiting for a leader."),
        P("ccf", "CCF (Co-operative Commonwealth Federation)", "socdem", 13, false, "Prairie democratic socialists. Governing Saskatchewan and pioneering public health insurance."),
        P("sc", "Social Credit", "conservative", 10, false, "Alberta populists with unusual monetary theories."),
        P("oth", "Others", "liberal", 8, false, "Independents and Quebec nationalists.")
    ],
    term: { next: [1953, 8] },
    regions: [
        R("Ontario", 33, { lib: 0 }, ["industrial", "finance"], "Toronto, factories and Anglo establishment."),
        R("Quebec", 29, { lib: 10 }, ["religious", "industrial"], "Francophone, Catholic, ruled provincially by Duplessis."),
        R("Prairies", 18, { lib: -6 }, ["agrarian", "oil"], "Wheat, Alberta oil since 1947, and farmer radicalism."),
        R("British Columbia", 8, { lib: -2 }, ["minerals"], "Forests, mines and the Pacific."),
        R("Atlantic", 12, { lib: 4 }, ["coast"], "Fisheries and Newfoundland, which joined Canada last year.")
    ],
    econ: { gdp: 18, pop: 14, growth: 4.5, taxCap: 0.95, corruption: 12, debt: 80,
            inds: { agriculture: 12, mining: 5, oil: 1.5, textiles: 2, steel: 3, machinery: 4, chemicals: 2, shipbuilding: 0.5, autos: 3, aerospace: 1, finance: 5, tourism: 1.5 } },
    res: ["oil", "minerals", "coast", "tourism"],
    dev: { tech: 78, lit: 97, uni: 4, urban: 61 },
    mil: { base: 15, nukes: 0, prog: 0 },
    s: { stability: 78, liberty: 85, legitimacy: 85, prestige: 55 },
    align: 85, blocs: ["nato", "commonwealth"], preset: "west",
    pol: { science: "universities" },
    pillarNames: { coalition: "Quebec Liberals", tribes: "Provincial premiers" },
    strengths: ["Resource wealth: wheat, nickel, uranium, oil", "Stable politics and a respected diplomatic corps", "Next door to the US market"],
    weaknesses: ["Dependence on the American economy", "Quebec's grievances", "A small population in a huge territory"],
    goals: [
        goal("Medicare", "Create national health insurance or a national health service.", g => lawOn("nhi") || lawOn("nhs")),
        goal("Peacekeeper", "Reach a prestige of 70 as a middle power.", g => g.s.prestige >= 70),
        goal("Keep Quebec", "Keep Quebec in Canada through 1980.", g => g.year >= 1980 && !g.flags.quebec_gone)
    ],
    blurb: "Canada came out of the war with the world's fourth-largest air force, a booming economy and a new province, Newfoundland. You are a bilingual Quebec lawyer leading a party that has governed for 15 years. The opportunity is enormous; so is the American shadow.",
    drama: ["NATO, which you helped found, needs Canadian troops in Europe.", "The St. Lawrence Seaway project is stalled in the US Congress.", "Quebec's Duplessis fights Ottawa's every move."],
    names: "anglo",
    hist: [[1957, 6, "John Diefenbaker"], [1963, 4, "Lester B. Pearson"], [1968, 4, "Pierre Trudeau"], [1979, 6, "Joe Clark"], [1980, 3, "Pierre Trudeau"], [1984, 9, "Brian Mulroney"]]
},

australia: {
    name: "Australia", flag: "🇦🇺", tier: "regional", area: "Oceania", status: "sovereign", gov: "parliamentary",
    system: "Constitutional monarchy, federal parliament",
    hos: "King George VI, represented by the Governor-General, is head of state. The Prime Minister governs.",
    how: [
        "The Prime Minister needs a majority in the House of Representatives (121 seats, preferential voting). Voting is compulsory.",
        "The Senate is elected and powerful. In 1950 Labor controls it and can block your bills; deadlock can trigger a 'double dissolution' election of both houses.",
        "The six states run their own affairs.",
        "The Governor-General has reserve powers, including (as 1975 will show) dismissing a Prime Minister."
    ],
    leader: { name: "Robert Menzies", age: 55, title: "Prime Minister", party: "lpa" },
    leg: { name: "House of Representatives", detail: "121 seats", system: "fptp" },
    parties: [
        P("lpa", "Liberal Party", "conservative", 55, true, "Menzies's new centre-right party, founded in 1944 for 'the forgotten people'."),
        P("cp", "Country Party", "conservative", 19, true, "Farmers' party and your permanent coalition partner."),
        P("alp", "Australian Labor Party", "socdem", 47, false, "Chifley's party, just ousted after nationalizing airlines and trying to nationalize banks.")
    ],
    term: { next: [1952, 12] },
    regions: [
        R("New South Wales", 37, { lpa: -2 }, ["industrial", "finance"], "Sydney, coal and steel."),
        R("Victoria", 28, { lpa: 3 }, ["industrial"], "Melbourne: Menzies's home and the factory belt."),
        R("Queensland", 14, { lpa: 2 }, ["agrarian", "minerals"], "Sugar, cattle and Labor-voting unions."),
        R("Western Australia", 7, { lpa: 2 }, ["minerals"], "Gold, and iron ore not yet discovered."),
        R("South Australia & Tasmania", 14, { lpa: 1 }, ["agrarian"], "Wheat, wine and Hydro dams.")
    ],
    econ: { gdp: 10, pop: 8.2, growth: 4, taxCap: 0.95, corruption: 10, debt: 80,
            inds: { agriculture: 18, mining: 5, textiles: 2, steel: 3, machinery: 3, chemicals: 1.5, autos: 1, finance: 4, tourism: 1 } },
    res: ["minerals", "coast", "tourism"],
    dev: { tech: 75, lit: 97, uni: 3, urban: 69 },
    mil: { base: 12, nukes: 0, prog: 0 },
    s: { stability: 78, liberty: 80, legitimacy: 82, prestige: 45 },
    align: 85, blocs: ["commonwealth"], preset: "west",
    pol: { trade: "protection", rights: "segregation" },
    optNames: { segregation: "White Australia policy" },
    pillarNames: { coalition: "Country Party", labor: "ACTU unions", tribes: "State premiers" },
    strengths: ["Wool, wheat and mineral wealth", "A booming immigration program", "Stable democracy"],
    weaknesses: ["Small population far from allies", "Labor's Senate majority blocks your agenda", "The White Australia policy isolates you in Asia"],
    goals: [
        goal("Populate or perish", "Reach a population of 13 million.", g => g.econ.pop >= 13),
        goal("ANZUS", "Sign a security pact with the United States.", g => g.blocs.anzus.includes(g.ck)),
        goal("End White Australia", "Replace discriminatory immigration with equal rights.", g => g.pol.rights === "equal")
    ],
    blurb: "You came back from political death to win last December's election, promising to free Australia from Labor's controls. The wool boom is coming and the immigrant ships are full. But Asia is in revolution, and Labor's Senate majority will block you at every turn.",
    drama: ["You promised to ban the Communist Party.", "Labor controls the Senate.", "Britain can no longer defend Australia. America might."],
    names: "anglo",
    hist: [[1966, 1, "Harold Holt"], [1968, 1, "John Gorton"], [1971, 3, "William McMahon"], [1972, 12, "Gough Whitlam"], [1975, 11, "Malcolm Fraser"], [1983, 3, "Bob Hawke"]]
},

southkorea: {
    name: "South Korea", flag: "🇰🇷", tier: "regional", area: "Asia", status: "sovereign", gov: "presidential",
    system: "Republic of Korea: presidential republic (1948 constitution)",
    hos: "The President is head of state and government, chosen by the National Assembly.",
    how: [
        "Under the 1948 constitution the National Assembly (210 seats) elects the President for 4 years.",
        "Rhee wants direct popular election, which he would win, and the Assembly resists.",
        "The President controls the police, appoints the cabinet and can declare martial law.",
        "American advisers and aid keep the state afloat. US combat troops left in 1949.",
        "North Korea, armed by Stalin, has a far stronger army."
    ],
    leader: { name: "Syngman Rhee", age: 74, title: "President", party: "knp" },
    leg: { name: "National Assembly", detail: "210 seats (May 1950)", system: "fptp" },
    parties: [
        P("knp", "Rhee loyalists (Korea Nationalist Party)", "nationalist", 57, true, "Rhee's supporters. They become the Liberal Party in 1951."),
        P("dnp", "Democratic Nationalist Party", "conservative", 24, false, "Landlord conservatives who once backed Rhee and now want a parliamentary system."),
        P("ind", "Independents", "liberal", 129, false, "Mostly anti-Rhee independents elected in May 1950.")
    ],
    term: { years: 4, limit: 2, served: 1, ends: [1952, 8], next: [1952, 8], legEvery: 4, legNext: [1954, 5] },
    regions: [
        R("Seoul & Gyeonggi", 25, { knp: -3 }, ["industrial"], "The capital, 50 km from the border."),
        R("Gyeongsang (Southeast)", 35, { knp: 5 }, ["agrarian", "coast"], "Busan port and conservative villages."),
        R("Jeolla (Southwest)", 25, { knp: -6 }, ["agrarian"], "Rice country, tenant grievances, leftist guerrillas."),
        R("Chungcheong & Gangwon", 15, { knp: 2 }, ["agrarian"], "The center and the mountain border.")
    ],
    econ: { gdp: 1.6, pop: 20, growth: 3, taxCap: 0.4, corruption: 45, debt: 20,
            inds: { agriculture: 45, mining: 2, textiles: 4, finance: 1 } },
    res: ["coast"],
    dev: { tech: 25, lit: 30, uni: 0.5, urban: 20 },
    mil: { base: 8, nukes: 0, prog: 0 },
    s: { stability: 35, liberty: 35, legitimacy: 45, prestige: 15 },
    align: 90, blocs: [], preset: "developing",
    pol: { land: "reform", security: "political" },
    pillarNames: { military: "ROK Army", foreign: "US advisers", party: "Rhee loyalists" },
    strengths: ["American protection, if Washington chooses to give it", "A hard-working, newly land-owning peasantry", "Fierce anti-communist nationalism"],
    weaknesses: ["Army outgunned by the North: no tanks, no air force", "Poverty and rampant corruption", "A hostile Assembly and an autocratic president"],
    goals: [
        goal("Survive", "Still be sovereign in 1955.", g => g.year >= 1955),
        goal("Miracle on the Han", "Reach the 'Industrial' stage.", g => g.dev.ind >= 60),
        goal("Unify Korea", "Reunify the peninsula.", g => !!g.flags.korea_unified)
    ],
    blurb: "You spent 35 years in exile fighting for Korean independence. Now you rule half a country, the poorer half, and across the 38th parallel Kim Il-sung has Soviet tanks and Stalin's ear. The Americans have said Korea is outside their defense perimeter.",
    drama: ["North Korea has 150 Soviet T-34 tanks. You have none.", "Your opponents won the May 1950 Assembly elections.", "Leftist guerrillas operate in the southern mountains."],
    names: "chinese",
    hist: [[1960, 4, "Yun Posun", "parliamentary"], [1961, 5, "Park Chung-hee", "military_junta"], [1979, 12, "Chun Doo-hwan"], [1988, 2, "Roh Tae-woo", "presidential"]]
},

mexico: {
    name: "Mexico", flag: "🇲🇽", tier: "regional", area: "Americas", status: "sovereign", gov: "dominant_party",
    system: "Federal presidential republic dominated by the PRI",
    hos: "The President is head of state and government for one six-year term (the sexenio), and can never be re-elected.",
    how: [
        "The Institutional Revolutionary Party (PRI) wins every election: through genuine support, patronage and, when needed, fraud.",
        "Nobody can be re-elected president. As your term ends, you personally choose the PRI's next candidate, who is certain to win. This is el dedazo, 'the finger tap'.",
        "The PRI has three sectors: workers (CTM unions), peasants (CNC) and the 'popular' middle class (CNOP).",
        "Congress approves what the President sends it. Inside the party, the bosses and sectors bargain hard.",
        "Unlike most of Latin America, the military stays out of politics."
    ],
    leader: { name: "Miguel Alemán Valdés", age: 47, title: "President", party: "pri" },
    leg: { name: "Congress of the Union", detail: "Chamber of Deputies, 147 seats", system: "fptp" },
    parties: [
        P("pri", "PRI (Institutional Revolutionary Party)", "nationalist", 142, true, "Heir of the 1910 Revolution and the only party that matters.",
            [F("Alemanistas", 0.5, "conservative", "Your pro-business modernizers: industry, tourism, roads."),
             F("Cardenistas", 0.3, "socialist", "The left of the Revolution: land reform, oil nationalism."),
             F("Sector bosses (CTM, CNC)", 0.2, "nationalist", "Fidel Velázquez's unions and the peasant leagues.")]),
        P("pan", "PAN (National Action Party)", "conservative", 4, false, "Catholic, pro-business opposition."),
        P("pp", "Popular Party", "socialist", 1, false, "Lombardo Toledano's Marxists.")
    ],
    term: { years: 6, limit: 1, served: 1, ends: [1952, 12], next: [1952, 7] },
    regions: [
        R("Mexico City", 20, { pri: 0 }, ["industrial", "finance"], "Growing into a megacity."),
        R("North (Monterrey)", 20, { pri: -4 }, ["industrial"], "Industrialists and PAN's base."),
        R("Bajío & West", 25, { pri: -2 }, ["agrarian", "religious"], "Catholic heartland of the Cristero war."),
        R("South", 25, { pri: 5 }, ["agrarian", "minority"], "Indigenous villages and ejidos."),
        R("Gulf coast", 10, { pri: 3 }, ["oil"], "PEMEX oilfields, nationalized in 1938.")
    ],
    econ: { gdp: 6, pop: 28, growth: 6, taxCap: 0.5, corruption: 45, debt: 15,
            inds: { agriculture: 20, mining: 4, oil: 3, textiles: 5, steel: 1.5, machinery: 1, chemicals: 1, finance: 3, tourism: 2 } },
    res: ["oil", "minerals", "coast", "tourism"],
    dev: { tech: 35, lit: 57, uni: 1, urban: 43 },
    mil: { base: 8, nukes: 0, prog: 0 },
    s: { stability: 65, liberty: 40, legitimacy: 65, prestige: 35 },
    align: 30, blocs: [], preset: "developing",
    pol: { resources: "nationalized", labor: "state_unions", infra: "public", religion: "secular" },
    pillarNames: { party: "PRI machine", labor: "CTM unions", peasants: "CNC peasant leagues" },
    strengths: ["Stable one-party rule: no coups since 1920", "Oil, silver and a long border with America", "Import-substitution industry booming"],
    weaknesses: ["Corruption is the system's grease", "Rural poverty and stalled land reform", "Little room for dissent"],
    goals: [
        goal("The Mexican Miracle", "Double the economy.", g => g.econ.gdp >= g.econ.gdp0 * 2),
        goal("Industrial nation", "Reach the 'Industrializing' stage.", g => g.dev.ind >= 35),
        goal("Democratic opening", "Move to a competitive presidential system.", g => g.gov.type === "presidential")
    ],
    blurb: "You are the first civilian president since the Revolution, a lawyer who believes Mexico's future is in factories, highways and Acapulco hotels. The PRI will do what you say for six years. Then you must pick your successor, and history will judge you by him.",
    drama: ["Your term ends in 1952 and the party is already jockeying over your successor.", "Your friends are getting very rich from government contracts.", "Peasants complain that land reform has stopped."],
    names: "iberian",
    hist: [[1952, 12, "Adolfo Ruiz Cortines"], [1958, 12, "Adolfo López Mateos"], [1964, 12, "Gustavo Díaz Ordaz"], [1970, 12, "Luis Echeverría"], [1976, 12, "José López Portillo"], [1982, 12, "Miguel de la Madrid"], [1988, 12, "Carlos Salinas"]]
},

indonesia: {
    name: "Indonesia", flag: "🇮🇩", tier: "regional", area: "Asia", status: "sovereign", gov: "semi_presidential",
    system: "Republic of the United States of Indonesia, becoming a unitary parliamentary republic in August 1950",
    hos: "President Sukarno is head of state with limited formal power. A prime minister and cabinet answer to parliament.",
    how: [
        "The Dutch transferred sovereignty only last month (December 1949) after four years of war.",
        "Under the 1950 provisional constitution, cabinets need parliament's support, and they fall often: seven in seven years.",
        "As President you appoint the formateur who builds each cabinet, command enormous popular loyalty, and can push the system toward 'Guided Democracy'.",
        "The army, led by officers from the revolution, is a political force of its own.",
        "First national elections are promised but keep being postponed (they come in 1955)."
    ],
    leader: { name: "Sukarno", age: 48, title: "President", party: "pni" },
    leg: { name: "Provisional People's Representative Council", detail: "236 appointed seats", system: "pr" },
    parties: [
        P("pni", "PNI (Indonesian National Party)", "nationalist", 36, true, "The secular nationalist party you founded in 1927: civil servants and Javanese gentry."),
        P("masyumi", "Masyumi", "conservative", 49, true, "Modernist Muslim party, the largest in parliament, strong outside Java."),
        P("psi", "PSI (Socialist Party)", "socdem", 17, false, "Small, Western-educated and influential with intellectuals and the army."),
        P("pki", "PKI (Communist Party)", "communist", 13, false, "Crushed after the 1948 Madiun revolt, now rebuilding fast under Aidit."),
        P("oth", "Regional & minor parties", "liberal", 121, false, "Federalists, Christian parties, and representatives of the former Dutch-created states.")
    ],
    term: { years: null, legEvery: 5, legNext: [1955, 9] },
    regions: [
        R("Java", 65, { pni: 5 }, ["agrarian"], "Two-thirds of the people on 7% of the land."),
        R("Sumatra", 18, { pni: -6 }, ["oil", "minerals"], "Oil and rubber wealth, and resentment of Javanese rule."),
        R("Sulawesi & the East", 12, { pni: -5 }, ["minority"], "Christian Ambon, where a South Moluccan republic has been declared."),
        R("Borneo (Kalimantan)", 5, { pni: -1 }, ["minerals"], "Jungle, timber and few people.")
    ],
    econ: { gdp: 7, pop: 77, growth: 3.5, taxCap: 0.4, corruption: 45, debt: 30,
            inds: { agriculture: 50, mining: 3, oil: 4, textiles: 3, finance: 1, tourism: 0.5 } },
    res: ["oil", "minerals", "coast", "tourism"],
    dev: { tech: 15, lit: 20, uni: 0.2, urban: 12 },
    mil: { base: 15, nukes: 0, prog: 0 },
    s: { stability: 35, liberty: 50, legitimacy: 70, prestige: 35 },
    align: 0, blocs: [], preset: "developing",
    pol: { economy: "mixed", press: "free", religion: "tolerant" },
    pillarNames: { military: "TNI (Army)", party: "PNI", business: "Chinese-Indonesian merchants" },
    strengths: ["Oil, rubber, tin: a resource giant", "Sukarno's charisma and revolutionary prestige", "Fourth largest population on Earth"],
    weaknesses: ["Regional rebellions and Islamist insurgency", "Economy wrecked by occupation and war", "Dutch companies still own much of the economy"],
    goals: [
        goal("Unite the archipelago", "Have no insurgency active in 1960.", g => g.year >= 1960 && !playerAtWarWithRebels()),
        goal("Voice of the new nations", "Host the Bandung Conference and join the non-aligned.", g => g.blocs.nam.includes(g.ck)),
        goal("West Irian", "Bring West New Guinea into Indonesia.", g => !!g.flags.west_irian)
    ],
    blurb: "You declared independence in 1945 with Japanese bayonets still around you, then fought the Dutch for four years. Last month they finally left. Now you preside over 77 million people on 13,000 islands, with a parliament that changes governments like shirts.",
    drama: ["Former Dutch colonial soldiers have declared a Republic of the South Moluccas.", "The federal system the Dutch designed is collapsing into a unitary state.", "Darul Islam rebels want an Islamic state in West Java."],
    names: "malay",
    hist: [[1967, 3, "Suharto", "military_junta"]]
},

turkey: {
    name: "Turkey", flag: "🇹🇷", tier: "regional", area: "Middle East", status: "sovereign", gov: "parliamentary",
    system: "Parliamentary republic in transition from one-party rule",
    hos: "The President, elected by the Grand National Assembly, leads the ruling party. A prime minister heads the cabinet.",
    how: [
        "Atatürk's Republican People's Party (CHP) ruled alone from 1923 until 1946, when you allowed opposition parties.",
        "The Grand National Assembly (465 seats) elects the President and holds the government to account.",
        "May 1950 brings the first genuinely free election, against the new Democrat Party.",
        "The officer corps sees itself as guardian of Atatürk's secular, Western-facing republic. It will intervene if it thinks the republic is in danger."
    ],
    leader: { name: "İsmet İnönü", age: 65, title: "President (CHP chairman)", party: "chp" },
    leg: { name: "Grand National Assembly", detail: "465 seats", system: "fptp" },
    parties: [
        P("chp", "Republican People's Party (CHP)", "nationalist", 395, true, "Atatürk's party: secular, statist, nationalist and elite.",
            [F("Kemalist old guard", 0.6, "nationalist", "Statist and laicist, suspicious of religion and of rivals."),
             F("CHP reformers", 0.4, "liberal", "Accept multiparty democracy and a freer economy.")]),
        P("dp", "Democrat Party (DP)", "conservative", 61, false, "Menderes and Bayar: free enterprise, rural development, respect for Islam. Popular in the villages."),
        P("oth", "Nation Party & independents", "traditionalist", 9, false, "Religious conservatives and others.")
    ],
    term: { next: [1950, 5] },
    regions: [
        R("Istanbul & Marmara", 22, { chp: 0 }, ["industrial", "finance"], "Commerce and the old capital."),
        R("Central Anatolia", 35, { chp: -5 }, ["agrarian", "religious"], "Peasant villages tired of CHP officials."),
        R("Aegean & Mediterranean", 25, { chp: -3 }, ["agrarian", "coast"], "Cotton, tobacco and figs for export."),
        R("East & Southeast", 18, { chp: 3 }, ["minority", "agrarian"], "Kurdish areas run by aghas and the army.")
    ],
    econ: { gdp: 4, pop: 21, growth: 5, taxCap: 0.5, corruption: 30, debt: 20,
            inds: { agriculture: 40, mining: 2, textiles: 5, steel: 1, finance: 1.5, tourism: 0.5 } },
    res: ["minerals", "coast", "tourism"],
    dev: { tech: 30, lit: 33, uni: 0.6, urban: 25 },
    mil: { base: 20, nukes: 0, prog: 0 },
    s: { stability: 60, liberty: 45, legitimacy: 60, prestige: 35 },
    align: 70, blocs: [], preset: "developing",
    pol: { economy: "planned", religion: "secular", security: "political", trade: "protection" },
    pillarNames: { military: "Officer corps (guardians of Kemalism)", party: "CHP organization", peasants: "Anatolian villagers" },
    strengths: ["A large, respected army", "Strategic position on the Straits", "American aid under the Truman Doctrine"],
    weaknesses: ["Poor, rural and 2/3 illiterate", "Soviet claims on the Straits and eastern provinces", "An army that may not accept election results it dislikes"],
    goals: [
        goal("Join NATO", "Enter the Atlantic alliance.", g => g.blocs.nato.includes(g.ck)),
        goal("Industrialize Anatolia", "Reach the 'Industrializing' stage.", g => g.dev.ind >= 35),
        goal("Democracy without tanks", "No coup through 1970.", g => g.year >= 1970 && !g.flags.coup_suffered)
    ],
    blurb: "You were Atatürk's right hand at the front and at the conference table. You kept Turkey out of the Second World War. And you, more than anyone, opened the door to democracy. In May the voters decide whether your party, which has ruled for 27 years, deserves more.",
    drama: ["The first free election is in May.", "Anatolian villagers resent the CHP's heavy-handed secularism.", "Stalin wants bases on the Bosporus."],
    names: "turkish",
    hist: [[1950, 5, "Adnan Menderes"], [1960, 5, "Cemal Gürsel", "military_junta"], [1961, 11, "İsmet İnönü", "parliamentary"], [1965, 10, "Süleyman Demirel"], [1971, 3, "Nihat Erim"], [1974, 1, "Bülent Ecevit"], [1980, 9, "Kenan Evren", "military_junta"], [1983, 12, "Turgut Özal", "parliamentary"]]
},

saudi: {
    name: "Saudi Arabia", flag: "🇸🇦", tier: "regional", area: "Middle East", status: "sovereign", gov: "monarchy",
    system: "Absolute monarchy",
    hos: "The King is head of state and government, Custodian of the Holy Places, and the source of all law under Islam.",
    how: [
        "There is no constitution but the Quran, no parliament and no political parties.",
        "The King rules with the senior princes, his many sons and brothers, who govern provinces and ministries.",
        "The ulema (religious scholars), heirs of the 18th-century alliance with Muhammad ibn Abd al-Wahhab, confer legitimacy.",
        "Bedouin tribes are bound to the throne by subsidies and marriages.",
        "Succession passes among the sons of Ibn Saud. A family council can, and in 1964 will, depose a king."
    ],
    leader: { name: "Abdulaziz ibn Saud", age: 74, title: "King", party: "court" },
    heir: { name: "Crown Prince Saud", age: 48 },
    leg: { name: "Royal Court", detail: "Court factions (by influence)", system: "court" },
    parties: [
        P("court", "House of Saud", "traditionalist", 100, true, "Dozens of sons, brothers and cousins.",
            [F("Crown Prince Saud's circle", 0.35, "traditionalist", "Lavish, generous to the tribes, uninterested in reform."),
             F("Prince Faisal's modernizers", 0.3, "conservative", "Foreign minister Faisal: frugal, pious and determined to build a modern state."),
             F("Senior princes", 0.2, "traditionalist", "The King's brothers and the Sudairi sons."),
             F("Ulema council", 0.15, "traditionalist", "The Al ash-Sheikh family of scholars.")])
    ],
    regions: [
        R("Najd", 35, {}, ["tribal", "religious"], "The Wahhabi heartland and Riyadh."),
        R("Hejaz", 30, {}, ["finance", "tourism"], "Mecca, Medina, Jeddah: pilgrims and merchant families."),
        R("Eastern Province", 20, {}, ["oil", "minority"], "Aramco's oil fields and the Shia minority."),
        R("Asir & South", 15, {}, ["tribal", "agrarian"], "Mountain tribes on the Yemeni border.")
    ],
    econ: { gdp: 1, pop: 3.2, growth: 6, taxCap: 0.3, corruption: 50, debt: 10,
            inds: { agriculture: 20, oil: 35, finance: 1, tourism: 3 } },
    res: ["oil", "coast", "tourism"],
    oilDep: 1,
    dev: { tech: 10, lit: 5, uni: 0.05, urban: 20 },
    mil: { base: 5, nukes: 0, prog: 0 },
    s: { stability: 70, liberty: 10, legitimacy: 85, prestige: 40 },
    align: 60, blocs: [], preset: "monarchy",
    pol: { religion: "theocratic", resources: "concessions" },
    optNames: { theocratic: "Wahhabi Sharia" },
    pillarNames: { clergy: "Ulema", tribes: "Bedouin tribes", business: "Hejazi merchants", military: "National Guard & army" },
    strengths: ["A quarter of the world's known oil", "Guardian of Islam's holiest sites", "American friendship (Aramco, Dhahran air base)"],
    weaknesses: ["Almost no educated people or administration", "Total dependence on one king's personality", "A huge family that expects to be paid"],
    goals: [
        goal("Fifty-fifty", "Win at least a 50/50 profit share from Aramco.", g => g.pol.resources !== "concessions"),
        goal("A modern kingdom", "Reach 50% literacy.", g => g.dev.lit >= 50),
        goal("Lead OPEC", "Join OPEC and keep oil above $10.", g => g.blocs.opec.includes(g.ck) && g.oilPrice >= 5)
    ],
    blurb: "You conquered this kingdom on camelback, oasis by oasis, from 1902 to 1932. Now American engineers pump a river of oil from the eastern sands. You are 74 and in poor health, and your forty-odd sons are watching each other.",
    drama: ["Aramco pays you a fraction of what Venezuela gets for its oil.", "Your heir Saud and his brother Faisal are rivals.", "Bedouin tribes expect their subsidies whether or not the treasury can pay."],
    names: "arabic",
    hist: [[1953, 11, "King Saud"], [1964, 11, "King Faisal"], [1975, 3, "King Khalid"], [1982, 6, "King Fahd"]]
},

nigeria: {
    name: "Nigeria", flag: "🇳🇬", tier: "regional", area: "Africa", status: "colony", gov: "colony", master: "uk", indepDate: [1960, 10],
    system: "British Colony and Protectorate",
    hos: "A British Governor rules on behalf of the Crown. You lead the nationalist movement.",
    how: [
        "The Governor (Sir John Macpherson) controls the budget, police and civil service.",
        "Britain rules through 'indirect rule': the northern emirs and southern chiefs administer their people.",
        "The 1947 constitution created regional Houses of Assembly for the North, West and East, plus a Legislative Council in Lagos.",
        "Constitutional conferences in London will decide each step toward self-government. You must win them.",
        "The three regions have different peoples, religions and interests: Hausa-Fulani Muslims in the North, Yoruba in the West, Igbo in the East. Keeping them together is the hardest problem."
    ],
    leader: { name: "Nnamdi Azikiwe", age: 45, title: "Leader of the NCNC", party: "ncnc" },
    leg: { name: "Legislative Council", detail: "Partly elected, Governor presides", system: "colony" },
    parties: [
        P("ncnc", "NCNC (National Council of Nigeria and the Cameroons)", "nationalist", 40, true, "'Zik's' movement: pan-Nigerian nationalism, strongest among the Igbo and in Lagos."),
        P("ag", "Action Group (forming)", "socdem", 30, false, "Obafemi Awolowo's Yoruba-based party: federalism and free education."),
        P("npc", "Northern People's Congress (forming)", "traditionalist", 30, false, "The emirs' party: the North wants to go slowly, so the South does not dominate it.")
    ],
    regions: [
        R("Northern Region", 55, { ncnc: -10 }, ["agrarian", "religious"], "Muslim emirates, groundnuts and cotton."),
        R("Western Region", 22, { ncnc: -2 }, ["agrarian", "finance"], "Cocoa farmers, Lagos and Yoruba towns."),
        R("Eastern Region", 23, { ncnc: 12 }, ["agrarian"], "Palm oil, Igbo traders, and oil under the delta not yet found.")
    ],
    econ: { gdp: 2, pop: 37, growth: 3.5, taxCap: 0.3, corruption: 35, debt: 5,
            inds: { agriculture: 60, mining: 2, textiles: 1, finance: 0.5 } },
    res: ["minerals", "coast"],
    futureRes: { oil: 1956 },
    dev: { tech: 8, lit: 10, uni: 0.05, urban: 10 },
    mil: { base: 3, nukes: 0, prog: 0 },
    s: { stability: 55, liberty: 35, legitimacy: 40, prestige: 10 },
    align: 30, blocs: [], preset: "colony",
    pillarNames: { colonial: "British Governor", tribes: "Emirs & chiefs", labor: "Unions & students", foreign: "World opinion" },
    strengths: ["Africa's largest population", "Educated southern elites and vigorous press", "Cocoa, palm oil, tin and (soon) oil"],
    weaknesses: ["Three regions that distrust each other", "Very low literacy outside the South", "No institutions of your own yet"],
    goals: [
        goal("Independence", "Win independence for Nigeria.", g => g.gov.type !== "colony"),
        goal("One Nigeria", "Avoid a civil war through 1975.", g => g.year >= 1975 && !g.flags.civil_war),
        goal("Oil for the nation", "Develop oil and keep at least half the profits.", g => g.ind.oil.out > 0.5 && g.pol.resources !== "concessions")
    ],
    blurb: "You came home from America with a journalism degree and a dream: 'to show the light, and the people will find the way'. Your newspapers have made you the most famous African in British West Africa. But the North fears southern domination, and the British are counting on it.",
    drama: ["A new constitution is being negotiated.", "Awolowo is organizing a rival party in the West.", "The Enugu coal miners' strike ended in a massacre last November."],
    names: "african",
    hist: [[1960, 10, "Abubakar Tafawa Balewa"], [1966, 1, "Johnson Aguiyi-Ironsi", "military_junta"], [1966, 7, "Yakubu Gowon"], [1975, 7, "Murtala Mohammed"], [1976, 2, "Olusegun Obasanjo"], [1979, 10, "Shehu Shagari", "presidential"], [1983, 12, "Muhammadu Buhari", "military_junta"], [1985, 8, "Ibrahim Babangida"]]
},

southafrica: {
    name: "South Africa", flag: "🇿🇦", tier: "regional", area: "Africa", status: "sovereign", gov: "parliamentary",
    system: "Union of South Africa: Westminster parliament under the Crown, whites-only democracy",
    hos: "King George VI, represented by a Governor-General, is head of state. The Prime Minister governs.",
    how: [
        "The Prime Minister needs a majority in the House of Assembly (153 seats, first-past-the-post).",
        "Only white citizens vote on the main roll. Coloured voters in the Cape still have a vote your party wants to remove; Black South Africans elect just 3 white 'Native Representatives'.",
        "Rural constituencies are over-represented, which favors your Afrikaner base.",
        "Your National Party won in 1948 promising apartheid: complete racial separation.",
        "The non-white majority (80% of people) has no say in this system. Their resistance, and the world's reaction, is the long-term threat."
    ],
    leader: { name: "Daniel François Malan", age: 75, title: "Prime Minister", party: "np" },
    leg: { name: "House of Assembly", detail: "153 seats (whites-only electorate)", system: "fptp" },
    parties: [
        P("np", "National Party", "nationalist", 70, true, "Afrikaner nationalists: apartheid, a republic, and the Afrikaans language.",
            [F("Cape moderates", 0.4, "conservative", "Malan's own Cape wing: more cautious, more British-tolerant."),
             F("Transvaal hardliners", 0.6, "nationalist", "Strijdom's wing: apartheid now, republic now.")]),
        P("ap", "Afrikaner Party", "nationalist", 9, true, "Your junior partner, soon to merge into the NP."),
        P("up", "United Party", "conservative", 65, false, "Smuts's English-speaking and moderate Afrikaner party, for 'white leadership with justice'."),
        P("lab", "Labour Party", "socdem", 6, false, "White labor, allied with the United Party."),
        P("nat", "Native Representatives", "liberal", 3, false, "Liberal whites elected by Black voters.")
    ],
    term: { next: [1953, 4] },
    regions: [
        R("Transvaal", 40, { np: 4 }, ["mining", "industrial"], "Gold, Johannesburg and Afrikaner Pretoria."),
        R("Cape Province", 32, { np: -3 }, ["agrarian", "coast"], "Cape Town, Coloured voters and liberal tradition."),
        R("Natal", 15, { np: -12 }, ["agrarian", "coast"], "English-speaking and loyal to the Crown."),
        R("Orange Free State", 13, { np: 10 }, ["agrarian", "mining"], "Afrikaner farmland, new goldfields.")
    ],
    econ: { gdp: 4.5, pop: 13.6, growth: 4.5, taxCap: 0.75, corruption: 18, debt: 40,
            inds: { agriculture: 14, mining: 13, textiles: 3, steel: 3, machinery: 2, chemicals: 2, finance: 4, tourism: 1 } },
    res: ["minerals", "coast", "tourism"],
    dev: { tech: 55, lit: 45, uni: 1, urban: 43 },
    mil: { base: 10, nukes: 0, prog: 0 },
    s: { stability: 55, liberty: 30, legitimacy: 45, prestige: 30 },
    align: 70, blocs: ["commonwealth"], preset: "west",
    pol: { rights: "segregation", security: "political", press: "restricted", labor: "restrict", religion: "established" },
    optNames: { segregation: "Apartheid" },
    excluded: true,
    pillarNames: { people: "White electorate", labor: "White unions", tribes: "Homeland chiefs", party: "NP caucus" },
    strengths: ["Gold, diamonds and coal: Africa's richest economy", "Modern infrastructure and army", "Western strategic interest in the Cape route"],
    weaknesses: ["80% of the population excluded and increasingly organized (ANC)", "Growing international condemnation", "English–Afrikaner division among whites"],
    goals: [
        goal("End apartheid peacefully", "Abolish discriminatory laws while keeping stability above 50.", g => g.pol.rights !== "segregation" && g.s.stability >= 50 && g.year >= 1955),
        goal("Republic", "Become a republic.", g => !!g.flags.republic),
        goal("Richest in Africa", "Keep the largest economy in Africa through 1980.", g => g.year >= 1980)
    ],
    blurb: "Your party won in 1948 on a minority of votes and a promise: apartheid. Now your ministers are drafting the laws: racial classification, separate residential areas, the end of the Coloured vote. The majority who cannot vote are watching, and so is the world.",
    drama: ["Your party wants the Population Registration and Group Areas Acts passed this year.", "The ANC Youth League (Mandela, Sisulu, Tambo) has taken over the ANC and plans mass defiance.", "India has raised your treatment of Indians at the UN."],
    names: "afrikaans",
    hist: [[1954, 12, "J. G. Strijdom"], [1958, 9, "Hendrik Verwoerd"], [1966, 9, "B. J. Vorster"], [1978, 9, "P. W. Botha"], [1989, 9, "F. W. de Klerk"]]
},

argentina: {
    name: "Argentina", flag: "🇦🇷", tier: "regional", area: "Americas", status: "sovereign", gov: "presidential",
    system: "Federal presidential republic (1949 Peronist constitution)",
    hos: "The President is head of state and government. Under your 1949 constitution you can be re-elected.",
    how: [
        "The President is elected directly for 6 years. Your new constitution removed the ban on re-election.",
        "Your Peronist party dominates both chambers of Congress. The Radicals (UCR) are a harassed minority.",
        "Peronism rests on the unions (the CGT), the 'descamisados' (shirtless ones), and Eva Perón's charisma and foundation.",
        "The army and the Catholic Church helped bring you to power. Either could bring you down."
    ],
    leader: { name: "Juan Domingo Perón", age: 54, title: "President", party: "pj" },
    leg: { name: "National Congress", detail: "Chamber 158 + Senate 30", system: "fptp" },
    parties: [
        P("pj", "Peronist Party", "nationalist", 160, true, "Justicialismo: social justice, economic independence, political sovereignty.",
            [F("Labor wing (CGT)", 0.5, "socialist", "The union bosses who mobilized October 17, 1945."),
             F("Political wing", 0.5, "nationalist", "Provincial caudillos, officers and ex-conservatives.")]),
        P("ucr", "UCR (Radical Civic Union)", "liberal", 28, false, "Middle-class democrats. Balbín and Frondizi lead a persecuted opposition.")
    ],
    term: { years: 6, limit: null, served: 1, ends: [1952, 6], next: [1951, 11] },
    regions: [
        R("Buenos Aires (city)", 20, { pj: 0 }, ["industrial", "finance"], "Workers, the middle class and the oligarchy's mansions."),
        R("Greater Buenos Aires province", 25, { pj: 10 }, ["industrial"], "Factory suburbs: Peronist heartland."),
        R("Pampas interior", 30, { pj: -6 }, ["agrarian"], "Estancias, beef and wheat, and their owners hate you."),
        R("North & Patagonia", 25, { pj: 6 }, ["agrarian", "oil"], "Poor provinces, sugar, and YPF oil.")
    ],
    econ: { gdp: 8, pop: 17, growth: 2, taxCap: 0.7, corruption: 35, debt: 20,
            inds: { agriculture: 18, mining: 1, oil: 1, textiles: 6, steel: 1, machinery: 3, chemicals: 2, autos: 0.3, finance: 4, tourism: 1 } },
    res: ["oil", "minerals", "coast", "tourism"],
    dev: { tech: 50, lit: 87, uni: 2, urban: 62 },
    mil: { base: 18, nukes: 0, prog: 0 },
    s: { stability: 60, liberty: 40, legitimacy: 65, prestige: 45 },
    align: 10, blocs: [], preset: "developing",
    pol: { economy: "planned", tax: "high", welfare: "welfare", labor: "state_unions", trade: "protection", resources: "nationalized", press: "restricted", education: "expanded" },
    pillarNames: { labor: "CGT unions", clergy: "Catholic Church", business: "Rural oligarchy (Sociedad Rural)" },
    strengths: ["Rich farmland: breadbasket and beef exporter", "Educated, urban population", "Huge gold reserves from wartime exports, though they are running out"],
    weaknesses: ["Inflation and falling export earnings", "Bitter polarization between Peronists and anti-Peronists", "An army that has staged coups before"],
    goals: [
        goal("Economic independence", "Reach the 'Industrial' stage.", g => g.dev.ind >= 60),
        goal("Las Malvinas", "Recover the Falkland Islands.", g => !!g.flags.falklands),
        goal("Outlast the generals", "Remain in power through 1960.", g => g.year >= 1960 && g.leader.name.includes("Perón"))
    ],
    blurb: "A colonel who became the champion of the workers, you have given Argentines pensions, paid holidays and pride. With Evita beside you, the descamisados would die for you. The landowners, the Church and half the officer corps would like to see you gone.",
    drama: ["The wartime gold reserves are nearly spent.", "Eva Perón wants to be your vice-president. The army is horrified.", "Opposition newspapers like La Prensa are being squeezed."],
    names: "iberian",
    hist: [[1955, 9, "Pedro Aramburu", "military_junta"], [1958, 5, "Arturo Frondizi", "presidential"], [1962, 3, "José María Guido"], [1963, 10, "Arturo Illia"], [1966, 6, "Juan Carlos Onganía", "military_junta"], [1973, 10, "Juan Perón", "presidential"], [1974, 7, "Isabel Perón"], [1976, 3, "Jorge Videla", "military_junta"], [1981, 12, "Leopoldo Galtieri"], [1983, 12, "Raúl Alfonsín", "presidential"], [1989, 7, "Carlos Menem"]]
}

};
