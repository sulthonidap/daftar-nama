// Nama tab di Google Sheet tempat data disimpan (dibuat otomatis kalau belum ada)
const SHEET_NAME = 'Data';

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Isi Data')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// Dipanggil oleh form di GitHub Pages (fetch POST, body JSON)
function doPost(e) {
  let hasil;
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (data.website) {                 // honeypot: bot mengisi field tersembunyi
      hasil = { ok: true };
    } else {
      simpan(data);
      hasil = { ok: true };
    }
  } catch (err) {
    hasil = { ok: false, error: err.message };
  }
  return ContentService.createTextOutput(JSON.stringify(hasil))
    .setMimeType(ContentService.MimeType.JSON);
}

function bersihkan_(v) {
  let s = String(v || '').trim().slice(0, 200);
  // cegah formula injection di Sheet
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function simpan(data) {
  const nama = bersihkan_(data.nama);
  const asal = bersihkan_(data.asal);
  if (!nama || !asal) throw new Error('Nama dan asal wajib diisi');

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    siapkan_(sh);
    sh.appendRow([new Date(), nama, asal]);
    const r = sh.getLastRow();
    sh.getRange(r, 1).setNumberFormat('dd/mm/yyyy HH:mm');
    kotak_(sh.getRange(r, 1, 1, 3));
  } finally {
    lock.releaseLock();
  }
  return true;
}

const JUDUL = 'DAFTAR NAMA';

// Garis kotak tebal di semua sisi sel
function kotak_(range) {
  range.setBorder(true, true, true, true, true, true, '#000000',
    SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
}

// Bikin judul + header kalau belum ada (juga merapikan tab lama)
function siapkan_(sh) {
  if (sh.getRange('A1').getValue() === JUDUL) return;

  if (sh.getLastRow() > 0) sh.insertRowBefore(1);   // tab lama: geser data ke bawah
  if (sh.getRange('A2').getValue() !== 'Waktu') {
    sh.insertRowBefore(2);
    sh.getRange('A2:C2').setValues([['Waktu', 'Nama', 'Asal']]);
  }

  sh.getRange('A1:C1').merge().setValue(JUDUL)
    .setFontWeight('bold').setFontSize(16)
    .setHorizontalAlignment('center').setVerticalAlignment('middle');
  sh.setRowHeight(1, 36);

  sh.getRange('A2:C2').setFontWeight('bold')
    .setBackground('#d9e2f3').setHorizontalAlignment('center');
  sh.setFrozenRows(2);
  sh.setColumnWidth(1, 140);
  sh.setColumnWidth(2, 220);
  sh.setColumnWidth(3, 220);

  // kotak untuk header + data yang sudah ada
  kotak_(sh.getRange(2, 1, Math.max(sh.getLastRow() - 1, 1), 3));
}
