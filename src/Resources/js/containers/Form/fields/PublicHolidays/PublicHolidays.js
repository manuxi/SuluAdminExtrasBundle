// @flow
import React from 'react';
import {observer} from 'mobx-react';
import type {FieldTypeProps} from 'sulu-admin-bundle/types';
import PublicHolidaysEditor from './PublicHolidaysEditor';

@observer
class PublicHolidays extends React.Component<FieldTypeProps<Object>> {

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
        const {disabled, value, formInspector, schemaOptions} = this.props;
        const locale = formInspector?.locale?.get?.() || 'de';
        const proxyEndpoint = schemaOptions?.proxy_endpoint?.value || '/admin/api/public-holidays';

        return (
            <PublicHolidaysEditor
                disabled={!!disabled}
                locale={locale}
                onChange={this.handleChange}
                onFinish={this.handleFinish}
                proxyEndpoint={proxyEndpoint}
                value={value}
            />
        );
    }
}

export default PublicHolidays;