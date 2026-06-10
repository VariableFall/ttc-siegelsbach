/**
 * Zentraler Import der Vereinsdaten zur Build-Zeit.
 *
 * Quelle: public/data/*.json (von pipeline/fetch.mjs bzw. demo-daten.mjs)
 * Alle Seiten importieren NUR aus diesem Modul – nie direkt aus public/.
 */
import tabellenRaw from '../../public/data/tabellen.json';
import spielplanRaw from '../../public/data/spielplan.json';
import type {
  DatenDatei,
  MannschaftSpielplan,
  MannschaftTabellen,
} from '../lib/spieldaten';

export const tabellen = tabellenRaw as DatenDatei<MannschaftTabellen>;
export const spielplan = spielplanRaw as DatenDatei<MannschaftSpielplan>;
