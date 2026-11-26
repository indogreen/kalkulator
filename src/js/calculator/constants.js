/**
 * PT. Indogreen Technology And Management
 * Solar Energy Calculator - Core Engineering Constants
 * 
 * Sources & Regulations:
 * - Permen ESDM No. 2/2024: Rekening Minimum PLN (40 * kVA * Tarif/kWh)
 * - Tabel Tarif Tenaga Listrik (TTL) ESDM 2026
 * - Jam Matahari Puncak (PSH) 9 Wilayah Radiasi Indonesia
 * - Spesifikasi Modul Tier-1 600 Wp & Baterai LiFePO4
 */

// 1. Wilayah Radiasi PSH (Peak Sun Hours) Indonesia - 9 Zona Utama
export const REGIONS_PSH = Object.freeze({
  dki_jabar_banten: {
    id: 'dki_jabar_banten',
    label: 'DKI Jakarta, Jawa Barat & Banten',
    psh: 4.4,
    description: 'Wilayah barat Jawa dengan rata-rata radiasi 4.4 jam puncak/hari'
  },
  jateng_diy: {
    id: 'jateng_diy',
    label: 'Jawa Tengah & D.I. Yogyakarta',
    psh: 4.6,
    description: 'Wilayah tengah Jawa dengan rata-rata radiasi 4.6 jam puncak/hari'
  },
  jatim: {
    id: 'jatim',
    label: 'Jawa Timur',
    psh: 4.8,
    description: 'Wilayah timur Jawa dengan potensi insolasi tinggi 4.8 jam puncak/hari'
  },
  sumatera: {
    id: 'sumatera',
    label: 'Sumatera',
    psh: 4.3,
    description: 'Wilayah pulau Sumatera dengan rata-rata radiasi 4.3 jam puncak/hari'
  },
  kalimantan: {
    id: 'kalimantan',
    label: 'Kalimantan',
    psh: 4.4,
    description: 'Wilayah pulau Kalimantan dengan rata-rata radiasi 4.4 jam puncak/hari'
  },
  sulawesi: {
    id: 'sulawesi',
    label: 'Sulawesi',
    psh: 4.9,
    description: 'Wilayah pulau Sulawesi dengan potensi surya tinggi 4.9 jam puncak/hari'
  },
  bali_ntb: {
    id: 'bali_ntb',
    label: 'Bali & Nusa Tenggara Barat',
    psh: 5.1,
    description: 'Wilayah Bali & NTB dengan insolasi sangat baik 5.1 jam puncak/hari'
  },
  ntt: {
    id: 'ntt',
    label: 'Nusa Tenggara Timur (NTT)',
    psh: 5.4,
    description: 'Wilayah dengan radiasi matahari tertinggi di Indonesia (5.4 jam/hari)'
  },
  maluku_papua: {
    id: 'maluku_papua',
    label: 'Maluku & Papua',
    psh: 4.7,
    description: 'Wilayah Indonesia Timur dengan rata-rata radiasi 4.7 jam puncak/hari'
  }
});

// 2. Tabel Tarif Listrik PLN 2026 (Permen ESDM)
export const PLN_TARIFFS_2026 = Object.freeze({
  'R-1/900': {
    code: 'R-1/900',
    group: 'residential',
    name: 'R-1/TR (900 VA RTM)',
    rate: 1352.00,
    minVa: 0,
    maxVa: 900
  },
  'R-1/1300': {
    code: 'R-1/1300',
    group: 'residential',
    name: 'R-1/TR (1.300 VA)',
    rate: 1444.70,
    minVa: 901,
    maxVa: 1300
  },
  'R-1/2200': {
    code: 'R-1/2200',
    group: 'residential',
    name: 'R-1/TR (2.200 VA)',
    rate: 1444.70,
    minVa: 1301,
    maxVa: 2200
  },
  'R-2': {
    code: 'R-2',
    group: 'residential',
    name: 'R-2/TR (3.500 - 5.500 VA)',
    rate: 1699.53,
    minVa: 2201,
    maxVa: 5500
  },
  'R-3': {
    code: 'R-3',
    group: 'residential',
    name: 'R-3/TR (6.600 VA ke atas)',
    rate: 1699.53,
    minVa: 5501,
    maxVa: Infinity
  },
  'B-2': {
    code: 'B-2',
    group: 'commercial',
    name: 'B-2/TR Bisnis Menengah (6.600 VA - 200 kVA)',
    rate: 1444.70,
    minVa: 6600,
    maxVa: 200000
  },
  'B-3': {
    code: 'B-3',
    group: 'commercial',
    name: 'B-3/TM Bisnis Besar (> 200 kVA)',
    rate: 1035.78,
    minVa: 200001,
    maxVa: Infinity
  },
  'I-3': {
    code: 'I-3',
    group: 'industrial',
    name: 'I-3/TM Industri Menengah (> 200 kVA)',
    rate: 1035.78,
    minVa: 200001,
    maxVa: Infinity
  },
  'I-4': {
    code: 'I-4',
    group: 'industrial',
    name: 'I-4/TT Industri Besar (>= 30.000 kVA)',
    rate: 996.74,
    minVa: 30000000,
    maxVa: Infinity
  },
  'P-1': {
    code: 'P-1',
    group: 'government',
    name: 'P-1/TR Kantor Pemerintah (6.600 VA - 200 kVA)',
    rate: 1699.53,
    minVa: 6600,
    maxVa: 200000
  },
  'P-2': {
    code: 'P-2',
    group: 'government',
    name: 'P-2/TM Kantor Pemerintah (> 200 kVA)',
    rate: 1415.01,
    minVa: 200001,
    maxVa: Infinity
  },
  'P-3': {
    code: 'P-3',
    group: 'public_lighting',
    name: 'P-3/TR Penerangan Jalan Umum',
    rate: 1699.53,
    minVa: 0,
    maxVa: Infinity
  }
});

// 3. Spesifikasi Teknis & Parameter Rekayasa
export const TECHNICAL_SPECS = Object.freeze({
  MODULE_WP: 600, // Modul Tier-1 Monocrystalline Bifacial 600 Wp
  MODULE_KWP: 0.60,
  PERFORMANCE_RATIO: 0.80, // PR 80% (derating suhu tropis, kabel, inverter, debu)
  CO2_FACTOR: 0.87, // 0.87 kg CO2 / kWh energi surya
  TREES_PER_KG_CO2: 1 / 21.77, // Rata-rata 1 pohon menyerap 21.77 kg CO2/tahun
  ROOF_SPACE_RESIDENTIAL: 6.0, // 6.0 m² per kWp untuk atap genteng perumahan
  ROOF_SPACE_COMMERCIAL: 5.5, // 5.5 m² per kWp untuk atap seng/spandek industri
  MODULE_DEGRADATION_ANNUAL: 0.005, // 0.5% degradasi efisiensi per tahun
  DAYS_PER_MONTH: 30, // Standar konvensi industri 30 hari/bulan
  DAYS_PER_YEAR: 365,
  PPN_RATE: 0.11, // PPN 11% Indonesia
  PLN_MIN_HOURS: 40, // 40 jam nyala sesuai Permen ESDM No. 2/2024
  PROJECTION_YEARS: 25 // Horizon proyeksi masa pakai modul 25 tahun
});

// 4. Pola Aktivitas Siang Hari (Residensial)
export const DAYTIME_ACTIVITY_PATTERNS = Object.freeze({
  low: {
    id: 'low',
    ratio: 0.25,
    label: 'Rendah (25%)',
    description: 'Rumah kosong di siang hari (pekerja kantoran / sekolah)'
  },
  medium: {
    id: 'medium',
    ratio: 0.35,
    label: 'Sedang (35%)',
    description: 'Sebagian anggota keluarga di rumah (standar rumah tangga)'
  },
  high: {
    id: 'high',
    ratio: 0.50,
    label: 'Tinggi (50%)',
    description: 'Aktivitas tinggi di siang hari (WFH, balita/lansia, AC aktif)'
  }
});

// 5. Opsi Baterai Hybrid LiFePO4 (Residensial)
export const BATTERY_HYBRID_OPTIONS = Object.freeze({
  none: {
    id: 'none',
    capacityKwh: 0,
    usableKwh: 0,
    cost: 0,
    label: 'Tanpa Baterai (On-Grid Murni)',
    description: 'Sistem on-grid langsung tanpa cadangan baterai'
  },
  hybrid_5: {
    id: 'hybrid_5',
    capacityKwh: 5.12,
    usableKwh: 5.12 * 0.90, // 4.608 kWh (90% DoD)
    cost: 12000000, // Rp 12.000.000 (LiFePO4 51.2V 100Ah unit)
    label: 'Hybrid LiFePO4 5.12 kWh',
    description: 'Modul baterai LiFePO4 5.12 kWh dengan 90% DoD untuk cadangan padam'
  },
  hybrid_10: {
    id: 'hybrid_10',
    capacityKwh: 10.24,
    usableKwh: 10.24 * 0.90, // 9.216 kWh (90% DoD)
    cost: 23000000, // Rp 23.000.000 (2x modul 5.12 kWh atau 51.2V 200Ah)
    label: 'Hybrid LiFePO4 10.24 kWh',
    description: 'Modul baterai LiFePO4 10.24 kWh kapasitas ganda untuk otonomi lebih panjang'
  }
});

// 6. Profil Jam Beban Komersial & Industri
export const COMMERCIAL_OPERATIONAL_HOURS = Object.freeze({
  office: {
    id: 'office',
    daytimeFraction: 0.75,
    label: 'Kantor (08:00 - 17:00)',
    description: 'Beban dominan siang hari, sinkronisasi 75% dengan radiasi surya'
  },
  shift_1: {
    id: 'shift_1',
    daytimeFraction: 0.65,
    label: '1-Shift Pabrik (07:00 - 15:00)',
    description: 'Operasional satu shift pagi-sore, sinkronisasi 65% dengan radiasi surya'
  },
  shift_2: {
    id: 'shift_2',
    daytimeFraction: 0.45,
    label: '2-Shift Pabrik (07:00 - 23:00)',
    description: 'Operasional dua shift, sinkronisasi 45% dengan radiasi surya'
  },
  continuous_24h: {
    id: 'continuous_24h',
    daytimeFraction: 0.35,
    label: '24 Jam Non-Stop',
    description: 'Operasional kontinu 24/7, sinkronisasi 35% dengan radiasi surya'
  }
});

// 7. Parameter 3 Skema Finansial Bisnis & Industri
export const COMMERCIAL_SCHEMES = Object.freeze({
  capex: {
    id: 'capex',
    name: 'CAPEX Beli Putus',
    description: 'Investasi turnkey penuh di awal, 100% penghematan dinikmati pemilik, hak milik hari ke-1',
    ppaDiscount: 0,
    omPercentAnnual: 0.01, // 1% dari CAPEX per tahun
    leaseTenorYears: 0
  },
  opex_ppa: {
    id: 'opex_ppa',
    name: 'OPEX PPA (Zero CAPEX)',
    description: 'Nol modal awal, diskon tarif 15% dari PLN, O&M ditanggung pengembang, kontrak 20 tahun',
    ppaDiscount: 0.15, // Diskon 15% dari tarif PLN
    omPercentAnnual: 0,
    contractYears: 20
  },
  opex_lease: {
    id: 'opex_lease',
    name: 'OPEX Sewa Operasional',
    description: 'Nol modal awal, cicilan sewa bulanan tetap tenor 7 tahun, hak milik berpindah setelah tenor selesai',
    ppaDiscount: 0,
    omPercentAnnual: 0.01,
    leaseTenorYears: 7,
    monthlyLeaseRatePercent: 0.014 // 1.4% dari CAPEX per bulan selama 7 tahun
  }
});

// 8. Parameter Khusus BESS (Baterai Anti-Padam)
export const BESS_SPECS = Object.freeze({
  BATTERY_DOD: 0.90, // 90% Depth of Discharge
  INVERTER_EFFICIENCY: 0.95, // 95% efisiensi PCS / inverter
  SAFETY_MARGIN_INVERTER: 1.25, // 1.25x faktor keamanan surge capacity
  STANDARD_PACK_KWH: 5.12, // Standar modul rak 5.12 kWh
  BATTERY_COST_PER_PACK: 16000000, // Rp 16.000.000 per modul 5.12 kWh + BMS
  INVERTER_COST_PER_KW: 4500000, // Rp 4.500.000 per kW inverter darurat/hybrid
  ATS_INSTALL_RESIDENTIAL: 5000000, // Rp 5.000.000 panel ATS + wiring
  ATS_INSTALL_COMMERCIAL: 12000000, // Rp 12.000.000 panel ATS kapasitas industri
  CYCLE_LIFE: 6000, // > 6.000 siklus
  WARRANTY_YEARS: 10
});

// 9. Parameter Khusus PJUTS
export const PJUTS_SPECS = Object.freeze({
  NIGHT_HOURS_DEFAULT: 12, // 18:00 - 06:00
  SMART_DIMMING_HOURS_FULL: 5, // 5 jam pertama 100%
  SMART_DIMMING_HOURS_HALF: 7, // 7 jam sisa 50%
  // Equivalent hours dengan smart dimming: (5 * 1.0) + (7 * 0.5) = 8.5 jam
  SMART_DIMMING_EQUIV_HOURS: 8.5,
  BATTERY_DOD: 0.90,
  LED_DRIVER_EFFICIENCY: 0.90,
  CHARGING_SAFETY_FACTOR: 1.30,
  NOMINAL_BATTERY_VOLTAGE: 12.8, // 12.8V LiFePO4
  P3_TARIFF_RATE: 1699.53, // Tarif P-3 PLN untuk Penerangan Jalan Umum
  // Estimasi biaya turnkey per tiang (Tiang Octagonal + LED + Panel + LiFePO4 + MPPT + Angkur)
  TIERS_COST_PER_POLE: [
    { maxWatt: 40, cost: 8500000 },
    { maxWatt: 80, cost: 11500000 },
    { maxWatt: 120, cost: 14500000 },
    { maxWatt: Infinity, cost: 18500000 }
  ]
});

// Helper Functions
/**
 * Mendapatkan Jam Matahari Puncak (PSH) berdasarkan kode wilayah
 * @param {string} regionKey
 * @returns {number} Nilai PSH (default 4.4 jika tidak ditemukan)
 */
export function getPsh(regionKey) {
  if (REGIONS_PSH[regionKey]) {
    return REGIONS_PSH[regionKey].psh;
  }
  return REGIONS_PSH.dki_jabar_banten.psh;
}

/**
 * Mendapatkan tarif listrik PLN residensial berdasarkan daya tersambung (VA)
 * @param {number} powerVa
 * @returns {number} Tarif per kWh (Rp)
 */
export function getResidentialTariff(powerVa) {
  const va = Number(powerVa) || 0;
  if (va <= 900) return PLN_TARIFFS_2026['R-1/900'].rate;
  if (va <= 1300) return PLN_TARIFFS_2026['R-1/1300'].rate;
  if (va <= 2200) return PLN_TARIFFS_2026['R-1/2200'].rate;
  if (va <= 5500) return PLN_TARIFFS_2026['R-2'].rate;
  return PLN_TARIFFS_2026['R-3'].rate;
}

/**
 * Mendapatkan tarif listrik PLN komersial/industri berdasarkan kode grup
 * @param {string} tariffCode
 * @returns {number} Tarif per kWh (Rp)
 */
export function getTariffByGroup(tariffCode) {
  if (PLN_TARIFFS_2026[tariffCode]) {
    return PLN_TARIFFS_2026[tariffCode].rate;
  }
  return PLN_TARIFFS_2026['B-2'].rate;
}

/**
 * Biaya acuan turnkey per Wp bergradasi kapasitas (Residensial)
 * @param {number} wattPeak
 * @returns {number} Biaya per Wp dalam Rupiah (sebelum PPN)
 */
export function getTurnkeyCostPerWp(wattPeak) {
  const wp = Math.max(0, Number(wattPeak) || 0);
  if (wp <= 3000) return 9500;
  if (wp <= 5000) return 9200;
  if (wp <= 10000) return 8800;
  if (wp <= 50000) return 8200;
  if (wp <= 250000) return 7500;
  return 6800;
}

/**
 * Biaya acuan turnkey per Wp untuk proyek Komersial & Industri
 * @param {number} wattPeak
 * @returns {number} Biaya per Wp dalam Rupiah (sebelum PPN)
 */
export function getCommercialTurnkeyCostPerWp(wattPeak) {
  const wp = Math.max(0, Number(wattPeak) || 0);
  if (wp <= 50000) return 8500;
  if (wp <= 250000) return 7800;
  if (wp <= 1000000) return 7200;
  return 6500;
}

/**
 * Mendapatkan biaya per tiang PJUTS berdasarkan watt lampu
 * @param {number} lampWattage
 * @returns {number} Biaya per tiang (Rp)
 */
export function getPjutsCostPerPole(lampWattage) {
  const watt = Math.max(0, Number(lampWattage) || 0);
  for (const tier of PJUTS_SPECS.TIERS_COST_PER_POLE) {
    if (watt <= tier.maxWatt) {
      return tier.cost;
    }
  }
  return 18500000;
}
