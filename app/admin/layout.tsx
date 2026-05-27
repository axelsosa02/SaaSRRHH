import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/admin/sidebar"
import { createClientServer } from '@/lib/supabase/server'
import { OrgConfig } from '@/types/organizacion'

export default async function Layout({ children }: { children: React.ReactNode }) {
    //creamos la coneccion a supabase
    const supabase = await createClientServer()

    //Obtenemos el usuario actual
    const { data: { user } } = await supabase.auth.getUser()

    let orgName = ''
    // let userName = ''

    //Obtenemos el nombre de la organizacion
    if (user) {
        const { data } = await supabase
            .from('users')
            .select('organizations(nombre)')
            .eq('id', user.id)
            .single()

        const orgs = data?.organizations as OrgConfig | OrgConfig[]
        orgName = Array.isArray(orgs)
            ? orgs[0]?.nombre
            : orgs?.nombre || ''

        // userName = data?.nombre || ''
    }

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <AppSidebar
                    userEmail={user?.email}
                    orgName={orgName}
                />

                <main className="flex-1 min-w-0  overflow-hidden">
                    <SidebarTrigger />
                    {children}
                </main>
            </div>
        </SidebarProvider>
    )
}