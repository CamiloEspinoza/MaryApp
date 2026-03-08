import Image from "next/image";

/* ─── Logo SVG ─── */
function MaryLogo({
  size = 48,
  light = false,
}: {
  size?: number;
  light?: boolean;
}) {
  const color = light ? "#f8f4ed" : "#800020";
  return (
    <svg
      width={size}
      height={size * 0.85}
      viewBox="0 0 80 68"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Mary logo"
    >
      <path
        d="M40 16c0 0-4-5-8-3s-4 7 0 10l8 6.5 8-6.5c4-3 4-7.5 0-10s-8 3-8 3z"
        fill={color}
      />
      <path
        d="M6 62 L6 30 L40 54 L74 30 L74 62"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/* ─── Voice Bars ─── */
function VoiceBars({ light = false }: { light?: boolean }) {
  const color = light ? "#f8f4ed" : "#800020";
  const heights = [10, 18, 28, 36, 28, 18, 10, 22, 36, 22];
  const delays = [0, 0.1, 0.2, 0.3, 0.4, 0.3, 0.2, 0.15, 0.25, 0.1];
  return (
    <div className="flex items-center gap-[3px]" style={{ height: 40 }}>
      {heights.map((h, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            width: "3px",
            height: `${h}px`,
            backgroundColor: color,
            borderRadius: "2px",
            animation: `voice-bar 1.4s ease-in-out ${delays[i]}s infinite`,
            transformOrigin: "center",
          }}
        />
      ))}
    </div>
  );
}

/* ─── Phone Mockup ─── */
function PhoneMockup() {
  return (
    <div
      className="relative mx-auto"
      style={{ width: 280, filter: "drop-shadow(0 32px 52px rgba(0,0,0,0.25))" }}
    >
      {/* Phone outer frame */}
      <div
        className="relative overflow-hidden"
        style={{
          backgroundColor: "#0a0a0a",
          borderRadius: 50,
          border: "10px solid #1a1a1a",
          boxShadow: "inset 0 0 0 1px #2a2a2a",
        }}
      >
        {/* Dynamic island */}
        <div
          className="absolute top-3 left-1/2 -translate-x-1/2 z-10"
          style={{ width: 88, height: 26, borderRadius: 20, backgroundColor: "#0a0a0a" }}
        />

        {/* Real app screenshot */}
        <Image
          src="/app-screenshot.png"
          alt="Mary app en acción — guía turística con voz"
          width={280}
          height={560}
          className="w-full block"
          style={{ borderRadius: 40, display: "block" }}
          priority
        />
      </div>

      {/* Reflection shine */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          borderRadius: 50,
          background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 45%)",
        }}
      />
    </div>
  );
}

/* ─── Navbar ─── */
function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cream/90 backdrop-blur-md border-b border-cream-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MaryLogo size={32} />
          <div>
            <span
              className="font-display text-lg font-semibold tracking-[0.14em] text-burgundy leading-none block"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              MARY
            </span>
            <p
              className="text-[8px] tracking-[0.18em] text-muted uppercase leading-none mt-0.5"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Tu compañera de viaje
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#como-funciona"
            className="text-sm text-muted hover:text-burgundy transition-colors"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Cómo funciona
          </a>
          <a
            href="#funcionalidades"
            className="text-sm text-muted hover:text-burgundy transition-colors"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Funcionalidades
          </a>
          <a
            href="#descargar"
            className="px-5 py-2 bg-burgundy text-cream text-sm rounded-full hover:bg-burgundy-hover transition-colors font-medium"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Descargar app
          </a>
        </div>
        <a
          href="#descargar"
          className="md:hidden px-4 py-1.5 bg-burgundy text-cream text-sm rounded-full font-medium"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          Descargar
        </a>
      </div>
    </nav>
  );
}

/* ─── Hero ─── */
function Hero() {
  return (
    <section className="pt-16 bg-cream overflow-hidden">
      {/* Subtle radial bg */}
      <div
        className="absolute top-0 right-0 w-[700px] h-[700px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 80% 20%, rgba(193,154,155,0.18) 0%, transparent 65%)",
        }}
      />

      <div className="max-w-6xl mx-auto px-6 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center py-20 lg:py-28">
          {/* Left — copy */}
          <div className="flex flex-col">
            {/* Label */}
            <div className="animate-fade-up flex items-center gap-3 mb-8 self-start">
              <VoiceBars />
              <span
                className="text-[11px] tracking-[0.2em] text-burgundy uppercase font-medium"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                Activada por voz · IA
              </span>
            </div>

            {/* Headline */}
            <h1
              className="animate-fade-up delay-100 text-[clamp(3rem,6vw,5rem)] font-semibold leading-[1.08] text-ink mb-6"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              ¿Lista para tu
              <br />
              <span className="text-burgundy italic">próximo</span>
              <br />
              viaje?
            </h1>

            {/* Description */}
            <p
              className="animate-fade-up delay-200 text-[15px] text-muted leading-[1.8] mb-8 max-w-[420px]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Conoce a Mary, tu asistente personal de IA. Ella se encarga de
              los detalles{" "}
              <strong className="text-ink font-medium">
                (vuelos, accesibilidad, rutas sin escaleras)
              </strong>{" "}
              para que tú solo disfrutes.
            </p>

            {/* CTAs */}
            <div className="animate-fade-up delay-300 flex flex-wrap gap-3 mb-10">
              <a
                href="#descargar"
                className="inline-flex items-center gap-2.5 px-6 py-3 bg-burgundy text-cream rounded-full text-sm font-medium hover:bg-burgundy-hover transition-all hover:shadow-lg hover:-translate-y-0.5"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06C18.95 10 18.2 12.77 19 14.62c.8 1.85 2.29 2.24 2.29 2.24-.42 1.14-.97 2.24-1.58 2.64zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                App Store
              </a>
              <a
                href="#descargar"
                className="inline-flex items-center gap-2.5 px-6 py-3 border-2 border-burgundy text-burgundy rounded-full text-sm font-medium hover:bg-burgundy-light transition-all"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.18 23.76c.33.18.7.24 1.07.17l12.94-7.48-2.93-2.93-11.08 10.24zm16.93-11.09L17.4 11.2 14.2 14.4l2.93 2.93 2.97-1.71c.85-.49.85-1.86.01-2.95zM.97.47C.67.8.5 1.3.5 1.95v20.1c0 .65.17 1.15.47 1.48l.08.07L12.3 12.35v-.26L1.05.4l-.08.07zm11.6 11.35L3.18.47c.33-.18.7-.24 1.07-.17l12.94 7.48-2.99 2.93-2.63-.89z" />
                </svg>
                Google Play
              </a>
            </div>

            {/* Stats */}
            <div
              className="animate-fade-up delay-400 flex items-center gap-6 pt-8 border-t border-cream-border"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              {[
                { n: "10k+", label: "Viajeras activas" },
                { n: "4.9★", label: "Valoración media" },
                { n: "50+", label: "Destinos" },
              ].map((s) => (
                <div key={s.n}>
                  <p className="text-xl font-semibold text-burgundy">{s.n}</p>
                  <p className="text-[11px] text-muted">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — phone mockup */}
          <div className="animate-fade-in delay-300 flex justify-center lg:justify-end pr-0 lg:pr-8">
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
    {
      icon: "✈️",
      title: "Vuelos y logística",
      desc: "Busca y compara vuelos, trenes y transportes adaptados a ti. Sin pantallas confusas.",
    },
    {
      icon: "♿",
      title: "Accesibilidad total",
      desc: "Rutas sin escaleras, hoteles adaptados, restaurantes con rampas. Ningún detalle olvidado.",
    },
    {
      icon: "🗺️",
      title: "Tu guía local",
      desc: "Rincones secretos, historias del lugar y recomendaciones personalizadas para tu estilo.",
    },
    {
      icon: "🎙️",
      title: "Solo habla con ella",
      desc: "Sin formularios ni botones. Dile a Mary lo que necesitas y ella lo resuelve en segundos.",
    },
    {
      icon: "🧠",
      title: "Aprende de ti",
      desc: "Mary recuerda tus preferencias y el ritmo que te gusta. Cada viaje es más fácil.",
    },
    {
      icon: "🌍",
      title: "50+ destinos",
      desc: "De Roma a Buenos Aires, de Tokio a Sevilla. Mary te acompaña en cualquier rincón.",
    },
  ];

  return (
    <section id="funcionalidades" className="py-24 bg-cream-alt">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <p
            className="text-[11px] tracking-[0.25em] text-burgundy uppercase mb-3 font-medium"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Funcionalidades
          </p>
          <h2
            className="text-[clamp(2rem,4vw,3.25rem)] font-semibold text-ink leading-tight"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Todo lo que Mary hace
            <br />
            <span className="text-burgundy italic">por ti</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-cream rounded-2xl p-6 border border-cream-border hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3
                className="text-xl font-semibold text-ink mb-2"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                {f.title}
              </h3>
              <p
                className="text-sm text-muted leading-relaxed"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                {f.desc}
              </p>
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
    {
      num: "01",
      title: "Descarga Mary",
      desc: "Disponible en iOS y Android. Crea tu perfil en menos de 2 minutos.",
      emoji: "📱",
    },
    {
      num: "02",
      title: "Cuéntale tu viaje",
      desc: '"Me voy una semana a Lisboa. Me cuesta caminar mucho y quiero rutas accesibles."',
      emoji: "🎙️",
    },
    {
      num: "03",
      title: "Disfruta sin preocupaciones",
      desc: "Mary organiza todo: vuelos, rutas, alojamiento y guía local adaptados a ti.",
      emoji: "🌍",
    },
  ];

  return (
    <section id="como-funciona" className="py-24 bg-cream">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <p
            className="text-[11px] tracking-[0.25em] text-burgundy uppercase mb-3 font-medium"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Cómo funciona
          </p>
          <h2
            className="text-[clamp(2rem,4vw,3.25rem)] font-semibold text-ink leading-tight"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Tres pasos para
            <br />
            <span className="text-burgundy italic">viajar diferente</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={step.num} className="relative">
              {/* Connector */}
              {i < steps.length - 1 && (
                <div className="absolute top-7 left-14 right-0 h-px bg-cream-border hidden lg:block" />
              )}
              <div className="flex lg:flex-col gap-5">
                <div className="shrink-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-burgundy shadow-lg flex flex-col items-center justify-center gap-0">
                    <span className="text-lg">{step.emoji}</span>
                  </div>
                </div>
                <div>
                  <p
                    className="text-[11px] tracking-[0.18em] text-burgundy/60 uppercase mb-1 font-medium"
                    style={{ fontFamily: "var(--font-dm-sans)" }}
                  >
                    {step.num}
                  </p>
                  <h3
                    className="text-2xl font-semibold text-ink mb-2"
                    style={{ fontFamily: "var(--font-cormorant)" }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="text-sm text-muted leading-relaxed"
                    style={{ fontFamily: "var(--font-dm-sans)" }}
                  >
                    {step.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Social proof ─── */
function Testimonials() {
  const testimonials = [
    {
      quote:
        "Mary me ayudó a planear Roma en una sola conversación. Encontró hoteles con ascensor y restaurantes con rampas. ¡Increíble!",
      name: "Carmen R.",
      location: "Madrid",
      avatar: "C",
    },
    {
      quote:
        "Viajo sola desde hace años. Con Mary me siento acompañada. Es como tener una amiga que lo sabe todo sobre cada destino.",
      name: "Ana M.",
      location: "Barcelona",
      avatar: "A",
    },
    {
      quote:
        "Le pregunté rutas sin escaleras en Japón. En segundos tenía un itinerario completo. No puedo creer que sea tan sencillo.",
      name: "Lucía P.",
      location: "Buenos Aires",
      avatar: "L",
    },
  ];

  return (
    <section className="py-24 bg-cream-alt">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <p
            className="text-[11px] tracking-[0.25em] text-burgundy uppercase mb-3 font-medium"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Historias reales
          </p>
          <h2
            className="text-[clamp(2rem,4vw,3.25rem)] font-semibold text-ink leading-tight"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Lo que dicen nuestras
            <br />
            <span className="text-burgundy italic">compañeras de viaje</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-cream rounded-2xl p-6 border border-cream-border flex flex-col gap-4"
            >
              <span
                className="text-5xl text-rose leading-none font-display"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                &ldquo;
              </span>
              <p
                className="text-sm text-ink leading-[1.75] flex-1"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                {t.quote}
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-cream-border">
                <div className="w-8 h-8 rounded-full bg-burgundy flex items-center justify-center text-cream text-sm font-semibold shrink-0">
                  {t.avatar}
                </div>
                <div style={{ fontFamily: "var(--font-dm-sans)" }}>
                  <p className="text-sm font-medium text-ink">{t.name}</p>
                  <p className="text-xs text-muted">{t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Download CTA ─── */
function DownloadCTA() {
  return (
    <section id="descargar" className="py-24 bg-burgundy relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 15% 50%, rgba(255,255,255,0.6) 0%, transparent 50%), radial-gradient(ellipse at 85% 20%, rgba(193,154,155,0.8) 0%, transparent 50%)",
        }}
      />

      <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
        <div className="flex justify-center mb-6">
          <MaryLogo size={52} light />
        </div>
        <h2
          className="text-[clamp(2.2rem,5vw,4rem)] font-semibold text-cream leading-tight mb-4"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          Tu próximo viaje
          <br />
          <em>empieza aquí</em>
        </h2>
        <p
          className="text-rose text-[15px] mb-10 max-w-sm mx-auto leading-relaxed"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          Descarga Mary gratis y empieza a planear tu aventura.
          Sin tarjeta de crédito. Sin complicaciones.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#"
            className="inline-flex items-center justify-center gap-3 px-7 py-3.5 bg-cream text-burgundy rounded-full text-sm font-semibold hover:bg-white transition-all hover:shadow-xl hover:-translate-y-0.5"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06C18.95 10 18.2 12.77 19 14.62c.8 1.85 2.29 2.24 2.29 2.24-.42 1.14-.97 2.24-1.58 2.64zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            Descargar en App Store
          </a>
          <a
            href="#"
            className="inline-flex items-center justify-center gap-3 px-7 py-3.5 border-2 border-cream/40 text-cream rounded-full text-sm font-semibold hover:bg-cream/10 transition-all"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.18 23.76c.33.18.7.24 1.07.17l12.94-7.48-2.93-2.93-11.08 10.24zm16.93-11.09L17.4 11.2 14.2 14.4l2.93 2.93 2.97-1.71c.85-.49.85-1.86.01-2.95zM.97.47C.67.8.5 1.3.5 1.95v20.1c0 .65.17 1.15.47 1.48l.08.07L12.3 12.35v-.26L1.05.4l-.08.07zm11.6 11.35L3.18.47c.33-.18.7-.24 1.07-.17l12.94 7.48-2.99 2.93-2.63-.89z" />
            </svg>
            Disponible en Google Play
          </a>
        </div>

        <p
          className="mt-8 text-rose/60 text-xs"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          Disponible pronto · Regístrate para acceso anticipado
        </p>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="bg-text py-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="opacity-70">
              <MaryLogo size={26} light />
            </div>
            <div>
              <span
                className="text-base font-semibold tracking-[0.14em] text-cream leading-none block"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                MARY
              </span>
              <p
                className="text-[8px] tracking-[0.18em] text-muted uppercase leading-none mt-0.5"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                Tu compañera de viaje
              </p>
            </div>
          </div>

          <nav
            className="flex items-center gap-6 text-xs text-muted"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            <a href="#" className="hover:text-rose transition-colors">Privacidad</a>
            <a href="#" className="hover:text-rose transition-colors">Términos</a>
            <a href="#" className="hover:text-rose transition-colors">Contacto</a>
          </nav>

          <p
            className="text-xs text-muted/50"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
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
    <main>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <DownloadCTA />
      <Footer />
    </main>
  );
}
