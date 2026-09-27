<?php

declare(strict_types=1);

namespace Manuxi\SuluAdminExtrasBundle\Tests\Unit;

use Sulu\Bundle\AdminBundle\Icon\IconProviderInterface;

final class FakeIconProvider implements IconProviderInterface
{
    /**
     * @return array<array{id: string, content: string}>
     */
    public function getIcons(string $path): array
    {
        return [
            ['id' => 'calendar-heart', 'content' => '<svg viewBox="0 0 16 16"><path d="M1 2"/></svg>'],
            ['id' => 'house', 'content' => '<svg viewBox="0 0 16 16"><path d="M2 3"/></svg>'],
        ];
    }
}
