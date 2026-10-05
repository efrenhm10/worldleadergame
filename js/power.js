// ── WORLD STANDING — who are the great powers? ──────────────────────
//
// A composite power index for every sovereign state, in the spirit of the
// real ones (CINC, Lowy, US News): economic weight, military might (nuclear
// arsenals count), technology, population and influence (prestige,
// alliances, a Security Council veto). Each part is scored against the
// strongest country in the world at the time, so the ranking reflects how
// you compare, not just how you grow.

const POWER_WEIGHTS = { econ: 0.35, mil: 0.25, tech: 0.15, infl: 0.15, pop: 0.10 };
const POWER_PARTS = { econ: ["💰", "Economy"], mil: ["🎖️", "Military"], tech: ["🔬", "Technology"], infl: ["🌐", "Influence"], pop: ["👥", "Population"] };
const POWER_TIERS = [[65, "Superpower", "🌟"], [38, "Great power", "🏛️"], [24, "Middle power", "⚖️"], [14, "Regional power", "📍"], [0, "Minor power", "·"]];
const powerTier = s => POWER_TIERS.find(([t]) => s >= t);

function powerTable() {
    const list = Object.values(G.nations).filter(n => n.status === "sovereign" && !n.rebel && n.gdp > 0);
    const val = n => n.key === G.ck ? { gdp: G.econ.gdp, mil: G.mil.strength, nukes: G.mil.nukes, pop: G.econ.pop, tech: G.dev.tech } : n;
    const milOf = n => { const v = val(n); return v.mil * (v.nukes >= 2 ? 1.6 : v.nukes >= 1 ? 1.15 : 1); };
    const max = { gdp: 0, mil: 0, pop: 0, tech: 0 };
    list.forEach(n => { const v = val(n); max.gdp = Math.max(max.gdp, v.gdp); max.mil = Math.max(max.mil, milOf(n)); max.pop = Math.max(max.pop, v.pop || 0); max.tech = Math.max(max.tech, v.tech || 0); });
    const p5 = typeof P5 === "function" ? P5() : ["usa", "uk", "france", "russia"];
    const blocCount = k => Object.entries(G.blocs || {}).filter(([b, m]) => m.includes(k) && !BLOCS[b].econ).length + Object.entries(G.blocs || {}).filter(([b, m]) => m.includes(k) && BLOCS[b].econ).length * 0.5;
    const rows = list.map(n => {
        const v = val(n);
        const parts = {
            econ: Math.sqrt(v.gdp / Math.max(1e-6, max.gdp)),
            mil: Math.sqrt(milOf(n) / Math.max(1e-6, max.mil)),
            // Technological weight needs an economy behind it.
            tech: (v.tech || 0) / Math.max(1, max.tech) * Math.sqrt(Math.sqrt(v.gdp / Math.max(1e-6, max.gdp))),
            pop: Math.sqrt((v.pop || 0) / Math.max(1e-6, max.pop))
        };
        let infl = 0.4 * parts.econ + 0.2 * parts.tech + (p5.includes(n.key) ? 0.2 : 0) + 0.1 * Math.min(1, blocCount(n.key) / 3) + 0.1 * Math.min(1, (v.gdp * 1000 / Math.max(0.1, v.pop || 1)) / Math.max(1, frontierPC()));
        if (n.key === G.ck) infl = 0.5 * infl + 0.5 * G.s.prestige / 100 + (G.inst && G.inst.m.g7 ? 0.05 : 0);
        parts.infl = clamp(infl, 0, 1);
        const score = 100 * Object.entries(POWER_WEIGHTS).reduce((s, [k, w]) => s + w * parts[k], 0);
        return { k: n.key, name: n.key === G.ck ? ME().name : n.name, flag: n.flag, score, parts, tier: powerTier(score) };
    });
    rows.sort((a, b) => b.score - a.score);
    rows.forEach((r, i) => { r.rank = i + 1; });
    // Rank within each part.
    Object.keys(POWER_PARTS).forEach(p => { rows.slice().sort((a, b) => b.parts[p] - a.parts[p]).forEach((r, i) => { r.partRank = r.partRank || {}; r.partRank[p] = i + 1; }); });
    return rows;
}

function myStanding(rows = powerTable()) { return rows.find(r => r.k === G.ck) || null; }

// Once a year: remember the standing and celebrate (or mourn) milestones.
function powerYearly() {
    const me = myStanding();
    if (!me) return;
    const hist = G.powerHist = G.powerHist || [];
    const last = hist[hist.length - 1];
    hist.push({ y: G.year, rank: me.rank, score: Math.round(me.score * 10) / 10, tier: me.tier[1] });
    if (hist.length > 80) hist.shift();
    if (!last) return;
    const ti = t => POWER_TIERS.findIndex(x => x[1] === t);
    if (ti(me.tier[1]) < ti(last.tier)) {
        log(`${me.tier[2]} ${ME().name} is now a ${me.tier[1].toLowerCase()}: #${me.rank} in the world.`, "major");
        record(`Became a ${me.tier[1].toLowerCase()} (#${me.rank} in the world), ${G.year}.`);
        toast(`A ${me.tier[1].toLowerCase()}`, `${ME().name} ranks #${me.rank} in the world.`, [{ label: "Prestige", v: 4, good: true }]);
        applyEffects({ prestige: 4 });
    } else if (ti(me.tier[1]) > ti(last.tier)) {
        log(`📉 ${ME().name} slips to ${me.tier[1].toLowerCase()} status: #${me.rank} in the world.`, "bad");
    }
    [1, 3, 5, 10].forEach(n => { if (me.rank <= n && last.rank > n) { log(`🏆 ${ME().name} enters the world's top ${n === 1 ? "spot" : n}: #${me.rank}.`, "major"); record(`Reached #${me.rank} in the world power ranking, ${G.year}.`); } });
}

function rankChange() {
    const hist = G.powerHist || [], me = myStanding();
    if (!me || !hist.length) return 0;
    const prev = hist.length >= 2 && hist[hist.length - 1].y === G.year ? hist[hist.length - 2] : hist[hist.length - 1];
    return prev ? prev.rank - me.rank : 0;
}

function viewStanding() {
    const rows = powerTable(), me = myStanding(rows);
    if (!me) return panel("World power ranking", "<p class='muted'>Only sovereign states are ranked. Win your independence first.</p>");
    const ch = rankChange();
    const top = rows.slice(0, 15);
    const line = r => `<button class="power-row ${r.k === G.ck ? "me" : ""}" data-act="${r.k === G.ck ? "view" : "nation"}" data-${r.k === G.ck ? "v" : "k"}="${r.k === G.ck ? "world" : r.k}">
        <span class="pr-rank">#${r.rank}</span><span class="pr-name" title="${r.tier[1]}">${r.tier[2]} ${r.flag} ${esc(r.name)}</span>
        <span class="pr-bar"><i style="width:${clamp(r.score, 2, 100)}%"></i></span><b class="pr-score">${Math.round(r.score)}</b></button>`;
    const parts = Object.entries(POWER_PARTS).map(([p, [icon, name]]) => `<div><small>${icon} ${name}</small><b>#${me.partRank[p]}</b><span class="tiny muted">${Math.round(me.parts[p] * 100)}/100</span></div>`).join("");
    const nextUp = rows[me.rank - 2], nextTier = POWER_TIERS.slice().reverse().find(([t]) => t > me.score);
    // The gap you can actually close (population moves too slowly to count).
    const weakest = ["econ", "mil", "tech", "infl"].sort((a, b) => me.parts[a] - me.parts[b])[0];
    const tips = { econ: "grow the economy: industry, investment and trade", mil: "build up the armed forces (or the bomb)", tech: "fund research, universities and telecoms", infl: "win prestige: summits, the UN, alliances, space and diplomacy", pop: "population is slow to change" };
    const hist = (G.powerHist || []).slice(-12);
    return panel("World power ranking", `
        <div class="standing"><div class="st-rank">#${me.rank}</div><div><b>${me.tier[2]} ${me.tier[1]}</b>${ch ? ` <span class="${ch > 0 ? "good" : "bad"}">${ch > 0 ? "▲" : "▼"} ${Math.abs(ch)} since last year</span>` : ""}<div class="tiny muted">Power score ${Math.round(me.score)} of 100${nextUp ? ` · ${nextUp.score - me.score < 1 ? "less than a point" : Math.round(nextUp.score - me.score) + " points"} behind ${nextUp.flag} ${esc(nextUp.name)}` : " · the world's leading power"}${nextTier ? ` · ${Math.max(1, Math.round(nextTier[0] - me.score))} points from ${nextTier[1].toLowerCase()}` : ""}</div></div></div>
        <div class="budget">${parts}</div>
        <p class="tiny">Biggest gap: <b>${POWER_PARTS[weakest][1].toLowerCase()}</b>. To climb, ${tips[weakest]}.</p>
        ${hist.length > 1 ? `<p class="tiny muted">Your rank by year: ${hist.map(h => `${h.y} #${h.rank}`).join(" · ")}</p>` : ""}
        <h4>Top 15</h4><p class="tiny muted">${POWER_TIERS.slice(0, 4).map(t => `${t[2]} ${t[1]}`).join(" · ")}</p>${top.map(line).join("")}${me.rank > 15 ? `<div class="tiny muted" style="text-align:center">⋯</div>${line(me)}` : ""}
        <p class="tiny muted">Score: economy 35%, military 25% (nuclear arsenals count), technology 15%, influence 15% (prestige, alliances, a Security Council veto), population 10%, each measured against the world's strongest.</p>`);
}
