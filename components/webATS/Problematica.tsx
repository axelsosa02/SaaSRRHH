"use client";

import { motion } from "framer-motion";
import {
  MessageSquareWarning,
  FolderSearch,
  Clock,
  SearchX,
  UserX,
  TrendingDown,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ProblemCard {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const problems: ProblemCard[] = [
  {
    icon: <MessageSquareWarning className="h-7 w-7" />,
    title: "Comunicación dispersa",
    description:
      "¿Tu equipo comparte información por diferentes canales generando confusión?",
  },
  {
    icon: <FolderSearch className="h-7 w-7" />,
    title: "Desorganización",
    description:
      "¿Tus candidatos están repartidos entre planillas, correos, WhatsApp y documentos?",
  },
  {
    icon: <Clock className="h-7 w-7" />,
    title: "Pérdida de tiempo",
    description:
      "¿Invertís horas en tareas repetitivas que podrían automatizarse?",
  },
  {
    icon: <SearchX className="h-7 w-7" />,
    title: "Falta de seguimiento",
    description:
      "¿Te cuesta saber en qué etapa se encuentra cada postulante?",
  },
  {
    icon: <UserX className="h-7 w-7" />,
    title: "Candidatos perdidos",
    description:
      "¿Perdés perfiles valiosos por no contar con una base de talento organizada?",
  },
  {
    icon: <TrendingDown className="h-7 w-7" />,
    title: "Dificultad para escalar",
    description:
      "¿Tu proceso de selección no acompaña el crecimiento de tu empresa?",
  },
];

const CARD_WIDTH = 280;
const CARD_GAP = 24;
const SCROLL_SPEED = 0.5;

export default function Problematica() {
  const trackRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const offsetRef = useRef(0);
  const [isPaused, setIsPaused] = useState(false);

  /* Duplicate the cards for seamless looping */
  const duplicatedCards = [...problems, ...problems];
  const singleSetWidth = problems.length * (CARD_WIDTH + CARD_GAP);

  useEffect(() => {
    const animate = () => {
      if (!isPaused) {
        offsetRef.current -= SCROLL_SPEED;

        /* Reset when one full set has scrolled past */
        if (Math.abs(offsetRef.current) >= singleSetWidth) {
          offsetRef.current = 0;
        }

        if (trackRef.current) {
          trackRef.current.style.transform = `translateX(${offsetRef.current}px)`;
        }
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [isPaused, singleSetWidth]);

  return (
    <section className="relative w-full overflow-hidden bg-[#0a0a0a] py-20 md:py-28">
      {/* Decorative diagonal lines */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, #b6f300 0px, #b6f300 1px, transparent 1px, transparent 60px)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-14 text-center md:mb-20"
        >
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
            ¿Estás{" "}
            <span className="italic text-[#b6f300]">luchando</span> con?
          </h2>
        </motion.div>

        {/* Carousel */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Fade edges */}
          <div className="pointer-events-none absolute left-0 top-0 z-20 h-full w-20 bg-linear-to-r from-[#0a0a0a] to-transparent md:w-32" />
          <div className="pointer-events-none absolute right-0 top-0 z-20 h-full w-20 bg-linear-to-l from-[#0a0a0a] to-transparent md:w-32" />

          <div className="overflow-hidden">
            <div
              ref={trackRef}
              className="flex will-change-transform"
              style={{ gap: `${CARD_GAP}px` }}
            >
              {duplicatedCards.map((problem, index) => (
                <div
                  key={`${problem.title}-${index}`}
                  className="group relative shrink-0 cursor-default"
                  style={{ width: `${CARD_WIDTH}px` }}
                >
                  <div className="relative flex h-full flex-col rounded-2xl border border-white/8 bg-white/4 p-6 backdrop-blur-sm transition-all duration-300 hover:border-[#b6f300]/40 hover:bg-white/[0.07]">
                    {/* Icon */}
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#b6f300]/10 text-[#b6f300] transition-colors duration-300 group-hover:bg-[#b6f300]/20">
                      {problem.icon}
                    </div>

                    {/* Title */}
                    <h3 className="mb-2 text-base font-semibold text-white">
                      {problem.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm leading-relaxed text-white/50">
                      {problem.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Bottom message */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mx-auto mt-16 max-w-3xl text-center text-base leading-relaxed text-white/70 md:mt-20 md:text-lg"
        >
          Miles de consultoras y equipos de RRHH enfrentan estos problemas todos
          los días.{" "}
          <span className="font-semibold italic text-[#b6f300]">FlowATS</span>{" "}
          fue diseñado para resolverlos desde un único lugar.
        </motion.p>
      </div>
    </section>
  );
}
