/**
 * PT. Indogreen Technology And Management
 * Component: Hero Result Card (heroCard.js)
 * 
 * High-impact CAD black (#000000) canvas card showcasing:
 * - Signature ornamental corner square (12x12px green)
 * - Eyebrow mode-specific badge & status
 * - Large headline display-xl in INDOGREEN Green (#00b100)
 * - Mode-calibrated subtext with legal notes
 * - 4-item technical specification strip (kWp, modules, battery, roof area)
 */

import { formatRupiah, formatKwp, formatPercent } from '../../utils/formatter.js';

/**
 * Generate HTML string for Hero Result Card based on active simulator mode
 * @param {Object} params
 * @param {string} params.mode - Active mode: 'residential' | 'commercial' | 'battery' | 'pjuts'
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

  if (mode === 'residential') {
    const savingsRp = result.billing?.monthlySavings || 0;
    const savingsPct = result.billing?.savingsPercent || 0;
    const isMinApplied = result.billing?.isMinimumBillApplied;

    eyebrow = 'ESTIMASI PENGHEMATAN BULANAN';
    badgeText = isMinApplied ? 'REKENING MIN. PLN' : 'SWAKONSUMSI OPTIMAL';
    
    mainValueHtml = `
      <div class="type-display-xl font-bold text-primary flex flex-wrap items-baseline gap-xs">
        <span>${formatRupiah(savingsRp)}</span>
        <span class="type-heading-lg text-on-dark-mute font-normal">/ bulan</span>
      </div>
    `;

    subtextHtml = `
      Pemotongan <strong class="text-on-dark font-bold">~${formatPercent(savingsPct)}</strong> dari tagihan listrik awal. ${
        isMinApplied
          ? `<span class="text-accent-yellow font-bold">Batas rekening minimum PLN Permen ESDM No. 2/2024 aktif (${formatRupiah(result.billing.minimumBill)}/bln).</span>`
          : 'Maksimalisasi penghematan dengan proteksi rekening minimum PLN.'
      }
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
      <div class="type-display-xl font-bold text-primary flex flex-wrap items-baseline gap-xs">
        <span>${formatRupiah(monthlyNetSavings)}</span>
        <span class="type-heading-lg text-on-dark-mute font-normal">/ bulan</span>
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
      <div class="type-display-xl font-bold text-primary flex flex-wrap items-baseline gap-xs">
        <span>${actualHours} Jam</span>
        <span class="type-heading-lg text-on-dark-mute font-normal">Cadangan Penuh</span>
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
      <div class="type-display-xl font-bold text-primary flex flex-wrap items-baseline gap-xs">
        <span>${formatRupiah(avoidedMonthly)}</span>
        <span class="type-heading-lg text-on-dark-mute font-normal">/ bulan</span>
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
    <article class="relative bg-surface-dark text-on-dark border border-hairline-strong p-lg rounded-sm flex flex-col gap-md select-none" aria-label="Ringkasan Estimasi Utama Hasil Simulasi">
      <!-- Header Strip: Eyebrow & Status Badge -->
      <div class="flex items-center justify-between border-b border-hairline-strong pb-xs pt-xs">
        <span class="type-caption-sm text-accent-yellow font-bold uppercase tracking-wider">
          ${eyebrow}
        </span>
        <span class="type-caption-xs bg-surface-elevated text-primary border border-hairline-strong px-xs py-xxs rounded-sm uppercase font-bold tracking-wider">
          ${badgeText}
        </span>
      </div>

      <!-- Main Headline Value -->
      <div class="flex flex-col gap-xxs">
        ${mainValueHtml}
        <p class="type-body-sm text-on-dark-mute">
          ${subtextHtml}
        </p>
      </div>

      <!-- 4-Column Technical Specification Strip -->
      <div class="grid grid-cols-2 tablet:grid-cols-4 gap-xs pt-xs border-t border-hairline-strong">
        ${specs.map(spec => `
          <div class="flex flex-col p-xs bg-surface-elevated rounded-sm border border-hairline-strong">
            <span class="type-caption-xs text-on-dark-mute uppercase tracking-wide">${spec.label}</span>
            <span class="type-caption-md font-bold text-on-dark truncate mt-xxs">${spec.value}</span>
            <span class="type-caption-xs text-mute truncate">${spec.sub}</span>
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
