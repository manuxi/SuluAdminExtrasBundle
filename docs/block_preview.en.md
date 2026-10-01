# Block Preview

This bundle extends the preview of collapsed blocks in `block` fields. Sulu core only shows text, select, date, smart content and media fields there. Every other field carrying the `sulu.block_preview` tag is silently ignored, so blocks built around a contact, an organisation, a form, a link or a nested list look empty when collapsed. The bundle adds the missing renderers, puts the label of the field in front of every line in light grey and reports a missing title as "Untitled".

![Block Preview](img/block_preview.de.png)

---

## Usage in Form XML

The renderers are registered automatically; all you do is tag the field. For a nested `block` field the tag goes right before `<types>`.

```xml
<property name="contact" type="single_contact_selection">
    <meta>
        <title lang="de">Person</title>
        <title lang="en">Person</title>
    </meta>
    <tag name="sulu.block_preview" priority="1280"/>
</property>

<block name="boxes" default-type="types-box">
    <tag name="sulu.block_preview" priority="1280"/>
    <types>
        <type ref="types-box"/>
    </types>
</block>
```

---

## Priorities

Lines are sorted by `priority`, highest first. A proven scheme for a consistent look across all blocks:

| Priority | Content |
|----------|---------|
| `2048` | Title |
| `1536` | Subtitle |
| `1280` | What makes the block special (selection, link, nested list, ...) |
| `768` | Text excerpt |
| `512` | Thumbnail |

---

## Renderers

| Field type | Shows |
|------------|-------|
| `single_account_selection`, `single_contact_selection`, `single_snippet_selection`, `single_form_selection` | `Organization: Muster GmbH` (the name is loaded on demand and cached for 30 seconds) |
| `account_selection`, `contact_account_selection`, `snippet_selection`, `page_selection`, `article_selection`, `event_selection`, `testimonial_selection`, `teaser_selection` | `Pages: 3` |
| `snippet_selection`, `single_snippet_selection` | Additionally the title of the allowed snippet type(s) from the field's `types` param, e.g. `Snippets (Link): 2` (the title comes from the snippet template's `<meta><title>`) |
| `block` (nested) | `Entries: 3 - Title A, Title B, Untitled` (first `title`/`name`/`headline` of each entry, "Untitled" if none is set) |
| `link` | The address of external links, the kind (page, media, ...) of internal ones |

Existing registry keys are never replaced, so a renderer shipped by Sulu core always wins.

---

## Labels and Untitled Blocks

Every preview line starts with the label of its field in light grey (`Title: ...`, `Subtitle: ...`, `Organization: ...`). For core fields this is the field's `<meta><title>`; the renderers above bring their own, shorter label. Thumbnails of media fields stay without a label and always come last (Sulu floats them to the left, so any text after one would run next to the image).

If a block previews a title field (`title`, `name` or `headline` carries the tag) but the editor left it empty, the first line reads `Title: Untitled` instead of the line silently missing.

This is done by the bundle's own variant of the `block` field type, which replaces Sulu core's in the field registry (same technique as for [Icon Selection](icon_selection.en.md)). Collapsed blocks otherwise behave exactly like core.

---

## Notes

- A tagged field is only shown while it has a value. Fields hidden by a `visibleCondition` should not be tagged: Sulu keeps the value of a hidden field, so the collapsed block would show stale information.
- The preview cannot look at sibling fields, so it cannot combine e.g. a "type" and a "selection" field.
- The labels can be adjusted via the translation keys `sulu_admin_extras.block_preview_*`.

---

## Components

| File | Description |
|------|-------------|
| `LabeledFieldBlocks.js` | Variant of the `block` field type with labelled lines and "Untitled" |
| `SingleSelectionBlockPreviewTransformer.js` | Name of the selection for organisation, contact, snippet and form |
| `SelectionBlockPreviewTransformer.js` | Count for multi selections |
| `BlockListBlockPreviewTransformer.js` | Count and titles of nested blocks |
| `LinkBlockPreviewTransformer.js` | Address or kind of a link |
