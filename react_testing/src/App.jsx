import './App.css'
import 'bitrain-matrixx';

function App() {

  return (
    <>
      <div style={{ margin: 0, padding: 0, background: "black", width: '100vw', height: '100vh' }}>
        <matrixx-canvas density="0.8" direction="up"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            display: "block",
            zIndex: 0
          }}></matrixx-canvas>

        <div
          style={{
            position: "relative",
            color: "white",
            textAlign: "center",
            paddingTop: "25vh",
          }}
        >
          <h1>Hello, Matrix.</h1>
        </div>
      </div>
    </>
  )
}

export default App
