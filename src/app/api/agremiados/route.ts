import { NextRequest } from 'next/server';
import { handleApiError, successResponse, ApiError } from '@/lib/api-utils';
import { verifyAdminSession } from '@/lib/auth-utils';
import {
    bulkUpsertAgremiados,
    type AgremiadoImportRow,
} from '@/lib/supabase-service';
import { parseCsvToAgremiados, parseExcelToAgremiados } from '@/lib/import-parser';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest) {
    try {
        const isAdmin = await verifyAdminSession();
        if (!isAdmin) {
            throw new ApiError(403, 'Debe iniciar sesión para importar datos');
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        if (!file) {
            throw new ApiError(400, 'No se envió ningún archivo');
        }

        if (file.size > MAX_FILE_SIZE) {
            throw new ApiError(
                400,
                `El archivo supera el límite de ${MAX_FILE_SIZE / 1024 / 1024} MB`
            );
        }

        const mimeType = file.type;
        const name = file.name.toLowerCase();
        const isCsv = mimeType === 'text/csv' || name.endsWith('.csv');
        const isExcel =
            mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            mimeType === 'application/vnd.ms-excel' ||
            name.endsWith('.xlsx') ||
            name.endsWith('.xls');

        if (!isCsv && !isExcel) {
            throw new ApiError(400, 'Formato no soportado. Use archivos .csv, .xlsx o .xls');
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        let records: AgremiadoImportRow[];

        if (isCsv) {
            records = parseCsvToAgremiados(buffer.toString('utf-8'));
        } else {
            records = parseExcelToAgremiados(buffer);
        }

        if (records.length === 0) {
            throw new ApiError(
                400,
                'No se encontraron registros válidos. Verifique que el archivo tenga las columnas: NOMBRES COMPLETOS, COP, COLEGIO REGIONAL'
            );
        }

        const { imported, errors } = await bulkUpsertAgremiados(records);

        return successResponse({
            imported,
            errors,
            total: records.length,
            message: `Importación completada: ${imported} registros importados${errors > 0 ? `, ${errors} con error` : ''}`,
        });
    } catch (error) {
        return handleApiError(error);
    }
}
