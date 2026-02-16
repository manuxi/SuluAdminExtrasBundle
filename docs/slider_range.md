# Slider Range

The **Slider Range** Content Type provides a visual slider input for selecting numeric values within a defined range.

![img.png](img/slider_range.de.png)

---

## Usage (Form XML)

Use the `slider_range` type in your property definitions.

```xml
<property name="opacity" type="slider_range">
    <meta>
        <title lang="en">Opacity</title>
        <title lang="de">Deckkraft</title>
    </meta>
    <params>
        <param name="min" value="0"/>
        <param name="max" value="100"/>
        <param name="step" value="10"/>
        <param name="default_value" value="100"/>
    </params>
</property>
```

---

## Parameters

| Name            | Type    | Default | Description |
|-----------------|---------|---------|-------------|
| `min`           | integer | `0`     | The minimum value of the slider. |
| `max`           | integer | `100`   | The maximum value of the slider. |
| `step`          | integer | `1`     | The increment/decrement step size. |
| `default_value` | integer | `null`  | The value pre-selected if the field is empty. |