// @flow
import React from 'react';
import typeColorFieldTransformerStyles from './TypeColorFieldTransformer.scss';
import type {Node} from 'react';

/**
 * Displays a colored dot based on typeColor and typeName from backend context.
 * 
 * The backend must provide 'typeColor' and 'typeName' fields in the list data.
 * This is typically done via DoctrineListRepresentationFactory.addColorsToListElements()
 * using ColorPaletteProvider.getColor() and getColorName().
 * 
 * Usage in list XML:
 * <transformer type="type_color" />
 * 
 * Required backend fields:
 * - typeColor: hex color code (e.g., "#0d6efd")
 * - typeName: translated display name (e.g., "Workshop")
 */
class TypeColorFieldTransformer {
    config: Object;

    constructor(config: Object = {}) {
        this.config = {
            fallback_color: '#cccccc',
            ...config,
        };
    }

    transform(value: *, parameters: {[string]: any}, context: Object): Node {
        const styles = typeColorFieldTransformerStyles;
        const mobxValues = context?.$mobx?.values;

        // Get color and name from backend-enriched context
        const color = mobxValues?.typeColor?.value || this.config.fallback_color;
        const title = mobxValues?.typeName?.value || value || '';

        const style = {
            backgroundColor: color,
        };

        return (
            <div 
                className={styles.typeDot} 
                style={style} 
                title={title} 
            />
        );
    }
}

export default TypeColorFieldTransformer;
