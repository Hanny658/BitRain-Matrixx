/**
 * <bit-rain-canvas> Web Component
 *
 * Props:
 *  - density: float (0 ~ 1, controls how many columns to render)
 *  - limit: boolean (optional, default true). If limit is false, density can be over any range, but result not garanteed.
 *
 * Description:
 *  This component renders multiple <bit-rain-column> elements as animated binary rain.
 *  It positions the canvas at a low z-index to appear behind most elements.
 *  The columns are randomly spaced and animated.
 */

const isBooleanFalse = (val: string | null): boolean => {
  return val === 'false' || val === '0';
};

export class BitRainCanvas extends HTMLElement {
  private shadow: ShadowRoot;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const densityAttr = this.getAttribute('density') ?? '0.5';
    const limitAttr = this.getAttribute('limit');
    const limit = isBooleanFalse(limitAttr);
    let density = parseFloat(densityAttr);

    if (limit && (isNaN(density) || density < 0 || density > 1)) {
      console.warn(`[bit-rain-canvas] density must be between 0 and 1 when limit=true. Got: ${densityAttr}`);
      density = 0.5;
    }

    const count = Math.floor(1 + density * 25);
    const columns = Array.from({ length: count }, () => ({
      left: `${Math.random() * 100}vw`,
      duration: 5 + Math.random() * 5,
      delay: Math.random() * 10,
      fontSize: 10 + Math.random() * 18,
      blur: Math.random() * 2
    }));

    this.render(columns);
  }

  private render(columns: {
    left: string;
    duration: number;
    delay: number;
    fontSize: number;
    blur: number;
  }[]) {
    this.shadow.innerHTML = `
      <style>
        :host {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          z-index: -1;
          pointer-events: none;
        }
      </style>
      ${columns
        .map(
          (col) => `
          <bit-rain-column
            left="${col.left}"
            duration="${col.duration}"
            delay="${col.delay}"
            font-size="${col.fontSize}"
            blur="${col.blur}"
          ></bit-rain-column>
        `
        )
        .join('\n')}
    `;
  }
}

customElements.define('bit-rain-canvas', BitRainCanvas);
