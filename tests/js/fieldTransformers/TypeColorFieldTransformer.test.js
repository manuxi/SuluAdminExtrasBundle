// @flow
import React from 'react';
import {render} from 'enzyme';
import {render as rtlRender} from '@testing-library/react';
import TypeColorFieldTransformer from '../../../src/Resources/js/fieldTransformers/TypeColorFieldTransformer';

describe('TypeColorFieldTransformer', () => {
    // --- Constructor & Config ---

    test('Should use default config', () => {
        const transformer = new TypeColorFieldTransformer();
        expect(transformer.config.fallback_color).toBe('#cccccc');
        expect(transformer.config.palettes).toEqual({});
    });

    test('Should merge custom config', () => {
        const transformer = new TypeColorFieldTransformer({
            fallback_color: '#000000',
            palettes: {types: {a: {color: '#ff0000', name: 'Type A'}}},
        });
        expect(transformer.config.fallback_color).toBe('#000000');
        expect(transformer.config.palettes.types.a.color).toBe('#ff0000');
    });

    // --- Enzyme Snapshots ---

    test('Render with fallback color (snapshot)', () => {
        const transformer = new TypeColorFieldTransformer();
        const result = transformer.transform(null, {}, {});
        expect(render(<div>{result}</div>)).toMatchSnapshot();
    });

    test('Render with palette match and show_name (snapshot)', () => {
        const transformer = new TypeColorFieldTransformer({
            palettes: {event_types: {meeting: {color: '#0000ff', name: 'Meeting'}}},
        });
        const result = transformer.transform('meeting', {palette: 'event_types', show_name: 'true'}, {});
        expect(render(<div>{result}</div>)).toMatchSnapshot();
    });

    // --- @testing-library/react ---

    test('Should use fallback color when no palette match and no backend data', () => {
        const transformer = new TypeColorFieldTransformer();
        const result = transformer.transform('unknown', {}, {});
        const {container} = rtlRender(<div>{result}</div>);

        const dot = container.querySelector('[title="unknown"]');
        expect(dot).toBeInTheDocument();
        expect(dot).toHaveStyle({backgroundColor: '#cccccc'});
    });

    test('Should lookup color from palette', () => {
        const transformer = new TypeColorFieldTransformer({
            palettes: {
                event_types: {
                    meeting: {color: '#0000ff', name: 'Meeting'},
                },
            },
        });
        const result = transformer.transform('meeting', {palette: 'event_types'}, {});
        const {container} = rtlRender(<div>{result}</div>);

        const dot = container.querySelector('[title="Meeting"]');
        expect(dot).toBeInTheDocument();
        expect(dot).toHaveStyle({backgroundColor: '#0000ff'});
    });

    test('Should show name label when show_name is "true"', () => {
        const transformer = new TypeColorFieldTransformer({
            palettes: {types: {a: {color: '#ff0000', name: 'Type A'}}},
        });
        const result = transformer.transform('a', {palette: 'types', show_name: 'true'}, {});
        const {container} = rtlRender(<div>{result}</div>);

        expect(container.textContent).toContain('Type A');
    });

    test('Should not show name label when show_name is not set', () => {
        const transformer = new TypeColorFieldTransformer({
            palettes: {types: {a: {color: '#ff0000', name: 'Type A'}}},
        });
        const result = transformer.transform('a', {palette: 'types'}, {});
        const {container} = rtlRender(<div>{result}</div>);

        expect(container.textContent).not.toContain('Type A');
    });

    test('Should fall back to backend typeColor/typeName from context', () => {
        const transformer = new TypeColorFieldTransformer();
        const context = {typeColor: '#00ff00', typeName: 'Green Type'};
        const result = transformer.transform('something', {}, context);
        const {container} = rtlRender(<div>{result}</div>);

        const dot = container.querySelector('[title="Green Type"]');
        expect(dot).toBeInTheDocument();
        expect(dot).toHaveStyle({backgroundColor: '#00ff00'});
    });

    test('Should read typeColor from MobX observable context', () => {
        const transformer = new TypeColorFieldTransformer();
        const mobxContext = {
            $mobx: {
                values: {
                    typeColor: {value: '#ff00ff'},
                    typeName: {value: 'MobX Type'},
                },
            },
        };
        const result = transformer.transform('val', {}, mobxContext);
        const {container} = rtlRender(<div>{result}</div>);

        const dot = container.querySelector('[title="MobX Type"]');
        expect(dot).toBeInTheDocument();
        expect(dot).toHaveStyle({backgroundColor: '#ff00ff'});
    });

    test('Should prefer palette over backend fallback', () => {
        const transformer = new TypeColorFieldTransformer({
            palettes: {types: {a: {color: '#ff0000', name: 'Palette Name'}}},
        });
        const context = {typeColor: '#00ff00', typeName: 'Backend Name'};
        const result = transformer.transform('a', {palette: 'types'}, context);
        const {container} = rtlRender(<div>{result}</div>);

        const dot = container.querySelector('[title]');
        expect(dot).toHaveStyle({backgroundColor: '#ff0000'});
    });

    test('Should use typeRaw for palette lookup when available', () => {
        const transformer = new TypeColorFieldTransformer({
            palettes: {types: {raw_key: {color: '#123456', name: 'Raw Lookup'}}},
        });
        const context = {typeRaw: 'raw_key'};
        const result = transformer.transform('display_value', {palette: 'types'}, context);
        const {container} = rtlRender(<div>{result}</div>);

        const dot = container.querySelector('[title]');
        expect(dot).toHaveStyle({backgroundColor: '#123456'});
    });
});
