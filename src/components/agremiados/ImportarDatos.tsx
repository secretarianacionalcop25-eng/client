'use client';

import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

function UploadIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
    );
}

export interface ImportarDatosProps {
    onSuccess?: () => void;
}

export function ImportarDatos({ onSuccess }: ImportarDatosProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const { showToast } = useToast();
    const queryClient = useQueryClient();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const name = file.name.toLowerCase();
        const valid = name.endsWith('.csv') || name.endsWith('.xlsx') || name.endsWith('.xls');
        if (!valid) {
            showToast('Use archivos .csv, .xlsx o .xls', 'error');
            return;
        }
        setSelectedFile(file);
    };

    const handleImport = async () => {
        if (!selectedFile) {
            showToast('Seleccione un archivo', 'warning');
            return;
        }
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            const res = await fetch('/api/agremiados/import', {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });
            const json = await res.json();
            if (!res.ok) {
                throw new Error(json.error || json.message || 'Error al importar');
            }
            const result = json.data || json;
            const msg = result.imported !== undefined
                    ? `${result.imported} registros importados${result.errors > 0 ? `, ${result.errors} con error` : ''}`
                    : result.message || 'Importación completada';
            showToast(msg, 'success');
            setIsOpen(false);
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            queryClient.invalidateQueries({ queryKey: ['agremiados'] });
            onSuccess?.();
        } catch (err) {
            showToast(err instanceof Error ? err.message : 'Error al importar', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            setIsOpen(false);
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <>
            <Button variant="outline" onClick={() => setIsOpen(true)} className="gap-2">
                <UploadIcon className="w-4 h-4" />
                Importar Excel/CSV
            </Button>
            <Modal isOpen={isOpen} onClose={handleClose} title="Importar datos desde Excel o CSV" size="md">
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        El archivo debe tener las columnas: NOMBRES COMPLETOS, COP, COLEGIO REGIONAL.
                    </p>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#6a0032]/50 transition-colors">
                        <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} className="hidden" id="import-file" />
                        <label htmlFor="import-file" className="cursor-pointer block">
                            <UploadIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                            <span className="text-sm font-medium text-[#6a0032]">
                                {selectedFile ? selectedFile.name : 'Haga clic o arrastre un archivo aquí'}
                            </span>
                        </label>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={handleClose}>Cancelar</Button>
                        <Button variant="primary" onClick={handleImport} isLoading={isLoading} disabled={!selectedFile}>Importar</Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
