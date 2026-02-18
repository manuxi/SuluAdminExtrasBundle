// @flow
import React from 'react';
import {action} from 'mobx';
import {observer} from 'mobx-react';
import styles from './HolidayDates.scss';

type HolidayEntry = {start: string, end: string, label: string, recurring: boolean};
type Props = {disabled: boolean, locale: string, onChange: (value: Array<HolidayEntry>) => void, onFinish: () => void, value: ?Array<HolidayEntry>};

@observer
class HolidayDatesEditor extends React.Component<Props> {

    getData(): Array<HolidayEntry> {
        return this.props.value || [];
    }

    @action handleAdd = () => {
        const entries = [...this.getData()];
        const startStr = new Date().toISOString().split('T')[0];
        entries.push({start: startStr, end: startStr, label: '', recurring: false});
        this.props.onChange(entries);
    };

    @action handleRemove = (index: number) => {
        const entries = [...this.getData()];
        entries.splice(index, 1);
        this.props.onChange(entries);
        this.props.onFinish();
    };

    @action handleFieldChange = (index: number, field: string, value: string | boolean) => {
        const entries = [...this.getData()];
        entries[index] = {...entries[index], [field]: value};
        this.props.onChange(entries);
    };

    handleBlur = () => { this.props.onFinish(); };

    @action handleToggleRecurring = (index: number) => {
        const entries = [...this.getData()];
        entries[index] = {...entries[index], recurring: !entries[index].recurring};
        this.props.onChange(entries);
        this.props.onFinish();
    };

    calcDays(start: string, end: string): number {
        try {
            const diff = Math.ceil((new Date(end + 'T00:00:00').getTime() - new Date(start + 'T00:00:00').getTime()) / 86400000) + 1;
            return diff > 0 ? diff : 0;
        } catch (e) { return 0; }
    }

    render() {
        const {disabled, locale} = this.props;
        const entries = this.getData();
        const totalDays = entries.reduce((sum, e) => sum + this.calcDays(e.start, e.end), 0);

        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <span className={styles.title}>{locale === 'de' ? 'Betriebsferien' : 'Company Holidays'}</span>
                    <button className={styles.addButton} disabled={disabled} onClick={this.handleAdd} type="button">
                        + {locale === 'de' ? 'Hinzufügen' : 'Add'}
                    </button>
                </div>
                <div className={styles.list}>
                    {entries.length === 0 && (
                        <div className={styles.empty}>{locale === 'de' ? 'Keine Betriebsferien eingetragen.' : 'No company holidays defined.'}</div>
                    )}
                    {entries.map((entry, index) => (
                        <div className={styles.row} key={index}>
                            <input className={styles.dateInput} disabled={disabled} onBlur={this.handleBlur}
                                   onChange={(e) => this.handleFieldChange(index, 'start', e.target.value)} type="date" value={entry.start} />
                            <span className={styles.separator}>&ndash;</span>
                            <input className={styles.dateInput} disabled={disabled} min={entry.start} onBlur={this.handleBlur}
                                   onChange={(e) => this.handleFieldChange(index, 'end', e.target.value)} type="date" value={entry.end} />
                            <input className={styles.labelInput} disabled={disabled} onBlur={this.handleBlur}
                                   onChange={(e) => this.handleFieldChange(index, 'label', e.target.value)}
                                   placeholder={locale === 'de' ? 'Bezeichnung...' : 'Label...'} type="text" value={entry.label} />
                            <button className={styles.recurringToggle + (entry.recurring ? ' ' + styles.recurringActive : '')}
                                    disabled={disabled} onClick={() => this.handleToggleRecurring(index)}
                                    title={locale === 'de' ? 'Jährlich wiederkehrend' : 'Recurring annually'} type="button">
                                <span className={styles.recurringIcon}>🔄</span> {locale === 'de' ? 'Jährlich' : 'Annual'}
                            </button>
                            {!disabled && (
                                <button className={styles.removeButton} onClick={() => this.handleRemove(index)} type="button">✕</button>
                            )}
                        </div>
                    ))}
                </div>
                {entries.length > 0 && (
                    <div className={styles.info}>{entries.length} {locale === 'de' ? 'Einträge' : 'entries'} · {totalDays} {locale === 'de' ? 'Tage gesamt' : 'days total'}</div>
                )}
            </div>
        );
    }
}

export default HolidayDatesEditor;