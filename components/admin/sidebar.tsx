'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar"

import {
    LayoutDashboard,
    Users,
    Briefcase,
    LogOut,
    Settings,
} from "lucide-react"
import { AvatarBadge } from './AvatarBadge'
import { useAuth } from '@/context/AuthContext'


type Props = {
    userEmail?: string
    userName?: string
    orgName?: string
    planName?: string
}

export function AppSidebar({ userEmail, userName, orgName, planName }: Props) {
    const pathname = usePathname()

    const PLAN_BADGE: Record<string, string> = {
        Starter: 'bg-zinc-100 text-zinc-700',
        Pro: 'bg-amber-100 text-amber-800',
        Agency: 'bg-violet-100 text-violet-800',
    }

    const { user } = useAuth()
    const links = [
        {
            href: '/admin',
            label: 'Dashboard',
            icon: LayoutDashboard,
        },
        {
            href: '/admin/postulantes',
            label: 'Postulantes',
            icon: Users,
        },
        {
            href: '/admin/puestos',
            label: 'Puestos',
            icon: Briefcase,
        },
        {
            href: '/admin/areas',
            label: 'Areas',
            icon: Briefcase,
        },
        {
            href: '/admin/experience',
            label: 'Experiencia',
            icon: Briefcase,
        },
        {
            href: '/admin/disponibilidad',
            label: 'Disponibilidad',
            icon: Briefcase,
        },
        {
            href: '/admin/configuracion',
            label: 'Configuración',
            icon: Settings,
        },
    ]

    return (
        <Sidebar>
            {/* HEADER */}
            <SidebarHeader>
                <div className="px-2 py-1">
                    <p className="text-xs text-muted-foreground">Organización</p>
                    <h2 className="text-lg font-bold">{orgName || 'Mi Empresa'}</h2>
                    {planName && (
                        <span className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full ${PLAN_BADGE[planName] || 'bg-muted text-muted-foreground'}`}>
                            Plan {planName}
                        </span>
                    )}
                </div>
            </SidebarHeader>

            {/* CONTENT */}
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Panel</SidebarGroupLabel>

                    <SidebarMenu>
                        {links.map((link) => {
                            const Icon = link.icon
                            const isActive = pathname === link.href

                            return (
                                <SidebarMenuItem key={link.href}>
                                    <SidebarMenuButton
                                        className={isActive ? 'bg-muted font-semibold' : ''}
                                    >
                                        <Link href={link.href} className="flex items-center gap-2">
                                            <Icon size={18} />
                                            <span className='text-base'>
                                                {link.label}
                                            </span>

                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            {/* FOOTER */}
            <SidebarFooter>
                <div className="flex flex-col gap-4 p-4 border-t">

                    <Link href={'/admin/profile'} className='flex items-center gap-2'>
                        <AvatarBadge name={user?.nombre || 'Usuario'} />
                    </Link>

                    <form action="/api/auth/signout" method="post">
                        <button className="flex items-center gap-2 text-red-500 cursor-pointer hover:opacity-80 text-sm">
                            <LogOut size={16} />
                            Cerrar sesión
                        </button>
                    </form>
                </div>
            </SidebarFooter>

        </Sidebar>
    )
}