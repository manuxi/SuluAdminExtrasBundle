// @flow
import React from 'react';
import {observer} from 'mobx-react';
import {action, extendObservable, observable, reaction} from 'mobx';
import moment from 'moment';
import {translate} from 'sulu-admin-bundle/utils';
import Requester from 'sulu-admin-bundle/services/Requester';
import AbstractDateTime from './AbstractDateTime';

@observer
class DateTimeEnd extends AbstractDateTime {
    @observable hasCollision = false;
    originalValidate = null;
    disposeReaction = null;
    checkTimer = null;

    componentDidMount() {
        super.componentDidMount();

        const {formInspector} = this.props;
        if (!formInspector?.formStore) return;

        const store = formInspector.formStore;

        if (store.__collisionDetected === undefined) {
            extendObservable(store, {__collisionDetected: false});
        }

        this.originalValidate = store.validate.bind(store);

        store.validate = action(() => {
            const result = this.originalValidate();

            if (this.hasEndBeforeStartError() || this.hasCollision) {
                return false;
            }

            return result;
        });

        if (this.getCollisionCheckUrl()) {
            this.disposeReaction = reaction(
                () => {
                    const data = formInspector.formStore.data;
                    return {
                        start: data[this.getStartField()],
                        end: data['end'],
                        resource: data[this.getResourceField()],
                    };
                },
                () => this.debouncedCollisionCheck(),
                {fireImmediately: false}
            );
        }
    }

    componentWillUnmount() {
        const {formInspector} = this.props;
        if (this.originalValidate && formInspector?.formStore) {
            formInspector.formStore.validate = this.originalValidate;
        }
        if (this.disposeReaction) {
            this.disposeReaction();
        }
        if (this.checkTimer) {
            clearTimeout(this.checkTimer);
        }
    }

    getStartField() {
        return this.props.schemaOptions?.start_date_field?.value || 'start';
    }

    getResourceField() {
        return this.props.schemaOptions?.collision_resource_field?.value || 'resource';
    }

    getCollisionCheckUrl() {
        return this.props.schemaOptions?.collision_check_url?.value || null;
    }

    hasEndBeforeStartError() {
        const {formInspector, value} = this.props;
        if (!formInspector || !value) return false;

        const startValue = formInspector.formStore.data[this.getStartField()];
        if (!startValue) return false;

        return moment(value).isBefore(moment(startValue));
    }

    debouncedCollisionCheck() {
        if (this.checkTimer) clearTimeout(this.checkTimer);
        this.checkTimer = setTimeout(() => this.checkCollision(), 400);
    }

    @action updateCollisionState(collision) {
        this.hasCollision = collision;

        const {formInspector} = this.props;
        if (formInspector?.formStore) {
            formInspector.formStore.__collisionDetected = collision;
        }
    }

    checkCollision() {
        const url = this.getCollisionCheckUrl();
        if (!url) return;

        const {formInspector} = this.props;
        if (!formInspector) return;

        const data = formInspector.formStore.data;
        const start = data[this.getStartField()];
        const end = data['end'];
        const resource = data[this.getResourceField()];

        if (!start || !end || !resource) {
            this.updateCollisionState(false);
            return;
        }

        const params = new URLSearchParams({
            start,
            end,
            resource: String(resource),
            exclude: String(formInspector.formStore.id || ''),
        });

        Requester.get(url + '?' + params.toString())
            .then(action((response) => {
                this.updateCollisionState(response.collision === true);
            }))
            .catch(() => {
                this.updateCollisionState(false);
            });
    }

    render() {
        const {schemaOptions, error} = this.props;
        const step = parseInt(schemaOptions?.step?.value || 1, 10);

        let isValid = !error;
        let errorMessage = null;

        if (this.hasEndBeforeStartError()) {
            isValid = false;
            errorMessage = translate('sulu_admin_extras.errors.start_after_end');
        } else if (this.hasCollision) {
            isValid = false;
            errorMessage = translate('sulu_admin_extras.errors.collision');
        }

        const options = {
            timeConstraints: {minutes: {step}},
        };

        return (
            <div>
                {this.renderDatePicker(options, isValid)}
                {!isValid && !error && errorMessage && (
                    <div style={{
                        color: this.hasCollision ? '#ea9c00' : '#d9534f',
                        fontSize: '10px',
                        marginTop: '5px',
                    }}>
                        {this.hasCollision && (
                            <span className="fa fa-exclamation-triangle" style={{marginRight: '5px'}}></span>
                        )}
                        {errorMessage}
                    </div>
                )}
            </div>
        );
    }
}

export default DateTimeEnd;