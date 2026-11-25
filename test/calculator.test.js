/**
 * Unit Test Suite: Core Calculation Engine
 * PT. Indogreen Technology And Management
 * 
 * Verifies:
 * 1. constants.js: PSH 9 regions, PLN 2026 tariffs, technical parameters & helpers
 * 2. residential.js: Permen ESDM 2/2024 min billing, self-consumption, LiFePO4 battery, 25-yr projection
 * 3. commercial.js: Operational shift curves, 3 financial schemes (CAPEX, OPEX PPA, OPEX Lease)
 * 4. battery.js: LiFePO4 BESS sizing (90% DoD, 95% efficiency, 1.25x inverter surge margin)
 * 5. pjuts.js: Smart dimming 30% savings, autonomy 1-3 days, avoided cost PLN P-3
 * 6. Edge cases: Zero inputs, extreme values, divide-by-zero protection (no NaN/Infinity)
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  REGIONS_PSH,
  PLN_TARIFFS_2026,
  TECHNICAL_SPECS,
  DAYTIME_ACTIVITY_PATTERNS,
  BATTERY_HYBRID_OPTIONS,
  COMMERCIAL_OPERATIONAL_HOURS,
  COMMERCIAL_SCHEMES,
  BESS_SPECS,
  PJUTS_SPECS,
  getPsh,
  getResidentialTariff,
  getTariffByGroup,
  getTurnkeyCostPerWp,
  getCommercialTurnkeyCostPerWp,
  getPjutsCostPerPole
} from '../src/js/calculator/constants.js';

import { calculateResidential } from '../src/js/calculator/residential.js';
import { calculateCommercial } from '../src/js/calculator/commercial.js';
import { calculateBattery } from '../src/js/calculator/battery.js';
import { calculatePjuts } from '../src/js/calculator/pjuts.js';

// ============================================================================
// 1. CONSTANTS & HELPER FUNCTIONS TEST
// ============================================================================
describe('Core Constants & Helper Functions', () => {
  test('PSH 9 Wilayah Radiasi Indonesia', () => {
    const expectedRegions = [
      'dki_jabar_banten', 'jateng_diy', 'jatim', 'sumatera',
      'kalimantan', 'sulawesi', 'bali_ntb', 'ntt', 'maluku_papua'
    ];

    expectedRegions.forEach(regionId => {
      assert.ok(REGIONS_PSH[regionId], `Region ${regionId} must exist`);
      assert.ok(typeof REGIONS_PSH[regionId].psh === 'number', `PSH of ${regionId} must be a number`);
      assert.ok(REGIONS_PSH[regionId].psh >= 4.0 && REGIONS_PSH[regionId].psh <= 6.0, `PSH of ${regionId} must be in realistic range`);
    });

    // Validasi PSH spesifik dari spesifikasi
    assert.equal(REGIONS_PSH.dki_jabar_banten.psh, 4.4);
    assert.equal(REGIONS_PSH.jateng_diy.psh, 4.6);
    assert.equal(REGIONS_PSH.jatim.psh, 4.8);
    assert.equal(REGIONS_PSH.sumatera.psh, 4.3);
    assert.equal(REGIONS_PSH.kalimantan.psh, 4.4);
    assert.equal(REGIONS_PSH.sulawesi.psh, 4.9);
    assert.equal(REGIONS_PSH.bali_ntb.psh, 5.1);
    assert.equal(REGIONS_PSH.ntt.psh, 5.4);
    assert.equal(REGIONS_PSH.maluku_papua.psh, 4.7);

    // Fallback helper getPsh
    assert.equal(getPsh('dki_jabar_banten'), 4.4);
    assert.equal(getPsh('invalid_region'), 4.4);
  });

  test('Tabel Tarif Listrik PLN 2026', () => {
    assert.equal(PLN_TARIFFS_2026['R-1/900'].rate, 1352.00);
    assert.equal(PLN_TARIFFS_2026['R-1/1300'].rate, 1444.70);
    assert.equal(PLN_TARIFFS_2026['R-1/2200'].rate, 1444.70);
    assert.equal(PLN_TARIFFS_2026['R-2'].rate, 1699.53);
    assert.equal(PLN_TARIFFS_2026['R-3'].rate, 1699.53);
    assert.equal(PLN_TARIFFS_2026['B-2'].rate, 1444.70);
    assert.equal(PLN_TARIFFS_2026['B-3'].rate, 1114.74);
    assert.equal(PLN_TARIFFS_2026['I-3'].rate, 1114.74);
    assert.equal(PLN_TARIFFS_2026['I-4'].rate, 996.74);
    assert.equal(PLN_TARIFFS_2026['P-1'].rate, 1699.53);
    assert.equal(PLN_TARIFFS_2026['P-3'].rate, 1699.53);

    // Helper getResidentialTariff
    assert.equal(getResidentialTariff(900), 1352.00);
    assert.equal(getResidentialTariff(1300), 1444.70);
    assert.equal(getResidentialTariff(2200), 1444.70);
    assert.equal(getResidentialTariff(3500), 1699.53);
    assert.equal(getResidentialTariff(5500), 1699.53);
    assert.equal(getResidentialTariff(6600), 1699.53);

    // Helper getTariffByGroup
    assert.equal(getTariffByGroup('B-2'), 1444.70);
    assert.equal(getTariffByGroup('I-3'), 1114.74);
    assert.equal(getTariffByGroup('unknown'), 1444.70);
  });

  test('Spesifikasi Teknis & Biaya Turnkey Gradasi', () => {
    assert.equal(TECHNICAL_SPECS.MODULE_WP, 600);
    assert.equal(TECHNICAL_SPECS.PERFORMANCE_RATIO, 0.80);
    assert.equal(TECHNICAL_SPECS.CO2_FACTOR, 0.87);
    assert.equal(TECHNICAL_SPECS.PLN_MIN_HOURS, 40);
    assert.equal(TECHNICAL_SPECS.PPN_RATE, 0.11);

    // Turnkey cost per Wp gradasi residensial
    assert.equal(getTurnkeyCostPerWp(2400), 9500);
    assert.equal(getTurnkeyCostPerWp(4500), 9200);
    assert.equal(getTurnkeyCostPerWp(8000), 8800);
    assert.equal(getTurnkeyCostPerWp(15000), 8200);
    assert.equal(getTurnkeyCostPerWp(0), 9500);

    // Commercial turnkey cost
    assert.equal(getCommercialTurnkeyCostPerWp(30000), 8500);
    assert.equal(getCommercialTurnkeyCostPerWp(100000), 7800);

    // PJUTS cost per pole
    assert.equal(getPjutsCostPerPole(30), 8500000);
    assert.equal(getPjutsCostPerPole(60), 11500000);
    assert.equal(getPjutsCostPerPole(100), 14500000);
    assert.equal(getPjutsCostPerPole(150), 18500000);
  });
});

// ============================================================================
// 2. RESIDENTIAL MODULE TEST
// ============================================================================
describe('Residential Solar Engine (residential.js)', () => {
  test('Kasus Standar Terkalibrasi: Rumah 2.200 VA, Rp 1.500.000 / bln, DKI Jakarta (PSH 4.4)', () => {
    const result = calculateResidential({
      powerVa: 2200,
      monthlyBill: 1500000,
      region: 'dki_jabar_banten',
      daytimeActivity: 'medium',
      batteryOption: 'hybrid_5'
    });

    // Validasi output struktur
    assert.equal(result.mode, 'residential');
    assert.equal(result.system.moduleCount, 4);
    assert.equal(result.system.systemKwp, 2.40);
    assert.equal(result.system.batteryCapacityKwh, 5.12);

    // Validasi proteksi Rekening Minimum PLN Permen ESDM 2/2024:
    // 40 jam * 2.2 kVA * 1444.70 = Rp 127.134
    assert.equal(result.billing.minimumBill, 127134);
    assert.ok(result.billing.newMonthlyBill >= result.billing.minimumBill);

    // Validasi penghematan bulanan masuk akal
    assert.ok(result.billing.monthlySavings > 0);
    assert.ok(result.billing.savingsPercent > 20 && result.billing.savingsPercent <= 50);

    // Validasi investasi turnkey + baterai 5.12 kWh + PPN 11%
    // PV 2400 Wp * 9500 = 22.800.000 + Baterai 12.000.000 = 34.800.000
    // Total + PPN 11% = 38.628.000
    assert.equal(result.financial.totalInvestment, 38628000);

    // Payback period realistis (4-10 tahun tergantung baterai)
    assert.ok(result.financial.paybackYears >= 4.0 && result.financial.paybackYears <= 10.0);

    // Proyeksi 25 tahun terisi lengkap
    assert.equal(result.financial.yearlyProjection.length, 25);
    assert.ok(result.financial.cumulativeSavings25Years > result.financial.totalInvestment);
    assert.ok(result.financial.netProfit25Years > 0);

    // Dampak lingkungan
    assert.ok(result.environmental.co2ReductionYearlyKg > 0);
    assert.ok(result.environmental.treesEquivalent > 0);

    // Baterai cadangan padam
    assert.equal(result.backup.hasBattery, true);
    assert.ok(result.backup.backupHours > 0);
  });

  test('Proteksi Mutlak Rekening Minimum PLN Permen ESDM No. 2/2024', () => {
    // Skenario: Tagihan sangat kecil tapi daya besar (misal 5.500 VA, tagihan Rp 400.000)
    // Minimum bill = 40 * 5.5 * 1699.53 = Rp 373.897
    const result = calculateResidential({
      powerVa: 5500,
      monthlyBill: 400000,
      region: 'dki_jabar_banten'
    });

    assert.equal(result.billing.minimumBill, 373897);
    assert.ok(result.billing.newMonthlyBill >= result.billing.minimumBill);
    // Tagihan setelah PLTS tidak boleh turun di bawah Rp 373.897
    assert.ok(result.billing.newMonthlyBill >= 373897);
  });

  test('Edge Case: Input Nol dan Tidak Lengkap', () => {
    const resultZero = calculateResidential({
      powerVa: 0,
      monthlyBill: 0
    });

    assert.equal(resultZero.billing.oldMonthlyBill, 0);
    assert.equal(resultZero.billing.monthlySavings, 0);
    assert.equal(resultZero.financial.paybackYears, 0);
    // Tidak boleh menghasilkan NaN atau Infinity
    assert.ok(!isNaN(resultZero.financial.totalInvestment));
    assert.ok(isFinite(resultZero.financial.paybackYears));
    assert.ok(isFinite(resultZero.energy.monthlySolarGenKwh));
  });

  test('Batas Luas Atap (Roof Area Constraint)', () => {
    // Jika atap sangat kecil (misal 10 m²), kapasitas modul harus dibatasi
    // 10 m² / 6.0 m²/kWp = 1.67 kWp -> max 2 modul (1.2 kWp)
    const result = calculateResidential({
      powerVa: 4400,
      monthlyBill: 3000000,
      roofArea: 10
    });

    assert.equal(result.system.moduleCount, 2);
    assert.equal(result.system.systemKwp, 1.20);
    assert.ok(result.system.roofAreaRequiredM2 <= 10);
  });

  test('Opsi Baterai: none vs hybrid_5 vs hybrid_10', () => {
    const resNone = calculateResidential({ powerVa: 2200, monthlyBill: 1500000, batteryOption: 'none' });
    const res5 = calculateResidential({ powerVa: 2200, monthlyBill: 1500000, batteryOption: 'hybrid_5' });
    const res10 = calculateResidential({ powerVa: 2200, monthlyBill: 1500000, batteryOption: 'hybrid_10' });

    assert.equal(resNone.backup.hasBattery, false);
    assert.equal(resNone.backup.backupHours, 0);

    assert.equal(res5.backup.hasBattery, true);
    assert.equal(res5.backup.batteryCapacityKwh, 5.12);

    assert.equal(res10.backup.hasBattery, true);
    assert.equal(res10.backup.batteryCapacityKwh, 10.24);
    assert.ok(res10.backup.backupHours > res5.backup.backupHours);
  });
});

// ============================================================================
// 3. COMMERCIAL & INDUSTRIAL MODULE TEST
// ============================================================================
describe('Commercial & Industrial Solar Engine (commercial.js)', () => {
  test('Kasus Bisnis Menengah: Tarif B-2, Rp 50.000.000 / bln, Jam Operasional Kantor 08-17', () => {
    const result = calculateCommercial({
      tariffGroup: 'B-2',
      monthlyBill: 50000000,
      operationalHours: 'office',
      region: 'dki_jabar_banten',
      activeScheme: 'capex'
    });

    assert.equal(result.mode, 'commercial');
    assert.ok(result.system.systemKwp >= 10);
    assert.equal(result.system.tariffRate, 1444.70);

    // Memastikan 3 skema finansial tergenerasi
    assert.ok(result.schemes.capex, 'Skema CAPEX harus ada');
    assert.ok(result.schemes.opex_ppa, 'Skema OPEX PPA harus ada');
    assert.ok(result.schemes.opex_lease, 'Skema OPEX Sewa harus ada');

    // 1. CAPEX
    assert.ok(result.schemes.capex.initialInvestment > 0);
    assert.ok(result.schemes.capex.annualOmCost > 0);
    assert.ok(result.schemes.capex.paybackYears >= 3.5 && result.schemes.capex.paybackYears <= 7.0);
    assert.equal(result.schemes.capex.ownershipDay1, true);

    // 2. OPEX PPA
    assert.equal(result.schemes.opex_ppa.initialInvestment, 0);
    assert.equal(result.schemes.opex_ppa.annualOmCost, 0);
    assert.equal(result.schemes.opex_ppa.tenorYears, 20);
    assert.ok(result.schemes.opex_ppa.monthlyNetSavings > 0);
    // Penghematan per kWh = 15% dari tarif PLN
    const expectedSavingsPerKwh = Number((1444.70 * 0.15).toFixed(2));
    assert.equal(result.schemes.opex_ppa.savingsPerKwh, expectedSavingsPerKwh);

    // 3. OPEX Sewa Operasional
    assert.equal(result.schemes.opex_lease.initialInvestment, 0);
    assert.equal(result.schemes.opex_lease.tenorYears, 7);
    assert.ok(result.schemes.opex_lease.monthlyLeasePayment > 0);
    assert.ok(result.schemes.opex_lease.cumulativeNet25Years > 0);

    // Dampak lingkungan
    assert.ok(result.environmental.co2ReductionYearlyKg > 0);
    assert.ok(result.environmental.treesEquivalent > 0);
  });

  test('Kasus Industri Menengah: Tarif I-3, Rp 200.000.000 / bln, Operasional 24 Jam', () => {
    const result = calculateCommercial({
      tariffGroup: 'I-3',
      monthlyBill: 200000000,
      operationalHours: 'continuous_24h',
      region: 'jatim'
    });

    assert.equal(result.system.tariffRate, 1114.74);
    assert.ok(result.system.systemKwp > 50);
    assert.ok(result.costBasis.totalCapex > 0);
  });

  test('Edge Case: Input Nol pada Komersial', () => {
    const result = calculateCommercial({
      monthlyBill: 0
    });

    assert.ok(!isNaN(result.costBasis.totalCapex));
    assert.ok(isFinite(result.schemes.capex.paybackYears));
  });
});

// ============================================================================
// 4. BATTERY / BESS MODULE TEST
// ============================================================================
describe('Battery Energy Storage System Engine (battery.js)', () => {
  test('Sizing BESS Standar: Beban Kritis 2 kW, Cadangan 4 Jam', () => {
    const result = calculateBattery({
      sector: 'residential',
      criticalLoadKw: 2.0,
      backupHours: 4,
      includeSolarCharger: false
    });

    assert.equal(result.mode, 'battery');
    // Kebutuhan energi = 2 kW * 4 jam = 8 kWh
    // Nominal = 8 / (0.90 * 0.95) = 9.356 kWh -> butuh 2 pack x 5.12 kWh = 10.24 kWh
    assert.equal(result.battery.batteryPacks, 2);
    assert.equal(result.battery.installedCapacityKwh, 10.24);
    assert.ok(result.battery.actualBackupHours >= 4.0);

    // Sizing Inverter dengan safety margin 1.25x
    // 2.0 kW * 1.25 = 2.50 kW
    assert.equal(result.inverter.recommendedInverterKw, 2.50);

    // Biaya finansial
    assert.equal(result.financial.batteryCost, 2 * BESS_SPECS.BATTERY_COST_PER_PACK);
    assert.ok(result.financial.totalInvestment > 0);
    assert.equal(result.solarCharger.enabled, false);
  });

  test('Sizing BESS dengan Integrasi Solar PV Charger', () => {
    const result = calculateBattery({
      sector: 'commercial',
      criticalLoadKw: 10.0,
      backupHours: 4,
      includeSolarCharger: true,
      region: 'dki_jabar_banten'
    });

    assert.equal(result.solarCharger.enabled, true);
    assert.ok(result.solarCharger.installedKwp > 0);
    assert.ok(result.solarCharger.moduleCount > 0);
    assert.ok(result.solarCharger.dailySolarGenKwh > 0);
    assert.ok(result.financial.solarPvCost > 0);
  });

  test('Edge Case: Beban Kritis Nol atau Durasi Nol', () => {
    const result = calculateBattery({
      criticalLoadKw: 0,
      backupHours: 0
    });

    assert.equal(result.battery.actualBackupHours, 0);
    assert.equal(result.inverter.recommendedInverterKw, 0);
    assert.ok(!isNaN(result.financial.totalInvestment));
  });
});

// ============================================================================
// 5. PJUTS MODULE TEST
// ============================================================================
describe('Public Solar Street Lighting Engine (pjuts.js)', () => {
  test('Kasus Standar: 10 Tiang PJUTS LED 60W, Smart Dimming Aktif, 2 Hari Otonomi', () => {
    const result = calculatePjuts({
      poleCount: 10,
      lampWattage: 60,
      nightHours: 12,
      smartDimming: true,
      autonomyDays: 2,
      region: 'dki_jabar_banten'
    });

    assert.equal(result.mode, 'pjuts');
    assert.equal(result.totalSystem.poleCount, 10);
    assert.equal(result.totalSystem.smartDimmingActive, true);

    // Smart Dimming (8.5 jam ekuivalen vs 12 jam) menghemat ~29.2% energi
    assert.equal(result.systemPerPole.effectiveOperatingHours, 8.5);
    assert.equal(result.totalSystem.energySavedPercent, 29.2);

    // Wh per tiang = 60W * 8.5 jam = 510 Wh/hari
    assert.equal(result.systemPerPole.dailyWh, 510);

    // Sizing baterai per tiang (2 hari otonomi, DoD 90%, Driver Eff 90%)
    // (510 * 2) / (0.90 * 0.90) = 1020 / 0.81 = 1259 Wh -> 98 Ah @ 12.8V
    assert.equal(result.systemPerPole.batteryAh, 98);

    // Avoided cost PLN Tarif P-3 (Rp 1.699,53/kWh)
    // 10 tiang * 60W * 12 jam * 365 hari / 1000 = 2628 kWh/tahun
    // 2628 * 1699.53 = Rp 4.466.365 / tahun
    assert.equal(result.savings.avoidedCostYearlyRp, 4466365);
    assert.ok(result.savings.avoidedCostMonthlyRp > 0);

    // Finansial & Payback
    assert.equal(result.financial.costPerPole, 11500000); // 60W tier
    assert.ok(result.financial.totalInvestment > 0);
    assert.ok(result.financial.paybackYears > 0);

    // Dampak lingkungan
    assert.ok(result.environmental.co2ReductionYearlyKg > 0);
    assert.ok(result.environmental.treesEquivalent > 0);
  });

  test('Perbandingan Smart Dimming ON vs OFF', () => {
    const withDimming = calculatePjuts({ poleCount: 5, lampWattage: 100, smartDimming: true });
    const withoutDimming = calculatePjuts({ poleCount: 5, lampWattage: 100, smartDimming: false });

    assert.ok(withDimming.systemPerPole.dailyWh < withoutDimming.systemPerPole.dailyWh);
    assert.ok(withDimming.systemPerPole.batteryWh < withoutDimming.systemPerPole.batteryWh);
    assert.ok(withDimming.systemPerPole.selectedPanelWp <= withoutDimming.systemPerPole.selectedPanelWp);
    assert.equal(withDimming.totalSystem.energySavedPercent, 29.2);
    assert.equal(withoutDimming.totalSystem.energySavedPercent, 0);
  });

  test('Edge Case: Jumlah Tiang Nol atau Daya Nol', () => {
    const result = calculatePjuts({ poleCount: 0, lampWattage: 0 });

    assert.equal(result.totalSystem.poleCount, 0);
    assert.equal(result.systemPerPole.dailyWh, 0);
    assert.equal(result.systemPerPole.batteryAh, 0);
    assert.equal(result.financial.totalInvestment, 0);
    assert.equal(result.savings.avoidedCostYearlyRp, 0);
    assert.ok(!isNaN(result.financial.totalInvestment));
  });
});
