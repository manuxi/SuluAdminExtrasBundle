# Color Select (Farbauswahl)

Der Content Type **Color Select** ermöglicht es, einen Wert aus einer Dropdown-Liste auszuwählen. Das Dropdown zeigt eine visuelle Vorschau jeder Farbe (Farbcode/Box) neben dem Namen an.

---

## Verwendung  in Templates (XML)

Den Typ `color_select` benötigt eine Liste von `values` (Optionen). Diese können manuell angeben werden:

**Wichtig:** Die Farbe wird im value-Attribut im Format `"key:farbe"` kodiert (z.B. `"primary:#0d6efd"`).

```xml
<property name="button_color" type="color_select">
    <meta>
        <title lang="de">Button-Farbe</title>
        <title lang="en">Button Color</title>
    </meta>
    <params>
        <param name="values" type="collection">
            <param name="primary" value="primary:#0d6efd">
                <meta>
                    <title lang="en">Primary (Blue)</title>
                    <title lang="de">Primärfarbe (Blau)</title>
                </meta>
            </param>
            <param name="secondary" value="secondary:#6c757d">
                <meta>
                    <title lang="en">Secondary (Gray)</title>
                    <title lang="de">Sekundärfarbe (Grau)</title>
                </meta>
            </param>
            <param name="success" value="success:#198754">
                <meta>
                    <title lang="en">Success (Green)</title>
                    <title lang="de">Erfolg (Grün)</title>
                </meta>
            </param>
        </param>
    </params>
</property>
```

Komfortabler ist es allerdings, die Farben in yaml zu konfigurieren und über den `ColorPaletteProvider`-Service zu laden.

```xml
<property name="theme_color" type="color_select">
    <meta>
        <title lang="en">Theme Color</title>
        <title lang="de">Themenfarbe</title>
    </meta>
    <params>
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
