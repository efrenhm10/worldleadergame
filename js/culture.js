// ── CULTURE — museums, schools of art and design, festivals ─────────
//
// Culture is more than prestige. A lively cultural life keeps talented
// people at home, draws visitors, and supplies the designers, architects
// and fashion houses that turn raw exports into brands. Venues are built
// once; annual events cost money every year; creative schools train
// designers and artists. Monarchs can lend the crown's patronage.

const VENUES = {
    art_museum:     { name: "Museum of fine art", icon: "🖼️", cost: 0.25, years: 2, C: 6, ind: { tourism: 0.4 }, prestige: 1, retain: 0.03, desc: "Old masters, national painters and visiting exhibitions." },
    history_museum: { name: "National history museum", icon: "🏺", cost: 0.2, years: 2, C: 4, ind: { tourism: 0.4 }, legit: 2, desc: "The nation's story, from antiquity to independence." },
    science_museum: { name: "Science & technology museum", icon: "🔭", cost: 0.2, years: 2, C: 4, tech: 0.1, lit: 0.05, desc: "Planetarium, engines and hands-on exhibits that make scientists of schoolchildren." },
    children_museum:{ name: "Children's museum & discovery centre", icon: "🧸", cost: 0.1, years: 1, C: 3, lit: 0.1, p: { people: 2 }, desc: "Play, build and discover. Families love it." },
    playgrounds:    { name: "Playgrounds & neighbourhood parks", icon: "🛝", cost: 0.15, years: 1, C: 3, health: 1, crime: -1, p: { people: 2 }, desc: "Swings, sports courts and green space in every town." },
    library:        { name: "National library & reading rooms", icon: "📚", cost: 0.1, years: 1, C: 3, lit: 0.1, desc: "Books, newspapers and study halls open to all." },
    cinemas:        { name: "Cinemas & entertainment district", icon: "🎬", cost: 0.2, years: 1, C: 4, ind: { film: 0.6 }, retain: 0.04, p: { people: 3 }, desc: "Picture palaces, theatres, cafés and nightlife: a city worth staying in." },
    concert_hall:   { name: "Concert hall", icon: "🎼", cost: 0.2, years: 2, C: 4, ind: { tourism: 0.3 }, prestige: 1, desc: "Home for a national orchestra and touring stars." },
    theme_park:     { name: "Theme park", icon: "🎢", cost: 0.4, years: 2, from: 1955, C: 3, ind: { tourism: 1.2 }, p: { people: 3 }, desc: "Rides, parades and characters for families from home and abroad." }
};
const CREATIVE_SCHOOLS = {
    art_school:     { name: "National academy of fine arts", icon: "🎨", cost: 0.1, years: 2, C: 4, grads: 0.05, design: 0.1, hsJobs: 0.05, desc: "Painters, sculptors and illustrators." },
    design_school:  { name: "School of design & architecture", icon: "📐", cost: 0.15, years: 2, C: 3, grads: 0.06, design: 0.3, hsJobs: 0.1, desc: "Product, graphic and industrial designers, and architects: the people who turn goods into brands." },
    fashion_school: { name: "Fashion institute", icon: "👗", cost: 0.1, years: 2, from: 1955, C: 3, grads: 0.03, design: 0.25, ind: { textiles: 0.3 }, hsJobs: 0.05, desc: "Designers, pattern-makers and merchandisers for textiles, leather and wool." },
    film_school:    { name: "Film & television school", icon: "🎥", cost: 0.1, years: 2, C: 3, grads: 0.03, ind: { film: 1 }, hsJobs: 0.05, desc: "Directors, camera crews and editors for a national film industry." },
    conservatory:   { name: "Music conservatory", icon: "🎻", cost: 0.08, years: 2, C: 3, grads: 0.02, prestige: 1, desc: "Musicians and composers, classical and popular." }
};
// Annual events: % of GDP a year while running.
function cultureEvents() {
    const goods = typeof exState === "function" ? Object.keys(exState().goods) : [];
    const food = goods.includes("coffee") ? ["Coffee festival", "☕", "coffee"] : goods.includes("wine") ? ["Wine & food festival", "🍷", "wine"] : goods.includes("tea") ? ["Tea festival", "🍵", "tea"] : goods.includes("cocoa") ? ["Chocolate festival", "🍫", "cocoa"] : null;
    const ev = {
        fashion_week:  { name: "Fashion week", icon: "👠", cost: 0.03, need: () => cbuilt("fashion_school") || cbuilt("design_school") ? null : "Needs a fashion institute or design school", C: 4, design: 0.15, ind: { textiles: 0.5, tourism: 0.3 }, prestige: 1, desc: "Runways, buyers and the international fashion press." },
        film_festival: { name: "International film festival", icon: "🎞️", cost: 0.02, need: () => cbuilt("cinemas") || cbuilt("film_school") ? null : "Needs cinemas or a film school", C: 4, ind: { film: 0.8, tourism: 0.3 }, prestige: 2, desc: "Premieres, stars and prizes." },
        music_festival:{ name: "Music festival", icon: "🎤", cost: 0.02, C: 3, ind: { tourism: 0.6 }, p: { people: 2 }, desc: "Three days of music in the open air." },
        biennale:      { name: "Art biennale", icon: "🖌️", cost: 0.02, need: () => cbuilt("art_museum") ? null : "Needs a museum of fine art", C: 4, design: 0.05, ind: { tourism: 0.4 }, prestige: 2, desc: "Artists and collectors from around the world." },
        design_fair:   { name: "Design & trade fair", icon: "🛋️", cost: 0.02, need: () => cbuilt("design_school") ? null : "Needs a school of design", C: 2, design: 0.1, brand: 0.03, desc: "Where your manufacturers meet foreign buyers." }
    };
    if (food) ev.food_festival = { name: food[0], icon: food[1], cost: 0.015, C: 2, brand: 0.05, ind: { tourism: 0.3 }, desc: `Celebrate and sell your ${food[2]}: buyers, chefs and travel writers.` };
    return ev;
}

function cstate() { if (!G.culture) G.culture = { built: {}, events: {}, warrants: false, academy: false, foundation: false, royalScholars: false, patron: null }; return G.culture; }
const cbuilt = k => { const b = cstate().built[k]; return b && b.stage === "open"; };
const cdef = k => VENUES[k] || CREATIVE_SCHOOLS[k];

function cBuild(k) {
    const D = cdef(k), c = cstate();
    if (!D || c.built[k]) return;
    if (D.from && G.year < D.from) return toast("Not yet", `From ${D.from}.`);
    if (G.capital < 2) return toast("Not enough political capital", "It costs 2.");
    G.capital -= 2;
    c.built[k] = { stage: "building", cost: G.econ.gdp * D.cost / 100, done: 0, weeks: Math.round(D.years * 52) };
    log(`🎨 Work begins on the ${D.name.toLowerCase()}.`, "policy");
}
function cToggle(k) {
    const E = cultureEvents()[k], c = cstate();
    if (!E) return;
    if (!c.events[k]) {
        const need = E.need && E.need();
        if (need) return toast("Not yet", need);
        if (G.capital < 2) return toast("Not enough political capital", "Launching it costs 2.");
        G.capital -= 2;
    }
    c.events[k] = !c.events[k];
    log(c.events[k] ? `${E.icon} The first ${E.name.toLowerCase()} is announced.` : `${E.icon} The ${E.name.toLowerCase()} is cancelled.`, "policy");
}

function cultureWeek() {
    if (!G.culture) return;
    Object.entries(G.culture.built).forEach(([k, b]) => {
        if (b.stage !== "building") return;
        const step = b.cost / b.weeks;
        treasuryPay(step); b.done += step;
        if (b.done >= b.cost - 1e-9) {
            b.stage = "open"; b.opened = G.year;
            const D = cdef(k), fx = {};
            if (D.p) fx.p = D.p; if (D.prestige) fx.prestige = D.prestige; if (D.legit) fx.legitimacy = D.legit;
            applyEffects(fx);
            log(`${D.icon} The ${D.name.toLowerCase()} opens its doors.`, "good");
        }
    });
}
function cultureYearly() {
    const c = cstate(), E = cultureEvents();
    let cost = 0;
    Object.keys(c.events).forEach(k => { if (c.events[k] && E[k]) { cost += E[k].cost; if (E[k].p) applyEffects({ p: E[k].p }); } });
    if (c.foundation) cost += 0.02;
    if (c.royalScholars) cost += 0.02;
    if (cost > 0) treasuryPay(G.econ.gdp * cost / 100);
    if (c.foundation) applyEffects({ legitimacy: 1, p: { royals: 1 } });
}

// Sum an effect over open venues, schools and running events.
function cultureFx(key) {
    if (!G.culture) return 0;
    const c = G.culture, E = cultureEvents();
    let s = 0;
    Object.keys(c.built).forEach(k => { if (cbuilt(k)) s += cdef(k)[key] || 0; });
    Object.keys(c.events).forEach(k => { if (c.events[k] && E[k]) s += E[k][key] || 0; });
    if (key === "design") s += c.academy ? 0.1 : 0;
    if (key === "retain") s += cultureScore() / 400;
    return s;
}
function cultureInd(k) {
    if (!G.culture) return 0;
    const c = G.culture, E = cultureEvents();
    let s = 0;
    Object.keys(c.built).forEach(b => { if (cbuilt(b)) s += (cdef(b).ind || {})[k] || 0; });
    Object.keys(c.events).forEach(e => { if (c.events[e] && E[e]) s += (E[e].ind || {})[k] || 0; });
    return s;
}
function cultureParts() {
    const c = cstate(), parts = [["Heritage & traditions", 12], ["Literacy & cities", G.dev.lit * 0.12 + G.dev.urban * 0.08]];
    const v = Object.keys(c.built).filter(cbuilt).reduce((s, k) => s + cdef(k).C, 0);
    if (v) parts.push(["Museums, venues & schools", v]);
    const E = cultureEvents(), ev = Object.keys(c.events).filter(k => c.events[k] && E[k]).reduce((s, k) => s + E[k].C, 0);
    if (ev) parts.push(["Festivals & events", ev]);
    const press = { free: 6, restricted: -3, state: -10 }[G.pol.press] || 0;
    if (press) parts.push([press > 0 ? "Free expression" : "Censorship", press]);
    const roy = (c.academy ? 6 : 0) + (c.foundation ? 5 : 0) + (c.patron ? 2 : 0);
    if (roy) parts.push(["Royal patronage", roy]);
    if (typeof lmAppeal === "function" && lmAppeal()) parts.push(["Landmarks", Math.min(10, lmAppeal() * 0.6)]);
    return parts;
}
function cultureScore() { return clamp(cultureParts().reduce((s, [, v]) => s + v, 0)); }

// ── Royal patronage ─────────────────────────────────────────────────
function royalPatron(k, arg) {
    const c = cstate();
    if (G.gov.type !== "monarchy") return;
    const cost = { academy: 4, warrants: 3, foundation: 2, scholars: 2, patron: 2 }[k];
    if (G.capital < cost) return toast("Not enough political capital", `It costs ${cost}.`);
    G.capital -= cost;
    if (k === "academy" && !c.academy) { c.academy = true; treasuryPay(G.econ.gdp * 0.001); applyEffects({ legitimacy: 2, prestige: 1, p: { royals: 3 } }); log("👑🎨 The Royal Academy of Arts is founded under the crown's patronage.", "good"); }
    if (k === "warrants" && !c.warrants) { c.warrants = true; applyEffects({ p: { business: 2, royals: 2 } }); log("👑 Royal warrants are granted to master craftsmen: weavers, leatherworkers, jewellers and roasters may display the royal arms. Foreign buyers take notice.", "good"); }
    if (k === "foundation") { c.foundation = !c.foundation; log(c.foundation ? "👑 The Royal Arts Foundation is endowed from the privy purse." : "👑 The Royal Arts Foundation's grants are wound down.", "policy"); }
    if (k === "scholars") { c.royalScholars = !c.royalScholars; log(c.royalScholars ? "👑 Royal scholarships send gifted students abroad, on their honour to return and serve." : "👑 The royal scholarships end.", "policy"); }
    if (k === "patron" && arg) { const ch2 = typeof royalChild === "function" ? royalChild(arg) : null; if (ch2) { c.patron = arg; ch2.pop = clamp((ch2.pop || 50) + 10); log(`👑 ${arg} becomes royal patron of the arts, opening galleries and handing out prizes.`, "good"); } }
}

// ── The Culture tab ─────────────────────────────────────────────────
function viewCulture() {
    const c = cstate(), score = cultureScore(), E = cultureEvents();
    const item = (k, D) => {
        const b = c.built[k], lock = D.from && G.year < D.from ? `From ${D.from}` : null;
        const tags = [D.ind && D.ind.tourism ? "tourism" : "", D.design ? "design talent" : "", D.grads ? "creative graduates" : "", D.retain ? "keeps talent" : "", D.lit ? "literacy" : "", D.tech ? "technology" : "", D.health ? "health" : "", D.ind && D.ind.film ? "film industry" : "", D.ind && D.ind.textiles ? "fashion & textiles" : ""].filter(Boolean).join(", ");
        return `<div class="mega-row ${lock ? "locked" : ""}"><div style="flex:1"><b>${D.icon} ${esc(D.name)}</b> <span class="tiny muted">~${nominal(G.econ.gdp * D.cost / 100)} · culture +${D.C}</span><p class="tiny">${esc(D.desc)}${tags ? ` <span class="muted">(${tags})</span>` : ""}</p>${b && b.stage === "building" ? meter("Building", b.done / b.cost, true, Math.round(b.done / b.cost * 100) + "%") : ""}${lock ? `<p class="tiny warn">🔒 ${lock}</p>` : ""}</div>${b ? (b.stage === "open" ? `<b class="good tiny">open</b>` : "") : lock ? "" : `<button class="mini" data-act="cBuild" data-k="${k}" ${G.capital < 2 ? "disabled" : ""}>Build (2 ⚡)</button>`}</div>`;
    };
    const venues = Object.entries(VENUES).map(([k, D]) => item(k, D)).join("");
    const schools = Object.entries(CREATIVE_SCHOOLS).map(([k, D]) => item(k, D)).join("");
    const events = Object.entries(E).map(([k, D]) => { const need = D.need && D.need(), on = c.events[k]; return `<div class="mega-row ${need && !on ? "locked" : ""}"><div style="flex:1"><b>${D.icon} ${esc(D.name)}</b> <span class="tiny muted">${nominal(G.econ.gdp * D.cost / 100)} a year · culture +${D.C}</span><p class="tiny">${esc(D.desc)}</p>${need && !on ? `<p class="tiny warn">🔒 ${esc(need)}</p>` : ""}</div>${need && !on ? "" : `<button class="mini ${on ? "" : "secondary"}" data-act="cEvent" data-k="${k}">${on ? "✓ Every year" : "Launch (2 ⚡)"}</button>`}</div>`; }).join("");
    const parts = cultureParts().sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).map(([l, v]) => `${esc(l)} <b class="${v > 0 ? "good" : "bad"}">${v > 0 ? "+" : ""}${Math.round(v)}</b>`).join(" · ");
    const design = cultureFx("design");
    const mon = G.gov.type === "monarchy";
    const kids = mon && typeof fam === "function" ? fam().children.filter(x => x.alive && ageOf(x) >= 16) : [];
    const royal = mon ? panel("👑 Royal patronage", `
        <div class="mega-row"><div style="flex:1"><b>Royal Academy of Arts</b><p class="tiny">Found an academy under the crown: culture +6, design talent, legitimacy.</p></div>${c.academy ? "<b class='good tiny'>founded</b>" : `<button class="mini" data-act="rPatron" data-k="academy">Found (4 ⚡)</button>`}</div>
        <div class="mega-row"><div style="flex:1"><b>Royal warrants for craftsmen</b><p class="tiny">"By appointment to the crown": raises how far your export brands can go (+10% ceiling).</p></div>${c.warrants ? "<b class='good tiny'>granted</b>" : `<button class="mini" data-act="rPatron" data-k="warrants">Grant (3 ⚡)</button>`}</div>
        <div class="mega-row"><div style="flex:1"><b>Royal Arts Foundation</b><p class="tiny">Grants from the privy purse (0.02% of GDP a year): culture +5, legitimacy and the court's goodwill each year.</p></div><button class="mini ${c.foundation ? "" : "secondary"}" data-act="rPatron" data-k="foundation">${c.foundation ? "✓ Funded" : "Endow (2 ⚡)"}</button></div>
        <div class="mega-row"><div style="flex:1"><b>Royal scholarships</b><p class="tiny">Send gifted students abroad on their honour to return (0.02% of GDP a year): less brain drain.</p></div><button class="mini ${c.royalScholars ? "" : "secondary"}" data-act="rPatron" data-k="scholars">${c.royalScholars ? "✓ Running" : "Start (2 ⚡)"}</button></div>
        ${kids.length ? `<div class="mega-row"><div style="flex:1"><b>Royal patron of the arts</b><p class="tiny">${c.patron ? `${esc(c.patron)} is patron of the arts.` : "Give a royal child the role: their popularity rises."}</p></div><select data-change="rPatronChild"><option value="">Choose…</option>${kids.map(x => `<option value="${esc(x.name)}" ${c.patron === x.name ? "selected" : ""}>${esc(x.name)}</option>`).join("")}</select></div>` : ""}`) : "";
    return `<div class="cols2"><div>
        ${panel("Culture", `<div class="standing"><div class="st-rank">${Math.round(score)}</div><div><b>Cultural life</b><div class="tiny muted">${parts}</div></div></div>
            <div class="budget"><div><small>Keeps talent</small><b>−${Math.round(Math.min(30, cultureFx("retain") * 100))}%</b><span class="tiny muted">brain drain</span></div><div><small>Design talent</small><b>${fmt(design, 2)}</b><span class="tiny muted">for export brands</span></div><div><small>Creative grads</small><b>+${fmt(cultureFx("grads"), 2)}%</b><span class="tiny muted">of workforce</span></div></div>
            <p class="tiny muted">Culture keeps graduates at home, draws tourists, and gives your exporters the designers they need to build brands. Censorship stifles it.</p>`)}
        ${panel("Museums, parks & entertainment", venues)}
        ${panel("Schools of art & design", schools)}
        </div><div>
        ${panel("Festivals & annual events", events + `<p class="tiny muted">Events cost money every year while they run.</p>`)}
        ${royal}
        </div></div>`;
}
