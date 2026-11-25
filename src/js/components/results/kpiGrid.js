/**
 * PT. Indogreen Technology And Management
 * Component: KPI Metric Grid (kpiGrid.js)
 * 
 * 4-Card Precision Metric Grid:
 * 1. Total Turnkey Investment + VAT 11% (Rp)
 * 2. Bill Reduction / Efficiency Percentage (%)
 * 3. Payback Period (Years) or Backup Duration (Hours)
 * 4. Carbon CO2 Emission Reduction (kg/year) & Trees Equivalent
 */

import { formatRupiah, formatNumber, formatPercent } from '../../utils/formatter.js';

/**
 * Generate HTML string for KPI Metric Grid
 * @param {Object} params
 * @param {string} params.mode - Active simulator mode: 'residential' | 'commercial' | 'battery' | 'pjuts'
 * @param {Object} params.input - User inputs
 * @param {Object} params.result - Calculation result
 * @returns {string} HTML string of 4 KPI cards
 */
export function getKpiGridHtml({ mode, input, result }) {
  if (!result) return '';

  let kpi1 = { title: 'TOTAL INVESTASI', value: 'Rp 0', sub: 'Turnkey + PPN 11%', isHighlight: false };
  let kpi2 = { title: '% HEMAT LISTRIK', value: '0.0%', sub: 'Per bulan dari PLN', isHighlight: true };
  let kpi3 = { title: 'PAYBACK PERIOD', value: '0 Tahun', sub: 'Titik Impas (ROI)', isHighlight: false };
  let kpi4 = { title: 'REDUKSI CO₂', value: '0 kg', sub: '0 pohon / tahun', isHighlight: false };

  if (mode === 'residential') {
    const totalInv = result.financial?.totalInvestment || 0;
    const savingsPct = result.billing?.savingsPercent || 0;
    const payback = result.financial?.paybackYears || 0;
    const co2Kg = result.environmental?.co2ReductionYearlyKg || 0;
    const trees = result.environmental?.treesEquivalent || 0;

    kpi1 = {
      title: 'TOTAL INVESTASI',
      value: formatRupiah(totalInv),
      sub: 'Turnkey + PPN 11%',
      isHighlight: false
    };

    kpi2 = {
      title: '% HEMAT LISTRIK',
      value: formatPercent(savingsPct),
      sub: 'Per bulan dari PLN',
      isHighlight: true
    };

    kpi3 = {
      title: 'PAYBACK PERIOD',
      value: `${payback} Tahun`,
      sub: 'Titik Impas (ROI)',
      isHighlight: false
    };

    kpi4 = {
      title: 'REDUKSI CO₂',
      value: `${formatNumber(co2Kg)} kg`,
      sub: `Ekuivalen ${formatNumber(trees)} pohon/thn`,
      isHighlight: false
    };

  } else if (mode === 'commercial') {
    const scheme = result.activeScheme;
    const co2Kg = result.environmental?.co2ReductionYearlyKg || 0;
    const trees = result.environmental?.treesEquivalent || 0;

    if (scheme?.id === 'opex_ppa') {
      kpi1 = {
        title: 'BIAYA AWAL (CAPEX)',
        value: 'Rp 0',
        sub: 'Tanpa Modal Investasi',
        isHighlight: false
      };
      kpi2 = {
        title: 'DISKON TARIF PLN',
        value: '15.0%',
        sub: 'Per kWh dari Tarif PLN',
        isHighlight: true
      };
      kpi3 = {
        title: 'MASA KONTRAK',
        value: `${scheme.tenorYears || 20} Tahun`,
        sub: 'Hibah Aset di Akhir',
        isHighlight: false
      };
    } else if (scheme?.id === 'opex_lease') {
      kpi1 = {
        title: 'BIAYA AWAL (CAPEX)',
        value: 'Rp 0',
        sub: `Cicilan ${formatRupiah(scheme.monthlyLeasePayment)}/bln`,
        isHighlight: false
      };
      kpi2 = {
        title: 'SWAKONSUMSI',
        value: formatPercent(result.energy?.selfConsumptionPercent || 0),
        sub: 'Diserap Beban Pabrik',
        isHighlight: true
      };
      kpi3 = {
        title: 'TENOR SEWA',
        value: `${scheme.tenorYears || 7} Tahun`,
        sub: 'Milik Penuh Tahun ke-8',
        isHighlight: false
      };
    } else {
      // capex
      kpi1 = {
        title: 'TOTAL INVESTASI',
        value: formatRupiah(scheme?.initialInvestment || 0),
        sub: 'Turnkey + PPN 11%',
        isHighlight: false
      };
      kpi2 = {
        title: 'SWAKONSUMSI',
        value: formatPercent(result.energy?.selfConsumptionPercent || 0),
        sub: 'Serapan Surya Siang',
        isHighlight: true
      };
      kpi3 = {
        title: 'PAYBACK PERIOD',
        value: `${scheme?.paybackYears || 0} Tahun`,
        sub: 'Titik Impas (ROI)',
        isHighlight: false
      };
    }

    kpi4 = {
      title: 'REDUKSI CO₂',
      value: `${formatNumber(co2Kg)} kg`,
      sub: `Ekuivalen ${formatNumber(trees)} pohon/thn`,
      isHighlight: false
    };

  } else if (mode === 'battery') {
    const totalInv = result.financial?.totalInvestment || 0;
    const dod = result.battery?.depthOfDischargePercent || 90;
    const actualHours = result.battery?.actualBackupHours || 0;
    const co2Kg = result.environmental?.co2ReductionYearlyKg || 0;
    const trees = result.environmental?.treesEquivalent || 0;

    kpi1 = {
      title: 'TOTAL INVESTASI',
      value: formatRupiah(totalInv),
      sub: 'BESS + Inverter + ATS',
      isHighlight: false
    };

    kpi2 = {
      title: 'EFISIENSI DOD',
      value: `${dod}%`,
      sub: 'DoD LiFePO4 Teruji',
      isHighlight: true
    };

    kpi3 = {
      title: 'DURASI CADANGAN',
      value: `${actualHours} Jam`,
      sub: 'Proteksi Anti-Padam',
      isHighlight: false
    };

    kpi4 = {
      title: result.solarCharger?.enabled ? 'REDUKSI CO₂' : 'STANDAR BATERAI',
      value: result.solarCharger?.enabled ? `${formatNumber(co2Kg)} kg` : '6.000 Siklus',
      sub: result.solarCharger?.enabled ? `Ekuivalen ${formatNumber(trees)} pohon` : 'Garansi Sel 5 Tahun',
      isHighlight: false
    };

  } else if (mode === 'pjuts') {
    const totalInv = result.financial?.totalInvestment || 0;
    const energySavedPct = result.totalSystem?.energySavedPercent || 0;
    const payback = result.financial?.paybackYears || 0;
    const co2Kg = result.environmental?.co2ReductionYearlyKg || 0;
    const trees = result.environmental?.treesEquivalent || 0;

    kpi1 = {
      title: 'TOTAL INVESTASI',
      value: formatRupiah(totalInv),
      sub: `${result.totalSystem?.poleCount || 0} Tiang Lengkap + PPN`,
      isHighlight: false
    };

    kpi2 = {
      title: '% EFISIENSI DAYA',
      value: `${energySavedPct}%`,
      sub: result.totalSystem?.smartDimmingActive ? 'Smart Dimming Aktif' : 'Operasi Fluks 100%',
      isHighlight: true
    };

    kpi3 = {
      title: 'PAYBACK PERIOD',
      value: `${payback} Tahun`,
      sub: 'Avoided Cost PLN P-3',
      isHighlight: false
    };

    kpi4 = {
      title: 'REDUKSI CO₂',
      value: `${formatNumber(co2Kg)} kg`,
      sub: `Ekuivalen ${formatNumber(trees)} pohon/thn`,
      isHighlight: false
    };
  }

  const cards = [kpi1, kpi2, kpi3, kpi4];

  return `
    <div class="grid grid-cols-1 mobile:grid-cols-2 tablet:grid-cols-4 gap-sm" role="region" aria-label="Grid 4 Metrik Kunci Kinerja Sistem (KPI)">
      ${cards.map(card => `
        <div class="p-sm bg-canvas border border-hairline rounded-sm flex flex-col gap-xxs hover:border-hairline-strong transition-colors">
          <span class="type-caption-xs text-mute font-bold uppercase tracking-wide truncate">
            ${card.title}
          </span>
          <span class="type-heading-sm font-bold ${card.isHighlight ? 'text-primary' : 'text-ink'} truncate mt-xxs">
            ${card.value}
          </span>
          <span class="type-caption-xs text-mute truncate">
            ${card.sub}
          </span>
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Render KPI Grid into a DOM container
 * @param {HTMLElement} container
 * @param {Object} data
 */
export function renderKpiGrid(container, data) {
  if (!container) return;
  container.innerHTML = getKpiGridHtml(data);
}
