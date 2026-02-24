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

            let clickableHeader = el.parentElement;
            let gridSection = el.parentElement ? el.parentElement.parentElement : null;

            if (gridSection && !gridSection.dataset.collapsibleInit) {
                gridSection.classList.add('sulu-collapsible-section');
                gridSection.dataset.collapsibleInit = 'true';

                const routePart = window.location.hash ? window.location.hash.split(/[?:]/)[0].replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'global';
                const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                const storageKey = `sulu_collapsible_${routePart}_${safeTitle}`;
                const savedState = localStorage.getItem(storageKey);

                const isInitiallyClosed = initiallyClosedTitles.includes(title);
                const shouldBeClosed = savedState === 'closed' || (!savedState && isInitiallyClosed);

                if (shouldBeClosed) {
                    gridSection.classList.add('is-hidden');
                    gridSection.classList.add('is-closed');
                }

                if (clickableHeader) {
                    clickableHeader.classList.add('sulu-collapsible-header');

                    const iconWrapper = document.createElement('div');
                    iconWrapper.className = 'sulu-collapsible-icon-wrapper';

                    const iconEl = document.createElement('i');
                    iconEl.className = shouldBeClosed
                        ? 'su-hide sulu-collapsible-icon'
                        : 'su-eye sulu-collapsible-icon';
                    iconEl.setAttribute('aria-label', title);

                    iconWrapper.appendChild(iconEl);
                    el.appendChild(iconWrapper);

                    clickableHeader.addEventListener('click', (e) => {
                        const isHiddenOrClosed = gridSection.classList.contains('is-closed') || gridSection.classList.contains('is-hidden');

                        if (isHiddenOrClosed) {
                            gridSection.classList.remove('is-closed');
                            iconEl.className = 'su-eye sulu-collapsible-icon';

                            setTimeout(() => {
                                gridSection.classList.remove('is-hidden');
                            }, 20);

                            localStorage.setItem(storageKey, 'open');
                        } else {
                            gridSection.classList.add('is-hidden');
                            iconEl.className = 'su-hide sulu-collapsible-icon';

                            setTimeout(() => {
                                if (gridSection.classList.contains('is-hidden')) {
                                    gridSection.classList.add('is-closed');
                                }
                            }, 300);

                            localStorage.setItem(storageKey, 'closed');
                        }

                        e.stopPropagation();
                    });
                }
            }

            el = result.iterateNext();
        }
    });
}

const observer = new MutationObserver((mutations) => {
    let shouldCheck = false;
    for (const m of mutations) {
        if (m.addedNodes.length > 0) {
            shouldCheck = true;
            break;
        }
    }
    if (shouldCheck) {
        requestAnimationFrame(() => initSuluCollapsibleSections());
    }
});

observer.observe(document.body, { childList: true, subtree: true });
