"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <section className="w-full mx-auto fixed py-4 md:py-8 top-0 z-50 px-4 md:px-0">
      <nav className="max-w-7xl flex justify-between items-center rounded-full px-5 md:px-6 py-3 md:py-4 mx-auto border border-[#b6f300] bg-[#0a0a0a]/60 backdrop-blur-xl">
        {/* Logo */}
        <Image
          src="/images/logoATS-v3.png"
          alt="Logo"
          width={90}
          height={90}
          className="md:w-[110px]"
        />

        {/* Desktop links */}
        <ul className="hidden md:flex gap-10 text-white">
          <Link href="/">
            <li className="transition-colors duration-200 hover:text-[#b6f300]">
              Inicio
            </li>
          </Link>
          <Link href="#contacto">
            <li className="transition-colors duration-200 hover:text-[#b6f300]">
              Contacto
            </li>
          </Link>
          <Link href="#precios">
            <li className="transition-colors duration-200 hover:text-[#b6f300]">
              Precios
            </li>
          </Link>
        </ul>

        {/* Desktop CTA */}
        <Button
          variant="flowATS"
          className="hidden md:flex group items-center"
        >
          Comenzar
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Button>

        {/* Mobile hamburger */}
        <button
          onClick={toggleMenu}
          className="md:hidden flex items-center justify-center h-10 w-10 rounded-full text-white transition-colors duration-200 hover:text-[#b6f300]"
          aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="md:hidden mt-3 mx-auto max-w-7xl rounded-2xl border border-[#b6f300]/40 bg-[#0a0a0a]/90 backdrop-blur-xl p-6"
          >
            <ul className="flex flex-col gap-4 text-white mb-5">
              <Link href="/" onClick={closeMenu}>
                <li className="rounded-xl px-4 py-3 text-lg font-medium transition-all duration-200 hover:bg-[#b6f300]/10 hover:text-[#b6f300]">
                  Inicio
                </li>
              </Link>
              <Link href="#contacto" onClick={closeMenu}>
                <li className="rounded-xl px-4 py-3 text-lg font-medium transition-all duration-200 hover:bg-[#b6f300]/10 hover:text-[#b6f300]">
                  Contacto
                </li>
              </Link>
            </ul>
            <Button
              variant="flowATS"
              className="group flex w-full items-center justify-center"
              onClick={closeMenu}
            >
              Comenzar
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
