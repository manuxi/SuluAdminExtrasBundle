// @flow
import React from 'react';
import {render, screen, waitFor} from '@testing-library/react';

jest.mock('sulu-admin-bundle/utils/Translator', () => ({
    translate: jest.fn((key) => (key === 'sulu_admin_extras.block_preview_untitled' ? 'Ohne Titel' : key)),
}));
jest.mock('sulu-admin-bundle/stores/userStore', () => ({contentLocale: 'de'}));

const mockLoadMetadata = jest.fn();
jest.mock('sulu-admin-bundle/stores/metadataStore', () => ({loadMetadata: (...args) => mockLoadMetadata(...args)}));

const mockGet = jest.fn();
jest.mock('sulu-admin-bundle/services', () => ({ResourceRequester: {get: (...args) => mockGet(...args)}}));

jest.mock('sulu-admin-bundle/containers/Form/registries/fieldRegistry', () => ({
    getOptions: jest.fn(() => ({
        default_type: 'list_overlay',
        resource_key: 'accounts',
        types: {list_overlay: {display_properties: ['name']}},
    })),
}));

const BlockListBlockPreviewTransformer = require(
    '../../../../src/Resources/js/containers/FieldBlocks/blockPreviewTransformers/BlockListBlockPreviewTransformer'
).default;
const LinkBlockPreviewTransformer = require(
    '../../../../src/Resources/js/containers/FieldBlocks/blockPreviewTransformers/LinkBlockPreviewTransformer'
).default;
const SelectionBlockPreviewTransformer = require(
    '../../../../src/Resources/js/containers/FieldBlocks/blockPreviewTransformers/SelectionBlockPreviewTransformer'
).default;
const SingleSelectionBlockPreviewTransformer = require(
    '../../../../src/Resources/js/containers/FieldBlocks/blockPreviewTransformers/SingleSelectionBlockPreviewTransformer'
).default;

describe('BlockListBlockPreviewTransformer', () => {
    const transformer = new BlockListBlockPreviewTransformer();

    test('Should render nothing for empty values', () => {
        expect(transformer.transform([])).toBeNull();
        expect(transformer.transform(undefined)).toBeNull();
    });

    test('Should show the number of entries and their titles', () => {
        render(<div>{transformer.transform([{title: 'Erste'}, {name: 'Zweite'}, {text: 'ohne Titel'}])}</div>);

        expect(screen.getByText(/3 - Erste, Zweite, Ohne Titel/)).toBeTruthy();
    });

    test('Should list entries without a title as untitled', () => {
        const {container} = render(<div>{transformer.transform([{text: 'a'}, {text: 'b'}])}</div>);

        expect(container.textContent).toBe(
            'sulu_admin_extras.block_preview_entries:2 - Ohne Titel, Ohne Titel'
        );
    });
});

describe('LinkBlockPreviewTransformer', () => {
    const transformer = new LinkBlockPreviewTransformer();

    test('Should render nothing without a provider', () => {
        expect(transformer.transform(undefined)).toBeNull();
        expect(transformer.transform({})).toBeNull();
    });

    test('Should show the address of external links', () => {
        const {container} = render(<div>{transformer.transform({provider: 'external', href: 'https://example.org'})}</div>);

        expect(container.textContent).toContain('https://example.org');
    });

    test('Should show the provider of internal links', () => {
        const {container} = render(<div>{transformer.transform({provider: 'page', href: 'uuid'})}</div>);

        expect(container.textContent).toContain('page');
        expect(container.textContent).not.toContain('uuid');
    });
});

describe('SelectionBlockPreviewTransformer', () => {
    const transformer = new SelectionBlockPreviewTransformer('label');

    test('Should render nothing for empty selections', () => {
        expect(transformer.transform([])).toBeNull();
        expect(transformer.transform(null)).toBeNull();
        expect(transformer.transform({items: []})).toBeNull();
    });

    test('Should count the selected items', () => {
        const {container} = render(<div>{transformer.transform(['a', 'b', 'c'])}</div>);

        expect(container.textContent).toBe('label:3');
    });

    test('Should count teaser items', () => {
        const {container} = render(<div>{transformer.transform({items: [{id: 1}, {id: 2}]})}</div>);

        expect(container.textContent).toBe('label:2');
    });
});

describe('SingleSelectionBlockPreviewTransformer', () => {
    const transformer = new SingleSelectionBlockPreviewTransformer('label');

    beforeEach(() => {
        mockGet.mockReset();
    });

    test('Should render nothing without a selection', () => {
        expect(transformer.transform(null, {type: 'single_account_selection'})).toBeNull();
    });

    test('Should show the name of the selected item', async() => {
        mockGet.mockReturnValue(Promise.resolve({id: 5, name: 'Muster GmbH'}));

        render(<div>{transformer.transform(5, {type: 'single_account_selection'})}</div>);

        await waitFor(() => expect(screen.getByText('Muster GmbH')).toBeTruthy());
        expect(mockGet).toHaveBeenCalledWith('accounts', {id: 5, locale: 'de'});
    });

    test('Should fall back to a generic text when the item cannot be loaded', async() => {
        mockGet.mockReturnValue(Promise.reject(new Error('404')));

        render(<div>{transformer.transform(99, {type: 'single_account_selection'})}</div>);

        await waitFor(() => expect(screen.getByText('sulu_admin_extras.block_preview_selected')).toBeTruthy());
    });
});

describe('Snippet type in the label', () => {
    beforeEach(() => {
        mockLoadMetadata.mockReset();
        mockLoadMetadata.mockReturnValue(Promise.resolve({types: {link: {title: 'Links'}, hero: {title: 'Hero'}}}));
    });

    test('Should add the snippet type title to the selection label', async() => {
        const transformer = new SelectionBlockPreviewTransformer('label', true);
        const schema = {options: {types: {value: 'link'}}};

        const {container} = render(<div>{transformer.transform(['a', 'b'], schema)}</div>);

        await waitFor(() => expect(container.textContent).toBe('label (Links):2'));
        expect(mockLoadMetadata).toHaveBeenCalledWith('form', 'snippet');
    });

    test('Should list several snippet types', async() => {
        const transformer = new SelectionBlockPreviewTransformer('label', true);
        const schema = {options: {types: {value: 'link,hero'}}};

        const {container} = render(<div>{transformer.transform(['a'], schema)}</div>);

        await waitFor(() => expect(container.textContent).toBe('label (Links, Hero):1'));
    });

    test('Should keep the plain label without a types param', () => {
        const transformer = new SelectionBlockPreviewTransformer('label', true);

        const {container} = render(<div>{transformer.transform(['a'], {options: {}})}</div>);

        expect(container.textContent).toBe('label:1');
        expect(mockLoadMetadata).not.toHaveBeenCalled();
    });

    test('Should not touch the label of other selections', () => {
        const transformer = new SelectionBlockPreviewTransformer('label');
        const schema = {options: {types: {value: 'link'}}};

        const {container} = render(<div>{transformer.transform(['a'], schema)}</div>);

        expect(container.textContent).toBe('label:1');
        expect(mockLoadMetadata).not.toHaveBeenCalled();
    });
});
