// @flow
import React from 'react';
import {action} from 'mobx';
import {observer} from 'mobx-react';
import moment from 'moment';
import {DatePicker, Icon} from 'sulu-admin-bundle/components';
import {translate} from 'sulu-admin-bundle/utils';
import styles from './HolidayDates.scss';

type HolidayEntry = {start: string, end: string, label: string, recurring: boolean};
type Props = {
    disabled: boolean,
    onChange: (value: Array<HolidayEntry>) => void,
    onFinish: () => void,
    value: ?Array<HolidayEntry>,
};

const DATE_OPTIONS = {dateFormat: true, timeFormat: false};

const toDate = (str: string): ?Date => {
    if (!str) return undefined;
    const m = moment(str, 'YYYY-MM-DD');
    return m.isValid() ? m.toDate() : undefined;
};

const toStr = (date: ?Date): string => {
    if (!date) return '';
    return moment(date).format('YYYY-MM-DD');
};

@observer
class HolidayDatesEditor extends React.Component<Props> {

    getData(): Array<HolidayEntry> {
        return this.props.value || [];
    }

    @action handleAdd = () => {
        const entries = [...this.getData()];
        const today = moment().format('YYYY-MM-DD');
        entries.push({start: today, end: today, label: '', recurring: false});
        this.props.onChange(entries);
    };

    @action handleRemove = (index: number) => {
        const entries = [...this.getData()];
        entries.splice(index, 1);
        this.props.onChange(entries);
        this.props.onFinish();
    };

    @action handleDateChange = (index: number, field: string, date: ?Date) => {
        const entries = [...this.getData()];
        entries[index] = {...entries[index], [field]: toStr(date)};
        this.props.onChange(entries);
        this.props.onFinish();
    };

    @action handleLabelChange = (index: number, value: string) => {
        const entries = [...this.getData()];
        entries[index] = {...entries[index], label: value};
        this.props.onChange(entries);
    };

    handleLabelBlur = () => { this.props.onFinish(); };

    @action handleToggleRecurring = (index: number) => {
        const entries = [...this.getData()];
        entries[index] = {...entries[index], recurring: !entries[index].recurring};
        this.props.onChange(entries);
        this.props.onFinish();
    };

    calcDays(start: string, end: string): number {
        if (!start || !end) return 0;
        const diff = moment(end).diff(moment(start), 'days') + 1;
        return diff > 0 ? diff : 0;
    }

    render() {
        const {disabled} = this.props;
        const entries = this.getData();
        const totalDays = entries.reduce((sum, e) => sum + this.calcDays(e.start, e.end), 0);

        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    {/*<span className={styles.title}>{translate('sulu_admin_extras.holiday_dates.title')}</span>*/}
                    <button className={styles.actionButton} disabled={disabled} onClick={this.handleAdd} type="button">
                        <Icon name="su-plus" />
                        <span>{translate('sulu_admin_extras.holiday_dates.add')}</span>
                    </button>
                </div>
                <div className={styles.list}>
                    {entries.length === 0 && (
                        <div className={styles.empty}>{translate('sulu_admin_extras.holiday_dates.empty')}</div>
                    )}
                    {entries.map((entry, index) => (
                        <div className={styles.row} key={index}>
                            <div className={styles.dateCell}>
                                <DatePicker
                                    disabled={!!disabled}
                                    onChange={(date) => this.handleDateChange(index, 'start', date)}
                                    options={DATE_OPTIONS}
                                    value={toDate(entry.start)}
                                />
                            </div>
                            <span className={styles.dateSeparator}>&ndash;</span>
                            <div className={styles.dateCell}>
                                <DatePicker
                                    disabled={!!disabled}
                                    onChange={(date) => this.handleDateChange(index, 'end', date)}
                                    options={DATE_OPTIONS}
                                    value={toDate(entry.end)}
                                />
                            </div>
                            <input
                                className={styles.labelInput}
                                disabled={disabled}
                                onBlur={this.handleLabelBlur}
                                onChange={(e) => this.handleLabelChange(index, e.target.value)}
                                placeholder={translate('sulu_admin_extras.holiday_dates.label_placeholder')}
                                type="text"
                                value={entry.label}
                            />
                            <button
                                className={styles.actionButton + (entry.recurring ? ' ' + styles.actionButtonActive : '')}
                                disabled={disabled}
                                onClick={() => this.handleToggleRecurring(index)}
                                title={translate('sulu_admin_extras.holiday_dates.recurring_title')}
                                type="button"
                            >
                                <Icon name="su-sync" />
                                <span>{translate('sulu_admin_extras.holiday_dates.recurring')}</span>
                            </button>
                            {!disabled && (
                                <button
                                    className={styles.iconButton}
                                    onClick={() => this.handleRemove(index)}
                                    title={translate('sulu_admin_extras.delete')}
                                    type="button"
                                >
                                    <Icon name="su-trash-alt" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                {entries.length > 0 && (
                    <div className={styles.info}>
                        {entries.length} {translate('sulu_admin_extras.holiday_dates.entries')} · {totalDays} {translate('sulu_admin_extras.holiday_dates.days_total')}
                    </div>
                )}
            </div>
        );
    }
}

export default HolidayDatesEditor;