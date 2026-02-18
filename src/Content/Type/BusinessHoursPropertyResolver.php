<?php

declare(strict_types=1);

namespace Manuxi\SuluAdminExtrasBundle\Content\Type;

use Sulu\Content\Application\ContentResolver\Value\ContentView;
use Sulu\Content\Application\PropertyResolver\Resolver\PropertyResolverInterface;

class BusinessHoursPropertyResolver implements PropertyResolverInterface
{
    public function resolve(mixed $data, string $locale, array $params = []): ContentView
    {
        if (null === $data || '' === $data) {
            $data = $this->getDefaultValue();
        }

        if (\is_string($data)) {
            $data = json_decode($data, true);
        }

        if (!\is_array($data)) {
            $data = $this->getDefaultValue();
        }

        return ContentView::create($data, []);
    }

    public static function getType(): string
    {
        return 'business_hours';
    }

    private function getDefaultValue(): array
    {
        $weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
        $weekend = ['saturday', 'sunday'];
        $data = [];

        foreach ($weekdays as $day) {
            $data[$day] = [
                'enabled' => true,
                'break' => true,
                'slots' => [
                    ['start' => '08:00', 'end' => '12:00'],
                    ['start' => '13:00', 'end' => '17:00'],
                ],
            ];
        }

        foreach ($weekend as $day) {
            $data[$day] = [
                'enabled' => false,
                'break' => false,
                'slots' => [],
            ];
        }

        return $data;
    }
}