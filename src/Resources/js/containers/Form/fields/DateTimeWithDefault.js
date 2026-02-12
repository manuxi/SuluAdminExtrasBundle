// @flow
import React from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import moment from 'moment';
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
        const stringValue = value ? moment(value).format('YYYY-MM-DDTHH:mm:ss') : undefined;
        onChange(stringValue);
        onFinish();
    };

    render() {
        const { dataPath, error, value, schemaOptions } = this.props;
        const defaultValue = schemaOptions?.default_value?.value;

        let dateValue = undefined;
        if (value) {
            dateValue = moment(value).toDate();
        } else if (defaultValue) {
            dateValue = moment(defaultValue).toDate();
        }

        return (
            <DatePicker
                id={dataPath}
                value={dateValue}
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
