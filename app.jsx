const { useEffect, useRef, useState, useMemo } = React;
const { motion, AnimatePresence, useInView } = window.Motion;

/* ------------------------------------------------------------------
   Inline SVG icons (lucide-style stroke icons)
------------------------------------------------------------------ */
const Ico = ({ d, size = 18, className = "", style, strokeWidth = 1.75, fill = "none" }) =>
<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size}
viewBox="0 0 24 24" fill={fill} stroke="currentColor"
strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
className={className} style={style} aria-hidden="true">
    {typeof d === "string" ? <path d={d} /> : d}
  </svg>;

const ArrowUpRight = (p) => <Ico {...p} d={<><line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" /></>} />;
const Play = (p) => <Ico {...p} fill="currentColor" d="M6 4l14 8-14 8z" />;
const Globe = (p) => <Ico {...p} d={<><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>} />;
const Bot = (p) => <Ico {...p} d={<><rect x="3" y="8" width="18" height="12" rx="2" /><path d="M12 8V4" /><circle cx="12" cy="4" r="1" /><line x1="8" y1="13" x2="8" y2="14" /><line x1="16" y1="13" x2="16" y2="14" /><path d="M9 17h6" /></>} />;
const MessageCircle = (p) => <Ico {...p} d={<><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></>} />;
const Sparkles = (p) => <Ico {...p} d={<><path d="M12 3l1.9 4.6L18.5 9.5 13.9 11.4 12 16l-1.9-4.6L5.5 9.5l4.6-1.9z" /><path d="M19 14l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9L16.3 16.7l1.9-.8z" /></>} />;
const Check = (p) => <Ico {...p} d={<polyline points="20 6 9 17 4 12" />} />;
const Phone = (p) => <Ico {...p} d={<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.8a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.35 1.84.6 2.8.72A2 2 0 0 1 22 16.92z" />} />;
const Megaphone = (p) => <Ico {...p} d={<><path d="M3 11v2a2 2 0 0 0 2 2h2l4 4V5L7 9H5a2 2 0 0 0-2 2z" /><path d="M15 8a4 4 0 0 1 0 8" /></>} />;

/* ------------------------------------------------------------------
   BlurText — splits a string into words and animates each word
   from blurred/translated to crisp on enter (IntersectionObserver).
------------------------------------------------------------------ */
function BlurText({ text, className = "", delay = 0, stagger = 0.1, once = true }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, margin: "-10% 0px -10% 0px" });
  const words = text.split(" ");

  return (
    <span ref={ref} className={className} style={{ display: "inline-block" }}>
      {words.map((w, i) =>
      <span key={i} style={{ display: "inline-block", overflow: "hidden", paddingBottom: "0.12em" }}>
          <motion.span
          style={{ display: "inline-block", willChange: "transform, filter, opacity" }}
          initial={{ filter: "blur(10px)", opacity: 0, y: 50 }}
          animate={inView ? {
            filter: ["blur(10px)", "blur(5px)", "blur(0px)"],
            opacity: [0, 0.5, 1],
            y: [50, -5, 0]
          } : {}}
          transition={{
            duration: 0.7,
            times: [0, 0.5, 1],
            delay: delay + i * stagger,
            ease: [0.2, 0.7, 0.2, 1]
          }}>
          
            {w}
          </motion.span>
          {i < words.length - 1 && <span>&nbsp;</span>}
        </span>
      )}
    </span>);

}

/* ------------------------------------------------------------------
   FadeIn — wrap children, blur/fade/translate-in on scroll-in
------------------------------------------------------------------ */
function FadeIn({ children, delay = 0, y = 20, className = "", once = true }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, margin: "-5% 0px -5% 0px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y, filter: "blur(8px)" }}
      animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 0.7, delay, ease: [0.2, 0.7, 0.2, 1] }}>
      
      {children}
    </motion.div>);

}

/* ------------------------------------------------------------------
   PingPongVideo — two stacked <video> elements crossfading on every
   'ended' event. The second instance starts ~0.4s before the first
   ends, so the seam is masked by the fade rather than a hard cut.
   This preserves NATIVE video resolution (no canvas downsample).
------------------------------------------------------------------ */
function PingPongVideo({ src, poster, className }) {
  const aRef = useRef(null);
  const bRef = useRef(null);
  const [active, setActive] = useState("a");
  const handoffRef = useRef(false);

  useEffect(() => {
    const a = aRef.current,b = bRef.current;
    if (!a || !b) return;

    const setup = (v) => {
      v.muted = true;
      v.playsInline = true;
      v.loop = false;
      v.preload = "auto";
    };
    setup(a);setup(b);
    a.play().catch(() => {});

    const onTimeUpdate = (current, other, nextActive) => () => {
      if (!current.duration) return;
      const remaining = current.duration - current.currentTime;
      if (remaining < 0.45 && !handoffRef.current) {
        handoffRef.current = true;
        other.currentTime = 0;
        other.play().catch(() => {});
        setActive(nextActive);
        // reset handoff flag once the new one is mid-play
        setTimeout(() => {handoffRef.current = false;}, 800);
      }
    };
    const aHandler = onTimeUpdate(a, b, "b");
    const bHandler = onTimeUpdate(b, a, "a");
    a.addEventListener("timeupdate", aHandler);
    b.addEventListener("timeupdate", bHandler);
    return () => {
      a.removeEventListener("timeupdate", aHandler);
      b.removeEventListener("timeupdate", bHandler);
    };
  }, []);

  const baseVideo = "absolute inset-0 w-full h-full object-contain";
  return (
    <div className={className} style={{ position: "absolute", inset: 0, background: "#030814" }}>
      <video
        ref={aRef}
        src={src}
        poster={poster}
        autoPlay
        muted
        playsInline
        preload="auto"
        className={baseVideo}
        style={{
          opacity: active === "a" ? 1 : 0,
          transition: "opacity 700ms ease-in-out"
        }} />
      
      <video
        ref={bRef}
        src={src}
        muted
        playsInline
        preload="auto"
        className={baseVideo}
        style={{
          opacity: active === "b" ? 1 : 0,
          transition: "opacity 700ms ease-in-out"
        }} />
      
    </div>);

}

/* ------------------------------------------------------------------
   Small UI primitives
------------------------------------------------------------------ */
function Badge({ children, className = "" }) {
  return (
    <span className={`liquid-glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-body font-medium tracking-wide text-white/85 ${className}`}>
      {children}
    </span>);

}

function NavPill() {
  const links = ["Inicio", "Servicios", "Cómo funciona", "Precios"];
  return (
    <nav className="liquid-glass hidden md:flex items-center rounded-full px-1.5 py-1.5">
      {links.map((l) =>
      <a key={l} href={`#${l.toLowerCase().replace(/\s+/g, "-")}`}
      className="px-3.5 py-1.5 text-sm font-medium font-body text-white/80 hover:text-white transition-colors rounded-full">
          {l}
        </a>
      )}
    </nav>);

}

function Navbar() {
  return (
    <div className="fixed top-4 left-0 right-0 z-50 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2" aria-label="Madpil home">
          <div className="h-11 w-11 rounded-2xl overflow-hidden grid place-items-center">
            <img src="assets/logoG.png" alt="Madpil logo" className="h-full w-full object-contain" />
          </div>
          <span className="hidden sm:inline font-heading italic text-white text-lg tracking-tight">Madpil Technology</span>
        </a>
        <NavPill />
        <a href="tel:9568693178" className="inline-flex items-center gap-1.5 bg-white text-black rounded-full pl-3.5 pr-2 py-1.5 text-sm font-body font-semibold hover:bg-white/90 transition-colors">
          Llamar
          <span className="bg-black text-white rounded-full p-0.5"><ArrowUpRight className="w-3.5 h-3.5" /></span>
        </a>
      </div>
    </div>);

}

/* ------------------------------------------------------------------
   Hero
------------------------------------------------------------------ */
function Hero() {
  return (
    <>
      {/* Hero: video as background, text overlaid at the top */}
      <section id="top" className="hero-stage">
        {/* Video background — full resolution, contained */}
        <PingPongVideo
          src="assets/madpil-hero.mp4"
          poster="assets/madpil-frame-1.png" />

        {/* Top-to-transparent gradient so text stays readable */}
        <div className="absolute inset-x-0 top-0 h-[55%] z-[1] pointer-events-none"
          style={{ background: "linear-gradient(to bottom, rgba(3,8,20,0.80) 0%, rgba(3,8,20,0.45) 50%, rgba(3,8,20,0) 100%)" }} />

        {/* Bottom fade into page */}
        <div className="absolute inset-x-0 bottom-0 h-[20%] z-[1] pointer-events-none"
          style={{ background: "linear-gradient(to bottom, rgba(3,8,20,0), #030814)" }} />

        {/* Text + partners — anchored to the top of the hero, over the video */}
        <div className="hero-content">
          <div className="max-w-7xl mx-auto px-6 md:px-8 flex flex-col gap-8">
            <div className="max-w-2xl flex flex-col gap-5">
              <motion.div
                initial={{ opacity: 0, filter: "blur(10px)", y: 12 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}>
                <span className="liquid-glass inline-flex items-center gap-2 rounded-full pl-1 pr-4 py-1 text-sm font-body text-white/90">
                  <span className="bg-white text-black rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase">Nuevo</span>
                  <span className="font-light">Tu negocio, conectado por IA.</span>
                </span>
              </motion.div>

              <h1 className="font-heading italic text-white text-[2.75rem] sm:text-5xl md:text-6xl lg:text-[5rem] leading-[0.86] tracking-[-0.03em]">
                <BlurText text="Tu negocio, despierto las 24 horas." stagger={0.1} />
              </h1>

              <motion.p
                className="max-w-xl text-sm md:text-base text-white/90 font-body font-light leading-snug"
                initial={{ opacity: 0, filter: "blur(8px)", y: 10 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}>
                Webs, redes, WhatsApp y recepción virtual conectados por IA. Un solo sistema. Sin pausas. Sin fricciones.
              </motion.p>

              <motion.div
                className="flex flex-wrap items-center gap-3"
                initial={{ opacity: 0, filter: "blur(8px)", y: 10 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{ duration: 0.6, delay: 1.1 }}>
                <a href="https://wa.me/9568693178?text=Hola%2C%20me%20gustar%C3%ADa%20agendar%20un%20diagn%C3%B3stico%20gratuito%20para%20mi%20negocio" target="_blank" rel="noopener noreferrer" className="liquid-glass-strong inline-flex items-center gap-2 rounded-full pl-5 pr-2 py-2 text-sm font-body font-medium text-white">
                  Agendar diagnóstico
                  <span className="bg-white text-black rounded-full p-1.5"><ArrowUpRight className="w-3.5 h-3.5" /></span>
                </a>
                <a href="#demo" className="inline-flex items-center gap-2 px-3 py-2 text-sm font-body text-white/90 hover:text-white transition">
                  <span className="grid place-items-center w-7 h-7 rounded-full liquid-glass">
                    <Play className="w-3 h-3 fill-white text-white" />
                  </span>
                  Ver demo
                </a>
              </motion.div>
            </div>

            {/* Partners bar — below CTAs, still overlaid on the video */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.4 }}
              className="flex flex-wrap items-center gap-x-10 md:gap-x-14 gap-y-3">
              <span className="liquid-glass rounded-full px-3.5 py-1.5 text-[11px] uppercase tracking-[0.18em] text-white/70 font-body">
                Construido con la stack de
              </span>
              {["Stripe", "Vercel", "OpenAI", "Twilio", "Meta"].map((n) =>
                <span key={n} className="text-2xl md:text-3xl font-heading italic text-white/85">{n}</span>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </>);

}

/* ------------------------------------------------------------------
   Problema
------------------------------------------------------------------ */
function Problema() {
  return (
    <section className="relative py-32 px-6 md:px-8">
      <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-7">
        <FadeIn><Badge>El problema</Badge></FadeIn>
        <h2 className="font-heading italic text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[0.92] text-white">
          <BlurText text="Tu negocio vive en partes." />
        </h2>
        <FadeIn delay={0.2}>
          <p className="text-white/60 font-body font-light text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Una web por un lado, redes por otro, mensajes que se pierden entre apps. Cada minuto desconectado es un cliente que eligió a la competencia.
          </p>
        </FadeIn>
      </div>
    </section>);

}

/* ------------------------------------------------------------------
   Solución (Cómo funciona) — uses frame-2 as ambient bg
------------------------------------------------------------------ */
function ComoFunciona() {
  return (
    <section id="cómo-funciona" className="relative py-32 px-6 md:px-8 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img src="assets/madpil-frame-2.png" alt="" role="presentation"
        className="w-full h-full object-cover"
        style={{ filter: "saturate(0.45) blur(12px)", opacity: 0.45 }} />
        <div className="absolute inset-x-0 top-0 h-[200px]" style={{ background: "linear-gradient(to bottom, #030814, rgba(3,8,20,0))" }} />
        <div className="absolute inset-x-0 bottom-0 h-[200px]" style={{ background: "linear-gradient(to top, #030814, rgba(3,8,20,0))" }} />
      </div>
      <div className="relative z-10 max-w-3xl mx-auto text-center flex flex-col items-center gap-7 min-h-[420px] justify-center">
        <FadeIn><Badge>Cómo funciona</Badge></FadeIn>
        <h2 className="font-heading italic text-4xl md:text-5xl lg:text-6xl text-white leading-[0.92]">
          <BlurText text="Una red. Cinco canales. Cero caos." />
        </h2>
        <FadeIn delay={0.2}>
          <p className="text-white/65 font-body font-light text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Compartís tu visión. Nuestra IA conecta web, tienda, redes, WhatsApp y recepción virtual en un mismo flujo. En días, no en trimestres.
          </p>
        </FadeIn>
        <FadeIn delay={0.35}>
          <a href="#cta" className="liquid-glass-strong inline-flex items-center gap-2 rounded-full pl-6 pr-2 py-2.5 text-sm font-body font-medium text-white">
            Empezar
            <span className="bg-white text-black rounded-full p-1.5"><ArrowUpRight className="w-3.5 h-3.5" /></span>
          </a>
        </FadeIn>
      </div>
    </section>);

}

/* ------------------------------------------------------------------
   Servicios — chess layout with rendered visuals
------------------------------------------------------------------ */
function BrowserMock() {
  return (
    <div className="liquid-glass rounded-2xl aspect-video relative overflow-hidden">
      {/* traffic lights */}
      <div className="absolute top-3.5 left-4 flex items-center gap-1.5 z-10">
        <span className="w-2.5 h-2.5 rounded-full bg-white/25" />
        <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
        <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
      </div>
      <div className="absolute top-3 left-1/2 -translate-x-1/2 liquid-glass rounded-full px-3 py-0.5 text-[10px] font-body text-white/50">
        madpil.studio
      </div>
      {/* inner content */}
      <div className="absolute inset-0 pt-9 px-5 pb-5">
        <div className="relative h-full rounded-xl overflow-hidden border border-white/8"
        style={{ background: "radial-gradient(120% 80% at 20% 0%, rgba(45,168,255,0.22), transparent 60%), radial-gradient(120% 80% at 90% 100%, rgba(77,255,156,0.12), transparent 55%), #06101F" }}>
          <div className="absolute inset-0 p-5 grid grid-rows-[auto_1fr_auto] gap-3">
            <div className="flex items-center justify-between">
              <span className="font-heading italic text-white text-lg leading-none">Albatros&nbsp;Studio</span>
              <div className="flex gap-1.5">
                <span className="w-12 h-2 rounded-full bg-white/15" />
                <span className="w-8 h-2 rounded-full bg-white/15" />
                <span className="w-10 h-2 rounded-full bg-white/15" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {[0, 1, 2].map((i) =>
              <div key={i} className="rounded-lg border border-white/10 overflow-hidden"
              style={{ background: i === 1 ? "linear-gradient(160deg, rgba(45,168,255,0.35), rgba(45,168,255,0.05))" : "rgba(255,255,255,0.03)" }}>
                  <div className="h-14 md:h-16" style={{ background: i === 1 ? "" : "linear-gradient(180deg, rgba(255,255,255,0.06), transparent)" }} />
                  <div className="p-2 flex flex-col gap-1">
                    <span className="h-1.5 w-3/4 rounded-full bg-white/30" />
                    <span className="h-1.5 w-1/2 rounded-full bg-white/15" />
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-body text-white/40 tracking-wide">EN VIVO · 312 sesiones</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-body rounded-full px-2 py-0.5"
              style={{ background: "rgba(77,255,156,0.12)", color: "#7BFFBE" }}>
                <span className="w-1 h-1 rounded-full bg-[#4DFF9C]" /> +24% conversión
              </span>
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-60 h-60 rounded-full" style={{ background: "radial-gradient(closest-side, rgba(45,168,255,0.45), transparent)" }} />
        </div>
      </div>
    </div>);

}

function ChatMock() {
  return (
    <div className="liquid-glass rounded-2xl aspect-video relative overflow-hidden">
      <div className="absolute inset-0 p-5">
        <div className="relative h-full rounded-xl overflow-hidden border border-white/8" style={{ background: "linear-gradient(180deg, #08131F, #050B16)" }}>
          {/* header */}
          <div className="px-4 py-3 flex items-center gap-3 border-b border-white/8">
            <div className="w-8 h-8 rounded-full grid place-items-center" style={{ background: "rgba(77,255,156,0.18)" }}>
              <Bot className="w-4 h-4 text-[#4DFF9C]" />
            </div>
            <div className="flex flex-col">
              <span className="font-body text-sm text-white">Recepción Madpil</span>
              <span className="font-body text-[10px] text-white/45 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4DFF9C]" /> en línea
              </span>
            </div>
          </div>
          {/* messages */}
          <div className="p-4 flex flex-col gap-2.5">
            <div className="self-start max-w-[78%] rounded-2xl rounded-tl-sm px-3 py-2 text-[12px] font-body text-white/90"
            style={{ background: "rgba(255,255,255,0.06)" }}>
              Hola, ¿tienen disponibilidad para esta semana?
            </div>
            <div className="self-end max-w-[78%] rounded-2xl rounded-tr-sm px-3 py-2 text-[12px] font-body text-[#04220F]"
            style={{ background: "linear-gradient(180deg, #6BFFB1, #4DFF9C)" }}>
              ¡Hola! Sí, jueves 17 a las 10:30 o viernes 18 a las 16:00.
            </div>
            <div className="self-end max-w-[78%] rounded-2xl rounded-tr-sm px-3 py-2 text-[12px] font-body text-[#04220F]"
            style={{ background: "linear-gradient(180deg, #6BFFB1, #4DFF9C)" }}>
              ¿Confirmás tu nombre y email?
            </div>
            <div className="self-start max-w-[78%] rounded-2xl rounded-tl-sm px-3 py-2 text-[12px] font-body text-white/90"
            style={{ background: "rgba(255,255,255,0.06)" }}>
              Diego Salazar, diego@clinica.norte
            </div>
            <div className="self-end max-w-[78%] rounded-2xl rounded-tr-sm px-3 py-2 text-[12px] font-body text-[#04220F] inline-flex items-center gap-1.5"
            style={{ background: "linear-gradient(180deg, #6BFFB1, #4DFF9C)" }}>
              <Check className="w-3 h-3" /> Reserva confirmada · jueves 10:30
            </div>
          </div>
        </div>
      </div>
    </div>);

}

function DualMock() {
  return (
    <div className="liquid-glass rounded-2xl aspect-video relative overflow-hidden">
      <div className="absolute inset-0 p-5 grid grid-cols-2 gap-3">
        {/* phone call panel */}
        <div className="rounded-xl border border-white/10 p-4 flex flex-col justify-between"
        style={{ background: "radial-gradient(120% 80% at 0% 0%, rgba(45,168,255,0.25), transparent 60%), #06101F" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full grid place-items-center liquid-glass-strong">
                <Phone className="w-3.5 h-3.5 text-[#2DA8FF]" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-[11px] font-body text-white">Llamada entrante</span>
                <span className="text-[9px] font-body text-white/40">+54 11 4892 0011</span>
              </div>
            </div>
            <span className="text-[9px] font-body text-white/50">00:14</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex gap-0.5 items-end h-6">
              {Array.from({ length: 28 }).map((_, i) =>
              <span key={i} className="flex-1 rounded-full" style={{
                height: `${20 + Math.sin(i * 0.6) * 60 + Math.cos(i * 1.1) * 15}%`,
                background: "linear-gradient(180deg,#2DA8FF,#4DFF9C)",
                opacity: 0.55 + i % 3 * 0.15
              }} />
              )}
            </div>
            <p className="text-[10px] font-body text-white/60 leading-snug">
              "Buenas, quería consultar por una limpieza dental para el martes…"
            </p>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-body text-white/40">Transcripción en vivo</span>
            <span className="text-[9px] font-body rounded-full px-2 py-0.5"
            style={{ background: "rgba(45,168,255,0.15)", color: "#9BD2FF" }}>
              Agendando…
            </span>
          </div>
        </div>
        {/* campaigns panel */}
        <div className="rounded-xl border border-white/10 p-4 flex flex-col gap-3"
        style={{ background: "radial-gradient(120% 80% at 100% 100%, rgba(77,255,156,0.18), transparent 60%), #06101F" }}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-body text-white inline-flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5 text-[#4DFF9C]" /> Campañas activas
            </span>
            <span className="text-[9px] font-body text-white/50">Hoy</span>
          </div>
          {[
          { l: "Reels · Otoño", v: "ROAS 4.2x", c: "#4DFF9C" },
          { l: "Carrusel · Combo", v: "ROAS 3.1x", c: "#2DA8FF" },
          { l: "Story · Lanzamiento", v: "ROAS 5.8x", c: "#4DFF9C" }].
          map((row, i) =>
          <div key={i} className="rounded-lg p-2 flex items-center justify-between"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-7 rounded-full" style={{ background: row.c }} />
                <span className="text-[10px] font-body text-white/85">{row.l}</span>
              </div>
              <span className="text-[10px] font-body" style={{ color: row.c }}>{row.v}</span>
            </div>
          )}
        </div>
      </div>
    </div>);

}

function ServiceRow({ flip, eyebrow, title, body, visual }) {
  return (
    <FadeIn>
      <div className={`grid md:grid-cols-2 gap-8 md:gap-12 items-center ${flip ? "md:[&>div:first-child]:order-2" : ""}`}>
        <div className={`flex flex-col gap-5 ${flip ? "md:text-right md:items-end" : ""}`}>
          <span className="text-[11px] font-body uppercase tracking-[0.18em] text-white/40">{eyebrow}</span>
          <h3 className="font-heading italic text-3xl md:text-4xl lg:text-5xl text-white leading-[0.95] tracking-tight">{title}</h3>
          <p className="text-white/60 font-body font-light text-base leading-relaxed max-w-md">{body}</p>
          <a href="#cta" className="liquid-glass-strong self-start inline-flex items-center gap-2 rounded-full pl-5 pr-2 py-2 text-sm font-body font-medium text-white">
            Ver más
            <span className="bg-white text-black rounded-full p-1.5"><ArrowUpRight className="w-3.5 h-3.5" /></span>
          </a>
        </div>
        <div>{visual}</div>
      </div>
    </FadeIn>);

}

function Servicios() {
  return (
    <section id="servicios" className="relative py-32 px-6 md:px-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-24">
        <div className="flex flex-col items-center text-center gap-6">
          <FadeIn><Badge>Capabilities</Badge></FadeIn>
          <h2 className="font-heading italic text-4xl md:text-5xl lg:text-6xl text-white leading-[0.92] max-w-3xl">
            <BlurText text="Cinco servicios. Un solo sistema." />
          </h2>
        </div>

        <ServiceRow
          eyebrow="01 · Web & e-commerce"
          title="Webs y tiendas que venden solas."
          body="Diseño premium, performance impecable, copy que convierte. Construido por IA, refinado por humanos."
          visual={<BrowserMock />} />
        
        <ServiceRow
          flip
          eyebrow="02 · Conversaciones IA"
          title="Mensajería que responde, vende y agenda."
          body="Automatización inteligente que entiende contexto, califica leads y cierra reservas — 24/7, en tu tono de marca."
          visual={<ChatMock />} />
        
        <ServiceRow
          eyebrow="03 · Voz & marketing"
          title="Recepcionista IA y campañas que rinden."
          body="Atendé llamadas, transcribí en vivo y lanzá campañas creativas con creatividad y data en un solo panel."
          visual={<DualMock />} />
        
      </div>
    </section>);

}

/* ------------------------------------------------------------------
   Por qué Madpil — features grid
------------------------------------------------------------------ */
function Features() {
  const items = [
  { icon: Globe, color: "#2DA8FF", title: "Web premium", body: "Diseño editorial, mobile-first, optimizado al detalle." },
  { icon: Bot, color: "#4DFF9C", title: "Recepcionista IA", body: "Atiende, agenda y filtra como tu mejor empleado." },
  { icon: MessageCircle, color: "#2DA8FF", title: "Mensajería inteligente", body: "Conversaciones que califican, venden y cierran." },
  { icon: Sparkles, color: "#4DFF9C", title: "Marketing performante", body: "Campañas en redes con creatividad y data." }];

  return (
    <section className="relative py-32 px-6 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center gap-6 mb-16">
          <FadeIn><Badge>Por qué Madpil</Badge></FadeIn>
          <h2 className="font-heading italic text-4xl md:text-5xl lg:text-6xl text-white leading-[0.92] max-w-3xl">
            <BlurText text="La diferencia se siente desde el primer día." />
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((it, i) =>
          <FadeIn key={i} delay={i * 0.08}>
              <div className="liquid-glass rounded-2xl p-6 h-full flex flex-col gap-4">
                <div className="liquid-glass-strong rounded-full w-11 h-11 grid place-items-center">
                  <it.icon className="w-5 h-5" style={{ color: it.color }} />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-heading italic text-2xl text-white leading-tight">{it.title}</h3>
                  <p className="text-white/60 font-body font-light text-sm leading-relaxed">{it.body}</p>
                </div>
              </div>
            </FadeIn>
          )}
        </div>
      </div>
    </section>);

}

/* ------------------------------------------------------------------
   Stats
------------------------------------------------------------------ */
function Stats() {
  const data = [
  ["200+", "Clientes conectados"],
  ["98%", "Satisfacción"],
  ["3.4x", "Más conversiones"],
  ["5 días", "Promedio de entrega"]];

  return (
    <section className="relative py-32 px-6 md:px-8 overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img src="assets/madpil-frame-2.png" alt="" role="presentation"
        className="w-full h-full object-cover"
        style={{ filter: "saturate(0.35) blur(20px)", opacity: 0.25 }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(60% 60% at 50% 50%, rgba(45,168,255,0.10), transparent 70%)" }} />
        <div className="absolute inset-x-0 top-0 h-[200px]" style={{ background: "linear-gradient(to bottom, #030814, rgba(3,8,20,0))" }} />
        <div className="absolute inset-x-0 bottom-0 h-[200px]" style={{ background: "linear-gradient(to top, #030814, rgba(3,8,20,0))" }} />
      </div>
      <div className="relative z-10 max-w-6xl mx-auto">
        <FadeIn>
          <div className="liquid-glass rounded-3xl p-10 md:p-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {data.map(([v, l], i) =>
              <FadeIn key={i} delay={i * 0.1}>
                  <div className="flex flex-col gap-2 md:border-l md:border-white/8 md:pl-6 first:border-l-0 first:pl-0">
                    <span className="font-heading italic text-white text-4xl md:text-5xl lg:text-6xl leading-none">{v}</span>
                    <span className="text-white/55 font-body font-light text-sm">{l}</span>
                  </div>
                </FadeIn>
              )}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>);

}

/* ------------------------------------------------------------------
   Testimonials — infinite carousel
------------------------------------------------------------------ */
function Testimonials() {
  const data = [
    { q: "Pasamos de responder mensajes a las 11pm a tener 80% del trabajo cerrado antes del primer café.", n: "Lucía Romero", r: "Dueña, Estudio Albatros" },
    { q: "La recepcionista virtual sola me pagó el sistema en el segundo mes.", n: "Diego Salazar", r: "Director, Clínica Norte" },
    { q: "Una sola plataforma, cinco canales, cero caos. Es lo más cercano que tuve a tener clones.", n: "María Fernanda Vega", r: "Founder, Mercado Vivo" },
    { q: "Antes perdía clientes los fines de semana. Ahora el bot cierra citas mientras duermo.", n: "Carlos Mendoza", r: "Propietario, Gym Evolución" },
    { q: "En 30 días ya teníamos la web, WhatsApp automatizado y redes integradas. Increíble.", n: "Ana Beltrán", r: "CEO, Boutique Luna" },
    { q: "Mis clientes me preguntan si tengo un equipo enorme. Solo tengo a Madpil.", n: "Roberto Guzmán", r: "Consultor Independiente" },
    { q: "El diagnóstico gratuito me abrió los ojos. Estaba dejando dinero sobre la mesa cada día.", n: "Sofía Herrera", r: "Directora, Academia Ritmo" },
    { q: "Reduje mi tiempo en atención al cliente un 70%. Ahora me enfoco en crecer.", n: "Andrés Mora", r: "Fundador, Taller Express" },
    { q: "La integración con WhatsApp cambió todo. Los clientes reciben respuesta en segundos.", n: "Isabel Cruz", r: "Gerente, Restaurante El Fogón" },
  ];

  const row1 = data.slice(0, 5);
  const row2 = data.slice(5);

  const Card = ({ t }) => (
    React.createElement("div", { className: "flex-shrink-0 w-72 md:w-80 liquid-glass rounded-2xl p-6 flex flex-col gap-5" },
      React.createElement("p", { className: "text-white/85 font-body font-light text-sm italic leading-relaxed" }, `"${t.q}"`),
      React.createElement("div", { className: "mt-auto flex items-center gap-3" },
        React.createElement("div", { className: "w-9 h-9 rounded-full liquid-glass-strong grid place-items-center flex-shrink-0" },
          React.createElement("span", { className: "text-white/85 font-heading italic text-sm" },
            t.n.split(" ").map(x => x[0]).slice(0, 2).join("")
          )
        ),
        React.createElement("div", { className: "flex flex-col leading-tight" },
          React.createElement("span", { className: "text-white font-body font-medium text-sm" }, t.n),
          React.createElement("span", { className: "text-white/50 font-body font-light text-xs" }, t.r)
        )
      )
    )
  );

  return (
    <section className="relative py-32 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <div className="flex flex-col items-center text-center gap-6 mb-16">
          <FadeIn><Badge>Lo que dicen</Badge></FadeIn>
          <h2 className="font-heading italic text-4xl md:text-5xl lg:text-6xl text-white leading-[0.92] max-w-3xl">
            <BlurText text="No es solo lo que decimos." />
          </h2>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <div className="carousel-wrapper">
          <div className="carousel-track-left flex gap-5 w-fit">
            {[...row1, ...row1].map((t, i) => <Card key={i} t={t} />)}
          </div>
        </div>
        <div className="carousel-wrapper">
          <div className="carousel-track-right flex gap-5 w-fit">
            {[...row2, ...row2].map((t, i) => <Card key={i} t={t} />)}
          </div>
        </div>
      </div>
    </section>);
}

/* ------------------------------------------------------------------
   Pricing
------------------------------------------------------------------ */
function Pricing() {
  const plans = [
    {
      badge: "MadPil Smart Web",
      label: "Tarifa única",
      setup: "USD 1,490",
      monthly: "USD 290/mes",
      bullets: ["Web premium", "Tienda Inteligente 24/7", "Asistente Virtual 24/7", "Campañas en redes", "Captura de prospectos", "SEO inteligente automático", "Soporte continuo"],
      featured: false,
      accent: null,
    },
    {
      badge: "Asistente Virtual 24/7",
      label: "Siempre disponible",
      setup: "USD 1,490",
      monthly: "USD 150/mes",
      bullets: ["Toma llamadas", "Agenda citas", "Confirma citas", "Contesta SMS", "Contesta WhatsApp", "Da información"],
      featured: true,
      accent: "green",
    },
    {
      badge: "Tienda Inteligente 24/7",
      label: "Vende sin parar",
      setup: "USD 1,490",
      monthly: "USD 150/mes",
      bullets: ["Catálogo digital", "Asistente de ventas 24/7", "Recuperación de carritos perdidos", "Recomendación de productos", "Captación de prospectos", "Búsqueda inteligente", "Cierre de ventas"],
      featured: true,
      accent: "blue",
    },
  ];

  return (
    <section id="precios" className="relative py-32 px-6 md:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {plans.map((plan, idx) => {
          const checkBg = plan.accent === "green" ? "rgba(77,255,156,0.18)" : "rgba(45,168,255,0.18)";
          const checkColor = plan.accent === "green" ? "#4DFF9C" : "#2DA8FF";
          const glowBg = plan.accent === "green"
            ? "linear-gradient(135deg, rgba(77,255,156,0.35), rgba(45,168,255,0.2))"
            : "linear-gradient(135deg, rgba(45,168,255,0.35), rgba(77,255,156,0.2))";
          return (
            <FadeIn key={idx} delay={idx * 0.1}>
              <div className="relative">
                {plan.featured && (
                  <div className="absolute -inset-px rounded-3xl pointer-events-none" style={{ background: glowBg, filter: "blur(1px)" }} />
                )}
                <div className="relative liquid-glass rounded-3xl p-8 md:p-10 flex flex-col gap-7">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <Badge>{plan.badge}</Badge>
                    <span className="text-[10px] font-body uppercase tracking-[0.2em] text-white/40">{plan.label}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className="font-heading italic text-white text-4xl md:text-5xl leading-none">{plan.setup}</span>
                      <span className="text-white/55 font-body font-light text-sm">setup</span>
                    </div>
                    <span className="font-body font-light text-white/80 text-xl">+ {plan.monthly}</span>
                  </div>
                  <ul className="grid grid-cols-1 gap-y-3">
                    {plan.bullets.map((b) =>
                      <li key={b} className="flex items-center gap-2 text-white/85 font-body font-light text-sm">
                        <span className="grid place-items-center w-5 h-5 flex-shrink-0 rounded-full" style={{ background: checkBg }}>
                          <Check className="w-3 h-3" style={{ color: checkColor }} />
                        </span>
                        {b}
                      </li>
                    )}
                  </ul>
                  <div className="flex flex-col items-stretch gap-3">
                    <a href="https://wa.me/9568693178?text=Hola%2C%20me%20gustar%C3%ADa%20agendar%20un%20diagn%C3%B3stico%20gratuito%20para%20mi%20negocio" target="_blank" rel="noopener noreferrer" className="liquid-glass-strong inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-body font-medium text-white">
                      Empezar ahora
                      <span className="bg-white text-black rounded-full p-1.5"><ArrowUpRight className="w-3.5 h-3.5" /></span>
                    </a>
                    <span className="text-center text-white/45 font-body font-light text-xs">Sin permanencia. Cancelás cuando quieras.</span>
                  </div>
                </div>
              </div>
            </FadeIn>
          );
        })}
      </div>
    </section>);
}

/* ------------------------------------------------------------------
   Final CTA
------------------------------------------------------------------ */
function FinalCTA() {
  return (
    <section id="cta" className="relative py-24 px-6 md:px-8">
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-8">
        <h2 className="font-heading italic text-5xl md:text-6xl lg:text-7xl leading-[0.85] text-white tracking-tight">
          <BlurText text="Tu próximo cliente ya está intentando contactarte." />
        </h2>
        <FadeIn delay={0.2}>
          <p className="text-white/60 font-body font-light text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Reservá una consulta gratuita. Te mostramos qué se puede automatizar en tu negocio esta semana.
          </p>
        </FadeIn>
        <FadeIn delay={0.35}>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href="https://wa.me/9568693178?text=Hola%2C%20me%20gustar%C3%ADa%20agendar%20un%20diagn%C3%B3stico%20gratuito%20para%20mi%20negocio" target="_blank" rel="noopener noreferrer" className="liquid-glass-strong inline-flex items-center gap-2 rounded-full pl-6 pr-2 py-2.5 text-sm font-body font-medium text-white">
              Agendar llamada
              <span className="bg-white text-black rounded-full p-1.5"><ArrowUpRight className="w-3.5 h-3.5" /></span>
            </a>
            <a href="#precios" className="inline-flex items-center gap-2 bg-white text-black rounded-full px-6 py-3 text-sm font-body font-semibold hover:bg-white/90 transition">
              Ver precios
            </a>
          </div>
        </FadeIn>
      </div>
    </section>);

}

function Footer() {
  return (
    <footer className="relative mt-16 pt-8 pb-10 px-6 md:px-8 border-t border-white/8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        <span className="text-white/40 font-body text-xs">© 2026 Madpil Technology. Todos los derechos reservados.</span>
        <div className="flex items-center gap-6">
          {["Privacidad", "Términos", "Contacto"].map((l) =>
          <a key={l} href="#" className="text-white/40 hover:text-white/70 transition font-body text-xs">{l}</a>
          )}
        </div>
      </div>
    </footer>);

}

/* ------------------------------------------------------------------
   Page
------------------------------------------------------------------ */
function App() {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <Problema />
      <ComoFunciona />
      <Servicios />
      <Features />
      <Stats />
      <Testimonials />
      <Pricing />
      <FinalCTA />
      <Footer />
    </main>);

}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);