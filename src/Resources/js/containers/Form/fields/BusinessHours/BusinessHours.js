// @flow
import React from 'react';
import { observer } from 'mobx-react';
import type { FieldTypeProps } from 'sulu-admin-bundle/types';
import BusinessHoursEditor, { getDefaultValue } from './BusinessHoursEditor';

@observer
class BusinessHours extends React.Component<FieldTypeProps<Object>> {

    componentDidMount() {
        const { value, onChange, onFinish } = this.props;
        if (!value) {
            // Initialize the form store with default business hours
            // so the data is actually persisted when saving
            const defaults = getDefaultValue();
            onChange(defaults);
            if (onFinish) {
                onFinish();
            }
        }
    }

    handleChange = (value: Object) => {
        const { onChange } = this.props;
        onChange(value);
    };

    handleFinish = () => {
        const { onFinish } = this.props;
        if (onFinish) {
            onFinish();
        }
    };

    render() {
        const { disabled, value } = this.props;

        return (
            <BusinessHoursEditor
                disabled={!!disabled}
                onChange={this.handleChange}
                onFinish={this.handleFinish}
                value={value}
            />
        );
    }
}

export default BusinessHours;