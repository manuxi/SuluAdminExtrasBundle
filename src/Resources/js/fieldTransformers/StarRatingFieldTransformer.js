// @flow
import React from 'react';
import starRatingFieldTransformerStyles from './StarRatingFieldTransformer.scss';
import type {Node} from 'react';

class StarRatingFieldTransformer {
    config: Object;

    constructor(config: Object = {}) {
        this.config = {
            show_value: true,
            max_value: 5,
            ...config,
        };
    }

    getParam(parameters: ?Object, name: string, defaultValue: any): any {
        if (!parameters || !parameters[name]) {
            return defaultValue;
        }

        const param = parameters[name];
        if (typeof param === 'object' && param !== null && 'value' in param) {
            return param.value;
        }

        return param;
    }

    transform(value: *, parameters: {[string]: any}, context: Object): Node {
        const rating = value ? parseInt(String(value), 10) : 0;
        const styles = starRatingFieldTransformerStyles || {};

        const maxValueParam = this.getParam(parameters, 'max_value', null);
        const maxValue = maxValueParam !== null
            ? parseInt(String(maxValueParam), 10)
            : this.config.max_value;

        const showValueParam = this.getParam(parameters, 'show_value', null);
        const showValue = showValueParam !== null
            ? (showValueParam === true || showValueParam === 'true')
            : this.config.show_value;

        const displayStars = 5;
        const title = `${rating}/${maxValue}`;
        const fillPercent = maxValue > 0 ? (rating / maxValue) * 100 : 0;

        const backgroundStars = [];
        const foregroundStars = [];

        for (let i = 1; i <= displayStars; i++) {
            backgroundStars.push(<span key={i} className={styles.starIcon}>★</span>);
            foregroundStars.push(<span key={i} className={styles.starIcon}>★</span>);
        }

        return (
            <span className={styles.container} title={title}>
                <span className={styles.starsWrapper}>
                    <span className={styles.starsBackground}>{backgroundStars}</span>
                    <span className={styles.starsForeground} style={{width: `${fillPercent}%`}}>
                        {foregroundStars}
                    </span>
                </span>
                {showValue && (
                    <span className={styles.value}>({title})</span>
                )}
            </span>
        );
    }
}

export default StarRatingFieldTransformer;
