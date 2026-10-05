// ── THE LAWBOOK — laws before sliders ───────────────────────────────
//
// A law doesn't exist until it is passed. Each law has a strength from
// 10% to 100%: its cost and its effects scale with that level and with the
// funding its department gets in the annual budget. Once a year the
// executive may adjust a law by ±10% within its authority; anything bigger
// is an amendment, and ending a law is a repeal. Autocrats decree.
//
// Big system-wide choices (economic system, press regime, religion, civil
// rights, oil, trade, labor, defense posture, the bomb) remain "national
// frameworks" in POLICY_AREAS; changing one is a major reform bill.

const LAW_CATS = {
    health:   { name: "Health", icon: "⚕️", dept: "health" },
    welfare:  { name: "Welfare & housing", icon: "🤲", dept: "welfare" },
    education:{ name: "Education & science", icon: "🎓", dept: "education" },
    economy:  { name: "Economy & labor", icon: "🏭", dept: "industry" },
    farms:    { name: "Agriculture", icon: "🌾", dept: "agriculture" },
    infra:    { name: "Infrastructure & energy", icon: "🌉", dept: "infra" },
    order:    { name: "Law & order", icon: "🚔", dept: "police" },
    defense:  { name: "Defense", icon: "🎖️", dept: "defense" },
    society:  { name: "Society", icon: "🏛️", dept: null },
    tax:      { name: "Taxes", icon: "💰", dept: null }
};

// cost: % of GDP per year at 100%. fx: effects at 100% (see builder EFF_LABELS;
// health/poverty/crime/unemp/liberty/stability/corruption/legitimacy/prestige/
// inflation are standing pulls, lit/uni/tech/agri/indAll/growth/mil are rates).
// p: power-base reactions at 100%. st: ideology stances (−3..3).
const LAWS = {
    // Health
    public_clinics: { cat: "health", name: "Public clinics", cost: 1.5, fx: { health: 6 }, p: { people: 3 }, st: { socdem: 1, socialist: 1 }, desc: "State-run clinics and dispensaries in towns and villages." },
    vaccination:    { cat: "health", name: "Mass vaccination campaigns", cost: 0.4, fx: { health: 4 }, p: { people: 2 }, st: { socdem: 1, communist: 1 }, desc: "Smallpox, polio, tuberculosis: inoculate everyone." },
    nhi:            { cat: "health", name: "National health insurance", cost: 3, fx: { health: 6, poverty: -2 }, p: { people: 4, labor: 3, business: -3 }, st: { socdem: 2, socialist: 1, liberal: -1, conservative: -1 }, desc: "Compulsory insurance pays doctors and hospitals for everyone." },
    nhs:            { cat: "health", name: "National health service", cost: 5, fx: { health: 9, poverty: -2, prestige: 2 }, p: { people: 5, labor: 4, business: -4 }, st: { socialist: 2, socdem: 2, liberal: -2, conservative: -2 }, desc: "Free care at the point of use, run by the state." },
    family_planning:{ cat: "health", name: "Family planning", cost: 0.3, fx: { poverty: -1, health: 1 }, p: { clergy: -5, press: 2 }, st: { socdem: 1, liberal: 1, traditionalist: -3 }, from: 1960, desc: "Contraception and maternal health clinics." },
    environment:    { cat: "health", name: "Environmental protection", cost: 0.4, fx: { health: 2 }, p: { business: -3, press: 3 }, st: { socdem: 1, liberal: 1, conservative: -1 }, from: 1965, desc: "Limits on smog, effluent and toxic waste." },
    // Welfare
    pensions:       { cat: "welfare", name: "Old-age pensions", cost: 3, fx: { poverty: -4, stability: 1 }, p: { people: 4 }, st: { socdem: 1, socialist: 1 }, desc: "A guaranteed income in old age." },
    unemployment_ins:{ cat: "welfare", name: "Unemployment insurance", cost: 1.5, fx: { poverty: -2, unemp: 0.3, stability: 1 }, p: { labor: 4, business: -2 }, st: { socdem: 2, socialist: 1, liberal: -1 }, desc: "Benefits for workers who lose their jobs." },
    family_allow:   { cat: "welfare", name: "Family allowances", cost: 1.2, fx: { poverty: -2 }, p: { people: 2, clergy: 1 }, st: { socdem: 1, traditionalist: 1 }, desc: "Cash for every child." },
    food_subsidies: { cat: "welfare", name: "Food & bread subsidies", cost: 1.5, fx: { poverty: -3, stability: 2, inflation: -0.3 }, p: { people: 3, peasants: -2 }, st: { nationalist: 1, socialist: 1, liberal: -2 }, desc: "Cheap bread keeps the cities calm." },
    public_housing: { cat: "welfare", name: "Public housing", cost: 1.2, fx: { poverty: -2, crime: -1 }, p: { labor: 3, people: 2 }, st: { socdem: 1, socialist: 2, liberal: -1 }, desc: "Council flats and housing estates." },
    minimum_wage:   { cat: "welfare", name: "Minimum wage", cost: 0, fx: { poverty: -1.5, unemp: 0.4 }, p: { labor: 5, business: -4 }, st: { socdem: 2, socialist: 1, liberal: -2, conservative: -1 }, desc: "A legal floor under wages." },
    // Education & science
    primary_schools:{ cat: "education", name: "Universal primary schooling", cost: 1.5, fx: { lit: 1.3 }, p: { people: 2 }, st: { socdem: 1, liberal: 1, communist: 1 }, desc: "Free, compulsory primary school for every child." },
    secondary_schools:{ cat: "education", name: "Secondary schools", cost: 1.5, fx: { lit: 0.4, uni: 0.06, growth: 0.1 }, p: { press: 2 }, st: { socdem: 1, liberal: 1 }, desc: "High schools and grammar schools." },
    literacy_campaign:{ cat: "education", name: "Adult literacy campaign", cost: 0.6, fx: { lit: 1.1 }, p: { peasants: 2 }, st: { communist: 1, nationalist: 1, socialist: 1 }, desc: "Teach the grown-ups to read too." },
    universities:   { cat: "education", name: "Public universities", cost: 1.2, fx: { uni: 0.25, tech: 0.3 }, p: { press: 4 }, st: { liberal: 1, socdem: 1 }, desc: "New universities and free tuition." },
    technical_schools:{ cat: "education", name: "Technical & vocational schools", cost: 0.6, fx: { uni: 0.05, growth: 0.15, unemp: -0.3 }, p: { labor: 2, business: 2 }, st: { conservative: 1, nationalist: 1 }, desc: "Train engineers, mechanics and technicians." },
    research_council:{ cat: "education", name: "National research council", cost: 0.6, fx: { tech: 0.6 }, p: { press: 2 }, st: { liberal: 1, socdem: 1 }, desc: "Grants for science." },
    national_labs:  { cat: "education", name: "National laboratories", cost: 1.5, fx: { tech: 1.2, prestige: 1 }, p: { military: 2, business: 2 }, st: { militarist: 1, conservative: 1 }, desc: "Big science: physics, computing, aerospace." },
    rd_credits:     { cat: "education", name: "R&D tax credits", cost: 0.4, fx: { tech: 0.5 }, p: { business: 4 }, st: { liberal: 2, conservative: 1 }, desc: "Companies that research pay less tax." },
    // Economy & labor
    dev_bank:       { cat: "economy", name: "National development bank", cost: 0.8, fx: { indAll: 0.8 }, p: { business: 3 }, st: { nationalist: 1, socdem: 1 }, desc: "Cheap long-term loans for industry." },
    small_business: { cat: "economy", name: "Small business credit", cost: 0.4, fx: { unemp: -0.3, growth: 0.1 }, p: { business: 3 }, st: { liberal: 1, conservative: 1 }, desc: "Loans for shops and workshops." },
    export_board:   { cat: "economy", name: "Export promotion board", cost: 0.3, fx: { indAll: 0.4 }, p: { business: 2 }, st: { nationalist: 1, liberal: 1 }, desc: "Help firms sell abroad." },
    price_controls: { cat: "economy", name: "Price controls", cost: 0, fx: { inflation: -1.5, growth: -0.3 }, p: { people: 3, business: -6 }, st: { socialist: 2, communist: 1, liberal: -3 }, desc: "The state sets the price of essentials." },
    antitrust:      { cat: "economy", name: "Competition & antitrust law", cost: 0.1, fx: { growth: 0.2, corruption: -2 }, p: { business: -3, press: 1 }, st: { liberal: 1, socdem: 1 }, desc: "Break up monopolies and cartels." },
    workplace_safety:{ cat: "economy", name: "Workplace safety code", cost: 0.1, fx: { health: 1 }, p: { labor: 3, business: -2 }, st: { socdem: 1 }, desc: "Inspectors in every mine and mill." },
    anti_corruption:{ cat: "economy", name: "Anti-corruption commission", cost: 0.2, fx: { corruption: -8 }, p: { press: 3, royals: -4, tribes: -4, party: -2 }, st: { liberal: 2, socdem: 1 }, desc: "An independent body with powers to investigate ministers." },
    civil_service:  { cat: "economy", name: "Merit civil service", cost: 0.3, fx: { corruption: -5, legitimacy: 1 }, p: { party: -3, tribes: -2 }, st: { liberal: 1, socdem: 1 }, desc: "Exams, not patronage." },
    // Agriculture
    price_supports: { cat: "farms", name: "Farm price supports", cost: 1, fx: { agri: 1.2 }, p: { peasants: 5, people: -1 }, st: { conservative: 1, traditionalist: 1, liberal: -1 }, desc: "The state buys crops at guaranteed prices." },
    extension:      { cat: "farms", name: "Agricultural extension service", cost: 0.4, fx: { agri: 1 }, p: { peasants: 2 }, st: { socdem: 1 }, desc: "Advisers teach new methods in every district." },
    mechanization:  { cat: "farms", name: "Tractor & fertilizer program", cost: 0.8, fx: { agri: 1.6, unemp: 0.4 }, p: { peasants: 2, business: 2 }, st: { nationalist: 1, communist: 1 }, desc: "Modern machines and chemicals for farms." },
    green_revolution:{ cat: "farms", name: "High-yield seed program", cost: 0.6, fx: { agri: 2.5 }, p: { peasants: 3 }, st: { socdem: 1, nationalist: 1 }, from: 1965, desc: "Norman Borlaug's dwarf wheat and new rice." },
    rural_credit:   { cat: "farms", name: "Rural credit cooperatives", cost: 0.5, fx: { poverty: -1, agri: 0.6 }, p: { peasants: 3 }, st: { socdem: 1, socialist: 1 }, desc: "Free farmers from the moneylender." },
    // Infrastructure
    public_works:   { cat: "infra", name: "Public works program", cost: 2, fx: { unemp: -1, growth: 0.2, corruption: 1 }, p: { labor: 3, business: 2 }, st: { socdem: 1, nationalist: 1, liberal: -1 }, desc: "Put the unemployed to work building things." },
    electrification:{ cat: "infra", name: "Rural electrification", cost: 0.8, fx: { poverty: -1, growth: 0.1 }, p: { peasants: 4 }, st: { socdem: 1, communist: 1, nationalist: 1 }, desc: "Power lines to every village." },
    road_fund:      { cat: "infra", name: "National road fund", cost: 1, fx: { growth: 0.25 }, p: { business: 2 }, st: { conservative: 1 }, desc: "A dedicated fund for highways." },
    urban_transit:  { cat: "infra", name: "Urban transit", cost: 0.6, fx: { growth: 0.1, poverty: -0.5 }, p: { people: 2 }, st: { socdem: 1 }, desc: "Buses, trams and metros." },
    // Law & order
    police_force:   { cat: "order", name: "National police force", cost: 0.8, fx: { crime: -6, stability: 2 }, p: { security: 3, people: 2 }, st: { conservative: 1, militarist: 1 }, desc: "A professional police force." },
    community_police:{ cat: "order", name: "Community policing", cost: 0.4, fx: { crime: -3, liberty: 1 }, p: { people: 2 }, st: { socdem: 1, liberal: 1 }, from: 1965, desc: "Officers who know the neighborhood." },
    courts:         { cat: "order", name: "Independent courts & legal aid", cost: 0.3, fx: { corruption: -3, liberty: 3, legitimacy: 2 }, p: { press: 3, security: -2 }, st: { liberal: 2, socdem: 1, militarist: -1 }, desc: "Judges the government can't fire, and lawyers for the poor." },
    prisons:        { cat: "order", name: "Prison expansion", cost: 0.4, fx: { crime: -3 }, p: { security: 2, press: -1 }, st: { conservative: 1, militarist: 1 }, desc: "More cells, longer sentences." },
    death_penalty:  { cat: "order", name: "Death penalty", cost: 0, fx: { crime: -1 }, p: { clergy: 1, press: -3 }, st: { traditionalist: 1, conservative: 1, liberal: -2, socdem: -1 }, desc: "Execution for murder and treason." },
    emergency_powers:{ cat: "order", name: "State of emergency powers", cost: 0.1, fx: { stability: 4, liberty: -8 }, p: { security: 4, press: -8 }, st: { militarist: 2, conservative: 1, liberal: -3 }, desc: "Detention without trial, curfews, bans on assembly." },
    narcotics:      { cat: "order", name: "Narcotics enforcement", cost: 0.4, fx: { crime: -2, liberty: -2 }, p: { security: 2 }, st: { conservative: 1, traditionalist: 1 }, from: 1970, desc: "The war on drugs." },
    // Defense
    military_pay:   { cat: "defense", name: "Military pay & pensions", cost: 1, fx: {}, p: { military: 6 }, st: { militarist: 1, conservative: 1 }, desc: "Keep the officers comfortable." },
    veterans:       { cat: "defense", name: "Veterans' benefits (GI Bill)", cost: 0.8, fx: { uni: 0.05, poverty: -0.5 }, p: { military: 3, people: 2 }, st: { conservative: 1, nationalist: 1 }, desc: "Education and loans for those who served." },
    civil_defense:  { cat: "defense", name: "Civil defense", cost: 0.3, fx: { stability: 1 }, p: { people: 1 }, st: { militarist: 1 }, desc: "Shelters, sirens and drills." },
    arms_industry:  { cat: "defense", name: "Domestic arms industry", cost: 0.8, fx: { mil: 8, indAll: 0.3 }, p: { military: 4, business: 2 }, st: { nationalist: 2, militarist: 2, socdem: -1 }, desc: "Build our own weapons." },
    // Society
    religious_schools:{ cat: "society", name: "Funding for religious schools", cost: 0.3, fx: {}, p: { clergy: 6, press: -2 }, st: { traditionalist: 2, conservative: 1, communist: -2, liberal: -1 }, desc: "State money for church, mosque and temple schools." },
    information_ministry:{ cat: "society", name: "Ministry of information", cost: 0.3, fx: { legitimacy: 2, liberty: -3 }, p: { press: -5, people: 1 }, st: { communist: 1, militarist: 1, nationalist: 1, liberal: -2 }, desc: "Official propaganda and film censorship." },
    language_law:   { cat: "society", name: "National language law", cost: 0, fx: { stability: -1, legitimacy: 1 }, p: { people: 2 }, st: { nationalist: 2, liberal: -1 }, desc: "One official language for the whole nation." },
    immigration_controls:{ cat: "society", name: "Immigration controls", cost: 0.1, fx: { unemp: -0.2 }, p: { people: 1, business: -2 }, st: { nationalist: 1, traditionalist: 1, liberal: -1 }, desc: "Quotas and border checks." },
    open_immigration:{ cat: "society", name: "Open immigration", cost: 0.1, fx: { growth: 0.2, unemp: 0.2 }, p: { business: 3, people: -2 }, st: { liberal: 2, nationalist: -2 }, desc: "Welcome workers from abroad." },
    voting_rights:  { cat: "society", name: "Voting rights act", cost: 0.05, fx: { liberty: 4, legitimacy: 3 }, p: { press: 3 }, st: { socdem: 1, liberal: 1, traditionalist: -1 }, desc: "Protect everyone's right to vote." },
    // Taxes: the rate is set in the annual budget.
    income_tax:     { cat: "tax", name: "Income tax", tax: "income", max: 50, desc: "Tax on wages and salaries. Brings in more as formal jobs grow.", st: { socialist: 1, liberal: -1, conservative: -1 } },
    payroll_tax:    { cat: "tax", name: "Social insurance contributions", tax: "payroll", max: 20, desc: "Paid by employers and workers to fund pensions and benefits.", st: { socdem: 1, liberal: -1 } },
    corporate_tax:  { cat: "tax", name: "Corporate income tax", tax: "corporate", max: 60, desc: "Tax on company profits.", st: { socialist: 1, socdem: 1, liberal: -2, conservative: -1 } },
    sales_tax:      { cat: "tax", name: "Sales tax", tax: "sales", max: 25, desc: "A tax on retail sales. Easy to collect even where few people have formal jobs, but it hits the poor hardest and drags on business.", st: { conservative: 1, socialist: -1 } },
    land_tax:       { cat: "tax", name: "Land & property tax", tax: "land", max: 5, desc: "Tax on land. Landlords hate it.", st: { socialist: 1, socdem: 1, traditionalist: -1, conservative: -1 } },
    wealth_tax:     { cat: "tax", name: "Wealth tax", tax: "wealth", max: 3, desc: "An annual levy on large fortunes.", st: { socialist: 2, communist: 1, liberal: -2, conservative: -2 } },
    vat:            { cat: "tax", name: "Value-added tax (VAT)", tax: "vat", max: 25, from: 1954, desc: "Collected at every stage of production, so it is hard to evade and drags less on growth than a sales tax. Invented in France in 1954; most of the world adopts it by the 1990s. It needs a formal economy that keeps invoices.", st: { liberal: 1, conservative: 1, socialist: -1, communist: -1 } },
    capital_gains:  { cat: "tax", name: "Capital gains tax", tax: "gains", max: 40, desc: "Tax on profits from selling shares and property. Brings in more as finance grows; investors grumble.", st: { socdem: 1, socialist: 1, liberal: -2, conservative: -1 } },
    inheritance:    { cat: "tax", name: "Estate & inheritance tax", tax: "estate", max: 70, desc: "Tax on fortunes passed to heirs. Little revenue, big symbolism. Old money and royal families hate it.", st: { socialist: 2, socdem: 1, conservative: -2, traditionalist: -2 } },
    sin_tax:        { cat: "tax", name: "Tobacco & alcohol excise", tax: "sin", max: 60, desc: "Excise on cigarettes and drink. Raises steady money and nudges public health up; smokers and drinkers complain.", st: { traditionalist: 1, socdem: 1, liberal: -1 } },
    fuel_tax:       { cat: "tax", name: "Fuel tax", tax: "fuel", max: 80, desc: "Excise on petrol and diesel. Revenue grows with roads and cars. Drivers, truckers and farmers hate it; it also curbs pollution.", st: { socdem: 1, conservative: -1, nationalist: -1 } },
    export_duty:    { cat: "tax", name: "Export duties", tax: "export", max: 30, desc: "A cut of every crop, ore and barrel sold abroad, like Argentina's grain duties or colonial marketing boards. Easy money for a weak state, but it slows farming and mining.", st: { nationalist: 1, socialist: 1, liberal: -2, traditionalist: -1 } },
    windfall_tax:   { cat: "tax", name: "Windfall profits tax on oil", tax: "windfall", max: 70, from: 1973, desc: "Taxes the extra profit oil companies make when prices soar, as the US, UK and Norway did after the oil shocks. Slows new drilling.", st: { socialist: 1, socdem: 1, liberal: -1, conservative: -1 } },
    carbon_tax:     { cat: "tax", name: "Carbon tax", tax: "carbon", max: 100, from: 1990, desc: "A price on carbon emissions, pioneered by Finland, Norway and Sweden in 1990–91. Cleaner air and a boost for renewables; heavy industry pays.", st: { socdem: 2, liberal: 1, conservative: -1, nationalist: -1 } },
    stamp_duty:     { cat: "tax", name: "Stamp duty & financial transactions tax", tax: "stamp", max: 3, desc: "A small levy on share trades and property deals. Easy to collect where finance is big, but traders move elsewhere.", st: { socialist: 1, socdem: 1, liberal: -2 } },
    luxury_tax:     { cat: "tax", name: "Luxury goods tax", tax: "luxury", max: 50, desc: "Higher rates on cars, jewelry and furs. Popular, but it raises little and smuggling follows.", st: { socialist: 1, nationalist: 1, liberal: -1 } },
    digital_tax:    { cat: "tax", name: "Digital services tax", tax: "digital", max: 10, from: 2019, desc: "A levy on the local revenue of the big tech platforms. Washington threatens retaliatory tariffs.", st: { socdem: 1, nationalist: 1, liberal: -1 } },
    poll_tax:       { cat: "tax", name: "Poll tax (head tax)", tax: "poll", max: 10, desc: "The same flat sum from every adult, like the colonial hut tax or Britain's 1990 'community charge'. Works where nobody files a tax return, but it is deeply hated and can spark revolts.", st: { conservative: 1, socialist: -2, socdem: -2 } },
    tourism_tax:    { cat: "tax", name: "Tourist & departure tax", tax: "tourism", max: 20, desc: "Charges on hotel stays and airport departures. Foreigners pay, so voters don't mind, but tourists notice.", st: {} }
};
Object.entries(LAWS).forEach(([k, d]) => { d.key = k; });

const DEPTS = {
    defense: { name: "Defense", pillar: "military" },
    health: { name: "Health", pillar: "people" },
    education: { name: "Education & science", pillar: "press" },
    welfare: { name: "Welfare & housing", pillar: "labor" },
    infra: { name: "Infrastructure", pillar: "business" },
    agriculture: { name: "Agriculture", pillar: "peasants" },
    police: { name: "Police & justice", pillar: "security" },
    industry: { name: "Industry", pillar: "business" }
};

// How the old one-setting policy areas translate into laws, for country
// starting positions.
const LEGACY_LAWS = {
    tax: {
        low: { income_tax: 10, sales_tax: 6, corporate_tax: 20 },
        moderate: { income_tax: 16, payroll_tax: 3, sales_tax: 8, corporate_tax: 30 },
        high: { income_tax: 24, payroll_tax: 6, sales_tax: 8, corporate_tax: 40 },
        confiscatory: { income_tax: 32, payroll_tax: 8, sales_tax: 10, corporate_tax: 50, wealth_tax: 1.5 }
    },
    welfare: { minimal: {}, safety: { pensions: 0.5, unemployment_ins: 0.4 }, welfare: { pensions: 1, unemployment_ins: 0.8, family_allow: 0.7, public_housing: 0.6 } },
    health: { private: {}, subsidized: { public_clinics: 0.6, vaccination: 0.5 }, national: { nhs: 1, vaccination: 0.8 } },
    education: { basic: { primary_schools: 0.4 }, expanded: { primary_schools: 0.8, secondary_schools: 0.5 }, mass: { primary_schools: 1, secondary_schools: 0.8, literacy_campaign: 0.6, universities: 0.5 } },
    infra: { maintenance: {}, public: { public_works: 0.5, road_fund: 0.3 }, grand: { public_works: 1, road_fund: 0.6, electrification: 0.5 } },
    science: { no_rd: {}, universities: { research_council: 0.5 }, state_rd: { research_council: 0.8, national_labs: 0.4 }, national_labs: { research_council: 1, national_labs: 0.8, rd_credits: 0.5 } }
};

function lawDef(k) { return LAWS[k] || (G.customLaws && G.customLaws[k]); }
function lawLevel(k) { return G.laws[k] ? G.laws[k].level : 0; }
const lawOn = k => lawLevel(k) > 0;
function lawAvailable(k) {
    const d = lawDef(k);
    if (!d) return false;
    if (d.from && G.year < d.from) return false;
    return true;
}

function initLaws(c, preset) {
    G.laws = {};
    G.customLaws = {};
    const pol = Object.assign({}, PRESETS[c.preset], c.pol || {});
    const rates = {};
    Object.entries(LEGACY_LAWS).forEach(([area, map]) => {
        const opt = pol[area];
        const set = map[opt] || {};
        Object.entries(set).forEach(([k, v]) => {
            if (LAWS[k].tax) { rates[LAWS[k].tax] = v; G.laws[k] = { level: v / LAWS[k].max, since: 0 }; }
            else G.laws[k] = { level: v, since: 0 };
        });
    });
    // A few country specifics.
    if (["southafrica", "usa"].includes(G.ck)) G.laws.police_force = { level: 0.6, since: 0 };
    if (["uk", "france", "germany", "usa", "canada", "australia", "newzealand", "norway", "switzerland", "japan", "russia"].includes(G.ck)) {
        G.laws.police_force = G.laws.police_force || { level: 0.6, since: 0 };
        G.laws.courts = { level: G.ck === "russia" ? 0 : 0.7, since: 0 };
        if (G.ck === "russia") delete G.laws.courts;
    }
    if (G.ck === "usa") { G.laws.veterans = { level: 0.8, since: 0 }; G.laws.military_pay = { level: 0.7, since: 0 }; }
    if (c.preset === "communist") { G.laws.price_controls = { level: 0.8, since: 0 }; G.laws.information_ministry = { level: 0.8, since: 0 }; }
    if (pol.land === "mechanize") G.laws.extension = { level: 0.5, since: 0 };
    Object.entries(START_TAXES[G.ck] || {}).forEach(([k, rate]) => { rates[LAWS[k].tax] = rate; G.laws[k] = { level: rate / LAWS[k].max, since: 0 }; });
    Object.keys(G.laws).forEach(k => { if (!G.laws[k] || G.laws[k].level <= 0) delete G.laws[k]; });
    G.budget = {
        depts: Object.fromEntries(Object.keys(DEPTS).map(k => [k, 1])),
        rates: Object.assign({ income: 0, payroll: 0, corporate: 0, sales: 0, land: 0, wealth: 0 }, rates),
        capital: c.econ.taxCap > 0.7 ? 1 : 0.5,
        status: "adopted", draft: null, billId: null, fy: 1950
    };
    if (c.preset === "communist") G.budget.capital = 2;
}

function fundMult(dept) { return dept && G.budget ? (G.budget.depts[dept] || 1) : 1; }
function lawMult(k) {
    const d = lawDef(k);
    return lawLevel(k) * fundMult(d.dept || (LAW_CATS[d.cat] && LAW_CATS[d.cat].dept));
}

// Sum of one effect across every law in force (custom programs included).
// Programs you write overlap with each other: the first one on an issue does
// the most good, each extra one less (soft cap per effect).
const PROGRAM_CAP = { growth: 0.8, indAll: 1, lit: 1, uni: 0.25, tech: 1.2, agri: 2, health: 8, poverty: 8, crime: 6, unemp: 1.5, liberty: 6, stability: 4, legitimacy: 4, prestige: 3, mil: 8, corruption: 6, inflation: 1.5 };
function lawFx(key) {
    let s = 0, custom = 0;
    Object.keys(G.laws).forEach(k => {
        const d = lawDef(k);
        if (!d || !d.fx || d.tax) return;
        const v = d.fx[key];
        if (!v) return;
        if (d.custom) custom += v * lawMult(k); else s += v * lawMult(k);
    });
    const c = PROGRAM_CAP[key] || 3;
    return s + c * Math.tanh(custom / c);
}

function lawSpend() {
    let s = 0;
    Object.keys(G.laws).forEach(k => { const d = lawDef(k); if (d && d.cost) s += d.cost * lawMult(k); });
    return s;
}

// How a law keeps power bases happy or angry. People get used to what they
// have: gratitude (and resentment, more slowly) fades over the years.
function lawPillar(pk) {
    let s = 0, custom = 0;
    Object.keys(G.laws).forEach(k => {
        const d = lawDef(k);
        if (!d || !d.p || !d.p[pk]) return;
        const v = d.p[pk];
        const age = G.t - (G.laws[k].since || 0);
        const fade = v > 0 ? 0.35 + 0.65 * Math.exp(-age / 260) : 0.6 + 0.4 * Math.exp(-age / 520);
        const x = v * (v > 0 ? lawMult(k) : lawLevel(k)) * fade;
        if (d.custom) custom += x; else s += x;
    });
    return s + 8 * Math.tanh(custom / 8);
}

// Taxes: rates from the budget, for taxes that exist in law.
function taxRate(kind) {
    const k = Object.keys(LAWS).find(x => LAWS[x].tax === kind);
    return lawOn(k) && G.budget ? (G.budget.rates[kind] || 0) : 0;
}

// The extra taxes: revenue (% of GDP per rate point), who it angers per point,
// growth drag per point, and side effects.
const indShareOf = k => G.ind[k] ? indValue(k) / G.econ.gdp : 0;
const TAX_EXTRA = {
    vat:      { rev: (eff, formal) => 0.42 * eff * (0.45 + 0.55 * formal), p: { people: -0.2, labor: -0.12 }, drag: 0.004 },
    gains:    { rev: eff => 0.015 * eff * (0.4 + indShareOf("finance") * 10), p: { business: -0.15 }, drag: 0.006 },
    estate:   { rev: eff => 0.004 * eff, p: { royals: -0.08, business: -0.04, clergy: -0.02 }, drag: 0.001 },
    sin:      { rev: eff => 0.025 * eff, p: { people: -0.02, clergy: 0.03 }, drag: 0, health: 0.03 },
    fuel:     { rev: eff => 0.02 * eff * (0.5 + cov("roads") / 100), p: { people: -0.03, business: -0.02, peasants: -0.03 }, drag: 0.004, health: 0.01 },
    export:   { rev: eff => (indShareOf("agriculture") * 0.5 + indShareOf("mining") * 0.6 + indShareOf("oil") * 0.4) * eff * 1.2, p: { peasants: -0.25, business: -0.1, tribes: -0.1 }, drag: 0.01 },
    windfall: { rev: () => indShareOf("oil") * 0.5, p: { business: -0.08 }, drag: 0.002 },
    carbon:   { rev: eff => 0.012 * eff * (0.4 + G.dev.ind / 100), p: { business: -0.08, press: 0.03 }, drag: 0.004, health: 0.03 },
    stamp:    { rev: eff => 0.25 * eff * (0.4 + indShareOf("finance") * 10), p: { business: -1 }, drag: 0.05 },
    luxury:   { rev: eff => 0.01 * eff, p: { people: 0.02, business: -0.05, royals: -0.05 }, drag: 0.002 },
    digital:  { rev: eff => 0.03 * eff * (0.3 + (indShareOf("computing") + indShareOf("ai")) * 15), p: { business: -0.2 }, drag: 0.01 },
    poll:     { rev: (eff, formal) => 0.15 * eff * (1 - formal * 0.5) * (0.5 + G.econ.taxCap), p: { people: -1.2, peasants: -1, tribes: -1, labor: -0.6 }, drag: 0, stab: -0.6 },
    tourism:  { rev: eff => indShareOf("tourism") * 0.5 * eff, p: {}, drag: 0 }
};
// Taxes not set as a percentage.
const TAX_UNIT = { carbon: " $/t", poll: " $" };

// What a tax would raise (% of GDP) at a given rate, on today's tax base.
function taxRevenueAt(k, rate) {
    const d = LAWS[k], kind = d.tax;
    const savedLaw = G.laws[k], savedRate = G.budget.rates[kind];
    const without = (() => { delete G.laws[k]; return taxBase().total; })();
    G.laws[k] = { level: Math.max(0.01, rate / d.max), since: 0 }; G.budget.rates[kind] = rate;
    const withIt = taxBase().total;
    if (savedLaw) G.laws[k] = savedLaw; else delete G.laws[k];
    G.budget.rates[kind] = savedRate;
    return withIt - without;
}

// Industries a tax slows (growth points per rate point).
const TAX_IND = { export: { agriculture: 0.06, mining: 0.06, oil: 0.04 }, windfall: { oil: 0.04 }, carbon: { steel: 0.015, chemicals: 0.015, mining: 0.01, renewables: -0.06 }, stamp: { finance: 0.4 }, tourism: { tourism: 0.04 }, digital: { computing: 0.03, ai: 0.03 }, fuel: { autos: 0.005 } };
function taxIndEffect(k) { let r = 0; Object.entries(TAX_IND).forEach(([kind, m]) => { if (m[k]) r -= taxRate(kind) * m[k]; }); return r; }
function taxHealth() { return Object.entries(TAX_EXTRA).reduce((s, [kind, x]) => s + (x.health || 0) * taxRate(kind), 0); }
function taxStability() { return Object.entries(TAX_EXTRA).reduce((s, [kind, x]) => s + (x.stab || 0) * taxRate(kind), 0); }
function extraTaxRevenue(eff, formal) { const out = {}; Object.entries(TAX_EXTRA).forEach(([kind, x]) => { const r = taxRate(kind); out[kind] = r ? r * x.rev(eff, formal) : 0; }); return out; }

// Taxes already on the books in 1950 (rates in % or the law's own units).
const START_TAXES = {
    usa: { inheritance: 60, capital_gains: 25, sin_tax: 30, fuel_tax: 15 },
    uk: { inheritance: 65, stamp_duty: 1, sin_tax: 45, fuel_tax: 50, luxury_tax: 33 },
    france: { inheritance: 40, sin_tax: 30, fuel_tax: 45, luxury_tax: 15 },
    germany: { inheritance: 30, sin_tax: 35, fuel_tax: 35 },
    japan: { inheritance: 50, sin_tax: 35, fuel_tax: 25, luxury_tax: 15, stamp_duty: 0.3 },
    canada: { inheritance: 30, sin_tax: 30, fuel_tax: 15 },
    australia: { inheritance: 30, sin_tax: 30, fuel_tax: 15 },
    newzealand: { inheritance: 30, sin_tax: 30, fuel_tax: 15 },
    norway: { inheritance: 30, sin_tax: 45, fuel_tax: 25 },
    switzerland: { inheritance: 20, sin_tax: 20, fuel_tax: 20, stamp_duty: 0.5 },
    southafrica: { inheritance: 20, sin_tax: 25, fuel_tax: 10, poll_tax: 2 },
    argentina: { export_duty: 15, sin_tax: 20, inheritance: 15 },
    brazil: { export_duty: 8, sin_tax: 20 },
    uruguay: { export_duty: 10, sin_tax: 20, inheritance: 15 },
    india: { export_duty: 5, sin_tax: 20, stamp_duty: 0.5 },
    pakistan: { export_duty: 5, sin_tax: 15 },
    indonesia: { export_duty: 10, sin_tax: 15 },
    philippines: { export_duty: 5, sin_tax: 15 },
    nigeria: { export_duty: 10, poll_tax: 3 },
    ethiopia: { export_duty: 5, poll_tax: 2 },
    fiji: { export_duty: 5, poll_tax: 2 },
    cambodia: { export_duty: 5, poll_tax: 2 },
    barbados: { export_duty: 5, sin_tax: 20 },
    mexico: { export_duty: 5, sin_tax: 20 },
    turkey: { sin_tax: 25 }, iran: { sin_tax: 15 }, israel: { sin_tax: 25, fuel_tax: 15 }, southkorea: { sin_tax: 20 }, venezuela: { sin_tax: 20 },
    china: { sin_tax: 20 }, russia: { sin_tax: 40 }, singapore: { sin_tax: 25, stamp_duty: 0.5 }
};

function taxPillarEffect(pk) {
    const r = k => taxRate(k);
    const eff = {
        business: -(r("corporate") - 30) * 0.3 - r("wealth") * 4 - Math.max(0, r("income") - 25) * 0.15,
        people: -Math.max(0, r("income") - 20) * 0.25 - r("sales") * 0.25 - r("payroll") * 0.15,
        labor: -r("sales") * 0.2 - r("payroll") * 0.1,
        royals: -r("wealth") * 4 - r("land") * 2,
        tribes: -r("land") * 3,
        peasants: -r("land") * 2
    };
    let x = eff[pk] || 0;
    Object.entries(TAX_EXTRA).forEach(([kind, t]) => { if (t.p[pk]) x += t.p[pk] * r(kind); });
    return x;
}

function taxGrowthDrag() {
    return Math.max(0, taxRate("income") - 22) * 0.02 + Math.max(0, taxRate("corporate") - 35) * 0.025 + taxRate("sales") * 0.008 + taxRate("wealth") * 0.12 + Object.entries(TAX_EXTRA).reduce((a, [kind, t]) => a + t.drag * taxRate(kind), 0);
}

// ── Changing laws ───────────────────────────────────────────────────

function ruleByDecree() { return ["decree", "politburo", "rubber"].includes(policyMethod("economy").m) || G.gov.type === "colony"; }

function lawPending(k) { return (G.bills || []).some(b => b.lawKey === k && ["committee", "floor", "stuck"].includes(b.stage)); }

function canAdjust(k) {
    const l = G.laws[k];
    return l && !lawDef(k).tax && (l.adj == null || G.t - l.adj >= 52);
}

function adjustLaw(k, dir) {
    if (!canAdjust(k)) return toast("Already adjusted this year", "The executive can adjust a law once a year. Anything more needs an amendment.");
    const l = G.laws[k];
    const nl = Math.round(clamp(l.level + dir * 0.1, 0.1, 1) * 10) / 10;
    if (nl === l.level) return;
    if (G.capital < 3) return toast("Not enough political capital", "An executive adjustment costs 3.");
    G.capital -= 3;
    l.adj = G.t;
    const d = nl - l.level;
    l.level = nl;
    lawReaction(k, d);
    log(`📜 Executive adjustment: ${lawDef(k).name} ${d > 0 ? "strengthened" : "scaled back"} to ${Math.round(nl * 100)}%.`, "policy");
    toast("Executive adjustment", `${lawDef(k).name} is now at ${Math.round(nl * 100)}%.`);
}

// Immediate reaction of power bases and your party to a change of level d.
function lawReaction(k, d) {
    const def = lawDef(k);
    const p = {};
    Object.entries(def.p || {}).forEach(([pk, v]) => { p[pk] = v * d * 0.8; });
    const ch = applyEffects({ p });
    const st = (def.st || {})[G.leader.ideology] || 0;
    const partyPillar = G.pillars.politburo ? "politburo" : G.pillars.party ? "party" : null;
    if (st && partyPillar && Math.abs(d) >= 0.2) {
        const mult = trait("idealist") ? 2 : trait("pragmatist") && st * d < 0 ? 0.5 : 1;
        ch.push(...applyEffects({ p: { [partyPillar]: st * Math.sign(d) * 2 * mult } }));
    }
    return ch;
}

function setLaw(k, level, how) {
    const prev = lawLevel(k);
    level = Math.round(clamp(level, 0, 1) * 100) / 100;
    if (level <= 0) delete G.laws[k];
    else G.laws[k] = Object.assign(G.laws[k] || { since: G.t }, { level });
    const def = lawDef(k);
    const ch = lawReaction(k, level - prev);
    const verb = prev === 0 ? "enacted" : level === 0 ? "repealed" : "amended";
    log(`📜 ${how}: ${def.name} ${verb}${level > 0 ? ` at ${Math.round(level * 100)}%` : ""}.`, "policy");
    if (prev === 0 && level > 0) record(`Enacted ${def.name}, ${G.year}.`);
    if (level === 0 && prev > 0) record(`Repealed ${def.name}, ${G.year}.`);
    return ch;
}

function decreeLaw(k, level) {
    const def = lawDef(k);
    const cost = def.tax ? 8 : 6;
    if (G.capital < cost) return toast("Not enough political capital", `A decree costs ${cost}.`);
    if (policyMethod("economy").m === "politburo" && Math.abs(level - lawLevel(k)) >= 0.3) {
        const st = G.factions.reduce((s, f) => s + f.seats * clamp(0.5 + f.loyalty / 200 + ((def.st || {})[f.ideo] || 0) * Math.sign(level - lawLevel(k)) * 0.1, 0, 1), 0) / G.leg.total;
        if (st < 0.5 && !chance(st * 1.4)) { G.capital -= 3; return toast("The Politburo objects", `Your colleagues won't endorse changes to ${def.name} right now.`); }
    }
    if (G.gov.type === "colony") {
        if (!chance(clamp(G.pillars.colonial.l / 70, 0.15, 0.95))) { G.capital -= 3; return toast("Governor refuses assent", "The colonial government blocks your ordinance."); }
    }
    G.capital -= cost;
    if (def.tax && level > 0 && !G.budget.rates[def.tax]) G.budget.rates[def.tax] = Math.round(def.max * level);
    const ch = setLaw(k, level, G.gov.type === "colony" ? "Ordinance" : "Decree");
    toast("Decree issued", `${def.name}${level > 0 ? ` at ${Math.round(level * 100)}%` : " repealed"}.`, ch);
}

// Laws that do the same job: one makes the other pointless.
const LAW_RIVALS = [["nhs", "nhi"]];
function lawRival(k) { const g = LAW_RIVALS.find(x => x.includes(k)); return g ? g.find(x => x !== k && lawOn(x)) || null : null; }

function lawsInCat(cat) {
    return Object.values(LAWS).filter(d => d.cat === cat).concat(Object.values(G.customLaws || {}).filter(d => d.cat === cat));
}
