import { translate } from 'sulu-admin-bundle/utils';

const getCollapsibleSectionTitles = () => {
    let raw = [];
    if (window.suluAdminExtras && Array.isArray(window.suluAdminExtras.collapsibleSections)) {
        raw = window.suluAdminExtras.collapsibleSections;
    }
    return raw.map(title => (translate(title) || title).trim());
};

const getInitiallyClosedSectionTitles = () => {
    let raw = [];
    if (window.suluAdminExtras && Array.isArray(window.suluAdminExtras.initiallyClosedSections)) {
        raw = window.suluAdminExtras.initiallyClosedSections;
    }
    return raw.map(title => (translate(title) || title).trim());
};

const initializedSections = new WeakSet();

// Pending transition timers per section. A new state change always cancels the previous timer, so quick
// clicks or an automatic reveal can never leave a section half open or closed.
const timers = new WeakMap();

const HIDE_ANIMATION_MS = 300;

const cancelTimer = (section) => {
    window.clearTimeout(timers.get(section));
};

const setIcon = (section, closed) => {
    const icon = section.querySelector('.sulu-collapsible-icon');
    if (icon) {
        icon.className = closed ? 'su-hide sulu-collapsible-icon' : 'su-eye sulu-collapsible-icon';
    }

    const header = section.querySelector('.sulu-collapsible-header');
    if (header) {
        header.setAttribute('aria-expanded', closed ? 'false' : 'true');
    }
};

const openSection = (section) => {
    cancelTimer(section);
    section.classList.remove('is-closed');
    setIcon(section, false);

    // one tick later, so the browser can play the fade-in
    timers.set(section, window.setTimeout(() => section.classList.remove('is-hidden'), 20));
};

const closeSection = (section) => {
    cancelTimer(section);
    section.classList.add('is-hidden');
    setIcon(section, true);

    timers.set(section, window.setTimeout(() => section.classList.add('is-closed'), HIDE_ANIMATION_MS));
};

const isClosed = (section) => section.classList.contains('is-closed') || section.classList.contains('is-hidden');

function initSuluCollapsibleSections() {
    const titles = getCollapsibleSectionTitles();
    if (titles.length === 0) return;

    const initiallyClosedTitles = getInitiallyClosedSectionTitles();

    titles.forEach(title => {
        const xpath = `//text()[normalize-space(.)='${title}']/parent::*`;
        let result;
        try {
            result = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
        } catch (e) {
            return;
        }

        let el = result.iterateNext();
        while (el) {
            if (initializedSections.has(el)) {
                el = result.iterateNext();
                continue;
            }
            initializedSections.add(el);

            // Sulu renders a section as: section > divider container (item) > divider (holds the title text)
            const clickableHeader = el.parentElement;
            const gridSection = clickableHeader ? clickableHeader.parentElement : null;

            if (gridSection && !gridSection.dataset.collapsibleInit) {
                gridSection.classList.add('sulu-collapsible-section');
                gridSection.dataset.collapsibleInit = 'true';
                el.classList.add('sulu-collapsible-divider');

                const routePart = window.location.hash ? window.location.hash.split(/[?:]/)[0].replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'global';
                const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                const storageKey = `sulu_collapsible_${routePart}_${safeTitle}`;
                // The same title appears in every block of a page, so the state of a block section is not stored:
                // one click would open (or close) the section of all other blocks. Blocks always start as configured.
                const rememberChoice = gridSection.closest('[class*="block--"]') === null;
                const savedState = rememberChoice ? localStorage.getItem(storageKey) : null;

                const isInitiallyClosed = initiallyClosedTitles.includes(title);
                const shouldBeClosed = savedState === 'closed' || (!savedState && isInitiallyClosed);

                clickableHeader.classList.add('sulu-collapsible-header');
                clickableHeader.setAttribute('role', 'button');
                clickableHeader.setAttribute('tabindex', '0');

                const iconWrapper = document.createElement('div');
                iconWrapper.className = 'sulu-collapsible-icon-wrapper';

                const iconEl = document.createElement('i');
                iconEl.className = 'su-eye sulu-collapsible-icon';
                iconEl.setAttribute('aria-label', title);

                iconWrapper.appendChild(iconEl);
                el.appendChild(iconWrapper);

                const toggle = (e) => {
                    if (isClosed(gridSection)) {
                        openSection(gridSection);
                        if (rememberChoice) {
                            localStorage.setItem(storageKey, 'open');
                        }
                    } else {
                        closeSection(gridSection);
                        if (rememberChoice) {
                            localStorage.setItem(storageKey, 'closed');
                        }
                    }

                    e.stopPropagation();
                };

                clickableHeader.addEventListener('click', toggle);
                clickableHeader.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggle(e);
                    }
                });

                if (shouldBeClosed) {
                    gridSection.classList.add('is-hidden');
                    gridSection.classList.add('is-closed');
                }
                setIcon(gridSection, shouldBeClosed);
            }

            el = result.iterateNext();
        }
    });
}

// A collapsed section must never hide a validation error. Sulu always renders an (empty) error label below every
// field and fills it only when the field is invalid, so a section is revealed when one of its labels has text.
function hasVisibleError(section) {
    return Array.from(section.querySelectorAll('[class*="error-label"]'))
        .some(label => (label.textContent || '').trim() !== '');
}

function revealSectionsWithErrors() {
    document.querySelectorAll('.sulu-collapsible-section.is-closed').forEach(section => {
        if (hasVisibleError(section)) {
            // not stored: the user's own choice stays as it was, the section only opens for now
            openSection(section);
        }
    });
}

let checkScheduled = false;
let needsInit = false;

const observer = new MutationObserver((mutations) => {
    // scanning for new sections is only needed when nodes were added, the error check is cheap and always runs
    if (mutations.some(m => m.addedNodes && m.addedNodes.length > 0)) {
        needsInit = true;
    }

    if (checkScheduled) {
        return;
    }

    checkScheduled = true;
    requestAnimationFrame(() => {
        checkScheduled = false;

        if (needsInit) {
            needsInit = false;
            initSuluCollapsibleSections();
        }

        revealSectionsWithErrors();
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['class'],
});
