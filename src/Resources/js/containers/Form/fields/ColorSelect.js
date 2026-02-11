// @flow
import React from 'react';
import { observer } from 'mobx-react';
import { SingleSelect } from 'sulu-admin-bundle/components';
import type { FieldTypeProps } from 'sulu-admin-bundle/types';
import { toJS } from 'mobx';
import colorSelectStyles from './ColorSelect.scss';

@observer
class ColorSelect extends React.Component<FieldTypeProps<string>> {
    handleChange = (value: string | number) => {
        const { onChange, onFinish } = this.props;
        onChange(value);
        onFinish();
    };

    componentDidMount() {
        const { onChange, value, schemaOptions } = this.props;
        const defaultValue = schemaOptions?.default_value?.value || schemaOptions?.default_value;

        if ((value === undefined || value === null) && defaultValue) {
            onChange(defaultValue);
        }
    }

    render() {
        const { dataPath, error, value, schemaOptions } = this.props;
        const values: Array<any> = toJS(schemaOptions?.values?.value || []);
        const defaultValue = schemaOptions?.default_value?.value || schemaOptions?.default_value;
        const currentValue = value !== undefined && value !== null ? value : defaultValue;

        const selectValues = values.map((item) => {
            const itemValue = item.value || '';
            const parts = itemValue.split(':');
            const name = parts[0];
            const color = parts[1] || '#000000';
            const displayName = item.title || name.charAt(0).toUpperCase() + name.slice(1);

            return {
                value: name,
                label: (
                    <div className={colorSelectStyles.colorSelectOption}>
                        <span
                            className={colorSelectStyles.colorBox}
                            style={{ backgroundColor: color }}
                        />
                        <span className={colorSelectStyles.colorSelectLabel}>{displayName}</span>
                    </div>
                ),
            };
        });

        return (
            <SingleSelect
                id={dataPath}
                value={currentValue}
                onChange={this.handleChange}
                valid={!error}
            >
                {selectValues.map((option) => (
                    <SingleSelect.Option key={option.value} value={option.value}>
                        {option.label}
                    </SingleSelect.Option>
                ))}
            </SingleSelect>
        );
    }
}

export default ColorSelect;