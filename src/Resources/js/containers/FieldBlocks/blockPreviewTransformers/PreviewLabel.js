// @flow
import React, {useEffect, useState} from 'react';
import metadataStore from 'sulu-admin-bundle/stores/metadataStore';
import {translate} from 'sulu-admin-bundle/utils/Translator';
import styles from './blockPreview.scss';

/**
 * Reads the "types" param of a snippet field ("link" or "link,hero") from its schema options.
 */
export function getSnippetTypeKeys(schema: *): Array<string> {
    const value = schema && schema.options && schema.options.types && schema.options.types.value;

    if (typeof value === 'string') {
        return value.split(',').map((key) => key.trim()).filter(Boolean);
    }

    if (value && typeof value.map === 'function') {
        return value.map((entry) => (entry && entry.name) || entry).filter((key) => typeof key === 'string');
    }

    return [];
}

type Props = {|
    labelKey: string,
    snippetTypeKeys?: Array<string>,
|};

/**
 * "<label>:" in front of a preview line. For snippet fields the titles of the allowed snippet types are added,
 * e.g. "Snippets (Link):", so editors can tell what kind of snippet is selected.
 */
export default function PreviewLabel({labelKey, snippetTypeKeys = []}: Props) {
    const [typeTitles, setTypeTitles] = useState<Array<string>>([]);
    const keys = snippetTypeKeys.join(',');

    useEffect(() => {
        if (!keys) {
            return undefined;
        }

        let active = true;

        metadataStore.loadMetadata('form', 'snippet')
            .then((configuration) => {
                const types = (configuration && configuration.types) || {};

                if (active) {
                    setTypeTitles(keys.split(',').map((key) => (types[key] && types[key].title) || key));
                }
            })
            .catch(() => {});

        return () => {
            active = false;
        };
    }, [keys]);

    const suffix = typeTitles.length > 0 ? ' (' + typeTitles.join(', ') + ')' : '';

    return <span className={styles.label}>{translate(labelKey) + suffix}:</span>;
}
