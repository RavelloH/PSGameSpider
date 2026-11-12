/* Original PSGameSpider cover state adapter.
 * Uses additive event listeners; original zoomPics/imgLoad/imgError continue
 * to work unchanged. MutationObserver covers search and PJAX insertions.
 */
(() => {
    'use strict';
    const selector = '.square-img-box-img > img, .info-img > img';
    const seen = new WeakSet();

    function track(image) {
        if (seen.has(image)) return;
        const container = image.parentElement;
        if (!container) return;
        seen.add(image);

        function state(value) {
            container.dataset.coverState = value;
            container.setAttribute('aria-busy', value === 'pending' ? 'true' : 'false');
        }
        const update = () => {
            if (image.hasAttribute('error')) {
                state('error'); // Original imgError can swap to broke.jpg.
            } else if (image.complete) {
                state(image.naturalWidth > 0 ? 'loaded' : 'error');
            } else {
                state('pending');
            }
        };

        image.addEventListener('load', update);
        image.addEventListener('error', () => {
            // The original handler may redirect to an error image.
            state('error');
        });
        update();
    }

    function scan(root) {
        if (root.nodeType !== Node.ELEMENT_NODE) return;
        if (root.matches(selector)) track(root);
        root.querySelectorAll(selector).forEach(track);
    }

    scan(document.body);
    const observer = new MutationObserver(mutations => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) scan(node);
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
})();
