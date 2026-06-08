export interface Plan {
    id: string
    name: 'starter' | 'pro' | 'agency'
    display_name: string
    price: number
    max_candidates: number | null    // null = ilimitado
    max_jobs: number | null          // null = ilimitado
    max_users: number | null         // null = ilimitado
    has_custom_landing: boolean
    has_mass_email: boolean
    storage_mb: number
    active: boolean
    created_at: string
}
