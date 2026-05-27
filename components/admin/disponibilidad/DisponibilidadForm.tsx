'use client';

import { createAvailability, updateAvailability } from "@/lib/services/disponibilidad/availability";
import { Availability } from "@/types/database";
import { AvailabilityFormProps, AvailabilityInput } from "@/types/forms";
import { GenericMasterForm } from "../shared/GenericMasterForm";

export function DisponibilidadForm({ isOpen, onClose, onSuccess, availability }: AvailabilityFormProps) {
    const handleSave = async (data: Partial<Availability>) => {
        const input = data as AvailabilityInput;
        if (availability?.id) {
            await updateAvailability(availability.id, input);
        } else {
            await createAvailability(input);
        }
        onSuccess();
    }

    return (
        <GenericMasterForm<Availability>
            isOpen={isOpen}
            onClose={onClose}
            onSave={handleSave}
            item={availability}
            title="Disponibilidad"
            fieldLabel="Nombre de la Disponibilidad"
            fieldName="nombre"
            placeholder="Ej: Full-time, Part-time"
        />
    )
}

