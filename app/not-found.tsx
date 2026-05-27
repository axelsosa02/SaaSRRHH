import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#fff4e2] px-6 py-24 text-center sm:py-32 lg:px-8">
      <div className="rounded-2xl bg-white/60 p-8 shadow-xl backdrop-blur-md border border-[#d3ab80]/20 max-w-md w-full animate-fade-in">
        <p className="text-base font-semibold text-[#472825]">404</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#472825] sm:text-4xl">
          Página No Encontrada
        </h1>
        <p className="mt-6 text-base leading-7 text-[#96786f]">
          Lo sentimos, no pudimos encontrar la organización o la página que estás buscando. Puede que el enlace esté roto o que el servidor de base de datos esté temporalmente pausado.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/"
            className="rounded-lg bg-[#472825] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#d3ab80] hover:text-[#472825] transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#472825]"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
