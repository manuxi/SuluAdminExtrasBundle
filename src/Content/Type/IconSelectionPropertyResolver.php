<?php

declare(strict_types=1);

namespace Manuxi\SuluAdminExtrasBundle\Content\Type;

use Manuxi\SuluAdminExtrasBundle\Icon\IconSetResolver;
use Sulu\Content\Application\ContentResolver\Value\ContentView;
use Sulu\Content\Application\PropertyResolver\Resolver\PropertyResolverInterface;

final class IconSelectionPropertyResolver implements PropertyResolverInterface
{
    public function __construct(
        private readonly IconSetResolver $resolver,
    ) {}

    public function resolve(mixed $data, string $locale, array $params = []): ContentView
    {
        $name = \is_string($data) && '' !== $data ? $data : null;
        $iconSet = \is_string($params['icon_set'] ?? null) ? $params['icon_set'] : null;

        // an icon removed from its set (e.g. renamed in an update) or a missing "icon_set" param resolve to
        // null so templates can fall back instead of rendering a broken reference
        $content = null !== $name && null !== $iconSet && $this->resolver->iconExists($iconSet, $name)
            ? ['name' => $name, 'icon_set' => $iconSet]
            : null;

        return ContentView::create($content, [...$params]);
    }

    public static function getType(): string
    {
        return 'single_icon_selection';
    }
}
