# TypeColorFieldTransformer

A List Field Transformer that displays colored dots with optional labels for categorized data in Sulu admin lists.

![img.png](img/type_color.de.png)

## Overview

The `TypeColorFieldTransformer` visualizes categorical data (like status, type, category) as colored dots. It supports two modes:

| Mode | Description | Backend Code Required |
|------|-------------|----------------------|
| **Palette-driven** | Colors looked up from configured palettes | No |
| **Backend-driven** | Colors provided by backend enrichment | Yes |

---

## Quick Start (Palette Mode)

The simplest way - no PHP code required.

### 1. Define a Color Palette

```yaml
# config/packages/sulu_admin_extras.yaml
sulu_admin_extras:
    color_palettes:
        project_status:
            draft:
                color: '#6c757d'
                name: 'app.status.draft'
            active:
                color: '#198754'
                name: 'app.status.active'
            archived:
                color: '#dc3545'
                name: 'app.status.archived'
```

### 2. Add Translations

```yaml
# translations/admin.en.yaml
app.status.draft: 'Draft'
app.status.active: 'Active'
app.status.archived: 'Archived'
```

```yaml
# translations/admin.de.yaml
app.status.draft: 'Entwurf'
app.status.active: 'Aktiv'
app.status.archived: 'Archiviert'
```

### 3. Configure List XML

```xml
<property name="status" translation="app.status" visibility="always">
    <field-name>status</field-name>
    <entity-name>App\Entity\MyEntity</entity-name>

    <transformer type="type_color">
        <params>
            <param name="palette" value="project_status"/>
            <param name="show_name" value="true"/>
        </params>
    </transformer>
</property>
```

### 4. Ensure Entity Field Matches Palette Keys

```php
// src/Entity/MyEntity.php
class MyEntity
{
    private string $status = 'draft';  // Must match palette key!
}
```

**Done!** The transformer will look up `draft` in the `project_status` palette and display a gray dot with "Draft" label.

---

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `palette` | string | - | Name of the color palette to use |
| `show_name` | string | `"false"` | Show translated name next to dot (`"true"` or `"false"`) |

> **Note:** XML parameters are always strings. Use `value="true"` not `value={true}`.

---

## Palette Configuration

### Short Form (Auto-generated Translation Keys)

```yaml
sulu_admin_extras:
    color_palettes:
        my_palette:
            key1: '#0d6efd'
            key2: '#198754'
```

Translation key format: `sulu_admin_extras.color_palettes.{palette}.{key}`

### Extended Form (Custom Translation Keys)

```yaml
sulu_admin_extras:
    color_palettes:
        my_palette:
            key1:
                color: '#0d6efd'
                name: 'custom.translation.key'
```

---

## Backend-Driven Mode (Fallback)

For bundles that provide their own type configuration (like SuluEventBundle), the transformer can read colors from backend-enriched list data.

### Required Backend Fields

The list response must include these fields per item:

| Field | Type | Description |
|-------|------|-------------|
| `typeColor` | string | Hex color code (e.g., `"#0d6efd"`) |
| `typeName` | string | Translated display name |
| `typeRaw` | string | Raw key for palette lookup (optional) |

### Example: DoctrineListRepresentationFactory

```php
use Manuxi\SuluAdminExtrasBundle\Service\ColorPaletteProvider;

class EventController
{
    public function __construct(
        private ColorPaletteProvider $colorPaletteProvider,
    ) {}

    private function addTypeInfo(array $listData): array
    {
        foreach ($listData as &$item) {
            $typeKey = $item['type'] ?? 'default';
            
            $item['typeRaw'] = $typeKey;
            $item['typeColor'] = $this->colorPaletteProvider->getColor('event_types', $typeKey);
            $item['typeName'] = $this->colorPaletteProvider->getColorName('event_types', $typeKey);
        }
        
        return $listData;
    }
}
```

### List XML (Backend Mode)

```xml
<property name="type" translation="app.type" visibility="always">
    <field-name>type</field-name>
    <entity-name>App\Entity\Event</entity-name>

    <!-- No params needed - uses backend data -->
    <transformer type="type_color"/>
</property>
```

---

## Priority / Fallback Logic

The transformer uses this priority:

1. **Palette lookup** (if `palette` parameter is set)
    - Uses `typeRaw` field if available, otherwise raw `value`
    - Looks up color and name from configured palette

2. **Backend data** (fallback if palette lookup fails)
    - Uses `typeColor` field for color
    - Uses `typeName` field for label

3. **Default fallback**
    - Color: `#cccccc` (gray)
    - Label: raw field value

---

## Complete Example: Project Status

### Configuration

```yaml
# config/packages/sulu_admin_extras.yaml
sulu_admin_extras:
    color_palettes:
        project_status:
            planning:
                color: '#6c757d'
                name: 'project.status.planning'
            in_progress:
                color: '#0d6efd'
                name: 'project.status.in_progress'
            review:
                color: '#ffc107'
                name: 'project.status.review'
            completed:
                color: '#198754'
                name: 'project.status.completed'
            cancelled:
                color: '#dc3545'
                name: 'project.status.cancelled'
```

### Translations

```yaml
# translations/admin.en.yaml
project.status.planning: 'Planning'
project.status.in_progress: 'In Progress'
project.status.review: 'Review'
project.status.completed: 'Completed'
project.status.cancelled: 'Cancelled'
```

### List XML

```xml
<!-- config/lists/projects.xml -->
<list xmlns="http://schemas.sulu.io/list-builder/list">
    <key>projects</key>
    <properties>
        <property name="id" visibility="no">
            <field-name>id</field-name>
            <entity-name>App\Entity\Project</entity-name>
        </property>

        <property name="title" translation="app.title" visibility="always">
            <field-name>title</field-name>
            <entity-name>App\Entity\Project</entity-name>
        </property>

        <property name="status" translation="app.status" visibility="always">
            <field-name>status</field-name>
            <entity-name>App\Entity\Project</entity-name>

            <transformer type="type_color">
                <params>
                    <param name="palette" value="project_status"/>
                    <param name="show_name" value="true"/>
                </params>
            </transformer>
        </property>
    </properties>
</list>
```

### Entity

```php
// src/Entity/Project.php
class Project
{
    public const STATUS_PLANNING = 'planning';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_REVIEW = 'review';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELLED = 'cancelled';

    private string $status = self::STATUS_PLANNING;

    public function getStatus(): string
    {
        return $this->status;
    }

    public function setStatus(string $status): self
    {
        $this->status = $status;
        return $this;
    }
}
```

---

## Styling

The transformer uses CSS classes from `TypeColorFieldTransformer.scss`:

```scss
.typeDot {
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.typeDot::before {
    content: '';
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: inherit;
}

.label {
    font-size: 13px;
    color: #333;
}
```

---

## Troubleshooting

### Gray dot displayed (fallback color)

**Possible causes:**
- Palette name in XML doesn't match configuration
- Database value doesn't match any palette key
- Cache not cleared after configuration change

**Solution:**
```bash
bin/console cache:clear
bin/adminconsole sulu:admin:build
```

### Label not showing

**Check:**
- `show_name` parameter is set to `"true"` (string, not boolean)
- Translation key exists and is correct

### Colors from wrong palette

**Check:**
- Palette parameter value matches exactly (case-sensitive)
- No typos in palette name
