import Image from "next/image";

export default function Home() {
  return ( 
     <main className="min-h-screen bg-gradient-to-b from-black to-zinc-900 text-white">
      {/* HERO */}
      <section className="flex flex-col items-center justify-center py-32 px-6">
        <h1 className="text-5xl font=bold mb-6">IZEL</h1>

        <p className="text-xl text-zinc-300 mb-2">No es que no puedas mejorar...</p>
        <p className="text-xl text-zinc-300 mb-6 ">es que nadie te enseñó a entenderte.</p>
        <p className="text-lg text-zinc-500 mb-4">
        No necesitas registrarte.
        </p>
      </section>
      {/*PROBLEMA*/}
      <section className="py-24 px-6 text-center max-w-3xl mx-auto">
        <h2 className="text-3xl font-semibold mb-6">Algo no está bien</h2>
        <p className="text-lg text-zinc-400 mb-4">
        En México, millones de personas viven con estrés, ansiedad o problemas de salud.
        </p>
        <p className="text-lg text-zinc-400 mb-4">
        Sabes que deberias cuidarte mas...
        pero ente el canncio y la rutina, no sabes por donde empezar.
        </p>
        <p className="text-base text-zinc-500">No es falta de disciplina. Es falta de claridad</p>
      </section>
      {/*SOLUCION*/}
      <section className="py-24 px-6 text-center max-w-3xl mx-auto">
        <h2 className="text-3xl font-semibold mb-6">IZEL te acompaña</h2>
        <p className="text-zinc-400 mb-4"> No es otra app de hábitos.</p>
        <p className="text-zinc-400 mb-4">
          Es una mascota que escucha lo que sientes,
          analiza tu dia y te ayuda a mejorar poco a poco
        </p>
        <p className="text-zinc-500">
          Enterte es el primer paso para cambiar.
        </p>
      </section>
      {/* MASCOTAS */}
      <section className="py-24 px-6 text-center">
        <h2 className="text-3xl font-semibold mb-10">Tu compañero</h2>

        <div className="flex justify-center gap-10 text-5xl">
          <span>🦊</span>
          <span>🦎</span>
          <span>🦉</span>
          <span>🐆</span>
        </div>

        <p className="text-lg text-zinc-500 mt-6">
          Cada mascota tiene una personalidad distinta
        </p>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 text-center">
        <p className="text-lg text-zinc-400 mb-6">
          Empieza a entenderte hoy
        </p>

        <a
          href="/onboarding"
          className="bg-white text-black px-10 py-4 rounded-full font-semibold hover:scale-105 transition"
        >
          Probar demo
        </a>
      </section>
    </main>

  );
}
