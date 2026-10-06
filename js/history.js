// ── HISTORY — the real timeline, adapting to the sandbox ────────────
//
// Each event has a date, an optional condition on the *current* world,
// and a fire() that changes the world and/or asks the player to decide.
// If its condition fails during its window, history takes another path.

const isP = (...ks) => ks.includes(G.ck);
const ai = k => k !== G.ck && G.nations[k] && G.nations[k].status === "sovereign";
const alive = k => G.nations[k] && ["sovereign", "colony"].includes(G.nations[k].status);
const joinBloc = (b, k) => { if (!G.blocs[b].includes(k)) G.blocs[b].push(k); };
const leaveBloc = (b, k) => { G.blocs[b] = G.blocs[b].filter(x => x !== k); };
const warNamed = n => G.wars.find(w => !w.over && w.name === n);
const inWar = (w, k) => w && (w.a.includes(k) || w.b.includes(k));
const milOf = k => k === G.ck ? G.mil.strength : (G.nations[k] ? G.nations[k].mil : 0);
const hscene = (id, f) => { SCENES["h_" + id] = f; };
const hq = (id, args = {}) => queueScene("h_" + id, args);
const W = (txt) => log(txt, "world");

function histEventsTick() {
    HIST.forEach(e => {
        if (G.fired[e.id]) return;
        const start = ymNum(e.y, e.m), now = nowYM();
        if (now < start) return;
        if (now > start + (e.win || 4)) { G.fired[e.id] = "skipped"; return; }
        let ok = true;
        try { ok = !e.cond || e.cond(); } catch (err) { ok = false; }
        if (!ok) return;
        G.fired[e.id] = true;
        try { e.fire(); } catch (err) { console.error("Event failed", e.id, err); }
    });
    spaceRace();
}

function openingScenes() {
    queueScene("welcome", {});
    if (G.gov.termLimit && G.gov.termsServed >= G.gov.termLimit && G.gov.nextElection && ymNum(...G.gov.nextElection) - nowYM() < 14) queueScene("term_trap", {});
}

// ── Space race ──────────────────────────────────────────────────────

function spaceRace() {
    const sp = G.pol.space;
    if (sp !== "no_space") G.flags.space_months = (G.flags.space_months || 0) + 1;
    const m = G.flags.space_months || 0;
    if (!G.flags.world_satellite && sp !== "no_space" && m >= 24 && G.dev.tech >= 60 && G.year >= 1955) {
        G.flags.world_satellite = G.ck; G.flags.first_satellite = true;
        hq("first_satellite");
    }
    if (!G.flags.world_human && sp === "crewed" && m >= 48 && G.dev.tech >= 70 && G.year >= 1959) {
        G.flags.world_human = G.ck; G.flags.first_human_space = true;
        applyEffects({ prestige: 10 }); log("🚀 Your cosmonaut-astronaut is the first human in space!", "major"); record("First human in space.");
    }
    if (!G.flags.world_moon && sp === "crewed" && m >= 110 && G.dev.tech >= 85 && G.year >= 1965) {
        G.flags.world_moon = G.ck; G.flags.moon = true;
        applyEffects({ prestige: 15, p: { people: 8 } }); log("🌕 Your astronauts walk on the Moon.", "major"); record(`Landed humans on the Moon, ${dateStr()}.`);
        toast("The Moon", "One small step...");
    }
}
hscene("first_satellite", () => S("🛰️", dateStr(), "First satellite in orbit!", `${C().name} has launched the first artificial satellite. Its radio beeps are heard around the world.`, [ch("A triumph of our science", { prestige: 15, tension: 4, p: { people: 6, military: 4 } }, "", { run: () => record(`Launched the world's first satellite, ${dateStr()}.`) })]));

// ── The timeline ────────────────────────────────────────────────────

const HIST = [

// ═══ 1950 ═══
{ id: "sinosoviet", y: 1950, m: 2, cond: () => alive("china") && alive("russia") && G.nations.china.gov === "one_party" && G.nations.russia.gov === "one_party",
  fire: () => {
      if (isP("china")) return hq("sinosoviet_china");
      if (isP("russia")) return hq("sinosoviet_russia");
      joinBloc("sinosov", "china"); joinBloc("sinosov", "russia"); addRel("china", "russia", 25);
      W("🤝 Mao and Stalin sign the Sino-Soviet Treaty of Friendship, Alliance and Mutual Assistance.");
  } },
{ id: "mccarthy", y: 1950, m: 2, fire: () => { G.flags.red_scare = true; if (isP("usa")) hq("mccarthy"); else W("📰 Senator McCarthy claims to have a list of communists in the State Department."); } },
{ id: "apartheid_laws", y: 1950, m: 3, cond: () => isP("southafrica") && G.pol.rights === "segregation", fire: () => hq("apartheid_laws") },
{ id: "kim_request", y: 1950, m: 4, cond: () => isP("russia", "china") && alive("southkorea") && alive("northkorea"), fire: () => hq("kim_request") },
{ id: "nsc68", y: 1950, m: 4, cond: () => isP("usa"), fire: () => hq("nsc68") },
{ id: "schuman", y: 1950, m: 5, cond: () => alive("france") && alive("germany"),
  fire: () => {
      if (isP("france")) return hq("schuman_france");
      if (isP("germany")) return hq("schuman_germany");
      if (isP("uk")) hq("schuman_uk");
      ["france", "germany", "italy"].forEach(k => joinBloc("ecsc", k)); addRel("france", "germany", 25);
      W("🇪🇺 France, West Germany and Italy agree to pool coal and steel (the Schuman Plan).");
  } },
{ id: "korea", y: 1950, m: 6, win: 2, cond: () => alive("northkorea") && G.nations.southkorea.status === "sovereign" && !G.flags.korea_denied,
  fire: () => {
      const sk = milOf("southkorea"), nk = milOf("northkorea");
      const deterred = sk > nk * 1.25 || G.flags.us_sk_pact;
      if (deterred) { G.flags.korea_deferred = true; W("🇰🇵 Stalin withholds approval for Kim Il-sung's invasion plan: the South looks too strong."); if (isP("southkorea")) toast("Deterrence works", "Intelligence reports Kim's invasion plan was shelved because of your army's strength."); return; }
      const w = startWar({ name: "Korean War", a: ["northkorea"], b: ["southkorea"], type: "conquest", front: 35, onEnd: "korea" });
      log("🚨 25 June 1950: North Korean forces invade South Korea. Seoul is under attack.", "major");
      G.tension = clamp(G.tension + 10);
      ["uk", "canada", "australia", "turkey", "philippines", "ethiopia", "newzealand", "france", "southafrica"].forEach(k => {
          if (ai(k) && getRel(k, "usa") > 20) { w.b.push(k); w.commit[k] = 1; }
      });
      if (ai("usa")) { w.b.splice(1, 0, "usa"); w.commit.usa = 2; G.flags.seventh_fleet = true; W("🇺🇸 Truman orders US forces into Korea under a UN Security Council resolution (the Soviets are boycotting)."); }
      if (isP("southkorea")) hq("june25");
      else if (isP("usa")) hq("korea_usa");
      else if (["uk", "canada", "australia", "turkey", "philippines", "ethiopia", "newzealand", "france", "southafrica", "india", "norway", "israel"].includes(G.ck)) hq("un_call");
  } },
{ id: "korea_late", y: 1951, m: 4, win: 18, cond: () => G.flags.korea_deferred && !warNamed("Korean War") && alive("northkorea") && G.nations.southkorea.status === "sovereign" && milOf("southkorea") < milOf("northkorea") * 1.1 && !G.flags.us_sk_pact && chance(0.08),
  fire: () => { G.flags.korea_deferred = false; G.fired.korea = false; const e = HIST.find(x => x.id === "korea"); e.fire(); } },
{ id: "taiwan_invasion", y: 1950, m: 8, win: 10, cond: () => alive("taiwan") && G.nations.china.gov === "one_party" && !G.flags.seventh_fleet && !warNamed("Korean War"),
  fire: () => {
      if (isP("china")) return hq("taiwan_china");
      if (isP("usa")) return hq("taiwan_usa");
      if (chance(0.6)) { startWar({ name: "Battle for Taiwan", a: ["china"], b: ["taiwan"], type: "conquest", front: 10, onEnd: "taiwan" }); log("🚨 The People's Liberation Army launches an invasion of Taiwan.", "major"); }
  } },
{ id: "china_korea", y: 1950, m: 10, win: 14, cond: () => { const w = warNamed("Korean War"); return w && w.front < -25 && !w.a.includes("china") && alive("china") && G.nations.china.align < 0; },
  fire: () => {
      const w = warNamed("Korean War");
      if (isP("china")) return hq("china_korea");
      w.a.push("china"); w.commit.china = 2; w.mom += 4; G.tension = clamp(G.tension + 10);
      log("🚨 Hundreds of thousands of Chinese 'People's Volunteers' cross the Yalu into Korea.", "major");
  } },
{ id: "tibet", y: 1950, m: 10, cond: () => G.nations.china.gov === "one_party",
  fire: () => { if (isP("china")) return hq("tibet_china"); addRel("china", "india", -8); W("🏔️ The People's Liberation Army enters Tibet."); if (isP("india")) hq("tibet_india"); } },
{ id: "venezuela_assn", y: 1950, m: 11, cond: () => isP("venezuela") && G.leader.historical && G.leader.since === 0, fire: () => queueScene("assassination", {}) },
{ id: "aramco", y: 1950, m: 12, cond: () => alive("saudi"),
  fire: () => { if (isP("saudi")) return hq("aramco"); W("🛢️ Saudi Arabia wins a 50/50 profit split from Aramco."); } },
{ id: "nz_council", y: 1950, m: 12, cond: () => isP("newzealand"), fire: () => { log("🏛️ The Legislative Council is abolished. Parliament now has a single chamber.", "policy"); } },

// ═══ 1951 ═══
{ id: "amend22", y: 1951, m: 2, cond: () => G.nations.usa.gov === "presidential",
  fire: () => { if (isP("usa") && G.gov.type === "presidential") { G.gov.termLimit = 2; if (G.leader.since === 0) G.gov.termsServed = Math.min(G.gov.termsServed, 1); log("📜 The 22nd Amendment is ratified: presidents are limited to two terms. As the sitting president, you are grandfathered in for one more run.", "policy"); } } },
{ id: "iran_oil", y: 1951, m: 3, cond: () => alive("iran") && (isP("iran") ? G.pol.resources !== "nationalized" : true),
  fire: () => {
      if (isP("iran")) return hq("iran_oil");
      G.flags.iran_nationalized = true; addRel("iran", "uk", -40); W("🛢️ Iran's Majlis nationalizes the Anglo-Iranian Oil Company. Mossadegh becomes prime minister.");
      if (isP("uk")) hq("abadan");
  } },
{ id: "macarthur", y: 1951, m: 4, cond: () => isP("usa") && inWar(warNamed("Korean War"), "china") && inWar(warNamed("Korean War"), "usa"), fire: () => hq("macarthur") },
{ id: "sanfran", y: 1951, m: 9, cond: () => alive("japan"),
  fire: () => {
      if (isP("japan")) return hq("sanfran_japan");
      G.flags.sf_treaty = true; W("✍️ 48 nations sign the Treaty of San Francisco with Japan. The Soviet Union refuses.");
      if (isP("australia", "newzealand")) hq("anzus"); else { joinBloc("anzus", "usa"); joinBloc("anzus", "australia"); joinBloc("anzus", "newzealand"); }
  } },
{ id: "liaquat", y: 1951, m: 10, cond: () => isP("pakistan"), fire: () => queueScene("assassination", {}) },
{ id: "colegiado", y: 1951, m: 12, cond: () => isP("uruguay") && G.gov.type === "presidential", fire: () => hq("colegiado") },

// ═══ 1952 ═══
{ id: "nato_turkey", y: 1952, m: 2, cond: () => alive("turkey") && !G.blocs.nato.includes("turkey"),
  fire: () => { if (isP("turkey")) return hq("nato_turkey"); if (getRel("turkey", "usa") > 10) { joinBloc("nato", "turkey"); W("🛡️ Turkey and Greece join NATO."); } } },
{ id: "stalin_note", y: 1952, m: 3, cond: () => isP("germany") && G.nations.russia.gov === "one_party", fire: () => hq("stalin_note") },
{ id: "japan_sov", y: 1952, m: 4, cond: () => G.flags.sf_treaty,
  fire: () => {
      if (isP("japan") && G.gov.type === "occupied") { changeGovType("parliamentary"); log("🇯🇵 The occupation ends. Japan is sovereign again.", "major"); record("Restored Japanese sovereignty, April 1952."); applyEffects({ prestige: 10, legitimacy: 10, p: { people: 6 } }); }
      else if (ai("japan") || G.nations.japan.status === "occupied") { G.nations.japan.status = "sovereign"; G.nations.japan.gov = "parliamentary"; }
  } },
{ id: "sk_crisis", y: 1952, m: 5, cond: () => isP("southkorea") && G.gov.type === "presidential", fire: () => hq("sk_crisis") },
{ id: "evita", y: 1952, m: 7, cond: () => isP("argentina"), fire: () => hq("evita") },
{ id: "eritrea", y: 1952, m: 9, cond: () => isP("ethiopia"), fire: () => hq("eritrea") },
{ id: "uk_bomb", y: 1952, m: 10, cond: () => ai("uk") && G.nations.uk.nukes < 2, fire: () => { G.nations.uk.nukes = 2; W("☢️ Britain tests its first atomic bomb off Australia (Operation Hurricane)."); } },
{ id: "ivy_mike", y: 1952, m: 11, cond: () => ai("usa"), fire: () => { G.nations.usa.nukes = 3; G.tension = clamp(G.tension + 6); W("☢️ The United States tests the first hydrogen bomb (Ivy Mike)."); } },

// ═══ 1953 ═══
{ id: "stalin_death", y: 1953, m: 3, cond: () => ai("russia") && !G.nations.russia.diverged,
  fire: () => { G.tension = clamp(G.tension - 8); G.flags.thaw = true; log("🕯️ Joseph Stalin is dead. A collective leadership takes over in Moscow.", "major"); } },
{ id: "soviet_hbomb", y: 1953, m: 8, cond: () => ai("russia"), fire: () => { G.nations.russia.nukes = 3; G.tension = clamp(G.tension + 5); W("☢️ The Soviet Union tests a thermonuclear device."); } },
{ id: "eg_uprising", y: 1953, m: 6, cond: () => alive("eastgermany") && isP("russia"), fire: () => hq("eg_uprising") },
{ id: "korea_armistice", y: 1953, m: 7, win: 12, cond: () => { const w = warNamed("Korean War"); return w && Math.abs(w.front) < 70 && (G.flags.thaw || G.year >= 1954); },
  fire: () => { const w = warNamed("Korean War"); if (inWar(w, G.ck)) return hq("armistice", { id: w.id }); endWar(w, "draw"); log("🕊️ An armistice is signed at Panmunjom. Korea remains divided near the 38th parallel.", "major"); } },
{ id: "ajax", y: 1953, m: 8, win: 12, cond: () => alive("iran") && (isP("iran") ? G.pol.resources === "nationalized" : G.flags.iran_nationalized),
  fire: () => {
      if (isP("iran")) return hq("ajax_iran");
      if (isP("usa", "uk")) return hq("ajax_west");
      if (chance(0.7)) { G.flags.iran_nationalized = false; G.nations.iran.align = 80; addRel("iran", "usa", 30); addRel("iran", "uk", 30); W("🕵️ A CIA- and MI6-backed coup topples Mossadegh in Iran. The Shah returns with full powers."); }
  } },

// ═══ 1954 ═══
{ id: "brown", y: 1954, m: 5, cond: () => isP("usa") && G.pol.rights === "segregation", fire: () => hq("brown") },
{ id: "dienbienphu", y: 1954, m: 3, cond: () => !!warNamed("Indochina War"),
  fire: () => {
      const w = warNamed("Indochina War");
      if (isP("france")) return hq("dbp_france", { id: w.id });
      if (isP("usa")) return hq("vulture", { id: w.id });
      w.mom += 5; W("🇻🇳 The Viet Minh besiege the French fortress at Dien Bien Phu.");
  } },
{ id: "geneva", y: 1954, m: 7, cond: () => !!warNamed("Indochina War") && !isP("france"),
  fire: () => { const w = warNamed("Indochina War"); endWar(w, w.front > 20 ? "a" : "draw"); log("🕊️ The Geneva Accords end the Indochina War. Vietnam is partitioned; Laos and Cambodia are independent.", "major"); } },
{ id: "seato", y: 1954, m: 9, cond: () => alive("usa"),
  fire: () => {
      const members = ["usa", "uk", "france", "australia", "newzealand", "philippines", "pakistan"];
      if (members.includes(G.ck) && G.gov.type !== "colony") hq("seato");
      members.filter(k => k !== G.ck && ai(k)).forEach(k => joinBloc("seato", k));
      W("🌏 SEATO is founded in Manila to contain communism in Southeast Asia.");
  } },
{ id: "algeria", y: 1954, m: 11, cond: () => alive("france") && !G.flags.algeria_over,
  fire: () => {
      const reb = ensureRebels("algeria", "FLN (Algerian nationalists)", 4);
      startWar({ name: "Algerian War", a: [reb], b: ["france"], type: "liberation", front: -20, onEnd: "algeria", commit: isP("france") ? { france: 2 } : {} });
      log("🇩🇿 'Toussaint Rouge': the FLN launches an insurrection in French Algeria.", "major");
      if (isP("france")) hq("algeria");
  } },
{ id: "peron_church", y: 1954, m: 11, cond: () => isP("argentina"), fire: () => hq("peron_church") },

// ═══ 1955 ═══
{ id: "baghdad", y: 1955, m: 2, cond: () => alive("turkey"),
  fire: () => {
      const members = ["turkey", "iraq", "uk", "pakistan", "iran"];
      if (members.includes(G.ck)) hq("baghdad");
      members.filter(k => k !== G.ck && ai(k) && G.nations[k].align > 30).forEach(k => joinBloc("cento", k));
  } },
{ id: "bandung", y: 1955, m: 4, cond: () => alive("indonesia"),
  fire: () => {
      if (isP("indonesia", "india", "china", "pakistan", "turkey", "iran", "ethiopia", "saudi", "philippines", "japan", "cambodia") && G.gov.type !== "colony") hq("bandung");
      G.flags.bandung = true; W("🕊️ 29 Asian and African nations meet at Bandung, Indonesia, and call for an end to colonialism.");
  } },
{ id: "germany_nato", y: 1955, m: 5, cond: () => alive("germany") || G.nations.germany.status === "occupied",
  fire: () => {
      if (isP("germany")) { if (G.gov.type === "occupied") hq("paris_agreements"); return; }
      G.nations.germany.status = "sovereign"; G.nations.germany.gov = "parliamentary"; G.nations.germany.mil = 25; joinBloc("nato", "germany");
      W("🇩🇪 West Germany becomes sovereign and joins NATO. The Bundeswehr is founded.");
  } },
{ id: "warsaw", y: 1955, m: 5, cond: () => G.nations.russia.gov === "one_party",
  fire: () => { if (isP("russia")) return hq("warsaw"); ["russia", "eastgermany", "poland"].forEach(k => joinBloc("warsaw", k)); W("⭐ The Warsaw Pact is founded."); } },
{ id: "montgomery", y: 1955, m: 12, cond: () => isP("usa") && G.pol.rights !== "equal", fire: () => hq("montgomery") },

// ═══ 1956 ═══
{ id: "secret_speech", y: 1956, m: 2, cond: () => G.nations.russia.gov === "one_party",
  fire: () => { if (isP("russia")) return hq("secret_speech"); G.flags.destalinization = true; addRel("china", "russia", -10); W("📜 Khrushchev denounces Stalin's crimes in a 'secret speech' to the Party congress."); } },
{ id: "suez", y: 1956, m: 10, cond: () => alive("egypt") && G.nations.egypt.gov === "military_junta",
  fire: () => {
      if (isP("uk", "france", "israel")) return hq("suez_ally");
      const w = startWar({ name: "Suez Crisis", a: ["israel", "uk", "france"].filter(k => alive(k)), b: ["egypt"], type: "limited", front: 30, onEnd: "suez" });
      G.flags.suez_end = G.t + 8;
      if (isP("usa")) hq("suez_usa");
      else if (isP("russia")) hq("suez_russia");
      log("🚨 Israel, Britain and France attack Egypt after Nasser nationalizes the Suez Canal.", "major");
  } },
{ id: "suez_end", y: 1956, m: 12, win: 6, cond: () => !!warNamed("Suez Crisis") && G.t >= (G.flags.suez_end || 0),
  fire: () => {
      const w = warNamed("Suez Crisis"); endWar(w, "draw");
      ["uk", "france"].forEach(k => { if (k === G.ck) applyEffects({ prestige: -12, p: { people: -6 } }); });
      log("🇪🇬 Under American financial pressure, Britain and France withdraw from Suez. Nasser is the hero of the Arab world.", "major");
  } },
{ id: "hungary", y: 1956, m: 10, cond: () => G.nations.russia.gov === "one_party",
  fire: () => { if (isP("russia")) return hq("hungary"); G.tension = clamp(G.tension + 6); W("🇭🇺 Soviet tanks crush the Hungarian Revolution."); } },

// ═══ 1957 ═══
{ id: "rome", y: 1957, m: 3, cond: () => G.blocs.ecsc.length >= 2,
  fire: () => { G.flags.eec = true; W("🇪🇺 The Treaty of Rome creates the European Economic Community."); if (G.blocs.ecsc.includes(G.ck)) applyEffects({ growth: 0.5, p: { business: 4 } }); else if (isP("uk", "norway", "switzerland")) hq("eec_outside"); } },
{ id: "sputnik", y: 1957, m: 10, cond: () => !G.flags.world_satellite && ai("russia"),
  fire: () => { G.flags.world_satellite = "russia"; G.nations.russia.tech += 5; G.tension = clamp(G.tension + 5); log("🛰️ The Soviet Union launches Sputnik, the first artificial satellite.", "major"); if (isP("usa")) hq("sputnik_usa"); } },
{ id: "little_rock", y: 1957, m: 9, cond: () => isP("usa") && G.pol.rights !== "segregation" && !G.flags.little_rock, fire: () => hq("little_rock") },

// ═══ 1958–1959 ═══
{ id: "glf", y: 1958, m: 5, cond: () => G.nations.china.gov === "one_party",
  fire: () => { if (isP("china")) return hq("glf"); G.nations.china.growth = -2; G.nations.china.stab -= 15; G.flags.glf = true; W("🇨🇳 Mao launches the Great Leap Forward."); } },
{ id: "glf_famine", y: 1959, m: 6, cond: () => G.flags.glf,
  fire: () => { if (isP("china") && G.pol.economy === "collectivized") return hq("famine"); if (ai("china")) { G.nations.china.growth = 5; W("🇨🇳 Famine follows the Great Leap Forward. Tens of millions die."); } } },
{ id: "algiers58", y: 1958, m: 5, cond: () => isP("france") && G.gov.type === "parliamentary" && !!warNamed("Algerian War"), fire: () => hq("algiers58") },
{ id: "iraq_rev", y: 1958, m: 7, cond: () => ai("iraq"), fire: () => { leaveBloc("cento", "iraq"); } },
{ id: "pakistan58", y: 1958, m: 10, cond: () => isP("pakistan") && G.pillars.military && G.pillars.military.l < 60, fire: () => queueScene("coup_rumors", {}) },
{ id: "cuba_rev", y: 1959, m: 1, cond: () => alive("cuba"), fire: () => { log("🇨🇺 Fidel Castro's guerrillas take Havana. Batista flees.", "major"); if (isP("usa")) hq("cuba_usa"); else addRel("cuba", "usa", -40); } },
{ id: "tibet59", y: 1959, m: 3, cond: () => alive("china"),
  fire: () => { if (isP("india")) return hq("dalai_lama"); addRel("china", "india", -15); W("🏔️ An uprising in Lhasa is crushed. The Dalai Lama flees to India."); } },
{ id: "guided_dem", y: 1959, m: 7, cond: () => alive("indonesia"),
  fire: () => { if (isP("indonesia")) { if (G.gov.type === "semi_presidential") hq("guided_dem"); return; } G.nations.indonesia.gov = "dominant_party"; W("🇮🇩 Sukarno decrees 'Guided Democracy'."); } },

// ═══ 1960–1961 ═══
{ id: "vietcong", y: 1960, m: 1, cond: () => G.nations.southvietnam && G.nations.southvietnam.status === "sovereign" && alive("vietnam") && !warNamed("Vietnam War"),
  fire: () => { startWar({ name: "Vietnam War", a: ["vietnam"], b: ["southvietnam"], type: "conquest", front: -20, onEnd: "vietnam" }); W("🇻🇳 Communist insurgents (the Viet Cong) open war against the Saigon government."); } },
{ id: "sharpeville", y: 1960, m: 3, cond: () => alive("southafrica") && (isP("southafrica") ? G.pol.rights === "segregation" : true),
  fire: () => { if (isP("southafrica")) return hq("sharpeville"); W("🇿🇦 Police kill 69 protesters at Sharpeville. South Africa declares a state of emergency."); } },
{ id: "u2", y: 1960, m: 5, cond: () => isP("usa", "russia"), fire: () => hq("u2") },
{ id: "turkey60", y: 1960, m: 5, cond: () => isP("turkey") && G.pillars.military && G.pillars.military.l < 60, fire: () => queueScene("coup_rumors", {}) },
{ id: "sinosplit", y: 1960, m: 7, cond: () => G.blocs.sinosov.length >= 2,
  fire: () => { if (isP("china", "russia")) return hq("sinosplit"); G.blocs.sinosov = []; addRel("china", "russia", -40); W("💔 The Sino-Soviet split: Moscow withdraws its advisers from China."); } },
{ id: "opec", y: 1960, m: 9, cond: () => alive("saudi") || alive("venezuela"),
  fire: () => {
      if (isP("saudi", "iran", "venezuela") || (C().res.includes("oil") && isP("indonesia", "nigeria", "uae"))) hq("opec");
      ["saudi", "iran", "venezuela", "iraq"].filter(k => k !== G.ck && ai(k)).forEach(k => joinBloc("opec", k));
      G.oilPrice *= 1.05; W("🛢️ Oil exporters found OPEC in Baghdad.");
  } },
{ id: "nigeria_oil_year", y: 1960, m: 10, cond: () => false, fire: () => {} },
{ id: "bay_pigs", y: 1961, m: 4, cond: () => isP("usa") && G.nations.cuba.align < -40 && alive("cuba"), fire: () => hq("bay_pigs") },
{ id: "sa_republic", y: 1961, m: 5, cond: () => isP("southafrica") && !G.flags.republic, fire: () => hq("sa_republic") },
{ id: "berlin_wall", y: 1961, m: 8, cond: () => alive("eastgermany") && !G.flags.reunified,
  fire: () => { if (isP("russia")) return hq("wall_russia"); G.tension = clamp(G.tension + 6); log("🧱 East Germany seals the border in Berlin with barbed wire, then a wall.", "major"); if (isP("germany")) hq("wall_germany"); } },
{ id: "nam", y: 1961, m: 9, cond: () => true,
  fire: () => {
      ["india", "indonesia", "egypt", "yugoslavia", "ethiopia", "cambodia", "iraq", "saudi", "cuba", "nigeria"].forEach(k => { if (k !== G.ck && ai(k) && Math.abs(G.nations[k].align) < 70) joinBloc("nam", k); });
      W("🕊️ The Non-Aligned Movement is founded in Belgrade.");
      if (G.gov.type !== "colony" && Math.abs(G.align) < 50 && !G.blocs.nam.includes(G.ck)) hq("nam");
  } },
{ id: "goa", y: 1961, m: 12, cond: () => isP("india"), fire: () => hq("goa") },

// ═══ 1962–1964 ═══
{ id: "anadyr", y: 1962, m: 5, cond: () => isP("russia") && G.nations.cuba.align < -40, fire: () => hq("anadyr") },
{ id: "missiles", y: 1962, m: 10, cond: () => G.nations.cuba.align < -40 && (isP("russia") ? G.flags.missiles_in_cuba : true),
  fire: () => {
      G.tension = clamp(G.tension + 18);
      if (isP("usa")) return hq("missiles_usa");
      if (isP("russia")) return hq("missiles_russia");
      log("☢️ Cuban Missile Crisis: the world comes within hours of nuclear war. Khrushchev withdraws the missiles.", "major");
      G.tension = clamp(G.tension - 10);
  } },
{ id: "sino_indian", y: 1962, m: 10, cond: () => alive("india") && alive("china") && getRel("china", "india") < -5,
  fire: () => {
      if (isP("india")) hq("sino_indian_india");
      const w = startWar({ name: "Sino-Indian War", a: ["china"], b: ["india"], type: "limited", front: 25 });
      if (w) { G.flags.sino_indian_end = G.t + 5; log("🏔️ China attacks across the Himalayan border with India.", "major"); }
  } },
{ id: "sino_indian_end", y: 1962, m: 11, win: 3, cond: () => warNamed("Sino-Indian War") && G.t >= (G.flags.sino_indian_end || 0),
  fire: () => { endWar(warNamed("Sino-Indian War"), "a"); W("🏔️ China declares a unilateral ceasefire and withdraws from most captured territory."); } },
{ id: "eritrea_annex", y: 1962, m: 11, cond: () => alive("ethiopia") && (isP("ethiopia") ? G.flags.eritrea_plan : true),
  fire: () => {
      G.flags.eritrea = true;
      const reb = ensureRebels("ethiopia", "Eritrean Liberation Front", 2);
      startWar({ name: "Eritrean War of Independence", a: [reb], b: ["ethiopia"], type: "insurgency", front: -20 });
      if (isP("ethiopia")) log("🇪🇷 You dissolve the Eritrean federation and annex Eritrea. An insurgency begins.", "major");
  } },
{ id: "ptbt", y: 1963, m: 8, cond: () => G.mil.nukes >= 2 || (G.mil.prog > 0 && G.pol.nuclear !== "no_nukes"), fire: () => hq("ptbt") },
{ id: "malaysia", y: 1963, m: 9, cond: () => isP("singapore") && G.gov.type === "colony", fire: () => hq("malaysia") },
{ id: "konfrontasi", y: 1963, m: 9, cond: () => isP("indonesia"), fire: () => hq("konfrontasi") },
{ id: "jfk", y: 1963, m: 11, cond: () => ai("usa") && !G.nations.usa.diverged, fire: () => log("🕯️ President Kennedy is assassinated in Dallas.", "major") },
{ id: "civil_rights_act", y: 1964, m: 6, cond: () => isP("usa") && G.pol.rights !== "equal", fire: () => hq("civil_rights_act") },
{ id: "tonkin", y: 1964, m: 8, cond: () => !!warNamed("Vietnam War"),
  fire: () => {
      const w = warNamed("Vietnam War");
      if (isP("usa")) return hq("tonkin");
      if (ai("usa")) { w.b.push("usa"); w.commit.usa = 2; }
      ["australia", "southkorea", "philippines", "newzealand"].forEach(k => { if (ai(k)) { w.b.push(k); w.commit[k] = 1; } });
      if (isP("australia", "southkorea", "philippines", "newzealand")) hq("vietnam_ally", { id: w.id });
      W("🇺🇸 After the Gulf of Tonkin incident, the US escalates in Vietnam.");
  } },
{ id: "china_bomb", y: 1964, m: 10, cond: () => ai("china") && G.nations.china.nukes < 2, fire: () => { G.nations.china.nukes = 2; G.tension = clamp(G.tension + 5); W("☢️ China tests an atomic bomb at Lop Nur."); } },

// ═══ 1965–1969 ═══
{ id: "indopak65", y: 1965, m: 8, cond: () => alive("india") && alive("pakistan") && getRel("india", "pakistan") < -35,
  fire: () => {
      if (isP("pakistan")) return hq("gibraltar");
      const w = startWar({ name: "Indo-Pakistani War of 1965", a: ["pakistan"], b: ["india"], type: "limited", front: 0, onEnd: "kashmir" });
      if (w) { G.flags.indopak_end = G.t + 7; if (isP("india")) hq("indopak_india"); W("⚔️ War between India and Pakistan over Kashmir."); }
  } },
{ id: "indopak65_end", y: 1965, m: 10, win: 4, cond: () => warNamed("Indo-Pakistani War of 1965") && G.t >= (G.flags.indopak_end || 0), fire: () => { endWar(warNamed("Indo-Pakistani War of 1965"), "draw"); W("🕊️ A UN ceasefire ends the Indo-Pakistani war (Tashkent Declaration)."); } },
{ id: "g30s", y: 1965, m: 9, cond: () => alive("indonesia"),
  fire: () => { if (isP("indonesia")) return hq("g30s"); G.nations.indonesia.align = 60; W("🇮🇩 After a failed coup attempt, the Indonesian army destroys the Communist Party. Hundreds of thousands are killed."); } },
{ id: "singapore_out", y: 1965, m: 8, cond: () => isP("singapore") && G.flags.malaysia, fire: () => hq("separation") },
{ id: "cultural_rev", y: 1966, m: 5, cond: () => G.nations.china.gov === "one_party",
  fire: () => { if (isP("china")) return hq("cultural_rev"); G.nations.china.stab -= 20; G.nations.china.growth = 2; W("🇨🇳 Mao launches the Cultural Revolution."); } },
{ id: "france_nato", y: 1966, m: 3, cond: () => G.blocs.nato.includes("france") && G.nations.france.gov === "semi_presidential",
  fire: () => { if (isP("france")) return hq("france_nato"); W("🇫🇷 De Gaulle withdraws France from NATO's integrated military command."); } },
{ id: "six_day", y: 1967, m: 6, cond: () => alive("israel") && alive("egypt") && getRel("israel", "egypt") < 0 && !G.flags.israel_egypt_peace,
  fire: () => {
      if (isP("israel")) return hq("six_day");
      const w = startWar({ name: "Six-Day War", a: ["israel"], b: ["egypt"], type: "limited", front: 40 });
      if (w) { w.mom = 15; G.flags.six_day_end = G.t + 2; log("⚔️ The Six-Day War: Israel strikes Egypt, Jordan and Syria.", "major"); }
  } },
{ id: "six_day_end", y: 1967, m: 6, win: 2, cond: () => warNamed("Six-Day War") && G.t >= (G.flags.six_day_end || 0),
  fire: () => { const w = warNamed("Six-Day War"); endWar(w, w.front > 0 ? "a" : "b"); G.flags.occupied_territories = true; } },
{ id: "biafra", y: 1967, m: 7, cond: () => alive("nigeria") && G.nations.nigeria.status === "sovereign" && (isP("nigeria") ? true : !G.nations.nigeria.diverged),
  fire: () => {
      if (isP("nigeria")) { if (G.gov.type === "colony") return; const east = G.regions.find(r => r.n.startsWith("Eastern")); if (!east) return; if ( regionSupport(east) > 55 && G.flags.civil_war_averted !== false && chance(0.6)) { log("🇳🇬 Ethnic tension eases. The East stays in the federation.", "good"); return; } return hq("biafra"); }
      const reb = ensureRebels("nigeria", "Republic of Biafra", 5);
      startWar({ name: "Nigerian Civil War", a: [reb], b: ["nigeria"], type: "insurgency", front: -10, onEnd: "biafra" });
      W("🇳🇬 The Eastern Region secedes as Biafra. Civil war begins.");
  } },
{ id: "tet", y: 1968, m: 1, cond: () => isP("usa") && inWar(warNamed("Vietnam War"), "usa"), fire: () => hq("tet") },
{ id: "prague", y: 1968, m: 8, cond: () => G.nations.russia.gov === "one_party",
  fire: () => { if (isP("russia")) return hq("prague"); W("🇨🇿 Warsaw Pact armies invade Czechoslovakia to end the Prague Spring."); } },
{ id: "may68", y: 1968, m: 5, cond: () => isP("france"), fire: () => hq("may68") },
{ id: "tlatelolco", y: 1968, m: 10, cond: () => isP("mexico") && !GT().democracy, fire: () => hq("tlatelolco") },
{ id: "npt", y: 1968, m: 7, cond: () => G.mil.nukes < 2 && G.pol.nuclear !== "no_nukes", fire: () => hq("npt") },
{ id: "moon", y: 1969, m: 7, cond: () => !G.flags.world_moon && ai("usa"), fire: () => { G.flags.world_moon = "usa"; log("🌕 Apollo 11: American astronauts walk on the Moon.", "major"); } },
{ id: "zhenbao", y: 1969, m: 3, cond: () => getRel("china", "russia") < -10, fire: () => { G.tension = clamp(G.tension + 8); addRel("china", "russia", -10); log("⚔️ Soviet and Chinese troops clash on the Ussuri River.", "major"); } },

// ═══ 1970s ═══
{ id: "khmer_rouge", y: 1968, m: 1, cond: () => alive("cambodia") && G.nations.cambodia.status === "sovereign" && (isP("cambodia") ? G.s.stability < 55 : true),
  fire: () => { const reb = ensureRebels("cambodia", "Khmer Rouge", isP("cambodia") ? 2 : 3); startWar({ name: "Cambodian Civil War", a: [reb], b: ["cambodia"], type: "insurgency", front: isP("cambodia") ? -30 : 0 }); W("🇰🇭 The Khmer Rouge begin an armed insurgency in Cambodia."); } },
{ id: "bangladesh", y: 1971, m: 3, cond: () => alive("pakistan") && !G.flags.bangladesh,
  fire: () => {
      if (isP("pakistan")) return G.regions.some(r => r.n.includes("Bengal")) ? hq("bangladesh") : undefined;
      const reb = ensureRebels("pakistan", "Mukti Bahini (Bangladesh)", 4);
      const w = startWar({ name: "Bangladesh Liberation War", a: [reb, "india"], b: ["pakistan"], type: "insurgency", front: 20, onEnd: "bangladesh" });
      if (w) w.mom = 6;
      if (isP("india")) hq("bangladesh_india");
      W("🇧🇩 The Pakistani army cracks down in East Pakistan. Bengalis declare independence as Bangladesh.");
  } },
{ id: "nixon_shock", y: 1971, m: 8, cond: () => true, fire: () => { if (isP("usa")) hq("nixon_shock"); else W("💵 Nixon ends the dollar's convertibility into gold. The Bretton Woods system collapses."); } },
{ id: "nixon_china", y: 1972, m: 2, cond: () => alive("china") && getRel("china", "russia") < 0,
  fire: () => { if (isP("usa", "china")) return hq("rapprochement"); addRel("usa", "china", 30); G.tension = clamp(G.tension - 6); W("🤝 Nixon visits Mao in Beijing."); } },
{ id: "salt", y: 1972, m: 5, cond: () => true, fire: () => { if (isP("usa", "russia")) return hq("salt"); G.tension = clamp(G.tension - 8); W("✍️ The US and USSR sign the SALT I arms limitation treaty."); } },
{ id: "uk_eec", y: 1973, m: 1, cond: () => alive("uk") && G.flags.eec,
  fire: () => { if (isP("uk")) { if (!G.blocs.ecsc.includes("uk")) hq("eec_outside"); return; } joinBloc("ecsc", "uk"); W("🇪🇺 Britain joins the European Community."); } },
{ id: "yom_kippur", y: 1973, m: 10, cond: () => alive("israel") && alive("egypt") && !G.flags.israel_egypt_peace,
  fire: () => {
      if (isP("israel")) hq("yom_kippur");
      const w = startWar({ name: "Yom Kippur War", a: ["egypt"], b: ["israel"], type: "limited", front: 25 });
      if (w) { w.mom = -8; G.flags.yk_end = G.t + 4; }
      if (isP("saudi")) return hq("embargo");
      if (ai("saudi") && !G.flags.no_embargo) { G.oilPrice *= 3.5; G.flags.embargo = true; G.tension = clamp(G.tension + 8); log("🛢️ Arab oil producers declare an embargo. Oil prices quadruple.", "major"); }
  } },
{ id: "yk_end", y: 1973, m: 11, win: 3, cond: () => warNamed("Yom Kippur War") && G.t >= (G.flags.yk_end || 0), fire: () => endWar(warNamed("Yom Kippur War"), "draw") },
{ id: "wollo", y: 1973, m: 9, cond: () => isP("ethiopia") && G.gov.type === "monarchy", fire: () => hq("wollo") },
{ id: "cyprus", y: 1974, m: 7, cond: () => isP("turkey"), fire: () => hq("cyprus") },
{ id: "india_bomb", y: 1974, m: 5, cond: () => ai("india") && G.nations.india.nukes < 2, fire: () => { G.nations.india.nukes = 2; W("☢️ India tests a 'peaceful nuclear explosive' (Smiling Buddha)."); } },
{ id: "saigon", y: 1975, m: 4, cond: () => !!warNamed("Vietnam War") && !inWar(warNamed("Vietnam War"), G.ck),
  fire: () => { const w = warNamed("Vietnam War"); w.front = 100; endWar(w, "a"); log("🇻🇳 Saigon falls. Vietnam is reunified under communist rule.", "major"); } },
{ id: "mao_death", y: 1976, m: 9, cond: () => ai("china") && !G.nations.china.diverged, fire: () => log("🕯️ Mao Zedong is dead.", "major") },
{ id: "soweto", y: 1976, m: 6, cond: () => isP("southafrica") && G.pol.rights === "segregation", fire: () => hq("soweto") },
{ id: "camp_david", y: 1978, m: 9, cond: () => isP("israel") && alive("egypt") && !G.flags.israel_egypt_peace, fire: () => hq("camp_david") },
{ id: "deng", y: 1978, m: 12, cond: () => G.nations.china.gov === "one_party",
  fire: () => { if (isP("china")) return hq("deng"); G.nations.china.growth = 9.5; G.nations.china.align = -20; W("🇨🇳 Deng Xiaoping launches 'reform and opening up'."); } },
{ id: "iran79", y: 1978, m: 9, cond: () => alive("iran") && G.nations.iran.gov === "monarchy",
  fire: () => {
      if (isP("iran")) { applyEffects({ p: { clergy: -12, people: -8 }, stability: -8 }); if (approval() < 45 || G.pillars.clergy.l < 40) queueScene("uprising", {}); else log("🕌 Cassette sermons from an exiled ayatollah circulate in the bazaars.", "warn"); return; }
      G.oilPrice *= 1.8; addRel("iran", "usa", -60); G.nations.iran.align = -10;
      log("🕌 The Iranian Revolution: the Shah flees and Ayatollah Khomeini returns.", "major");
  } },
{ id: "afghanistan", y: 1979, m: 12, cond: () => G.nations.russia.gov === "one_party",
  fire: () => {
      if (isP("russia")) return hq("afghan_russia");
      G.tension = clamp(G.tension + 10); W("🇦🇫 The Soviet Union invades Afghanistan.");
      if (isP("pakistan", "usa")) hq("mujahideen");
  } },

// ═══ 1980s–1991 ═══
{ id: "iran_iraq", y: 1980, m: 9, cond: () => alive("iran") && alive("iraq") && getRel("iran", "iraq") < 0,
  fire: () => { const w = startWar({ name: "Iran–Iraq War", a: ["iraq"], b: ["iran"], type: "limited", front: 15 }); if (w) log("⚔️ Iraq invades Iran.", "major"); if (isP("iran")) queueScene("invaded", { id: w.id }); } },
{ id: "falklands", y: 1982, m: 4, cond: () => alive("argentina") && alive("uk") && G.nations.argentina.gov === "military_junta" || (isP("argentina") && G.gov.type === "military_junta"),
  fire: () => {
      if (isP("argentina")) return hq("falklands_arg");
      const w = startWar({ name: "Falklands War", a: ["argentina"], b: ["uk"], type: "limited", front: 40, onEnd: "falklands" });
      if (w) { w.mom = -10; log("🇦🇷 Argentina seizes the Falkland Islands.", "major"); if (isP("uk")) hq("falklands_uk", { id: w.id }); }
  } },
{ id: "able_archer", y: 1983, m: 11, cond: () => true, fire: () => { G.tension = clamp(G.tension + 12); if (isP("usa", "russia")) hq("able_archer"); else W("☢️ A NATO exercise (Able Archer 83) nearly convinces Moscow a nuclear strike is coming."); } },
{ id: "gorbachev", y: 1985, m: 3, cond: () => G.nations.russia.gov === "one_party",
  fire: () => { if (isP("russia")) return hq("perestroika"); G.tension = clamp(G.tension - 12); W("🇷🇺 Mikhail Gorbachev launches glasnost and perestroika."); } },
{ id: "chernobyl", y: 1986, m: 4, cond: () => isP("russia"), fire: () => hq("chernobyl") },
{ id: "people_power", y: 1986, m: 2, cond: () => isP("philippines") && !GT().democracy && approval() < 50, fire: () => queueScene("uprising", {}) },
{ id: "fiji87", y: 1987, m: 5, cond: () => isP("fiji") && G.pillars.military && G.pillars.military.l < 60, fire: () => queueScene("coup_rumors", {}) },
{ id: "sk_june", y: 1987, m: 6, cond: () => isP("southkorea") && !GT().democracy, fire: () => hq("june_struggle") },
{ id: "tiananmen", y: 1989, m: 5, cond: () => G.nations.china.gov === "one_party",
  fire: () => { if (isP("china")) return hq("tiananmen"); addRel("china", "usa", -15); W("🇨🇳 The army crushes the democracy movement in Tiananmen Square."); } },
{ id: "wall_falls", y: 1989, m: 11, cond: () => alive("eastgermany") && G.nations.russia.gov === "one_party",
  fire: () => { G.tension = clamp(G.tension - 15); log("🧱 The Berlin Wall falls.", "major"); if (isP("germany")) hq("reunification"); else if (isP("russia")) hq("wall_falls_russia"); } },
{ id: "reunify_ai", y: 1990, m: 10, cond: () => alive("eastgermany") && !isP("germany") && !isP("russia"),
  fire: () => { G.nations.eastgermany.status = "annexed"; G.nations.germany.gdp += G.nations.eastgermany.gdp; G.nations.germany.pop += 16; G.nations.germany.name = "Germany"; log("🇩🇪 Germany is reunified.", "major"); } },
{ id: "mandela", y: 1990, m: 2, cond: () => isP("southafrica") && G.pol.rights === "segregation", fire: () => hq("mandela") },
{ id: "gulf", y: 1990, m: 8, cond: () => alive("iraq") && G.nations.iraq.gov !== "presidential",
  fire: () => {
      if (isP("usa", "uk", "france", "saudi", "egypt")) return hq("gulf");
      const w = startWar({ name: "Gulf War", a: ["usa", "uk", "france", "saudi"].filter(alive), b: ["iraq"], type: "limited", front: 20 });
      if (w) { w.mom = 15; W("⚔️ A US-led coalition goes to war to expel Iraq from Kuwait."); }
  } },
{ id: "ussr_end", y: 1991, m: 12, cond: () => ai("russia") && G.nations.russia.gov === "one_party" && !G.nations.russia.diverged,
  fire: () => { const r = G.nations.russia; r.name = "Russia"; r.gov = "presidential"; r.leader = "Boris Yeltsin"; r.align = 30; r.gdp *= 0.5; r.pop *= 0.51; r.mil *= 0.55; r.growth = 1; leaveBloc("warsaw", "russia"); G.tension = clamp(G.tension - 30); log("🏳️ The Soviet Union is dissolved. Russia emerges under Boris Yeltsin.", "major"); } }
];
