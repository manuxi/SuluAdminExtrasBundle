// @flow
import React from 'react';
import {action} from 'mobx';
import {observer} from 'mobx-react';
import styles from './BusinessHours.scss';

const WEEKDAYS = [
    {key: 'monday', labelDe: 'Montag', labelEn: 'Monday'},
    {key: 'tuesday', labelDe: 'Dienstag', labelEn: 'Tuesday'},
    {key: 'wednesday', labelDe: 'Mittwoch', labelEn: 'Wednesday'},
    {key: 'thursday', labelDe: 'Donnerstag', labelEn: 'Thursday'},
    {key: 'friday', labelDe: 'Freitag', labelEn: 'Friday'},
    {key: 'saturday', labelDe: 'Samstag', labelEn: 'Saturday'},
    {key: 'sunday', labelDe: 'Sonntag', labelEn: 'Sunday'},
];

const DEFAULT_MORNING = {start: '08:00', end: '12:00'};
const DEFAULT_AFTERNOON = {start: '13:00', end: '17:00'};

type Slot = {start: string, end: string};
type DayConfig = {enabled: boolean, break: boolean, slots: Array<Slot>};
type BusinessHoursData = {[string]: DayConfig};

type Props = {
    disabled: boolean,
    locale: string,
    onChange: (value: BusinessHoursData) => void,
    onFinish: () => void,
    value: ?BusinessHoursData,
};

const getDefaultValue = (): BusinessHoursData => {
    const data = {};
    WEEKDAYS.forEach((day, index) => {
        data[day.key] = {
            enabled: index < 5,
            break: true,
            slots: index < 5 ? [{...DEFAULT_MORNING}, {...DEFAULT_AFTERNOON}] : [],
        };
    });
    return data;
};

@observer
class BusinessHoursEditor extends React.Component<Props> {

    getData(): BusinessHoursData {
        return this.props.value || getDefaultValue();
    }

    getDayLabel(day: Object): string {
        return this.props.locale === 'de' ? day.labelDe : day.labelEn;
    }

    @action handleToggleDay = (dayKey: string) => {
        const data = {...this.getData()};
        const current = data[dayKey];
        if (current.enabled) {
            data[dayKey] = {...current, enabled: false, slots: []};
        } else {
            data[dayKey] = {...current, enabled: true, break: true, slots: [{...DEFAULT_MORNING}, {...DEFAULT_AFTERNOON}]};
        }
        this.props.onChange(data);
        this.props.onFinish();
    };

    @action handleToggleBreak = (dayKey: string) => {
        const data = {...this.getData()};
        const current = data[dayKey];
        if (!current.enabled) return;

        if (current.break) {
            const mergedStart = current.slots.length > 0 ? current.slots[0].start : '08:00';
            const mergedEnd = current.slots.length > 1 ? current.slots[1].end : '17:00';
            data[dayKey] = {...current, break: false, slots: [{start: mergedStart, end: mergedEnd}]};
        } else {
            const existing = current.slots[0] || {start: '08:00', end: '17:00'};
            data[dayKey] = {...current, break: true, slots: [{start: existing.start, end: '12:00'}, {start: '13:00', end: existing.end}]};
        }
        this.props.onChange(data);
        this.props.onFinish();
    };

    @action handleTimeChange = (dayKey: string, slotIndex: number, field: string, value: string) => {
        const data = {...this.getData()};
        const slots = [...data[dayKey].slots];
        slots[slotIndex] = {...slots[slotIndex], [field]: value};
        data[dayKey] = {...data[dayKey], slots};
        this.props.onChange(data);
    };

    handleTimeBlur = () => { this.props.onFinish(); };

    @action handleApplyToWeekdays = () => {
        const data = {...this.getData()};
        const monday = data.monday;
        if (!monday || !monday.enabled) return;
        ['tuesday', 'wednesday', 'thursday', 'friday'].forEach((dayKey) => {
            data[dayKey] = {enabled: monday.enabled, break: monday.break, slots: monday.slots.map((s) => ({...s}))};
        });
        this.props.onChange(data);
        this.props.onFinish();
    };

    renderTimeSlots(dayKey: string, dayConfig: DayConfig) {
        const {disabled} = this.props;
        if (!dayConfig.enabled || dayConfig.slots.length === 0) return null;

        return (
            <div className={styles.slots}>
                {dayConfig.slots.map((slot, index) => (
                    <React.Fragment key={index}>
                        {index > 0 && <span className={styles.separator}>|</span>}
                        <div className={styles.slot}>
                            <input className={styles.timeInput} disabled={disabled} onBlur={this.handleTimeBlur}
                                   onChange={(e) => this.handleTimeChange(dayKey, index, 'start', e.target.value)} type="time" value={slot.start} />
                            <span className={styles.separator}>&ndash;</span>
                            <input className={styles.timeInput} disabled={disabled} onBlur={this.handleTimeBlur}
                                   onChange={(e) => this.handleTimeChange(dayKey, index, 'end', e.target.value)} type="time" value={slot.end} />
                        </div>
                    </React.Fragment>
                ))}
                <button className={styles.breakToggle + (dayConfig.break ? ' ' + styles.breakActive : '')}
                        disabled={disabled} onClick={() => this.handleToggleBreak(dayKey)} type="button">
                    <span className={styles.breakIcon}>☕</span> Pause
                </button>
            </div>
        );
    }

    render() {
        const {disabled} = this.props;
        const data = this.getData();

        return (
            <div className={styles.container}>
                <div className={styles.toolbar}>
                    <button className={styles.applyButton} disabled={disabled || !data.monday?.enabled}
                            onClick={this.handleApplyToWeekdays} type="button">
                        Mo → Di–Fr
                    </button>
                </div>
                {WEEKDAYS.map((day) => {
                    const dayConfig = data[day.key] || {enabled: false, break: false, slots: []};
                    return (
                        <div className={styles.row + (!dayConfig.enabled ? ' ' + styles.disabled : '')} key={day.key}>
                            <button className={styles.toggle + (dayConfig.enabled ? ' ' + styles.active : '')}
                                    disabled={disabled} onClick={() => this.handleToggleDay(day.key)} type="button" />
                            <span className={styles.dayLabel + (!dayConfig.enabled ? ' ' + styles.labelDisabled : '')}>
                                {this.getDayLabel(day)}
                            </span>
                            {this.renderTimeSlots(day.key, dayConfig)}
                        </div>
                    );
                })}
            </div>
        );
    }
}

export default BusinessHoursEditor;