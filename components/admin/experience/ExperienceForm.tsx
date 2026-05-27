'use client';

import { experienceFormProps, ExperienceInput } from '@/types/forms';
import { createExperience, updateExperience } from '@/lib/services/experiencia/experience';
import { GenericMasterForm } from '../shared/GenericMasterForm';
import { Experience } from '@/types/database';

export function ExperienceForm({ isOpen, onClose, experience, onSuccess }: experienceFormProps) {
    const handleSave = async (data: Partial<Experience>) => {
        const input = data as ExperienceInput;
        if (experience?.id) {
            await updateExperience(experience.id, input);
        } else {
            await createExperience(input);
        }
        onSuccess();
    };

    return (
        <GenericMasterForm<Experience>
            isOpen={isOpen}
            onClose={onClose}
            item={experience}
            onSave={handleSave}
            title="Experiencia"
            fieldLabel="Nivel de Experiencia"
            fieldName="description"
            placeholder="Ej: Junior, Semi-Senior, Senior..."
        />
    );
}
