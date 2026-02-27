// @flow
import DrawerStore from '../../../src/Resources/js/stores/DrawerStore/DrawerStore';

describe('DrawerStore', () => {
    let store;

    beforeEach(() => {
        store = new DrawerStore();
    });

    test('Should initialize with closed state', () => {
        expect(store.open).toBe(false);
        expect(store.view).toBeNull();
        expect(store.props).toEqual({});
    });

    test('Should open drawer with view and props', () => {
        store.openDrawer('myView', {id: 42});

        expect(store.open).toBe(true);
        expect(store.view).toBe('myView');
        expect(store.props).toEqual({id: 42});
    });

    test('Should open drawer with default empty props', () => {
        store.openDrawer('testView');

        expect(store.open).toBe(true);
        expect(store.view).toBe('testView');
        expect(store.props).toEqual({});
    });

    test('Should close drawer', () => {
        store.openDrawer('myView', {id: 1});
        store.closeDrawer();

        expect(store.open).toBe(false);
        // view and props should remain after close (for animation)
        expect(store.view).toBe('myView');
        expect(store.props).toEqual({id: 1});
    });

    test('Should allow reopening with different view', () => {
        store.openDrawer('viewA');
        store.closeDrawer();
        store.openDrawer('viewB', {foo: 'bar'});

        expect(store.open).toBe(true);
        expect(store.view).toBe('viewB');
        expect(store.props).toEqual({foo: 'bar'});
    });
});
