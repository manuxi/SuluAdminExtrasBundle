// @flow
import React from 'react';
import percentBarFieldTransformerStyles from './PercentBarFieldTransformer.scss';
import type {Node} from 'react';

class PercentBarFieldTransformer {
    config: Object;

    constructor(config: Object = {}) {
        this.config = {
            show_value: true,
            value_position: 'outside',
            value_color: '#000000',
            max_value: 100,
            height: 16,
            use_gradient: true,
            gradient_mode: 'interpolate',
            color: '#52b6ca',
            animate: true,
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

    getSteppedColor(percent: number): string {
        const p = Math.max(0, Math.min(100, percent));

        if (p <= 20) {
            return '#cf3939';
        } else if (p <= 40) {
            return '#ff8c00';
        } else if (p <= 60) {
            return '#f8d200';
        } else if (p <= 80) {
            return '#80ff00';
        } else {
            return '#6ac86b';
        }
    }

    getBorderRadius(height: number): number {
        if (height >= 14) {
            return 3;
        } else if (height >= 10) {
            return 2;
        } else {
            return 1;
        }
    }

    transform(value: *, parameters: {[string]: any}, context: Object): Node {
        const styles = percentBarFieldTransformerStyles || {};

        const maxValueParam = this.getParam(parameters, 'max_value', null);
        const maxValue = maxValueParam !== null
            ? parseFloat(String(maxValueParam))
            : this.config.max_value;

        const showValueParam = this.getParam(parameters, 'show_value', null);
        const showValue = showValueParam !== null
            ? (showValueParam === true || showValueParam === 'true')
            : this.config.show_value;

        const valuePosition = this.getParam(parameters, 'value_position', this.config.value_position);
        const valueColor = this.getParam(parameters, 'value_color', this.config.value_color);

        const heightParam = this.getParam(parameters, 'height', null);
        const height = heightParam !== null
            ? parseInt(String(heightParam), 10)
            : this.config.height;

        const useGradientParam = this.getParam(parameters, 'use_gradient', null);
        const useGradient = useGradientParam !== null
            ? (useGradientParam === true || useGradientParam === 'true')
            : this.config.use_gradient;

        const gradientMode = this.getParam(parameters, 'gradient_mode', this.config.gradient_mode);

        const singleColor = this.getParam(parameters, 'color', this.config.color);

        const animateParam = this.getParam(parameters, 'animate', null);
        const animate = animateParam !== null
            ? (animateParam === true || animateParam === 'true')
            : this.config.animate;

        const rawValue = value ? parseFloat(String(value)) : 0;
        const percent = Math.max(0, Math.min(100, (rawValue / maxValue) * 100));
        const displayValue = Math.round(percent);

        const title = `${rawValue}/${maxValue} (${displayValue}%)`;

        const containerClasses = [styles.container];
        if (animate) {
            containerClasses.push(styles.animated);
        }

        const borderRadius = this.getBorderRadius(height);
        const canShowValueInside = height >= 14;
        const showValueInside = showValue && valuePosition === 'inside' && canShowValueInside;
        const showValueOutside = showValue && valuePosition === 'outside';

        const barBackgroundStyle: Object = {
            height: `${height}px`,
            borderRadius: `${borderRadius}px`,
        };

        const barFillClasses = [styles.barFill];
        const barFillStyle: Object = {
            width: `${percent}%`,
            borderRadius: `${borderRadius}px`,
        };

        if (!useGradient) {
            barFillStyle.backgroundColor = singleColor;
        } else if (gradientMode === 'steps') {
            barFillStyle.backgroundColor = this.getSteppedColor(percent);
        } else {
            barFillClasses.push(styles.gradientSmooth);
            if (percent > 0) {
                barFillStyle.backgroundSize = `${(100 / percent) * 100}% 100%`;
            }
        }

        const valueInsideStyle: Object = {
            color: valueColor,
        };

        if (height < 16) {
            valueInsideStyle.fontSize = `${Math.max(8, height - 4)}px`;
        }

        return (
            <span className={containerClasses.join(' ')} title={title}>
                <span className={styles.barBackground} style={barBackgroundStyle}>
                    <span
                        className={barFillClasses.join(' ')}
                        style={barFillStyle}
                    />
                    {showValueInside && (
                        <span className={styles.valueInside} style={valueInsideStyle}>
                            {displayValue}%
                        </span>
                    )}
                </span>
                {showValueOutside && (
                    <span className={styles.valueOutside} style={{color: valueColor}}>
                        {displayValue}%
                    </span>
                )}
            </span>
        );
    }
}

export default PercentBarFieldTransformer;
