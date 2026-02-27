// @flow
import React from 'react';
import {render} from 'enzyme';
import {render as rtlRender} from '@testing-library/react';
import StarRatingFieldTransformer from '../../../src/Resources/js/fieldTransformers/StarRatingFieldTransformer';

describe('StarRatingFieldTransformer', () => {
    // --- Constructor & Config ---

    test('Should use default config values', () => {
        const transformer = new StarRatingFieldTransformer();
        expect(transformer.config.show_value).toBe(true);
        expect(transformer.config.max_value).toBe(5);
    });

    test('Should merge custom config with defaults', () => {
        const transformer = new StarRatingFieldTransformer({max_value: 10, show_value: false});
        expect(transformer.config.max_value).toBe(10);
        expect(transformer.config.show_value).toBe(false);
    });

    // --- getParam ---

    test('getParam should return default when parameters is null', () => {
        const transformer = new StarRatingFieldTransformer();
        expect(transformer.getParam(null, 'max_value', 42)).toBe(42);
    });

    test('getParam should unwrap {value: ...} objects', () => {
        const transformer = new StarRatingFieldTransformer();
        expect(transformer.getParam({max_value: {value: 10}}, 'max_value', 5)).toBe(10);
    });

    test('getParam should return raw value if not wrapped', () => {
        const transformer = new StarRatingFieldTransformer();
        expect(transformer.getParam({max_value: 7}, 'max_value', 5)).toBe(7);
    });

    // --- Enzyme Snapshots ---

    test('Render rating 3/5 (snapshot)', () => {
        const transformer = new StarRatingFieldTransformer();
        const result = transformer.transform(3, {}, {});
        expect(render(<div>{result}</div>)).toMatchSnapshot();
    });

    test('Render rating 0 (snapshot)', () => {
        const transformer = new StarRatingFieldTransformer();
        const result = transformer.transform(null, {}, {});
        expect(render(<div>{result}</div>)).toMatchSnapshot();
    });

    // --- @testing-library/react ---

    test('Should display correct title with value/maxValue', () => {
        const transformer = new StarRatingFieldTransformer();
        const result = transformer.transform(3, {}, {});
        const {container} = rtlRender(<div>{result}</div>);

        const span = container.querySelector('[title="3/5"]');
        expect(span).toBeInTheDocument();
    });

    test('Should use parameter max_value over config', () => {
        const transformer = new StarRatingFieldTransformer({max_value: 5});
        const result = transformer.transform(7, {max_value: 10}, {});
        const {container} = rtlRender(<div>{result}</div>);

        expect(container.querySelector('[title="7/10"]')).toBeInTheDocument();
    });

    test('Should render 5 foreground stars with correct fill width', () => {
        const transformer = new StarRatingFieldTransformer();
        const result = transformer.transform(3, {}, {});
        const {container} = rtlRender(<div>{result}</div>);

        // 3/5 = 60%
        const foreground = container.querySelector('[style*="width"]');
        expect(foreground).toHaveStyle({width: '60%'});
    });

    test('Should hide value text when show_value is false', () => {
        const transformer = new StarRatingFieldTransformer({show_value: false});
        const result = transformer.transform(3, {}, {});
        const {container} = rtlRender(<div>{result}</div>);

        expect(container.textContent).not.toContain('(3/5)');
    });

    test('Should show value text when show_value is true', () => {
        const transformer = new StarRatingFieldTransformer({show_value: true});
        const result = transformer.transform(3, {}, {});
        const {container} = rtlRender(<div>{result}</div>);

        expect(container.textContent).toContain('(3/5)');
    });

    test('Should handle show_value parameter as string "true"', () => {
        const transformer = new StarRatingFieldTransformer({show_value: false});
        const result = transformer.transform(2, {show_value: 'true'}, {});
        const {container} = rtlRender(<div>{result}</div>);

        expect(container.textContent).toContain('(2/5)');
    });
});
