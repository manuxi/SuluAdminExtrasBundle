// @flow
import { translate } from 'sulu-admin-bundle/utils';
import AbstractFormToolbarAction from 'sulu-admin-bundle/views/Form/toolbarActions/AbstractFormToolbarAction';

export default class AddNewToolbarAction extends AbstractFormToolbarAction {
    getToolbarItemConfig() {
        return {
            label: translate('sulu_admin_extras.new'),
            icon: 'su-plus-circle',
            type: 'button',
            onClick: () => {
                const { route, passDate } = this.options;
                if (!route) {
                    throw new Error('The "route" option must be set for the "sulu_admin_extras.add_new" toolbar action.');
                }

                const attributes = {};

                if (passDate) {
                    const today = new Date();
                    const year = today.getFullYear();
                    const month = String(today.getMonth() + 1).padStart(2, '0');
                    const day = String(today.getDate()).padStart(2, '0');
                    attributes.date = `${year}-${month}-${day}`;
                }

                // Keep the locale if it exists
                if (this.router.attributes.locale) {
                    attributes.locale = this.router.attributes.locale;
                }

                this.router.navigate(route, attributes);
            }
        };
    }
}
