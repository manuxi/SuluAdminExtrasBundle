// @flow
import React from 'react';
import isList from './isList';
import PreviewLabel, {getSnippetTypeKeys} from './PreviewLabel';
import type {Node} from 'react';
import type {BlockPreviewTransformer} from 'sulu-admin-bundle/types';

/**
 * Shows "<label>: <number of selected items>" for selection based field types (pages, articles, ...).
 * The teaser selection stores its items below an "items" key. With the "snippetTypes" flag the titles of
 * the snippet types allowed by the field are added to the label.
 */
export default class SelectionBlockPreviewTransformer implements BlockPreviewTransformer {
    labelKey: string;
    snippetTypes: boolean;

    constructor(labelKey: string, snippetTypes: boolean = false) {
        this.labelKey = labelKey;
        this.snippetTypes = snippetTypes;
    }

    transform(value: *, schema: *): Node {
        const items = value && !isList(value) && typeof value === 'object' ? value.items : value;

        if (!isList(items) || items.length === 0) {
            return null;
        }

        return (
            <p>
                <PreviewLabel
                    labelKey={this.labelKey}
                    snippetTypeKeys={this.snippetTypes ? getSnippetTypeKeys(schema) : []}
                />
                {items.length}
            </p>
        );
    }
}
