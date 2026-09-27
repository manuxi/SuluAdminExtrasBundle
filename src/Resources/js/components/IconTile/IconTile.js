// @flow
import React from 'react';
import classNames from 'classnames';
import iconTileStyles from './iconTile.scss';

type Props = {
    content: string,
    id: string,
    isSelected: boolean,
    onClick?: (id: string) => void,
};

/**
 * Replacement for Sulu core's IconCard (see IconAdapter.js): fixed-size grid tile instead of a flex-wrap card
 * with a variable-height title, so a few thousand icons line up cleanly instead of looking ragged.
 */
export default class IconTile extends React.PureComponent<Props> {
    handleClick = () => {
        if (this.props.onClick) {
            this.props.onClick(this.props.id);
        }
    };

    render() {
        const {id, content, isSelected} = this.props;

        return (
            <div
                className={classNames(iconTileStyles.tile, {[iconTileStyles.selected]: isSelected})}
                onClick={this.handleClick}
                role="button"
                tabIndex="0"
                title={id}
            >
                <span className={iconTileStyles.icon} dangerouslySetInnerHTML={{__html: content}} />
                <span className={iconTileStyles.name}>{id}</span>
            </div>
        );
    }
}
