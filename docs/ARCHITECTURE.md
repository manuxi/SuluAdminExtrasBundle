# Architecture Documentation

## Overview

The **SuluAdminExtrasBundle** is a unified bundle that combines functionality from the former `SuluContentTypesBundle` and `SuluTweaksBundle`. It provides:

1. **Content Types** for Sulu templates (ColorSelect, NumberWithDefault, SliderRange)
2. **List Field Transformers** for Sulu admin lists (PublishState, GhostLocale, StarRating, PercentBar, TypeColor)
3. **ColorPaletteProvider** service for centralized color management

---

## Bundle Structure

```
SuluAdminExtrasBundle/
├── src/
│   ├── Admin/
│   │   └── AdminExtrasAdmin.php           # Provides JS config to frontend
│   ├── Content/
│   │   └── Type/
│   │       ├── ColorSelect.php            # Color selection content type
│   │       ├── NumberWithDefault.php      # Number with default value
│   │       └── SliderRange.php            # Slider/range input
│   ├── Service/
│   │   └── ColorPaletteProvider.php       # Central color palette service
│   ├── DependencyInjection/
│   │   ├── Configuration.php              # YAML config schema
│   │   └── SuluAdminExtrasExtension.php   # Service registration
│   ├── Resources/
│   │   ├── config/
│   │   │   ├── default.yaml               # Default color palettes
│   │   │   └── services.xml               # Service definitions
│   │   ├── js/
│   │   │   ├── containers/Form/fields/    # React form components
│   │   │   ├── fieldTransformers/         # React list transformers
│   │   │   └── index.js                   # Main JS entry point
│   │   ├── translations/
│   │   │   ├── admin.de.yaml
│   │   │   └── admin.en.yaml
│   │   └── package.json
│   └── SuluAdminExtrasBundle.php
├── docs/
│   └── ARCHITECTURE.md
├── README.md
├── README.de.md
└── composer.json
```

---

## Data Flow

### Content Types (Form → Database → Template)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. CONFIGURATION (YAML)                                                 │
│                                                                         │
│    config/packages/sulu_admin_extras.yaml                               │
│    ├── color_palettes:                                                  │
│    │   └── bootstrap:                                                   │
│    │       ├── primary: '#0d6efd'                                       │
│    │       └── success: '#198754'                                       │
│    └── ...                                                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 2. PHP SERVICE                                                          │
│                                                                         │
│    ColorPaletteProvider                                                 │
│    ├── getValues('bootstrap')     → For single_select options           │
│    ├── getColor('bootstrap', key) → For backend list enrichment         │
│    └── getColorName('bootstrap', key) → Translated names                │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 3. TEMPLATE XML                                                         │
│                                                                         │
│    <property name="color" type="color_select">                          │
│        <params>                                                         │
│            <param name="values" type="expression"                       │
│                   value="service('sulu_admin_extras.color_palette_     │
│                          provider').getValues('bootstrap')"/>           │
│        </params>                                                        │
│    </property>                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 4. REACT COMPONENT                                                      │
│                                                                         │
│    ColorSelect (Form Field)                                             │
│    ├── Receives options from schemaOptions                              │
│    ├── Renders SingleSelect with color icons                            │
│    └── Stores key (e.g., "primary") in database                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### List Field Transformers (Database → Admin List)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. BACKEND LIST ENRICHMENT                                              │
│                                                                         │
│    DoctrineListRepresentationFactory (in your bundle)                   │
│    └── addColorsToListElements():                                       │
│        $element['typeColor'] = $colorPaletteProvider->getColor(...)     │
│        $element['typeName'] = $colorPaletteProvider->getColorName(...)  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 2. JSON API RESPONSE                                                    │
│                                                                         │
│    {                                                                    │
│        "id": 1,                                                         │
│        "title": "My Event",                                             │
│        "type": "Workshop",         ← Translated name for display        │
│        "typeColor": "#ffc107",     ← Color for transformer              │
│        "typeName": "Workshop"      ← Title for tooltip                  │
│    }                                                                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 3. LIST XML CONFIGURATION                                               │
│                                                                         │
│    <property name="type" translation="app.type">                        │
│        <transformer type="type_color" />                                │
│    </property>                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 4. REACT TRANSFORMER                                                    │
│                                                                         │
│    TypeColorFieldTransformer                                            │
│    ├── Reads context.$mobx.values.typeColor                             │
│    ├── Reads context.$mobx.values.typeName                              │
│    └── Renders <div style="background: #ffc107" title="Workshop" />     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Configuration System

### YAML Schema

```yaml
sulu_admin_extras:
    # Color palettes for ColorSelect and TypeColor
    color_palettes:
        # Short form (auto-generates translation key)
        bootstrap:
            primary: '#0d6efd'
            success: '#198754'
        
        # Extended form (explicit translation key)
        event_types:
            workshop:
                color: '#ffc107'
                name: 'sulu_event.types.workshop'

    # Transformer configs (passed to JS)
    publish_state_indicator:
        enabled: true
        enable_offset: false
    
    star_rating:
        show_value: true
        max_value: 5
    
    percent_bar:
        show_value: true
        max_value: 100
        height: 16
        use_gradient: true
        gradient_mode: 'interpolate'
    
    type_color:
        fallback_color: '#cccccc'
```

### Config Flow

1. **default.yaml** (bundle) defines sensible defaults
2. **config/packages/sulu_admin_extras.yaml** (project) can override/extend
3. **prepend()** merges bundle defaults first
4. **load()** processes final config and sets parameters
5. **AdminExtrasAdmin** passes config to JavaScript via `getConfig()`

---

## JavaScript Architecture

### Registration Flow

```javascript
// index.js
initializer.addUpdateConfigHook('sulu_admin_extras', (config, initialized) => {
    if (initialized) return;
    
    // Register transformers with config from PHP
    listFieldTransformerRegistry.add('type_color', 
        new TypeColorFieldTransformer(config.type_color)
    );
    
    // Register form fields
    fieldRegistry.add('color_select', ColorSelect);
});
```

### Transformer Interface

Each transformer implements:
```javascript
transform(value: *, parameters: Object, context: Object): Node
```

- **value**: The field value from database
- **parameters**: XML params from list configuration
- **context**: Full row data including MobX observables

---

## Service Dependencies

```
ColorPaletteProvider
    └── TranslatorInterface (for color name translations)

AdminExtrasAdmin
    └── config array (for JS config provisioning)

Content Types
    └── SimpleContentType (no PHPCR dependency, Sulu 3 compatible)
```

---

## Migration from Old Bundles

### Config Mapping

| Old (ContentTypesBundle)            | New (AdminExtrasBundle)            |
|-------------------------------------|------------------------------------|
| `sulu_content_types.color_palettes` | `sulu_admin_extras.color_palettes` |

| Old (TweaksBundle)                       | New (AdminExtrasBundle)                       |
|------------------------------------------|-----------------------------------------------|
| `sulu_tweaks.publish_state_indicator`    | `sulu_admin_extras.publish_state_indicator`   |
| `sulu_tweaks.star_rating`                | `sulu_admin_extras.star_rating`               |
| `sulu_tweaks.percent_bar`                | `sulu_admin_extras.percent_bar`               |

### Service Aliases

Backward compatibility aliases are provided:
- `sulu_content_types.color_palette_provider` → `sulu_admin_extras.color_palette_provider`

### JavaScript Import

```javascript
// Old
import 'sulu-tweaks-bundle';
import 'sulu-content-types-bundle';

// New
import 'sulu-admin-extras-bundle';
```

---

## Best Practices

### Using TypeColorFieldTransformer

1. **Backend**: Enrich list data with `typeColor` and `typeName`
2. **List XML**: Add transformer to property
3. **Frontend**: Transformer reads from context automatically

### Extending Color Palettes

Create project-specific palettes in `config/packages/sulu_admin_extras.yaml`:

```yaml
sulu_admin_extras:
    color_palettes:
        my_project:
            brand: '#ff6600'
            accent: '#0066ff'
```

Use in templates:
```xml
<param name="values" type="expression"
       value="service('sulu_admin_extras.color_palette_provider').getValues('my_project')"/>
```
