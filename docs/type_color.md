# Type Color

The **Type Color** List Transformer displays a colored dot based on a category or type key. It relies on the `ColorPaletteProvider` to map keys (like `article`, `video`) to colors.

---

## Usage (List XML)

```xml
<property name="type" translation="app.type" visibility="yes">
    <transformer type="type_color"/>
</property>
```

---

## Backend Requirement

This transformer is **passive**. It expects the data passed to the list to already contain two specific fields for the item:
1. `typeColor`: The hex code of the color.
2. `typeName`: The translated name of the type.

You typically need to implement a PHP helper in your Controller or `DoctrineListRepresentationFactory` to inject these values into the list response:

```php
// PHP Example: Enriching list items
foreach ($items as &$item) {
    $type = $item['type'];
    // Use ColorPaletteProvider to fetch config
    $item['typeColor'] = $this->colorPaletteProvider->getColor('my_palette', $type);
    $item['typeName'] = $this->colorPaletteProvider->getColorName('my_palette', $type);
}
```

---

## Configuration

Colors are defined in `config/packages/sulu_admin_extras.yaml` under `color_palettes`.

```yaml
sulu_admin_extras:
    type_color:
        fallback_color: '#cccccc' # Used if no color found
```
