// ── LANDMARKS & WONDERS — buildings that put you on the map ─────────
//
// An airport that wins design prizes, an opera house on the harbour, the
// world's tallest tower, a grand mosque or cathedral, a stadium that hosts
// the Olympics. You choose the architectural style (and so the cost and how
// striking it is) and the name. Landmarks draw tourists, skilled migrants
// and investors, lift national pride, and stand for decades.

const LANDMARKS = {
    airport:  { name: "Iconic international airport", icon: "🛫", cost: 1.5, years: 3, from: 1955, appeal: 3, infra: { airports: 20 }, ind: { tourism: 1.5, finance: 0.3 }, prestige: 3, odds: 0.05, desc: "A soaring terminal that is the country's first impression." },
    opera:    { name: "Opera house", icon: "🎭", cost: 0.8, years: 4, from: 1950, appeal: 4, ind: { tourism: 0.8 }, prestige: 4, p: { press: 2 }, desc: "A stage for the world's great performers, and a symbol on the skyline." },
    tower:    { name: "Record-breaking tower", icon: "🗼", cost: 1.5, years: 4, from: 1960, appeal: 5, ind: { tourism: 1, finance: 0.8 }, prestige: 5, p: { business: 3 }, desc: "The tallest building in the region, maybe the world." },
    worship:  { name: "Grand house of worship", icon: "🕌", cost: 1, years: 5, from: 1950, appeal: 3, ind: { tourism: 0.6 }, prestige: 2, p: { clergy: 8 }, legit: 3, desc: "A great mosque, cathedral or temple for the ages; pilgrims will come." },
    museum:   { name: "National museum", icon: "🏛️", cost: 0.5, years: 3, from: 1950, appeal: 2, ind: { tourism: 0.7 }, prestige: 2, p: { press: 2 }, desc: "The nation's treasures under one dramatic roof." },
    stadium:  { name: "National stadium", icon: "🏟️", cost: 0.8, years: 3, from: 1950, appeal: 2, ind: { tourism: 0.4 }, prestige: 2, p: { people: 4 }, desc: "A hundred thousand seats. Lets you bid for the Olympics and the World Cup." },
    bridge:   { name: "Signature bridge", icon: "🌉", cost: 1, years: 4, from: 1950, appeal: 3, infra: { roads: 5 }, ind: { tourism: 0.5 }, prestige: 3, desc: "A great span that ends up on every postcard." },
    palace:   { name: "Palace", icon: "🏰", cost: 0.6, years: 3, from: 1950, appeal: 2, ind: { tourism: 0.4 }, prestige: 1, desc: "A seat of power to impress visiting heads of state." },
    resort:   { name: "Luxury resort coast", icon: "🏝️", cost: 0.7, years: 2, from: 1955, appeal: 3, ind: { tourism: 2.5 }, prestige: 1, p: { business: 2 }, req: () => G.res.includes("coast") || G.res.includes("tourism") ? null : "Needs a coast or natural attractions", desc: "Beaches, golf and grand hotels for the jet age." },
    park:     { name: "National park & wildlife reserve", icon: "🦁", cost: 0.2, years: 1, from: 1950, appeal: 2, ind: { tourism: 1 }, prestige: 2, health: 0.5, desc: "Protect the land and its animals; safari tourists follow." },
    monument: { name: "National monument", icon: "🗽", cost: 0.3, years: 2, from: 1950, appeal: 1, ind: { tourism: 0.3 }, legit: 4, p: { people: 3 }, desc: "Stone and bronze for the nation's story." },
    expo:     { name: "World's Fair (Expo)", icon: "🎡", cost: 2, years: 4, from: 1958, appeal: 4, ind: { tourism: 2 }, prestige: 6, p: { business: 4 }, temp: 6, req: () => G.dev.urban < 35 ? `Urbanization 35% (now ${Math.round(G.dev.urban)}%)` : null, desc: "Pavilions from every nation, millions of visitors, a glimpse of the future." }
};

// Architecture by era, and how bold you go.
function lmStyles() {
    const y = G.year;
    const era = y < 1960 ? "International Modernist" : y < 1975 ? "Brutalist concrete" : y < 1995 ? "Postmodern" : y < 2010 ? "High-tech glass & steel" : "Parametric neo-futurist";
    return [
        { k: "plain", name: "Practical", mult: 0.75, appeal: 0.5, desc: "Built to budget. Useful, forgettable." },
        { k: "era", name: era, mult: 1, appeal: 1, desc: "The architecture of the moment." },
        { k: "national", name: "National revival", mult: 1.1, appeal: 1.1, legit: 2, desc: "Your own traditions in stone: domes, carvings, local materials." },
        { k: "bold", name: "Visionary (a star architect)", mult: 1.5, appeal: 1.8, desc: "A world-famous architect and a design no one has seen before. It will be photographed for a century." }
    ];
}

// Real landmarks as name suggestions.
const LM_NAMES = {
    australia: { opera: "Sydney Opera House" }, uae: { tower: "Burj Khalifa", airport: "Dubai International Terminal", resort: "Palm Jumeirah" }, canada: { tower: "CN Tower" },
    singapore: { airport: "Changi Airport", resort: "Sentosa", park: "Gardens by the Bay" }, brazil: { worship: "Brasília Cathedral", stadium: "Maracanã" }, usa: { bridge: "Golden Gate II", tower: "World Trade Center" },
    france: { museum: "Centre Pompidou" }, ethiopia: { worship: "Holy Trinity Cathedral", monument: "Lion of Judah monument", park: "Simien Mountains National Park", stadium: "Addis Ababa Stadium" },
    saudi: { worship: "Expansion of the Grand Mosque" }, pakistan: { worship: "Faisal Mosque" }, india: { worship: "Lotus Temple", stadium: "National Stadium" }, japan: { tower: "Tokyo Tower", expo: "Expo '70 Osaka" },
    china: { stadium: "Bird's Nest Stadium", tower: "Oriental Pearl Tower" }, uk: { museum: "British Library", tower: "The Shard" }, southafrica: { park: "Kruger extension", stadium: "Soccer City" },
    turkey: { bridge: "Bosphorus Bridge" }, iran: { monument: "Shahyad Tower" }, indonesia: { monument: "National Monument (Monas)" }, philippines: { museum: "Cultural Center of the Philippines" },
    mexico: { museum: "National Museum of Anthropology", stadium: "Estadio Azteca" }, nigeria: { worship: "Abuja National Mosque" }, norway: { opera: "Oslo Opera House" }, switzerland: { museum: "Swiss National Museum" }
};
function lmSuggest(k) {
    const n = LM_NAMES[G.ck] && LM_NAMES[G.ck][k];
    if (n) return n;
    const cap = (G.regions[0] && G.regions[0].n.split(/ & |,| \(/)[0]) || C().name;
    return { airport: `${cap} International Airport`, opera: `${cap} Opera House`, tower: `${C().name} Tower`, worship: `Grand ${MUSLIM_STATES.includes(G.ck) ? "Mosque" : ["japan", "cambodia", "india", "singapore"].includes(G.ck) ? "Temple" : G.ck === "israel" ? "Synagogue" : "Cathedral"} of ${cap}`, museum: `National Museum of ${C().name}`, stadium: `${C().name} National Stadium`, bridge: `${cap} Bridge`, palace: `${G.gov.type === "monarchy" ? "Royal" : "Presidential"} Palace`, resort: `${C().name} Riviera`, park: `${C().name} National Park`, monument: `Monument to the Nation`, expo: `Expo ${G.year + 4}` }[k];
}

function lmState() { if (!G.lm) G.lm = { list: [], draft: {}, bids: {} }; return G.lm; }
function lmLock(k) {
    const T = LANDMARKS[k], L = lmState();
    if (G.year < T.from) return `From ${T.from}`;
    if (L.list.some(x => x.k === k && !x.cancelled)) return "Built or under way";
    return T.req ? T.req() : null;
}

function lmBuild(k) {
    const lock = lmLock(k);
    if (lock) return toast("Not yet", lock);
    const L = lmState(), d = L.draft[k] || {}, T = LANDMARKS[k];
    const st = lmStyles().find(s => s.k === (d.style || "era"));
    if (L.list.filter(x => x.stage === "building").length >= 3) return toast("Too many cranes", "Three landmarks at a time.");
    if (G.capital < 3) return toast("Not enough political capital", "It costs 3.");
    G.capital -= 3;
    const name = (d.name || lmSuggest(k)).slice(0, 60);
    const cost = G.econ.gdp * T.cost / 100 * st.mult;
    const it = { k, name, style: st.k, styleName: st.name, cost, done: 0, weeks: Math.round(T.years * 52 * (st.k === "bold" ? 1.2 : 1) * rnd(0.9, 1.15)), stage: "building", start: G.t, appeal: T.appeal * st.appeal, region: 0 };
    L.list.push(it);
    log(`🏗️ Work begins on the ${name}, in the ${st.name.toLowerCase()} style. Cost: about ${nominal(cost)}.`, "policy");
    toast("Construction begins", `${T.icon} ${name}`);
}

function lmWeek() {
    if (!G.lm) return;
    G.lm.list.forEach(it => {
        if (it.stage !== "building") return;
        if (G.s.stability < 25) return;
        const step = it.cost / it.weeks;
        treasuryPay(step);
        it.done += step;
        if (it.done >= it.cost - 1e-9) lmOpen(it);
    });
}

function lmOpen(it) {
    const T = LANDMARKS[it.k], st = lmStyles().find(s => s.k === it.style) || {};
    it.stage = "open"; it.opened = G.year;
    const fx = { prestige: Math.round((T.prestige || 0) * it.appeal / T.appeal), p: Object.assign({}, T.p || {}) };
    if (T.legit || st.legit) fx.legitimacy = (T.legit || 0) + (st.legit || 0);
    if (it.k === "palace") { if (G.gov.type === "monarchy") { fx.p.royals = 6; fx.legitimacy = (fx.legitimacy || 0) + 3; } else fx.p.people = (fx.p.people || 0) - 3; }
    applyEffects(fx);
    if (G.regions[it.region]) G.regions[it.region].mod += 4;
    // A first landmark puts the country on the tourist map.
    if (!G.res.includes("tourism")) { G.res.push("tourism"); log(`🧳 With the ${it.name}, ${C().name} is on the tourist map: a tourism industry can grow.`, "good"); }
    // Hotels, airlines and tour operators follow a new attraction.
    G.ind.tourism.out += G.econ.gdp * 0.0015 * it.appeal;
    addJobs(jobsFor(G.econ.gdp * 0.0015 * it.appeal, "tourism"));
    log(`✨ The ${it.name} opens to the world${it.style === "bold" ? ", and architecture critics are rapturous" : ""}.`, "major");
    record(`Opened the ${it.name}, ${G.year}.`);
    queueScene("lm_open", { name: it.name });
    if (it.k === "stadium") queueScene("lm_bid", {});
}

// Standing effects.
const lmOpenList = () => G.lm ? G.lm.list.filter(x => x.stage === "open") : [];
function lmAppeal() { return lmOpenList().reduce((s, x) => s + x.appeal * (LANDMARKS[x.k].temp && G.year - x.opened > LANDMARKS[x.k].temp ? 0.3 : 1), 0) + (G.lm && G.lm.games && G.year - G.lm.games.y <= 6 ? 4 : 0); }
function lmInd(k) {
    return lmOpenList().reduce((s, x) => { const T = LANDMARKS[x.k], v = (T.ind || {})[k] || 0, fade = T.temp && G.year - x.opened > T.temp ? 0.3 : 1; return s + v * (x.appeal / T.appeal) * fade; }, 0) + (k === "tourism" && G.lm && G.lm.games && G.year - G.lm.games.y <= 6 ? 2 : 0);
}
function lmInfra(k) { return lmOpenList().reduce((s, x) => s + ((LANDMARKS[x.k].infra || {})[k] || 0), 0); }
function lmFx(key) {
    if (key === "prestige") return Math.min(12, lmOpenList().reduce((s, x) => s + (LANDMARKS[x.k].prestige || 0) * 0.5 * x.appeal / LANDMARKS[x.k].appeal, 0)) + (G.lm && G.lm.games && G.year - G.lm.games.y <= 4 ? 4 : 0);
    if (key === "odds") return lmOpenList().reduce((s, x) => s + (LANDMARKS[x.k].odds || 0), 0) + Math.min(0.08, lmAppeal() * 0.006);
    if (key === "health") return lmOpenList().reduce((s, x) => s + (LANDMARKS[x.k].health || 0), 0);
    return 0;
}
// Foreign visitors a year (millions), from the size of the tourism industry.
// About $350 (1950 dollars) spent per visit.
function visitors() { return indValue("tourism") * 1000 / 350; }

SCENES.lm_open = a => S("✨", `${dateStr()} · Opening night`, `The ${a.name} opens`,
    "Fireworks, foreign dignitaries and the world's cameras. Travel magazines are already putting it on their covers.",
    [ch("A gala for the world's press", { prestige: 2, p: { press: 2 } }, "The photographs travel everywhere."),
     ch("Open it free to the people for a week", { p: { people: 4 } }, "Families queue around the block.")]);

SCENES.lm_bid = () => {
    const me = typeof myStanding === "function" ? myStanding() : null;
    const odds = clamp(0.15 + G.s.prestige / 200 + (me ? Math.max(0, 25 - me.rank) / 60 : 0) + (lmAppeal() > 8 ? 0.1 : 0), 0.05, 0.8);
    const game = G.year >= 1950 && chance(0.5) ? "Summer Olympics" : "World Cup";
    return S("🏅", `${dateStr()} · The sports ministry`, `Bid for the ${game}?`,
        `With the new stadium open, the sports federations say ${C().name} could host the ${game}. A bid costs money and favours; winning means years of construction, tourists and global attention. Chance of winning: about ${Math.round(odds * 100)}%.`,
        [ch("Bid to host", { cost: 0.1 }, "", { run: () => {
            if (!chance(odds)) { applyEffects({ prestige: -1 }); return "The committee picks another city. Maybe next time."; }
            lmState().games = { y: G.year + 4, name: game };
            G.ind.tourism.out += G.econ.gdp * 0.004;
            treasuryPay(G.econ.gdp * 0.015);
            applyEffects({ prestige: 6, p: { people: 6, business: 3 } });
            log(`🏅 ${C().name} will host the ${game} in ${G.year + 4}!`, "major");
            record(`Won the right to host the ${game}, ${G.year}.`);
            return `You'll host the ${game} in ${G.year + 4}. Tourists and the world's eyes will follow.`;
        } }),
         ch("Not this time", {}, "The stadium hosts the national league instead.")]);
};

// ── Megaprojects tab panel ──────────────────────────────────────────
function landmarksPanel() {
    const L = lmState(), styles = lmStyles();
    const built = L.list.filter(x => x.stage !== "cancelled").map(x => {
        const T = LANDMARKS[x.k];
        return x.stage === "open" ? `<div class="budget-row tre-row"><span>${T.icon} <b>${esc(x.name)}</b> <span class="tiny muted">${esc(x.styleName)} · opened ${x.opened}</span></span><b class="good">★ ${fmt(x.appeal, 1)}</b></div>`
            : `<div class="lm-build">${meter(`${T.icon} ${esc(x.name)} <span class="tiny muted">${esc(x.styleName)}</span>`, x.done / x.cost, true, Math.round(x.done / x.cost * 100) + "%")}</div>`;
    }).join("");
    const opts = Object.entries(LANDMARKS).filter(([k]) => !L.list.some(x => x.k === k && !x.cancelled)).map(([k, T]) => {
        const lock = lmLock(k), d = L.draft[k] || {}, st = styles.find(s => s.k === (d.style || "era"));
        const cost = G.econ.gdp * T.cost / 100 * st.mult;
        return `<div class="mega-row ${lock ? "locked" : ""}"><div style="flex:1"><b>${T.icon} ${esc(T.name)}</b> <span class="tiny muted">~${nominal(cost)} · ${T.years} yrs · appeal ★${fmt(T.appeal * st.appeal, 1)}</span><p class="tiny">${esc(T.desc)}</p>
            ${lock ? `<p class="tiny warn">🔒 ${esc(lock)}</p>` : `<input type="text" data-change="lmName" data-k="${k}" value="${esc(d.name || lmSuggest(k))}" maxlength="60" aria-label="Name">
            <select data-change="lmStyle" data-k="${k}">${styles.map(s => `<option value="${s.k}" ${st.k === s.k ? "selected" : ""}>${esc(s.name)} (×${s.mult} cost, ★×${s.appeal}): ${esc(s.desc)}</option>`).join("")}</select>`}</div>
            ${lock ? "" : `<button class="mini" data-act="lmBuild" data-k="${k}" ${G.capital < 3 ? "disabled" : ""}>Build (3 ⚡)</button>`}</div>`;
    }).join("");
    const g = L.games;
    return panel("Landmarks & wonders", `
        <div class="budget"><div><small>Foreign visitors</small><b>${visitors() >= 1 ? fmt(visitors(), 1) + "M" : visitors() >= 0.001 ? Math.round(visitors() * 1000).toLocaleString("en-US") + ",000" : Math.round(visitors() * 1e6).toLocaleString("en-US")}</b><span class="tiny muted">a year</span></div><div><small>Landmark appeal</small><b>★ ${fmt(lmAppeal(), 1)}</b></div><div><small>Tourism</small><b>${fmt(indShare("tourism"), 1)}%</b><span class="tiny muted">of GDP</span></div></div>
        ${g ? `<p class="tiny good">🏅 ${g.y >= G.year ? `Hosting the ${esc(g.name)} in ${g.y}.` : `You hosted the ${esc(g.name)} in ${g.y}.`}</p>` : ""}
        ${built ? `<h4>Your landmarks</h4>${built}` : ""}
        <h4>Commission a landmark</h4><p class="tiny muted">Name it, pick a style, and pay as it rises (treasury first, then borrowing). Appeal draws tourists, skilled migrants and investors.</p>${opts}`);
}
