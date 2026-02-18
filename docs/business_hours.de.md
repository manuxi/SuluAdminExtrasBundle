# Business Hours

Ein kompakter Wochenplan-Editor, der mehrere einzelne Zeitfelder durch ein einziges JSON-basiertes Feld ersetzt. Tage können aktiviert/deaktiviert werden, Zeitfenster gesetzt, Pausen umgeschaltet und die Montag-Konfiguration auf alle Werktage kopiert werden.

![businessHours](img/businessHours.de.png)

---

## Verwendung in XML-Formularen

```xml
<property name="businessHours" type="business_hours" colspan="12">
    <meta>
        <title lang="de">Arbeitszeiten</title>
        <title lang="en">Business Hours</title>
    </meta>
</property>
```

---

## Funktionen

- **Toggle pro Tag**: Einzelne Wochentage über Sulu-Toggler aktivieren/deaktivieren
- **Zeitfenster**: Sulu-DatePicker (Nur-Zeit-Modus, `HH:mm` Format) für Start- und Endzeiten
- **Pausen-Toggle**: Tag in zwei Slots aufteilen (Vormittag/Nachmittag) oder zu einem durchgehenden Block zusammenführen
- **Kopierfunktion**: „Mo → Di–Fr"-Button kopiert die Montag-Konfiguration auf alle weiteren Werktage
- **Übersetzungen**: Alle Beschriftungen über `translate()` via `admin.de.yaml` / `admin.en.yaml`

---

## Datenstruktur (JSON)

Das Feld speichert ein JSON-Objekt mit einem Eintrag pro Wochentag:

```json
{
    "monday": {
        "enabled": true,
        "break": true,
        "slots": [
            {"start": "08:00", "end": "12:00"},
            {"start": "13:00", "end": "17:00"}
        ]
    },
    "tuesday": {
        "enabled": true,
        "break": false,
        "slots": [
            {"start": "08:00", "end": "17:00"}
        ]
    },
    "saturday": {
        "enabled": false,
        "break": false,
        "slots": []
    }
}
```

| Schlüssel | Typ | Beschreibung |
|-----------|-----|--------------|
| `enabled` | `boolean` | Ob der Tag ein Arbeitstag ist |
| `break` | `boolean` | Ob der Tag eine Mittagspause hat (2 Slots statt 1) |
| `slots` | `array` | Array von `{start, end}` Objekten im `HH:mm`-Format |

---

## Standardwerte

Ohne gespeicherten Wert werden Werktage (Mo–Fr) mit `08:00–12:00 / 13:00–17:00` und aktivierter Pause vorbelegt. Samstag und Sonntag sind deaktiviert.

---

## PHP-Zugriff

```php
$businessHours = $settings->getBusinessHours();

// Slots für einen bestimmten Tag
$monday = $businessHours['monday'] ?? null;
if ($monday && $monday['enabled']) {
    foreach ($monday['slots'] as $slot) {
        $start = $slot['start']; // "08:00"
        $end = $slot['end'];     // "12:00"
    }
}
```

---

## Benötigte Übersetzungen

| Schlüssel | DE | EN |
|-----------|----|----|
| `sulu_admin_extras.business_hours.apply_to_weekdays` | Mo → Di–Fr | Mon → Tue–Fri |
| `sulu_admin_extras.business_hours.break` | Pause | Break |
| `sulu_admin_extras.weekday.monday` … `.sunday` | Montag … Sonntag | Monday … Sunday |

---

## Komponenten

| Datei | Beschreibung |
|-------|--------------|
| `BusinessHours.js` | FieldType-Wrapper |
| `BusinessHoursEditor.js` | Interaktive Editor-Komponente |
| `BusinessHours.scss` | Styles (Sulu-Farbvariablen) |
| `BusinessHoursPropertyResolver.php` | Content-API-Resolver |