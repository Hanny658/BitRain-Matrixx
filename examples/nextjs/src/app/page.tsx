'use client'
import 'bitrain-matrixx';

export default function Home() {

  return (
    <div className='!bg-black h-screen w-screen'>
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
        className='relative text-5xl text-white text-center pt-[25vh]'
      >
        <h1>Hello, Matrixx in Next.js.</h1>
      </div>
    </div>
  );
}
