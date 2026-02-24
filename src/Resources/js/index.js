import { initializer } from 'sulu-admin-bundle/services';
import fieldRegistry from 'sulu-admin-bundle/containers/Form/registries/fieldRegistry';
import listFieldTransformerRegistry from 'sulu-admin-bundle/containers/List/registries/listFieldTransformerRegistry';

import PublishStateFieldTransformer from './fieldTransformers/PublishStateFieldTransformer';
import GhostLocaleFieldTransformer from './fieldTransformers/GhostLocaleFieldTransformer';
import StarRatingFieldTransformer from './fieldTransformers/StarRatingFieldTransformer';
import PercentBarFieldTransformer from './fieldTransformers/PercentBarFieldTransformer';
import TypeColorFieldTransformer from './fieldTransformers/TypeColorFieldTransformer';
import ColorDotFieldTransformer from './fieldTransformers/ColorDotFieldTransformer';

import ColorSelect from './containers/Form/fields/ColorSelect';
import NumberWithDefault from './containers/Form/fields/NumberWithDefault';
import SliderRange from './containers/Form/fields/SliderRange';
import StarRatingInput from './containers/Form/fields/StarRatingInput';
import StarRatingSelect from './containers/Form/fields/StarRatingSelect';
import DateTimeStart from './containers/Form/fields/DateTimeStart';
import DateTimeEnd from './containers/Form/fields/DateTimeEnd';
import DateTimeWithDefault from './containers/Form/fields/DateTimeWithDefault';

import BusinessHours from './containers/Form/fields/BusinessHours/BusinessHours';
import PublicHolidays from './containers/Form/fields/PublicHolidays/PublicHolidays';
import HolidayDates from './containers/Form/fields/HolidayDates/HolidayDates';

import './utils/collapsibleSection.js';
import './utils/collapsibleSection.scss';

import Drawer from './containers/Drawer';
import drawerStore from './stores/DrawerStore';
import drawerRegistry from './registries/DrawerRegistry';

initializer.addUpdateConfigHook('sulu_admin_extras', (config, initialized) => {
    if (initialized) {
        return;
    }

    const publishStateConfig = config.publish_state_indicator || {};
    const starRatingConfig = config.star_rating || {};
    const percentBarConfig = config.percent_bar || {};
    const typeColorConfig = config.type_color || {};
    const collapsibleSectionsConfig = config.collapsible_sections || [];

    window.suluAdminExtras = {
        ...(window.suluAdminExtras || {}),
        collapsibleSections: collapsibleSectionsConfig
    };

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

    listFieldTransformerRegistry.add(
        'color_dot',
        new ColorDotFieldTransformer()
    );

    fieldRegistry.add('number_with_default', NumberWithDefault);
    fieldRegistry.add('color_select', ColorSelect);
    fieldRegistry.add('slider_range', SliderRange);
    fieldRegistry.add('star_rating', StarRatingInput);
    fieldRegistry.add('star_rating_select', StarRatingSelect);
    fieldRegistry.add('datetime_with_default', DateTimeWithDefault);
    fieldRegistry.add('datetime_start', DateTimeStart);
    fieldRegistry.add('datetime_end', DateTimeEnd);

    fieldRegistry.add('business_hours', BusinessHours);
    fieldRegistry.add('public_holidays', PublicHolidays);
    fieldRegistry.add('holiday_dates', HolidayDates);
});

export {
    PublishStateFieldTransformer,
    GhostLocaleFieldTransformer,
    StarRatingFieldTransformer,
    PercentBarFieldTransformer,
    TypeColorFieldTransformer,
    ColorDotFieldTransformer,
    NumberWithDefault,
    ColorSelect,
    SliderRange,
    DateTimeStart,
    DateTimeEnd,
    DateTimeWithDefault,
    BusinessHours,
    PublicHolidays,
    HolidayDates,
    Drawer,
    drawerStore,
    drawerRegistry,
};

window.suluAdminExtras = {
    ...(window.suluAdminExtras || {}),
    Drawer,
    drawerStore,
    drawerRegistry,
};