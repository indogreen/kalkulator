/**
 * PT. Indogreen Technology And Management
 * Solar Energy Calculator - Residential Module (PLTS Atap Residensial)
 * 
 * Compliant with:
 * - Permen ESDM No. 2/2024: Rekening Minimum PLN (40 * kVA * Tarif)
 * - Self-consumption optimization without grid-export dependence
 * - LiFePO4 Hybrid battery storage integration (5.12 kWh / 10.24 kWh)
 * - 25-Year financial & environmental projection
 */

import {
  REGIONS_PSH,
  PLN_TARIFFS_2026,
  TECHNICAL_SPECS,
  DAYTIME_ACTIVITY_PATTERNS,
  BATTERY_HYBRID_OPTIONS,
  getPsh,
  getResidentialTariff,
  getTurnkeyCostPerWp
} from './constants.js';

/**
 * Menghitung simulasi teknis dan finansial PLTS Atap Residensial
 * 
 * @param {Object} params
 * @param {number} params.powerVa - Daya PLN dalam VA (misal: 900, 1300, 2200, 3500, 4400, 5500, 6600, 11000)
 * @param {number} params.monthlyBill - Tagihan listrik bulanan dalam Rupiah (misal: 1500000)
 * @param {string} [params.region='dki_jabar_banten'] - Kode wilayah PSH
 * @param {number} [params.daytimePercent] - Persentase aktivitas siang hari (0 - 100), misal: 30
 * @param {number} [params.nighttimePercent] - Persentase aktivitas malam hari (0 - 100), misal: 70
 * @param {number} [params.daytimeRatio] - Rasio aktivitas siang desimal (0.0 - 1.0), misal: 0.30
 * @param {string} [params.daytimeActivity='medium'] - Pola aktivitas siang ('low', 'medium', 'high')
 * @param {string} [params.batteryOption='none'] - Opsi baterai hybrid ('none', 'hybrid_5', 'hybrid_10')
 * @param {number} [params.roofArea=0] - Luas atap tersedia dalam m² (0 = tidak membatasi)
 * @param {number} [params.customModuleCount] - Kustom jumlah modul jika user menentukan manual
 * @returns {Object} Hasil kalkulasi terstruktur
 */
export function calculateResidential(params = {}) {
  // 1. Sanitasi input dengan proteksi nilai nol dan negatif
  const powerVa = Math.max(0, Number(params.powerVa) || 0);
  const monthlyBill = Math.max(0, Number(params.monthlyBill) || 0);
  const region = params.region || 'dki_jabar_banten';
  const batteryOption = params.batteryOption || 'none';
  const roofArea = Math.max(0, Number(params.roofArea) || 0);

  // 2. Lookup parameter konstanta
  const psh = getPsh(region);
  const tariffRate = getResidentialTariff(powerVa);
  const kva = powerVa / 1000;
  const batteryConfig = BATTERY_HYBRID_OPTIONS[batteryOption] || BATTERY_HYBRID_OPTIONS.none;

  // Resolusi proporsi aktivitas siang vs malam (manual persentase atau legacy pattern)
  let daytimeRatio = 0.30;
  if (params.daytimePercent !== undefined && params.daytimePercent !== null && !isNaN(Number(params.daytimePercent))) {
    daytimeRatio = Math.max(0, Math.min(100, Number(params.daytimePercent))) / 100;
  } else if (params.daytimeRatio !== undefined && params.daytimeRatio !== null && !isNaN(Number(params.daytimeRatio))) {
    daytimeRatio = Math.max(0, Math.min(1, Number(params.daytimeRatio)));
  } else if (params.daytimeActivity && DAYTIME_ACTIVITY_PATTERNS[params.daytimeActivity]) {
    daytimeRatio = DAYTIME_ACTIVITY_PATTERNS[params.daytimeActivity].ratio;
  } else if (typeof params.daytimeActivity === 'number') {
    daytimeRatio = params.daytimeActivity > 1
      ? Math.max(0, Math.min(100, params.daytimeActivity)) / 100
      : Math.max(0, Math.min(1, params.daytimeActivity));
  } else if (params.nighttimePercent !== undefined && params.nighttimePercent !== null && !isNaN(Number(params.nighttimePercent))) {
    const night = Math.max(0, Math.min(100, Number(params.nighttimePercent)));
    daytimeRatio = (100 - night) / 100;
  }

  const daytimePercent = Math.round(daytimeRatio * 100);
  const nighttimePercent = 100 - daytimePercent;
  const daytimeActivity = params.daytimeActivity || `${daytimePercent}%`;

  // 3. Batas legal Rekening Minimum PLN (Permen ESDM No. 2/2024)
  // Rumus: 40 jam nyala * kVA * Tarif per kWh
  const minimumBill = Math.round(TECHNICAL_SPECS.PLN_MIN_HOURS * kva * tariffRate);

  // 4. Estimasi konsumsi listrik bulanan awal (kWh/bulan)
  const monthlyKwh = tariffRate > 0 ? (monthlyBill / tariffRate) : 0;
  const dailyKwh = monthlyKwh / TECHNICAL_SPECS.DAYS_PER_MONTH;

  // 5. Penentuan kapasitas modul optimal (600 Wp = 0.6 kWp)
  // Batas atas kapasitas berdasarkan daya sambungan PLN (inverter AC ~ 100% kVA, DC PV oversizing up to 1.15x)
  const maxKwpFromGrid = kva * 1.15;
  const maxKwpFromRoof = roofArea > 0 ? (roofArea / TECHNICAL_SPECS.ROOF_SPACE_RESIDENTIAL) : Infinity;
  const maxAllowedKwp = Math.min(maxKwpFromGrid > 0 ? maxKwpFromGrid : 2.4, maxKwpFromRoof);
  const maxAllowedModules = Math.max(2, Math.floor(maxAllowedKwp / TECHNICAL_SPECS.MODULE_KWP));

  // Menentukan jumlah modul: custom atau auto-recommendation
  let moduleCount = 0;
  if (params.customModuleCount && Number(params.customModuleCount) > 0) {
    moduleCount = Math.max(2, Math.min(Math.round(Number(params.customModuleCount)), maxAllowedModules));
  } else {
    // Optimasi kapasitas: menutup konsumsi siang hari + kapasitas serap baterai
    // Namun tidak melebihi penghematan di bawah rekening minimum PLN
    const maxSavingKwh = Math.max(0, monthlyBill - minimumBill) / (tariffRate > 0 ? tariffRate : 1);
    const daylightKwh = monthlyKwh * daytimeRatio;
    const batteryMonthlyUsableKwh = batteryConfig.usableKwh * TECHNICAL_SPECS.DAYS_PER_MONTH;
    const targetAbsorbableKwh = Math.min(daylightKwh + batteryMonthlyUsableKwh, maxSavingKwh);

    // Produksi 1 modul 600 Wp per bulan = 0.6 kWp * PSH * PR (0.80) * 30 hari
    const kwhPerModuleMonth = TECHNICAL_SPECS.MODULE_KWP * psh * TECHNICAL_SPECS.PERFORMANCE_RATIO * TECHNICAL_SPECS.DAYS_PER_MONTH;
    
    if (kwhPerModuleMonth > 0 && targetAbsorbableKwh > 0) {
      const calculatedModules = Math.round(targetAbsorbableKwh / kwhPerModuleMonth);
      moduleCount = Math.max(2, Math.min(calculatedModules, maxAllowedModules));
    } else {
      moduleCount = 2; // Rekomendasi minimal string inverter 2 modul
    }
  }

  // 6. Spesifikasi Sistem PLTS Terpasang
  const systemKwp = Number((moduleCount * TECHNICAL_SPECS.MODULE_KWP).toFixed(2));
  const roofAreaRequired = Number((systemKwp * TECHNICAL_SPECS.ROOF_SPACE_RESIDENTIAL).toFixed(1));

  // 7. Estimasi Produksi Energi Surya (Solar Generation)
  // kWh/bulan = kWp * PSH * PR * 30
  const monthlySolarGen = Number((systemKwp * psh * TECHNICAL_SPECS.PERFORMANCE_RATIO * TECHNICAL_SPECS.DAYS_PER_MONTH).toFixed(2));
  const yearlySolarGen = Number((monthlySolarGen * 12).toFixed(2));
  const dailySolarGen = Number((monthlySolarGen / TECHNICAL_SPECS.DAYS_PER_MONTH).toFixed(2));

  // 8. Pemodelan Swakonsumsi (Self-Consumption)
  // Energi surya yang dikonsumsi langsung siang hari
  const monthlyDaylightLoadKwh = monthlyKwh * daytimeRatio;
  const solarDirectDaylightConsumed = Math.min(monthlySolarGen, monthlyDaylightLoadKwh);

  // Surplus energi siang hari yang dapat disimpan ke baterai hybrid
  const solarSurplusAfterDaylight = Math.max(0, monthlySolarGen - solarDirectDaylightConsumed);
  const monthlyNightLoadKwh = monthlyKwh * (1 - daytimeRatio);
  const batteryMonthlyCapacityUsable = batteryConfig.usableKwh * TECHNICAL_SPECS.DAYS_PER_MONTH;
  const solarBatteryConsumed = Math.min(
    solarSurplusAfterDaylight,
    batteryMonthlyCapacityUsable,
    monthlyNightLoadKwh
  );

  // Total energi surya yang berhasil diserap sendiri (zero-export compliance)
  const totalSolarConsumedKwh = Number((solarDirectDaylightConsumed + solarBatteryConsumed).toFixed(2));
  const selfConsumptionPercent = monthlySolarGen > 0
    ? Number(Math.min(100, (totalSolarConsumedKwh / monthlySolarGen) * 100).toFixed(1))
    : 0;

  // 9. Perhitungan Tagihan Baru & Penghematan
  // Sisa listrik yang harus dibeli dari PLN
  const remainingGridKwh = Math.max(0, monthlyKwh - totalSolarConsumedKwh);
  const rawPostSolarBill = Math.round(remainingGridKwh * tariffRate);

  // Penerapan mutlak proteksi Rekening Minimum PLN Permen ESDM No. 2/2024
  const newBill = Math.max(minimumBill, rawPostSolarBill);
  const isMinimumBillApplied = rawPostSolarBill < minimumBill && monthlyBill > minimumBill;

  // Penghematan riil bulanan dan tahunan
  const monthlySavings = Math.max(0, monthlyBill - newBill);
  const yearlySavings = monthlySavings * 12;
  const savingsPercent = monthlyBill > 0 ? Number(((monthlySavings / monthlyBill) * 100).toFixed(1)) : 0;

  // 10. Estimasi Biaya Investasi Turnkey + Baterai + PPN 11%
  const costPerWp = getTurnkeyCostPerWp(systemKwp * 1000);
  const pvCost = Math.round((systemKwp * 1000) * costPerWp);
  const batteryCost = batteryConfig.cost;
  const subtotalInvestment = pvCost + batteryCost;
  const ppnAmount = Math.round(subtotalInvestment * TECHNICAL_SPECS.PPN_RATE);
  const totalInvestment = subtotalInvestment + ppnAmount;

  // 11. Analisis Finansial (Titik Impas / Payback Period)
  const paybackYears = yearlySavings > 0 ? Number((totalInvestment / yearlySavings).toFixed(1)) : 0;

  // 12. Proyeksi 25 Tahun (Degradasi Modul 0.5% per tahun)
  let cumulativeSavings25Years = 0;
  const yearlyProjection = [];
  for (let year = 1; year <= TECHNICAL_SPECS.PROJECTION_YEARS; year++) {
    const degradationMultiplier = Math.pow(1 - TECHNICAL_SPECS.MODULE_DEGRADATION_ANNUAL, year - 1);
    const yearGen = Math.round(yearlySolarGen * degradationMultiplier);
    const yearSaving = Math.round(yearlySavings * degradationMultiplier);
    cumulativeSavings25Years += yearSaving;
    const netProfit = cumulativeSavings25Years - totalInvestment;

    yearlyProjection.push({
      year,
      generationKwh: yearGen,
      savingsRp: yearSaving,
      cumulativeSavingsRp: cumulativeSavings25Years,
      netCashflowRp: netProfit
    });
  }

  const netProfit25Years = Math.max(0, cumulativeSavings25Years - totalInvestment);
  const roiPercent = totalInvestment > 0 ? Number(((netProfit25Years / totalInvestment) * 100).toFixed(1)) : 0;

  // 13. Dampak Lingkungan
  const co2ReductionYearly = Number((yearlySolarGen * TECHNICAL_SPECS.CO2_FACTOR).toFixed(1));
  const treesEquivalent = Math.round(co2ReductionYearly * TECHNICAL_SPECS.TREES_PER_KG_CO2);

  // 14. Durasi Cadangan Padam Baterai (Backup Hours)
  let backupHours = 0;
  if (batteryConfig.capacityKwh > 0) {
    // Estimasi beban malam rata-rata (16 jam tanpa matahari)
    const averageNightLoadKw = monthlyNightLoadKwh > 0
      ? (monthlyNightLoadKwh / TECHNICAL_SPECS.DAYS_PER_MONTH) / 16
      : 0.5;
    backupHours = averageNightLoadKw > 0
      ? Number((batteryConfig.usableKwh / averageNightLoadKw).toFixed(1))
      : 0;
  }

  // 15. Return Data Terstruktur
  return {
    mode: 'residential',
    inputs: {
      powerVa,
      monthlyBill,
      region,
      daytimeActivity,
      daytimePercent,
      nighttimePercent,
      daytimeRatio,
      batteryOption,
      roofArea,
      customModuleCount: params.customModuleCount || null
    },
    system: {
      systemKwp,
      moduleCount,
      moduleWp: TECHNICAL_SPECS.MODULE_WP,
      batteryCapacityKwh: batteryConfig.capacityKwh,
      batteryUsableKwh: batteryConfig.usableKwh,
      roofAreaRequiredM2: roofAreaRequired,
      performanceRatio: TECHNICAL_SPECS.PERFORMANCE_RATIO,
      psh
    },
    energy: {
      dailyKwh: Number(dailyKwh.toFixed(2)),
      monthlyKwh: Number(monthlyKwh.toFixed(2)),
      dailySolarGenKwh: dailySolarGen,
      monthlySolarGenKwh: monthlySolarGen,
      yearlySolarGenKwh: yearlySolarGen,
      totalSolarConsumedKwh,
      selfConsumptionPercent,
      remainingGridKwh: Number(remainingGridKwh.toFixed(2))
    },
    billing: {
      tariffRate,
      oldMonthlyBill: monthlyBill,
      newMonthlyBill: newBill,
      minimumBill,
      isMinimumBillApplied,
      monthlySavings,
      yearlySavings,
      savingsPercent
    },
    financial: {
      costPerWp,
      pvCost,
      batteryCost,
      subtotalInvestment,
      ppnAmount,
      totalInvestment,
      paybackYears,
      cumulativeSavings25Years,
      netProfit25Years,
      roiPercent,
      yearlyProjection
    },
    environmental: {
      co2ReductionYearlyKg: co2ReductionYearly,
      treesEquivalent
    },
    backup: {
      hasBattery: batteryConfig.capacityKwh > 0,
      batteryCapacityKwh: batteryConfig.capacityKwh,
      usableCapacityKwh: batteryConfig.usableKwh,
      backupHours
    }
  };
}
