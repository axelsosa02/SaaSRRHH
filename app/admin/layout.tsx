import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/admin/sidebar"
import { createClientServer } from '@/lib/supabase/server'
import { OrgConfig } from '@/types/organizacion'

type OrganizationWithPlan = {
    nombre: string
    plans: {
        display_name: string
    } | null
}

export default async function Layout({ children }: { children: React.ReactNode }) {
    //creamos la coneccion a supabase
    const supabase = await createClientServer()

    //Obtenemos el usuario actual
    const { data: { user } } = await supabase.auth.getUser()

    let orgName = ''
    let planName = ''

    //Obtenemos el nombre de la organizacion y plan
    if (user) {
        const { data } = await supabase
            .from('users')
            .select('organizations(nombre, plans(display_name))')
            .eq('id', user.id)
            .single()

        const orgs = data?.organizations as unknown as OrganizationWithPlan | OrganizationWithPlan[] | null
        const org = Array.isArray(orgs) ? orgs[0] : orgs
        orgName = org?.nombre || ''
        planName = org?.plans?.display_name || ''
    }

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <AppSidebar
                    userEmail={user?.email}
                    orgName={orgName}
                    planName={planName}
                />

                <main className="flex-1 min-w-0  overflow-hidden">
                    <SidebarTrigger />
                    {children}
                </main>
            </div>
        </SidebarProvider>
    )
}
