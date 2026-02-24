import { translate } from 'sulu-admin-bundle/utils';

const getCollapsibleSectionTitles = () => {
    let raw = [];
    if (window.suluAdminExtras && Array.isArray(window.suluAdminExtras.collapsibleSections)) {
        raw = window.suluAdminExtras.collapsibleSections;
    }
    return raw.map(title => (translate(title) || title).trim());
};

const initializedSections = new WeakSet();

function initSuluCollapsibleSections() {
    const titles = getCollapsibleSectionTitles();
    if (titles.length === 0) return;

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

                if (clickableHeader) {
                    clickableHeader.classList.add('sulu-collapsible-header');

                    const iconWrapper = document.createElement('div');
                    iconWrapper.className = 'sulu-collapsible-icon-wrapper';

                    const iconEl = document.createElement('i');
                    iconEl.className = 'su-eye sulu-collapsible-icon';
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
                        } else {
                            gridSection.classList.add('is-hidden');
                            iconEl.className = 'su-hide sulu-collapsible-icon';

                            setTimeout(() => {
                                if (gridSection.classList.contains('is-hidden')) {
                                    gridSection.classList.add('is-closed');
                                }
                            }, 300);
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
