# Architecture Documentation

## Overview

The **SuluAdminExtrasBundle** is a unified bundle that combines functionality from the former `SuluContentTypesBundle` and `SuluTweaksBundle`. It provides:

1. **Content Types** for Sulu templates (ColorSelect, NumberWithDefault, SliderRange, StarRating)
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
│   │       ├── SliderRange.php            # Slider/range input
│   │       └── StarRating.php             # Star rating input
│   ├── Service/
│   │   ├── ColorPaletteProvider.php       # Central color palette service
│   │   └── StarRatingProvider.php         # Star rating service
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
│   ├── ARCHITECTURE.md
│   ├── TYPE_COLOR_TRANSFORMER.md
│   └── TYPE_COLOR_TRANSFORMER.de.md
├── README.md
├── README.de.md
└── composer.json
```

---

## Configuration Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. BUNDLE DEFAULT CONFIG                                                │
│    src/Resources/config/default.yaml                                    │
│    └── Default palettes (bootstrap, etc.)                               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 2. PROJECT CONFIG (overrides/extends)                                   │
│    config/packages/sulu_admin_extras.yaml                               │
│    └── Project-specific palettes (event_types, etc.)                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 3. EXTENSION PROCESSING                                                 │
│    SuluAdminExtrasExtension::load()                                     │
│    ├── Normalizes palettes (short form → extended form)                 │
│    ├── Sets container parameters                                        │
│    └── Builds config array for JavaScript                               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 4. ADMIN CLASS                                                          │
│    AdminExtrasAdmin::getConfig()                                        │
│    └── Returns config to Sulu Admin (sent to frontend via API)          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 5. JAVASCRIPT INITIALIZATION                                            │
│    index.js → addUpdateConfigHook('sulu_admin_extras', ...)             │
│    └── Registers transformers with config including palettes            │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## JavaScript Architecture

### Registration Flow

```javascript
// index.js
initializer.addUpdateConfigHook('sulu_admin_extras', (config, initialized) => {
    if (initialized) return;
    
    // Merge palettes into typeColorConfig
    const typeColorConfig = {
        ...(config.type_color || {}),
        palettes: config.palettes || {},
    };
    
    // Register transformers with config from PHP
    listFieldTransformerRegistry.add('type_color', 
        new TypeColorFieldTransformer(typeColorConfig)
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
- **parameters**: XML params from list configuration (`<param name="..." value="..."/>`)
- **context**: Full row data (plain object or MobX observable)

---

## TypeColorFieldTransformer Data Flow

### Palette-Driven Mode (Primary)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. DATABASE                                                             │
│    Entity field stores raw key: "celebration"                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 2. LIST XML CONFIGURATION                                               │
│                                                                         │
│    <transformer type="type_color">                                      │
│        <params>                                                         │
│            <param name="palette" value="event_types"/>                  │
│            <param name="show_name" value="true"/>                       │
│        </params>                                                        │
│    </transformer>                                                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 3. TRANSFORMER LOOKUP                                                   │
│                                                                         │
│    const palette = this.config.palettes['event_types'];                 │
│    const paletteItem = palette['celebration'];                          │
│    // → { color: '#198754', name: 'sulu_event.types.celebration' }      │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 4. RENDERED OUTPUT                                                      │
│                                                                         │
│    <div class="typeDot" style="background: #198754" title="Feier">      │
│        <span class="label">Feier</span>                                 │
│    </div>                                                               │
└─────────────────────────────────────────────────────────────────────────┘
```

### Backend-Driven Mode (Fallback)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. BACKEND ENRICHMENT (e.g., DoctrineListRepresentationFactory)         │
│                                                                         │
│    $item['typeRaw'] = 'celebration';                                    │
│    $item['typeColor'] = '#198754';                                      │
│    $item['typeName'] = 'Feier';                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 2. JSON API RESPONSE                                                    │
│                                                                         │
│    {                                                                    │
│        "id": 1,                                                         │
│        "title": "My Event",                                             │
│        "type": "Feier",            ← Translated for display             │
│        "typeRaw": "celebration",   ← Raw key                            │
│        "typeColor": "#198754",     ← Color for transformer              │
│        "typeName": "Feier"         ← Title for label/tooltip            │
│    }                                                                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 3. LIST XML CONFIGURATION                                               │
│                                                                         │
│    <transformer type="type_color"/>  ← No params needed                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 4. TRANSFORMER READS FROM CONTEXT                                       │
│                                                                         │
│    const typeColor = context.typeColor;  // '#198754'                   │
│    const typeName = context.typeName;    // 'Feier'                     │
└─────────────────────────────────────────────────────────────────────────┘
```

### Priority Logic

```javascript
// TypeColorFieldTransformer.transform()

// 1. Primary: Palette lookup (if palette param is set)
if (safeParams.palette) {
    const palette = this.config.palettes[safeParams.palette];
    const lookupKey = typeRaw || value;  // Use raw key or field value
    
    if (palette && palette[lookupKey]) {
        color = palette[lookupKey].color;
        title = typeName || palette[lookupKey].name || lookupKey;
    }
}

// 2. Fallback: Backend-enriched data
if (color === fallbackColor) {
    if (typeColor) color = typeColor;
    if (typeName) title = typeName;
}

// 3. Final fallback: gray dot with raw value
```

---

## Service Dependencies

```
ColorPaletteProvider
    └── TranslatorInterface (for color name translations)

AdminExtrasAdmin
    └── config array (transformer configs + palettes)

Content Types
    └── SimpleContentType (no PHPCR dependency, Sulu 3 compatible)
```

---

## YAML Configuration Schema

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
            celebration:
                color: '#198754'
                name: 'sulu_event.types.celebration'

    # Transformer configs
    publish_state_indicator:
        enable_offset: false
    
    star_rating:
        show_value: true
        max_value: 5
        default_value: 3
        use_star_symbols: false
    
    percent_bar:
        show_value: true
        max_value: 100
        height: 16
        use_gradient: true
        gradient_mode: 'interpolate'
    
    type_color:
        fallback_color: '#cccccc'
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

**Option A: Palette-driven (Recommended for new entities)**
1. Define palette in `sulu_admin_extras.yaml`
2. Add translations
3. Configure list XML with `palette` parameter
4. Ensure entity field stores palette key

**Option B: Backend-driven (For bundles with existing type configuration)**
1. Enrich list data with `typeColor`, `typeName`, `typeRaw`
2. Configure list XML (no parameters needed)

### Extending Color Palettes

Create project-specific palettes in `config/packages/sulu_admin_extras.yaml`:

```yaml
sulu_admin_extras:
    color_palettes:
        my_project:
            brand: '#ff6600'
            accent: '#0066ff'
```

Use in list transformers:
```xml
<transformer type="type_color">
    <params>
        <param name="palette" value="my_project"/>
    </params>
</transformer>
```

Use in form templates:
```xml
<param name="values" type="expression"
       value="service('sulu_admin_extras.color_palette_provider').getValues('my_project')"/>
```

---

## Documentation

- [TypeColorFieldTransformer](./type_color.md) - Detailed transformer documentation
- [TypeColorFieldTransformer (DE)](./type_color.de.md) - German version