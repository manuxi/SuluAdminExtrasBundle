<?php

declare(strict_types=1);

namespace Manuxi\SuluAdminExtrasBundle\Tests\Unit\Twig;

use Manuxi\SuluAdminExtrasBundle\Icon\IconSetResolver;
use Manuxi\SuluAdminExtrasBundle\Tests\Unit\FakeIconProvider;
use Manuxi\SuluAdminExtrasBundle\Twig\IconSelectionTwigExtension;
use PHPUnit\Framework\TestCase;
use Twig\Environment;
use Twig\Loader\ArrayLoader;

class IconSelectionTwigExtensionTest extends TestCase
{
    private function createExtension(bool $debug = false): IconSelectionTwigExtension
    {
        $resolver = new IconSetResolver(
            ['bootstrap-icons' => 'svg://ignored'],
            ['svg' => new FakeIconProvider()],
        );

        return new IconSelectionTwigExtension($resolver, $debug);
    }

    public function testRendersResolvedReference(): void
    {
        $html = $this->createExtension()->renderIcon(['name' => 'calendar-heart', 'icon_set' => 'bootstrap-icons'], ['class' => 'me-2']);

        $this->assertSame(
            '<svg class="sulu-icon sulu-icon--bootstrap-icons me-2" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">'
            . '<path d="M1 2"/></svg>',
            $html,
        );
    }

    public function testPlainNameWithExplicitIconSetOption(): void
    {
        $html = $this->createExtension()->renderIcon('house', ['icon_set' => 'bootstrap-icons']);

        $this->assertStringContainsString('<path d="M2 3"/>', $html);
    }

    public function testPoolPrefixedName(): void
    {
        $html = $this->createExtension()->renderIcon('bootstrap-icons:house');

        $this->assertStringContainsString('<path d="M2 3"/>', $html);
    }

    public function testTitleMakesIconAccessible(): void
    {
        $html = $this->createExtension()->renderIcon('house', ['icon_set' => 'bootstrap-icons', 'title' => 'Home "page"', 'size' => 24]);

        $this->assertStringContainsString('role="img" aria-label="Home &quot;page&quot;"', $html);
        $this->assertStringContainsString('width="24" height="24"', $html);
        $this->assertStringNotContainsString('aria-hidden', $html);
    }

    public function testEmptyOrUnknownValueRendersNothing(): void
    {
        $extension = $this->createExtension();

        $this->assertSame('', $extension->renderIcon(null));
        $this->assertSame('', $extension->renderIcon(''));
        $this->assertSame('', $extension->renderIcon('does-not-exist', ['icon_set' => 'bootstrap-icons']));
        $this->assertSame('', $extension->renderIcon('house'));
        $this->assertSame('', $extension->renderIcon('house', ['icon_set' => 'unknown-set']));
    }

    public function testUnknownIconThrowsInDebug(): void
    {
        $this->expectException(\InvalidArgumentException::class);

        $this->createExtension(true)->renderIcon('does-not-exist', ['icon_set' => 'bootstrap-icons']);
    }

    public function testFunctionIsRegisteredAndNotEscaped(): void
    {
        $twig = new Environment(new ArrayLoader(['icon' => '{{ sulu_icon(icon) }}']));
        $twig->addExtension($this->createExtension());

        $html = $twig->render('icon', ['icon' => ['name' => 'house', 'icon_set' => 'bootstrap-icons']]);

        $this->assertStringStartsWith('<svg ', $html);
    }
}
