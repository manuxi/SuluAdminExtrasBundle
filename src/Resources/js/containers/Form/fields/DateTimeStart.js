// @flow
import React from 'react';
import {observer} from 'mobx-react';
import moment from 'moment';
import {action, observable} from 'mobx';
import {translate} from 'sulu-admin-bundle/utils';
import ResourceRequester from 'sulu-admin-bundle/services/ResourceRequester';
import AbstractDateTime from './AbstractDateTime';

@observer
class DateTimeStart extends AbstractDateTime {
    @observable settings = null;
    @observable isValidTime = true;
    @observable timeErrorMessage = null;

    componentDidMount() {
        super.componentDidMount();

        const settingsResourceKey = this.props.schemaOptions?.settings_resource_key?.value;

        if (settingsResourceKey) {
            ResourceRequester.get(settingsResourceKey)
                .then(action((response) => {
                    this.settings = response;
                    const {value, onChange} = this.props;

                    if (!value) {
                        try {
                            const nextSlot = this.findNextAvailableSlot(moment());
                            if (nextSlot) {
                                onChange(nextSlot.format('YYYY-MM-DDTHH:mm:ss'));
                            }
                        } catch (e) {
                            console.error("Error calculating next slot", e);
                        }
                    } else {
                        this.validateTime(value);
                    }
                }))
                .catch((error) => {
                    console.error('Failed to load appointment settings', error);
                });
        }
    }

    handleChange = (value) => {
        const {onChange, onFinish} = this.props;
        const stringValue = value ?
            moment(value).format('YYYY-MM-DDTHH:mm:ss') : undefined;

        try {
            this.validateTime(stringValue);
        } catch (e) {
            console.error("Validation failed", e);
        }

        onChange(stringValue);
        this.afterChange(stringValue);
        onFinish();
    };

    @action validateTime(value) {
        if (!value || !this.settings) {
            this.isValidTime = true;
            this.timeErrorMessage = null;
            return;
        }

        const date = moment(value);
        if (!date.isValid()) return;

        if (!this.isTimeValid(date)) {
            this.isValidTime = false;
            this.timeErrorMessage = translate('sulu_admin_extras.errors.invalid_time_slot');
        } else {
            this.isValidTime = true;
            this.timeErrorMessage = null;
        }
    }

    getDayKey(date) {
        const mapping = {
            1: 'monday',
            2: 'tuesday',
            3: 'wednesday',
            4: 'thursday',
            5: 'friday',
            6: 'saturday',
            0: 'sunday',
        };
        return mapping[date.day()] || 'monday';
    }

    getBusinessSlotsForDay(date) {
        if (!this.settings || !this.settings.businessHours) return null;

        const dayKey = this.getDayKey(date);
        const dayConfig = this.settings.businessHours[dayKey];

        if (!dayConfig || !dayConfig.enabled) return null;

        return dayConfig.slots || [];
    }

    isTimeValid(date) {
        try {
            const slots = this.getBusinessSlotsForDay(date);

            if (!slots || slots.length === 0) return false;

            const time = date.format('HH:mm');

            return slots.some(slot => {
                const start = (slot.start || '').substring(0, 5);
                const end = (slot.end || '').substring(0, 5);
                return start && end && time >= start && time < end;
            });
        } catch (e) {
            console.error("isTimeValid error", e);
            return true;
        }
    }

    findNextAvailableSlot(startDate) {
        if (!this.settings || !this.settings.businessHours) return null;

        let date = startDate.clone();
        const step = parseInt(this.props.schemaOptions?.step?.value || 15, 10);

        const remainder = step - (date.minute() % step);
        if (remainder < step) {
            date.add(remainder, 'minutes');
        }
        date.second(0);

        const maxDate = date.clone().add(7, 'days');

        while (date.isBefore(maxDate)) {
            if (this.isTimeValid(date)) {
                return date;
            }
            date.add(step, 'minutes');
        }

        return null;
    }

    afterChange(value) {
        const {formInspector, schemaOptions} = this.props;

        const endDateField = schemaOptions?.end_date_field?.value || 'end';
        const defaultDuration = parseInt(schemaOptions?.default_duration?.value || 15, 10);
        const autoUpdate = schemaOptions?.auto_update?.value || 'always';

        if (value && formInspector && autoUpdate !== 'never') {
            try {
                const currentEndDate = formInspector.getValueByPath(endDateField);

                if (autoUpdate === 'initial' && currentEndDate) {
                    return;
                }

                const startDate = moment(value);
                const newEndDate = startDate.clone().add(defaultDuration, 'minutes');

                formInspector.formStore.change(endDateField, newEndDate.format('YYYY-MM-DDTHH:mm:ss'));
            } catch (e) {
                console.error("Auto update failed", e);
            }
        }
    }

    getCollisionDetected() {
        const {formInspector} = this.props;
        if (!formInspector?.formStore) return false;

        return formInspector.formStore.__collisionDetected || false;
    }

    render() {
        const {error, schemaOptions} = this.props;
        const step = parseInt(schemaOptions?.step?.value || 15, 10);
        const hasCollision = this.getCollisionDetected();

        const options = {
            timeConstraints: {
                minutes: {step},
            },
        };

        return (
            <div>
                {this.renderDatePicker(options, !error && !hasCollision)}
                {hasCollision && !error && (
                    <div style={{color: '#ea9c00', fontSize: '10px', marginTop: '5px'}}>
                        <span className="fa fa-exclamation-triangle" style={{marginRight: '5px'}}></span>
                        {translate('sulu_admin_extras.errors.collision')}
                    </div>
                )}
                {!hasCollision && !this.isValidTime && (
                    <div style={{color: '#ea9c00', fontSize: '10px', marginTop: '5px'}}>
                        <span className="fa fa-exclamation-triangle" style={{marginRight: '5px'}}></span>
                        {this.timeErrorMessage || 'Invalid time'}
                    </div>
                )}
            </div>
        );
    }
}

export default DateTimeStart;