import { PostulantesTable } from "@/components/admin/postulantes-table"
import { getCandidates } from "@/lib/data/candidates"
import { getAreas } from "@/lib/services/areas/getAreas"
import { getExperience } from "@/lib/services/experiencia/getExperience"
import { getAvailability } from "@/lib/services/disponibilidad/getAvailability"
import { Users } from "lucide-react"

export default async function PostulantesPage() {

    const [postulantes, areas, experience, availability] = await Promise.all([
        getCandidates(),
        getAreas(),
        getExperience(),
        getAvailability(),
    ]);


    return (
        <div className="flex flex-col gap-6 p-6">
            {/* ── Encabezado ── */}
            <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Users className="size-5" />
                </div>
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">Postulantes</h1>
                    <p className="text-sm text-muted-foreground">
                        {postulantes.length} postulantes registrados
                    </p>
                </div>
            </div>

            {/* ── Tabla con filtros ── */}
            <PostulantesTable
                data={postulantes}
                areas={areas}
                experience={experience}
                availability={availability}
            />
        </div>
    )
}
