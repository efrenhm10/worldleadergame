// ── FAMILY — spouse, children and the succession ────────────────────
//
// Your spouse can be an asset (a beloved First Lady, a political partner)
// or a liability. Children grow up, choose careers, cause scandals and, in
// a monarchy, carry the dynasty: a king without an heir invites a palace
// struggle. The real 1950 leaders start with their real families.

const SPOUSE_TRAITS = {
    beloved: { name: "Beloved", icon: "💖", desc: "Adored by the public. Your approval benefits.", p: { people: 4 } },
    political: { name: "Political partner", icon: "🤝", desc: "A sharp operator at your side. More political capital.", capital: 1.2, p: { party: 2 } },
    philanthropist: { name: "Philanthropist", icon: "🎗️", desc: "Champions hospitals and orphanages. Prestige and goodwill.", p: { people: 2, clergy: 2 }, prestige: 2 },
    ambitious: { name: "Ambitious", icon: "🔥", desc: "Has an agenda of their own. Useful, and sometimes dangerous.", capital: 0.8, scandal: true },
    socialite: { name: "Socialite", icon: "🥂", desc: "At home with bankers and film stars. Business likes it; the press loves a scandal.", p: { business: 3 }, scandal: true },
    private: { name: "Private", icon: "🏡", desc: "Stays out of politics and out of the papers.", p: {} }
};
const CHILD_PATHS = {
    military: { name: "Officer", icon: "🎖️", p: { military: 2 } },
    politics: { name: "Politician", icon: "🏛️", p: { party: 1 } },
    business: { name: "Businessman", icon: "💼", p: { business: 1 } },
    scholar: { name: "Scholar", icon: "🎓", p: { press: 1 } },
    playboy: { name: "Jet-setter", icon: "🛥️", p: {} }
};

// The real families of the 1950 leaders: s = [spouse, age, trait], w = late spouse, c = [name, sex, born].
const FAMILY_HIST = {
    usa: { s: ["Bess Truman", 65, "private"], c: [["Margaret", "f", 1924, "scholar"]] },
    china: { s: ["Jiang Qing", 36, "ambitious"], c: [["Mao Anqing", "m", 1923, "scholar"], ["Li Min", "f", 1936], ["Li Na", "f", 1940]] },
    russia: { w: "Nadezhda Alliluyeva", c: [["Vasily", "m", 1921, "military"], ["Svetlana", "f", 1926, "scholar"]] },
    india: { w: "Kamala Nehru", c: [["Indira", "f", 1917, "politics"]] },
    uk: { s: ["Violet Attlee", 54, "private"], c: [["Janet", "f", 1923, "scholar"], ["Felicity", "f", 1925, "scholar"], ["Martin", "m", 1927, "business"], ["Alison", "f", 1930]] },
    france: { s: ["Suzanne Bidault", 49, "political"], c: [] },
    germany: { w: "Gussie Adenauer", c: [["Konrad", "m", 1906, "business"], ["Max", "m", 1910, "politics"], ["Ria", "f", 1912, "scholar"], ["Paul", "m", 1923, "scholar"], ["Lotte", "f", 1925], ["Libet", "f", 1928], ["Georg", "m", 1931]] },
    japan: { w: "Yukiko Yoshida", c: [["Kenichi", "m", 1912, "business"], ["Kazuko", "f", 1915, "scholar"]] },
    brazil: { w: "Carmela Dutra", c: [] },
    canada: { s: ["Jeanne St. Laurent", 63, "private"], c: [["Jean-Paul", "m", 1912, "business"], ["Renault", "m", 1916, "politics"], ["Madeleine", "f", 1914, "scholar"]] },
    australia: { s: ["Pattie Menzies", 51, "philanthropist"], c: [["Kenneth", "m", 1922, "business"], ["Ian", "m", 1923, "business"], ["Heather", "f", 1928]] },
    southkorea: { s: ["Franziska Donner", 49, "political"], c: [] },
    mexico: { s: ["Beatriz Velasco", 40, "socialite"], c: [["Miguel", "m", 1932], ["Beatriz", "f", 1935]] },
    indonesia: { s: ["Fatmawati", 26, "beloved"], c: [["Guntur", "m", 1944], ["Megawati", "f", 1947]] },
    turkey: { s: ["Mevhibe İnönü", 53, "private"], c: [["Ömer", "m", 1924, "business"], ["Erdal", "m", 1926, "scholar"], ["Özden", "f", 1930]] },
    saudi: { s: ["Hassa Al Sudairi", 50, "private"], c: [["Saud", "m", 1902, "politics"], ["Faisal", "m", 1906, "politics"], ["Fahd", "m", 1921, "politics"]] },
    nigeria: { s: ["Flora Azikiwe", 40, "philanthropist"], c: [["Chukwuma", "m", 1940]] },
    southafrica: { s: ["Maria Malan", 55, "private"], c: [] },
    argentina: { s: ["Eva Perón", 30, "beloved"], c: [] },
    iran: { c: [["Shahnaz", "f", 1940]] },
    israel: { s: ["Paula Ben-Gurion", 58, "private"], c: [["Geula", "f", 1919, "scholar"], ["Amos", "m", 1920, "military"], ["Renana", "f", 1925, "scholar"]] },
    pakistan: { s: ["Ra'ana Liaquat Ali Khan", 44, "philanthropist"], c: [["Ashraf", "m", 1937], ["Akbar", "m", 1941]] },
    philippines: { w: "Alicia Syquia", c: [["Victoria", "f", 1931], ["Tomas", "m", 1934]] },
    ethiopia: { s: ["Empress Menen", 60, "philanthropist"], c: [["Tenagnework", "f", 1912, "politics"], ["Asfaw Wossen", "m", 1916, "politics"], ["Makonnen", "m", 1923, "military"], ["Sahle Selassie", "m", 1931]] },
    venezuela: { s: ["Lucía Devine", 38, "socialite"], c: [] },
    norway: { s: ["Werna Gerhardsen", 37, "political"], c: [["Truls", "m", 1937], ["Kari", "f", 1940]] },
    barbados: { s: ["Grace Adams", 45, "private"], c: [["Tom", "m", 1931]] },
    singapore: { s: ["Kwa Geok Choo", 30, "political"], c: [] },
    uae: { s: ["Hassa bint Mohammed", 28, "private"], c: [["Khalifa", "m", 1948]] },
    cambodia: { s: ["Phat Kanhol", 30, "private"], c: [["Buppha Devi", "f", 1943], ["Ranariddh", "m", 1944]] },
    uruguay: { s: ["Matilde Ibáñez", 50, "private"], c: [["Jorge", "m", 1927, "politics"]] }
};

const firstNames = (gender) => {
    const culture = C().names || "anglo";
    const pool = gender === "f" ? (NAME_POOLS_F[culture] || NAME_POOLS_F.anglo) : (NAME_POOLS[culture] || NAME_POOLS.anglo).filter(n => !(NAME_POOLS_F[culture] || []).includes(n));
    return pool.map(n => n.split(" ")[0]);
};
const familyName = () => { const parts = G.leader.name.split(" "); return parts.length > 1 ? parts[parts.length - 1] : ""; };
const randomPersonName = gender => `${pick(firstNames(gender))} ${pick((NAME_POOLS[C().names || "anglo"] || NAME_POOLS.anglo)).split(" ").slice(-1)[0]}`;

function initFamily(historical) {
    const L = G.leader, h = historical ? FAMILY_HIST[G.ck] : null;
    const fam = { spouse: null, widowed: null, children: [], law: "male", events: {} };
    const spouseGender = L.gender === "f" ? "m" : "f";
    if (h) {
        if (h.s) fam.spouse = { name: h.s[0], gender: spouseGender, born: G.year - h.s[1], trait: h.s[2], alive: true, married: G.year - 10 };
        if (h.w) fam.widowed = h.w;
        fam.children = (h.c || []).map(([n, g, b, path]) => ({ name: n, gender: g, born: b, path: path || null, alive: true }));
    } else {
        if (L.age >= 25 && chance(0.85)) fam.spouse = { name: randomPersonName(spouseGender), gender: spouseGender, born: G.year - Math.max(20, L.age - Math.round(rnd(-2, 6))), trait: pick(Object.keys(SPOUSE_TRAITS)), alive: true, married: G.year - Math.max(1, Math.round((L.age - 26) * 0.8)) };
        const kids = fam.spouse ? Math.max(0, Math.round(rnd(-0.5, 4) * clamp((L.age - 24) / 12, 0, 1))) : 0;
        for (let i = 0; i < kids; i++) { const g = chance(0.5) ? "m" : "f"; fam.children.push({ name: pick(firstNames(g)), gender: g, born: G.year - Math.max(0, Math.round(rnd(0, L.age - 24))), path: null, alive: true }); }
    }
    fam.children.forEach(c => { if (!c.path && G.year - c.born >= 22) c.path = pick(["military", "politics", "business", "scholar"]); });
    fam.children.sort((a, b) => a.born - b.born);
    return fam;
}

function fam() { if (!G.leader.family) G.leader.family = initFamily(G.leader.historical); return G.leader.family; }
const ageOf = p => G.year - p.born;

// Who inherits the throne: eldest son (or eldest child under equal
// succession), else a designated relative.
function heirOf() {
    const f = fam();
    const kids = f.children.filter(c => c.alive).sort((a, b) => a.born - b.born);
    const child = f.law === "equal" ? kids[0] : (kids.find(c => c.gender === "m") || null);
    if (child) return { name: `${child.gender === "m" ? "Crown Prince" : "Crown Princess"} ${child.name}`, age: ageOf(child), gender: child.gender, child: true };
    return G.leader.heir ? Object.assign({ gender: "m" }, G.leader.heir) : null;
}

// Standing effects on power bases and capital.
function familyPillar(k) {
    const f = G.leader && G.leader.family;
    if (!f) return 0;
    let v = 0;
    if (f.spouse && f.spouse.alive) v += (SPOUSE_TRAITS[f.spouse.trait].p || {})[k] || 0;
    f.children.forEach(c => { if (c.alive && c.path && ageOf(c) >= 22) v += ((CHILD_PATHS[c.path].p || {})[k] || 0) * 0.5; });
    if (G.gov.type === "monarchy" && k === "royals" && !heirOf()) v -= clamp((G.leader.age - 35) * 0.4, 0, 12);
    return v;
}
function familyCapital() { const f = G.leader && G.leader.family; return f && f.spouse && f.spouse.alive ? SPOUSE_TRAITS[f.spouse.trait].capital || 0 : 0; }

// ── Yearly life ─────────────────────────────────────────────────────

function familyYearly() {
    const f = fam(), L = G.leader;
    const sp = f.spouse && f.spouse.alive ? f.spouse : null;
    // Births.
    if (sp) {
        const mother = L.gender === "f" ? L.age : ageOf(sp);
        const p = mother < 18 ? 0 : mother <= 30 ? 0.3 : mother <= 38 ? 0.18 : mother <= 44 ? 0.05 : 0;
        if (chance(p * (f.children.filter(c => ageOf(c) < 6).length ? 0.5 : 1))) { queueScene("family_birth", { gender: chance(0.51) ? "m" : "f" }); return; }
    }
    // Spouse's health.
    if (sp && ageOf(sp) > 55 && chance(0.012 * (ageOf(sp) - 50) / 5)) { queueScene("family_spouse_death", {}); return; }
    // Children come of age and choose a path.
    const adult = f.children.find(c => c.alive && !c.path && ageOf(c) >= 20);
    if (adult) { queueScene("family_career", { name: adult.name }); return; }
    // Occasional family stories.
    const r = Math.random();
    if (sp && SPOUSE_TRAITS[sp.trait].scandal && r < 0.12) return queueScene("family_spouse_scandal", {});
    if (sp && sp.trait === "philanthropist" && r < 0.15) { applyEffects({ prestige: 1, p: { people: 2 } }); log(`🎗️ ${sp.name} opens a children's hospital. The press is full of praise.`, "good"); return; }
    const jet = f.children.find(c => c.alive && c.path === "playboy");
    if (jet && r < 0.2) return queueScene("family_child_scandal", { name: jet.name });
    if (G.gov.type === "monarchy" && !heirOf() && L.age > 40 && r < 0.35) return queueScene("family_heir_pressure", {});
    if (!sp && L.age < 60 && r < 0.12) return queueScene("family_matchmakers", {});
}

// ── Decisions ───────────────────────────────────────────────────────

function seekSpouse() {
    const f = fam();
    if (f.spouse && f.spouse.alive) return toast("Already married", "");
    if (G.capital < 3) return toast("Not enough political capital", "Courtship costs 3.");
    G.capital -= 3;
    queueScene("family_match", { seed: G.t });
}

function divorce() {
    const f = fam();
    if (!f.spouse || !f.spouse.alive) return;
    if (G.capital < 8) return toast("Not enough political capital", "A divorce costs 8.");
    G.capital -= 8;
    const pious = G.pillars.clergy ? 12 : 4;
    const ch = applyEffects({ scandal: 10, p: { people: -6, clergy: -pious }, legitimacy: G.gov.type === "monarchy" ? -4 : -2 });
    log(`💔 You divorce ${f.spouse.name}.`, "bad");
    record(`Divorced ${f.spouse.name}, ${G.year}.`);
    f.exes = (f.exes || []).concat(f.spouse.name);
    f.spouse = null;
    toast("Divorce", "The palace and the press will talk of nothing else.", ch);
}

function changeSuccessionLaw() {
    const f = fam();
    if (G.gov.type !== "monarchy" || f.law === "equal") return;
    if (G.capital < 10) return toast("Not enough political capital", "It costs 10.");
    G.capital -= 10;
    f.law = "equal";
    const ch = applyEffects({ prestige: 3, p: { clergy: -8, royals: -5, press: 4 } });
    log("👑 You change the law of succession: the eldest child inherits, daughter or son.", "major");
    record(`Opened the succession to daughters, ${G.year}.`);
    toast("Equal succession", "Your eldest child, son or daughter, is now heir.", ch);
}

SCENES.family_match = () => {
    const L = G.leader, g = L.gender === "f" ? "m" : "f";
    const mon = G.gov.type === "monarchy";
    const ROYAL = ["uk", "norway", "sweden", "denmark", "netherlands", "belgium", "spain", "japan", "saudi", "iran", "ethiopia", "jordan", "morocco", "thailand", "cambodia", "egypt", "iraq", "libya", "nepal", "afghanistan"];
    const ok = k => k !== G.ck && G.nations[k] && G.nations[k].status === "sovereign";
    const foreign = mon ? (pick(ROYAL.filter(k => ok(k) && (G.nations[k].gov === "monarchy" || ["uk", "norway", "sweden", "denmark", "netherlands", "belgium", "japan", "spain", "thailand"].includes(k)))) || "uk")
        : (pick(Object.keys(G.nations).filter(k => ok(k) && G.nations[k].gdp > G.econ.gdp * 0.3)) || "uk");
    const an = w => /^[AEIOU]/.test(w) ? "an" : "a";
    const mk = (who, trait, fx, txt) => ch(`${who}`, fx, "", { hint: `${SPOUSE_TRAITS[trait].icon} ${SPOUSE_TRAITS[trait].name}: ${SPOUSE_TRAITS[trait].desc}${txt ? " " + txt : ""}`, run: () => marry(who.split(",")[0], g, trait) });
    const n1 = randomPersonName(g), n2 = randomPersonName(g), n3 = randomPersonName(g);
    return S("💍", `${dateStr()} · Matchmakers`, `A match for the ${mon ? L.title.split(" ")[0] : L.gender === "f" ? "Prime Minister" : "leader"}`.replace("Prime Minister", L.title.split(" (")[0]),
        "Your advisers have drawn up a short list. Every choice says something about you.",
        [mk(`${n1}, of one of the great families`, "private", { p: { royals: 5, clergy: 3, tribes: 3 } }, "The establishment approves."),
         mk(`${n2}, a much-loved ${g === "f" ? "actress" : "war hero"}`, "beloved", { p: { people: 6 } }, "The public will adore them."),
         mk(`${n3}, ${g === "f" ? "daughter" : "son"} of ${mon ? `the ${G.nations[foreign].name} royal family` : `${an(G.nations[foreign].name)} ${G.nations[foreign].name} political dynasty`}`, "political", { prestige: 3, rel: { [foreign]: 15 } }, `Closer ties with ${G.nations[foreign].name}.`),
         ch("Not now", {}, "You stay single, for now.")]);
};

function marry(name, gender, trait) {
    const f = fam(), L = G.leader;
    f.spouse = { name, gender, born: G.year - Math.max(20, L.age - Math.round(rnd(0, 12))), trait, alive: true, married: G.year };
    const ch = applyEffects({ p: { people: 5 }, prestige: G.gov.type === "monarchy" ? 4 : 2, stability: G.gov.type === "monarchy" ? 3 : 0 });
    log(`💒 ${L.name} marries ${name}. Crowds line the streets.`, "good");
    record(`Married ${name}, ${G.year}.`);
    return `A ${G.gov.type === "monarchy" ? "royal " : ""}wedding the country won't forget.`;
}

SCENES.family_birth = a => {
    const names = [...new Set(firstNames(a.gender))].sort(() => Math.random() - 0.5).slice(0, 3);
    const mon = G.gov.type === "monarchy";
    const heirNow = mon && !heirOf();
    return S(a.gender === "m" ? "👶" : "👶", `${dateStr()} · ${mon ? "The palace" : "Your family"}`, `A ${a.gender === "m" ? "son" : "daughter"} is born`,
        `${fam().spouse ? fam().spouse.name + " and you" : "You"} welcome a ${a.gender === "m" ? "son" : "daughter"}.${heirNow && (a.gender === "m" || fam().law === "equal") ? " The dynasty has an heir: the guns fire a salute across the capital." : ""} What will you call the child?`,
        names.map(n => ch(n, {}, "", { run: () => {
            fam().children.push({ name: n, gender: a.gender, born: G.year, path: null, alive: true });
            const isHeir = mon && heirOf() && heirOf().name.endsWith(n) && heirOf().child;
            const fx = isHeir && heirNow ? { stability: 6, legitimacy: 6, p: { royals: 8, people: 5 } } : { p: { people: 2 } };
            applyEffects(fx);
            log(`👶 ${n} is born${isHeir && heirNow ? ", heir to the throne" : ""}.`, "good");
            record(`Birth of ${n}, ${G.year}.`);
            return isHeir && heirNow ? `${n} is heir to the throne.` : `Welcome, ${n}.`;
        } })));
};

SCENES.family_spouse_death = () => {
    const sp = fam().spouse;
    return S("🕯️", `${dateStr()} · A private grief`, `${sp.name} has died`,
        `After a short illness, ${sp.name} has died at ${ageOf(sp)}. The nation mourns with you.`,
        [ch("A state funeral", { cost: 0.02, p: { people: 6 } }, "", { run: () => { fam().widowed = sp.name; sp.alive = false; fam().spouse = null; record(`Death of ${sp.name}, ${G.year}.`); return "The country shares your grief."; } }),
         ch("A private family funeral", { p: { people: 3 } }, "", { run: () => { fam().widowed = sp.name; sp.alive = false; fam().spouse = null; record(`Death of ${sp.name}, ${G.year}.`); return "You mourn in private."; } })]);
};

SCENES.family_career = a => {
    const c = fam().children.find(x => x.name === a.name && x.alive);
    if (!c) return S("👪", "", "", "", [ch("OK", {}, "")]);
    const set = (path, fx) => ch(`${CHILD_PATHS[path].icon} ${CHILD_PATHS[path].name}`, fx, "", { run: () => { c.path = path; return `${c.name} chooses a life as ${path === "playboy" ? "a jet-setter" : "a " + CHILD_PATHS[path].name.toLowerCase()}.`; } });
    return S("🎓", `${dateStr()} · Your family`, `${c.name} comes of age`,
        `${c.name}, now ${ageOf(c)}, must choose a path. Everything a leader's child does reflects on the leader.`,
        [set("military", { p: { military: 3 } }), set("politics", { p: { party: 2 } }), set("business", { p: { business: 2 } }), set("scholar", { prestige: 1 }), set("playboy", {})]);
};

SCENES.family_spouse_scandal = () => {
    const sp = fam().spouse;
    return S("📰", `${dateStr()} · The papers`, `${sp.name} in the headlines`,
        sp.trait === "ambitious" ? `${sp.name} has been caught handing out government contracts to friends.` : `${sp.name}'s lavish shopping trips abroad are front-page news while ordinary families struggle.`,
        [ch("Stand by them", { scandal: 6, p: { people: -3 } }, "Loyalty, the papers say, or blindness."),
         ch("A public apology and a quieter life", { p: { people: 1 } }, "", { run: () => { sp.trait = "private"; return `${sp.name} steps back from public life.`; } }),
         ch("Divorce", {}, "", { run: () => { G.capital += 8; divorce(); return ""; } })]);
};

SCENES.family_child_scandal = a => S("🛥️", `${dateStr()} · The papers`, `${a.name}'s latest escapade`,
    `Your child ${a.name} has crashed a sports car on the Riviera after a night at the casino. The opposition is delighted.`,
    [ch("Pay the damages and hush it up", { cost: 0.01, scandal: 3 }, "It leaks anyway, eventually."),
     ch("Send them to the army to straighten out", { p: { military: 1 } }, "", { run: () => { const c = fam().children.find(x => x.name === a.name); if (c) c.path = "military"; return `${a.name} reports for basic training.`; } }),
     ch("Defend your family's privacy", { scandal: 5, p: { people: -2 } }, "")]);

SCENES.family_heir_pressure = () => S("👑", `${dateStr()} · The royal family council`, "The throne has no heir",
    `You are ${G.leader.age} with no ${fam().law === "equal" ? "child" : "son"} to succeed you. Princes are already counting their supporters, and the royal family's patience is wearing thin.`,
    [ch(fam().spouse ? "Keep trying for a son" : "Find a consort, quickly", {}, "", { run: () => { if (!fam().spouse) seekSpouse(); return "The court waits."; } }),
     ch("Name a brother or cousin as crown prince", { p: { royals: 6 }, legitimacy: -2 }, "", { run: () => { G.leader.heir = { name: `Crown Prince ${pick(firstNames("m"))}`, age: Math.max(20, G.leader.age - Math.round(rnd(5, 20))), gender: "m" }; return `${G.leader.heir.name} is proclaimed heir.`; } }),
     ch("Open the succession to daughters", {}, "", { req: fam().law !== "equal" && fam().children.some(c => c.gender === "f" && c.alive), run: () => { G.capital += 10; changeSuccessionLaw(); return ""; } }),
     ch(fam().spouse ? "Divorce and remarry for an heir" : "Ignore them", fam().spouse ? {} : { p: { royals: -5 } }, "", { req: true, run: () => { if (fam().spouse) { G.capital += 8; divorce(); return "Like the Shah with Soraya, you choose the dynasty over love."; } return "The princes keep plotting."; } })]);

SCENES.family_matchmakers = () => S("💐", `${dateStr()} · Your advisers`, "The matchmakers are busy",
    "Your advisers say the country likes a leader with a family, and they have a few names in mind.",
    [ch("Hear them out", {}, "", { run: () => { G.capital += 3; seekSpouse(); return ""; } }),
     ch("Married to the nation", {}, "You stay single.")]);

// ── Office panel ────────────────────────────────────────────────────

function familyPanel() {
    const f = fam(), L = G.leader, sp = f.spouse && f.spouse.alive ? f.spouse : null;
    const mon = G.gov.type === "monarchy", heir = heirOf();
    const rel = c => c.gender === "m" ? "Son" : "Daughter";
    const kids = f.children.filter(c => c.alive).map(c => `<li>${heir && heir.child && heir.name.endsWith(c.name) && mon ? "👑 " : ""}<b>${esc(c.name)}</b> <span class="tiny muted">${rel(c)}, ${ageOf(c)}${c.path ? ` · ${CHILD_PATHS[c.path].icon} ${CHILD_PATHS[c.path].name}` : ""}</span></li>`).join("");
    const spTxt = sp ? `<p class="small">💍 <b>${esc(sp.name)}</b> <span class="tiny muted">${sp.gender === "f" ? (mon ? (L.gender === "m" ? "Queen consort" : "Wife") : "Wife") : (mon ? "Prince consort" : "Husband")}, ${ageOf(sp)}</span><br><span class="tiny">${SPOUSE_TRAITS[sp.trait].icon} ${SPOUSE_TRAITS[sp.trait].name}: ${esc(SPOUSE_TRAITS[sp.trait].desc)}</span></p>`
        : `<p class="small muted">${f.widowed ? `Widowed (${esc(f.widowed)}).` : "Unmarried."}</p>`;
    const heirTxt = mon ? (heir ? `<p class="small">👑 Heir: <b>${esc(heir.name)}</b>${heir.age != null ? `, ${heir.age}` : ""}</p>` : `<p class="small bad">👑 No heir. ${G.leader.age > 35 ? `The ${pillarName("royals").toLowerCase()} grow restless (loyalty ${Math.round(G.pillars.royals ? G.pillars.royals.l : 0)}, ${Math.round(familyPillar("royals"))} from the missing heir)` : "The court is watching"}, and your death would open a succession struggle.</p>`) + `<p class="tiny muted">Succession: ${f.law === "equal" ? "eldest child" : "eldest son, then a designated relative"}.</p>` : "";
    const btns = [];
    if (!sp) btns.push(`<button class="mini" data-act="famMarry" ${G.capital < 3 ? "disabled" : ""}>💍 Seek a ${L.gender === "f" ? "husband" : "wife"} (3 ⚡)</button>`);
    if (sp) btns.push(`<button class="mini secondary danger" data-act="famDivorce" ${G.capital < 8 ? "disabled" : ""}>💔 Divorce (8 ⚡)</button>`);
    if (mon && f.law !== "equal") btns.push(`<button class="mini secondary" data-act="famLaw" ${G.capital < 10 ? "disabled" : ""}>⚖️ Let daughters inherit (10 ⚡)</button>`);
    return panel("Family", `${spTxt}${kids ? `<ul class="family">${kids}</ul>` : `<p class="tiny muted">No children.</p>`}${heirTxt}<div class="row">${btns.join("")}</div>`);
}
