# Holiday Dates

Ein Datumsbereiche-Manager für Betriebsferien, Brückentage und sonstige Schließzeiten. Unterstützt jährlich wiederkehrende Zeiträume (z.B. „Weihnachtspause jedes Jahr") und berechnet die Gesamtanzahl der Tage automatisch.

![holidayDates](img/holidayDates.de.png)

---

## Verwendung in XML-Formularen

```xml
<property name="holidayDates" type="holiday_dates" colspan="12">
    <meta>
        <title lang="de">Betriebsferien &amp; Sonderzeiten</title>
        <title lang="en">Company Holidays &amp; Special Periods</title>
    </meta>
</property>
```

---

## Funktionen

- **Datumsbereiche**: Start- und Enddatum über Sulu-DatePicker
- **Bezeichnung**: Freitext-Beschreibung für jeden Zeitraum
- **Wiederkehrend-Toggle**: Zeiträume als jährlich wiederkehrend markieren (Monat-Tag-Vergleich)
- **Tagezähler**: Automatische Summe der Einträge und Tage in der Fußzeile
- **Hinzufügen/Entfernen**: Dynamische Liste mit Buttons über Sulu-Icon-Komponenten
- **Übersetzungen**: Alle Beschriftungen über `translate()` via `admin.de.yaml` / `admin.en.yaml`

---

## Datenstruktur (JSON)

Das Feld speichert ein Array von Zeitraum-Objekten:

```json
[
    {
        "start": "2026-12-23",
        "end": "2027-01-02",
        "label": "Weihnachtspause",
        "recurring": true
    },
    {
        "start": "2026-05-15",
        "end": "2026-05-15",
        "label": "Brückentag (Himmelfahrt)",
        "recurring": false
    }
]
```

| Schlüssel | Typ | Beschreibung |
|-----------|-----|--------------|
| `start` | `string` | Startdatum im Format `YYYY-MM-DD` |
| `end` | `string` | Enddatum im Format `YYYY-MM-DD` |
| `label` | `string` | Beschreibung des Zeitraums |
| `recurring` | `boolean` | Ob der Zeitraum jährlich wiederkehrt |

---

## Wiederkehrende Zeiträume

Wenn `recurring` auf `true` steht, wird der Jahresteil der Daten ignoriert. Die Prüfung verwendet nur den **Monat-Tag-Vergleich**:

```php
// Ein Datum fällt in einen wiederkehrenden Zeitraum wenn:
$dateMd = $date->format('m-d');       // z.B. "12-25"
$startMd = substr($start, 5);         // z.B. "12-23"
$endMd = substr($end, 5);             // z.B. "01-02"

if ($dateMd >= $startMd && $dateMd <= $endMd) {
    // Kein Arbeitstag
}
```

> **Hinweis**: Jahresübergreifende wiederkehrende Zeiträume (z.B. 23. Dez – 2. Jan) erfordern Sonderbehandlung im Backend. Der einfache Monat-Tag-Vergleich funktioniert für Zeiträume innerhalb eines Kalenderjahres.

---

## PHP-Zugriff

```php
$holidayDates = $settings->getHolidayDates();

foreach ($holidayDates as $period) {
    $start = $period['start'];        // "2026-12-23"
    $end = $period['end'];            // "2027-01-02"
    $label = $period['label'];        // "Weihnachtspause"
    $recurring = $period['recurring']; // true
}
```

---

## Komponenten

| Datei | Beschreibung |
|-------|--------------|
| `HolidayDates.js` | FieldType-Wrapper |
| `HolidayDatesEditor.js` | Interaktiver Editor mit Datumsbereichen |
| `HolidayDates.scss` | Styles (Sulu-Farbvariablen) |
| `HolidayDatesPropertyResolver.php` | Content-API-Resolver |