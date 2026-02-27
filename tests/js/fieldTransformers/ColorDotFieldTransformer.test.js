// @flow
import React from 'react';
import {render} from 'enzyme';
import {render as rtlRender, screen} from '@testing-library/react';
import ColorDotFieldTransformer from '../../../src/Resources/js/fieldTransformers/ColorDotFieldTransformer';

describe('ColorDotFieldTransformer', () => {
    let transformer;

    beforeEach(() => {
        transformer = new ColorDotFieldTransformer();
    });

    // --- Enzyme (Sulu-Stil) ---

    test('Render with color value (Enzyme snapshot)', () => {
        const result = transformer.transform('#ff0000', {});
        expect(render(<div>{result}</div>)).toMatchSnapshot();
    });

    test('Render with null value uses fallback color (Enzyme snapshot)', () => {
        const result = transformer.transform(null, {});
        expect(render(<div>{result}</div>)).toMatchSnapshot();
    });

    // --- @testing-library/react (Modern) ---

    test('Should render a div with the given color as background', () => {
        const result = transformer.transform('#ff0000', {});
        rtlRender(<div>{result}</div>);

        const dot = document.querySelector('[title="#ff0000"]');
        expect(dot).toBeInTheDocument();
        expect(dot).toHaveStyle({backgroundColor: '#ff0000'});
    });

    test('Should use #cccccc as fallback for null value', () => {
        const result = transformer.transform(null, {});
        rtlRender(<div>{result}</div>);

        const dot = document.querySelector('[title=""]');
        expect(dot).toBeInTheDocument();
        expect(dot).toHaveStyle({backgroundColor: '#cccccc'});
    });

    test('Should use #cccccc as fallback for undefined value', () => {
        const result = transformer.transform(undefined, {});
        rtlRender(<div>{result}</div>);

        const dot = document.querySelector('[title=""]');
        expect(dot).toBeInTheDocument();
        expect(dot).toHaveStyle({backgroundColor: '#cccccc'});
    });
});
