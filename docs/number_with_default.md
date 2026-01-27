# Number With Default

The **Number With Default** Content Type is a standard number input field that allows defining a fallback value. This value is used/saved if the editor leaves the field empty.

![img.png](img/number_with_default.de.png)

---

## Usage (Form XML)

Use the `number_with_default` type in your property definitions.

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

## Parameters

| Name            | Type    | Default | Description |
|-----------------|---------|---------|-------------|
| `default_value` | numeric | `null`  | The value to use if the input is left empty. |
