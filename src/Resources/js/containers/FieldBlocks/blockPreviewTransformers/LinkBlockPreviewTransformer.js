// @flow
import React from 'react';
import {translate} from 'sulu-admin-bundle/utils/Translator';
import styles from './blockPreview.scss';
import type {Node} from 'react';
import type {BlockPreviewTransformer} from 'sulu-admin-bundle/types';

const MAX_LENGTH = 50;

/**
 * Shows the address of external links and the kind (page, media, ...) of internal ones.
 */
export default class LinkBlockPreviewTransformer implements BlockPreviewTransformer {
    labeled: boolean = true;

    transform(value: *): Node {
        if (!value || typeof value !== 'object' || !value.provider) {
            return null;
        }

        let text = value.href;

        if (typeof text !== 'string' || value.provider !== 'external') {
            const key = 'sulu_admin_extras.block_preview_link_' + value.provider;
            const translated = translate(key);
            text = translated === key ? value.provider : translated;
        }

        return (
            <p>
                <span className={styles.label}>{translate('sulu_admin_extras.block_preview_link')}:</span>
                {text.length > MAX_LENGTH ? text.substring(0, MAX_LENGTH) + '...' : text}
            </p>
        );
    }
}
