# Media Picker

A form field type that shows a large image preview and lets the editor click it to either pick an existing file
from the media library or upload a new one — both in the same overlay. Replaces `single_media_upload`, which only
supports uploading and, because it expects the form to hand it an already-resolved media object, shows **no**
preview at all when reopening an article/page that already has an image (it only ever gets `{"id": n}` back). It
also replaces `single_media_selection` where its 25×25px inline thumbnail is too small to tell images apart.

---

## Usage in Form XML

```xml
<property name="image" type="media_picker">
    <meta>
        <title>Image</title>
    </meta>
    <params>
        <!-- optional, same meaning as on single_media_selection -->
        <param name="types" type="collection">
            <param name="image"/>
        </param>
        <!-- optional: which thumbnail format to fetch, default "sulu-400x400" -->
        <param name="image_size" value="sulu-400x400"/>
        <!-- optional: icon shown in the empty placeholder, default "su-image" -->
        <param name="empty_icon" value="su-image"/>
        <!-- optional: folder the selection overlay opens in (a system collection is recommended) -->
        <param name="collection_id"
               type="expression"
               value="service('sulu_media.system_collections.manager').getSystemCollection('your_webspace.articles')"/>
    </params>
</property>
```

## Storage format

`{"id": <mediaId>, "displayOption": null}` — the same shape as `single_media_selection`. Existing content saved
under that type keeps working unchanged after switching the `type` attribute to `media_picker`, and vice versa.

## Behaviour

- Loads the media by id itself (via `SingleSelectionStore`), so it always shows a correct preview, including right
  after reopening a saved article — unlike `single_media_upload`.
- Preview is a 260px tall image (thumbnail format configurable via `image_size`, default `sulu-400x400`), not a
  25×25px line icon.
- Clicking the preview (or the empty placeholder) opens Sulu's media overlay (browsing the library, including its
  folder structure, or uploading a new file) — no separate control needed. With `collection_id` the overlay opens
  directly in that folder (e.g. a system collection) instead of the media library's root.
- A small trash icon in the corner clears the selection.

## Requirements

Needs `sulu-media-bundle` as a sibling npm package in the project (already the case in any project that uses
`single_media_selection`/`single_media_upload`, since those come from the same MediaBundle).

## Installation

Same as the other custom field types of this bundle: add `sulu_admin_extras.js` build with `fieldRegistry`
(already wired in `index.js`), then in the project's `assets/admin`:

```bash
rm -rf node_modules/sulu-admin-extras-bundle
npm install --force
npm run build
```
