/**
 * PT. Indogreen Technology And Management
 * Utilities: WhatsApp Consultation Message & URL Generator
 * 
 * Official Engineering Sales Contact: +62 817-0092-221 (08170092221)
 */

import { formatRupiah, formatKwp, formatNumber, formatPercent } from './formatter.js';
import { REGIONS_PSH, PLN_TARIFFS_2026, COMMERCIAL_OPERATIONAL_HOURS, COMMERCIAL_SCHEMES } from '../calculator/constants.js';

export const OFFICIAL_WHATSAPP_NUMBER = '628170092221';
export const WHATSAPP_BASE_URL = 'https://wa.me/';

/**
 * Menghasilkan teks pesan konsultasi WhatsApp terstruktur untuk setiap mode simulasi
 * 
 * @param {string} mode - Mode simulasi ('residential', 'commercial', 'battery', 'pjuts')
 * @param {Object} input - Parameter input form pengguna
 * @param {Object} result - Hasil kalkulasi mesin energi
 * @returns {string} Teks pesan rapi berbahasa Indonesia
 */
export function generateWhatsAppMessage(mode, input = {}, result = {}) {
  const regionLabel = REGIONS_PSH[input.region]?.label || 'DKI Jakarta, Jabar & Banten';
  const psh = REGIONS_PSH[input.region]?.psh || 4.4;

  if (mode === 'hybrid') {
    const kategori = input.kategori || result.inputs?.kategori || 'Residential';
    const dayaLabel = result.inputs?.dayaLabel || input.dayaId || 'R-1/TR 1.300 VA';
    const monthlyBill = formatRupiah(input.biayaBulanan || result.inputs?.biayaBulanan || 1000000);
    const persenSiang = result.inputs?.persenSiang ?? input.persenSiang ?? 40;
    const persenMalam = result.inputs?.persenMalam ?? (100 - persenSiang);
    const persenCover = result.inputs?.persenCover ?? input.persenCover ?? 100;
    const targetKwhHari = `${formatNumber(result.energy?.targetKwhHari || 0, 2)} kWh/hari`;
    const pvKwp = `${formatNumber(result.pv?.kapasitasPvKwp || 0, 2)} kWp`;
    const jumlahPanel = result.pv?.jumlahPanel || 0;
    const panelWp = result.pv?.panelWp || 615;
    const luasAtap = formatNumber(result.pv?.luasAtapM2 || 0, 1);
    const panelDim = `${result.pv?.panelWidthM || 1.2}m × ${result.pv?.panelLengthM || 2.4}m`;
    const inverterKw = `${result.inverter?.kapasitasInverterKw || 0} kW`;
    const batteryKwh = `${formatNumber(result.battery?.kapasitasBatteryKwh || 0, 2)} kWh`;
    const jumlahBattery = result.battery?.jumlahModulBattery || 0;

    return [
      'Halo Tim Engineering PT. Indogreen Technology And Management,',
      'Saya ingin konsultasi teknis sistem PLTS Hybrid Off-Grid:',
      `- Kategori & Daya PLN: ${kategori} (${dayaLabel})`,
      `- Biaya Listrik Bulanan: ${monthlyBill} / bulan`,
      `- Proporsi Beban: Siang ${persenSiang}% / Malam ${persenMalam}%`,
      `- Target Dicover PLTS: ${persenCover}% (${targetKwhHari})`,
      `- Rekomendasi Kapasitas PV: ${pvKwp} (${jumlahPanel} Panel @ ${panelWp} Wp)`,
      `- Estimasi Kebutuhan Luas Atap: ± ${luasAtap} m² (Dimensi ${panelDim} per panel)`,
      `- Rekomendasi Hybrid Inverter: ${inverterKw}`,
      `- Rekomendasi Baterai LiFePO4: ${batteryKwh} (${jumlahBattery} Unit @ 5,12 kWh)`,
      '',
      'Mohon dapat dibantu survei lokasi dan penawaran harga resminya. Terima kasih.'
    ].join('\n');
  }

  if (mode === 'residential') {
    const powerVa = formatNumber(input.powerVa || result.inputs?.powerVa || 2200);
    const monthlyBill = formatRupiah(input.monthlyBill || result.inputs?.monthlyBill || 1500000);
    const kwp = formatKwp(result.system?.systemKwp || 2.40);
    const modules = result.system?.moduleCount || 4;
    const batteryOpt = result.system?.batteryCapacityKwh > 0
      ? `Hybrid LiFePO4 ${result.system.batteryCapacityKwh} kWh`
      : 'Tanpa Baterai (On-Grid Murni)';
    const savings = formatRupiah(result.billing?.monthlySavings || 0);
    const savingsPct = formatPercent(result.billing?.savingsPercent || 0);
    const investment = formatRupiah(result.financial?.totalInvestment || 0);

    return [
      'Halo Tim Engineering PT. Indogreen Technology And Management,',
      'Saya ingin konsultasi teknis sistem PLTS Atap Residensial:',
      `- Daya PLN: ${powerVa} VA`,
      `- Tagihan Bulanan: ${monthlyBill} / bulan`,
      `- Wilayah: ${regionLabel} (PSH ${psh})`,
      `- Rekomendasi Sistem: ${kwp} (${modules} Modul 600 Wp)`,
      `- Opsi Baterai: ${batteryOpt}`,
      `- Estimasi Penghematan: ${savings} / bulan (${savingsPct})`,
      `- Estimasi Investasi Turnkey: ${investment}`,
      '',
      'Mohon dapat dibantu survei lokasi dan penawaran teknis resminya. Terima kasih.'
    ].join('\n');
  }

  if (mode === 'commercial') {
    const tariffCode = input.tariffGroup || result.inputs?.tariffGroup || 'B-2';
    const tariffName = PLN_TARIFFS_2026[tariffCode]?.name || tariffCode;
    const monthlyBill = formatRupiah(input.monthlyBill || result.inputs?.monthlyBill || 50000000);
    const opHours = COMMERCIAL_OPERATIONAL_HOURS[input.operationalHours]?.label || 'Kantor (08:00 - 17:00)';
    const kwp = formatKwp(result.system?.systemKwp || 36.00);
    const modules = result.system?.moduleCount || 60;
    const roofArea = `${formatNumber(result.system?.roofAreaRequiredM2 || 0, 1)} m²`;
    const schemeId = input.activeScheme || result.inputs?.activeScheme || 'capex';
    const schemeName = COMMERCIAL_SCHEMES[schemeId]?.name || 'CAPEX Beli Putus';
    
    let schemeFinancial = '';
    if (schemeId === 'capex') {
      schemeFinancial = `- Estimasi Investasi Turnkey: ${formatRupiah(result.schemes?.capex?.initialInvestment || 0)}`;
    } else if (schemeId === 'opex_ppa') {
      schemeFinancial = `- Skema PPA: Diskon 15% dari Tarif PLN (Rp 0 Investasi Awal)`;
    } else {
      schemeFinancial = `- Biaya Sewa Bulanan: ${formatRupiah(result.schemes?.opex_lease?.monthlyLeasePayment || 0)} / bln (Tenor 7 Thn)`;
    }

    const netSavings = formatRupiah(result.activeScheme?.monthlyNetSavings || 0);

    return [
      'Halo Tim Engineering PT. Indogreen Technology And Management,',
      'Saya ingin konsultasi teknis sistem PLTS Bisnis & Industri:',
      `- Golongan Tarif: ${tariffName}`,
      `- Tagihan Bulanan: ${monthlyBill} / bulan`,
      `- Jam Operasional: ${opHours}`,
      `- Wilayah: ${regionLabel} (PSH ${psh})`,
      `- Rekomendasi Kapasitas: ${kwp} (${modules} Modul 600 Wp)`,
      `- Kebutuhan Luas Atap: ${roofArea}`,
      `- Skema Pilihan: ${schemeName}`,
      schemeFinancial,
      `- Estimasi Penghematan Bersih: ${netSavings} / bulan`,
      '',
      'Mohon dapat dibantu analisis kelayakan teknis dan proposal penawaran resminya. Terima kasih.'
    ].join('\n');
  }

  if (mode === 'battery') {
    const sector = (input.sector || result.inputs?.sector) === 'commercial' ? 'Bisnis & Industri' : 'Residensial';
    const criticalLoad = `${formatNumber(input.criticalLoadKw || result.inputs?.criticalLoadKw || 2.0, 2)} kW`;
    const backupHours = `${formatNumber(input.backupHours || result.inputs?.backupHours || 4)} Jam`;
    const batteryCapacity = `${formatNumber(result.battery?.installedCapacityKwh || 10.24, 2)} kWh (${result.battery?.batteryPacks || 2} Modul Rak)`;
    const inverter = `${formatNumber(result.inverter?.recommendedInverterKw || 2.5, 2)} kW (Waktu Alih < 10 ms)`;
    const solarCharging = (input.includeSolarCharger || result.inputs?.includeSolarCharger)
      ? `Ya (${formatKwp(result.solarCharger?.installedKwp || 0)})`
      : 'Tidak (Dapat diintegrasikan kemudian)';
    const investment = formatRupiah(result.financial?.totalInvestment || 0);

    return [
      'Halo Tim Engineering PT. Indogreen Technology And Management,',
      'Saya ingin konsultasi teknis sistem BESS (Baterai Cadangan Anti-Padam):',
      `- Sektor Kebutuhan: ${sector}`,
      `- Daya Beban Kritis: ${criticalLoad}`,
      `- Durasi Cadangan Padam: ${backupHours}`,
      `- Sizing Baterai: LiFePO4 ${batteryCapacity}`,
      `- Inverter Darurat / PCS: ${inverter}`,
      `- Integrasi Solar Charger: ${solarCharging}`,
      `- Estimasi Investasi Turnkey: ${investment}`,
      '',
      'Mohon dapat dibantu survei teknis dan penawaran resminya. Terima kasih.'
    ].join('\n');
  }

  if (mode === 'pjuts') {
    const poles = `${formatNumber(input.poleCount || result.inputs?.poleCount || 10)} Titik Tiang`;
    const wattage = `${formatNumber(input.lampWattage || result.inputs?.lampWattage || 60)} Watt`;
    const smartDimming = (input.smartDimming !== false && result.inputs?.smartDimming !== false)
      ? 'Aktif (Smart Dimming hemat ~29.2% energi)'
      : 'Nonaktif (100% daya sepanjang malam)';
    const autonomy = `${formatNumber(input.autonomyDays || result.inputs?.autonomyDays || 2)} Hari`;
    const totalSolar = formatKwp(result.totalSystem?.totalSolarKwp || 0);
    const totalBattery = `${formatNumber(result.totalSystem?.totalBatteryKwh || 0, 2)} kWh LiFePO4`;
    const avoidedGridCost = `${formatRupiah(result.savings?.avoidedCostYearlyRp || 0)} / tahun`;
    const investment = formatRupiah(result.financial?.totalInvestment || 0);

    return [
      'Halo Tim Engineering PT. Indogreen Technology And Management,',
      'Saya ingin konsultasi teknis proyek Penerangan Jalan Umum Tenaga Surya (PJUTS):',
      `- Jumlah Tiang: ${poles}`,
      `- Daya Lampu LED: ${wattage}`,
      `- Fitur Otomasi: ${smartDimming}`,
      `- Otonomi Cuaca Hujan: ${autonomy}`,
      `- Total Kapasitas Panel: ${totalSolar}`,
      `- Total Kapasitas Baterai: ${totalBattery}`,
      `- Penghematan Tagihan PLN P-3: ${avoidedGridCost}`,
      `- Estimasi Investasi Turnkey: ${investment}`,
      '',
      'Mohon dapat dibantu spesifikasi teknis dan Surat Penawaran Harga (SPH) resminya. Terima kasih.'
    ].join('\n');
  }

  // Fallback umum
  return [
    'Halo Tim Engineering PT. Indogreen Technology And Management,',
    'Saya ingin berkonsultasi mengenai solusi energi surya dan efisiensi energi untuk proyek saya.',
    'Mohon dapat dibantu informasi survei lokasi dan penawaran teknis resminya. Terima kasih.'
  ].join('\n');
}

/**
 * Menghasilkan URL lengkap WhatsApp klik-langsung
 * 
 * @param {string} mode - Mode kalkulator
 * @param {Object} input - Parameter input form
 * @param {Object} result - Hasil kalkulasi
 * @returns {string} URL WhatsApp ter-encode aman (https://wa.me/628139916890?text=...)
 */
export function generateWhatsAppUrl(mode, input = {}, result = {}) {
  const message = generateWhatsAppMessage(mode, input, result);
  return `${WHATSAPP_BASE_URL}${OFFICIAL_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
