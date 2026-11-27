/**
 * PT. Indogreen Technology And Management
 * Component: Hero Result Card (heroCard.js)
 * 
 * High-impact CAD black (#000000) canvas card showcasing:
 * - Eyebrow mode-specific badge & status
 * - Large headline display-xl in INDOGREEN Green (#00b100)
 * - Mode-calibrated subtext with legal notes
 * - 4-item technical specification strip (kWp, modules, battery, roof area)
 */

import { formatRupiah, formatKwp, formatPercent, formatNumber } from '../../utils/formatter.js';

/**
 * Generate HTML string for Hero Result Card based on active simulator mode
 * @param {Object} params
 * @param {string} params.mode - Active mode: 'hybrid' | 'residential' | 'commercial' | 'battery' | 'pjuts'
 * @param {Object} params.input - User input parameters
 * @param {Object} params.result - Calculated results object from calculation engine
 * @returns {string} Semantic HTML string
 */
export function getHeroCardHtml({ mode, input, result }) {
  if (!result) return '';

  let eyebrow = 'ESTIMASI PENGHEMATAN BULANAN';
  let badgeText = 'HASIL INSTAN';
  let mainValueHtml = '';
  let subtextHtml = '';
  let specs = [];

  if (mode === 'hybrid') {
    const pvKwp = result.pv?.kapasitasPvKwp || 0;
    const jumlahPanel = result.pv?.jumlahPanel || 0;
    const panelWp = result.pv?.panelWp || 615;
    const luasAtap = result.pv?.luasAtapM2 || 0;
    const panelWidthM = result.pv?.panelWidthM || 1.2;
    const panelLengthM = result.pv?.panelLengthM || 2.4;
    const inverterKw = result.inverter?.kapasitasInverterKw || 0;
    const inverterW = result.inverter?.kapasitasInverterW || 0;
    const batteryKwh = result.battery?.kapasitasBatteryKwh || 0;
    const jumlahModul = result.battery?.jumlahModulBattery || 0;
    const batteryUnitKwh = result.battery?.batteryModuleKwh || 5;
    const batteryFormula = result.battery?.batteryFormula || `${batteryKwh}`;
    const batteryDesc = result.battery?.batteryDesc
      || (jumlahModul > 1 ? `${jumlahModul} Unit (${batteryFormula})` : `1 Unit @ ${batteryUnitKwh} kWh`);
    const persenCover = result.inputs?.persenCover ?? 100;
    const persenSiang = result.inputs?.persenSiang ?? 40;
    const persenMalam = result.inputs?.persenMalam ?? 60;
    const targetKwhHari = result.energy?.targetKwhHari || 0;

    eyebrow = 'REKOMENDASI KAPASITAS PLTS HYBRID-OFFGRID';
    badgeText = `${persenCover}% dari PLTS`;

    mainValueHtml = `
      <div class="type-display-xl font-bold text-primary flex flex-wrap items-baseline gap-xs break-words tabular-nums">
        <span>${formatNumber(pvKwp, 2)} kWp</span>
        <span class="text-base tablet:text-lg text-on-dark-mute font-normal">${jumlahPanel} Panel @ ${panelWp} Wp</span>
      </div>
    `;

    subtextHtml = `
      Supply target <strong class="text-on-dark font-bold">${formatNumber(targetKwhHari, 2)} kWh/hari</strong> (${persenSiang}% siang / ${persenMalam}% malam) dicover ${persenCover}% dari PLTS dengan Hybrid Inverter <strong class="text-on-dark font-bold">${inverterKw} kW</strong>, Baterai <strong class="text-on-dark font-bold">${formatNumber(batteryKwh, 0)} kWh</strong> (${batteryDesc}), dan estimasi luas atap <strong class="text-on-dark font-bold">± ${formatNumber(luasAtap, 1)} m²</strong>.
    `;

    specs = [
      {
        label: '1. KAPASITAS PV',
        value: `${formatNumber(pvKwp, 2)} kWp`,
        sub: `${jumlahPanel} Panel @ ${panelWp} Wp`
      },
      {
        label: '2. KEBUTUHAN LUAS ATAP',
        value: `± ${formatNumber(luasAtap, 1)} m²`,
        sub: `${jumlahPanel} Panel (${panelWidthM}×${panelLengthM}m)`
      },
      {
        label: '3. INVERTER HYBRID',
        value: `${inverterKw} kW`,
        sub: `Off-Grid (${formatNumber(inverterW)} W)`
      },
      {
        label: '4. BATERAI LIFEPO4',
        value: `${formatNumber(batteryKwh, 0)} kWh`,
        sub: batteryDesc
      }
    ];
  } else if (mode === 'residential') {
    const savingsRp = result.billing?.monthlySavings || 0;
    const savingsPct = result.billing?.savingsPercent || 0;
    const isMinApplied = result.billing?.isMinimumBillApplied;

    eyebrow = 'ESTIMASI PENGHEMATAN BULANAN';
    badgeText = isMinApplied ? 'REKENING MIN. PLN' : 'SWAKONSUMSI OPTIMAL';
    
    mainValueHtml = `
      <div class="type-display-xl font-bold text-primary flex flex-wrap items-baseline gap-xs break-words tabular-nums">
        <span>${formatRupiah(savingsRp)}</span>
        <span class="text-base tablet:text-lg text-on-dark-mute font-normal">/ bulan</span>
      </div>
    `;

    subtextHtml = `
      Pemotongan <strong class="text-on-dark font-bold">~${formatPercent(savingsPct)}</strong> dari tagihan listrik awal dengan proteksi rekening minimum PLN.
    `;

    specs = [
      {
        label: 'KAPASITAS SURYA',
        value: formatKwp(result.system?.systemKwp || 0),
        sub: 'Tier-1 Modul'
      },
      {
        label: 'JUMLAH MODUL',
        value: `${result.system?.moduleCount || 0} Modul`,
        sub: '600 Wp Monofacial'
      },
      {
        label: 'BATERAI LIFEPO4',
        value: result.backup?.hasBattery ? `${result.backup.batteryCapacityKwh} kWh` : 'On-Grid (0 kWh)',
        sub: result.backup?.hasBattery ? `${result.backup.backupHours} Jam Cadangan` : 'Tanpa Baterai'
      },
      {
        label: 'LUAS ATAP MIN.',
        value: `${result.system?.roofAreaRequiredM2 || 0} m²`,
        sub: result.system?.hasRoofSurplus ? 'Memenuhi Atap' : 'Perlu Cek Area'
      }
    ];

  } else if (mode === 'commercial') {
    const activeScheme = result.activeScheme;
    const schemeName = activeScheme?.name || 'CAPEX Beli Putus';
    const monthlyNetSavings = activeScheme?.monthlyNetSavings || 0;

    eyebrow = `PENGHEMATAN BULANAN — ${schemeName.toUpperCase()}`;
    badgeText = activeScheme?.id === 'opex_ppa' ? 'ZERO CAPEX (Rp 0)' : 'SKEMA AKTIF';

    mainValueHtml = `
      <div class="type-display-xl font-bold text-primary flex flex-wrap items-baseline gap-xs break-words tabular-nums">
        <span>${formatRupiah(monthlyNetSavings)}</span>
        <span class="text-base tablet:text-lg text-on-dark-mute font-normal">/ bulan</span>
      </div>
    `;

    if (activeScheme?.id === 'opex_ppa') {
      subtextHtml = `Diskon langsung <strong class="text-on-dark font-bold">15%</strong> dari tarif listrik PLN per kWh tanpa belanja modal investasi di muka (Zero CAPEX).`;
    } else if (activeScheme?.id === 'opex_lease') {
      subtextHtml = `Penghematan bersih bulanan setelah cicilan sewa 7 tahun. Hak milik aset dialihkan penuh ke klien di tahun ke-8.`;
    } else {
      subtextHtml = `Penghematan bersih bulanan setelah estimasi biaya operasional dan perawatan (O&M) 1% per tahun dengan kepemilikan aset sejak hari pertama.`;
    }

    specs = [
      {
        label: 'KAPASITAS SURYA',
        value: formatKwp(result.system?.systemKwp || 0),
        sub: `Tarif ${result.inputs?.tariffGroup || 'B-2'}`
      },
      {
        label: 'JUMLAH MODUL',
        value: `${result.system?.moduleCount || 0} Modul`,
        sub: '600 Wp Tier-1'
      },
      {
        label: 'SKEMA PEMBIAYAAN',
        value: activeScheme?.id === 'capex' ? 'CAPEX Murni' : (activeScheme?.id === 'opex_ppa' ? 'PPA Diskon 15%' : 'Sewa 7 Tahun'),
        sub: activeScheme?.id === 'capex' ? `${activeScheme.paybackYears} Thn Payback` : 'Off-Balance Sheet'
      },
      {
        label: 'LUAS ATAP MIN.',
        value: `${result.system?.roofAreaRequiredM2 || 0} m²`,
        sub: 'Estimasi Panel'
      }
    ];

  } else if (mode === 'battery') {
    const actualHours = result.battery?.actualBackupHours || 0;
    const critLoad = result.inverter?.criticalLoadKw || 0;

    eyebrow = 'ESTIMASI DURASI CADANGAN ANTI-PADAM';
    badgeText = 'SEAMLESS UPS (<10MS)';

    mainValueHtml = `
      <div class="type-display-xl font-bold text-primary flex flex-wrap items-baseline gap-xs break-words tabular-nums">
        <span>${actualHours} Jam</span>
        <span class="text-base tablet:text-lg text-on-dark-mute font-normal">Cadangan Penuh</span>
      </div>
    `;

    subtextHtml = `
      Sistem BESS LiFePO4 siap memproteksi beban kritis sebesar <strong class="text-on-dark font-bold">${critLoad} kW</strong> secara otomatis saat pemadaman PLN tanpa kedip (transfer time < 10 ms).
    `;

    specs = [
      {
        label: 'KAPASITAS BATERAI',
        value: `${result.battery?.installedCapacityKwh || 0} kWh`,
        sub: `${result.battery?.batteryPacks || 0} Pack LiFePO4`
      },
      {
        label: 'INVERTER SURGE',
        value: `${result.inverter?.recommendedInverterKw || 0} kW`,
        sub: 'Safety Margin 1.25x'
      },
      {
        label: 'KEDALAMAN DOD',
        value: `${result.battery?.depthOfDischargePercent || 90}% DoD`,
        sub: '6.000 Siklus Operasi'
      },
      {
        label: 'SOLAR CHARGING',
        value: result.solarCharger?.enabled ? `${formatKwp(result.solarCharger.installedKwp)}` : 'Non-Solar (PLN Only)',
        sub: result.solarCharger?.enabled ? `${result.solarCharger.moduleCount} Modul 600Wp` : 'Pengisian Cepat Grid'
      }
    ];

  } else if (mode === 'pjuts') {
    const avoidedMonthly = result.financial?.avoidedCostMonthlyRp || result.savings?.avoidedCostMonthlyRp || 0;
    const poles = result.totalSystem?.poleCount || 0;

    eyebrow = 'PENGHEMATAN BIAYA LISTRIK SETARA TARIF P-3 PLN';
    badgeText = '100% OTONOM SURYA';

    mainValueHtml = `
      <div class="type-display-xl font-bold text-primary flex flex-wrap items-baseline gap-xs break-words tabular-nums">
        <span>${formatRupiah(avoidedMonthly)}</span>
        <span class="text-base tablet:text-lg text-on-dark-mute font-normal">/ bulan</span>
      </div>
    `;

    subtextHtml = `
      Penghematan biaya listrik (avoided cost) dari pengoperasian <strong class="text-on-dark font-bold">${poles} titik lampu jalan</strong> secara mandiri tanpa menarik kabel grid PLN.
    `;

    specs = [
      {
        label: 'TOTAL TIANG',
        value: `${poles} Titik Lampu`,
        sub: `${result.systemPerPole?.lampWattage || 0}W LED IP66`
      },
      {
        label: 'TOTAL SOLAR PV',
        value: formatKwp(result.totalSystem?.totalSolarKwp || 0),
        sub: `${result.systemPerPole?.panelWp || 0} Wp per Tiang`
      },
      {
        label: 'TOTAL BATERAI',
        value: `${result.totalSystem?.totalBatteryKwh || 0} kWh`,
        sub: `${result.inputs?.autonomyDays || 2} Hari Otonomi Hujan`
      },
      {
        label: 'SMART DIMMING',
        value: result.totalSystem?.smartDimmingActive ? 'Aktif (Otomatis)' : 'Mati (100% Fluks)',
        sub: result.totalSystem?.smartDimmingActive ? 'Hemat Daya 30%' : 'Konsumsi Konstan'
      }
    ];
  }

  return `
    <article class="relative bg-surface-dark text-on-dark border border-hairline-strong p-5 tablet:p-7 rounded-sm flex flex-col gap-5 select-none" aria-label="Ringkasan Estimasi Utama Hasil Simulasi">
      <!-- Header Strip: Eyebrow & Status Badge -->
      <div class="flex items-center justify-between border-b border-hairline-strong pb-3">
        <div class="flex flex-col gap-0.5">
          <span class="text-[21px] font-bold text-on-dark uppercase tracking-wider">
            HASIL SIMULASI
          </span>
          <span class="text-xs font-semibold text-accent-yellow uppercase tracking-wider">
            ${eyebrow}
          </span>
        </div>
        <span class="text-[11px] bg-surface-elevated text-primary border border-hairline-strong px-2 py-0.5 rounded-sm uppercase font-bold tracking-wider">
          ${badgeText}
        </span>
      </div>

      <!-- Main Headline Value -->
      <div class="flex flex-col gap-1.5">
        ${mainValueHtml}
        <p class="text-sm text-on-dark-mute leading-relaxed">
          ${subtextHtml}
        </p>
      </div>

      <!-- 4-Column Technical Specification Strip -->
      <div class="grid grid-cols-2 tablet:grid-cols-4 gap-2 tablet:gap-3 pt-3 border-t border-hairline-strong">
        ${specs.map(spec => `
          <div class="flex flex-col p-2.5 bg-surface-elevated rounded-sm border border-hairline-strong">
            <span class="text-[11px] text-on-dark-mute uppercase tracking-wide">${spec.label}</span>
            <span class="text-sm font-bold text-on-dark truncate mt-1 tabular-nums">${spec.value}</span>
            <span class="text-xs text-mute truncate mt-0.5">${spec.sub}</span>
          </div>
        `).join('')}
      </div>
    </article>
  `;
}

/**
 * Render Hero Result Card directly into a DOM container
 * @param {HTMLElement} container
 * @param {Object} data
 */
export function renderHeroCard(container, data) {
  if (!container) return;
  container.innerHTML = getHeroCardHtml(data);
}
