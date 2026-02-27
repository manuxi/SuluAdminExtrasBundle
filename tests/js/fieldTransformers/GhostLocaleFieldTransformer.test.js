// @flow
import React from 'react';
import {render} from 'enzyme';
import {render as rtlRender} from '@testing-library/react';
import GhostLocaleFieldTransformer from '../../../src/Resources/js/fieldTransformers/GhostLocaleFieldTransformer';

describe('GhostLocaleFieldTransformer', () => {
    let transformer;

    beforeEach(() => {
        transformer = new GhostLocaleFieldTransformer();
    });

    // --- Enzyme ---

    test('Render with ghost locale value (snapshot)', () => {
        const result = transformer.transform(null, {}, {ghostLocale: 'en'});
        expect(render(<div>{result}</div>)).toMatchSnapshot();
    });

    test('Render null when no ghost locale (snapshot)', () => {
        const result = transformer.transform(null, {}, {});
        expect(render(<div>{result}</div>)).toMatchSnapshot();
    });

    // --- @testing-library/react ---

    test('Should display ghost locale in uppercase from context', () => {
        const result = transformer.transform(null, {}, {ghostLocale: 'en'});
        const {container} = rtlRender(<div>{result}</div>);

        expect(container.textContent).toBe('EN');
    });

    test('Should display ghost locale from value as fallback', () => {
        const result = transformer.transform('de', {}, {});
        const {container} = rtlRender(<div>{result}</div>);

        expect(container.textContent).toBe('DE');
    });

    test('Should return null when no ghost locale anywhere', () => {
        const result = transformer.transform(null, {}, {});
        expect(result).toBeNull();
    });

    test('Should read ghostLocale from MobX observable context', () => {
        const mobxContext = {
            $mobx: {
                values: {
                    ghostLocale: {value: 'fr'},
                },
            },
        };
        const result = transformer.transform(null, {}, mobxContext);
        const {container} = rtlRender(<div>{result}</div>);

        expect(container.textContent).toBe('FR');
    });
});
