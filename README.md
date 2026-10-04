# World Leader: 1950

A political simulation of the Cold War and after. Pick one of 34 countries in
January 1950 and lead it as head of government under its **real 1950 system**,
one week at a time, through to the present day (2026). History happens on
schedule, until you change it.

It follows on from *Galactic Senate* (the Star Wars game) and borrows from
*The Political Process* (whip counts, factions, regional campaigning) and
*Democracy* (power bases that react to policy).

## Running it

Open `index.html` in a browser. There is no build step and no server. The game
autosaves every week; **Continue** on the title screen resumes your save.

Keys: **Space** advances one week, **1–9** pick a decision option.

## Setting up a game

1. **Choose a country.** Every card shows 1950 conditions as color-coded bars:
   living standards, GDP, GDP per person, health, education, unemployment,
   crime, poverty, stability and military. Green is good and red is bad; for
   crime, unemployment and poverty a longer bar is worse.
2. **Read the dossier.** It covers how the government actually works (who
   governs, the real legislature and parties with 1950 seats, party factions,
   how you can lose power), starting crises, strengths, weaknesses, regions,
   industries and national goals.
3. **Build your leader.** Keep the real 1950 leader or make your own: name, age,
   gender, look (with a live portrait), party, ideology, backstory, two traits
   and 10 skill points. Every party and ideology has a plain-language
   explanation. Your **backstory** (former senator, war hero, party loyalist,
   union leader, revolutionary, general and others) sets your starting allies,
   enemies and approval.
4. **Form your cabinet.** Pick seven ministers from your factions. Each one
   generates political capital, the currency for policy and action, and
   improves their department. Factions left out of the cabinet resent it. Pick
   the historical leader of the US, UK, USSR, China or India and you can appoint
   the real 1950 cabinet.

## The countries

- **Major powers:** United States, China, Soviet Union, India, United Kingdom,
  France, West Germany (under Allied occupation), Japan (under US occupation),
  Brazil.
- **Regional heavyweights:** Canada, Australia, South Korea, Mexico,
  Indonesia, Turkey, Saudi Arabia, Nigeria (colony), South Africa, Argentina.
- **Wildcards:** Iran, Israel, Pakistan, Philippines, Ethiopia, Venezuela,
  Norway, Switzerland, Fiji (colony).
- **New additions:** New Zealand, Barbados (colony), Singapore (colony), the
  Trucial States/UAE (protectorate), Cambodia (French protectorate), Uruguay.

## Government type decides the rules

| System | Who you answer to | How you fall |
|---|---|---|
| Presidential | Voters, Congress, the army | Election, impeachment, coup, term limits |
| Parliamentary | Your majority, your party, coalition partners | Election, no-confidence vote, leadership challenge, coalition walkout |
| Semi-presidential | Voters and the assembly | Election, cohabitation, impeachment, coup |
| Monarchy | Royal family, clergy, tribes, army | Palace coup, military coup, revolution, assassination |
| One-party | Politburo, army, secret police | Purge, coup, uprising |
| Dominant party | The party machine | Revolt of the bosses, mass protest, end of term (*el dedazo*) |
| Military junta | The officer corps | Counter-coup, uprising |
| Collegial (Swiss) | Federal Assembly, the voters by referendum | Not re-elected, referendum defeats |
| Occupied | Occupation authority and parliament | Election, no-confidence, removal |
| Colony | Movement, colonial office, chiefs | Arrest and exile, losing the movement |

Systems change during play. Coups install juntas and revolutions install new
regimes. **Constitutional reform** can abolish term limits, create a strong
presidency, switch to parliamentary rule, adopt a Swiss-style council, become a
republic, grant a constitution, abdicate and lead a party (as Sihanouk did),
hold managed elections or democratize. Colonies win independence and then
**write their own constitution**.

When you fall, you can play on as whoever comes next: the opposition leader, the
coup leader, your heir or the party's choice.

## Governing

- **Policy:** 19 areas, from the economic system, taxes, welfare, health,
  education, land and trade to labor, defense, the nuclear program, science,
  the press, security, religion, civil rights, oil and space. Depending on your
  system you decree changes, get them past the Politburo, or **draft a bill and
  whip it** through the legislature faction by faction, with pork, favors
  (which come due later) and executive orders.
- **Power bases:** each system weighs different groups (the public, your party,
  the army, business, labor, clergy, royals, Politburo, security services and
  so on). Their loyalty drifts toward what your conditions and policies
  deserve.
- **Elections:** region-by-region polling, rallies, ad blitzes, fundraising and
  real seat allocation (FPTP or proportional representation), with hung
  parliaments and coalition building.

## The economy: companies → jobs → tax base → living standards

- **16 industries:** agriculture, mining, oil, textiles, steel, machinery,
  chemicals, shipbuilding, autos, electronics, aerospace, computing, finance,
  tourism, renewables and AI. Each needs technology, literacy, universities or
  natural resources.
- **Investment desk:** court real companies of the era, from Ford, Shell and
  Siemens to Sony, Samsung, Intel, TSMC, Tesla and Nvidia. You set a tax
  holiday, capital grant, local hiring rules, labor waivers and site
  infrastructure, and see the jobs, cost, payback period and odds before you
  offer. Fly to their headquarters to learn what they care about. You can also
  back local entrepreneurs.
- **What new firms do:** plants hire workers, which lowers unemployment.
  Formal jobs and company profits widen the **tax base** (income, corporate,
  royalties and tariffs). Literacy and urbanization raise **state capacity**,
  the ability to collect taxes. Revenue funds schools and clinics, which raise
  health, education and living standards.
- **Development tracks:** industrialization (from agrarian to advanced),
  technology, literacy, university education and urbanization.
- **The money supply:** GDP is simulated in 1950 dollars and shown in nominal
  dollars. Debt can spiral into default, and oil shocks hit importers and
  enrich exporters.

## The world

Every other country is simulated. They grow, change leaders on the historical
schedule (unless the sandbox diverges), sign deals, stage coups, fight wars and
approach you with offers, demands and threats. Superpowers court non-aligned
states and run covert operations against unfriendly ones. You can join NATO,
the Warsaw Pact, SEATO, CENTO, ANZUS, the Non-Aligned Movement, the European
Community, OPEC or the Commonwealth. The Doomsday Clock tracks nuclear tension,
and if it reaches midnight it ends the game for everyone.

## History, 1950–2026

More than 160 historical events adapt to the state of the world. For example:

- A strong South Korea can deter the 1950 invasion, and a Soviet player can
  veto it.
- If the US isn't protecting Taiwan, Mao may invade it.
- Suez, Hungary, Sputnik, the Berlin Wall and the Cuban Missile Crisis all
  happen in some form.
- Later events include Vietnam, the oil embargo, the Iranian Revolution, the
  Falklands, Tiananmen, reunification, the Soviet collapse, the Asian
  financial crisis, 9/11, the 2008 crash, the Arab Spring, Crimea, Brexit,
  COVID, the war in Ukraine and the AI boom.

Each country has its own flashpoints, such as apartheid laws, the Iranian oil
nationalization, Evita, the Colegiado plebiscite, Guided Democracy, Biafra,
Bangladesh, Konfrontasi, Singapore's expulsion from Malaysia, Norway's oil
fund and Swiss women's suffrage. Thirty random event types cover strikes,
scandals, disasters, lobbyists, pork demands, investors and more.

## Code layout

| File | Contents |
|---|---|
| `js/data.js` | Government types, power bases, ideologies, policies, blocs, industries |
| `js/countries.js`, `js/countries2.js` | The 34 countries and the non-playable states |
| `js/character.js` | Backstories, traits, skills, portraits |
| `js/engine.js` | State, weekly simulation, economy, effects, saving |
| `js/cabinet.js` | Ministers, health, crime and poverty indicators |
| `js/companies.js` | The investment desk, jobs, tax base, living standards |
| `js/world.js` | AI nations, relations, wars |
| `js/government.js` | Bills, elections, threats, succession, constitutional reform |
| `js/colony.js` | The independence path |
| `js/scenes.js`, `js/history_scenes.js`, `js/random.js` | Decisions |
| `js/history.js`, `js/hist_modern.js` | The 1950–2026 timeline |
| `js/actions.js`, `js/ui.js`, `js/main.js` | Player actions, rendering, input |
