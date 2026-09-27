// @flow
import React from 'react';
import {observer} from 'mobx-react';
import {computed, observable} from 'mobx';
import {Icon} from 'sulu-admin-bundle/components';
import SingleItemSelection from 'sulu-admin-bundle/components/SingleItemSelection';
import SingleListOverlay from 'sulu-admin-bundle/containers/SingleListOverlay';
import userStore from 'sulu-admin-bundle/stores/userStore';
import {translate} from 'sulu-admin-bundle/utils/Translator';
import type {FieldTypeProps} from 'sulu-admin-bundle/types';
import type {IObservableValue} from 'mobx/lib/mobx';
import iconContentStore from '../../../stores/iconContentStore';
import styles from './iconSelection.scss';

type Props = FieldTypeProps<?string>;

type State = {
    content: ?string,
    loading: boolean,
    overlayOpen: boolean,
};

/**
 * Overrides Sulu core's own "single_icon_selection" field (registered under the same key, see
 * src/Resources/js/index.js) to add a real icon preview - core's version only shows the stored id as
 * plain text. The picker overlay (search, grid, REST loading) stays Sulu's own SingleListOverlay/IconAdapter,
 * only the field itself and the icon adapter's tile rendering (see IconAdapter.js) are replaced.
 */
@observer
class IconSelection extends React.Component<Props, State> {
    state: State = {
        content: undefined,
        loading: false,
        overlayOpen: false,
    };

    @computed get locale(): IObservableValue<string> {
        const {formInspector} = this.props;

        return formInspector.locale ? formInspector.locale : observable.box(userStore.contentLocale);
    }

    get iconSet(): ?string {
        const {value: iconSet} = this.props.schemaOptions?.icon_set || {};

        return typeof iconSet === 'string' && iconSet ? iconSet : undefined;
    }

    componentDidMount() {
        this.loadPreview();
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.value !== this.props.value) {
            this.loadPreview();
        }
    }

    loadPreview() {
        const {value} = this.props;
        const {iconSet} = this;

        if (!value || !iconSet) {
            this.setState({content: undefined});
            return;
        }

        this.setState({loading: true});
        iconContentStore.load(iconSet, value).then((content) => {
            this.setState({content, loading: false});
        });
    }

    openOverlay = () => {
        if (this.props.disabled || !this.iconSet) {
            return;
        }

        this.setState({overlayOpen: true});
    };

    closeOverlay = () => {
        this.setState({overlayOpen: false});
    };

    handleRemove = () => {
        const {onChange, onFinish} = this.props;

        onChange(undefined);
        onFinish();
    };

    handleOverlayConfirm = (item: {id: string}) => {
        const {onChange, onFinish} = this.props;

        onChange(item.id);
        onFinish();
        this.closeOverlay();
    };

    render() {
        const {disabled, error, value} = this.props;
        const {iconSet} = this;
        const {content, loading, overlayOpen} = this.state;

        return (
            <React.Fragment>
                <SingleItemSelection
                    disabled={!!disabled}
                    emptyText={translate('sulu_admin.single_icon_selection.select')}
                    leftButton={{
                        icon: 'su-th-large',
                        onClick: this.openOverlay,
                    }}
                    onRemove={value ? this.handleRemove : undefined}
                    valid={!error}
                >
                    {value &&
                        <div className={styles.iconItem}>
                            {content &&
                                <span className={styles.icon} dangerouslySetInnerHTML={{__html: content}} />
                            }
                            {!content && loading &&
                                <Icon className={styles.icon} name="su-process" />
                            }
                            {!content && !loading &&
                                <Icon className={styles.icon} name="su-exclamation-triangle" />
                            }
                            <div className={styles.name}>{value}</div>
                        </div>
                    }
                </SingleItemSelection>
                {iconSet &&
                    <SingleListOverlay
                        adapter="icon"
                        listKey="icons"
                        locale={this.locale}
                        onClose={this.closeOverlay}
                        onConfirm={this.handleOverlayConfirm}
                        open={overlayOpen}
                        options={{'icon_set': iconSet}}
                        preSelectedItem={value ? {'id': value} : undefined}
                        resourceKey="icons"
                        title={translate('sulu_admin.single_icon_selection.select')}
                    />
                }
            </React.Fragment>
        );
    }
}

export default IconSelection;
