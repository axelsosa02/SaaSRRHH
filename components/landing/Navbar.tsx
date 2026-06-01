"use client"

import { useState } from 'react'
import Link from 'next/link'

interface NavbarProps {
    logoUrl?: string | null
    nombre: string
    slug: string
    colorBrand: string
}

export function Navbar({ logoUrl, nombre, slug, colorBrand }: NavbarProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <header className="sticky top-0 z-50 w-full flex justify-center p-4 bg-transparent">
            <nav className="flex items-center justify-between gap-8 bg-white/80 backdrop-blur-md border border-[#c1a280]/40 rounded-full px-4 md:px-3 py-2.5 w-full max-w-4xl relative shadow-md shadow-[#472825]/2">
                {/* Logo / Nombre */}
                <Link href={`/${slug}`} className="flex items-center md:pl-3">
                    {logoUrl ? (
                        <img src={logoUrl} alt={nombre} className="h-9 w-auto object-contain" />
                    ) : (
                        <span className="text-lg font-bold tracking-tight text-[#472825]">{nombre}</span>
                    )}
                </Link>

                {/* Divisor vertical */}
                <div className="w-px h-6 bg-[#c1a280]/40 hidden md:flex"></div>

                {/* Menú Desktop */}
                <div className="hidden md:flex items-center justify-center gap-6 flex-1">
                    <Link href={`/${slug}`} className="text-[#472825]/90 hover:text-[#c1a280] font-semibold text-base transition-all hover:scale-105">
                        Inicio
                    </Link>
                    <Link href={`/${slug}#quienes-somos`} className="text-[#472825]/90 hover:text-[#c1a280] font-semibold text-base transition-all hover:scale-105">
                        Quiénes Somos
                    </Link>
                    <Link href={`/${slug}#servicios`} className="text-[#472825]/90 hover:text-[#c1a280] font-semibold text-base transition-all hover:scale-105">
                        Servicios
                    </Link>
                    <Link href={`/${slug}#vacantes`} className="text-[#472825]/90 hover:text-[#c1a280] font-semibold text-base transition-all hover:scale-105">
                        Vacantes
                    </Link>
                    <Link href={`/${slug}#contacto`} className="text-[#472825]/90 hover:text-[#c1a280] font-semibold text-base transition-all hover:scale-105">
                        Contacto
                    </Link>
                </div>

                {/* Botón Acción Principal (Desktop) & Trigger Móvil */}
                <div className="flex items-center gap-2 md:pr-1">
                    <Link
                        href={`/${slug}/postularse`}
                        className="hidden md:inline-block text-[#fff4e2] px-6 py-2.5 rounded-full text-xs md:text-sm font-bold transition-all hover:brightness-110 shadow-md shadow-[#472825]/15 hover:shadow-[#472825]/25 cursor-pointer active:scale-95"
                        style={{ backgroundColor: '#472825' }}
                    >
                        Postularse
                    </Link>

                    {/* Botón menú móvil (hamburguesa) */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden text-[#472825] p-2 rounded-full hover:bg-[#c1a280]/10 transition active:scale-95 cursor-pointer"
                        aria-label="Abrir menú"
                    >
                        {isOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 6 6 18" />
                                <path d="m6 6 12 12" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 12h16" />
                                <path d="M4 18h16" />
                                <path d="M4 6h16" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Menú desplegable Móvil */}
                {isOpen && (
                    <div className="absolute top-16 left-0 right-0 z-50 p-6 bg-white/95 backdrop-blur-md border border-[#c1a280]/20 rounded-3xl shadow-xl flex flex-col gap-5 items-center md:hidden transition-all duration-300 animate-in fade-in slide-in-from-top-4">
                        <Link href={`/${slug}`} onClick={() => setIsOpen(false)} className="text-[#472825] hover:text-[#c1a280] font-bold text-base transition-colors w-full text-center py-2">
                            Inicio
                        </Link>
                        <Link href={`/${slug}#quienes-somos`} onClick={() => setIsOpen(false)} className="text-[#472825] hover:text-[#c1a280] font-bold text-base transition-colors w-full text-center py-2">
                            Quiénes Somos
                        </Link>
                        <Link href={`/${slug}#servicios`} onClick={() => setIsOpen(false)} className="text-[#472825] hover:text-[#c1a280] font-bold text-base transition-colors w-full text-center py-2">
                            Servicios
                        </Link>
                        <Link href={`/${slug}#vacantes`} onClick={() => setIsOpen(false)} className="text-[#472825] hover:text-[#c1a280] font-bold text-base transition-colors w-full text-center py-2">
                            Vacantes
                        </Link>
                        <Link href={`/${slug}#contacto`} onClick={() => setIsOpen(false)} className="text-[#472825] hover:text-[#c1a280] font-bold text-base transition-colors w-full text-center py-2">
                            Contacto
                        </Link>
                        <Link
                            href={`/${slug}/postularse`}
                            onClick={() => setIsOpen(false)}
                            className="w-full text-center text-white py-3 rounded-full font-extrabold shadow-md shadow-[#472825]/15 active:scale-95 transition-all"
                            style={{ backgroundColor: '#472825' }}
                        >
                            Postularse
                        </Link>
                    </div>
                )}
            </nav>
        </header>
    )
}

