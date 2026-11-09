# Daftar Nama

Form sederhana (Nama & Asal) yang di-host di GitHub Pages. Data dikirim ke Google Sheet melalui Google Apps Script.

## Alur

QR → `index.html` (GitHub Pages) → `fetch POST` → Apps Script `doPost` → Sheet tab **Data**

## File

- `index.html` — halaman form. URL Apps Script ada di konstanta `API_URL`.
- `Code.gs` — salinan script di Google Sheet (Ekstensi → Apps Script). Berisi `doPost`, format judul/header, dan garis kotak.

## Update script

Setelah `Code.gs` diubah di Apps Script: **Terapkan → Kelola deployment → Edit → Versi baru → Terapkan**, supaya URL tetap sama.
