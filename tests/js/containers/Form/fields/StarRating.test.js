// @flow
import React from 'react';
import {shallow, mount} from 'enzyme';
import {render as rtlRender, fireEvent} from '@testing-library/react';
import StarRating from '../../../../../src/Resources/js/containers/Form/fields/StarRating';

describe('StarRating', () => {
    const defaultProps = {
        disabled: false,
        onChange: jest.fn(),
        value: '0',
    };

    // --- Enzyme ---

    test('Should render 5 stars by default', () => {
        const wrapper = shallow(<StarRating {...defaultProps} />);
        const stars = wrapper.find('[role="button"]');
        expect(stars.length).toBe(5);
    });

    test('Should display current value / max', () => {
        const wrapper = shallow(<StarRating {...defaultProps} value="3" />);
        expect(wrapper.find('.value').text()).toBe('3/5');
    });

    test('Should display value with max=10', () => {
        const wrapper = shallow(<StarRating {...defaultProps} value="7" max={10} />);
        expect(wrapper.find('.value').text()).toBe('7/10');
    });

    test('Should render filled stars for 5-scale', () => {
        const wrapper = shallow(<StarRating {...defaultProps} value="3" />);
        const stars = wrapper.find('[role="button"]');
        // First 3 should have filled class (star character '★')
        expect(stars.at(0).text()).toContain('★');
        expect(stars.at(1).text()).toContain('★');
        expect(stars.at(2).text()).toContain('★');
        // 4th and 5th should be empty
        expect(stars.at(3).text()).toContain('☆');
        expect(stars.at(4).text()).toContain('☆');
    });

    test('Should render half stars in 10-scale when value is odd', () => {
        const wrapper = shallow(<StarRating {...defaultProps} value="5" max={10} />);
        const stars = wrapper.find('[role="button"]');
        // 5 on 10-scale = 2 full + 1 half (star 3)
        expect(stars.at(0).text()).toContain('★'); // full (value >= 2)
        expect(stars.at(1).text()).toContain('★'); // full (value >= 4)
        expect(stars.at(2).text()).toContain('⯪'); // half (value = 5)
    });

    // --- @testing-library/react ---

    test('Should call onChange when a star is clicked (5-scale)', () => {
        const onChange = jest.fn();
        const {container} = rtlRender(
            <StarRating {...defaultProps} onChange={onChange} value="2" />
        );

        const stars = container.querySelectorAll('[role="button"]');
        fireEvent.click(stars[3]); // Click 4th star

        expect(onChange).toHaveBeenCalledWith('4');
    });

    test('Should NOT call onChange when disabled', () => {
        const onChange = jest.fn();
        const {container} = rtlRender(
            <StarRating {...defaultProps} onChange={onChange} disabled={true} value="2" />
        );

        const stars = container.querySelectorAll('[role="button"]');
        fireEvent.click(stars[3]);

        expect(onChange).not.toHaveBeenCalled();
    });

    test('Should set tabIndex=-1 when disabled', () => {
        const {container} = rtlRender(
            <StarRating {...defaultProps} disabled={true} value="2" />
        );

        const stars = container.querySelectorAll('[role="button"]');
        stars.forEach((star) => {
            expect(star.getAttribute('tabindex')).toBe('-1');
        });
    });

    test('Should set tabIndex=0 when enabled', () => {
        const {container} = rtlRender(
            <StarRating {...defaultProps} value="2" />
        );

        const stars = container.querySelectorAll('[role="button"]');
        stars.forEach((star) => {
            expect(star.getAttribute('tabindex')).toBe('0');
        });
    });

    test('Should have aria-label on each star', () => {
        const {container} = rtlRender(
            <StarRating {...defaultProps} value="0" />
        );

        const stars = container.querySelectorAll('[role="button"]');
        expect(stars[0].getAttribute('aria-label')).toBe('Rate 1 of 5');
        expect(stars[4].getAttribute('aria-label')).toBe('Rate 5 of 5');
    });

    test('Should render half-click zones in 10-scale', () => {
        const onChange = jest.fn();
        const {container} = rtlRender(
            <StarRating {...defaultProps} onChange={onChange} value="0" max={10} />
        );

        // In 10-scale, each star has left/right halves
        const halfLefts = container.querySelectorAll('.halfLeft');
        const halfRights = container.querySelectorAll('.halfRight');
        expect(halfLefts.length).toBe(5);
        expect(halfRights.length).toBe(5);

        // Click left half of 3rd star = value 5
        fireEvent.click(halfLefts[2]);
        expect(onChange).toHaveBeenCalledWith('5');

        // Click right half of 3rd star = value 6
        fireEvent.click(halfRights[2]);
        expect(onChange).toHaveBeenCalledWith('6');
    });

    test('Should display 0/5 when value is null', () => {
        const {container} = rtlRender(
            <StarRating {...defaultProps} value={null} />
        );

        expect(container.textContent).toContain('0/5');
    });
});
