/**
 * PT. Indogreen Technology And Management
 * Component: Bill Comparison Bar Chart (billBar.js)
 * 
 * Flat CAD horizontal comparison bars:
 * - Baseline electricity cost (gray bar #757575)
 * - Post-solar electricity cost (green bar #00b100)
 * - Permen ESDM No. 2/2024 minimum billing marker & compliance indicator
 * - Pure HTML5 & Tailwind CSS, zero external chart libraries
 */

import { formatRupiah, formatPercent } from '../../utils/formatter.js';

/**
 * Generate HTML string for Bill Comparison Bar Chart
 * @param {Object} params
 * @param {string} params.mode - Simulator mode
 * @param {Object} params.input - User inputs
 * @param {Object} params.result - Calculation results
 * @returns {string} HTML string
 */
export function getBillBarHtml({ mode, input, result }) {
  if (!result) return '';

  let title = 'PERBANDINGAN BIAYA TAGIHAN LISTRIK BULANAN';
  let beforeLabel = 'Tagihan Awal PLN';
  let beforeValue = 0;
  let afterLabel = 'Tagihan Baru Setelah PLTS';
  let afterValue = 0;
  let savingsValue = 0;
  let savingsPercent = 0;
  let minBillThreshold = 0;
  let isMinApplied = false;
  let noteHtml = '';

  if (mode === 'residential') {
    beforeValue = result.billing?.originalMonthlyBill || 0;
    afterValue = result.billing?.newMonthlyBill || 0;
    savingsValue = result.billing?.monthlySavings || 0;
    savingsPercent = result.billing?.savingsPercent || 0;
    minBillThreshold = result.billing?.minimumBill || 0;
    isMinApplied = result.billing?.isMinimumBillApplied || false;

    if (isMinApplied) {
      noteHtml = `
        <div class="p-3 bg-surface-soft border-l-2 border-primary rounded-sm flex items-start gap-2.5 text-ink text-xs" role="note">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-primary shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" x2="12" y1="8" y2="12"/>
            <line x1="12" x2="12.01" y1="16" y2="16"/>
          </svg>
          <div class="leading-relaxed">
            <strong class="font-bold text-ink">Proteksi Rekening Minimum PLN Aktif:</strong>
            Tagihan pelanggan PLTS Atap dibatasi minimal 40 jam nyala (${formatRupiah(minBillThreshold)}/bln). Tagihan Anda tertahan aman pada batas rekening minimum PLN.
          </div>
        </div>
      `;
    } else {
      noteHtml = `
        <div class="flex items-center justify-between text-mute text-xs border-t border-hairline pt-3">
          <span>Batas Rekening Minimum PLN (40 Jam Nyala): <strong>${formatRupiah(minBillThreshold)}/bln</strong></span>
          <span class="text-primary font-bold">Tagihan di atas batas minimum</span>
        </div>
      `;
    }

  } else if (mode === 'commercial') {
    const activeScheme = result.activeScheme;
    beforeValue = result.inputs?.monthlyBill || 0;
    savingsValue = activeScheme?.monthlyNetSavings || 0;
    afterValue = Math.max(0, beforeValue - savingsValue);
    savingsPercent = beforeValue > 0 ? Number(((savingsValue / beforeValue) * 100).toFixed(1)) : 0;

    title = `STRUKTUR BIAYA LISTRIK — ${activeScheme?.name?.toUpperCase() || 'KOMERSIAL'}`;
    beforeLabel = 'Tagihan Awal Operasional';
    afterLabel = `Biaya Bersih Pasca PLTS (${activeScheme?.id === 'opex_ppa' ? 'Diskon PPA 15%' : 'Nett'})`;

    noteHtml = `
      <div class="flex items-center justify-between text-mute type-caption-xs border-t border-hairline pt-xs">
        <span>Penghematan Bersih Bulanan: <strong class="text-primary font-bold">${formatRupiah(savingsValue)}</strong></span>
        <span>Reduksi Biaya Operasional: <strong class="text-ink font-bold">${formatPercent(savingsPercent)}</strong></span>
      </div>
    `;

  } else if (mode === 'battery') {
    title = 'PROTEKSI BEBAN KRITIS LISTRIK SAAT PADAM';
    beforeLabel = 'Beban Kritis Tanpa BESS (Mati Total)';
    beforeValue = 100;
    afterLabel = 'Beban Kritis Terproteksi BESS (UPS)';
    afterValue = 0; // 0% blackout
    savingsPercent = 100;

    return `
      <section class="border border-hairline bg-canvas p-5 tablet:p-6 rounded-sm flex flex-col gap-4 select-none" aria-label="Visualisasi Proteksi Beban BESS">
        <div class="flex items-center justify-between border-b border-hairline pb-3">
          <div class="flex items-center gap-xs">
            <span class="w-2 h-2 bg-primary rounded-xs"></span>
            <h3 class="type-caption-md text-ink font-bold">${title}</h3>
          </div>
          <span class="type-caption-xs text-mute">Keandalan Daya</span>
        </div>

        <div class="flex flex-col gap-sm">
          <!-- Kondisi 1: Tanpa BESS -->
          <div class="flex flex-col gap-xxs">
            <div class="flex items-center justify-between type-caption-xs">
              <span class="font-bold text-ink">Beban Saat Pemadaman Grid Tanpa BESS</span>
              <span class="font-bold text-error">100% Padam / Mati</span>
            </div>
            <div class="h-6 w-full bg-surface-soft rounded-sm overflow-hidden flex border border-hairline">
              <div class="w-full bg-mute text-on-dark flex items-center px-xs type-caption-xs font-bold">
                Risiko Downtime Total (${result.inverter?.criticalLoadKw || 0} kW Terhenti)
              </div>
            </div>
          </div>

          <!-- Kondisi 2: Dengan BESS -->
          <div class="flex flex-col gap-xxs">
            <div class="flex items-center justify-between type-caption-xs">
              <span class="font-bold text-ink">Beban Saat Pemadaman Grid Dengan BESS</span>
              <span class="font-bold text-primary">100% Aman Beroperasi</span>
            </div>
            <div class="h-6 w-full bg-surface-soft rounded-sm overflow-hidden flex border border-hairline">
              <div class="w-full bg-primary text-on-primary flex items-center px-xs type-caption-xs font-bold">
                Proteksi UPS Otomatis ${result.battery?.actualBackupHours || 0} Jam Penuh (<10ms)
              </div>
            </div>
          </div>
        </div>

        <div class="p-xs bg-surface-soft border-l-2 border-primary rounded-sm flex items-start gap-xs text-ink type-caption-xs">
          <span>Inverter BESS switch secara otomatis dalam waktu <strong>kurang dari 10 milidetik</strong> saat PLN padam sehingga server, pompa, kulkas, dan lampu tidak sempat mati.</span>
        </div>
      </section>
    `;

  } else if (mode === 'pjuts') {
    beforeValue = result.financial?.avoidedCostMonthlyRp || result.savings?.avoidedCostMonthlyRp || 0;
    afterValue = 0; // Biaya PLN Rp 0
    savingsValue = beforeValue;
    savingsPercent = 100;

    title = 'BIAYA LISTRIK PENERANGAN JALAN (P-3 PLN VS PJUTS)';
    beforeLabel = 'Tarif Listrik P-3 PLN Konvensional';
    afterLabel = 'Biaya Listrik Pasca PJUTS Mandiri';

    noteHtml = `
      <div class="flex items-center justify-between text-mute type-caption-xs border-t border-hairline pt-xs">
        <span>Penghematan Listrik (Avoided Cost): <strong class="text-primary font-bold">${formatRupiah(savingsValue)}/bln</strong></span>
        <span>Otonomi Surya Penuh: <strong class="text-ink font-bold">100% Mandiri</strong></span>
      </div>
    `;
  }

  // Calculate percentage bar widths
  const maxRef = Math.max(beforeValue, 1);
  const beforePct = 100;
  const afterPct = Math.min(100, Math.max(mode === 'pjuts' ? 0 : 4, (afterValue / maxRef) * 100));
  const minBillPct = minBillThreshold > 0 ? Math.min(100, (minBillThreshold / maxRef) * 100) : 0;

  return `
    <section class="border border-hairline bg-canvas p-5 tablet:p-6 rounded-sm flex flex-col gap-4 select-none" aria-label="Grafik Perbandingan Tagihan Listrik">
      
      <!-- Section Header & Legend -->
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-hairline pb-3">
        <div class="flex items-center gap-xs">
          <span class="w-2 h-2 bg-primary rounded-xs"></span>
          <h3 class="type-caption-md text-ink font-bold">${title}</h3>
        </div>
        <div class="flex items-center gap-md type-caption-xs text-mute">
          <div class="flex items-center gap-xxs">
            <span class="w-3 h-3 bg-mute rounded-xs inline-block"></span>
            <span>Sebelum PLTS</span>
          </div>
          <div class="flex items-center gap-xxs">
            <span class="w-3 h-3 bg-primary rounded-xs inline-block"></span>
            <span>Setelah PLTS</span>
          </div>
        </div>
      </div>

      <!-- Comparison Bars Container -->
      <div class="flex flex-col gap-sm">
        
        <!-- Bar 1: Sebelum PLTS (Abu-abu) -->
        <div class="flex flex-col gap-xxs">
          <div class="flex items-center justify-between type-caption-xs">
            <span class="font-bold text-ink">${beforeLabel}</span>
            <span class="font-bold text-ink">${formatRupiah(beforeValue)}</span>
          </div>
          <div class="h-7 w-full bg-surface-soft rounded-sm overflow-hidden flex border border-hairline" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" aria-label="${beforeLabel}">
            <div class="h-full bg-mute text-on-dark flex items-center justify-between px-sm type-caption-xs font-bold transition-all duration-300" style="width: ${beforePct}%">
              <span>Baseline 100%</span>
              <span>${formatRupiah(beforeValue)}</span>
            </div>
          </div>
        </div>

        <!-- Bar 2: Setelah PLTS (Hijau) -->
        <div class="flex flex-col gap-xxs">
          <div class="flex items-center justify-between type-caption-xs">
            <span class="font-bold text-ink">${afterLabel}</span>
            <div class="flex items-center gap-xs">
              <span class="bg-primary/20 text-primary font-bold px-xxs py-0.5 rounded-sm">
                Hemat ${formatPercent(savingsPercent)}
              </span>
              <span class="font-bold text-primary">${formatRupiah(afterValue)}</span>
            </div>
          </div>
          <div class="h-7 w-full bg-surface-soft rounded-sm overflow-hidden flex border border-hairline relative" role="progressbar" aria-valuenow="${afterPct.toFixed(0)}" aria-valuemin="0" aria-valuemax="100" aria-label="${afterLabel}">
            
            <!-- Green Fill Bar -->
            <div class="h-full bg-primary text-on-primary flex items-center justify-between px-sm type-caption-xs font-bold transition-all duration-300 ${afterPct === 0 ? 'hidden' : ''}" style="width: ${afterPct}%">
              <span class="truncate">Tagihan Baru (~${afterPct.toFixed(0)}%)</span>
              <span class="truncate ml-xs">${formatRupiah(afterValue)}</span>
            </div>

            ${afterPct === 0 ? `
              <div class="h-full w-full bg-primary text-on-primary flex items-center justify-center px-sm type-caption-xs font-bold">
                Bebas Tagihan PLN (Rp 0 / 100% Otonom)
              </div>
            ` : ''}

            <!-- Rekening Minimum Marker Line (Permen ESDM 2/2024) -->
            ${minBillPct > 0 ? `
              <div class="absolute top-0 bottom-0 border-r-2 border-dashed border-error pointer-events-none flex flex-col justify-end" style="left: ${minBillPct}%;" title="Batas Rekening Minimum PLN (${formatRupiah(minBillThreshold)})">
              </div>
            ` : ''}

          </div>
        </div>

      </div>

      <!-- Regulatory / Contextual Note -->
      ${noteHtml}

    </section>
  `;
}

/**
 * Render Bill Comparison Bar Chart directly to DOM
 * @param {HTMLElement} container
 * @param {Object} data
 */
export function renderBillBar(container, data) {
  if (!container) return;
  container.innerHTML = getBillBarHtml(data);
}
