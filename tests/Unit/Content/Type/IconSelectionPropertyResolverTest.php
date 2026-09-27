<?php

declare(strict_types=1);

namespace Manuxi\SuluAdminExtrasBundle\Tests\Unit\Content\Type;

use Manuxi\SuluAdminExtrasBundle\Content\Type\IconSelectionPropertyResolver;
use Manuxi\SuluAdminExtrasBundle\Icon\IconSetResolver;
use Manuxi\SuluAdminExtrasBundle\Tests\Unit\FakeIconProvider;
use PHPUnit\Framework\TestCase;

class IconSelectionPropertyResolverTest extends TestCase
{
    private IconSelectionPropertyResolver $resolver;

    protected function setUp(): void
    {
        $iconSetResolver = new IconSetResolver(
            ['bootstrap-icons' => 'svg://ignored'],
            ['svg' => new FakeIconProvider()],
        );

        $this->resolver = new IconSelectionPropertyResolver($iconSetResolver);
    }

    public function testType(): void
    {
        $this->assertSame('single_icon_selection', IconSelectionPropertyResolver::getType());
    }

    public function testResolvesStoredValueWithIconSetParam(): void
    {
        $view = $this->resolver->resolve('house', 'de', ['icon_set' => 'bootstrap-icons']);

        $this->assertSame(['name' => 'house', 'icon_set' => 'bootstrap-icons'], $view->getContent());
    }

    public function testUnknownIconResolvesToNull(): void
    {
        $this->assertNull($this->resolver->resolve('does-not-exist', 'de', ['icon_set' => 'bootstrap-icons'])->getContent());
    }

    public function testMissingIconSetParamResolvesToNull(): void
    {
        $this->assertNull($this->resolver->resolve('house', 'de')->getContent());
    }

    public function testEmptyValueResolvesToNull(): void
    {
        $this->assertNull($this->resolver->resolve(null, 'de', ['icon_set' => 'bootstrap-icons'])->getContent());
        $this->assertNull($this->resolver->resolve('', 'de', ['icon_set' => 'bootstrap-icons'])->getContent());
    }
}
