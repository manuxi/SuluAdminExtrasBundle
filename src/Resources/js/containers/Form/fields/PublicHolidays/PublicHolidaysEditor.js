// @flow
import React from 'react';
import {action, observable} from 'mobx';
import {observer} from 'mobx-react';
import styles from './PublicHolidays.scss';

type Holiday = {date: string, localName: string, name: string, enabled: boolean, custom?: boolean};
type PublicHolidaysData = {country: string, subdivision: ?string, year: number, holidays: Array<Holiday>};
type Props = {disabled: boolean, locale: string, onChange: (value: PublicHolidaysData) => void, onFinish: () => void, proxyEndpoint: string, value: ?PublicHolidaysData};

const currentYear = new Date().getFullYear();

const fetchJson = (url: string): Promise<any> => {
    return fetch(url, {
        credentials: 'same-origin',
        headers: {'X-Requested-With': 'XMLHttpRequest'},
    }).then((response) => {
        if (!response.ok) {
            throw new Error('Request failed: ' + response.status);
        }
        return response.json();
    });
};

@observer
class PublicHolidaysEditor extends React.Component<Props> {
    @observable loading: boolean = false;
    @observable countries: Array<{countryCode: string, name: string}> = [];
    @observable subdivisions: Array<{code: string, shortName: string}> = [];
    @observable addingCustom: boolean = false;
    @observable customDate: string = '';
    @observable customName: string = '';

    static defaultProps = {proxyEndpoint: '/admin/api/public-holidays'};

    componentDidMount() { this.loadCountries(); }

    getData(): PublicHolidaysData {
        return this.props.value || {country: 'DE', subdivision: null, year: currentYear, holidays: []};
    }

    @action loadCountries = () => {
        fetchJson(this.props.proxyEndpoint + '/countries').then(action((data) => {
            this.countries = data || [];
            const current = this.getData();
            if (current.country) {
                this.loadSubdivisions(current.country);
            }
        })).catch((err) => {
            console.error('Failed to load countries', err);
            this.countries = [{countryCode: 'DE', name: 'Germany'}];
        });
    };

    @action loadSubdivisions = (countryCode: string) => {
        fetchJson(this.props.proxyEndpoint + '/subdivisions/' + countryCode).then(action((data) => {
            this.subdivisions = data || [];
        })).catch(() => {
            this.subdivisions = [];
        });
    };

    @action handleCountryChange = (e: SyntheticInputEvent<HTMLSelectElement>) => {
        const cc = e.target.value;
        this.props.onChange({...this.getData(), country: cc, subdivision: null, holidays: []});
        this.loadSubdivisions(cc);
    };

    @action handleSubdivisionChange = (e: SyntheticInputEvent<HTMLSelectElement>) => {
        this.props.onChange({...this.getData(), subdivision: e.target.value || null});
    };

    @action handleYearChange = (e: SyntheticInputEvent<HTMLSelectElement>) => {
        this.props.onChange({...this.getData(), year: parseInt(e.target.value, 10), holidays: []});
    };

    @action handleRefresh = () => {
        const data = this.getData();
        this.loading = true;
        const params = new URLSearchParams({country: data.country, year: String(data.year)});
        if (data.subdivision) params.set('subdivision', data.subdivision);

        fetchJson(this.props.proxyEndpoint + '/fetch?' + params.toString()).then(action((responseData) => {
            const existingCustom = data.holidays.filter((h) => h.custom);
            const apiHolidays = (responseData || []).map((h) => ({
                date: h.date,
                localName: h.localName || h.name,
                name: h.name,
                enabled: true,
                custom: false,
            }));
            const merged = [...apiHolidays, ...existingCustom].sort((a, b) => a.date.localeCompare(b.date));
            this.props.onChange({...data, holidays: merged});
            this.props.onFinish();
            this.loading = false;
        })).catch(action((err) => {
            console.error('Failed to fetch holidays', err);
            this.loading = false;
        }));
    };

    @action handleToggleHoliday = (index: number) => {
        const data = {...this.getData()};
        const holidays = [...data.holidays];
        holidays[index] = {...holidays[index], enabled: !holidays[index].enabled};
        this.props.onChange({...data, holidays});
        this.props.onFinish();
    };

    @action handleRemoveCustom = (index: number) => {
        const data = {...this.getData()};
        const holidays = [...data.holidays];
        holidays.splice(index, 1);
        this.props.onChange({...data, holidays});
        this.props.onFinish();
    };

    @action handleAddCustom = () => {
        if (!this.customDate || !this.customName) return;
        const data = {...this.getData()};
        const holidays = [...data.holidays, {date: this.customDate, localName: this.customName, name: this.customName, enabled: true, custom: true}];
        holidays.sort((a, b) => a.date.localeCompare(b.date));
        this.props.onChange({...data, holidays});
        this.props.onFinish();
        this.customDate = ''; this.customName = ''; this.addingCustom = false;
    };

    formatDate(dateStr: string): string {
        try {
            const d = new Date(dateStr + 'T00:00:00');
            return d.toLocaleDateString(this.props.locale === 'de' ? 'de-DE' : 'en-US', {day: '2-digit', month: '2-digit', year: 'numeric'});
        } catch (e) { return dateStr; }
    }

    render() {
        const {disabled, locale} = this.props;
        const data = this.getData();
        const enabledCount = data.holidays.filter((h) => h.enabled).length;

        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.selectGroup}>
                        <span className={styles.selectLabel}>{locale === 'de' ? 'Land' : 'Country'}</span>
                        <select className={styles.select} disabled={disabled} onChange={this.handleCountryChange} value={data.country}>
                            {this.countries.map((c) => <option key={c.countryCode} value={c.countryCode}>{c.name}</option>)}
                        </select>
                    </div>
                    {this.subdivisions.length > 0 && (
                        <div className={styles.selectGroup}>
                            <span className={styles.selectLabel}>{locale === 'de' ? 'Region' : 'Region'}</span>
                            <select className={styles.select} disabled={disabled} onChange={this.handleSubdivisionChange} value={data.subdivision || ''}>
                                <option value="">{locale === 'de' ? '— Alle —' : '— All —'}</option>
                                {this.subdivisions.map((s) => <option key={s.code} value={s.code}>{s.shortName}</option>)}
                            </select>
                        </div>
                    )}
                    <div className={styles.selectGroup}>
                        <span className={styles.selectLabel}>{locale === 'de' ? 'Jahr' : 'Year'}</span>
                        <select className={styles.select} disabled={disabled} onChange={this.handleYearChange} value={data.year}>
                            {[currentYear - 1, currentYear, currentYear + 1, currentYear + 2].map((y) => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div className={styles.headerActions}>
                        <button className={styles.addButton} disabled={disabled} onClick={action(() => { this.addingCustom = true; })} type="button">
                            + {locale === 'de' ? 'Eigener' : 'Custom'}
                        </button>
                        <button className={styles.refreshButton + (this.loading ? ' ' + styles.loading : '')}
                                disabled={disabled || this.loading} onClick={this.handleRefresh}
                                title={locale === 'de' ? 'Jetzt aktualisieren' : 'Refresh now'} type="button">
                            <span className={this.loading ? styles.spinning : ''}>↻</span>
                        </button>
                    </div>
                </div>
                {this.addingCustom && (
                    <div className={styles.customRow}>
                        <input className={styles.customDateInput} onChange={action((e) => { this.customDate = e.target.value; })} type="date" value={this.customDate} />
                        <input className={styles.customNameInput} onChange={action((e) => { this.customName = e.target.value; })}
                               onKeyDown={(e) => { if (e.key === 'Enter') this.handleAddCustom(); }}
                               placeholder={locale === 'de' ? 'Bezeichnung...' : 'Name...'} type="text" value={this.customName} />
                        <button className={styles.addButton} onClick={this.handleAddCustom} type="button">✓</button>
                        <button className={styles.removeButton} onClick={action(() => { this.addingCustom = false; })} type="button">✕</button>
                    </div>
                )}
                <div className={styles.list}>
                    {data.holidays.length === 0 && (
                        <div className={styles.empty}>{locale === 'de' ? 'Keine Feiertage geladen. Klicke ↻ zum Laden.' : 'No holidays loaded. Click ↻ to fetch.'}</div>
                    )}
                    {data.holidays.map((holiday, index) => (
                        <div className={styles.row + (!holiday.enabled ? ' ' + styles.rowDisabled : '')} key={holiday.date + '-' + index}>
                            <input checked={holiday.enabled} className={styles.checkbox} disabled={disabled} onChange={() => this.handleToggleHoliday(index)} type="checkbox" />
                            <span className={styles.date}>{this.formatDate(holiday.date)}</span>
                            <span className={styles.localName}>{holiday.localName}</span>
                            <span className={styles.intlName}>{holiday.name}</span>
                            {holiday.custom && <span className={styles.customBadge}>{locale === 'de' ? 'Eigener' : 'Custom'}</span>}
                            {holiday.custom && !disabled && <button className={styles.removeButton} onClick={() => this.handleRemoveCustom(index)} type="button">✕</button>}
                        </div>
                    ))}
                </div>
                {data.holidays.length > 0 && (
                    <div className={styles.info}>{enabledCount} / {data.holidays.length} {locale === 'de' ? 'aktiv' : 'active'} · Nager.Date API</div>
                )}
            </div>
        );
    }
}

export default PublicHolidaysEditor;