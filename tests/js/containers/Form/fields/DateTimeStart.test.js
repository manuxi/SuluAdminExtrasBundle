// @flow
import React from 'react';
import {mount} from 'enzyme';
import fieldTypeDefaultProps from '../../../fieldTypeDefaultProps';

jest.mock('sulu-admin-bundle/components', () => ({
    DatePicker: jest.fn(function DatePicker({id, value, onChange, valid}) {
        return (
            <input
                data-testid="date-picker"
                id={id}
                type="text"
                value={value ? value.toISOString() : ''}
                data-valid={String(valid)}
                readOnly
            />
        );
    }),
}));

jest.mock('sulu-admin-bundle/utils', () => ({
    translate: (key) => key,
}));

jest.mock('sulu-admin-bundle/services/Requester', () => ({
    get: jest.fn(() => Promise.resolve({})),
    patch: jest.fn(),
}));

import DateTimeStart from '../../../../../src/Resources/js/containers/Form/fields/DateTimeStart';

describe('DateTimeStart', () => {
    const formInspector = {
        ...fieldTypeDefaultProps.formInspector,
        formStore: {
            validate: jest.fn(() => true),
            change: jest.fn(),
            changeMultiple: jest.fn(),
            data: {},
        },
        getValueByPath: jest.fn(),
    };

    test('Should render a DatePicker', () => {
        const wrapper = mount(
            <DateTimeStart
                {...fieldTypeDefaultProps}
                formInspector={formInspector}
                value="2025-06-15T10:30:00"
            />
        );

        expect(wrapper.find('[data-testid="date-picker"]').length).toBe(1);
    });

    test('Should set default_value on mount when no value', () => {
        const onChange = jest.fn();

        mount(
            <DateTimeStart
                {...fieldTypeDefaultProps}
                formInspector={formInspector}
                onChange={onChange}
                value={undefined}
                schemaOptions={{default_value: {value: '2025-01-01T09:00:00'}}}
            />
        );

        expect(onChange).toHaveBeenCalledWith('2025-01-01T09:00:00');
    });

    test('Should read step from schemaOptions', () => {
        const wrapper = mount(
            <DateTimeStart
                {...fieldTypeDefaultProps}
                formInspector={formInspector}
                value="2025-06-15T10:30:00"
                schemaOptions={{step: {value: 30}}}
            />
        );

        // Component renders successfully with step config
        expect(wrapper.find('[data-testid="date-picker"]').length).toBe(1);
    });

    test('Should patch formStore.validate to check time validity', () => {
        const mockValidate = jest.fn(() => true);
        const mockFormInspector = {
            ...formInspector,
            formStore: {
                ...formInspector.formStore,
                validate: mockValidate,
            },
        };

        mount(
            <DateTimeStart
                {...fieldTypeDefaultProps}
                formInspector={mockFormInspector}
                value="2025-06-15T10:30:00"
            />
        );

        // validate should have been replaced
        expect(mockFormInspector.formStore.validate).not.toBe(mockValidate);
    });

    test('Should restore original validate on unmount', () => {
        const mockValidate = jest.fn(() => true);
        const mockFormInspector = {
            ...formInspector,
            formStore: {
                ...formInspector.formStore,
                validate: mockValidate,
            },
        };

        const wrapper = mount(
            <DateTimeStart
                {...fieldTypeDefaultProps}
                formInspector={mockFormInspector}
                value="2025-06-15T10:30:00"
            />
        );

        const patchedValidate = mockFormInspector.formStore.validate;
        expect(patchedValidate).not.toBe(mockValidate);

        wrapper.unmount();

        // The component stores validate.bind(store) as originalValidate,
        // so after unmount the restored function is a bound version of mockValidate
        expect(mockFormInspector.formStore.validate).not.toBe(patchedValidate);
        expect(mockFormInspector.formStore.validate.name).toContain('mockConstructor');
    });
});
