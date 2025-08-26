/**
 * CharamaskEngine — Canvas grid “bit rain” (for <matrixx-canvas rain-display="charamask">)
 *
 * Options (mapped from <matrixx-canvas> attributes):
 *  - density:     FLOAT   (0 ~ 10; controls how often columns activate; default: 4)
 *  - direction:   "up" | "down" (default: "up")
 *  - color:       string  (CSS color for chars; default: "#00ff00")
 *  - cellSize:    number  (grid cell size in px; default: 18)
 *  - speed:       number  (cells per second for the moving head; default: 22)
 *  - tailMin:     number  (minimum tail length in cells; default: 6)
 *  - tailMax:     number  (maximum tail length in cells; default: 18)
 *
 * Behavior
 *  - Creates a grid over the canvas based on `cellSize` (HiDPI-aware).
 *  - Each cell holds a random [A–Z, a–z, 0–9] character with initial opacity 0.
 *  - Per column, a “head” moves in `direction` with a random-length tail.
 *  - Tail lights cells along its path using a gradient (high → low opacity).
 *  - After a tail passes and a cell’s opacity decays back to 0, the cell is
 *    re-assigned a new random character.
 *  - Column activation frequency scales with `density`. Columns recycle when
 *    their tail exits the viewport.
 *
 * Public API
 *  - constructor(canvas: HTMLCanvasElement, options: CharamaskOptions)
 *  - attach(canvas: HTMLCanvasElement): void
 *  - setOptions(next: CharamaskOptions): void          // hot-update; resizes grid if cellSize changed
 *  - start(): void                                     // begins rAF loop; installs resize listener
 *  - pause(): void                                     // pauses stepping/drawing (e.g., on hidden tab)
 *  - resume(): void
 *  - stop(): void                                      // cancels rAF; removes listeners
 *
 */


type Dir = 'up' | 'down';
export type CharamaskOptions = {
    direction: Dir;          // up/down
    color: string;           // RGBA/hex
    density: number;         // 0..10 → OVERDRIVE when limit breaks
    cellSize: number;        // px
    speed: number;           // cells / second
    tailMin: number;         // cells
    tailMax: number;         // cells
};

export class CharamaskEngine {
    private canvas: HTMLCanvasElement;
    private ctx!: CanvasRenderingContext2D;
    private opts: CharamaskOptions;
    private raf: number | null = null;
    private paused = false;
    private dpr = 1;

    // grid state
    private cols = 0;
    private rows = 0;
    private chars!: string[];        // length = cols*rows
    private alpha!: Float32Array;    // per-cell current alpha (0..1)
    private active!: boolean[];      // is cell “owned” by a passing tail this frame

    // streaks: one head per active column (can respawn)
    private heads: number[] = [];    // row index (float), per column
    private tails: number[] = [];    // tail length (cells), per column
    private activeCols: boolean[] = [];

    private last = 0;

    constructor(canvas: HTMLCanvasElement, options: CharamaskOptions) {
        this.canvas = canvas;
        this.opts = options;
        this.attach(canvas);
    }

    private onWindowResize = () => this.resize(false);

    attach(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const ctx = this.canvas.getContext('2d');
        if (!ctx) throw new Error('2d context not available');
        this.ctx = ctx;
        this.resize(true);
    }

    setOptions(next: CharamaskOptions) {
        // hot-apply where possible
        const cellChanged = next.cellSize !== this.opts.cellSize;
        const dirChanged = next.direction !== this.opts.direction;
        this.opts = { ...this.opts, ...next };
        if (cellChanged) this.resize(true);
        if (dirChanged) this.seedStreaks(); // reset heads to match flow
    }

    start() {
        if (this.raf !== null) return;
        this.last = performance.now();
        const tick = (t: number) => {
            if (this.paused) { this.last = t; this.raf = requestAnimationFrame(tick); return; }
            const dt = Math.min(80, t - this.last) / 1000; // clamp
            this.step(dt);
            this.draw();
            this.last = t;
            this.raf = requestAnimationFrame(tick);
        };
        this.raf = requestAnimationFrame(tick);

        // auto-resize
        addEventListener('resize', this.onWindowResize);
    }

    pause() { this.paused = true; }
    resume() { this.paused = false; }
    stop() { if (this.raf !== null) cancelAnimationFrame(this.raf); this.raf = null; removeEventListener('resize', this.onWindowResize); }

    // ---------- internals ----------
    private resize = (hard = false) => {
        const cssW = this.canvas.clientWidth || this.canvas.getBoundingClientRect().width || innerWidth;
        const cssH = this.canvas.clientHeight || this.canvas.getBoundingClientRect().height || innerHeight;
        const dpr = Math.max(1, Math.floor(devicePixelRatio || 1));
        if (!hard && this.canvas.width === Math.floor(cssW * dpr) && this.canvas.height === Math.floor(cssH * dpr) && this.dpr === dpr) return;

        this.dpr = dpr;
        this.canvas.width = Math.max(1, Math.floor(cssW * dpr));
        this.canvas.height = Math.max(1, Math.floor(cssH * dpr));
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(dpr, dpr);

        // grid geometry
        const s = Math.max(8, this.opts.cellSize);
        this.cols = Math.max(1, Math.floor(cssW / s));
        this.rows = Math.max(1, Math.floor(cssH / s));

        // allocate
        this.chars = new Array(this.cols * this.rows);
        this.alpha = new Float32Array(this.cols * this.rows);
        this.active = new Array(this.cols * this.rows).fill(false);

        // init chars + streaks
        for (let i = 0; i < this.chars.length; i++) this.chars[i] = randChar();
        this.seedStreaks();
    };

    private seedStreaks() {
        this.heads = new Array(this.cols).fill(0);
        this.tails = new Array(this.cols).fill(0);
        this.activeCols = new Array(this.cols).fill(false);

        const goingDown = this.opts.direction === 'down';
        for (let c = 0; c < this.cols; c++) {
            this.heads[c] = goingDown ? -rand(0, this.rows) : this.rows + rand(0, this.rows);
            this.tails[c] = Math.floor(rand(this.opts.tailMin, this.opts.tailMax + 1));
            this.activeCols[c] = Math.random() < this.activationProb(); // initial chance
        }
    }

    private activationProb() {
        // map density 0..10 to probability per column per “cycle”
        // gentle curve: p = 0.06 + 0.08 * (density/10)^0.9
        const d = Math.max(0, Math.min(10, this.opts.density));
        return 0.06 + 0.08 * Math.pow(d / 10, 0.9);
    }

    private step(dt: number) {
        const { speed, direction } = this.opts;
        const cellsPerSec = Math.max(1, speed);
        const deltaCells = cellsPerSec * dt;

        // decay alphas
        for (let i = 0; i < this.alpha.length; i++) {
            if (!this.active[i] && this.alpha[i] > 0) {
                this.alpha[i] = Math.max(0, this.alpha[i] - 1.2 * dt); // decay rate
                if (this.alpha[i] === 0) this.chars[i] = randChar();   // reassign when fully off
            }
            this.active[i] = false; // reset mark; will be set below if lit this frame
        }

        // advance heads and light tails
        const goingDown = direction === 'down';
        for (let c = 0; c < this.cols; c++) {
            if (!this.activeCols[c]) {
                // chance to (re)activate this column
                if (Math.random() < this.activationProb() * dt) {
                    this.activeCols[c] = true;
                    this.tails[c] = Math.floor(rand(this.opts.tailMin, this.opts.tailMax + 1));
                    this.heads[c] = goingDown ? -1 : this.rows + 1;
                } else continue;
            }

            // move head
            this.heads[c] += goingDown ? deltaCells : -deltaCells;

            // compute integer head position
            const headRow = Math.floor(this.heads[c]);
            const len = this.tails[c];

            // light tail cells
            for (let k = 0; k < len; k++) {
                const r = goingDown ? (headRow - k) : (headRow + k);
                if (r < 0 || r >= this.rows) continue;
                const idx = r * this.cols + c;
                const t = k / len;               // tail progress (0 at head → 1 at end)
                const a = 1 - t * t;             // ease-out for nicer gradient
                this.alpha[idx] = Math.max(this.alpha[idx], a);
                this.active[idx] = true;
            }

            // recycle when fully offscreen
            if (goingDown && headRow - len > this.rows) {
                this.activeCols[c] = false;
            } else if (!goingDown && headRow + len < 0) {
                this.activeCols[c] = false;
            }
        }
    }

    private draw() {
        const w = this.canvas.width / this.dpr;
        const h = this.canvas.height / this.dpr;
        const s = Math.max(8, this.opts.cellSize);

        this.ctx.clearRect(0, 0, w, h);
        this.ctx.fillStyle = this.opts.color;
        this.ctx.textBaseline = 'top';
        this.ctx.font = `${Math.floor(s)}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace`;

        // draw visible cells
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const i = r * this.cols + c;
                const a = this.alpha[i];
                if (a <= 0) continue;
                this.ctx.globalAlpha = a;
                this.ctx.fillText(this.chars[i], c * s, r * s);
            }
        }
        this.ctx.globalAlpha = 1;
    }
}

// here's helpers~
function rand(min: number, max: number) { return Math.random() * (max - min) + min; }
function randChar(): string {
    const n = Math.floor(Math.random() * 62);
    if (n < 10) return String.fromCharCode(48 + n);         // 0-9
    if (n < 36) return String.fromCharCode(65 + (n - 10));   // A-Z
    return String.fromCharCode(97 + (n - 36));               // a-z
}
