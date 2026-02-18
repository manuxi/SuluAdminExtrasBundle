// @flow
import React from 'react';
import {action, observable} from 'mobx';
import {observer} from 'mobx-react';
import moment from 'moment';
import {Checkbox, DatePicker, Icon, SingleSelect} from 'sulu-admin-bundle/components';
import {translate} from 'sulu-admin-bundle/utils';
import styles from './PublicHolidays.scss';

type Holiday = {date: string, localName: string, name: string, enabled: boolean, custom?: boolean};
type PublicHolidaysData = {country: string, subdivision: ?string, year: number, holidays: Array<Holiday>};
type Props = {
    disabled: boolean,
    locale: string,
    onChange: (value: PublicHolidaysData) => void,
    onFinish: () => void,
    proxyEndpoint: string,
    value: ?PublicHolidaysData,
};

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
    @observable customDate: ?Date = null;
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
        })).catch(() => {
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

    @action handleCountryChange = (value: string) => {
        this.props.onChange({...this.getData(), country: value, subdivision: null, holidays: []});
        this.loadSubdivisions(value);
    };

    @action handleSubdivisionChange = (value: string) => {
        this.props.onChange({...this.getData(), subdivision: value || null});
    };

    @action handleYearChange = (value: number) => {
        this.props.onChange({...this.getData(), year: value, holidays: []});
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
        })).catch(action(() => { this.loading = false; }));
    };

    @action handleToggleHoliday = (checked: boolean, index: ?number) => {
        if (index == null) return;
        const data = {...this.getData()};
        const holidays = [...data.holidays];
        holidays[index] = {...holidays[index], enabled: checked};
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
        const dateStr = moment(this.customDate).format('YYYY-MM-DD');
        const data = {...this.getData()};
        const holidays = [...data.holidays, {date: dateStr, localName: this.customName, name: this.customName, enabled: true, custom: true}];
        holidays.sort((a, b) => a.date.localeCompare(b.date));
        this.props.onChange({...data, holidays});
        this.props.onFinish();
        this.customDate = null;
        this.customName = '';
        this.addingCustom = false;
    };

    formatDate(dateStr: string): string {
        try {
            const d = new Date(dateStr + 'T00:00:00');
            return d.toLocaleDateString(this.props.locale === 'de' ? 'de-DE' : 'en-US', {day: '2-digit', month: '2-digit', year: 'numeric'});
        } catch (e) { return dateStr; }
    }

    render() {
        const {disabled} = this.props;
        const data = this.getData();
        const enabledCount = data.holidays.filter((h) => h.enabled).length;
        const Option = SingleSelect.Option;

        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.selectGroup}>
                        <span className={styles.selectLabel}>{translate('sulu_admin_extras.public_holidays.country')}</span>
                        <div className={styles.selectWrapper}>
                            <SingleSelect disabled={disabled} onChange={this.handleCountryChange} value={data.country}>
                                {this.countries.map((c) => (
                                    <Option key={c.countryCode} value={c.countryCode}>{c.name}</Option>
                                ))}
                            </SingleSelect>
                        </div>
                    </div>
                    {this.subdivisions.length > 0 && (
                        <div className={styles.selectGroup}>
                            <span className={styles.selectLabel}>{translate('sulu_admin_extras.public_holidays.region')}</span>
                            <div className={styles.selectWrapper}>
                                <SingleSelect disabled={disabled} onChange={this.handleSubdivisionChange} value={data.subdivision || ''}>
                                    <Option value="">{translate('sulu_admin_extras.public_holidays.all_regions')}</Option>
                                    {this.subdivisions.map((s) => (
                                        <Option key={s.code} value={s.code}>{s.shortName}</Option>
                                    ))}
                                </SingleSelect>
                            </div>
                        </div>
                    )}
                    <div className={styles.selectGroup}>
                        <span className={styles.selectLabel}>{translate('sulu_admin_extras.public_holidays.year')}</span>
                        <div className={styles.selectWrapper}>
                            <SingleSelect disabled={disabled} onChange={this.handleYearChange} value={data.year}>
                                {[currentYear - 1, currentYear, currentYear + 1, currentYear + 2].map((y) => (
                                    <Option key={y} value={y}>{String(y)}</Option>
                                ))}
                            </SingleSelect>
                        </div>
                    </div>
                    <div className={styles.headerActions}>
                        <button
                            className={styles.actionButton}
                            disabled={disabled}
                            onClick={action(() => { this.addingCustom = true; })}
                            title={translate('sulu_admin_extras.public_holidays.add_custom_label')}
                            type="button"
                        >
                            <Icon name="su-plus" />
                            <span>{translate('sulu_admin_extras.public_holidays.add_custom')}</span>
                        </button>
                        <button
                            className={styles.refreshButton + (this.loading ? ' ' + styles.refreshLoading : '')}
                            disabled={disabled || this.loading}
                            onClick={this.handleRefresh}
                            title={translate('sulu_admin_extras.public_holidays.refresh_label')}
                            type="button"
                        >
                            <Icon name="su-sync" />
                        </button>
                    </div>
                </div>
                {this.addingCustom && (
                    <div className={styles.customRow}>
                        <div className={styles.customDateCell}>
                            <DatePicker
                                onChange={action((date) => { this.customDate = date; })}
                                options={{dateFormat: true, timeFormat: false}}
                                value={this.customDate}
                            />
                        </div>
                        <input
                            className={styles.customNameInput}
                            onChange={action((e) => { this.customName = e.target.value; })}
                            onKeyDown={(e) => { if (e.key === 'Enter') this.handleAddCustom(); }}
                            placeholder={translate('sulu_admin_extras.public_holidays.name_placeholder')}
                            type="text"
                            value={this.customName}
                        />
                        <button className={styles.actionButton} onClick={this.handleAddCustom} type="button">
                            <Icon name="su-check" />
                        </button>
                        <button className={styles.iconButton} onClick={action(() => { this.addingCustom = false; })} type="button">
                            <Icon name="su-times" />
                        </button>
                    </div>
                )}
                <div className={styles.list}>
                    {data.holidays.length === 0 && (
                        <div className={styles.empty}>{translate('sulu_admin_extras.public_holidays.empty')}</div>
                    )}
                    {data.holidays.map((holiday, index) => (
                        <div className={styles.row + (!holiday.enabled ? ' ' + styles.rowDisabled : '')} key={holiday.date + '-' + index}>
                            <div className={styles.checkboxCell}>
                                <Checkbox
                                    checked={holiday.enabled}
                                    disabled={!!disabled}
                                    onChange={(checked) => this.handleToggleHoliday(checked, index)}
                                    title={translate('sulu_admin_extras.activate')}
                                    size="small"
                                    value={index}
                                />
                            </div>
                            <span className={styles.date}>{this.formatDate(holiday.date)}</span>
                            <span className={styles.localName}>{holiday.localName}</span>
                            <span className={styles.intlName}>{holiday.name}</span>
                            <div className={styles.trailingCell}>
                                {holiday.custom && (
                                    <span className={styles.customBadge}>{translate('sulu_admin_extras.public_holidays.custom')}</span>
                                )}
                                {holiday.custom && !disabled && (
                                    <button
                                        className={styles.iconButton}
                                        onClick={() => this.handleRemoveCustom(index)}
                                        title={translate('sulu_admin_extras.delete')}
                                        type="button"
                                    >
                                        <Icon name="su-trash-alt" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                {data.holidays.length > 0 && (
                    <div className={styles.info}>
                        {enabledCount} / {data.holidays.length} {translate('sulu_admin_extras.public_holidays.active')} · Nager.Date API
                    </div>
                )}
            </div>
        );
    }
}

export default PublicHolidaysEditor;