'use client';

import * as React from 'react';
import { Avatar } from './Avatar';
import { StatusBadge } from './StatusBadge';
import { formatEnumValue } from '@/lib/utils';
import type { Agremiado } from '@/types/agremiado';

interface TablaAgremiadosProps {
    agremiados: Agremiado[];
    onView?: (agremiado: Agremiado) => void;
    isAdmin?: boolean;
    onEdit?: (agremiado: Agremiado) => void;
    onDelete?: (agremiado: Agremiado) => void;
}

function EmptyIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
    );
}

export function TablaAgremiados({
    agremiados,
    onView,
    isAdmin,
    onEdit,
    onDelete,
}: TablaAgremiadosProps) {
    if (agremiados.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <EmptyIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No se encontraron resultados</h3>
                <p className="text-sm text-gray-500">Ingresa un término y presiona &quot;Buscar&quot;</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
                <thead>
                    <tr className="bg-[#6a0032]">
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-white uppercase tracking-wider">Foto</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-white uppercase tracking-wider">COP</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-white uppercase tracking-wider">Nombre Completo</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-white uppercase tracking-wider">Colegio Regional</th>
                        <th className="px-4 py-3.5 text-center text-xs font-semibold text-white uppercase tracking-wider">Estado</th>
                        <th className="px-4 py-3.5 text-center text-xs font-semibold text-white uppercase tracking-wider">Habilitado</th>
                        <th className="px-4 py-3.5 text-center text-xs font-semibold text-white uppercase tracking-wider">Más</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {agremiados.map((agremiado, index) => (
                        <tr key={agremiado.id} className={`transition-colors duration-150 hover:bg-[#6a0032]/5 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                            <td className="px-4 py-3"><Avatar cop={agremiado.cop} size="sm" /></td>
                            <td className="px-4 py-3"><span className="font-semibold text-gray-900">{agremiado.cop}</span></td>
                            <td className="px-4 py-3 text-gray-900 font-medium">
                                {agremiado.nombres || agremiado.nombre_completo}
                            </td>
                            <td className="px-4 py-3 text-gray-600">{formatEnumValue(agremiado.colegio)}</td>
                            <td className="px-4 py-3 text-center"><StatusBadge status={agremiado.estado} type="estado" /></td>
                            <td className="px-4 py-3 text-center"><StatusBadge status={agremiado.habilitado} type="habilitado" /></td>
                            <td className="px-4 py-3 text-center">
                                <div className="flex items-center justify-center gap-1 flex-wrap">
                                    {onView && (
                                        <button onClick={() => onView(agremiado)} className="px-4 py-2 bg-[#d4af37] text-[#1a1a1a] rounded-full text-sm font-semibold hover:bg-[#b8962e] hover:shadow-md transition-all duration-200">
                                            Ver más
                                        </button>
                                    )}
                                    {isAdmin && onEdit && (
                                        <button onClick={() => onEdit(agremiado)} className="px-3 py-1.5 bg-[#6a0032] text-white rounded-full text-xs font-semibold hover:bg-[#4a0022] transition-all">
                                            Editar
                                        </button>
                                    )}
                                    {isAdmin && onDelete && (
                                        <button onClick={() => onDelete(agremiado)} className="px-3 py-1.5 bg-red-600 text-white rounded-full text-xs font-semibold hover:bg-red-700 transition-all">
                                            Eliminar
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
