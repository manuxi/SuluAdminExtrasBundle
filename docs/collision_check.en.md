# Collision Check for `datetime_end` Field Type

The `datetime_end` field type supports an optional real-time collision check via an API endpoint. When configured, the field will call the endpoint whenever start, end, or resource values change and display a warning if a collision is detected.

## Configuration

Add the following `schemaOptions` to your form XML:

```xml
<property name="end" type="datetime_end" mandatory="true" colspan="6">
    <params>
        <param name="step" value="15"/>
        <param name="start_date_field" value="start"/>
        <param name="collision_check_url" value="/admin/api/appointments/check-collision"/>
        <param name="collision_resource_field" value="resource"/>
    </params>
</property>
```

### Parameters

| Parameter | Required | Default | Description |
|---|---|---|---|
| `start_date_field` | No | `start` | Form field name that holds the start datetime |
| `collision_check_url` | No | — | API endpoint URL. If omitted, no collision check is performed |
| `collision_resource_field` | No | `resource` | Form field name that holds the resource ID |
| `step` | No | `1` | Minute step for the time picker |

## API Endpoint Contract

The endpoint must implement `Manuxi\SuluAdminExtrasBundle\Api\CollisionCheckInterface`.

### Request

```
GET {collision_check_url}?start={iso_datetime}&end={iso_datetime}&resource={id}&exclude={entity_id}
```

| Query Parameter | Description |
|---|---|
| `start` | Start datetime (ISO 8601) |
| `end` | End datetime (ISO 8601) |
| `resource` | Resource/entity ID to check collisions for |
| `exclude` | Entity ID to exclude (current entity on update) |

### Response

```json
{"collision": true}
```

or

```json
{"collision": false}
```

## Behavior

- **No `collision_check_url`**: No collision check, only start/end validation
- **No resource selected**: No collision check (skipped silently)
- **Collision detected**: Field border turns orange with a warning message, save is blocked
- **End before start**: Field border turns red with an error message, save is blocked
- **Debounce**: API calls are debounced by 400ms to avoid excessive requests

## Example Endpoint Implementation

```php
#[Route('/appointments/check-collision', methods: ['GET'], priority: 10)]
public function checkCollision(Request $request): JsonResponse
{
    $start = $this->hydrateDateTime($request->query->get('start'));
    $end = $this->hydrateDateTime($request->query->get('end'));
    $resourceId = $request->query->getInt('resource', 0);
    $excludeUuid = $request->query->get('exclude');

    if (!$start || !$end || !$resourceId) {
        return new JsonResponse(['collision' => false]);
    }

    $collision = $this->repository->hasCollision(
        $resourceId, $start, $end, $excludeUuid
    );

    return new JsonResponse(['collision' => $collision]);
}
```