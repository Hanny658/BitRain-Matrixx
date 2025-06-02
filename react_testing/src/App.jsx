import './App.css'
import 'bitrain-matrixx';

function App() {

  return (
      <div style={{ background: "black", width: '100vw', height: '100vh' }}>
        <matrixx-canvas density="1" direction="down" bits-color='red'></matrixx-canvas>

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
