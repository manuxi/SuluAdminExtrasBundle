// @flow
import React from 'react';
import {observer} from 'mobx-react';
import {action, autorun, comparer, computed, observable, reaction, toJS} from 'mobx';
import userStore from 'sulu-admin-bundle/stores/userStore';
import SingleSelectionStore from 'sulu-admin-bundle/stores/SingleSelectionStore';
import {Loader, Icon} from 'sulu-admin-bundle/components';
import {translate} from 'sulu-admin-bundle/utils/Translator';
import MediaSelectionOverlay from 'sulu-media-bundle/containers/MediaSelectionOverlay';
import type {FieldTypeProps} from 'sulu-admin-bundle/types';
import type {IObservableValue} from 'mobx/lib/mobx';
import mediaPickerStyles from './mediaPicker.scss';

/**
 * Replacement for "single_media_upload": that field only shows a preview right after uploading, because it
 * expects the form to hand it an already-resolved media object. On reopening a saved article it only gets
 * "{id}" back and shows empty (see docs/media_picker.md). This field fetches the media by id itself (like
 * "single_media_selection" already does) and additionally lets the editor click the preview to pick an
 * existing file from the media library instead of only uploading a new one.
 *
 * Value shape: {id: ?number, displayOption: ?string} - the same as "single_media_selection", so a template can
 * switch between the two types without a data migration.
 *
 * Params (all optional): "image_size" (thumbnail format to fetch, default "sulu-400x400"), "empty_icon"
 * (icon name shown when empty, default "su-image"), "collection_id" (numeric id or "expression" param,
 * e.g. via a system collection - opens the overlay in that folder instead of the media root).
 */

const MEDIA_RESOURCE_KEY = 'media';
const DEFAULT_THUMBNAIL_SIZE = 'sulu-400x400';
const DEFAULT_EMPTY_ICON = 'su-image';

type Value = {
    displayOption?: ?string,
    id: ?number,
};

@observer
class MediaPicker extends React.Component<FieldTypeProps<Value>> {
    store: SingleSelectionStore<number, Object>;
    changeDisposer: () => void;
    excludedIdsDisposer: () => void;
    mediaSelectionDisposer: () => void;

    collectionId: IObservableValue<?string | number>;
    mediaListStore: Object;
    collectionListStore: Object;

    @observable overlayOpen: boolean = false;

    constructor(props: FieldTypeProps<Value>) {
        super(props);

        const {formInspector, schemaOptions, value} = this.props;
        const locale = formInspector.locale ? formInspector.locale : observable.box(userStore.contentLocale);
        const id = value && typeof value === 'object' ? value.id : undefined;

        this.store = new SingleSelectionStore(MEDIA_RESOURCE_KEY, id, locale);
        this.changeDisposer = reaction(
            () => (this.store.item ? this.store.item.id : undefined),
            (loadedId: ?number) => {
                const {onChange, value} = this.props;
                const currentId = value && typeof value === 'object' ? value.id : undefined;

                if (currentId !== loadedId) {
                    onChange({...value, id: loadedId});
                }
            }
        );

        const {value: mediaTypes} = schemaOptions?.types || {};
        const {value: initialCollectionId} = schemaOptions?.collection_id || {};
        const excludedIds = computed(
            () => (this.store.item ? [this.store.item.id] : []),
            {equals: comparer.structural}
        );

        this.collectionId = observable.box(initialCollectionId ?? undefined);
        this.mediaListStore = MediaSelectionOverlay.createMediaListStore(
            this.collectionId,
            excludedIds,
            locale,
            mediaTypes ? toJS(mediaTypes) : []
        );
        this.collectionListStore = MediaSelectionOverlay.createCollectionListStore(this.collectionId, locale);
        this.excludedIdsDisposer = excludedIds.observe(() => this.mediaListStore.clear());

        // the overlay's list is built for multi-selection; keep only the last click when more than one is selected
        this.mediaSelectionDisposer = autorun(() => {
            const {selections} = this.mediaListStore;

            if (selections.length <= 1) {
                return;
            }

            const selection = selections[selections.length - 1];
            this.mediaListStore.clearSelection();
            this.mediaListStore.select(selection);
        });
    }

    componentDidUpdate(prevProps: FieldTypeProps<Value>) {
        const newId = toJS(this.props.value && this.props.value.id);
        const oldId = toJS(prevProps.value && prevProps.value.id);
        const loadedId = this.store.item ? this.store.item.id : undefined;

        if (oldId !== newId && loadedId !== newId) {
            this.store.loadItem(newId);
        }
    }

    componentWillUnmount() {
        this.changeDisposer();
        this.excludedIdsDisposer();
        this.mediaSelectionDisposer();
        this.mediaListStore.destroy();
        this.collectionListStore.destroy();
    }

    @action openOverlay = () => {
        if (this.props.disabled) {
            return;
        }

        this.overlayOpen = true;
    };

    @action closeOverlay = () => {
        this.overlayOpen = false;
    };

    handleRemove = (event: SyntheticEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        this.store.clear();
    };

    handleOverlayConfirm = () => {
        const [selectedMedia] = this.mediaListStore.selections;

        if (selectedMedia) {
            this.store.set(selectedMedia);
        }

        this.closeOverlay();
    };

    render() {
        const {disabled, error, schemaOptions} = this.props;
        const {value: thumbnailSize} = schemaOptions?.image_size || {};
        const {value: emptyIcon} = schemaOptions?.empty_icon || {};
        const {item: media, loading} = this.store;
        const thumbnail = media && media.thumbnails && media.thumbnails[thumbnailSize || DEFAULT_THUMBNAIL_SIZE];

        return (
            <div className={mediaPickerStyles.container}>
                <div
                    className={[
                        mediaPickerStyles.preview,
                        media ? mediaPickerStyles.filled : mediaPickerStyles.empty,
                        error ? mediaPickerStyles.error : '',
                        disabled ? mediaPickerStyles.disabled : '',
                    ].join(' ').trim()}
                    onClick={this.openOverlay}
                    role="button"
                    tabIndex={disabled ? -1 : 0}
                >
                    {loading &&
                        <div className={mediaPickerStyles.loader}><Loader size={32} /></div>
                    }
                    {!loading && thumbnail &&
                        <img alt={media.title} className={mediaPickerStyles.image} src={thumbnail} />
                    }
                    {!loading && media && !thumbnail &&
                        <div className={mediaPickerStyles.fileName}>{media.title}</div>
                    }
                    {!loading && !media &&
                        <div className={mediaPickerStyles.placeholder}>
                            <Icon name={emptyIcon || DEFAULT_EMPTY_ICON} />
                            <span>{translate('sulu_admin_extras.media_picker.select')}</span>
                        </div>
                    }
                    {!loading && media && !disabled &&
                        <button
                            className={mediaPickerStyles.remove}
                            onClick={this.handleRemove}
                            type="button"
                        >
                            <Icon name="su-trash-alt" />
                        </button>
                    }
                </div>
                <MediaSelectionOverlay
                    collectionId={this.collectionId}
                    collectionListStore={this.collectionListStore}
                    locale={this.store.locale}
                    mediaListStore={this.mediaListStore}
                    onClose={this.closeOverlay}
                    onConfirm={this.handleOverlayConfirm}
                    open={this.overlayOpen}
                />
            </div>
        );
    }
}

export default MediaPicker;
