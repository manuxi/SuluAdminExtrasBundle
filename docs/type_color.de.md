# Type Color (Typ-Farbe)

Der **Type Color** List Transformer zeigt einen farbigen Punkt basierend auf einer Kategorie oder einem Typ-Schlüssel an. Er verlässt sich auf den `ColorPaletteProvider`, um Schlüssel (wie `article`, `video`) Farben zuzuordnen.

---

## Verwendung (Listen XML)

```xml
<property name="type" translation="app.type" visibility="yes">
    <transformer type="type_color"/>
</property>
```

---

## Backend-Anforderung

Dieser Transformer ist **passiv**. Er erwartet, dass die an die Liste übergebenen Daten bereits zwei spezifische Felder für das Element enthalten:
1. `typeColor`: Der Hex-Code der Farbe.
2. `typeName`: Der übersetzte Name des Typs.

Sie müssen typischerweise einen PHP-Helper in Ihrem Controller oder Ihrer `DoctrineListRepresentationFactory` implementieren, um diese Werte in die Listenantwort einzufügen:

```php
// PHP Beispiel: Anreichern der Listenelemente
foreach ($items as &$item) {
    $type = $item['type'];
    // Nutzen Sie den ColorPaletteProvider zum Laden der Konfiguration
    $item['typeColor'] = $this->colorPaletteProvider->getColor('my_palette', $type);
    $item['typeName'] = $this->colorPaletteProvider->getColorName('my_palette', $type);
}
```

---

## Konfiguration

Farben werden in `config/packages/sulu_admin_extras.yaml` unter `color_palettes` definiert.

```yaml
sulu_admin_extras:
    type_color:
        fallback_color: '#cccccc' # Wird verwendet, wenn keine Farbe gefunden wurde
```
