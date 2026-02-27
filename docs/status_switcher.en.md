# Status Switcher List Field Transformer

The `status_switcher` is an interactive list field transformer that allows changing an entity's status directly from the Sulu Datagrid list view without opening the edit form. It renders as a colored dot (with an optional label) that opens an inline dropdown menu on click.

![Status Switcher](img/status_switcher.closed.de.png)

![Status Switcher opened](img/status_switcher.opened.de.png)

## Usage

In your list XML configuration, apply the `<transformer type="status_switcher">` to the property that represents the status field.

```xml
<property name="status" visibility="always" translation="sulu_admin.status">
    <field-name>status</field-name>
    <entity-name>dimensionContent</entity-name>
    <joins ref="dimensionContent"/>
    <transformer type="status_switcher">
        <params>
            <param name="show_name" value="true"/>
            <param name="options_api_url" value="/admin/api/my-entities/statuses"/>
            <param name="patch_api_url" value="/admin/api/my-entities/[id]/status"/>
        </params>
    </transformer>
</property>
```

### Parameters

*   `options_api_url` (string, required): The GET endpoint to retrieve the list of available statuses.
*   `patch_api_url` (string, required): The PATCH endpoint to submit the new status to. Use `[id]` or `{id}` as a placeholder for the entity's ID.
*   `show_name` (boolean/string): Default `false`. If set to `true`, the name (title) of the selected status is displayed next to the color dot.

![Status Switcher show_name=false](img/status_switcher.no_name.de.png)

## Expected API Formats

### 1. Options API (`options_api_url`)

**Method:** `GET`
**Response:** Should return a JSON object with a `statuses` array.

```json
{
    "statuses": [
        {
            "id": "requested",
            "title": "Requested",
            "color": "#f2a900"
        },
        {
            "id": "confirmed",
            "title": "Confirmed",
            "color": "#6ac86b"
        }
    ]
}
```

### 2. Patch API (`patch_api_url`)

**Method:** `PATCH`
**Payload:** The component sends a JSON body containing the selected status ID:
```json
{
    "status": "confirmed"
}
```

**Response:** Should return a JSON object representing the updated entity, including the updated status fields so the UI can reflect the changes properly (useful if the backend dictates a specific display color):
```json
{
    "id": 123,
    "status": "confirmed",
    "typeColor": "#6ac86b",
    "typeName": "Confirmed",
    "typeRaw": "confirmed"
}
```
