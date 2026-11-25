/**
 * PT. Indogreen Technology And Management
 * Component: 3-Scheme Financial Comparison Table (schemeTable.js)
 * 
 * Flat CAD technical and financial comparison table for commercial mode:
 * 1. CAPEX Beli Putus (100% upfront asset ownership)
 * 2. OPEX PPA (Power Purchase Agreement - 15% discount, zero CAPEX)
 * 3. OPEX Sewa (7-year operational leasing, asset transfer on year 8)
 * 
 * Pure HTML5 & Tailwind CSS, zero external chart libraries
 */

import { formatRupiah } from '../../utils/formatter.js';

/**
 * Generate HTML string for Commercial 3-Scheme Comparison Table
 * @param {Object} params
 * @param {string} params.mode - Simulator mode
 * @param {Object} params.input - User inputs
 * @param {Object} params.result - Calculation result
 * @returns {string} HTML string (only populated for commercial mode)
 */
export function getSchemeTableHtml({ mode, input, result }) {
  if (mode !== 'commercial' || !result?.schemes) {
    return '';
  }

  const { capex, opex_ppa, opex_lease } = result.schemes;
  const activeSchemeId = result.inputs?.activeScheme || result.activeScheme?.id || 'capex';

  return `
    <section class="border border-hairline bg-canvas p-5 tablet:p-6 rounded-sm flex flex-col gap-4 select-none" aria-label="Tabel Komparasi 3 Skema Pembiayaan Komersial">
      
      <!-- Section Header -->
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-hairline pb-3">
        <div class="flex items-center gap-xs">
          <span class="w-2 h-2 bg-primary rounded-xs"></span>
          <h3 class="type-caption-md text-ink font-bold">KOMPARASI 3 SKEMA FINANSIAL BISNIS & INDUSTRI</h3>
        </div>
        <span class="type-caption-xs text-mute">Pilih skema optimal untuk cashflow perusahaan</span>
      </div>

      <!-- Responsive Table Container -->
      <div class="overflow-x-auto">
        <div class="tablet:hidden pb-xs">
          <span class="type-caption-xs text-mute font-bold">Geser tabel ke samping untuk melihat seluruh kolom &rarr;</span>
        </div>
        <table class="w-full min-w-[560px] text-left border-collapse border border-hairline type-body-sm" role="table">
          <thead>
            <tr class="bg-surface-soft border-b border-hairline">
              <th scope="col" class="p-sm type-caption-xs text-mute font-bold uppercase w-1/4 border-r border-hairline">
                Parameter Finansial
              </th>
              
              <!-- Skema 1: CAPEX -->
              <th scope="col" class="p-sm w-1/4 border-r border-hairline transition-colors ${activeSchemeId === 'capex' ? 'bg-primary/10 border-t-2 border-primary' : ''}">
                <div class="flex flex-col gap-xxs">
                  <div class="flex items-center justify-between">
                    <span class="type-caption-md font-bold text-ink">CAPEX Beli Putus</span>
                    ${activeSchemeId === 'capex' ? '<span class="bg-primary text-on-primary type-caption-xs font-bold px-xxs py-0.5 rounded-sm">AKTIF</span>' : ''}
                  </div>
                  <span class="type-caption-xs text-mute">100% Hak Milik Aset</span>
                </div>
              </th>

              <!-- Skema 2: OPEX PPA -->
              <th scope="col" class="p-sm w-1/4 border-r border-hairline transition-colors ${activeSchemeId === 'opex_ppa' ? 'bg-primary/10 border-t-2 border-primary' : ''}">
                <div class="flex flex-col gap-xxs">
                  <div class="flex items-center justify-between">
                    <span class="type-caption-md font-bold text-ink">OPEX PPA</span>
                    ${activeSchemeId === 'opex_ppa' ? '<span class="bg-primary text-on-primary type-caption-xs font-bold px-xxs py-0.5 rounded-sm">AKTIF</span>' : ''}
                  </div>
                  <span class="type-caption-xs text-mute">Diskon 15% (Zero CAPEX)</span>
                </div>
              </th>

              <!-- Skema 3: OPEX Sewa -->
              <th scope="col" class="p-sm w-1/4 transition-colors ${activeSchemeId === 'opex_lease' ? 'bg-primary/10 border-t-2 border-primary' : ''}">
                <div class="flex flex-col gap-xxs">
                  <div class="flex items-center justify-between">
                    <span class="type-caption-md font-bold text-ink">OPEX Sewa 7 Thn</span>
                    ${activeSchemeId === 'opex_lease' ? '<span class="bg-primary text-on-primary type-caption-xs font-bold px-xxs py-0.5 rounded-sm">AKTIF</span>' : ''}
                  </div>
                  <span class="type-caption-xs text-mute">Cicilan Sewa Tetap</span>
                </div>
              </th>
            </tr>
          </thead>

          <tbody class="divide-y divide-hairline text-ink">
            
            <!-- Row 1: Investasi Awal -->
            <tr class="hover:bg-surface-soft/50">
              <td class="p-sm font-bold text-ink bg-surface-soft/30 border-r border-hairline">
                Investasi Awal (Di Muka)
              </td>
              <td class="p-sm font-bold border-r border-hairline ${activeSchemeId === 'capex' ? 'bg-primary/5' : ''}">
                ${formatRupiah(capex?.initialInvestment || 0)}
              </td>
              <td class="p-sm font-bold text-primary border-r border-hairline ${activeSchemeId === 'opex_ppa' ? 'bg-primary/5' : ''}">
                Rp 0 (Nol Rupiah)
              </td>
              <td class="p-sm font-bold text-primary ${activeSchemeId === 'opex_lease' ? 'bg-primary/5' : ''}">
                Rp 0 (Nol Rupiah)
              </td>
            </tr>

            <!-- Row 2: Penghematan Bulanan -->
            <tr class="hover:bg-surface-soft/50">
              <td class="p-sm font-bold text-ink bg-surface-soft/30 border-r border-hairline">
                Estimasi Penghematan Bersih
              </td>
              <td class="p-sm font-bold text-primary border-r border-hairline ${activeSchemeId === 'capex' ? 'bg-primary/5' : ''}">
                ${formatRupiah(capex?.monthlyNetSavings || 0)} / bln
              </td>
              <td class="p-sm font-bold text-primary border-r border-hairline ${activeSchemeId === 'opex_ppa' ? 'bg-primary/5' : ''}">
                ${formatRupiah(opex_ppa?.monthlyNetSavings || 0)} / bln
              </td>
              <td class="p-sm font-bold border-r border-hairline ${activeSchemeId === 'opex_lease' ? 'bg-primary/5' : ''}">
                ${formatRupiah(opex_lease?.monthlyNetSavings || 0)} / bln <span class="text-mute font-normal text-xs">(Th 1-7)</span>
              </td>
            </tr>

            <!-- Row 3: Biaya O&M & Servis -->
            <tr class="hover:bg-surface-soft/50">
              <td class="p-sm font-bold text-ink bg-surface-soft/30 border-r border-hairline">
                Biaya Perawatan (O&M)
              </td>
              <td class="p-sm border-r border-hairline ${activeSchemeId === 'capex' ? 'bg-primary/5' : ''}">
                Mandiri (~${formatRupiah(capex?.annualOmCost || 0)}/thn)
              </td>
              <td class="p-sm font-bold text-primary border-r border-hairline ${activeSchemeId === 'opex_ppa' ? 'bg-primary/5' : ''}">
                100% Ditanggung Indogreen
              </td>
              <td class="p-sm ${activeSchemeId === 'opex_lease' ? 'bg-primary/5' : ''}">
                Termasuk Paket Sewa (7 Thn)
              </td>
            </tr>

            <!-- Row 4: Tenor / Kontrak -->
            <tr class="hover:bg-surface-soft/50">
              <td class="p-sm font-bold text-ink bg-surface-soft/30 border-r border-hairline">
                Masa Kontrak / Tenor
              </td>
              <td class="p-sm border-r border-hairline ${activeSchemeId === 'capex' ? 'bg-primary/5' : ''}">
                Tanpa Kontrak (Aset Langsung)
              </td>
              <td class="p-sm border-r border-hairline ${activeSchemeId === 'opex_ppa' ? 'bg-primary/5' : ''}">
                20 Tahun (Kontrak Pembelian)
              </td>
              <td class="p-sm ${activeSchemeId === 'opex_lease' ? 'bg-primary/5' : ''}">
                7 Tahun (84 Bulan Cicilan)
              </td>
            </tr>

            <!-- Row 5: Titik Impas (Payback Period) -->
            <tr class="hover:bg-surface-soft/50">
              <td class="p-sm font-bold text-ink bg-surface-soft/30 border-r border-hairline">
                Titik Impas (ROI)
              </td>
              <td class="p-sm font-bold border-r border-hairline ${activeSchemeId === 'capex' ? 'bg-primary/5' : ''}">
                ${capex?.paybackYears || 0} Tahun
              </td>
              <td class="p-sm font-bold text-primary border-r border-hairline ${activeSchemeId === 'opex_ppa' ? 'bg-primary/5' : ''}">
                Instan (Bulan ke-1)
              </td>
              <td class="p-sm ${activeSchemeId === 'opex_lease' ? 'bg-primary/5' : ''}">
                7 Tahun (Selesai Sewa)
              </td>
            </tr>

            <!-- Row 6: Status Kepemilikan Aset -->
            <tr class="hover:bg-surface-soft/50">
              <td class="p-sm font-bold text-ink bg-surface-soft/30 border-r border-hairline">
                Kepemilikan Aset Fisik
              </td>
              <td class="p-sm font-bold text-ink border-r border-hairline ${activeSchemeId === 'capex' ? 'bg-primary/5' : ''}">
                Hari ke-1 (Milik Klien 100%)
              </td>
              <td class="p-sm border-r border-hairline ${activeSchemeId === 'opex_ppa' ? 'bg-primary/5' : ''}">
                Hibah ke Klien di Akhir Th 20
              </td>
              <td class="p-sm font-bold text-ink ${activeSchemeId === 'opex_lease' ? 'bg-primary/5' : ''}">
                Beralih Penuh di Tahun ke-8
              </td>
            </tr>

            <!-- Row 7: Akumulasi Net 25 Tahun -->
            <tr class="bg-surface-soft/40 font-bold">
              <td class="p-sm text-ink bg-surface-soft border-r border-hairline">
                Estimasi Netto 25 Tahun
              </td>
              <td class="p-sm text-primary border-r border-hairline ${activeSchemeId === 'capex' ? 'bg-primary/10' : ''}">
                ${formatRupiah(capex?.cumulativeNet25Years || 0)}
              </td>
              <td class="p-sm text-primary border-r border-hairline ${activeSchemeId === 'opex_ppa' ? 'bg-primary/10' : ''}">
                ${formatRupiah(opex_ppa?.cumulativeNet25Years || 0)}
              </td>
              <td class="p-sm text-primary ${activeSchemeId === 'opex_lease' ? 'bg-primary/10' : ''}">
                ${formatRupiah(opex_lease?.cumulativeNet25Years || 0)}
              </td>
            </tr>

          </tbody>
        </table>
      </div>

      <!-- Action hint -->
      <div class="flex items-center justify-between type-caption-xs text-mute pt-xxs">
        <span>* Nilai estimasi disesuaikan dengan pola radiasi PSH dan profil beban operasional shift kerja.</span>
        <span class="text-primary font-bold">PT. Indogreen EPC Resmi</span>
      </div>

    </section>
  `;
}

/**
 * Render Scheme Table directly to DOM
 * @param {HTMLElement} container
 * @param {Object} data
 */
export function renderSchemeTable(container, data) {
  if (!container) return;
  container.innerHTML = getSchemeTableHtml(data);
}
