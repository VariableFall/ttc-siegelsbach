export const SITE_NAME = 'TTC Siegelsbach';

export const DEFAULT_DESCRIPTION =
  'Tischtennisverein in Siegelsbach seit 1968 – Training, Mannschaften und Volleyball im BATTV.';

export const PAGE_DESCRIPTIONS: Record<string, string> = {
  Start:
    'TTC Siegelsbach – Tischtennis in Siegelsbach seit 1968. Aktuelle Spiele, Training und Infos zur Volleyball-Abteilung.',
  'Über uns':
    'Geschichte, Vorstand und Mitgliedschaft beim TTC Siegelsbach – deinem Tischtennisverein im BATTV.',
  Training:
    'Trainingszeiten für Jugend und Erwachsene beim TTC Siegelsbach. Kostenloses Schnuppertraining – einfach vorbeikommen.',
  Mannschaften:
    'Tabellen und Spielpläne der TTC-Siegelsbach-Mannschaften im BATTV – aktuell und übersichtlich.',
  Anfahrt:
    'So findest du uns: Adresse, Karte und Parkhinweise zur Sporthalle des TTC Siegelsbach.',
  Volleyball:
    'Volleyball-Abteilung des TTC Siegelsbach – Training, Team und Kontakt.',
  Impressum: 'Impressum des TTC Siegelsbach e.V. – Angaben gemäß § 5 DDG.',
  Datenschutz:
    'Datenschutzerklärung der Vereinswebsite des TTC Siegelsbach – ohne Tracking und ohne Cookies.',
};

export function pageTitle(title: string): string {
  return title === 'Start' ? SITE_NAME : `${title} – ${SITE_NAME}`;
}
