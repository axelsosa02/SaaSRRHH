"use client";

import { motion } from "framer-motion";
import { Mail, MessageSquare, Send } from "lucide-react";
import { useState } from "react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export default function Contacto() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    empresa: "",
    mensaje: "",
  });
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    // Simulate sending
    await new Promise((r) => setTimeout(r, 1200));
    setIsSending(false);
    setSent(true);
    setFormData({ nombre: "", email: "", empresa: "", mensaje: "" });
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <section
      id="contacto"
      className="relative w-full overflow-hidden bg-[#0a0a0a] py-20 md:py-32"
    >
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-[#b6f300]/[0.03] blur-[180px]" />
        <div className="absolute bottom-0 right-0 h-[350px] w-[350px] rounded-full bg-[#b6f300]/[0.02] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid gap-12 md:gap-16 lg:grid-cols-2 lg:gap-20"
        >
          {/* Left column — text */}
          <motion.div variants={itemVariants} className="flex flex-col justify-center">
            <h2 className="mb-6 text-3xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
              ¿Listo para{" "}
              <span className="text-[#b6f300]">transformar</span> tu
              reclutamiento?
            </h2>
            <p className="mb-10 max-w-lg text-base leading-relaxed text-white/60 md:text-lg">
              Escribinos y te mostramos cómo FlowATS puede simplificar tu
              proceso de selección. Sin compromiso, sin letra chica.
            </p>

            {/* Contact info cards */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 transition-all duration-300 hover:border-[#b6f300]/30 hover:bg-white/[0.05]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#b6f300]/10 text-[#b6f300]">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-white/40">Email</p>
                  <a href="mailto:axeldeveloperweb@gmail.com" target="_blank" rel="noopener noreferrer" className="text-white font-medium">axeldeveloperweb@gmail.com</a>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 transition-all duration-300 hover:border-[#b6f300]/30 hover:bg-white/[0.05]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#b6f300]/10 text-[#b6f300]">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-white/40">WhatsApp</p>
                  <a href="https://wa.me/5493482630224" target="_blank" rel="noopener noreferrer" className="text-white font-medium">+5493482630224</a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right column — form */}
          <motion.div variants={itemVariants}>
            <form
              onSubmit={handleSubmit}
              className="relative rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm md:p-8"
            >
              {/* Subtle glow on form */}
              <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-b from-[#b6f300]/[0.06] to-transparent opacity-60" />

              <div className="relative flex flex-col gap-5">
                {/* Nombre */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="contact-nombre"
                    className="text-sm font-medium text-white/60"
                  >
                    Nombre completo
                  </label>
                  <input
                    id="contact-nombre"
                    name="nombre"
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Tu nombre"
                    className="rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-white placeholder-white/25 outline-none transition-all duration-300 focus:border-[#b6f300]/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-[#b6f300]/20"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="contact-email"
                    className="text-sm font-medium text-white/60"
                  >
                    Email
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                    className="rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-white placeholder-white/25 outline-none transition-all duration-300 focus:border-[#b6f300]/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-[#b6f300]/20"
                  />
                </div>

                {/* Empresa */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="contact-empresa"
                    className="text-sm font-medium text-white/60"
                  >
                    Empresa
                  </label>
                  <input
                    id="contact-empresa"
                    name="empresa"
                    type="text"
                    value={formData.empresa}
                    onChange={handleChange}
                    placeholder="Tu empresa (opcional)"
                    className="rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-white placeholder-white/25 outline-none transition-all duration-300 focus:border-[#b6f300]/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-[#b6f300]/20"
                  />
                </div>

                {/* Mensaje */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="contact-mensaje"
                    className="text-sm font-medium text-white/60"
                  >
                    Mensaje
                  </label>
                  <textarea
                    id="contact-mensaje"
                    name="mensaje"
                    rows={4}
                    required
                    value={formData.mensaje}
                    onChange={handleChange}
                    placeholder="Contanos qué necesitás..."
                    className="resize-none rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-white placeholder-white/25 outline-none transition-all duration-300 focus:border-[#b6f300]/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-[#b6f300]/20"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSending}
                  className="group mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#b6f300] px-6 py-3.5 text-base font-semibold text-[#0a0a0a] transition-all duration-300 hover:bg-[#c8ff33] hover:shadow-[0_0_30px_rgba(182,243,0,0.2)] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <span className="flex items-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear" as const,
                        }}
                        className="inline-block h-4 w-4 rounded-full border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a]"
                      />
                      Enviando...
                    </span>
                  ) : sent ? (
                    <span>✓ Mensaje enviado</span>
                  ) : (
                    <>
                      Enviar mensaje
                      <Send className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
