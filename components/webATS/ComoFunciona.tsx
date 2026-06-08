"use client";

import { motion } from "framer-motion";

interface Step {
  number: string;
  title: string;
}

const steps: Step[] = [
  {
    number: "1",
    title: "Publicá tus búsquedas",
  },
  {
    number: "2",
    title: "Gestioná candidatos",
  },
  {
    number: "3",
    title: "Encontrá al talento ideal",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.3, delayChildren: 0.2 },
  },
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const lineVariants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.8, ease: "easeOut" as const, delay: 0.2 },
  },
};

const pulseVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" as const, delay: 0.6 },
  },
};

export default function ComoFunciona() {
  return (
    <section className="relative flex flex-col gap-20 w-full text-center overflow-hidden bg-[#0a0a0a] py-20 md:py-28 md:gap-28">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#b6f300]/[0.03] blur-[180px]" />
        <div className="absolute top-0 left-0 h-[300px] w-[400px] rounded-full bg-[#b6f300]/[0.02] blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[300px] w-[400px] rounded-full bg-[#b6f300]/[0.02] blur-[120px]" />
      </div>

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: "easeOut" as const }}
      >
        <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-white">
          ¿Cómo funciona?
        </h2>
      </motion.div>

      {/* Steps with connecting lines */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="relative z-10 mx-auto w-full max-w-6xl px-6 md:px-8"
      >
        {/* Desktop: horizontal layout */}
        <div className="hidden md:flex items-center justify-center">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              {/* Card */}
              <motion.div
                variants={cardVariants}
                className="group relative flex w-[280px] lg:w-[320px] gap-4 items-center border border-[#b6f300]/40 rounded-2xl p-5 lg:p-6 bg-white/[0.03] backdrop-blur-sm transition-all duration-300 hover:border-[#b6f300] hover:bg-white/[0.06] hover:shadow-[0_0_30px_rgba(182,243,0,0.08)]"
              >
                {/* Glow on hover behind card */}
                <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-[#b6f300]/[0.04] opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
                <span className="relative text-5xl lg:text-7xl font-bold text-[#b6f300]/80 transition-colors duration-300 group-hover:text-[#b6f300]">
                  {step.number}
                </span>
                <span className="relative text-white text-lg lg:text-2xl font-medium text-left">
                  {step.title}
                </span>
              </motion.div>

              {/* Connecting line + dot (not after last card) */}
              {index < steps.length - 1 && (
                <div className="relative flex items-center mx-2 lg:mx-4">
                  {/* Animated line */}
                  <motion.div
                    variants={lineVariants}
                    className="h-[2px] w-12 lg:w-20 origin-left bg-gradient-to-r from-[#b6f300]/70 to-[#b6f300]/30"
                  />
                  {/* Pulse dot at the end */}
                  <motion.div
                    variants={pulseVariants}
                    className="relative"
                  >
                    <div className="h-3 w-3 rounded-full bg-[#b6f300]" />
                    <motion.div
                      className="absolute inset-0 rounded-full bg-[#b6f300]/40"
                      animate={{
                        scale: [1, 2, 1],
                        opacity: [0.6, 0, 0.6],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut" as const,
                      }}
                    />
                  </motion.div>
                  {/* Second segment of line */}
                  <motion.div
                    variants={lineVariants}
                    className="h-[2px] w-12 lg:w-20 origin-left bg-gradient-to-r from-[#b6f300]/30 to-[#b6f300]/70"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile: vertical layout */}
        <div className="flex flex-col items-center gap-0 md:hidden">
          {steps.map((step, index) => (
            <div key={step.number} className="flex flex-col items-center">
              {/* Card */}
              <motion.div
                variants={cardVariants}
                className="group relative flex w-full max-w-[340px] gap-4 items-center border border-[#b6f300]/40 rounded-2xl p-5 bg-white/[0.03] backdrop-blur-sm transition-all duration-300 hover:border-[#b6f300] hover:bg-white/[0.06]"
              >
                <span className="text-5xl font-bold text-[#b6f300]/80 transition-colors duration-300 group-hover:text-[#b6f300]">
                  {step.number}
                </span>
                <span className="text-white text-xl font-medium text-left">
                  {step.title}
                </span>
              </motion.div>

              {/* Vertical connecting line + dot (not after last card) */}
              {index < steps.length - 1 && (
                <div className="relative flex flex-col items-center my-1">
                  <motion.div
                    variants={{
                      hidden: { scaleY: 0 },
                      visible: {
                        scaleY: 1,
                        transition: { duration: 0.6, ease: "easeOut" as const, delay: 0.2 },
                      },
                    }}
                    className="w-[2px] h-8 origin-top bg-gradient-to-b from-[#b6f300]/70 to-[#b6f300]/30"
                  />
                  <motion.div
                    variants={pulseVariants}
                    className="relative"
                  >
                    <div className="h-3 w-3 rounded-full bg-[#b6f300]" />
                    <motion.div
                      className="absolute inset-0 rounded-full bg-[#b6f300]/40"
                      animate={{
                        scale: [1, 2, 1],
                        opacity: [0.6, 0, 0.6],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut" as const,
                      }}
                    />
                  </motion.div>
                  <motion.div
                    variants={{
                      hidden: { scaleY: 0 },
                      visible: {
                        scaleY: 1,
                        transition: { duration: 0.6, ease: "easeOut" as const, delay: 0.4 },
                      },
                    }}
                    className="w-[2px] h-8 origin-top bg-gradient-to-b from-[#b6f300]/30 to-[#b6f300]/70"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
