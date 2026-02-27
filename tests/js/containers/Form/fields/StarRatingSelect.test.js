// @flow
import React from 'react';
import {shallow} from 'enzyme';
import {render as rtlRender, fireEvent} from '@testing-library/react';
import fieldTypeDefaultProps from '../../../fieldTypeDefaultProps';

jest.mock('sulu-admin-bundle/components', () => {
    const mockSingleSelectOption = jest.fn(function Option({children, value}) {
        return <div data-value={value} data-testid={`option-${value}`}>{children}</div>;
    });

    const mockSingleSelect = jest.fn(function SingleSelect({children, id, value, onChange}) {
        return (
            <div data-id={id} data-value={value} data-testid="single-select">
                {children}
                <button onClick={() => onChange && onChange('4')} data-testid="trigger-change" />
            </div>
        );
    });
    mockSingleSelect.Option = mockSingleSelectOption;
    mockSingleSelect.displayName = 'SingleSelect';

    return {SingleSelect: mockSingleSelect};
});

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

import StarRatingSelect from '../../../../../src/Resources/js/containers/Form/fields/StarRatingSelect';

const ratingSchemaOptions = {
    values: {
        value: [
            {name: '1'},
            {name: '2'},
            {name: '3'},
            {name: '4'},
            {name: '5'},
        ],
    },
};

describe('StarRatingSelect', () => {
    // --- Enzyme ---

    test('Should render SingleSelect with value', () => {
        const wrapper = shallow(
            <StarRatingSelect
                {...fieldTypeDefaultProps}
                value="3"
                schemaOptions={ratingSchemaOptions}
            />
        );

        expect(wrapper.find('SingleSelect').prop('value')).toBe('3');
    });

    test('Should render 5 options', () => {
        const wrapper = shallow(
            <StarRatingSelect
                {...fieldTypeDefaultProps}
                value="3"
                schemaOptions={ratingSchemaOptions}
            />
        );

        expect(wrapper.find('SingleSelect').children().length).toBe(5);
    });

    test('Should use max_value from schemaOptions', () => {
        const wrapper = shallow(
            <StarRatingSelect
                {...fieldTypeDefaultProps}
                value="7"
                schemaOptions={{
                    ...ratingSchemaOptions,
                    max_value: {value: 10},
                }}
            />
        );

        // Options should render stars with /10
        const children = wrapper.find('SingleSelect').children();
        const firstChild = children.at(0).dive();
        expect(firstChild.find('.dropdownText').text()).toContain('/10');
    });

    test('Should hide text when show_text is false', () => {
        const wrapper = shallow(
            <StarRatingSelect
                {...fieldTypeDefaultProps}
                value="3"
                schemaOptions={{
                    ...ratingSchemaOptions,
                    show_text: {value: false},
                }}
            />
        );

        const children = wrapper.find('SingleSelect').children();
        const firstChild = children.at(0).dive();
        expect(firstChild.find('.dropdownText').length).toBe(0);
    });

    // --- @testing-library/react ---

    test('Should call onChange and onFinish on selection', () => {
        const onChange = jest.fn();
        const onFinish = jest.fn();

        const {getByTestId} = rtlRender(
            <StarRatingSelect
                {...fieldTypeDefaultProps}
                onChange={onChange}
                onFinish={onFinish}
                value="2"
                schemaOptions={ratingSchemaOptions}
            />
        );

        fireEvent.click(getByTestId('trigger-change'));

        expect(onChange).toHaveBeenCalledWith('4');
        expect(onFinish).toHaveBeenCalled();
    });

    test('Should render star icons inside options', () => {
        const {container} = rtlRender(
            <StarRatingSelect
                {...fieldTypeDefaultProps}
                value="3"
                schemaOptions={ratingSchemaOptions}
            />
        );

        const starIcons = container.querySelectorAll('.starIcon');
        // 5 options * 10 stars (5 bg + 5 fg) = 50
        expect(starIcons.length).toBe(50);
    });

    test('Should set correct fill width for rating 3/5 = 60%', () => {
        const {container} = rtlRender(
            <StarRatingSelect
                {...fieldTypeDefaultProps}
                value="3"
                schemaOptions={ratingSchemaOptions}
            />
        );

        const foregrounds = container.querySelectorAll('.starsForeground');
        // Third option (rating=3) should have 60% fill
        expect(foregrounds[2]).toHaveStyle({width: '60%'});
    });
});
