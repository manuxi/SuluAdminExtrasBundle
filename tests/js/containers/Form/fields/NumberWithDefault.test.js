// @flow
import React from 'react';
import {mount} from 'enzyme';
import {render as rtlRender, fireEvent} from '@testing-library/react';
import fieldTypeDefaultProps from '../../../fieldTypeDefaultProps';

jest.mock('sulu-admin-bundle/components', () => ({
    Input: jest.fn(function Input(props) {
        return (
            <input
                id={props.id}
                type={props.type}
                value={props.value !== undefined && props.value !== null ? props.value : ''}
                onChange={(e) => props.onChange && props.onChange(e.target.value)}
                onBlur={props.onBlur}
                placeholder={props.placeholder}
                min={props.min}
                max={props.max}
                step={props.step}
                data-valid={String(props.valid)}
            />
        );
    }),
}));

import NumberWithDefault from '../../../../../src/Resources/js/containers/Form/fields/NumberWithDefault';

describe('NumberWithDefault', () => {
    // --- Enzyme (mount for @observer components) ---

    test('Should render input with correct id and type', () => {
        const wrapper = mount(
            <NumberWithDefault
                {...fieldTypeDefaultProps}
                dataPath="/rating"
                value={42}
            />
        );

        const input = wrapper.find('input');
        expect(input.prop('id')).toBe('/rating');
        expect(input.prop('type')).toBe('number');
        expect(input.prop('value')).toBe(42);
    });

    test('Should use default_value when value is undefined', () => {
        const wrapper = mount(
            <NumberWithDefault
                {...fieldTypeDefaultProps}
                value={undefined}
                schemaOptions={{default_value: {value: 10}}}
            />
        );

        expect(wrapper.find('input').prop('value')).toBe(10);
    });

    test('Should show placeholder with default value', () => {
        const wrapper = mount(
            <NumberWithDefault
                {...fieldTypeDefaultProps}
                value={undefined}
                schemaOptions={{default_value: {value: 5}}}
            />
        );

        expect(wrapper.find('input').prop('placeholder')).toBe('Standard: 5');
    });

    test('Should pass min, max, step from schemaOptions', () => {
        const wrapper = mount(
            <NumberWithDefault
                {...fieldTypeDefaultProps}
                value={50}
                schemaOptions={{
                    min: {value: 0},
                    max: {value: 100},
                    step: {value: 5},
                }}
            />
        );

        const input = wrapper.find('input');
        expect(input.prop('min')).toBe(0);
        expect(input.prop('max')).toBe(100);
        expect(input.prop('step')).toBe(5);
    });

    test('Should set valid=false when error is present', () => {
        const wrapper = mount(
            <NumberWithDefault
                {...fieldTypeDefaultProps}
                value={5}
                error={{keyword: 'required', parameters: {}}}
            />
        );

        expect(wrapper.find('input').prop('data-valid')).toBe('false');
    });

    test('Should set valid=true when no error', () => {
        const wrapper = mount(
            <NumberWithDefault
                {...fieldTypeDefaultProps}
                value={5}
                error={undefined}
            />
        );

        expect(wrapper.find('input').prop('data-valid')).toBe('true');
    });

    // --- @testing-library/react ---

    test('Should call onChange with parsed integer on input change', () => {
        const onChange = jest.fn();
        const onFinish = jest.fn();

        const {container} = rtlRender(
            <NumberWithDefault
                {...fieldTypeDefaultProps}
                onChange={onChange}
                onFinish={onFinish}
                value={5}
            />
        );

        const input = container.querySelector('input');
        fireEvent.change(input, {target: {value: '42'}});

        expect(onChange).toHaveBeenCalledWith(42);
        expect(onFinish).toHaveBeenCalled();
    });

    test('Should call onChange with undefined for empty input', () => {
        const onChange = jest.fn();
        const onFinish = jest.fn();

        const {container} = rtlRender(
            <NumberWithDefault
                {...fieldTypeDefaultProps}
                onChange={onChange}
                onFinish={onFinish}
                value={5}
            />
        );

        const input = container.querySelector('input');
        fireEvent.change(input, {target: {value: ''}});

        expect(onChange).toHaveBeenCalledWith(undefined);
    });

    test('Should prefer actual value over default_value', () => {
        const {container} = rtlRender(
            <NumberWithDefault
                {...fieldTypeDefaultProps}
                value={7}
                schemaOptions={{default_value: {value: 10}}}
            />
        );

        const input = container.querySelector('input');
        expect(input.value).toBe('7');
    });
});
