// @flow
import React from 'react';
import {mount} from 'enzyme';
import {render as rtlRender, fireEvent} from '@testing-library/react';
import fieldTypeDefaultProps from '../../../../fieldTypeDefaultProps';

jest.mock('sulu-admin-bundle/components', () => {
    const mockOption = jest.fn(function Option({children, value}) {
        return <div data-value={value}>{children}</div>;
    });
    const mockSingleSelect = jest.fn(function SingleSelect({children, value, onChange, disabled}) {
        return <div data-value={value} data-testid="single-select">{children}</div>;
    });
    mockSingleSelect.Option = mockOption;

    return {
        Checkbox: jest.fn(function Checkbox({checked, onChange, disabled, value}) {
            return (
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked, value)}
                    disabled={disabled}
                    data-testid={`checkbox-${value}`}
                />
            );
        }),
        DatePicker: jest.fn(function DatePicker({value}) {
            return <input data-testid="date-picker" type="text" value={value ? String(value) : ''} readOnly />;
        }),
        Icon: jest.fn(function Icon({name}) { return <i data-icon={name} />; }),
        SingleSelect: mockSingleSelect,
    };
});

jest.mock('sulu-admin-bundle/utils', () => ({
    translate: (key) => key,
}));

// Mock fetch for API calls
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
    })
);

import PublicHolidays from '../../../../../../src/Resources/js/containers/Form/fields/PublicHolidays/PublicHolidays';

const sampleValue = {
    country: 'DE',
    subdivision: null,
    year: 2025,
    holidays: [
        {date: '2025-01-01', localName: 'Neujahr', name: 'New Year', enabled: true, custom: false},
        {date: '2025-12-25', localName: 'Weihnachten', name: 'Christmas', enabled: true, custom: false},
        {date: '2025-06-20', localName: 'Betriebsurlaub', name: 'Betriebsurlaub', enabled: true, custom: true},
    ],
};

describe('PublicHolidays', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('Should render with locale from formInspector', () => {
        const formInspector = {
            ...fieldTypeDefaultProps.formInspector,
            locale: {get: () => 'de'},
        };

        const wrapper = mount(
            <PublicHolidays
                {...fieldTypeDefaultProps}
                formInspector={formInspector}
                value={sampleValue}
            />
        );

        expect(wrapper.find('[data-testid="single-select"]').length).toBeGreaterThan(0);
    });

    test('Should display empty state when no holidays', () => {
        const {container} = rtlRender(
            <PublicHolidays
                {...fieldTypeDefaultProps}
                value={{country: 'DE', subdivision: null, year: 2025, holidays: []}}
            />
        );

        expect(container.textContent).toContain('sulu_admin_extras.public_holidays.empty');
    });

    test('Should render holiday list with checkboxes', () => {
        const {container} = rtlRender(
            <PublicHolidays
                {...fieldTypeDefaultProps}
                value={sampleValue}
            />
        );

        // 3 holidays = 3 checkboxes
        const checkboxes = container.querySelectorAll('input[type="checkbox"]');
        expect(checkboxes.length).toBe(3);
    });

    test('Should display holiday names', () => {
        const {container} = rtlRender(
            <PublicHolidays
                {...fieldTypeDefaultProps}
                value={sampleValue}
            />
        );

        expect(container.textContent).toContain('Neujahr');
        expect(container.textContent).toContain('Weihnachten');
        expect(container.textContent).toContain('Betriebsurlaub');
    });

    test('Should show custom badge for custom holidays', () => {
        const {container} = rtlRender(
            <PublicHolidays
                {...fieldTypeDefaultProps}
                value={sampleValue}
            />
        );

        expect(container.textContent).toContain('sulu_admin_extras.public_holidays.custom');
    });

    test('Should show enabled count info', () => {
        const {container} = rtlRender(
            <PublicHolidays
                {...fieldTypeDefaultProps}
                value={sampleValue}
            />
        );

        // "3 / 3" active
        expect(container.textContent).toContain('3 / 3');
    });

    test('Should call onChange when checkbox is toggled', () => {
        const onChange = jest.fn();

        const {getByTestId} = rtlRender(
            <PublicHolidays
                {...fieldTypeDefaultProps}
                onChange={onChange}
                value={sampleValue}
            />
        );

        fireEvent.click(getByTestId('checkbox-0'));

        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({
                holidays: expect.arrayContaining([
                    expect.objectContaining({localName: 'Neujahr', enabled: false}),
                ]),
            })
        );
    });

    test('Should show delete button only for custom holidays when not disabled', () => {
        const {container} = rtlRender(
            <PublicHolidays
                {...fieldTypeDefaultProps}
                value={sampleValue}
            />
        );

        const trashIcons = container.querySelectorAll('[data-icon="su-trash-alt"]');
        // Only 1 custom holiday has a delete button
        expect(trashIcons.length).toBe(1);
    });

    test('Should render refresh button', () => {
        const {container} = rtlRender(
            <PublicHolidays
                {...fieldTypeDefaultProps}
                value={sampleValue}
            />
        );

        const syncIcons = container.querySelectorAll('[data-icon="su-sync"]');
        expect(syncIcons.length).toBe(1);
    });

    test('Should render add custom button', () => {
        const {container} = rtlRender(
            <PublicHolidays
                {...fieldTypeDefaultProps}
                value={sampleValue}
            />
        );

        expect(container.textContent).toContain('sulu_admin_extras.public_holidays.add_custom');
    });
});
