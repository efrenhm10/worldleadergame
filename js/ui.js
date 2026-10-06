// ── UI — screens and views ──────────────────────────────────────────

let view = "office";
let ui = { setupCk: null, area: null, bill: null, nation: null, worldFilter: "all", logFilter: "all", creator: null, draft: null, mode: "new", indSort: "share" };
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const md = s => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").split(/\n\n/).map(p => `<p>${p.replace(/\n/g, "<br>")}</p>`).join("");

function showScreen(id) { document.querySelectorAll(".screen").forEach(s => s.classList.toggle("active", s.id === id)); window.scrollTo(0, 0); }

// ── Generic components ──────────────────────────────────────────────

const hue = g => `hsl(${Math.round(clamp(g, 0, 1) * 120)}, 62%, 46%)`;

function meter(label, norm, good, disp, title = "") {
    const n = clamp(norm, 0, 1);
    const g = good ? n : 1 - n;
    return `<div class="meter" title="${esc(title)}"><div class="meter-top"><span>${label}</span><b>${disp}</b></div><div class="meter-bar"><i style="width:${Math.max(3, n * 100)}%;background:${hue(g)}"></i></div></div>`;
}

const log01 = (v, lo, hi) => clamp(Math.log10(Math.max(v, lo) / lo) / Math.log10(hi / lo), 0, 1);

const IND_DEFS = [
    { k: "ls", name: "Living standards", norm: v => v / 100, good: true, disp: v => `${Math.round(v)}`, tip: "Income, health, poverty and education combined." },
    { k: "gdp", name: "GDP", norm: v => log01(v, 0.02, 30000), good: true, disp: v => money(v), tip: "Total economic output in current dollars." },
    { k: "pc", name: "GDP per person", norm: v => log01(v, 30, 80000), good: true, disp: v => `$${Math.round(v).toLocaleString()}`, tip: "Average income." },
    { k: "health", name: "Health", norm: v => v / 100, good: true, disp: v => `${Math.round(v)} (≈${Math.round(30 + v * 0.5)} yrs)`, tip: "Health index and approximate life expectancy." },
    { k: "lit", name: "Education (literacy)", norm: v => v / 100, good: true, disp: v => `${Math.round(v)}%`, tip: "Share of adults who can read." },
    { k: "unemp", name: "Unemployment", norm: v => v / 20, good: false, disp: v => `${fmt(v, 1)}%`, tip: "Share of the workforce without work." },
    { k: "crime", name: "Crime", norm: v => v / 100, good: false, disp: v => `${Math.round(v)}`, tip: "Crime index." },
    { k: "poverty", name: "Poverty", norm: v => v / 100, good: false, disp: v => `${Math.round(v)}%`, tip: "Share living in poverty." },
    { k: "stability", name: "Stability", norm: v => v / 100, good: true, disp: v => `${Math.round(v)}`, tip: "Public order and political stability." },
    { k: "liberty", name: "Freedom", norm: v => v / 100, good: true, disp: v => `${Math.round(v)}`, tip: "Civil liberties and press freedom." },
    { k: "mil", name: "Military", norm: v => log01(v, 0.2, 200), good: true, disp: v => `${Math.round(v)}`, tip: "Military strength." }
];

function indicatorBars(p, keys) {
    return IND_DEFS.filter(d => !keys || keys.includes(d.k)).map(d => meter(d.name, d.norm(p[d.k]), d.good, d.disp(p[d.k]), d.tip)).join("");
}

// Income per person over time, after inflation, and what's eating the growth.
function incomeLine() {
    const pc = gdpPerCapita(), start = G.ref && G.ref.pc, e = G.econ;
    const popR = e.popR != null ? e.popR : 0, perHead = e.growth - popR;
    const since = start ? `$${Math.round(start).toLocaleString("en-US")} in 1950 → $${Math.round(pc * cpi()).toLocaleString("en-US")} now${cpi() > 1.05 ? ` ($${Math.round(pc).toLocaleString("en-US")} in 1950 prices)` : ""}: <b class="${pc >= start ? "good" : "bad"}">×${fmt(pc / start, pc / start < 10 ? 1 : 0)}</b> after inflation. ` : "";
    return `<p class="tiny">💵 <b>Income per person:</b> ${since}Each year now: economy ${fmt(e.growth, 1)}% − population ${fmt(popR, 1)}% = <b class="${perHead > 1 ? "good" : perHead < 0 ? "bad" : ""}">${perHead >= 0 ? "+" : ""}${fmt(perHead, 1)}%</b> a head.${popR > 2 && perHead < 2 ? " Fast population growth eats most of the gains; literacy, cities and family planning slow it." : ""}</p>`;
}

function liveProfile() {
    return { ls: livingStandards(), gdp: G.econ.gdp * cpi(), pc: gdpPerCapita() * cpi(), health: G.s.health, lit: G.dev.lit, unemp: G.econ.unemp, crime: G.s.crime, poverty: G.s.poverty, stability: G.s.stability, liberty: G.s.liberty, mil: G.mil.strength };
}

const panel = (title, body, cls = "") => `<section class="panel ${cls}">${title ? `<h3>${title}</h3>` : ""}${body}</section>`;
const stars = n => "★".repeat(n) + "☆".repeat(Math.max(0, 5 - n));
const govBadge = t => `<span class="badge gov-${t}">${GOV_TYPES[t].icon} ${GOV_TYPES[t].short}</span>`;
const sideDot = k => `<i class="dot" style="background:${SIDE_COLORS[blocSide(k)] || "#888"}"></i>`;

function relBadge(v) {
    const c = v >= 40 ? "good" : v >= 10 ? "ok" : v > -20 ? "neutral" : v > -50 ? "warn" : "bad";
    return `<span class="rel rel-${c}">${v > 0 ? "+" : ""}${Math.round(v)}</span>`;
}

function sparkline(key, color = "#6fb3ff") {
    const pts = G.hist.filter(h => h[key] != null).slice(-80).map(h => h[key]);
    if (pts.length < 2) return "";
    const lo = Math.min(...pts), hi = Math.max(...pts), rng = hi - lo || 1;
    const d = pts.map((v, i) => `${(i / (pts.length - 1) * 100).toFixed(1)},${(28 - (v - lo) / rng * 26).toFixed(1)}`).join(" ");
    return `<svg class="spark" viewBox="0 0 100 30" preserveAspectRatio="none"><polyline points="${d}" fill="none" stroke="${color}" stroke-width="1.6" vector-effect="non-scaling-stroke"/></svg>`;
}

// ── Boot & country selection ────────────────────────────────────────

const TIERS = [["major", "Major powers"], ["regional", "Regional heavyweights"], ["wildcard", "Wildcards"], ["new", "New additions"]];

function renderCountries() {
    $("#countryList").innerHTML = TIERS.map(([t, name]) => `
        <h2 class="tier">${name}</h2>
        <div class="country-grid">${Object.entries(COUNTRIES).filter(([, c]) => c.tier === t).map(([k, c]) => {
            const p = countryProfile(k);
            return `<button class="country-card" data-act="pickCountry" data-k="${k}">
                <div class="cc-head"><span class="flag">${c.flag}</span><div><b>${esc(c.name)}</b><small>${esc(c.leader.name)} · ${esc(c.leader.title)}</small></div></div>
                <div class="cc-badges">${govBadge(c.gov)}${c.status === "colony" ? `<span class="badge colony">⛓️ Independence path (${c.indepDate[0]})</span>` : ""}${c.status === "occupied" ? `<span class="badge occ">🪖 Under occupation</span>` : ""}</div>
                <div class="cc-meters">${indicatorBars(p, ["ls", "gdp", "pc", "health", "lit", "unemp", "crime", "poverty", "stability", "mil"])}</div>
            </button>`;
        }).join("")}</div>`).join("");
}

function renderDossier() {
    const k = ui.setupCk, c = COUNTRIES[k], g = GOV_TYPES[c.gov], p = countryProfile(k);
    const total = c.parties.reduce((s, x) => s + x.seats, 0);
    const parties = c.parties.map(pt => `
        <div class="party ${pt.gov ? "in-gov" : ""}">
            <div class="party-head"><b>${esc(pt.name)}</b> <span class="muted">${IDEOLOGIES[pt.ideo].icon} ${IDEOLOGIES[pt.ideo].name}</span> <span class="seats">${c.leg.system === "party" || c.leg.system === "court" ? Math.round(pt.seats / total * 100) + "% influence" : pt.seats + " seats"}</span>${pt.gov ? `<span class="badge small">In government</span>` : ""}</div>
            <p class="small">${esc(pt.desc)}</p>
            ${pt.fac ? `<ul class="small facs">${pt.fac.map(f => `<li><b>${esc(f.n)}</b> (${IDEOLOGIES[f.ideo].name}): ${esc(f.d)}</li>`).join("")}</ul>` : ""}
        </div>`).join("");
    const seatBar = `<div class="seatbar">${c.parties.map(pt => `<i style="width:${pt.seats / total * 100}%;background:${ideoColor(pt.ideo)}" title="${esc(pt.name)}: ${pt.seats}"></i>`).join("")}</div>`;
    const inds = Object.entries(c.econ.inds).sort((a, b) => b[1] - a[1]).map(([ik, v]) => meter(`${INDUSTRIES[ik].icon} ${INDUSTRIES[ik].name}`, v / 50, true, `${v}% of GDP`)).join("");
    $("#dossier").innerHTML = `
        <div class="setup-head">
            <div><div class="kicker">${c.flag} ${esc(c.area)} · ${esc(c.system)}</div><h1>${esc(c.name)}</h1><p class="muted">${esc(c.blurb)}</p></div>
            <div class="row"><button class="secondary" data-act="toCountries">← All countries</button><button class="primary big" data-act="toCreator">Choose ${esc(c.name)} →</button></div>
        </div>
        <div class="cols3">
            <div>
                ${panel("Key situation, 1950", indicatorBars(p) + `<p class="small muted">Green is good, red is bad. For crime, unemployment and poverty, a longer bar is worse.</p>`)}
                ${panel("Starting crises", `<ul>${c.drama.map(d => `<li>${esc(d)}</li>`).join("")}</ul>`)}
                ${panel("Strengths & weaknesses", `<h4>Strengths</h4><ul class="good-list">${c.strengths.map(s => `<li>${esc(s)}</li>`).join("")}</ul><h4>Weaknesses</h4><ul class="bad-list">${c.weaknesses.map(s => `<li>${esc(s)}</li>`).join("")}</ul>`)}
                ${panel("National goals", `<ul>${c.goals.map(gl => `<li><b>${esc(gl.n)}</b>: ${esc(gl.d)}</li>`).join("")}</ul>`)}
            </div>
            <div>
                ${panel(`How the government works`, `<p>${govBadge(c.gov)} <b>${esc(g.name)}</b></p><p class="small">${esc(g.desc)}</p><p><b>Who governs:</b> ${esc(c.hos)}</p><ul class="small">${c.how.map(h => `<li>${esc(h)}</li>`).join("")}</ul><h4>How you can lose power</h4><ul class="bad-list small">${g.fall.map(f => `<li>${esc(f)}</li>`).join("")}</ul>`)}
                ${panel(`${esc(c.leg.name)}: ${esc(c.leg.detail)}`, seatBar + parties)}
            </div>
            <div>
                ${panel("Regions", c.regions.map(r => `<div class="region"><b>${esc(r.n)}</b> <span class="muted small">${r.pop}% of people · ${r.t.join(", ")}</span><p class="small">${esc(r.d)}</p></div>`).join(""))}
                ${panel("Industries (share of GDP)", inds + `<p class="small muted">Everything else is services and trade. Development: ${c.dev.lit}% literacy, technology ${c.dev.tech}, ${c.dev.urban}% urban.</p>`)}
            </div>
        </div>`;
}

const IDEO_COLORS = { communist: "#c0392b", socialist: "#e74c3c", socdem: "#e67e22", liberal: "#f1c40f", conservative: "#3498db", nationalist: "#8e44ad", traditionalist: "#16a085", militarist: "#556b2f" };
const ideoColor = i => IDEO_COLORS[i] || "#888";

// ── Character creator ───────────────────────────────────────────────

function creatorDefaults(ck, historical) {
    const c = COUNTRIES[ck], h = HIST_CHAR[ck] || { bg: "senator", traits: ["pragmatist", "honest"], skills: { oratory: 2, legislation: 2, economics: 2, diplomacy: 2, military: 1, intrigue: 1 } };
    const party = c.parties.find(p => p.k === c.leader.party) || c.parties[0];
    return {
        ck, historical, name: historical ? c.leader.name : randomLeaderName(ck), age: historical ? c.leader.age : 50, gender: "m",
        party: party.k, ideology: party.fac ? (party.fac[0].ideo) : party.ideo, bg: h.bg, traits: h.traits.slice(), skills: Object.assign({}, h.skills),
        look: historical ? defaultLook(ck) : Object.assign(defaultLook(ck), { hairColor: 1, hair: 3, glasses: 0, facial: 0 })
    };
}
// Use the historical leader's personal ideology where it differs from the party's.
const HIST_IDEO = { usa: "liberal", china: "communist", russia: "communist", india: "socialist", uk: "socdem", france: "conservative", germany: "conservative", japan: "conservative", brazil: "conservative", canada: "liberal", australia: "conservative", southkorea: "nationalist", mexico: "nationalist", indonesia: "nationalist", turkey: "nationalist", saudi: "traditionalist", nigeria: "nationalist", southafrica: "nationalist", argentina: "nationalist", iran: "traditionalist", israel: "socdem", pakistan: "nationalist", philippines: "liberal", ethiopia: "traditionalist", venezuela: "conservative", norway: "socdem", switzerland: "liberal", fiji: "traditionalist", newzealand: "conservative", barbados: "socdem", singapore: "socdem", uae: "traditionalist", cambodia: "traditionalist", uruguay: "socdem" };

function openCreator(historical) {
    ui.creator = creatorDefaults(ui.setupCk, historical);
    if (historical) ui.creator.ideology = HIST_IDEO[ui.setupCk] || ui.creator.ideology;
    ui.mode = "new";
    renderCreator();
    showScreen("creator");
}

function showSuccessionCreator() {
    const plan = G.pendingSuccession;
    ui.setupCk = G.ck;
    const cr = creatorDefaults(G.ck, false);
    cr.age = rnd(45, 62) | 0;
    cr.bg = plan.bg || cr.bg;
    const party = G.parties.find(p => p.k === plan.party);
    cr.party = plan.party;
    cr.ideology = plan.ideology || (party ? party.ideo : G.leader.ideology);
    if (plan.gov === "military_junta") cr.look.attire = 2;
    if (plan.gov === "monarchy") { cr.look.attire = 3; cr.look.attireF = 7; cr.look.hairF = 10; }
    if (plan.heir) { cr.name = plan.heir.name; cr.age = clamp(plan.heir.age || cr.age, 18, 85); cr.gender = plan.heir.gender || "m"; }
    ui.creator = cr;
    ui.mode = "successor";
    renderCreator();
    showScreen("creator");
}

function skillTotal() { return Object.values(ui.creator.skills).reduce((a, b) => a + b, 0); }

function renderCreator() {
    const cr = ui.creator, ck = cr.ck || ui.setupCk, c = COUNTRIES[ck];
    const succ = ui.mode === "successor";
    const plan = succ ? G.pendingSuccession : null;
    const parties = succ ? G.parties : c.parties;
    const govType = succ ? plan.gov : c.gov;
    const isDemo = GOV_TYPES[govType].democracy || govType === "dominant_party";
    const partyBlock = (!succ && parties.length > 1) ? `
        <label>Your party</label>
        <div class="choice-list">${parties.map(p => `<button class="choice ${cr.party === p.k ? "on" : ""}" data-act="crParty" data-k="${p.k}"><b>${esc(p.name)}</b> <span class="muted small">${IDEOLOGIES[p.ideo].icon} ${IDEOLOGIES[p.ideo].name}${p.gov ? " · governing in 1950" : " · in opposition in 1950"}</span><p class="small">${esc(p.desc)}</p></button>`).join("")}</div>
        ${cr.party !== c.leader.party ? `<p class="small warn">Alternate history: your party starts in government instead of the ${esc((parties.find(p => p.k === c.leader.party) || {}).name)}, with its seats.</p>` : ""}` : "";
    const ideos = Object.entries(IDEOLOGIES).map(([k, i]) => `<button class="choice ${cr.ideology === k ? "on" : ""}" data-act="crIdeo" data-k="${k}"><b>${i.icon} ${i.name}</b><p class="small">${esc(i.desc)}</p></button>`).join("");
    const bgs = Object.entries(BACKGROUNDS).map(([k, b]) => `<button class="choice ${cr.bg === k ? "on" : ""}" data-act="crBg" data-k="${k}"><b>${b.icon} ${b.name}</b><p class="small">${esc(b.desc)}</p><p class="small"><span class="good">Allies:</span> ${esc(b.allies)}. <span class="bad">Enemies:</span> ${esc(b.enemies)}. Approval ${b.approval >= 0 ? "+" : ""}${b.approval}.</p></button>`).join("");
    const traits = Object.entries(TRAITS).map(([k, t]) => `<button class="chip-btn ${cr.traits.includes(k) ? "on" : ""}" data-act="crTrait" data-k="${k}" title="${esc(t.desc)}">${t.icon} ${t.name}</button>`).join("");
    const left = SKILL_POINTS - skillTotal();
    const skills = Object.entries(SKILLS).map(([k, s]) => `<div class="skill-row"><span title="${esc(s.desc)}">${s.icon} ${s.name}</span><div><button class="mini" data-act="crSkill" data-k="${k}" data-d="-1">−</button><b>${cr.skills[k] || 0}</b><button class="mini" data-act="crSkill" data-k="${k}" data-d="1" ${left <= 0 ? "disabled" : ""}>+</button></div></div>`).join("");
    const looks = LOOK_KEYS[cr.gender === "f" ? "f" : "m"].map(k => [k, LOOK_OPTIONS[k]]).map(([k, opts]) => `<div class="look-row"><span>${LOOK_LABELS[k]}</span><div><button class="mini" data-act="crLook" data-k="${k}" data-d="-1">‹</button><small>${k === "skin" || k === "hairColor" ? `<i class="swatch" style="background:${opts[cr.look[k] || 0]}"></i>` : esc(opts[cr.look[k] || 0])}</small><button class="mini" data-act="crLook" data-k="${k}" data-d="1">›</button></div></div>`).join("");
    $("#creatorBody").innerHTML = `
        <div class="setup-head">
            <div><div class="kicker">${c.flag} ${esc(c.name)} · ${succ ? "A new leader" : "Step 2 of 3: who you are"}</div><h1>${succ ? esc(plan.note || "Succession") : "Build your leader"}</h1>
            <p class="muted">${succ ? `${GOV_TYPES[govType].name}. You will take office as ${esc(plan.title)}.` : "You always start as head of government. Your backstory sets who already trusts you, who already hates you, and your opening approval."}</p></div>
            <div class="row">${succ ? "" : `<button class="secondary" data-act="toDossier">← Back</button>`}${!succ ? `<button class="secondary" data-act="crHistorical">${cr.historical ? "✓ " : ""}Play ${esc(c.leader.name)}</button><button class="secondary" data-act="crCustom">${!cr.historical ? "✓ " : ""}Custom leader</button>` : ""}</div>
        </div>
        <div class="creator">
            <div class="panel creator-left">
                <div class="portrait-wrap">${portraitSVG(cr.look, cr.gender, 160)}</div>
                <label>Name</label><div class="row nowrap"><input id="crName" type="text" value="${esc(cr.name)}" maxlength="40"><button class="mini" data-act="crRandName">🎲</button></div>
                <div class="row"><div><label>Age</label><input id="crAge" type="number" min="25" max="85" value="${cr.age}"></div><div><label>Gender</label><select id="crGender"><option value="m" ${cr.gender === "m" ? "selected" : ""}>Man</option><option value="f" ${cr.gender === "f" ? "selected" : ""}>Woman</option></select></div></div>
                <h4>Appearance</h4>${looks}
                <h4>Skills <span class="muted small">(${left} points left)</span></h4>${skills}
                <h4>Traits <span class="muted small">(pick 2)</span></h4><div class="chips">${traits}</div>
                <button class="primary big wide" data-act="crBegin" ${cr.traits.length !== 2 ? "disabled" : ""}>${succ ? "Take office →" : "Next: form your cabinet →"}</button>
            </div>
            <div class="panel creator-right">
                ${partyBlock}
                <label>Political ideology ${isDemo ? "" : "<span class='muted small'>(your personal line within the regime)</span>"}</label>
                <div class="choice-list two">${ideos}</div>
                <label>Backstory</label>
                <div class="choice-list two">${bgs}</div>
            </div>
        </div>`;
}

function readCreatorInputs() {
    const cr = ui.creator;
    const n = $("#crName"); if (n) cr.name = n.value.trim() || cr.name;
    const a = $("#crAge"); if (a) cr.age = clamp(parseInt(a.value) || cr.age, 25, 85);
    const g = $("#crGender"); if (g) cr.gender = g.value;
}

// ── Cabinet setup ───────────────────────────────────────────────────

function renderCabinetSetup() {
    const d = ui.draft;
    const total = MINISTRIES.reduce((s, m) => { const c = d[m.k].cands[d[m.k].pick]; return s + 0.3 + c.comp * 0.3; }, 0);
    const facsUsed = new Set(MINISTRIES.map(m => d[m.k].cands[d[m.k].pick].fac));
    const left = cabinetFactions().filter(f => !facsUsed.has(f.k));
    $("#cabinetBody").innerHTML = `
        <div class="setup-head">
            <div><div class="kicker">${C().flag} ${esc(C().name)} · Step 3 of 3: your government</div><h1>Form your cabinet</h1>
            <p class="muted">Each minister generates political capital, the currency you spend to change policy, pass laws and act. Competent ministers (★) generate more and run their departments better. Appointing from a faction wins its loyalty; factions left out resent it.</p></div>
            <div class="row"><div class="capital-preview">+${fmt(total, 1)} capital / month from the cabinet</div><button class="primary big" data-act="cabBegin">Begin, ${dateStr()} →</button></div>
        </div>
        ${left.length ? `<p class="warn small">Factions without a minister (will resent it): ${left.map(f => esc(f.name)).join(", ")}.</p>` : ""}
        <div class="cabinet-grid">${MINISTRIES.map(m => `
            <section class="panel"><h3>${m.icon} ${esc(ministerTitle(m.k))}</h3><p class="small muted">${m.effect}</p>
            ${d[m.k].cands.map((c, i) => `<button class="choice ${d[m.k].pick === i ? "on" : ""}" data-act="cabPick" data-k="${m.k}" data-i="${i}">
                <b>${esc(c.name)}</b> <span class="stars">${stars(c.comp)}</span>${c.hist ? ` <span class="badge small">Historical</span>` : ""}
                <p class="small">${esc(c.flavor)} · <span style="color:${ideoColor(c.ideo)}">${esc(c.facName)}</span> · loyalty ${c.loyalty}</p></button>`).join("")}
            </section>`).join("")}
        </div>`;
}

// ── Play: HUD and dock ──────────────────────────────────────────────

function viewsFor() {
    const v = [["office", "🏛️", "Office"]];
    if (G.gov.type === "colony") v.push(["movement", "✊", "Movement"]);
    v.push([ "legislature", "📜", hasLegislature() ? "Legislature" : "Decrees"], ["lawbook", "📚", "Lawbook"], ["budget", "💰", "Budget"], ["finance", "💵", "Finance"], ["mega", "🏗️", "Megaprojects"], ["economy", "🏭", "Economy"], ["population", "👥", "Population"], ["power", "⚖️", "Power"], ["world", "🌍", "World"], ["institutions", "🌐", "Institutions"], ["military", "🎖️", "Military"], ["record", "📖", "Record"]);
    return v;
}

function closeScene() { const el = $("#scene"); if (el) { el.innerHTML = ""; el.classList.remove("open"); } }

function render() {
    if (!G) return;
    if (G.over && !G.pendingSuccession) { closeScene(); renderFall(); showScreen("fall"); return; }
    if (G.pendingSuccession) { closeScene(); return; }
    if (!$("#play").classList.contains("active")) showScreen("play");
    renderHud(); renderDock(); renderView(); renderScene();
}

function renderHud() {
    const c = C(), a = approval();
    const minutes = clamp(Math.round((100 - G.tension) / 6), 1, 17);
    const debtPct = G.econ.debt / G.econ.gdp * 100;
    const stat = (label, v, cls, tip) => `<div class="hstat ${cls || ""}" title="${esc(tip || "")}"><small>${label}</small><b>${v}</b></div>`;
    const lvl = (v, good, bad) => v >= good ? "good" : v <= bad ? "bad" : "";
    $("#hud").innerHTML = `
        <div class="hud-left">
            <div class="hud-portrait">${portraitSVG(G.leader.look, G.leader.gender, 46)}</div>
            <div><div class="hud-country">${ME().flag || c.flag} ${esc(ME().name)}</div><div class="hud-leader">${esc(G.leader.title)} ${esc(G.leader.name)} · ${govBadge(G.gov.type)}</div></div>
        </div>
        <div class="hud-stats">
            ${stat("Date", dateStr(), "date")}
            ${stat("Approval", Math.round(a) + "%", lvl(a, 55, 35))}
            ${stat("Stability", Math.round(G.s.stability), lvl(G.s.stability, 60, 35))}
            ${stat("Growth", fmt(G.econ.growth, 1) + "%", lvl(G.econ.growth, 4, 0.5))}
            ${stat("Inflation", fmt(G.econ.inflation, 1) + "%", G.econ.inflation > 8 ? "bad" : G.econ.inflation < 4 ? "good" : "")}
            ${stat("Jobless", fmt(G.econ.unemp, 1) + "%", G.econ.unemp > 9 ? "bad" : G.econ.unemp < 5 ? "good" : "")}
            <div class="hstat link ${debtPct > 90 ? "bad" : debtPct < 40 ? "good" : ""}" data-act="view" data-v="finance" title="Public debt: ${nominal(G.econ.debt)}. Click for the Finance tab."><small>Debt</small><b>${Math.round(debtPct)}% · ${nominal(G.econ.debt)}</b></div>
            ${(() => { const me = myStanding(); return me ? stat("World rank", `#${me.rank}`, me.rank <= 5 ? "good" : "", `${me.tier[1]} · power score ${Math.round(me.score)} (World tab)`) : ""; })()}
            ${stat("Capital", Math.floor(G.capital), "capital", `Political capital. +${fmt(capitalIncome(), 1)}/month.`)}
            <div class="hstat link good" data-act="view" data-v="finance" title="Cash the government holds: aid, savings and unspent capital money. Click for the Finance tab."><small>Treasury</small><b>${moneyFine(cashNow() * cpi())}</b></div>
            ${stat("Party $", "$" + Math.round(G.funds) + "M", "", "Your party's campaign funds (for ads and elections), not government money")}
            ${stat("☢️ Clock", minutes + " min", minutes <= 3 ? "bad" : minutes >= 9 ? "good" : "", "Minutes to midnight: world nuclear tension")}
        </div>
        <div class="hud-right">
            <button class="primary" data-act="next" data-n="1">Next week ▶</button>
            <button class="secondary" data-act="next" data-n="4" title="Advance up to 4 weeks (stops for decisions)">+1 mo</button>
            <button class="secondary" data-act="next" data-n="13" title="Advance up to 13 weeks (stops for decisions)">+3 mo</button>
        </div>`;
}

function renderDock() {
    $("#dock").innerHTML = viewsFor().map(([k, i, n]) => `<button class="${view === k ? "on" : ""}" data-act="view" data-v="${k}">${i} ${n}</button>`).join("");
}

function renderView() {
    const fn = { office: viewOffice, movement: viewMovement, legislature: viewLegislature, lawbook: viewLawbook, budget: viewBudget, finance: viewFinance, mega: viewMega, population: viewPopulation, economy: viewEconomy, power: viewPower, world: viewWorld, institutions: viewInstitutions, military: viewMilitary, record: viewRecord }[view] || viewOffice;
    $("#view").innerHTML = fn();
}

// ── Office ──────────────────────────────────────────────────────────

function advisories() {
    const out = [];
    const a = approval();
    if (G.plot && G.plot.found) out.push("🕵️ Your security services are tracking a plot against your life. See How you could fall on the Office tab.");
    else if (assassinationYear() > 0.12) out.push(`🕵️ Unrest makes you a target: about ${Math.round(assassinationYear() * 100)}% chance of a plot this year. Stability and a loyal security service help.`);
    const b = G.budget;
    if (b && ["drafting", "rejected"].includes(b.status)) out.push(b.status === "rejected" ? `💰 The ${G.leg.name} rejected your budget. Revise and resubmit before 1 January (Budget tab).` : `💰 Budget season: the FY${b.fy} draft is waiting on the Budget tab${hasLegislature() ? ". It must pass by 31 December" : ""}.`);
    if (b && b.status === "cr") out.push("⏸️ You are governing on a continuing resolution: no capital money this year.");
    (G.bills || []).filter(x => x.sponsor === "player" && x.stage === "stuck").slice(0, 2).forEach(x => out.push(`🗄️ The ${x.title} is stuck in committee. Lobby, discharge or withdraw it (Legislature tab).`));
    const desk = (G.bills || []).find(x => x.stage === "desk");
    if (desk) out.push(`🖋️ The ${desk.title} is on your desk awaiting signature.`);
    if (G.cip && G.cip.queue.length && !G.cip.active.length && G.cip.pool < G.cip.queue[0].cost) out.push("🏗️ Your capital program has projects waiting for money. Raise the capital budget next budget season.");
    if (G.inst && G.inst.program) { const pr = G.inst.program, miss = pr.conds.filter(c => !IMF_CHECK[c.k](c)).length, due = Math.round((pr.start + pr.reviews[pr.next] - G.t) / 4.3); if (miss) out.push(`💵 IMF review in ${Math.max(0, due)} months: ${miss} condition${miss > 1 ? "s" : ""} not yet met (Institutions tab).`); }
    else if (G.inst && G.inst.m.imf && imfCrisis()) out.push(`💵 ${imfCrisis()}. You could ask the IMF for a program (Institutions tab).`);
    if (G.inst && G.inst.sanctions) out.push(`🚫 ${G.inst.sanctions.why}.`);
    if (G.cip && !G.cip.queue.length && !G.cip.active.length && G.cip.pool > 0) out.push("🏗️ Capital money is sitting unused. Add projects to the CIP (Budget tab).");
    if (G.capital >= capitalCap() - 2) out.push("💡 Your political capital is maxed out. Spend it on policy, projects or diplomacy.");
    if (a < 40) out.push("⚠️ Your approval is low. Consider a popular policy, a speech, or fixing the economy.");
    if (G.econ.inflation > 8) out.push("📈 Inflation is high. Deficits and overheating growth drive it.");
    if (G.econ.deficit > 4) out.push(`💸 You are running a deficit of ${fmt(G.econ.deficit, 1)}% of GDP.`);
    if (G.s.crime > 50) out.push("🚔 Crime is high. Unemployment, poverty and policing all matter.");
    if (coupRisk() > 25) out.push("🎖️ The army is restless. Watch the coup risk.");
    if (campaignSeason()) out.push("🗳️ Campaign season! Hold rallies and run ads on the Power tab.");
    if (G.cabinet && MINISTRIES.some(m => !G.cabinet[m.k])) out.push("👔 A cabinet post is vacant. Appoint a minister on the Power tab.");
    Object.entries(G.pillars).forEach(([k, p]) => { if (p.l < 25) out.push(`⚠️ ${pillarName(k)} are turning against you (${Math.round(p.l)}).`); });
    const idle = Object.keys(INDUSTRIES).filter(k => indAvailable(k) && G.ind[k].out < G.econ.gdp * 0.001 && indGap(k) < 2);
    if (idle.length) out.push(`🏭 You could start a ${INDUSTRIES[idle[0]].name.toLowerCase()} industry (Economy tab).`);
    return out.slice(0, 6);
}

function threatPanel() {
    return govThreats().map(t => meter(t.name, t.level / 100, false, `${t.level}%`, t.desc) + `<p class="tiny muted">${esc(t.desc)}</p>`).join("");
}

function viewOffice() {
    const L = G.leader, bg = BACKGROUNDS[L.bg];
    const goals = (C().goals || []).map((g, i) => `<li class="${G.goalsDone[i] != null ? "done" : ""}">${G.goalsDone[i] != null ? "✅" : "⬜"} <b>${esc(g.n)}</b>: ${esc(g.d)}</li>`).join("");
    const nv = nextVote();
    return `<div class="cols3">
        <div>
            ${panel("Your leader", `<div class="leader-card">${portraitSVG(L.look, L.gender, 96)}<div><b>${esc(L.name)}</b><br><span class="muted">${esc(L.title)}, age ${L.age}</span><br>${bg ? `${bg.icon} ${bg.name}` : ""}<br><span class="small">${L.traits.map(t => TRAITS[t] ? TRAITS[t].icon + " " + TRAITS[t].name : t).join(" · ")}</span><br><span class="small">${IDEOLOGIES[L.ideology] ? IDEOLOGIES[L.ideology].icon + " " + IDEOLOGIES[L.ideology].name : ""}</span></div></div>
                ${meter("Health", L.health / 100, true, Math.round(L.health))}

                <p class="small">In office ${Math.floor((G.t - L.since) / 52)} yrs ${Math.floor(((G.t - L.since) % 52) / 4.3)} mo.${nv ? ` Next vote: ${nv.kind} in ${nv.weeks} weeks.` : ""}</p>`)}
            ${familyPanel()}
            ${panel("How you could fall", `<p class="small muted">${GOV_TYPES[G.gov.type].name}: ${GOV_TYPES[G.gov.type].fall.join(" · ")}</p>` + threatPanel())}
        </div>
        <div>
            ${panel("Key indicators", indicatorBars(liveProfile()) + incomeLine() + (() => { const me = myStanding(); return me ? `<p class="small">🌐 World standing: <b>#${me.rank}</b> · ${me.tier[2]} ${me.tier[1]} <span class="tiny muted">(power score ${Math.round(me.score)}; details on the World tab)</span></p>` : ""; })())}
            ${panel("What's moving the country", viewDrivers())}
            ${panel("Trends (last 6 years)", `<div class="spark-row"><span>Approval</span>${sparkline("a", "#7bd88f")}</div><div class="spark-row"><span>Growth</span>${sparkline("g", "#6fb3ff")}</div><div class="spark-row"><span>Stability</span>${sparkline("s", "#f0c05a")}</div><div class="spark-row"><span>GDP</span>${sparkline("gdp", "#c39bff")}</div>`)}
        </div>
        <div>
            ${panel("Advisers say", advisories().map(t => `<p class="advice">${esc(t)}</p>`).join("") || "<p class='muted'>All quiet.</p>")}
            ${panel("National goals", `<ul class="goals">${goals}</ul>`)}
            ${panel("Latest cables", G.log.slice(0, 10).map(l => `<p class="cable ${l.type}"><small>${dateStr(l.t)}</small> ${esc(l.text)}</p>`).join(""))}
        </div>
    </div>`;
}

// ── Movement (colony) ───────────────────────────────────────────────

function viewMovement() {
    const c = G.colony;
    if (!c) return panel("", "<p>You are independent.</p>");
    return `<div class="cols2">
        <div>
            ${panel("The road to independence", `
                <div class="stages">${COLONY_STAGES.map((s, i) => `<span class="${c.stage >= i ? "on" : ""}">${s}</span>`).join("")}<span class="${c.progress >= 100 ? "on" : ""}">Independence</span></div>
                ${meter("Independence progress", c.progress / 100, true, Math.round(c.progress) + "%")}
                ${meter("Movement strength", c.support / 100, true, Math.round(c.support))}
                ${meter("Regional & communal unity", c.unity / 100, true, Math.round(c.unity))}
                ${meter("Militancy", c.militancy / 100, false, Math.round(c.militancy), "High militancy speeds progress but brings arrests")}
                ${meter(`${pillarName("colonial")} goodwill`, G.pillars.colonial.l / 100, true, Math.round(G.pillars.colonial.l))}
                <p class="small">The colonial power's willingness to let go: <b>${Math.round(colonyWillingness() * 100)}%</b>. It grows with time, especially after 1957.</p>
                ${c.detained ? `<p class="warn">You are in detention for ${c.detained} more weeks.</p>` : ""}`)}
        </div>
        <div>${panel("Movement actions", COLONY_ACTIONS.map(a => `<div class="action"><div><b>${a.icon} ${a.name}</b><p class="small">${esc(a.desc)}</p></div><button data-act="colony" data-k="${a.k}" ${G.capital < a.cost || c.detained || (a.req && !a.req()) ? "disabled" : ""}>${a.cost} ⚡${a.funds ? ` $${a.funds}M` : ""}</button></div>`).join(""))}</div>
    </div>`;
}

// ── Policy & bills ──────────────────────────────────────────────────

function optEffects(o) {
    const bits = [];
    const fx = o.fx || {};
    const names = { growth: "growth", inflation: "inflation", unemp: "unemployment", stability: "stability", liberty: "liberty", corruption: "corruption", prestige: "prestige", legitimacy: "legitimacy" };
    Object.entries(fx).forEach(([k, v]) => { const bad = ["inflation", "unemp", "corruption"].includes(k); bits.push(`<span class="${(v > 0) !== bad ? "good" : "bad"}">${names[k] || k} ${v > 0 ? "+" : ""}${v}</span>`); });
    if (o.spend) bits.push(`<span class="muted">spend ${o.spend}% GDP</span>`);
    if (o.rev) bits.push(`<span class="muted">revenue ${o.rev}% GDP</span>`);
    const ps = Object.entries(o.p || {}).filter(([k]) => G.pillars[k]).map(([k, v]) => `<span class="${v > 0 ? "good" : "bad"}">${pillarName(k)} ${v > 0 ? "▲" : "▼"}</span>`);
    return bits.concat(ps).join(" · ");
}

// ── Economy ─────────────────────────────────────────────────────────

// Change in a development stat over the last 12 months (snapshots every 4 weeks).
function devTrend(i) {
    const h = G.hist.filter(x => x.dv);
    if (h.length < 2) return "";
    const past = h.find(x => x.t >= G.t - 52) || h[0], now = [G.dev.ind, G.dev.tech, G.dev.lit, G.dev.uni, G.dev.urban][i];
    const dlt = now - past.dv[i];
    if (Math.abs(dlt) < 0.01) return "";
    return ` <span class="tiny ${dlt > 0 ? "good" : "bad"}">${dlt > 0 ? "▲" : "▼"}${fmt(Math.abs(dlt), Math.abs(dlt) < 1 ? 2 : 1)}</span>`;
}

// What your companies add up to, so their weight in the economy is visible.
function devCompanies() {
    const fs = (G.firms || []).filter(f => !f.closed);
    if (!fs.length) return "";
    const out = fs.reduce((s, f) => s + f.out, 0), jobs = fs.reduce((s, f) => s + f.jobs, 0);
    return `<p class="tiny">🏢 <b>${fs.length} compan${fs.length > 1 ? "ies" : "y"}</b> produce ${nominal(out)} a year (${fmt(out / G.econ.gdp * 100, 1)}% of GDP) and employ ${fmtJobs(jobs)} (${fmt(jobs / Math.max(1, laborForce() * 1000) * 100, 1)}% of the workforce).</p>`;
}

function viewEconomy() {
    const d = G.dev, e = G.econ;
    const rows = Object.keys(INDUSTRIES).map(k => {
        const I = INDUSTRIES[k], i = G.ind[k], avail = indAvailable(k);
        const share = avail ? indShare(k) : 0, gap = indGap(k);
        const status = !avail ? (I.from && G.year < I.from ? `Unlocks ${I.from}` : `Needs ${I.res === "coast" ? "a coastline" : I.res}`) : gap > 3 ? `Held back: needs tech ${I.tech}, literacy ${I.lit}%, university ${I.uni}%` : "";
        return { k, I, i, avail, share, status, rate: i.rate || 0 };
    }).sort((a, b) => (b.avail - a.avail) || (b.share - a.share));
    const table = rows.map(r => {
        const met = r.avail ? sectorConditions(r.k).filter(c => c.met).length + "/" + sectorConditions(r.k).length : "";
        return `<tr class="${r.avail ? "" : "dim"} ${ui.ind === r.k ? "sel" : ""}">
        <td><button class="link-btn" data-act="indSel" data-k="${r.k}">${r.I.icon} ${r.I.name}</button>${r.status ? `<div class="tiny warn">${esc(r.status)}</div>` : ""}</td>
        <td class="stars">${r.avail ? "★".repeat(Math.floor(sectorFit(r.k))) : ""}</td>
        <td>${r.avail ? nominal(indValue(r.k)) : "–"}</td><td>${r.avail ? fmt(r.share, 1) + "%" : "–"}</td>
        <td class="${r.rate > 4 ? "good" : r.rate < 0 ? "bad" : ""}">${r.avail ? fmt(r.rate, 1) + "%" : "–"}</td>
        <td class="tiny">${met}</td>
        <td>${r.avail ? `<select id="sup_${r.k}" data-change="support" data-k="${r.k}">${SUPPORT_LEVELS.map((s, i) => `<option value="${i}" ${r.i.sup === i ? "selected" : ""}>${s.name}</option>`).join("")}</select>` : ""}</td>
        <td>${r.avail ? `<select id="own_${r.k}" data-change="own" data-k="${r.k}">${Object.entries(OWNERSHIP).map(([ok, o]) => `<option value="${ok}" ${r.i.own === ok ? "selected" : ""}>${o.name}</option>`).join("")}</select>` : ""}</td></tr>`;
    }).join("");
    const projForm = ui.projInd ? `<div class="proj-form"><b>${INDUSTRIES[ui.projInd].project}</b> · ${nominal(projectCostBn("ind:" + ui.projInd))} from the capital budget · 2 ⚡ · choose a region:
        <div class="row">${G.regions.map((r, i) => `<button class="mini" data-act="project" data-k="${ui.projInd}" data-i="${i}">${esc(r.n)}</button>`).join("")}<button class="mini secondary" data-act="projectCancel">Cancel</button></div></div>` : "";
    const tb = taxBase(), gdpN = G.econ.gdp * cpi();
    const taxRow = (n, pc, tip) => pc > 0.005 ? `<tr title="${esc(tip || "")}"><td>${n}</td><td>${fmt(pc, 1)}%</td><td>${money(gdpN * pc / 100)}</td></tr>` : "";
    const jobsPanel = panel("Jobs, taxes & living standards", `
        ${meter("Living standards", livingStandards() / 100, true, Math.round(livingStandards()))}
        <div class="budget"><div><small>Workforce</small><b>${fmt(laborForce(), laborForce() < 10 ? 2 : 0)}M</b></div><div><small>Formal jobs</small><b>${Math.round(formalShare() * 100)}%</b></div><div><small>Unemployment</small><b>${fmt(e.unemp, 1)}%</b></div><div><small>Jobs you created</small><b>${fmtJobs(e.jobsCreated || 0)}</b></div></div>
        <h4>Where the money comes from (per year)</h4>
        <table class="taxes"><tr><th>Source</th><th>% of GDP</th><th>Amount</th></tr>
        ${taxRow("Income tax", tb.income, "Grows with formal (urban, industrial) jobs")}
        ${taxRow("Social insurance contributions", tb.payroll, "Paid on formal wages")}
        ${taxRow("Corporate taxes", tb.corp, "Grows with private and foreign companies")}
        ${(() => { const ft = firmTaxes(); return ft.n ? `<tr class="sub"><td colspan="3" class="tiny">↳ The ${ft.n} compan${ft.n > 1 ? "ies" : "y"} you brought in (${fmtJobs(ft.jobs)} jobs) pay <b class="good">${moneyFine(ft.corp)}</b> corporate tax${ft.corpLater > 0 ? ` (+${moneyFine(ft.corpLater)} when tax holidays end)` : ""}; their workers pay <b class="good">${moneyFine(ft.workers)}</b> in income tax and contributions a year.</td></tr>` : ""; })()}
        ${taxRow("Sales tax", tb.sales)}
        ${Object.values(LAWS).filter(l => l.tax && TAX_EXTRA[l.tax]).map(l => taxRow(l.name, tb[l.tax])).join("")}
        ${taxRow("Land & property tax", tb.land)}
        ${taxRow("Wealth tax", tb.wealth)}
        ${taxRow("State enterprise profits", tb.stateRev)}
        ${taxRow("Oil & mining royalties", tb.resources)}
        ${taxRow("Tariffs & customs", tb.tariffs)}
        ${taxRow("Program taxes, fees & aid", programRevenue())}
        ${tb.holidayLoss > 0.01 ? `<tr class="bad"><td>Lost to tax holidays</td><td>−${fmt(tb.holidayLoss, 1)}%</td><td>−${money(gdpN * tb.holidayLoss / 100)}</td></tr>` : ""}
        <tr><td><b>Total revenue</b></td><td><b>${fmt(e.rev, 1)}%</b></td><td><b>${money(gdpN * e.rev / 100)}</b></td></tr></table>
        ${meter("State capacity (ability to collect taxes)", e.taxCap, true, Math.round(e.taxCap * 100) + "%", "How much of what's owed the state actually collects, and how well its programs are delivered")}
        <p class="tiny">${(() => { const t = capacityTarget(), soc = capacityFromSociety(), inst = capacityFromInstitutions(); return `Heading ${t > e.taxCap + 0.005 ? "up" : t < e.taxCap - 0.005 ? "down" : ""} to <b>${Math.round(t * 100)}%</b>: literacy & cities give ${Math.round(Math.min(1, soc) * 100)}%, institutions ${inst > 0 ? `<b class="good">+${Math.round(inst * 100)}%</b>` : "+0%"}. Your programs run at <b>${Math.round(delivery() * 100)}%</b> strength: a more capable state delivers more of what its laws promise. ${inst < 0.2 && e.taxCap < 0.9 ? "Build more: a revenue authority, merit civil service, census, land registry and ID cards (Lawbook → 🏛️ State & administration)." : ""}`; })()} <button class="mini" data-act="lawCat" data-k="state">🏛️ State institutions</button></p>
        <p class="tiny muted">Tax rates are set in the annual budget. The chain: companies and projects create jobs, formal jobs and profits widen the tax base, revenue pays for schools and clinics, and health, education and living standards rise.</p>`);
    const pros = refreshProspects();
    const prospects = pros.map((p, i) => {
        const t = offerTerms(p), odds = prospectOdds(p) + (p.ceo ? p.ceo.bonus : 0);
        const incs = Object.entries(INCENTIVES).map(([k, inc]) => `<div class="inc-row"><span>${inc.name}</span><select id="inc_${i}_${k}" data-change="inc" data-i="${i}" data-k="${k}">${inc.opts.map((o, j) => `<option value="${j}" ${p.inc[k] === j ? "selected" : ""}>${o}</option>`).join("")}</select></div>`).join("");
        return `<div class="prospect"><div class="row"><b>${p.home ? flagOf(p.home) : "🏳️"} ${esc(p.name)}</b> <span class="badge small">${INDUSTRIES[p.sector].icon} ${INDUSTRIES[p.sector].name}</span></div>
            <p class="tiny">${p.known ? `They care most about <b>${PRIORITIES[p.prio]}</b>.` : "Their priorities are unknown. Meet the CEO at headquarters to find out."}${p.ceo && p.ceo.round ? ` CEO meeting: ${p.ceo.bonus > 0.1 ? "went very well" : p.ceo.bonus > 0 ? "went well" : "went badly"}.` : ""}</p>
            ${incs}
            <div class="budget"><div><small>Jobs</small><b>${fmtJobs(t.jobs)}</b></div><div><small>Output</small><b>${nominal(t.out)}/yr</b></div><div><small>Your cost</small><b>${money(t.cost * cpi())}</b></div><div><small>Corporate tax/yr</small><b>${moneyFine(t.annualTax * cpi())}</b>${t.holidayYrs ? `<span class="tiny muted">after a ${t.holidayYrs}-yr holiday</span>` : ""}</div><div><small>Workers' taxes/yr</small><b class="good">${moneyFine(firmTaxes([{ out: t.out, jobs: t.jobs }]).workers)}</b><span class="tiny muted">from day one</span></div></div>
            <p class="small">Chance they say yes: <b class="${odds > 0.6 ? "good" : odds < 0.35 ? "bad" : "warn"}">${Math.round(clamp(odds, 0.02, 0.97) * 100)}%</b>${t.cost > 0 ? ` · pays back in ~${Math.round(t.payback)} yrs` : ""}</p>
            <div class="row">${p.ceo && p.ceo.round ? "" : `<button class="mini" data-act="ceoTalk" data-i="${i}" ${G.capital < 4 ? "disabled" : ""}>✈️ Meet the CEO (4 ⚡)</button>`}<button class="mini primary" data-act="offer" data-i="${i}" ${G.capital < 5 ? "disabled" : ""}>Make the offer (5 ⚡)</button></div></div>`;
    }).join("") || "<p class='muted small'>No companies are looking at your country right now. Improve stability, education, infrastructure and openness.</p>";
    const deskPanel = panel("Investment desk", `<p class="small muted">Court foreign companies. New prospects arrive every six months. To grow your own firms, open an industry from the table.</p>${prospects}`);
    const firms = (G.firms || []).slice().reverse().map(f => `<tr class="${f.closed ? "dim" : ""}"><td>${f.home && f.home !== G.ck ? flagOf(f.home) : f.foreign ? "🌐" : "🏠"} ${esc(f.name)}</td><td>${INDUSTRIES[f.sector].icon}</td><td>${esc(G.regions[f.region] ? G.regions[f.region].n : "")}</td><td>${fmtJobs(f.jobs)}</td><td>${f.closed ? "closed" : (() => { const ft = firmTaxes([f]); return `${f.holidayUntil > G.year ? `<span class="warn">holiday to ${f.holidayUntil}</span> (then ${moneyFine(ft.corpLater)})` : `<span class="good">${moneyFine(ft.corp)}</span>`} corp. · workers <span class="good">${moneyFine(ft.workers)}</span>`; })()}</td></tr>`).join("");
    const right = ui.ind ? industryPanel(ui.ind) : panel("Development", `
                ${devCompanies()}
                ${meter(`Industrialization: ${devStage()}`, d.ind / 100, true, fmt(d.ind, d.ind < 10 ? 1 : 0) + devTrend(0), "Heavy industry and manufacturing as a share of the economy, held back while most people farm. Grows as industries and companies grow.")}
                ${meter("Technology", clamp(d.tech / 150), true, fmt(d.tech, d.tech < 10 ? 1 : 0) + devTrend(1), `Unlocks advanced industries. Rises with universities, telecoms, research laws and openness; each foreign company speeds up catching up${firmTech() ? ` (yours add ${Math.round(firmTech() * 100)}%)` : ""}.`)}
                ${meter("Literacy", d.lit / 100, true, fmt(d.lit, d.lit < 10 ? 1 : 0) + "%" + devTrend(2), "Rises with schools (CIP) and education laws.")}
                ${meter("University-educated", clamp(d.uni / 30), true, fmt(d.uni, d.uni < 1 ? 2 : 1) + "%" + devTrend(3), "Rises with universities (CIP) and higher-education laws.")}
                ${meter("Urbanization", d.urban / 100, true, fmt(d.urban, d.urban < 10 ? 1 : 0) + "%" + devTrend(4), "People move to cities as industry, services and formal jobs grow.")}
                <p class="tiny muted">▲ = change over the last 12 months. These move a little every week; decades of steady growth build an industrial nation.</p>
                <p class="small muted">Open any industry for its natural fit, the conditions it needs to flourish, public investments you can build and homegrown firms you can back.</p>`);
    return `<div class="cols2 wide-left">
        <div>${panel("Industries", `<p class="small muted">Click an industry to develop it. ★ = natural fit. Conditions = how many of its needs you meet. Subsidies cost % of GDP each year.</p>${projForm}<div class="table-wrap"><table class="ind-table"><tr><th>Sector</th><th>Fit</th><th>Output</th><th>Share</th><th>Growth</th><th>Needs</th><th>Support</th><th>Ownership</th></tr>${table}</table></div>`)}
            ${deskPanel}${firms ? panel("Companies", `<div class="table-wrap"><table><tr><th>Company</th><th></th><th>Region</th><th>Jobs</th><th>Taxes a year</th></tr>${firms}</table></div>`) : ""}</div>
        <div>${right}${jobsPanel}${tradePanel()}
            ${panel("Economy", `<div class="budget"><div><small>GDP (nominal)</small><b>${nominal(e.gdp)}</b></div><div><small>Per person</small><b>$${Math.round(gdpPerCapita() * cpi()).toLocaleString()}</b></div><div><small>Population</small><b>${fmt(e.pop, e.pop < 10 ? 2 : 0)}M</b></div><div><small>Oil price</small><b>$${fmt(1.7 * G.oilPrice * (1 + Math.max(0, G.year - 1950) * 0.035), 1)}/bbl</b></div></div>`)}
        </div>
    </div>`;
}

// ── Power ───────────────────────────────────────────────────────────

function viewPower() {
    const pillars = Object.entries(G.pillars).map(([k, p]) => {
        const t = pillarTarget(k), arrow = t > p.l + 2 ? "▲" : t < p.l - 2 ? "▼" : "▬";
        return `<div class="pillar"><div class="meter-top"><span>${PILLARS[k].icon} ${esc(pillarName(k))} <span class="tiny muted">weight ${GT().pillars[k]}</span></span><b>${Math.round(p.l)} <span class="${t > p.l ? "good" : t < p.l ? "bad" : "muted"}">${arrow}</span></b></div><div class="meter-bar"><i style="width:${p.l}%;background:${hue(p.l / 100)}"></i></div><p class="tiny muted">${esc(PILLARS[k].desc)}</p></div>`;
    }).join("");
    const total = G.leg.total;
    const seatBar = `<div class="seatbar">${G.factions.map(f => `<i style="width:${f.seats / total * 100}%;background:${ideoColor(f.ideo)};${f.gov ? "" : "opacity:.45"}" title="${esc(f.name)}: ${f.seats}"></i>`).join("")}<span class="majority" style="left:50%"></span></div>`;
    const facs = G.factions.map(f => `<tr><td><i class="dot" style="background:${ideoColor(f.ideo)}"></i> ${esc(f.name)}${f.core ? ` <span class='badge small'>${G.factions.filter(x => x.mine).length > 1 ? "Your faction" : "Yours"}</span>` : f.mine ? " <span class='tiny muted'>your party</span>" : f.gov ? " <span class='tiny muted'>gov</span>" : ""}<div class="tiny muted">${esc(f.desc || "")}</div></td><td>${f.seats}</td><td>${meter("", f.loyalty / 100, true, Math.round(f.loyalty))}</td><td><button class="mini" data-act="woo" data-k="${f.k}" ${G.capital < 5 ? "disabled" : ""}>Court (5 ⚡)</button></td></tr>`).join("");
    const cab = G.cabinet ? MINISTRIES.map(m => {
        const c = G.cabinet[m.k];
        if (!c) {
            const cands = (G.reshuffle && G.reshuffle[m.k]) || [];
            return `<div class="minister vacant"><b>${m.icon} ${esc(ministerTitle(m.k))}</b>: <span class="bad">vacant</span><div class="row">${cands.map((x, i) => `<button class="mini" data-act="appoint" data-k="${m.k}" data-i="${i}">${esc(x.name)} ${stars(x.comp)} <span class="tiny">${esc(x.facName)}</span></button>`).join("")}${cands.length ? "" : `<button class="mini" data-act="newCands" data-k="${m.k}">Find candidates</button>`}</div></div>`;
        }
        return `<div class="minister"><div><b>${m.icon} ${esc(ministerTitle(m.k))}</b><br>${esc(c.name)} <span class="stars">${stars(c.comp)}</span> <span class="tiny" style="color:${ideoColor(c.ideo)}">${esc(c.facName)}</span> <span class="tiny muted">loyalty ${Math.round(c.loyalty)}</span></div><button class="mini danger" data-act="sack" data-k="${m.k}" title="Dismiss (4 ⚡)">Dismiss</button></div>`;
    }).join("") : "";
    const acts = powerActions().map(a => `<div class="action"><div><b>${a.icon} ${a.name}</b><p class="small">${esc(a.desc)}</p></div><button data-act="power" data-k="${a.k}" ${G.capital < a.cost ? "disabled" : ""}>${a.cost} ⚡</button></div>`).join("");
    const reforms = REFORMS.filter(r => r.from.includes(G.gov.type) && r.ok()).map(r => {
        const f = reformForecast(r);
        const routes = r.decreeOnly || !GT().democracy ? `<button data-act="reform" data-k="${r.k}" data-r="decree" ${G.capital < 35 ? "disabled" : ""}>Decree (35 ⚡)</button>` :
            `<button data-act="reform" data-k="${r.k}" data-r="vote" ${G.capital < 35 ? "disabled" : ""}>${esc(G.leg.name)} vote, ${Math.round(f.prob * 100)}% (35 ⚡)</button><button data-act="reform" data-k="${r.k}" data-r="referendum" ${G.capital < 35 ? "disabled" : ""}>Referendum, ${Math.round(referendumOdds(r) * 100)}% (35 ⚡)</button>`;
        return `<div class="action col"><div><b>${r.icon} ${r.name}</b><p class="small">${esc(r.desc)}</p></div><div class="row">${routes}</div></div>`;
    }).join("") || "<p class='muted small'>No constitutional changes available right now.</p>";
    const nv = nextVote();
    const camp = GT().democracy || G.gov.type === "dominant_party" ? panel("Elections & campaign", `
        ${nv ? `<p>Next: <b>${nv.kind}</b> vote in <b>${nv.weeks}</b> weeks (${monthStr(nv.ym[0], nv.ym[1])}).${campaignSeason() ? " <span class='badge'>Campaign season</span>" : ""}</p>` : "<p class='muted'>No election scheduled.</p>"}
        <p class="small">Projected vote share: <b>~${Math.round(electionShare(nv && nv.kind === "presidential" ? "presidential" : "general", false))}%</b> · campaign bonus ${fmt(G.campaign.bonus, 1)}</p>
        <table class="regions"><tr><th>Region</th><th>Pop.</th><th>Support</th><th></th></tr>${G.regions.map((r, i) => { const s = regionSupport(r); return `<tr><td>${esc(r.n)}<div class="tiny muted">${r.t.join(", ")}</div></td><td>${r.pop}%</td><td>${meter("", s / 100, true, Math.round(s) + "%")}</td><td><button class="mini" data-act="rally" data-i="${i}" ${G.capital < 4 ? "disabled" : ""}>Rally (4 ⚡)</button></td></tr>`; }).join("")}</table>
        <div class="row"><button data-act="ads" ${G.funds < 25 ? "disabled" : ""}>📺 Ad blitz ($25M)</button><button data-act="fundraise" ${G.capital < 4 ? "disabled" : ""}>💰 Fundraiser (4 ⚡)</button></div>`) : "";
    return `<div class="cols3">
        <div>${panel("Power bases", `<p class="small muted">Loyalty drifts toward where conditions push it (▲▼). Weight shows how much each matters under your system.</p>` + pillars)}</div>
        <div>
            ${panel(`${esc(G.leg.name)}`, `<p class="small">${govSeats()} of ${total} seats with the government · majority ${majority()}${G.gov.cohabitation ? " · <b class='bad'>Cohabitation</b>" : ""}</p>${seatBar}<table class="facs-table"><tr><th>Faction</th><th>Seats</th><th>Loyalty</th><th></th></tr>${facs}</table>`)}
            ${G.cabinet ? panel(`Cabinet <span class="tiny muted">+${fmt(cabinetCapital(), 1)} ⚡/month</span>`, cab) : ""}
            ${camp}
        </div>
        <div>
            ${panel("Political actions", acts || "<p class='muted'>None available.</p>")}
            ${panel("Constitution", `<p class="small muted">Change the rules of the game itself. ${GT().democracy ? "In a democracy you need a two-thirds vote or a referendum." : "You can decree it, at a price."}</p>${reforms}<div class="row"><button class="secondary small" data-act="resign">🚪 Resign</button></div>`)}
        </div>
    </div>`;
}

// ── World ───────────────────────────────────────────────────────────

function viewWorld() {
    const areas = ["all", "Americas", "Europe", "Asia", "Middle East", "Africa", "Oceania"];
    const list = Object.values(G.nations).filter(n => n.key !== G.ck && !n.rebel && ["sovereign", "colony", "occupied"].includes(n.status) && (ui.worldFilter === "all" || n.area === ui.worldFilter))
        .sort((a, b) => b.gdp - a.gdp)
        .map(n => `<button class="nation-row ${ui.nation === n.key ? "on" : ""}" data-act="nation" data-k="${n.key}">${sideDot(n.key)} ${n.flag} <span>${esc(n.name)}</span> ${relBadge(getRel(G.ck, n.key))}</button>`).join("");
    const minutes = clamp(Math.round((100 - G.tension) / 6), 1, 17);
    const blocs = Object.entries(BLOCS).map(([k, b]) => {
        const mem = G.blocs[k], inIt = mem.includes(G.ck);
        const can = inIt || (BLOC_REQ[k] && BLOC_REQ[k]());
        return `<div class="bloc"><div><b>${b.icon} ${b.name}</b> <span class="tiny muted">${mem.length} members</span><p class="tiny muted">${esc(b.desc)}</p><p class="tiny">${mem.slice(0, 12).map(x => flagOf(x)).join(" ")}</p></div>${G.gov.type === "colony" ? "" : `<button class="mini ${inIt ? "danger" : ""}" data-act="bloc" data-k="${k}" ${can ? "" : "disabled"}>${inIt ? "Leave" : "Join"} (10 ⚡)</button>`}</div>`;
    }).join("");
    let detail = "<p class='muted'>Select a country.</p>";
    if (ui.nation && G.nations[ui.nation]) {
        const n = G.nations[ui.nation];
        const acts = DIPLO.map(a => `<div class="action"><div><b>${a.icon} ${a.name}</b><p class="tiny">${esc(a.desc)}</p></div><button data-act="diplo" data-k="${a.k}" data-n="${n.key}" ${a.ok(n) && G.capital >= a.cost && G.gov.type !== "colony" || (a.k === "envoy" && G.capital >= a.cost) ? "" : "disabled"}>${a.cost} ⚡</button></div>`).join("");
        const memberOf = Object.entries(G.blocs).filter(([, m]) => m.includes(n.key)).map(([k]) => BLOCS[k].name).join(", ");
        const treaties = G.treaties.filter(t => t.with === n.key).map(t => t.type).join(", ");
        detail = panel(`${n.flag} ${esc(n.name)}`, `
            <p>${n.gov && GOV_TYPES[n.gov] ? govBadge(n.gov) : ""} Led by <b>${esc(n.leader)}</b></p>
            <div class="budget"><div><small>GDP</small><b>${nominal(n.gdp)}</b></div><div><small>Military</small><b>${Math.round(n.mil)}</b></div><div><small>Stability</small><b>${Math.round(n.stab)}</b></div><div><small>Nukes</small><b>${n.nukes >= 3 ? "H-bomb" : n.nukes >= 2 ? "Atomic" : "None"}</b></div></div>
            <p class="small">Relations with you: ${relBadge(getRel(G.ck, n.key))} · Alignment: ${n.align > 35 ? "Western" : n.align < -35 ? "Eastern" : "Non-aligned"}${memberOf ? ` · ${esc(memberOf)}` : ""}${treaties ? ` · Treaties: ${esc(treaties)}` : ""}${n.status === "colony" ? ` · Colony of ${esc(nationName(n.master))}` : ""}</p>
            ${(() => { const deal = G.treaties.find(t => t.type === "trade" && t.with === n.key); const x = deal ? dealTerms(deal) : n.status === "sovereign" ? tradeTerms(n.key) : null; return x ? `<p class="tiny"><b>🚢 ${deal ? "Your trade agreement" : "A trade agreement would mean"}:</b> ${esc(termsText(x, n.name))}${deal ? ` <button class="mini secondary danger" data-act="tradeCancel" data-k="${n.key}">End it</button>` : ""}</p>` : ""; })()}
            ${acts}`);
    }
    const wars = G.wars.filter(w => !w.over).map(w => `<p class="small">⚔️ <b>${esc(w.name)}</b>: ${w.a.map(flagOf).join("")} vs ${w.b.map(flagOf).join("")} · front ${w.front > 0 ? "+" : ""}${Math.round(w.front)} · ${Math.round(w.weeks / 4.3)} months</p>`).join("") || "<p class='muted small'>The world is at peace, for now.</p>";
    return `<div class="cols3">
        <div>${panel("Nations", `<div class="filters">${areas.map(a => `<button class="mini ${ui.worldFilter === a ? "on" : ""}" data-act="wfilter" data-k="${a}">${a === "all" ? "All" : a}</button>`).join("")}</div><div class="nation-list">${list}</div><p class="tiny muted"><i class="dot" style="background:${SIDE_COLORS.west}"></i> West <i class="dot" style="background:${SIDE_COLORS.east}"></i> East <i class="dot" style="background:${SIDE_COLORS.nonaligned}"></i> Non-aligned <i class="dot" style="background:${SIDE_COLORS.colony}"></i> Colony</p>`)}</div>
        <div>${detail}</div>
        <div>
            ${viewStanding()}
            ${panel("The Cold War", `<div class="clock"><b>${minutes}</b> minutes to midnight</div>${meter("World tension", G.tension / 100, false, Math.round(G.tension))}<p class="small">Your alignment: <b>${G.align > 35 ? "Western" : G.align < -35 ? "Eastern" : "Non-aligned"}</b> (${G.align > 0 ? "+" : ""}${Math.round(G.align)})</p>`)}
            ${panel("Wars", wars)}
            ${panel("Alliances & organizations", blocs)}
        </div>
    </div>`;
}

// ── Military ────────────────────────────────────────────────────────

function viewMilitary() {
    const rank = Object.values(G.nations).filter(n => !n.rebel && n.status === "sovereign").map(n => n.key === G.ck ? G.mil.strength : n.mil).sort((a, b) => b - a).indexOf(G.mil.strength) + 1;
    const nk = G.mil.nukes >= 3 ? "Thermonuclear arsenal" : G.mil.nukes >= 2 ? "Atomic weapons" : G.pol.nuclear !== "no_nukes" ? `Program ${Math.round(G.mil.prog)}% toward a test` : "None";
    const wars = playerWars().map(w => {
        const mine = w.a.includes(G.ck) ? w.front : -w.front;
        const main = w.a[0] === G.ck || w.b[0] === G.ck;
        return panel(`⚔️ ${esc(w.name)}`, `
            <p>${w.a.map(k => `${flagOf(k)} ${esc(nationName(k))}`).join(", ")} <b>vs</b> ${w.b.map(k => `${flagOf(k)} ${esc(nationName(k))}`).join(", ")}</p>
            ${meter("Front line (your side)", (mine + 100) / 200, true, `${mine > 0 ? "+" : ""}${Math.round(mine)}`)}
            <p class="small">${Math.round(w.weeks / 4.3)} months · casualties: you ${Math.round((w.a.includes(G.ck) ? w.cas.a : w.cas.b) / 10) * 10}, enemy ${Math.round((w.a.includes(G.ck) ? w.cas.b : w.cas.a) / 10) * 10}</p>
            <div class="row">Commitment: ${["Withdraw", "Limited", "Major", "Full"].map((n, i) => `<button class="mini ${commitOf(w) === i ? "on" : ""}" data-act="commit" data-id="${w.id}" data-l="${i}" ${main && i === 0 ? "disabled" : ""}>${n}</button>`).join("")}</div>
            <div class="row"><button data-act="peace" data-id="${w.id}" ${G.capital < 6 ? "disabled" : ""}>🕊️ Propose peace (6 ⚡)</button>${G.mil.nukes >= 2 ? `<button class="danger" data-act="nuke" data-id="${w.id}">☢️ Use nuclear weapons</button>` : ""}</div>`);
    }).join("");
    return `<div class="cols2">
        <div>${panel("Armed forces", `
            ${meter("Military strength", log01(G.mil.strength, 0.2, 200), true, `${Math.round(G.mil.strength)} (#${rank} in the world)`)}
            ${meter("Readiness", G.s.readiness / 100, true, Math.round(G.s.readiness))}
            ${meter("War weariness", G.s.weariness / 100, false, Math.round(G.s.weariness))}
            ${G.pillars.military ? meter("Military loyalty", G.pillars.military.l / 100, true, Math.round(G.pillars.military.l)) : ""}
            ${meter("Coup risk", coupRisk() / 100, false, Math.round(coupRisk()))}
            <p>Nuclear status: <b>${nk}</b></p>
            <p class="small muted">Defense spending, conscription and the nuclear program are set on the Policy tab.${G.mil.noArmy ? " <b>You have no armed forces.</b>" : ""}</p>
            <div class="row"><button data-act="mobilize" ${G.capital < 6 || G.mil.noArmy ? "disabled" : ""}>📯 Mobilize reserves (6 ⚡)</button></div>`)}</div>
        <div>${wars || panel("Wars", "<p class='muted'>You are at peace.</p>")}</div>
    </div>`;
}

// ── Record ──────────────────────────────────────────────────────────

function viewRecord() {
    const filters = ["all", "major", "policy", "world", "good", "bad"];
    const logs = G.log.filter(l => ui.logFilter === "all" || l.type === ui.logFilter).slice(0, 150).map(l => `<p class="cable ${l.type}"><small>${dateStr(l.t)}</small> ${esc(l.text)}</p>`).join("");
    const tenures = G.tenures.map(t => `<li><b>${esc(t.name)}</b> (${dateStr(t.from).split(" ").pop()}–${dateStr(t.to).split(" ").pop()}): ${esc(t.how)}</li>`).join("");
    return `<div class="cols2">
        <div>${panel(`The record of ${esc(G.leader.name)}`, `<ul class="record">${G.record.map(r => `<li><small>${dateStr(r.t).split(" ").pop()}</small> ${esc(r.text)}</li>`).join("")}</ul>`)}
            ${tenures ? panel("Previous leaders (your playthrough)", `<ul>${tenures}</ul>`) : ""}
            ${panel("Legacy so far", legacyHTML())}</div>
        <div>${panel("Cables", `<div class="filters">${filters.map(f => `<button class="mini ${ui.logFilter === f ? "on" : ""}" data-act="lfilter" data-k="${f}">${f}</button>`).join("")}</div>${logs}`)}</div>
    </div>`;
}

function legacyScore() {
    const yrs = (G.t - G.leader.since) / 52;
    const goals = Object.keys(G.goalsDone).length;
    const growth = Math.log(G.econ.gdp / G.econ.gdp0) * 40;
    return Math.round(yrs * 4 + goals * 25 + growth + (G.s.prestige - 40) * 0.6 + (approval() - 50) * 0.5 + (G.flags.at_war_ever ? 0 : 5) - (G.flags.nuke_used ? 50 : 0) - (G.flags.coup_suffered ? 10 : 0));
}

function legacyHTML() {
    const s = legacyScore();
    const title = s > 160 ? "Father/Mother of the Nation" : s > 110 ? "A great leader" : s > 70 ? "A consequential leader" : s > 35 ? "A footnote in the history books" : "Remembered, unfortunately";
    return `<p class="legacy-score">${s}</p><p><b>${title}</b></p><p class="small">GDP ${money(G.econ.gdp0)} (1950) → ${nominal(G.econ.gdp)} · literacy ${Math.round(G.dev.lit)}% · ${devStage()} · goals achieved ${Object.keys(G.goalsDone).length}/${(C().goals || []).length}</p>`;
}

// ── Fall from power ─────────────────────────────────────────────────

function renderFall() {
    const o = G.over;
    const nuclear = G.flags.nuclear_war;
    const plan = nuclear ? null : successionPlan(o.reason);
    $("#fallBody").innerHTML = `
        <div class="fall">
            <div class="kicker">${dateStr()} · ${esc(C().name)}</div>
            <h1>${nuclear ? "☢️ The end of the world" : esc(o.label)}</h1>
            <p class="lede">${esc(o.text)}</p>
            ${nuclear ? "<p>The cities burn. There is no one left to write the history of " + esc(C().name) + ".</p>" : ""}
            ${panel(`The legacy of ${esc(G.leader.name)}`, legacyHTML() + `<ul class="record">${G.record.slice(-12).map(r => `<li>${esc(r.text)}</li>`).join("")}</ul>`)}
            <div class="row center">
                ${nuclear ? "" : `<button class="primary big" data-act="succession">Play on as the next leader →</button>`}
                <button class="secondary big" data-act="menu">Main menu</button>
            </div>
            ${plan ? `<p class="small muted">${esc(plan.note || "")} ${plan.gov !== G.gov.type ? `The system becomes: <b>${GOV_TYPES[plan.gov].name}</b>.` : ""}</p>` : ""}
        </div>`;
}

// ── Scenes & toasts ─────────────────────────────────────────────────

function renderScene() {
    const q = G.scenes[0];
    const el = $("#scene");
    if (!q) { el.innerHTML = ""; el.classList.remove("open"); return; }
    let sc;
    try { sc = SCENES[q.id](q.args); } catch (e) { console.error(e); G.scenes.shift(); return renderScene(); }
    el.classList.add("open");
    el.innerHTML = `<div class="scene-card">
        <div class="scene-icon">${sc.icon}</div>
        <div class="kicker">${esc(sc.kicker)}</div>
        <h2>${esc(sc.title)}</h2>
        <div class="scene-text">${md(sc.text)}</div>
        <div class="scene-choices">${sc.choices.map((c, i) => `<button class="choice-btn" data-act="scene" data-i="${i}" ${c.req === false ? "disabled" : ""}>${esc(c.t)}${c.hint ? `<small>${esc(c.hint)}</small>` : ""}</button>`).join("")}</div>
        ${G.scenes.length > 1 ? `<p class="tiny muted">${G.scenes.length - 1} more waiting</p>` : ""}
    </div>`;
}

function toast(title, text, changes = []) {
    const box = $("#toasts");
    if (!box) return;
    const el = document.createElement("div");
    el.className = "toast";
    const chips = (changes || []).slice(0, 10).map(c => `<span class="chg ${c.good ? "good" : "bad"}">${esc(c.label)} ${c.raw ? c.v : (c.v > 0 ? "+" : "") + c.v}</span>`).join("");
    el.innerHTML = `<b>${esc(title)}</b>${text ? `<p>${esc(text)}</p>` : ""}${chips ? `<div>${chips}</div>` : ""}`;
    box.appendChild(el);
    setTimeout(() => el.classList.add("out"), 5200);
    setTimeout(() => el.remove(), 5800);
    while (box.children.length > (window.innerWidth < 700 ? 2 : 3)) box.firstChild.remove();
}
