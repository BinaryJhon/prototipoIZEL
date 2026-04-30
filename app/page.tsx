import Image from "next/image";

export default function Home() {
  return (
    <main
      className="min-h-screen"
      style={{ fontFamily: "var(--font-dm-sans)", color: "#2A5A3B" }}
    >
      {/* HERO */}
      <section
        className="flex flex-col items-center justify-center text-center px-6"
        style={{ padding: "80px 48px 72px", borderBottom: "1px solid rgba(42,90,59,0.2)" }}
      >
        <p
          style={{
            fontSize: "11px",
            letterSpacing: "4px",
            textTransform: "uppercase",
            color: "#2A5A3B",
            fontWeight: 600,
            marginBottom: "28px",
          }}
        >
          Bienestar · Autoconocimiento
        </p>
        <div style={{ position: "relative", width: "340px", height: "340px", marginBottom: "32px" }}>
          <Image src="/logo.png" alt="IZEL Logo" fill sizes="340px" style={{ objectFit: "contain" }} priority />
        </div>
        <p
          style={{
            fontSize: "19px",
            fontWeight: 500,
            color: "#2A5A3B",
            lineHeight: 1.65,
            maxWidth: "380px",
            marginBottom: "12px",
          }}
        >
          No es que no puedas mejorar. Es que nadie te enseñó a entenderte.
        </p>
        <p style={{ fontSize: "13px", color: "rgba(42,90,59,0.6)", marginTop: "20px", fontWeight: 500 }}>
          No necesitas registrarte
        </p>
      </section>

      {/* PROBLEMA + SOLUCIÓN */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: "rgba(42,90,59,0.1)", gap: "1px" }}>
        <section style={{ backgroundColor: "#2A5A3B", padding: "64px 48px" }}>
          <div style={{ width: "32px", height: "2px", background: "rgba(248,244,235,0.4)", marginBottom: "24px" }} />
          <p style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "rgba(248,244,235,0.7)", fontWeight: 700, marginBottom: "20px" }}>
            El problema
          </p>
          <h2
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "42px",
              fontWeight: 700,
              fontStyle: "italic",
              color: "#F8F4EB",
              marginBottom: "28px",
              lineHeight: 1.15,
            }}
          >
            Algo no<br />está bien
          </h2>
          <div style={{ fontSize: "16px", fontWeight: 400, color: "rgba(248,244,235,0.9)", lineHeight: 1.8 }}>
            <p>En México, millones viven con estrés, ansiedad o problemas de salud sin saber por dónde empezar.</p>
            <p style={{ marginTop: "16px", color: "#F8F4EB", fontWeight: 600 }}>No es falta de disciplina. Es falta de claridad.</p>
          </div>
        </section>

        <section style={{ backgroundColor: "#2A5A3B", padding: "64px 48px", borderLeft: "1px solid rgba(248,244,235,0.05)" }}>
          <div style={{ width: "32px", height: "2px", background: "rgba(248,244,235,0.4)", marginBottom: "24px" }} />
          <p style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "rgba(248,244,235,0.7)", fontWeight: 700, marginBottom: "20px" }}>
            La solución
          </p>
          <h2
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "42px",
              fontWeight: 700,
              fontStyle: "italic",
              color: "#F8F4EB",
              marginBottom: "28px",
              lineHeight: 1.15,
            }}
          >
            IZEL te<br />acompaña
          </h2>
          <div style={{ fontSize: "16px", fontWeight: 400, color: "rgba(248,244,235,0.9)", lineHeight: 1.8 }}>
            <p>No es otra app de hábitos. Es una mascota que escucha lo que sientes y analiza tu día.</p>
            <p style={{ marginTop: "16px", color: "#F8F4EB", fontWeight: 600 }}>Entenderte es el primer paso para cambiar.</p>
          </div>
        </section>
      </div>

      {/* MASCOTAS */}
      <section style={{ padding: "64px 48px" }}>
        <div style={{ width: "32px", height: "2px", background: "rgba(42,90,59,0.4)", marginBottom: "24px" }} />
        <p style={{ fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: "rgba(42,90,59,0.55)", fontWeight: 700, marginBottom: "20px" }}>
          Tu compañero
        </p>
        <h2
          style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "32px",
            fontWeight: 700,
            fontStyle: "italic",
            color: "#2A5A3B",
            marginBottom: "32px",
          }}
        >
          Elige tu guía
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px" }}>
          {[
            { image: "/animales/Aguila Real.png", name: "Águila Real" },
            { image: "/animales/Ajolote Oficial.png", name: "Ajolote", scale: 1.3 },
            { image: "/animales/Cacomixtle Oficial.png", name: "Cacomixtle" },
            { image: "/animales/Cenzontle.png", name: "Cenzontle" },
            { image: "/animales/Iguana Espinosa.png", name: "Iguana Espinosa" },
            { image: "/animales/Jaguar Oficial.png", name: "Jaguar", scale: 1.3 },
            { image: "/animales/Lobo Mexicano.png", name: "Lobo Mexicano" },
            { image: "/animales/Mariposa Monarca.png", name: "Mariposa Monarca", scale: 1.3 },
            { image: "/animales/Mono Aullador.png", name: "Mono Aullador" },
            { image: "/animales/Murcielago Frutero.png", name: "Murciélago Frutero" },
            { image: "/animales/Ocelote.png", name: "Ocelote" },
            { image: "/animales/Oso Hormiguero Sedoso.png", name: "Oso Hormiguero" },
            { image: "/animales/Quetzal Oficial.png", name: "Quetzal", scale: 1.3 },
            { image: "/animales/Sapo de Cresta Grande.png", name: "Sapo de Cresta Grande" },
            { image: "/animales/Tecolote.png", name: "Tecolote" },
            { image: "/animales/Teporingo.png", name: "Teporingo" },
            { image: "/animales/Tlacuache.png", name: "Tlacuache" },
            { image: "/animales/Vaquita Marina.PNG", name: "Vaquita Marina" },
            { image: "/animales/Víbora Cascabel.png", name: "Víbora Cascabel" },
            { image: "/animales/Xoloitzcuintle Oficial.png", name: "Xoloitzcuintle" },
          ].map((pet, index) => (
            <div
              key={pet.name}
              style={{
                background: "#FFFFFF",
                border: "1px solid rgba(42,90,59,0.15)",
                borderRadius: "12px",
                padding: "20px 16px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: "0 4px 12px rgba(42,90,59,0.05)"
              }}
            >
              <div 
                className="animate-floating-pet"
                style={{ 
                  position: "relative", 
                  width: "100%", 
                  height: "80px", 
                  marginBottom: "16px",
                  animationDelay: `${index * 0.15}s`
                }}
              >
                <Image src={pet.image} alt={pet.name} fill sizes="100px" style={{ objectFit: "contain", transform: pet.scale ? `scale(${pet.scale})` : "none" }} />
              </div>
              <span style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "#2A5A3B", fontWeight: 700 }}>
                {pet.name}
              </span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: "18px", color: "rgba(42,90,59,0.8)", marginTop: "24px", fontStyle: "italic", fontWeight: "bold" }}>
          Cada mascota tiene una personalidad distinta.
        </p>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 48px", textAlign: "center", backgroundColor: "#2A5A3B" }}>
        <p
          style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "28px",
            fontWeight: 700,
            fontStyle: "italic",
            color: "#FDF9F1",
            marginBottom: "36px",
          }}
        >
          "Empieza a entenderte hoy."
        </p>

        <a
          href="/onboarding"
          style={{
            display: "inline-block",
            background: "#4CA861",
            color: "#FFFFFF",
            padding: "16px 52px",
            borderRadius: "4px",
            fontSize: "13px",
            fontWeight: 600,
            letterSpacing: "2px",
            textTransform: "uppercase",
            textDecoration: "none",
            fontFamily: "var(--font-dm-sans)",
            boxShadow: "0 0 12px rgba(76, 168, 97, 0.4), 0 4px 10px rgba(76, 168, 97, 0.2)",
            transition: "all 0.3s ease"
          }}
        >
          Probar demo
        </a>
      </section>
    </main >
  );
}