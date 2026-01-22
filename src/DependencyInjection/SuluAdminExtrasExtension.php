<?php

declare(strict_types=1);

namespace Manuxi\SuluAdminExtrasBundle\DependencyInjection;

use Symfony\Component\Config\FileLocator;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Extension\PrependExtensionInterface;
use Symfony\Component\HttpKernel\DependencyInjection\Extension;
use Symfony\Component\Yaml\Yaml;

class SuluAdminExtrasExtension extends Extension implements PrependExtensionInterface
{
    public function prepend(ContainerBuilder $container): void
    {
        // Load default color palettes
        if ($container->hasExtension('sulu_admin_extras')) {
            $defaultConfigFile = __DIR__ . '/../Resources/config/default.yaml';
            if (file_exists($defaultConfigFile)) {
                $defaultConfig = Yaml::parseFile($defaultConfigFile);
                if (isset($defaultConfig['sulu_admin_extras'])) {
                    $container->prependExtensionConfig('sulu_admin_extras', $defaultConfig['sulu_admin_extras']);
                }
            }
        }

        // Register translation paths
        if ($container->hasExtension('framework')) {
            $container->prependExtensionConfig('framework', [
                'translator' => [
                    'paths' => [
                        __DIR__ . '/../Resources/translations',
                    ],
                ],
            ]);
        }
    }

    public function load(array $configs, ContainerBuilder $container): void
    {
        $configuration = new Configuration();
        $config = $this->processConfiguration($configuration, $configs);

        // Set parameters for color palettes
        $palettes = $config['color_palettes'] ?? [];
        $container->setParameter('sulu_admin_extras.color_palettes', $this->normalizePalettes($palettes));

        // Set parameters for transformers (for JS config)
        $container->setParameter('sulu_admin_extras.config', [
            'publish_state_indicator' => $config['publish_state_indicator'] ?? [],
            'star_rating' => $config['star_rating'] ?? [],
            'percent_bar' => $config['percent_bar'] ?? [],
            'type_color' => $config['type_color'] ?? [],
        ]);

        $container->setParameter('sulu_admin_extras.star_rating.max_value', $config['star_rating']['max_value']);
        $container->setParameter('sulu_admin_extras.star_rating.default_value', $config['star_rating']['default_value']);
        $container->setParameter('sulu_admin_extras.star_rating.use_star_symbols', $config['star_rating']['use_star_symbols']);

        // Load services
        $loader = new \Symfony\Component\DependencyInjection\Loader\YamlFileLoader(
            $container,
            new FileLocator(__DIR__ . '/../Resources/config')
        );
        $loader->load('services.yaml');
    }

    /**
     * Normalize palettes to always have {color, name} structure.
     */
    private function normalizePalettes(array $palettes): array
    {
        $normalized = [];

        foreach ($palettes as $paletteName => $colors) {
            $normalized[$paletteName] = [];

            foreach ($colors as $key => $value) {
                if (is_string($value)) {
                    // Short form: key: '#hex'
                    $normalized[$paletteName][$key] = [
                        'color' => $value,
                        'name' => null, // Will use auto-generated translation key
                    ];
                } elseif (is_array($value)) {
                    // Extended form: key: {color: '#hex', name: 'trans.key'}
                    $normalized[$paletteName][$key] = [
                        'color' => $value['color'] ?? '#cccccc',
                        'name' => $value['name'] ?? null,
                    ];
                }
            }
        }

        return $normalized;
    }
}
