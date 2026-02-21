<?php

declare(strict_types=1);

namespace Manuxi\SuluAdminExtrasBundle\Api;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * Interface for collision check endpoints used by the datetime_end field type.
 *
 * Request: GET {url}?start={iso}&end={iso}&resource={id}&exclude={id}
 * Response: {"collision": true|false}
 *
 * Configure via schemaOptions in form XML:
 *   <param name="collision_check_url" value="/admin/api/your-entity/check-collision"/>
 *   <param name="collision_resource_field" value="resource"/>
 */
interface CollisionCheckInterface
{
    public function checkCollision(Request $request): JsonResponse;
}