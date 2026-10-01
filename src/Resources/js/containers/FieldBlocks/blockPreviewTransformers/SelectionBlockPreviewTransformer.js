// @flow
import React from 'react';
import isList from './isList';
import {translate} from 'sulu-admin-bundle/utils/Translator';
import styles from './blockPreview.scss';
import type {Node} from 'react';
import type {BlockPreviewTransformer} from 'sulu-admin-bundle/types';

/**
 * Shows "<label>: <number of selected items>" for selection based field types (pages, articles, ...).
 * The teaser selection stores its items below an "items" key.
 */
export default class SelectionBlockPreviewTransformer implements BlockPreviewTransformer {
    labelKey: string;

    constructor(labelKey: string) {
        this.labelKey = labelKey;
    }

    transform(value: *): Node {
        const items = value && !isList(value) && typeof value === 'object' ? value.items : value;

        if (!isList(items) || items.length === 0) {
            return null;
        }

        return (
            <p>
                <span className={styles.label}>{translate(this.labelKey)}:</span>
                {items.length}
            </p>
        );
    }
}
