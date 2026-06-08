"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "¿Necesito una tarjeta de crédito para empezar?",
    answer:
      "No. Podés crear tu cuenta y empezar a usar FlowATS de forma gratuita, sin necesidad de ingresar datos de pago. Solo te pedimos tarjeta si decidís pasar a un plan pago.",
  },
  {
    question: "¿Puedo importar candidatos que ya tengo en planillas?",
    answer:
      "Sí. FlowATS te permite importar candidatos desde archivos Excel o CSV en pocos clics. Todos los datos se mapean automáticamente a los campos del sistema.",
  },
  {
    question: "¿Cuántos usuarios pueden usar la plataforma?",
    answer:
      "Depende del plan que elijas. El plan gratuito incluye un usuario, y los planes pagos permiten agregar múltiples miembros de equipo con roles y permisos personalizados.",
  },
  {
    question: "¿Mis candidatos pueden postularse directamente?",
    answer:
      "Sí. Con tu landing personalizada, los candidatos completan un formulario y sus datos ingresan automáticamente a tu panel, sin intervención manual.",
  },
  {
    question: "¿Es seguro? ¿Dónde se almacenan mis datos?",
    answer:
      "Totalmente. Usamos infraestructura segura con encriptación de datos en tránsito y en reposo. Tus datos se almacenan en servidores con certificación SOC 2 y cumplimos con las normativas de protección de datos.",
  },
  {
    question: "¿Puedo cancelar en cualquier momento?",
    answer:
      "Sí, sin compromisos ni penalidades. Podés cancelar tu suscripción en cualquier momento desde tu panel de configuración y seguirás teniendo acceso hasta el final del período facturado.",
  },
];

function FaqAccordionItem({
  item,
  isOpen,
  onToggle,
  index,
}: {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.5,
        ease: "easeOut" as const,
        delay: index * 0.07,
      }}
    >
      <button
        onClick={onToggle}
        className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-6 py-5 text-left transition-all duration-300 hover:border-[#b6f300]/30 hover:bg-white/[0.05]"
        aria-expanded={isOpen}
      >
        <span className="text-base font-medium text-white md:text-lg">
          {item.question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="shrink-0 text-[#b6f300]"
        >
          <ChevronDown className="h-5 w-5" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-2 pt-4">
              <p className="text-sm leading-relaxed text-white/50 md:text-base">
                {item.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative w-full overflow-hidden bg-[#0a0a0a] py-20 md:py-32">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/3 h-[400px] w-[500px] rounded-full bg-[#b6f300]/[0.02] blur-[160px]" />
        <div className="absolute bottom-0 right-1/4 h-[350px] w-[400px] rounded-full bg-[#b6f300]/[0.025] blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-6 md:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" as const }}
          className="mb-14 text-center md:mb-20"
        >
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
            Preguntas{" "}
            <span className="text-[#b6f300]">frecuentes</span>
          </h2>
          <p className="mt-4 text-base text-white/50 md:text-lg">
            Todo lo que necesitás saber antes de empezar.
          </p>
        </motion.div>

        {/* Accordion */}
        <div className="flex flex-col gap-3">
          {faqs.map((faq, index) => (
            <FaqAccordionItem
              key={faq.question}
              item={faq}
              index={index}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
