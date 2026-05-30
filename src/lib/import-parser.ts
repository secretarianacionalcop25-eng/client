/**
 * Parser para importar Excel/CSV a formato agremiados
 * Columnas esperadas: NOMBRES COMPLETOS, COP, COLEGIO REGIONAL, ESTADO, HABILITADO
 */

import type { AgremiadoImportRow } from './supabase-service';

function parseCsvLine(line: string): string[] {
    return line.split(',').map((cell) => cell.trim().replace(/^"|"$/g, ''));
}

function mapRowToAgremiado(row: string[]): AgremiadoImportRow | null {
    const nombreCompleto = (row[0] || '').trim().toUpperCase();
    const cop = String(row[1] || '').trim();
    const colegioRegional = (row[2] || '').trim();
    const estadoValor = (row[3] || 'ACTIVO').trim().toUpperCase();
    const habilitadoValor = (row[4] || 'ACTIVO').trim().toUpperCase();

    if (!cop || !/^\d+$/.test(cop)) return null;

    return {
        cop,
        nombres: nombreCompleto || 'SIN NOMBRE',
        apellidos: '', // Queda vacío porque ahora todo va unificado en la columna nombres
        colegio: colegioRegional || 'SIN COLEGIO',
        estado: estadoValor,
        habilitado: habilitadoValor,
    };
}

function findHeaderRowIndex(lines: string[]): number {
    const idx = lines.findIndex(
        (line) =>
            line.toUpperCase().includes('NOMBRES COMPLETOS') && line.toUpperCase().includes('COP')
    );
    return idx >= 0 ? idx + 1 : 0;
}

export function parseCsvToAgremiados(csvContent: string): AgremiadoImportRow[] {
    const lines = csvContent.split(/\r?\n/);
    const startIndex = findHeaderRowIndex(lines);
    const records: AgremiadoImportRow[] = [];
    for (let i = startIndex; i < lines.length; i++) {
        const cols = parseCsvLine(lines[i]);
        if (cols.length < 3) continue;
        const row = mapRowToAgremiado([cols[0], cols[1], cols[2], cols[3], cols[4]]);
        if (row) records.push(row);
    }
    return records;
}

function getColumnIndex(
    headers: string[],
    ...names: string[]
): number {
    const lower = headers.map((h) => String(h ?? '').toLowerCase());
    for (const name of names) {
        const idx = lower.findIndex((h) => h.includes(name.toLowerCase()));
        if (idx >= 0) return idx;
    }
    return -1;
}

export function parseExcelToAgremiados(
    buffer: Buffer
): AgremiadoImportRow[] {
    const XLSX = require('xlsx');
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        raw: false,
    }) as string[][];
    
    const headerRowIdx = data.findIndex(
        (row) =>
            Array.isArray(row) &&
            row.some((c) => String(c).toUpperCase().includes('NOMBRES COMPLETOS')) &&
            row.some((c) => String(c).toUpperCase().includes('COP'))
    );
    if (headerRowIdx < 0) return [];
    
    const headers = data[headerRowIdx].map((c) => String(c ?? ''));
    const idxNombreCompleto = getColumnIndex(headers, 'nombres completos', 'nombre completo');
    const idxCop = getColumnIndex(headers, 'cop');
    const idxColegio = getColumnIndex(headers, 'colegio regional', 'colegio');
    const idxEstado = getColumnIndex(headers, 'estado');
    const idxHabilitado = getColumnIndex(headers, 'habilitado');
    
    if (idxNombreCompleto < 0 || idxCop < 0 || idxColegio < 0) {
        return [];
    }
    
    const records: AgremiadoImportRow[] = [];
    for (let i = headerRowIdx + 1; i < data.length; i++) {
        const row = data[i];
        if (!Array.isArray(row)) continue;
        
        const arr = [
            String(row[idxNombreCompleto] ?? ''),
            String(row[idxCop] ?? ''),
            String(row[idxColegio] ?? ''),
            idxEstado >= 0 ? String(row[idxEstado] ?? '') : 'ACTIVO',
            idxHabilitado >= 0 ? String(row[idxHabilitado] ?? '') : 'ACTIVO',
        ];
        
        const mapped = mapRowToAgremiado(arr);
        if (mapped) records.push(mapped);
    }
    return records;
}
