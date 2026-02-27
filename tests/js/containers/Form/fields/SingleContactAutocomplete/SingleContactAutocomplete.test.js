// @flow
import React from 'react';
import {mount} from 'enzyme';
import {render as rtlRender} from '@testing-library/react';
import fieldTypeDefaultProps from '../../../../fieldTypeDefaultProps';

jest.mock('sulu-admin-bundle/utils/Translator', () => ({
    translate: (key) => key,
}));

jest.mock('sulu-admin-bundle/components/Icon', () =>
    jest.fn(function Icon({name}) { return <i data-icon={name} />; })
);

jest.mock('sulu-admin-bundle/components/Input', () =>
    jest.fn(function Input({value, onChange, onFocus, disabled, placeholder, icon, valid, onClearClick, onIconClick}) {
        return (
            <div data-testid="mock-input">
                <input
                    data-testid="input-field"
                    disabled={disabled}
                    onChange={(e) => onChange && onChange(e.target.value)}
                    onFocus={onFocus}
                    placeholder={placeholder}
                    type="text"
                    value={value || ''}
                />
                {onClearClick && (
                    <button data-testid="clear-button" onClick={onClearClick} type="button">clear</button>
                )}
                {onIconClick && (
                    <button data-testid="icon-button" onClick={onIconClick} type="button">icon</button>
                )}
            </div>
        );
    })
);

jest.mock('sulu-admin-bundle/components/Popover', () =>
    jest.fn(function Popover({children, open}) {
        if (!open) return null;
        return <div data-testid="popover">{typeof children === 'function' ? children(jest.fn(), {}) : children}</div>;
    })
);

jest.mock('sulu-admin-bundle/components/Overlay', () =>
    jest.fn(function Overlay({children, open, title, onClose, onConfirm, confirmDisabled}) {
        if (!open) return null;
        return (
            <div data-testid="overlay" data-title={title}>
                {children}
                <button data-testid="overlay-confirm" disabled={confirmDisabled} onClick={onConfirm}>Confirm</button>
                <button data-testid="overlay-close" onClick={onClose}>Close</button>
            </div>
        );
    })
);

jest.mock('sulu-admin-bundle/containers/SingleListOverlay', () =>
    jest.fn(function SingleListOverlay({open}) {
        if (!open) return null;
        return <div data-testid="list-overlay" />;
    })
);

const mockClear = jest.fn();
const mockSet = jest.fn();
jest.mock('sulu-admin-bundle/stores/SingleSelectionStore', () => {
    return jest.fn().mockImplementation(() => ({
        item: null,
        loading: false,
        clear: mockClear,
        set: mockSet,
    }));
});

const mockSearch = jest.fn();
const mockClearSearchResults = jest.fn();
jest.mock('sulu-admin-bundle/stores/SearchStore', () => {
    return jest.fn().mockImplementation(() => ({
        searchResults: [],
        loading: false,
        search: mockSearch,
        clearSearchResults: mockClearSearchResults,
    }));
});

jest.mock('sulu-admin-bundle/stores/userStore', () => ({
    contentLocale: 'de',
}));

jest.mock('sulu-admin-bundle/services', () => ({
    Requester: {
        get: jest.fn(() => Promise.resolve({})),
        post: jest.fn(() => Promise.resolve({id: 99, firstName: 'New', lastName: 'Contact'})),
    },
}));

jest.mock('debounce', () => {
    return (fn) => {
        const debounced = (...args) => fn(...args);
        debounced.clear = jest.fn();
        return debounced;
    };
});

import SingleContactAutocomplete from '../../../../../../src/Resources/js/containers/Form/fields/SingleContactAutocomplete/SingleContactAutocomplete';
import SingleSelectionStore from 'sulu-admin-bundle/stores/SingleSelectionStore';
import SearchStore from 'sulu-admin-bundle/stores/SearchStore';

describe('SingleContactAutocomplete', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('Should create SingleSelectionStore and SearchStore on mount', () => {
        mount(
            <SingleContactAutocomplete
                {...fieldTypeDefaultProps}
                value={null}
            />
        );

        expect(SingleSelectionStore).toHaveBeenCalledWith(
            'contacts',
            null,
            expect.anything()
        );
        expect(SearchStore).toHaveBeenCalledWith(
            'contacts',
            ['firstName', 'lastName', 'mainEmail', 'mainPhone'],
            {},
            expect.anything()
        );
    });

    test('Should use custom resource_key from fieldTypeOptions', () => {
        mount(
            <SingleContactAutocomplete
                {...fieldTypeDefaultProps}
                fieldTypeOptions={{resource_key: 'custom_contacts'}}
                value={null}
            />
        );

        expect(SingleSelectionStore).toHaveBeenCalledWith(
            'custom_contacts',
            null,
            expect.anything()
        );
    });

    test('Should render Input component', () => {
        const {container} = rtlRender(
            <SingleContactAutocomplete
                {...fieldTypeDefaultProps}
                value={null}
            />
        );

        expect(container.querySelector('[data-testid="mock-input"]')).toBeTruthy();
    });

    test('Should render add button for quick create', () => {
        const {container} = rtlRender(
            <SingleContactAutocomplete
                {...fieldTypeDefaultProps}
                value={null}
            />
        );

        const addButton = container.querySelector('[role="button"]');
        expect(addButton).toBeTruthy();
    });

    test('Should not show popover when closed', () => {
        const {container} = rtlRender(
            <SingleContactAutocomplete
                {...fieldTypeDefaultProps}
                value={null}
            />
        );

        expect(container.querySelector('[data-testid="popover"]')).toBeNull();
    });

    test('Should not show list overlay initially', () => {
        const {container} = rtlRender(
            <SingleContactAutocomplete
                {...fieldTypeDefaultProps}
                value={null}
            />
        );

        expect(container.querySelector('[data-testid="list-overlay"]')).toBeNull();
    });

    test('Should pass disabled state to Input', () => {
        const Input = require('sulu-admin-bundle/components/Input');

        mount(
            <SingleContactAutocomplete
                {...fieldTypeDefaultProps}
                disabled={true}
                value={null}
            />
        );

        expect(Input).toHaveBeenCalledWith(
            expect.objectContaining({disabled: true}),
            expect.anything()
        );
    });

    test('Should pass valid=false when error exists', () => {
        const Input = require('sulu-admin-bundle/components/Input');

        mount(
            <SingleContactAutocomplete
                {...fieldTypeDefaultProps}
                error={{keyword: 'required', parameters: {}}}
                value={null}
            />
        );

        expect(Input).toHaveBeenCalledWith(
            expect.objectContaining({valid: false}),
            expect.anything()
        );
    });
});
