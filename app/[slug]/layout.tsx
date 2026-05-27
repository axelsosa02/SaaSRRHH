import { getOrganizationBySlug } from '@/lib/queries/organizations'
import { notFound } from 'next/navigation'
import { Navbar } from '@/components/landing/Navbar'

export default async function LandingLayout({children, params,}: {children: React.ReactNode
    params: Promise<{ slug: string }>}) {
    const { slug } = await params
    const org = await getOrganizationBySlug(slug)

    if (!org) {
        notFound()
    }

    return (
        <div
            style={{
                '--color-brand': org.color_primario || '#472825',
                '--color-accent': org.color_secundario || '#d3ab80',
                '--color-surface': '#fff4e2',
                '--color-muted': '#96786f',
                '--color-highlight': '#fde4bc',
            } as React.CSSProperties}
            className="min-h-screen flex flex-col bg-white text-[#472825]"
        >
            <Navbar
                logoUrl={org.logo_url}
                nombre={org.nombre}
                slug={slug}
                colorBrand={org.color_primario || '#1e3a8a'}
            />
            <main className="flex-1">
                {children}
            </main>
        </div>
    )
}
