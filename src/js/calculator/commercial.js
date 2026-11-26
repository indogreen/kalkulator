/**
 * PT. Indogreen Technology And Management
 * Solar Energy Calculator - Commercial & Industrial Module (PLTS Bisnis & Industri)
 * 
 * Compliant with:
 * - Golongan Tarif B-2, B-3, I-3, I-4, P-1, P-2 (Permen ESDM 2026)
 * - Analisis kurva beban operasional (Kantor 08-17, 1-Shift, 2-Shift, 24-Jam) vs radiasi surya
 * - Komparasi 3 Skema Finansial:
 *   1. CAPEX Beli Putus (Turnkey penuh, O&M 1%, payback ~4-6 tahun)
 *   2. OPEX PPA (Zero CAPEX, diskon tarif 15%, O&M gratis, kontrak 20 tahun)
 *   3. OPEX Sewa Operasional (Zero CAPEX, sewa tetap 7 tahun, hak milik berpindah)
 */

import {
  REGIONS_PSH,
  PLN_TARIFFS_2026,
  TECHNICAL_SPECS,
  COMMERCIAL_OPERATIONAL_HOURS,
  COMMERCIAL_SCHEMES,
  getPsh,
  getTariffByGroup,
  getCommercialTurnkeyCostPerWp
} from './constants.js';

/**
 * Menghitung simulasi teknis dan finansial 3 skema PLTS Bisnis & Industri
 * 
 * @param {Object} params
 * @param {string} [params.tariffGroup='B-2'] - Golongan tarif ('B-2', 'B-3', 'I-3', 'I-4', 'P-1')
 * @param {number} params.monthlyBill - Tagihan listrik bulanan dalam Rupiah (misal: 50000000)
 * @param {string} [params.operationalHours='office'] - Pola operasional ('office', 'shift_1', 'shift_2', 'continuous_24h')
 * @param {string} [params.region='dki_jabar_banten'] - Wilayah PSH
 * @param {number} [params.roofArea=0] - Luas atap dalam m² (0 = tidak membatasi)
 * @param {number} [params.customKwp] - Kustom kapasitas kWp jika ditentukan manual
 * @param {string} [params.activeScheme='capex'] - Skema aktif ('capex', 'opex_ppa', 'opex_lease')
 * @returns {Object} Hasil kalkulasi lengkap termasuk komparasi 3 skema
 */
export function calculateCommercial(params = {}) {
  // 1. Sanitasi input
  const tariffGroup = params.tariffGroup || 'B-2';
  const monthlyBill = Math.max(0, Number(params.monthlyBill) || 0);
  const operationalHours = params.operationalHours || 'office';
  const region = params.region || 'dki_jabar_banten';
  const roofArea = Math.max(0, Number(params.roofArea) || 0);
  const activeScheme = params.activeScheme || 'capex';

  // 2. Lookup konstanta teknis & tarif
  const tariffRate = getTariffByGroup(tariffGroup);
  const psh = getPsh(region);
  const hoursConfig = COMMERCIAL_OPERATIONAL_HOURS[operationalHours] || COMMERCIAL_OPERATIONAL_HOURS.office;

  // 3. Estimasi konsumsi listrik bulanan & beban siang hari
  const monthlyKwh = tariffRate > 0 ? (monthlyBill / tariffRate) : 0;
  const daylightMonthlyKwh = monthlyKwh * hoursConfig.daytimeFraction;

  // 4. Rekomendasi Kapasitas Sistem (kWp)
  // Desain optimal: memasok hingga 85-90% dari konsumsi siang hari tanpa ekspor terbuang
  const maxKwpFromRoof = roofArea > 0 ? (roofArea / TECHNICAL_SPECS.ROOF_SPACE_COMMERCIAL) : Infinity;
  
  // Produksi 1 kWp per bulan = 1 kWp * PSH * PR (0.80) * 30 hari
  const kwhPerKwpMonth = psh * TECHNICAL_SPECS.PERFORMANCE_RATIO * TECHNICAL_SPECS.DAYS_PER_MONTH;

  let systemKwp = 0;
  if (params.customKwp && Number(params.customKwp) > 0) {
    const requestedKwp = Number(params.customKwp);
    systemKwp = Math.min(requestedKwp, maxKwpFromRoof !== Infinity ? maxKwpFromRoof : requestedKwp);
  } else {
    if (kwhPerKwpMonth > 0 && daylightMonthlyKwh > 0) {
      const targetGenKwh = daylightMonthlyKwh * 0.90; // buffer 90%
      const targetKwp = targetGenKwh / kwhPerKwpMonth;
      systemKwp = Math.min(targetKwp, maxKwpFromRoof !== Infinity ? maxKwpFromRoof : targetKwp);
    } else {
      systemKwp = 10; // Default baseline minimum komersial 10 kWp
    }
  }

  // Modul Tier-1 600 Wp (0.60 kWp)
  const moduleCount = Math.max(4, Math.round(systemKwp / TECHNICAL_SPECS.MODULE_KWP));
  systemKwp = Number((moduleCount * TECHNICAL_SPECS.MODULE_KWP).toFixed(2));
  const roofAreaRequired = Number((systemKwp * TECHNICAL_SPECS.ROOF_SPACE_COMMERCIAL).toFixed(1));

  // 5. Produksi Energi Surya (kWh)
  const monthlySolarGenKwh = Number((systemKwp * psh * TECHNICAL_SPECS.PERFORMANCE_RATIO * TECHNICAL_SPECS.DAYS_PER_MONTH).toFixed(2));
  const yearlySolarGenKwh = Number((monthlySolarGenKwh * 12).toFixed(2));

  // Energi surya yang dikonsumsi sendiri oleh fasilitas (swakonsumsi)
  const solarConsumedKwhMonthly = Math.min(monthlySolarGenKwh, daylightMonthlyKwh);
  const selfConsumptionPercent = monthlySolarGenKwh > 0
    ? Number(Math.min(100, (solarConsumedKwhMonthly / monthlySolarGenKwh) * 100).toFixed(1))
    : 0;

  // 6. Analisis Nilai Dasar CAPEX Turnkey (+ PPN 11%)
  const costPerWp = getCommercialTurnkeyCostPerWp(systemKwp * 1000);
  const rawCapex = Math.round((systemKwp * 1000) * costPerWp);
  const capexPpn = Math.round(rawCapex * TECHNICAL_SPECS.PPN_RATE);
  const totalCapex = rawCapex + capexPpn;

  // ==========================================
  // 7. Komparasi 3 Skema Finansial
  // ==========================================

  // --- SKEMA 1: CAPEX Beli Putus ---
  const capexAnnualGrossSavings = Math.round(solarConsumedKwhMonthly * 12 * tariffRate);
  const capexMonthlyGrossSavings = Math.round(capexAnnualGrossSavings / 12);
  const capexAnnualOm = Math.round(totalCapex * COMMERCIAL_SCHEMES.capex.omPercentAnnual); // 1% per tahun
  const capexAnnualNetSavings = Math.max(0, capexAnnualGrossSavings - capexAnnualOm);
  const capexMonthlyNetSavings = Math.round(capexAnnualNetSavings / 12);
  const capexPaybackYears = capexAnnualNetSavings > 0
    ? Number((totalCapex / capexAnnualNetSavings).toFixed(1))
    : 0;
  // 25-Year cumulative net savings (dengan 0.5% degradasi modul)
  let capexCumulative25Y = 0;
  for (let yr = 1; yr <= TECHNICAL_SPECS.PROJECTION_YEARS; yr++) {
    const deg = Math.pow(1 - TECHNICAL_SPECS.MODULE_DEGRADATION_ANNUAL, yr - 1);
    capexCumulative25Y += (capexAnnualGrossSavings * deg) - capexAnnualOm;
  }
  capexCumulative25Y = Math.round(capexCumulative25Y - totalCapex);

  const schemeCapex = {
    id: 'capex',
    name: COMMERCIAL_SCHEMES.capex.name,
    initialInvestment: totalCapex,
    monthlyGrossSavings: capexMonthlyGrossSavings,
    monthlyNetSavings: capexMonthlyNetSavings,
    annualNetSavings: capexAnnualNetSavings,
    annualOmCost: capexAnnualOm,
    paybackYears: capexPaybackYears,
    tenorYears: 0,
    cumulativeNet25Years: capexCumulative25Y,
    ownershipDay1: true,
    highlights: [
      'Kepemilikan aset 100% sejak hari pertama',
      'Penghematan finansial paling maksimal jangka panjang',
      'Titik impas (ROI) cepat berkisar 4 - 6 tahun',
      'Biaya O&M mandiri hanya ~1% per tahun'
    ]
  };

  // --- SKEMA 2: OPEX PPA (Power Purchase Agreement - Zero CAPEX) ---
  const ppaDiscountRate = COMMERCIAL_SCHEMES.opex_ppa.ppaDiscount; // 15%
  const ppaSolarTariff = tariffRate * (1 - ppaDiscountRate); // Tarif bayar ke developer (85%)
  const ppaSavingsPerKwh = tariffRate * ppaDiscountRate; // Diskon 15%
  const ppaMonthlySavings = Math.round(solarConsumedKwhMonthly * ppaSavingsPerKwh);
  const ppaAnnualSavings = ppaMonthlySavings * 12;
  const ppaContractYears = COMMERCIAL_SCHEMES.opex_ppa.contractYears; // 20 tahun
  // Akumulasi 20 tahun kontrak
  let ppaCumulative20Y = 0;
  for (let yr = 1; yr <= ppaContractYears; yr++) {
    const deg = Math.pow(1 - TECHNICAL_SPECS.MODULE_DEGRADATION_ANNUAL, yr - 1);
    ppaCumulative20Y += (ppaAnnualSavings * deg);
  }
  ppaCumulative20Y = Math.round(ppaCumulative20Y);

  const schemeOpexPpa = {
    id: 'opex_ppa',
    name: COMMERCIAL_SCHEMES.opex_ppa.name,
    initialInvestment: 0, // Rp 0
    solarTariffPerKwh: Number(ppaSolarTariff.toFixed(2)),
    savingsPerKwh: Number(ppaSavingsPerKwh.toFixed(2)),
    monthlyNetSavings: ppaMonthlySavings,
    annualNetSavings: ppaAnnualSavings,
    annualOmCost: 0, // Ditanggung pengembang
    paybackYears: 0, // N/A karena nol modal
    tenorYears: ppaContractYears,
    cumulativeNet25Years: ppaCumulative20Y,
    ownershipDay1: false,
    highlights: [
      'Nol Rupiah (Rp 0) biaya investasi awal',
      'Diskon langsung 15% dari tarif listrik PLN per kWh',
      'Perawatan & suku cadang 100% ditanggung Indogreen',
      'Aset dihibahkan ke klien setelah kontrak 20 tahun'
    ]
  };

  // --- SKEMA 3: OPEX Sewa Operasional (Leasing 7 Tahun) ---
  const leaseMonthlyRate = COMMERCIAL_SCHEMES.opex_lease.monthlyLeaseRatePercent; // 1.4%
  const leaseMonthlyPayment = Math.round(totalCapex * leaseMonthlyRate);
  const leaseGrossSavingsMonthly = Math.round(solarConsumedKwhMonthly * tariffRate);
  // Net cashflow bulanan selama masa sewa 7 tahun (84 bulan)
  const leaseNetSavingsMonthlyYears1to7 = Math.round(leaseGrossSavingsMonthly - leaseMonthlyPayment);
  // Pasca tahun ke-7 (Tahun 8-25): Lunas, sewa Rp 0, hanya dipotong O&M 1%
  const leaseNetSavingsMonthlyYears8to25 = Math.round(capexMonthlyNetSavings);
  
  let leaseCumulative25Y = 0;
  for (let yr = 1; yr <= TECHNICAL_SPECS.PROJECTION_YEARS; yr++) {
    const deg = Math.pow(1 - TECHNICAL_SPECS.MODULE_DEGRADATION_ANNUAL, yr - 1);
    const yrGrossSaving = (solarConsumedKwhMonthly * 12 * tariffRate) * deg;
    if (yr <= COMMERCIAL_SCHEMES.opex_lease.leaseTenorYears) {
      // Periode sewa: Penghematan - Total sewa tahunan
      leaseCumulative25Y += yrGrossSaving - (leaseMonthlyPayment * 12);
    } else {
      // Periode pasca sewa: Penghematan - O&M 1%
      leaseCumulative25Y += yrGrossSaving - capexAnnualOm;
    }
  }
  leaseCumulative25Y = Math.round(leaseCumulative25Y);

  const schemeOpexLease = {
    id: 'opex_lease',
    name: COMMERCIAL_SCHEMES.opex_lease.name,
    initialInvestment: 0, // Rp 0
    monthlyLeasePayment: leaseMonthlyPayment,
    monthlyNetSavings: leaseNetSavingsMonthlyYears1to7,
    monthlyNetSavingsAfterTenor: leaseNetSavingsMonthlyYears8to25,
    annualNetSavings: leaseNetSavingsMonthlyYears1to7 * 12,
    annualOmCost: 0, // Termasuk dalam paket sewa selama 7 tahun
    paybackYears: COMMERCIAL_SCHEMES.opex_lease.leaseTenorYears,
    tenorYears: COMMERCIAL_SCHEMES.opex_lease.leaseTenorYears,
    cumulativeNet25Years: leaseCumulative25Y,
    ownershipDay1: false,
    highlights: [
      'Nol investasi modal di muka (Off-Balance Sheet)',
      'Tenor sewa tetap 7 tahun yang terjangkau',
      'Hak milik aset sepenuhnya beralih ke klien di tahun ke-8',
      'Penghematan penuh dinikmati tanpa cicilan di sisa masa pakai'
    ]
  };

  // Objek Skema Aktif
  const schemes = {
    capex: schemeCapex,
    opex_ppa: schemeOpexPpa,
    opex_lease: schemeOpexLease
  };
  const currentScheme = schemes[activeScheme] || schemeCapex;

  // 8. Dampak Lingkungan
  const co2ReductionYearlyKg = Number((yearlySolarGenKwh * TECHNICAL_SPECS.CO2_FACTOR).toFixed(1));
  const treesEquivalent = Math.round(co2ReductionYearlyKg * TECHNICAL_SPECS.TREES_PER_KG_CO2);

  // 9. Return Data Terstruktur
  return {
    mode: 'commercial',
    inputs: {
      tariffGroup,
      monthlyBill,
      operationalHours,
      region,
      roofArea,
      customKwp: params.customKwp || null,
      activeScheme
    },
    system: {
      systemKwp,
      moduleCount,
      moduleWp: TECHNICAL_SPECS.MODULE_WP,
      roofAreaRequiredM2: roofAreaRequired,
      performanceRatio: TECHNICAL_SPECS.PERFORMANCE_RATIO,
      psh,
      tariffRate
    },
    energy: {
      monthlyKwh: Number(monthlyKwh.toFixed(2)),
      daylightMonthlyKwh: Number(daylightMonthlyKwh.toFixed(2)),
      monthlySolarGenKwh,
      yearlySolarGenKwh,
      solarConsumedKwhMonthly: Number(solarConsumedKwhMonthly.toFixed(2)),
      selfConsumptionPercent
    },
    costBasis: {
      costPerWp,
      rawCapex,
      capexPpn,
      totalCapex
    },
    activeScheme: currentScheme,
    schemes,
    environmental: {
      co2ReductionYearlyKg,
      treesEquivalent
    }
  };
}
