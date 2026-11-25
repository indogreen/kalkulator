/**
 * PT. Indogreen Technology And Management
 * Solar Energy Calculator - Public Solar Street Lighting Module (PJUTS)
 * 
 * Compliant with:
 * - Standar Teknis Penerangan Jalan Umum Tenaga Surya (PJUTS)
 * - Fitur Smart Dimming otomatis (5 jam 100% + 7 jam 50% menghemat ~30% baterai & panel)
 * - Cadangan hari otonomi cuaca mendung/hujan (1 - 3 hari)
 * - Sizing Baterai LiFePO4 (90% DoD, 90% efisiensi driver LED)
 * - Perhitungan penghematan biaya listrik setara Tarif P-3 PLN (Rp 1.699,53/kWh)
 */

import {
  TECHNICAL_SPECS,
  PJUTS_SPECS,
  getPsh,
  getPjutsCostPerPole
} from './constants.js';

/**
 * Memilih ukuran panel surya standar PJUTS terdekat ke atas
 * @param {number} requiredWp
 * @returns {number} Standar Wp panel
 */
function getStandardPjutsPanelWp(requiredWp) {
  const standardRatings = [50, 80, 100, 120, 150, 180, 200, 250, 300, 350, 400, 450, 500];
  for (const rating of standardRatings) {
    if (rating >= requiredWp) return rating;
  }
  return Math.ceil(requiredWp / 50) * 50;
}

/**
 * Menghitung sizing teknis dan penghematan PJUTS
 * 
 * @param {Object} params
 * @param {number} params.poleCount - Jumlah titik tiang lampu jalan (misal: 10)
 * @param {number} params.lampWattage - Daya lampu LED dalam Watt (misal: 60)
 * @param {number} [params.nightHours=12] - Durasi operasional malam dalam jam (default: 12 jam)
 * @param {boolean} [params.smartDimming=true] - Fitur smart dimming otomatis
 * @param {number} [params.autonomyDays=2] - Cadangan hari otonomi hujan/mendung (1, 2, atau 3)
 * @param {string} [params.region='dki_jabar_banten'] - Wilayah PSH
 * @returns {Object} Hasil kalkulasi PJUTS terstruktur
 */
export function calculatePjuts(params = {}) {
  // 1. Sanitasi input
  const poleCount = Math.max(0, Math.round(Number(params.poleCount) || 0));
  const lampWattage = Math.max(0, Number(params.lampWattage) || 0);
  const nightHours = Math.max(1, Number(params.nightHours) || PJUTS_SPECS.NIGHT_HOURS_DEFAULT);
  const smartDimming = params.smartDimming !== false; // default true
  const autonomyDays = Math.max(1, Math.min(3, Math.round(Number(params.autonomyDays) || 2)));
  const region = params.region || 'dki_jabar_banten';

  // 2. Lookup konstanta
  const psh = getPsh(region);
  const p3Tariff = PJUTS_SPECS.P3_TARIFF_RATE;

  // 3. Konsumsi Energi Harian per Tiang
  // Mode Smart Dimming:
  // - 5 Jam pertama (18:00 - 23:00): 100% daya saat jalan ramai
  // - 7 Jam berikutnya (23:00 - 06:00): 50% daya saat dini hari sepi
  // Jam ekuivalen = (5 * 1.0) + (7 * 0.5) = 8.5 jam
  let effectiveOperatingHours = 0;
  let energySavedPercent = 0;

  if (smartDimming) {
    effectiveOperatingHours = PJUTS_SPECS.SMART_DIMMING_EQUIV_HOURS; // 8.5 jam
    energySavedPercent = Number((((nightHours - 8.5) / nightHours) * 100).toFixed(1));
  } else {
    effectiveOperatingHours = nightHours;
    energySavedPercent = 0;
  }

  const dailyWhPerPole = Number((lampWattage * effectiveOperatingHours).toFixed(1));
  const totalDailyKwh = Number(((dailyWhPerPole * poleCount) / 1000).toFixed(2));
  const totalMonthlyKwh = Number((totalDailyKwh * TECHNICAL_SPECS.DAYS_PER_MONTH).toFixed(2));
  const totalYearlyKwh = Number((totalDailyKwh * TECHNICAL_SPECS.DAYS_PER_YEAR).toFixed(2));

  // 4. Sizing Baterai LiFePO4 per Tiang
  // Formula: Kapasitas Baterai Wh = (Wh/hari * Hari Otonomi) / (DoD 90% * Efisiensi Driver 90%)
  const batteryWhPerPole = (lampWattage > 0 && poleCount > 0)
    ? Math.round((dailyWhPerPole * autonomyDays) / (PJUTS_SPECS.BATTERY_DOD * PJUTS_SPECS.LED_DRIVER_EFFICIENCY))
    : 0;

  // Kapasitas Ah pada tegangan nominal 12.8V LiFePO4
  const batteryAhPerPole = Math.round(batteryWhPerPole / PJUTS_SPECS.NOMINAL_BATTERY_VOLTAGE);
  const totalBatteryKwh = Number(((batteryWhPerPole * poleCount) / 1000).toFixed(2));

  // 5. Sizing Panel Surya (Solar PV) per Tiang
  // Formula: Wp = (Wh/hari * Faktor Pengisian 1.30) / PSH
  let requiredPanelWpPerPole = 0;
  let selectedPanelWpPerPole = 0;

  if (lampWattage > 0 && poleCount > 0 && psh > 0) {
    requiredPanelWpPerPole = (dailyWhPerPole * PJUTS_SPECS.CHARGING_SAFETY_FACTOR) / psh;
    selectedPanelWpPerPole = getStandardPjutsPanelWp(requiredPanelWpPerPole);
  }

  const totalSolarKwp = Number(((selectedPanelWpPerPole * poleCount) / 1000).toFixed(2));

  // 6. Penghematan Biaya Listrik PLN Tarif P-3 (Avoided Cost)
  // Baseline: Biaya jika menyalakan lampu jalan konvensional dari grid PLN tanpa solar (12 jam @ 100%)
  const baselineGridKwhDaily = (poleCount * lampWattage * nightHours) / 1000;
  const baselineGridKwhMonthly = baselineGridKwhDaily * TECHNICAL_SPECS.DAYS_PER_MONTH;
  const baselineGridKwhYearly = baselineGridKwhDaily * TECHNICAL_SPECS.DAYS_PER_YEAR;

  const avoidedCostMonthlyRp = Math.round(baselineGridKwhMonthly * p3Tariff);
  const avoidedCostYearlyRp = Math.round(baselineGridKwhYearly * p3Tariff);

  // 7. Estimasi Biaya Investasi Turnkey PJUTS
  // Termasuk: Tiang Octagonal 6-9 meter Hot-Dip Galvanized, Lampu LED IP66,
  // Modul Solar PV, Baterai LiFePO4, Smart MPPT Controller, Box Baterai & Aksesoris Angkur
  const costPerPole = getPjutsCostPerPole(lampWattage);
  const subtotalInvestment = poleCount * costPerPole;
  const ppnAmount = Math.round(subtotalInvestment * TECHNICAL_SPECS.PPN_RATE);
  const totalInvestment = subtotalInvestment + ppnAmount;

  // 8. Titik Impas (Payback Period)
  const paybackYears = avoidedCostYearlyRp > 0
    ? Number((totalInvestment / avoidedCostYearlyRp).toFixed(1))
    : 0;

  // 9. Dampak Lingkungan
  const co2ReductionYearlyKg = Number((baselineGridKwhYearly * TECHNICAL_SPECS.CO2_FACTOR).toFixed(1));
  const treesEquivalent = Math.round(co2ReductionYearlyKg * TECHNICAL_SPECS.TREES_PER_KG_CO2);

  // 10. Return Data Terstruktur
  return {
    mode: 'pjuts',
    inputs: {
      poleCount,
      lampWattage,
      nightHours,
      smartDimming,
      autonomyDays,
      region
    },
    systemPerPole: {
      lampWattage,
      effectiveOperatingHours,
      dailyWh: dailyWhPerPole,
      batteryWh: batteryWhPerPole,
      batteryAh: batteryAhPerPole,
      batteryVoltage: PJUTS_SPECS.NOMINAL_BATTERY_VOLTAGE,
      requiredPanelWp: Number(requiredPanelWpPerPole.toFixed(1)),
      selectedPanelWp: selectedPanelWpPerPole
    },
    totalSystem: {
      poleCount,
      totalSolarKwp,
      totalBatteryKwh,
      totalDailyKwh,
      totalMonthlyKwh,
      totalYearlyKwh,
      smartDimmingActive: smartDimming,
      energySavedPercent
    },
    savings: {
      p3TariffRate: p3Tariff,
      avoidedCostMonthlyRp,
      avoidedCostYearlyRp,
      baselineGridKwhYearly: Number(baselineGridKwhYearly.toFixed(1))
    },
    financial: {
      costPerPole,
      subtotalInvestment,
      ppnAmount,
      totalInvestment,
      paybackYears,
      avoidedCostMonthlyRp,
      avoidedCostYearlyRp
    },
    environmental: {
      co2ReductionYearlyKg,
      treesEquivalent
    },
    highlights: [
      smartDimming
        ? `Smart Dimming otomatis menghemat ~${energySavedPercent}% kapasitas baterai & panel surya`
        : 'Beroperasi 100% daya kontinu sepanjang malam',
      `Otonomi ${autonomyDays} hari menjamin lampu tetap menyala saat hujan berturut-turut`,
      `Penghematan tagihan listrik PLN setara Rp ${avoidedCostYearlyRp.toLocaleString('id-ID')} / tahun`,
      'Tiang octagonal hot-dip galvanized tahan korosi hingga 20 tahun'
    ]
  };
}
