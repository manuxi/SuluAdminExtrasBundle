// @flow
import React from 'react';
import ReactDOM from 'react-dom';
import { action, computed, observable, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import Requester from 'sulu-admin-bundle/services/Requester';
import styles from './StatusSwitcherFieldTransformer.scss';

@observer
class StatusSwitcher extends React.Component {
    @observable isOpen = false;
    @observable options = [];
    @observable currentValue;
    @observable currentTypeColor = null;
    @observable currentTypeName = null;
    @observable isLoadingOptions = false;
    @observable menuPosition = { top: 0, left: 0 };

    buttonRef = React.createRef();

    constructor(props) {
        super(props);
        this.currentValue = props.value;
        this.currentTypeColor = this.initialTypeColor;
        this.currentTypeName = this.initialTypeName;
    }

    componentDidUpdate(prevProps) {
        if (prevProps.value !== this.props.value) {
            runInAction(() => {
                this.currentValue = this.props.value;
            });
        }
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    getValueFromContext = (key) => {
        const { context } = this.props;
        if (!context) return undefined;
        if (context.$mobx?.values) {
            const mobxValue = context.$mobx.values[key];
            return mobxValue?.value !== undefined ? mobxValue.value : mobxValue;
        }
        return context[key];
    };

    @computed get initialTypeColor() {
        return this.getValueFromContext('typeColor');
    }

    @computed get initialTypeName() {
        return this.getValueFromContext('typeName');
    }

    @computed get optionsApiUrl() {
        return this.props.parameters?.options_api_url;
    }

    @computed get patchApiUrl() {
        return this.props.parameters?.patch_api_url;
    }

    @action loadOptions = () => {
        if (this.options.length > 0 || this.isLoadingOptions || !this.optionsApiUrl) return;
        this.isLoadingOptions = true;
        Requester.get(this.optionsApiUrl).then((res) => {
            runInAction(() => {
                if (res && res.statuses) {
                    this.options = res.statuses;
                }
                this.isLoadingOptions = false;
            });
        }).catch((e) => {
            console.error('Failed to load status options', e);
            runInAction(() => {
                this.isLoadingOptions = false;
            });
        });
    };

    @action handleToggle = (e) => {
        e.stopPropagation();
        e.preventDefault();

        if (!this.isOpen) {
            // Calculate position relative to viewport for the portal
            if (this.buttonRef.current) {
                const rect = this.buttonRef.current.getBoundingClientRect();
                this.menuPosition = {
                    top: rect.bottom + 2,
                    left: rect.left,
                };
            }
            this.isOpen = true;
            document.addEventListener('mousedown', this.handleClickOutside);
            this.loadOptions();
        } else {
            this.isOpen = false;
            document.removeEventListener('mousedown', this.handleClickOutside);
        }
    };

    @action handleClose = () => {
        this.isOpen = false;
        document.removeEventListener('mousedown', this.handleClickOutside);
    };

    handleClickOutside = (event) => {
        // Don't close if clicking the button itself (handleToggle handles that)
        if (this.buttonRef.current && this.buttonRef.current.contains(event.target)) {
            return;
        }
        this.handleClose();
    };

    @action handleSelect = (statusId, e) => {
        e.stopPropagation();
        this.handleClose();

        if (statusId === this.currentValue) return;

        if (!this.patchApiUrl) {
            console.error('No patch_api_url configured for StatusSwitcherFieldTransformer');
            return;
        }

        const selectedOption = this.options.find(o => o.id === statusId);
        if (selectedOption) {
            this.currentValue = statusId;
            this.currentTypeColor = selectedOption.color;
            this.currentTypeName = selectedOption.title;
        }

        const id = this.props.id;
        const url = this.patchApiUrl.replace('[id]', String(id)).replace('{id}', String(id));

        Requester.patch(url, { status: statusId }).then((res) => {
            runInAction(() => {
                if (res && res.typeColor) {
                    this.currentTypeColor = res.typeColor;
                    this.currentTypeName = res.typeName;
                    this.currentValue = res.typeRaw || res.status || statusId;

                    const { context } = this.props;
                    if (context && context.$mobx && typeof context.set === 'function') {
                        context.set('typeColor', res.typeColor);
                        context.set('typeName', res.typeName);
                        context.set('typeRaw', res.typeRaw || res.status || statusId);
                        context.set('status', res.typeRaw || res.status || statusId);
                    }
                }
            });
        }).catch((e) => {
            console.error('Failed to patch status', e);
            runInAction(() => {
                this.currentValue = this.props.value;
                this.currentTypeColor = this.initialTypeColor;
                this.currentTypeName = this.initialTypeName;
            });
        });
    };

    renderMenu() {
        if (!this.isOpen) return null;

        const menu = (
            <div
                className={styles.statusMenu}
                style={{
                    position: 'fixed',
                    top: this.menuPosition.top + 'px',
                    left: this.menuPosition.left + 'px',
                }}
            >
                {this.options.length === 0 && this.isLoadingOptions && (
                    <div className={styles.statusMenuItem}>Loading...</div>
                )}
                {this.options.map((opt) => {
                    const isActive = opt.id === this.currentValue;
                    const itemClasses = [styles.statusMenuItem];
                    if (isActive) itemClasses.push(styles.statusMenuActive);

                    return (
                        <button
                            key={opt.id}
                            className={itemClasses.join(' ')}
                            onClick={(e) => this.handleSelect(opt.id, e)}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <span
                                className={styles.statusMenuDot}
                                style={{ backgroundColor: opt.color }}
                            />
                            <span>{opt.title}</span>
                        </button>
                    );
                })}
            </div>
        );

        return ReactDOM.createPortal(menu, document.body);
    }

    render() {
        const currentOption = this.options.find(o => o.id === this.currentValue);
        const fallbackColor = '#cccccc';

        let displayColor = fallbackColor;
        let displayTitle = this.currentValue || '';

        if (currentOption) {
            displayColor = currentOption.color;
            displayTitle = currentOption.title;
        } else if (this.currentTypeColor) {
            displayColor = this.currentTypeColor;
        } else if (this.initialTypeColor) {
            displayColor = this.initialTypeColor;
        }

        if (!currentOption && this.currentTypeName) {
            displayTitle = this.currentTypeName;
        } else if (!currentOption && this.initialTypeName) {
            displayTitle = this.initialTypeName;
        }

        const showNameParam = this.props.parameters?.show_name;
        const showName = showNameParam === true || showNameParam === 'true';

        return (
            <div
                className={[styles.statusSwitcher, showName && styles.statusSwitcherWithName].filter(Boolean).join(' ')}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
            >
                <button
                    ref={this.buttonRef}
                    className={styles.statusButton}
                    onClick={this.handleToggle}
                    title={displayTitle}
                >
                    <span
                        className={styles.typeDot}
                        style={{ backgroundColor: displayColor }}
                    />
                    {showName && (
                        <span className={styles.typeLabel}>{displayTitle}</span>
                    )}
                </button>
                {this.renderMenu()}
            </div>
        );
    }
}

class StatusSwitcherFieldTransformer {
    transform(value, parameters, context) {
        let itemId = null;
        if (context) {
            if (context.$mobx?.values?.id?.value !== undefined) {
                itemId = context.$mobx.values.id.value;
            } else if (context.id !== undefined) {
                itemId = context.id;
            }
        }

        return <StatusSwitcher id={itemId} value={value} parameters={parameters} context={context} />;
    }
}

export default StatusSwitcherFieldTransformer;
