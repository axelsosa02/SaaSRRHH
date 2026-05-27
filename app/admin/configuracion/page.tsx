import { getOrgConfig } from '@/lib/services/configuracion landing/organizacion-server'
import { getOrgSections } from '@/lib/services/configuracion landing/landingSections-server'
import { ConfiguracionClient } from '@/components/admin/configuracionClient'
import { redirect } from 'next/navigation'

export default async function ConfiguracionPage() {
    const [org, sections] = await Promise.all([
        getOrgConfig(),
        getOrgSections(),
    ])

    if (!org) redirect('/login')

    return <ConfiguracionClient org={org} sections={sections} />
}