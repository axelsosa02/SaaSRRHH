'use client';

import { AreasFormProps, AreaInput } from '@/types/forms';
import { createArea, updateArea } from '@/lib/services/areas/areas';
import { GenericMasterForm } from '../shared/GenericMasterForm';
import { Area } from '@/types/database';

export function AreaForm({ isOpen, onClose, area, onSuccess }: AreasFormProps) {
    const handleSave = async (data: Partial<Area>) => {
        const input = data as AreaInput;
        if (area?.id) {
            await updateArea(area.id, input);
        } else {
            await createArea(input);
        }
        onSuccess();
    };

    return (
        <GenericMasterForm<Area>
            isOpen={isOpen}
            onClose={onClose}
            item={area}
            onSave={handleSave}
            title="Área"
            fieldLabel="Nombre del Área"
            fieldName="nombre"
            placeholder="Ej: Tecnología, Marketing..."
        />
    );
}
