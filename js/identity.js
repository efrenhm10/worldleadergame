// ── PEOPLES & REGIONS — ethnic and regional politics ────────────────
//
// Many countries are held together by bargains between peoples. Regions
// with a distinct identity carry a grievance (from neglect, repression,
// poverty, religion and broken promises) and a movement that grows when
// the grievance festers:
//   quiet → agitation (protests, strikes) → armed insurgency → secession crisis.
// Your tools: cultural rights, regional autonomy, a federal state,
// development money, co-opting local elites, or the army. Repression works
// for a while, and makes the grievance worse.

// region index → [group, religion, language, starting grievance, separatist potential, state name if it breaks away]
const PEOPLES = {
    ethiopia: { 1: ["Tigrayans", "Orthodox Christian", "Tigrinya", 30, 0.5, "Tigray"], 2: ["Oromo", "Muslim and Christian", "Afaan Oromo", 45, 0.6, "Oromia"], 3: ["Somalis", "Sunni Muslim", "Somali", 55, 0.9, "Western Somalia"] },
    nigeria: { 0: ["Hausa-Fulani", "Sunni Muslim", "Hausa", 25, 0.4, "Arewa"], 1: ["Yoruba", "Christian and Muslim", "Yoruba", 20, 0.3, "Oduduwa"], 2: ["Igbo", "Christian", "Igbo", 50, 0.8, "Biafra"] },
    pakistan: { 3: ["Bengalis", "Muslim and Hindu", "Bengali", 50, 1, "Bangladesh"], 2: ["Pashtuns & Baloch", "Sunni Muslim", "Pashto and Balochi", 40, 0.6, "Pashtunistan"] },
    india: { 1: ["Tamils & Dravidians", "Hindu", "Tamil and others", 50, 0.4, "Dravida Nadu"], 4: ["Sikhs & Kashmiris", "Sikh and Muslim", "Punjabi and Kashmiri", 58, 0.7, "Khalistan"] },
    china: { 4: ["Tibetans & Uyghurs", "Buddhist and Muslim", "Tibetan and Uyghur", 60, 0.9, "East Turkestan & Tibet"] },
    russia: { 1: ["Ukrainians & Belarusians", "Orthodox Christian", "Ukrainian and Belarusian", 30, 0.5, "Ukraine"], 2: ["Balts", "Lutheran and Catholic", "Estonian, Latvian, Lithuanian", 70, 1, "the Baltic states"], 3: ["Caucasus peoples", "Orthodox and Muslim", "Georgian, Armenian, Azeri, Chechen", 45, 0.7, "the Caucasus republics"], 4: ["Central Asians", "Sunni Muslim", "Turkic and Tajik", 30, 0.5, "Turkestan"] },
    uk: { 3: ["Scots", "Presbyterian", "English and Gaelic", 15, 0.4, "Scotland"], 4: ["Welsh & Northern Irish Catholics", "Nonconformist and Catholic", "Welsh and Irish", 30, 0.6, "a united Ireland"] },
    canada: { 1: ["Québécois", "Catholic", "French", 58, 0.6, "Québec"] },
    usa: { 1: ["Black Southerners", "Protestant", "English", 60, 0.05, ""] },
    mexico: { 3: ["Maya & indigenous peoples", "Catholic and traditional", "Maya languages", 55, 0.3, "the Zapatista south"] },
    indonesia: { 1: ["Acehnese", "Sunni Muslim", "Acehnese", 40, 0.6, "Aceh"], 2: ["Eastern islanders & Papuans", "Christian and traditional", "Many languages", 45, 0.7, "West Papua & the Moluccas"] },
    turkey: { 3: ["Kurds", "Sunni and Alevi", "Kurdish", 55, 0.7, "Kurdistan"] },
    iran: { 1: ["Khuzestan Arabs", "Shia Muslim", "Arabic", 35, 0.4, "Arabistan"], 2: ["Azeris & Kurds", "Shia and Sunni", "Azeri and Kurdish", 45, 0.6, "Azerbaijan & Kurdistan"] },
    saudi: { 2: ["Eastern Province Shia", "Shia Muslim", "Arabic", 45, 0.3, "al-Hasa"] },
    southafrica: { 0: ["Black workers of the Rand", "Christian", "Zulu, Sotho, Tswana", 55, 0.1, ""], 1: ["Coloured & Xhosa communities", "Christian", "Afrikaans and Xhosa", 45, 0.2, "the Transkei"], 2: ["Zulu", "Christian and traditional", "Zulu", 50, 0.4, "KwaZulu"] },
    israel: { 2: ["Arab citizens", "Muslim, Christian and Druze", "Arabic", 50, 0.3, ""] },
    philippines: { 3: ["Moros", "Sunni Muslim", "Maguindanao, Maranao, Tausug", 50, 0.8, "Bangsamoro"] },
    cambodia: { 2: ["Vietnamese minority", "Buddhist", "Vietnamese", 30, 0.2, ""], 3: ["Highland peoples", "Traditional", "Mon-Khmer languages", 30, 0.3, ""] },
    southkorea: { 2: ["Jeolla people", "Buddhist and Christian", "Korean", 30, 0, ""] },
    brazil: { 2: ["Nordestinos", "Catholic", "Portuguese", 35, 0.05, ""] },
    fiji: { 0: ["Indo-Fijians", "Hindu and Muslim", "Fiji Hindi", 40, 0.1, ""] },
    newzealand: { 2: ["Māori", "Christian and traditional", "Māori", 35, 0.1, ""] },
    singapore: { 2: ["Malays & Indians", "Muslim and Hindu", "Malay and Tamil", 30, 0.1, ""] },
    switzerland: { 2: ["French-speaking Swiss", "Protestant and Catholic", "French", 5, 0.05, ""], 3: ["Italian-speaking Swiss", "Catholic", "Italian", 5, 0.05, ""] },
    germany: { 1: ["Bavarians", "Catholic", "German (Bavarian)", 10, 0.1, "Bavaria"] }
};
const MOVE_STAGES = [[0, "Quiet", "🕊️"], [25, "Agitation", "📢"], [50, "Armed insurgency", "🔥"], [78, "Secession crisis", "🏴"]];
const stageOf = s => MOVE_STAGES.slice().reverse().find(([t]) => s >= t);
const AUTONOMY = ["Centralized rule", "Cultural rights", "Regional autonomy", "Federal state"];
const AUTONOMY_FX = [0, -8, -16, -24];

function peoples() {
    if (!G.idn) {
        G.idn = {};
        const P = PEOPLES[G.ck] || {};
        G.regions.forEach((r, i) => {
            const d = P[i] || (r.t.includes("minority") || r.t.includes("tribal") ? [`People of ${r.n}`, "", "", 30, 0.4, r.n] : null);
            if (!d) return;
            G.idn[r.n] = { g: d[0], rel: d[1], lang: d[2], griev: d[3], sep: d[4], state: d[5], str: Math.max(0, d[3] - 35) * 0.5, aut: G.ck === "switzerland" ? 3 : 0, crack: 0, dev: 0, coopt: 0, warned: 0 };
        });
        // Countries that started as federations or with autonomy.
        if (G.ck === "russia") Object.values(G.idn).forEach(x => { x.aut = 1; });
        if (G.ck === "uk" && G.idn[G.regions[4] && G.regions[4].n]) G.idn[G.regions[4].n].aut = 2;   // Stormont
        if (G.ck === "india" || G.ck === "nigeria" || G.ck === "canada" || G.ck === "australia" || G.ck === "usa" || G.ck === "germany" || G.ck === "mexico" || G.ck === "brazil") Object.values(G.idn).forEach(x => { x.aut = Math.max(x.aut, 3); });
    }
    return G.idn;
}
const idnOf = r => peoples()[r.n] || null;
const regionIndex = r => G.regions.indexOf(r);

// What the grievance is heading toward, with reasons.
function grievanceParts(r) {
    const x = idnOf(r);
    if (!x) return [];
    const sup = regionSupport(r), poor = G.s.poverty, parts = [];
    const base = (PEOPLES[G.ck] && PEOPLES[G.ck][regionIndex(r)] || [0, 0, 0, 30])[3];
    parts.push(["Historic grievances", base]);
    if (sup < 45) parts.push(["Low support for your government", (45 - sup) * 0.5]);
    if (G.pol.rights === "segregation") parts.push(["Discriminatory laws", 15]);
    if (G.pol.rights === "equal") parts.push(["Equal rights law", -10]);
    if (G.s.liberty < 30) parts.push(["Repression nationwide", 8]);
    if (x.rel && /Muslim|Sikh|Buddhist|Catholic|Shia|traditional/.test(x.rel) && ["established", "theocratic"].includes(G.pol.religion)) parts.push(["Established state religion", 6]);
    if (poor > 50) parts.push(["Poverty", (poor - 50) * 0.2]);
    parts.push([AUTONOMY[x.aut], AUTONOMY_FX[x.aut]]);
    if (x.dev > 0.5) parts.push(["Development money", -x.dev]);
    if (x.coopt > 0.5) parts.push(["Co-opted local leaders", -x.coopt]);
    if (x.crack > 0.5) parts.push(["Memories of the crackdown", x.crack]);
    if (G.mega && G.mega.list.some(p => p.region === regionIndex(r) && (p.stage === "building" || p.stage === "done") && ["dam", "capital"].includes(p.type))) parts.push(["Land flooded or cleared for a megaproject", 6]);
    if (r.mod > 3) parts.push(["Projects and investment here", -Math.min(10, r.mod * 0.6)]);
    return parts.filter(([, v]) => Math.abs(v) >= 0.5);
}
const grievanceTarget = r => clamp(grievanceParts(r).reduce((s, [, v]) => s + v, 0), 0, 100);

function identityMonthly() {
    const P = peoples();
    G.regions.forEach((r, i) => {
        const x = P[r.n];
        if (!x) return;
        x.griev += (grievanceTarget(r) - x.griev) * 0.08;
        x.dev *= 0.97; x.coopt *= 0.95; x.crack *= 0.96;
        // The movement grows on grievance, more where separatism has deep roots.
        const push = (x.griev - 45) * 0.04 * (0.3 + x.sep);
        x.str = clamp(x.str + (push > 0 ? push : push * 1.5) - (G.s.stability > 70 ? 0.3 : 0), 0, 100);
        const st = stageOf(x.str);
        if (st[0] >= 25 && x.warned < 25) { x.warned = 25; queueScene("idn_demand", { r: r.n }); }
        else if (st[0] >= 50 && x.warned < 50 && x.sep >= 0.3) { x.warned = 50; queueScene("idn_revolt", { r: r.n }); }
        else if (st[0] >= 78 && x.warned < 78 && x.sep >= 0.5) { x.warned = 78; queueScene("idn_secession", { r: r.n }); }
        if (x.str < x.warned - 15) x.warned = st[0];
        // Unrest costs the region's goodwill.
        if (st[0] >= 25) r.mod -= st[0] >= 50 ? 1 : 0.4;
    });
}

// Pulls on national stats.
function identityStability() {
    let s = 0;
    G.regions.forEach(r => { const x = idnOf(r); if (!x) return; const st = stageOf(x.str)[0], w = Math.sqrt(r.pop / 25); s -= (st >= 78 ? 10 : st >= 50 ? 6 : st >= 25 ? 2 : 0) * w; });
    return s;
}
function identityGrowth() {
    let g = 0;
    G.regions.forEach(r => { const x = idnOf(r); if (!x) return; if (stageOf(x.str)[0] >= 50) g -= 0.5 * r.pop / 50; });
    return g;
}
function identitySupport(r) { if (!G || !G.idn) return 0; const x = G.idn[r.n]; return x ? -Math.max(0, x.griev - 30) * 0.3 : 0; }

// ── Your tools ──────────────────────────────────────────────────────
function idnAct(name, k) {
    const r = G.regions.find(x => x.n === name), x = r && idnOf(r);
    if (!x) return;
    const cost = { autonomy: 4 + x.aut * 4, develop: 3, coopt: 3, crackdown: 4 }[k];
    if (G.capital < cost) return toast("Not enough political capital", `It costs ${cost}.`);
    if (k === "autonomy" && x.aut >= 3) return;
    G.capital -= cost;
    const before = impactSnapshot();
    if (k === "autonomy") {
        x.aut++;
        applyEffects(x.aut === 3 ? { p: { military: -4, party: -3 }, legitimacy: 2 } : { p: { military: -2 } });
        if (x.aut === 3) G.econ.taxCap = Math.max(0.1, G.econ.taxCap - 0.01);
        log(`🤝 ${x.g} of ${r.n}: ${AUTONOMY[x.aut].toLowerCase()} granted.`, "policy");
    }
    if (k === "develop") { treasuryPay(G.econ.gdp * 0.003); x.dev += 10; r.mod += 6; log(`🏗️ A development fund for ${r.n}: roads, schools and clinics for the ${x.g}.`, "policy"); }
    if (k === "coopt") { x.coopt += 8; x.str = Math.max(0, x.str - 6); applyEffects({ corruption: 2 }); log(`🎩 Jobs, contracts and titles for the leading families of ${r.n}. The ${x.g}'s firebrands lose some followers.`, "policy"); }
    if (k === "crackdown") {
        x.str = Math.max(0, x.str - 25); x.crack += 14;
        applyEffects({ liberty: -3, prestige: -2, legitimacy: -1, p: { military: 3, security: 3 } });
        log(`🪖 Troops and police sweep ${r.n}. Leaders of the ${x.g}'s movement are arrested; the grievance runs deeper.`, "bad");
    }
    toast(r.n, k === "crackdown" ? "The movement is driven underground." : "Done.", impactDiff(before, `${r.n}: ${k}`));
}

// A region breaks away.
function loseRegion(name) {
    const i = G.regions.findIndex(x => x.n === name);
    if (i < 0 || G.regions.length <= 1) return;
    const r = G.regions[i], x = idnOf(r), f = r.pop / 100;
    const e = G.econ;
    e.pop *= 1 - f;
    Object.values(G.ind).forEach(ind => { ind.out *= 1 - f * 0.85; });
    e.services *= 1 - f * 0.85;
    e.gdp = Object.keys(G.ind).reduce((s, k) => s + indValue(k), 0) + e.services;
    G.mil.base *= 1 - f * 0.5;
    G.regions.splice(i, 1);
    const tot = G.regions.reduce((s, q) => s + q.pop, 0);
    G.regions.forEach(q => { q.pop = Math.round(q.pop / tot * 1000) / 10; });
    delete G.idn[name];
    if (/Bengal/.test(name)) G.flags.bangladesh = true;
    const k = `new_${G.ck}_${i}`;
    G.nations[k] = { key: k, name: x && x.state ? x.state.replace(/^the /, "") : name, flag: "🏳️", area: C().area, gdp: e.gdp * f / (1 - f), pop: e.pop * f / (1 - f), mil: 1, stab: 40, nukes: 0, gov: "one_party", leader: "Liberation Council", align: 0, status: "sovereign", playable: false, diverged: true };
    addRel(G.ck, k, -30);
    G.mega && G.mega.list.forEach(p => { if (p.region === i) p.seized = true; else if (p.region > i) p.region--; });
    applyEffects({ prestige: -15, legitimacy: -10, p: { military: -10, people: -6 } });
    log(`🏳️ ${r.n} breaks away as the independent state of ${G.nations[k].name}. ${C().name} loses ${Math.round(f * 100)}% of its people.`, "major");
    record(`Lost ${r.n}, which became independent as ${G.nations[k].name}, ${G.year}.`);
}

// Separatist war hook (called from endWar).
function identityWarEnd(w, winner) {
    const name = w.secession, r = G.regions.find(x => x.n === name), x = r && idnOf(r);
    if (winner === "a") loseRegion(name);
    else if (x) { x.str = 5; x.crack += 10; x.warned = 0; log(`🪖 The separatists of ${name} are defeated. The guns fall silent, but the ${x.g} do not forget.`, "major"); }
}

function startSecessionWar(name) {
    const r = G.regions.find(q => q.n === name), x = r && idnOf(r);
    if (!x) return;
    const k = `sep_${G.ck}_${regionIndex(r)}`;
    G.nations[k] = { key: k, name: `${x.state || name} liberation front`, flag: "🏴", area: C().area, gdp: 0.05, pop: 0, mil: G.mil.strength * (0.07 + x.str / 700) * Math.sqrt(r.pop / 25), stab: 50, nukes: 0, gov: "rebels", leader: "", align: 0, status: "rebel", rebel: true, of: G.ck, playable: false };
    startWar({ name: `${name} war`, a: [k], b: [G.ck], type: "insurgency", front: -5, secession: name });
}

// ── Scenes ──────────────────────────────────────────────────────────
SCENES.idn_demand = a => {
    const r = G.regions.find(q => q.n === a.r), x = r && idnOf(r);
    if (!x) return S("📢", "", "", "", [ch("OK", {}, "")]);
    return S("📢", `${dateStr()} · ${r.n}`, `The ${x.g} demand their rights`,
        `Rallies fill the towns of ${r.n}. Leaders of the ${x.g} want ${x.aut === 0 ? `${x.lang || "their language"} in schools and courts, and a fair share of jobs` : "more say over their own affairs"}. The army says it can keep order.`,
        [ch(x.aut === 0 ? "Grant cultural rights" : "Negotiate wider autonomy", { stability: 1, p: { military: -2 } }, "", { run: () => { x.aut = Math.min(3, x.aut + 1); x.str = Math.max(0, x.str - 10); return `${AUTONOMY[x.aut]} for ${r.n}. The crowds go home.`; } }),
         ch("Promise development money", {}, "", { run: () => { treasuryPay(G.econ.gdp * 0.003); x.dev += 10; r.mod += 6; return "Roads and schools are promised. The leaders wait to see."; } }),
         ch("Arrest the ringleaders", { liberty: -2, p: { security: 2 } }, "", { run: () => { x.str = Math.max(0, x.str - 15); x.crack += 10; return "The movement goes underground."; } }),
         ch("Ignore them", {}, "The rallies continue.")]);
};
SCENES.idn_revolt = a => {
    const r = G.regions.find(q => q.n === a.r), x = r && idnOf(r);
    if (!x) return S("🔥", "", "", "", [ch("OK", {}, "")]);
    return S("🔥", `${dateStr()} · ${r.n}`, `Armed revolt in ${r.n}`,
        `Fighters of the ${x.g} have attacked police posts and army convoys. They call for ${x.state ? `an independent ${x.state}` : "self-rule"}.`,
        [ch("Send in the army", { p: { military: 4 }, liberty: -2 }, "", { run: () => { startSecessionWar(r.n); return "A counter-insurgency campaign begins (see the Military tab)."; } }),
         ch("Offer a federal deal", { p: { military: -5, party: -3 } }, "", { run: () => { x.aut = 3; x.str = Math.max(0, x.str - 25); return `${r.n} becomes a self-governing state within the federation. Most fighters lay down their arms.`; } }),
         ch("Amnesty and a development fund", {}, "", { run: () => { treasuryPay(G.econ.gdp * 0.005); x.dev += 14; x.str = Math.max(0, x.str - 12); r.mod += 8; return "Some fighters take the amnesty; others hold out in the hills."; } })]);
};
SCENES.idn_secession = a => {
    const r = G.regions.find(q => q.n === a.r), x = r && idnOf(r);
    if (!x) return S("🏴", "", "", "", [ch("OK", {}, "")]);
    const lose = x.griev > 55;
    return S("🏴", `${dateStr()} · ${r.n}`, `${r.n} declares independence`,
        `Leaders of the ${x.g} have proclaimed ${x.state ? `the independent state of ${x.state}` : "independence"}. The world is watching.`,
        [ch("Fight to keep the country together", { p: { military: 5 }, stability: -3 }, "", { run: () => { startSecessionWar(r.n); return "War. The nation's unity will be settled on the battlefield."; } }),
         ch("Hold a referendum", { prestige: 3 }, "", { run: () => { if (lose) { loseRegion(r.n); return "The vote is for independence, and you accept it."; } x.str = 15; x.aut = Math.max(x.aut, 2); return "A majority votes to stay, with wide autonomy. The crisis passes."; } }),
         ch("Offer a federal state at the last minute", { p: { party: -4 } }, "", { run: () => { x.aut = 3; x.str = Math.max(0, x.str - 30); x.griev = Math.max(0, x.griev - 10); return "The offer splits the movement. Enough leaders accept it to stop the breakaway."; } })]);
};

// ── Population tab panel ────────────────────────────────────────────
function peoplesPanel() {
    const P = peoples(), e = G.econ;
    const rows = G.regions.map(r => {
        const x = P[r.n];
        const head = `<div class="budget-row tre-row"><span><b>${esc(r.n)}</b> <span class="tiny muted">${fmtPeople(e.pop * r.pop / 100)} · support ${Math.round(regionSupport(r))}%</span></span>${x ? `<b>${stageOf(x.str)[2]} ${stageOf(x.str)[1]}</b>` : `<b class="muted tiny">core</b>`}</div>`;
        if (!x) return `<div class="idn-row">${head}</div>`;
        const parts = grievanceParts(r).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).slice(0, 4).map(([l, v]) => `${esc(l)} <b class="${v > 0 ? "bad" : "good"}">${v > 0 ? "+" : ""}${Math.round(v)}</b>`).join(" · ");
        return `<div class="idn-row">${head}
            <p class="tiny">👥 <b>${esc(x.g)}</b>${x.rel ? ` · ${esc(x.rel)}` : ""}${x.lang ? ` · ${esc(x.lang)}` : ""} · ${AUTONOMY[x.aut]}</p>
            ${meter("Grievance", x.griev / 100, false, Math.round(x.griev))}
            ${meter("Movement strength", x.str / 100, false, Math.round(x.str))}
            <p class="tiny muted">${parts} · heading to ${Math.round(grievanceTarget(r))}</p>
            <div class="row">${x.aut < 3 ? `<button class="mini" data-act="idn" data-r="${esc(r.n)}" data-k="autonomy">${AUTONOMY[x.aut + 1]} (${4 + x.aut * 4} ⚡)</button>` : ""}<button class="mini secondary" data-act="idn" data-r="${esc(r.n)}" data-k="develop">Development fund (3 ⚡)</button><button class="mini secondary" data-act="idn" data-r="${esc(r.n)}" data-k="coopt">Co-opt leaders (3 ⚡)</button><button class="mini secondary danger" data-act="idn" data-r="${esc(r.n)}" data-k="crackdown">Crackdown (4 ⚡)</button></div></div>`;
    }).join("");
    return panel("Peoples & regions", rows + `<p class="tiny muted">Grievances grow from neglect, poverty, discrimination and repression. Strong movements move from protests to armed revolt to secession. Autonomy and development calm them; crackdowns buy time and deepen the grievance.</p>`);
}
