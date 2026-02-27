// @flow

// Mock all sulu-admin-bundle dependencies
const mockAddUpdateConfigHook = jest.fn();
jest.mock('sulu-admin-bundle/services', () => ({
    initializer: {addUpdateConfigHook: mockAddUpdateConfigHook},
    Requester: {get: jest.fn(), post: jest.fn(), patch: jest.fn()},
}));

const mockFieldRegistryAdd = jest.fn();
jest.mock('sulu-admin-bundle/containers/Form/registries/fieldRegistry', () => ({
    add: mockFieldRegistryAdd,
}));

const mockTransformerRegistryAdd = jest.fn();
jest.mock('sulu-admin-bundle/containers/List/registries/listFieldTransformerRegistry', () => ({
    add: mockTransformerRegistryAdd,
}));

const mockToolbarRegistryAdd = jest.fn();
jest.mock('sulu-admin-bundle/views/Form/registries/formToolbarActionRegistry', () => ({
    add: mockToolbarRegistryAdd,
}));

jest.mock('sulu-admin-bundle/utils', () => ({
    translate: (key) => key,
}));

jest.mock('sulu-admin-bundle/utils/Translator', () => ({
    translate: (key) => key,
}));

jest.mock('sulu-admin-bundle/components', () => ({
    DatePicker: jest.fn(() => null),
    Icon: jest.fn(() => null),
    Input: jest.fn(() => null),
    Checkbox: jest.fn(() => null),
    SingleSelect: Object.assign(jest.fn(() => null), {Option: jest.fn(() => null)}),
    Toggler: jest.fn(() => null),
    Popover: jest.fn(() => null),
    Overlay: jest.fn(() => null),
}));

jest.mock('sulu-admin-bundle/components/Icon', () => jest.fn(() => null));
jest.mock('sulu-admin-bundle/components/Input', () => jest.fn(() => null));
jest.mock('sulu-admin-bundle/components/Popover', () => jest.fn(() => null));
jest.mock('sulu-admin-bundle/components/Overlay', () => jest.fn(() => null));

jest.mock('sulu-admin-bundle/stores/SingleSelectionStore', () => {
    return jest.fn().mockImplementation(() => ({item: null, loading: false, clear: jest.fn(), set: jest.fn()}));
});

jest.mock('sulu-admin-bundle/stores/SearchStore', () => {
    return jest.fn().mockImplementation(() => ({
        searchResults: [], loading: false, search: jest.fn(), clearSearchResults: jest.fn(),
    }));
});

jest.mock('sulu-admin-bundle/stores/userStore', () => ({contentLocale: 'de'}));

jest.mock('sulu-admin-bundle/containers/SingleListOverlay', () => jest.fn(() => null));

jest.mock('sulu-admin-bundle/services/Requester', () => ({
    get: jest.fn(() => Promise.resolve({})),
    post: jest.fn(() => Promise.resolve({})),
    patch: jest.fn(() => Promise.resolve({})),
}));

jest.mock('sulu-admin-bundle/views/Form/toolbarActions/AbstractFormToolbarAction', () => {
    return class AbstractFormToolbarAction {
        constructor(resourceFormStore, form, router, locales, options) {
            this.resourceFormStore = resourceFormStore;
            this.form = form;
            this.router = router;
            this.locales = locales;
            this.options = options || {};
        }
    };
});

// Mock collapsibleSection side effects
jest.mock('../../src/Resources/js/utils/collapsibleSection.js', () => {});
jest.mock('../../src/Resources/js/utils/collapsibleSection.scss', () => ({}));

// Mock fetch for PublicHolidays
global.fetch = jest.fn(() => Promise.resolve({ok: true, json: () => Promise.resolve([])}));

// Import index once - module runs at import time
const indexModule = require('../../src/Resources/js/index');

// Capture the hook function immediately (before clearMocks runs)
const hookCallArgs = mockAddUpdateConfigHook.mock.calls[0];
const hookKey = hookCallArgs ? hookCallArgs[0] : null;
const hookFn = hookCallArgs ? hookCallArgs[1] : null;

// Run the hook once to populate registries
if (hookFn) hookFn({}, false);

// Capture registration results before clearMocks
const registeredTransformers = mockTransformerRegistryAdd.mock.calls.map(c => c[0]);
const registeredFields = mockFieldRegistryAdd.mock.calls.map(c => c[0]);
const toolbarCalls = [...mockToolbarRegistryAdd.mock.calls];

describe('index.js (bundle initialization)', () => {
    test('Should register updateConfigHook with sulu_admin_extras key', () => {
        expect(hookKey).toBe('sulu_admin_extras');
        expect(typeof hookFn).toBe('function');
    });

    test('Should register all field transformers when config hook runs', () => {
        expect(registeredTransformers).toContain('publish_state_indicator');
        expect(registeredTransformers).toContain('ghost_locale_indicator');
        expect(registeredTransformers).toContain('star_rating');
        expect(registeredTransformers).toContain('percent_bar');
        expect(registeredTransformers).toContain('type_color');
        expect(registeredTransformers).toContain('color_dot');
        expect(registeredTransformers).toContain('status_switcher');
    });

    test('Should register all form fields when config hook runs', () => {
        expect(registeredFields).toContain('number_with_default');
        expect(registeredFields).toContain('color_select');
        expect(registeredFields).toContain('slider_range');
        expect(registeredFields).toContain('star_rating');
        expect(registeredFields).toContain('star_rating_select');
        expect(registeredFields).toContain('datetime_with_default');
        expect(registeredFields).toContain('datetime_start');
        expect(registeredFields).toContain('datetime_end');
        expect(registeredFields).toContain('business_hours');
        expect(registeredFields).toContain('public_holidays');
        expect(registeredFields).toContain('holiday_dates');
        expect(registeredFields).toContain('single_contact_autocomplete');
    });

    test('Should register AddNew toolbar action', () => {
        const addNewCall = toolbarCalls.find(c => c[0] === 'sulu_admin_extras.add_new');
        expect(addNewCall).toBeTruthy();
        expect(typeof addNewCall[1]).toBe('function');
    });

    test('Should skip registration when already initialized', () => {
        // Call hookFn with initialized=true - should return early
        const fieldCallsBefore = mockFieldRegistryAdd.mock.calls.length;
        hookFn({}, true);
        expect(mockFieldRegistryAdd.mock.calls.length).toBe(fieldCallsBefore);
    });

    test('Should export all public components', () => {
        expect(indexModule.PublishStateFieldTransformer).toBeDefined();
        expect(indexModule.GhostLocaleFieldTransformer).toBeDefined();
        expect(indexModule.StarRatingFieldTransformer).toBeDefined();
        expect(indexModule.PercentBarFieldTransformer).toBeDefined();
        expect(indexModule.TypeColorFieldTransformer).toBeDefined();
        expect(indexModule.ColorDotFieldTransformer).toBeDefined();
        expect(indexModule.StatusSwitcherFieldTransformer).toBeDefined();
        expect(indexModule.NumberWithDefault).toBeDefined();
        expect(indexModule.ColorSelect).toBeDefined();
        expect(indexModule.SliderRange).toBeDefined();
        expect(indexModule.DateTimeStart).toBeDefined();
        expect(indexModule.DateTimeEnd).toBeDefined();
        expect(indexModule.DateTimeWithDefault).toBeDefined();
        expect(indexModule.BusinessHours).toBeDefined();
        expect(indexModule.PublicHolidays).toBeDefined();
        expect(indexModule.HolidayDates).toBeDefined();
        expect(indexModule.SingleContactAutocomplete).toBeDefined();
        expect(indexModule.Drawer).toBeDefined();
        expect(indexModule.drawerStore).toBeDefined();
        expect(indexModule.drawerRegistry).toBeDefined();
    });

    test('Should set window.suluAdminExtras globals', () => {
        expect(window.suluAdminExtras).toBeDefined();
        expect(window.suluAdminExtras.Drawer).toBeDefined();
        expect(window.suluAdminExtras.drawerStore).toBeDefined();
        expect(window.suluAdminExtras.drawerRegistry).toBeDefined();
    });
});
