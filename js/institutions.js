// ── INTERNATIONAL INSTITUTIONS ──────────────────────────────────────
//
// The postwar order as it actually worked. Countries join on their real
// dates unless you change history:
//
// - The IMF lends to countries in crisis, on conditions that changed with
//   the era: devaluation and credit ceilings in the 1950s–70s, structural
//   adjustment (end subsidies, privatize, open trade) in the 1980s–90s, and
//   social-spending floors and governance from 2000. Reviews every six
//   months decide whether the money keeps coming.
// - The World Bank (IDA for the poorest from 1960) and the regional
//   development banks finance projects in your capital program.
// - GATT, the WTO from 1995, cuts tariffs and limits subsidies.
// - The UN gives every member a voice each September; the Security Council
//   can sanction an aggressor unless one of the five permanent members vetoes.
// - The OECD (the rich democracies' club), the G7 and the G20.
// - The Paris Club and the HIPC initiative write down unpayable debts.

const INST = {
    un:   { name: "United Nations", icon: "🇺🇳", from: 1945, desc: "A seat in the General Assembly. The Security Council can authorize force or sanction aggressors; its five permanent members (US, UK, France, the USSR/Russia and China) each have a veto." },
    imf:  { name: "International Monetary Fund", icon: "💵", from: 1945, desc: "Lends to members in a balance-of-payments or debt crisis, on conditions. Membership also comes with an annual health check of your economy (Article IV)." },
    wb:   { name: "World Bank", icon: "🏦", from: 1945, desc: "Long-term loans for roads, dams, power, schools and clinics. Requires IMF membership. IDA, its fund for the poorest countries, lends on near-grant terms from 1960.", needs: "imf" },
    gatt: { name: "GATT", icon: "🚢", from: 1948, desc: "The General Agreement on Tariffs and Trade. Members cut tariffs round by round: exporters gain, tariff revenue shrinks. It becomes the WTO in 1995, with binding dispute settlement and limits on industrial subsidies." },
    oecd: { name: "OECD", icon: "📊", from: 1961, desc: "The club of rich market democracies. Peer reviews, policy advice and a seal of approval that reassures investors." },
    g7:   { name: "G7", icon: "🗻", from: 1975, desc: "Annual summit of the largest Western economies: the US, Japan, West Germany, France, the UK, Italy and Canada.", invite: true },
    g20:  { name: "G20", icon: "🌐", from: 1999, desc: "Finance ministers of the 20 largest economies from 1999; leaders' summits from the 2008 crash.", invite: true }
};
const instName = k => k === "gatt" && G.year >= 1995 ? "World Trade Organization" : INST[k].name;

// When each country joined in real life (null = never by 2026).
const INST_JOIN = {
    un: { usa: 1945, china: 1971, russia: 1945, india: 1945, uk: 1945, france: 1945, germany: 1973, japan: 1956, brazil: 1945, canada: 1945, australia: 1945, southkorea: 1991, mexico: 1945, indonesia: 1950, turkey: 1945, saudi: 1945, nigeria: 1960, southafrica: 1945, argentina: 1945, iran: 1945, israel: 1949, pakistan: 1947, philippines: 1945, ethiopia: 1945, venezuela: 1945, norway: 1945, switzerland: 2002, fiji: 1970, newzealand: 1945, barbados: 1966, singapore: 1965, uae: 1971, cambodia: 1955, uruguay: 1945 },
    imf: { usa: 1945, china: 1980, russia: 1992, india: 1945, uk: 1945, france: 1945, germany: 1952, japan: 1952, brazil: 1946, canada: 1945, australia: 1947, southkorea: 1955, mexico: 1945, indonesia: 1954, turkey: 1947, saudi: 1957, nigeria: 1961, southafrica: 1945, argentina: 1956, iran: 1945, israel: 1954, pakistan: 1950, philippines: 1945, ethiopia: 1945, venezuela: 1946, norway: 1945, switzerland: 1992, fiji: 1971, newzealand: 1961, barbados: 1970, singapore: 1966, uae: 1972, cambodia: 1969, uruguay: 1946 },
    gatt: { usa: 1948, china: 2001, russia: 2012, india: 1948, uk: 1948, france: 1948, germany: 1951, japan: 1955, brazil: 1948, canada: 1948, australia: 1948, southkorea: 1967, mexico: 1986, indonesia: 1950, turkey: 1951, saudi: 2005, nigeria: 1960, southafrica: 1948, argentina: 1967, iran: null, israel: 1962, pakistan: 1948, philippines: 1979, ethiopia: null, venezuela: 1990, norway: 1948, switzerland: 1966, fiji: 1993, newzealand: 1948, barbados: 1967, singapore: 1973, uae: 1994, cambodia: 2004, uruguay: 1953 },
    oecd: { usa: 1961, uk: 1961, france: 1961, germany: 1961, canada: 1961, norway: 1961, switzerland: 1961, turkey: 1961, japan: 1964, australia: 1971, newzealand: 1973, mexico: 1994, southkorea: 1996, israel: 2010 },
    g7: { usa: 1975, japan: 1975, germany: 1975, france: 1975, uk: 1975, canada: 1976, russia: 1997 },
    g20: { usa: 1999, china: 1999, russia: 1999, india: 1999, uk: 1999, france: 1999, germany: 1999, japan: 1999, brazil: 1999, canada: 1999, australia: 1999, southkorea: 1999, mexico: 1999, indonesia: 1999, turkey: 1999, saudi: 1999, southafrica: 1999, argentina: 1999 }
};
INST_JOIN.wb = INST_JOIN.imf;

// Development lenders. friend: the shareholder whose goodwill matters most.
const LENDERS = {
    ibrd: { name: "World Bank (IBRD)", from: 1946, share: 0.85, env: 1.0, friend: "usa", ok: () => instMember("wb") && gdpPerCapita() < frontierPC() * 0.45 },
    ida:  { name: "World Bank (IDA)", from: 1960, share: 0.35, env: 1.6, friend: "usa", ok: () => instMember("wb") && gdpPerCapita() < frontierPC() * 0.12 },
    idb:  { name: "Inter-American Development Bank", from: 1960, share: 0.8, env: 0.8, friend: "usa", ok: () => C().area === "Americas" && !["usa", "canada"].includes(G.ck) && gdpPerCapita() < frontierPC() * 0.5 },
    afdb: { name: "African Development Bank", from: 1967, share: 0.6, env: 0.8, friend: "nigeria", ok: () => C().area === "Africa" && gdpPerCapita() < frontierPC() * 0.4 },
    adb:  { name: "Asian Development Bank", from: 1967, share: 0.75, env: 0.8, friend: "japan", ok: () => ["Asia", "Oceania"].includes(C().area) && !["japan", "australia", "newzealand"].includes(G.ck) && gdpPerCapita() < frontierPC() * 0.45 },
    ebrd: { name: "European Bank for Reconstruction and Development", from: 1991, share: 0.85, env: 0.8, friend: "germany", ok: () => ["russia", "turkey"].includes(G.ck) && G.pol.economy !== "planned" && !(G.ck === "russia" && G.year >= 2022) },
    aiib: { name: "Asian Infrastructure Investment Bank", from: 2016, share: 0.85, env: 0.8, friend: "china", ok: () => ["Asia", "Middle East", "Oceania"].includes(C().area) && G.ck !== "china" && gdpPerCapita() < frontierPC() * 0.45 }
};
const WB_TYPES = ["roads", "rail", "ports", "airports", "power", "schools", "hospitals", "universities", "housing", "irrigation", "telecom"];

// Occupied West Germany and Japan joined the Fund, the Bank and GATT in 1951–52.
const sovereignNow = () => !!ME() && G.gov.type !== "colony" && (ME().status === "sovereign" ? G.gov.type !== "occupied" || G.year >= 1951 : ME().status === "occupied" && G.year >= 1951);
const instMember = k => !!(G.inst && G.inst.m[k]);
const instFounded = k => G.year >= INST[k].from;

function initInstitutions() {
    const m = {};
    Object.keys(INST).forEach(k => { const y = (INST_JOIN[k] || {})[G.ck]; m[k] = !!(y && y <= 1950 && instFounded(k) && sovereignNow()); });
    G.inst = { m, declined: {}, talks: null, program: null, offer: null, lent: { year: 1950 }, sanctions: null, ga: 0, summit: {}, hipc: null, paris: 0, imfDone: 0, imfFailed: 0 };
}

// ── Joining and leaving ─────────────────────────────────────────────

function instEligible(k) {
    const I = INST[k];
    if (!instFounded(k)) return `Founded in ${I.from}.`;
    if (!sovereignNow()) return "Only sovereign states can join.";
    if (I.needs && !instMember(I.needs)) return `Join the ${INST[I.needs].name} first.`;
    if (k === "gatt" && G.pol.trade === "autarky") return "Autarky is incompatible with membership.";
    if (k === "oecd") {
        if (gdpPerCapita() < frontierPC() * 0.4) return "Your income per person is too low for the rich countries' club.";
        if (!isDemocracy()) return "Members must be democracies.";
        if (["planned", "collectivized"].includes(G.pol.economy)) return "Members must have market economies.";
    }
    if (I.invite) return "By invitation only.";
    return "";
}

function applyToInst(k) {
    const why = instEligible(k);
    if (why) return toast("Not eligible", why);
    if (G.inst.talks) return toast("Already negotiating", `Talks to join the ${instName(G.inst.talks.k)} are under way.`);
    if (G.capital < 5) return toast("Not enough political capital", "An application costs 5.");
    G.capital -= 5;
    if (k === "gatt") {
        const wks = G.year >= 1995 ? 104 + Math.round(rnd(0, 156)) : 40 + Math.round(rnd(0, 60));
        G.inst.talks = { k, until: G.t + wks };
        log(`🚢 Accession talks with the ${instName(k)} begin. Members will want tariff cuts${G.year >= 1995 ? ", subsidy limits and patent protection" : ""}. Expect about ${Math.round(wks / 52 * 10) / 10} years.`, "policy");
        return;
    }
    joinAttempt(k);
}

// Who can block you: the US as the Fund's and Bank's largest shareholder,
// any permanent member of the Security Council for the UN.
function joinAttempt(k) {
    let blocked = null;
    if (["imf", "wb"].includes(k) && getRel(G.ck, "usa") < -35 && G.ck !== "usa") blocked = "The United States, the largest shareholder, blocks your application.";
    if (k === "un") {
        const veto = P5().find(p => p !== G.ck && G.nations[p] && getRel(G.ck, p) < -45 && chance(0.8));
        if (veto) blocked = `${nationName(veto)} vetoes your admission in the Security Council.`;
    }
    if (k === "oecd" && getRel(G.ck, "usa") < -20) blocked = "Members aren't ready to invite you.";
    if (blocked) { log(`🚫 ${blocked}`, "bad"); toast("Application blocked", blocked); return false; }
    joinInst(k);
    return true;
}

function joinInst(k, quiet) {
    const before = impactSnapshot();
    G.inst.m[k] = true;
    const fx = { un: { prestige: 5 }, imf: { p: { business: 3 } }, wb: {}, gatt: { p: { business: 4, labor: -2 } }, oecd: { prestige: 4, p: { business: 4 } }, g7: { prestige: 6 }, g20: { prestige: 4 } }[k];
    applyEffects(fx);
    if (["imf", "wb"].includes(k) && G.align < -40 && G.ck !== "russia") addRel(G.ck, "russia", -8);
    log(`${INST[k].icon} ${C().name} joins the ${instName(k)}.`, "major");
    record(`Joined the ${instName(k)}, ${G.year}.`);
    const chips = impactDiff(before, `Joining the ${instName(k)}`);
    if (!quiet) toast("Membership", `You join the ${instName(k)}.`, chips);
}

function leaveInst(k) {
    if (!instMember(k) || INST[k].invite) return;
    if (G.capital < 6) return toast("Not enough political capital", "Leaving costs 6.");
    G.capital -= 6;
    G.inst.m[k] = false;
    if (k === "imf") { G.inst.m.wb = false; G.inst.program = null; }
    const fx = { un: { prestige: -10, p: { military: 3 } }, imf: { p: { business: -6 }, prestige: -3, align: -5 }, wb: { p: { business: -3 } }, gatt: { p: { business: -6, labor: 3 } }, oecd: { prestige: -3 } }[k] || {};
    applyEffects(fx);
    G.inst.declined[k] = G.year + 10;
    log(`🚪 ${C().name} withdraws from the ${instName(k)}.`, "major");
    record(`Left the ${instName(k)}, ${G.year}.`);
}

// ── The IMF ─────────────────────────────────────────────────────────

function imfCrisis() {
    const e = G.econ, dp = e.debt / e.gdp * 100;
    if (G.flags.defaulted_year && G.year - G.flags.defaulted_year <= 3) return "You recently defaulted";
    if (dp > 70 && e.deficit > 3) return `Debt of ${Math.round(dp)}% of GDP and a ${fmt(e.deficit, 1)}% deficit`;
    if (e.inflation > 20) return `Inflation of ${Math.round(e.inflation)}%`;
    if (e.growth < -1.5) return "A deep recession";
    if (e.shock < -2.5) return "A sudden economic shock";
    if (dp > 100) return `Debt of ${Math.round(dp)}% of GDP`;
    return "";
}

function stateFirmCount() { return Object.keys(G.ind).filter(k => indAvailable(k) && G.ind[k].out > 0 && G.ind[k].own === "state").length; }

const IMF_CHECK = {
    deficit: c => G.econ.deficit <= c.target + 0.3,
    devalue: () => true,
    credit: c => G.econ.inflation <= c.target,
    subsidies: () => !lawOn("food_subsidies") && !lawOn("price_controls") && lawLevel("price_supports") <= 0.3,
    privatize: c => stateFirmCount() <= c.target,
    trade: () => G.pol.trade === "trade_free",
    vat: () => taxRate("vat") >= 10 || taxRate("sales") >= 10,
    social: () => fundMult("health") >= 1 && fundMult("welfare") >= 1 && fundMult("education") >= 1,
    anticorr: () => lawOn("anti_corruption"),
    revenue: c => G.econ.rev >= c.target
};

function imfConditions() {
    const e = G.econ, out = [];
    const era = G.year < 1980 ? 1 : G.year < 2000 ? 2 : 3;
    const target = Math.round(clamp(e.deficit - 3, 0.5, 3) * 2) / 2;
    out.push({ k: "deficit", t: `Cut the budget deficit to ${fmt(target, 1)}% of GDP`, target });
    if (era === 1) {
        out.push({ k: "devalue", t: "Devalue the currency (done on signing)" });
        if (e.inflation > 8) out.push({ k: "credit", t: `Rein in credit until inflation is below ${Math.round(Math.max(5, e.inflation - 8))}%`, target: Math.round(Math.max(5, e.inflation - 8)) });
    } else if (era === 2) {
        if (lawOn("food_subsidies") || lawOn("price_controls") || lawLevel("price_supports") > 0.3) out.push({ k: "subsidies", t: "End food subsidies and price controls; cut farm price supports to 30% or less" });
        const sf = stateFirmCount();
        if (sf >= 2) out.push({ k: "privatize", t: `Privatize state firms: no more than ${Math.floor(sf / 2)} sectors state-owned`, target: Math.floor(sf / 2) });
        if (G.pol.trade !== "trade_free") out.push({ k: "trade", t: "Liberalize trade (free-trade framework)" });
        if (taxRate("vat") < 10 && taxRate("sales") < 10) out.push({ k: "vat", t: "Introduce a VAT (or sales tax) of at least 10%" });
    } else {
        out.push({ k: "social", t: "Protect health, education and welfare: departments funded at 100% or more" });
        if (lawOn("food_subsidies") || lawOn("price_controls")) out.push({ k: "subsidies", t: "Replace blanket subsidies and price controls with targeted support" });
        if (!lawOn("anti_corruption") && G.s.corruption > 30) out.push({ k: "anticorr", t: "Pass an anti-corruption commission law" });
        out.push({ k: "revenue", t: `Raise tax revenue to ${fmt(e.rev + 1.5, 1)}% of GDP`, target: Math.round((e.rev + 1.5) * 10) / 10 });
    }
    return out.slice(0, 4);
}

function imfKind() { return G.year < 1975 ? "Stand-By Arrangement" : G.year < 2000 ? "Structural Adjustment (Extended Fund Facility)" : G.econ.gdp * 1000 / G.econ.pop < frontierPC() * 0.12 ? "Extended Credit Facility" : "Stand-By Arrangement"; }

function requestImf() {
    if (!instMember("imf")) return toast("Not a member", "Join the IMF first.");
    if (G.inst.program) return toast("Program under way", "You already have an IMF program.");
    if (G.inst.imfFailed && G.year - G.inst.imfFailed < 2) return toast("The Fund says not yet", "Your last program collapsed less than two years ago.");
    const why = imfCrisis();
    if (!why) return toast("No crisis, no program", "The Fund lends to countries in balance-of-payments or debt trouble. Your indicators don't qualify.");
    if (G.capital < 4) return toast("Not enough political capital", "Opening negotiations costs 4.");
    G.capital -= 4;
    G.inst.offer = { conds: imfConditions(), amount: Math.round(clamp(G.econ.debt / G.econ.gdp * 100 * 0.05, 2, 8) * 10) / 10, kind: imfKind(), why, haggled: false };
    queueScene("imf_offer", {});
}

function startImf(offer) {
    const before = impactSnapshot();
    const o = offer || { conds: imfConditions(), amount: 3, kind: imfKind() };
    const long = /Extended|Structural/.test(o.kind);
    G.inst.program = { start: G.t, amount: o.amount, kind: o.kind, conds: o.conds, reviews: long ? [26, 52, 78, 104, 130] : [26, 52, 78], next: 0, waivers: 1, rioted: false };
    G.inst.offer = null;
    const ch = applyEffects({ growth: 1.2, inflation: -1.5, prestige: -2, p: { business: 6, people: -5, labor: -4 }, rel: { usa: 4 } });
    G.factions.forEach(f => { if (["nationalist", "socialist", "communist"].includes(f.ideo)) f.loyalty = clamp(f.loyalty - 6); });
    if (o.conds.some(c => c.k === "devalue")) applyEffects({ inflation: 4, growth: 0.4, p: { people: -3 } });
    log(`💵 You sign an IMF ${o.kind}: ${fmt(o.amount, 1)}% of GDP over ${long ? "two and a half years" : "eighteen months"}. Conditions: ${o.conds.map(c => c.t.toLowerCase()).join("; ")}.`, "major");
    record(`Signed an IMF ${o.kind}, ${G.year}.`);
    ch.push(...impactDiff(before, "IMF program"));
    toast("IMF program signed", o.kind, ch);
    return ch;
}

// A crisis scene's "accept the IMF" choice starts a real program.
function imfFromEvent() {
    if (!G.inst || !instMember("imf")) { G.econ.debt = Math.max(0, G.econ.debt - G.econ.gdp * 0.03); return "Emergency loans from Western governments tide you over."; }
    if (G.inst.program) return "Your existing IMF program is augmented.";
    const o = { conds: imfConditions(), amount: Math.round(clamp(G.econ.debt / G.econ.gdp * 100 * 0.05, 2, 8) * 10) / 10, kind: imfKind() };
    startImf(o);
    return `The IMF ${o.kind} is signed. Conditions: ${o.conds.map(c => c.t.toLowerCase()).join("; ")}. See the Institutions tab.`;
}

// Cheaper money while the program is on track: Fund lending replaces costly market debt.
function imfRelief() { return G.inst && G.inst.program ? G.inst.program.amount * 0.03 : 0; }

function imfReview() {
    const pr = G.inst.program;
    const met = pr.conds.filter(c => IMF_CHECK[c.k](c));
    const miss = pr.conds.filter(c => !IMF_CHECK[c.k](c));
    let pass = !miss.length;
    let waived = false;
    if (!pass && miss.length === 1 && pr.waivers > 0 && getRel(G.ck, "usa") > -20 && chance(0.6 + skill("diplomacy") * 0.05)) { pass = true; waived = true; pr.waivers--; }
    const n = pr.next + 1, total = pr.reviews.length;
    if (pass) {
        applyEffects({ growth: 0.6, inflation: -1, p: { business: 3 } });
        pr.next++;
        log(`✅ IMF review ${n} of ${total}: ${waived ? `passed with a waiver for "${miss[0].t.toLowerCase()}"` : "all conditions met"}. The next tranche is released.`, "good");
        if (pr.next >= total) {
            G.inst.program = null; G.inst.imfDone = G.year;
            applyEffects({ prestige: 3, p: { business: 4 } });
            log(`🏁 The IMF program is completed. Markets trust ${C().name} again.`, "major");
            record(`Completed an IMF program, ${G.year}.`);
            toast("IMF program completed", "You met the conditions. The Fund's seal of approval brings investors back.");
        } else toast("IMF review passed", `Tranche ${n} of ${total} released.`);
    } else {
        G.inst.program = null; G.inst.imfFailed = G.year;
        applyEffects({ growth: -2, prestige: -3, p: { business: -8 } });
        log(`❌ IMF review ${n}: missed ${miss.map(c => c.t.toLowerCase()).join("; ")}. The Fund suspends the program and capital flees.`, "bad");
        toast("IMF program suspended", `You missed ${miss.length} condition${miss.length > 1 ? "s" : ""}. The money stops.`);
    }
    return met;
}

SCENES.imf_offer = () => {
    const o = G.inst.offer;
    if (!o) return S("💵", "", "", "", [ch("OK", {}, "")]);
    return S("💵", `${dateStr()} · IMF mission`, `The Fund's terms: ${o.kind}`,
        `${o.why}. The IMF mission offers ${fmt(o.amount, 1)}% of GDP (${nominal(G.econ.gdp * o.amount / 100)}) in tranches, released after reviews every six months, if you: ${o.conds.map(c => c.t).join("; ")}. Signing calms the markets at once, but nationalists and the left will call it a surrender.`,
        [ch("Sign the letter of intent", {}, "", { run: () => { startImf(o); return "The first tranche arrives. Now deliver the conditions before the review."; } }),
         ch("Negotiate softer terms", {}, "", { req: !o.haggled && o.conds.length > 1, run: () => {
             o.haggled = true;
             if (chance(0.3 + skill("diplomacy") * 0.07 + getRel(G.ck, "usa") / 300)) { const c = o.conds.filter(x => x.k !== "deficit").pop(); o.conds = o.conds.filter(x => x !== c); if (c) log(`🤝 The Fund drops one condition: ${c.t.toLowerCase()}.`, "good"); }
             else { o.amount = Math.round(o.amount * 0.8 * 10) / 10; log("🤝 The Fund holds firm on its conditions and trims the loan.", "warn"); }
             queueScene("imf_offer", {}); return "";
         } }),
         ch("Refuse: go it alone", { p: { people: 3, business: -5 } }, "", { run: () => { G.inst.offer = null; return "Nationalists cheer. Bond markets don't."; } })]);
};

SCENES.imf_riots = () => S("🔥", `${dateStr()} · The capital`, "Riots over prices",
    "Bread and fuel prices have jumped since the subsidies went. Crowds are looting shops and attacking government buildings, chanting against the IMF.",
    [ch("Send in the army", { stability: -4, liberty: -5, p: { military: 4, people: -8 } }, "Order is restored. The dead are counted."),
     ch("Restore some subsidies", { p: { people: 6 } }, "", { run: () => { setLaw("food_subsidies", 0.3, "Emergency decree"); return "Calm returns. The Fund will notice at the next review."; } }),
     ch("Ride it out and explain the reforms", { stability: -6, p: { people: -4, business: 3 } }, "")]);

// ── Development lenders ─────────────────────────────────────────────

function lendersFor(type) {
    if (!WB_TYPES.includes(type) || !sovereignNow()) return [];
    if (G.inst.sanctions) return [];
    if (G.inst.lent.year !== G.year) G.inst.lent = { year: G.year };
    return Object.entries(LENDERS).filter(([k, l]) => G.year >= l.from && l.ok() && (G.inst.lent[k] || 0) < G.econ.gdp * l.env / 100).map(([k]) => k);
}

function bestLender(type) {
    const ls = lendersFor(type);
    return ls.sort((a, b) => LENDERS[a].share - LENDERS[b].share)[0] || null;
}

function askFinancing(id) {
    const it = G.cip.queue.find(x => x.id === id);
    if (!it || it.fin) return;
    const lk = bestLender(it.type);
    if (!lk) return toast("No lender available", "No development bank will finance this project right now.");
    if (G.capital < 2) return toast("Not enough political capital", "Preparing a loan application costs 2.");
    G.capital -= 2;
    const dam = ["power", "irrigation"].includes(it.type) && G.year >= 1990;
    it.fin = { lender: lk, until: G.t + 10 + Math.round(rnd(0, 14)) + (dam ? 12 : 0) };
    log(`🏦 You ask the ${LENDERS[lk].name} to finance ${projectInfo(it.type).name}. Appraisal takes a few months${dam ? ", longer with the environmental and resettlement review" : ""}.`, "policy");
}

function financingTick() {
    if (!G.cip) return;
    G.cip.queue.slice().forEach(it => {
        if (!it.fin || G.t < it.fin.until) return;
        const L = LENDERS[it.fin.lender];
        let p = 0.75 + getRel(G.ck, L.friend) / 300 - G.s.corruption / 250 - (G.inst.imfFailed && G.year - G.inst.imfFailed < 2 ? 0.3 : 0) - (playerWars().length ? 0.2 : 0);
        if (G.inst.sanctions) p = 0;
        if (chance(clamp(p, 0.05, 0.95))) {
            G.cip.queue.splice(G.cip.queue.indexOf(it), 1);
            if (G.inst.lent.year !== G.year) G.inst.lent = { year: G.year };
            G.inst.lent[it.fin.lender] = (G.inst.lent[it.fin.lender] || 0) + it.cost;
            G.econ.debt += it.cost * L.share;
            credAdd(it.fin.lender, it.cost * L.share);
            it.lender = it.fin.lender; delete it.fin;
            activateProject(it);
            G.factions.forEach(f => { if (f.gov) f.loyalty = clamp(f.loyalty - 1); });
            log(`🏦 The ${L.name} approves a loan for ${projectInfo(it.type).name}${L.share < 0.5 ? " on near-grant terms" : ""}. Construction starts; contracts go to international tender.`, "good");
            if (["power", "irrigation"].includes(it.type) && chance(0.25)) queueScene("dam_protest", { name: projectInfo(it.type).name });
        } else {
            delete it.fin;
            log(`🏦 The ${L.name} turns down the loan for ${projectInfo(it.type).name}. ${G.s.corruption > 45 ? "Its staff cite governance concerns." : "It isn't convinced by the appraisal."}`, "bad");
        }
    });
}

SCENES.dam_protest = a => S("🌊", `${dateStr()} · Valley villages`, `Protests against the ${a.name}`,
    "Thousands of villagers face resettlement. Activists and the foreign press are watching, and so is the lender.",
    [ch("Pay generous compensation", { cost: 0.05, p: { people: 3 } }, "The protests fade."),
     ch("Move them anyway", { liberty: -3, p: { people: -5 }, prestige: -2 }, "The project goes ahead over their heads.")]);

// ── Debt relief ─────────────────────────────────────────────────────

function parisClubOk() { return G.year >= 1956 && G.inst.program && G.econ.debt / G.econ.gdp * 100 > 80 && G.year - (G.inst.paris || 0) >= 4; }
function hipcOk() { return G.year >= 1996 && !G.inst.hipc && instMember("imf") && gdpPerCapita() < frontierPC() * 0.06 && G.econ.debt / G.econ.gdp * 100 > 50 && (G.inst.program || G.year - (G.inst.imfDone || 0) <= 5); }

function parisClub() {
    if (!parisClubOk()) return toast("Not eligible", "The Paris Club reschedules debts only for countries with an IMF program and heavy debts, at most every four years.");
    if (G.capital < 4) return toast("Not enough political capital", "It costs 4.");
    G.capital -= 4;
    G.inst.paris = G.year;
    const cut = G.year >= 1994 && gdpPerCapita() < frontierPC() * 0.1 ? 0.3 : 0.15;
    const bn = G.econ.debt * cut;
    G.econ.debt -= bn;
    applyEffects({ prestige: -1, p: { business: 2 } });
    log(`🇫🇷 The Paris Club of creditor governments reschedules your debts: ${nominal(bn)} written off or deferred.`, "good");
    record(`Paris Club debt rescheduling, ${G.year}.`);
}

function hipcApply() {
    if (!hipcOk()) return toast("Not eligible", "HIPC is for the poorest, most indebted countries with an IMF track record.");
    if (G.capital < 5) return toast("Not enough political capital", "It costs 5.");
    G.capital -= 5;
    G.econ.debt *= 0.85;
    G.inst.hipc = { decision: G.year, completion: G.year + 3 };
    log("🕊️ HIPC decision point: creditors cut your debt service now and promise more if you stick to a poverty reduction strategy for three years (health, education and welfare funded at 100% or more, no failed IMF program).", "good");
}

function hipcTick() {
    const h = G.inst.hipc;
    if (!h || h.done || G.year < h.completion) return;
    if (IMF_CHECK.social() && !(G.inst.imfFailed >= h.decision)) {
        const bn = G.econ.debt * 0.65;
        G.econ.debt -= bn;
        h.done = true;
        applyEffects({ prestige: 4 });
        log(`🕊️ HIPC completion point${G.year >= 2005 ? " and Multilateral Debt Relief" : ""}: ${nominal(bn)} of debt cancelled.`, "major");
        record(`Won HIPC debt cancellation, ${G.year}.`);
    } else { h.completion = G.year + 1; log("🕊️ Creditors postpone your HIPC completion point: the poverty reduction strategy is off track.", "warn"); }
}

// ── The UN ──────────────────────────────────────────────────────────

const P5 = () => ["usa", "uk", "france", "russia"].concat(G.year >= 1971 ? ["china"] : []);

SCENES.unga = () => S("🇺🇳", `${dateStr()} · New York`, "The UN General Assembly",
    "World leaders gather on the East River for the general debate. Your speech will be read in every foreign ministry.",
    [ch("Champion the free world", { align: 5, prestige: 2, rel: { usa: 5, russia: -5 } }, ""),
     ch("Speak for the non-aligned and the newly free", { align: G.align > 0 ? -4 : 4, prestige: 3 }, "", { run: () => { (G.blocs.nam || []).forEach(k => addRel(G.ck, k, 4)); return "Delegations from Africa and Asia applaud."; } }),
     ch("Call for a fairer world economy", { prestige: 2 }, "", { run: () => { Object.keys(G.nations).filter(k => G.nations[k].status === "sovereign" && G.nations[k].gdp * 1000 / Math.max(1, G.nations[k].pop) < frontierPC() * 0.25).forEach(k => addRel(G.ck, k, 2)); return "The developing world takes note."; } }),
     ch("Peace and disarmament", { tension: -2, prestige: 3 }, ""),
     ch("Send the foreign minister instead", {}, "")]);

SCENES.unsc_war = a => {
    const w = G.wars.find(x => x.id === a.id);
    const target = w ? w.b[0] : null;
    const tname = target ? nationName(target) : "your neighbor";
    const p5 = P5().filter(k => k !== G.ck);
    const friend = p5.find(k => getRel(G.ck, k) >= 45 || alliedWith(G.ck, k));
    const iAmP5 = P5().includes(G.ck);
    return S("🇺🇳", `${dateStr()} · Security Council`, "The Security Council takes up your war",
        `${tname} has asked the Council to condemn your attack and impose sanctions.${friend ? ` ${nationName(friend)} has signaled it will veto.` : ""}${iAmP5 ? " As a permanent member you can veto it yourself." : ""}`,
        [ch("Veto the resolution", { prestige: -4 }, "", { req: iAmP5, run: () => { Object.keys(G.nations).filter(k => k !== G.ck && G.nations[k].status === "sovereign" && !alliedWith(G.ck, k)).slice(0, 12).forEach(k => addRel(G.ck, k, -3)); return "Your veto kills it. Much of the world is furious."; } }),
         ch("Lobby the Council members", {}, "", { req: !iAmP5, run: () => unscVote(target, friend, 0.25 + skill("diplomacy") * 0.05) }),
         ch("Ignore the UN", {}, "", { req: !iAmP5, run: () => unscVote(target, friend, 0) })]);
};

function unscVote(target, friend, lobby) {
    if (friend) { addRel(G.ck, friend, -3); log(`🇺🇳 ${nationName(friend)} vetoes the Security Council resolution against you.`, "info"); return `${nationName(friend)} vetoes it. You owe them.`; }
    const pass = chance(clamp(0.75 - lobby - G.s.prestige / 400, 0.1, 0.9));
    if (!pass) { log("🇺🇳 The Security Council resolution against you falls short of nine votes.", "good"); return "The resolution fails to get nine votes."; }
    imposeSanctions("UN Security Council sanctions over your war", 104);
    return "The Council condemns you and imposes sanctions.";
}

function imposeSanctions(why, weeks) {
    G.inst.sanctions = { why, until: G.t + weeks };
    applyEffects({ prestige: -8, growth: -1.5, p: { business: -6 } });
    log(`🚫 ${why}.`, "major");
    record(`${why}, ${G.year}.`);
}

// Sanctions drag on growth while they last.
function instGrowthDrag() { return G.inst && G.inst.sanctions ? 0.8 : 0; }

// ── Effects of membership on trade and investment ───────────────────

function gattTariffMult() { return instMember("gatt") ? (G.year >= 1995 ? 0.45 : 0.65) : 1; }
const GATT_EXPORTERS = ["textiles", "autos", "electronics", "machinery", "chemicals", "shipbuilding", "computing"];
function gattIndBonus(k) { return instMember("gatt") && GATT_EXPORTERS.includes(k) ? (G.pol.trade === "autarky" ? 0 : 0.5) : 0; }
function wtoSupportMult() { return instMember("gatt") && G.year >= 1995 ? 0.75 : 1; }
function instInvestBonus() { return (instMember("oecd") ? 0.04 : 0) + (instMember("gatt") ? 0.02 : 0) + (G.inst && G.inst.program ? 0.02 : 0) - (G.inst && G.inst.sanctions ? 0.15 : 0); }

// ── Monthly tick ────────────────────────────────────────────────────

function gdpRank(filter) {
    const list = Object.values(G.nations).filter(n => n.status === "sovereign" && !n.rebel && (!filter || filter(n))).map(n => [n.key, n.key === G.ck ? G.econ.gdp : n.gdp]);
    list.sort((a, b) => b[1] - a[1]);
    return list.findIndex(([k]) => k === G.ck) + 1;
}

function institutionsMonth() {
    if (!G.inst) initInstitutions();
    const I = G.inst;
    // Historical membership offers on (or after) the real dates.
    ["un", "imf", "wb", "gatt", "oecd"].forEach(k => {
        const y = (INST_JOIN[k] || {})[G.ck];
        if (I.m[k] || !y || G.year < y || (I.declined[k] || 0) > G.year || instEligible(k) || I.talks || G.scenes.some(s => s.id === "inst_invite")) return;
        queueScene("inst_invite", { k });
        I.declined[k] = G.year + 3;
    });
    // GATT/WTO accession talks.
    if (I.talks && G.t >= I.talks.until) {
        const k = I.talks.k;
        I.talks = null;
        const strict = G.year >= 1995;
        if (G.pol.trade === "autarky" || (strict && G.pol.trade === "protection")) { log(`🚢 Accession talks with the ${instName(k)} stall: members want you to lower trade barriers first.`, "bad"); I.declined[k] = G.year; }
        else joinInst(k);
    }
    // The G7 and G20 invite the biggest economies.
    if (!I.m.g7 && G.year >= 1975) {
        const hist = INST_JOIN.g7[G.ck], ok = hist ? G.year >= hist : isDemocracy() && G.pol.economy !== "planned" && G.align > 0 && gdpPerCapita() >= frontierPC() * 0.55 && gdpRank(n => n.align > 0 || n.key === G.ck) <= 7;
        if (ok && !(G.ck === "russia" && (G.year < 1997 || G.year >= 2014))) joinInst("g7");
    }
    if (I.m.g7 && G.ck === "russia" && G.year >= 2014) { I.m.g7 = false; log("🗻 The G8 suspends Russia over Crimea. It is the G7 again.", "major"); }
    if (!I.m.g20 && G.year >= 1999 && sovereignNow() && ((INST_JOIN.g20[G.ck] && G.year >= INST_JOIN.g20[G.ck]) || gdpRank() <= 19)) joinInst("g20");
    // The UN seats Beijing in 1971.
    if (G.ck === "china" && !I.m.un && G.year >= 1971 && sovereignNow()) { joinInst("un", true); log("🇺🇳 Resolution 2758: the General Assembly gives China's seat, and its Security Council veto, to Beijing.", "major"); }
    // Annual events.
    if (G.month === 9 && I.m.un && I.ga < G.year) { I.ga = G.year; queueScene("unga", {}); }
    if (G.month === 6 && I.m.g7 && (I.summit.g7 || 0) < G.year) { I.summit.g7 = G.year; queueScene("summit", { k: "g7" }); }
    if (G.month === 11 && I.m.g20 && G.year >= 2008 && (I.summit.g20 || 0) < G.year) { I.summit.g20 = G.year; queueScene("summit", { k: "g20" }); }
    if (G.month === 3 && I.m.imf && !I.program && G.year > 1952) imfArticleIV();
    // The IMF program's reviews.
    const pr = I.program;
    if (pr && G.t >= pr.start + pr.reviews[pr.next]) imfReview();
    if (pr && !pr.rioted && pr.conds.some(c => c.k === "subsidies") && IMF_CHECK.subsidies() && chance(0.35)) { pr.rioted = true; queueScene("imf_riots", {}); }
    // Wars you start go to the Security Council.
    if (I.m.un) G.wars.filter(w => !w.over && w.a[0] === G.ck && w.type !== "insurgency" && !w.unsc && G.t - (w.start != null ? w.start : G.t) < 8).forEach(w => { w.unsc = true; queueScene("unsc_war", { id: w.id }); });
    // Apartheid South Africa: the 1977 arms embargo, broader sanctions from 1986.
    if (G.ck === "southafrica" && G.pol.rights === "segregation" && G.year >= 1977 && !I.sanctions && !G.flags.sa_embargo) { G.flags.sa_embargo = true; imposeSanctions("UN Security Council Resolution 418 imposes a mandatory arms embargo over apartheid", 52 * 15); }
    if (I.sanctions && (G.t >= I.sanctions.until || (G.ck === "southafrica" && G.flags.sa_embargo && G.pol.rights !== "segregation"))) { I.sanctions = null; applyEffects({ prestige: 4, p: { business: 4 } }); log("✅ International sanctions are lifted.", "good"); }
    financingTick();
    hipcTick();
    // The world economy's big trade rounds.
    if (G.month === 6 && I.m.gatt && [1967, 1979, 1994].includes(G.year) && !G.flags[`round${G.year}`]) {
        G.flags[`round${G.year}`] = true;
        applyEffects({ growth: 0.4, p: { business: 3, labor: -2 } });
        log(`🚢 ${({ 1967: "The Kennedy Round", 1979: "The Tokyo Round", 1994: "The Uruguay Round" })[G.year]} concludes: members cut tariffs again${G.year === 1994 ? ", and agree to create the World Trade Organization" : ""}.`, "major");
    }
}

function imfArticleIV() {
    const e = G.econ, notes = [];
    if (e.deficit > 4) notes.push("narrow the deficit");
    if (e.inflation > 10) notes.push("tighten monetary policy");
    if (e.debt / e.gdp > 0.9) notes.push("put debt on a downward path");
    if (G.pol.trade === "protection" || G.pol.trade === "autarky") notes.push("lower trade barriers");
    if (G.s.corruption > 50) notes.push("strengthen governance");
    log(`💵 IMF Article IV report: ${notes.length ? "the Fund urges you to " + notes.join(", ") : "a clean bill of health"}.`, notes.length ? "info" : "good");
}

SCENES.inst_invite = a => {
    const k = a.k, I = INST[k];
    const text = {
        un: "Your application for UN membership has reached the Security Council and General Assembly. Membership means a voice in world affairs, and a forum where others can condemn you.",
        imf: "The Fund invites you to subscribe your quota and join. Members can borrow in a crisis, on the Fund's conditions, and the World Bank only lends to members.",
        wb: "As an IMF member you can take up shares in the World Bank, which lends for roads, dams, power and schools.",
        gatt: G.year >= 1995 ? "WTO members are ready to welcome you. You would bind your tariffs, accept dispute settlement and limit industrial subsidies, in exchange for access to their markets." : "The GATT contracting parties are ready to admit you. You would cut and bind your tariffs in exchange for lower tariffs on your exports.",
        oecd: "The rich democracies invite you to join their club: peer reviews, shared statistics and a seal of approval for investors."
    }[k];
    return S(I.icon, `${dateStr()} · ${instName(k)}`, `Join the ${instName(k)}?`, text,
        [ch("Join", {}, "", { run: () => { joinAttempt(k); return ""; } }),
         ch("Not now", {}, "We may be asked again in a few years.")]);
};

SCENES.summit = a => {
    const g7 = a.k === "g7";
    const host = pick(Object.keys(INST_JOIN[a.k]).filter(k => G.nations[k]));
    return S(INST[a.k].icon, `${dateStr()} · ${g7 ? "G7" : "G20"} summit${host ? ", " + nationName(host) : ""}`, `The ${g7 ? "G7" : "G20"} summit`,
        g7 ? "The leaders of the biggest Western economies meet for two days of talks on the world economy, trade and security." : "The leaders of the twenty largest economies meet. The agenda: growth, finance, trade and climate.",
        [ch("Coordinate on the world economy", { growth: 0.3 }, "", { run: () => { Object.keys(INST_JOIN[a.k]).forEach(k => addRel(G.ck, k, 2)); return "A communiqué everyone can sign."; } }),
         ch(G.year >= 1990 ? "Push debt relief for the poorest" : "Push for aid to the developing world", { prestige: 3, cost: 0.05 }, ""),
         ch("Use it for a private meeting with the Americans", { rel: { usa: 5 } }, "", { req: G.ck !== "usa" }),
         ch(G.year >= 2008 ? "Champion a coordinated stimulus" : "Stand firm on your national interest", G.year >= 2008 ? { growth: 0.6, cost: 0.3 } : { p: { people: 2 } }, "")]);
};
