<?php

declare(strict_types=1);

namespace Manuxi\SuluAdminExtrasBundle\Content\Type;

use Sulu\Content\Application\ContentResolver\Value\ContentView;
use Sulu\Content\Application\PropertyResolver\Resolver\PropertyResolverInterface;

class ColorSelectPropertyResolver implements PropertyResolverInterface
{
    public function resolve(mixed $data, string $locale, array $params = []): ContentView
    {
        $value = $data;

        // Return only the key part (e.g., "primary" from "primary:#0d6efd")
        if (\is_string($value) && strpos($value, ':') !== false) {
            $value = explode(':', $value)[0];
        }

        $content = $value ?: '';

        return ContentView::create($content, ['value' => $content]);
    }

    public static function getType(): string
    {
        return 'color_select';
    }
}
