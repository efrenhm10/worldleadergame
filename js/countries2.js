// ── COUNTRIES (part 2) — wildcards, new additions, and non-playable states ──

Object.assign(COUNTRIES, {

// ═══════════════════ WILDCARDS ═══════════════════

iran: {
    name: "Iran", flag: "🇮🇷", tier: "wildcard", area: "Middle East", status: "sovereign", gov: "monarchy", monarchy: "constitutional",
    system: "Constitutional monarchy (1906 constitution) with a strong Shah",
    hos: "The Shah is head of state and commands the army. A Prime Minister, approved by the Majlis, runs the government.",
    how: [
        "The 1906 constitution says the Shah reigns and the Majlis (parliament, 136 seats) legislates. Your laws need its votes.",
        "You appoint the Prime Minister, but the Majlis must give him a vote of confidence. A strong PM can rival you.",
        "Landlords and tribal chiefs dominate the Majlis. Nationalists, the clergy and the communist Tudeh party (banned) agitate outside it.",
        "The British Anglo-Iranian Oil Company owns Iran's oil and pays Iran less in royalties than it pays London in taxes.",
        "Your father was forced to abdicate by the British and Soviets in 1941. Thrones can be lost."
    ],
    leader: { name: "Mohammad Reza Pahlavi", age: 30, title: "Shah", party: "court" },
    heir: null,
    leg: { name: "Majlis", detail: "136 seats, dominated by landlords", system: "fptp" },
    parties: [
        P("court", "Court royalists", "traditionalist", 60, true, "Deputies who owe their seats to the court and the army."),
        P("land", "Landlord & tribal deputies", "conservative", 40, true, "The great families. Loyal as long as land reform stays a slogan."),
        P("nf", "National Front (Mossadegh)", "nationalist", 8, false, "Few seats, enormous street power. Their demand: nationalize the oil."),
        P("cler", "Clerical bloc (Kashani)", "traditionalist", 12, false, "Ayatollah Kashani's followers: anti-British, anti-communist and unpredictable."),
        P("ind", "Independents", "liberal", 16, false, "Liberal notables and reformers.")
    ],
    term: { legEvery: 2, legNext: [1952, 2] },
    regions: [
        R("Tehran", 15, { court: -5 }, ["industrial", "finance"], "Bazaar merchants, students and intellectuals."),
        R("Khuzestan", 10, { court: 0 }, ["oil"], "Abadan, the world's largest refinery, run by the British."),
        R("Azerbaijan & Kurdistan", 25, { court: -2 }, ["minority"], "Where the Soviets backed separatist republics in 1946."),
        R("Rural heartland", 50, { court: 5 }, ["agrarian", "religious"], "Peasants under landlords, mullahs in every village.")
    ],
    econ: { gdp: 2.5, pop: 17, growth: 4, taxCap: 0.35, corruption: 50, debt: 10,
            inds: { agriculture: 35, oil: 15, textiles: 3, finance: 1, tourism: 0.5 } },
    res: ["oil", "minerals", "coast", "tourism"],
    oilDep: 0.8,
    dev: { tech: 20, lit: 15, uni: 0.3, urban: 27 },
    mil: { base: 12, nukes: 0, prog: 0 },
    s: { stability: 45, liberty: 30, legitimacy: 50, prestige: 25 },
    align: 50, blocs: [], preset: "monarchy",
    pol: { religion: "established", press: "restricted", draft: "conscription" },
    pillarNames: { clergy: "Shia clergy (ulema)", tribes: "Landlords & tribal khans", business: "Bazaar merchants", military: "Imperial army", foreign: "British & Americans" },
    strengths: ["Huge oil reserves", "A strategic prize both superpowers want", "An ancient national identity"],
    weaknesses: ["Foreign control of the oil", "Feudal landholding and mass poverty", "A young Shah not yet in command of his own country"],
    goals: [
        goal("Iran's oil for Iranians", "Nationalize the oil industry.", g => g.pol.resources === "nationalized"),
        goal("White Revolution", "Land reform and 50% literacy.", g => g.pol.land === "reform" && g.dev.lit >= 50),
        goal("Peacock throne", "Keep the throne through 1980.", g => g.year >= 1980 && g.gov.type === "monarchy")
    ],
    blurb: "You were 21 when the Allies exiled your father and put you on the throne. You survived an assassin's bullets last year. Now the Majlis is debating the oil concession, the streets are chanting Mossadegh's name, and London expects you to keep things as they are.",
    drama: ["The National Front demands the oil be nationalized.", "Your prime minister, General Razmara, is unpopular and threatened.", "The Tudeh party is underground but growing."],
    names: "persian",
    hist: [[1979, 2, "Ruhollah Khomeini", "one_party"]]
},

israel: {
    name: "Israel", flag: "🇮🇱", tier: "wildcard", area: "Middle East", status: "sovereign", gov: "parliamentary",
    system: "Parliamentary democracy, pure proportional representation",
    hos: "President Chaim Weizmann is ceremonial. The Prime Minister governs.",
    how: [
        "There is no written constitution, only 'Basic Laws' to come. The Knesset (120 seats) is sovereign.",
        "Seats are allocated in near-perfect proportion to votes, so no party ever wins a majority. Every government is a coalition.",
        "Religious parties trade their votes for control of marriage, Sabbath laws and religious schools.",
        "The Histadrut labor federation, which Mapai controls, owns a huge share of the economy and runs the health system.",
        "The 1949 armistice lines with Egypt, Jordan, Syria and Lebanon are not peace. No neighbor recognizes you."
    ],
    leader: { name: "David Ben-Gurion", age: 63, title: "Prime Minister", party: "mapai" },
    leg: { name: "Knesset", detail: "120 seats, proportional", system: "pr" },
    parties: [
        P("mapai", "Mapai (Workers' Party)", "socdem", 46, true, "Ben-Gurion's party: Labor Zionism, the Histadrut, the kibbutzim."),
        P("urf", "United Religious Front", "traditionalist", 16, true, "Orthodox parties, your key coalition partner."),
        P("prog", "Progressive Party", "liberal", 5, true, "Liberal Central European immigrants."),
        P("seph", "Sephardim & Oriental Communities", "conservative", 4, true, "Representing long-established Middle Eastern Jews."),
        P("mapam", "Mapam", "socialist", 19, false, "Left-wing kibbutz socialists, pro-Soviet."),
        P("herut", "Herut", "nationalist", 14, false, "Menachem Begin's right-wing nationalists, heirs of the Irgun."),
        P("gz", "General Zionists", "liberal", 7, false, "Middle-class free-marketeers."),
        P("oth", "Maki (Communists) & others", "communist", 9, false, "Communists and Arab lists.")
    ],
    term: { next: [1951, 7] },
    regions: [
        R("Tel Aviv & coastal plain", 45, { mapai: 0 }, ["industrial", "finance"], "The bustling, secular heart."),
        R("Jerusalem", 12, { mapai: -6 }, ["religious"], "Divided city, Orthodox quarters."),
        R("Haifa & Galilee", 25, { mapai: 4 }, ["industrial", "minority"], "Port, refinery, and Arab citizens under military rule."),
        R("Negev & development towns", 18, { mapai: 2 }, ["frontier"], "Transit camps for new immigrants.")
    ],
    econ: { gdp: 1.3, pop: 1.3, growth: 9, taxCap: 0.8, corruption: 15, debt: 50,
            inds: { agriculture: 12, textiles: 5, machinery: 2, chemicals: 2, finance: 4, tourism: 2 } },
    res: ["coast", "tourism"],
    dev: { tech: 65, lit: 90, uni: 3, urban: 75 },
    mil: { base: 10, nukes: 0, prog: 0 },
    s: { stability: 55, liberty: 70, legitimacy: 80, prestige: 35 },
    align: 30, blocs: [], preset: "west",
    pol: { economy: "planned", welfare: "welfare", health: "national", religion: "established", military: "high_mil", labor: "bargaining", science: "state_rd" },
    pillarNames: { labor: "Histadrut", clergy: "Orthodox rabbinate", military: "IDF", coalition: "Religious parties" },
    strengths: ["A motivated citizen army and highly educated population", "Diaspora support and German reparations to come", "Remarkable scientific talent"],
    weaknesses: ["Hostile neighbors on every border", "Mass immigration is doubling the population: tents, rationing, austerity", "Coalition politics with religious parties"],
    goals: [
        goal("Ingathering", "Reach a population of 3 million.", g => g.econ.pop >= 3),
        goal("The Samson option", "Develop a nuclear deterrent.", g => g.mil.nukes >= 2),
        goal("Peace with a neighbor", "Reach warm relations (+20) with Egypt.", g => getRel(g.ck, "egypt") >= 20)
    ],
    blurb: "You proclaimed the State of Israel under fire and won the war that followed. Now the hardest part: ships arrive daily with survivors from Europe and refugees from Arab lands, there is not enough food, and your coalition partners are arguing about the Sabbath.",
    drama: ["Immigrants are living in tent camps (ma'abarot).", "The 'austerity' rationing regime is deeply unpopular.", "Infiltrators cross the armistice lines almost nightly."],
    names: "hebrew",
    hist: [[1953, 12, "Moshe Sharett"], [1955, 11, "David Ben-Gurion"], [1963, 6, "Levi Eshkol"], [1969, 3, "Golda Meir"], [1974, 6, "Yitzhak Rabin"], [1977, 6, "Menachem Begin"], [1983, 10, "Yitzhak Shamir"], [1984, 9, "Shimon Peres"], [1986, 10, "Yitzhak Shamir"]]
},

pakistan: {
    name: "Pakistan", flag: "🇵🇰", tier: "wildcard", area: "Asia", status: "sovereign", gov: "parliamentary",
    system: "Dominion under the British Crown, parliamentary government",
    hos: "King George VI is head of state, represented by a powerful Governor-General. The Prime Minister heads the government.",
    how: [
        "The Constituent Assembly doubles as parliament. It still has not written a constitution.",
        "The Governor-General (Khawaja Nazimuddin) can dismiss a Prime Minister, and in 1953 one will.",
        "The country is in two halves 1,600 km apart. East Bengal has the majority of people; West Pakistan has the capital, the army and the civil service.",
        "Your Muslim League won independence, but since Jinnah's death in 1948 it is held together by habit and you.",
        "The army, mostly Punjabi, is the strongest institution in the country."
    ],
    leader: { name: "Liaquat Ali Khan", age: 54, title: "Prime Minister", party: "ml" },
    leg: { name: "Constituent Assembly", detail: "79 seats", system: "fptp" },
    parties: [
        P("ml", "Muslim League", "nationalist", 61, true, "Jinnah's party of Pakistan, now a coalition of landlords, Bengali leaders and refugee elites.",
            [F("Punjabi landlords", 0.4, "conservative", "The feudal families of the West."),
             F("Bengali leaders", 0.35, "nationalist", "Speak for the majority in East Bengal; demand Bengali as a state language."),
             F("Muhajir elite", 0.25, "liberal", "Urdu-speaking refugees from India who run Karachi and the bureaucracy.")]),
        P("pnc", "Pakistan National Congress", "socdem", 11, false, "The Hindu minority of East Bengal."),
        P("oth", "Others", "traditionalist", 7, false, "Religious parties and independents.")
    ],
    term: { next: [1954, 3] },
    regions: [
        R("Punjab", 25, { ml: 3 }, ["agrarian"], "Wheat, canals, and the army's recruiting ground."),
        R("Sindh & Karachi", 8, { ml: 2 }, ["finance", "coast"], "The capital, crowded with refugees."),
        R("Frontier & Balochistan", 7, { ml: -3 }, ["tribal"], "Pashtun tribes and Afghan claims."),
        R("East Bengal", 60, { ml: -6 }, ["agrarian"], "Jute, rice and floods. The majority, and resentful.")
    ],
    econ: { gdp: 4, pop: 75, growth: 3, taxCap: 0.35, corruption: 40, debt: 10,
            inds: { agriculture: 55, textiles: 3, finance: 1 } },
    res: ["coast"],
    dev: { tech: 15, lit: 16, uni: 0.3, urban: 10 },
    mil: { base: 15, nukes: 0, prog: 0 },
    s: { stability: 40, liberty: 45, legitimacy: 60, prestige: 25 },
    align: 30, blocs: ["commonwealth"], preset: "developing",
    pol: { religion: "established" },
    pillarNames: { coalition: "Governor-General & bureaucracy", military: "Army (GHQ Rawalpindi)", tribes: "Landlords & tribal chiefs" },
    strengths: ["A professional army", "Strategic location America will pay for", "Islamic identity uniting most citizens"],
    weaknesses: ["Two wings divided by India and by language", "No constitution, weak institutions", "Kashmir dispute and hostility with India"],
    goals: [
        goal("A constitution", "Adopt a constitution (constitutional reform).", g => !!g.flags.constitution_written),
        goal("Keep both wings", "Keep East Bengal in Pakistan through 1975.", g => g.year >= 1975 && !g.flags.bangladesh),
        goal("Kashmir", "Win control of Kashmir.", g => !!g.flags.kashmir)
    ],
    blurb: "You were Jinnah's lieutenant. Since he died, you have carried a new country on your back. Millions of refugees, an army without arsenals, a capital in tents, a constitution nobody can agree on, and India next door.",
    drama: ["Bengalis protest that Urdu is being imposed as the only state language.", "Kashmir is divided by a ceasefire line.", "Some army officers are plotting with communists (the Rawalpindi conspiracy)."],
    names: "hindi",
    hist: [[1951, 10, "Khawaja Nazimuddin"], [1953, 4, "Muhammad Ali Bogra"], [1958, 10, "Ayub Khan", "military_junta"], [1969, 3, "Yahya Khan"], [1971, 12, "Zulfikar Ali Bhutto", "parliamentary"], [1977, 7, "Zia-ul-Haq", "military_junta"], [1988, 12, "Benazir Bhutto", "parliamentary"]]
},

philippines: {
    name: "Philippines", flag: "🇵🇭", tier: "wildcard", area: "Asia", status: "sovereign", gov: "presidential",
    system: "Presidential republic modeled on the United States",
    hos: "The President is head of state and government, elected for 4 years.",
    how: [
        "The 1935 constitution copies America's: a President, a House of Representatives and a Senate.",
        "A President may serve at most 8 consecutive years.",
        "Two parties, the Liberals and Nacionalistas, alternate in power, both dominated by landed families.",
        "Elections are famously decided by 'guns, goons and gold'. Your 1949 victory was badly tainted by fraud.",
        "The US keeps large bases at Clark and Subic, and trade terms favoring American business."
    ],
    leader: { name: "Elpidio Quirino", age: 59, title: "President", party: "lp" },
    leg: { name: "Congress", detail: "House 100 + Senate 24", system: "fptp" },
    parties: [
        P("lp", "Liberal Party", "liberal", 78, true, "Your party, split between your loyalists and Senate President Avelino's faction.",
            [F("Quirino loyalists", 0.6, "liberal", "Your people in Congress."), F("Avelino wing", 0.4, "conservative", "Patronage politicians who backed your rival for the nomination.")]),
        P("np", "Nacionalista Party", "nationalist", 40, false, "The older party of Quezon and Osmeña, waiting for its turn."),
        P("oth", "Others", "socialist", 6, false, "Democratic Alliance remnants and independents.")
    ],
    term: { years: 4, limit: 2, served: 1, ends: [1953, 12], next: [1953, 11], legEvery: 2, legNext: [1951, 11] },
    regions: [
        R("Manila", 15, { lp: -3 }, ["industrial", "finance"], "The rebuilt capital, after the 1945 destruction."),
        R("Central Luzon", 20, { lp: -6 }, ["agrarian"], "Rice tenants and Huk guerrillas."),
        R("Visayas", 35, { lp: 5 }, ["agrarian", "coast"], "Sugar barons and Quirino's home base."),
        R("Mindanao", 30, { lp: 2 }, ["frontier", "minority"], "Muslim south and settler frontier.")
    ],
    econ: { gdp: 3, pop: 20, growth: 5, taxCap: 0.45, corruption: 55, debt: 15,
            inds: { agriculture: 40, mining: 3, textiles: 2, finance: 2, tourism: 1 } },
    res: ["minerals", "coast", "tourism"],
    dev: { tech: 35, lit: 60, uni: 2, urban: 27 },
    mil: { base: 8, nukes: 0, prog: 0 },
    s: { stability: 35, liberty: 50, legitimacy: 40, prestige: 25 },
    align: 85, blocs: [], preset: "developing",
    pol: { press: "free", religion: "tolerant", trade: "trade_free" },
    pillarNames: { tribes: "Landed dynasties", military: "AFP (Armed Forces)", foreign: "United States" },
    strengths: ["Most educated population in Southeast Asia", "American alliance and aid", "English-speaking, dynamic private sector"],
    weaknesses: ["The Huk insurgency threatens Manila", "Corruption is notorious", "Land is held by a few families"],
    goals: [
        goal("Defeat the Huks", "End the insurgency.", g => !!g.flags.huks_defeated),
        goal("Land to the tiller", "Enact land reform.", g => g.pol.land === "reform"),
        goal("Asian tiger", "Reach the 'Industrial' stage.", g => g.dev.ind >= 60)
    ],
    blurb: "You became president when Roxas died in 1948, then won your own term in an election so dirty even the dead voted. The Huks are raiding towns near Manila, the treasury is empty, and Washington is losing patience.",
    drama: ["Huk guerrillas operate within 30 km of Manila.", "The treasury cannot pay teachers.", "A young congressman named Ramon Magsaysay has ideas about fighting the Huks."],
    names: "malay",
    wars: ["huk"],
    hist: [[1953, 12, "Ramon Magsaysay"], [1957, 3, "Carlos P. Garcia"], [1961, 12, "Diosdado Macapagal"], [1965, 12, "Ferdinand Marcos"], [1972, 9, "Ferdinand Marcos", "military_junta"], [1986, 2, "Corazon Aquino", "presidential"]]
},

ethiopia: {
    name: "Ethiopia", flag: "🇪🇹", tier: "wildcard", area: "Africa", status: "sovereign", gov: "monarchy",
    system: "Absolute monarchy (1931 constitution)",
    hos: "The Emperor is 'Elect of God', head of state and government, and holds all power.",
    how: [
        "Your 1931 constitution grants every power to the Emperor. The Senate is appointed and the Chamber of Deputies is chosen by the nobility.",
        "The great nobles (rases) govern provinces with private armies and estates.",
        "The Ethiopian Orthodox Church owns a third of the land and anoints the monarchy.",
        "Ethiopia was never colonized, apart from the Italian occupation of 1936–41, and is a symbol to all of Africa.",
        "The UN is about to decide the fate of Eritrea, the former Italian colony on your coast."
    ],
    leader: { name: "Haile Selassie I", age: 57, title: "Emperor", party: "court" },
    heir: { name: "Crown Prince Asfaw Wossen", age: 34 },
    leg: { name: "Imperial Court", detail: "Court factions (by influence)", system: "court" },
    parties: [
        P("court", "Imperial establishment", "traditionalist", 100, true, "The power structure around the throne.",
            [F("Old nobility (rases)", 0.35, "traditionalist", "Provincial lords resisting centralization."),
             F("Young educated officials", 0.2, "liberal", "Foreign-educated technocrats who want a constitutional monarchy."),
             F("Imperial Guard officers", 0.2, "militarist", "Your elite troops, and a potential threat."),
             F("Orthodox Church hierarchy", 0.25, "traditionalist", "The Abuna and the monasteries.")])
    ],
    regions: [
        R("Shewa & Addis Ababa", 25, {}, ["agrarian"], "The Amhara core and the capital."),
        R("Tigray & the North", 20, {}, ["religious", "agrarian"], "Ancient Christian highlands, proud and poor."),
        R("South & Oromo lands", 40, {}, ["agrarian", "minority"], "Conquered in the 1890s. Tenants serve northern landlords."),
        R("Ogaden & lowlands", 15, {}, ["tribal", "minority"], "Somali nomads, claimed by Somalia.")
    ],
    econ: { gdp: 1, pop: 18, growth: 3, taxCap: 0.25, corruption: 45, debt: 5,
            inds: { agriculture: 60, textiles: 1, finance: 0.3 } },
    res: ["tourism"],
    dev: { tech: 5, lit: 5, uni: 0.02, urban: 6 },
    mil: { base: 8, nukes: 0, prog: 0 },
    s: { stability: 60, liberty: 15, legitimacy: 75, prestige: 45 },
    align: 50, blocs: [], preset: "monarchy",
    pol: { religion: "established", press: "state" },
    pillarNames: { clergy: "Orthodox Church", tribes: "Rases (great nobles)", military: "Imperial Guard & army", royals: "Imperial family" },
    strengths: ["Africa's symbol of independence and the Emperor's world fame", "Fertile highlands, the source of the Blue Nile", "Coffee"],
    weaknesses: ["Feudal land tenure and a tiny educated class", "No coastline (yet)", "Regional and ethnic grievances"],
    goals: [
        goal("Modernize the empire", "Reach 30% literacy.", g => g.dev.lit >= 30),
        goal("Reach the sea", "Unite Eritrea with Ethiopia.", g => !!g.flags.eritrea),
        goal("Lion of Judah", "Keep the throne through 1975.", g => g.year >= 1975 && g.gov.type === "monarchy")
    ],
    blurb: "You warned the League of Nations in 1936 that 'it is us today, it will be you tomorrow', and the world remembered. You came back in 1941 behind British troops. Now you are building schools, an air force and a modern state, from the top down, as an absolute monarch.",
    drama: ["The UN debates Eritrea's future.", "The rases resent your new provincial governors.", "Young officers trained abroad talk of constitutions."],
    names: "african",
    hist: [[1974, 9, "Mengistu Haile Mariam", "military_junta"], [1987, 9, "Mengistu Haile Mariam", "one_party"]]
},

venezuela: {
    name: "Venezuela", flag: "🇻🇪", tier: "wildcard", area: "Americas", status: "sovereign", gov: "military_junta",
    system: "Military junta",
    hos: "You chair a three-man Military Junta that rules by decree.",
    how: [
        "In November 1948 the army overthrew President Rómulo Gallegos, the country's first freely elected president.",
        "The junta (you, Marcos Pérez Jiménez and Luis Llovera Páez) rules by decree. Congress is dissolved.",
        "Acción Democrática, the largest party, is banned and its leaders are in exile or underground.",
        "Oil makes Venezuela the world's largest oil exporter. In 1948 the elected government won a 50/50 profit split from the companies.",
        "Your fellow officers, above all the ambitious Pérez Jiménez, are both your base and your threat."
    ],
    leader: { name: "Carlos Delgado Chalbaud", age: 41, title: "President of the Military Junta", party: "junta" },
    leg: { name: "Junta & officer corps", detail: "Officer factions (by influence)", system: "court" },
    parties: [
        P("junta", "Armed Forces", "militarist", 100, true, "The officers who seized power.",
            [F("Delgado Chalbaud's moderates", 0.35, "conservative", "Your faction: restore order, then elections."),
             F("Pérez Jiménez hardliners", 0.45, "militarist", "No elections, ever. Concrete and order."),
             F("Llovera Páez's group", 0.2, "militarist", "Swing votes among the colonels.")])
    ],
    regions: [
        R("Caracas", 25, {}, ["finance", "industrial"], "Booming, chaotic capital."),
        R("Zulia & Maracaibo", 15, {}, ["oil"], "Lake Maracaibo's forest of derricks."),
        R("Andes", 20, {}, ["agrarian", "religious"], "Conservative and Catholic."),
        R("Llanos & East", 40, {}, ["agrarian"], "Cattle plains and AD's rural strongholds.")
    ],
    econ: { gdp: 3.5, pop: 5, growth: 6, taxCap: 0.5, corruption: 50, debt: 5,
            inds: { agriculture: 8, oil: 28, mining: 2, finance: 3, tourism: 1 } },
    res: ["oil", "minerals", "coast", "tourism"],
    oilDep: 0.9,
    dev: { tech: 30, lit: 50, uni: 1, urban: 48 },
    mil: { base: 8, nukes: 0, prog: 0 },
    s: { stability: 50, liberty: 20, legitimacy: 30, prestige: 25 },
    align: 70, blocs: [], preset: "developing",
    pol: { resources: "partnership", press: "state", security: "political", labor: "restrict", infra: "public" },
    pillarNames: { military: "Officer corps", foreign: "US oil companies & Washington", business: "Caracas business" },
    strengths: ["Oil wealth beyond any neighbor's", "Rapid urban growth and investment", "Washington's goodwill"],
    weaknesses: ["Illegitimate rule: the biggest party is banned", "Over-dependence on oil", "Ambitious rivals in uniform"],
    goals: [
        goal("Return to democracy", "Hand power to an elected government.", g => GOV_TYPES[g.gov.type].democracy),
        goal("Sow the oil", "Grow industry to the 'Industrializing' stage.", g => g.dev.ind >= 35),
        goal("Found OPEC", "Join OPEC.", g => g.blocs.opec.includes(g.ck))
    ],
    blurb: "You helped overthrow an elected president, but you insist you are a democrat who will restore elections. Your partner Pérez Jiménez does not believe you, and neither does anyone else. Meanwhile oil pours out of Lake Maracaibo and the money pours into Caracas.",
    drama: ["Acción Democrática is underground and plotting.", "Pérez Jiménez wants you gone.", "The oil companies want guarantees."],
    names: "iberian",
    hist: [[1950, 11, "Marcos Pérez Jiménez"], [1958, 1, "Wolfgang Larrazábal"], [1959, 2, "Rómulo Betancourt", "presidential"], [1964, 3, "Raúl Leoni"], [1969, 3, "Rafael Caldera"], [1974, 3, "Carlos Andrés Pérez"], [1979, 3, "Luis Herrera Campins"], [1984, 2, "Jaime Lusinchi"], [1989, 2, "Carlos Andrés Pérez"]]
},

norway: {
    name: "Norway", flag: "🇳🇴", tier: "wildcard", area: "Europe", status: "sovereign", gov: "parliamentary",
    system: "Constitutional monarchy, parliamentary democracy",
    hos: "King Haakon VII is head of state and a symbol of wartime resistance. The Prime Minister governs.",
    how: [
        "The Prime Minister needs the confidence of the Storting (150 seats, proportional representation).",
        "The Storting cannot be dissolved early. Elections happen every 4 years and there is no snap election option.",
        "Your Labour Party has an outright majority, a rarity in proportional systems.",
        "Norway joined NATO last year after centuries of neutrality, and was occupied by Germany in 1940–45."
    ],
    leader: { name: "Einar Gerhardsen", age: 52, title: "Prime Minister", party: "ap" },
    leg: { name: "Storting", detail: "150 seats, proportional", system: "pr" },
    parties: [
        P("ap", "Labour Party", "socdem", 85, true, "'Everyone together': reconstruction, welfare, planning."),
        P("h", "Høyre (Conservatives)", "conservative", 23, false, "Business and the Oslo middle class."),
        P("v", "Venstre (Liberals)", "liberal", 21, false, "The old liberal party of the west coast."),
        P("krf", "Christian People's Party", "traditionalist", 9, false, "Lutheran west-coast revivalists."),
        P("bp", "Farmers' Party", "conservative", 12, false, "Rural interests.")
    ],
    term: { next: [1953, 10] },
    noSnap: true,
    regions: [
        R("Oslo & East", 45, { ap: 3 }, ["industrial"], "Factories, timber and the capital."),
        R("West coast", 25, { ap: -5 }, ["coast", "religious"], "Fishing, shipping, and the Bible belt."),
        R("Trøndelag & interior", 18, { ap: 0 }, ["agrarian"], "Farms and forests."),
        R("North Norway", 12, { ap: 4 }, ["coast"], "Burned by the retreating Germans in 1944.")
    ],
    econ: { gdp: 3.2, pop: 3.3, growth: 4.5, taxCap: 1, corruption: 6, debt: 50,
            inds: { agriculture: 8, mining: 2, textiles: 2, steel: 2, machinery: 3, chemicals: 3, shipbuilding: 3, finance: 4, tourism: 1.5 } },
    res: ["minerals", "coast", "tourism"],
    futureRes: { oil: 1969 },
    dev: { tech: 75, lit: 99, uni: 3, urban: 50 },
    mil: { base: 6, nukes: 0, prog: 0 },
    s: { stability: 82, liberty: 88, legitimacy: 90, prestige: 45 },
    align: 75, blocs: ["nato"], preset: "west",
    pol: { economy: "mixed", tax: "high", welfare: "welfare", health: "subsidized" },
    pillarNames: { labor: "LO (trade union confederation)", business: "Shipowners" },
    strengths: ["World's third-largest merchant fleet", "Cheap hydropower for metals and fertilizer", "Social trust and consensus"],
    weaknesses: ["Small, remote population", "War damage in the north", "Dependent on fish, timber and shipping prices"],
    goals: [
        goal("Save the oil wealth", "Once oil is found, put it in a national fund.", g => !!g.flags.oil_fund),
        goal("Nordic model", "Full pensions, unemployment insurance and national health care.", g => lawLevel("pensions") >= 0.8 && lawOn("unemployment_ins") && (lawOn("nhs") || lawOn("nhi"))),
        goal("Richest in Europe", "Reach the highest GDP per person in Europe.", g => g.econ.gdp / g.econ.pop > 1.05 * Math.max(...["uk", "france", "germany", "switzerland"].map(k => g.nations[k] ? g.nations[k].gdp / g.nations[k].pop : 0)))
    ],
    blurb: "A former Oslo municipal worker who survived Sachsenhausen, you are 'Landsfaderen', the father of the nation. Norway is rebuilding, its fleet is on every ocean, and Labour has a majority. The question is what kind of country you make of it.",
    drama: ["Finnmark must be rebuilt from ashes.", "The Soviet border in the far north is now a NATO frontier.", "Rationing and price controls are wearing thin."],
    names: "nordic",
    hist: [[1951, 11, "Oscar Torp"], [1955, 1, "Einar Gerhardsen"], [1965, 10, "Per Borten"], [1971, 3, "Trygve Bratteli"], [1976, 1, "Odvar Nordli"], [1981, 2, "Gro Harlem Brundtland"], [1981, 10, "Kåre Willoch"], [1986, 5, "Gro Harlem Brundtland"]]
},

switzerland: {
    name: "Switzerland", flag: "🇨🇭", tier: "wildcard", area: "Europe", status: "sovereign", gov: "directorial",
    system: "Federal directorial republic with direct democracy",
    hos: "There is no single leader. The 7-member Federal Council is collectively head of state and government; the presidency rotates every year.",
    how: [
        "The Federal Assembly (National Council 194 + Council of States 44) elects the seven Federal Councillors for 4-year terms, and almost always re-elects them.",
        "The Council governs by consensus. The four big parties share its seats.",
        "Any law can be challenged by referendum if 30,000 citizens sign a petition. Citizens can also propose constitutional amendments.",
        "The 25 cantons have wide powers over taxes, schools and police.",
        "Women cannot vote in federal elections. That only changes by referendum, in 1971."
    ],
    leader: { name: "Max Petitpierre", age: 51, title: "Federal Councillor (President of the Confederation)", party: "fdp" },
    leg: { name: "Federal Assembly", detail: "National Council 194 + Council of States 44", system: "pr" },
    parties: [
        P("fdp", "Free Democratic Party (Radicals)", "liberal", 64, true, "The party that founded modern Switzerland in 1848: business, federalism."),
        P("kvp", "Catholic Conservatives", "traditionalist", 62, true, "The Catholic cantons' party."),
        P("sp", "Social Democrats", "socdem", 49, true, "Workers' party, recently admitted to the Federal Council."),
        P("bgb", "Farmers, Traders & Citizens (BGB)", "conservative", 25, true, "Bernese farmers and small business."),
        P("ldu", "Landesring (Independents)", "liberal", 8, false, "Migros founder Duttweiler's consumer party."),
        P("lib", "Liberal Party", "liberal", 9, false, "French-speaking Protestant liberals."),
        P("pda", "Labour Party (Communists)", "communist", 7, false, "Marxists, isolated."),
        P("oth", "Others", "conservative", 14, false, "Minor parties.")
    ],
    term: { years: 4, next: [1951, 12], legEvery: 4, legNext: [1951, 10] },
    regions: [
        R("German-speaking Mittelland", 45, { fdp: 2 }, ["industrial", "agrarian"], "Bern, Lucerne and the farming plateau."),
        R("Zurich & Basel", 25, { fdp: 2 }, ["finance", "chemicals"], "Banks and pharmaceutical giants."),
        R("Romandie", 20, { fdp: -2 }, ["industrial"], "French-speaking Geneva and Lausanne, watchmaking."),
        R("Ticino & Alpine cantons", 10, { fdp: -4 }, ["religious", "tourism"], "Italian-speaking and Catholic mountain valleys.")
    ],
    econ: { gdp: 5, pop: 4.7, growth: 4, taxCap: 0.7, corruption: 5, debt: 30,
            inds: { agriculture: 8, textiles: 4, machinery: 7, chemicals: 6, electronics: 1, finance: 10, tourism: 5 } },
    res: ["tourism"],
    dev: { tech: 82, lit: 99, uni: 3, urban: 45 },
    mil: { base: 10, nukes: 0, prog: 0 },
    s: { stability: 90, liberty: 82, legitimacy: 92, prestige: 50 },
    align: 30, blocs: [], preset: "west",
    pol: { economy: "market", tax: "low", welfare: "safety", health: "private", draft: "conscription", science: "universities" },
    pillarNames: { party: "Federal Assembly", tribes: "Cantons", business: "Banks & industry" },
    strengths: ["Untouched by war: a fully intact economy", "Banking secrecy and neutrality attract capital", "World-class precision industry and chemicals"],
    weaknesses: ["Nothing happens fast: everything needs consensus", "Voters can veto any reform", "No natural resources and a small domestic market"],
    goals: [
        goal("Votes for women", "Pass women's suffrage.", g => !!g.flags.women_vote),
        goal("Richest people on Earth", "Reach the highest GDP per person in the world.", g => g.econ.gdp / g.econ.pop >= Math.max(...Object.values(g.nations).filter(n => n.pop > 0.5).map(n => n.gdp / n.pop))),
        goal("Armed neutrality", "Stay outside every military bloc through 1990.", g => g.year >= 1990 && !Object.entries(g.blocs).some(([k, m]) => BLOCS[k].defense && m.includes(g.ck)))
    ],
    blurb: "You are one of seven, and this year you hold the rotating presidency. Switzerland emerged from the war intact and rich, and slightly ashamed of how it did so. You cannot decree anything. You can persuade your colleagues, the Assembly and, in the end, the people.",
    drama: ["Allied governments question Swiss wartime dealings with Nazi gold.", "Women's suffrage keeps losing referendums.", "Neutrality means staying out of the UN itself."],
    names: "nordic",
    hist: []
},

fiji: {
    name: "Fiji", flag: "🇫🇯", tier: "wildcard", area: "Oceania", status: "colony", gov: "colony", master: "uk", indepDate: [1970, 10],
    system: "British Crown colony",
    hos: "A British Governor rules. You are Fiji's paramount chief-statesman, working within the colonial system.",
    how: [
        "The Governor presides over a Legislative Council with separate seats for Fijians, Indo-Fijians and Europeans.",
        "The Great Council of Chiefs speaks for indigenous Fijians. You built the Fijian Affairs Board that administers them.",
        "Indo-Fijians, descendants of indentured sugar workers, now outnumber indigenous Fijians but cannot own most land: 83% belongs to Fijian clans.",
        "Independence must be negotiated with London, and above all between the communities."
    ],
    leader: { name: "Ratu Sir Lala Sukuna", age: 61, title: "Paramount chief & Native Affairs Secretary", party: "chiefs" },
    leg: { name: "Legislative Council", detail: "Communal seats", system: "colony" },
    parties: [
        P("chiefs", "Fijian chiefs (Great Council)", "traditionalist", 40, true, "The traditional hierarchy you lead."),
        P("indo", "Indo-Fijian leaders", "socdem", 40, false, "Sugar cane farmers' unions; later the National Federation Party."),
        P("eur", "European members", "conservative", 20, false, "Planters, merchants and colonial interests.")
    ],
    regions: [
        R("Western Viti Levu", 40, { chiefs: -8 }, ["agrarian"], "The sugar belt, mostly Indo-Fijian."),
        R("Suva & the East", 35, { chiefs: 5 }, ["finance", "coast"], "The capital and chiefly power."),
        R("Vanua Levu & outer islands", 25, { chiefs: 8 }, ["agrarian", "coast"], "Villages and copra.")
    ],
    econ: { gdp: 0.06, pop: 0.29, growth: 3.5, taxCap: 0.4, corruption: 20, debt: 5,
            inds: { agriculture: 35, mining: 3, tourism: 3, finance: 1 } },
    res: ["minerals", "coast", "tourism"],
    dev: { tech: 20, lit: 50, uni: 0.1, urban: 24 },
    mil: { base: 1, nukes: 0, prog: 0 },
    s: { stability: 65, liberty: 40, legitimacy: 60, prestige: 5 },
    align: 50, blocs: [], preset: "colony",
    pillarNames: { colonial: "British Governor", tribes: "Great Council of Chiefs", labor: "Cane farmers' unions", foreign: "World opinion" },
    strengths: ["Respected chiefly leadership", "Sugar, gold and the coming tourism boom", "Strategic Pacific location"],
    weaknesses: ["Two communities of equal size with opposed interests", "Tiny, export-dependent economy", "Isolation"],
    goals: [
        goal("Independence", "Lead Fiji to independence.", g => g.gov.type !== "colony"),
        goal("One people", "Pass equal rights and keep stability at 60.", g => g.pol.rights === "equal" && g.s.stability >= 60),
        goal("Pacific paradise", "Tourism reaches 10% of GDP.", g => indShare("tourism") >= 10)
    ],
    blurb: "You are an Oxford-educated chief who fought in the French Foreign Legion and then built the system by which Fijians govern themselves within the colony. Your people hold the land; the Indo-Fijians grow the sugar; the British hold the keys. Independence will come. The question is what kind.",
    drama: ["Sugar cane farmers threaten a strike against the Australian-owned refiner.", "Indo-Fijian leaders demand common-roll elections.", "Chiefs worry about losing their land."],
    names: "pacific",
    hist: [[1970, 10, "Ratu Sir Kamisese Mara", "parliamentary"], [1987, 5, "Sitiveni Rabuka", "military_junta"]]
},

// ═══════════════════ NEW ADDITIONS ═══════════════════

newzealand: {
    name: "New Zealand", flag: "🇳🇿", tier: "new", area: "Oceania", status: "sovereign", gov: "parliamentary",
    system: "Constitutional monarchy, unicameral parliament",
    hos: "King George VI, represented by the Governor-General, is head of state. The Prime Minister governs.",
    how: [
        "The House of Representatives (80 seats, first-past-the-post) chooses the government. Terms are only 3 years.",
        "You are abolishing the appointed Legislative Council this year, leaving one of the world's few single-chamber parliaments with almost no checks on the government.",
        "Four Māori seats are elected by Māori voters.",
        "The Treaty of Waitangi (1840) between the Crown and Māori chiefs is the founding document, but governments have ignored it for a century.",
        "New Zealand often punches above its weight: first to give women the vote (1893), early welfare state."
    ],
    leader: { name: "Sidney Holland", age: 56, title: "Prime Minister", party: "nat" },
    leg: { name: "House of Representatives", detail: "80 seats", system: "fptp" },
    parties: [
        P("nat", "National Party", "conservative", 46, true, "Farmers and business, elected last December to end Labour's controls."),
        P("lab", "Labour Party", "socdem", 34, false, "Built the 1938 welfare state; holds all four Māori seats.")
    ],
    term: { next: [1952, 11] },
    regions: [
        R("Auckland & Northland", 30, { nat: -3 }, ["industrial", "minority"], "Growing city and Māori heartland."),
        R("Wellington & lower North Island", 25, { nat: -2 }, ["finance", "coast"], "The capital and the wharves."),
        R("Rural North Island", 20, { nat: 6 }, ["agrarian", "minority"], "Dairy farms and Māori land."),
        R("South Island", 25, { nat: 3 }, ["agrarian"], "Sheep stations of Canterbury and Otago.")
    ],
    econ: { gdp: 2.5, pop: 1.9, growth: 3.5, taxCap: 0.95, corruption: 6, debt: 70,
            inds: { agriculture: 22, textiles: 2, machinery: 2, finance: 4, tourism: 1.5 } },
    res: ["coast", "tourism"],
    dev: { tech: 72, lit: 98, uni: 3, urban: 72 },
    mil: { base: 4, nukes: 0, prog: 0 },
    s: { stability: 80, liberty: 82, legitimacy: 85, prestige: 40 },
    align: 80, blocs: ["commonwealth"], preset: "west",
    pol: { welfare: "welfare", health: "subsidized", trade: "protection" },
    pillarNames: { business: "Farmers' federations", labor: "Watersiders & unions" },
    strengths: ["One of the world's highest living standards", "Butter, lamb and wool sell to Britain", "Clean government and social trust"],
    weaknesses: ["Dependence on one market: Britain", "Tiny population at the edge of the world", "Unresolved Māori land grievances"],
    goals: [
        goal("Honour the Treaty", "Settle Treaty of Waitangi grievances.", g => !!g.flags.waitangi),
        goal("Proportional democracy", "Adopt mixed-member proportional voting (MMP).", g => !!g.flags.mmp),
        goal("Nuclear-free", "Declare New Zealand nuclear-free.", g => !!g.flags.nuclear_free)
    ],
    blurb: "You promised to end Labour's rationing and controls, and the voters believed you. The Korean War wool boom is about to make farmers rich. But the waterfront unions are spoiling for a fight, and the country's future may lie not with Britain but across the Pacific.",
    drama: ["You are abolishing the Legislative Council.", "The waterfront workers' union is defying arbitration.", "Britain is talking about joining Europe one day, which would hit your exports."],
    names: "pacific",
    hist: [[1957, 9, "Keith Holyoake"], [1957, 12, "Walter Nash"], [1960, 12, "Keith Holyoake"], [1972, 2, "Jack Marshall"], [1972, 12, "Norman Kirk"], [1974, 9, "Bill Rowling"], [1975, 12, "Robert Muldoon"], [1984, 7, "David Lange"], [1989, 8, "Geoffrey Palmer"]]
},

barbados: {
    name: "Barbados", flag: "🇧🇧", tier: "new", area: "Americas", status: "colony", gov: "colony", master: "uk", indepDate: [1966, 11],
    system: "British colony with one of the oldest legislatures in the Americas",
    hos: "A British Governor rules. You lead the Barbados Labour Party, the largest party in the House of Assembly.",
    how: [
        "The House of Assembly has sat since 1639. Until now only property owners could vote; universal adult suffrage arrives in 1951.",
        "The Governor and a nominated council still control the executive. Ministerial government comes in stages.",
        "A white planter and merchant elite owns most land and business; the Black majority won the right to organize only in the 1930s.",
        "A West Indies Federation of Britain's Caribbean colonies is being planned as the route to independence."
    ],
    leader: { name: "Grantley Adams", age: 52, title: "Leader of the House, BLP", party: "blp" },
    leg: { name: "House of Assembly", detail: "24 seats", system: "colony" },
    parties: [
        P("blp", "Barbados Labour Party", "socdem", 12, true, "Your party, born from the 1937 riots and the labor movement."),
        P("ea", "Electors' Association", "conservative", 7, false, "The planters' and merchants' party."),
        P("cong", "Congress Party", "socialist", 3, false, "Radicals impatient with your caution."),
        P("ind", "Independents", "liberal", 2, false, "")
    ],
    regions: [
        R("Bridgetown & St Michael", 45, { blp: 3 }, ["finance", "coast"], "Port, shops and civil servants."),
        R("Sugar parishes", 40, { blp: 6 }, ["agrarian"], "Plantation workers."),
        R("West coast", 15, { blp: -3 }, ["tourism"], "Where wealthy visitors are starting to come.")
    ],
    econ: { gdp: 0.05, pop: 0.21, growth: 3, taxCap: 0.5, corruption: 15, debt: 5,
            inds: { agriculture: 30, textiles: 1, finance: 2, tourism: 4 } },
    res: ["coast", "tourism"],
    dev: { tech: 30, lit: 90, uni: 0.3, urban: 40 },
    mil: { base: 0.3, nukes: 0, prog: 0 },
    s: { stability: 70, liberty: 55, legitimacy: 55, prestige: 5 },
    align: 70, blocs: [], preset: "colony",
    pillarNames: { colonial: "British Governor", tribes: "Planter elite", labor: "Barbados Workers' Union", foreign: "World opinion" },
    strengths: ["Very high literacy for the region", "Stable institutions and a strong labor movement", "Beaches and a climate tourists will pay for"],
    weaknesses: ["A single-crop sugar economy", "Land and wealth held by a small elite", "Overpopulation and emigration"],
    goals: [
        goal("Independence", "Lead Barbados to independence.", g => g.gov.type !== "colony"),
        goal("Republic", "Cut ties with the Crown and become a republic.", g => !!g.flags.republic),
        goal("Beyond sugar", "Tourism and finance reach 25% of GDP.", g => indShare("tourism") + indShare("finance") >= 25)
    ],
    blurb: "You are a barrister and trade unionist who has spent fifteen years turning workers' anger into votes. Next year every adult will vote for the first time. Independence is coming, alone or in a Caribbean federation. You must decide how fast, and on whose terms.",
    drama: ["Universal suffrage is coming in 1951.", "The West Indies Federation is under discussion.", "Sugar prices are fixed by Britain."],
    names: "pacific",
    hist: [[1966, 11, "Errol Barrow", "parliamentary"], [1976, 9, "Tom Adams"], [1985, 3, "Bernard St. John"], [1986, 5, "Errol Barrow"], [1987, 6, "Erskine Sandiford"]]
},

singapore: {
    name: "Singapore", flag: "🇸🇬", tier: "new", area: "Asia", status: "colony", gov: "colony", master: "uk", indepDate: [1965, 8],
    system: "British Crown colony",
    hos: "A British Governor rules. You are a young lawyer building a political movement.",
    how: [
        "Singapore is a Crown colony, separate from the Federation of Malaya since 1946.",
        "Only 6 of 22 Legislative Council seats are elected, by a tiny electorate. Self-government will come in stages.",
        "The population is 75% Chinese, with Malay and Indian minorities. Many owe loyalty to China, and communists run the strongest unions.",
        "The British naval base and the port are the whole economy. There is no hinterland, no water and no natural resources.",
        "Merger with Malaya is assumed to be the only path to independence."
    ],
    leader: { name: "Lee Kuan Yew", age: 26, title: "Lawyer & nationalist organizer", party: "pap" },
    leg: { name: "Legislative Council", detail: "22 seats, 6 elected", system: "colony" },
    parties: [
        P("pap", "People's Action Party (to be founded)", "socdem", 20, true, "Your movement: English-educated nationalists allied, uneasily, with Chinese-educated leftists."),
        P("prog", "Progressive Party", "liberal", 50, false, "Moderate, English-speaking professionals favored by the British."),
        P("left", "Communist-aligned unions", "communist", 30, false, "The underground Malayan Communist Party's front organizations.")
    ],
    regions: [
        R("City & harbour", 40, { pap: 0 }, ["finance", "coast"], "Godowns, banks and the naval base."),
        R("Chinese districts & kampongs", 45, { pap: 4 }, ["industrial"], "Crowded shophouses and squatter villages."),
        R("Malay & Indian communities", 15, { pap: -2 }, ["minority"], "Who fear Chinese domination.")
    ],
    econ: { gdp: 0.6, pop: 1.0, growth: 5, taxCap: 0.5, corruption: 30, debt: 5,
            inds: { agriculture: 3, textiles: 2, shipbuilding: 2, finance: 8, tourism: 2 } },
    res: ["coast"],
    dev: { tech: 40, lit: 50, uni: 0.5, urban: 100 },
    mil: { base: 0.5, nukes: 0, prog: 0 },
    s: { stability: 55, liberty: 40, legitimacy: 40, prestige: 5 },
    align: 50, blocs: [], preset: "colony",
    pol: { trade: "trade_free" },
    pillarNames: { colonial: "British Governor", tribes: "Clan associations & towkays", labor: "Chinese-educated unions", foreign: "World opinion" },
    strengths: ["One of the world's great natural harbors", "Hard-working, entrepreneurial people", "Strategic location on the Straits of Malacca"],
    weaknesses: ["No land, no water, no resources", "Communist subversion and communal tension", "Dependence on the British base"],
    goals: [
        goal("Independence", "Win independence.", g => g.gov.type !== "colony"),
        goal("Third World to First", "Reach the 'Industrial' stage.", g => g.dev.ind >= 60),
        goal("Clean government", "Bring corruption below 10.", g => g.s.corruption < 10)
    ],
    blurb: "You came home from Cambridge with a first in law and a conviction that the British must go, and that only competent, incorruptible government will let a tiny island survive among giants. You have no party yet. You will have to build one, with allies you may later need to destroy.",
    drama: ["The Malayan Emergency rages across the Causeway.", "The Maria Hertogh riots will soon expose communal fault lines.", "Communists dominate the student and union movements."],
    names: "malay",
    hist: [[1959, 6, "Lee Kuan Yew", "dominant_party"]]
},

uae: {
    name: "Trucial States (UAE)", flag: "🇦🇪", tier: "new", area: "Middle East", status: "colony", gov: "colony", master: "uk", indepDate: [1971, 12],
    system: "British protectorate of seven sheikhdoms",
    hos: "Each emirate has its own hereditary ruler. Britain handles defense and foreign affairs. You govern the Eastern Region of Abu Dhabi for your brother.",
    how: [
        "Since 1820 the 'truces' have bound the sheikhs to Britain, which controls their foreign relations and defense.",
        "Each of the seven rulers governs his own sheikhdom personally, through tribal consultation (majlis).",
        "A British Political Agent in Dubai advises, and pressures, the rulers.",
        "Pearling, the old economy, collapsed in the 1930s. Oil companies are exploring but have found nothing yet.",
        "A federation would need all seven rulers' agreement, and they have long rivalries."
    ],
    leader: { name: "Sheikh Zayed bin Sultan Al Nahyan", age: 32, title: "Ruler's Representative, Al Ain", party: "rulers" },
    leg: { name: "Council of Rulers", detail: "Ruling families (by influence)", system: "court" },
    parties: [
        P("rulers", "The Ruling Families", "traditionalist", 100, true, "Seven dynasties.",
            [F("Al Nahyan (Abu Dhabi)", 0.35, "traditionalist", "Your family. Your brother Shakhbut rules and distrusts change."),
             F("Al Maktoum (Dubai)", 0.3, "conservative", "Merchant princes who want trade, not tradition."),
             F("Al Qasimi (Sharjah & Ras al-Khaimah)", 0.25, "traditionalist", "Old naval power, proud and wary of Abu Dhabi."),
             F("Smaller emirates", 0.1, "traditionalist", "Ajman, Umm al-Quwain, Fujairah.")])
    ],
    regions: [
        R("Abu Dhabi", 25, {}, ["coast", "tribal"], "Your family's sheikhdom: desert and fishing villages."),
        R("Dubai", 30, {}, ["finance", "coast"], "Traders on the Creek."),
        R("Sharjah & the North", 35, {}, ["coast", "tribal"], "The Qasimi emirates."),
        R("Al Ain oasis", 10, {}, ["agrarian", "tribal"], "Your base: date palms and the falaj irrigation channels.")
    ],
    econ: { gdp: 0.03, pop: 0.07, growth: 2, taxCap: 0.2, corruption: 30, debt: 0,
            inds: { agriculture: 10, finance: 2 } },
    res: ["coast"],
    futureRes: { oil: 1960, tourism: 1975 },
    dev: { tech: 5, lit: 10, uni: 0, urban: 30 },
    mil: { base: 0.2, nukes: 0, prog: 0 },
    s: { stability: 65, liberty: 20, legitimacy: 60, prestige: 3 },
    align: 60, blocs: [], preset: "colony",
    pol: { religion: "established", press: "state" },
    pillarNames: { colonial: "British Political Agent", tribes: "Bedouin tribes & rulers", labor: "Dubai merchants", foreign: "World opinion" },
    strengths: ["Oil, once it is found", "Strategic Gulf coastline", "Tribal loyalty to good leadership"],
    weaknesses: ["Extreme poverty: no schools, clinics or roads", "Seven rival sheikhdoms", "Total dependence on Britain"],
    goals: [
        goal("Federation", "Unite the emirates as an independent state.", g => g.gov.type !== "colony"),
        goal("Oil wealth", "Reach GDP of $1 billion.", g => g.econ.gdp >= 1),
        goal("Post-oil economy", "Finance and tourism reach 25% of GDP.", g => indShare("finance") + indShare("tourism") >= 25)
    ],
    blurb: "You govern the oasis of Al Ain, where you are revered for restoring the ancient water channels and sharing them fairly. Your brother rules Abu Dhabi, which is poor. Geologists say there is oil under the Gulf. If there is, everything will change, and someone will need to decide how.",
    drama: ["Saudi Arabia claims the Buraimi oasis, your home.", "Oil companies are drilling offshore.", "Your brother Shakhbut refuses to spend money on anything."],
    names: "arabic",
    hist: [[1971, 12, "Sheikh Zayed bin Sultan", "monarchy"]]
},

cambodia: {
    name: "Cambodia", flag: "🇰🇭", tier: "new", area: "Asia", status: "colony", gov: "colony", master: "france", indepDate: [1953, 11],
    system: "French protectorate within the French Union",
    hos: "You are King. France controls defense, foreign affairs and finance, and an elected National Assembly distrusts you.",
    how: [
        "Since 1863 Cambodia has been a French protectorate. In 1949 France granted 'independence within the French Union', which is limited.",
        "A 1947 constitution created a National Assembly, dominated by the anti-royalist Democratic Party.",
        "France still commands the army and police in most provinces and controls the budget.",
        "Khmer Issarak guerrillas and Vietnamese communists (the Viet Minh) operate in the countryside.",
        "As King you can appoint governments, dissolve the Assembly, and, as you will discover, abdicate and enter politics."
    ],
    leader: { name: "Norodom Sihanouk", age: 27, title: "King of Cambodia", party: "crown" },
    leg: { name: "National Assembly", detail: "78 seats", system: "colony" },
    parties: [
        P("crown", "Royalists", "traditionalist", 25, true, "Courtiers, monks and the King's loyalists."),
        P("dem", "Democratic Party", "liberal", 50, false, "Young educated nationalists who want a constitutional monarchy and full independence."),
        P("issarak", "Khmer Issarak & communists", "communist", 25, false, "Guerrillas in the forests, some backed by the Viet Minh.")
    ],
    regions: [
        R("Phnom Penh", 15, { crown: 0 }, ["finance"], "The capital, with French, Chinese and Vietnamese quarters."),
        R("Rice plains (Battambang)", 40, { crown: 5 }, ["agrarian"], "The rice bowl of Indochina."),
        R("Mekong & Vietnamese border", 30, { crown: 2 }, ["agrarian"], "Rubber plantations and guerrilla country."),
        R("Highlands & Angkor", 15, { crown: 4 }, ["tourism", "minority"], "Angkor's ruins and hill peoples.")
    ],
    econ: { gdp: 0.4, pop: 4.3, growth: 3, taxCap: 0.3, corruption: 40, debt: 5,
            inds: { agriculture: 45, finance: 0.5, tourism: 1 } },
    res: ["tourism"],
    dev: { tech: 8, lit: 30, uni: 0.05, urban: 10 },
    mil: { base: 2, nukes: 0, prog: 0 },
    s: { stability: 45, liberty: 30, legitimacy: 65, prestige: 5 },
    align: 30, blocs: [], preset: "colony",
    pol: { religion: "established" },
    pillarNames: { colonial: "French High Commissioner", tribes: "Buddhist sangha & provincial notables", labor: "Students & Democrats", foreign: "World opinion" },
    strengths: ["The monarchy's deep popular legitimacy", "Rich rice lands and the glory of Angkor", "Sihanouk's diplomatic flair"],
    weaknesses: ["Caught between Vietnam, Thailand, China and the West", "Little education and no army of your own", "Communist guerrillas"],
    goals: [
        goal("Royal crusade for independence", "Win full independence from France.", g => g.gov.type !== "colony"),
        goal("Island of peace", "Stay out of every war through 1975.", g => g.year >= 1975 && !g.flags.at_war_ever),
        goal("Mekong development", "Double the economy.", g => g.econ.gdp >= g.econ.gdp0 * 2)
    ],
    blurb: "The French chose you as king in 1941 because they thought a teenager would be easy to control. They were wrong. You play saxophone, direct films and charm everyone. You also intend to get France out of Cambodia, and to keep Cambodia out of everyone else's wars.",
    drama: ["The Democratic Party dominates the Assembly and resents royal power.", "France will not let go of the army or the treasury.", "The Indochina war rages next door in Vietnam."],
    names: "khmer",
    hist: [[1955, 3, "Norodom Sihanouk", "dominant_party"], [1970, 3, "Lon Nol", "military_junta"], [1975, 4, "Pol Pot", "one_party"], [1979, 1, "Heng Samrin"]]
},

uruguay: {
    name: "Uruguay", flag: "🇺🇾", tier: "new", area: "Americas", status: "sovereign", gov: "presidential",
    system: "Presidential republic with a strong welfare state",
    hos: "The President is head of state and government for a 4-year term, with no immediate re-election.",
    how: [
        "The President is elected for 4 years and cannot run again immediately.",
        "The 'double simultaneous vote' (ley de lemas) lets several factions of the same party run against each other. Votes are pooled by party, and the strongest faction wins.",
        "Your Colorado Party and the Blancos (National Party) have alternated for a century. Factions matter as much as parties.",
        "José Batlle y Ordóñez built Latin America's first welfare state here and dreamed of replacing the presidency with a Swiss-style council, the 'Colegiado'.",
        "Constitutional change requires a plebiscite."
    ],
    leader: { name: "Luis Batlle Berres", age: 52, title: "President", party: "col" },
    leg: { name: "General Assembly", detail: "Chamber 99 + Senate 30", system: "pr" },
    parties: [
        P("col", "Colorado Party", "socdem", 63, true, "The party of Batlle: urban, secular, statist, welfarist.",
            [F("Lista 15 (your Batllistas)", 0.55, "socdem", "Industrial protection and welfare."),
             F("Lista 14 (Batlle Pacheco brothers)", 0.25, "socdem", "Batlle's sons: purists, champions of the Colegiado."),
             F("Non-Batllista Colorados", 0.2, "conservative", "The party's right.")]),
        P("pn", "National Party (Blancos)", "conservative", 50, false, "Rural, Catholic and conservative; Luis Alberto de Herrera leads its largest faction.",
            [F("Herreristas", 0.7, "conservative", "Herrera's followers."), F("Independent Nationalists", 0.3, "liberal", "Liberal Blancos.")]),
        P("uc", "Civic Union", "traditionalist", 6, false, "Catholic party."),
        P("left", "Socialists & Communists", "socialist", 7, false, ""),
        P("oth", "Others", "liberal", 3, false, "")
    ],
    term: { years: 4, limit: 1, served: 1, ends: [1951, 3], next: [1950, 11] },
    regions: [
        R("Montevideo", 50, { col: 6 }, ["industrial", "finance"], "Half the country lives in the capital."),
        R("The interior", 50, { col: -6 }, ["agrarian"], "Estancias, gauchos, sheep and cattle.")
    ],
    econ: { gdp: 1.2, pop: 2.2, growth: 3, taxCap: 0.8, corruption: 12, debt: 30,
            inds: { agriculture: 18, textiles: 4, chemicals: 1, finance: 4, tourism: 2 } },
    res: ["coast", "tourism"],
    dev: { tech: 55, lit: 92, uni: 2, urban: 78 },
    mil: { base: 2, nukes: 0, prog: 0 },
    s: { stability: 80, liberty: 82, legitimacy: 85, prestige: 25 },
    align: 50, blocs: [], preset: "west",
    pol: { welfare: "welfare", economy: "mixed", trade: "protection", religion: "secular", health: "subsidized" },
    pillarNames: { business: "Ranchers (Federación Rural)", labor: "Unions", party: "Colorado factions" },
    strengths: ["'The Switzerland of America': stable, educated, democratic", "Booming beef and wool exports (Korean War prices)", "Football world champions (1950, Maracanã!)"],
    weaknesses: ["Tiny domestic market", "Dependent on two commodities", "An expensive welfare state that only booms can pay for"],
    goals: [
        goal("The Colegiado", "Replace the presidency with a collegial executive.", g => g.gov.type === "directorial"),
        goal("Switzerland of America", "Keep stability above 70 in 1970.", g => g.year >= 1970 && g.s.stability >= 70),
        goal("Diversify", "Reach the 'Industrializing' stage.", g => g.dev.ind >= 35)
    ],
    blurb: "You are the nephew of the great Batlle, and you lead a country so comfortable it can afford to argue about whether it needs a president at all. Beef and wool prices are soaring. Your term ends next March. Your cousins want the Colegiado. And in July, Uruguay will beat Brazil in the World Cup final.",
    drama: ["You cannot run in November's election.", "The Batlle Pacheco brothers campaign for a collegial executive.", "Ranchers resent taxes that fund Montevideo's welfare state."],
    names: "iberian",
    hist: [[1951, 3, "Andrés Martínez Trueba"], [1952, 3, "National Council of Government", "directorial"], [1967, 3, "Óscar Gestido", "presidential"], [1967, 12, "Jorge Pacheco Areco"], [1972, 3, "Juan María Bordaberry"], [1973, 6, "Juan María Bordaberry", "military_junta"], [1985, 3, "Julio María Sanguinetti", "presidential"], [1990, 3, "Luis Alberto Lacalle"]]
}

});

// ── Non-playable states that shape the world ─────────────────────────

const NPC_NATIONS = {
    northkorea:  { name: "North Korea", flag: "🇰🇵", area: "Asia", gov: "one_party", leader: "Kim Il-sung", gdp: 1, pop: 9.5, mil: 15, stab: 60, align: -100, growth: 3 },
    eastgermany: { name: "East Germany", flag: "🇩🇪", area: "Europe", gov: "one_party", leader: "Walter Ulbricht", gdp: 9, pop: 18, mil: 8, stab: 45, align: -100, growth: 5 },
    taiwan:      { name: "Taiwan (ROC)", flag: "🇹🇼", area: "Asia", gov: "one_party", leader: "Chiang Kai-shek", gdp: 1, pop: 7.5, mil: 14, stab: 45, align: 90, growth: 6 },
    egypt:       { name: "Egypt", flag: "🇪🇬", area: "Middle East", gov: "monarchy", leader: "King Farouk", gdp: 3, pop: 21, mil: 10, stab: 35, align: 20, growth: 3 },
    cuba:        { name: "Cuba", flag: "🇨🇺", area: "Americas", gov: "presidential", leader: "Carlos Prío", gdp: 2, pop: 5.8, mil: 3, stab: 45, align: 70, growth: 2 },
    vietnam:     { name: "Viet Minh (North Vietnam)", flag: "🇻🇳", area: "Asia", gov: "one_party", leader: "Ho Chi Minh", gdp: 1, pop: 13, mil: 12, stab: 55, align: -80, growth: 2 },
    yugoslavia:  { name: "Yugoslavia", flag: "🇷🇸", area: "Europe", gov: "one_party", leader: "Josip Broz Tito", gdp: 4, pop: 16, mil: 15, stab: 65, align: -10, growth: 6 },
    italy:       { name: "Italy", flag: "🇮🇹", area: "Europe", gov: "parliamentary", leader: "Alcide De Gasperi", gdp: 20, pop: 47, mil: 15, stab: 55, align: 75, growth: 6 },
    poland:      { name: "Poland", flag: "🇵🇱", area: "Europe", gov: "one_party", leader: "Bolesław Bierut", gdp: 8, pop: 25, mil: 12, stab: 50, align: -100, growth: 5 },
    iraq:        { name: "Iraq", flag: "🇮🇶", area: "Middle East", gov: "monarchy", leader: "King Faisal II", gdp: 1.5, pop: 5.2, mil: 6, stab: 40, align: 60, growth: 5, oil: true },
    malaya:      { name: "Malaya", flag: "🇲🇾", area: "Asia", gov: "colony", leader: "British High Commissioner", gdp: 1.5, pop: 6, mil: 2, stab: 35, align: 60, growth: 4, master: "uk", indepDate: [1957, 8] },
    southvietnam:{ name: "South Vietnam", flag: "🇻🇳", area: "Asia", gov: "presidential", leader: "Ngo Dinh Diem", gdp: 1, pop: 12, mil: 6, stab: 30, align: 90, growth: 3, dormant: true }
};

const NPC_HIST = {
    egypt: [[1952, 7, "Mohamed Naguib", "military_junta", -10], [1954, 11, "Gamal Abdel Nasser"], [1970, 10, "Anwar Sadat"], [1981, 10, "Hosni Mubarak"]],
    cuba: [[1952, 3, "Fulgencio Batista", "military_junta"], [1959, 1, "Fidel Castro", "one_party", -95]],
    northkorea: [], eastgermany: [[1971, 5, "Erich Honecker"]],
    taiwan: [[1975, 4, "Chiang Ching-kuo"], [1988, 1, "Lee Teng-hui"]],
    yugoslavia: [[1980, 5, "Collective presidency"]],
    italy: [[1953, 8, "Giuseppe Pella"], [1954, 2, "Mario Scelba"], [1963, 12, "Aldo Moro"], [1976, 7, "Giulio Andreotti"], [1983, 8, "Bettino Craxi"]],
    poland: [[1956, 10, "Władysław Gomułka"], [1970, 12, "Edward Gierek"], [1981, 10, "Wojciech Jaruzelski"]],
    iraq: [[1958, 7, "Abd al-Karim Qasim", "military_junta", -40], [1963, 2, "Abdul Salam Arif"], [1968, 7, "Ahmed Hassan al-Bakr", "one_party"], [1979, 7, "Saddam Hussein"]],
    vietnam: [[1969, 9, "Lê Duẩn"]]
};

// Rivalries that can flare into war in the sandbox.
const RIVALRIES = [
    ["india", "pakistan", -50], ["israel", "egypt", -70], ["northkorea", "southkorea", -90], ["china", "taiwan", -90],
    ["china", "india", -5], ["iran", "iraq", -20], ["argentina", "uk", -10], ["russia", "china", 30], ["vietnam", "cambodia", -10],
    ["indonesia", "malaya", -10], ["ethiopia", "egypt", -10], ["saudi", "iran", -15], ["eastgermany", "germany", -80],
    ["turkey", "russia", -40], ["venezuela", "cuba", 0], ["usa", "russia", -50], ["usa", "china", -60]
];
