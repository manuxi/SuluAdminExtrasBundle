<?php

declare(strict_types=1);

namespace Manuxi\SuluAdminExtrasBundle\Service;

use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * Provides color palette options from YAML configuration.
 * 
 * Supports two formats:
 * - Short form: key: '#hex'
 * - Extended form: key: {color: '#hex', name: 'translation.key'}
 */
class ColorPaletteProvider
{
    private array $palettes;
    private string $defaultPalette = 'bootstrap';

    public function __construct(
        private TranslatorInterface $translator,
        array $palettes = [],
    ) {
        $this->palettes = $palettes;
    }

    /**
     * Get all available color values for a specific palette.
     * Returns format suitable for Sulu single_select field type.
     *
     * @param string $paletteName Name of palette (e.g., 'bootstrap', 'event_types')
     *
     * @return array Array of color options with name, value, and title
     */
    public function getValues(string $paletteName = 'bootstrap'): array
    {
        if (!isset($this->palettes[$paletteName])) {
            return [];
        }

        $values = [];

        foreach ($this->palettes[$paletteName] as $key => $config) {
            $color = $config['color'] ?? '#cccccc';
            $transKey = $config['name'] ?? sprintf('sulu_admin_extras.color_palettes.%s.%s', $paletteName, $key);

            $values[] = [
                'name' => $key,
                'value' => sprintf('%s:%s', $key, $color),
                'title' => $this->translator->trans($transKey, [], 'admin'),
            ];
        }

        return $values;
    }

    /**
     * Get color for a specific key in a palette.
     * Useful for backend list enrichment.
     *
     * @param string $paletteName Palette name
     * @param string $key Color key within the palette
     * @param string $fallback Fallback color if not found
     *
     * @return string Hex color code
     */
    public function getColor(string $paletteName, string $key, string $fallback = '#cccccc'): string
    {
        if (!isset($this->palettes[$paletteName][$key])) {
            // Try to find in palette with fallback to first entry
            if (isset($this->palettes[$paletteName])) {
                $firstKey = array_key_first($this->palettes[$paletteName]);
                if ($firstKey !== null) {
                    return $this->palettes[$paletteName][$firstKey]['color'] ?? $fallback;
                }
            }
            return $fallback;
        }

        return $this->palettes[$paletteName][$key]['color'] ?? $fallback;
    }

    /**
     * Get translated name for a specific key in a palette.
     * Useful for backend list enrichment.
     *
     * @param string $paletteName Palette name
     * @param string $key Color key within the palette
     *
     * @return string Translated name
     */
    public function getColorName(string $paletteName, string $key): string
    {
        if (!isset($this->palettes[$paletteName][$key])) {
            return ucfirst($key);
        }

        $config = $this->palettes[$paletteName][$key];
        $transKey = $config['name'] ?? sprintf('sulu_admin_extras.color_palettes.%s.%s', $paletteName, $key);

        return $this->translator->trans($transKey, [], 'admin');
    }

    /**
     * Get default value (first key) for a palette.
     */
    public function getDefaultValue(string $paletteName = 'bootstrap'): string
    {
        if (!isset($this->palettes[$paletteName])) {
            return '';
        }

        return array_key_first($this->palettes[$paletteName]) ?? '';
    }

    /**
     * Get default palette name.
     */
    public function getDefaultPalette(): string
    {
        return $this->defaultPalette;
    }

    /**
     * Get all available palette names.
     */
    public function getAvailablePalettes(): array
    {
        return array_keys($this->palettes);
    }

    /**
     * Check if a palette exists.
     */
    public function hasPalette(string $paletteName): bool
    {
        return isset($this->palettes[$paletteName]);
    }

    /**
     * Check if a key exists in a palette.
     */
    public function hasColor(string $paletteName, string $key): bool
    {
        return isset($this->palettes[$paletteName][$key]);
    }

    /**
     * Get raw palette data (for advanced usage).
     */
    public function getPalette(string $paletteName): array
    {
        return $this->palettes[$paletteName] ?? [];
    }
}
