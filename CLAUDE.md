# Futsal Coach

Persoonlijke futsal evaluatie & coaching app voor Irving Liesdek. Focus: betere dribbelaar, meer fitheid, meer zelfvertrouwen.

Niet te verwarren met **joga-bonito**, de teammanagement-app in de buurmap. Zelfde patroon (single-file HTML, geen build step), maar een eigen repo, eigen branding en een ander doel: joga-bonito gaat over het team, deze app over Irving zelf.

## Architectuur

Single-file HTML app (`index.html`, ~3000 regels). Alle CSS + JS inline, geen build step, geen framework. Draait op `python3 -m http.server 8778` via `.claude/launch.json`.

**Data**: localStorage key `futsalCoach_v1`. Geen backend/database. Alle state zit in het globale `DB` object (geladen bij start, gesaved na elke mutatie). `DATA_VERSION` + `migrateData()` staan klaar voor schema-wijzigingen; nieuwe velden hoor je ook in `loadData()` te defaulten, anders crasht de eerste `.filter()` op een oud opgeslagen object.

**Structuur van index.html** — zoek op functienamen, niet op regelnummers; die schuiven:
- CSS: variabelen, topbar, bottomnav, cards, buttons, forms, modals, toasts, app-specifieke componenten
- HTML body: 6 pagina's, bottomnav, modal overlay, toast
- JS data layer: DB, load/save, helpers, Monday generator, Kaizen quotes
- JS agenda: `loadCalendar`, `renderCalEvent`, `removeCalEvent`, `prefillFromCalendar`
- JS navigatie: tab switching, modal, toast
- JS pagina's: renderDashboard, renderEvaluatie, renderHistorie, renderStats, renderCoaching, renderProfiel
- JS coaching engine: generatePerformanceInsights, generatePreparationInsights, generateCoachingInsights, generateCareerInsights
- JS init

## Testen en uitrollen

`npm test` draait de smoke test (`scripts/smoke-test.js`): de app wordt in jsdom geladen met seed-data en elke pagina moet renderen zonder console errors. Draai hem vóór elke push. "De pagina laadt lokaal" bewijst niets — verifieer ook in de browser dat de gewijzigde flow écht doet wat je denkt, en reproduceer bij een bugfix eerst de bug.

De seed-datums in de smoke test worden via `seedDate()` in de lopende maand gezet. Hardcode nooit een datum: de dashboard-maandstats filteren op de huidige maand, dus een vaste datum laat de test volgende maand vanzelf falen.

GitHub Actions:
- `test.yml` — smoke test op pull requests, en als poort vanuit deploy
- `deploy.yml` — publiceert naar GitHub Pages, alleen als de test slaagt. Draait op elke push naar `main`
- `calendar.yml` — dagelijkse agenda-scrape (07:00 CET). Let op: die commit met het standaard bot-token, en zo'n commit start `deploy.yml` niet. Een nieuwe `data/calendar.json` staat dus pas op de site na de eerstvolgende gewone push

### Versienummer en changelog

`APP_VERSION` bovenaan het script in `index.html` is de enige plek waar het versienummer staat; de topbar toont het. **Hoog het op bij elke push, bump `CACHE_NAME` in `sw.js` mee, en voeg een blok toe aan `CHANGELOG.md`** — niet aan Irving vragen, gewoon doen. Zonder versienummer kan hij op zijn telefoon niet zien of een deploy is doorgekomen, en zonder cache-bump blijft de service worker de oude versie serveren.

- **Patch** (1.6.1) — bugfix of kleine aanpassing
- **Minor** (1.7.0) — nieuwe functie of zichtbare gedragsverandering
- **Major** (2.0.0) — volledige herziening of een wijziging aan hoe data wordt opgeslagen

De changelog beschrijft wat de gebruiker merkt, niet wat er in de code veranderde.

## Toegang

Bij het openen vraagt de app om een 4-cijferige PIN, opgeslagen als SHA-256 hash — niet leesbaar in de broncode. Na één keer invoeren onthoudt localStorage de auth-state. Bij testen in de browser kun je de PIN overslaan met `unlockApp()` via de console; coördinaat-klikken op het keypad werken onbetrouwbaar in de preview.

## Agenda-koppeling

`scripts/scrape-calendar.js` haalt drie ICS-feeds op (iCloud, SRZA via addevent, voetbal.nl/sportlink) en schrijft `data/calendar.json`. De app laadt dat bestand async en toont "Aankomende activiteiten" op het dashboard.

- **RRULE wordt niet geparsed.** Terugkerende events uit iCloud komen dus niet mee. De maandagtrainingen worden daarom in de app zelf gegenereerd (`generateMondayDates()`) en samengevoegd met de gescrapete events, waarbij een datum die al gescrapet is voorrang krijgt.
- **iCloud wordt gefilterd op hashtags** (`#training`, `#zaaltje`, `#preseason`, `#zakiballi`, `srza:`, `knvb:`) — anders komt Irvings hele privé-agenda in de app.
- **`cleanCalTitle()`** strikt de hashtag en schrijft "VVIJV Futsal" / "VVIJ Futsal" om naar "Ijsselmeervogels". Irving wil die naam nergens anders zien.
- **Verwijderen**: eigen ingeplande activiteiten (`DB.customCalEvents`) worden echt verwijderd. Gescrapete en auto-gegenereerde events kunnen dat niet — die komen bij de volgende sync terug — dus hun id gaat in `DB.hiddenCalEvents` en wordt eruit gefilterd bij het laden.
- **`showToast()` serialiseert de undo-functie naar een string.** Die kan dus niet uit een closure lezen; zet wat je nodig hebt in een module-scope variabele (zie `lastCalRemoval` / `undoCalRemoval`).

## Brand guide

| Element | Waarde |
|---|---|
| Font | Inter 400–700 (alles) |
| Primary | `#111111` (zwart) |
| Surface | `#FFFFFF` (wit) |
| Background | `#F5F5F5` (lichtgrijs) |
| Text | `#1A1A2E` / muted `#6B7280` |
| Joga Bonito | `#2563EB` (blauw) |
| Ijsselmeervogels | `#DC2626` (rood) |
| Overig | `#9CA3AF` (grijs) |
| Positive | `#10B981` |
| Warning | `#F59E0B` |

Header: zwart (#111111), witte tekst. Geen gradient.

## Pagina's (6 tabs)

Dashboard | Evaluatie | Historie | Stats | Coaching | Profiel

## Data model

`DB.profile` — spelersprofiel (naam, geboortedatum, voet, positie, rugnummers)
`DB.activities[]` — ingevoerde evaluaties (training/wedstrijd/zaaltje met stats, gevoel, voorbereiding, focus)
`DB.historicalSeasons[]` — voorgeladen carrièredata
`DB.goals[]` — persoonlijke doelen
`DB.customCalEvents[]` — zelf ingeplande agenda-items
`DB.hiddenCalEvents[]` — id's van agenda-items die Irving heeft weggetikt
`DB.settings` — app-instellingen

## Activiteittypen

- **Wedstrijd**: team (JB/IJV), bond (SRZA/KNVB), tegenstander, speelminuten, volledige stats + evaluatie
- **Training**: maandagen bij IJV in Spakenburg, optioneel partijspel met stats, volledige evaluatie
- **Zaaltje**: zondagen in Sporthal de Vrijbuiter Almere, dedicated vragen (eigen spel, geoefend, ging goed, kan beter), geen stats

## Features

- **Dashboard**: 6 stats (3+3), dribbel split wedstrijden/trainingen, klikbare laatste activiteit, aankomende activiteiten uit de agenda
- **Aankomende activiteiten**: top 5 op het dashboard, "Bekijk alle" opent de volledige lijst in een modal. Per item "Evaluatie invullen" (vult type, datum, locatie en tegenstander voor), een × om hem weg te halen, en een + bovenaan om er zelf een in te plannen
- **Bewerken**: vanuit de detail modal een ingediende evaluatie aanpassen. `formState.editId` stuurt `saveActivity()` naar overschrijven in plaats van toevoegen — het id blijft gelijk en `nextActivityId` loopt niet op
- **Herhaal**: vanuit detail modal formulier voorvullen met type/team/locatie van een eerdere activiteit (verse datum, lege stats)
- **Vergelijk**: twee activiteiten naast elkaar met kleurcodering (groen=beter, rood=slechter) op dribbel%, schot%, goals, assists
- **Carrière**: gesplitst in KNVB en SRZA secties met subtotalen, training stats tellen niet mee in all-time
- **Profiel**: zwarte spelerskaart, dit seizoen stats, dribbels gesplitst per wedstrijden/trainingen
- **Voorbereiding**: checklist met "Geen bijzonderheden", gewicht/water met komma-invoer
- **Coaching engine**: Kaizen, PDCA, Hansei, Shoshin, Gambatte — concreet en feitelijk, nooit vaag

## Coaching engine (Japanse methoden)

- **Kaizen**: 1% verbetering per keer, concrete targets
- **PDCA**: Plan-Do-Check-Act cyclus
- **Hansei**: eerlijke zelfreflectie (gevoel vs. data)
- **Shoshin**: beginner's mind
- **Gambatte**: doorzetten, consistentie

## Conventies

- Geen comments in code tenzij niet-obvious waarom. De agenda-valkuilen hierboven zijn wél toegelicht in de code, want ze zijn niet af te leiden uit wat er staat.
- Geen externe dependencies in `index.html` behalve Google Fonts CDN (Inter). De scraper draait op de ingebouwde `fetch`, de smoke test op jsdom (devDependency, draait alleen in CI). `package.json` heeft `"type": "module"` — scripts gebruiken `import`, geen `require()`.
- Commit en push zelf als het werk af en getest is; niet aan Irving vragen of hij het even doet.
- Test altijd op mobile (375x812) — primair een telefoon-app.
- localStorage limiet (~5-10MB) — foto's eten dit op (profielfoto als base64 JPEG 200x200).
- Coaching tips altijd concreet en feitelijk, nooit vaag/zweverig.
- Training dot is rood (IJV), zaaltje dot is grijs, wedstrijd dot volgt teamkleur.
- Gewicht/water inputs: `type="text" inputmode="decimal"`, komma wordt omgezet naar punt.
- Duur/calorieën zijn placeholders (niet pre-filled), zaaltje datum prefilt op zondag, training op maandag.
