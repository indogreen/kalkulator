/**
 * PT. Indogreen Technology And Management
 * Component: 25-Year Payback & ROI Timeline (timeline.js)
 * 
 * Horizontal 25-year lifecycle and break-even point (ROI) visualizer:
 * - Payback period phase (gray bar #5e5e5e)
 * - Break-even point marker (BEP pin with accent indicator)
 * - Pure net profit phase (INDOGREEN Green bar #00b100)
 * - 25-year milestone ticks (0, 5, 10, 15, 20, 25 years)
 * - Cumulative financial impact summary
 * - Pure HTML5 & Tailwind CSS, zero external chart libraries
 */

import { formatRupiah, formatNumber } from '../../utils/formatter.js';

/**
 * Generate HTML string for 25-Year Payback Timeline
 * @param {Object} params
 * @param {string} params.mode - Simulator mode
 * @param {Object} params.input - User inputs
 * @param {Object} params.result - Calculation result
 * @returns {string} HTML string
 */
export function getTimelineHtml({ mode, input, result }) {
  if (!result) return '';

  // Mode Battery: Tampilkan timeline siklus hidup LiFePO4
  if (mode === 'battery') {
    return `
      <section class="border border-hairline bg-canvas p-md rounded-sm flex flex-col gap-sm select-none" aria-label="Timeline Siklus Hidup Baterai LiFePO4">
        <div class="flex items-center justify-between border-b border-hairline pb-xs">
          <div class="flex items-center gap-xs">
            <span class="w-2 h-2 bg-primary rounded-xs"></span>
            <h3 class="type-caption-md text-ink font-bold">TIMELINE DAYA TAHAN & SIKLUS HIDUP LIFEPO4</h3>
          </div>
          <span class="type-caption-xs text-mute">6.000 Siklus Teruji</span>
        </div>

        <p class="type-body-sm text-mute">
          Baterai Lithium Iron Phosphate (LiFePO4) Indogreen dirancang untuk operasi harian lebih dari 15 tahun dengan ketahanan degradasi termal terbaik.
        </p>

        <!-- Horizontal Lifecycle Bar -->
        <div class="flex flex-col gap-xs pt-xs">
          <div class="h-8 w-full bg-surface-soft rounded-sm overflow-hidden flex border border-hairline">
            <!-- Phase 1: Garansi Pabrik (0-5 Thn) -->
            <div class="h-full bg-primary text-on-primary flex items-center justify-center px-xs type-caption-xs font-bold" style="width: 33.3%">
              Garansi Penuh (Th 0 - 5)
            </div>
            <!-- Phase 2: Masa Pakai Produktif (5-15 Thn) -->
            <div class="h-full bg-surface-dark text-on-dark flex items-center justify-center px-xs type-caption-xs font-bold" style="width: 46.7%">
              6.000 Siklus Operasi (Th 5 - 15)
            </div>
            <!-- Phase 3: Standby Extended (15-20 Thn) -->
            <div class="h-full bg-mute text-on-dark flex items-center justify-center px-xs type-caption-xs font-bold" style="width: 20%">
              Extended Standby
            </div>
          </div>

          <!-- Tick Marks -->
          <div class="flex justify-between type-caption-xs text-mute px-xxs">
            <span>Tahun 0</span>
            <span>Tahun 5 (Garansi)</span>
            <span>Tahun 15 (6.000 Siklus)</span>
            <span>Tahun 20+</span>
          </div>
        </div>

        <!-- 3-Column Lifecycle Metrics -->
        <div class="grid grid-cols-1 tablet:grid-cols-3 gap-xs pt-xs border-t border-hairline">
          <div class="flex flex-col p-xs bg-surface-soft rounded-sm">
            <span class="type-caption-xs text-mute font-bold uppercase">SIKLUS HIDUP</span>
            <span class="type-heading-sm font-bold text-ink mt-xxs">6.000+ Siklus</span>
            <span class="type-caption-xs text-mute">Pada 90% Depth of Discharge</span>
          </div>
          <div class="flex flex-col p-xs bg-surface-soft rounded-sm">
            <span class="type-caption-xs text-mute font-bold uppercase">GARANSI RESMI</span>
            <span class="type-heading-sm font-bold text-primary mt-xxs">5 Tahun</span>
            <span class="type-caption-xs text-mute">Penggantian Sel Pabrikan</span>
          </div>
          <div class="flex flex-col p-xs bg-surface-soft rounded-sm">
            <span class="type-caption-xs text-mute font-bold uppercase">ESTIMASI MASA PAKAI</span>
            <span class="type-heading-sm font-bold text-ink mt-xxs">15 - 18 Tahun</span>
            <span class="type-caption-xs text-mute">Operasi Harian 1x Charge/Discharge</span>
          </div>
        </div>
      </section>
    `;
  }

  // Parameter untuk Residensial, Komersial, dan PJUTS
  let paybackYears = 0;
  let totalNet25Years = 0;
  let totalInvestment = 0;
  let isInstantRoi = false;
  let title = 'PROYEKSI TIMELINE 25 TAHUN & TITIK IMPAS (ROI)';

  if (mode === 'residential') {
    paybackYears = result.financial?.paybackYears || 0;
    totalNet25Years = result.financial?.netProfit25Years || 0;
    totalInvestment = result.financial?.totalInvestment || 0;
  } else if (mode === 'commercial') {
    const scheme = result.activeScheme;
    if (scheme?.id === 'opex_ppa') {
      isInstantRoi = true;
      paybackYears = 0;
      totalNet25Years = scheme.cumulativeNet25Years || 0;
      title = 'TIMELINE KONTRAK PPA 20 TAHUN & HIBAH ASET';
    } else if (scheme?.id === 'opex_lease') {
      paybackYears = scheme.tenorYears || 7;
      totalNet25Years = scheme.cumulativeNet25Years || 0;
      title = 'TIMELINE SEWA OPERASIONAL 7 TAHUN & ALIH KEPEMILIKAN';
    } else {
      paybackYears = scheme?.paybackYears || 0;
      totalNet25Years = scheme?.cumulativeNet25Years || 0;
      totalInvestment = scheme?.initialInvestment || 0;
    }
  } else if (mode === 'pjuts') {
    paybackYears = result.financial?.paybackYears || 0;
    totalInvestment = result.financial?.totalInvestment || 0;
    const yearlyAvoided = result.financial?.avoidedCostYearlyRp || result.savings?.avoidedCostYearlyRp || 0;
    totalNet25Years = Math.round((yearlyAvoided * 25) - totalInvestment);
    title = 'TIMELINE 25 TAHUN AVOIDED COST TARIF P-3 PLN';
  }

  // Calculate percentages for 25-year timeline
  const maxYears = 25;
  const clampedPayback = Math.min(maxYears, Math.max(0, paybackYears));
  const paybackPct = isInstantRoi ? 0 : Math.min(95, Math.max(5, (clampedPayback / maxYears) * 100));
  const profitPct = 100 - paybackPct;

  return `
    <section class="border border-hairline bg-canvas p-md rounded-sm flex flex-col gap-sm select-none" aria-label="Visualisasi Timeline 25 Tahun dan Titik Impas">
      
      <!-- Section Header -->
      <div class="flex flex-wrap items-center justify-between gap-xs border-b border-hairline pb-xs">
        <div class="flex items-center gap-xs">
          <span class="w-2 h-2 bg-primary rounded-xs"></span>
          <h3 class="type-caption-md text-ink font-bold">${title}</h3>
        </div>
        <span class="type-caption-xs text-mute">Degradasi 0.5% / Thn Terhitung</span>
      </div>

      <p class="type-body-sm text-mute">
        ${isInstantRoi
          ? 'Skema OPEX PPA memberikan keuntungan langsung sejak bulan ke-1 tanpa periode payback. Di tahun ke-21, aset PLTS sepenuhnya dihibahkan ke klien.'
          : `Investasi awal diproyeksikan mencapai titik impas (Break-Even) pada <strong class="text-ink font-bold">Tahun ke-${paybackYears}</strong>. Setelahnya, seluruh produksi energi surya menjadi keuntungan bersih operasional.`
        }
      </p>

      <!-- Horizontal 25-Year Visual Bar -->
      <div class="flex flex-col gap-xs pt-xs">
        
        <!-- Break-Even Pin Marker (jika bukan instant ROI) -->
        ${!isInstantRoi ? `
          <div class="relative w-full h-5">
            <div class="absolute -top-1 transform -translate-x-1/2 flex flex-col items-center pointer-events-none" style="left: ${paybackPct}%;">
              <span class="bg-surface-dark text-accent-yellow border border-hairline-strong px-xs py-xxs type-caption-xs font-bold rounded-sm whitespace-nowrap shadow-xs">
                BEP: ${paybackYears} Thn
              </span>
              <div class="w-0.5 h-2 bg-surface-dark"></div>
            </div>
          </div>
        ` : ''}

        <!-- Dual-Phase Timeline Bar -->
        <div class="h-8 w-full bg-surface-soft rounded-sm overflow-hidden flex border border-hairline relative" role="progressbar" aria-valuenow="${paybackYears}" aria-valuemin="0" aria-valuemax="25" aria-label="Progress Timeline Balik Modal">
          
          ${!isInstantRoi ? `
            <!-- Phase 1: Payback Phase (Gray) -->
            <div class="h-full bg-hairline-strong text-on-dark flex items-center justify-center px-xs type-caption-xs font-bold truncate transition-all duration-300" style="width: ${paybackPct}%;">
              <span class="truncate">Balik Modal (Th 1-${Math.ceil(paybackYears)})</span>
            </div>
          ` : ''}

          <!-- Phase 2: Pure Net Profit Phase (Green) -->
          <div class="h-full bg-primary text-on-primary flex items-center justify-center px-xs type-caption-xs font-bold truncate transition-all duration-300" style="width: ${profitPct}%;">
            <span class="truncate">
              ${isInstantRoi
                ? 'Penghematan Murni Sejak Hari Pertama (Tahun 1 - 25)'
                : `Akumulasi Laba Bersih Murni (Tahun ${Math.ceil(paybackYears) + 1} - 25)`
              }
            </span>
          </div>

        </div>

        <!-- 25-Year Milestone Ticks -->
        <div class="flex justify-between type-caption-xs text-mute px-xxs">
          <span>Tahun 0</span>
          <span>Tahun 5</span>
          <span>Tahun 10</span>
          <span>Tahun 15</span>
          <span>Tahun 20</span>
          <span>Tahun 25</span>
        </div>

      </div>

      <!-- 3-Column Financial Summary Strip -->
      <div class="grid grid-cols-1 tablet:grid-cols-3 gap-xs pt-xs border-t border-hairline">
        <div class="flex flex-col p-xs bg-surface-soft rounded-sm">
          <span class="type-caption-xs text-mute font-bold uppercase">AKUMULASI NETTO 25 TAHUN</span>
          <span class="type-heading-sm font-bold text-primary mt-xxs">${formatRupiah(totalNet25Years)}</span>
          <span class="type-caption-xs text-mute">Laba Bersih Pasca Modal</span>
        </div>
        <div class="flex flex-col p-xs bg-surface-soft rounded-sm">
          <span class="type-caption-xs text-mute font-bold uppercase">GARANSI PRODUKSI</span>
          <span class="type-heading-sm font-bold text-ink mt-xxs">25 Tahun</span>
          <span class="type-caption-xs text-mute">Standar Modul Tier-1 Linear</span>
        </div>
        <div class="flex flex-col p-xs bg-surface-soft rounded-sm">
          <span class="type-caption-xs text-mute font-bold uppercase">STATUS KEPEMILIKAN</span>
          <span class="type-heading-sm font-bold text-ink mt-xxs">
            ${isInstantRoi ? 'Hibah Th ke-21' : (mode === 'commercial' && input?.activeScheme === 'opex_lease' ? 'Milik Penuh Th ke-8' : 'Hari ke-1 (100%)')}
          </span>
          <span class="type-caption-xs text-mute">Aset Perusahaan Klien</span>
        </div>
      </div>

    </section>
  `;
}

/**
 * Render Timeline directly to DOM
 * @param {HTMLElement} container
 * @param {Object} data
 */
export function renderTimeline(container, data) {
  if (!container) return;
  container.innerHTML = getTimelineHtml(data);
}
