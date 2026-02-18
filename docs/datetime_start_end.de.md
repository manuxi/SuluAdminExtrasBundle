# DateTime Start / End

Ein verknüpftes Paar von Datum-Zeit-Pickern für Terminplanungs-Szenarien. `datetime_start` kann die Endzeit automatisch berechnen, gegen Geschäftszeiten validieren und den nächsten freien Slot finden. `datetime_end` prüft, dass die Endzeit nicht vor der Startzeit liegt.

Beide erweitern `AbstractDateTime`, das einen Sulu-DatePicker mit Datum + Zeit-Format und `default_value`-Unterstützung über `schemaOptions` bereitstellt.

![datetime_start_end](img/datetime_start_end.normal.de.png)
![datetime_start_end](img/datetime_start_end.warning.de.png)
![datetime_start_end](img/datetime_start_end.error.de.png)

---

## Verwendung in XML-Formularen

```xml
<property name="start" type="datetime_start" mandatory="true" colspan="6">
    <meta>
        <title lang="de">Start</title>
        <title lang="en">Start</title>
    </meta>
    <params>
        <param name="step" value="15"/>
        <param name="end_date_field" value="end"/>
        <param name="default_duration" value="15"/>
        <param name="auto_update" value="always"/>
        <param name="settings_resource_key" value="appointment_settings"/>
    </params>
</property>

<property name="end" type="datetime_end" mandatory="true" colspan="6">
    <meta>
        <title lang="de">Ende</title>
        <title lang="en">End</title>
    </meta>
    <params>
        <param name="step" value="15"/>
        <param name="start_date_field" value="start"/>
    </params>
</property>
```

---

## Funktionen

### datetime_start

- **Automatische Endzeit**: Bei Änderung des Starts wird das End-Feld automatisch auf `Start + default_duration` gesetzt
- **Geschäftszeiten-Validierung**: Bei gesetztem `settings_resource_key` werden Einstellungen über Sulus ResourceRequester geladen und Zeiten gegen konfigurierte Vormittag-/Nachmittag-Slots validiert
- **Nächster freier Slot**: Beim ersten Laden (kein Wert) wird automatisch der nächste verfügbare Zeitslot innerhalb der Geschäftszeiten im 7-Tage-Fenster gesucht
- **Minuten-Schrittweite**: Konfigurierbar über `step`-Parameter (Standard: 15 Minuten)
- **Warnhinweis**: Zeigt eine gelbe Warnung an, wenn die gewählte Zeit außerhalb der Geschäftszeiten liegt

### datetime_end

- **Start-Validierung**: Vergleicht gegen das verknüpfte Start-Feld und zeigt einen Fehler, wenn Ende vor Start liegt
- **Minuten-Schrittweite**: Konfigurierbar über `step`-Parameter (Standard: 1 Minute)
- **Fehlermeldung**: Zeigt eine rote Fehlermeldung über `translate('sulu_admin_extras.errors.start_after_end')`

---

## Schema-Optionen

### datetime_start

| Parameter | Typ | Standard | Beschreibung |
|-----------|-----|----------|--------------|
| `step` | `integer` | `15` | Minuten-Schrittweite für den Zeitpicker |
| `end_date_field` | `string` | `'end'` | Name des End-Datum-Feldes für Auto-Update |
| `default_duration` | `integer` | `15` | Dauer in Minuten für die automatische Endzeit |
| `auto_update` | `string` | `'always'` | Wann Auto-Update: `'always'`, `'initial'` (nur wenn Ende leer), `'never'` |
| `settings_resource_key` | `string` | — | Sulu-Resource-Key zum Laden der Geschäftszeiten-Einstellungen |
| `default_value` | `string` | — | Standard-Datetime im Format `YYYY-MM-DDTHH:mm:ss` (geerbt von AbstractDateTime) |

### datetime_end

| Parameter | Typ | Standard | Beschreibung |
|-----------|-----|----------|--------------|
| `step` | `integer` | `1` | Minuten-Schrittweite für den Zeitpicker |
| `start_date_field` | `string` | `'start'` | Name des Start-Datum-Feldes zur Validierung |
| `default_value` | `string` | — | Standard-Datetime im Format `YYYY-MM-DDTHH:mm:ss` (geerbt von AbstractDateTime) |

---

## Datenformat

Beide Felder speichern ihren Wert als ISO-String:

```
2026-03-15T14:30:00
```

Format: `YYYY-MM-DDTHH:mm:ss`

---

## Geschäftszeiten-Validierung (datetime_start)

Bei konfiguriertem `settings_resource_key` wird die Komponente:

1. Einstellungen über `ResourceRequester.get(settingsResourceKey)` laden
2. Vormittag-/Nachmittag-Slots pro Wochentag auslesen (z.B. `mondayMorningStart`, `mondayAfternoonEnd`)
3. Die gewählte Zeit gegen verfügbare Slots validieren
4. Beim ersten Laden `findNextAvailableSlot()` aufrufen, um den nächsten gültigen Zeitslot im 7-Tage-Fenster zu wählen

---

## Komponenten

| Datei | Beschreibung |
|-------|--------------|
| `AbstractDateTime.js` | Basisklasse mit DatePicker, Default-Wert-Handling und `afterChange()`-Hook |
| `DateTimeStart.js` | Erweitert AbstractDateTime um Geschäftszeiten-Validierung und Auto-Endzeit |
| `DateTimeEnd.js` | Erweitert AbstractDateTime um Start-vor-Ende-Validierung |