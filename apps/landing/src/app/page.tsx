import Image from "next/image";

/* ─── Logo SVG ─── */
function MaryLogo({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size * 0.85}
      viewBox="0 0 80 68"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Mary logo"
    >
      {/* Heart at top center */}
      <path
        d="M40 14c0 0-6-7-12-4s-6 10 0 14l12 10 12-10c6-4 6-11 0-14s-12 4-12 4z"
        fill="#800020"
        opacity="0.15"
      />
      <path
        d="M40 16c0 0-4-5-8-3s-4 7 0 10l8 6.5 8-6.5c4-3 4-7.5 0-10s-8 3-8 3z"
        fill="#800020"
      />
      {/* M legs */}
      <path
        d="M6 62 L6 30 L40 54 L74 30 L74 62"
        stroke="#800020"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/* ─── Voice Waveform ─── */
function VoiceWave({ className = "" }: { className?: string }) {
  const bars = [14, 26, 38, 52, 38, 26, 14, 22, 44, 22];
  const delays = [0, 0.1, 0.2, 0.3, 0.4, 0.3, 0.2, 0.15, 0.25, 0.1];
  return (
    <div className={`flex items-center gap-[3px] ${className}`}>
      {bars.map((h, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            width: "3px",
            height: `${h}px`,
            backgroundColor: "#800020",
            borderRadius: "2px",
            animation: `voice-bar 1.4s ease-in-out ${delays[i]}s infinite`,
            transformOrigin: "center bottom",
          }}
        />
      ))}
    </div>
  );
}

/* ─── Navbar ─── */
function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cream/90 backdrop-blur-md border-b border-cream-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MaryLogo size={36} />
          <div>
            <span
              className="font-display text-xl font-semibold tracking-[0.12em] text-burgundy"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              MARY
            </span>
            <p
              className="text-[8px] tracking-[0.2em] text-text-muted font-sans uppercase -mt-0.5"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Tu compañera de viaje
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#como-funciona"
            className="text-sm text-text-muted hover:text-burgundy transition-colors"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Cómo funciona
          </a>
          <a
            href="#funcionalidades"
            className="text-sm text-text-muted hover:text-burgundy transition-colors"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Funcionalidades
          </a>
          <a
            href="#descargar"
            className="px-5 py-2 bg-burgundy text-cream text-sm rounded-full hover:bg-burgundy-hover transition-colors"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Descargar app
          </a>
        </div>
        {/* Mobile CTA */}
        <a
          href="#descargar"
          className="md:hidden px-4 py-1.5 bg-burgundy text-cream text-sm rounded-full"
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
    <section className="pt-16 min-h-screen bg-cream relative overflow-hidden">
      {/* Background circles */}
      <div
        className="absolute top-20 right-0 w-[600px] h-[600px] rounded-full opacity-20"
        style={{
          background:
            "radial-gradient(circle, #c19a9b 0%, transparent 70%)",
          transform: "translate(30%, -10%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-10"
        style={{
          background: "radial-gradient(circle, #800020 0%, transparent 70%)",
          transform: "translate(-30%, 30%)",
        }}
      />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-6 items-center min-h-[calc(100vh-64px)] py-16">
          {/* Left — copy */}
          <div className="flex flex-col justify-center">
            {/* Badge */}
            <div className="animate-fade-up inline-flex items-center gap-2 mb-6 self-start">
              <VoiceWave />
              <span
                className="text-xs tracking-[0.18em] text-burgundy uppercase font-medium"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                Activada por voz · IA
              </span>
            </div>

            {/* Headline */}
            <h1
              className="animate-fade-up delay-100 font-display text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.05] text-text mb-6"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              ¿Lista para tu
              <br />
              <em className="text-burgundy not-italic">próximo</em>
              <br />
              viaje?
            </h1>

            {/* Sub */}
            <p
              className="animate-fade-up delay-200 text-base sm:text-lg text-text-muted leading-relaxed mb-8 max-w-md"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Conoce a Mary, tu asistente personal de IA. Ella se encarga de
              los detalles{" "}
              <span className="text-text font-medium">
                (vuelos, accesibilidad, rutas sin escaleras)
              </span>{" "}
              para que tú solo disfrutes.
            </p>

            {/* CTA buttons */}
            <div className="animate-fade-up delay-300 flex flex-col sm:flex-row gap-3">
              <a
                href="#descargar"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-burgundy text-cream rounded-full text-sm font-medium hover:bg-burgundy-hover transition-all hover:shadow-lg hover:shadow-[#80002030] hover:-translate-y-0.5"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06C18.95 10 18.2 12.77 19 14.62c.8 1.85 2.29 2.24 2.29 2.24-.42 1.14-.97 2.24-1.58 2.64zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                App Store
              </a>
              <a
                href="#descargar"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border-2 border-burgundy text-burgundy rounded-full text-sm font-medium hover:bg-burgundy-light transition-all"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3.18 23.76c.33.18.7.24 1.07.17l12.94-7.48-2.93-2.93-11.08 10.24zm16.93-11.09L17.4 11.2 14.2 14.4l2.93 2.93 2.97-1.71c.85-.49.85-1.86.01-2.95zM.97.47C.67.8.5 1.3.5 1.95v20.1c0 .65.17 1.15.47 1.48l.08.07L12.3 12.35v-.26L1.05.4l-.08.07zm11.6 11.35L3.18.47c.33-.18.7-.24 1.07-.17l12.94 7.48-2.99 2.93-2.63-.89z" />
                </svg>
                Google Play
              </a>
            </div>

            {/* Social proof mini */}
            <div
              className="animate-fade-up delay-400 flex items-center gap-4 mt-8 pt-8 border-t border-cream-border"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              {[
                { n: "10k+", label: "viajeras activas" },
                { n: "4.9★", label: "valoración media" },
                { n: "50+", label: "destinos" },
              ].map((s) => (
                <div key={s.n} className="text-center flex-1">
                  <p className="text-xl font-semibold text-burgundy">{s.n}</p>
                  <p className="text-[11px] text-text-muted uppercase tracking-wider">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — hero image */}
          <div className="animate-fade-in delay-200 relative flex justify-center lg:justify-end">
            {/* Decorative ring */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="w-[380px] h-[380px] rounded-full border-2 border-rose opacity-30"
                style={{ animation: "pulse-ring 3s ease-out infinite" }}
              />
            </div>

            {/* Photo card */}
            <div className="relative w-[300px] sm:w-[360px] lg:w-[420px]">
              <div className="rounded-4xl overflow-hidden shadow-2xl shadow-[#80002020] border-4 border-white">
                <Image
                  src="/hero.jpeg"
                  alt="Mujer viajera usando Mary en un café europeo"
                  width={420}
                  height={580}
                  className="w-full object-cover object-top"
                  style={{ height: "520px" }}
                  priority
                />
              </div>

              {/* Floating card — voice active */}
              <div className="absolute -left-8 bottom-20 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 border border-cream-alt">
                <div className="relative">
                  <div className="w-9 h-9 bg-burgundy rounded-full flex items-center justify-center">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="white"
                    >
                      <path d="M12 1c-2.21 0-4 1.79-4 4v6c0 2.21 1.79 4 4 4s4-1.79 4-4V5c0-2.21-1.79-4-4-4zm6 10c0 3.31-2.69 6-6 6s-6-2.69-6-6H4c0 3.92 2.85 7.16 6.6 7.76V21h2.8v-2.24C17.15 18.16 20 14.92 20 11h-2z" />
                    </svg>
                  </div>
                  <div
                    className="absolute -inset-1 rounded-full bg-burgundy opacity-30"
                    style={{
                      animation: "pulse-ring 1.5s ease-out infinite",
                    }}
                  />
                </div>
                <div style={{ fontFamily: "var(--font-dm-sans)" }}>
                  <p className="text-[11px] text-text-muted">Mary está escuchando</p>
                  <p className="text-xs font-semibold text-text">
                    &ldquo;¿Hay escaleras?&rdquo;
                  </p>
                </div>
              </div>

              {/* Floating card — destination */}
              <div className="absolute -right-4 top-16 bg-white rounded-2xl shadow-xl px-4 py-3 border border-cream-alt">
                <p
                  className="text-[10px] text-text-muted mb-0.5"
                  style={{ fontFamily: "var(--font-dm-sans)" }}
                >
                  Destino sugerido
                </p>
                <p
                  className="text-sm font-semibold text-text"
                  style={{ fontFamily: "var(--font-dm-sans)" }}
                >
                  🗼 París, Francia
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg
                      key={i}
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="#800020"
                    >
                      <path d="M5 0l1.12 3.44H9.76L6.82 5.57l1.09 3.43L5 6.85 2.09 9 3.18 5.57.24 3.44H3.88z" />
                    </svg>
                  ))}
                  <span
                    className="text-[10px] text-text-muted ml-1"
                    style={{ fontFamily: "var(--font-dm-sans)" }}
                  >
                    4.9
                  </span>
                </div>
              </div>
            </div>
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
      desc: "Mary busca y compara vuelos, trenes y transportes adaptados a tus necesidades. Sin estrés, sin pantallas confusas.",
    },
    {
      icon: "♿",
      title: "Accesibilidad total",
      desc: "Rutas sin escaleras, hoteles con acceso adaptado, restaurantes con rampas. Mary no olvida ningún detalle.",
    },
    {
      icon: "🗺️",
      title: "Tu guía local",
      desc: "Descubre rincones secretos, historias del lugar y recomendaciones personalizadas para tu estilo de viaje.",
    },
    {
      icon: "🎙️",
      title: "Solo habla con ella",
      desc: "Sin formularios ni botones. Dile a Mary lo que necesitas con tu voz y ella lo resuelve en segundos.",
    },
    {
      icon: "🧠",
      title: "Aprende de ti",
      desc: "Mary recuerda tus preferencias, el ritmo que te gusta y lo que disfrutas. Cada viaje es más fácil que el anterior.",
    },
    {
      icon: "🌍",
      title: "50+ destinos",
      desc: "De Roma a Buenos Aires, de Tokio a Sevilla. Mary te acompaña con la misma calidez en cualquier rincón del mundo.",
    },
  ];

  return (
    <section
      id="funcionalidades"
      className="py-24 bg-cream-alt"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p
            className="text-xs tracking-[0.25em] text-burgundy uppercase mb-3"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Funcionalidades
          </p>
          <h2
            className="font-display text-4xl sm:text-5xl font-semibold text-text mb-4"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Todo lo que Mary hace
            <br />
            <em className="text-burgundy">por ti</em>
          </h2>
          <p
            className="text-text-muted max-w-md mx-auto text-base leading-relaxed"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Diseñada para que tú te concentres en vivir la experiencia,
            mientras ella resuelve los imprevistos.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="bg-cream rounded-2xl p-7 border border-cream-border hover:shadow-lg hover:shadow-[#80002012] hover:-translate-y-1 transition-all duration-300"
              style={{
                animationDelay: `${i * 0.08}s`,
              }}
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3
                className="font-display text-xl font-semibold text-text mb-2"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                {f.title}
              </h3>
              <p
                className="text-sm text-text-muted leading-relaxed"
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
    },
    {
      num: "02",
      title: "Cuéntale tu viaje",
      desc: 'Dile a dónde quieres ir y qué necesitas. "Mary, me voy una semana a Lisboa, me cuesta caminar mucho."',
    },
    {
      num: "03",
      title: "Disfruta sin preocupaciones",
      desc: "Mary organiza todo: transporte, rutas, alojamiento y guía local adaptados a ti.",
    },
  ];

  return (
    <section
      id="como-funciona"
      className="py-24 bg-cream relative overflow-hidden"
    >
      {/* Decorative line */}
      <div className="absolute left-1/2 top-32 bottom-32 w-px bg-cream-border hidden lg:block" />

      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p
            className="text-xs tracking-[0.25em] text-burgundy uppercase mb-3"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Cómo funciona
          </p>
          <h2
            className="font-display text-4xl sm:text-5xl font-semibold text-text"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Tres pasos para
            <br />
            <em className="text-burgundy">viajar diferente</em>
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, i) => (
            <div key={step.num} className="relative">
              {/* Connector line for mobile */}
              {i < steps.length - 1 && (
                <div className="absolute left-7 top-14 bottom-0 w-px bg-cream-border lg:hidden" />
              )}

              <div className="flex lg:flex-col gap-5">
                {/* Number bubble */}
                <div className="shrink-0 relative">
                  <div className="w-14 h-14 rounded-full bg-burgundy flex items-center justify-center shadow-lg shadow-[#80002030]">
                    <span
                      className="text-cream text-xs font-bold tracking-wider"
                      style={{ fontFamily: "var(--font-dm-sans)" }}
                    >
                      {step.num}
                    </span>
                  </div>
                </div>

                <div className="pt-1 lg:pt-0">
                  <h3
                    className="font-display text-2xl font-semibold text-text mb-2"
                    style={{ fontFamily: "var(--font-cormorant)" }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="text-sm text-text-muted leading-relaxed"
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

/* ─── Testimonials ─── */
function Testimonials() {
  const testimonials = [
    {
      quote:
        "Mary me ayudó a planear un viaje a Roma en sólo una conversación. Encontró hoteles con ascensor y restaurantes accesibles. ¡Increíble!",
      name: "Carmen R.",
      location: "Madrid",
      avatar: "C",
    },
    {
      quote:
        "Viajo sola desde hace años y siempre tenía miedo a los imprevistos. Con Mary me siento acompañada. Es como tener una amiga que lo sabe todo.",
      name: "Ana M.",
      location: "Barcelona",
      avatar: "A",
    },
    {
      quote:
        "Le pregunté sobre rutas sin escaleras en Japón. En segundos tenía un itinerario completo. No puedo creer que sea tan sencillo.",
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
            className="text-xs tracking-[0.25em] text-burgundy uppercase mb-3"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Historias reales
          </p>
          <h2
            className="font-display text-4xl sm:text-5xl font-semibold text-text"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Lo que dicen nuestras
            <br />
            <em className="text-burgundy">compañeras de viaje</em>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-cream rounded-2xl p-7 border border-cream-border flex flex-col gap-5"
            >
              {/* Quote mark */}
              <span
                className="font-display text-6xl text-rose leading-none -mb-2"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                &ldquo;
              </span>
              <p
                className="text-sm text-text leading-relaxed flex-1"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                {t.quote}
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-cream-border">
                <div className="w-9 h-9 rounded-full bg-burgundy flex items-center justify-center text-cream text-sm font-semibold">
                  {t.avatar}
                </div>
                <div style={{ fontFamily: "var(--font-dm-sans)" }}>
                  <p className="text-sm font-medium text-text">{t.name}</p>
                  <p className="text-xs text-text-muted">{t.location}</p>
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
    <section
      id="descargar"
      className="py-24 bg-burgundy relative overflow-hidden"
    >
      {/* Background texture */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, #fff 0%, transparent 50%), radial-gradient(circle at 80% 20%, #c19a9b 0%, transparent 50%)",
        }}
      />

      <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
        <div className="flex justify-center mb-6">
          <MaryLogo size={56} />
        </div>
        <h2
          className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-cream mb-4"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          Tu próximo viaje
          <br />
          <em>empieza aquí</em>
        </h2>
        <p
          className="text-rose text-base mb-10 max-w-md mx-auto leading-relaxed"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          Descarga Mary gratis y empieza a planear tu aventura. Sin tarjeta de
          crédito. Sin complicaciones.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-cream text-burgundy rounded-full text-sm font-semibold hover:bg-white transition-all hover:shadow-lg hover:-translate-y-0.5"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06C18.95 10 18.2 12.77 19 14.62c.8 1.85 2.29 2.24 2.29 2.24-.42 1.14-.97 2.24-1.58 2.64zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            Descargar en App Store
          </a>
          <a
            href="#"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 border-2 border-cream/40 text-cream rounded-full text-sm font-semibold hover:bg-cream/10 transition-all"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.18 23.76c.33.18.7.24 1.07.17l12.94-7.48-2.93-2.93-11.08 10.24zm16.93-11.09L17.4 11.2 14.2 14.4l2.93 2.93 2.97-1.71c.85-.49.85-1.86.01-2.95zM.97.47C.67.8.5 1.3.5 1.95v20.1c0 .65.17 1.15.47 1.48l.08.07L12.3 12.35v-.26L1.05.4l-.08.07zm11.6 11.35L3.18.47c.33-.18.7-.24 1.07-.17l12.94 7.48-2.99 2.93-2.63-.89z" />
            </svg>
            Disponible en Google Play
          </a>
        </div>

        <p
          className="mt-8 text-rose/70 text-xs"
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
    <footer className="bg-text py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="opacity-80">
              <MaryLogo size={28} />
            </div>
            <div>
              <span
                className="font-display text-lg font-semibold tracking-[0.12em] text-cream"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                MARY
              </span>
              <p
                className="text-[8px] tracking-[0.2em] text-text-muted uppercase"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                Tu compañera de viaje
              </p>
            </div>
          </div>

          {/* Links */}
          <nav
            className="flex items-center gap-6 text-xs text-text-muted"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            <a href="#" className="hover:text-rose transition-colors">
              Privacidad
            </a>
            <a href="#" className="hover:text-rose transition-colors">
              Términos
            </a>
            <a href="#" className="hover:text-rose transition-colors">
              Contacto
            </a>
          </nav>

          <p
            className="text-xs text-text-muted/60"
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
