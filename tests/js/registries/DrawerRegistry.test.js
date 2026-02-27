// @flow
import DrawerRegistry from '../../../src/Resources/js/registries/DrawerRegistry/DrawerRegistry';

describe('DrawerRegistry', () => {
    let registry;

    beforeEach(() => {
        registry = new DrawerRegistry();
    });

    test('Should add and get a component', () => {
        const MockComponent = () => null;
        registry.add('test', MockComponent);

        expect(registry.get('test')).toBe(MockComponent);
    });

    test('Should throw when adding duplicate name', () => {
        const MockComponent = () => null;
        registry.add('duplicate', MockComponent);

        expect(() => registry.add('duplicate', MockComponent)).toThrow(
            'The drawer component "duplicate" has already been added.'
        );
    });

    test('Should throw when getting unknown name', () => {
        expect(() => registry.get('unknown')).toThrow(
            'The drawer component "unknown" has not been found.'
        );
    });

    test('Should store multiple components independently', () => {
        const CompA = () => null;
        const CompB = () => null;
        registry.add('a', CompA);
        registry.add('b', CompB);

        expect(registry.get('a')).toBe(CompA);
        expect(registry.get('b')).toBe(CompB);
    });
});
