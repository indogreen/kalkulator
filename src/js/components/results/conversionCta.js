/**
 * PT. Indogreen Technology And Management
 * Component: Conversion CTA Section (conversionCta.js)
 * 
 * High-conversion action card featuring:
 * - Primary button: WhatsApp Consultation (btn-primary green #00b100, text black #000000, 2px radius, 44px height)
 * - Secondary button: Sales Barcode (btn-outline 2px green #00b100, text black #000000, 2px radius, 44px height)
 */

/**
 * Generate HTML string for Conversion Action Card
 * @param {Object} params
 * @param {string} [params.waUrl] - Pre-generated WhatsApp consultation URL
 * @returns {string} HTML string
 */
export function getConversionCtaHtml({ waUrl = 'https://wa.me/628170092221' } = {}) {
  return `
    <section class="border border-hairline bg-surface-soft p-md tablet:p-lg rounded-sm flex flex-col tablet:flex-row tablet:items-center tablet:justify-between gap-md select-none" aria-label="Aksi Konversi dan Konsultasi Rekayasa">
      
      <!-- Copy text -->
      <div class="flex flex-col gap-xxs max-w-md">
        <h3 class="text-base font-bold text-ink">Bawa Pulang Hasil Simulasi</h3>
        <p class="text-sm text-mute leading-relaxed">
          Konsultasikan spesifikasi teknis dan estimasi kelayakan ini langsung dengan tim sales engineer resmi PT. Indogreen.
        </p>
      </div>

      <!-- Action Buttons Cluster -->
      <div class="flex flex-wrap items-center gap-sm">
        
        <!-- Tombol Sekunder: Barcode Sales Kiosk (btn-outline 2px green) -->
        <button type="button" id="btn-result-qr" class="btn-outline type-button-sm gap-xs flex-1 tablet:flex-initial" aria-label="Buka Barcode QR Code untuk Hasil Simulasi">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect width="5" height="5" x="3" y="3" rx="1"/>
            <rect width="5" height="5" x="16" y="3" rx="1"/>
            <rect width="5" height="5" x="3" y="16" rx="1"/>
            <path d="M21 16h-3a2 2 0 0 0-2 2v3"/>
            <path d="M21 21v.01"/>
            <path d="M12 7v3a2 2 0 0 1-2 2H7"/>
            <path d="M3 12h.01"/>
            <path d="M12 3h.01"/>
            <path d="M12 16v.01"/>
            <path d="M16 12h1"/>
            <path d="M21 12v.01"/>
            <path d="M12 21v-1"/>
          </svg>
          <span>Buka Barcode Sales</span>
        </button>

        <!-- Tombol Utama: Konsultasi via WhatsApp (btn-primary green, text black) -->
        <a id="btn-result-wa" href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-primary type-button-sm gap-xs flex-1 tablet:flex-initial" aria-label="Hubungi Konsultan Engineering Indogreen via WhatsApp">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-on-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
          <span>Konsultasikan via WhatsApp (0817-0092-221)</span>
        </a>

      </div>

    </section>
  `;
}

/**
 * Render Conversion CTA Card to DOM
 * @param {HTMLElement} container
 * @param {Object} data
 */
export function renderConversionCta(container, data) {
  if (!container) return;
  container.innerHTML = getConversionCtaHtml(data);
}
