/**
 * PT. Indogreen Technology And Management
 * Component: Regulatory & Engineering Compliance Note (regulatoryNote.js)
 * 
 * Compliant with:
 * - Permen ESDM No. 2/2024 (PLTS Atap & Rekening Minimum PLN 40 Jam Nyala)
 * - Zero-Export Grid Protection & Self-Consumption Sizing
 * - Tier-1 IEC 61215/61730 Modules & SLO PLN Certification
 * - Engineering Disclaimer
 */

/**
 * Generate HTML string for Regulatory Compliance Note
 * @param {Object} [params]
 * @param {string} [params.mode] - Simulator mode
 * @returns {string} HTML string
 */
export function getRegulatoryNoteHtml({ mode = 'residential' } = {}) {
  return `
    <aside class="border border-hairline bg-canvas p-md rounded-sm flex flex-col gap-sm text-body select-none" aria-label="Catatan Kepatuhan Regulasi dan Legalitas">
      
      <!-- Header Strip with Legal Badges -->
      <div class="flex flex-wrap items-center justify-between gap-xs border-b border-hairline pb-xs">
        <div class="flex items-center gap-xs">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-primary shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <h4 class="type-caption-md text-ink font-bold">KEPATUHAN REGULASI & STANDAR REKAYASA EBT</h4>
        </div>

        <div class="flex flex-wrap items-center gap-xxs">
          <span class="bg-surface-soft border border-hairline px-xs py-xxs type-caption-xs font-bold text-ink rounded-sm">
            PERMEN ESDM 2/2024
          </span>
          <span class="bg-surface-soft border border-hairline px-xs py-xxs type-caption-xs font-bold text-primary rounded-sm">
            SNI / SLO RESMI
          </span>
          <span class="bg-surface-soft border border-hairline px-xs py-xxs type-caption-xs font-bold text-ink rounded-sm">
            TKDN COMPLIANT
          </span>
        </div>
      </div>

      <!-- 2-Column Grid Legal Explanations -->
      <div class="grid grid-cols-1 tablet:grid-cols-2 gap-md type-caption-xs text-mute leading-relaxed">
        
        <!-- Poin 1: Rekening Minimum PLN -->
        <div class="flex flex-col gap-xxs">
          <span class="font-bold text-ink uppercase tracking-wide flex items-center gap-xs">
            <span class="w-1.5 h-1.5 bg-primary rounded-full"></span>
            Ketentuan Rekening Minimum PLN
          </span>
          <p>
            Sesuai <strong>Permen ESDM No. 2/2024</strong>, seluruh pelanggan PLTS Atap tetap tunduk pada aturan Rekening Minimum sebesar <strong class="text-ink">40 jam nyala</strong> (40 × Daya kVA × Tarif/kWh). Algoritma simulator Indogreen menjamin tagihan setelah PLTS tidak melanggar batas legal ini.
          </p>
        </div>

        <!-- Poin 2: Zero-Export & Swakonsumsi -->
        <div class="flex flex-col gap-xxs">
          <span class="font-bold text-ink uppercase tracking-wide flex items-center gap-xs">
            <span class="w-1.5 h-1.5 bg-primary rounded-full"></span>
            Zero-Export Grid Protection
          </span>
          <p>
            Dengan ditiadakannya skema net-metering ekspor kWh ke PLN, sistem kami mengutamakan <strong class="text-ink">swakonsumsi mandiri 100%</strong> dan integrasi baterai LiFePO4 untuk menyerap surplus energi surya tanpa bergantung pada jaringan PLN.
          </p>
        </div>

        <!-- Poin 3: Komponen Tier-1 & Sertifikasi -->
        <div class="flex flex-col gap-xxs">
          <span class="font-bold text-ink uppercase tracking-wide flex items-center gap-xs">
            <span class="w-1.5 h-1.5 bg-primary rounded-full"></span>
            Standar EPC Tier-1 & Garansi 25 Tahun
          </span>
          <p>
            Spesifikasi menggunakan modul surya Monocrystalline Tier-1 (IEC 61215/61730) dengan garansi kinerja linier 25 tahun, serta inverter terdaftar Sertifikasi Laik Operasi (SLO) PLN.
          </p>
        </div>

        <!-- Poin 4: Rekayasa & Survei Lokasi -->
        <div class="flex flex-col gap-xxs">
          <span class="font-bold text-ink uppercase tracking-wide flex items-center gap-xs">
            <span class="w-1.5 h-1.5 bg-primary rounded-full"></span>
            Disclaimer Rekayasa Teknis
          </span>
          <p>
            Hasil kalkulasi adalah estimasi rekayasa awal berbasis insolasi rata-rata wilayah (PSH) dan tarif PLN 2026. Penawaran final akan diverifikasi via survei teknis (tilt atap, azimuth arah matahari, dan analisis bayangan shading).
          </p>
        </div>

      </div>

    </aside>
  `;
}

/**
 * Render Regulatory Note to DOM
 * @param {HTMLElement} container
 * @param {Object} data
 */
export function renderRegulatoryNote(container, data) {
  if (!container) return;
  container.innerHTML = getRegulatoryNoteHtml(data);
}
