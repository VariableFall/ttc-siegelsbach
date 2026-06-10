#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  createDateiKopf,
  createMannschaftBasis,
} from './lib/schema.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CONFIG_PATH = join(__dirname, 'config.json');
const OUT_TABELLEN = join(ROOT, 'public/data/tabellen.json');
const OUT_SPIELPLAN = join(ROOT, 'public/data/spielplan.json');

const DEMO_TABELLEN = {
  I: [
    { platz: 1, mannschaft: 'TTV Sulzfeld II', spiele: 6, siege: 5, niederlagen: 1, punkte: '10:2', diff: '+8', eigenesTeam: false },
    { platz: 2, mannschaft: 'TTC Siegelsbach I', spiele: 6, siege: 4, niederlagen: 2, punkte: '8:4', diff: '+4', eigenesTeam: true },
    { platz: 3, mannschaft: 'TV Eppingen II', spiele: 6, siege: 3, niederlagen: 3, punkte: '6:6', diff: '±0', eigenesTeam: false },
    { platz: 4, mannschaft: 'TSV Waibstadt', spiele: 6, siege: 2, niederlagen: 4, punkte: '4:8', diff: '-4', eigenesTeam: false },
    { platz: 5, mannschaft: 'TTC Waldangelloch II', spiele: 6, siege: 1, niederlagen: 5, punkte: '2:10', diff: '-8', eigenesTeam: false },
  ],
  II: [
    { platz: 1, mannschaft: 'TTV Eschelbronn', spiele: 6, siege: 5, niederlagen: 1, punkte: '10:2', diff: '+8', eigenesTeam: false },
    { platz: 2, mannschaft: 'SG Ittlingen/Kirchardt II', spiele: 6, siege: 4, niederlagen: 2, punkte: '8:4', diff: '+4', eigenesTeam: false },
    { platz: 3, mannschaft: 'TTC Siegelsbach II', spiele: 6, siege: 3, niederlagen: 3, punkte: '6:6', diff: '±0', eigenesTeam: true },
    { platz: 4, mannschaft: 'TTC Landshausen', spiele: 6, siege: 2, niederlagen: 4, punkte: '4:8', diff: '-4', eigenesTeam: false },
    { platz: 5, mannschaft: 'TSV Helmstadt', spiele: 6, siege: 1, niederlagen: 5, punkte: '2:10', diff: '-8', eigenesTeam: false },
  ],
  III: [
    { platz: 1, mannschaft: 'TTC Siegelsbach III', spiele: 4, siege: 3, niederlagen: 1, punkte: '6:2', diff: '+4', eigenesTeam: true },
    { platz: 2, mannschaft: 'TV Bad Rappenau III', spiele: 4, siege: 3, niederlagen: 1, punkte: '6:2', diff: '+4', eigenesTeam: false },
    { platz: 3, mannschaft: 'SV Gemmingen II', spiele: 4, siege: 2, niederlagen: 2, punkte: '4:4', diff: '±0', eigenesTeam: false },
    { platz: 4, mannschaft: 'TSV Nordheim', spiele: 4, siege: 1, niederlagen: 3, punkte: '2:6', diff: '-4', eigenesTeam: false },
    { platz: 5, mannschaft: 'TTV Reihen', spiele: 4, siege: 0, niederlagen: 4, punkte: '0:8', diff: '-8', eigenesTeam: false },
  ],
};

const DEMO_SPIELE = {
  I: [
    { datum: '2026-09-20', uhrzeit: '18:15', heim: 'TTC Siegelsbach I', gast: 'TV Eppingen II', ergebnis: null, status: 'scheduled', ort: 'Sporthalle Siegelsbach' },
    { datum: '2026-09-27', uhrzeit: '18:15', heim: 'TSV Waibstadt', gast: 'TTC Siegelsbach I', ergebnis: null, status: 'scheduled', ort: 'Turnhalle Waibstadt' },
    { datum: '2026-10-04', uhrzeit: '18:15', heim: 'TTC Siegelsbach I', gast: 'TTV Sulzfeld II', ergebnis: null, status: 'scheduled', ort: 'Sporthalle Siegelsbach' },
    { datum: '2026-05-10', uhrzeit: '18:15', heim: 'TTC Waldangelloch II', gast: 'TTC Siegelsbach I', ergebnis: '2:9', status: 'done', ort: 'Sporthalle Waldangelloch' },
    { datum: '2026-05-03', uhrzeit: '18:15', heim: 'TTC Siegelsbach I', gast: 'TSV Waibstadt', ergebnis: '9:1', status: 'done', ort: 'Sporthalle Siegelsbach' },
  ],
  II: [
    { datum: '2026-09-21', uhrzeit: '18:00', heim: 'TTC Siegelsbach II', gast: 'TTC Landshausen', ergebnis: null, status: 'scheduled', ort: 'Sporthalle Siegelsbach' },
    { datum: '2026-09-28', uhrzeit: '18:00', heim: 'TSV Helmstadt', gast: 'TTC Siegelsbach II', ergebnis: null, status: 'scheduled', ort: 'Gemeindehalle Helmstadt' },
    { datum: '2026-04-09', uhrzeit: '20:15', heim: 'TTC Siegelsbach II', gast: 'TTC Waldangelloch II', ergebnis: '2:9', status: 'done', ort: 'Sporthalle Siegelsbach' },
    { datum: '2026-04-13', uhrzeit: '20:00', heim: 'SG Ittlingen/Kirchardt II', gast: 'TTC Siegelsbach II', ergebnis: '9:0', status: 'done', ort: 'Festhalle Kirchardt' },
  ],
  III: [
    { datum: '2026-09-22', uhrzeit: '19:30', heim: 'SV Gemmingen II', gast: 'TTC Siegelsbach III', ergebnis: null, status: 'scheduled', ort: 'Turnhalle Gemmingen' },
    { datum: '2026-09-29', uhrzeit: '19:30', heim: 'TTC Siegelsbach III', gast: 'TSV Nordheim', ergebnis: null, status: 'scheduled', ort: 'Sporthalle Siegelsbach' },
    { datum: '2026-04-05', uhrzeit: '19:30', heim: 'TTC Siegelsbach III', gast: 'TTV Reihen', ergebnis: '9:0', status: 'done', ort: 'Sporthalle Siegelsbach' },
    { datum: '2026-04-12', uhrzeit: '19:30', heim: 'TV Bad Rappenau III', gast: 'TTC Siegelsbach III', ergebnis: '6:3', status: 'done', ort: 'Sporthalle Bad Rappenau' },
  ],
};

async function loadConfig() {
  const raw = await readFile(CONFIG_PATH, 'utf8');
  return JSON.parse(raw);
}

async function main() {
  const config = await loadConfig();
  const tabellen = createDateiKopf(config, true);
  const spielplan = createDateiKopf(config, true);

  for (const mannschaft of config.mannschaften) {
    const basis = createMannschaftBasis(config, mannschaft);
    const tabelle = DEMO_TABELLEN[mannschaft.name] ?? [];
    const spiele = DEMO_SPIELE[mannschaft.name] ?? [];

    tabellen.mannschaften.push({ ...basis, tabelle });
    spielplan.mannschaften.push({ ...basis, spiele });
  }

  await writeFile(OUT_TABELLEN, `${JSON.stringify(tabellen, null, 2)}\n`, 'utf8');
  await writeFile(OUT_SPIELPLAN, `${JSON.stringify(spielplan, null, 2)}\n`, 'utf8');

  console.log('Demo-Daten erzeugt:');
  console.log(`  ${OUT_TABELLEN}`);
  console.log(`  ${OUT_SPIELPLAN}`);
  console.log(`${config.mannschaften.length} Mannschaften, demo: true`);
}

main().catch((err) => {
  console.error('FEHLER:', err.message);
  process.exit(1);
});
