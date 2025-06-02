/**
 * <matrixx-canvas> Web Component
 *
 * Attributes:
 *  - density:      FLOAT   (0 ~ 10, controls how many columns to render)
 *  - limit:        boolean (optional; default=true). When false, density can exceed 10.  
 *  - direction:    "up" | "down" (default: "up")
 *  - bits-color:   string  (CSS color for bits; default: "#00ff00")
 *  - rain-display: "riverflow" | "waterfall" (default: "riverflow")
 *
 * This component spawns multiple <bit-rain-column> children with random
 * “left”, “duration”, “delay”, “font-size”, and “blur” attributes. 
 * Passing `rain-display="waterfall"` causes each column to fade-out at the end;
 * otherwise, columns use the default “riverflow” (instant reset).
 */

import './bit-rain-column';

export class MatrixxCanvas extends HTMLElement {
  private shadow: ShadowRoot;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    // ─── 1. Read & normalize attributes ───────────────────────────────────
    const limitAttr     = this.getAttribute('limit');
    const directionAttr = this.getAttribute('direction');
    const bitsColor     = this.getAttribute('bits-color')  ?? '#00ff00';
    const displayAttr   = this.getAttribute('rain-display') ?? 'riverflow';
    const densityAttr   = this.getAttribute('density')    ?? '4';

    const direction = (directionAttr === 'down') ? 'down' : 'up';
    const rainDisplay = (displayAttr === 'waterfall') ? 'waterfall' : 'riverflow';
    const limit = (limitAttr === null || limitAttr === 'true' || limitAttr === '1');

    let density = parseFloat(densityAttr.trim());
    if (isNaN(density)) {
      console.warn(`[MatrixxCanvas] invalid density (“${densityAttr}”). Defaulting to 4.`);
      density = 4;
    }
    if (limit && (density < 0 || density > 10)) {
      console.warn(`[MatrixxCanvas] density must be between 0 and 10 when limit=true. Got: ${densityAttr}. Resetting to 4.`);
      density = 4;
    }

    // ─── 2. Compute how many columns we’ll spawn ───────────────────────────
    const count = Math.floor(1 + density * 20);
    if (!limit && count > 320) {
      console.warn(`[MatrixxCanvas] rain-display="riverflow", but ${count} columns may be too many for performance.`);
    }

    // ─── 3. Build an array of per-column random parameters ─────────────────
    const columns = Array.from({ length: count }, () => ({
      left:     `${Math.random() * 100}vw`,
      duration:  5 + Math.random() * 5, // between 5s and 10s
      delay:     Math.random() * 10,     // random start offset
      fontSize: 10 + Math.random() * 18, // between 10px and 28px
      blur:      Math.random() * 2       // up to 2px blur
    }));

    // ─── 4. Inject the container style and spawn <bit-rain-column> tags ────
    // Pass `rain-display="${rainDisplay}"` down to each child.
    this.shadow.innerHTML = `
      <style>
        :host {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          z-index: 0;          /* sits on top of a black bg, but under any z-index>0 content */
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
          rain-display="${rainDisplay}"
        ></bit-rain-column>
      `).join('\n')}
    `;
  }
}

customElements.define('matrixx-canvas', MatrixxCanvas);
