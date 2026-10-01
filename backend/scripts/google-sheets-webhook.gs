const WEBHOOK_SECRET = 'CampusMart-Sheets-2026';

function doPost(e) {
  try {
    const row = JSON.parse(e.postData.contents);
    if (row.secret !== WEBHOOK_SECRET) {
      return response({ ok: false, error: 'Unauthorized' });
    }

    // This script is bound to the spreadsheet opened from Extensions > Apps Script.
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheets()[0];
    const headers = [
      'Type', 'Database ID', 'Name', 'Email', 'Phone', 'Institution',
      'Category / Subject', 'Items', 'Message', 'Created At'
    ];

    if (sheet.getLastRow() === 0) sheet.appendRow(headers);

    sheet.appendRow([
      row.type || '', row.id || '', row.name || '', row.email || '',
      row.phone || '', row.institution || '', row.subject || '',
      row.items || '', row.message || '', row.createdAt || new Date().toISOString()
    ]);

    return response({ ok: true });
  } catch (error) {
    return response({ ok: false, error: error.message });
  }
}

function response(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}