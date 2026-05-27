import { getCurrentUserWithOrg } from '@/lib/services/users'
import { redirect } from 'next/navigation'
import { getDashboardMetrics } from '@/lib/services/dashboard'
import { DashboardClient } from '@/components/admin/DashboardClient'

export default async function AdminPage() {

    const [session, metrics] = await Promise.all([
        getCurrentUserWithOrg(),
        getDashboardMetrics(),
    ])

    if (!session) {
        redirect('/login')
    }

    return <DashboardClient metrics={metrics} />
}


