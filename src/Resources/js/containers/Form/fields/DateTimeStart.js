// @flow
import React from 'react';
import { observer } from 'mobx-react';
import moment from 'moment';
import { action, observable } from 'mobx';
import { translate } from 'sulu-admin-bundle/utils';
import ResourceRequester from 'sulu-admin-bundle/services/ResourceRequester';
import Requester from 'sulu-admin-bundle/services/Requester';
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
                    const { value, onChange } = this.props;

                    if (!value) {
                        const defaultsApiUrl = this.props.schemaOptions?.defaults_api_url?.value;
                        if (defaultsApiUrl) {
                            let url = defaultsApiUrl;
                            const appointmentId = this.props.formInspector?.options?.appointmentId
                                || this.props.formInspector?.formStore?.options?.appointmentId
                                || (window.location.hash.match(/\/appointments\/([A-Za-z0-9-]+)\/sub-appointments/) || [])[1];

                            if (appointmentId) {
                                url += (url.includes('?') ? '&' : '?') + 'appointmentId=' + appointmentId;
                            }

                            Requester.get(url).then(action((response) => {
                                const { formInspector } = this.props;

                                if (response.start) {
                                    onChange(moment(response.start).format('YYYY-MM-DDTHH:mm:ss'));
                                }

                                if (formInspector && formInspector.formStore) {
                                    const updates = {};

                                    if (response.end) {
                                        updates['end'] = moment(response.end).format('YYYY-MM-DDTHH:mm:ss');
                                    }

                                    if (response.defaultResource) {
                                        updates['resource'] = response.defaultResource;
                                    }

                                    if (Object.keys(updates).length > 0) {
                                        formInspector.formStore.changeMultiple(updates);
                                    }
                                } else if (response.start) {
                                    this.afterChange(moment(response.start).format('YYYY-MM-DDTHH:mm:ss'));
                                }
                            })).catch(e => {
                                console.error('Failed to load defaults from API', e);
                                this.fallbackToCalculatedSlot(onChange);
                            });
                        } else {
                            this.fallbackToCalculatedSlot(onChange);
                        }
                    } else {
                        const valueMoment = moment(value);
                        if (valueMoment.isValid() && !this.isTimeValid(valueMoment)) {
                            this.fallbackToCalculatedSlot(onChange, valueMoment);
                        }
                        this.validateTime(value);
                    }
                }))
                .catch((error) => {
                    console.error('Failed to load appointment settings', error);
                });
        }
    }

    fallbackToCalculatedSlot(onChange, baseMoment = null) {
        try {
            const nextSlot = this.findNextAvailableSlot(baseMoment || moment());
            if (nextSlot) {
                const formatted = nextSlot.format('YYYY-MM-DDTHH:mm:ss');
                onChange(formatted);
                this.afterChange(formatted);
            }
        } catch (e) {
            console.error("Error recalculating invalid slot", e);
        }
    }

    handleChange = (value) => {
        const { onChange, onFinish } = this.props;
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

    isHoliday(date) {
        if (!this.settings) return false;

        const dateStr = date.format('YYYY-MM-DD');

        const publicHolidays = this.settings.publicHolidays;
        if (publicHolidays && publicHolidays.holidays && Array.isArray(publicHolidays.holidays)) {
            for (const holiday of publicHolidays.holidays) {
                if (holiday.enabled && holiday.date === dateStr) {
                    return true;
                }
            }
        }

        const holidayDates = this.settings.holidayDates;
        if (holidayDates && Array.isArray(holidayDates)) {
            const dateMd = date.format('MM-DD');

            for (const period of holidayDates) {
                if (!period.start || !period.end) continue;

                if (period.recurring) {
                    const startMd = period.start.substring(5);
                    const endMd = period.end.substring(5);
                    if (dateMd >= startMd && dateMd <= endMd) {
                        return true;
                    }
                } else if (dateStr >= period.start && dateStr <= period.end) {
                    return true;
                }
            }
        }

        return false;
    }

    isTimeValid(date) {
        try {
            if (this.isHoliday(date)) return false;

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
            return false;
        }
    }

    isDayAvailable(date) {
        if (this.isHoliday(date)) return false;

        const slots = this.getBusinessSlotsForDay(date);

        return slots && slots.length > 0;
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

        for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
            if (!this.isDayAvailable(date)) {
                date.add(1, 'day').startOf('day');
                continue;
            }

            const slots = this.getBusinessSlotsForDay(date);
            if (!slots) {
                date.add(1, 'day').startOf('day');
                continue;
            }

            const dayEnd = date.clone().endOf('day');

            while (date.isBefore(dayEnd)) {
                const time = date.format('HH:mm');
                const inSlot = slots.some(slot => {
                    const start = (slot.start || '').substring(0, 5);
                    const end = (slot.end || '').substring(0, 5);

                    return start && end && time >= start && time < end;
                });

                if (inSlot) {
                    return date;
                }

                date.add(step, 'minutes');
            }

            date.startOf('day');
            date.add(1, 'day');
        }

        return null;
    }

    afterChange(value) {
        const { formInspector, schemaOptions } = this.props;

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
        const { formInspector } = this.props;
        if (!formInspector?.formStore) return false;

        return formInspector.formStore.__collisionDetected || false;
    }

    render() {
        const { error, schemaOptions } = this.props;
        const step = parseInt(schemaOptions?.step?.value || 15, 10);
        const hasCollision = this.getCollisionDetected();

        const options = {
            timeConstraints: {
                minutes: { step },
            },
        };

        return (
            <div>
                {this.renderDatePicker(options, !error && !hasCollision)}
                {hasCollision && !error && (
                    <div style={{ color: '#ea9c00', fontSize: '10px', marginTop: '5px' }}>
                        <span className="fa fa-exclamation-triangle" style={{ marginRight: '5px' }}></span>
                        {translate('sulu_admin_extras.errors.collision')}
                    </div>
                )}
                {!hasCollision && !this.isValidTime && (
                    <div style={{ color: '#ea9c00', fontSize: '10px', marginTop: '5px' }}>
                        <span className="fa fa-exclamation-triangle" style={{ marginRight: '5px' }}></span>
                        {this.timeErrorMessage || 'Invalid time'}
                    </div>
                )}
            </div>
        );
    }
}

export default DateTimeStart;