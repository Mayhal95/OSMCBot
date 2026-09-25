import type { sheets_v4 } from 'googleapis';

import { env } from './config/env.js';
import { OSMC_THEME } from './config/theme.js';
import { createSheetsClient, DATABASE_HEADERS } from './database/google-sheets.js';
import { MEMBER_STATUSES, NOTE_CATEGORIES, SHEETS } from './database/schema.js';
import { logger } from './logger.js';

const sheets = createSheetsClient();
const spreadsheetId = env.GOOGLE_SPREADSHEET_ID;

const columnWidths: Record<string, readonly number[]> = {
  [SHEETS.members]: [130, 170, 150, 160, 110, 110, 130, 200, 190, 190, 170, 190, 180, 170],
  [SHEETS.ranks]: [140, 80, 180, 80, 260],
  [SHEETS.notes]: [130, 130, 170, 120, 400, 190, 170, 160],
  [SHEETS.audit]: [140, 190, 160, 130, 170, 160, 150, 220, 220],
};

function columnLetter(width: number): string {
  return String.fromCharCode(64 + width);
}

async function getSheetProperties(): Promise<Map<string, sheets_v4.Schema$SheetProperties>> {
  const response = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets.properties',
  });

  return new Map(
    (response.data.sheets ?? [])
      .map((sheet) => sheet.properties)
      .filter((properties): properties is sheets_v4.Schema$SheetProperties =>
        Boolean(properties?.title),
      )
      .map((properties) => [properties.title!, properties]),
  );
}

async function ensureSheetsExist(): Promise<void> {
  const properties = await getSheetProperties();
  const requests: sheets_v4.Schema$Request[] = [];

  if (!properties.has(SHEETS.members)) {
    const defaultSheet = properties.get('Sheet1');
    const defaultValues = defaultSheet
      ? await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Sheet1!A1:Z2' })
      : null;

    if (defaultSheet?.sheetId !== undefined && !(defaultValues?.data.values?.length ?? 0)) {
      requests.push({
        updateSheetProperties: {
          properties: { sheetId: defaultSheet.sheetId, title: SHEETS.members },
          fields: 'title',
        },
      });
    } else {
      requests.push({ addSheet: { properties: { title: SHEETS.members } } });
    }
  }

  for (const sheetName of [SHEETS.ranks, SHEETS.notes, SHEETS.audit]) {
    if (!properties.has(sheetName)) {
      requests.push({ addSheet: { properties: { title: sheetName } } });
    }
  }

  if (requests.length) {
    await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests } });
  }
}

async function ensureHeaders(): Promise<Map<string, sheets_v4.Schema$SheetProperties>> {
  const properties = await getSheetProperties();

  for (const [sheetName, headers] of Object.entries(DATABASE_HEADERS)) {
    const end = columnLetter(headers.length);
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${sheetName}'!A1:${end}1`,
    });
    const current = (response.data.values?.[0] ?? []).map(String);

    if (current.length && current.join('|') !== headers.join('|')) {
      throw new Error(`${sheetName} already has a different header row. No data was overwritten.`);
    }

    if (!current.length) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `'${sheetName}'!A1:${end}1`,
        valueInputOption: 'RAW',
        requestBody: { values: [[...headers]] },
      });
    }
  }

  return properties;
}

async function formatSchema(
  properties: Map<string, sheets_v4.Schema$SheetProperties>,
): Promise<void> {
  const requests: sheets_v4.Schema$Request[] = [];
  const purple = {
    red: ((OSMC_THEME.colors.primary >> 16) & 255) / 255,
    green: ((OSMC_THEME.colors.primary >> 8) & 255) / 255,
    blue: (OSMC_THEME.colors.primary & 255) / 255,
  };

  for (const [sheetName, headers] of Object.entries(DATABASE_HEADERS)) {
    const sheetId = properties.get(sheetName)?.sheetId;
    if (sheetId === undefined || sheetId === null) continue;
    const endColumn = columnLetter(headers.length);
    const values = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${sheetName}'!A1:${endColumn}`,
    });
    const populatedRowCount = values.data.values?.length ?? 1;

    requests.push(
      {
        updateSheetProperties: {
          properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
          fields: 'gridProperties.frozenRowCount',
        },
      },
      {
        repeatCell: {
          range: {
            sheetId,
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: headers.length,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: purple,
              horizontalAlignment: 'CENTER',
              textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
              verticalAlignment: 'MIDDLE',
            },
          },
          fields:
            'userEnteredFormat(backgroundColor,horizontalAlignment,textFormat,verticalAlignment)',
        },
      },
      {
        updateDimensionProperties: {
          range: { sheetId, dimension: 'ROWS', startIndex: 0, endIndex: 1 },
          properties: { pixelSize: 34 },
          fields: 'pixelSize',
        },
      },
    );

    for (const [columnIndex, pixelSize] of (columnWidths[sheetName] ?? []).entries()) {
      requests.push({
        updateDimensionProperties: {
          range: {
            sheetId,
            dimension: 'COLUMNS',
            startIndex: columnIndex,
            endIndex: columnIndex + 1,
          },
          properties: { pixelSize },
          fields: 'pixelSize',
        },
      });
    }

    if (populatedRowCount > 1) {
      requests.push({
        repeatCell: {
          range: {
            sheetId,
            startRowIndex: 1,
            endRowIndex: populatedRowCount,
            startColumnIndex: 0,
            endColumnIndex: headers.length,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 1, green: 1, blue: 1 },
              horizontalAlignment: 'LEFT',
              textFormat: {
                bold: false,
                foregroundColor: { red: 0, green: 0, blue: 0 },
              },
              verticalAlignment: 'MIDDLE',
            },
          },
          fields:
            'userEnteredFormat(backgroundColor,horizontalAlignment,textFormat,verticalAlignment)',
        },
      });
    }
  }

  const membersSheetId = properties.get(SHEETS.members)?.sheetId;
  if (membersSheetId !== undefined && membersSheetId !== null) {
    requests.push({
      setDataValidation: {
        range: {
          sheetId: membersSheetId,
          startRowIndex: 1,
          endRowIndex: 1000,
          startColumnIndex: 5,
          endColumnIndex: 6,
        },
        rule: {
          condition: {
            type: 'ONE_OF_LIST',
            values: MEMBER_STATUSES.map((status) => ({ userEnteredValue: status })),
          },
          strict: true,
          showCustomUi: true,
        },
      },
    });
  }

  const ranksSheetId = properties.get(SHEETS.ranks)?.sheetId;
  if (ranksSheetId !== undefined && ranksSheetId !== null) {
    requests.push({
      setDataValidation: {
        range: {
          sheetId: ranksSheetId,
          startRowIndex: 1,
          endRowIndex: 250,
          startColumnIndex: 3,
          endColumnIndex: 4,
        },
        rule: { condition: { type: 'BOOLEAN' }, strict: true, showCustomUi: true },
      },
    });
  }

  const notesSheetId = properties.get(SHEETS.notes)?.sheetId;
  if (notesSheetId !== undefined && notesSheetId !== null) {
    requests.push({
      setDataValidation: {
        range: {
          sheetId: notesSheetId,
          startRowIndex: 1,
          endRowIndex: 1000,
          startColumnIndex: 3,
          endColumnIndex: 4,
        },
        rule: {
          condition: {
            type: 'ONE_OF_LIST',
            values: NOTE_CATEGORIES.map((category) => ({ userEnteredValue: category })),
          },
          strict: true,
          showCustomUi: true,
        },
      },
    });
  }

  await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests } });
}

try {
  await ensureSheetsExist();
  const properties = await ensureHeaders();
  await formatSchema(properties);
  logger.info({ spreadsheetId }, 'OSMC Google Sheets database schema is ready');
} catch (error) {
  logger.fatal(
    { error, spreadsheetId },
    'Database setup failed; verify Editor access and remove conflicting sheet protection',
  );
  process.exitCode = 1;
}
