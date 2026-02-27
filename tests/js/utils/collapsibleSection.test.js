// @flow
jest.mock('sulu-admin-bundle/utils', () => ({
    translate: (key) => key,
}));

// Prevent the module from auto-initializing the MutationObserver
// by mocking MutationObserver before import
const mockObserve = jest.fn();
const mockDisconnect = jest.fn();
global.MutationObserver = jest.fn(() => ({
    observe: mockObserve,
    disconnect: mockDisconnect,
}));

describe('collapsibleSection', () => {
    beforeEach(() => {
        window.suluAdminExtras = undefined;
        jest.clearAllMocks();
    });

    test('Should create a MutationObserver on import', () => {
        jest.isolateModules(() => {
            require('../../../src/Resources/js/utils/collapsibleSection');
        });

        expect(global.MutationObserver).toHaveBeenCalledTimes(1);
        expect(mockObserve).toHaveBeenCalledWith(
            document.body,
            expect.objectContaining({childList: true, subtree: true})
        );
    });

    test('Should pass callback function to MutationObserver', () => {
        jest.isolateModules(() => {
            require('../../../src/Resources/js/utils/collapsibleSection');
        });

        const callback = global.MutationObserver.mock.calls[0][0];
        expect(typeof callback).toBe('function');
    });

    test('MutationObserver callback should handle empty mutations', () => {
        jest.isolateModules(() => {
            require('../../../src/Resources/js/utils/collapsibleSection');
        });

        const callback = global.MutationObserver.mock.calls[0][0];

        // Should not throw
        expect(() => callback([])).not.toThrow();
        expect(() => callback([{addedNodes: []}])).not.toThrow();
    });
});
