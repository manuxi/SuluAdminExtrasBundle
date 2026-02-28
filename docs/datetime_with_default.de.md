# DateTime With Default

Ein Datum-Zeit-Picker, der einen konfigurierbaren Standardwert über `schemaOptions` unterstützt. Anders als Sulus eingebauter `date`-Feldtyp wird hier `default_value` beim ersten Laden korrekt angewendet – eine bekannte Einschränkung von Sulus DatePicker, der `default_value`-Parameter ignoriert.

---

## Verwendung in XML-Formularen

```xml
<property name="publishDate" type="datetime_with_default" colspan="6">
    <meta>
        <title lang="de">Veröffentlichungsdatum</title>
        <title lang="en">Publish Date</title>
    </meta>
    <params>
        <param name="default_value"
               type="expression"
               value="service('my_service').getDefaultDate()"/>
    </params>
</property>
```

### Statischer Standardwert

```xml
<property name="eventDate" type="datetime_with_default" colspan="6">
    <meta>
        <title lang="de">Datum</title>
        <title lang="en">Date</title>
    </meta>
    <params>
        <param name="default_value" value="2026-01-01T10:00:00"/>
    </params>
</property>
```

---

## Funktionen

- **Standardwert-Unterstützung**: Wendet `default_value` aus `schemaOptions` bei `componentDidMount` an, wenn kein Wert gespeichert ist
- **Expression-Unterstützung**: Funktioniert mit Sulus `type="expression"`-Params zum Aufruf von PHP-Services für dynamische Standardwerte
- **Sulu-DatePicker**: Nutzt Sulus nativen `DatePicker` mit `dateFormat: true` und `timeFormat: true`
- **ISO-Format**: Speichert Werte als `YYYY-MM-DDTHH:mm:ss`

---

## Funktionsweise

Beim Laden prüft die Komponente:

1. Ob das Feld keinen gespeicherten Wert hat (`!value`)
2. Und ob ein `default_value` in `schemaOptions` existiert
3. Dann wird `onChange(defaultValue)` aufgerufen, um das Feld vorzubelegen

Der DatePicker zeigt entweder den gespeicherten Wert oder den Standardwert als Fallback an.

---

## Schema-Optionen

| Parameter | Typ | Standard | Beschreibung |
|-----------|-----|----------|--------------|
| `default_value` | `string` | — | Standard-Datetime im Format `YYYY-MM-DDTHH:mm:ss`. Unterstützt `type="expression"` für dynamische Werte. |

---

## Datenformat

```
2026-03-15T14:30:00
```

Format: `YYYY-MM-DDTHH:mm:ss`

---

## Komponenten

| Datei | Beschreibung |
|-------|--------------|
| `DateTimeWithDefault.js` | Eigenständige Komponente (erweitert nicht AbstractDateTime) |