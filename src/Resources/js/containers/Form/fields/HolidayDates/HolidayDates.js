// @flow
import React from 'react';
import {observer} from 'mobx-react';
import type {FieldTypeProps} from 'sulu-admin-bundle/types';
import HolidayDatesEditor from './HolidayDatesEditor';

@observer
class HolidayDates extends React.Component<FieldTypeProps<Array<Object>>> {

    handleChange = (value: Array<Object>) => {
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
        const {disabled, value} = this.props;

        return (
            <HolidayDatesEditor
                disabled={!!disabled}
                onChange={this.handleChange}
                onFinish={this.handleFinish}
                value={value}
            />
        );
    }
}

export default HolidayDates;