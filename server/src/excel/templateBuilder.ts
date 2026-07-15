import ExcelJS from 'exceljs';
import { FavoriteActivity, RedmineActivity, RedmineProject } from '../types';
import { MESSAGES } from '../messages';

const MAX_REF_ROWS : number = 500;
const BASE_FONT: Partial<ExcelJS.Font> = { name: 'Calibri', size: 11 };
const HEADER_FONT: Partial<ExcelJS.Font> = { ...BASE_FONT, bold: true };
const DATE_NUM_FMT : string = 'yyyy-mm-dd"T00:00:00Z"';

export async function buildTemplate(
  projects: RedmineProject[],
  activities: RedmineActivity[],
  favorites: FavoriteActivity[]
): Promise<ExcelJS.Buffer> {
  const workbook = new ExcelJS.Workbook();

  const refSheet = workbook.addWorksheet(MESSAGES.template.sheets.reference);
  refSheet.getRow(1).values = [...MESSAGES.template.referenceHeaders];
  refSheet.getRow(1).font = HEADER_FONT;
  projects.forEach((p, i) => {
    refSheet.getCell(i + 2, 1).value = p.name;
  });
  activities.forEach((a, i) => {
    refSheet.getCell(i + 2, 2).value = a.name;
  });
  favorites.forEach((f, i) => {
    const row = i + 2;
    refSheet.getCell(row, 4).value = f.label;
    refSheet.getCell(row, 5).value = f.issueId;
    refSheet.getCell(row, 6).value = f.project ?? '';
    refSheet.getCell(row, 7).value = f.activity ?? '';
  });
  refSheet.getColumn(1).width = 35;
  refSheet.getColumn(2).width = 30;
  refSheet.getColumn(4).width = 25;
  refSheet.getColumn(5).width = 12;
  refSheet.getColumn(6).width = 30;
  refSheet.getColumn(7).width = 25;
  for (let row = 2; row <= Math.max(projects.length, activities.length, favorites.length) + 1; row++) {
    refSheet.getRow(row).font = BASE_FONT;
  }

  const dataSheet = workbook.addWorksheet(MESSAGES.template.sheets.data);
  dataSheet.getRow(1).values = [...MESSAGES.template.headers];
  dataSheet.getRow(1).font = HEADER_FONT;
  dataSheet.columns = [
    { key: 'fecha', width: 22 },
    { key: 'proyecto', width: 30 },
    { key: 'issue', width: 22 },
    { key: 'actividad', width: 25 },
    { key: 'horas', width: 10 },
    { key: 'comentario', width: 40 },
    { key: 'enviado', width: 12 },
  ];

  const refSheetName = MESSAGES.template.sheets.reference;
  const projectRange = `${refSheetName}!$A$2:$A$${MAX_REF_ROWS + 1}`;
  const activityRange = `${refSheetName}!$B$2:$B$${MAX_REF_ROWS + 1}`;
  const favLastRow = favorites.length + 1;
  const favLabelRange = `${refSheetName}!$D$2:$D$${favLastRow}`;
  const favTableRange = `${refSheetName}!$D$2:$G$${favLastRow}`;

  const minDate = new Date(Date.UTC(2020, 0, 1));
  const maxDate = new Date(Date.UTC(2035, 11, 31));

  for (let row = 2; row <= MAX_REF_ROWS + 1; row++) {
    dataSheet.getRow(row).font = BASE_FONT;

    dataSheet.getCell(`A${row}`).numFmt = DATE_NUM_FMT;
    dataSheet.getCell(`A${row}`).dataValidation = {
      type: 'date',
      operator: 'between',
      allowBlank: true,
      showErrorMessage: true,
      errorTitle: MESSAGES.template.dateValidation.title,
      error: MESSAGES.template.dateValidation.error,
      formulae: [minDate, maxDate],
    };

    dataSheet.getCell(`B${row}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [projectRange],
    };

    if (favorites.length > 0) {
      dataSheet.getCell(`C${row}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        showErrorMessage: false,
        formulae: [favLabelRange],
      };
      dataSheet.getCell(`B${row}`).value = {
        formula: `IFERROR(VLOOKUP($C${row},${favTableRange},3,FALSE),"")`,
      };
      dataSheet.getCell(`D${row}`).value = {
        formula: `IFERROR(VLOOKUP($C${row},${favTableRange},4,FALSE),"")`,
      };
    }

    dataSheet.getCell(`D${row}`).dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: [activityRange],
    };

    dataSheet.getCell(`G${row}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [MESSAGES.template.sentColumn.options],
    };
  }

  return workbook.xlsx.writeBuffer();
}
