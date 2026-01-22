<?php

declare(strict_types=1);

namespace Manuxi\SuluAdminExtrasBundle\Content\Type;

use Sulu\Content\Application\ContentResolver\Value\ContentView;
use Sulu\Content\Application\PropertyResolver\Resolver\PropertyResolverInterface;

class NumberWithDefaultPropertyResolver implements PropertyResolverInterface
{
    public function resolve(mixed $data, string $locale, array $params = []): ContentView
    {
        $value = $data;

        // Use default value if no value is set
        if (null === $value || '' === $value) {
             if (isset($params['default_value'])) {
                $value = $params['default_value'];
            }
        }

        $content = \is_numeric($value) ? (float) $value : null;

        return ContentView::create($content, ['value' => $content]);
    }

    public static function getType(): string
    {
        return 'number_with_default';
    }
}
