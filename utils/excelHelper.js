// // utils/excelHelper.js
// import XLSX from 'xlsx';

// /**
//  * Reads a column from Excel and returns it as an array of strings
//  * @param {string} filePath - path to Excel file
//  * @param {string} sheetName - sheet name
//  * @param {string} columnName - column header to read
//  */
// export function readExcelColumn(filePath, sheetName, columnName) {
//   const workbook = XLSX.readFile(filePath);
//   const sheet = workbook.Sheets[sheetName];
//   const data = XLSX.utils.sheet_to_json(sheet); // array of objects
//   return data.map(row => row[columnName].toString().trim());
// }


// utils/excelHelper.js
import { readFile } from 'fs/promises';
import XLSX from 'xlsx';

export async function readExcelSheet(filePath, sheetName) {
  const buffer = await readFile(filePath);
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet, { defval: '' });
}