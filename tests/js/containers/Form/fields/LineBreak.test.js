// @flow
import React from 'react';
import {render} from '@testing-library/react';
import LineBreak from '../../../../../src/Resources/js/containers/Form/fields/LineBreak';

// identity-obj-proxy returns the name of the class as it is
const GRID_ITEM = 'gridItem';
const BREAK_ITEM = 'lineBreakItem';

const renderInGridItem = () => render(
    <div className={GRID_ITEM} data-testid="item">
        <div>
            <LineBreak />
        </div>
    </div>
);

describe('LineBreak', () => {
    test('Should mark the grid item it sits in', () => {
        const {getByTestId} = renderInGridItem();

        expect(getByTestId('item').classList.contains(BREAK_ITEM)).toBe(true);
    });

    test('Should take the mark off again when it disappears', () => {
        const {getByTestId, unmount} = renderInGridItem();
        const item = getByTestId('item');

        unmount();

        expect(item.classList.contains(BREAK_ITEM)).toBe(false);
    });

    test('Should not fail outside of a grid item', () => {
        const {container} = render(<LineBreak />);

        expect(container.querySelector('.' + BREAK_ITEM)).toBeNull();
    });
});
