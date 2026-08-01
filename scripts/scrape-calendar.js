#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ICLOUD_URL = process.env.ICLOUD_URL ||
  'https://p184-caldav.icloud.com/published/2/MTM0MzQwNzM1MTEzNDM0MDhRYP0t0kgMW5GnZc4ablrmzns-XMQ9rZ3zFB5Lo9c2ixVIol9HsiglMVRhTY52yl5qCN83s-G6nEPRij712Mk';

const SRZA_URL = process.env.SRZA_URL ||
  'https://www.addevent.com/feed/ahmiheoiw.ics';

const VOETBAL_URL = process.env.VOETBAL_URL ||
  'https://data.sportlink.com/ical-person?token=ul836m7c1phnj7fe0ea6d39ms3';

const KEYWORDS_ICLOUD = ['#zaaltje', '#training', '#preseason', 'srza:', 'knvb:', '#zakiballi'];

const OUT = path.join(__dirname, '..', 'data', 'calendar.json');

function parseICS(text) {
  const events = [];
  const blocks = text.split('BEGIN:VEVENT');
  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i].split('END:VEVENT')[0];
    const ev = {};
    const lines = unfoldLines(block);
    for (const line of lines) {
      if (line.startsWith('SUMMARY:')) ev.summary = line.slice(8).trim();
      else if (line.startsWith('DTSTART')) ev.dtstart = parseDTValue(line);
      else if (line.startsWith('DTEND')) ev.dtend = parseDTValue(line);
      else if (line.startsWith('LOCATION:')) ev.location = line.slice(9).replace(/\\n/g, ', ').replace(/\\,/g, ',').trim();
      else if (line.startsWith('DESCRIPTION:')) ev.description = line.slice(12).replace(/\\n/g, '\n').replace(/\\,/g, ',').trim();
      else if (line.startsWith('UID:')) ev.uid = line.slice(4).trim();
    }
    if (ev.summary && ev.dtstart) events.push(ev);
  }
  return events;
}

function unfoldLines(text) {
  return text.replace(/\r\n /g, '').replace(/\r\n\t/g, '').split(/\r?\n/).map(l => l.trim()).filter(Boolean);
}

function parseDTValue(line) {
  const match = line.match(/[;:](\d{8}T?\d{0,6})/);
  if (!match) return null;
  const raw = match[1];
  if (raw.length === 8) {
    return { date: `${raw.slice(0,4)}-${raw.slice(4,6)}-${raw.slice(6,8)}`, time: null, allDay: true };
  }
  return {
    date: `${raw.slice(0,4)}-${raw.slice(4,6)}-${raw.slice(6,8)}`,
    time: `${raw.slice(9,11)}:${raw.slice(11,13)}`,
    allDay: false
  };
}

function classifyEvent(summary) {
  const s = summary.toLowerCase();
  if (s.includes('#zaaltje') || s.includes('#zakiballi')) return 'zaaltje';
  if (s.includes('#training')) return 'training';
  if (s.includes('#preseason')) return 'preseason';
  if (s.startsWith('srza:') || s.includes('srza:')) return 'srza';
  if (s.startsWith('knvb:') || s.includes('knvb:')) return 'knvb';
  if (s.includes('joga bonito')) return 'srza';
  return 'overig';
}

function isFutsalEvent(summary) {
  const s = summary.toLowerCase();
  return KEYWORDS_ICLOUD.some(kw => s.includes(kw));
}

function eventId(ev, source) {
  const key = `${source}|${ev.dtstart.date}|${ev.summary}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0;
  }
  return 'cal_' + Math.abs(hash).toString(36);
}

async function fetchFeed(url, label) {
  if (!url) return [];
  console.log(`Fetching ${label}: ${url.slice(0, 80)}...`);
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`  ${label} failed: ${res.status} ${res.statusText}`);
    return [];
  }
  const text = await res.text();
  const events = parseICS(text);
  console.log(`  ${label}: ${events.length} events parsed`);
  return events;
}

async function main() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  const cutoffStr = cutoff.toISOString().split('T')[0];

  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 6);
  const maxStr = maxDate.toISOString().split('T')[0];

  const icloudRaw = await fetchFeed(ICLOUD_URL, 'iCloud');
  const srzaRaw = await fetchFeed(SRZA_URL, 'SRZA');
  const voetbalRaw = await fetchFeed(VOETBAL_URL, 'Voetbal.nl');

  const output = [];
  const seen = new Set();

  for (const ev of icloudRaw) {
    if (!isFutsalEvent(ev.summary)) continue;
    if (ev.dtstart.date < cutoffStr || ev.dtstart.date > maxStr) continue;
    const id = eventId(ev, 'icloud');
    if (seen.has(id)) continue;
    seen.add(id);
    output.push({
      id,
      title: ev.summary,
      date: ev.dtstart.date,
      time: ev.dtstart.time,
      endTime: ev.dtend ? ev.dtend.time : null,
      location: ev.location || null,
      description: ev.description || null,
      source: 'icloud',
      type: classifyEvent(ev.summary)
    });
  }

  for (const ev of srzaRaw) {
    if (!ev.summary.toLowerCase().includes('joga bonito')) continue;
    if (ev.dtstart.date < cutoffStr || ev.dtstart.date > maxStr) continue;
    const dedup = `${ev.dtstart.date}|${ev.dtstart.time}`;
    if (seen.has(dedup)) continue;
    seen.add(dedup);
    const id = eventId(ev, 'srza');
    output.push({
      id,
      title: ev.summary,
      date: ev.dtstart.date,
      time: ev.dtstart.time,
      endTime: ev.dtend ? ev.dtend.time : null,
      location: ev.location || null,
      description: ev.description || null,
      source: 'srza',
      type: 'srza'
    });
  }

  for (const ev of voetbalRaw) {
    if (ev.dtstart.date < cutoffStr || ev.dtstart.date > maxStr) continue;
    const id = eventId(ev, 'voetbal');
    if (seen.has(id)) continue;
    seen.add(id);
    output.push({
      id,
      title: ev.summary,
      date: ev.dtstart.date,
      time: ev.dtstart.time,
      endTime: ev.dtend ? ev.dtend.time : null,
      location: ev.location || null,
      description: ev.description || null,
      source: 'voetbal',
      type: 'knvb'
    });
  }

  output.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return (a.time || '').localeCompare(b.time || '');
  });

  const data = { lastUpdated: new Date().toISOString(), events: output };
  fs.writeFileSync(OUT, JSON.stringify(data, null, 2) + '\n');
  console.log(`\nWrote ${output.length} events to data/calendar.json`);

  if (!output.length) {
    console.warn('Warning: 0 futsal events found — check feed URLs and filters');
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
