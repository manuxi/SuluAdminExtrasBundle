// @flow
import React from 'react';
import {observer} from 'mobx-react';
import {Input} from 'sulu-admin-bundle/components';
import type {FieldTypeProps} from 'sulu-admin-bundle/types';
import sliderRangeStyles from './SliderRange.scss';

@observer
class SliderRange extends React.Component<FieldTypeProps<number>> {

    handleSliderChange = (event: SyntheticInputEvent<HTMLInputElement>) => {
        const {onChange} = this.props;
        const value = parseInt(event.target.value, 10);

        onChange(value);
    };

    handleInputChange = (value: ?string) => {
        const {onChange, onFinish} = this.props;
        const numValue = value ? parseInt(value, 10) : undefined;

        onChange(numValue);
        onFinish();
    };

    handleBlur = () => {
        this.props.onFinish();
    };

    calculateCurrentPosition = (value: number, min: number, max: number): string => {
        // Calculate percentage of the slider's range (0-100%)
        const percentage = ((value - min) / (max - min)) * 100;

        // The slider has 8px margin on each side, so we need to adjust
        // The actual slider track is from 8px to calc(100% - 8px)
        // This means the usable width is (100% - 16px)
        // Position should be: 8px + (percentage of usable width)
        return `calc(16px + ${percentage}% * (100% - 32px) / 100%)`;

    };

    render() {
        const {dataPath, error, value, schemaOptions, colSpan} = this.props;
        const min = schemaOptions?.min?.value || 0;
        const max = schemaOptions?.max?.value || 100;
        const step = schemaOptions?.step?.value || 1;
        const defaultValue = schemaOptions?.default_value?.value;

        // Display mode: 'input' (default), 'floating', 'inline', 'below', 'none'
        const displayMode = schemaOptions?.display_mode?.value || 'input';

        // Show/hide min/max labels (default: true for all modes except 'none')
        const showLabelsParam = schemaOptions?.show_labels?.value;
        const showLabels = showLabelsParam !== undefined ? showLabelsParam : (displayMode !== 'none');

        const currentValue = value !== undefined && value !== null ? value : defaultValue || min;

        // Show input field only in 'input' mode
        const showInput = displayMode === 'input';

        // Calculate position for current value label
        const currentPosition = this.calculateCurrentPosition(currentValue, min, max);

        // Calculate text widths for better positioning (approximation)
        const minLength = String(min).length;
        const maxLength = String(max).length;

        return (
            <div className={sliderRangeStyles.container}>
                <div className={sliderRangeStyles.wrapper}>
                    <div className={sliderRangeStyles.sliderContainer}>
                        <input
                            type="range"
                            className={`${sliderRangeStyles.rangeInput} ${sliderRangeStyles.input}`}
                            min={min}
                            max={max}
                            step={step}
                            value={currentValue}
                            onChange={this.handleSliderChange}
                            onMouseUp={this.handleBlur}
                            onTouchEnd={this.handleBlur}
                        />

                        {/* Floating label above thumb */}
                        {displayMode === 'floating' && (
                            <div
                                className={sliderRangeStyles.labelCurrentFloating}
                                style={{
                                    left: currentPosition,
                                    transform: 'translateX(-50%)',
                                }}
                            >
                                {currentValue}
                            </div>
                        )}

                        {/* Labels below slider */}
                        {showLabels && (
                            <div className={sliderRangeStyles.labels}>
                                {/* Min label */}
                                <span className={`${sliderRangeStyles.label} ${sliderRangeStyles.labelMin}`}>
                                    {min}
                                </span>

                                {/* Current value inline with min/max */}
                                {displayMode === 'inline' && (
                                    <span
                                        className={`${sliderRangeStyles.label} ${sliderRangeStyles.labelCurrent}`}
                                        style={{
                                            left: currentPosition,
                                        }}
                                    >
                                        {currentValue}
                                    </span>
                                )}

                                {/* Max label */}
                                <span className={`${sliderRangeStyles.label} ${sliderRangeStyles.labelMax}`}>
                                    {max}
                                </span>
                            </div>
                        )}

                        {/* Current value centered below everything */}
                        {displayMode === 'below' && (
                            <div className={sliderRangeStyles.labelCurrentBelow}>
                                {currentValue}
                            </div>
                        )}
                    </div>
                </div>

                {/* Input field (only in 'input' mode) */}
                {showInput && (
                    <div className={sliderRangeStyles.value}>
                        <Input
                            id={dataPath}
                            type="number"
                            value={currentValue}
                            onChange={this.handleInputChange}
                            onBlur={this.handleBlur}
                            valid={!error}
                            min={min}
                            max={max}
                            step={step}
                        />
                    </div>
                )}
            </div>
        );
    }
}

export default SliderRange;