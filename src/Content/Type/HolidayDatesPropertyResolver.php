<?php

declare(strict_types=1);

namespace Manuxi\SuluAdminExtrasBundle\Content\Type;

use Sulu\Content\Application\ContentResolver\Value\ContentView;
use Sulu\Content\Application\PropertyResolver\Resolver\PropertyResolverInterface;

class HolidayDatesPropertyResolver implements PropertyResolverInterface
{
    public function resolve(mixed $data, string $locale, array $params = []): ContentView
    {
        if (null === $data || '' === $data) {
            $data = [];
        }

        if (\is_string($data)) {
            $data = json_decode($data, true);
        }

        if (!\is_array($data)) {
            $data = [];
        }

        return ContentView::create($data, []);
    }

    public static function getType(): string
    {
        return 'holiday_dates';
    }
}