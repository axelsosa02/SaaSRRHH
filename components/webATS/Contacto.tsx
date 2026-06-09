import { Mail, MessageSquare, ArrowRight, Calendar } from "lucide-react";

export default function Contacto() {
  return (
    <section
      id="contacto"
      className="relative w-full overflow-hidden bg-[#0a0a0a] py-20 md:py-32"
    >
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0 hidden md:block">
        <div className="absolute top-0 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-[#b6f300]/[0.03] blur-[180px]" />
        <div className="absolute bottom-0 right-0 h-[350px] w-[350px] rounded-full bg-[#b6f300]/[0.02] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-8">
        <div className="grid gap-12 md:gap-16 lg:grid-cols-2 lg:gap-20">
          {/* Left column — text */}
          <div className="flex flex-col justify-center">
            <h2 className="mb-6 text-3xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
              Solicitá tu demo{" "}
              <span className="text-[#b6f300]">gratis</span>
            </h2>
            <p className="mb-10 max-w-lg text-base leading-relaxed text-white/60 md:text-lg">
              Agendá una llamada rápida con nuestro equipo y te mostramos cómo FlowATS puede simplificar tu proceso de selección. Sin compromiso.
            </p>

            {/* Contact info cards */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[#b6f300]/30 hover:bg-white/[0.05]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#b6f300]/10 text-[#b6f300]">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-white/40">Email</p>
                  <a href="mailto:axeldeveloperweb@gmail.com" target="_blank" rel="noopener noreferrer" className="text-white font-medium">axeldeveloperweb@gmail.com</a>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[#b6f300]/30 hover:bg-white/[0.05]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#b6f300]/10 text-[#b6f300]">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-white/40">WhatsApp</p>
                  <a href="https://wa.me/5493482630224" target="_blank" rel="noopener noreferrer" className="text-white font-medium">+5493482630224</a>
                </div>
              </div>
            </div>
          </div>

          {/* Right column — CTA Card instead of Form */}
          <div className="flex flex-col justify-center">
            <div className="relative flex flex-col items-center justify-center gap-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 text-center backdrop-blur-sm transition-transform duration-300 hover:scale-[1.01] md:p-12">
              <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-b from-[#b6f300]/[0.06] to-transparent opacity-60" />
              
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#b6f300]/10 text-[#b6f300]">
                <Calendar className="h-8 w-8" />
              </div>
              
              <div>
                <h3 className="mb-2 text-2xl font-bold text-white">
                  Hablemos hoy mismo
                </h3>
                <p className="text-base text-white/60">
                  Escribinos directamente por WhatsApp para coordinar una demo de 15 minutos cuando mejor te quede.
                </p>
              </div>

              <a
                href="https://wa.me/5493482630224?text=Hola,%20me%20interesa%20agendar%20una%20demo%20gratis%20de%20FlowATS."
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#b6f300] px-6 py-4 text-base font-bold text-[#0a0a0a] transition-all duration-300 hover:bg-[#c8ff33] hover:shadow-[0_0_30px_rgba(182,243,0,0.2)]"
              >
                Agendar por WhatsApp
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
