import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative w-full border-t border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-6 py-12 md:px-8 md:py-16">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Image
              src="/images/logoATS-v3.png"
              alt="FlowATS Logo"
              width={120}
              height={120}
            />
            <p className="max-w-xs text-sm leading-relaxed text-white/50">
              La plataforma de selección de personal que simplifica tu
              reclutamiento.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-3">
            <h4 className="mb-1 text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
              Navegación
            </h4>
            <Link
              href="/"
              className="text-sm text-white/40 transition-colors duration-200 hover:text-[#b6f300]"
            >
              Inicio
            </Link>
            <Link
              href="#contacto"
              className="text-sm text-white/40 transition-colors duration-200 hover:text-[#b6f300]"
            >
              Contacto
            </Link>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-3">
            <h4 className="mb-1 text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
              Contacto
            </h4>
            <p className="text-sm text-white/40">axeldeveloperweb@gmail.com</p>
            <a href="https://wa.me/5493482630224" target="_blank" rel="noopener noreferrer" className="text-sm text-white/40" >+5493482630224</a>
          </div>
        </div>

        {/* Divider + copyright */}
        <div className="mt-10 border-t border-white/[0.06] pt-6 text-center">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()}{" "}
            <span className="text-[#b6f300]/60">FlowATS</span>. Todos los
            derechos reservados -  Desarrollado por <a href="https://axelsosadev.com" target="_blank" rel="noopener noreferrer" className="text-[#b6f300]">Axel Sosa</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
