/**
 * Unit Test Suite: Utilities (Formatter, Pure SVG QR Code, WhatsApp Link Generator)
 * PT. Indogreen Technology And Management
 * 
 * Verifies:
 * 1. formatter.js: formatRupiah, formatNumber, formatKwp, formatKwh, formatPercent, parseRupiah
 * 2. qrcode.js: SVG QR generator zero-dependency, multi-version, error correction, scalable SVG
 * 3. whatsapp.js: Structured message generation & safe URL encoding for all 4 simulator modes
 * 4. End-to-end integration: Calculation Result -> WhatsApp URL -> SVG QR Code
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  formatRupiah,
  formatNumber,
  formatKwp,
  formatKwh,
  formatPercent,
  parseRupiah
} from '../src/js/utils/formatter.js';

import {
  generateQrSvg,
  createQrMatrix,
  EC_LEVEL
} from '../src/js/utils/qrcode.js';

import {
  generateWhatsAppMessage,
  generateWhatsAppUrl,
  OFFICIAL_WHATSAPP_NUMBER,
  WHATSAPP_BASE_URL
} from '../src/js/utils/whatsapp.js';

import { calculateResidential } from '../src/js/calculator/residential.js';
import { calculateCommercial } from '../src/js/calculator/commercial.js';
import { calculateBattery } from '../src/js/calculator/battery.js';
import { calculatePjuts } from '../src/js/calculator/pjuts.js';

// ============================================================================
// 1. FORMATTER TESTS
// ============================================================================
describe('Number & Currency Formatters (formatter.js)', () => {
  test('formatRupiah: format angka ke format IDR', () => {
    assert.equal(formatRupiah(1500000), 'Rp 1.500.000');
    assert.equal(formatRupiah(38628000), 'Rp 38.628.000');
    assert.equal(formatRupiah(0), 'Rp 0');
    assert.equal(formatRupiah(null), 'Rp 0');
    assert.equal(formatRupiah(undefined), 'Rp 0');
    // Tanpa prefix "Rp "
    assert.equal(formatRupiah(1500000, false), '1.500.000');
  });

  test('formatNumber: format desimal dan ribuan id-ID', () => {
    assert.equal(formatNumber(1234), '1.234');
    assert.equal(formatNumber(1234.56, 2), '1.234,56');
    assert.equal(formatNumber(0, 0), '0');
  });

  test('formatKwp: format kapasitas surya', () => {
    assert.equal(formatKwp(2.4), '2.40 kWp');
    assert.equal(formatKwp(36), '36.00 kWp');
    assert.equal(formatKwp(0.6, 2), '0.60 kWp');
  });

  test('formatKwh: format kWh energi', () => {
    assert.equal(formatKwh(253.44, 1), '253,4 kWh');
    assert.equal(formatKwh(1038.28, 2), '1.038,28 kWh');
  });

  test('formatPercent: format persentase', () => {
    assert.equal(formatPercent(32.0, 1), '32.0%');
    assert.equal(formatPercent(15, 0), '15%');
  });

  test('parseRupiah: parsing string ke integer', () => {
    assert.equal(parseRupiah('Rp 1.500.000'), 1500000);
    assert.equal(parseRupiah('38.628.000'), 38628000);
    assert.equal(parseRupiah(''), 0);
    assert.equal(parseRupiah(null), 0);
  });
});

// ============================================================================
// 2. ZERO-DEPENDENCY QR CODE SVG GENERATOR TESTS
// ============================================================================
describe('Zero-Dependency SVG QR Code Generator (qrcode.js)', () => {
  test('generateQrSvg: teks pendek menghasilkan string SVG valid', () => {
    const svg = generateQrSvg('https://indogreen.id');

    assert.ok(typeof svg === 'string', 'SVG output must be a string');
    assert.ok(svg.includes('<svg'), 'Must contain opening <svg tag');
    assert.ok(svg.includes('</svg>'), 'Must contain closing </svg> tag');
    assert.ok(svg.includes('viewBox="0 0'), 'Must contain viewBox attribute');
    assert.ok(svg.includes('xmlns="http://www.w3.org/2000/svg"'), 'Must contain standard XML namespace');
    assert.ok(svg.includes('<path d="M'), 'Must contain module path definition');
    assert.ok(svg.includes('shape-rendering="crispEdges"'), 'Must render with sharp edges for kiosk displays');
  });

  test('createQrMatrix: memilih versi dan matriks dinamis', () => {
    const shortMatrix = createQrMatrix('Halo', 'M');
    assert.ok(shortMatrix.version >= 1);
    assert.equal(shortMatrix.size, shortMatrix.version * 4 + 17);
    assert.equal(shortMatrix.matrix.length, shortMatrix.size);
    assert.equal(shortMatrix.matrix[0].length, shortMatrix.size);

    // Verifikasi finder pattern di sudut kiri atas: 7x7 kotak luar bernilai 1
    assert.equal(shortMatrix.matrix[0][0], 1);
    assert.equal(shortMatrix.matrix[0][6], 1);
    assert.equal(shortMatrix.matrix[6][0], 1);
    assert.equal(shortMatrix.matrix[6][6], 1);
    // Bagian putih di dalam finder (baris 1, kolom 1)
    assert.equal(shortMatrix.matrix[1][1], 0);
    // Inti hitam 3x3 (baris 3, kolom 3)
    assert.equal(shortMatrix.matrix[3][3], 1);
  });

  test('generateQrSvg: menangani payload panjang (URL WhatsApp lengkap > 500 karakter)', () => {
    const longUrl = 'https://wa.me/628139916890?text=' + encodeURIComponent(
      'Halo Tim Engineering PT. Indogreen Technology And Management,\n' +
      'Saya ingin konsultasi teknis sistem PLTS Atap Residensial:\n' +
      '- Daya PLN: 2.200 VA (Tarif R-1)\n' +
      '- Tagihan Bulanan: Rp 1.500.000 / bulan\n' +
      '- Wilayah: DKI Jakarta, Jabar & Banten (PSH 4.4)\n' +
      '- Rekomendasi Sistem: 2.40 kWp (4 Modul 600 Wp)\n' +
      '- Opsi Baterai: Hybrid LiFePO4 5.12 kWh\n' +
      '- Estimasi Penghematan: Rp 480.000 / bulan (32.0%)\n' +
      '- Estimasi Investasi Turnkey: Rp 38.628.000\n' +
      'Mohon dapat dibantu survei lokasi dan penawaran teknis resminya. Terima kasih.'
    );

    assert.ok(longUrl.length > 500, 'Payload URL harus lebih dari 500 karakter');

    const svg = generateQrSvg(longUrl, { size: 300, ecc: 'L' });
    assert.ok(svg.includes('<svg'));
    assert.ok(svg.includes('width="300"'));
    assert.ok(svg.includes('height="300"'));
    assert.ok(svg.includes('</svg>'));
  });

  test('generateQrSvg: kustomisasi opsi (warna, margin, ukuran)', () => {
    const svg = generateQrSvg('TEST-COLOR', {
      size: 400,
      margin: 2,
      darkColor: '#00b100', // Warna hijau brand INDOGREEN
      lightColor: '#000000'
    });

    assert.ok(svg.includes('fill="#00b100"'), 'Harus menyertakan warna modul kustom');
    assert.ok(svg.includes('fill="#000000"'), 'Harus menyertakan latar belakang kustom');
    assert.ok(svg.includes('width="400"'));
  });
});

// ============================================================================
// 3. WHATSAPP LINK & MESSAGE GENERATOR TESTS
// ============================================================================
describe('WhatsApp Consultation Generator (whatsapp.js)', () => {
  test('Mode Residensial: pesan dan URL terformat dengan benar', () => {
    const input = {
      powerVa: 2200,
      monthlyBill: 1500000,
      region: 'dki_jabar_banten',
      batteryOption: 'hybrid_5'
    };
    const result = calculateResidential(input);

    const message = generateWhatsAppMessage('residential', input, result);
    const url = generateWhatsAppUrl('residential', input, result);

    assert.ok(message.includes('Halo Tim Engineering PT. Indogreen Technology And Management,'));
    assert.ok(message.includes('PLTS Atap Residensial'));
    assert.ok(message.includes('2.200 VA'));
    assert.ok(message.includes('Rp 1.500.000'));
    assert.ok(message.includes('2.40 kWp'));
    assert.ok(message.includes('Hybrid LiFePO4 5.12 kWh'));
    assert.ok(message.includes('Estimasi Penghematan:'));
    assert.ok(message.includes('Estimasi Investasi Turnkey:'));

    // Validasi URL
    assert.ok(url.startsWith(`${WHATSAPP_BASE_URL}${OFFICIAL_WHATSAPP_NUMBER}?text=`));
    const extractedText = decodeURIComponent(url.replace(`${WHATSAPP_BASE_URL}${OFFICIAL_WHATSAPP_NUMBER}?text=`, ''));
    assert.equal(extractedText, message);
  });

  test('Mode Komersial: pesan memuat skema terpilih (CAPEX, OPEX PPA, OPEX Sewa)', () => {
    const inputCapex = { tariffGroup: 'B-2', monthlyBill: 50000000, activeScheme: 'capex' };
    const resCapex = calculateCommercial(inputCapex);
    const msgCapex = generateWhatsAppMessage('commercial', inputCapex, resCapex);
    assert.ok(msgCapex.includes('CAPEX Beli Putus'));
    assert.ok(msgCapex.includes('Estimasi Investasi Turnkey:'));

    const inputPpa = { tariffGroup: 'B-2', monthlyBill: 50000000, activeScheme: 'opex_ppa' };
    const resPpa = calculateCommercial(inputPpa);
    const msgPpa = generateWhatsAppMessage('commercial', inputPpa, resPpa);
    assert.ok(msgPpa.includes('OPEX PPA'));
    assert.ok(msgPpa.includes('Diskon 15%'));

    const inputLease = { tariffGroup: 'B-2', monthlyBill: 50000000, activeScheme: 'opex_lease' };
    const resLease = calculateCommercial(inputLease);
    const msgLease = generateWhatsAppMessage('commercial', inputLease, resLease);
    assert.ok(msgLease.includes('OPEX Sewa Operasional'));
    assert.ok(msgLease.includes('Biaya Sewa Bulanan:'));
  });

  test('Mode Baterai / BESS: pesan memuat daya kritis dan durasi backup', () => {
    const input = { criticalLoadKw: 2.0, backupHours: 4, includeSolarCharger: true };
    const result = calculateBattery(input);
    const message = generateWhatsAppMessage('battery', input, result);
    const url = generateWhatsAppUrl('battery', input, result);

    assert.ok(message.includes('BESS (Baterai Cadangan Anti-Padam)'));
    assert.ok(message.includes('2,00 kW'));
    assert.ok(message.includes('4 Jam'));
    assert.ok(message.includes('10,24 kWh'));
    assert.ok(message.includes('Integrasi Solar Charger: Ya'));
    assert.ok(url.startsWith('https://wa.me/628139916890?text='));
  });

  test('Mode PJUTS: pesan memuat tiang, watt, smart dimming, dan hari otonomi', () => {
    const input = { poleCount: 10, lampWattage: 60, smartDimming: true, autonomyDays: 2 };
    const result = calculatePjuts(input);
    const message = generateWhatsAppMessage('pjuts', input, result);
    const url = generateWhatsAppUrl('pjuts', input, result);

    assert.ok(message.includes('Penerangan Jalan Umum Tenaga Surya (PJUTS)'));
    assert.ok(message.includes('10 Titik Tiang'));
    assert.ok(message.includes('60 Watt'));
    assert.ok(message.includes('Smart Dimming hemat ~29.2% energi'));
    assert.ok(message.includes('2 Hari'));
    assert.ok(url.startsWith('https://wa.me/628139916890?text='));
  });
});

// ============================================================================
// 4. END-TO-END PIPELINE: RESULT -> WHATSAPP URL -> QR CODE SVG
// ============================================================================
describe('End-to-End Pipeline: Calculation -> WhatsApp URL -> SVG QR Code', () => {
  test('Pipeline lengkap untuk keempat mode berjalan tanpa error', () => {
    const modes = [
      { mode: 'residential', calc: () => calculateResidential({ powerVa: 2200, monthlyBill: 1500000 }) },
      { mode: 'commercial', calc: () => calculateCommercial({ tariffGroup: 'B-2', monthlyBill: 50000000 }) },
      { mode: 'battery', calc: () => calculateBattery({ criticalLoadKw: 2.0, backupHours: 4 }) },
      { mode: 'pjuts', calc: () => calculatePjuts({ poleCount: 10, lampWattage: 60 }) }
    ];

    modes.forEach(({ mode, calc }) => {
      const result = calc();
      const waUrl = generateWhatsAppUrl(mode, result.inputs, result);
      assert.ok(waUrl.length > 50, `WhatsApp URL for ${mode} must be non-trivial`);

      const qrSvg = generateQrSvg(waUrl, { size: 256, ecc: 'L' });
      assert.ok(qrSvg.includes('<svg'), `QR Code SVG for ${mode} must contain <svg>`);
      assert.ok(qrSvg.includes('</svg>'), `QR Code SVG for ${mode} must contain </svg>`);
      assert.ok(qrSvg.includes('<path d="M'), `QR Code SVG for ${mode} must have path data`);
    });
  });
});
