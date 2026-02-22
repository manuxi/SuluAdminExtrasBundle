// @flow
import type { ComponentType } from 'react';

class DrawerRegistry {
    components: { [string]: ComponentType<*> } = {};

    add(name: string, Component: ComponentType<*>) {
        if (name in this.components) {
            throw new Error(`The drawer component "${name}" has already been added.`);
        }
        this.components[name] = Component;
    }

    get(name: string): ComponentType<*> {
        if (!(name in this.components)) {
            throw new Error(`The drawer component "${name}" has not been found.`);
        }
        return this.components[name];
    }
}

export default DrawerRegistry;
