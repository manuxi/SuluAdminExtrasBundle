// @flow
import React from 'react';
import type { Node } from 'react';
import styles from './drawer.scss';

type Props = {
    children: Node,
    onClose?: () => void,
};

export default class Header extends React.Component<Props> {
    render() {
        const { children, onClose } = this.props;

        return (
            <div className={styles.header}>
                {children}

                {onClose && (
                    <button
                        className={styles.closeButton}
                        onClick={onClose}
                        title="Schließen"
                    >
                        {'\u00D7'}
                    </button>
                )}
            </div>
        );
    }
}
