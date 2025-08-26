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
import { CharamaskEngine, CharamaskOptions } from './charamask-engine';

export type BitRainMode = "waterfall" | "riverflow" | "charamask";

export class MatrixxCanvas extends HTMLElement {
  private shadow: ShadowRoot;
  private chara?: CharamaskEngine;
  static get observedAttributes() {
    return ['density','limit','direction','bits-color','rain-display',
            'cell-size','speed','tail-min','tail-max'];
  }

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    // hot-update when possible
    const mode = (this.getAttribute('rain-display') ?? 'riverflow') as BitRainMode;
    if (mode === 'charamask' && this.chara) {
      this.chara.setOptions(this.readCharamaskOptions());
    } else {
      // for DOM modes, a cheap rebuild is fine
      this.render();
    }
  }

  private render() {
    const mode = (this.getAttribute('rain-display') ?? 'riverflow') as BitRainMode;

    /** ==== For charamask theme ============================= */

    if (mode === 'charamask') {
      // clear existing DOM children (columns) if any
      this.shadow.innerHTML = `
        <style>
          :host {
            position: fixed; inset: 0;
            width: 100vw; height: 100vh;
            overflow: hidden; z-index: 0; pointer-events: none;
          }
          canvas { width: 100%; height: 100%; display:block; }
        </style>
        <canvas part="canvas"></canvas>
      `;
      const canvas = this.shadow.querySelector('canvas') as HTMLCanvasElement;
      // start/update engine
      if (!this.chara) {
        this.chara = new CharamaskEngine(canvas, this.readCharamaskOptions());
        this.chara.start();
        // pause on hidden
        document.addEventListener('visibilitychange', () => {
          if (!this.chara) return;
          if (document.hidden) this.chara.pause(); else this.chara.resume();
        });
      } else {
        this.chara.attach(canvas);
        this.chara.setOptions(this.readCharamaskOptions());
      }
      return;
    }
    
    /** ==== For classic columns-based theme ============================= */

    // ─── 1. Read & normalize attributes ───────────────────────────────────
    const limitAttr     = this.getAttribute('limit');
    const directionAttr = this.getAttribute('direction');
    const bitsColor     = this.getAttribute('bits-color')  ?? '#00ff00';
    const displayAttr   = this.getAttribute('rain-display') ?? 'riverflow';
    const densityAttr   = this.getAttribute('density')    ?? '4';

    const direction = (directionAttr === 'down') ? 'down' : 'up';
    const rainDisplay = displayAttr as BitRainMode;
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

    // ─── 2. Compute how many columns spawn ───────────────────────────
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
          rain-display="${rainDisplay}"
        ></bit-rain-column>
      `).join('\n')}
    `;
  }

  private readCharamaskOptions(): CharamaskOptions {
    const direction = (this.getAttribute('direction') === 'down') ? 'down' : 'up';
    const color = this.getAttribute('bits-color') ?? '#00ff00';
    const densityAttr = this.getAttribute('density') ?? '4';
    let density = parseFloat(densityAttr);
    if (isNaN(density)) density = 4;
    const limitAttr = this.getAttribute('limit');
    const limit = (limitAttr === null || limitAttr === 'true' || limitAttr === '1');
    if (limit) density = Math.max(0, Math.min(10, density));

    const cellSize = parseInt(this.getAttribute('cell-size') ?? '18', 10);
    const speed = parseFloat(this.getAttribute('speed') ?? '22'); // cells/sec
    const tailMin = parseInt(this.getAttribute('tail-min') ?? '6', 10);
    const tailMax = parseInt(this.getAttribute('tail-max') ?? '18', 10);

    return { direction, color, density, cellSize, speed, tailMin, tailMax };
  }
}

customElements.define('matrixx-canvas', MatrixxCanvas);
