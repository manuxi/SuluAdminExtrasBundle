// @flow
import React from 'react';
import { action } from 'mobx';
import { observer } from 'mobx-react';
import moment from 'moment';
import { DatePicker, Icon, Toggler } from 'sulu-admin-bundle/components';
import { translate } from 'sulu-admin-bundle/utils';
import styles from './BusinessHours.scss';

const WEEKDAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const DEFAULT_MORNING = { start: '08:00', end: '12:00' };
const DEFAULT_AFTERNOON = { start: '13:00', end: '17:00' };

const TIME_OPTIONS = { dateFormat: false, timeFormat: 'HH:mm' };

type Slot = { start: string, end: string };
type DayConfig = { enabled: boolean, break: boolean, slots: Array<Slot> };
type BusinessHoursData = { [string]: DayConfig };

type Props = {
    disabled: boolean,
    onChange: (value: BusinessHoursData) => void,
    onFinish: () => void,
    value: ?BusinessHoursData,
};

const timeToDate = (timeStr: string): ?Date => {
    if (!timeStr) return undefined;
    const m = moment(timeStr, 'HH:mm');
    return m.isValid() ? m.toDate() : undefined;
};

const dateToTime = (date: ?Date): string => {
    if (!date) return '';
    return moment(date).format('HH:mm');
};

export const getDefaultValue = (): BusinessHoursData => {
    const data = {};
    WEEKDAY_KEYS.forEach((key, index) => {
        data[key] = {
            enabled: index < 5,
            break: true,
            slots: index < 5 ? [{ ...DEFAULT_MORNING }, { ...DEFAULT_AFTERNOON }] : [],
        };
    });
    return data;
};

@observer
class BusinessHoursEditor extends React.Component<Props> {

    getData(): BusinessHoursData {
        return this.props.value || getDefaultValue();
    }

    @action handleToggleDay = (checked: boolean, dayKey: ?string) => {
        if (!dayKey) return;
        const data = { ...this.getData() };
        const current = data[dayKey];
        if (checked) {
            data[dayKey] = { ...current, enabled: true, break: true, slots: [{ ...DEFAULT_MORNING }, { ...DEFAULT_AFTERNOON }] };
        } else {
            data[dayKey] = { ...current, enabled: false, slots: [] };
        }
        this.props.onChange(data);
        this.props.onFinish();
    };

    @action handleToggleBreak = (dayKey: string) => {
        const data = { ...this.getData() };
        const current = data[dayKey];
        if (!current.enabled) return;

        if (current.break) {
            const mergedStart = current.slots.length > 0 ? current.slots[0].start : '08:00';
            const mergedEnd = current.slots.length > 1 ? current.slots[1].end : '17:00';
            data[dayKey] = { ...current, break: false, slots: [{ start: mergedStart, end: mergedEnd }] };
        } else {
            const existing = current.slots[0] || { start: '08:00', end: '17:00' };
            data[dayKey] = { ...current, break: true, slots: [{ start: existing.start, end: '12:00' }, { start: '13:00', end: existing.end }] };
        }
        this.props.onChange(data);
        this.props.onFinish();
    };

    @action handleTimeChange = (dayKey: string, slotIndex: number, field: string, date: ?Date) => {
        const timeStr = dateToTime(date);
        if (!timeStr) return;
        const data = { ...this.getData() };
        const slots = [...data[dayKey].slots];
        slots[slotIndex] = { ...slots[slotIndex], [field]: timeStr };
        data[dayKey] = { ...data[dayKey], slots };
        this.props.onChange(data);
        this.props.onFinish();
    };

    @action handleApplyToWeekdays = () => {
        const data = { ...this.getData() };
        const monday = data.monday;
        if (!monday || !monday.enabled) return;
        ['tuesday', 'wednesday', 'thursday', 'friday'].forEach((dayKey) => {
            data[dayKey] = { enabled: monday.enabled, break: monday.break, slots: monday.slots.map((s) => ({ ...s })) };
        });
        this.props.onChange(data);
        this.props.onFinish();
    };

    renderTimeSlots(dayKey: string, dayConfig: DayConfig) {
        const { disabled } = this.props;
        if (!dayConfig.enabled || dayConfig.slots.length === 0) return null;

        return (
            <div className={styles.slots}>
                {dayConfig.slots.map((slot, index) => (
                    <React.Fragment key={index}>
                        {index > 0 && <span className={styles.timeSeparator}>|</span>}
                        <div className={styles.slot}>
                            <div className={styles.timeCell}>
                                <DatePicker
                                    disabled={!!disabled}
                                    onChange={(date) => this.handleTimeChange(dayKey, index, 'start', date)}
                                    options={TIME_OPTIONS}
                                    value={timeToDate(slot.start)}
                                />
                            </div>
                            <span className={styles.timeSeparator}>&ndash;</span>
                            <div className={styles.timeCell}>
                                <DatePicker
                                    disabled={!!disabled}
                                    onChange={(date) => this.handleTimeChange(dayKey, index, 'end', date)}
                                    options={TIME_OPTIONS}
                                    value={timeToDate(slot.end)}
                                />
                            </div>
                        </div>
                    </React.Fragment>
                ))}
                <button
                    className={styles.actionButton + (dayConfig.break ? ' ' + styles.actionButtonActive : '')}
                    disabled={disabled}
                    onClick={() => this.handleToggleBreak(dayKey)}
                    title={translate('sulu_admin_extras.business_hours.break_label')}
                    type="button"
                >
                    <Icon name="su-clock" />
                    <span>{translate('sulu_admin_extras.business_hours.break')}</span>
                </button>
            </div>
        );
    }

    render() {
        const { disabled } = this.props;
        const data = this.getData();

        return (
            <div className={styles.container}>
                <div className={styles.toolbar}>
                    <button
                        className={styles.actionButton}
                        disabled={disabled || !data.monday?.enabled}
                        onClick={this.handleApplyToWeekdays}
                        title={translate('sulu_admin_extras.business_hours.apply_to_weekdays_label')}
                        type="button"
                    >
                        <Icon name="su-copy" />
                        <span>{translate('sulu_admin_extras.business_hours.apply_to_weekdays')}</span>
                    </button>
                </div>
                {WEEKDAY_KEYS.map((dayKey) => {
                    const dayConfig = data[dayKey] || { enabled: false, break: false, slots: [] };
                    return (
                        <div className={styles.row + (!dayConfig.enabled ? ' ' + styles.rowDisabled : '')} key={dayKey}>
                            <Toggler
                                checked={dayConfig.enabled}
                                disabled={!!disabled}
                                onChange={(checked) => this.handleToggleDay(checked, dayKey)}
                                title={translate('sulu_admin_extras.business_hours.weekdays_label')}
                                value={dayKey}
                            />
                            <span className={styles.dayLabel + (!dayConfig.enabled ? ' ' + styles.dayLabelDisabled : '')}>
                                {translate('sulu_admin_extras.weekday.' + dayKey)}
                            </span>
                            {this.renderTimeSlots(dayKey, dayConfig)}
                        </div>
                    );
                })}
            </div>
        );
    }
}

export default BusinessHoursEditor;