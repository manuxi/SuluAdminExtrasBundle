# Color Dot

A simple list field transformer that renders a colored circle (dot) in list views. It takes a hex color string from the field value and displays it as an 18×18px circle. Useful for quick visual identification in tables, e.g. for categories, statuses, or tags.

---

## Usage in List XML

```xml
<property name="color" visibility="always" translation="app.color">
    <tag name="sulu_admin.list_field_transformer" type="color_dot"/>
</property>
```

---

## Features

- **Color circle**: Renders a round dot with the field value as `backgroundColor`
- **Tooltip**: Shows the hex color value on hover
- **Fallback**: Uses `#cccccc` (light gray) when the field value is empty
- **No configuration needed**: Zero params, zero config — just register and use

---

## How It Works

The transformer reads the raw field value (expected to be a CSS color string like `#ff5500` or `rgb(...)`) and renders:

```html
<div class="typeDot" style="background-color: #ff5500" title="#ff5500" />
```

The dot is styled as:
- 18×18px circle (`border-radius: 50%`)
- 2px white border for contrast
- Inline-block with vertical-align: middle

---

## Comparison with Type Color

| Feature | `color_dot` | `type_color` |
|---------|-------------|--------------|
| Input | Raw color value (`#hex`) | Palette key or backend-enriched data |
| Config | None | Palette config via `sulu_admin_extras.yaml` |
| Label | No | Optional (`show_name` param) |
| Use case | Simple color display | Categorized color with name |

Use `color_dot` when the database field already contains a CSS color value. Use `type_color` when you need palette lookup or label display.

---

## Entity Example

```php
#[ORM\Column(type: 'string', length: 7, nullable: true)]
private ?string $color = '#3788d8';

public function getColor(): ?string
{
    return $this->color;
}
```

---

## Styling

The transformer reuses `TypeColorFieldTransformer.scss`:

```scss
.typeDot {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: inline-block;
    vertical-align: middle;
    border: 2px solid $white;
}
```

---

## Components

| File | Description |
|------|-------------|
| `ColorDotFieldTransformer.js` | Transformer class implementing `transform(value, parameters)` |
| `TypeColorFieldTransformer.scss` | Shared styles (`.typeDot`) |