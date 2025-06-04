// ───────────────────────────────────────────────────────────
// src/index.ts
// ───────────────────────────────────────────────────────────
//
// This “entry” point is what users will import in order to
// register *all* of Web Components in one go.
//
// Importing these two modules that -
// `customElements.define('bit-rain-column', …)` and
// `customElements.define('matrixx-canvas', …)` shall happen immediately.
//

// Import and register <bit-rain-column> Web Component
import './bit-rain-column';

// Import and register <matrixx-canvas> Web Component
import './matrixx-canvas';

