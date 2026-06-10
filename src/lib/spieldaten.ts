export interface TabellenZeile {
  platz: number;
  mannschaft: string;
  spiele: number;
  siege: number;
  niederlagen: number;
  punkte: string;
  diff: string;
  eigenesTeam: boolean;
}

export interface Spiel {
  datum: string | null;
  uhrzeit: string | null;
  heim: string;
  gast: string;
  ergebnis: string | null;
  status: string;
  ort: string | null;
}

export interface MannschaftTabellen {
  name: string;
  ligaName: string;
  teamName: string;
  myttTabelleUrl: string;
  myttSpielplanUrl: string;
  tabelle: TabellenZeile[];
}

export interface MannschaftSpielplan {
  name: string;
  ligaName: string;
  teamName: string;
  myttTabelleUrl: string;
  myttSpielplanUrl: string;
  spiele: Spiel[];
}

export interface DatenDatei<T> {
  stand: string;
  quelle: string;
  demo: boolean;
  verband: string;
  saison: string;
  mannschaften: T[];
}

export interface SpielEintrag extends Spiel {
  mannschaft: string;
  ligaName: string;
}

export function formatStand(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatSpielDatum(datum: string | null, uhrzeit: string | null): string {
  if (!datum) return '–';
  const [y, m, d] = datum.split('-');
  const de = `${d}.${m}.${y}`;
  return uhrzeit ? `${de}, ${uhrzeit} Uhr` : de;
}

function parseDatum(datum: string | null): number {
  if (!datum) return 0;
  const t = new Date(`${datum}T00:00:00`).getTime();
  return Number.isNaN(t) ? 0 : t;
}

export function alleSpiele(spielplan: DatenDatei<MannschaftSpielplan>): SpielEintrag[] {
  return spielplan.mannschaften.flatMap((m) =>
    m.spiele.map((s) => ({
      ...s,
      mannschaft: m.name,
      ligaName: m.ligaName,
    })),
  );
}

export function naechsteSpiele(
  spielplan: DatenDatei<MannschaftSpielplan>,
  limit = 5,
): SpielEintrag[] {
  const heute = new Date();
  heute.setHours(0, 0, 0, 0);

  return alleSpiele(spielplan)
    .filter((s) => s.status === 'scheduled' && parseDatum(s.datum) >= heute.getTime())
    .sort((a, b) => {
      const diff = parseDatum(a.datum) - parseDatum(b.datum);
      if (diff !== 0) return diff;
      return (a.uhrzeit ?? '').localeCompare(b.uhrzeit ?? '');
    })
    .slice(0, limit);
}

export function letzteErgebnisse(
  spielplan: DatenDatei<MannschaftSpielplan>,
  limit = 5,
): SpielEintrag[] {
  return alleSpiele(spielplan)
    .filter((s) => s.status === 'done' && s.ergebnis)
    .sort((a, b) => parseDatum(b.datum) - parseDatum(a.datum))
    .slice(0, limit);
}

export function tabellenZeilenFuerUi(zeilen: TabellenZeile[]) {
  return zeilen.map((z) => ({
    platz: z.platz,
    team: z.mannschaft,
    spiele: z.spiele,
    punkte: z.punkte,
    diff: z.diff,
    eigenesTeam: z.eigenesTeam,
  }));
}

export function spieleChronologisch(spiele: Spiel[]): Spiel[] {
  return [...spiele].sort((a, b) => {
    const diff = parseDatum(a.datum) - parseDatum(b.datum);
    if (diff !== 0) return diff;
    return (a.uhrzeit ?? '').localeCompare(b.uhrzeit ?? '');
  });
}
