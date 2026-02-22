// @flow
import React from 'react';
import ReactDOM from 'react-dom';
import { observer } from 'mobx-react';
import drawerStore from '../../stores/DrawerStore';
import drawerRegistry from '../../registries/DrawerRegistry';
import styles from './drawer.scss';
import Header from './Header';

@observer
class Drawer extends React.Component<{}> {
    static Header = Header;

    render() {
        // Avoid rendering if document.body is not ready
        if (!document.body) return null;

        const { open, view, props } = drawerStore;

        const drawerAnimClasses = [styles.drawer];
        if (open) drawerAnimClasses.push(styles.drawerOpen);

        const backdropClasses = [styles.backdrop];
        if (open) backdropClasses.push(styles.backdropVisible);

        let ViewComponent = null;
        if (view) {
            try {
                ViewComponent = drawerRegistry.get(view);
            } catch (e) {
                // Component not found in registry
                console.error(e);
            }
        }

        const drawer = (
            <div>
                <div
                    className={backdropClasses.join(' ')}
                    onClick={() => drawerStore.closeDrawer()}
                />
                <div className={drawerAnimClasses.join(' ')}>
                    {ViewComponent && (
                        <ViewComponent {...props} onClose={drawerStore.closeDrawer} open={open} />
                    )}
                </div>
            </div>
        );

        return ReactDOM.createPortal(drawer, document.body);
    }
}

export default Drawer;
