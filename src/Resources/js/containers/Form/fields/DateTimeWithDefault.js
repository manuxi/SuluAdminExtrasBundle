// @flow
import React from 'react';
import { observer } from 'mobx-react';
import { DatePicker } from 'sulu-admin-bundle/components';
import type { FieldTypeProps } from 'sulu-admin-bundle/types';

@observer
class DateTimeWithDefault extends React.Component<FieldTypeProps<string>> {
    componentDidMount() {
        const { onChange, value, schemaOptions } = this.props;
        const defaultValue = schemaOptions?.default_value?.value;

        if (!value && defaultValue) {
            onChange(defaultValue);
        }
    }

    handleChange = (value: ?Date) => {
        const { onChange, onFinish } = this.props;
        onChange(value);
        onFinish();
    };

    render() {
        const { dataPath, error, value, schemaOptions } = this.props;
        const defaultValue = schemaOptions?.default_value?.value;
        const currentValue = value ? new Date(value) : (defaultValue ? new Date(defaultValue) : undefined);

        return (
            <DatePicker
                id={dataPath}
                value={currentValue}
                onChange={this.handleChange}
                valid={!error}
                options={{
                    dateFormat: true,
                    timeFormat: true,
                }}
            />
        );
    }
}

export default DateTimeWithDefault;
