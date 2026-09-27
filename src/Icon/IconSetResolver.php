<?php

declare(strict_types=1);

namespace Manuxi\SuluAdminExtrasBundle\Icon;

use Sulu\Bundle\AdminBundle\Icon\IconProviderInterface;

final class IconSetResolver
{
    /**
     * @param array<string, string> $iconSets
     * @param iterable<string, IconProviderInterface> $iconProviders
     */
    public function __construct(
        private readonly array $iconSets,
        private readonly iterable $iconProviders,
    ) {}

    public function resolveContent(string $iconSet, string $name): ?string
    {
        $definition = $this->iconSets[$iconSet] ?? null;

        if (null === $definition) {
            return null;
        }

        [$provider, $path] = array_pad(explode('://', $definition, 2), 2, '');
        $providers = $this->iconProviders instanceof \Traversable
            ? iterator_to_array($this->iconProviders)
            : $this->iconProviders;

        if (!isset($providers[$provider])) {
            return null;
        }

        foreach ($providers[$provider]->getIcons($path) as $icon) {
            if ($icon['id'] === $name) {
                return $icon['content'];
            }
        }

        return null;
    }

    public function iconExists(string $iconSet, string $name): bool
    {
        return null !== $this->resolveContent($iconSet, $name);
    }
}
