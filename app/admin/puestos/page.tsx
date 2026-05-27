'use client';

import { useEffect, useState } from 'react'
import { JobForm } from "@/components/admin/createJob"
import { JobsTable } from "@/components/admin/table-job"
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import { getJobs } from '@/lib/services/puestos/getJobs'
import type { Job } from '@/types/database'

export default function JobsPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [jobs, setJobs] = useState<Job[]>([])
    const [selectedJob, setSelectedJob] = useState<Job | null>(null)

    // 🔥 cargar jobs
    const fetchJobs = async () => {
        const data = await getJobs()
        setJobs(data)
    }

    useEffect(() => {
        fetchJobs()
    }, [])

    const handleCreate = () => {
        setSelectedJob(null)
        setIsDialogOpen(true)
    }

    const handleEdit = (job: Job) => {
        setSelectedJob(job)
        setIsDialogOpen(true)
    }

    return (
        <div className="w-full space-y-6 p-6">

            <div className="flex justify-between">
                <h1 className="text-xl font-semibold">Puestos</h1>

                <Button onClick={handleCreate}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Crear Puesto
                </Button>
            </div>

            <JobsTable data={jobs} onEdit={handleEdit} onRefresh={fetchJobs} />

            <JobForm
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                job={selectedJob}
                onSuccess={fetchJobs}
            />
        </div>
    )
}