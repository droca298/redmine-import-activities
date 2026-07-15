import ExcelJS from 'exceljs';
import { ImportRow } from '../types';
import { MESSAGES } from '../messages';

function cellToString(value: ExcelJS.CellValue): string | undefined {
  if (value === null || value === undefined) return undefined;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'object' && 'formula' in (value as unknown as Record<string, unknown>)) {
    return cellToString((value as unknown as { result: ExcelJS.CellValue }).result);
  }
  if (typeof value === 'object' && 'text' in (value as unknown as Record<string, unknown>)) {
    return String((value as unknown as { text: unknown }).text).trim();
  }
  return String(value).trim();
}

function cellToNumber(value: ExcelJS.CellValue): number | undefined {
  const str = cellToString(value);
  if (str === undefined || str === '') return undefined;
  const num = Number(str.replace(',', '.'));
  return Number.isFinite(num) ? num : undefined;
}

const TRUTHY_VALUES = new Set<string>(MESSAGES.template.sentColumn.truthyValues);

function cellToBoolean(value: ExcelJS.CellValue): boolean {
  const str = cellToString(value);
  if (!str) return false;
  const normalized = str
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
  return TRUTHY_VALUES.has(normalized);
}

export async function parseImportFile(buffer: Buffer): Promise<ImportRow[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);

  const sheet = workbook.getWorksheet(MESSAGES.template.sheets.data) ?? workbook.worksheets[0];
  if (!sheet) {
    throw new Error(MESSAGES.excel.noDataSheet);
  }

  const rows: ImportRow[] = [];

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // header

    const fecha = cellToString(row.getCell(1).value);
    const proyecto = cellToString(row.getCell(2).value);
    const tareaRaw = cellToString(row.getCell(3).value);
    const actividad = cellToString(row.getCell(4).value);
    const horas = cellToNumber(row.getCell(5).value);
    const comentario = cellToString(row.getCell(6).value);
    const enviado = cellToBoolean(row.getCell(7).value);

    const isEmpty = !fecha && !proyecto && !tareaRaw && !actividad && horas === undefined;
    if (isEmpty) return;

    rows.push({
      rowIndex: rowNumber,
      fecha: fecha ?? '',
      proyecto: proyecto || undefined,
      tareaRaw: tareaRaw || undefined,
      actividad: actividad ?? '',
      horas: horas ?? NaN,
      comentario: comentario || undefined,
      enviado,
    });
  });

  return rows;
}
