// @flow
import React from 'react';
import {shallow} from 'enzyme';
import {render as rtlRender, fireEvent} from '@testing-library/react';
import fieldTypeDefaultProps from '../../../fieldTypeDefaultProps';

jest.mock('sulu-admin-bundle/services', () => ({
    Config: {
        get: jest.fn((key) => {
            if (key === 'sulu_admin_extras') {
                return {star_rating: {max_value: 5}};
            }
            return {};
        }),
    },
}));

import StarRatingInput from '../../../../../src/Resources/js/containers/Form/fields/StarRatingInput';

describe('StarRatingInput', () => {
    // --- Enzyme ---

    test('Should render StarRating component', () => {
        const wrapper = shallow(
            <StarRatingInput
                {...fieldTypeDefaultProps}
                value={3}
            />
        );

        expect(wrapper.find('StarRating').length).toBe(1);
    });

    test('Should pass value as string to StarRating', () => {
        const wrapper = shallow(
            <StarRatingInput
                {...fieldTypeDefaultProps}
                value={3}
            />
        );

        expect(wrapper.find('StarRating').prop('value')).toBe('3');
    });

    test('Should pass "0" when value is null/undefined', () => {
        const wrapper = shallow(
            <StarRatingInput
                {...fieldTypeDefaultProps}
                value={undefined}
            />
        );

        expect(wrapper.find('StarRating').prop('value')).toBe('0');
    });

    test('Should pass disabled prop', () => {
        const wrapper = shallow(
            <StarRatingInput
                {...fieldTypeDefaultProps}
                value={3}
                disabled={true}
            />
        );

        expect(wrapper.find('StarRating').prop('disabled')).toBe(true);
    });

    test('Should use max_value from schemaOptions', () => {
        const wrapper = shallow(
            <StarRatingInput
                {...fieldTypeDefaultProps}
                value={7}
                schemaOptions={{max_value: {value: 10}}}
            />
        );

        expect(wrapper.find('StarRating').prop('max')).toBe(10);
    });

    test('Should fall back to global config max_value', () => {
        const wrapper = shallow(
            <StarRatingInput
                {...fieldTypeDefaultProps}
                value={3}
            />
        );

        // Global config returns max_value: 5
        expect(wrapper.find('StarRating').prop('max')).toBe(5);
    });

    // --- @testing-library/react ---

    test('Should call onChange with number when StarRating triggers change', () => {
        const onChange = jest.fn();
        const onFinish = jest.fn();

        const {container} = rtlRender(
            <StarRatingInput
                {...fieldTypeDefaultProps}
                onChange={onChange}
                onFinish={onFinish}
                value={2}
            />
        );

        // Click on the 4th star
        const stars = container.querySelectorAll('[role="button"]');
        fireEvent.click(stars[3]);

        expect(onChange).toHaveBeenCalledWith(4);
        expect(onFinish).toHaveBeenCalled();
    });

    test('Should render 5 stars and show value display', () => {
        const {container} = rtlRender(
            <StarRatingInput
                {...fieldTypeDefaultProps}
                value={3}
            />
        );

        const stars = container.querySelectorAll('[role="button"]');
        expect(stars.length).toBe(5);
        expect(container.textContent).toContain('3/5');
    });
});
