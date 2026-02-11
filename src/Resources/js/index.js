// @flow
import { initializer } from 'sulu-admin-bundle/services';
import fieldRegistry from 'sulu-admin-bundle/containers/Form/registries/fieldRegistry';
import listFieldTransformerRegistry from 'sulu-admin-bundle/containers/List/registries/listFieldTransformerRegistry';

// Field Transformers
import PublishStateFieldTransformer from './fieldTransformers/PublishStateFieldTransformer';
import GhostLocaleFieldTransformer from './fieldTransformers/GhostLocaleFieldTransformer';
import StarRatingFieldTransformer from './fieldTransformers/StarRatingFieldTransformer';
import PercentBarFieldTransformer from './fieldTransformers/PercentBarFieldTransformer';
import TypeColorFieldTransformer from './fieldTransformers/TypeColorFieldTransformer';

// Form Fields
import ColorSelect from './containers/Form/fields/ColorSelect';
import NumberWithDefault from './containers/Form/fields/NumberWithDefault';
import SliderRange from './containers/Form/fields/SliderRange';
import StarRatingInput from './containers/Form/fields/StarRatingInput';
import StarRatingSelect from './containers/Form/fields/StarRatingSelect';
import DateTimeWithDefault from './containers/Form/fields/DateTimeWithDefault';

initializer.addUpdateConfigHook('sulu_admin_extras', (config: Object, initialized: boolean) => {
    if (initialized) {
        return;
    }

    const publishStateConfig = config.publish_state_indicator || {};
    const starRatingConfig = config.star_rating || {};
    const percentBarConfig = config.percent_bar || {};

    // Include palettes in typeColorConfig
    const typeColorConfig = {
        ...(config.type_color || {}),
        palettes: config.palettes || {},
    };

    // Register List Field Transformers
    listFieldTransformerRegistry.add(
        'publish_state_indicator',
        new PublishStateFieldTransformer(publishStateConfig)
    );

    listFieldTransformerRegistry.add(
        'ghost_locale_indicator',
        new GhostLocaleFieldTransformer()
    );

    listFieldTransformerRegistry.add(
        'star_rating',
        new StarRatingFieldTransformer(starRatingConfig)
    );

    listFieldTransformerRegistry.add(
        'percent_bar',
        new PercentBarFieldTransformer(percentBarConfig)
    );

    listFieldTransformerRegistry.add(
        'type_color',
        new TypeColorFieldTransformer(typeColorConfig)
    );

    // Register Form Fields
    fieldRegistry.add('number_with_default', NumberWithDefault);
    fieldRegistry.add('color_select', ColorSelect);
    fieldRegistry.add('slider_range', SliderRange);
    fieldRegistry.add('star_rating', StarRatingInput);
    fieldRegistry.add('star_rating_select', StarRatingSelect);
    fieldRegistry.add('datetime_with_default', DateTimeWithDefault);
});

// Export for manual usage
export {
    PublishStateFieldTransformer,
    GhostLocaleFieldTransformer,
    StarRatingFieldTransformer,
    PercentBarFieldTransformer,
    TypeColorFieldTransformer,
    NumberWithDefault,
    ColorSelect,
    SliderRange,
};