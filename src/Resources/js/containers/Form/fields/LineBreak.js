// @flow
import React from 'react';
import gridStyles from 'sulu-admin-bundle/components/Form/grid.scss';
import type {FieldTypeProps} from 'sulu-admin-bundle/types';
import lineBreakStyles from './lineBreak.scss';

/**
 * Starts a new row in the form: the grid of the admin floats its fields to the left, so a field that clears the
 * floats before it (and has no height of its own) pushes the following fields below everything above it.
 * The field renders nothing itself; it marks the grid item it sits in.
 */
export default class LineBreak extends React.Component<FieldTypeProps<void>> {
    marker: ?HTMLElement;

    gridItem: ?Element;

    setMarker = (marker: ?HTMLElement) => {
        this.marker = marker;
    };

    componentDidMount() {
        this.gridItem = this.marker ? this.marker.closest('.' + gridStyles.gridItem) : null;

        if (this.gridItem) {
            this.gridItem.classList.add(lineBreakStyles.lineBreakItem);
        }
    }

    componentWillUnmount() {
        if (this.gridItem) {
            this.gridItem.classList.remove(lineBreakStyles.lineBreakItem);
        }
    }

    render() {
        return <span ref={this.setMarker} />;
    }
}
