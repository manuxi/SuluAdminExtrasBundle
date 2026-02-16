// @flow
import React from 'react';
import { observer } from 'mobx-react';
import { Config } from 'sulu-admin-bundle/services';
import type { FieldTypeProps } from 'sulu-admin-bundle/types';
import StarRating from './StarRating';

@observer
class StarRatingInput extends React.Component<FieldTypeProps<number>> {
    handleChange = (value: string) => {
        const { onChange, onFinish } = this.props;

        const numValue = Number(value);
        onChange(numValue);

        if (onFinish) {
            onFinish();
        }
    };

    render() {
        const { value, schemaOptions, disabled } = this.props;

        const globalConfig = Config.get('sulu_admin_extras') || {};
        const starRatingConfig = globalConfig.star_rating || {};

        const max = schemaOptions?.max_value?.value || starRatingConfig.max_value || 5;

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

export default StarRatingInput;
