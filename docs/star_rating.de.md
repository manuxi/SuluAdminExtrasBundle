# Star Rating (Bewertung)

Das **Star Rating** Feature ermöglicht die Verwaltung und Visualisierung von Bewertungen in Sulu-Applikationen. Es besteht aus zwei Komponenten:
1. **Content Type**: Zum Zuweisen von Bewertungen in Formularen.
2. **List Transformer**: Zur Anzeige von Bewertungen in der Listenansicht.

---

## 1. Content Type (Eingabe)

Den Typ `star_rating` in der Formular-XML-Definition wird verwendet, um das Setzen einer Bewertung zu ermöglichen.

![img.png](img/star_rating1.de.png)

![img.png](img/star_rating2.de.png)

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
> Der oben stehende Ausdruck **muss** verwendet werden, um `max_value` vom Service zu laden. `value="5"` hardzucodieren wird nicht empfohlen, wenn die globale Konfiguration genutzt werden soll.

### Parameter

| Name        | Typ     | Standard | Beschreibung                                                              |
|-------------|---------|----------|---------------------------------------------------------------------------|
| `max_value` | Integer | `5`      | Die maximale Anzahl der Sterne (Skala). `5` oder `10` werden unterstützt. |

---

## 2. List Transformer (Listenansicht)

Der Transformer `star_rating` in der Listen-XML wird verwendet, um die Bewertung als Sterne zu visualisieren.

![img.png](img/star_rating3.de.png)

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

Projektweite Standardwerte  können in `config/packages/sulu_admin_extras.yaml` festgelegt werden. Diese werden verwendet, wenn im XML keine spezifischen Parameter definiert sind.

```yaml
sulu_admin_extras:
    star_rating:
        max_value: 5
        default_value: 3
        use_star_symbols: false # Verwendet ★ / ☆ Unicode-Symbole in Dropdown-Auswahlfeldern
```
