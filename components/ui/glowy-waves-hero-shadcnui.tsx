"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowRight, Link, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type Point = { x: number; y: number }

interface WaveConfig {
    offset: number
    amplitude: number
    frequency: number
    color: string
    opacity: number
}

const heroStats: { label: string; value: string }[] = [
    { label: "Consultoras activas", value: "12+" },
    { label: "Candidatos gestionados", value: "1.200+" },
    { label: "Posiciones cerradas", value: "340+" },
]

const containerVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, staggerChildren: 0.12 },
    },
}

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" },
    },
}

const statsVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.08 },
    },
}

// ─── Canvas con ondas — solo desktop ─────────────────────────────────────────

function WaveCanvas() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const mouseRef = useRef<Point>({ x: 0, y: 0 })
    const targetMouseRef = useRef<Point>({ x: 0, y: 0 })

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        let animationId: number
        let time = 0

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

        // Configuración reducida para mejor performance
        const WAVE_PALETTE: WaveConfig[] = [
            { offset: 0,              amplitude: 70, frequency: 0.003,  color: "rgba(182, 243, 0, 0.8)", opacity: 0.45 },
            { offset: Math.PI / 2,    amplitude: 90, frequency: 0.0026, color: "rgba(182, 243, 0, 0.7)", opacity: 0.35 },
            { offset: Math.PI,        amplitude: 60, frequency: 0.0034, color: "rgba(182, 243, 0, 0.55)", opacity: 0.3 },
        ]

        const mouseInfluence = prefersReducedMotion ? 10 : 70
        const influenceRadius = prefersReducedMotion ? 160 : 320
        const smoothing = prefersReducedMotion ? 0.04 : 0.1
        // shadowBlur reducido respecto al original — mejor performance incluso en desktop
        const SHADOW_BLUR = 20

        const resizeCanvas = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }

        const recenterMouse = () => {
            const center = { x: canvas.width / 2, y: canvas.height / 2 }
            mouseRef.current = center
            targetMouseRef.current = center
        }

        const handleResize = () => { resizeCanvas(); recenterMouse() }
        const handleMouseMove = (e: MouseEvent) => { targetMouseRef.current = { x: e.clientX, y: e.clientY } }
        const handleMouseLeave = () => { recenterMouse() }

        resizeCanvas()
        recenterMouse()

        window.addEventListener("resize", handleResize)
        window.addEventListener("mousemove", handleMouseMove)
        window.addEventListener("mouseleave", handleMouseLeave)

        const drawWave = (wave: WaveConfig) => {
            ctx.save()
            ctx.beginPath()

            // Paso de 6 en vez de 4 — menos puntos, menos cálculos
            for (let x = 0; x <= canvas.width; x += 6) {
                const dx = x - mouseRef.current.x
                const dy = canvas.height / 2 - mouseRef.current.y
                const distance = Math.sqrt(dx * dx + dy * dy)
                const influence = Math.max(0, 1 - distance / influenceRadius)
                const mouseEffect = influence * mouseInfluence * Math.sin(time * 0.001 + x * 0.01 + wave.offset)

                const y =
                    canvas.height / 2 +
                    Math.sin(x * wave.frequency + time * 0.002 + wave.offset) * wave.amplitude +
                    Math.sin(x * wave.frequency * 0.4 + time * 0.003) * (wave.amplitude * 0.45) +
                    mouseEffect

                x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
            }

            ctx.lineWidth = 2.5
            ctx.strokeStyle = wave.color
            ctx.globalAlpha = wave.opacity
            ctx.shadowBlur = SHADOW_BLUR
            ctx.shadowColor = wave.color
            ctx.stroke()
            ctx.restore()
        }

        const animate = () => {
            time += 1

            mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * smoothing
            mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * smoothing

            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
            gradient.addColorStop(0, "#0a0a0a")
            gradient.addColorStop(1, "#0d120d")

            ctx.fillStyle = gradient
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.globalAlpha = 1
            ctx.shadowBlur = 0

            WAVE_PALETTE.forEach(drawWave)

            animationId = window.requestAnimationFrame(animate)
        }

        animationId = window.requestAnimationFrame(animate)

        return () => {
            window.removeEventListener("resize", handleResize)
            window.removeEventListener("mousemove", handleMouseMove)
            window.removeEventListener("mouseleave", handleMouseLeave)
            cancelAnimationFrame(animationId)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full"
            aria-hidden="true"
        />
    )
}

// ─── Fondo estático para móvil — cero costo ───────────────────────────────────

function StaticBackground() {
    return (
        <div
            className="absolute inset-0"
            aria-hidden="true"
            style={{
                background: 'linear-gradient(135deg, #0a0a0a 0%, #0d120d 60%, #0a0f0a 100%)',
            }}
        >
            {/* Ondas SVG estáticas — aspecto similar al canvas sin costo de GPU */}
            <svg
                className="absolute bottom-0 left-0 w-full opacity-40"
                viewBox="0 0 1440 200"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
            >
                <path
                    d="M0,100 C240,160 480,40 720,100 C960,160 1200,40 1440,100 L1440,200 L0,200 Z"
                    fill="rgba(182,243,0,0.15)"
                />
                <path
                    d="M0,120 C360,60 720,180 1080,100 C1260,60 1380,140 1440,120 L1440,200 L0,200 Z"
                    fill="rgba(182,243,0,0.08)"
                />
            </svg>

            {/* Glow suave — CSS puro, sin canvas */}
            <div
                className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                    width: '300px',
                    height: '300px',
                    background: 'radial-gradient(circle, rgba(182,243,0,0.08) 0%, transparent 70%)',
                    filter: 'blur(40px)',
                }}
            />
        </div>
    )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function GlowyWavesHero() {
    const [isMobile, setIsMobile] = useState(false)
    // Arrancamos asumiendo mobile para evitar flash en SSR
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setIsMobile(window.innerWidth < 768)
        setMounted(true)

        const handleResize = () => setIsMobile(window.innerWidth < 768)
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    return (
        <section
            className="relative isolate flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#0a0a0a]"
            role="region"
            aria-label="Hero section"
        >
            {/* Fondo — canvas en desktop, SVG estático en móvil */}
            {mounted && (isMobile ? <StaticBackground /> : <WaveCanvas />)}

            {/* Glow decorativo — solo CSS, sin costo */}
            <div className="absolute inset-0 -z-10 pointer-events-none" aria-hidden="true">
                <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-white/[0.02] blur-[140px]" />
            </div>

            {/* Contenido */}
            <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-24 text-center md:px-8 lg:px-12">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full"
                >
                    {/* Badge */}
                    <motion.div
                        variants={itemVariants}
                        className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/70"
                    >
                        <Sparkles className="h-4 w-4 text-[#b6f300]" aria-hidden="true" />
                        Software de selección de personal
                    </motion.div>

                    {/* Título */}
                    <motion.h1
                        variants={itemVariants}
                        className="mb-6 text-4xl font-semibold tracking-tight text-white md:text-6xl lg:text-7xl"
                    >
                        Contratá{" "}
                        <span className="text-[#b6f300]">mejor</span>
                        <br />
                        <span className="bg-gradient-to-r from-white via-white/60 to-white/80 bg-clip-text text-transparent">
                            Contratá más{" "}
                            <span className="text-[#b6f300]">rápido.</span>
                        </span>
                    </motion.h1>

                    {/* Descripción */}
                    <motion.p
                        variants={itemVariants}
                        className="mx-auto mb-10 max-w-3xl text-lg text-white/80 md:text-2xl"
                    >
                        Gestioná candidatos, puestos y entrevistas desde un solo lugar y tomá mejores decisiones de{" "}
                        <span className="text-[#b6f300]">contratación.</span>
                    </motion.p>

                    {/* CTA */}
                    <motion.div
                        variants={itemVariants}
                        className="mb-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
                    >
                          <a href="#contacto">
                              <Button
                                size="lg"
                                className="group gap-2 cursor-pointer rounded-xl px-8 py-6 bg-[#b6f300] text-black text-base uppercase tracking-[0.2em] hover:bg-[#c8ff00] transition-colors"
                            >
                                Empezar ahora
                                <ArrowRight
                                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                                    aria-hidden="true"
                                />
                            </Button>
                          </a>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        variants={statsVariants}
                        className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:grid-cols-3"
                    >
                        {heroStats.map((stat) => (
                            <motion.div
                                key={stat.label}
                                variants={itemVariants}
                                className="space-y-1"
                            >
                                <div className="text-xs uppercase tracking-[0.3em] text-white/50">
                                    {stat.label}
                                </div>
                                <div className="text-3xl font-semibold text-white">
                                    {stat.value}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}