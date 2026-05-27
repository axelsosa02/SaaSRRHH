//--------------- FORMULARIO REUTILIZABLE (COMO FUNCIONA EL FORMULARIO) ---------------

'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Loader2 } from 'lucide-react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

//Este componente puede trabajar con cualquier tipo de objeto

interface GenericMasterFormProps<T extends Record<string, any>> {
    isOpen: boolean;
    onClose: () => void;
    item: T | null;
    onSave: (data: Partial<T>) => Promise<void>
    title: string;
    fieldLabel: string;
    fieldName: string;
    placeholder?: string;
}

export function GenericMasterForm<T extends Record<string, any>>({
    isOpen,
    onClose,
    item,
    onSave,
    title,
    fieldLabel,
    fieldName,
    placeholder
}: GenericMasterFormProps<T>) {
    const [loading, setLoading] = useState(false);

    const schema = z.object({
        [fieldName]: z.string().min(1, "Este campo es requerido"),
    });

    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            [fieldName]: '',
        },
    });

    useEffect(() => {
        if (item) {
            form.reset({
                [fieldName]: item[fieldName] || '',
            });
        } else {
            form.reset({
                [fieldName]: '',
            });
        }
    }, [item, form, isOpen, fieldName]);

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            await onSave(data);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-full min-w-[450px] max-w-md">
                <DialogHeader>
                    <DialogTitle>{item ? `Editar ${title}` : `Nueva ${title}`}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 min-w-[400px] py-4">
                        <FormField
                            control={form.control}
                            name={fieldName}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{fieldLabel}</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder={placeholder} disabled={loading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="pt-4">
                            <div className="flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {item ? 'Actualizar' : 'Crear'}
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
