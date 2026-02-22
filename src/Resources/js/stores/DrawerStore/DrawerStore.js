// @flow
import { action, observable } from 'mobx';

class DrawerStore {
    @observable open: boolean = false;
    @observable view: ?string = null;
    @observable props: Object = {};

    @action
    openDrawer = (view: string, props: Object = {}) => {
        this.view = view;
        this.props = props;
        this.open = true;
    };

    @action
    closeDrawer = () => {
        this.open = false;
        // Optionally clear view/props here or on unmount, but often better to keep them 
        // until the close animation is done, so leaving them alone for now.
    };
}

export default DrawerStore;
