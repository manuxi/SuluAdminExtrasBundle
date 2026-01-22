// @flow
import React from 'react';
import {translate} from 'sulu-admin-bundle/utils';
import publishStateFieldTransformerStyles from './PublishStateFieldTransformer.scss';
import type {Node} from 'react';

class PublishStateFieldTransformer {
    config: Object;

    constructor(config: Object = {}) {
        this.config = {
            enable_offset: false,
            offset_width: 28,
            ...config,
        };
    }

    transform(value: *, parameters: {[string]: any}, context: Object): Node {
        const styles = publishStateFieldTransformerStyles;

        let publishedState = value;
        let livePublished = context?.livePublished;
        let workflowPlace = context?.workflowPlace;
        let ghostLocale = context?.ghostLocale;

        if (value && typeof value === 'object' && 'publishedState' in value) {
            publishedState = value.publishedState;
            livePublished = value.livePublished;
            workflowPlace = value.workflowPlace;
        } else {
            const mobxValues = context?.$mobx?.values;
            publishedState = mobxValues?.publishedState?.value ?? context?.publishedState ?? value;
            livePublished = mobxValues?.livePublished?.value ?? context?.livePublished;
            workflowPlace = mobxValues?.workflowPlace?.value ?? context?.workflowPlace;
            ghostLocale = mobxValues?.ghostLocale?.value ?? context?.ghostLocale;
        }

        const hasGhostLocale = !!ghostLocale;

        const isPublished = publishedState === true || publishedState === 'published' || workflowPlace === 'published';
        const isDraft = livePublished && (publishedState === false || publishedState === 'draft' || workflowPlace === 'draft');

        let labelKey = 'sulu_admin_extras.not_published';
        if (isDraft) {
            labelKey = 'sulu_admin_extras.draft';
        } else if (isPublished) {
            labelKey = 'sulu_admin_extras.published';
        }
        const label = translate(labelKey);

        const needsOffset = this.config.enable_offset && !hasGhostLocale;
        const containerClass = needsOffset
            ? `${styles.stateIndicator} ${styles.withOffset}`
            : styles.stateIndicator;
        const containerStyle = needsOffset ? {
            '--offset-width': `${this.config.offset_width}px`
        } : undefined;

        if (isDraft) {
            return (
                <span className={containerClass} style={containerStyle} title={label}>
                    <span className={`${styles.stateDot} ${styles.published}`} />
                    <span className={`${styles.stateDot} ${styles.unpublished}`} />
                </span>
            );
        }

        const colorClass = isPublished ? styles.published : styles.unpublished;

        return (
            <span className={containerClass} style={containerStyle} title={label}>
                <span className={`${styles.stateDot} ${colorClass}`} />
            </span>
        );
    }
}

export default PublishStateFieldTransformer;