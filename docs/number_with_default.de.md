# Number With Default (Zahl mit Standardwert)

Der Content Type **Number With Default** ist ein Standard-Zahleingabefeld, das die Definition eines Fallback-Wertes ermöglicht. Dieser Wert wird verwendet/gespeichert, wenn das Feld leer gelassen wird.

![img.png](img/number_with_default.de.png)

---

## Verwendung (Formular XML)

Verwenden des Typs `number_with_default` als Property.

```xml
<property name="priority" type="number_with_default">
    <meta>
        <title lang="en">Priority</title>
        <title lang="de">Priorität</title>
    </meta>
    <params>
        <param name="default_value" value="10"/>
    </params>
</property>
```

---

## Parameter

| Name            | Typ     | Standard | Beschreibung |
|-----------------|---------|----------|--------------|
| `default_value` | Zahl    | `null`   | Der Wert, der verwendet wird, wenn das Eingabefeld leer bleibt. |