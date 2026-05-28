// FORM TYPES
// Representan formularios.
// sin ids, sin timestamps, campos opcionales distintos

import { Area, Availability, Experience, Job } from "./database"

//para create y update 
export type JobInput = {
    titulo: string
    descripcion?: string
    area: string
    modalidad: string
    localidad: string
    visibility?: boolean
}

export type CandidatesFormValues = {
    nombre: string
    apellido: string
    email: string
    area: string
    experiencia_id: string
    disponibilidad_id: string
    localidad: string
    provincia?: string
    cv?: File | string
    fechaPostulacion: string
    puesto: string
}

export type AreaInput = {
    nombre: string
}

export interface AreasFormProps {
    isOpen: boolean;
    onClose: () => void;
    area: Area | null;
    onSuccess: () => void;
}

export type ExperienceInput = {
    description: string
}

export interface experienceFormProps {
    isOpen: boolean;
    onClose: () => void;
    experience: Experience | null;
    onSuccess: () => void;
}

export type AvailabilityInput = {
    nombre: string
}

export interface AvailabilityFormProps {
    isOpen: boolean;
    onClose: () => void;
    availability: Availability | null;
    onSuccess: () => void;
}



export interface JobsFormProps {
    isOpen: boolean;
    onClose: () => void;
    job: Job | null;
    onSuccess: () => void;
}

