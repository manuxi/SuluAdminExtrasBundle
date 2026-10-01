// @flow
import blockPreviewTransformerRegistry from 'sulu-admin-bundle/containers/FieldBlocks/registries/blockPreviewTransformerRegistry';
import SingleSelectionBlockPreviewTransformer from './SingleSelectionBlockPreviewTransformer';
import SelectionBlockPreviewTransformer from './SelectionBlockPreviewTransformer';
import BlockListBlockPreviewTransformer from './BlockListBlockPreviewTransformer';
import LinkBlockPreviewTransformer from './LinkBlockPreviewTransformer';

const PREFIX = 'sulu_admin_extras.block_preview_';

// Sulu core only previews text, select, date, smart content and media fields in collapsed blocks. Anything else
// carrying a "sulu.block_preview" tag was silently ignored; these transformers close that gap. Existing keys are
// never replaced, so a future core transformer wins.
export default function registerBlockPreviewTransformers() {
    const transformers = {
        block: new BlockListBlockPreviewTransformer(),
        link: new LinkBlockPreviewTransformer(),

        single_account_selection: new SingleSelectionBlockPreviewTransformer(PREFIX + 'account'),
        single_contact_selection: new SingleSelectionBlockPreviewTransformer(PREFIX + 'contact'),
        single_snippet_selection: new SingleSelectionBlockPreviewTransformer(PREFIX + 'snippet'),
        single_form_selection: new SingleSelectionBlockPreviewTransformer(PREFIX + 'form'),

        account_selection: new SelectionBlockPreviewTransformer(PREFIX + 'accounts'),
        contact_account_selection: new SelectionBlockPreviewTransformer(PREFIX + 'persons'),
        snippet_selection: new SelectionBlockPreviewTransformer(PREFIX + 'snippets'),
        page_selection: new SelectionBlockPreviewTransformer(PREFIX + 'pages'),
        article_selection: new SelectionBlockPreviewTransformer(PREFIX + 'articles'),
        event_selection: new SelectionBlockPreviewTransformer(PREFIX + 'events'),
        testimonial_selection: new SelectionBlockPreviewTransformer(PREFIX + 'testimonials'),
        teaser_selection: new SelectionBlockPreviewTransformer(PREFIX + 'teasers'),
    };

    Object.keys(transformers).forEach((type) => {
        if (!blockPreviewTransformerRegistry.has(type)) {
            blockPreviewTransformerRegistry.add(type, transformers[type]);
        }
    });
}
