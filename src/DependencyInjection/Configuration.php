<?php

declare(strict_types=1);

namespace Manuxi\SuluAdminExtrasBundle\DependencyInjection;

use Symfony\Component\Config\Definition\Builder\TreeBuilder;
use Symfony\Component\Config\Definition\ConfigurationInterface;

class Configuration implements ConfigurationInterface
{
    public function getConfigTreeBuilder(): TreeBuilder
    {
        $treeBuilder = new TreeBuilder('sulu_admin_extras');
        $rootNode = $treeBuilder->getRootNode();

        $rootNode
            ->children()
                // Color Palettes
                ->arrayNode('color_palettes')
                    ->info('Define color palettes for ColorSelect and TypeColor transformers')
                    ->useAttributeAsKey('name')
                    ->arrayPrototype()
                        ->info('Color definitions - supports short form (key: "#hex") or extended form (key: {color: "#hex", name: "trans.key"})')
                        ->useAttributeAsKey('color_key')
                        ->beforeNormalization()
                            ->ifString()
                            ->then(fn($v) => ['color' => $v])
                        ->end()
                        ->variablePrototype()->end()
                    ->end()
                ->end()

                // Publish State Indicator
                ->arrayNode('publish_state_indicator')
                    ->addDefaultsIfNotSet()
                    ->children()
                        ->booleanNode('enabled')->defaultTrue()->end()
                        ->scalarNode('draft_color')->defaultValue('#ffc107')->end()
                        ->scalarNode('published_color')->defaultValue('#198754')->end()
                        ->scalarNode('not_published_color')->defaultValue('#6c757d')->end()
                        ->booleanNode('enable_offset')->defaultFalse()->end()
                        ->integerNode('offset_width')->defaultValue(28)->end()
                    ->end()
                ->end()

                // Star Rating
                ->arrayNode('star_rating')
                    ->addDefaultsIfNotSet()
                    ->children()
                        ->booleanNode('show_value')->defaultTrue()->end()
                        ->integerNode('max_value')
                            ->defaultValue(5)
                            ->validate()
                                ->ifNotInArray([5, 10])
                                ->thenInvalid('max_value must be either 5 or 10')
                            ->end()
                        ->end()
                        ->integerNode('default_value')->defaultValue(3)->end()
                        ->booleanNode('use_star_symbols')->defaultFalse()->end()
                    ->end()
                ->end()

                // Percent Bar
                ->arrayNode('percent_bar')
                    ->addDefaultsIfNotSet()
                    ->children()
                        ->booleanNode('show_value')->defaultTrue()->end()
                        ->scalarNode('value_position')->defaultValue('outside')->end()
                        ->scalarNode('value_color')->defaultValue('#000000')->end()
                        ->integerNode('max_value')->defaultValue(100)->end()
                        ->integerNode('height')->defaultValue(16)->end()
                        ->booleanNode('use_gradient')->defaultTrue()->end()
                        ->scalarNode('gradient_mode')->defaultValue('interpolate')->end()
                        ->scalarNode('color')->defaultValue('#52b6ca')->end()
                        ->booleanNode('animate')->defaultTrue()->end()
                    ->end()
                ->end()

                // Type Color Transformer
                ->arrayNode('type_color')
                    ->addDefaultsIfNotSet()
                    ->children()
                        ->scalarNode('fallback_color')->defaultValue('#cccccc')->end()
                    ->end()
                ->end()

                // Collapsible Sections config
                ->arrayNode('collapsible_sections')
                    ->info('Titles or explicit translation keys of sections that should become collapsible automatically in the admin UI.')
                    ->defaultValue([])
                    ->scalarPrototype()->end()
                ->end()
            ->end();

        return $treeBuilder;
    }
}
