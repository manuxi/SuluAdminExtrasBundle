// @flow
import React from 'react';
import {observer} from 'mobx-react';
import {Input} from 'sulu-admin-bundle/components';
import type {FieldTypeProps} from 'sulu-admin-bundle/types';

@observer
class NumberWithDefault extends React.Component<FieldTypeProps<number>> {
    handleChange = (value: ?string) => {
        const {onChange, onFinish} = this.props;
        const numValue = value ? parseInt(value, 10) : undefined;
        
        onChange(numValue);
        onFinish();
    };

    render() {
        const {dataPath, error, value, schemaOptions} = this.props;
        const defaultValue = schemaOptions?.default_value?.value;
        const min = schemaOptions?.min?.value;
        const max = schemaOptions?.max?.value;
        const step = schemaOptions?.step?.value;

        return (
            <Input
                id={dataPath}
                type="number"
                value={value !== undefined && value !== null ? value : defaultValue}
                onChange={this.handleChange}
                onBlur={this.props.onFinish}
                valid={!error}
                placeholder={defaultValue ? `Standard: ${defaultValue}` : undefined}
                min={min}
                max={max}
                step={step}
            />
        );
    }
}

export default NumberWithDefault;
