# Star Rating (Bewertung)

Das **Star Rating** Feature ermöglicht die Verwaltung und Visualisierung von Bewertungen in Ihrer Sulu-Applikation. Es besteht aus zwei Komponenten:
1. **Content Type**: Zum Zuweisen von Bewertungen in Formularen.
2. **List Transformer**: Zur Anzeige von Bewertungen in der Listenansicht.

---

## 1. Content Type (Eingabe)

Verwenden Sie den Typ `star_rating` in Ihrer Formular-XML-Definition, um Redakteuren das Setzen einer Bewertung zu ermöglichen.

### Verwendung

```xml
<property name="rating" type="star_rating">
    <meta>
        <title lang="en">Rating</title>
        <title lang="de">Bewertung</title>
    </meta>
    <params>
        <param name="max_value" type="expression" value="service('sulu_admin_extras.rating_selection').getMaxValue()"/>
    </params>
</property>
```
> [!IMPORTANT]
> Sie **müssen** den oben stehenden Ausdruck verwenden, um `max_value` vom Service zu laden. `value="5"` hardzucodieren wird nicht empfohlen, wenn Sie die globale Konfiguration nutzen möchten.

### Parameter

| Name        | Typ     | Standard | Beschreibung |
|-------------|---------|----------|--------------|
| `max_value` | Integer | `5`      | Die maximale Anzahl der Sterne (Skala). Üblicherweise werden `5` oder `10` unterstützt. |

---

## 2. List Transformer (Listenansicht)

Verwenden Sie den Transformer `star_rating` in Ihrer Listen-XML, um die Bewertung als Sterne zu visualisieren.

### Verwendung

```xml
<property name="rating" translation="app.rating" visibility="yes">
    <field-name>rating</field-name>
    <entity-name>object</entity-name>
    <transformer type="star_rating">
        <params>
            <param name="max_value" value="5"/>
            <param name="show_value" value="true"/>
        </params>
    </transformer>
</property>
```

### Parameter

| Name         | Typ     | Standard | Beschreibung |
|--------------|---------|----------|--------------|
| `max_value`  | Integer | `5`      | Die maximale Skala, die für die Berechnung verwendet wird. |
| `show_value` | Boolean | `true`   | Wenn `true`, wird der numerische Wert (z.B. `4/5`) neben den Sternen angezeigt. |

---

## 3. Globale Konfiguration

Sie können projektweite Standardwerte in `config/packages/sulu_admin_extras.yaml` festlegen. Diese werden verwendet, wenn im XML keine spezifischen Parameter definiert sind.

```yaml
sulu_admin_extras:
    star_rating:
        max_value: 5
        default_value: 3
        use_star_symbols: false # Verwendet ★ / ☆ Unicode-Symbole in Dropdown-Auswahlfeldern
```
