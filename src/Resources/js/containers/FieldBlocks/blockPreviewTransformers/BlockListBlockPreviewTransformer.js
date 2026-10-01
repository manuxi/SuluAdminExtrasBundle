// @flow
import React from 'react';
import isList from './isList';
import {translate} from 'sulu-admin-bundle/utils/Translator';
import styles from './blockPreview.scss';
import type {Node} from 'react';
import type {BlockPreviewTransformer} from 'sulu-admin-bundle/types';

const MAX_LENGTH = 50;
const TITLE_PROPERTIES = ['title', 'name', 'headline'];

/**
 * Summarizes a nested block field: number of entries and the first entry titles.
 */
export default class BlockListBlockPreviewTransformer implements BlockPreviewTransformer {
    transform(value: *): Node {
        if (!isList(value) || value.length === 0) {
            return null;
        }

        const titles = value
            .map((entry) => {
                const property = TITLE_PROPERTIES.find((name) => entry && typeof entry[name] === 'string' && entry[name]);

                return property ? entry[property] : null;
            })
            .filter(Boolean)
            .join(', ');

        return (
            <p>
                <span className={styles.label}>{translate('sulu_admin_extras.block_preview_entries')}:</span>
                {value.length}
                {titles ? ' · ' + (titles.length > MAX_LENGTH ? titles.substring(0, MAX_LENGTH) + '...' : titles) : ''}
            </p>
        );
    }
}
