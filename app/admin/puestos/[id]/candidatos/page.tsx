import { redirect } from 'next/navigation'

// /admin/puestos/[id]/candidatos sin un candidateId no tiene sentido.
// Redirigimos al tablero kanban del puesto.
export default function CandidatosIndexPage({ params }: { params: { id: string } }) {
    redirect(`/admin/puestos/${params.id}`)
}
