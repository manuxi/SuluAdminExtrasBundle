# Number With Default (Zahl mit Standardwert)

Der Content Type **Number With Default** ist ein Standard-Zahleingabefeld, das die Definition eines Fallback-Wertes ermöglicht. Dieser Wert wird verwendet/gespeichert, wenn der Redakteur das Feld leer lässt.

---

## Verwendung (Formular XML)

Verwenden Sie den Typ `number_with_default` in Ihren Eigenschaftsdefinitionen.

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
