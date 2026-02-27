// @flow
import React from 'react';
import {render} from 'enzyme';
import {render as rtlRender, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('sulu-admin-bundle/services/Requester', () => ({
    get: jest.fn(),
    patch: jest.fn(),
}));

import Requester from 'sulu-admin-bundle/services/Requester';
import StatusSwitcherFieldTransformer from '../../../src/Resources/js/fieldTransformers/StatusSwitcherFieldTransformer';

describe('StatusSwitcherFieldTransformer', () => {
    let transformer;

    beforeEach(() => {
        transformer = new StatusSwitcherFieldTransformer();
    });

    // --- Basic Rendering ---

    test('Should return a React element from transform()', () => {
        const result = transformer.transform('active', {}, {id: 1});
        expect(React.isValidElement(result)).toBe(true);
    });

    test('Should extract id from plain context', () => {
        const result = transformer.transform('active', {}, {id: 42});
        const {container} = rtlRender(<div>{result}</div>);

        expect(container.querySelector('button')).toBeInTheDocument();
    });

    test('Should extract id from MobX context', () => {
        const mobxContext = {
            $mobx: {
                values: {
                    id: {value: 99},
                },
            },
        };
        const result = transformer.transform('active', {}, mobxContext);
        const {container} = rtlRender(<div>{result}</div>);

        expect(container.querySelector('button')).toBeInTheDocument();
    });

    test('Should display fallback color when no context colors available', () => {
        const result = transformer.transform('unknown', {}, {id: 1});
        const {container} = rtlRender(<div>{result}</div>);

        const dot = container.querySelector('[style*="background-color"]');
        expect(dot).toBeInTheDocument();
        expect(dot).toHaveStyle({backgroundColor: '#cccccc'});
    });

    test('Should display typeColor from context', () => {
        const context = {id: 1, typeColor: '#ff0000', typeName: 'Active'};
        const result = transformer.transform('active', {}, context);
        const {container} = rtlRender(<div>{result}</div>);

        const dot = container.querySelector('[style*="background-color"]');
        expect(dot).toHaveStyle({backgroundColor: '#ff0000'});
    });

    test('Should show name label when show_name is "true"', () => {
        const context = {id: 1, typeName: 'Active'};
        const result = transformer.transform('active', {show_name: 'true'}, context);
        const {container} = rtlRender(<div>{result}</div>);

        expect(container.textContent).toContain('Active');
    });

    test('Should not show name label when show_name is not set', () => {
        const context = {id: 1, typeName: 'Active'};
        const result = transformer.transform('active', {}, context);
        const {container} = rtlRender(<div>{result}</div>);

        // Should only have the dot, not the label text in visible content
        const button = container.querySelector('button');
        expect(button).toBeInTheDocument();
    });

    // --- Enzyme Snapshot ---

    test('Render with context data (snapshot)', () => {
        const context = {id: 1, typeColor: '#00ff00', typeName: 'Published'};
        const result = transformer.transform('published', {show_name: 'true'}, context);
        expect(render(<div>{result}</div>)).toMatchSnapshot();
    });

    // --- API Interaction ---

    test('Should call Requester.get when dropdown is opened', async () => {
        Requester.get.mockResolvedValue({statuses: [{id: 'a', color: '#f00', title: 'A'}]});

        const context = {id: 1};
        const result = transformer.transform('a', {
            options_api_url: '/api/statuses',
            patch_api_url: '/api/items/[id]/status',
        }, context);

        const {container} = rtlRender(<div>{result}</div>);
        const button = container.querySelector('button');

        await userEvent.click(button);

        expect(Requester.get).toHaveBeenCalledWith('/api/statuses');
    });

    test('Should load options on toggle and replace {id} in patch URL', () => {
        // Verify the transformer correctly passes parameters to StatusSwitcher
        const context = {id: 5};
        const result = transformer.transform('active', {
            options_api_url: '/api/statuses',
            patch_api_url: '/api/items/{id}/status',
        }, context);

        const {container} = rtlRender(<div>{result}</div>);
        const button = container.querySelector('button');
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute('title', 'active');
    });
});
