import { motion } from "framer-motion";

interface Step {
    number: string
    title: string
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
        transition: { staggerChildren: 0.25, delayChildren: 0.1 },
    },
} as const

const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.5, ease: "easeOut" as const },
    },
}

const lineVariants = {
    hidden: { scaleX: 0 },
    visible: {
        scaleX: 1,
        transition: { duration: 0.7, ease: "easeOut" as const, delay: 0.2 },
    },
}

const lineVerticalVariants = {
    hidden: { scaleY: 0 },
    visible: {
        scaleY: 1,
        transition: { duration: 0.5, ease: "easeOut" as const, delay: 0.15 },
    },
}

const dotVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
        scale: 1,
        opacity: 1,
        transition: { duration: 0.3, ease: "easeOut" as const, delay: 0.5 },
    },
}

export default function ComoFunciona() {
    return (
        <section className="relative flex flex-col gap-16 w-full text-center overflow-hidden bg-[#0a0a0a] py-20 md:py-28 md:gap-24">

            {/* Fondo — blur reducido en móvil */}
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                <div className="absolute top-1/2 left-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#b6f300]/[0.03] blur-[80px] md:blur-[180px]" />
                <div className="absolute top-0 left-0 h-[300px] w-[400px] rounded-full bg-[#b6f300]/[0.02] blur-[50px] md:blur-[120px]" />
                <div className="absolute bottom-0 right-0 h-[300px] w-[400px] rounded-full bg-[#b6f300]/[0.02] blur-[50px] md:blur-[120px]" />
            </div>

            {/* Título */}
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-white">
                    ¿Cómo funciona?
                </h2>
            </motion.div>

            {/* Steps */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                className="relative z-10 mx-auto w-full max-w-6xl px-6 md:px-8"
            >
                {/* Desktop — horizontal */}
                <div className="hidden md:flex items-start justify-center">
                    {steps.map((step, index) => (
                        <div key={step.number} className="flex items-start">
                            {/* Card */}
                            <motion.div
                                variants={cardVariants}
                                className="group relative flex flex-col w-[280px] lg:w-[320px] gap-3 border border-[#b6f300]/40 rounded-2xl p-6 bg-white/[0.03] backdrop-blur-sm transition-all duration-300 hover:border-[#b6f300] hover:bg-white/[0.06] hover:shadow-[0_0_30px_rgba(182,243,0,0.08)]"
                            >
                                <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-[#b6f300]/[0.04] opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
                                <span className="relative text-6xl lg:text-7xl font-bold text-[#b6f300]/80 transition-colors duration-300 group-hover:text-[#b6f300]">
                                    {step.number}
                                </span>
                                <span className="relative text-white text-lg lg:text-xl font-semibold text-center">
                                    {step.title}
                                </span>

                            </motion.div>

                            {/* Conector horizontal */}
                            {index < steps.length - 1 && (
                                <div className="relative flex items-center mx-3 lg:mx-5 mt-12">
                                    <motion.div
                                        variants={lineVariants}
                                        className="h-[2px] w-10 lg:w-16 origin-left bg-gradient-to-r from-[#b6f300]/70 to-[#b6f300]/30"
                                    />
                                    {/* Dot sin pulse infinito — solo 2 repeticiones */}
                                    <motion.div variants={dotVariants} className="relative">
                                        <div className="h-3 w-3 rounded-full bg-[#b6f300]" />
                                        <motion.div
                                            className="absolute inset-0 rounded-full bg-[#b6f300]/40"
                                            animate={{ scale: [1, 2, 1], opacity: [0.6, 0, 0.6] }}
                                            transition={{
                                                duration: 2,
                                                repeat: 2,          // ← solo 2 veces, no infinito
                                                ease: "easeInOut",
                                            }}
                                        />
                                    </motion.div>
                                    <motion.div
                                        variants={lineVariants}
                                        className="h-[2px] w-10 lg:w-16 origin-left bg-gradient-to-r from-[#b6f300]/30 to-[#b6f300]/70"
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Móvil — vertical */}
                <div className="flex flex-col items-center gap-0 md:hidden">
                    {steps.map((step, index) => (
                        <div key={step.number} className="flex flex-col items-center w-full">
                            {/* Card */}
                            <motion.div
                                variants={cardVariants}
                                className="group relative flex flex-col w-full max-w-[340px] gap-3 border border-[#b6f300]/40 rounded-2xl p-5 bg-white/[0.03] backdrop-blur-sm"
                            >
                                <span className="text-5xl font-bold text-[#b6f300]/80">
                                    {step.number}
                                </span>
                                <span className="text-white text-center text-lg font-semibold ">
                                    {step.title}
                                </span>
                            </motion.div>

                            {/* Conector vertical */}
                            {index < steps.length - 1 && (
                                <div className="flex flex-col items-center my-1">
                                    <motion.div
                                        variants={lineVerticalVariants}
                                        className="w-[2px] h-6 origin-top bg-gradient-to-b from-[#b6f300]/70 to-[#b6f300]/30"
                                    />
                                    <motion.div variants={dotVariants} className="relative">
                                        <div className="h-3 w-3 rounded-full bg-[#b6f300]" />
                                        {/* Sin pulse en móvil — ahorra batería */}
                                    </motion.div>
                                    <motion.div
                                        variants={lineVerticalVariants}
                                        className="w-[2px] h-6 origin-top bg-gradient-to-b from-[#b6f300]/30 to-[#b6f300]/70"
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </motion.div>
        </section>
    )
}