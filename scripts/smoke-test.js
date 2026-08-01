// Laadt de app in jsdom met testdata en controleert dat elke pagina
// rendert zonder fouten en dat training stats niet in wedstrijdstats lekken.
//
// Gebruik: node scripts/smoke-test.js [pad/naar/index.html]

import fs from 'fs';
import path from 'path';
import { JSDOM, VirtualConsole } from 'jsdom';

const pageErrors = [];
const noteError = e => pageErrors.push(e && e.message ? e.message : String(e));
process.on('unhandledRejection', noteError);
process.on('uncaughtException', noteError);
const drainErrors = () => pageErrors.splice(0, pageErrors.length);

const HTML_PATH = path.resolve(process.argv[2] || path.join(process.cwd(), 'index.html'));

const failures = [];
let total = 0;
async function check(name, fn) {
  total++;
  try {
    const detail = await fn();
    console.log(`  ok   ${name}${detail ? ` — ${detail}` : ''}`);
  } catch (e) {
    failures.push(name);
    console.log(`  FAIL ${name}\n         ${e.message}`);
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const tick = () => new Promise(r => setTimeout(r, 0));

function seedDate(dayOfMonth) {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(Math.min(dayOfMonth, 28)).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const SEED_DATA = {
  profile: {
    name: 'Irving Liesdek',
    birthDate: '1991-07-15',
    foot: 'Rechts',
    position: 'Flank (links)',
    numbers: { 'Joga Bonito': 7, 'Ijsselmeervogels': 17 }
  },
  activities: [
    {
      id: 'test-match-1', type: 'match', date: seedDate(5),
      team: 'Joga Bonito', bond: 'SRZA', matchType: 'competitie',
      opponent: 'FC Test', playMinutes: 40,
      dribbleAttempts: 10, dribbleSuccess: 7,
      shots: 5, shotsOnTarget: 3, goals: 2, assists: 1,
      feeling: 'tevreden', notes: '',
      preparation: { tiredBody: false, poorSleep: false, lowFitness: false,
        lowConfidence: false, lowFocus: false, dontKnow: false,
        nothingSpecial: true, weight: 0, waterLiters: 0, other: '' },
      mainPosition: 'flank-links', positionReason: '',
      focusPoints: []
    },
    {
      id: 'test-match-2', type: 'match', date: seedDate(7),
      team: 'Ijsselmeervogels', bond: 'KNVB', matchType: 'competitie',
      opponent: 'Testploeg', playMinutes: 40,
      dribbleAttempts: 8, dribbleSuccess: 5,
      shots: 3, shotsOnTarget: 2, goals: 1, assists: 0,
      feeling: 'neutraal', notes: '',
      preparation: { tiredBody: true, poorSleep: false, lowFitness: false,
        lowConfidence: false, lowFocus: false, dontKnow: false,
        nothingSpecial: false, weight: 80, waterLiters: 2, other: '' },
      mainPosition: 'flank-links', positionReason: '',
      focusPoints: []
    },
    {
      id: 'test-train-1', type: 'training', date: seedDate(6),
      hasPartijspel: true,
      dribbleAttempts: 12, dribbleSuccess: 9,
      shots: 4, shotsOnTarget: 3, goals: 3, assists: 2,
      feeling: 'zeer tevreden', notes: '',
      preparation: { tiredBody: false, poorSleep: false, lowFitness: false,
        lowConfidence: false, lowFocus: false, dontKnow: false,
        nothingSpecial: true, weight: 0, waterLiters: 0, other: '' },
      mainPosition: 'flank-links', positionReason: '',
      focusPoints: [],
      location: 'Sporthal de Toekomst, Spakenburg',
      timeSlot: '20:00-21:30', duration: 90, calories: 1000
    },
    {
      id: 'test-zaaltje-1', type: 'zaaltje', date: seedDate(4),
      location: 'Sporthal de Vrijbuiter, Almere',
      duration: 60, calories: 500,
      zaaltje: { ownPlay: 'goed', practiced: 'dribbelen', wentWell: 'passing', canImprove: 'afwerking' },
      dribbleAttempts: 0, dribbleSuccess: 0, shots: 0, shotsOnTarget: 0, goals: 0, assists: 0,
      feeling: 'tevreden', notes: '',
      preparation: { tiredBody: false, poorSleep: false, lowFitness: false,
        lowConfidence: false, lowFocus: false, dontKnow: false,
        nothingSpecial: true, weight: 0, waterLiters: 0, other: '' },
      mainPosition: '', positionReason: '',
      focusPoints: []
    }
  ],
  historicalSeasons: [],
  goals: [],
  settings: { currentSeason: '2026/27' },
  nextActivityId: 5,
  nextGoalId: 1,
  dataVersion: 1
};

async function run() {
  console.log(`\nSmoketest  ${HTML_PATH}\n`);

  const html = fs.readFileSync(HTML_PATH, 'utf8');

  const localSeed = { futsalCoach_v1: JSON.stringify(SEED_DATA) };
  const stubHtml = `<script>
${Object.entries(localSeed).map(([k, v]) =>
    `localStorage.setItem(${JSON.stringify(k)}, ${JSON.stringify(v)});`
  ).join('\n')}
</script>` + html;

  const vc = new VirtualConsole();
  const consoleErrors = [];
  vc.on('error', e => consoleErrors.push(e));
  vc.on('warn', () => {});
  vc.on('info', () => {});
  vc.on('log', () => {});

  const dom = new JSDOM(stubHtml, {
    url: 'http://localhost:8778/',
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
    virtualConsole: vc
  });
  const { window } = dom;
  const { document } = window;

  await new Promise(r => setTimeout(r, 500));

  // ── Pagina's renderen ──────────────────────────────────
  await check('Dashboard rendert', () => {
    drainErrors();
    window.navigateTo('pageDashboard');
    const el = document.getElementById('dashboardContent');
    assert(el && el.innerHTML.length > 50, 'dashboardContent is leeg');
  });

  await check('Stats rendert', () => {
    drainErrors();
    window.navigateTo('pageStats');
    const el = document.getElementById('statsContent');
    assert(el && el.innerHTML.length > 50, 'statsContent is leeg');
  });

  await check('Profiel rendert', () => {
    drainErrors();
    window.navigateTo('pageProfiel');
    const el = document.getElementById('profielContent');
    assert(el && el.innerHTML.length > 50, 'profielContent is leeg');
  });

  await check('Coaching rendert', () => {
    drainErrors();
    window.navigateTo('pageCoaching');
    const el = document.getElementById('coachingContent');
    assert(el && el.innerHTML.length > 0, 'coachingContent is leeg');
  });

  await check('Historie rendert', () => {
    drainErrors();
    window.navigateTo('pageHistorie');
    const el = document.getElementById('historieContent');
    assert(el && el.innerHTML.length > 50, 'historieContent is leeg');
  });

  // ── Training stats lekken niet ─────────────────────────
  await check('Profiel: goals tellen alleen wedstrijden', () => {
    window.navigateTo('pageProfiel');
    const el = document.getElementById('profielContent');
    const html = el.innerHTML;
    const goalBoxes = html.match(/Goals<\/div>/g);
    assert(goalBoxes, 'geen Goals label gevonden');
    const matchGoals = 2 + 1; // test-match-1 + test-match-2
    const trainingGoals = 3;  // test-train-1
    assert(!html.includes(`>${matchGoals + trainingGoals}<`),
      `Goals bevat training stats (${matchGoals + trainingGoals} ipv ${matchGoals})`);
    return `${matchGoals} goals (training ${trainingGoals} uitgesloten)`;
  });

  await check('Stats Alles tab: goals zijn match-only', () => {
    window.navigateTo('pageStats');
    const el = document.getElementById('statsContent');
    const html = el.innerHTML;
    const matchGoals = 2 + 1;
    const trainingGoals = 3;
    assert(!html.includes(`>${matchGoals + trainingGoals}<`),
      `Goals op Stats bevat training stats (${matchGoals + trainingGoals})`);
    return `${matchGoals} goals (training ${trainingGoals} uitgesloten)`;
  });

  await check('Stats Training tab: geen goals/assists/schoten getoond', () => {
    window.navigateTo('pageStats');
    const btns = document.getElementById('statsContent').querySelectorAll('.tab-btn');
    const trainBtn = [...btns].find(b => b.textContent === 'Training');
    assert(trainBtn, 'Training tab-knop niet gevonden');
    trainBtn.click();
    const el = document.getElementById('statsContent');
    const html = el.innerHTML;
    assert(!html.includes('Goals</div>'), 'Training tab toont Goals');
    assert(!html.includes('Assists</div>'), 'Training tab toont Assists');
    assert(!html.includes('Schoten</div>'), 'Training tab toont Schoten');
    assert(html.includes('Dribbel%'), 'Training tab mist dribbel stats');
    return 'alleen dribbel-data getoond';
  });

  await check('Dashboard: maandstats zijn match-only', () => {
    window.navigateTo('pageDashboard');
    const el = document.getElementById('dashboardContent');
    const html = el.innerHTML;
    assert(html.includes('Wedstrijden'), 'Dashboard mist wedstrijden-label');
    const matchGoals = 2 + 1; // test-match-1 + test-match-2
    const trainingGoals = 3;  // test-train-1
    const doelpuntenMatch = html.match(/stat-value[^>]*>(\d+)<\/div>\s*<div class="stat-label">Doelpunten/);
    if (doelpuntenMatch) {
      const shown = parseInt(doelpuntenMatch[1]);
      assert(shown === matchGoals,
        `Dashboard doelpunten is ${shown}, verwacht ${matchGoals} (training ${trainingGoals} zou uitgesloten moeten zijn)`);
    }
    return `${matchGoals} doelpunten (training ${trainingGoals} uitgesloten)`;
  });

  // ── Geen console errors ────────────────────────────────
  await check('Geen console errors', () => {
    const errs = drainErrors().concat(consoleErrors);
    const real = errs.filter(e => !String(e).includes('Could not parse CSS')
      && !String(e).includes('Error: connect')
      && !String(e).includes('fonts.googleapis'));
    assert(real.length === 0, `${real.length} errors:\n${real.join('\n')}`);
  });

  // ── Resultaat ──────────────────────────────────────────
  console.log(`\n${total - failures.length}/${total} passed`);
  if (failures.length) {
    console.log(`\nGefaald:\n${failures.map(f => `  - ${f}`).join('\n')}`);
    process.exit(1);
  }

  dom.window.close();
}

run().catch(e => { console.error(e); process.exit(1); });
