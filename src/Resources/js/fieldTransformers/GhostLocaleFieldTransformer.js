// @flow
import React from 'react';
import ghostLocaleFieldTransformerStyles from './GhostLocaleFieldTransformer.scss';
import type {Node} from 'react';

class GhostLocaleFieldTransformer {
    transform(value: *, parameters: {[string]: any}, context: Object): Node {
        const styles = ghostLocaleFieldTransformerStyles;

        const mobxValues = context?.$mobx?.values;
        const ghostLocale = mobxValues?.ghostLocale?.value ?? context?.ghostLocale ?? value;

        if (!ghostLocale) {
            return null;
        }

        return (
            <span className={styles.ghostIndicator}>
                {ghostLocale.toUpperCase()}
            </span>
        );
    }
}

export default GhostLocaleFieldTransformer;
