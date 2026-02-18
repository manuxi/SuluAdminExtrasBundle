// @flow
import React from 'react';
import {observer} from 'mobx-react';
import type {FieldTypeProps} from 'sulu-admin-bundle/types';
import BusinessHoursEditor from './BusinessHoursEditor';

@observer
class BusinessHours extends React.Component<FieldTypeProps<Object>> {

    handleChange = (value: Object) => {
        const {onChange} = this.props;
        onChange(value);
    };

    handleFinish = () => {
        const {onFinish} = this.props;
        if (onFinish) {
            onFinish();
        }
    };

    render() {
        const {disabled, value, formInspector} = this.props;
        const locale = formInspector?.locale?.get?.() || 'de';

        return (
            <BusinessHoursEditor
                disabled={!!disabled}
                locale={locale}
                onChange={this.handleChange}
                onFinish={this.handleFinish}
                value={value}
            />
        );
    }
}

export default BusinessHours;