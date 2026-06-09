import { motion } from "framer-motion";
import Image from "next/image";

interface Feature {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
}

const features: Feature[] = [
  {
    title: "Landing personalizada",
    description:
      "Cada consultora o empresa puede crear su propia web pública con logo, colores y vacantes. Lista en minutos desde el panel.",
    image: "/images/landing.webp",
    imageAlt: "Panel de configuración de landing personalizada",
  },
  {
    title: "Postulaciones online",
    description:
      "Tus candidatos se postulan desde tu landing y sus datos entran solos al panel a través de un formulario.",
    image: "/images/formulario.webp",
    imageAlt: "Formulario de postulación online",
  },
  {
    title: "Perfil completo del candidato",
    description:
      "CV, evaluaciones, documentos, notas y comunicaciones centralizados en un único perfil accesible en segundos.",
    image: "/images/perfilcandidato.webp",
    imageAlt: "Vista del perfil completo del candidato",
  },
  {
    title: "Tablero Kanban",
    description:
      "Arrastrá candidatos entre etapas — entrevistando, evaluación, contratado — y sabé exactamente dónde está cada uno.",
    image: "/images/kanban.webp",
    imageAlt: "Tablero Kanban de seguimiento de candidatos",
  },
];

const textVariants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: "easeOut" as const },
  },
};

const textVariantsRight = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: "easeOut" as const },
  },
};

const imageVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.8, ease: "easeOut" as const, delay: 0.15 },
  },
};

export default function Funcionalidades() {
  return (
    <section className="relative w-full overflow-hidden bg-[#0a0a0a] py-20 md:py-32">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[15%] right-0 h-[400px] w-[500px] rounded-full bg-[#b6f300]/[0.025] blur-[160px]" />
        <div className="absolute top-[55%] left-0 h-[400px] w-[500px] rounded-full bg-[#b6f300]/[0.02] blur-[140px]" />
        <div className="absolute bottom-[10%] right-[20%] h-[350px] w-[350px] rounded-full bg-[#b6f300]/[0.015] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-8">
        <div className="flex flex-col gap-24 md:gap-36 lg:gap-44">
          {features.map((feature, index) => {
            const isEven = index % 2 === 0;

            return (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                className={`flex flex-col items-center gap-10 md:gap-14 lg:gap-20 ${
                  isEven ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Text block */}
                <motion.div
                  variants={isEven ? textVariants : textVariantsRight}
                  className="flex flex-col md:w-[45%]"
                >
                  <h3 className="mb-4 text-3xl font-bold leading-tight text-[#b6f300] md:text-4xl lg:text-5xl">
                    {feature.title}
                  </h3>
                  <p className="text-base leading-relaxed text-white/60 md:text-lg">
                    {feature.description}
                  </p>
                  {/* Accent line */}
                  <div className="mt-6 h-[2px] w-16 bg-[#b6f300]/30" />
                </motion.div>

                {/* Image block */}
                <motion.div
                  variants={imageVariants}
                  className="group relative md:w-[55%]"
                >
                  {/* Glow behind image */}
                  <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-[#b6f300]/[0.04] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

                  <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] shadow-2xl transition-all duration-500 group-hover:border-[#b6f300]/20 group-hover:shadow-[0_0_40px_rgba(182,243,0,0.06)]">
                    <Image
                      src={feature.image}
                      alt={feature.imageAlt}
                      width={800}
                      height={500}
                      className="h-auto w-full object-cover"
                    />
                    {/* Subtle gradient overlay at top for blending */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/30 via-transparent to-transparent" />
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
