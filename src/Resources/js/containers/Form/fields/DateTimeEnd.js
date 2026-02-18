// @flow
import React from 'react';
import { observer } from 'mobx-react';
import moment from 'moment';
import { translate } from 'sulu-admin-bundle/utils';
import AbstractDateTime from './AbstractDateTime';

@observer
class DateTimeEnd extends AbstractDateTime {
    render() {
        const { schemaOptions, formInspector, error, value } = this.props;
        const step = parseInt(schemaOptions?.step?.value || 1, 10);

        const startDateField = schemaOptions?.start_date_field?.value || 'start';
        let isValid = !error;
        let errorMessage = null;

        if (formInspector && value) {
            // Access data directly to ensure MobX reactivity
            const storeData = formInspector.formStore.data;
            const startDateValue = storeData[startDateField];

            if (startDateValue) {
                const start = moment(startDateValue);
                const end = moment(value);

                if (end.isBefore(start)) {
                    isValid = false;
                    errorMessage = translate('sulu_admin_extras.errors.start_after_end');
                }
            }
        }

        const options = {
            timeConstraints: {
                minutes: {
                    step: step
                }
            }
        };

        return (
            <div>
                {this.renderDatePicker(options, isValid)}
                {!isValid && !error && (
                    <div style={{ color: '#d9534f', fontSize: '10px', marginTop: '5px' }}>
                        {errorMessage || "Invalid date"}
                    </div>
                )}
            </div>
        );
    }
}

export default DateTimeEnd;
