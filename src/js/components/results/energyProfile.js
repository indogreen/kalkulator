/**
 * PT. Indogreen Technology And Management
 * Component: Customer Energy Profile & Technical Breakdown (energyProfile.js)
 *
 * Displays detailed customer electricity profile and Hybrid Off-Grid load split
 * in INDOGREEN Flat CAD table/row format. Cost breakdown is intentionally
 * deferred to the upcoming pricing phase.
 */

import { formatNumber } from '../../utils/formatter.js';

/**
 * Generate HTML string for Customer Energy Profile Breakdown
 * @param {Object} params
 * @param {string} params.mode - Simulator mode
 * @param {Object} params.result - Calculation result
 * @returns {string} HTML string
 */
export function getEnergyProfileHtml({ mode, result }) {
  if (mode !== 'hybrid' || !result) return '';

  const kategori = result.inputs?.kategori || 'Residential';
  const dayaLabel = result.inputs?.dayaLabel || 'R-1/TR 1.300 VA';
  const dayaStatus = result.inputs?.dayaStatus || 'Non-Subsidi';
  const tariff = result.inputs?.tariff || 1444.7;
  const persenCover = result.inputs?.persenCover ?? 100;

  const totalKwhBulan = result.energy?.totalKwhBulan || 0;
  const totalKwhHari = result.energy?.totalKwhHari || 0;
  const targetKwhHari = result.energy?.targetKwhHari || 0;
  const kwhSiangHari = result.energy?.kwhSiangHari || 0;
  const kwhMalamHari = result.energy?.kwhMalamHari || 0;

  const panelWp = result.pv?.panelWp || 615;
  const jumlahPanel = result.pv?.jumlahPanel || 0;
  const luasAtap = result.pv?.luasAtapM2 || 0;
  const panelWidthM = result.pv?.panelWidthM || 1.2;
  const panelLengthM = result.pv?.panelLengthM || 2.4;
  const panelAreaM2 = result.pv?.panelAreaM2 || 2.88;

  const rows = [
    {
      label: 'Kategori & Daya PLN',
      value: `${kategori} (${dayaLabel})`,
      badge: dayaStatus
    },
    {
      label: 'Tarif Listrik PLN',
      value: `Rp ${formatNumber(tariff, 2)} / kWh`
    },
    {
      label: 'Total Kebutuhan Energi',
      value: `${formatNumber(totalKwhBulan, 1)} kWh/bln (${formatNumber(totalKwhHari, 2)} kWh/hari)`
    },
    {
      label: 'Target Dicover PLTS',
      value: `${persenCover}% (${formatNumber(targetKwhHari, 2)} kWh/hari)`,
      highlight: true
    },
    {
      label: 'Beban Siang / Malam (PLTS)',
      value: `${formatNumber(kwhSiangHari, 2)} kWh / ${formatNumber(kwhMalamHari, 2)} kWh`
    },
    {
      label: 'Spesifikasi Modul Surya',
      value: `${panelWp} Wp (${panelWidthM}m × ${panelLengthM}m = ${formatNumber(panelAreaM2, 2)} m²/lembar)`
    },
    {
      label: 'Kebutuhan Panel & Luas Atap',
      value: `${jumlahPanel} Lembar Panel (Kebutuhan Atap: ± ${formatNumber(luasAtap, 1)} m²)`,
      highlight: true
    },
    {
      label: 'Rekomendasi Baterai Bank',
      value: `${formatNumber(result.battery?.kapasitasBatteryKwh || 0, 0)} kWh (${
        result.battery?.batteryDesc || (
          (result.battery?.jumlahModulBattery || 0) > 1
            ? `${result.battery?.jumlahModulBattery} Unit @ ${result.battery?.batteryModuleKwh || 5} kWh = ${result.battery?.batteryFormula}`
            : `1 Unit @ ${result.battery?.batteryModuleKwh || 5} kWh`
        )
      })`,
      highlight: true
    },
    ...(result.battery?.options && result.battery.options.length > 1 ? [{
      label: 'Opsi Konfigurasi Simetris',
      value: result.battery.options.map(opt => {
        const isSelected = opt.unitKwh === result.battery.batteryModuleKwh;
        return isSelected
          ? `<strong>${opt.count} Unit @ ${opt.unitKwh}kWh (Terpilih)</strong>`
          : `${opt.count} Unit @ ${opt.unitKwh}kWh`;
      }).join(' • ')
    }] : [])
  ];

  return `
    <section class="border border-hairline bg-canvas rounded-sm overflow-hidden" aria-label="Rincian Teknis Profil Energi Pelanggan">
      <div class="px-5 py-3.5 bg-surface-soft border-b border-hairline flex flex-wrap items-center justify-between gap-2">
        <h3 class="type-caption-md text-ink font-bold uppercase tracking-wide">
          PROFIL ENERGI PELANGGAN &amp; RINCIAN SIZING
        </h3>
        <span class="text-xs text-mute font-medium">
          Estimasi biaya disiapkan pada tahap berikutnya
        </span>
      </div>

      <dl class="divide-y divide-hairline px-5 py-2 text-sm">
        ${rows.map(row => `
          <div class="py-3 flex flex-col mobile:flex-row mobile:items-center justify-between gap-1">
            <dt class="text-mute font-medium">${row.label}</dt>
            <dd class="font-semibold tabular-nums mobile:text-right flex items-center mobile:justify-end gap-2 ${row.highlight ? 'text-primary-dark font-bold' : 'text-ink'}">
              <span>${row.value}</span>
              ${row.badge ? `
                <span class="px-2 py-0.5 rounded-sm text-[11px] font-bold uppercase border ${
                  row.badge === 'Bersubsidi'
                    ? 'bg-accent-yellow-pale text-ink border-warning'
                    : 'bg-surface-soft text-primary-dark border-primary'
                }">${row.badge}</span>
              ` : ''}
            </dd>
          </div>
        `).join('')}
      </dl>
    </section>
  `;
}

/**
 * Render Energy Profile directly into DOM
 * @param {HTMLElement} container
 * @param {Object} data
 */
export function renderEnergyProfile(container, data) {
  if (!container) return;
  container.innerHTML = getEnergyProfileHtml(data);
}
