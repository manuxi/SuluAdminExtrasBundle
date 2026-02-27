// @flow
import React from 'react';
import {render} from 'enzyme';
import {render as rtlRender} from '@testing-library/react';
import PercentBarFieldTransformer from '../../../src/Resources/js/fieldTransformers/PercentBarFieldTransformer';

describe('PercentBarFieldTransformer', () => {
    // --- Constructor & Config ---

    test('Should use default config values', () => {
        const transformer = new PercentBarFieldTransformer();
        expect(transformer.config.show_value).toBe(true);
        expect(transformer.config.max_value).toBe(100);
        expect(transformer.config.height).toBe(16);
        expect(transformer.config.use_gradient).toBe(true);
        expect(transformer.config.animate).toBe(true);
    });

    test('Should merge custom config', () => {
        const transformer = new PercentBarFieldTransformer({max_value: 200, height: 10});
        expect(transformer.config.max_value).toBe(200);
        expect(transformer.config.height).toBe(10);
        expect(transformer.config.show_value).toBe(true); // default preserved
    });

    // --- getSteppedColor ---

    test('getSteppedColor should return red for 0-20%', () => {
        const transformer = new PercentBarFieldTransformer();
        expect(transformer.getSteppedColor(0)).toBe('#cf3939');
        expect(transformer.getSteppedColor(20)).toBe('#cf3939');
    });

    test('getSteppedColor should return orange for 21-40%', () => {
        const transformer = new PercentBarFieldTransformer();
        expect(transformer.getSteppedColor(21)).toBe('#ff8c00');
        expect(transformer.getSteppedColor(40)).toBe('#ff8c00');
    });

    test('getSteppedColor should return yellow for 41-60%', () => {
        const transformer = new PercentBarFieldTransformer();
        expect(transformer.getSteppedColor(50)).toBe('#f8d200');
    });

    test('getSteppedColor should return light green for 61-80%', () => {
        const transformer = new PercentBarFieldTransformer();
        expect(transformer.getSteppedColor(75)).toBe('#80ff00');
    });

    test('getSteppedColor should return green for 81-100%', () => {
        const transformer = new PercentBarFieldTransformer();
        expect(transformer.getSteppedColor(100)).toBe('#6ac86b');
    });

    test('getSteppedColor should clamp negative values', () => {
        const transformer = new PercentBarFieldTransformer();
        expect(transformer.getSteppedColor(-10)).toBe('#cf3939');
    });

    // --- getBorderRadius ---

    test('getBorderRadius should return 3 for height >= 14', () => {
        const transformer = new PercentBarFieldTransformer();
        expect(transformer.getBorderRadius(14)).toBe(3);
        expect(transformer.getBorderRadius(20)).toBe(3);
    });

    test('getBorderRadius should return 2 for height 10-13', () => {
        const transformer = new PercentBarFieldTransformer();
        expect(transformer.getBorderRadius(10)).toBe(2);
        expect(transformer.getBorderRadius(13)).toBe(2);
    });

    test('getBorderRadius should return 1 for height < 10', () => {
        const transformer = new PercentBarFieldTransformer();
        expect(transformer.getBorderRadius(5)).toBe(1);
    });

    // --- Enzyme Snapshots ---

    test('Render 50/100 bar (snapshot)', () => {
        const transformer = new PercentBarFieldTransformer();
        const result = transformer.transform(50, {}, {});
        expect(render(<div>{result}</div>)).toMatchSnapshot();
    });

    test('Render 0 value (snapshot)', () => {
        const transformer = new PercentBarFieldTransformer();
        const result = transformer.transform(null, {}, {});
        expect(render(<div>{result}</div>)).toMatchSnapshot();
    });

    // --- @testing-library/react ---

    test('Should display correct title with value/max and percent', () => {
        const transformer = new PercentBarFieldTransformer();
        const result = transformer.transform(75, {}, {});
        const {container} = rtlRender(<div>{result}</div>);

        expect(container.querySelector('[title="75/100 (75%)"]')).toBeInTheDocument();
    });

    test('Should set bar fill width to correct percentage', () => {
        const transformer = new PercentBarFieldTransformer();
        const result = transformer.transform(50, {}, {});
        const {container} = rtlRender(<div>{result}</div>);

        const fillBar = container.querySelector('[style*="width: 50%"]');
        expect(fillBar).toBeInTheDocument();
    });

    test('Should clamp percentage to max 100%', () => {
        const transformer = new PercentBarFieldTransformer({max_value: 50});
        const result = transformer.transform(100, {}, {});
        const {container} = rtlRender(<div>{result}</div>);

        const fillBar = container.querySelector('[style*="width: 100%"]');
        expect(fillBar).toBeInTheDocument();
    });

    test('Should show value outside by default', () => {
        const transformer = new PercentBarFieldTransformer();
        const result = transformer.transform(50, {}, {});
        const {container} = rtlRender(<div>{result}</div>);

        expect(container.textContent).toContain('50%');
    });

    test('Should hide value when show_value is false', () => {
        const transformer = new PercentBarFieldTransformer({show_value: false});
        const result = transformer.transform(50, {}, {});
        const {container} = rtlRender(<div>{result}</div>);

        expect(container.textContent).not.toContain('50%');
    });

    test('Should use single color when use_gradient is false', () => {
        const transformer = new PercentBarFieldTransformer({use_gradient: false, color: '#ff0000'});
        const result = transformer.transform(50, {}, {});
        const {container} = rtlRender(<div>{result}</div>);

        // jsdom normalizes hex to rgb, so check via toHaveStyle which handles both
        const allSpans = container.querySelectorAll('span');
        const fillBar = Array.from(allSpans).find(
            (el) => el.style && el.style.width === '50%' && el.style.backgroundColor
        );
        expect(fillBar).toBeTruthy();
        expect(fillBar).toHaveStyle({backgroundColor: 'rgb(255, 0, 0)'});
    });

    test('Should use stepped color when gradient_mode is steps', () => {
        const transformer = new PercentBarFieldTransformer({use_gradient: true, gradient_mode: 'steps'});
        const result = transformer.transform(90, {}, {});
        const {container} = rtlRender(<div>{result}</div>);

        // 90% should be green (#6ac86b) -> rgb(106, 200, 107)
        const allSpans = container.querySelectorAll('span');
        const fillBar = Array.from(allSpans).find(
            (el) => el.style && el.style.width === '90%' && el.style.backgroundColor
        );
        expect(fillBar).toBeTruthy();
        expect(fillBar).toHaveStyle({backgroundColor: 'rgb(106, 200, 107)'});
    });

    test('Should respect parameter overrides', () => {
        const transformer = new PercentBarFieldTransformer();
        const result = transformer.transform(25, {max_value: 50}, {});
        const {container} = rtlRender(<div>{result}</div>);

        // 25/50 = 50%
        expect(container.querySelector('[title="25/50 (50%)"]')).toBeInTheDocument();
    });
});
