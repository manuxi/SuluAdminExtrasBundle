// @flow
import {observer} from 'mobx-react';
import React from 'react';
import FlatStructureStrategy from 'sulu-admin-bundle/containers/List/structureStrategies/FlatStructureStrategy';
import DefaultLoadingStrategy from 'sulu-admin-bundle/containers/List/loadingStrategies/DefaultLoadingStrategy';
import AbstractAdapter from 'sulu-admin-bundle/containers/List/adapters/AbstractAdapter';
import IconTile from '../../components/IconTile/IconTile';
import iconAdapterStyles from './iconAdapter.scss';

/**
 * Overrides Sulu core's own "icon" list adapter (used by the single_icon_selection picker overlay, registered
 * under the same key, see src/Resources/js/index.js): same data/search/pagination, a tidier grid of fixed-size
 * tiles instead of core's IconAdapter/IconCard (flex-wrap cards with a variable-height title).
 */
@observer
class IconAdapter extends AbstractAdapter {
    static LoadingStrategy = DefaultLoadingStrategy;

    static StructureStrategy = FlatStructureStrategy;

    static icon = 'su-th-large';

    handleClick = (iconId: string) => {
        const {onItemSelectionChange} = this.props;

        if (onItemSelectionChange) {
            onItemSelectionChange(iconId, !this.props.selections.includes(iconId));
        }
    };

    render() {
        const {data, selections} = this.props;

        return (
            <div className={iconAdapterStyles.grid}>
                {data.map((icon) => (
                    <IconTile
                        content={icon.content}
                        id={icon.id}
                        isSelected={selections.includes(icon.id)}
                        key={icon.id}
                        onClick={this.handleClick}
                    />
                ))}
            </div>
        );
    }
}

export default IconAdapter;
