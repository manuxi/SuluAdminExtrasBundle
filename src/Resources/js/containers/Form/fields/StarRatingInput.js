// @flow
import React from 'react';
import {toJS} from 'mobx';
import type {FieldTypeProps} from 'sulu-admin-bundle/types';
import StarRating from './StarRating';

export default class StarRatingInput extends React.Component<FieldTypeProps<number>> {
    handleChange = (value: string) => {
        const {onChange, onFinish} = this.props;

        const numValue = Number(value);
        onChange(numValue);

        if (onFinish) {
            onFinish();
        }
    };

    render() {
        const {value, schemaOptions, disabled} = this.props;

        const globalConfig = (window.suluAdminExtras || {});
        const starRatingConfig = globalConfig.starRatingConfig || {};

        const maxValueOption = toJS(schemaOptions.max_value);
        const max = maxValueOption?.value || starRatingConfig.max_value || 5;

        return (
            <StarRating
                value={String(value || 0)}
                onChange={this.handleChange}
                max={max}
                disabled={!!disabled}
            />
        );
    }
}
