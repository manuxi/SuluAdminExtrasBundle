// @flow
import React from 'react';
import { observer } from 'mobx-react';
import moment from 'moment';
import { DatePicker } from 'sulu-admin-bundle/components';
import type { FieldTypeProps } from 'sulu-admin-bundle/types';

@observer
class AbstractDateTime extends React.Component<FieldTypeProps<string>> {
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

        // Hook for subclasses to add extra logic
        this.afterChange(stringValue);

        onFinish();
    };

    afterChange(value: ?string) {
        // To be implemented by subclasses
    }

    getValue(): ?Date {
        const { value, schemaOptions } = this.props;
        const defaultValue = schemaOptions?.default_value?.value;

        if (value) {
            return moment(value).toDate();
        } else if (defaultValue) {
            return moment(defaultValue).toDate();
        }
        return undefined;
    }

    renderDatePicker(options: Object = {}, valid: boolean = true) {
        const { dataPath } = this.props;

        return (
            <DatePicker
                id={dataPath}
                value={this.getValue()}
                onChange={this.handleChange}
                valid={valid}
                options={{
                    dateFormat: true,
                    timeFormat: true,
                    ...options
                }}
            />
        );
    }

    render() {
        return this.renderDatePicker();
    }
}

export default AbstractDateTime;
