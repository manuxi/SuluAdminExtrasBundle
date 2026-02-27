// @flow
import React from 'react';
import {mount} from 'enzyme';
import {render} from '@testing-library/react';

// Mock the singleton stores and registry before importing Drawer
jest.mock('../../../../src/Resources/js/stores/DrawerStore', () => {
    const {observable, action, configure} = require('mobx');
    configure({enforceActions: 'never'});
    const store = observable({
        open: false,
        view: null,
        props: {},
        openDrawer: action(function(view, props = {}) {
            this.open = true;
            this.view = view;
            this.props = props;
        }),
        closeDrawer: action(function() {
            this.open = false;
        }),
    });
    return store;
});

const mockRegistry = {components: {}};
jest.mock('../../../../src/Resources/js/registries/DrawerRegistry', () => {
    return {
        get: jest.fn((name) => {
            if (!(name in mockRegistry.components)) {
                throw new Error(`The drawer component "${name}" has not been found.`);
            }
            return mockRegistry.components[name];
        }),
        add: jest.fn((name, comp) => {
            mockRegistry.components[name] = comp;
        }),
    };
});

import Drawer from '../../../../src/Resources/js/containers/Drawer/Drawer';
import drawerStore from '../../../../src/Resources/js/stores/DrawerStore';
import drawerRegistry from '../../../../src/Resources/js/registries/DrawerRegistry';

describe('Drawer', () => {
    afterEach(() => {
        drawerStore.open = false;
        drawerStore.view = null;
        drawerStore.props = {};
        mockRegistry.components = {};
        jest.clearAllMocks();
    });

    test('Should render into document.body via portal', () => {
        mount(<Drawer />);

        // Portal renders into body, so backdrop div should exist
        expect(document.body.querySelector('[class]')).toBeTruthy();
    });

    test('Should not render ViewComponent when closed and no view', () => {
        mount(<Drawer />);

        // No view component should be rendered
        expect(drawerRegistry.get).not.toHaveBeenCalled();
    });

    test('Should render ViewComponent when open with registered view', () => {
        const MockView = jest.fn(function TestView({open, onClose}) {
            return <div data-testid="mock-view">View Content</div>;
        });
        mockRegistry.components['testView'] = MockView;

        drawerStore.open = true;
        drawerStore.view = 'testView';
        drawerStore.props = {myProp: 'value'};

        mount(<Drawer />);

        expect(drawerRegistry.get).toHaveBeenCalledWith('testView');
        expect(MockView).toHaveBeenCalledWith(
            expect.objectContaining({
                myProp: 'value',
                open: true,
                onClose: expect.any(Function),
            }),
            expect.anything()
        );
    });

    test('Should handle missing view gracefully', () => {
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

        drawerStore.open = true;
        drawerStore.view = 'nonExistent';

        expect(() => mount(<Drawer />)).not.toThrow();
        expect(consoleError).toHaveBeenCalled();

        consoleError.mockRestore();
    });
});
