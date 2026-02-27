// @flow
import React from 'react';
import {shallow} from 'enzyme';
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
                min={props.min}
                max={props.max}
                step={props.step}
                data-valid={props.valid}
                data-testid="number-input"
            />
        );
    }),
}));

import SliderRange from '../../../../../src/Resources/js/containers/Form/fields/SliderRange';

describe('SliderRange', () => {
    // --- calculateCurrentPosition ---

    test('Should calculate correct position for middle value', () => {
        const wrapper = shallow(
            <SliderRange
                {...fieldTypeDefaultProps}
                value={50}
                schemaOptions={{min: {value: 0}, max: {value: 100}}}
            />
        );

        const instance = wrapper.instance();
        const position = instance.calculateCurrentPosition(50, 0, 100);
        expect(position).toContain('50%');
    });

    // --- Enzyme ---

    test('Should render range input with correct min/max/step defaults', () => {
        const wrapper = shallow(
            <SliderRange
                {...fieldTypeDefaultProps}
                value={50}
            />
        );

        const rangeInput = wrapper.find('input[type="range"]');
        expect(rangeInput.prop('min')).toBe(0);
        expect(rangeInput.prop('max')).toBe(100);
        expect(rangeInput.prop('step')).toBe(1);
        expect(rangeInput.prop('value')).toBe(50);
    });

    test('Should use custom min/max/step from schemaOptions', () => {
        const wrapper = shallow(
            <SliderRange
                {...fieldTypeDefaultProps}
                value={25}
                schemaOptions={{
                    min: {value: 10},
                    max: {value: 50},
                    step: {value: 5},
                }}
            />
        );

        const rangeInput = wrapper.find('input[type="range"]');
        expect(rangeInput.prop('min')).toBe(10);
        expect(rangeInput.prop('max')).toBe(50);
        expect(rangeInput.prop('step')).toBe(5);
    });

    test('Should show number input field in default "input" display mode', () => {
        const wrapper = shallow(
            <SliderRange
                {...fieldTypeDefaultProps}
                value={50}
            />
        );

        // The Input component is rendered in a .value div
        expect(wrapper.find('.value').length).toBe(1);
    });

    test('Should hide number input field in "floating" display mode', () => {
        const wrapper = shallow(
            <SliderRange
                {...fieldTypeDefaultProps}
                value={50}
                schemaOptions={{display_mode: {value: 'floating'}}}
            />
        );

        expect(wrapper.find('.value').length).toBe(0);
    });

    test('Should show floating label in "floating" display mode', () => {
        const wrapper = shallow(
            <SliderRange
                {...fieldTypeDefaultProps}
                value={50}
                schemaOptions={{display_mode: {value: 'floating'}}}
            />
        );

        expect(wrapper.find('.labelCurrentFloating').text()).toBe('50');
    });

    test('Should show current value below in "below" display mode', () => {
        const wrapper = shallow(
            <SliderRange
                {...fieldTypeDefaultProps}
                value={75}
                schemaOptions={{display_mode: {value: 'below'}}}
            />
        );

        expect(wrapper.find('.labelCurrentBelow').text()).toBe('75');
    });

    test('Should use default_value when value is undefined', () => {
        const wrapper = shallow(
            <SliderRange
                {...fieldTypeDefaultProps}
                value={undefined}
                schemaOptions={{default_value: {value: 30}}}
            />
        );

        const rangeInput = wrapper.find('input[type="range"]');
        expect(rangeInput.prop('value')).toBe(30);
    });

    // --- @testing-library/react ---

    test('Should call onChange when slider is moved', () => {
        const onChange = jest.fn();

        const {container} = rtlRender(
            <SliderRange
                {...fieldTypeDefaultProps}
                onChange={onChange}
                value={50}
            />
        );

        const rangeInput = container.querySelector('input[type="range"]');
        fireEvent.change(rangeInput, {target: {value: '75'}});

        expect(onChange).toHaveBeenCalledWith(75);
    });

    test('Should call onFinish on mouseUp of slider', () => {
        const onFinish = jest.fn();

        const {container} = rtlRender(
            <SliderRange
                {...fieldTypeDefaultProps}
                onFinish={onFinish}
                value={50}
            />
        );

        const rangeInput = container.querySelector('input[type="range"]');
        fireEvent.mouseUp(rangeInput);

        expect(onFinish).toHaveBeenCalled();
    });

    test('Should show min/max labels by default', () => {
        const {container} = rtlRender(
            <SliderRange
                {...fieldTypeDefaultProps}
                value={50}
                schemaOptions={{min: {value: 10}, max: {value: 200}}}
            />
        );

        expect(container.textContent).toContain('10');
        expect(container.textContent).toContain('200');
    });
});
