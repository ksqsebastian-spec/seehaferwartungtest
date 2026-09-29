# Release-Prüfung – 29.09.2026

Status: Vorschau veröffentlicht, noch keine vollständige Freigabe für den Produktivstart.

## Geprüft
- 17 automatisierte Tests für Anfrage-/Rückrufvalidierung, Fehlerbehandlung, Rate Limit und Idempotenz erfolgreich.
- Impressum-Link führt zur Unternehmenswebsite; keine lokale Kopie.
- Datenschutzdialog enthält Cloudflare und Resend, verweist zusätzlich auf Unternehmenshinweise.
- Team: aktuelle Live-Kontakt- und Über-uns-Seiten führen Tobias Blöhse, Nils Bonk und Mark Grabianowski. Suchindex enthält noch Jan Bradford; nicht aus dem veralteten Index übernommen.

## Vor Produktivstart offen
- Verifizierte Absenderdomain und Unternehmensabsender bei Resend konfigurieren; src/worker.js verwendet derzeit onboarding@resend.dev.
- Produktiv-Empfängerpostfach bestätigen und umstellen (bisher Test-/Betreiberpostfach); realen Eingang von Anfrage und Rückruf nach Umstellung prüfen.
- Vollständige, zu dieser Website passende Datenschutzinformation: Rückruffelder, Rechtsgrundlagen, Empfänger, Aufbewahrung, Betroffenenrechte, Cloudflare/Resend-Verträge und ggf. Drittlandtransfers prüfen. Keine pauschale Kopie einer anderen technischen Website.
- Unternehmens-Impressum auf Aktualität prüfen; gefundene Quelle nennt noch TMG und die alte OS-Plattform.
- Referenznamen, Zahlen und Leistungsversprechen durch Projektunterlagen bestätigen. Entfernte Musterkennzahlen sind kein Nachweis für die übrigen Aussagen.
- Finale Domain und korrekte kanonische URL festlegen; finale mobile Prüfung und Versandtest auf dieser Domain.

Quellen: https://seehafer-elemente.de/kontakt, https://seehafer-elemente.de/ueber-uns, https://seehafer-elemente.de/impressum, https://seehafer-elemente.de/datenschutz
