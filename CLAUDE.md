# Futsal Coach

Persoonlijke futsal evaluatie & coaching app voor Irving Liesdek. Focus: betere dribbelaar, meer fitheid, meer zelfvertrouwen.

## Architectuur

Single-file HTML app (`index.html`, ~2800 regels). Alle CSS + JS inline, geen build step, geen framework. Draait op `python3 -m http.server 8778` via `.claude/launch.json`.

**Data**: localStorage key `futsalCoach_v1`. Geen backend/database. Alle state zit in het globale `DB` object (geladen bij start, gesaved na elke mutatie).

**Structuur van index.html**:
- CSS: variabelen, topbar, bottomnav, cards, buttons, forms, modals, toasts, app-specifieke componenten
- HTML body: 6 pagina's, bottomnav, modal overlay, toast
- JS data layer: DB, load/save, helpers, Monday generator, Kaizen quotes
- JS navigatie: tab switching, modal, toast
- JS pagina's: renderDashboard, renderEvaluatie, renderHistorie, renderStats, renderCoaching, renderProfiel
- JS coaching engine: generatePerformanceInsights, generatePreparationInsights, generateCoachingInsights, generateCareerInsights
- JS init

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
`DB.settings` — app-instellingen

## Activiteittypen

- **Wedstrijd**: team (JB/IJV), bond (SRZA/KNVB), tegenstander, speelminuten, volledige stats + evaluatie
- **Training**: maandagen bij IJV in Spakenburg, optioneel partijspel met stats, volledige evaluatie
- **Zaaltje**: zondagen in Sporthal de Vrijbuiter Almere, dedicated vragen (eigen spel, geoefend, ging goed, kan beter), geen stats

## Features

- **Dashboard**: 6 stats (3+3), dribbel split wedstrijden/trainingen, klikbare laatste activiteit, volgende training
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

- Geen comments in code tenzij niet-obvious waarom.
- Geen externe dependencies behalve Google Fonts CDN (Inter).
- Test altijd op mobile (375x812) — primair een telefoon-app.
- localStorage limiet (~5-10MB) — foto's eten dit op (profielfoto als base64 JPEG 200x200).
- Coaching tips altijd concreet en feitelijk, nooit vaag/zweverig.
- Training dot is rood (IJV), zaaltje dot is grijs, wedstrijd dot volgt teamkleur.
- Gewicht/water inputs: `type="text" inputmode="decimal"`, komma wordt omgezet naar punt.
- Duur/calorieën zijn placeholders (niet pre-filled), zaaltje datum prefilt op zondag, training op maandag.
