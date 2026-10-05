// ── CHARACTER — backstory, traits, skills and portrait ──────────────
//
// You always start as head of government. Your backstory decides who
// already trusts you and who already hates you: it shifts pillar
// loyalties, party-faction loyalties and your opening approval.

const BACKGROUNDS = {
    senator:    { name: "Former senator", icon: "🏛️", desc: "Twenty years in the legislature. You know where the bodies are buried and whose vote can be had for a bridge.",
                  p: { party: 12, coalition: 8, people: -2, press: 3 }, fac: { gov: 10, opp: 5 }, approval: -2, skills: { legislation: 2 },
                  allies: "Your party's veterans and old colleagues across the aisle", enemies: "Outsiders who see you as the establishment" },
    war_hero:   { name: "War hero", icon: "🎖️", desc: "You led men in the war and the country knows your face. Officers salute you a little straighter.",
                  p: { military: 15, people: 8, party: -4, press: 0 }, fac: { gov: -3 }, approval: 6, skills: { military: 2 }, coupRisk: -10,
                  allies: "The armed forces and veterans", enemies: "Career politicians who resent a newcomer" },
    loyalist:   { name: "Party loyalist", icon: "🎗️", desc: "You rose through the party machine one committee at a time. The apparatus is yours; the public barely knows you.",
                  p: { party: 15, politburo: 12, cadres: 12, people: -4, press: -6 }, fac: { gov: 14 }, approval: -4, skills: { intrigue: 1, legislation: 1 },
                  allies: "The party machine and its bosses", enemies: "Reformers, journalists and the opposition" },
    lawyer:     { name: "Lawyer & reformer", icon: "⚖️", desc: "You made your name in the courtroom defending the powerless or the powerful, and you speak the language of law.",
                  p: { press: 10, business: 5, people: 2, security: -5 }, fac: { gov: 3 }, approval: 2, skills: { legislation: 1, oratory: 1 },
                  allies: "The press and the professional classes", enemies: "The security services, who distrust lawyers" },
    union:      { name: "Union leader", icon: "⚒️", desc: "You organized the docks, the mines or the mills. Workers trust you. Employers fear you.",
                  p: { labor: 18, business: -12, people: 4, peasants: 4 }, fac: { gov: 2 }, approval: 3, skills: { oratory: 2 },
                  allies: "The unions and working families", enemies: "Business, finance and the employers' federations" },
    business:   { name: "Business tycoon", icon: "💼", desc: "You built a fortune before entering politics. You understand balance sheets and you know every banker by name.",
                  p: { business: 18, labor: -10, press: -3 }, fac: { gov: 2 }, approval: -1, skills: { economics: 2 }, scandal: 8,
                  allies: "Industry, banks and chambers of commerce", enemies: "Unions and anyone who resents money in politics" },
    aristocrat: { name: "Aristocrat", icon: "👑", desc: "Your family has held land and titles for generations. Doors open; commoners grumble.",
                  p: { royals: 15, tribes: 12, clergy: 6, people: -6, labor: -6 }, fac: { gov: 4 }, approval: -3, skills: { diplomacy: 1 },
                  allies: "The old families, nobles and chiefs", enemies: "Workers, peasants and radicals" },
    revolutionary: { name: "Revolutionary", icon: "✊", desc: "You fought colonialism or tyranny from prison cells and safe houses. Your legend is your power.",
                  p: { people: 10, security: 5, business: -10, foreign: -10, colonial: -15 }, fac: { gov: 6 }, approval: 6, legitimacy: 10, skills: { intrigue: 1, oratory: 1 },
                  allies: "The masses and your old comrades", enemies: "Business, foreign powers and colonial officials" },
    technocrat: { name: "Economist / technocrat", icon: "📊", desc: "You ran a central bank, a planning board or a ministry. You trust numbers more than crowds.",
                  p: { business: 8, press: 5, people: -3, party: -3 }, fac: { gov: -2 }, approval: -3, skills: { economics: 3 },
                  allies: "Experts, planners and investors", enemies: "Party hacks who see you as a cold fish" },
    journalist: { name: "Journalist & publisher", icon: "📰", desc: "Your newspaper made you famous. You know how to tell a story, and how to destroy someone with one.",
                  p: { press: 18, security: -8, people: 3 }, fac: { opp: -4 }, approval: 2, skills: { oratory: 2 },
                  allies: "Writers, editors and the reading public", enemies: "The security services and politicians you once exposed" },
    cleric:     { name: "Religious leader", icon: "📿", desc: "You were a minister, imam or monk before you were a politician. The faithful follow you; the secular fear you.",
                  p: { clergy: 20, press: -10, people: 3 }, fac: { gov: 2 }, approval: 2, legitimacy: 5, skills: { oratory: 1 },
                  allies: "The religious establishment and the devout", enemies: "Secular intellectuals and the left" },
    diplomat:   { name: "Career diplomat", icon: "🌐", desc: "You represented your country abroad for decades. Foreign capitals know you; your own voters, less so.",
                  p: { foreign: 12, occupation: 12, colonial: 8, people: -3 }, fac: {}, approval: -1, prestige: 5, skills: { diplomacy: 3 },
                  allies: "Foreign governments and the foreign ministry", enemies: "Nationalists who think you are too cozy with foreigners" },
    general:    { name: "Career general", icon: "⚔️", desc: "You commanded armies and ran garrisons. Politics is just another campaign.",
                  p: { military: 20, press: -8, labor: -4 }, fac: { gov: 2 }, approval: 0, skills: { military: 3 }, coupRisk: -15,
                  allies: "The officer corps", enemies: "Civilians who fear a man on horseback" }
};

const TRAITS = {
    charismatic: { name: "Charismatic", icon: "✨", desc: "+2 political capital a month, speeches work better.", capital: 0.5, oratory: 1, p: { people: 4 } },
    cunning:     { name: "Cunning", icon: "🦊", desc: "You smell plots early, and your covert operations succeed more often.", intrigue: 2 },
    honest:      { name: "Honest", icon: "🕊️", desc: "Scandals stick less and corruption falls, but the cronies are unhappy.", scandalMult: 0.5, corruption: -8, p: { royals: -5, tribes: -4, business: -2 } },
    corrupt:     { name: "Greedy", icon: "💰", desc: "Patronage is cheaper and you will retire rich. Scandal builds up faster.", scandalMult: 1.6, corruption: 8, p: { royals: 4, tribes: 4 } },
    ruthless:    { name: "Ruthless", icon: "🗡️", desc: "Purges and crackdowns cost less capital and frighten rivals into line.", ruthless: true, p: { security: 6, press: -4 } },
    idealist:    { name: "Idealist", icon: "🌅", desc: "Acting on your ideology pleases your party twice as much, and betraying it hurts twice as much.", idealist: true },
    pragmatist:  { name: "Pragmatist", icon: "🧭", desc: "Halves the penalty for policies outside your ideology.", pragmatist: true },
    workaholic:  { name: "Workaholic", icon: "⏱️", desc: "+3 political capital a month, but your health suffers.", capital: 0.7, health: -0.03 },
    hardy:       { name: "Iron constitution", icon: "💪", desc: "Healthier than your years. Less likely to die in office.", health: 0.03 },
    paranoid:    { name: "Paranoid", icon: "👁️", desc: "Coups and purges against you are harder, but allies feel watched.", coupRisk: -12, p: { party: -4, politburo: -3, military: -2 } },
    intellectual:{ name: "Intellectual", icon: "📚", desc: "Science and education grow faster; the press respects you.", tech: 0.3, p: { press: 5 } },
    populist:    { name: "Populist", icon: "📣", desc: "The crowds love you; the elites don't trust you.", p: { people: 6, business: -5, press: -3 } }
};

const SKILLS = {
    oratory:     { name: "Oratory", icon: "🎤", desc: "Speeches, campaigns and crisis broadcasts." },
    legislation: { name: "Legislation", icon: "📜", desc: "Whipping votes and cutting deals in the legislature." },
    economics:   { name: "Economics", icon: "📈", desc: "Small boost to growth; fewer budget surprises." },
    diplomacy:   { name: "Diplomacy", icon: "🤝", desc: "Better results from summits, treaties and envoys." },
    military:    { name: "Military", icon: "🎖️", desc: "Better war results and military loyalty." },
    intrigue:    { name: "Intrigue", icon: "🕵️", desc: "Detecting plots, covert action and purges." }
};
const SKILL_POINTS = 10;

// What the real 1950 leader brings, if you keep them.
const HIST_CHAR = {
    usa: { bg: "senator", traits: ["honest", "pragmatist"], skills: { oratory: 1, legislation: 3, economics: 1, diplomacy: 2, military: 2, intrigue: 1 } },
    china: { bg: "revolutionary", traits: ["ruthless", "charismatic"], skills: { oratory: 3, legislation: 0, economics: 0, diplomacy: 1, military: 3, intrigue: 3 } },
    russia: { bg: "loyalist", traits: ["ruthless", "paranoid"], skills: { oratory: 0, legislation: 1, economics: 1, diplomacy: 2, military: 2, intrigue: 4 } },
    india: { bg: "revolutionary", traits: ["intellectual", "idealist"], skills: { oratory: 3, legislation: 2, economics: 1, diplomacy: 3, military: 0, intrigue: 1 } },
    uk: { bg: "loyalist", traits: ["honest", "pragmatist"], skills: { oratory: 0, legislation: 4, economics: 2, diplomacy: 2, military: 1, intrigue: 1 } },
    france: { bg: "revolutionary", traits: ["idealist", "intellectual"], skills: { oratory: 2, legislation: 2, economics: 1, diplomacy: 3, military: 1, intrigue: 1 } },
    germany: { bg: "senator", traits: ["cunning", "hardy"], skills: { oratory: 1, legislation: 3, economics: 1, diplomacy: 3, military: 0, intrigue: 2 } },
    japan: { bg: "diplomat", traits: ["cunning", "pragmatist"], skills: { oratory: 0, legislation: 2, economics: 2, diplomacy: 4, military: 0, intrigue: 2 } },
    brazil: { bg: "general", traits: ["honest", "pragmatist"], skills: { oratory: 0, legislation: 2, economics: 1, diplomacy: 1, military: 4, intrigue: 2 } },
    canada: { bg: "lawyer", traits: ["honest", "pragmatist"], skills: { oratory: 1, legislation: 3, economics: 2, diplomacy: 3, military: 0, intrigue: 1 } },
    australia: { bg: "lawyer", traits: ["charismatic", "cunning"], skills: { oratory: 3, legislation: 3, economics: 1, diplomacy: 2, military: 0, intrigue: 1 } },
    southkorea: { bg: "revolutionary", traits: ["paranoid", "ruthless"], skills: { oratory: 2, legislation: 0, economics: 0, diplomacy: 3, military: 1, intrigue: 4 } },
    mexico: { bg: "lawyer", traits: ["corrupt", "pragmatist"], skills: { oratory: 2, legislation: 2, economics: 3, diplomacy: 1, military: 0, intrigue: 2 } },
    indonesia: { bg: "revolutionary", traits: ["charismatic", "populist"], skills: { oratory: 5, legislation: 0, economics: 0, diplomacy: 2, military: 1, intrigue: 2 } },
    turkey: { bg: "war_hero", traits: ["honest", "paranoid"], skills: { oratory: 0, legislation: 2, economics: 1, diplomacy: 3, military: 3, intrigue: 1 } },
    saudi: { bg: "war_hero", traits: ["cunning", "charismatic"], skills: { oratory: 2, legislation: 0, economics: 0, diplomacy: 3, military: 4, intrigue: 1 } },
    nigeria: { bg: "journalist", traits: ["charismatic", "idealist"], skills: { oratory: 4, legislation: 1, economics: 1, diplomacy: 2, military: 0, intrigue: 2 } },
    southafrica: { bg: "cleric", traits: ["idealist", "ruthless"], skills: { oratory: 2, legislation: 3, economics: 1, diplomacy: 1, military: 0, intrigue: 3 } },
    argentina: { bg: "general", traits: ["charismatic", "populist"], skills: { oratory: 4, legislation: 1, economics: 0, diplomacy: 1, military: 2, intrigue: 2 } },
    iran: { bg: "aristocrat", traits: ["paranoid", "intellectual"], skills: { oratory: 1, legislation: 1, economics: 1, diplomacy: 3, military: 2, intrigue: 2 } },
    israel: { bg: "union", traits: ["idealist", "workaholic"], skills: { oratory: 3, legislation: 2, economics: 1, diplomacy: 1, military: 2, intrigue: 1 } },
    pakistan: { bg: "lawyer", traits: ["honest", "workaholic"], skills: { oratory: 2, legislation: 3, economics: 1, diplomacy: 2, military: 0, intrigue: 2 } },
    philippines: { bg: "senator", traits: ["corrupt", "pragmatist"], skills: { oratory: 1, legislation: 3, economics: 1, diplomacy: 2, military: 0, intrigue: 3 } },
    ethiopia: { bg: "aristocrat", traits: ["cunning", "intellectual"], skills: { oratory: 1, legislation: 0, economics: 1, diplomacy: 5, military: 1, intrigue: 2 } },
    venezuela: { bg: "general", traits: ["idealist", "honest"], skills: { oratory: 1, legislation: 1, economics: 1, diplomacy: 1, military: 4, intrigue: 2 } },
    norway: { bg: "loyalist", traits: ["honest", "workaholic"], skills: { oratory: 1, legislation: 3, economics: 2, diplomacy: 1, military: 0, intrigue: 1 } },
    switzerland: { bg: "diplomat", traits: ["honest", "pragmatist"], skills: { oratory: 1, legislation: 2, economics: 2, diplomacy: 4, military: 0, intrigue: 1 } },
    fiji: { bg: "aristocrat", traits: ["intellectual", "honest"], skills: { oratory: 2, legislation: 2, economics: 1, diplomacy: 3, military: 2, intrigue: 0 } },
    newzealand: { bg: "business", traits: ["pragmatist", "hardy"], skills: { oratory: 2, legislation: 2, economics: 3, diplomacy: 1, military: 1, intrigue: 1 } },
    barbados: { bg: "union", traits: ["pragmatist", "honest"], skills: { oratory: 3, legislation: 3, economics: 1, diplomacy: 2, military: 0, intrigue: 1 } },
    singapore: { bg: "lawyer", traits: ["ruthless", "intellectual"], skills: { oratory: 3, legislation: 2, economics: 2, diplomacy: 1, military: 0, intrigue: 2 } },
    uae: { bg: "aristocrat", traits: ["charismatic", "honest"], skills: { oratory: 2, legislation: 1, economics: 2, diplomacy: 4, military: 1, intrigue: 0 } },
    cambodia: { bg: "aristocrat", traits: ["charismatic", "cunning"], skills: { oratory: 3, legislation: 0, economics: 0, diplomacy: 4, military: 0, intrigue: 3 } },
    uruguay: { bg: "journalist", traits: ["idealist", "populist"], skills: { oratory: 3, legislation: 3, economics: 2, diplomacy: 1, military: 0, intrigue: 1 } }
};

// ── Portrait ────────────────────────────────────────────────────────

const LOOK_OPTIONS = {
    skin: ["#f3d9c4", "#e8bf9e", "#d4a27c", "#b47e57", "#8d5a3b", "#5e3b26", "#3d2618"],
    hairColor: ["#1b1b1b", "#3b2a1e", "#6b4a2b", "#a2763f", "#d6b26e", "#8a8a8a", "#d9d9d9"],
    hair: ["bald", "receding", "short", "side part", "slicked", "wavy", "long", "bun", "turban", "keffiyeh", "military cap", "crown"],
    facial: ["none", "mustache", "goatee", "full beard", "stubble"],
    glasses: ["none", "round", "horn-rimmed"],
    attire: ["dark suit", "grey suit", "military uniform", "royal robes", "Mao suit", "thobe", "traditional dress", "safari suit"],
    // Women leaders get their own hairstyles and clothes.
    hairF: ["set curls", "bob", "chignon", "long", "bun", "pixie", "headscarf", "hijab", "dupatta", "military cap", "tiara"],
    attireF: ["skirt suit & pearls", "tailored jacket", "day dress", "sari", "abaya", "kimono", "military uniform", "royal robes", "Mao suit", "kebaya"]
};

const LOOK_KEYS = { m: ["skin", "hairColor", "hair", "facial", "glasses", "attire"], f: ["skin", "hairColor", "hairF", "glasses", "attireF"] };
const LOOK_LABELS = { skin: "Skin", hairColor: "Hair color", hair: "Hair / headwear", facial: "Facial hair", glasses: "Glasses", attire: "Attire", hairF: "Hair / headwear", attireF: "Attire" };

// Women's names for each naming culture (fictional, era-appropriate).
const NAME_POOLS_F = {
    anglo: ["Margaret Lowell", "Helen Ashby", "Ruth Calder", "Eleanor Whitfield", "Dorothy Hargrave", "Catherine Byrne", "Joan Mercer", "Patricia Holloway"],
    slavic: ["Valentina Orlova", "Yekaterina Belova", "Nina Sokolova", "Galina Volkova", "Tatiana Morozova"],
    chinese: ["Liu Xiulan", "Chen Huifang", "Wang Yuying", "Zhang Lihua", "Zhou Meifeng"],
    hindi: ["Kamala Iyer", "Sarojini Rao", "Lakshmi Menon", "Vijaya Kulkarni", "Aruna Sethi"],
    french: ["Simone Marchand", "Hélène Duval", "Geneviève Mercier", "Madeleine Fontaine", "Claire Lefebvre"],
    german: ["Gerda Vogel", "Hildegard Becker", "Ursula Hartmann", "Elisabeth Neumann", "Ingrid Scholz"],
    japanese: ["Fusae Morita", "Michiko Sakamoto", "Takako Kondo", "Yoshiko Hara", "Kazuko Murata"],
    iberian: ["Ana Duarte", "María Elena Roca", "Beatriz Ferreira", "Isabel Medina", "Lucía Salgado"],
    arabic: ["Noura bint Khalid", "Fatima al-Rashid", "Huda al-Nahyan", "Lubna bint Mansour", "Amal al-Qasimi"],
    persian: ["Mahnaz Shirazi", "Shirin Farzan", "Parvin Ghaffari", "Leila Amini", "Roya Ala"],
    turkish: ["Ayşe Aydın", "Nermin Arslan", "Fatma Yılmaz", "Leyla Demir"],
    hebrew: ["Golda Halevi", "Miriam Avidan", "Ruth Shapira", "Shulamit Ben-Ami"],
    african: ["Funmilayo Adeyemi", "Ngozi Okafor", "Aisha Bello", "Tsehay Wolde", "Nomvula Nkosi", "Amina Abubakar"],
    afrikaans: ["Johanna Botha", "Elsabé van Wyk", "Marieke du Plessis", "Anna Strijdom"],
    malay: ["Siti Hashim", "Lim Mei Ling", "Dewi Suryo", "Teresita Reyes", "Rahmah Nasution"],
    nordic: ["Kari Haugland", "Gro Lund", "Ruth Keller", "Ingrid Borten", "Elisabeth Rüegg"],
    khmer: ["Norodom Kanthi", "Chea Sophea", "Sok Malis", "Son Sreymom"],
    pacific: ["Adi Litia Kamisese", "Mere Tora", "Mia Walcott", "Aroha Tane", "Merewai Reddy"]
};

// Titles follow whoever holds the office.
const TITLE_PAIRS = [["King", "Queen"], ["Emperor", "Empress"], ["Prince", "Princess"], ["Shah", "Shahbanu"], ["Sultan", "Sultana"], ["Emir", "Emira"], ["Sheikh", "Sheikha"], ["Chairman", "Chairwoman"], ["chairman", "chairwoman"]];
function genderTitle(title, gender) {
    if (!title) return title;
    TITLE_PAIRS.forEach(([m, f]) => {
        const re = new RegExp(`\\b${gender === "f" ? m : f}\\b`, "g");
        title = title.replace(re, gender === "f" ? f : m);
    });
    return title;
}

function defaultLook(ck) {
    const c = COUNTRIES[ck];
    const lightSkin = ["usa", "russia", "uk", "france", "germany", "canada", "australia", "argentina", "southafrica", "israel", "norway", "switzerland", "newzealand", "uruguay"];
    const midSkin = ["turkey", "iran", "mexico", "brazil", "venezuela", "saudi", "uae", "pakistan", "philippines", "southkorea", "china", "japan", "singapore", "cambodia", "indonesia", "india"];
    const look = {
        skin: lightSkin.includes(ck) ? 0 : midSkin.includes(ck) ? 2 : 5,
        hairColor: 1, hair: 3, facial: 0, glasses: 0, attire: 0
    };
    if (["china", "japan", "southkorea", "singapore", "cambodia"].includes(ck)) look.skin = 1;
    if (["india", "pakistan", "indonesia", "philippines", "brazil", "venezuela"].includes(ck)) look.skin = 3;
    if (["nigeria", "ethiopia", "barbados", "fiji"].includes(ck)) look.skin = 5;
    if (["saudi", "uae"].includes(ck)) { look.hair = 9; look.attire = 5; look.facial = 3; }
    if (c.gov === "monarchy" && ck !== "saudi") look.attire = 3;
    if (["china"].includes(ck)) look.attire = 4;
    if (["venezuela", "brazil"].includes(ck)) look.attire = 2;
    const age = c.leader.age;
    if (age >= 65) { look.hairColor = 5; look.hair = 1; }
    if (age >= 72) look.hairColor = 6;
    if (ck === "usa") { look.glasses = 1; look.hairColor = 5; }
    if (ck === "russia") { look.facial = 1; look.attire = 2; look.hairColor = 5; look.hair = 2; }
    if (ck === "india") { look.attire = 6; look.hair = 1; }
    if (ck === "uk") { look.facial = 1; look.hair = 0; }
    if (ck === "southafrica" || ck === "germany") { look.hair = 0; }
    if (ck === "ethiopia") { look.facial = 3; look.hairColor = 1; }
    if (ck === "israel") { look.hair = 1; look.hairColor = 6; }
    if (ck === "pakistan") { look.glasses = 2; }
    // A woman in the same office: hair and clothes that fit the country and era.
    look.hairF = 0; look.attireF = 0;
    if (["india", "pakistan"].includes(ck)) { look.hairF = 8; look.attireF = 3; }
    if (["saudi", "uae"].includes(ck)) { look.hairF = 7; look.attireF = 4; }
    if (["indonesia", "cambodia"].includes(ck)) { look.hairF = 4; look.attireF = 9; }
    if (ck === "japan") { look.hairF = 2; look.attireF = 1; }
    if (ck === "china") { look.hairF = 1; look.attireF = 8; }
    if (["venezuela", "brazil"].includes(ck)) { look.hairF = 9; look.attireF = 6; }
    if (c.gov === "monarchy" && !["saudi"].includes(ck)) { look.hairF = 10; look.attireF = 7; }
    if (age >= 65) look.hairF = look.hairF === 0 ? 1 : look.hairF;
    return look;
}

function portraitSVG(look, gender = "m", size = 120) {
    if (gender === "f") return portraitF(look || {}, size);
    const L = look || {};
    const skin = LOOK_OPTIONS.skin[L.skin || 0];
    const hc = LOOK_OPTIONS.hairColor[L.hairColor || 0];
    const hair = LOOK_OPTIONS.hair[L.hair || 0];
    const facial = gender === "f" ? "none" : LOOK_OPTIONS.facial[L.facial || 0];
    const glasses = LOOK_OPTIONS.glasses[L.glasses || 0];
    const attire = LOOK_OPTIONS.attire[L.attire || 0];
    const shade = "rgba(0,0,0,.18)";
    let body = "";
    const suit = c => `<path d="M14 120 C18 92 38 84 60 84 C82 84 102 92 106 120 Z" fill="${c}"/><path d="M50 86 L60 104 L70 86 Z" fill="#f2f2f2"/><path d="M57 92 L60 110 L63 92 Z" fill="#7a1f2b"/>`;
    if (attire === "dark suit") body = suit("#1d2433");
    else if (attire === "grey suit") body = suit("#5d6470");
    else if (attire === "military uniform") body = `<path d="M14 120 C18 92 38 84 60 84 C82 84 102 92 106 120 Z" fill="#4d5a3a"/><path d="M48 86 L60 98 L72 86" stroke="#c8a64b" stroke-width="3" fill="none"/><rect x="30" y="98" width="14" height="5" fill="#c33"/><rect x="30" y="104" width="14" height="5" fill="#36c"/><circle cx="84" cy="100" r="3" fill="#c8a64b"/><rect x="20" y="90" width="14" height="4" fill="#c8a64b"/><rect x="86" y="90" width="14" height="4" fill="#c8a64b"/>`;
    else if (attire === "royal robes") body = `<path d="M10 120 C16 90 38 82 60 82 C82 82 104 90 110 120 Z" fill="#6b1d3a"/><path d="M40 86 C50 96 70 96 80 86 L84 120 L36 120 Z" fill="#f4efe6"/><path d="M60 92 L60 120" stroke="#c8a64b" stroke-width="3"/><circle cx="60" cy="100" r="4" fill="#c8a64b"/>`;
    else if (attire === "Mao suit") body = `<path d="M14 120 C18 92 38 84 60 84 C82 84 102 92 106 120 Z" fill="#59605a"/><path d="M48 85 L60 92 L72 85" stroke="#3a3f3b" stroke-width="3" fill="none"/><path d="M60 92 L60 120" stroke="#3a3f3b" stroke-width="2"/><circle cx="60" cy="100" r="1.8" fill="#222"/><circle cx="60" cy="110" r="1.8" fill="#222"/>`;
    else if (attire === "thobe") body = `<path d="M12 120 C18 90 38 82 60 82 C82 82 102 90 108 120 Z" fill="#f4f1ea"/><path d="M10 120 C14 96 28 88 40 86 L44 120 Z M110 120 C106 96 92 88 80 86 L76 120 Z" fill="#3b2f2a"/>`;
    else if (attire === "traditional dress") body = `<path d="M12 120 C18 90 38 82 60 82 C82 82 102 90 108 120 Z" fill="#f2ead9"/><path d="M44 84 C52 92 68 92 76 84" stroke="#b08a4a" stroke-width="3" fill="none"/>`;
    else body = `<path d="M14 120 C18 92 38 84 60 84 C82 84 102 92 106 120 Z" fill="#c9b88a"/><path d="M50 86 L60 98 L70 86" stroke="#9b8b5f" stroke-width="2" fill="none"/>`;
    const neck = `<rect x="51" y="70" width="18" height="18" rx="6" fill="${skin}"/>`;
    const face = `<ellipse cx="60" cy="52" rx="23" ry="27" fill="${skin}"/><ellipse cx="37" cy="54" rx="4" ry="6" fill="${skin}"/><ellipse cx="83" cy="54" rx="4" ry="6" fill="${skin}"/>`;
    const eyes = `<ellipse cx="51" cy="52" rx="2.6" ry="2" fill="#1a1a1a"/><ellipse cx="69" cy="52" rx="2.6" ry="2" fill="#1a1a1a"/><path d="M46 46 L56 45 M64 45 L74 46" stroke="${hc}" stroke-width="2.2" stroke-linecap="round"/>`;
    const nose = `<path d="M60 54 L57 63 L62 63" stroke="${shade}" stroke-width="1.6" fill="none"/>`;
    const mouth = gender === "f" ? `<path d="M53 69 Q60 73 67 69" stroke="#a5484f" stroke-width="2.4" fill="none" stroke-linecap="round"/>` : `<path d="M53 69 Q60 72 67 69" stroke="#6b3b32" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    let hairSvg = "";
    if (hair === "receding") hairSvg = `<path d="M37 50 C36 36 42 30 46 32 M83 50 C84 36 78 30 74 32" stroke="${hc}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    else if (hair === "short") hairSvg = `<path d="M36 50 C34 28 50 22 60 22 C72 22 86 28 84 50 C82 38 76 32 60 32 C46 32 38 38 36 50 Z" fill="${hc}"/>`;
    else if (hair === "side part") hairSvg = `<path d="M36 52 C33 26 52 20 62 21 C76 22 88 30 84 52 C82 40 78 32 66 31 L50 34 C42 36 38 42 36 52 Z" fill="${hc}"/><path d="M50 24 L52 34" stroke="${skin}" stroke-width="1.5"/>`;
    else if (hair === "slicked") hairSvg = `<path d="M36 48 C34 26 50 20 60 20 C74 20 86 26 84 48 C80 34 72 28 60 28 C48 28 40 34 36 48 Z" fill="${hc}"/>`;
    else if (hair === "wavy") hairSvg = `<path d="M34 54 C30 26 48 18 60 18 C74 18 90 26 86 54 C84 42 80 34 72 32 C66 36 58 30 52 34 C44 34 38 42 34 54 Z" fill="${hc}"/>`;
    else if (hair === "long") hairSvg = `<path d="M34 80 C26 40 40 18 60 18 C80 18 94 40 86 80 L80 80 C84 56 80 34 60 32 C40 34 36 56 40 80 Z" fill="${hc}"/>`;
    else if (hair === "bun") hairSvg = `<circle cx="60" cy="18" r="9" fill="${hc}"/><path d="M36 50 C34 28 48 22 60 22 C72 22 86 28 84 50 C82 38 74 30 60 30 C46 30 38 38 36 50 Z" fill="${hc}"/>`;
    else if (hair === "turban") hairSvg = `<path d="M34 44 C32 22 48 14 60 14 C72 14 88 22 86 44 C76 38 44 38 34 44 Z" fill="#e9e3d2"/><path d="M38 40 C48 30 72 30 82 40 M40 32 C50 24 70 24 80 32" stroke="#cfc6ae" stroke-width="2" fill="none"/>`;
    else if (hair === "keffiyeh") hairSvg = `<path d="M30 92 C24 50 34 16 60 16 C86 16 96 50 90 92 L82 92 C86 60 82 34 60 32 C38 34 34 60 38 92 Z" fill="#f4f1ea"/><path d="M34 36 C44 26 76 26 86 36" stroke="#222" stroke-width="4" fill="none"/><path d="M36 30 C46 20 74 20 84 30" stroke="#222" stroke-width="3" fill="none"/>`;
    else if (hair === "military cap") hairSvg = `<path d="M32 38 C34 24 48 16 60 16 C72 16 86 24 88 38 Z" fill="#4d5a3a"/><path d="M30 38 L90 38 L84 44 L36 44 Z" fill="#1d1d1d"/><circle cx="60" cy="28" r="4" fill="#c8a64b"/>`;
    else if (hair === "crown") hairSvg = `<path d="M36 46 C34 30 48 26 60 26 C72 26 86 30 84 46 C80 38 72 34 60 34 C48 34 40 38 36 46 Z" fill="${hc}"/><path d="M40 30 L44 14 L52 24 L60 10 L68 24 L76 14 L80 30 Z" fill="#d8b44a" stroke="#a9862a"/><circle cx="60" cy="18" r="2.5" fill="#c33"/>`;
    let fac = "";
    if (facial === "mustache") fac = `<path d="M50 65 Q60 61 70 65 Q66 68 60 66 Q54 68 50 65 Z" fill="${hc}"/>`;
    else if (facial === "goatee") fac = `<path d="M52 65 Q60 62 68 65 Q64 67 60 66 Q56 67 52 65 Z M55 72 Q60 82 65 72 Q60 75 55 72 Z" fill="${hc}"/>`;
    else if (facial === "full beard") fac = `<path d="M37 56 C38 76 48 84 60 84 C72 84 82 76 83 56 C80 66 74 72 68 70 Q60 66 52 70 C46 72 40 66 37 56 Z" fill="${hc}"/><path d="M50 65 Q60 61 70 65 Q66 68 60 66 Q54 68 50 65 Z" fill="${hc}"/>`;
    else if (facial === "stubble") fac = `<path d="M40 60 C42 76 50 82 60 82 C70 82 78 76 80 60" fill="${hc}" opacity=".25"/>`;
    let gl = "";
    if (glasses === "round") gl = `<circle cx="51" cy="52" r="6" stroke="#333" stroke-width="1.6" fill="none"/><circle cx="69" cy="52" r="6" stroke="#333" stroke-width="1.6" fill="none"/><path d="M57 52 L63 52" stroke="#333" stroke-width="1.6"/>`;
    else if (glasses === "horn-rimmed") gl = `<rect x="43" y="47" width="15" height="10" rx="3" stroke="#222" stroke-width="2.6" fill="none"/><rect x="62" y="47" width="15" height="10" rx="3" stroke="#222" stroke-width="2.6" fill="none"/><path d="M58 51 L62 51" stroke="#222" stroke-width="2"/>`;
    const back = hair === "long" ? "" : "";
    return `<svg viewBox="0 0 120 120" width="${size}" height="${size}" class="portrait" aria-hidden="true">${back}${body}${neck}${face}${eyes}${nose}${mouth}${fac}${gl}${hairSvg}</svg>`;
}

function randomLeaderName(ck, gender) {
    const culture = COUNTRIES[ck] ? COUNTRIES[ck].names : "anglo";
    const women = NAME_POOLS_F[culture] || NAME_POOLS_F.anglo;
    let pool = NAME_POOLS[culture] || NAME_POOLS.anglo;
    if (gender === "f") pool = women;
    else if (gender === "m") pool = pool.filter(n => !women.includes(n));
    return pool[Math.floor(Math.random() * pool.length)];
}

// ── A woman's portrait ──────────────────────────────────────────────

function portraitF(L, size) {
    const skin = LOOK_OPTIONS.skin[L.skin || 0];
    const hc = LOOK_OPTIONS.hairColor[L.hairColor || 0];
    const hair = LOOK_OPTIONS.hairF[L.hairF || 0];
    const glasses = LOOK_OPTIONS.glasses[L.glasses || 0];
    const attire = LOOK_OPTIONS.attireF[L.attireF || 0];
    const shade = "rgba(0,0,0,.16)";
    const torso = (c, extra = "") => `<path d="M18 120 C21 95 40 86 60 86 C80 86 99 95 102 120 Z" fill="${c}"/>${extra}`;
    const pearls = [[50, 88], [53.5, 91], [57.5, 92.6], [62.5, 92.6], [66.5, 91], [70, 88]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.7" fill="#f7f3ea" stroke="#cdbfa3" stroke-width=".5"/>`).join("");
    const scarfC = { headscarf: "#7b3f5e", hijab: "#34445e", dupatta: "#d4a64a" }[hair];
    let body = "";
    if (attire === "skirt suit & pearls") body = torso("#24324a", `<path d="M50 86 L60 103 L70 86 Z" fill="#f3efe6"/><path d="M50 86 L56 108 M70 86 L64 108" stroke="#1a2436" stroke-width="2"/>${pearls}`);
    else if (attire === "tailored jacket") body = torso("#6a6f7a", `<path d="M51 86 L60 100 L69 86 Z" fill="#f4f0ea"/><path d="M55 88 L60 92 L65 88 L60 90 Z" fill="#8a2f3c"/><circle cx="79" cy="98" r="3" fill="#d8b44a" stroke="#a9862a"/>`);
    else if (attire === "day dress") body = torso("#3d6b8f", `<path d="M49 85 Q60 96 71 85 Z" fill="${skin}"/><path d="M30 106 C50 110 70 110 90 106" stroke="#2f5674" stroke-width="2" fill="none"/>`);
    else if (attire === "sari") body = torso("#a8323f", `<path d="M50 86 Q60 93 70 86 Z" fill="${skin}"/><path d="M38 90 C58 94 82 104 98 120 L72 120 C64 108 52 98 38 90 Z" fill="#d9a441"/><path d="M38 90 C58 94 82 104 98 120" stroke="#f1d58a" stroke-width="1.5" fill="none"/>`);
    else if (attire === "abaya") body = torso("#18181d", `<path d="M58 88 L60 120" stroke="#2a2a31" stroke-width="1.5"/>`);
    else if (attire === "kimono") body = torso("#7a2e45", `<path d="M46 86 L66 114" stroke="#f2ede4" stroke-width="4"/><path d="M74 86 L58 104" stroke="#f2ede4" stroke-width="4"/><rect x="20" y="110" width="80" height="8" fill="#d9b25a"/>`);
    else if (attire === "military uniform") body = torso("#4d5a3a", `<path d="M49 86 L60 97 L71 86" stroke="#c8a64b" stroke-width="3" fill="none"/><rect x="30" y="99" width="13" height="4.5" fill="#c33"/><rect x="30" y="104" width="13" height="4.5" fill="#36c"/><rect x="22" y="92" width="13" height="4" fill="#c8a64b"/><rect x="85" y="92" width="13" height="4" fill="#c8a64b"/>`);
    else if (attire === "royal robes") body = torso("#6b1d3a", `<path d="M42 87 C50 96 70 96 78 87 L82 120 L38 120 Z" fill="#f4efe6"/><path d="M40 92 L80 116" stroke="#2a4f9e" stroke-width="6"/><circle cx="66" cy="104" r="4" fill="#c8a64b"/>${pearls}`);
    else if (attire === "Mao suit") body = torso("#59605a", `<path d="M49 86 L60 92 L71 86" stroke="#3a3f3b" stroke-width="3" fill="none"/><path d="M60 92 L60 120" stroke="#3a3f3b" stroke-width="2"/><circle cx="60" cy="101" r="1.8" fill="#222"/><circle cx="60" cy="111" r="1.8" fill="#222"/>`);
    else body = torso("#2f6b5a", `<path d="M50 86 L60 98 L70 86 Z" fill="${skin}"/><path d="M44 88 L60 112 L76 88" stroke="#e8d9a8" stroke-width="2" fill="none"/><circle cx="60" cy="104" r="2.2" fill="#d8b44a"/>`);
    const neck = `<rect x="53" y="70" width="14" height="18" rx="6" fill="${skin}"/>`;
    const covered = ["headscarf", "hijab"].includes(hair);
    const ears = covered ? "" : `<ellipse cx="38.5" cy="54" rx="3.5" ry="5.5" fill="${skin}"/><ellipse cx="81.5" cy="54" rx="3.5" ry="5.5" fill="${skin}"/>`;
    const face = `${ears}<path d="M39 50 C39 33 48 26 60 26 C72 26 81 33 81 50 C81 66 72 79 60 79 C48 79 39 66 39 50 Z" fill="${skin}"/>`;
    const earrings = covered ? "" : `<circle cx="38.5" cy="61" r="1.8" fill="#e9d38a"/><circle cx="81.5" cy="61" r="1.8" fill="#e9d38a"/>`;
    const eyes = `<path d="M46.5 52 Q51 47.6 55.5 52 Q51 55.2 46.5 52 Z M64.5 52 Q69 47.6 73.5 52 Q69 55.2 64.5 52 Z" fill="#f7f4ef"/><circle cx="51" cy="51.8" r="2.1" fill="#2b1d14"/><circle cx="69" cy="51.8" r="2.1" fill="#2b1d14"/><circle cx="51.7" cy="51.1" r=".6" fill="#fff"/><circle cx="69.7" cy="51.1" r=".6" fill="#fff"/><path d="M46.2 52 Q51 47.2 55.8 51.6 M64.2 51.6 Q69 47.2 73.8 52" stroke="#1a1a1a" stroke-width="1.4" fill="none" stroke-linecap="round"/><path d="M46.4 51.6 L44.9 50.2 M55.6 51.3 L57 49.9 M64.4 51.3 L63 49.9 M73.6 51.6 L75.1 50.2" stroke="#1a1a1a" stroke-width="1" stroke-linecap="round"/><path d="M45.5 46 Q51 42.5 56 45 M64 45 Q69 42.5 74.5 46" stroke="${hc}" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
    const blush = `<ellipse cx="47" cy="62" rx="5" ry="3" fill="#e0707a" opacity=".18"/><ellipse cx="73" cy="62" rx="5" ry="3" fill="#e0707a" opacity=".18"/>`;
    const nose = `<path d="M60 55 L58 62 L61.5 62" stroke="${shade}" stroke-width="1.4" fill="none"/>`;
    const mouth = `<path d="M53.5 68.5 Q56.8 66.6 60 68 Q63.2 66.6 66.5 68.5 Q60 73.5 53.5 68.5 Z" fill="#b8434f"/><path d="M54 68.6 Q60 70 66 68.6" stroke="#8e2f3a" stroke-width=".8" fill="none"/>`;
    let back = "", front = "";
    const curls = `<circle cx="37" cy="56" r="6.5" fill="${hc}"/><circle cx="83" cy="56" r="6.5" fill="${hc}"/><circle cx="38" cy="64" r="5" fill="${hc}"/><circle cx="82" cy="64" r="5" fill="${hc}"/>`;
    const setFront = `<path d="M37 50 C34 30 46 20 60 20 C74 20 86 30 83 50 C81 42 78 36 72 34 C68 38 64 33 60 35 C56 33 52 38 48 34 C42 36 39 42 37 50 Z" fill="${hc}"/>`;
    if (hair === "set curls") { back = `<ellipse cx="60" cy="46" rx="29" ry="27" fill="${hc}"/>`; front = setFront + curls; }
    else if (hair === "bob") { back = `<path d="M32 74 C27 40 40 18 60 18 C80 18 93 40 88 74 C80 76 76 70 76 64 L44 64 C44 70 40 76 32 74 Z" fill="${hc}"/>`; front = `<path d="M38 47 C38 28 50 22 60 22 C70 22 82 28 82 47 C76 37 68 34 60 34 C52 34 44 37 38 47 Z" fill="${hc}"/>`; }
    else if (hair === "chignon") { back = `<circle cx="83" cy="34" r="8" fill="${hc}"/>`; front = `<path d="M38 47 C35 26 48 20 60 20 C72 20 85 26 82 47 C79 35 72 29 60 29 C48 29 41 35 38 47 Z" fill="${hc}"/>`; }
    else if (hair === "long") { back = `<path d="M31 98 C24 52 36 16 60 16 C84 16 96 52 89 98 Z" fill="${hc}"/>`; front = `<path d="M38 52 C35 29 46 20 60 20 C74 20 85 29 82 52 C80 39 72 31 61 29 L59 29 C48 31 40 39 38 52 Z" fill="${hc}"/>`; }
    else if (hair === "bun") front = `<circle cx="60" cy="17" r="9" fill="${hc}"/><path d="M38 49 C35 28 48 22 60 22 C72 22 85 28 82 49 C80 37 73 30 60 30 C47 30 40 37 38 49 Z" fill="${hc}"/>`;
    else if (hair === "pixie") front = `<path d="M38 49 C35 26 50 18 62 20 C76 22 87 30 82 50 C79 40 74 34 66 33 C60 37 51 36 45 38 C41 41 39 45 38 49 Z" fill="${hc}"/>`;
    else if (hair === "headscarf") { back = `<path d="M31 66 C27 34 40 14 60 14 C80 14 93 34 89 66 C87 78 80 84 76 84 L44 84 C40 84 33 78 31 66 Z" fill="${scarfC}"/>`; front = `<path d="M38 44 C41 27 50 23 60 23 C70 23 79 27 82 44 C75 35 68 33 60 33 C52 33 45 35 38 44 Z" fill="${hc}"/><path d="M36 42 C40 24 50 19 60 19 C70 19 80 24 84 42 C78 30 70 26 60 26 C50 26 42 30 36 42 Z" fill="${scarfC}"/><path d="M52 82 L60 90 L68 82" stroke="${scarfC}" stroke-width="5" fill="none"/>`; }
    else if (hair === "hijab") { back = `<path d="M28 104 C21 52 36 14 60 14 C84 14 99 52 92 104 Z" fill="${scarfC}"/>`; front = `<path d="M37 46 C39 27 50 22 60 22 C70 22 81 27 83 46 C77 37 69 34 60 34 C51 34 43 37 37 46 Z" fill="${scarfC}"/><path d="M39 58 C41 79 50 85 60 85 C70 85 79 79 81 58 C84 84 72 95 60 95 C48 95 36 84 39 58 Z" fill="${scarfC}"/>`; }
    else if (hair === "dupatta") { back = `<path d="M28 98 C22 50 34 12 60 12 C86 12 98 50 92 98 L85 98 C89 58 82 27 60 27 C38 27 31 58 35 98 Z" fill="${scarfC}" opacity=".92"/>`; front = `<path d="M39 50 C37 30 47 24 60 24 C73 24 83 30 81 50 C78 38 70 32 61 31 L59 31 C50 32 42 38 39 50 Z" fill="${hc}"/><path d="M34 40 C40 20 52 15 60 15 C68 15 80 20 86 40 C78 27 70 23 60 23 C50 23 42 27 34 40 Z" fill="${scarfC}" opacity=".92"/>`; }
    else if (hair === "military cap") { back = `<path d="M33 72 C28 42 40 22 60 22 C80 22 92 42 87 72 C80 74 77 68 77 62 L43 62 C43 68 40 74 33 72 Z" fill="${hc}"/>`; front = `<path d="M33 38 C35 24 48 16 60 16 C72 16 85 24 87 38 Z" fill="#4d5a3a"/><path d="M31 38 L89 38 L83 44 L37 44 Z" fill="#1d1d1d"/><circle cx="60" cy="28" r="4" fill="#c8a64b"/>`; }
    else if (hair === "tiara") { back = `<ellipse cx="60" cy="46" rx="29" ry="27" fill="${hc}"/>`; front = setFront + curls + `<path d="M44 30 L48 21 L54 27 L60 17 L66 27 L72 21 L76 30 Z" fill="#e3c35a" stroke="#a9862a"/><circle cx="60" cy="23" r="2.2" fill="#3a7bd5"/>`; }
    let gl = "";
    if (glasses === "round") gl = `<circle cx="51" cy="52" r="6" stroke="#333" stroke-width="1.5" fill="none"/><circle cx="69" cy="52" r="6" stroke="#333" stroke-width="1.5" fill="none"/><path d="M57 52 L63 52" stroke="#333" stroke-width="1.5"/>`;
    else if (glasses === "horn-rimmed") gl = `<path d="M43 48 Q50 45 58 48 L57 56 Q50 58 44 55 Z M62 48 Q70 45 77 48 L76 55 Q70 58 63 56 Z" stroke="#222" stroke-width="2.2" fill="none"/><path d="M58 50 L62 50" stroke="#222" stroke-width="1.8"/>`;
    return `<svg viewBox="0 0 120 120" width="${size}" height="${size}" class="portrait" aria-hidden="true">${back}${body}${neck}${face}${blush}${eyes}${nose}${mouth}${earrings}${gl}${front}</svg>`;
}
