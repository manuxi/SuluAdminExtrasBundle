// @flow
import React from 'react';
import fieldRegistry from 'sulu-admin-bundle/containers/Form/registries/fieldRegistry';
import {translate} from 'sulu-admin-bundle/utils/Translator';
import ResourceLabel from './ResourceLabel';
import styles from './blockPreview.scss';
import type {Node} from 'react';
import type {BlockPreviewTransformer} from 'sulu-admin-bundle/types';

const DEFAULT_DISPLAY_PROPERTY = 'name';

/**
 * Shows "<label>: <name of the selected item>" for single_selection based field types
 * (account, contact, snippet, form, ...). The name is loaded lazily and cached briefly.
 */
export default class SingleSelectionBlockPreviewTransformer implements BlockPreviewTransformer {
    labelKey: string;

    constructor(labelKey: string) {
        this.labelKey = labelKey;
    }

    transform(value: *, schema: *): Node {
        const id = value && typeof value === 'object' ? value.id : value;

        if (!id) {
            return null;
        }

        const options = fieldRegistry.getOptions(schema.type);
        const resourceKey = options.resource_key;

        if (!resourceKey) {
            return null;
        }

        const type = options.types && options.types[options.default_type];
        const displayProperty = type
            ? type.display_property || (type.display_properties && type.display_properties[0])
            : undefined;

        return (
            <p>
                <span className={styles.label}>{translate(this.labelKey)}:</span>
                <ResourceLabel
                    displayProperty={displayProperty || DEFAULT_DISPLAY_PROPERTY}
                    id={id}
                    resourceKey={resourceKey}
                />
            </p>
        );
    }
}
