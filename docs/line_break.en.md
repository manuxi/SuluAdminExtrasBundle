# Line Break

The **Line Break** content type starts a new row in the admin form. The form of the Sulu admin is a 12-column grid whose fields float to the left: a field fills the row until it is full. So far the only way to end a row early was `spaceAfter` on the field before, and that fails as soon as that field or the one after it is hidden by a `visibleCondition`: the space is then missing or in the wrong place.

The line break has no input, no label and no height. It only makes the following fields start on a new row. It can carry a `visibleCondition` like any other field, so the break is gone with the fields it belongs to.

---

## Usage (Form XML)

```xml
<property name="effect_break" type="line_break"
          visibleCondition="__parent.select_effect_source == 'custom'"/>
```

The following fields start on a new row, but only while the condition is met.

| Attribute          | Description |
|--------------------|-------------|
| `name`             | Any unique name. No value is stored and nothing is passed to the website. |
| `visibleCondition` | Optional. Without it, the break always applies. |

No `meta` and no `colspan` are needed.

---

## Notes

- Before a field that stands alone in a row, `spaceAfter` on the field before is still the simpler way if that field is always visible.
- With the line break, a row is formed by the fields up to the next break, no matter which of them are visible.
- The field marks the grid item it sits in with a CSS class (`clear: left`, height 0). The Sulu markup stays untouched.
