'use strict';

/**
 * Convert beneficiaries Excel from images/ to data/*.json for the staff portal.
 * Usage: node scripts/convert-beneficiaries-xlsx.js
 */

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const INPUT = path.join(__dirname, '..', 'images', 'MPUMALANGA PES 3 SAB BOXES BENECICIARIES 2024-25.xlsx');
const OUTPUT = path.join(__dirname, '..', 'data', 'beneficiaries-sab-2024-25.json');

function cleanText(v) {
  return String(v == null ? '' : v).replace(/\s+/g, ' ').trim();
}

function normalizeId(v) {
  return String(v == null ? '' : v).replace(/\D/g, '');
}

function toMoney(v) {
  var n = parseFloat(String(v).replace(/[^\d.-]/g, ''));
  return isNaN(n) ? 0 : Math.round(n * 100) / 100;
}

function main() {
  if (!fs.existsSync(INPUT)) {
    console.error('Excel file not found:', INPUT);
    process.exit(1);
  }

  var wb = XLSX.readFile(INPUT);
  var sheet = wb.Sheets[wb.SheetNames[0]];
  var rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  if (!rows.length) {
    console.error('Sheet is empty');
    process.exit(1);
  }

  var header = rows[0].map(function (h) { return cleanText(h).toUpperCase(); });
  var col = function (name) {
    var i = header.indexOf(name);
    return i === -1 ? -1 : i;
  };

  var idx = {
    province: col('PROVINCE'),
    district: col('DISTRICT MUNICIPALITY'),
    local: col('LOCAL MUNICIPALITY'),
    area: col('AREA'),
    surname: col('SURNAME'),
    name: col('NAME'),
    id: col('ID NUMBER'),
    contact: col('CONTACT'),
    gender: col('GENDER'),
    commodity: col('COMMODITY'),
    quantity: col('QUANTITY OF BOXES'),
    cost: col('TOTAL COST (R )')
  };

  var beneficiaries = [];
  for (var r = 1; r < rows.length; r++) {
    var row = rows[r];
    if (!row || !row.length) continue;

    var surname = cleanText(row[idx.surname]);
    var name = cleanText(row[idx.name]);
    var idDigits = normalizeId(row[idx.id]);
    if (!surname && !name && !idDigits) continue;

    beneficiaries.push({
      province: cleanText(row[idx.province]),
      districtMunicipality: cleanText(row[idx.district]),
      localMunicipality: cleanText(row[idx.local]),
      area: cleanText(row[idx.area]),
      surname: surname,
      name: name,
      idNumber: idDigits,
      idDisplay: cleanText(row[idx.id]) || idDigits,
      contact: cleanText(row[idx.contact]),
      gender: cleanText(row[idx.gender]),
      commodity: cleanText(row[idx.commodity]),
      quantityBoxes: cleanText(row[idx.quantity]),
      totalCost: toMoney(row[idx.cost])
    });
  }

  var outDir = path.dirname(OUTPUT);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  var payload = {
    programme: 'Mpumalanga PES 3 SAB Boxes',
    financialYear: '2024-25',
    sourceFile: 'images/MPUMALANGA PES 3 SAB BOXES BENECICIARIES 2024-25.xlsx',
    importedAt: new Date().toISOString(),
    count: beneficiaries.length,
    beneficiaries: beneficiaries
  };

  fs.writeFileSync(OUTPUT, JSON.stringify(payload));
  console.log('Wrote', beneficiaries.length, 'beneficiaries to', OUTPUT);
  console.log('Size:', (fs.statSync(OUTPUT).size / 1024 / 1024).toFixed(2), 'MB');
}

main();
