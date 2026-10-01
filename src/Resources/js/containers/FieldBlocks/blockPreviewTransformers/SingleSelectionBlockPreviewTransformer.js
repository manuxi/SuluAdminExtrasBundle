// @flow
import React from 'react';
import fieldRegistry from 'sulu-admin-bundle/containers/Form/registries/fieldRegistry';
import PreviewLabel, {getSnippetTypeKeys} from './PreviewLabel';
import ResourceLabel from './ResourceLabel';
import type {Node} from 'react';
import type {BlockPreviewTransformer} from 'sulu-admin-bundle/types';

const DEFAULT_DISPLAY_PROPERTY = 'name';

/**
 * Shows "<label>: <name of the selected item>" for single_selection based field types
 * (account, contact, snippet, form, ...). The name is loaded lazily and cached briefly. With the "snippetTypes"
 * flag the titles of the snippet types allowed by the field are added to the label.
 */
export default class SingleSelectionBlockPreviewTransformer implements BlockPreviewTransformer {
    labelKey: string;
    snippetTypes: boolean;

    constructor(labelKey: string, snippetTypes: boolean = false) {
        this.labelKey = labelKey;
        this.snippetTypes = snippetTypes;
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
                <PreviewLabel
                    labelKey={this.labelKey}
                    snippetTypeKeys={this.snippetTypes ? getSnippetTypeKeys(schema) : []}
                />
                <ResourceLabel
                    displayProperty={displayProperty || DEFAULT_DISPLAY_PROPERTY}
                    id={id}
                    resourceKey={resourceKey}
                />
            </p>
        );
    }
}
