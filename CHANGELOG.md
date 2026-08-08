# Changelog

Alle noemenswaardige wijzigingen aan Futsal Coach worden hier bijgehouden.
Volgt [Semantic Versioning](https://semver.org/lang/nl/): `MAJOR.MINOR.PATCH`.

- **MAJOR** — breaking change aan datamodel of volledige redesign
- **MINOR** — nieuwe feature of significant gedragsverandering
- **PATCH** — bugfix, kleine aanpassing, tekst/label wijziging

## [1.6.1] - 2026-08-08

### Fixed
- De activiteiten-streak op het dashboard rekent nu met een week die op maandag begint. Een activiteit op zondag (zoals het zaaltje) telde eerder mee voor de week erna, waardoor de streak kon onderbreken of te hoog uitvallen

## [1.6.0] - 2026-08-04

### Added
- Ingediende evaluaties achteraf bewerken via "Bewerken" in het detailscherm
- Activiteiten verwijderen uit Aankomende activiteiten met de × — ook die uit de kalenderfeeds, die blijven weg na een sync. Ongedaan maken kan via de toast

## [1.5.0] - 2026-08-01

### Added
- Handmatig activiteiten inplannen via de + knop op het dashboard
- Formulier met type, datum, titel, tijd en locatie — opgeslagen in localStorage

## [1.4.1] - 2026-08-01

### Changed
- Maandagtrainingen automatisch zichtbaar in aankomende activiteiten (ook zonder kalender-event)
- "VVIJV Futsal" / "VVIJ Futsal" hernoemd naar "Ijsselmeervogels" in alle titels
- "Bekijk alle" link opent modal met volledig overzicht
- Voetbal.nl (sportlink) feed toegevoegd — KNVB-bekerwedstrijden verschijnen nu ook

## [1.4.0] - 2026-08-01

### Added
- Agenda-koppeling: iCloud, SRZA en voetbal.nl kalenders automatisch ophalen
- "Aankomende activiteiten" op het dashboard met datum, type-label en locatie
- "Evaluatie invullen" knop per activiteit — vult type, datum, locatie en tegenstander voor
- Dagelijkse GitHub Actions workflow (`calendar.yml`) die de feeds scraped
- Scraper (`scripts/scrape-calendar.js`) met ICS-parsing en filtering op futsal-events

## [1.3.2] - 2026-07-31

### Changed
- PIN opgeslagen als SHA-256 hash — niet meer leesbaar in broncode

## [1.3.1] - 2026-07-30

### Changed
- PIN-code gewijzigd

## [1.3.0] - 2026-07-30

### Added
- PIN-scherm bij het openen van de app (4-cijferige code, shake-animatie bij foute invoer)
- Auth-state onthouden in localStorage — PIN hoeft maar één keer per browser ingevoerd

## [1.2.0] - 2026-07-30

### Added
- CHANGELOG.md met retroactieve semver-toewijzing voor alle versies

## [1.1.1] - 2026-07-26

### Fixed
- Dashboard dribbels (Dribbels/act., Dribbel ratio) tellen nu alle activiteiten, niet alleen wedstrijden

## [1.1.0] - 2026-07-26

### Added
- Versienummer in topbar (zichtbaar op elke pagina)
- Smoke test (10 checks) met jsdom — `npm test`
- CI: `test.yml` (PRs) + `deploy.yml` (GitHub Pages, test-gated)
- Data versioning via `DATA_VERSION` + `migrateData()` voor toekomstige schema-wijzigingen
- Zaaltje teller op Stats en Profiel pagina's
- "Prestaties (wedstrijden)" labels op Stats en Profiel

### Changed
- Training stats uitgesloten van alle wedstrijd-aggregaten (dashboard, stats, profiel, coaching, goal progress)
- Stats Training tab toont alleen dribbels — geen goals, assists, schoten of conversie
- SW cache bump voor geforceerde update op devices

## [1.0.2] - 2026-07-25

### Removed
- "Alle data wissen" knop uit Profiel (te gevaarlijk, geen undo)

## [1.0.1] - 2026-07-25

### Added
- Herhaal: formulier voorvullen vanuit een eerdere activiteit (type, team, locatie)
- Vergelijk: twee activiteiten naast elkaar met kleurcodering (groen=beter, rood=slechter)

## [1.0.0] - 2026-07-20

### Added
- 6-tab app: Dashboard, Evaluatie, Historie, Stats, Coaching, Profiel
- Evaluatie formulier voor wedstrijd, training en zaaltje
- Dashboard met maandoverzicht (3+3 grid), dribbel split, laatste activiteit, volgende training
- Stats met periode-tabs (Alles, Joga Bonito, IJV, Training), trend-grafieken, doelen
- Coaching engine met Japanse methoden (Kaizen, PDCA, Hansei, Shoshin, Gambatte)
- Profiel met spelerskaart, dit-seizoen stats, carriere split KNVB/SRZA, dribbel split
- Carriere data voorgeladen (2024/25 + 2025/26)
- PWA: manifest.json + service worker, installeerbaar op iOS
- localStorage persistentie
- Voorbereiding checklist met "Geen bijzonderheden"
- Focus modus (1-3 focuspunten per activiteit)
- Doelen instellen (percentage, streak, volume)
- Data export (JSON backup)
