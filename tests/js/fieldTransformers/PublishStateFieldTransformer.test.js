// @flow
import React from 'react';
import {render} from 'enzyme';
import {render as rtlRender} from '@testing-library/react';
import PublishStateFieldTransformer from '../../../src/Resources/js/fieldTransformers/PublishStateFieldTransformer';

jest.mock('sulu-admin-bundle/utils', () => ({
    translate: (key) => key,
}));

describe('PublishStateFieldTransformer', () => {
    // --- Constructor & Config ---

    test('Should use default config', () => {
        const transformer = new PublishStateFieldTransformer();
        expect(transformer.config.enable_offset).toBe(false);
        expect(transformer.config.offset_width).toBe(28);
    });

    test('Should merge custom config', () => {
        const transformer = new PublishStateFieldTransformer({enable_offset: true, offset_width: 40});
        expect(transformer.config.enable_offset).toBe(true);
        expect(transformer.config.offset_width).toBe(40);
    });

    // --- Enzyme Snapshots ---

    test('Render published state (snapshot)', () => {
        const transformer = new PublishStateFieldTransformer();
        const result = transformer.transform(true, {}, {});
        expect(render(<div>{result}</div>)).toMatchSnapshot();
    });

    test('Render draft state (snapshot)', () => {
        const transformer = new PublishStateFieldTransformer();
        const result = transformer.transform(false, {}, {livePublished: true, workflowPlace: 'draft'});
        expect(render(<div>{result}</div>)).toMatchSnapshot();
    });

    test('Render unpublished state (snapshot)', () => {
        const transformer = new PublishStateFieldTransformer();
        const result = transformer.transform(false, {}, {});
        expect(render(<div>{result}</div>)).toMatchSnapshot();
    });

    // --- @testing-library/react ---

    test('Should show published label when publishedState is true', () => {
        const transformer = new PublishStateFieldTransformer();
        const result = transformer.transform(true, {}, {});
        const {container} = rtlRender(<div>{result}</div>);

        const indicator = container.querySelector('[title="sulu_admin_extras.published"]');
        expect(indicator).toBeInTheDocument();
    });

    test('Should show published label when workflowPlace is "published"', () => {
        const transformer = new PublishStateFieldTransformer();
        const result = transformer.transform(null, {}, {workflowPlace: 'published'});
        const {container} = rtlRender(<div>{result}</div>);

        expect(container.querySelector('[title="sulu_admin_extras.published"]')).toBeInTheDocument();
    });

    test('Should show draft label with two dots when workflowPlace is "draft"', () => {
        const transformer = new PublishStateFieldTransformer();
        const result = transformer.transform(true, {}, {livePublished: true, workflowPlace: 'draft'});
        const {container} = rtlRender(<div>{result}</div>);

        const indicator = container.querySelector('[title="sulu_admin_extras.draft"]');
        expect(indicator).toBeInTheDocument();
        // Draft shows two dots (published + unpublished)
        const dots = indicator.querySelectorAll('span');
        expect(dots.length).toBe(2);
    });

    test('Should show not_published label when nothing is set', () => {
        const transformer = new PublishStateFieldTransformer();
        const result = transformer.transform(false, {}, {});
        const {container} = rtlRender(<div>{result}</div>);

        expect(container.querySelector('[title="sulu_admin_extras.not_published"]')).toBeInTheDocument();
    });

    test('Should read publishedState from value object', () => {
        const transformer = new PublishStateFieldTransformer();
        const valueObj = {publishedState: true, livePublished: false, workflowPlace: 'published'};
        const result = transformer.transform(valueObj, {}, {});
        const {container} = rtlRender(<div>{result}</div>);

        expect(container.querySelector('[title="sulu_admin_extras.published"]')).toBeInTheDocument();
    });

    test('Should read from MobX observable context', () => {
        const transformer = new PublishStateFieldTransformer();
        const mobxContext = {
            $mobx: {
                values: {
                    publishedState: {value: true},
                    livePublished: {value: false},
                    workflowPlace: {value: 'published'},
                },
            },
        };
        const result = transformer.transform(null, {}, mobxContext);
        const {container} = rtlRender(<div>{result}</div>);

        expect(container.querySelector('[title="sulu_admin_extras.published"]')).toBeInTheDocument();
    });

    test('workflowPlace "draft" should override publishedState true', () => {
        const transformer = new PublishStateFieldTransformer();
        const result = transformer.transform(true, {}, {workflowPlace: 'draft', livePublished: true});
        const {container} = rtlRender(<div>{result}</div>);

        expect(container.querySelector('[title="sulu_admin_extras.draft"]')).toBeInTheDocument();
    });
});
