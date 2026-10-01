# Block preview

What an editor sees of a **collapsed** block in a `block` field. Sulu core only shows fields that carry the
`sulu.block_preview` tag, and only has a renderer for text, select, date, smart content and media fields — every
other tagged field is silently ignored, so blocks built around a contact, an organisation, a form, a link or a
nested list of items looked empty when collapsed.

This bundle adds the missing renderers. They are registered automatically; the only thing you do is tag the field:

```xml
<property name="contact" type="single_contact_selection">
    <meta><title>Person</title></meta>
    <tag name="sulu.block_preview" priority="1280"/>
</property>

<block name="boxes" default-type="types-box">
    <tag name="sulu.block_preview" priority="1280"/>
    <types>...</types>
</block>
```

Lines are sorted by `priority`, highest first. A good scheme for a consistent look across all blocks:

| Priority | Content |
|---|---|
| 2048 | title |
| 1536 | subtitle |
| 1280 | what makes the block special (selection, link, nested list, ...) |
| 768 | text excerpt |
| 512 | image thumbnail |

## Renderers

| Field type | Shows |
|---|---|
| `single_account_selection`, `single_contact_selection`, `single_snippet_selection`, `single_form_selection` | `Organization: Name` (name is loaded lazily and cached for 30 s) |
| `account_selection`, `contact_account_selection`, `snippet_selection`, `page_selection`, `article_selection`, `event_selection`, `testimonial_selection`, `teaser_selection` | `Pages: 3` |
| `snippet_selection`, `single_snippet_selection` | additionally the title of the allowed snippet type(s) from the field's `types` param, e.g. `Snippets (Link): 2` (the title comes from the snippet template's `<meta><title>`) |
| `block` (nested) | `Entries: 3 - Title A, Title B, Untitled` (first `title`/`name`/`headline` of each entry, "Untitled" if none is set) |
| `link` | the address of external links, the kind (page, media, ...) of internal ones |

Existing registry keys are never replaced, so a renderer shipped by Sulu core always wins.

## Notes

- A tagged field is only shown while it has a value. Do not tag fields that are hidden by a `visibleCondition`
  — Sulu keeps the value of a hidden field, so the collapsed block would show stale information.
- The preview cannot look at sibling fields, so it cannot combine e.g. a "type" and a "selection" field.
- Labels can be adjusted via the translation keys `sulu_admin_extras.block_preview_*`.
