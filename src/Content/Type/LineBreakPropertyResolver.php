<?php

declare(strict_types=1);

namespace Manuxi\SuluAdminExtrasBundle\Content\Type;

use Sulu\Content\Application\ContentResolver\Value\ContentView;
use Sulu\Content\Application\PropertyResolver\Resolver\PropertyResolverInterface;

/**
 * The line break holds no data: it only starts a new row in the admin form, so there is nothing to resolve.
 */
class LineBreakPropertyResolver implements PropertyResolverInterface
{
    public function resolve(mixed $data, string $locale, array $params = []): ContentView
    {
        return ContentView::create(null, []);
    }

    public static function getType(): string
    {
        return 'line_break';
    }
}
