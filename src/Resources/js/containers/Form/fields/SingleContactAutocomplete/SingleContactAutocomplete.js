// @flow
import React from 'react';
import { action, computed, observable, reaction, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import debounce from 'debounce';
import SingleSelectionStore from 'sulu-admin-bundle/stores/SingleSelectionStore';
import SearchStore from 'sulu-admin-bundle/stores/SearchStore';
import userStore from 'sulu-admin-bundle/stores/userStore';
import { translate } from 'sulu-admin-bundle/utils/Translator';
import SingleListOverlay from 'sulu-admin-bundle/containers/SingleListOverlay';

import Icon from 'sulu-admin-bundle/components/Icon';
import Popover from 'sulu-admin-bundle/components/Popover';
import Overlay from 'sulu-admin-bundle/components/Overlay';
import Input from 'sulu-admin-bundle/components/Input';
import { Requester } from 'sulu-admin-bundle/services';
import styles from './singleContactAutocomplete.scss';

const DEBOUNCE_TIME = 300;
const MIN_SEARCH_LENGTH = 3;

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightText(text, query) {
    if (!query || !text) {
        return text;
    }

    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const parts = [];
    let lastIdx = 0;
    let idx = lowerText.indexOf(lowerQuery);
    let key = 0;

    while (idx !== -1) {
        if (idx > lastIdx) {
            parts.push(text.substring(lastIdx, idx));
        }
        parts.push(<strong key={key++}>{text.substring(idx, idx + query.length)}</strong>);
        lastIdx = idx + query.length;
        idx = lowerText.indexOf(lowerQuery, lastIdx);
    }

    if (lastIdx < text.length) {
        parts.push(text.substring(lastIdx));
    }

    return parts.length > 0 ? parts : text;
}

@observer
class SingleContactAutocomplete extends React.Component {
    autoCompleteSelectionStore;
    changeAutoCompleteSelectionDisposer;

    @observable searchStore;
    @observable isQuickCreateOpen = false;
    @observable isOverlayOpen = false;
    @observable displaySuggestions = false;

    @observable quickFirstName = '';
    @observable quickLastName = '';
    @observable quickPhone = '';
    @observable quickEmail = '';

    @observable isSaving = false;
    @observable.ref inputContainerRef;
    @observable searchQuery = '';

    constructor(props) {
        super(props);

        const { fieldTypeOptions } = this.props;

        const resourceKey = fieldTypeOptions?.resource_key || 'contacts';

        this.autoCompleteSelectionStore = new SingleSelectionStore(
            resourceKey,
            this.value,
            this.locale
        );

        const searchProperties = fieldTypeOptions?.search_properties
            || ['firstName', 'lastName', 'mainEmail', 'mainPhone'];

        this.searchStore = new SearchStore(
            resourceKey,
            searchProperties,
            {},
            this.locale
        );

        this.changeAutoCompleteSelectionDisposer = reaction(
            () => this.autoCompleteSelectionStore?.item,
            this.handleAutoCompleteSelectionChange
        );

        this.debouncedSearch = debounce(this.search, DEBOUNCE_TIME);
    }

    componentWillUnmount() {
        if (this.changeAutoCompleteSelectionDisposer) {
            this.changeAutoCompleteSelectionDisposer();
        }
        this.debouncedSearch.clear();
    }

    @computed get value() {
        return this.props.value;
    }

    @computed get locale() {
        return this.props.formInspector?.locale
            ? this.props.formInspector.locale
            : observable.box(userStore.contentLocale);
    }

    @computed get popoverMinWidth() {
        return this.inputContainerRef ? this.inputContainerRef.scrollWidth : 0;
    }

    @action handleAutoCompleteSelectionChange = (selectedItem) => {
        const newValue = selectedItem?.id;
        if (this.value !== newValue) {
            this.handleChange(newValue);
        }
    };

    handleChange = (value) => {
        const { onChange, onFinish } = this.props;

        onChange(value);
        if (onFinish) {
            onFinish();
        }
    };

    @action handleInputChange = (value) => {
        this.searchQuery = value || '';

        if (!value) {
            this.handleChange(undefined);
            this.autoCompleteSelectionStore.clear();
            this.searchStore.clearSearchResults();
            this.displaySuggestions = false;
        } else if (value.length >= MIN_SEARCH_LENGTH) {
            this.displaySuggestions = true;
            this.debouncedSearch(this.searchQuery);
        } else {
            this.displaySuggestions = false;
        }
    };

    @action search = (query) => {
        this.searchStore.search(query);
    };

    @action handleInputFocus = () => {
        if (this.searchQuery && this.searchQuery.length >= MIN_SEARCH_LENGTH) {
            this.displaySuggestions = true;
        }
    };

    @action handleHideSuggestions = () => {
        this.displaySuggestions = false;
    };

    @action handleSelectSuggestion = (contact) => {
        this.handleChange(contact.id);
        this.autoCompleteSelectionStore.set(contact);
        this.searchQuery = '';
        this.displaySuggestions = false;
    };

    @action handleClearSelection = () => {
        this.handleChange(undefined);
        this.autoCompleteSelectionStore.clear();
        this.searchQuery = '';
        this.searchStore.clearSearchResults();
    };

    @action handleOpenOverlay = () => {
        this.isOverlayOpen = true;
    };

    @action handleCloseOverlay = () => {
        this.isOverlayOpen = false;
    };

    @action handleOverlayConfirm = (item) => {
        this.handleChange(item.id);
        this.autoCompleteSelectionStore.set(item);
        this.searchQuery = '';
        this.isOverlayOpen = false;
    };

    @action handleOpenQuickCreate = () => {
        this.isQuickCreateOpen = true;
        this.displaySuggestions = false;

        const textToSplit = this.searchQuery || '';
        const queryParts = textToSplit.trim().split(' ');
        if (queryParts.length === 1) {
            this.quickLastName = queryParts[0];
        } else if (queryParts.length > 1) {
            this.quickFirstName = queryParts[0];
            this.quickLastName = queryParts.slice(1).join(' ');
        }
    };

    @action handleCloseQuickCreate = () => {
        this.isQuickCreateOpen = false;
        this.quickFirstName = '';
        this.quickLastName = '';
        this.quickPhone = '';
        this.quickEmail = '';
    };

    @action handleQuickFirstNameChange = (value) => {
        this.quickFirstName = value || '';
    };

    @action handleQuickLastNameChange = (value) => {
        this.quickLastName = value || '';
    };

    @action handleQuickPhoneChange = (value) => {
        this.quickPhone = value || '';
    };

    @action handleQuickEmailChange = (value) => {
        this.quickEmail = value || '';
    };

    @action handleSaveQuickCreate = async () => {
        this.isSaving = true;
        try {
            const payload = {
                firstName: this.quickFirstName,
                lastName: this.quickLastName,
                formOfAddress: 0,
            };

            const contactDetails = {};

            if (this.quickPhone) {
                contactDetails.phones = [{ phone: this.quickPhone, phoneType: 1 }];
            }

            if (this.quickEmail) {
                contactDetails.emails = [{ email: this.quickEmail, emailType: 1 }];
            }

            if (Object.keys(contactDetails).length > 0) {
                payload.contactDetails = contactDetails;
            }

            const resourceKey = this.props.fieldTypeOptions?.resource_key || 'contacts';
            const response = await Requester.post(`/admin/api/${resourceKey}`, payload);

            if (response && response.id) {
                runInAction(() => {
                    this.handleSelectSuggestion(response);
                    this.handleCloseQuickCreate();
                });
            }
        } catch (error) {
            console.error('Failed to create contact', error);
        } finally {
            runInAction(() => {
                this.isSaving = false;
            });
        }
    };

    @action handleSetInputRef = (ref) => {
        this.inputContainerRef = ref;
    };

    renderSuggestionItem = (contact) => {
        const { fieldTypeOptions } = this.props;
        const displayProperty = fieldTypeOptions?.display_property || 'fullName';
        const name = contact.fullName || contact[displayProperty] || '';

        return (
            <li
                key={contact.id}
                className={styles.suggestionItem}
                onClick={() => this.handleSelectSuggestion(contact)}
            >
                <div className={styles.suggestionName}>
                    {highlightText(name, this.searchQuery)}
                </div>
                {(contact.mainPhone || contact.mainEmail) && (
                    <div className={styles.suggestionSubInfo}>
                        {contact.mainPhone && (
                            <span className={styles.suggestionDetail}>
                                <Icon name="su-phone" />
                                <span>{highlightText(contact.mainPhone, this.searchQuery)}</span>
                            </span>
                        )}
                        {contact.mainEmail && (
                            <span className={styles.suggestionDetail}>
                                <Icon name="su-envelope" />
                                <span>{highlightText(contact.mainEmail, this.searchQuery)}</span>
                            </span>
                        )}
                    </div>
                )}
            </li>
        );
    };

    render() {
        const {
            disabled,
            error,
            fieldTypeOptions,
        } = this.props;

        const displayProperty = fieldTypeOptions?.display_property || 'fullName';
        const resourceKey = fieldTypeOptions?.resource_key || 'contacts';

        const selectedContact = this.autoCompleteSelectionStore.item;

        let displayValue = this.searchQuery;
        if (!this.displaySuggestions && selectedContact && !this.searchQuery) {
            displayValue = selectedContact.fullName
                || selectedContact[displayProperty]
                || ((selectedContact.firstName || '') + ' ' + (selectedContact.lastName || '')).trim()
                || '';
        }

        const isLoading = this.searchStore.loading || this.autoCompleteSelectionStore.loading;
        const hasClearableValue = !!(selectedContact || this.searchQuery);

        return (
            <div className={styles.container}>
                <div className={styles.inputRow} ref={this.handleSetInputRef}>
                    <Input
                        icon="su-user"
                        loading={isLoading}
                        onIconClick={this.handleOpenOverlay}
                        value={displayValue}
                        onChange={this.handleInputChange}
                        onFocus={this.handleInputFocus}
                        placeholder={translate('sulu_admin.list_search_placeholder')}
                        disabled={disabled}
                        valid={!error}
                        onClearClick={hasClearableValue ? this.handleClearSelection : undefined}
                    />

                    <span
                        className={styles.addButton + (error ? ' ' + styles.addButtonError : '')}
                        onClick={disabled ? undefined : this.handleOpenQuickCreate}
                        title={translate('sulu_admin_extras.create_new_contact')}
                        role="button"
                        tabIndex={disabled ? -1 : 0}
                    >
                        <Icon name="su-plus" />
                    </span>
                </div>

                <Popover
                    open={this.displaySuggestions && !!this.searchQuery}
                    anchorElement={this.inputContainerRef}
                    onClose={this.handleHideSuggestions}
                    verticalOffset={5}
                >
                    {(setPopoverRef, popoverStyle) => (
                        <div
                            ref={setPopoverRef}
                            style={{
                                ...popoverStyle,
                                minWidth: this.popoverMinWidth
                                    ? `${this.popoverMinWidth}px`
                                    : 'auto',
                            }}
                            className={styles.suggestionsContainer}
                        >
                            {this.searchStore.searchResults.length > 0 ? (
                                <ul className={styles.suggestionList}>
                                    {this.searchStore.searchResults.map(
                                        this.renderSuggestionItem
                                    )}
                                </ul>
                            ) : (
                                !isLoading && (
                                    <div className={styles.noResults}>
                                        {translate('sulu_admin_extras.no_contact_found')}
                                        <button
                                            type="button"
                                            className={styles.createLink}
                                            onClick={this.handleOpenQuickCreate}
                                        >
                                            {translate('sulu_admin_extras.create_new_contact')}
                                        </button>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </Popover>

                <Overlay
                    open={this.isQuickCreateOpen}
                    onClose={this.handleCloseQuickCreate}
                    onConfirm={this.handleSaveQuickCreate}
                    confirmDisabled={!this.quickLastName || !this.quickFirstName}
                    confirmLoading={this.isSaving}
                    confirmText={translate('sulu_admin.save')}
                    title={translate('sulu_admin_extras.create_new_contact')}
                    size="small"
                >
                    <div className={styles.quickCreateForm}>
                        <div className={styles.formField}>
                            <label className={styles.formLabel}>
                                {translate('sulu_contact.first_name')}
                                <span className={styles.formRequired}> *</span>
                            </label>
                            <Input
                                valid={true}
                                value={this.quickFirstName}
                                onChange={this.handleQuickFirstNameChange}
                            />
                        </div>
                        <div className={styles.formField}>
                            <label className={styles.formLabel}>
                                {translate('sulu_contact.last_name')}
                                <span className={styles.formRequired}> *</span>
                            </label>
                            <Input
                                valid={true}
                                value={this.quickLastName}
                                onChange={this.handleQuickLastNameChange}
                            />
                        </div>
                        <div className={styles.formField}>
                            <label className={styles.formLabel}>
                                {translate('sulu_contact.phone')}
                            </label>
                            <Input
                                valid={true}
                                value={this.quickPhone}
                                onChange={this.handleQuickPhoneChange}
                            />
                        </div>
                        <div className={styles.formField}>
                            <label className={styles.formLabel}>
                                {translate('sulu_contact.email')}
                            </label>
                            <Input
                                valid={true}
                                value={this.quickEmail}
                                onChange={this.handleQuickEmailChange}
                            />
                        </div>
                    </div>
                </Overlay>

                <SingleListOverlay
                    adapter="table"
                    listKey={resourceKey}
                    locale={this.locale}
                    onClose={this.handleCloseOverlay}
                    onConfirm={this.handleOverlayConfirm}
                    open={this.isOverlayOpen}
                    title={translate('sulu_admin_extras.contact_selection')}
                    resourceKey={resourceKey}
                />
            </div>
        );
    }
}

export default SingleContactAutocomplete;
