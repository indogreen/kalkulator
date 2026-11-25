/**
 * PT. Indogreen Technology And Management
 * Solar Energy Calculator - Battery Energy Storage System (BESS / Anti-Padam)
 * 
 * Compliant with:
 * - Sizing BESS LiFePO4 (90% DoD, 95% Inverter PCS Efficiency)
 * - Sizing Inverter Darurat / Hybrid PCS dengan safety margin surge 1.25x
 * - Opsi integrasi Solar PV Charger untuk otonomi blackout berkelanjutan
 * - Estimasi biaya turnkey BESS (Modul baterai, Inverter/PCS, Panel ATS, Instalasi, PPN 11%)
 */

import {
  TECHNICAL_SPECS,
  BESS_SPECS,
  getPsh,
  getTurnkeyCostPerWp
} from './constants.js';

/**
 * Menghitung sizing teknis dan estimasi investasi sistem BESS Anti-Padam
 * 
 * @param {Object} params
 * @param {string} [params.sector='residential'] - Sektor ('residential' atau 'commercial')
 * @param {number} params.criticalLoadKw - Daya beban kritis yang dibackup dalam kW (misal: 1.5 kW)
 * @param {number} params.backupHours - Durasi cadangan darurat dalam jam (misal: 4 jam)
 * @param {boolean} [params.includeSolarCharger=false] - Integrasi pengisian panel surya
 * @param {string} [params.region='dki_jabar_banten'] - Wilayah PSH (jika solar charger aktif)
 * @returns {Object} Hasil kalkulasi terstruktur
 */
export function calculateBattery(params = {}) {
  // 1. Sanitasi input
  const sector = params.sector === 'commercial' ? 'commercial' : 'residential';
  const criticalLoadKw = Math.max(0, Number(params.criticalLoadKw) || 0);
  const backupHours = Math.max(0, Number(params.backupHours) || 0);
  const includeSolarCharger = Boolean(params.includeSolarCharger);
  const region = params.region || 'dki_jabar_banten';

  // 2. Energi kritis yang dibutuhkan (kWh)
  const requiredEnergyKwh = Number((criticalLoadKw * backupHours).toFixed(2));

  // 3. Sizing Kapasitas Baterai LiFePO4
  // Memperhitungkan 90% Depth of Discharge (DoD) & 95% efisiensi konversi inverter/PCS
  // Kapasitas Nominal = Energi Dibutuhkan / (DoD * Efisiensi)
  let nominalCapacityKwh = 0;
  let batteryPacks = 0;
  let installedCapacityKwh = 0;
  let usableCapacityKwh = 0;
  let actualBackupHours = 0;

  if (criticalLoadKw > 0 && backupHours > 0) {
    const rawNominalKwh = requiredEnergyKwh / (BESS_SPECS.BATTERY_DOD * BESS_SPECS.INVERTER_EFFICIENCY);
    nominalCapacityKwh = Number(rawNominalKwh.toFixed(2));
    // Dibulatkan ke unit modul rak LiFePO4 standar (5.12 kWh per modul)
    batteryPacks = Math.max(1, Math.ceil(nominalCapacityKwh / BESS_SPECS.STANDARD_PACK_KWH));
    installedCapacityKwh = Number((batteryPacks * BESS_SPECS.STANDARD_PACK_KWH).toFixed(2));
    usableCapacityKwh = Number((installedCapacityKwh * BESS_SPECS.BATTERY_DOD).toFixed(2));
    actualBackupHours = Number(((usableCapacityKwh * BESS_SPECS.INVERTER_EFFICIENCY) / criticalLoadKw).toFixed(1));
  }

  // 4. Sizing Inverter Darurat / Hybrid PCS
  // Safety margin 1.25x (125%) untuk menahan inrush current / lonjakan motor start
  const inverterKw = criticalLoadKw > 0
    ? Number((criticalLoadKw * BESS_SPECS.SAFETY_MARGIN_INVERTER).toFixed(2))
    : 0;

  // 5. Sizing Solar PV Charger (Opsional)
  let solarKwpInstalled = 0;
  let moduleCount = 0;
  let roofAreaRequired = 0;
  let dailySolarGenKwh = 0;

  if (includeSolarCharger && criticalLoadKw > 0 && backupHours > 0) {
    const psh = getPsh(region);
    // Mengisi kembali kapasitas energi yang terpakai dalam 1 siklus harian
    const requiredPvKwp = requiredEnergyKwh / (psh * TECHNICAL_SPECS.PERFORMANCE_RATIO);
    moduleCount = Math.max(1, Math.ceil((requiredPvKwp * 1000) / TECHNICAL_SPECS.MODULE_WP));
    solarKwpInstalled = Number(((moduleCount * TECHNICAL_SPECS.MODULE_WP) / 1000).toFixed(2));
    roofAreaRequired = Number((solarKwpInstalled * TECHNICAL_SPECS.ROOF_SPACE_RESIDENTIAL).toFixed(1));
    dailySolarGenKwh = Number((solarKwpInstalled * psh * TECHNICAL_SPECS.PERFORMANCE_RATIO).toFixed(2));
  }

  // 6. Estimasi Biaya Investasi Turnkey BESS
  const batteryCost = batteryPacks * BESS_SPECS.BATTERY_COST_PER_PACK;
  const inverterCost = Math.round(inverterKw * BESS_SPECS.INVERTER_COST_PER_KW);
  const atsInstallCost = sector === 'commercial'
    ? BESS_SPECS.ATS_INSTALL_COMMERCIAL
    : BESS_SPECS.ATS_INSTALL_RESIDENTIAL;

  let solarPvCost = 0;
  if (includeSolarCharger && solarKwpInstalled > 0) {
    const pvCostPerWp = getTurnkeyCostPerWp(solarKwpInstalled * 1000);
    solarPvCost = Math.round((solarKwpInstalled * 1000) * pvCostPerWp);
  }

  const subtotalInvestment = batteryCost + inverterCost + atsInstallCost + solarPvCost;
  const ppnAmount = Math.round(subtotalInvestment * TECHNICAL_SPECS.PPN_RATE);
  const totalInvestment = subtotalInvestment + ppnAmount;

  // 7. Return Data Terstruktur
  return {
    mode: 'battery',
    inputs: {
      sector,
      criticalLoadKw,
      backupHours,
      includeSolarCharger,
      region
    },
    battery: {
      chemistry: 'LiFePO4 (Lithium Iron Phosphate)',
      standardPackKwh: BESS_SPECS.STANDARD_PACK_KWH,
      batteryPacks,
      installedCapacityKwh,
      usableCapacityKwh,
      depthOfDischargePercent: BESS_SPECS.BATTERY_DOD * 100,
      inverterEfficiencyPercent: BESS_SPECS.INVERTER_EFFICIENCY * 100,
      actualBackupHours,
      cycleLife: BESS_SPECS.CYCLE_LIFE,
      warrantyYears: BESS_SPECS.WARRANTY_YEARS
    },
    inverter: {
      criticalLoadKw,
      safetyMarginMultiplier: BESS_SPECS.SAFETY_MARGIN_INVERTER,
      recommendedInverterKw: inverterKw,
      transferTimeMs: '< 10 ms (Seamless UPS Mode)'
    },
    solarCharger: {
      enabled: includeSolarCharger,
      installedKwp: solarKwpInstalled,
      moduleCount,
      moduleWp: TECHNICAL_SPECS.MODULE_WP,
      dailySolarGenKwh,
      roofAreaRequiredM2: roofAreaRequired
    },
    financial: {
      batteryCost,
      inverterCost,
      atsInstallCost,
      solarPvCost,
      subtotalInvestment,
      ppnAmount,
      totalInvestment
    },
    benefits: [
      'Peralihan otomatis ultra-cepat (< 10 ms) tanpa merestart komputer atau AC',
      'Baterai LiFePO4 bebas perawatan, tidak berisik, dan tanpa asap beracun',
      'Masa pakai lebih dari 6.000 siklus pengisian (~15 tahun)',
      includeSolarCharger
        ? 'Dapat beroperasi mandiri saat pemadaman panjang berkat pengisian tenaga surya'
        : 'Dapat diintegrasikan dengan modul surya di kemudian hari'
    ]
  };
}
