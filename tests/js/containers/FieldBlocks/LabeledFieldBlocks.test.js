// @flow
import React from 'react';
import {render} from '@testing-library/react';

jest.mock('sulu-admin-bundle/containers/FieldBlocks', () => ({__esModule: true, default: class FieldBlocks {}}));
jest.mock(
    'sulu-admin-bundle/containers/FieldBlocks/registries/blockPreviewTransformerRegistry',
    () => ({has: jest.fn(), get: jest.fn(), blockPreviewTransformerKeysByPriority: []})
);
jest.mock('sulu-admin-bundle/utils/Translator', () => ({translate: jest.fn((key) => key)}));

const {getPreviewEntries, withLabel} = require('../../../../src/Resources/js/containers/FieldBlocks/LabeledFieldBlocks');

const tag = (priority) => ({tags: [{name: 'sulu.block_preview', priority}]});
const form = {
    title: {type: 'text_line', label: 'Titel', ...tag(2048)},
    subtitle: {type: 'text_line', label: 'Untertitel', ...tag(1536)},
    text: {type: 'text_editor', label: 'Text', ...tag(768)},
    other: {type: 'text_line', label: 'Sonst'},
};

describe('getPreviewEntries', () => {
    test('Should list tagged fields with a value by priority', () => {
        const entries = getPreviewEntries(form, {text: 'a', title: 'b', other: 'c'});

        expect(entries.map((entry) => entry.name)).toEqual(['title', 'text']);
        expect(entries.every((entry) => !entry.missing)).toBe(true);
    });

    test('Should add an empty title as missing, in front of the other lines', () => {
        const entries = getPreviewEntries(form, {text: 'a'});

        expect(entries).toEqual([
            {missing: true, name: 'title', priority: 2048},
            {missing: false, name: 'text', priority: 768},
        ]);
    });

    test('Should not complain about empty fields that are no title', () => {
        const entries = getPreviewEntries(form, {title: 'a'});

        expect(entries.map((entry) => entry.name)).toEqual(['title']);
    });

    test('Should fall back to the first fields of previewable types when nothing tagged has a value', () => {
        const untagged = {a: {type: 'text_line', label: 'A'}, b: {type: 'text_editor', label: 'B'}};
        const entries = getPreviewEntries(untagged, {a: '1', b: '2'}, ['text_editor', 'text_line']);

        expect(entries.map((entry) => entry.name)).toEqual(['b', 'a']);
    });

    test('Should put thumbnails last, whatever their priority', () => {
        const withImage = {
            ...form,
            image: {type: 'single_media_selection', label: 'Bild', ...tag(3000)},
            images: {type: 'media_selection', label: 'Bilder', ...tag(1000)},
        };
        const entries = getPreviewEntries(withImage, {title: 'a', text: 'b', image: {id: 1}, images: {ids: [2]}});

        expect(entries.map((entry) => entry.name)).toEqual(['title', 'text', 'image', 'images']);
    });

    test('Should return nothing for an empty block without a previewed title', () => {
        expect(getPreviewEntries({other: form.other}, {})).toEqual([]);
    });
});

describe('withLabel', () => {
    test('Should put the label in front of a paragraph', () => {
        const {container} = render(<div>{withLabel(<p>Hallo Welt</p>, 'Titel')}</div>);

        expect(container.textContent).toBe('Titel:Hallo Welt');
        expect(container.querySelectorAll('p')).toHaveLength(1);
    });

    test('Should leave other nodes untouched', () => {
        const image = <img src="a.png" />;

        expect(withLabel(image, 'Bilder')).toBe(image);
        expect(withLabel(null, 'Bilder')).toBeNull();
    });
});
