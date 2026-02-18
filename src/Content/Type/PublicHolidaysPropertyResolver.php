<?php

declare(strict_types=1);

namespace Manuxi\SuluAdminExtrasBundle\Content\Type;

use Sulu\Content\Application\ContentResolver\Value\ContentView;
use Sulu\Content\Application\PropertyResolver\Resolver\PropertyResolverInterface;

class PublicHolidaysPropertyResolver implements PropertyResolverInterface
{
    public function resolve(mixed $data, string $locale, array $params = []): ContentView
    {
        if (null === $data || '' === $data) {
            $data = ['country' => 'DE', 'subdivision' => null, 'year' => (int) date('Y'), 'holidays' => []];
        }

        if (\is_string($data)) {
            $data = json_decode($data, true);
        }

        if (!\is_array($data)) {
            $data = ['country' => 'DE', 'subdivision' => null, 'year' => (int) date('Y'), 'holidays' => []];
        }

        return ContentView::create($data, []);
    }

    public static function getType(): string
    {
        return 'public_holidays';
    }
}