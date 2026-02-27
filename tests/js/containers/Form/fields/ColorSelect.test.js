// @flow
import React from 'react';
import {shallow} from 'enzyme';
import {render as rtlRender, fireEvent} from '@testing-library/react';
import fieldTypeDefaultProps from '../../../fieldTypeDefaultProps';

jest.mock('sulu-admin-bundle/components', () => {
    const mockSingleSelectOption = jest.fn(function Option({children, value}) {
        return <div data-value={value} data-testid={`option-${value}`}>{children}</div>;
    });

    const mockSingleSelect = jest.fn(function SingleSelect({children, id, value, onChange, valid}) {
        return (
            <div data-id={id} data-value={value} data-valid={String(valid)} data-testid="single-select">
                {children}
                <button onClick={() => onChange && onChange('blue')} data-testid="trigger-change" />
            </div>
        );
    });
    mockSingleSelect.Option = mockSingleSelectOption;
    mockSingleSelect.displayName = 'SingleSelect';

    return {SingleSelect: mockSingleSelect};
});

import ColorSelect from '../../../../../src/Resources/js/containers/Form/fields/ColorSelect';

const colorSchemaOptions = {
    values: {
        value: [
            {value: 'red:#ff0000'},
            {value: 'green:#00ff00', title: 'Grün'},
            {value: 'blue:#0000ff'},
        ],
    },
};

describe('ColorSelect', () => {
    // --- Enzyme ---

    test('Should render SingleSelect with correct value', () => {
        const wrapper = shallow(
            <ColorSelect
                {...fieldTypeDefaultProps}
                dataPath="/color"
                value="red"
                schemaOptions={colorSchemaOptions}
            />
        );

        expect(wrapper.find('SingleSelect').prop('value')).toBe('red');
    });

    test('Should render 3 options', () => {
        const wrapper = shallow(
            <ColorSelect
                {...fieldTypeDefaultProps}
                value="red"
                schemaOptions={colorSchemaOptions}
            />
        );

        const options = wrapper.find('SingleSelect').children();
        expect(options.length).toBe(3);
    });

    test('Should use default_value when value is undefined', () => {
        const wrapper = shallow(
            <ColorSelect
                {...fieldTypeDefaultProps}
                value={undefined}
                schemaOptions={{
                    ...colorSchemaOptions,
                    default_value: {value: 'green'},
                }}
            />
        );

        expect(wrapper.find('SingleSelect').prop('value')).toBe('green');
    });

    test('Should set valid=false when error is present', () => {
        const wrapper = shallow(
            <ColorSelect
                {...fieldTypeDefaultProps}
                value="red"
                error={{keyword: 'required', parameters: {}}}
                schemaOptions={colorSchemaOptions}
            />
        );

        expect(wrapper.find('SingleSelect').prop('valid')).toBe(false);
    });

    // --- @testing-library/react ---

    test('Should call onChange and onFinish when selection changes', () => {
        const onChange = jest.fn();
        const onFinish = jest.fn();

        const {getByTestId} = rtlRender(
            <ColorSelect
                {...fieldTypeDefaultProps}
                onChange={onChange}
                onFinish={onFinish}
                value="red"
                schemaOptions={colorSchemaOptions}
            />
        );

        fireEvent.click(getByTestId('trigger-change'));

        expect(onChange).toHaveBeenCalledWith('blue');
        expect(onFinish).toHaveBeenCalled();
    });

    test('Should call onChange with default_value on mount when value is undefined', () => {
        const onChange = jest.fn();

        rtlRender(
            <ColorSelect
                {...fieldTypeDefaultProps}
                onChange={onChange}
                value={undefined}
                schemaOptions={{
                    ...colorSchemaOptions,
                    default_value: {value: 'blue'},
                }}
            />
        );

        expect(onChange).toHaveBeenCalledWith('blue');
    });

    test('Should NOT call onChange on mount when value is already set', () => {
        const onChange = jest.fn();

        rtlRender(
            <ColorSelect
                {...fieldTypeDefaultProps}
                onChange={onChange}
                value="red"
                schemaOptions={{
                    ...colorSchemaOptions,
                    default_value: {value: 'blue'},
                }}
            />
        );

        expect(onChange).not.toHaveBeenCalled();
    });

    test('Should render 3 option divs with color boxes', () => {
        const {container} = rtlRender(
            <ColorSelect
                {...fieldTypeDefaultProps}
                value="red"
                schemaOptions={colorSchemaOptions}
            />
        );

        // Options are rendered as divs with data-value
        const options = container.querySelectorAll('[data-testid^="option-"]');
        expect(options.length).toBe(3);
    });

    test('Should use title "Grün" for green option', () => {
        const {getByTestId} = rtlRender(
            <ColorSelect
                {...fieldTypeDefaultProps}
                value="red"
                schemaOptions={colorSchemaOptions}
            />
        );

        const greenOption = getByTestId('option-green');
        expect(greenOption.textContent).toContain('Grün');
    });

    test('Should capitalize name when no title given', () => {
        const {getByTestId} = rtlRender(
            <ColorSelect
                {...fieldTypeDefaultProps}
                value="red"
                schemaOptions={colorSchemaOptions}
            />
        );

        const redOption = getByTestId('option-red');
        expect(redOption.textContent).toContain('Red');
    });
});
