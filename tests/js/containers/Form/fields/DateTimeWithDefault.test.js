// @flow
import React from 'react';
import {mount} from 'enzyme';
import {render as rtlRender} from '@testing-library/react';
import fieldTypeDefaultProps from '../../../fieldTypeDefaultProps';

jest.mock('sulu-admin-bundle/components', () => ({
    DatePicker: jest.fn(function DatePicker({id, value, onChange, valid, options}) {
        return (
            <input
                data-testid="date-picker"
                id={id}
                type="text"
                value={value ? value.toISOString() : ''}
                onChange={(e) => onChange && onChange(e.target.value ? new Date(e.target.value) : null)}
                data-valid={String(valid)}
            />
        );
    }),
}));

import DateTimeWithDefault from '../../../../../src/Resources/js/containers/Form/fields/DateTimeWithDefault';

describe('DateTimeWithDefault', () => {
    test('Should render a DatePicker', () => {
        const wrapper = mount(
            <DateTimeWithDefault
                {...fieldTypeDefaultProps}
                value="2025-06-15T10:30:00"
            />
        );

        expect(wrapper.find('[data-testid="date-picker"]').length).toBe(1);
    });

    test('Should convert value string to Date object', () => {
        const wrapper = mount(
            <DateTimeWithDefault
                {...fieldTypeDefaultProps}
                value="2025-06-15T10:30:00"
            />
        );

        const picker = wrapper.find('[data-testid="date-picker"]');
        expect(picker.prop('value')).toBeTruthy();
    });

    test('Should use default_value when value is empty', () => {
        const onChange = jest.fn();

        mount(
            <DateTimeWithDefault
                {...fieldTypeDefaultProps}
                onChange={onChange}
                value={undefined}
                schemaOptions={{default_value: {value: '2025-01-01T09:00:00'}}}
            />
        );

        expect(onChange).toHaveBeenCalledWith('2025-01-01T09:00:00');
    });

    test('Should NOT set default_value when value is already set', () => {
        const onChange = jest.fn();

        mount(
            <DateTimeWithDefault
                {...fieldTypeDefaultProps}
                onChange={onChange}
                value="2025-06-15T10:30:00"
                schemaOptions={{default_value: {value: '2025-01-01T09:00:00'}}}
            />
        );

        expect(onChange).not.toHaveBeenCalled();
    });

    test('Should call onChange with formatted string and onFinish on change', () => {
        const onChange = jest.fn();
        const onFinish = jest.fn();

        const {DatePicker} = require('sulu-admin-bundle/components');

        mount(
            <DateTimeWithDefault
                {...fieldTypeDefaultProps}
                onChange={onChange}
                onFinish={onFinish}
                value="2025-06-15T10:30:00"
            />
        );

        // Call the DatePicker mock's onChange directly (simulates user picking a date)
        const lastCall = DatePicker.mock.calls[DatePicker.mock.calls.length - 1][0];
        lastCall.onChange(new Date('2025-07-20T14:00:00'));

        expect(onChange).toHaveBeenCalled();
        expect(onFinish).toHaveBeenCalled();
    });

    test('Should call onChange with undefined when date is cleared', () => {
        const onChange = jest.fn();
        const onFinish = jest.fn();

        const {DatePicker} = require('sulu-admin-bundle/components');

        mount(
            <DateTimeWithDefault
                {...fieldTypeDefaultProps}
                onChange={onChange}
                onFinish={onFinish}
                value="2025-06-15T10:30:00"
            />
        );

        const lastCall = DatePicker.mock.calls[DatePicker.mock.calls.length - 1][0];
        lastCall.onChange(null);

        expect(onChange).toHaveBeenCalledWith(undefined);
    });

    test('Should set valid=false when error is present', () => {
        const wrapper = mount(
            <DateTimeWithDefault
                {...fieldTypeDefaultProps}
                value="2025-06-15T10:30:00"
                error={{keyword: 'required', parameters: {}}}
            />
        );

        expect(wrapper.find('[data-testid="date-picker"]').prop('data-valid')).toBe('false');
    });
});
