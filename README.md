# 🟩 Matrixx Canvas Web Component

A lightweight, **zero-dependency**, native Web Component that renders an animated **Matrix-style binary rain** background using pure HTML, CSS, and JavaScript. It is easy to integrate into any frontend project without frameworks like React or Vue.

> Includes:
> - `<matrixx-canvas>` – manages the canvas and columns
> - `<bit-rain-column>` – represents an individual animated column of binary bits shifting between 0&1.

---

## 📸 Screenshots

| Direction: Up | Direction: Down |
|---------------|-----------------|
| Density: Very High (10) | Density: Low (3) |
| ![Up](images/up.png) | ![Down](images/down.png) |
| Bits Color: blue | Bits Color: magenta |
| ![Up](images/up_blue.png) | ![Down](images/down_magenta.png) |
| Rain Display: charamask (Cell Size=32) | Rain Display: charamask (Default) |
| ![Up](images/charmask-up.png) | ![Down](images/charmask-down.png) |

> *Both screenshots captured using the `<matrixx-canvas>` component with different [Custom Attributes](#custom-element-reference).*

---

## 📦 Installation

Install it via npm:

```bash
npm install bitrain-matrixx
````

---

## 🚀 Usage

### 1. Import the components

```html
<script type="module">
  import 'bitrain-matrixx';
</script>
```

### 2. Use the `<matrixx-canvas>` tag

```html
<matrixx-canvas
  density="0.7"
  direction="down"
  limit="true"
></matrixx-canvas>
```

### 3. Example with content on top

```html
<body style="margin: 0; background: black;">
  <matrixx-canvas density="0.8" direction="up"></matrixx-canvas>

  <div style="position: relative; color: white; text-align: center; padding-top: 25vh;">
    <h1>Hello, Matrixx.</h1>
  </div>
</body>
```

### 4. Example with React

```jsx
import 'bitrain-matrixx';
export default function App() {
  return (
      <div style={{ background: "black", width: '100vw', height: '100vh' }}>

        <matrixx-canvas
          rain-display="charamask"
          direction="down"
          density="6"
          cell-size="16"
          speed="20"
          tail-min="4"
          tail-max="12"
        ></matrixx-canvas>

        <div
          style={{
            position: "relative",
            color: "white",
            textAlign: "center",
            paddingTop: "25vh",
          }}
        >
          <h1>Hello, Matrixx.</h1>
        </div>
      </div>
  )
}
```

---

## 🧩 Custom Element Reference

### `<matrixx-canvas>`
##### Attributes are all OPTIONAL, if you wish to have a kickstart, feel free to use a plain tag.
| Attribute       | Type               | Default   | Description                                                                                                                                      |
| --------------- | ------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `density`       | `float`            | `4.0`     | Controls how many columns (or, in `charamask`, how many columns are likely to activate at once). Recommended: 1 ~ 10.                            |
| `direction`     | `"up"` \| `"down"` | `"up"`    | Direction of animation. For `charamask`, defines whether streaks travel from bottom → top (`up`) or top → bottom (`down`).                       |
| `bits-color`    | `string`           | `#00ff00` | Color used to render bits/characters. Defaults to lime-green.                                                                                    |
| `limit`         | `bool`             | `true`    | If `true`, restricts density within 0 ~ 10. If `false`, higher values allowed (may affect performance).                                          |
| `rain-display`  | `"riverflow"` \| `"waterfall"` \| `"charamask"` | `"riverflow"` | Selects the effect mode: <br>• **riverflow** – streams run continuously <br>• **waterfall** – drops fade before leaving screen <br>• **charamask** – lights up a fixed char grid with comet-like streaks |
| `cell-size`     | `integer` (px)     | `18`      | **Charamask only.** Pixel size of each grid cell (controls font size and spacing of characters).                                                  |
| `speed`         | `float` (cells/s)  | `22`      | **Charamask only.** Speed of streak heads, in grid cells per second.                                                                             |
| `tail-min`      | `integer` (cells)  | `6`       | **Charamask only.** Minimum tail length for a streak (how many characters light up behind the head).                                             |
| `tail-max`      | `integer` (cells)  | `18`      | **Charamask only.** Maximum tail length for a streak. Each streak chooses a random length between `tail-min` and `tail-max`.                      |

---

## 🛠 Technologies Used

* **Web Components**: native `HTMLElement` extension via `customElements.define`
* **Shadow DOM**: fully encapsulated styles
* **CSS animations**: pure keyframe animations for performance
* **TypeScript**: strict typing and dev-time safety
* **No dependencies**: zero runtime overhead

---

## 📁 Project Structure

```
src/
├── bit-rain-column.ts   # <bit-rain-column> component
└── matrixx-canvas.ts    # <matrixx-canvas> component
└── charamask-engine.ts  # render engine component for theme 'charamask'

dist/
└── *.js                 # compiled JS output (for npm)
└── *.tgz                # packed npm package ready for install

index.html               # test/demo page html
****_example/            # demo examples on different frameworks
tsconfig.json
package.json
README.md                # this doc
```

---

## 🧪 Development & Testing

```bash
npm install
npx tsc
npx http-server .
# Then open http://localhost:8080
```

> You can also use Vite or any static dev server to test.

---

## 📄 License

Apache-2.0 License © 2025 Hanny Zhang

---

## 🙌 Acknowledgements

Inspired by the iconic "Matrix" falling code effect. Built to be easy-to-use, flexible, and framework-free. Hope this would boost your ideas to web!
