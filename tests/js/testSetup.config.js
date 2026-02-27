// @flow
import {configure} from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import '@testing-library/jest-dom';

configure({adapter: new Adapter()});

// Suppress known harmless warnings from cluttering test output.
const SUPPRESSED = [
    'has already been declared as an observer component',
    'reactive render of an observer class component',
    'You provided a `value` prop to a form field without an `onChange` handler',
    'Since strict-mode is enabled, changing (observed) observable values without using an action',
    'has not been found',
];

const shouldSuppress = (args) => {
    const raw = args[0];
    const msg = typeof raw === 'string' ? raw : (raw && raw.message ? raw.message : String(raw || ''));
    return SUPPRESSED.some((s) => msg.includes(s));
};

// Apply immediately (for warnings triggered during module import)
const _origWarn = console.warn.bind(console);
const _origError = console.error.bind(console);

console.warn = (...args) => {
    if (!shouldSuppress(args)) _origWarn(...args);
};
console.error = (...args) => {
    if (!shouldSuppress(args)) _origError(...args);
};

// Re-apply after each clearMocks cycle
beforeEach(() => {
    if (console.warn.name !== 'filteredWarn') {
        const prevWarn = console.warn.bind(console);
        const prevError = console.error.bind(console);

        console.warn = function filteredWarn(...args) {
            if (!shouldSuppress(args)) prevWarn(...args);
        };
        console.error = function filteredError(...args) {
            if (!shouldSuppress(args)) prevError(...args);
        };
    }
});
