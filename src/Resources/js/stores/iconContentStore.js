// @flow

/**
 * Fetches a single icon's raw SVG content from Sulu core's own icon REST endpoint (the same one the
 * "single_icon_selection" picker overlay uses), for the form field's preview. Uses "search" so the response
 * stays small instead of loading the whole icon set just to preview one icon.
 */
class IconContentStore {
    cache: Map<string, ?string> = new Map();
    pending: Map<string, Promise<?string>> = new Map();

    key(iconSet: string, name: string): string {
        return iconSet + '::' + name;
    }

    load(iconSet: string, name: string): Promise<?string> {
        const key = this.key(iconSet, name);

        if (this.cache.has(key)) {
            return Promise.resolve(this.cache.get(key));
        }

        const pending = this.pending.get(key);
        if (pending) {
            return pending;
        }

        const url = '/admin/api/icons.json'
            + '?icon_set=' + encodeURIComponent(iconSet)
            + '&search=' + encodeURIComponent(name);

        const promise = fetch(url, {credentials: 'same-origin'})
            .then((response) => (response.ok ? response.json() : undefined))
            .then((data) => {
                const icons = (data && data._embedded && data._embedded.icons) || [];
                const match = icons.find((icon) => icon.id === name);
                const content = match ? match.content : undefined;

                this.cache.set(key, content);

                return content;
            })
            .catch(() => undefined)
            .finally(() => {
                this.pending.delete(key);
            });

        this.pending.set(key, promise);

        return promise;
    }
}

export default new IconContentStore();
