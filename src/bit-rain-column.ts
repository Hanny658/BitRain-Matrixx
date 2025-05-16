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

export class BitRainColumn extends HTMLElement {
  private bits: string[] = [];
  private intervalId?: number;
  private shadow: ShadowRoot;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const duration = Number(this.getAttribute('duration') ?? '10');
    const delay = Number(this.getAttribute('delay') ?? '0');
    const fontSize = Number(this.getAttribute('font-size') ?? '14');
    const blur = Number(this.getAttribute('blur') ?? '0');
    const left = this.getAttribute('left') ?? '0px';
    const direction = this.getAttribute('direction') === 'down' ? 'down' : 'up';

    const len = Math.floor(Math.random() * 20) + 10;
    this.bits = Array.from({ length: len }, () => (Math.random() < 0.5 ? '0' : '1'));

    this.render(left, duration, delay, fontSize, blur, direction);
    this.startUpdatingBits();
  }

  disconnectedCallback() {
    clearInterval(this.intervalId);
  }

  private startUpdatingBits() {
    this.intervalId = setInterval(() => {
      const idx = Math.floor(Math.random() * this.bits.length);
      this.bits[idx] = Math.random() < 0.5 ? '0' : '1';
      const spanList = this.shadow.querySelectorAll('.bit');
      if (spanList[idx]) {
        spanList[idx].textContent = this.bits[idx];
      }
    }, 200);
  }

  private render(left: string, duration: number, delay: number, fontSize: number, blur: number, direction: string) {
    const keyframe = direction === 'down' ? 'move-down' : 'move-up';
    this.shadow.innerHTML = `
      <style>
        :host {
          position: absolute;
          ${direction === 'down' ? 'top: 0;' : 'bottom: 0;'};
          left: ${left};
          animation: ${keyframe} ${duration}s linear infinite;
          animation-delay: -${delay}s;
          font-size: ${fontSize}px;
          filter: blur(${blur}px);
          font-family: monospace;
          line-height: 1.1;
          color: #00ff00;
          display: flex;
          flex-direction: column;
        }

        @keyframes move-up {
          0% { transform: translateY(100%); }
          100% { transform: translateY(-100%); }
        }

        @keyframes move-down {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      </style>
      ${this.bits.map(bit => `<span class="bit">${bit}</span>`).join('')}
    `;
  }
}

customElements.define('bit-rain-column', BitRainColumn);
