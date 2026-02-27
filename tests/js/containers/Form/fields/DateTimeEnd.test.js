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
}));

import DateTimeEnd from '../../../../../src/Resources/js/containers/Form/fields/DateTimeEnd';

describe('DateTimeEnd', () => {
    const createFormInspector = (data = {}) => ({
        ...fieldTypeDefaultProps.formInspector,
        formStore: {
            validate: jest.fn(() => true),
            change: jest.fn(),
            data,
            id: 1,
        },
        getValueByPath: jest.fn(),
    });

    test('Should render a DatePicker', () => {
        const wrapper = mount(
            <DateTimeEnd
                {...fieldTypeDefaultProps}
                formInspector={createFormInspector()}
                value="2025-06-15T12:00:00"
            />
        );

        expect(wrapper.find('[data-testid="date-picker"]').length).toBe(1);
    });

    test('Should set default_value on mount when no value', () => {
        const onChange = jest.fn();

        mount(
            <DateTimeEnd
                {...fieldTypeDefaultProps}
                formInspector={createFormInspector()}
                onChange={onChange}
                value={undefined}
                schemaOptions={{default_value: {value: '2025-01-01T17:00:00'}}}
            />
        );

        expect(onChange).toHaveBeenCalledWith('2025-01-01T17:00:00');
    });

    test('Should patch formStore.validate', () => {
        const mockValidate = jest.fn(() => true);
        const formInspector = createFormInspector();
        formInspector.formStore.validate = mockValidate;

        mount(
            <DateTimeEnd
                {...fieldTypeDefaultProps}
                formInspector={formInspector}
                value="2025-06-15T12:00:00"
            />
        );

        expect(formInspector.formStore.validate).not.toBe(mockValidate);
    });

    test('Should restore original validate on unmount', () => {
        const mockValidate = jest.fn(() => true);
        const formInspector = createFormInspector();
        formInspector.formStore.validate = mockValidate;

        const wrapper = mount(
            <DateTimeEnd
                {...fieldTypeDefaultProps}
                formInspector={formInspector}
                value="2025-06-15T12:00:00"
            />
        );

        const patchedValidate = formInspector.formStore.validate;
        expect(patchedValidate).not.toBe(mockValidate);

        wrapper.unmount();

        // The component stores validate.bind(store) as originalValidate,
        // so after unmount the restored function is a bound version of mockValidate
        const restoredValidate = formInspector.formStore.validate;
        expect(restoredValidate).not.toBe(patchedValidate);
        expect(restoredValidate.name).toContain('mockConstructor');
    });

    test('Should detect end before start error', () => {
        const formInspector = createFormInspector({
            start: '2025-06-15T14:00:00',
        });

        const wrapper = mount(
            <DateTimeEnd
                {...fieldTypeDefaultProps}
                formInspector={formInspector}
                value="2025-06-15T10:00:00"
                schemaOptions={{start_date_field: {value: 'start'}}}
            />
        );

        // Should render with invalid state since end < start
        expect(wrapper.find('[data-testid="date-picker"]').prop('data-valid')).toBe('false');
    });

    test('Should be valid when end is after start', () => {
        const formInspector = createFormInspector({
            start: '2025-06-15T10:00:00',
        });

        const wrapper = mount(
            <DateTimeEnd
                {...fieldTypeDefaultProps}
                formInspector={formInspector}
                value="2025-06-15T14:00:00"
                schemaOptions={{start_date_field: {value: 'start'}}}
            />
        );

        expect(wrapper.find('[data-testid="date-picker"]').prop('data-valid')).toBe('true');
    });

    test('Should read step from schemaOptions', () => {
        const wrapper = mount(
            <DateTimeEnd
                {...fieldTypeDefaultProps}
                formInspector={createFormInspector()}
                value="2025-06-15T12:00:00"
                schemaOptions={{step: {value: 15}}}
            />
        );

        expect(wrapper.find('[data-testid="date-picker"]').length).toBe(1);
    });
});
