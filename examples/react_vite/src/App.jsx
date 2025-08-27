import './App.css'
import 'bitrain-matrixx';

function App() {

  return (
    <div style={{ background: "black", width: '100vw', height: '100vh' }}>
      <matrixx-canvas
        rain-display="charamask"
        direction="down"
        density="6"
        cell-size="18"
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

export default App
