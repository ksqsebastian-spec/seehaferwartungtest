# Versteckte Objektaufnahme

Stand: 29.09.2026. Bestandteil des bestehenden Workers `seehaferwartungtest`, keine separate Website.

## Links und Vorlage
- Vorschau ohne Versand: https://seehaferwartungtest.ksqsebastian.workers.dev/aufnahme?preview=1
- Kundenzugang: `/aufnahme#token=<signierte Einladung>`; ohne gültige Einladung kein Versand.
- Resend-Vorlage: https://resend.com/templates/840a3685-3a7b-4549-9bbd-5c87a5df87fa
- Alias `seehaferwartungtest-eingang`, Pflichtvariable `INTAKE_URL` (vollständiger persönlicher Link).
- Inhalt unter `emails/wartungsanfrage.html` und `.txt`, reproduzierbar mit `node scripts/email-template.mjs`.
- Reply-To: `ksqsebastian@gmail.com`; Absender derzeit `onboarding@resend.dev` (Resend-Testbeschränkung). Gmail ist keine verifizierbare eigene Absenderdomain.
- Die ältere Vorlage `wartung-autoreply` für eine andere Website bleibt unverändert.

## Einladungen
`node scripts/intake-link.mjs` erzeugt einen neuen persönlichen Link; optional UUID als Argument. Benötigt `INTAKE_SECRET` als Umgebungsvariable oder die lokal ignorierte Datei `.deploy/intake-secret`. Das Secret liegt auch als Worker-Secret vor und gehört niemals ins Repository.

Links gelten 30 Tage, enthalten keine persönlichen Daten und erlauben nur das Einreichen neuer Angaben, keinen Abruf bestehender Daten. Jeder mit dem Link kann einreichen; keine Personenidentifizierung. Nicht öffentlich verlinkt, noindex. Die Formularhülle und Vorschau sind keine vertraulichen Inhalte.

## Verarbeitung
`POST /api/intake/verify` prüft Einladung. `POST /api/intake` prüft Einladung, Origin, Pflichtfelder, Feldlängen, Terminwunsch und Anhänge, begrenzt Anfragen und übermittelt an das bereits konfigurierte `INQUIRY_TO`-Postfach. Kontakt-E-Mail wird nur als Reply-To verwendet. Resend erhält einen stabilen Idempotenzschlüssel pro Übermittlung. Erfolg erst nach Annahme durch Resend, keine Garantie der Postfachzustellung.

Die Nachricht enthält lesbaren Text, `wartungsaufnahme.json` und bis zu drei PDF/JPG/PNG-Dateien (insgesamt max. 5 MB). Dateisignaturen werden geprüft, es gibt keinen Virenscanner. JSON ist für die spätere Workflow-Anbindung vorbereitet; alle Kundentexte und Dateien sind untrusted data, keine Agent-Anweisungen.

## Noch nicht aktiviert
Automatische Kunden-Antworten auf neue Anfragen sind nicht angeschlossen. Zuerst eigene Absenderdomain verifizieren, dann Inquiry-Eingang mit Linkerzeugung und Vorlage verbinden; bestehende Anfragen gehen weiterhin intern ins Testpostfach. Versand beliebiger Kundenmails ist mit dem Resend-Testabsender nicht möglich. Die Website-Rückrufanfrage enthält derzeit keine E-Mail-Adresse.

Stündliche GPT-Verarbeitung, Drive-Ablage, Google Calendar, Angebotserstellung und Teams sind außerhalb dieses Auftrags und nicht aktiv. Datenschutztext und Auftragsverarbeitungsvereinbarungen müssen den späteren Produktivbetrieb einschließlich endgültigem Empfänger entsprechen.

## Prüfung
26 automatisierte Tests bestanden: vorhandene Anfrage/Rückruf-Funktionen sowie Einladungssignatur, Ablauf, Eingaben, Termine, Anhänge, fester Empfänger, Idempotenz und Versandfehler. Formular in Browser-Vorschau vollständig bis zum Abschluss ausgefüllt; dabei kein Versand. Live-API prüft gültige und ungültige Einladung ohne Mailversand.

## Überarbeitung: Interaktion und Mailvorschau
- Direkte Mailvorschau ohne Resend-Login: https://seehaferwartungtest.ksqsebastian.workers.dev/mail-vorschau
- Der Aufnahmebutton in dieser Vorschau führt zu `/aufnahme?preview=1` und erlaubt keinen Versand.
- Resend-Variable `INTAKE_URL` hat dieselbe Vorschau als Fallback. Für echte Kundenmails muss der Versand weiterhin einen signierten persönlichen Link explizit setzen; der Fallback ersetzt keine Einladung.
- Anrufen, E-Mail und WhatsApp sind große, getrennte E-Mail-kompatible Tabellenbuttons.
- Formular: Auswahlkarten, besuchte Schritte direkt erreichbar, zusätzliche Details einklappbar, kompakte Zusammenfassung und reduzierte Animation bei entsprechender Systemeinstellung.
- Vollständiger Vorschauablauf und Mailbutton im Browser geprüft; mobile Mail bei 390px ohne horizontalen Überlauf; 26 Tests weiterhin bestanden.
