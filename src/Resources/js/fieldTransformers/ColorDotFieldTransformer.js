// @flow
import React from 'react';
import typeColorFieldTransformerStyles from './TypeColorFieldTransformer.scss';
import type { Node } from 'react';

class ColorDotFieldTransformer {
    transform(value: *, parameters: { [string]: any }): Node {
        const color = value || '#cccccc';
        const title = value || '';

        const style = {
            backgroundColor: color,
        };

        return (
            <div
                className={typeColorFieldTransformerStyles.typeDot}
                style={style}
                title={title}
            />
        );
    }
}

export default ColorDotFieldTransformer;