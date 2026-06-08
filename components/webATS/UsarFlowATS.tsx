"use client";

import { motion } from "framer-motion";

interface Step {
  number: string;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: "01",
    title: "Centralizá todo",
    description:
      "Reuní candidatos, vacantes, entrevistas y comunicaciones en un solo lugar. Dejá de perder tiempo buscando información entre planillas, correos y WhatsApp.",
  },
  {
    number: "02",
    title: "Contratá más rápido",
    description:
      "Automatizá tareas repetitivas y acelerá cada etapa del proceso de selección. FlowATS fue diseñado para reducir los tiempos de contratación drásticamente.",
  },
  {
    number: "03",
    title: "Colaborá en equipo",
    description:
      "Compartí evaluaciones, dejá comentarios y coordiná entrevistas con tu equipo en tiempo real. Todos alineados, sin idas y vueltas innecesarias.",
  },
  {
    number: "04",
    title: "Escalá sin límites",
    description:
      "Ya sea que manejes 5 o 500 vacantes, FlowATS se adapta al crecimiento de tu consultora o equipo de RRHH sin perder el control.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
} as const;

const stepVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export default function UsarFlowATS() {
  return (
    <section className="relative w-full overflow-hidden bg-[#0a0a0a] py-20 md:py-28">
      {/* Glow effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -bottom-32 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-[#b6f300]/4 blur-[160px]" />
        <div className="absolute -top-20 right-0 h-[350px] w-[350px] rounded-full bg-[#b6f300]/3 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 md:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-16 md:mb-20"
        >
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
            ¿Por qué usar Flow
            <span className="text-[#b6f300]">ATS</span>?
          </h2>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="flex flex-col gap-10 md:gap-12"
        >
          {steps.map((step) => (
            <motion.div
              key={step.number}
              variants={stepVariants}
              className="group flex items-start gap-6 md:gap-10"
            >
              {/* Number */}
              <span className="shrink-0 select-none text-5xl font-bold leading-none text-white/15 transition-colors duration-300 group-hover:text-white/25 md:text-7xl">
                {step.number}
              </span>

              {/* Content */}
              <div className="flex flex-col">
                <h3 className="mb-3 text-xl font-bold text-[#b6f300] md:text-2xl lg:text-3xl">
                  {step.title}
                </h3>
                <p className="max-w-2xl text-sm leading-relaxed text-white/60 md:text-base">
                  {step.description}
                </p>
                {/* Accent underline */}
                <div className="mt-5 h-[2px] w-24 bg-[#b6f300]/40 transition-all duration-500 group-hover:w-full group-hover:bg-[#b6f300]/70" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
