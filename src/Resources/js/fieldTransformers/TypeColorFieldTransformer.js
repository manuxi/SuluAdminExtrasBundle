// @flow
import React from 'react';
import typeColorFieldTransformerStyles from './TypeColorFieldTransformer.scss';
import type { Node } from 'react';

/**
 * Displays a colored dot based on a color palette or backend context.
 *
 * Can work in two modes:
 * 1. Frontend-driven (Palette - Primary):
 *    The transformer looks up the color in a configured palette using the field value as key.
 *    <transformer type="type_color">
 *        <params>
 *            <param name="palette" value="event_types"/>
 *            <param name="show_name" value="true"/>
 *        </params>
 *    </transformer>
 *
 * 2. Backend-driven (Fallback):
 *    The backend provides 'typeColor' and 'typeName' fields in the list data.
 *    <transformer type="type_color" />
 */
class TypeColorFieldTransformer {
    config: Object;

    constructor(config: Object = {}) {
        this.config = {
            fallback_color: '#cccccc',
            palettes: {},
            ...config,
        };
    }

    transform(value: *, parameters: { [string]: any }, context: Object): Node {
        const safeParams = parameters || {};
        let color = this.config.fallback_color;
        let title = value || '';

        // Helper to get value from context (handles both MobX and plain objects)
        const getValue = (key: string): any => {
            if (!context) return undefined;
            if (context.$mobx?.values) {
                const mobxValue = context.$mobx.values[key];
                return mobxValue?.value !== undefined ? mobxValue.value : mobxValue;
            }
            return context[key];
        };

        // Get backend-enriched fields for fallback
        const typeColor = getValue('typeColor');
        const typeName = getValue('typeName');
        const typeRaw = getValue('typeRaw');

        // 1. Primary: Palette lookup if palette param is set
        if (safeParams.palette) {
            const palette = this.config.palettes[safeParams.palette];

            // Use typeRaw if available (raw key), otherwise use value
            const lookupKey = typeRaw || value;

            if (palette && lookupKey && palette[lookupKey]) {
                const paletteItem = palette[lookupKey];
                color = paletteItem.color || color;
                // Use typeName from backend if available, otherwise palette name, otherwise key
                title = typeName || paletteItem.name || lookupKey;
            }
        }

        // 2. Fallback: Backend enriched data (if no palette match)
        if (color === this.config.fallback_color) {
            if (typeColor) {
                color = typeColor;
            }
            if (typeName) {
                title = typeName;
            }
        }

        const style = {
            backgroundColor: color,
        };

        // XML params come as strings
        const showName = safeParams.show_name === true || safeParams.show_name === 'true';

        return (
            <>
                <span
                    className={typeColorFieldTransformerStyles.typeDot}
                    style={style}
                    title={title}
                ></span>
                {showName && (
                    <span className={typeColorFieldTransformerStyles.typeLabel}>{title}</span>
                )}
            </>
        );
    }
}

export default TypeColorFieldTransformer;