/**
 * PT. Indogreen Technology And Management
 * Solar Energy Calculator - Unified PLTS Hybrid Off-Grid Sizing Engine
 *
 * Compliant with:
 * - Hybrid Off-Grid Sizing Formula (PSH 3.8 jam/hari, PR 82%, Panel 550 Wp)
 * - Standard Hybrid Off-Grid Inverter sizing table (3 kW - 100 kW+)
 * - LiFePO4 Battery Bank sizing (DoD 85%, Efficiency 95%, Modular 5.12 kWh)
 * - PLN Tariff Table Triwulan IV 2026 (Residential R-1..R-3 & Bisnis B-1..B-3)
 * - Pricing/Cost module intentionally deferred to next phase (pricing: null)
 */

import { HYBRID_TECH_CONFIG, getHybridTariffOption, getHybridSolarPanel } from './constants.js';

/**
 * Memilih ukuran kapasitas inverter standar terdekat ke atas
 * @param {number} minInverterReq - Kebutuhan minimum inverter dalam kW
 * @returns {number} Kapasitas inverter standar dalam kW
 */
function resolveStandardInverterKw(minInverterReq) {
  if (minInverterReq <= 0) return 0;
  const matched = HYBRID_TECH_CONFIG.STANDARD_INVERTER_KW.find(sz => sz >= minInverterReq);
  if (matched) return matched;
  return Math.ceil(minInverterReq / 10) * 10;
}

/**
 * Menghitung sizing teknis PLTS Hybrid Off-Grid untuk Residential maupun Bisnis
 *
 * @param {Object} params
 * @param {'Residential'|'Bisnis'} [params.kategori='Residential'] - Kategori pelanggan PLN
 * @param {string} [params.dayaId] - ID golongan daya PLN (misal: 'R1-1300' atau 'B2-6600')
 * @param {number} [params.biayaBulanan=2500000] - Tagihan listrik rata-rata per bulan (Rp)
 * @param {number} [params.persenSiang=40] - Persentase pemakaian listrik siang hari (0-100)
 * @param {number} [params.persenMalam] - Opsional, dipakai jika persenSiang tidak diberikan
 * @param {string} [params.sistem='Hybrid Offgrid'] - Jenis arsitektur sistem PLTS
 * @param {number} [params.persenCover=100] - Target persentase kebutuhan listrik dicover PLTS (25, 50, 75, 100)
 * @param {number|string} [params.panelWp=615] - Pilihan kapasitas modul surya (550, 610, 615, 620, 720 Wp)
 * @returns {Object} Hasil kalkulasi teknis terstruktur
 */
export function calculateHybridOffGrid(params = {}) {
  const kategori = params.kategori === 'Bisnis' ? 'Bisnis' : 'Residential';
  const dayaObj = getHybridTariffOption(kategori, params.dayaId);
  const panelConfig = getHybridSolarPanel(params.panelWp || HYBRID_TECH_CONFIG.PANEL_WP_DEFAULT);
  const panelWp = panelConfig.wp;

  const rawBiaya = Number(params.biayaBulanan);
  const biayaBulanan = isNaN(rawBiaya) ? 0 : Math.max(0, rawBiaya);

  // Resolusi persentase siang & malam berimbang 100%
  let persenSiang = 40;
  if (params.persenSiang !== undefined && params.persenSiang !== null && !isNaN(Number(params.persenSiang))) {
    persenSiang = Math.max(0, Math.min(100, Math.round(Number(params.persenSiang))));
  } else if (params.persenMalam !== undefined && params.persenMalam !== null && !isNaN(Number(params.persenMalam))) {
    persenSiang = 100 - Math.max(0, Math.min(100, Math.round(Number(params.persenMalam))));
  }
  const persenMalam = 100 - persenSiang;

  const rawCover = params.persenCover !== undefined && params.persenCover !== null ? Number(params.persenCover) : 100;
  const persenCover = isNaN(rawCover) ? 100 : Math.max(0, Math.min(100, rawCover));
  const sistem = params.sistem || 'Hybrid Offgrid';

  // 1. Profil Konsumsi Energi Pelanggan
  const tariff = dayaObj.tariff;
  const totalKwhBulan = tariff > 0 ? biayaBulanan / tariff : 0;
  const totalKwhHari = totalKwhBulan / HYBRID_TECH_CONFIG.DAYS_PER_MONTH;

  const coverRatio = persenCover / 100;
  const targetKwhHari = totalKwhHari * coverRatio;

  const siangRatio = persenSiang / 100;
  const malamRatio = persenMalam / 100;
  const kwhSiangHari = targetKwhHari * siangRatio;
  const kwhMalamHari = targetKwhHari * malamRatio;

  // 2. Sizing Kapasitas PV Array & Luas Atap (Panel Wp dinamis, Margin 1%)
  let jumlahPanel = 0;
  let kapasitasPvKwp = 0;
  let luasNetM2 = 0;
  let luasAtapM2 = 0;
  if (targetKwhHari > 0) {
    const rawPvKwp = targetKwhHari / (HYBRID_TECH_CONFIG.PSH_HOURS * HYBRID_TECH_CONFIG.PERFORMANCE_RATIO);
    jumlahPanel = Math.max(1, Math.ceil((rawPvKwp * 1000) / panelWp));
    kapasitasPvKwp = Number(((jumlahPanel * panelWp) / 1000).toFixed(2));
    luasNetM2 = Number((jumlahPanel * panelConfig.areaM2).toFixed(2));
    luasAtapM2 = Number((luasNetM2 * HYBRID_TECH_CONFIG.ROOF_MARGIN_FACTOR).toFixed(1));
  }

  // 3. Sizing Kapasitas Inverter Hybrid Off-Grid
  let minInverterReq = 0;
  let kapasitasInverterKw = 0;
  if (targetKwhHari > 0) {
    minInverterReq = Math.max(
      kapasitasPvKwp * HYBRID_TECH_CONFIG.INVERTER_PV_FACTOR,
      targetKwhHari / HYBRID_TECH_CONFIG.INVERTER_DAILY_DIVISOR
    );
    kapasitasInverterKw = resolveStandardInverterKw(minInverterReq);
  }

  // 4. Sizing Kapasitas Battery Bank LiFePO4 (5.12 kWh per modul, DoD 85%, Eff 95%)
  let rawBatteryKwh = 0;
  let jumlahModulBattery = 0;
  let kapasitasBatteryKwh = 0;
  if (targetKwhHari > 0) {
    if (kwhMalamHari > 0) {
      rawBatteryKwh = kwhMalamHari / (HYBRID_TECH_CONFIG.BATTERY_DOD * HYBRID_TECH_CONFIG.BATTERY_EFFICIENCY);
      jumlahModulBattery = Math.max(1, Math.ceil(rawBatteryKwh / HYBRID_TECH_CONFIG.BATTERY_MODULE_KWH));
    } else {
      // Buffer minimum 1 unit untuk stabilitas arsitektur Hybrid Off-Grid
      jumlahModulBattery = 1;
    }
    kapasitasBatteryKwh = Number((jumlahModulBattery * HYBRID_TECH_CONFIG.BATTERY_MODULE_KWH).toFixed(2));
  }

  return {
    mode: 'hybrid',
    inputs: {
      kategori,
      dayaId: dayaObj.id,
      dayaLabel: dayaObj.label,
      dayaStatus: dayaObj.status,
      tariff,
      biayaBulanan,
      persenSiang,
      persenMalam,
      sistem,
      persenCover,
      panelWp
    },
    energy: {
      totalKwhBulan: Number(totalKwhBulan.toFixed(2)),
      totalKwhHari: Number(totalKwhHari.toFixed(2)),
      targetKwhHari: Number(targetKwhHari.toFixed(2)),
      kwhSiangHari: Number(kwhSiangHari.toFixed(2)),
      kwhMalamHari: Number(kwhMalamHari.toFixed(2))
    },
    pv: {
      kapasitasPvKwp,
      jumlahPanel,
      panelWp,
      panelLabel: panelConfig.label,
      panelWidthM: panelConfig.widthM,
      panelLengthM: panelConfig.lengthM,
      panelAreaM2: panelConfig.areaM2,
      luasNetM2,
      luasAtapM2,
      pshJam: HYBRID_TECH_CONFIG.PSH_HOURS,
      performanceRatio: HYBRID_TECH_CONFIG.PERFORMANCE_RATIO
    },
    inverter: {
      kapasitasInverterKw,
      kapasitasInverterW: kapasitasInverterKw * 1000,
      minInverterReq: Number(minInverterReq.toFixed(2))
    },
    battery: {
      kapasitasBatteryKwh,
      jumlahModulBattery,
      batteryModuleKwh: HYBRID_TECH_CONFIG.BATTERY_MODULE_KWH,
      batteryDoD: HYBRID_TECH_CONFIG.BATTERY_DOD,
      batteryEfficiency: HYBRID_TECH_CONFIG.BATTERY_EFFICIENCY,
      rawBatteryKwh: Number(rawBatteryKwh.toFixed(2))
    },
    // Perhitungan biaya / harga ditunda ke perintah selanjutnya
    pricing: null
  };
}
