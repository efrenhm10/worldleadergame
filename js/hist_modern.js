// ── MODERN HISTORY — 1991 to 2026 ───────────────────────────────────
//
// Extends every country's historical leadership through 2025 and adds
// the events of the post-Cold War world. Like the earlier timeline, these
// only happen as written if the sandbox hasn't already changed things.

const MODERN_LEADERS = {
    usa: [[1993, 1, "Bill Clinton"], [2001, 1, "George W. Bush"], [2009, 1, "Barack Obama"], [2017, 1, "Donald Trump"], [2021, 1, "Joe Biden"], [2025, 1, "Donald Trump"]],
    russia: [[2000, 1, "Vladimir Putin", "dominant_party"], [2008, 5, "Dmitry Medvedev"], [2012, 5, "Vladimir Putin"]],
    china: [[1989, 6, "Jiang Zemin"], [2002, 11, "Hu Jintao"], [2012, 11, "Xi Jinping"]],
    india: [[1991, 6, "P. V. Narasimha Rao"], [1996, 6, "H. D. Deve Gowda"], [1998, 3, "Atal Bihari Vajpayee"], [2004, 5, "Manmohan Singh"], [2014, 5, "Narendra Modi"]],
    uk: [[1997, 5, "Tony Blair"], [2007, 6, "Gordon Brown"], [2010, 5, "David Cameron"], [2016, 7, "Theresa May"], [2019, 7, "Boris Johnson"], [2022, 9, "Liz Truss"], [2022, 10, "Rishi Sunak"], [2024, 7, "Keir Starmer"]],
    france: [[1995, 5, "Jacques Chirac"], [2007, 5, "Nicolas Sarkozy"], [2012, 5, "François Hollande"], [2017, 5, "Emmanuel Macron"]],
    germany: [[1998, 10, "Gerhard Schröder"], [2005, 11, "Angela Merkel"], [2021, 12, "Olaf Scholz"], [2025, 5, "Friedrich Merz"]],
    japan: [[1991, 11, "Kiichi Miyazawa"], [1993, 8, "Morihiro Hosokawa"], [1994, 6, "Tomiichi Murayama"], [1996, 1, "Ryutaro Hashimoto"], [1998, 7, "Keizo Obuchi"], [2000, 4, "Yoshiro Mori"], [2001, 4, "Junichiro Koizumi"], [2006, 9, "Shinzo Abe"], [2007, 9, "Yasuo Fukuda"], [2008, 9, "Taro Aso"], [2009, 9, "Yukio Hatoyama"], [2010, 6, "Naoto Kan"], [2011, 9, "Yoshihiko Noda"], [2012, 12, "Shinzo Abe"], [2020, 9, "Yoshihide Suga"], [2021, 10, "Fumio Kishida"], [2024, 10, "Shigeru Ishiba"], [2025, 10, "Sanae Takaichi"]],
    brazil: [[1992, 12, "Itamar Franco"], [1995, 1, "Fernando Henrique Cardoso"], [2003, 1, "Luiz Inácio Lula da Silva"], [2011, 1, "Dilma Rousseff"], [2016, 8, "Michel Temer"], [2019, 1, "Jair Bolsonaro"], [2023, 1, "Luiz Inácio Lula da Silva"]],
    canada: [[1993, 11, "Jean Chrétien"], [2003, 12, "Paul Martin"], [2006, 2, "Stephen Harper"], [2015, 11, "Justin Trudeau"], [2025, 3, "Mark Carney"]],
    australia: [[1991, 12, "Paul Keating"], [1996, 3, "John Howard"], [2007, 12, "Kevin Rudd"], [2010, 6, "Julia Gillard"], [2013, 6, "Kevin Rudd"], [2013, 9, "Tony Abbott"], [2015, 9, "Malcolm Turnbull"], [2018, 8, "Scott Morrison"], [2022, 5, "Anthony Albanese"]],
    southkorea: [[1993, 2, "Kim Young-sam"], [1998, 2, "Kim Dae-jung"], [2003, 2, "Roh Moo-hyun"], [2008, 2, "Lee Myung-bak"], [2013, 2, "Park Geun-hye"], [2017, 5, "Moon Jae-in"], [2022, 5, "Yoon Suk-yeol"], [2025, 6, "Lee Jae-myung"]],
    mexico: [[1994, 12, "Ernesto Zedillo"], [2000, 12, "Vicente Fox", "presidential"], [2006, 12, "Felipe Calderón"], [2012, 12, "Enrique Peña Nieto"], [2018, 12, "Andrés Manuel López Obrador"], [2024, 10, "Claudia Sheinbaum"]],
    indonesia: [[1998, 5, "B. J. Habibie", "presidential"], [1999, 10, "Abdurrahman Wahid"], [2001, 7, "Megawati Sukarnoputri"], [2004, 10, "Susilo Bambang Yudhoyono"], [2014, 10, "Joko Widodo"], [2024, 10, "Prabowo Subianto"]],
    turkey: [[1991, 11, "Süleyman Demirel"], [1993, 6, "Tansu Çiller"], [1997, 6, "Mesut Yılmaz"], [1999, 1, "Bülent Ecevit"], [2003, 3, "Recep Tayyip Erdoğan"], [2018, 7, "Recep Tayyip Erdoğan", "presidential"]],
    saudi: [[2005, 8, "King Abdullah"], [2015, 1, "King Salman"]],
    nigeria: [[1993, 11, "Sani Abacha", "military_junta"], [1998, 6, "Abdulsalami Abubakar"], [1999, 5, "Olusegun Obasanjo", "presidential"], [2007, 5, "Umaru Yar'Adua"], [2010, 5, "Goodluck Jonathan"], [2015, 5, "Muhammadu Buhari"], [2023, 5, "Bola Tinubu"]],
    southafrica: [[1994, 5, "Nelson Mandela"], [1999, 6, "Thabo Mbeki"], [2008, 9, "Kgalema Motlanthe"], [2009, 5, "Jacob Zuma"], [2018, 2, "Cyril Ramaphosa"]],
    argentina: [[1999, 12, "Fernando de la Rúa"], [2002, 1, "Eduardo Duhalde"], [2003, 5, "Néstor Kirchner"], [2007, 12, "Cristina Fernández de Kirchner"], [2015, 12, "Mauricio Macri"], [2019, 12, "Alberto Fernández"], [2023, 12, "Javier Milei"]],
    iran: [[1989, 6, "Ali Khamenei"]],
    israel: [[1992, 7, "Yitzhak Rabin"], [1995, 11, "Shimon Peres"], [1996, 6, "Benjamin Netanyahu"], [1999, 7, "Ehud Barak"], [2001, 3, "Ariel Sharon"], [2006, 1, "Ehud Olmert"], [2009, 3, "Benjamin Netanyahu"], [2021, 6, "Naftali Bennett"], [2022, 7, "Yair Lapid"], [2022, 12, "Benjamin Netanyahu"]],
    pakistan: [[1990, 11, "Nawaz Sharif"], [1993, 10, "Benazir Bhutto"], [1997, 2, "Nawaz Sharif"], [1999, 10, "Pervez Musharraf", "military_junta"], [2008, 3, "Yousaf Raza Gillani", "parliamentary"], [2013, 6, "Nawaz Sharif"], [2018, 8, "Imran Khan"], [2022, 4, "Shehbaz Sharif"]],
    philippines: [[1992, 6, "Fidel Ramos"], [1998, 6, "Joseph Estrada"], [2001, 1, "Gloria Macapagal Arroyo"], [2010, 6, "Benigno Aquino III"], [2016, 6, "Rodrigo Duterte"], [2022, 6, "Ferdinand Marcos Jr."]],
    ethiopia: [[1991, 5, "Meles Zenawi", "dominant_party"], [2012, 8, "Hailemariam Desalegn"], [2018, 4, "Abiy Ahmed"]],
    venezuela: [[1994, 2, "Rafael Caldera"], [1999, 2, "Hugo Chávez"], [2007, 1, "Hugo Chávez", "dominant_party"], [2013, 4, "Nicolás Maduro"]],
    norway: [[1990, 11, "Gro Harlem Brundtland"], [1996, 10, "Thorbjørn Jagland"], [1997, 10, "Kjell Magne Bondevik"], [2000, 3, "Jens Stoltenberg"], [2001, 10, "Kjell Magne Bondevik"], [2005, 10, "Jens Stoltenberg"], [2013, 10, "Erna Solberg"], [2021, 10, "Jonas Gahr Støre"]],
    fiji: [[1992, 6, "Sitiveni Rabuka", "parliamentary"], [1999, 5, "Mahendra Chaudhry"], [2000, 7, "Laisenia Qarase"], [2006, 12, "Frank Bainimarama", "military_junta"], [2014, 9, "Frank Bainimarama", "parliamentary"], [2022, 12, "Sitiveni Rabuka"]],
    newzealand: [[1990, 11, "Jim Bolger"], [1997, 12, "Jenny Shipley"], [1999, 12, "Helen Clark"], [2008, 11, "John Key"], [2016, 12, "Bill English"], [2017, 10, "Jacinda Ardern"], [2023, 1, "Chris Hipkins"], [2023, 11, "Christopher Luxon"]],
    barbados: [[1994, 9, "Owen Arthur"], [2008, 1, "David Thompson"], [2010, 10, "Freundel Stuart"], [2018, 5, "Mia Mottley"]],
    singapore: [[1990, 11, "Goh Chok Tong"], [2004, 8, "Lee Hsien Loong"], [2024, 5, "Lawrence Wong"]],
    uae: [[2004, 11, "Sheikh Khalifa bin Zayed"], [2022, 5, "Sheikh Mohamed bin Zayed"]],
    cambodia: [[1985, 1, "Hun Sen"], [1993, 9, "Hun Sen", "dominant_party"], [2023, 8, "Hun Manet"]],
    uruguay: [[1995, 3, "Julio María Sanguinetti"], [2000, 3, "Jorge Batlle"], [2005, 3, "Tabaré Vázquez"], [2010, 3, "José Mujica"], [2015, 3, "Tabaré Vázquez"], [2020, 3, "Luis Lacalle Pou"], [2025, 3, "Yamandú Orsi"]]
};
Object.entries(MODERN_LEADERS).forEach(([k, list]) => { COUNTRIES[k].hist = (COUNTRIES[k].hist || []).concat(list).sort((a, b) => ymNum(a[0], a[1]) - ymNum(b[0], b[1])); });
Object.assign(NPC_HIST, {
    northkorea: [[1994, 7, "Kim Jong-il"], [2011, 12, "Kim Jong-un"]],
    egypt: (NPC_HIST.egypt || []).concat([[2011, 2, "Supreme Council of the Armed Forces", "military_junta"], [2012, 6, "Mohamed Morsi", "presidential"], [2013, 7, "Abdel Fattah el-Sisi", "military_junta"]]),
    cuba: (NPC_HIST.cuba || []).concat([[2008, 2, "Raúl Castro"], [2018, 4, "Miguel Díaz-Canel"]]),
    iraq: (NPC_HIST.iraq || []).concat([[2003, 4, "Coalition Provisional Authority", "occupied", 60], [2005, 4, "Iraqi coalition government", "parliamentary"]]),
    ukraine: [[1994, 7, "Leonid Kuchma"], [2005, 1, "Viktor Yushchenko"], [2010, 2, "Viktor Yanukovych"], [2014, 6, "Petro Poroshenko"], [2019, 5, "Volodymyr Zelenskyy"]],
    taiwan: (NPC_HIST.taiwan || []).concat([[2000, 5, "Chen Shui-bian", "presidential"], [2008, 5, "Ma Ying-jeou"], [2016, 5, "Tsai Ing-wen"], [2024, 5, "Lai Ching-te"]])
});
NPC_NATIONS.ukraine = { name: "Ukraine", flag: "🇺🇦", area: "Europe", gov: "presidential", leader: "Leonid Kravchuk", gdp: 25, pop: 52, mil: 20, stab: 45, align: 10, growth: 1, dormant: true };

// ── Modern events ───────────────────────────────────────────────────

HIST.push(
{ id: "ukraine_indep", y: 1991, m: 12, cond: () => !isP("russia") || G.flags.ussr_breakup,
  fire: () => { const u = G.nations.ukraine; if (u && u.status === "dormant") { u.status = "sovereign"; u.gdp = Math.max(5, (G.nations.russia ? G.nations.russia.gdp : 100) * 0.12); setRel("ukraine", "russia", 20); setRel("ukraine", "usa", 20); } } },
{ id: "india_1991", y: 1991, m: 7, cond: () => isP("india") && G.pol.economy !== "market", fire: () => hq("india91") },
{ id: "maastricht", y: 1992, m: 2, cond: () => G.blocs.ecsc.length >= 3, fire: () => { BLOCS.ecsc.name = "European Union"; W("🇪🇺 The Maastricht Treaty creates the European Union."); } },
{ id: "oslo", y: 1993, m: 9, cond: () => isP("israel"), fire: () => hq("oslo") },
{ id: "sa_democracy", y: 1994, m: 4, cond: () => alive("southafrica"),
  fire: () => { if (isP("southafrica")) { if (G.pol.rights === "segregation") hq("mandela"); return; } W("🇿🇦 South Africa holds its first democratic election. Nelson Mandela becomes president."); } },
{ id: "nafta", y: 1994, m: 1, cond: () => isP("usa", "mexico", "canada"), fire: () => hq("nafta") },
{ id: "asian_crisis", y: 1997, m: 7, cond: () => true,
  fire: () => {
      ["southkorea", "indonesia", "philippines", "singapore", "malaya"].forEach(k => { if (ai(k)) { G.nations[k].gdp *= 0.9; G.nations[k].stab -= 10; } });
      log("📉 The Asian financial crisis: currencies collapse from Bangkok to Seoul.", "major");
      if (isP("southkorea", "indonesia", "philippines", "singapore", "cambodia")) hq("asian_crisis");
  } },
{ id: "hk_handover", y: 1997, m: 7, cond: () => isP("uk", "china"), fire: () => { applyEffects({ prestige: isP("china") ? 6 : -2 }); log("🇭🇰 Hong Kong returns to Chinese sovereignty.", "major"); } },
{ id: "nukes98", y: 1998, m: 5, cond: () => true,
  fire: () => {
      ["india", "pakistan"].forEach(k => { if (ai(k)) G.nations[k].nukes = 2; });
      G.tension = clamp(G.tension + 6);
      W("☢️ India and Pakistan both conduct nuclear tests.");
      if (isP("india", "pakistan") && G.mil.nukes < 2) hq("nukes98");
  } },
{ id: "euro", y: 1999, m: 1, cond: () => G.blocs.ecsc.includes(G.ck) && !isP("uk"), fire: () => hq("euro") },
{ id: "dotcom", y: 2000, m: 3, cond: () => true, fire: () => { const hi = indShare("computing") + indShare("electronics"); applyEffects({ growth: -0.5 - hi * 0.1 }); W("📉 The dot-com bubble bursts."); } },
{ id: "nine_eleven", y: 2001, m: 9, cond: () => alive("usa"),
  fire: () => {
      G.tension = clamp(G.tension + 12);
      log("🕯️ 11 September 2001: terrorist attacks destroy the World Trade Center and hit the Pentagon.", "major");
      if (isP("usa")) return hq("sept11");
      if (ai("usa")) { const reb = ensureRebels("afghanistan", "Taliban", 3); G.nations[reb].area = "Asia"; startWar({ name: "War in Afghanistan", a: [reb], b: ["usa"], type: "insurgency", front: -30, commit: { usa: 1 } }); }
      if (G.blocs.nato.includes(G.ck)) hq("nato_article5");
  } },
{ id: "iraq_war", y: 2003, m: 3, cond: () => alive("iraq") && G.nations.iraq.gov !== "parliamentary",
  fire: () => {
      if (isP("usa")) return hq("iraq_usa");
      if (isP("uk", "australia")) hq("iraq_ally");
      if (ai("usa")) { const w = startWar({ name: "Iraq War", a: ["usa"], b: ["iraq"], type: "conquest", front: 30 }); if (w) w.mom = 20; }
      W("⚔️ A US-led coalition invades Iraq.");
  } },
{ id: "tsunami", y: 2004, m: 12, cond: () => isP("indonesia", "india"), fire: () => hq("tsunami") },
{ id: "nk_bomb", y: 2006, m: 10, cond: () => alive("northkorea"), fire: () => { G.nations.northkorea.nukes = 2; G.tension = clamp(G.tension + 5); W("☢️ North Korea conducts its first nuclear test."); } },
{ id: "oil_spike", y: 2005, m: 1, cond: () => true, fire: () => { G.oilPrice *= 2; W("🛢️ Oil prices soar on Chinese and Indian demand."); } },
{ id: "gfc", y: 2008, m: 9, cond: () => true,
  fire: () => {
      Object.values(G.nations).forEach(n => { if (n.key !== G.ck && n.gdp) n.gdp *= 0.95; });
      G.oilPrice *= 0.6;
      log("📉 Lehman Brothers collapses. A global financial crisis begins.", "major");
      hq("gfc");
  } },
{ id: "arab_spring", y: 2011, m: 1, cond: () => true,
  fire: () => { log("✊ The Arab Spring: uprisings spread from Tunisia to Egypt, Libya and Syria.", "major"); if (isP("saudi", "uae", "iran", "egypt") || (G.ck === "turkey")) hq("arab_spring"); } },
{ id: "fukushima", y: 2011, m: 3, cond: () => isP("japan"), fire: () => hq("fukushima") },
{ id: "oil_crash14", y: 2014, m: 11, cond: () => true, fire: () => { G.oilPrice *= 0.55; W("🛢️ Oil prices crash as US shale floods the market."); } },
{ id: "crimea", y: 2014, m: 3, cond: () => alive("ukraine") && alive("russia"),
  fire: () => {
      if (isP("russia")) return hq("crimea_russia");
      G.tension = clamp(G.tension + 8); addRel("russia", "ukraine", -50); addRel("russia", "usa", -20);
      W("🇺🇦 Russia annexes Crimea from Ukraine.");
      if (G.align > 30 && !isP("ukraine")) hq("sanctions_russia");
  } },
{ id: "paris_climate", y: 2015, m: 12, cond: () => true, fire: () => hq("paris_climate") },
{ id: "brexit", y: 2016, m: 6, cond: () => alive("uk") && G.blocs.ecsc.includes("uk"),
  fire: () => { if (isP("uk")) return hq("brexit"); leaveBloc("ecsc", "uk"); W("🇬🇧 Britain votes to leave the European Union."); } },
{ id: "trade_war", y: 2018, m: 7, cond: () => alive("china") && alive("usa"),
  fire: () => { addRel("usa", "china", -15); if (isP("usa", "china")) hq("trade_war"); else W("📦 The US and China slap tariffs on each other's goods."); } },
{ id: "covid", y: 2020, m: 3, cond: () => true,
  fire: () => {
      Object.values(G.nations).forEach(n => { if (n.key !== G.ck && n.gdp) n.gdp *= 0.94; });
      G.oilPrice *= 0.6;
      log("🦠 A novel coronavirus becomes a global pandemic.", "major");
      hq("covid");
  } },
{ id: "kabul", y: 2021, m: 8, cond: () => !!warNamed("War in Afghanistan"), fire: () => { endWar(warNamed("War in Afghanistan"), "a"); log("🇦🇫 The Taliban retake Kabul as Western forces withdraw.", "major"); } },
{ id: "ukraine_war", y: 2022, m: 2, cond: () => alive("ukraine") && alive("russia") && G.nations.russia.align < 20 && getRel("russia", "ukraine") < 0,
  fire: () => {
      if (isP("russia")) return hq("ukraine_russia");
      const w = startWar({ name: "Russo-Ukrainian War", a: ["russia"], b: ["ukraine"], type: "conquest", front: 15 });
      G.oilPrice *= 1.5; G.tension = clamp(G.tension + 15);
      log("🚨 24 February 2022: Russia launches a full-scale invasion of Ukraine.", "major");
      if (w && G.align > 30 && !isP("ukraine")) hq("ukraine_aid", { id: w.id });
  } },
{ id: "ai_boom", y: 2023, m: 1, cond: () => true, fire: () => hq("ai_boom") },
{ id: "gaza", y: 2023, m: 10, cond: () => isP("israel"), fire: () => hq("gaza") },
{ id: "tariffs25", y: 2025, m: 4, cond: () => alive("usa") && !isP("usa"), fire: () => { applyEffects({ growth: -0.4 - indShare("autos") * 0.05 }); W("📦 Washington announces sweeping tariffs on imports from almost every country."); } },
{ id: "present_day", y: 2026, m: 10, win: 60, cond: () => true, fire: () => hq("present_day") }
);

// ── Modern scenes ───────────────────────────────────────────────────

hscene("india91", () => S("💱", `${dateStr()} · Balance-of-payments crisis`, "India has two weeks of imports left",
    "Foreign exchange reserves have collapsed. The IMF offers a loan if you open the economy: cut tariffs, end the 'License Raj', welcome foreign investment.",
    [ch("Liberalize", { growth: 1, p: { business: 12, labor: -6 } }, "Growth takes off within a few years.", { run: () => { G.pol.economy = "market"; G.pol.trade = "trade_free"; } }),
     ch("Muddle through with emergency borrowing", { cost: 1, inflation: 2 }, "")]));

hscene("oslo", () => S("🕊️", `${dateStr()} · Oslo`, "A secret peace channel",
    "Negotiators in Norway have drafted a framework for Palestinian self-rule in exchange for recognition and peace.",
    [ch("Sign the Oslo Accords", { prestige: 10, p: { people: -4 }, fac: { herut: -15 }, tension: -3 }, "A handshake on the White House lawn."),
     ch("Walk away", { prestige: -3 }, "")]));

hscene("nafta", () => S("🤝", `${dateStr()} · North America`, "NAFTA",
    "The North American Free Trade Agreement would eliminate most tariffs between the US, Canada and Mexico.",
    [ch("Join NAFTA", { growth: 0.6, p: { business: 8, labor: -8 }, rel: { usa: 8, mexico: 8, canada: 8 } }, "Trade booms; some factory towns suffer.", { run: () => { G.pol.trade = "trade_free"; } }),
     ch("Stay out", { p: { labor: 4 } }, "")]));

hscene("asian_crisis", () => S("📉", `${dateStr()} · Markets`, "The Asian financial crisis hits",
    "Your currency is in free fall as foreign capital flees. The IMF offers a rescue package with harsh conditions.",
    [ch("Accept the IMF program", { growth: -3, unemp: 3, p: { people: -10, business: 5 }, cash: 3 }, "Painful austerity; markets stabilize."),
     ch("Impose capital controls", { growth: -2, p: { business: -8, people: 2 }, prestige: -2 }, "Malaysia-style defiance."),
     ch("Let it burn", { growth: -5, unemp: 5, stability: -12, p: { people: -15 } }, "")]));

hscene("nukes98", () => S("☢️", `${dateStr()} · Pokhran / Chagai`, "Your rival has tested",
    "Your rival has just conducted nuclear tests. Your scientists say a device could be ready within weeks.",
    [ch("Test our own", { prestige: 10, tension: 6, p: { military: 10, people: 8 }, rel: { usa: -15 } }, "", { run: () => { G.mil.nukes = 2; record(`Tested a nuclear device, ${dateStr()}.`); } }),
     ch("Show restraint", { prestige: 4, rel: { usa: 10 }, p: { military: -6 } }, "")]));

hscene("euro", () => S("💶", `${dateStr()} · Frankfurt`, "The euro",
    "Your European partners are launching a single currency, managed by a European Central Bank.",
    [ch("Adopt the euro", { growth: 0.3, inflation: -1, p: { business: 6, people: -2 } }, "Monetary policy now belongs to Frankfurt.", { run: () => { G.flags.euro = true; } }),
     ch("Keep our own currency", { p: { people: 3 } }, "")]));

hscene("sept11", () => S("🕯️", `${dateStr()} · Washington`, "The nation has been attacked",
    "Nearly 3,000 people are dead. Al-Qaeda, sheltered by the Taliban in Afghanistan, is responsible. The country wants action.",
    [ch("Invade Afghanistan", { p: { people: 15, military: 8 }, tension: 5 }, "", { run: () => { const reb = ensureRebels("afghanistan", "Taliban", 3); G.nations[reb].area = "Asia"; startWar({ name: "War in Afghanistan", a: [reb], b: [G.ck], type: "insurgency", front: -40, commit: { [G.ck]: 2 } }); return "The war in Afghanistan begins."; } }),
     ch("Targeted strikes and special forces only", { p: { people: 8 } }, ""),
     ch("Treat it as a law-enforcement matter", { p: { people: -10, military: -6 } }, "")]));

hscene("nato_article5", () => S("🛡️", `${dateStr()} · NATO`, "Article 5 invoked",
    "For the first time, NATO invokes Article 5: an attack on one is an attack on all. Washington asks for troops for Afghanistan.",
    [ch("Send troops", { rel: { usa: 12 }, p: { military: 3 } }, "", { run: () => { const w = warNamed("War in Afghanistan"); if (w) { w.b.push(G.ck); w.commit[G.ck] = 1; } } }),
     ch("Send aid and sympathy only", { rel: { usa: -6 } }, "")]));

hscene("iraq_usa", () => S("⚔️", `${dateStr()} · The Oval Office`, "Iraq",
    "Intelligence agencies claim Saddam Hussein has weapons of mass destruction. Some allies are skeptical.",
    [ch("Invade", { p: { military: 6 }, tension: 8 }, "", { run: () => { const w = startWar({ name: "Iraq War", a: [G.ck], b: ["iraq"], type: "conquest", front: 30 }); if (w) w.mom = 20; return "The invasion begins."; } }),
     ch("Keep up inspections and sanctions", { prestige: 2 }, "")]));

hscene("iraq_ally", () => S("⚔️", `${dateStr()} · Iraq`, "Washington asks you to join the invasion of Iraq",
    "Your intelligence services are divided on whether Saddam has weapons of mass destruction. Public opinion is against the war.",
    [ch("Join the coalition", { rel: { usa: 15 }, p: { people: -10, press: -8 } }, "", { run: () => { const w = warNamed("Iraq War"); if (w) { w.a.push(G.ck); w.commit[G.ck] = 1; } } }),
     ch("Refuse", { rel: { usa: -10 }, p: { people: 6 } }, "")]));

hscene("tsunami", () => S("🌊", `${dateStr()} · Indian Ocean`, "Tsunami",
    "A magnitude 9.1 earthquake off Sumatra has sent a tsunami across the Indian Ocean. Coastal towns are gone.",
    [ch("Mobilize everything and accept foreign aid", { cost: 1, p: { people: 6 }, prestige: 2 }, "The relief effort is massive."),
     ch("Handle it ourselves", { cost: 1.5, p: { people: -4 }, prestige: 3 }, "")]));

hscene("gfc", () => S("📉", `${dateStr()} · Markets`, "The global financial crisis",
    "Credit markets have frozen. Banks are failing. Your economy is heading into recession.",
    [ch("Bail out the banks and stimulate", { cost: 4, growth: -1.5, p: { business: 8, people: -4 }, scandal: 4 }, "The recession is shorter, the debt larger."),
     ch("Austerity: balance the budget", { growth: -4, unemp: 3, p: { people: -8, business: 3 } }, "A long, grinding recession."),
     ch("Let failing banks fail", { growth: -5, unemp: 4, p: { business: -15, people: 4 } }, "")]));

hscene("arab_spring", () => S("✊", `${dateStr()} · The region is ablaze`, "The Arab Spring reaches you",
    "Young protesters, organized on social media, are gathering in the capital demanding jobs, dignity and an end to corruption.",
    [ch("Spend heavily: subsidies, jobs, housing", { cost: 3, p: { people: 10 }, inflation: 1 }, "The protests subside."),
     ch("Crack down hard", { liberty: -10, p: { people: -10, security: 8 }, stability: 5, prestige: -6 }, ""),
     ch("Offer political reforms", { liberty: 8, p: { people: 6, royals: -8, clergy: -4 } }, "")]));

hscene("fukushima", () => S("☢️", `${dateStr()} · Fukushima`, "Earthquake, tsunami, meltdown",
    "A magnitude 9.0 earthquake and tsunami have killed thousands. Three reactors at Fukushima Daiichi are melting down.",
    [ch("Shut down all nuclear plants", { growth: -1, p: { people: 6 }, oil: 3 }, "Energy imports soar."),
     ch("Restart reactors after safety checks", { p: { people: -6, business: 6 } }, "")]));

hscene("crimea_russia", () => S("🇺🇦", `${dateStr()} · Kyiv`, "Ukraine turns West",
    "Protesters in Kyiv have ousted Ukraine's pro-Moscow president. The Black Sea Fleet's base in Crimea is at stake.",
    [ch("Annex Crimea", { p: { people: 15, military: 8 }, prestige: 4, tension: 10, rel: { usa: -30, ukraine: -60, uk: -20, germany: -20 }, growth: -1 }, "Sanctions follow."),
     ch("Accept the new Ukraine", { p: { military: -10, people: -6 } }, "")]));

hscene("sanctions_russia", () => S("🇷🇺", `${dateStr()} · Sanctions`, "Sanction Russia?",
    "Russia has annexed Crimea. Your allies propose sanctions.",
    [ch("Impose sanctions", { rel: { russia: -20, usa: 5 }, growth: -0.2 }, ""),
     ch("Keep trading", { rel: { russia: 5, usa: -8 } }, "")]));

hscene("paris_climate", () => S("🌍", `${dateStr()} · Paris`, "The Paris climate agreement",
    "195 countries are pledging to cut emissions to keep warming 'well below' 2°C.",
    [ch("Sign and invest in renewables", { prestige: 4, p: { press: 4, business: -3 } }, "", { run: () => { G.ind.renewables.sup = Math.max(G.ind.renewables.sup, 2); } }),
     ch("Sign, then do little", { prestige: 1 }, ""),
     ch("Refuse", { prestige: -4, p: { business: 3 } }, "")]));

hscene("brexit", () => S("🇬🇧", `${dateStr()} · Referendum`, "Leave or Remain?",
    "Pressure from your own backbenchers has forced a referendum on European Union membership.",
    [ch("Campaign to Remain", {}, "", { run: () => { if (chance(clamp(0.45 + (approval() - 50) / 120, 0.2, 0.8))) return "Remain wins narrowly."; leaveBloc("ecsc", G.ck); applyEffects({ growth: -0.8, p: { party: -10 } }); return "Leave wins, 52–48."; } }),
     ch("Back Leave", { p: { party: 5 }, growth: -0.8, rel: { germany: -10, france: -10 } }, "Britain leaves the EU.", { run: () => leaveBloc("ecsc", G.ck) })]));

hscene("trade_war", () => S("📦", `${dateStr()} · Trade war`, "Tariffs",
    "The world's two biggest economies are slapping tariffs on each other.",
    [ch("Escalate", { growth: -0.5, p: { labor: 4, business: -6 } }, ""),
     ch("Negotiate a 'phase one' deal", { capital: -5 }, "")]));

hscene("covid", () => S("🦠", `${dateStr()} · Pandemic`, "COVID-19",
    "The virus is spreading exponentially. Hospitals are filling. Your health minister wants a lockdown; your finance minister is terrified.",
    [ch("Strict lockdown and wage support", { growth: -6, cost: 8, p: { people: 6, business: -8 } }, "Fewer deaths, huge debt."),
     ch("Targeted measures: masks, testing, protect the vulnerable", { growth: -4, cost: 4, p: { people: 2 } }, ""),
     ch("Keep the economy open", { growth: -2, p: { people: -12, business: 8 } }, "Hospitals overflow.", { run: () => { G.s.health = clamp(G.s.health - 4); } })]));

hscene("ukraine_russia", () => S("🇺🇦", `${dateStr()} · The Kremlin`, "Ukraine",
    "Your generals say Kyiv can be taken in three days.",
    [ch("Invade", { tension: 15, rel: { usa: -40, uk: -30, germany: -30, france: -30 }, growth: -2 }, "", { run: () => { startWar({ name: "Russo-Ukrainian War", a: [G.ck], b: ["ukraine"], type: "conquest", front: 15 }); return "The invasion begins. It will not take three days."; } }),
     ch("Keep up pressure without invading", { p: { military: -5 } }, "")]));

hscene("ukraine_aid", a => S("🇺🇦", `${dateStr()} · Kyiv`, "Ukraine asks for help",
    "Ukraine is fighting for its survival and asks for weapons, money and sanctions on Russia.",
    [ch("Send weapons and money", { cost: 0.3, rel: { ukraine: 25, russia: -25, usa: 5 } }, "", { run: () => { const w = G.wars.find(x => x.id === a.id); if (w) w.b.forEach(() => {}); if (w) { w.commit[G.ck] = 0; } G.nations.ukraine.mil *= 1.1; } }),
     ch("Sanctions only", { rel: { russia: -15 }, growth: -0.2 }, ""),
     ch("Stay neutral", { rel: { russia: 5, ukraine: -10, usa: -8 } }, "")]));

hscene("ai_boom", () => S("🤖", `${dateStr()} · The AI boom`, "Artificial intelligence",
    "Large language models have stunned the world. Tech giants are spending hundreds of billions on data centers. Your industry minister wants a national AI strategy.",
    [ch("National AI crusade: chips, data centers, universities", { cost: 1, p: { business: 6 } }, "", { run: () => { G.ind.ai.sup = 3; G.pol.science = "national_labs"; } }),
     ch("Regulate first", { p: { press: 4, business: -3 }, prestige: 2 }, "", { run: () => { G.ind.ai.sup = Math.max(G.ind.ai.sup, 1); } }),
     ch("Leave it to the market", {}, "")]));

hscene("gaza", () => S("🚨", `${dateStr()} · 7 October`, "Hamas attacks Israel",
    "Hamas fighters have broken through the Gaza border fence, killing about 1,200 people and taking 250 hostages.",
    [ch("All-out war in Gaza", { p: { people: 10, military: 8 }, prestige: -10, tension: 8, rel: { usa: -5, egypt: -15 } }, "The war will last years."),
     ch("Limited operations and hostage negotiations", { p: { people: -6 } }, "")]));

hscene("present_day", () => {
    const yrs = Math.round(G.t / 52);
    return S("📅", `${dateStr()}`, "The present day",
        `You have reached the present, ${yrs} years after January 1950. ${C().name}'s history is now your own: GDP ${nominal(G.econ.gdp)}, ${devStage()} economy, ${Math.round(G.dev.lit)}% literacy, ${GOV_TYPES[G.gov.type].name}.`,
        [ch("Keep playing into the future", {}, "History is unwritten from here."),
         ch("End here and see my legacy", {}, "", { run: () => fallFromPower("retired", "You reached the present day.", true) })]);
});
