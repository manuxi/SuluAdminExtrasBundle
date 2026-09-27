<?php

declare(strict_types=1);

namespace Manuxi\SuluAdminExtrasBundle\Twig;

use Manuxi\SuluAdminExtrasBundle\Icon\IconSetResolver;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

final class IconSelectionTwigExtension extends AbstractExtension
{
    public function __construct(
        private readonly IconSetResolver $resolver,
        private readonly bool $debug = false,
    ) {}

    public function getFunctions(): array
    {
        return [
            new TwigFunction('sulu_icon', $this->renderIcon(...), ['is_safe' => ['html']]),
        ];
    }

    /**
     * @param array{class?: string, size?: string|int, title?: string, icon_set?: string} $options
     */
    public function renderIcon(mixed $value, array $options = []): string
    {
        [$iconSet, $name] = $this->resolveReference($value, $options);

        if (null === $iconSet || null === $name) {
            return '';
        }

        $content = $this->resolver->resolveContent($iconSet, $name);

        if (null === $content) {
            if ($this->debug) {
                throw new \InvalidArgumentException(\sprintf('Icon "%s" does not exist in set "%s".', $name, $iconSet));
            }

            return '';
        }

        return $this->wrap($content, $iconSet, $options);
    }

    /**
     * @param array{icon_set?: string} $options
     *
     * @return array{0: ?string, 1: ?string}
     */
    private function resolveReference(mixed $value, array $options): array
    {
        if (\is_array($value) && isset($value['name'], $value['icon_set'])) {
            return [(string) $value['icon_set'], (string) $value['name']];
        }

        if (\is_string($value) && '' !== $value) {
            if (\str_contains($value, ':')) {
                [$iconSet, $name] = \explode(':', $value, 2);

                return [$iconSet, $name];
            }

            $iconSet = \is_string($options['icon_set'] ?? null) ? $options['icon_set'] : null;

            return [$iconSet, $value];
        }

        return [null, null];
    }

    /**
     * @param array{class?: string, size?: string|int, title?: string} $options
     */
    private function wrap(string $rawSvg, string $iconSet, array $options): string
    {
        if (!\preg_match('/<svg\b([^>]*)>(.*)<\/svg>/is', $rawSvg, $matches)) {
            return '';
        }

        [, $sourceAttributes, $inner] = $matches;
        \preg_match('/viewBox="([^"]+)"/i', $sourceAttributes, $viewBoxMatch);

        $size = (string) ($options['size'] ?? '1em');
        $attributes = [
            'class' => trim('sulu-icon sulu-icon--' . $iconSet . ' ' . ($options['class'] ?? '')),
            'width' => $size,
            'height' => $size,
            'viewBox' => $viewBoxMatch[1] ?? '0 0 16 16',
            'fill' => 'currentColor',
        ];

        $title = $options['title'] ?? null;
        if (\is_string($title) && '' !== $title) {
            $attributes['role'] = 'img';
            $attributes['aria-label'] = $title;
        } else {
            $attributes['aria-hidden'] = 'true';
            $attributes['focusable'] = 'false';
        }

        return \sprintf('<svg%s>%s</svg>', $this->renderAttributes($attributes), $inner);
    }

    /**
     * @param array<string, string> $attributes
     */
    private function renderAttributes(array $attributes): string
    {
        $html = '';
        foreach ($attributes as $name => $value) {
            $html .= \sprintf(' %s="%s"', $name, $this->escape($value));
        }

        return $html;
    }

    private function escape(string $value): string
    {
        return htmlspecialchars($value, \ENT_QUOTES | \ENT_SUBSTITUTE, 'UTF-8');
    }
}
