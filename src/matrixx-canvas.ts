/**
 * <matrixx-canvas> Web Component
 *
 * Props:
 *  - density: FLOAT (0 ~ 10, controls how many columns to render)
 *  - limit: boolean (optional, default true). If limit is false, density can be over any range, but result not garanteed.
 *  - direction: "up" | "down" (default: "up")
 *
 * Description:
 *  This component renders multiple <bit-rain-column> elements as animated binary rain.
 *  It positions the canvas at a low z-index to appear behind most elements.
 *  The columns are randomly spaced and animated.
 */

import './bit-rain-column';

export class MatrixxCanvas extends HTMLElement {
  private shadow: ShadowRoot;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const limitAttr   = this.getAttribute('limit');
    const direction   = (this.getAttribute('direction') === 'down') ? 'down' : 'up';
    const bitsColor   = this.getAttribute('bits-color') ?? '#00ff00';
    const limit       = (limitAttr === null || limitAttr === 'true' || limitAttr === '1');
    const densityAttr = this.getAttribute('density') ?? '4';
    let density       = parseFloat(densityAttr.trim());
    const originalDensity = density;

    if (isNaN(density)) {
      console.warn(`[MatrixxCanvas] invalid density (“${densityAttr}”), defaulting to 4`);
      density = 4;
    }
    if (limit && (density < 0 || density > 10)) {
      console.warn(`[MatrixxCanvas] density must be 0–10 when limit=true. Got ${originalDensity}, resetting to 4.`);
      density = 4;
    }

    // The total number of columns
    const count = Math.floor(1 + density * 20);
    if (!limit && count > 320) {
      console.warn(`[MatrixxCanvas] Creating ${count} columns. That may be too many for performance.`);
    }

    // Precompute random props
    const columns = Array.from({ length: count }, () => ({
      left:     `${Math.random() * 100}vw`,
      duration: 5 + Math.random() * 5,
      delay:    Math.random() * 10,
      fontSize: 10 + Math.random() * 18,
      blur:     Math.random() * 2
    }));

    // Inject parent container (full-screen, fixed, z-index:0)
    // plus all <bit-rain-column> tags. We do not attach animation here; each column delays its own.
    this.shadow.innerHTML = `
      <style>
        :host {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          z-index: 0;
          pointer-events: none;
        }
      </style>
      ${columns.map(col => `
        <bit-rain-column
          left="${col.left}"
          duration="${col.duration}"
          delay="${col.delay}"
          font-size="${col.fontSize}"
          blur="${col.blur}"
          direction="${direction}"
          bits-color="${bitsColor}"
        ></bit-rain-column>
      `).join('\n')}
    `;
  }
}

customElements.define('matrixx-canvas', MatrixxCanvas);
