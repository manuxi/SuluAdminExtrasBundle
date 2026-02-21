# Kollisionsprüfung für den Feldtyp `datetime_end`

Der Feldtyp `datetime_end` unterstützt eine optionale Echtzeit-Kollisionsprüfung über einen API-Endpunkt. Wenn konfiguriert, ruft das Feld den Endpunkt bei jeder Änderung von Start, Ende oder Ressource auf und zeigt eine Warnung an, falls eine Kollision erkannt wird.

## Konfiguration

Folgende `schemaOptions` in der Form-XML hinzufügen:

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

### Parameter

| Parameter | Pflicht | Standard | Beschreibung |
|---|---|---|---|
| `start_date_field` | Nein | `start` | Formularfeld mit dem Start-Datum |
| `collision_check_url` | Nein | — | API-Endpunkt-URL. Wenn leer, wird keine Kollisionsprüfung durchgeführt |
| `collision_resource_field` | Nein | `resource` | Formularfeld mit der Ressource-ID |
| `step` | Nein | `1` | Minutenschritt für die Zeitauswahl |

## API-Endpunkt-Vertrag

Der Endpunkt muss `Manuxi\SuluAdminExtrasBundle\Api\CollisionCheckInterface` implementieren.

### Request

```
GET {collision_check_url}?start={iso_datetime}&end={iso_datetime}&resource={id}&exclude={entity_id}
```

| Query-Parameter | Beschreibung |
|---|---|
| `start` | Start-Datum (ISO 8601) |
| `end` | End-Datum (ISO 8601) |
| `resource` | Ressource-/Entity-ID für die Kollisionsprüfung |
| `exclude` | Entity-ID zum Ausschließen (aktuelle Entity bei Update) |

### Response

```json
{"collision": true}
```

oder

```json
{"collision": false}
```

## Verhalten

- **Kein `collision_check_url`**: Keine Kollisionsprüfung, nur Start/Ende-Validierung
- **Keine Ressource gewählt**: Keine Kollisionsprüfung (wird übersprungen)
- **Kollision erkannt**: Feldrahmen wird orange mit Warnmeldung, Speichern wird blockiert
- **Ende vor Start**: Feldrahmen wird rot mit Fehlermeldung, Speichern wird blockiert
- **Debounce**: API-Aufrufe werden um 400ms verzögert, um übermäßige Requests zu vermeiden

## Übersetzungsschlüssel

| Schlüssel | Verwendung |
|---|---|
| `sulu_admin_extras.errors.start_after_end` | End-Datum liegt vor dem Start-Datum |
| `sulu_admin_extras.errors.collision` | Kollision erkannt |

## Beispiel-Endpunkt-Implementierung

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