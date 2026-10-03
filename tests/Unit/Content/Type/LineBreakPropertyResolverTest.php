<?php

declare(strict_types=1);

namespace Manuxi\SuluAdminExtrasBundle\Tests\Unit\Content\Type;

use Manuxi\SuluAdminExtrasBundle\Content\Type\LineBreakPropertyResolver;
use PHPUnit\Framework\TestCase;

class LineBreakPropertyResolverTest extends TestCase
{
    public function testType(): void
    {
        $this->assertSame('line_break', LineBreakPropertyResolver::getType());
    }

    public function testResolvesToNothing(): void
    {
        $view = (new LineBreakPropertyResolver())->resolve(null, 'de');

        $this->assertNull($view->getContent());
    }
}
