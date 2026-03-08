import Image from "next/image";

/* ─── Logo SVG ─── */
function MaryLogo({ size = 48, light = false }: { size?: number; light?: boolean }) {
  const c = light ? "#f8f4ed" : "#800020";
  return (
    <svg width={size} height={size * 0.85} viewBox="0 0 80 68" fill="none" aria-label="Mary logo">
      <path d="M40 16c0 0-4-5-8-3s-4 7 0 10l8 6.5 8-6.5c4-3 4-7.5 0-10s-8 3-8 3z" fill={c} />
      <path d="M6 62 L6 30 L40 54 L74 30 L74 62" stroke={c} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/* ─── Voice Bars ─── */
function VoiceBars({ light = false }: { light?: boolean }) {
  const c = light ? "#f8f4ed" : "#800020";
  const heights = [10, 18, 28, 38, 28, 18, 10, 24, 38, 24];
  const delays =  [0, 0.1, 0.2, 0.3, 0.4, 0.3, 0.2, 0.15, 0.25, 0.1];
  return (
    <div className="flex items-center gap-[3px]" style={{ height: 40 }}>
      {heights.map((h, i) => (
        <span key={i} style={{
          display: "inline-block", width: "3px", height: `${h}px`,
          backgroundColor: c, borderRadius: "2px",
          animation: `voice-bar 1.4s ease-in-out ${delays[i]}s infinite`,
          transformOrigin: "center",
        }} />
      ))}
    </div>
  );
}

/* ─── Phone Mockup ─── */
function PhoneMockup() {
  return (
    <div className="relative mx-auto" style={{
      width: 290,
      transform: "rotate(-4deg)",
      filter: "drop-shadow(0 40px 60px rgba(28,10,8,0.28))",
    }}>
      <div className="relative overflow-hidden" style={{
        backgroundColor: "#0a0a0a",
        borderRadius: 52,
        border: "10px solid #181818",
        boxShadow: "inset 0 0 0 1.5px #2a2a2a, 0 0 0 1px #0a0a0a",
      }}>
        {/* Dynamic island */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10"
          style={{ width: 88, height: 26, borderRadius: 20, backgroundColor: "#0a0a0a" }} />
        <Image
          src="/app-screenshot.png"
          alt="Mary — guía turística con voz"
          width={290} height={580}
          className="w-full block"
          style={{ borderRadius: 42, display: "block" }}
          priority
        />
      </div>
      {/* Screen shine */}
      <div className="absolute inset-0 pointer-events-none" style={{
        borderRadius: 52,
        background: "linear-gradient(135deg, rgba(255,255,255,0.09) 0%, transparent 40%)",
      }} />
    </div>
  );
}

/* ─── Destination Ticker ─── */
const destinations = ["Roma", "París", "Lisboa", "Tokio", "Barcelona", "Dubrovnik",
  "Kioto", "Sevilla", "Ámsterdam", "Marrakech", "Buenos Aires", "Praga"];

function Ticker() {
  const items = [...destinations, ...destinations]; // duplicate for seamless loop
  return (
    <div className="overflow-hidden border-y border-cream-border py-3 bg-cream">
      <div className="marquee-track flex items-center gap-0 whitespace-nowrap">
        {items.map((d, i) => (
          <span key={i} className="flex items-center gap-0">
            <span className="text-[11px] tracking-[0.22em] text-muted uppercase px-6"
              style={{ fontFamily: "var(--font-dm-sans)" }}>
              {d}
            </span>
            <span className="text-burgundy text-[8px]">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Navbar ─── */
function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cream/92 backdrop-blur-md border-b border-cream-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MaryLogo size={30} />
          <div>
            <span className="text-lg font-semibold tracking-[0.15em] text-burgundy leading-none block"
              style={{ fontFamily: "var(--font-cormorant)" }}>MARY</span>
            <p className="text-[8px] tracking-[0.2em] text-muted uppercase leading-none mt-0.5"
              style={{ fontFamily: "var(--font-dm-sans)" }}>Tu compañera de viaje</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {[["#como-funciona","Cómo funciona"],["#funcionalidades","Funcionalidades"]].map(([h,l]) => (
            <a key={h} href={h} className="text-sm text-muted hover:text-ink transition-colors"
              style={{ fontFamily: "var(--font-dm-sans)" }}>{l}</a>
          ))}
          <a href="#descargar"
            className="px-5 py-2 bg-ink text-cream text-sm rounded-full hover:bg-burgundy transition-colors font-medium"
            style={{ fontFamily: "var(--font-dm-sans)" }}>Descargar app</a>
        </div>
        <a href="#descargar"
          className="md:hidden px-4 py-1.5 bg-ink text-cream text-sm rounded-full font-medium"
          style={{ fontFamily: "var(--font-dm-sans)" }}>Descargar</a>
      </div>
    </nav>
  );
}

/* ─── Hero ─── */
function Hero() {
  return (
    <section className="pt-16 bg-cream relative overflow-hidden">
      {/* Decorative orb — top right */}
      <div className="absolute top-0 right-0 w-[900px] h-[900px] pointer-events-none" style={{
        background: "radial-gradient(ellipse at 75% 15%, rgba(193,154,155,0.22) 0%, transparent 60%)",
        transform: "translate(20%, -20%)",
      }} />
      {/* Decorative orb — bottom left */}
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] pointer-events-none" style={{
        background: "radial-gradient(ellipse at 20% 80%, rgba(128,0,32,0.06) 0%, transparent 60%)",
      }} />

      {/* MARY watermark */}
      <div className="absolute inset-0 flex items-center justify-end pointer-events-none overflow-hidden">
        <span className="text-burgundy select-none" style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: "clamp(160px, 22vw, 260px)",
          fontWeight: 700,
          opacity: 0.035,
          letterSpacing: "0.05em",
          lineHeight: 1,
          transform: "translateX(8%) translateY(-5%)",
          userSelect: "none",
        }}>MARY</span>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center py-24 lg:py-32">

          {/* Left — copy */}
          <div className="flex flex-col">
            <div className="animate-fade-up flex items-center gap-3 mb-8 self-start">
              <VoiceBars />
              <span className="text-[11px] tracking-[0.22em] text-burgundy uppercase font-medium"
                style={{ fontFamily: "var(--font-dm-sans)" }}>Activada por voz · IA</span>
            </div>

            <h1 className="animate-fade-up delay-100 text-ink mb-6"
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "clamp(3.2rem, 6.5vw, 5.5rem)",
                fontWeight: 600,
                lineHeight: 1.05,
                letterSpacing: "-0.01em",
              }}>
              ¿Lista para tu
              <br />
              <em style={{ color: "#800020", fontStyle: "italic" }}>próximo</em>
              <br />
              viaje?
            </h1>

            <p className="animate-fade-up delay-200 text-[15px] leading-[1.85] mb-8"
              style={{ fontFamily: "var(--font-dm-sans)", color: "#7a6254", maxWidth: 420 }}>
              Conoce a Mary, tu asistente personal de IA. Ella se encarga de los detalles{" "}
              <strong style={{ color: "#1c0a08", fontWeight: 500 }}>(vuelos, accesibilidad, rutas sin escaleras)</strong>{" "}
              para que tú solo disfrutes.
            </p>

            <div className="animate-fade-up delay-300 flex flex-wrap gap-3 mb-10">
              <a href="#descargar" className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-sm font-semibold transition-all hover:-translate-y-0.5"
                style={{ fontFamily: "var(--font-dm-sans)", backgroundColor: "#800020", color: "#f8f4ed",
                  boxShadow: "0 8px 24px rgba(128,0,32,0.3)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06C18.95 10 18.2 12.77 19 14.62c.8 1.85 2.29 2.24 2.29 2.24-.42 1.14-.97 2.24-1.58 2.64zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                App Store
              </a>
              <a href="#descargar" className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-sm font-semibold transition-all hover:bg-cream-alt"
                style={{ fontFamily: "var(--font-dm-sans)", border: "2px solid #1c0a08", color: "#1c0a08" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.18 23.76c.33.18.7.24 1.07.17l12.94-7.48-2.93-2.93-11.08 10.24zm16.93-11.09L17.4 11.2 14.2 14.4l2.93 2.93 2.97-1.71c.85-.49.85-1.86.01-2.95zM.97.47C.67.8.5 1.3.5 1.95v20.1c0 .65.17 1.15.47 1.48l.08.07L12.3 12.35v-.26L1.05.4l-.08.07zm11.6 11.35L3.18.47c.33-.18.7-.24 1.07-.17l12.94 7.48-2.99 2.93-2.63-.89z"/>
                </svg>
                Google Play
              </a>
            </div>

            <div className="animate-fade-up delay-400 flex items-center gap-8 pt-7"
              style={{ borderTop: "1px solid #d9d0c0", fontFamily: "var(--font-dm-sans)" }}>
              {[
                { n: "10k+", label: "Viajeras activas" },
                { n: "4.9★", label: "Valoración" },
                { n: "50+", label: "Destinos" },
              ].map((s, i) => (
                <div key={s.n} className="flex items-center gap-3">
                  {i > 0 && <div style={{ width: 1, height: 28, backgroundColor: "#d9d0c0" }} />}
                  <div>
                    <p className="text-xl font-semibold" style={{ color: "#800020" }}>{s.n}</p>
                    <p className="text-[11px]" style={{ color: "#7a6254" }}>{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — phone */}
          <div className="animate-fade-in delay-300 flex justify-center lg:justify-end lg:pr-4">
            <PhoneMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Features ─── */
function Features() {
  const features = [
    { num: "01", icon: "✈️", title: "Vuelos y logística", desc: "Busca y compara vuelos, trenes y transportes adaptados a ti, sin pantallas confusas." },
    { num: "02", icon: "♿", title: "Accesibilidad total", desc: "Rutas sin escaleras, hoteles adaptados, restaurantes con rampas. Ningún detalle olvidado." },
    { num: "03", icon: "🗺️", title: "Tu guía local", desc: "Rincones secretos, historias del lugar y recomendaciones personalizadas para tu estilo." },
    { num: "04", icon: "🎙️", title: "Solo habla con ella", desc: "Sin formularios ni botones. Dile a Mary lo que necesitas y ella lo resuelve en segundos." },
    { num: "05", icon: "🧠", title: "Aprende de ti", desc: "Mary recuerda tus preferencias y el ritmo que te gusta. Cada viaje es más fácil que el anterior." },
    { num: "06", icon: "🌍", title: "50+ destinos", desc: "De Roma a Buenos Aires, de Tokio a Sevilla. Mary te acompaña en cualquier rincón del mundo." },
  ];

  return (
    <section id="funcionalidades" className="py-24" style={{ backgroundColor: "#f0ebe0" }}>
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16 gap-6">
          <div>
            <p className="text-[11px] tracking-[0.28em] uppercase mb-3 font-medium"
              style={{ fontFamily: "var(--font-dm-sans)", color: "#800020" }}>Funcionalidades</p>
            <h2 style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(2rem,4vw,3.25rem)", fontWeight: 600, color: "#1c0a08", lineHeight: 1.1 }}>
              Todo lo que Mary hace<br />
              <em style={{ color: "#800020" }}>por ti</em>
            </h2>
          </div>
          <p className="text-sm leading-relaxed max-w-xs" style={{ fontFamily: "var(--font-dm-sans)", color: "#7a6254" }}>
            Diseñada para que te concentres en vivir la experiencia, mientras ella resuelve los imprevistos.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px" style={{ backgroundColor: "#d9d0c0" }}>
          {features.map((f) => (
            <div key={f.title} className="group relative p-7 transition-all duration-300"
              style={{ backgroundColor: "#f8f4ed" }}>
              {/* Hover fill */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ backgroundColor: "#1c0a08" }} />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-5">
                  <span className="text-xl">{f.icon}</span>
                  <span className="text-[11px] font-medium tracking-widest group-hover:text-rose"
                    style={{ fontFamily: "var(--font-dm-sans)", color: "#c19a9b" }}>{f.num}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-cream"
                  style={{ fontFamily: "var(--font-cormorant)", color: "#1c0a08" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed group-hover:text-cream/70"
                  style={{ fontFamily: "var(--font-dm-sans)", color: "#7a6254" }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How it works ─── */
function HowItWorks() {
  const steps = [
    { num: "01", title: "Descarga Mary", desc: "Disponible en iOS y Android. Crea tu perfil en menos de 2 minutos." },
    { num: "02", title: "Cuéntale tu viaje", desc: '"Me voy a Lisboa. Me cuesta caminar. Quiero rutas accesibles y un buen hotel."' },
    { num: "03", title: "Disfruta sin preocupaciones", desc: "Mary organiza vuelos, rutas, alojamiento y guía local — todo adaptado a ti." },
  ];

  return (
    <section id="como-funciona" className="py-24 bg-cream relative overflow-hidden">
      {/* Large decorative background number */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none select-none hidden lg:block" style={{
        fontFamily: "var(--font-cormorant)",
        fontSize: 380,
        fontWeight: 700,
        color: "rgba(128,0,32,0.04)",
        lineHeight: 1,
        transform: "translateY(-50%) translateX(15%)",
        userSelect: "none",
      }}>3</div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <p className="text-[11px] tracking-[0.28em] uppercase mb-3 font-medium"
            style={{ fontFamily: "var(--font-dm-sans)", color: "#800020" }}>Cómo funciona</p>
          <h2 style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(2rem,4vw,3.25rem)", fontWeight: 600, color: "#1c0a08", lineHeight: 1.1 }}>
            Tres pasos para<br />
            <em style={{ color: "#800020" }}>viajar diferente</em>
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-0" style={{ borderTop: "1px solid #d9d0c0" }}>
          {steps.map((step, i) => (
            <div key={step.num} className="pt-10 pb-8 relative"
              style={{ paddingLeft: i === 0 ? 0 : 40, paddingRight: i === 2 ? 0 : 40,
                borderLeft: i > 0 ? "1px solid #d9d0c0" : "none" }}>
              <p style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "clamp(4rem,7vw,6rem)",
                fontWeight: 700,
                color: "rgba(128,0,32,0.12)",
                lineHeight: 1,
                marginBottom: "0.5rem",
              }}>{step.num}</p>
              <h3 className="text-2xl font-semibold mb-3" style={{ fontFamily: "var(--font-cormorant)", color: "#1c0a08" }}>
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ fontFamily: "var(--font-dm-sans)", color: "#7a6254" }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ─── */
function Testimonials() {
  const testimonials = [
    { quote: "Mary me ayudó a planear Roma en una sola conversación. Hoteles con ascensor, restaurantes con rampas. ¡Increíble!", name: "Carmen R.", location: "Madrid", initial: "C" },
    { quote: "Viajo sola desde hace años. Con Mary me siento acompañada. Es como tener una amiga que lo sabe todo sobre cada destino.", name: "Ana M.", location: "Barcelona", initial: "A" },
    { quote: "Le pregunté rutas sin escaleras en Japón. En segundos tenía un itinerario completo. No puedo creer que sea tan sencillo.", name: "Lucía P.", location: "Buenos Aires", initial: "L" },
  ];

  return (
    <section style={{ backgroundColor: "#f0ebe0" }} className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
          {/* Left label */}
          <div className="lg:w-56 shrink-0">
            <p className="text-[11px] tracking-[0.28em] uppercase mb-3 font-medium"
              style={{ fontFamily: "var(--font-dm-sans)", color: "#800020" }}>Historias reales</p>
            <h2 style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(1.8rem,3vw,2.8rem)", fontWeight: 600, color: "#1c0a08", lineHeight: 1.1 }}>
              Lo que dicen nuestras<br />
              <em style={{ color: "#800020" }}>viajeras</em>
            </h2>
            <div className="mt-6 flex gap-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} width="14" height="14" viewBox="0 0 10 10" fill="#800020">
                  <path d="M5 0l1.12 3.44H9.76L6.82 5.57l1.09 3.43L5 6.85 2.09 9 3.18 5.57.24 3.44H3.88z" />
                </svg>
              ))}
              <span className="text-xs ml-1" style={{ fontFamily: "var(--font-dm-sans)", color: "#7a6254" }}>4.9 / 5</span>
            </div>
          </div>

          {/* Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 flex-1">
            {testimonials.map((t, i) => (
              <div key={t.name} className="flex flex-col gap-4 p-6 rounded-2xl relative"
                style={{ backgroundColor: i === 1 ? "#800020" : "#f8f4ed",
                  border: i === 1 ? "none" : "1px solid #d9d0c0" }}>
                <span style={{
                  fontFamily: "var(--font-cormorant)",
                  fontSize: "4rem",
                  lineHeight: 0.8,
                  color: i === 1 ? "rgba(248,244,237,0.3)" : "rgba(193,154,155,0.6)",
                }}>&ldquo;</span>
                <p className="text-sm leading-[1.8] flex-1"
                  style={{ fontFamily: "var(--font-dm-sans)", color: i === 1 ? "#f8f4ed" : "#1c0a08" }}>
                  {t.quote}
                </p>
                <div className="flex items-center gap-3 pt-3" style={{ borderTop: `1px solid ${i === 1 ? "rgba(248,244,237,0.2)" : "#d9d0c0"}` }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
                    style={{ backgroundColor: i === 1 ? "rgba(248,244,237,0.15)" : "#800020",
                      color: "#f8f4ed", fontFamily: "var(--font-dm-sans)" }}>
                    {t.initial}
                  </div>
                  <div style={{ fontFamily: "var(--font-dm-sans)" }}>
                    <p className="text-sm font-medium" style={{ color: i === 1 ? "#f8f4ed" : "#1c0a08" }}>{t.name}</p>
                    <p className="text-xs" style={{ color: i === 1 ? "rgba(248,244,237,0.6)" : "#7a6254" }}>{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Download CTA ─── */
function DownloadCTA() {
  return (
    <section id="descargar" className="relative overflow-hidden" style={{ backgroundColor: "#1c0a08" }}>
      {/* Background destinations text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
        <div style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: "clamp(80px,12vw,140px)",
          fontWeight: 700,
          color: "rgba(248,244,237,0.025)",
          letterSpacing: "0.05em",
          whiteSpace: "nowrap",
          userSelect: "none",
        }}>VIAJA CON MARY</div>
      </div>

      {/* Decorative top border */}
      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(193,154,155,0.4), transparent)" }} />

      <div className="max-w-3xl mx-auto px-6 py-24 text-center relative z-10">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <MaryLogo size={52} light />
            <div className="absolute -inset-4 rounded-full pointer-events-none" style={{
              border: "1px solid rgba(193,154,155,0.2)",
              animation: "pulse-ring 3s ease-out infinite",
            }} />
          </div>
        </div>

        <h2 className="mb-4" style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: "clamp(2.5rem,5.5vw,4.5rem)",
          fontWeight: 600, color: "#f8f4ed", lineHeight: 1.05,
        }}>
          Tu próximo viaje<br />
          <em style={{ color: "#c19a9b" }}>empieza aquí</em>
        </h2>

        <p className="mb-10 mx-auto" style={{
          fontFamily: "var(--font-dm-sans)", color: "rgba(193,154,155,0.8)",
          fontSize: 15, lineHeight: 1.8, maxWidth: 380,
        }}>
          Descarga Mary gratis y empieza a planear tu aventura.<br />
          Sin tarjeta de crédito. Sin complicaciones.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#" className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full text-sm font-semibold transition-all hover:-translate-y-0.5"
            style={{ fontFamily: "var(--font-dm-sans)", backgroundColor: "#f8f4ed", color: "#1c0a08",
              boxShadow: "0 8px 32px rgba(248,244,237,0.15)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06C18.95 10 18.2 12.77 19 14.62c.8 1.85 2.29 2.24 2.29 2.24-.42 1.14-.97 2.24-1.58 2.64zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Descargar en App Store
          </a>
          <a href="#" className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full text-sm font-semibold transition-all hover:bg-cream/10"
            style={{ fontFamily: "var(--font-dm-sans)", border: "1.5px solid rgba(248,244,237,0.25)", color: "#f8f4ed" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.18 23.76c.33.18.7.24 1.07.17l12.94-7.48-2.93-2.93-11.08 10.24zm16.93-11.09L17.4 11.2 14.2 14.4l2.93 2.93 2.97-1.71c.85-.49.85-1.86.01-2.95zM.97.47C.67.8.5 1.3.5 1.95v20.1c0 .65.17 1.15.47 1.48l.08.07L12.3 12.35v-.26L1.05.4l-.08.07zm11.6 11.35L3.18.47c.33-.18.7-.24 1.07-.17l12.94 7.48-2.99 2.93-2.63-.89z"/>
            </svg>
            Disponible en Google Play
          </a>
        </div>

        <p className="mt-8 text-[12px]"
          style={{ fontFamily: "var(--font-dm-sans)", color: "rgba(193,154,155,0.45)" }}>
          Próximamente · Regístrate para acceso anticipado
        </p>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer style={{ backgroundColor: "#0f0604" }} className="py-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div style={{ opacity: 0.6 }}><MaryLogo size={26} light /></div>
            <div>
              <span className="text-base font-semibold tracking-[0.15em] leading-none block"
                style={{ fontFamily: "var(--font-cormorant)", color: "#f8f4ed" }}>MARY</span>
              <p className="text-[8px] tracking-[0.2em] uppercase leading-none mt-0.5"
                style={{ fontFamily: "var(--font-dm-sans)", color: "#7a6254" }}>Tu compañera de viaje</p>
            </div>
          </div>
          <nav className="flex items-center gap-6 text-xs" style={{ fontFamily: "var(--font-dm-sans)", color: "#7a6254" }}>
            {["Privacidad","Términos","Contacto"].map(l => (
              <a key={l} href="#" className="hover:text-rose transition-colors">{l}</a>
            ))}
          </nav>
          <p className="text-xs" style={{ fontFamily: "var(--font-dm-sans)", color: "rgba(122,98,84,0.45)" }}>
            © {new Date().getFullYear()} Mary. Hecho con ♥ para viajeras.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ─── */
export default function Home() {
  return (
    <main className="grain-overlay">
      <Navbar />
      <Hero />
      <Ticker />
      <Features />
      <HowItWorks />
      <Testimonials />
      <DownloadCTA />
      <Footer />
    </main>
  );
}
