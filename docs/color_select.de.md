# Color Select (Farbauswahl)

Der Content Type **Color Select** ermöglicht es Benutzern, eine Farbe aus einer Dropdown-Liste auszuwählen. Das Dropdown zeigt eine visuelle Vorschau jeder Farbe (Farbcode/Box) neben dem Namen an.

---

## Verwendung (Formular XML)

Verwenden Sie den Typ `color_select`. Dieser benötigt eine Liste von `values` (Optionen). Sie können diese manuell angeben oder, was komfortabler ist, über den `ColorPaletteProvider` laden.

```xml
<property name="theme_color" type="color_select">
    <meta>
        <title lang="en">Theme Color</title>
        <title lang="de">Themenfarbe</title>
    </meta>
    <params>
        <!-- Option 1: Laden über ColorPaletteProvider (Empfohlen) -->
        <param name="values" type="expression"
               value="service('sulu_admin_extras.color_palette_provider').getValues('bootstrap')"/>
        
        <param name="default_value" type="expression"
               value="service('sulu_admin_extras.color_palette_provider').getDefaultValue('bootstrap')"/>
    </params>
</property>
```

---

## Konfiguration der Farbpaletten

Sie können Ihre eigenen Paletten in `config/packages/sulu_admin_extras.yaml` definieren. Auf diese kann dann mittels `getValues('palette_name')` zugegriffen werden.

```yaml
sulu_admin_extras:
    color_palettes:
        # Einfache Definition (Key: Hex)
        my_scheme:
            primary: '#0055ff'
            secondary: '#aabbcc'
            
        # Erweiterte Definition (Key: {color, name})
        status:
            active:
                color: '#00ff00'
                name: 'app.status.active' # Übersetzungsschlüssel
```
