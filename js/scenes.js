// ── SCENES — decisions that interrupt the week ──────────────────────
//
// Each scene is built from (id, args) so the queue can be saved. Choices
// carry effects (fx), an optional run() for anything more complex, and
// result text. A choice with req === false is shown but disabled.

const SCENES = {};
const S = (icon, kicker, title, text, choices) => ({ icon, kicker, title, text, choices });
const ch = (t, fx, res, extra = {}) => Object.assign({ t, fx, res }, extra);

function sceneChoose(i) {
    const q = G.scenes[0];
    if (!q) return;
    const sc = SCENES[q.id](q.args);
    const c = sc.choices[i];
    if (!c || c.req === false) return;
    G.scenes.shift();
    const before = impactSnapshot();
    const changes = applyEffects(c.fx || {});
    let res = c.res || "";
    if (c.run) { const r = c.run(); if (typeof r === "string") res = r; }
    if (q.id !== "cip_region") changes.push(...impactDiff(before, null, true));
    else G.scenes = G.scenes.filter(x => x.id !== "cip_region");
    if (!G.over && !G.pendingSuccession) toast(sc.title, res, changes);
    save();
    render();
}

const capOK = n => G.capital >= n;

// ── Opening ─────────────────────────────────────────────────────────

SCENES.welcome = () => {
    const c = C(), g = GT();
    return S(c.flag, `${dateStr()} · ${c.system}`, `${G.leader.title} ${G.leader.name}`,
        `${c.blurb}\n\n**How you can lose power under this system:** ${g.fall.join(" · ")}.\n\n**Your backstory (${BACKGROUNDS[G.leader.bg].name}):** allies are ${BACKGROUNDS[G.leader.bg].allies.toLowerCase()}; enemies are ${BACKGROUNDS[G.leader.bg].enemies.toLowerCase()}.`,
        [ch("To work.", {}, "Each turn is one week. Use the tabs to govern, then press Next week.")]);
};

SCENES.term_trap = () => S("⏳", "A constitutional bind", "You cannot run again",
    `The constitution forbids you a second consecutive term. The election is set for ${monthStr(...G.gov.nextElection)}. Your party wants to know your plans.`,
    [ch("Back a successor from my party", { p: { party: 5 } }, "When the election comes, your chosen successor will carry the party's banner. If they win, you continue as them.", { run: () => { G.flags.successor_running = true; G.flags.term_handled = true; } }),
     ch("Push a constitutional amendment so I can run", { capital: -10, legitimacy: -8, p: { press: -8, military: -5 } }, "Your allies begin drafting the amendment. Go to Power → Constitution to attempt it.", { req: capOK(10) }),
     ch("Serve out my term with dignity", { legitimacy: 6, prestige: 2 }, "You will leave office when your term ends.", { run: () => { G.flags.retire_at_term = true; G.flags.term_handled = true; } })]);

// ── Elections ───────────────────────────────────────────────────────

SCENES.election_result = a => {
    const kind = a.kind;
    if (kind === "legislative") {
        const gs = govSeats();
        return S("🗳️", `${dateStr()} · ${G.leg.name} elections`, `${mySeats()} seats for your party`,
            `Your party took about ${a.share}% of the vote. The government side now holds ${gs} of ${G.leg.total} seats (${gs >= majority() ? "a majority" : "short of a majority"}).`,
            [ch("Noted.", {}, "")]);
    }
    return S("🗳️", `${dateStr()}`, a.coalition ? "Returned at the head of a coalition" : "Victory",
        kind === "presidential" ? `You win with ${a.share}% of the vote. A new term begins.` : `Your party wins ${a.seats} of ${G.leg.total} seats on ${a.share}% of the vote.`,
        [ch("Thank the voters", { p: { people: 2 } }, "")]);
};

SCENES.hung_parliament = () => {
    const mine = G.parties.find(p => p.k === G.leader.party);
    const cands = G.parties.filter(p => !p.gov && p.k !== G.leader.party && p.seats > 0).sort((a, b) => ideoDist(a.ideo, G.leader.ideology) - ideoDist(b.ideo, G.leader.ideology)).slice(0, 3);
    const choices = cands.map(p => {
        const odds = clamp(0.85 - ideoDist(p.ideo, G.leader.ideology) * 0.2, 0.05, 0.9);
        return ch(`Invite the ${p.name} (${p.seats} seats, ${Math.round(odds * 100)}% likely)`, {}, "", {
            run: () => {
                if (chance(odds)) {
                    p.gov = true; buildFactions(); applyEffects({ p: { coalition: 10 }, capital: -5 });
                    if (govSeats() >= majority()) return `The ${p.name} joins your government. You have a majority of ${govSeats() - majority() + 1}.`;
                    queueScene("hung_parliament", {}); return `The ${p.name} joins, but you are still short of a majority.`;
                }
                queueScene("hung_parliament", {}); return `The ${p.name} turns you down.`;
            }
        });
    });
    choices.push(ch("Govern as a minority government", { legitimacy: -4, p: { party: -3 } }, "You will need opposition votes for everything, and you can be toppled at any time."));
    choices.push(ch("Concede", {}, "", { run: () => fallFromPower("election", "Unable to form a majority, you resign.", true) }));
    return S("⚖️", `${dateStr()} · Hung parliament`, "No majority", `Your party has ${mine.seats} seats; you need ${majority()} for a majority and the government side has ${govSeats()}. You need partners.`, choices);
};

SCENES.cohabitation = () => S("⚜️", "Cohabitation", "The opposition controls the assembly",
    "The assembly elections went against you. You must appoint a prime minister from the opposition majority, who will run domestic policy. You keep foreign affairs and defense.",
    [ch("Accept cohabitation", { legitimacy: 4 }, "Domestic bills will be much harder until you win back the assembly."),
     ch("Dissolve the assembly and call new elections", { capital: -12, legitimacy: -3 }, "New assembly elections are called for next year.", { req: capOK(12), run: () => { G.gov.legNext = [G.year + 1, G.month]; } })]);

SCENES.term_limit = () => {
    const party = G.parties.find(p => p.k === G.leader.party);
    return S("⏳", `${dateStr()} · End of term`, "The constitution bars you from running again",
        `You have served ${G.gov.termsServed} term(s), the maximum. The ${party ? party.name : "party"} must choose a candidate.`,
        [ch("Anoint a successor and campaign for them", {}, "", { run: () => { G.flags.successor_running = true; runElection("presidential"); } }),
         ch("Retire and let the party decide", { legitimacy: 5 }, "", { run: () => fallFromPower("term", "Your term has ended. You hand over power peacefully.", true) }),
         ch("Ignore the constitution and run anyway", { legitimacy: -25, p: { military: -15, press: -20, party: -8 }, liberty: -8 }, "", { run: () => { G.gov.termLimit = null; G.flags.coup_pressure = (G.flags.coup_pressure || 0) + 20; runElection("presidential"); } })]);
};

SCENES.dedazo = () => {
    const facs = G.factions.filter(f => f.mine).slice(0, 3);
    const choices = facs.map(f => ch(`Tap the candidate of the ${f.name}`, { fac: { [f.k]: 20 } }, "", { run: () => { G.gov.termEnds = null; beginSuccession("term"); G.pendingSuccession.ideology = f.ideo; } }));
    choices.push(ch("Seek a second term (amend the constitution)", { legitimacy: -20, p: { party: -20, military: -10, people: -8 } }, "The party is stunned. The bosses start plotting.", { run: () => { G.gov.termEnds = [G.gov.termEnds[0] + 6, G.gov.termEnds[1]]; G.flags.dedazo_done = false; } }));
    return S("👆", `${dateStr()} · El dedazo`, "Choose your successor",
        "Your term ends soon. By the party's unwritten rule you alone choose its next presidential candidate, who will certainly win. You will continue the game as the person you choose.", choices);
};

// ── Parliamentary threats ───────────────────────────────────────────

SCENES.no_confidence = a => {
    const eff = G.factions.filter(f => f.gov).reduce((s, f) => s + f.seats * clamp(0.4 + f.loyalty / 120, 0, 1), 0);
    const opp = G.factions.filter(f => !f.gov).reduce((s, f) => s + f.seats * clamp(0.95 - f.loyalty / 200, 0.5, 1), 0);
    const survive = clamp(0.5 + (eff - opp) / G.leg.total * 2.5 + skill("legislation") * 0.03, 0.05, 0.95);
    return S("⚠️", `${dateStr()} · ${G.leg.name}`, "Motion of no confidence",
        `The opposition has tabled a motion of no confidence${a.cause === "bill" ? " after your bill's defeat" : ""}. Whips estimate you survive with ${Math.round(survive * 100)}% probability.`,
        [ch("Fight the vote", {}, "", { run: () => chance(survive) ? (applyEffects({ p: { party: 5 }, legitimacy: 3 }), "You survive the vote.") : (fallFromPower("noconfidence", "You lost the vote of no confidence and must resign."), "") }),
         ch("Buy off wavering members (patronage)", { capital: -12, corruption: 3, scandal: 4 }, "", { req: capOK(12), run: () => chance(Math.min(0.97, survive + 0.25)) ? "Enough members come around. You survive." : (fallFromPower("noconfidence", "Even the patronage wasn't enough. You lose the vote."), "") }),
         ch("Dissolve parliament and call an election", { legitimacy: -2 }, "An election is called for next month.", { req: !G.gov.noSnap, run: callSnapElection }),
         ch("Resign with dignity", {}, "", { run: () => fallFromPower("noconfidence", "You resigned before the vote.", true) })]);
};

SCENES.leadership_challenge = () => {
    const survive = clamp(0.35 + (G.pillars.party.l - 25) / 60 + (approval() - 45) / 100 + skill("intrigue") * 0.04, 0.05, 0.9);
    return S("🗡️", `${dateStr()} · Party room`, "A leadership challenge",
        `A rival has announced a challenge for the party leadership. Your survival odds: ${Math.round(survive * 100)}%.`,
        [ch("Fight it in the party room", {}, "", { run: () => chance(survive) ? (applyEffects({ p: { party: 12 }, fac: { mine: 8 } }), "You see off the challenger.") : (fallFromPower("challenge", "Your party has voted to replace you as leader."), "") }),
         ch("Promise to step down before the next election", { p: { party: 15 }, legitimacy: -5 }, "The challenge is withdrawn, for now.", { run: () => { G.flags.lame_duck = true; } }),
         ch("Give the rebels cabinet posts", { capital: -10, p: { party: 10 }, fac: { mine: 10 } }, "The plotters become ministers.", { req: capOK(10) })]);
};

SCENES.coalition_crisis = () => {
    const partners = G.parties.filter(p => p.gov && p.k !== G.leader.party);
    const p = partners.sort((a, b) => ideoDist(b.ideo, G.leader.ideology) - ideoDist(a.ideo, G.leader.ideology))[0];
    if (!p) return S("🤝", "Coalition", "All quiet", "", [ch("OK", {}, "")]);
    return S("🤝", `${dateStr()} · Coalition crisis`, `The ${p.name} threatens to walk out`,
        `Your coalition partner says its voters are deserting it because of your policies. It wants concessions, or it will leave the government and take ${p.seats} seats with it.`,
        [ch("Give them a ministry and their pet project", { capital: -8, cost: 0.3, p: { coalition: 18 } }, "The coalition holds.", { req: capOK(8) }),
         ch("Call their bluff", {}, "", { run: () => { if (chance(0.5)) { applyEffects({ p: { coalition: 5 } }); return "They back down."; } p.gov = false; buildFactions(); applyEffects({ p: { party: -5 }, legitimacy: -4 }); return `The ${p.name} leaves the government. You now have ${govSeats()} of ${G.leg.total} seats.`; } }),
         ch("Let them go and govern without them", { legitimacy: -3 }, "", { run: () => { p.gov = false; buildFactions(); return `You now have ${govSeats()} of ${G.leg.total} seats.`; } })]);
};

// ── Presidential threats ────────────────────────────────────────────

SCENES.impeachment = () => {
    const opp = G.factions.filter(f => !f.gov).reduce((s, f) => s + f.seats, 0);
    const defect = G.factions.filter(f => f.gov && f.loyalty < 35).reduce((s, f) => s + f.seats, 0);
    const convict = clamp((opp + defect * 0.6 - G.leg.total * 0.62) / (G.leg.total * 0.1) * 0.3 + 0.3 + (G.s.scandal - 60) / 100, 0.05, 0.9);
    return S("⚖️", `${dateStr()} · ${G.leg.name}`, "Impeachment proceedings",
        `Scandal has caught up with you. The opposition has opened impeachment proceedings. Lawyers estimate a ${Math.round(convict * 100)}% chance of removal at trial.`,
        [ch("Fight the charges in the trial", {}, "", { run: () => chance(convict) ? (fallFromPower("impeached", "You have been convicted and removed from office."), "") : (applyEffects({ scandal: -20, p: { party: 6 } }), "Acquitted! You survive, battered.") }),
         ch("Fire the officials involved and apologize on air", { scandal: -15, p: { people: 3, party: -4 }, legitimacy: -3 }, "", { run: () => chance(convict * 0.6) ? (fallFromPower("impeached", "The apology wasn't enough. You are removed."), "") : "The proceedings collapse." }),
         ch("Resign before the trial", {}, "", { run: () => fallFromPower("impeached", "You resigned rather than face trial.", true) })]);
};

SCENES.court_ruling = a => S("⚖️", `${dateStr()} · Supreme Court`, "The courts strike back",
    `The Supreme Court has ruled that your executive order on ${POLICY[a.area].name.toLowerCase()} exceeded your authority.`,
    [ch("Comply with the ruling", { legitimacy: 3 }, "The order is withdrawn.", { run: () => { G.pol[a.area] = POLICY[a.area].options[1] ? POLICY[a.area].options[1].k : G.pol[a.area]; } }),
     ch("Defy the court", { legitimacy: -12, liberty: -6, p: { press: -10, party: -5 } }, "A constitutional crisis begins.")]);

// ── Autocratic threats ──────────────────────────────────────────────

SCENES.party_revolt = () => S("🎗️", `${dateStr()} · Party headquarters`, "The bosses are restless",
    "Regional party bosses and sector leaders say you have forgotten who put you in power. They are meeting without you.",
    [ch("Shower them with patronage", { capital: -10, cost: 0.4, corruption: 4, p: { party: 15 } }, "Contracts and posts flow.", { req: capOK(10) }),
     ch("Purge the ringleaders", { p: { party: 5, people: -3 }, liberty: -3 }, "", { run: () => chance(0.6 + (trait("ruthless") ? 0.2 : 0)) ? "The ringleaders are expelled. The rest fall in line." : (fallFromPower("revolt", "The party machine has turned on you. You are forced out."), "") }),
     ch("Step aside gracefully", {}, "", { run: () => fallFromPower("revolt", "The party has chosen a new leader. You step aside.", true) })]);

SCENES.palace_intrigue = () => S("👑", `${dateStr()} · The palace`, "Whispers in the palace",
    `Your intelligence chief reports that senior members of the royal family are meeting in secret. ${G.leader.heir ? G.leader.heir.name + " is among them." : ""}`,
    [ch("Increase the princes' stipends", { cost: 0.5, p: { royals: 15 }, corruption: 3 }, "The family is soothed."),
     ch("Exile the ringleaders", { p: { royals: -5, security: 5 }, legitimacy: -4 }, "", { run: () => { G.flags.palace_warned = false; return chance(0.7) ? "Two princes leave for Europe. The rest are cowed." : "The exiled princes start plotting from abroad."; } }),
     ch("Ignore it", {}, "", { run: () => { G.flags.palace_warned = true; return "Perhaps it is nothing."; } })]);

SCENES.palace_coup = () => {
    const survive = clamp(0.3 + (G.pillars.military.l - 40) / 80 + skill("intrigue") * 0.05, 0.05, 0.85);
    return S("👑", `${dateStr()} · The family council`, "The family moves against you",
        `The senior princes have convened a family council and are asking the ulema to declare you unfit. Your chance of holding on: ${Math.round(survive * 100)}%.`,
        [ch("Call on the army and guard", {}, "", { run: () => chance(survive) ? (applyEffects({ p: { royals: 10, military: -5 } }), "The guard stands with you. The council disperses.") : (fallFromPower("palace", "The family council has deposed you. You leave for exile."), "") }),
         ch("Abdicate in favor of your heir", {}, "", { run: () => fallFromPower("palace", "You abdicate in favor of your heir.", true) })]);
};

SCENES.politburo_plot = () => S("☭", `${dateStr()} · The Kremlin corridors`, "Colleagues are conspiring",
    "Your security chief reports that several Politburo members have been meeting at a dacha outside the capital without you.",
    [ch("Arrest them first", { p: { politburo: 5, security: 5, cadres: -5 }, liberty: -5, legitimacy: -5 }, "", { run: () => { G.flags.purge_warned = false; if (trait("ruthless") || chance(0.6)) { G.factions.forEach(f => { f.loyalty += 6; }); return "The plotters are arrested. The survivors are loyal now, out of fear."; } G.flags.purge_warned = true; return "The arrests misfire. Two plotters escape and rally the Central Committee."; } }),
     ch("Win them over with promotions", { capital: -10, p: { politburo: 12 }, fac: { all: 8 } }, "", { req: capOK(10) }),
     ch("Pretend not to know", {}, "", { run: () => { G.flags.purge_warned = true; return "You smile at them in meetings and wait."; } })]);

SCENES.purge_meeting = () => {
    const survive = clamp(0.25 + (G.pillars.politburo.l - 20) / 70 + (G.pillars.military.l - 50) / 150 + skill("intrigue") * 0.05, 0.05, 0.8);
    return S("☭", `${dateStr()} · Emergency Presidium session`, "They are voting to remove you",
        `You are called back from holiday for an emergency session. The charge sheet is already printed. Chance you can turn the room: ${Math.round(survive * 100)}%.`,
        [ch("Appeal over their heads to the Central Committee", {}, "", { run: () => chance(survive + 0.1) ? (applyEffects({ p: { politburo: 15 } }), "The Central Committee backs you. Your accusers are expelled instead.") : (fallFromPower("purge", "The Presidium has relieved you of all your posts 'for health reasons'."), "") }),
         ch("Ask the marshals for support", {}, "", { run: () => chance(survive + (G.pillars.military.l - 50) / 100) ? "Tanks appear outside. The vote is postponed indefinitely." : (fallFromPower("purge", "The army stays neutral. You are removed."), "") }),
         ch("Accept retirement", {}, "", { run: () => fallFromPower("purge", "You accept 'retirement' and a dacha.", true) })]);
};

SCENES.politburo_resists = a => S("☭", "Politburo", "Your colleagues object",
    `The Politburo will not endorse the change to ${optName(policyOpt(a.area, a.k))}.`,
    [ch("Force it through", { capital: -6, p: { politburo: -8 }, fac: { all: -6 } }, "", { req: capOK(6), run: () => { const c = enactPolicy(a.area, a.k, "Forced decree"); return "You get your way, and they remember it."; } }),
     ch("Withdraw the proposal", { p: { politburo: 3 } }, "You back down.", { run: () => bumpCooldown(a.area) })]);

SCENES.referendum = a => {
    const pop = changePopularity(a.area, a.k);
    const odds = clamp(0.5 + pop * 0.2 + (approval() - 50) / 150, 0.05, 0.95);
    return S("🗳️", `${dateStr()} · Direct democracy`, "A referendum is called",
        `Opponents have gathered enough signatures to force a referendum on ${optName(policyOpt(a.area, a.k))}. Polls give it a ${Math.round(odds * 100)}% chance of surviving.`,
        [ch("Campaign for it", { capital: -5 }, "", { run: () => chance(odds + 0.08) ? (applyEffects({ legitimacy: 4 }), "The voters approve the law.") : (G.pol[a.area] = a.old || G.pol[a.area], G.gov.refLosses++, applyEffects({ legitimacy: -4 }), "The voters reject it. The law is struck down.") }),
         ch("Let the people decide", {}, "", { run: () => chance(odds) ? "The law survives." : (G.gov.refLosses++, "The voters reject it.") })]);
};

SCENES.referendum_crisis = () => S("🏔️", "Federal Assembly", "Lost confidence",
    "You have lost three referendums this term. Colleagues suggest you will not be re-elected to the Council.",
    [ch("Promise to listen more", { capital: -10, p: { party: 8 } }, "", { run: () => { G.gov.refLosses = 1; } }),
     ch("Resign", {}, "", { run: () => fallFromPower("referendum", "You resign from the Federal Council.", true) })]);

SCENES.iou_due = a => {
    const f = G.factions.find(x => x.k === a.f);
    if (!f) return S("📜", "", "Old favors", "", [ch("OK", {}, "")]);
    return S("📜", `${dateStr()} · A debt comes due`, `The ${f.name} wants its favor`,
        `You promised the ${f.name} a favor for its votes. Its leaders want a big appropriation for their districts now.`,
        [ch("Pay up", { cost: 0.4, fac: { [f.k]: 10 } }, "Promise kept."),
         ch("Stall them", { fac: { [f.k]: -20 }, p: { party: -3 } }, "They will not forget.")]);
};

// ── Coups, uprisings, assassination ─────────────────────────────────

SCENES.coup_rumors = () => {
    G.flags.coup_warned = true;
    return S("🎖️", `${dateStr()} · Intelligence report`, "Rumors in the officers' mess",
        `Junior officers are complaining openly about the government. Your intelligence chief thinks a group of colonels is plotting. Coup risk: ${Math.round(coupRisk())}.`,
        [ch("Raise military pay and budgets", { cost: 0.6, p: { military: 14 } }, "The grumbling subsides.", { run: () => { G.flags.coup_warned = false; } }),
         ch("Purge suspect officers", { readiness: -12, p: { military: -4 }, pm: { military: 6 }, liberty: -3 }, "", { run: () => { G.flags.coup_warned = false; G.flags.coup_pressure = Math.max(0, (G.flags.coup_pressure || 0) - 10); return "Dozens of officers are retired or arrested. The army is weaker, and quieter."; } }),
         ch("Appeal to the nation on the radio", { p: { people: 4 } }, "", { run: () => chance(0.4 + skill("oratory") * 0.08) ? (G.flags.coup_warned = false, "Crowds rally in support. The plotters lose their nerve.") : "The speech falls flat." }),
         ch("Do nothing", {}, "The rumors continue.")]);
};

SCENES.coup_attempt = () => {
    const survive = clamp(0.55 - coupRisk() / 120 + (approval() - 50) / 150 + skill("military") * 0.04 + skill("intrigue") * 0.03, 0.05, 0.85);
    return S("💥", `${dateStr()} · 3:00 AM`, "Tanks in the streets",
        `Troops have seized the radio station and are surrounding the government quarter. Loyal units are wavering. Chance the coup fails: ${Math.round(survive * 100)}%.`,
        [ch("Rally loyal troops and fight", {}, "", { run: () => chance(survive) ? (applyEffects({ p: { military: 10 }, legitimacy: 5, stability: -6 }), G.flags.coup_warned = false, G.flags.coup_attempts = (G.flags.coup_attempts || 0) + 1, record(`Survived a coup attempt, ${dateStr()}.`), "The coup collapses. The ringleaders are arrested.") : (G.flags.coup_suffered = true, fallFromPower("coup", "The coup succeeded. You are under arrest."), "") }),
         ch("Call the people into the streets", {}, "", { run: () => chance(survive * (approval() / 50)) ? (applyEffects({ p: { people: 8 }, stability: -8 }), G.flags.coup_warned = false, "Hundreds of thousands surround the plotters. The coup fails.") : (G.flags.coup_suffered = true, fallFromPower("coup", "The army fires on the crowds. The coup succeeds."), "") }),
         ch("Flee into exile", {}, "", { run: () => { G.flags.coup_suffered = true; fallFromPower("coup", "You fled the country as the army took power."); } })]);
};

SCENES.uprising = () => S("🔥", `${dateStr()} · The capital`, "The people rise",
    `Hundreds of thousands are in the streets demanding your fall. Strikes have shut down the country.`,
    [ch("Order the army to clear the streets", { liberty: -10, legitimacy: -15, p: { people: -10, press: -10 } }, "", { run: () => chance(0.3 + G.pillars[G.pillars.military ? "military" : "people"].l / 200 + (G.pillars.security ? G.pillars.security.l / 300 : 0)) ? (applyEffects({ stability: 10 }), "The square is cleared. The dead are counted quietly.") : (fallFromPower("revolution", "The soldiers refuse to fire. The regime collapses."), "") }),
     ch("Make sweeping concessions", { liberty: 10, p: { people: 15, security: -10 }, legitimacy: -5 }, "", { run: () => chance(0.6) ? "The crowds disperse, for now." : (fallFromPower("revolution", "The concessions came too late."), "") }),
     ch("Resign", {}, "", { run: () => fallFromPower("revolution", "You resign in the face of the uprising.", true) })]);

SCENES.assassination = () => {
    const survive = clamp(0.55 + ({ political: 0.15, terror: 0.25 }[G.pol.security] || 0) + skill("intrigue") * 0.03, 0.3, 0.95);
    return S("🔫", `${dateStr()} · Assassination attempt`, "Shots fired",
        "An assassin opens fire as you leave a public ceremony.",
        [ch("…", {}, "", { run: () => {
            if (chance(survive)) { applyEffects({ p: { people: 8 }, health: -10, legitimacy: 4 }); record(`Survived an assassination attempt, ${dateStr()}.`); return "You are wounded but survive. A wave of sympathy follows."; }
            leaderDies("assassinated"); return "";
        } })]);
};

SCENES.health_scare = () => S("🏥", `${dateStr()} · Your doctors`, "A health scare",
    `You collapse at a meeting. Your doctors urge rest. Health: ${Math.round(G.leader.health)}.`,
    [ch("Take a month's rest", { capital: -10, health: 15, p: { party: -3 } }, "You recover slowly.", { run: () => {} }),
     ch("Hide it and carry on", { health: -5, scandal: 3 }, "Rumors spread."),
     ch("Retire for health reasons", {}, "", { run: () => fallFromPower("retired", "You retire on medical advice.", true) })]);

// ── War and peace ───────────────────────────────────────────────────

SCENES.peace_offer = a => {
    const w = G.wars.find(x => x.id === a.id);
    if (!w || w.over) return S("🕊️", "", "Peace", "The war is already over.", [ch("OK", {}, "")]);
    const mine = w.a.includes(G.ck) ? w.front : -w.front;
    return S("🕊️", `${dateStr()} · ${w.name}`, "Envoys propose a ceasefire",
        `After ${Math.round(w.weeks / 4.3)} months of fighting, neutral envoys propose a ceasefire on current lines. The front ${mine > 10 ? "favors you" : mine < -10 ? "favors the enemy" : "is deadlocked"}.`,
        [ch("Accept the armistice", {}, "", { run: () => { endWar(w, "draw"); return "The guns fall silent."; } }),
         ch("Fight on", { p: { military: 3 } }, "The war continues.")]);
};

SCENES.invaded = a => {
    const w = G.wars.find(x => x.id === a.id);
    const enemy = w ? nationName(w.a[0]) : "the enemy";
    return S("🚨", `${dateStr()} · War`, `${enemy} has invaded`,
        `${enemy}'s forces have crossed the border. Your army is ${w ? (sideStrength(w, "b") > sideStrength(w, "a") ? "stronger" : "outnumbered") : ""}.`,
        [ch("Total mobilization", { capital: -5, p: { people: 6, military: 6 } }, "The nation rallies.", { run: () => { if (w) w.commit[G.ck] = 3; G.pol.military = "total"; } }),
         ch("Appeal to allies and the UN", { p: { foreign: 4 } }, "", { run: () => { if (!w) return ""; const allies = Object.keys(G.nations).filter(k => alliedWith(G.ck, k) && G.nations[k].status === "sovereign"); allies.slice(0, 3).forEach(k => { if (!w.b.includes(k)) w.b.push(k); }); return allies.length ? `${allies.slice(0, 3).map(nationName).join(", ")} come to your aid.` : "Sympathy, but no troops."; } }),
         ch("Sue for peace immediately", { prestige: -15, p: { military: -15, people: -10 } }, "", { run: () => { if (w) endWar(w, "draw"); return "A humiliating ceasefire."; } })]);
};

SCENES.ally_attacked = a => {
    const w = G.wars.find(x => x.id === a.id);
    if (!w) return S("🛡️", "", "", "", [ch("OK", {}, "")]);
    return S("🛡️", `${dateStr()} · Treaty obligations`, `${nationName(w.b[0])} invokes your alliance`,
        `${nationName(w.a[0])} has attacked your ally ${nationName(w.b[0])}. Your treaty obliges you to help.`,
        [ch("Send a major force", { capital: -5 }, "", { run: () => { w.b.push(G.ck); w.commit[G.ck] = 2; G.flags.at_war_ever = true; return "Your troops embark."; } }),
         ch("Send a token contingent", {}, "", { run: () => { w.b.push(G.ck); w.commit[G.ck] = 1; G.flags.at_war_ever = true; return "A brigade sails, flags flying."; } }),
         ch("Stay out", { prestige: -6, rel: { [w.b[0]]: -25 } }, "Your ally will remember.")]);
};

// ── Discoveries, programs, openings ─────────────────────────────────

SCENES.discovery = a => {
    const what = { oil: "Oil has been struck", tourism: "Tourists are discovering your country", minerals: "Major mineral deposits found" }[a.res] || "A discovery";
    return S("🛢️", `${dateStr()} · A discovery`, what,
        a.res === "oil" ? "Geologists confirm a major oil field. Foreign companies are already lining up. How you handle this will shape the country for generations." : "A new industry is possible.",
        a.res === "oil" ? [
            ch("Grant concessions to foreign majors", { rel: { usa: 5, uk: 5 }, p: { business: 6, people: -3 } }, "Drilling starts fast.", { run: () => { G.res.push("oil"); G.ind.oil.out = G.econ.gdp * 0.03; G.ind.oil.out0 = G.ind.oil.out; G.ind.oil.own = "foreign"; G.pol.resources = "concessions"; } }),
            ch("Create a national oil company", { p: { people: 8, business: -3 }, prestige: 3 }, "Slower, but the profits stay home.", { run: () => { G.res.push("oil"); G.ind.oil.out = G.econ.gdp * 0.015; G.ind.oil.out0 = G.ind.oil.out; G.ind.oil.own = "state"; G.pol.resources = "partnership"; } }),
            ch("Create a sovereign wealth fund too", { p: { people: 4 }, legitimacy: 5 }, "Oil money will be saved for future generations.", { run: () => { G.res.push("oil"); G.ind.oil.out = G.econ.gdp * 0.015; G.ind.oil.out0 = G.ind.oil.out; G.ind.oil.own = "state"; G.pol.resources = "partnership"; G.flags.oil_fund = true; } })
        ] : [ch("Excellent", {}, "", { run: () => { if (!G.res.includes(a.res)) G.res.push(a.res); } })]);
};

SCENES.nuke_test = a => S("☢️", `${dateStr()} · Test site`, a.level >= 3 ? "Thermonuclear test" : "Your first atomic test",
    a.level >= 3 ? "The hydrogen bomb works. The fireball is visible 200 km away." : `A blinding flash over the test site. ${C().name} is a nuclear power.`,
    [ch("Announce it to the world", { prestige: 12, tension: 8, p: { military: 10, people: 5 } }, "The world takes notice.", { run: () => { log(`☢️ ${C().name} tests a${a.level >= 3 ? " thermonuclear" : "n atomic"} bomb.`, "major"); record(`Tested a${a.level >= 3 ? " hydrogen" : "n atomic"} bomb, ${dateStr()}.`); } }),
     ch("Keep it secret (opacity)", { prestige: 3, p: { military: 6 } }, "Everyone suspects, nobody can prove it.")]);

SCENES.ribbon = a => S("✂️", `${dateStr()} · ${a.region}`, `${a.name} opens`,
    "The project is finished. Local dignitaries want you at the ribbon-cutting.",
    [ch("Go and give a speech", { capital: -2, p: { people: 2 } }, "Good pictures for the papers.", { run: () => { const r = G.regions.find(x => x.n === a.region); if (r) r.mod += 3; } }),
     ch("Send a minister", {}, "")]);

SCENES.nationalization_backlash = () => S("🛢️", `${dateStr()} · Foreign reaction`, "The oil companies strike back",
    "Foreign oil companies denounce the nationalization as theft. Their governments threaten a boycott of your oil and freeze your assets.",
    [ch("Stand firm", { p: { people: 8 }, prestige: 4, growth: -1.5, rel: { uk: -20, usa: -10 } }, "Tankers stop coming for a while.", { run: () => { G.flags.oil_boycott = G.t; } }),
     ch("Offer compensation", { cost: 1, rel: { uk: 5, usa: 8 }, p: { people: -3 } }, "The boycott is called off."),
     ch("Back down: return to 50/50 sharing", { p: { people: -12 }, legitimacy: -6, rel: { uk: 15, usa: 10 } }, "", { run: () => { G.pol.resources = "partnership"; return "Nationalist crowds call you a traitor."; } })]);

SCENES.covert_op = a => {
    const who = nationName(a.who);
    return S("🕵️", `${dateStr()} · Counterintelligence`, `${who}'s agents are active`,
        `Your security service reports that ${who}'s intelligence service is funding opposition newspapers, bribing officers and paying crowds.`,
        [ch("Expel their diplomats", { rel: { [a.who]: -15 }, p: { security: 5, people: 3 } }, "A public expulsion.", { run: () => { G.flags.coup_pressure = Math.max(0, (G.flags.coup_pressure || 0) - 5); } }),
         ch("Quietly mend fences with them", { rel: { [a.who]: 12 }, align: a.who === "usa" ? 10 : -10, p: { people: -2 } }, "The operation winds down."),
         ch("Ignore it", {}, "", { run: () => { applyEffects({ scandal: 6, p: { military: -6 } }); G.flags.coup_pressure = (G.flags.coup_pressure || 0) + 8; return "The money keeps flowing to your enemies."; } })]);
};

// ── Foreign approaches ──────────────────────────────────────────────

SCENES.approach = a => {
    const n = G.nations[a.who];
    if (!n) return S("🌐", "", "", "", [ch("OK", {}, "")]);
    const nm = n.name, k = a.who;
    const tag = `${n.flag} ${dateStr()} · ${nm}`;
    switch (a.kind) {
        case "trade": return S("🚢", tag, `${nm} proposes a trade agreement`, `${n.leader}'s government offers lower tariffs on both sides.`,
            [ch("Sign it", { rel: { [k]: 10 }, growth: 0.2, p: { business: 3, labor: -1 } }, "Trade agreement signed.", { run: () => G.treaties.push({ type: "trade", with: k, t: G.t }) }),
             ch("Decline politely", { rel: { [k]: -3 } }, "")]);
        case "aid_offer": return S("💵", tag, `${nm} offers development aid`, `${nm} offers loans for roads and power stations, with strings attached.`,
            [ch("Accept", { cash: 0.8, rel: { [k]: 10 }, align: n.align > 0 ? 6 : -6, p: { foreign: 6 } }, "Engineers arrive."),
             ch("Refuse the strings", { prestige: 2, rel: { [k]: -5 } }, "")]);
        case "arms": return S("🛩️", tag, `${nm} offers an arms deal`, "Jet fighters and tanks at friendly prices.",
            [ch("Buy", { cost: 0.5, mil: 8, p: { military: 6 }, rel: { [k]: 8 }, align: n.align > 0 ? 4 : -4 }, "The new weapons arrive."),
             ch("Decline", {}, "")]);
        case "visit": return S("🤝", tag, `${n.leader} proposes a state visit`, `${nm}'s leader would like to visit.`,
            [ch("Roll out the red carpet", { capital: -3, rel: { [k]: 12 }, prestige: 1 }, "A successful visit.", { req: capOK(3) }),
             ch("Too busy", { rel: { [k]: -4 } }, "")]);
        case "demand": return S("📜", tag, `${nm} makes demands`, `${nm} demands that you stop broadcasting hostile radio programs and compensate its citizens for seized property.`,
            [ch("Concede", { rel: { [k]: 10 }, prestige: -4, p: { people: -3 } }, "Tension eases."),
             ch("Refuse", { rel: { [k]: -10 }, p: { people: 3 } }, "Relations sour.")]);
        case "threat": return S("⚠️", tag, `${nm} threatens you`, `${nm} is massing troops on the border and demanding concessions.`,
            [ch("Mobilize", { readiness: 10, cost: 0.3, tension: 3, rel: { [k]: -5 }, p: { military: 5 } }, "Your troops move up."),
             ch("Negotiate", { capital: -5, rel: { [k]: 8 } }, "A diplomatic solution.", { req: capOK(5) }),
             ch("Appeal to your superpower patron", { align: G.align >= 0 ? 5 : -5, rel: { [k]: -3 } }, "Your patron issues a warning.")]);
        case "border": return S("🗺️", tag, "Border clash", `Soldiers from ${nm} and your country exchange fire on the frontier.`,
            [ch("Retaliate", { rel: { [k]: -12 }, p: { military: 5, people: 3 }, tension: 2 }, "Artillery answers artillery."),
             ch("Protest and de-escalate", { rel: { [k]: -3 }, p: { military: -3 } }, "Talks begin.")]);
        case "courting": {
            const us = k === "usa";
            return S(us ? "🦅" : "☭", tag, `${nm} courts you`,
                us ? "The American ambassador hints at Marshall-style aid, military assistance and investment if you join the Western camp." : "The Soviet ambassador offers steel mills, cheap loans and arms if you lean toward Moscow.",
                [ch(`Lean toward ${us ? "the West" : "the East"}`, { align: us ? 15 : -15, cash: 1, rel: { [k]: 15, [us ? "russia" : "usa"]: -10 }, p: { foreign: 8 } }, "The aid arrives."),
                 ch("Play both sides", { capital: -4, rel: { [k]: 3 }, prestige: 2 }, "You take a little from each.", { req: capOK(4) }),
                 ch("Refuse: we are non-aligned", { prestige: 3, rel: { [k]: -6 } }, "Your independence is noted in the Third World.")]);
        }
    }
    return S("🌐", tag, nm, "", [ch("OK", {}, "")]);
};

SCENES.colony_demand = a => {
    const n = G.nations[a.key];
    return S("⛓️", `${dateStr()} · Colonial Office`, `${n.name} demands independence`,
        `Nationalists in ${n.name} have won the last elections there and demand a firm date for independence.`,
        [ch("Agree a timetable (about 18 months)", { prestige: 3, p: { press: 4 } }, "", { run: () => { G.flags[`grant_${a.key}`] = nowYM() + 18; return "Negotiations begin."; } }),
         ch("Grant independence now", { prestige: 5, rel: { [a.key]: 25 } }, "", { run: () => { grantIndependence(a.key); return "The flag comes down."; } }),
         ch("Delay: they are not ready", { rel: { [a.key]: -20 }, p: { military: 3 } }, "", { run: () => { G.nations[a.key].indepDate = [G.year + 4, G.month]; G.fired[`demand_${a.key}`] = false; return "Riots break out in the colony."; } }),
         ch("Crush the nationalists", { liberty: -5, prestige: -8, p: { military: 5, press: -8 } }, "", { run: () => { const reb = ensureRebels(a.key, `${n.name} liberation front`, 3); startWar({ name: `${n.name} insurgency`, a: [reb], b: [a.key, G.ck], type: "insurgency", front: 0, commit: { [G.ck]: 2 } }); return "A colonial war begins."; } })]);
};

// ── Colony path scenes ──────────────────────────────────────────────

SCENES.self_government = () => S("🏛️", `${dateStr()} · Constitutional milestone`, "Self-government",
    "The colonial power has agreed to internal self-government. Your ministers now run education, health, welfare, labor, land and public works. Defense, foreign affairs and police remain reserved.",
    [ch("A historic day", { legitimacy: 10, p: { people: 6 } }, "Go to the Policy tab to use your new powers.", { run: () => { G.leader.title = { nigeria: "Leader of Government Business", singapore: "Chief Minister", barbados: "Premier", fiji: "Chief Minister" }[G.ck] || G.leader.title; record(`Won internal self-government, ${dateStr()}.`); } })]);

SCENES.talks_open = () => S("🤝", `${dateStr()} · Independence talks`, "Talks on independence begin",
    "The colonial power has opened formal negotiations on independence. A final conference will be called once the movement's strength and unity are beyond doubt.",
    [ch("Prepare the delegation", { capital: 5 }, "")]);

SCENES.independence_conference = a => S("🎉", `${dateStr()} · ${a && a.won ? "Victory" : "Lancaster House"}`, "Independence",
    a && a.won ? "The colonial army has withdrawn. Independence is yours." : "After weeks of negotiation, the final conference agrees: independence. The last question is the constitution.",
    [ch("Write the constitution", {}, "", { run: () => queueScene("constitution", {}) })]);

SCENES.constitution = () => S("📜", `${dateStr()} · Constituent assembly`, "Choose your system of government",
    "This decision sets the rules you will play by from now on, including how you can lose power.",
    constitutionChoices().map(o => ch(`${GOV_TYPES[o.gov].icon} ${o.name}`, {}, o.desc, { hint: o.desc, run: () => { achieveIndependence(o.gov); return `${ME().name} is independent: ${GOV_TYPES[o.gov].name}.`; } })));

SCENES.arrest = () => S("🚔", `${dateStr()} · Special Branch`, "The police come for you",
    "Detectives arrive at dawn with a warrant for sedition.",
    [ch("Go to prison and become a martyr", { p: { people: 10, foreign: 8 }, colony: { support: 8, militancy: -15 } }, "You are sentenced to detention. The movement grows without you.", { run: () => { G.colony.detained = 26; } }),
     ch("Flee abroad and lead from exile", {}, "", { run: () => fallFromPower("arrested", "You fled into exile. Others now lead the movement.") }),
     ch("Promise moderation", { p: { colonial: 10, people: -8 }, colony: { militancy: -25 } }, "Charges are dropped. Radicals call you a sellout.")]);
