# Futsal Coach

Persoonlijke futsal evaluatie & coaching app voor Irving Liesdek. Focus: betere dribbelaar, meer fitheid, meer zelfvertrouwen.

## Architectuur

Single-file HTML app (`index.html`, ~2500 regels). Alle CSS + JS inline, geen build step, geen framework. Draait op `python3 -m http.server 8778` via `.claude/launch.json`.

**Data**: localStorage key `futsalCoach_v1`. Geen backend/database. Alle state zit in het globale `DB` object (geladen bij start, gesaved na elke mutatie).

**Structuur van index.html**:
- CSS: variabelen, topbar, bottomnav, cards, buttons, forms, modals, toasts, app-specifieke componenten
- HTML body: 6 pagina's, bottomnav, modal overlay, toast
- JS data layer: DB, load/save, helpers, Monday generator, Kaizen quotes
- JS navigatie: tab switching, modal, toast
- JS pagina's: renderDashboard, renderEvaluatie, renderHistoriek, renderStats, renderCoaching, renderProfiel
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

Dashboard | Evaluatie | Historiek | Stats | Coaching | Profiel

## Data model

`DB.profile` — spelersprofiel (naam, geboortedatum, voet, positie, rugnummers)
`DB.activities[]` — ingevoerde evaluaties (training/wedstrijd met stats, gevoel, voorbereiding, focus)
`DB.historicalSeasons[]` — voorgeladen carrièredata
`DB.goals[]` — persoonlijke doelen
`DB.settings` — app-instellingen

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
- localStorage limiet (~5-10MB) — geen foto's opslaan.
- Coaching tips altijd concreet en feitelijk, nooit vaag/zweverig.
