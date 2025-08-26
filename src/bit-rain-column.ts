/**
 * <bit-rain-column> Web Component
 *
 * Attributes:
 *  - left:         string   (e.g. "20vw")
 *  - duration:     number   (animation duration in seconds)
 *  - delay:        number   (animation delay in seconds)
 *  - font-size:    number   (font size in px)
 *  - blur:         number   (blur level in px)
 *  - direction:    "up" | "down"   (default: "up")
 *  - bits-color:   string   (CSS color for the bits, default: "#00ff00")
 *  - rain-display: "riverflow" | "waterfall"  (default: "riverflow")
 *
 *  • "riverflow"  ⇒ bits simply translate (no fade), then immediately reset.
 *  • "waterfall"  ⇒ bits translate and fade out at the very end of each cycle.
 *  • "bitmask"  ⇒ bits translate and fade out at the very end of each cycle.
 */

import { BitRainMode } from "./matrixx-canvas";

export class BitRainColumn extends HTMLElement {
  private bits: string[] = [];
  private intervalId?: number;
  private shadow: ShadowRoot;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    // ─── 1. Read attributes & apply defaults ─────────────────────────────
    const durationAttr  = this.getAttribute('duration')   ?? '10';
    const delayAttr     = this.getAttribute('delay')      ?? '0';
    const fontSizeAttr  = this.getAttribute('font-size')  ?? '14';
    const blurAttr      = this.getAttribute('blur')       ?? '0';
    const left          = this.getAttribute('left')       ?? '0px';
    const dirAttr       = this.getAttribute('direction')  ?? 'up';
    const bitsColor     = this.getAttribute('bits-color') ?? '#00ff00';
    const rainDisplay   = this.getAttribute('rain-display') ?? 'riverflow' as BitRainMode;

    const duration  = Number(durationAttr);
    const delay     = Number(delayAttr);
    const fontSize  = Number(fontSizeAttr);
    const blur      = Number(blurAttr);
    const direction = (dirAttr === 'down') ? 'down' : 'up';
    const displayMode = rainDisplay as BitRainMode;

    // ─── 2. Generate random bits (array of "0"/"1") ─────────────────────────
    const len = Math.floor(Math.random() * 20) + 10;
    this.bits = Array.from({ length: len }, () => (Math.random() < 0.5 ? '0' : '1'));

    // ─── 3. Build the initial <style> + <span class="bit">…</span> layout ──
    this.shadow.innerHTML = `
      <style>
        :host {
          position: absolute;
          ${direction === 'down' ? 'top: 0;' : 'bottom: 0;'}
          left: ${left};
          font-size: ${fontSize}px;
          filter: blur(${blur}px);
          font-family: monospace;
          line-height: 1.1;
          color: ${bitsColor};
          display: flex;
          flex-direction: column;
          /* animation will be injected after layout in RAF */
        }

        /* ─── 4 built-in keyframes ───────────────────────────────────────────*/
        @keyframes move-up {
          0%   { transform: translateY(100%);  opacity: 1; }
          100% { transform: translateY(-calc(100vh + 100%)); opacity: 1; }
        }
        @keyframes move-down {
          0%   { transform: translateY(-100%); opacity: 1; }
          100% { transform: translateY(calc(100vh + 100%));  opacity: 1; }
        }
        @keyframes waterfall-up {
          0%   { transform: translateY(100%);  opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(-100%); opacity: 0; }
        }
        @keyframes waterfall-down {
          0%   { transform: translateY(-100%); opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(100%);  opacity: 0; }
        }
      </style>

      ${this.bits.map(bit => `<span class="bit">${bit}</span>`).join('')}
    `;

    // ─── 5. After first paint, actually set the animation on :host ────────
    // Using requestAnimationFrame ensures the browser has computed the height of the spans.
    requestAnimationFrame(() => {
      // Choose which keyframe to use based on (direction, displayMode)
      let keyframeName: string;
      if (displayMode === 'waterfall') {
        keyframeName = (direction === 'down') ? 'waterfall-down' : 'waterfall-up';
      } else {
        // “riverflow”
        keyframeName = (direction === 'down') ? 'move-down' : 'move-up';
      }

      // Append to the existing style block so we don't overwrite the keyframes themselves.
      const styleElem = this.shadow.querySelector('style')!;
      styleElem.textContent += `
        :host {
          animation: ${keyframeName} ${duration}s linear infinite;
          animation-delay: -${delay}s;
        }
      `;

      // Start randomizing the bits once per 200ms
      this.startUpdatingBits();
    });
  }

  disconnectedCallback() {
    clearInterval(this.intervalId);
  }

  private startUpdatingBits() {
    this.intervalId = window.setInterval(() => {
      const idx = Math.floor(Math.random() * this.bits.length);
      this.bits[idx] = (Math.random() < 0.5 ? '0' : '1');

      const spanList = this.shadow.querySelectorAll<HTMLSpanElement>('.bit');
      if (spanList[idx]) {
        spanList[idx].textContent = this.bits[idx];
      }
    }, 200);
  }
}

customElements.define('bit-rain-column', BitRainColumn);
