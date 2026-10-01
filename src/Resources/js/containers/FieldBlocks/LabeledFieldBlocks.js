// @flow
import React, {Fragment, cloneElement, isValidElement} from 'react';
import FieldBlocks from 'sulu-admin-bundle/containers/FieldBlocks';
import blockPreviewTransformerRegistry from
    'sulu-admin-bundle/containers/FieldBlocks/registries/blockPreviewTransformerRegistry';
import {translate} from 'sulu-admin-bundle/utils/Translator';
import styles from './blockPreviewTransformers/blockPreview.scss';

const BLOCK_PREVIEW_TAG = 'sulu.block_preview';
const TITLE_PROPERTIES = ['title', 'name', 'headline'];
const FALLBACK_LIMIT = 3;

type PreviewEntry = {|
    missing: boolean,
    name: string,
    priority: number,
|};

function getPreviewPriority(entry: Object): ?number {
    const tag = (entry.tags || []).find((tag) => tag.name === BLOCK_PREVIEW_TAG);

    return tag ? tag.priority || 0 : undefined;
}

/**
 * Same selection as Sulu core (tagged fields that have a value, highest priority first; without any of those the
 * first fields of the types with a block preview transformer), plus tagged title fields that are still empty,
 * so that the preview can say so instead of silently leaving the line out.
 */
export function getPreviewEntries(
    form: Object,
    value: Object,
    fallbackTypes: Array<string> = []
): Array<PreviewEntry> {
    const names = Object.keys(form);
    const tagged = names.filter((name) => getPreviewPriority(form[name]) !== undefined);
    const entries = tagged
        .filter((name) => value[name])
        .map((name) => ({missing: false, name, priority: getPreviewPriority(form[name]) || 0}));

    if (entries.length === 0) {
        for (const type of fallbackTypes) {
            const name = names.find((name) => form[name].type === type && value[name]);

            if (name) {
                entries.push({missing: false, name, priority: 0});
            }

            if (entries.length >= FALLBACK_LIMIT) {
                break;
            }
        }
    }

    tagged
        .filter((name) => TITLE_PROPERTIES.includes(name) && !value[name])
        .forEach((name) => entries.push({missing: true, name, priority: getPreviewPriority(form[name]) || 0}));

    return entries.sort((entry1, entry2) => entry2.priority - entry1.priority);
}

/**
 * Puts "<label>:" in front of the text of a core preview line. Anything that is not a plain paragraph (the
 * thumbnails of media fields) is returned unchanged.
 */
export function withLabel(node: *, label: string): * {
    if (!isValidElement(node) || node.type !== 'p') {
        return node;
    }

    const children = React.Children.toArray(node.props.children);

    return cloneElement(node, {}, <span className={styles.label}>{label}:</span>, ...children);
}

/**
 * Sulu's block field with a more readable collapsed state: every preview line starts with the (grey) label of its
 * field, and a missing title shows "Untitled" instead of no line at all. Registered over core's "block" field type
 * (see index.js).
 */
export default class LabeledFieldBlocks extends FieldBlocks {
    constructor(props: *) {
        super(props);

        // The parent assigns renderCollapsedBlockContent as an instance property, so it is replaced here.
        this.renderCollapsedBlockContent = (value: Object, type: string) => {
            const form = this.removeSections(this.getBlockSchemaType(type).form);
            const entries = getPreviewEntries(
                form,
                value,
                blockPreviewTransformerRegistry.blockPreviewTransformerKeysByPriority
            );

            return (
                <Fragment>
                    {entries.map(({missing, name}) => {
                        const schemaEntry = form[name];
                        const label = schemaEntry.label || name;

                        if (missing) {
                            return (
                                <p key={name}>
                                    <span className={styles.label}>{label}:</span>
                                    <span className={styles.untitled}>
                                        {translate('sulu_admin_extras.block_preview_untitled')}
                                    </span>
                                </p>
                            );
                        }

                        if (!blockPreviewTransformerRegistry.has(schemaEntry.type)) {
                            return null;
                        }

                        const transformer = blockPreviewTransformerRegistry.get(schemaEntry.type);
                        const node = transformer.transform(value[name], schemaEntry);

                        // our own transformers bring a (shorter, hand-picked) label of their own
                        return (
                            <Fragment key={name}>
                                {transformer.labeled ? node : withLabel(node, label)}
                            </Fragment>
                        );
                    })}
                </Fragment>
            );
        };
    }
}
