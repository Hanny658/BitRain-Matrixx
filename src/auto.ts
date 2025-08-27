import { defineMatrixx } from './index';

if (typeof window !== 'undefined' && typeof customElements !== 'undefined') {
    defineMatrixx();
}

export * from './index';     // assure same types/exports
export {};                   // keep it a module

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
