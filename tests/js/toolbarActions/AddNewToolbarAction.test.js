// @flow
jest.mock('sulu-admin-bundle/utils', () => ({
    translate: (key) => key,
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

import AddNewToolbarAction from '../../../src/Resources/js/toolbarActions/AddNewToolbarAction';

describe('AddNewToolbarAction', () => {
    const createAction = (options = {}, routerAttrs = {}, formData = {}) => {
        const router = {
            navigate: jest.fn(),
            attributes: routerAttrs,
        };
        const resourceFormStore = {
            data: formData,
        };
        return new AddNewToolbarAction(resourceFormStore, {}, router, [], options);
    };

    test('Should return toolbar config with label and icon', () => {
        const action = createAction({route: 'my_route'});
        const config = action.getToolbarItemConfig();

        expect(config.label).toBe('sulu_admin_extras.new');
        expect(config.icon).toBe('su-plus-circle');
        expect(config.type).toBe('button');
        expect(typeof config.onClick).toBe('function');
    });

    test('Should throw when route option is missing', () => {
        const action = createAction({});
        const config = action.getToolbarItemConfig();

        expect(() => config.onClick()).toThrow('The "route" option must be set');
    });

    test('Should navigate to route on click', () => {
        const action = createAction({route: 'my_route'});
        const config = action.getToolbarItemConfig();
        config.onClick();

        expect(action.router.navigate).toHaveBeenCalledWith('my_route', {});
    });

    test('Should pass locale when available', () => {
        const action = createAction(
            {route: 'my_route'},
            {locale: 'de'}
        );
        const config = action.getToolbarItemConfig();
        config.onClick();

        expect(action.router.navigate).toHaveBeenCalledWith('my_route', {locale: 'de'});
    });

    test('Should pass date from formStore when passDate is true', () => {
        const action = createAction(
            {route: 'my_route', passDate: true},
            {},
            {startDate: '2025-06-15T10:00:00'}
        );
        const config = action.getToolbarItemConfig();
        config.onClick();

        expect(action.router.navigate).toHaveBeenCalledWith(
            'my_route',
            expect.objectContaining({date: '2025-06-15'})
        );
    });

    test('Should use custom date field when passDate is a string', () => {
        const action = createAction(
            {route: 'my_route', passDate: 'myDateField'},
            {},
            {myDateField: '2025-12-25T08:00:00'}
        );
        const config = action.getToolbarItemConfig();
        config.onClick();

        expect(action.router.navigate).toHaveBeenCalledWith(
            'my_route',
            expect.objectContaining({date: '2025-12-25'})
        );
    });

    test('Should fall back to router date attribute', () => {
        const action = createAction(
            {route: 'my_route', passDate: true},
            {date: '2025-03-01'}
        );
        const config = action.getToolbarItemConfig();
        config.onClick();

        expect(action.router.navigate).toHaveBeenCalledWith(
            'my_route',
            expect.objectContaining({date: '2025-03-01'})
        );
    });

    test('Should use current date when passDate is true but no date found', () => {
        const action = createAction(
            {route: 'my_route', passDate: true},
            {},
            {}
        );
        const config = action.getToolbarItemConfig();
        config.onClick();

        const now = new Date();
        const expectedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        expect(action.router.navigate).toHaveBeenCalledWith(
            'my_route',
            expect.objectContaining({date: expectedDate})
        );
    });

    test('Should handle invalid date string gracefully', () => {
        const action = createAction(
            {route: 'my_route', passDate: true},
            {},
            {startDate: 'not-a-date'}
        );
        const config = action.getToolbarItemConfig();
        config.onClick();

        // Should fall back to current date
        const call = action.router.navigate.mock.calls[0];
        expect(call[1].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
});
