// src/index.ts
//
// This “entry” point is what users will import in order to
// register *all* of Web Components in one go.
//

import { defineBitRainColumn } from './bit-rain-column';
import { defineMatrixxCanvas } from './matrixx-canvas';

// Public attribute typings (string | number unions are friendly to HTML)
export type MatrixxCanvasAttributes = {
    'rain-display'?: 'riverflow' | 'waterfall' | 'charamask';
    direction?: 'up' | 'down';
    density?: number | `${number}`;
    'cell-size'?: number | `${number}`;
    speed?: number | `${number}`;
    'tail-min'?: number | `${number}`;
    'tail-max'?: number | `${number}`;
    'bits-color'?: string;
    limit?: boolean | 'true' | 'false';
};

export function defineMatrixx(tag = 'matrixx-canvas') {
    // SSR guard
    if (typeof window === 'undefined' || typeof customElements === 'undefined') return;

    // Defines
    defineBitRainColumn();
    defineMatrixxCanvas();
}

export { };

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'matrixx-canvas': {
                'rain-display'?: 'riverflow' | 'waterfall' | 'charamask';
                direction?: 'up' | 'down';
                density?: number | `${number}`;
                'cell-size'?: number | `${number}`;
                speed?: number | `${number}`;
                'tail-min'?: number | `${number}`;
                'tail-max'?: number | `${number}`;
                'bits-color'?: string;
                limit?: boolean | 'true' | 'false';
                [k: string]: any;
            };
        }
    }
    interface HTMLElementTagNameMap {
        'matrixx-canvas': HTMLElement;
        'bit-rain-column': HTMLElement;
    }
}
