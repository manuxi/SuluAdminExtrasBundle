# Icon Selection

Sulu 3.0 already ships its own `single_icon_selection` field type: editors pick an icon from a configured
`icon_set` (an `svg://` folder of individual SVG files, or an `icomoon://` icon font selection.json) in a search
overlay. It has two gaps: the form field itself shows only the stored icon **name** as plain text (no visual
preview), and there is no Twig function or property resolver to render the icon on the frontend.

This bundle fixes both **without duplicating any of Sulu's own icon handling** - no sprite build, no separate
storage format, no new field-type name. It overrides Sulu core's own `single_icon_selection` field component and
`icon` list adapter in place (see "How the override works" below) and adds the missing Twig/PropertyResolver
side, reusing Sulu's own `icon_sets` config and `IconProviderInterface` services.

---

## Setup: register an icon set (Sulu core config, not this bundle)

```yaml
# config/packages/sulu_admin.yaml
sulu_admin:
    icon_sets:
        bootstrap-icons: 'svg://%kernel.project_dir%/var/icon-sets/bootstrap-icons'
```

The folder holds one `.svg` file per icon, e.g. from the `bootstrap-icons` npm package's `icons/` directory
(copy the files you want to ship, `id` = filename without `.svg`). See [Sulu's icon set
docs](https://docs.sulu.io/en/latest/book/fields.html#single_icon_selection) for the full config format
(`icomoon://` is supported the same way).

## Usage in Form XML

Exactly Sulu core's own syntax - nothing this bundle adds:

```xml
<property name="icon" type="single_icon_selection">
    <meta>
        <title lang="en">Icon</title>
        <title lang="de">Icon</title>
    </meta>
    <params>
        <param name="icon_set" value="bootstrap-icons"/>
    </params>
</property>
```

## Storage format

A plain string, the icon's id (e.g. `"calendar-heart"`) - identical to core, so this bundle is a drop-in
enhancement of an existing `single_icon_selection` field, not a migration.

## Form field

A compact row (icon + name, like Sulu's own `single_media_selection`): a button on the left opens the picker
overlay, the trash icon on the right clears the selection. The preview icon is fetched once from Sulu's own
`GET /admin/api/icons` endpoint (the same one the overlay uses) and cached.

## Picker overlay

Same overlay, same search/pagination/REST loading as Sulu core - only the icon tiles are replaced with a fixed
grid (Sulu core's own tiles wrap onto a variable-height flex row, which looks ragged with a few thousand icons).

## Twig

```twig
{{ sulu_icon(content.icon) }}
{{ sulu_icon(content.icon, {class: 'text-primary', size: 32, title: 'Events'}) }}

{# hard-coded icons, e.g. replacing old <i class="bi bi-calendar"></i> #}
{{ sulu_icon('calendar-heart', {icon_set: 'bootstrap-icons'}) }}
{{ sulu_icon('bootstrap-icons:calendar-heart') }}

{% if content.icon %}…{% endif %}                  {# fallback when nothing is set #}
```

The property resolver returns `{name, icon_set}` (or `null` if empty or the icon no longer exists in its set) -
`content.icon` in the examples above is that resolved value, not the raw stored string.

Output: the icon's own SVG markup, with `width`/`height`/`fill`/`class` overridden and its original `viewBox`
kept, e.g.:

```html
<svg class="sulu-icon sulu-icon--bootstrap-icons text-primary" width="32" height="32" viewBox="0 0 16 16"
     fill="currentColor" role="img" aria-label="Events">
    <path d="..."/>
</svg>
```

| Option     | Default | Meaning                                                                 |
|------------|---------|--------------------------------------------------------------------------|
| `class`    | –       | Additional CSS classes                                                   |
| `size`     | `1em`   | `width`/`height` attributes; CSS `width`/`height` override them          |
| `title`    | –       | Accessible label (`role="img"`); without it the icon is `aria-hidden`   |
| `icon_set` | –       | Only for a plain string value without a `pool:` prefix (hard-coded icons) |

Color follows `currentColor`. An unknown icon renders nothing; with `kernel.debug` enabled it throws instead, so
typos in templates show up.

## How the override works

Sulu core registers `single_icon_selection` (form field) and `icon` (list adapter) itself, in its own
`sulu_admin` update-config-hook, before this bundle's hook runs - `fieldRegistry.add()`/`listAdapterRegistry.add()`
throw on an already-used key, so `src/Resources/js/index.js` writes into the registries' internal `fields`/
`adapters` maps directly, replacing core's components with this bundle's after core has already registered them.
No template XML change and no new field-type name - existing `single_icon_selection` fields keep working, they
just render better.

## Installation

See [README](../README.md#installation).
