// @flow
import React from 'react';
import {mount} from 'enzyme';
import {render as rtlRender, fireEvent} from '@testing-library/react';
import fieldTypeDefaultProps from '../../../../fieldTypeDefaultProps';

jest.mock('sulu-admin-bundle/components', () => ({
    DatePicker: jest.fn(function DatePicker({value, onChange, disabled}) {
        return <input data-testid="date-picker" type="text" value={value ? String(value) : ''} disabled={disabled} readOnly />;
    }),
    Icon: jest.fn(function Icon({name}) { return <i data-icon={name} />; }),
}));

jest.mock('sulu-admin-bundle/utils', () => ({
    translate: (key) => key,
}));

import HolidayDates from '../../../../../../src/Resources/js/containers/Form/fields/HolidayDates/HolidayDates';

const sampleEntries = [
    {start: '2025-12-24', end: '2025-12-26', label: 'Weihnachten', recurring: true},
    {start: '2025-12-31', end: '2026-01-01', label: 'Silvester', recurring: false},
];

describe('HolidayDates', () => {
    test('Should render empty state when no entries', () => {
        const {container} = rtlRender(
            <HolidayDates
                {...fieldTypeDefaultProps}
                value={[]}
            />
        );

        expect(container.textContent).toContain('sulu_admin_extras.holiday_dates.empty');
    });

    test('Should render entries with date pickers and labels', () => {
        const {container} = rtlRender(
            <HolidayDates
                {...fieldTypeDefaultProps}
                value={sampleEntries}
            />
        );

        // 2 entries * 2 date pickers each = 4
        const datePickers = container.querySelectorAll('[data-testid="date-picker"]');
        expect(datePickers.length).toBe(4);

        // Label inputs (use class selector to distinguish from DatePicker mock inputs)
        const labelInputs = container.querySelectorAll('input.labelInput');
        expect(labelInputs.length).toBe(2);
        expect(labelInputs[0].value).toBe('Weihnachten');
        expect(labelInputs[1].value).toBe('Silvester');
    });

    test('Should show total days info', () => {
        const {container} = rtlRender(
            <HolidayDates
                {...fieldTypeDefaultProps}
                value={sampleEntries}
            />
        );

        // 2 entries, 3 + 2 = 5 days
        expect(container.textContent).toContain('2');
        expect(container.textContent).toContain('5');
    });

    test('Should call onChange when add button is clicked', () => {
        const onChange = jest.fn();

        const {container} = rtlRender(
            <HolidayDates
                {...fieldTypeDefaultProps}
                onChange={onChange}
                value={[]}
            />
        );

        // Find the add button
        const addButton = container.querySelector('button');
        fireEvent.click(addButton);

        expect(onChange).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({label: '', recurring: false}),
            ])
        );
    });

    test('Should call onChange when remove button is clicked', () => {
        const onChange = jest.fn();
        const onFinish = jest.fn();

        const {container} = rtlRender(
            <HolidayDates
                {...fieldTypeDefaultProps}
                onChange={onChange}
                onFinish={onFinish}
                value={sampleEntries}
            />
        );

        // Find trash icon buttons
        const removeButtons = container.querySelectorAll('[data-icon="su-trash-alt"]');
        expect(removeButtons.length).toBe(2);

        // Click the first trash button's parent
        fireEvent.click(removeButtons[0].closest('button'));

        expect(onChange).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({label: 'Silvester'}),
            ])
        );
        expect(onFinish).toHaveBeenCalled();
    });

    test('Should call onChange when label is changed', () => {
        const onChange = jest.fn();

        const {container} = rtlRender(
            <HolidayDates
                {...fieldTypeDefaultProps}
                onChange={onChange}
                value={sampleEntries}
            />
        );

        const labelInputs = container.querySelectorAll('input.labelInput');
        fireEvent.change(labelInputs[0], {target: {value: 'Heiligabend'}});

        expect(onChange).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({label: 'Heiligabend'}),
            ])
        );
    });

    test('Should toggle recurring status', () => {
        const onChange = jest.fn();
        const onFinish = jest.fn();

        const {container} = rtlRender(
            <HolidayDates
                {...fieldTypeDefaultProps}
                onChange={onChange}
                onFinish={onFinish}
                value={sampleEntries}
            />
        );

        // Find recurring buttons (su-sync icons)
        const recurringButtons = container.querySelectorAll('[data-icon="su-sync"]');
        // Click the second one (Silvester, currently recurring=false)
        fireEvent.click(recurringButtons[1].closest('button'));

        expect(onChange).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({label: 'Silvester', recurring: true}),
            ])
        );
    });

    test('Should hide remove buttons when disabled', () => {
        const {container} = rtlRender(
            <HolidayDates
                {...fieldTypeDefaultProps}
                disabled={true}
                value={sampleEntries}
            />
        );

        const removeButtons = container.querySelectorAll('[data-icon="su-trash-alt"]');
        expect(removeButtons.length).toBe(0);
    });
});
