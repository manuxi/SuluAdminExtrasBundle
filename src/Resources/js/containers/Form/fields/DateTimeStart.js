// @flow
import React from 'react';
import ReactDOM from 'react-dom';
import { observer } from 'mobx-react';
import moment from 'moment';
import { action, observable } from 'mobx';
import { translate } from 'sulu-admin-bundle/utils';
import Requester from 'sulu-admin-bundle/services/Requester';
import AbstractDateTime from './AbstractDateTime';

@observer
class DateTimeStart extends AbstractDateTime {
    @observable isValidTime = true;
    @observable isStrictMode = false;
    @observable timeErrorMessage = null;
    originalValidate = null;
    validateTimer = null;
    wrapperRef = null;
    errorLabelEl = null;

    componentDidMount() {
        super.componentDidMount();

        // Find Sulu's error-label div by walking up the DOM
        this.findErrorLabelEl();

        const { formInspector } = this.props;
        if (formInspector && formInspector.formStore) {
            const store = formInspector.formStore;
            this.originalValidate = store.validate.bind(store);

            store.validate = action(() => {
                const result = this.originalValidate();

                // Only block save when strict mode is enabled AND time is invalid
                if (this.isStrictMode && !this.isValidTime) {
                    return false;
                }

                return result;
            });
        }

        // If we already have a value, validate it via API
        const { value } = this.props;
        if (value) {
            this.validateTimeViaApi(value);
        }

        // Load defaults if no value is set
        if (!value) {
            const defaultsApiUrl = this.props.schemaOptions?.defaults_api_url?.value;
            if (defaultsApiUrl) {
                this.loadDefaults(defaultsApiUrl);
            }
        }
    }

    componentWillUnmount() {
        const { formInspector } = this.props;
        if (this.originalValidate && formInspector?.formStore) {
            formInspector.formStore.validate = this.originalValidate;
        }
        if (this.validateTimer) {
            clearTimeout(this.validateTimer);
        }
    }

    findErrorLabelEl() {
        if (!this.wrapperRef) return;

        // Walk up from our component to find the Field wrapper,
        // then find the error-label div within it.
        // DOM structure: Field > [children wrapper] > our component
        //                Field > error-label
        let el = this.wrapperRef;
        while (el) {
            // The error-label is a sibling at some ancestor level
            const parent = el.parentElement;
            if (!parent) break;

            // Look for error-label sibling in this parent
            const errorLabel = parent.querySelector('[class*="error-label"]');
            if (errorLabel) {
                this.errorLabelEl = errorLabel;
                return;
            }
            el = parent;
        }
    }

    setWrapperRef = (ref) => {
        this.wrapperRef = ref;
    };

    loadDefaults(defaultsApiUrl) {
        const { onChange } = this.props;

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
        });
    }

    getValidateTimeUrl() {
        return this.props.schemaOptions?.validate_time_url?.value || null;
    }

    debouncedValidateTime(value) {
        if (this.validateTimer) clearTimeout(this.validateTimer);
        this.validateTimer = setTimeout(() => this.validateTimeViaApi(value), 300);
    }

    @action validateTimeViaApi(value) {
        const url = this.getValidateTimeUrl();
        if (!url || !value) {
            this.isValidTime = true;
            this.isStrictMode = false;
            this.timeErrorMessage = null;
            return;
        }

        const datetime = moment(value);
        if (!datetime.isValid()) {
            this.isValidTime = true;
            this.isStrictMode = false;
            this.timeErrorMessage = null;
            return;
        }

        const params = new URLSearchParams({
            datetime: datetime.format('YYYY-MM-DDTHH:mm:ss'),
        });

        Requester.get(url + '?' + params.toString())
            .then(action((response) => {
                this.isStrictMode = response.strict === true;

                if (response.valid) {
                    this.isValidTime = true;
                    this.timeErrorMessage = null;
                } else {
                    this.isValidTime = false;
                    this.timeErrorMessage = translate('sulu_admin_extras.errors.invalid_time_slot');
                }
            }))
            .catch(() => {
                // On error, don't block the form
                this.isValidTime = true;
                this.isStrictMode = false;
                this.timeErrorMessage = null;
            });
    }

    handleChange = (value) => {
        const { onChange, onFinish } = this.props;
        const stringValue = value ?
            moment(value).format('YYYY-MM-DDTHH:mm:ss') : undefined;

        // Validate via API (debounced)
        this.debouncedValidateTime(stringValue);

        onChange(stringValue);
        this.afterChange(stringValue);
        onFinish();
    };

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

    renderErrorLabelContent() {
        const { error } = this.props;
        const hasCollision = this.getCollisionDetected();

        const showWarning = !this.isValidTime && !this.isStrictMode;
        const showError = !this.isValidTime && this.isStrictMode;
        const warningColor = '#ea9c00';
        const errorColor = '#d9534f';

        if (hasCollision && !error) {
            return (
                <span style={{ color: warningColor }}>
                    <span className="fa fa-exclamation-triangle" style={{ marginRight: '5px' }}></span>
                    {translate('sulu_admin_extras.errors.collision')}
                </span>
            );
        }

        if (!hasCollision && showError) {
            return (
                <span style={{ color: errorColor }}>
                    <span className="fa fa-exclamation-triangle" style={{ marginRight: '5px' }}></span>
                    {this.timeErrorMessage || 'Invalid time'}
                </span>
            );
        }

        if (!hasCollision && showWarning) {
            return (
                <span style={{ color: warningColor }}>
                    <span className="fa fa-exclamation-triangle" style={{ marginRight: '5px' }}></span>
                    {this.timeErrorMessage || 'Invalid time'}
                </span>
            );
        }

        return null;
    }

    render() {
        const { error, schemaOptions } = this.props;
        const step = parseInt(schemaOptions?.step?.value || 15, 10);

        const options = {
            timeConstraints: {
                minutes: { step },
            },
        };

        const showError = !this.isValidTime && this.isStrictMode;
        const hasCollision = this.getCollisionDetected();

        // DatePicker border: only red when strict error (or collision/other error)
        const datePickerValid = !error && !hasCollision && !showError;

        const errorLabelContent = this.renderErrorLabelContent();

        return (
            <div ref={this.setWrapperRef}>
                {this.renderDatePicker(options, datePickerValid)}
                {this.errorLabelEl && errorLabelContent &&
                    ReactDOM.createPortal(errorLabelContent, this.errorLabelEl)
                }
            </div>
        );
    }
}

export default DateTimeStart;