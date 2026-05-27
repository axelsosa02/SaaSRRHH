'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log typical connection errors in a cleaner format
    if (error.message?.includes('ENOTFOUND') || error.message?.includes('fetch failed')) {
      console.warn('Conectividad de Supabase interrumpida: Es probable que el proyecto de Supabase esté pausado o no haya conexión a Internet.')
    } else {
      console.error('Error de renderizado detectado:', error)
    }
  }, [error])

  const isSupabasePaused = 
    error.message?.includes('oybtpkfjvjslheggxdlz.supabase.co') || 
    error.message?.includes('ENOTFOUND') || 
    error.message?.includes('fetch failed');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#fff4e2] px-6 py-24 text-center sm:py-32 lg:px-8">
      <div className="rounded-2xl bg-white/70 p-8 shadow-xl backdrop-blur-md border border-[#d3ab80]/20 max-w-lg w-full animate-fade-in">
        <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-600/20">
          Error de Conexión
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#472825] sm:text-4xl">
          {isSupabasePaused ? 'Base de Datos Pausada' : 'Algo salió mal'}
        </h1>
        <p className="mt-6 text-base leading-7 text-[#96786f]">
          {isSupabasePaused ? (
            <span>
              El proyecto de <strong>Supabase</strong> está actualmente <strong>pausado</strong> o desconectado. 
              Por favor, inicia sesión en tu panel de Supabase y reactiva el proyecto <strong>"axelsosa02's Project"</strong> para restablecer el servicio.
            </span>
          ) : (
            'Se produjo un error al cargar la información. Por favor, comprueba tu conexión a internet o inténtalo de nuevo.'
          )}
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <button
            onClick={() => reset()}
            className="rounded-lg bg-[#472825] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#d3ab80] hover:text-[#472825] transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#472825]"
          >
            Reintentar
          </button>
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-[#472825] hover:text-[#d3ab80] transition-colors duration-300"
          >
            Ir a Supabase Dashboard <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </div>
    </div>
  )
}
