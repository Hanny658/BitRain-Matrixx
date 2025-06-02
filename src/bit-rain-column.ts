/**
 * <bit-rain-column> Web Component
 *
 * Props:
 *  - left: string (e.g., "20vw")
 *  - duration: number (animation duration in seconds)
 *  - delay: number (animation delay in seconds)
 *  - font-size: number (font size in px)
 *  - blur: number (blur level in px)
 *  - direction: "up" | "down" (default: "up")
 */
// src/bit-rain-column.ts

export class BitRainColumn extends HTMLElement {
  private bits: string[] = [];
  private intervalId?: number;
  private shadow: ShadowRoot;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    // 1. Read all attributes
    const duration   = Number(this.getAttribute('duration')   ?? '10');
    const delay      = Number(this.getAttribute('delay')      ?? '0');
    const fontSize   = Number(this.getAttribute('font-size')  ?? '14');
    const blur       = Number(this.getAttribute('blur')       ?? '0');
    const left       =    this.getAttribute('left')           ?? '0px';
    const dirAttr    =    this.getAttribute('direction')      ?? 'up';
    const direction  = (dirAttr === 'down') ? 'down' : 'up';
    const bitsColor  =    this.getAttribute('bits-color')     ?? '#00ff00';

    // 2. Generate random bits
    const len = Math.floor(Math.random() * 20) + 10;
    this.bits = Array.from({ length: len }, () => (Math.random() < 0.5 ? '0' : '1'));

    // 3. Inject style + spans, but DO NOT set animation yet
    //    We will add `animation: move-up` in the next frame once height is known.
    const keyframe = (direction === 'down') ? 'move-down' : 'move-up';

    this.shadow.innerHTML = `
      <style>
        :host {
          position: absolute;
          ${direction === 'down' ? 'top: 0;' : 'bottom: 0;'};
          left: ${left};
          font-size: ${fontSize}px;
          filter: blur(${blur}px);
          font-family: monospace;
          line-height: 1.1;
          color: ${bitsColor};
          display: flex;
          flex-direction: column;
        }

        @keyframes move-up {
          0%   { transform: translateY(100%); }
          100% { transform: translateY(-100%); }
        }

        @keyframes move-down {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      </style>
      ${this.bits.map(bit => `<span class="bit">${bit}</span>`).join('')}
    `;

    // 4. Wait for the browser to finish laying out <span>. Only then do we add "animation".
    requestAnimationFrame(() => {
      const styleElem = this.shadow.querySelector('style')!;
      styleElem.textContent += `
        :host {
          animation: ${keyframe} ${duration}s linear infinite;
          animation-delay: -${delay}s;
        }
      `;
      // 5. Now that our spans exist and :host is sized (height = #bits * line-height * font-size),
      //    we can safely start random bit-flips.
      this.startUpdatingBits();
    });
  }

  disconnectedCallback() {
    clearInterval(this.intervalId);
  }

  private startUpdatingBits() {
    this.intervalId = window.setInterval(() => {
      if (!this.shadow) return;
      const idx = Math.floor(Math.random() * this.bits.length);
      this.bits[idx] = (Math.random() < 0.5 ? '0' : '1');
      const spanList = this.shadow.querySelectorAll<HTMLSpanElement>('.bit');
      if (spanList[idx]) {
        spanList[idx].textContent = this.bits[idx];
      }
    }, 200);
  }
}

// Register the tag name
customElements.define('bit-rain-column', BitRainColumn);
