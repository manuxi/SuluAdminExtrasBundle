// @flow
jest.mock('sulu-admin-bundle/utils', () => ({
    translate: (key) => key,
}));

let observerCallback;
global.MutationObserver = jest.fn((callback) => {
    observerCallback = callback;

    return {observe: jest.fn(), disconnect: jest.fn()};
});

// Sulu renders a section as: section > divider container (item) > divider (holds the title text),
// followed by the field items. Every field has an error label that is empty until the field is invalid.
const buildSection = (title, {errorText = ''} = {}) => {
    const section = document.createElement('div');
    section.className = 'section--abc grid-section--def colSpan--ghi';
    section.innerHTML = `
        <div class="item--x dividerContainer--y"><div class="divider--z">${title}</div></div>
        <div class="item--x"><div class="field--a"><input /><div class="error-label--b">${errorText}</div></div></div>
    `;
    document.body.appendChild(section);

    return section;
};

const notifyDomChanged = () => {
    observerCallback([{addedNodes: [document.body]}]);
};

const load = () => {
    jest.isolateModules(() => {
        require('../../../src/Resources/js/utils/collapsibleSection');
    });
};

describe('collapsibleSection behavior', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        window.requestAnimationFrame = (callback) => callback(0);
        document.body.innerHTML = '';
        localStorage.clear();
        window.suluAdminExtras = {
            collapsibleSections: ['Formatierung'],
            initiallyClosedSections: ['Formatierung'],
        };
        load();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('adds the eye to the divider line and marks the section', () => {
        const section = buildSection('Formatierung');
        notifyDomChanged();

        expect(section).toHaveClass('sulu-collapsible-section');
        const divider = section.querySelector('.divider--z');
        expect(divider).toHaveClass('sulu-collapsible-divider');
        expect(divider.querySelector('.sulu-collapsible-icon-wrapper')).not.toBeNull();
        expect(section.querySelector('.dividerContainer--y')).toHaveClass('sulu-collapsible-header');
    });

    test('starts closed when the section is listed as initially closed', () => {
        const section = buildSection('Formatierung');
        notifyDomChanged();

        expect(section).toHaveClass('is-closed');
        expect(section).toHaveClass('is-hidden');
        expect(section.querySelector('.sulu-collapsible-icon')).toHaveClass('su-hide');
    });

    test('starts open when the section is not listed as initially closed', () => {
        window.suluAdminExtras.initiallyClosedSections = [];
        const section = buildSection('Formatierung');
        notifyDomChanged();

        expect(section).not.toHaveClass('is-closed');
        expect(section).not.toHaveClass('is-hidden');
    });

    test('the choice of the user wins over the initial state', () => {
        localStorage.setItem('sulu_collapsible_global_formatierung', 'open');
        const section = buildSection('Formatierung');
        notifyDomChanged();

        expect(section).not.toHaveClass('is-closed');
    });

    test('a click opens a closed section and a second click closes it again', () => {
        const section = buildSection('Formatierung');
        notifyDomChanged();
        const header = section.querySelector('.sulu-collapsible-header');

        header.click();
        expect(section).not.toHaveClass('is-closed');
        jest.advanceTimersByTime(50);
        expect(section).not.toHaveClass('is-hidden');
        expect(localStorage.getItem('sulu_collapsible_global_formatierung')).toBe('open');

        header.click();
        expect(section).toHaveClass('is-hidden');
        jest.advanceTimersByTime(400);
        expect(section).toHaveClass('is-closed');
        expect(localStorage.getItem('sulu_collapsible_global_formatierung')).toBe('closed');
    });

    test('a section inside a block ignores and does not store the choice', () => {
        localStorage.setItem('sulu_collapsible_global_formatierung', 'open');
        const block = document.createElement('div');
        block.className = 'block--abc';
        document.body.appendChild(block);
        const section = buildSection('Formatierung');
        block.appendChild(section);
        notifyDomChanged();

        expect(section).toHaveClass('is-closed');

        section.querySelector('.sulu-collapsible-header').click();
        jest.advanceTimersByTime(50);
        expect(section).not.toHaveClass('is-closed');
        expect(localStorage.getItem('sulu_collapsible_global_formatierung')).toBe('open');

        section.querySelector('.sulu-collapsible-header').click();
        jest.advanceTimersByTime(400);
        // still the value from before, the block did not write anything
        expect(localStorage.getItem('sulu_collapsible_global_formatierung')).toBe('open');
    });

    test('scanning the DOM again does not attach a second click handler', () => {
        const section = buildSection('Formatierung');
        notifyDomChanged();
        notifyDomChanged();
        notifyDomChanged();

        section.querySelector('.sulu-collapsible-header').click();
        jest.advanceTimersByTime(400);

        // one click on a closed section must leave it open, not flicker back
        expect(section).not.toHaveClass('is-closed');
        expect(section).not.toHaveClass('is-hidden');
    });

    test('an empty error label does not reopen a closed section', () => {
        const section = buildSection('Formatierung');
        notifyDomChanged();
        notifyDomChanged();
        jest.advanceTimersByTime(400);

        expect(section).toHaveClass('is-closed');
    });

    test('a closed section opens when a field inside has an error', () => {
        const section = buildSection('Formatierung', {errorText: 'Dieses Feld darf nicht leer sein'});
        notifyDomChanged();
        jest.advanceTimersByTime(400);

        expect(section).not.toHaveClass('is-closed');
        expect(section).not.toHaveClass('is-hidden');
        // the choice of the user is not overwritten
        expect(localStorage.getItem('sulu_collapsible_global_formatierung')).toBeNull();
    });

    test('an error that appears later opens the section', () => {
        const section = buildSection('Formatierung');
        notifyDomChanged();
        expect(section).toHaveClass('is-closed');

        section.querySelector('.error-label--b').textContent = 'Bitte auswählen';
        observerCallback([{addedNodes: []}]);
        jest.advanceTimersByTime(400);

        expect(section).not.toHaveClass('is-closed');
    });
});
