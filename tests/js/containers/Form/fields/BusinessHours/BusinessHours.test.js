// @flow
import React from 'react';
import {mount} from 'enzyme';
import {render as rtlRender, fireEvent} from '@testing-library/react';
import fieldTypeDefaultProps from '../../../../fieldTypeDefaultProps';

jest.mock('sulu-admin-bundle/components', () => ({
    DatePicker: jest.fn(function DatePicker({value, onChange, disabled}) {
        return <input data-testid="time-picker" type="text" value={value ? String(value) : ''} disabled={disabled} readOnly />;
    }),
    Icon: jest.fn(function Icon({name}) { return <i data-icon={name} />; }),
    Toggler: jest.fn(function Toggler({checked, onChange, value, disabled}) {
        return (
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked, value)}
                disabled={disabled}
                data-testid={`toggler-${value}`}
            />
        );
    }),
}));

jest.mock('sulu-admin-bundle/utils', () => ({
    translate: (key) => key,
}));

import BusinessHours from '../../../../../../src/Resources/js/containers/Form/fields/BusinessHours/BusinessHours';
import {getDefaultValue} from '../../../../../../src/Resources/js/containers/Form/fields/BusinessHours/BusinessHoursEditor';

describe('BusinessHours', () => {
    test('Should call onChange with defaults on mount when value is null', () => {
        const onChange = jest.fn();
        const onFinish = jest.fn();

        mount(
            <BusinessHours
                {...fieldTypeDefaultProps}
                onChange={onChange}
                onFinish={onFinish}
                value={null}
            />
        );

        expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
            monday: expect.objectContaining({enabled: true}),
            saturday: expect.objectContaining({enabled: false}),
            sunday: expect.objectContaining({enabled: false}),
        }));
    });

    test('Should NOT call onChange on mount when value is already set', () => {
        const onChange = jest.fn();

        mount(
            <BusinessHours
                {...fieldTypeDefaultProps}
                onChange={onChange}
                value={getDefaultValue()}
            />
        );

        expect(onChange).not.toHaveBeenCalled();
    });

    test('Should render 7 day togglers', () => {
        const {container} = rtlRender(
            <BusinessHours
                {...fieldTypeDefaultProps}
                value={getDefaultValue()}
            />
        );

        const togglers = container.querySelectorAll('input[type="checkbox"]');
        expect(togglers.length).toBe(7);
    });

    test('Should have Mon-Fri enabled and Sat-Sun disabled by default', () => {
        const {getByTestId} = rtlRender(
            <BusinessHours
                {...fieldTypeDefaultProps}
                value={getDefaultValue()}
            />
        );

        expect(getByTestId('toggler-monday').checked).toBe(true);
        expect(getByTestId('toggler-friday').checked).toBe(true);
        expect(getByTestId('toggler-saturday').checked).toBe(false);
        expect(getByTestId('toggler-sunday').checked).toBe(false);
    });

    test('Should call onChange when a day is toggled off', () => {
        const onChange = jest.fn();

        const {getByTestId} = rtlRender(
            <BusinessHours
                {...fieldTypeDefaultProps}
                onChange={onChange}
                value={getDefaultValue()}
            />
        );

        fireEvent.click(getByTestId('toggler-monday'));

        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({
                monday: expect.objectContaining({enabled: false}),
            })
        );
    });

    test('Should display weekday translation keys', () => {
        const {container} = rtlRender(
            <BusinessHours
                {...fieldTypeDefaultProps}
                value={getDefaultValue()}
            />
        );

        expect(container.textContent).toContain('sulu_admin_extras.weekday.monday');
        expect(container.textContent).toContain('sulu_admin_extras.weekday.sunday');
    });

    test('Should render time pickers for enabled days', () => {
        const {container} = rtlRender(
            <BusinessHours
                {...fieldTypeDefaultProps}
                value={getDefaultValue()}
            />
        );

        // Mon-Fri enabled with break = 2 slots each = 4 time pickers per day * 5 days = 20
        const timePickers = container.querySelectorAll('[data-testid="time-picker"]');
        expect(timePickers.length).toBe(20);
    });

    test('Should render "Apply to weekdays" button', () => {
        const {container} = rtlRender(
            <BusinessHours
                {...fieldTypeDefaultProps}
                value={getDefaultValue()}
            />
        );

        expect(container.textContent).toContain('sulu_admin_extras.business_hours.apply_to_weekdays');
    });
});

describe('getDefaultValue', () => {
    test('Should return object with 7 weekdays', () => {
        const defaults = getDefaultValue();
        expect(Object.keys(defaults).length).toBe(7);
    });

    test('Should have Mon-Fri enabled with 2 slots', () => {
        const defaults = getDefaultValue();
        expect(defaults.monday.enabled).toBe(true);
        expect(defaults.monday.break).toBe(true);
        expect(defaults.monday.slots.length).toBe(2);
        expect(defaults.monday.slots[0]).toEqual({start: '08:00', end: '12:00'});
        expect(defaults.monday.slots[1]).toEqual({start: '13:00', end: '17:00'});
    });

    test('Should have Sat-Sun disabled with no slots', () => {
        const defaults = getDefaultValue();
        expect(defaults.saturday.enabled).toBe(false);
        expect(defaults.saturday.slots.length).toBe(0);
        expect(defaults.sunday.enabled).toBe(false);
        expect(defaults.sunday.slots.length).toBe(0);
    });
});
