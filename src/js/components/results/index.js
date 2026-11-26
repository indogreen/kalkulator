/**
 * PT. Indogreen Technology And Management
 * Results Panel Orchestrator (src/js/components/results/index.js)
 * 
 * Coordinates:
 * - heroCard: CAD black hero card with specs & savings display
 * - kpiGrid: 4 precision KPI metric cards
 * - billBar: Visual baseline vs post-solar bill comparison & Permen ESDM 2/2024 marker
 * - timeline: 25-year horizontal payback & BEP timeline
 * - schemeTable: 3-scheme comparison table (commercial mode)
 * - conversionCta: WhatsApp and Sales Barcode CTA buttons
 * - regulatoryNote: Permen ESDM 2/2024 compliance and legal disclosures
 */

import { getHeroCardHtml } from './heroCard.js';
import { getKpiGridHtml } from './kpiGrid.js';
import { getEnergyProfileHtml } from './energyProfile.js';
import { getBillBarHtml } from './billBar.js';
import { getTimelineHtml } from './timeline.js';
import { getSchemeTableHtml } from './schemeTable.js';
import { getConversionCtaHtml } from './conversionCta.js';
import { getRegulatoryNoteHtml } from './regulatoryNote.js';

export {
  getHeroCardHtml,
  getKpiGridHtml,
  getEnergyProfileHtml,
  getBillBarHtml,
  getTimelineHtml,
  getSchemeTableHtml,
  getConversionCtaHtml,
  getRegulatoryNoteHtml
};

/**
 * Render complete results panel into target container
 * @param {HTMLElement} container - DOM container (e.g. #results-container)
 * @param {Object} data
 * @param {string} data.mode - Simulator mode
 * @param {Object} data.input - User inputs
 * @param {Object} data.result - Calculation result
 * @param {string} [data.waUrl] - Pre-generated WhatsApp link
 * @param {Function} [data.onOpenQr] - Callback when "Buka Barcode" is clicked
 */
export function renderResults(container, { mode, input, result, waUrl, onOpenQr }) {
  if (!container || !result) return;

  const isHybrid = mode === 'hybrid';

  const html = isHybrid
    ? `
      <!-- 1. Hero Result Card (CAD Black Canvas) -->
      <div id="result-hero-slot">
        ${getHeroCardHtml({ mode, input, result })}
      </div>

      <!-- 2. Grid 3 Kartu Sizing Teknis (PV, Inverter, Battery) -->
      <div id="result-kpi-slot">
        ${getKpiGridHtml({ mode, input, result })}
      </div>

      <!-- 3. Rincian Teknis & Profil Energi Pelanggan -->
      <div id="result-profile-slot">
        ${getEnergyProfileHtml({ mode, input, result })}
      </div>

      <!-- 4. Aksi Konversi WhatsApp & Barcode (Conversion CTA) -->
      <div id="result-cta-slot">
        ${getConversionCtaHtml({ waUrl })}
      </div>
    `
    : `
      <!-- 1. Hero Result Card (CAD Black Canvas) -->
      <div id="result-hero-slot">
        ${getHeroCardHtml({ mode, input, result })}
      </div>

      <!-- 2. Grid 4 Metrik Presisi (KPI) -->
      <div id="result-kpi-slot">
        ${getKpiGridHtml({ mode, input, result })}
      </div>

      <!-- 3. Perbandingan Tagihan Listrik (Bill Bar) -->
      <div id="result-billbar-slot">
        ${getBillBarHtml({ mode, input, result })}
      </div>

      <!-- 4. Tabel 3 Skema Finansial (Khusus Mode Komersial) -->
      ${mode === 'commercial' ? `
        <div id="result-schemes-slot">
          ${getSchemeTableHtml({ mode, input, result })}
        </div>
      ` : ''}

      <!-- 5. Visualisasi Timeline 25 Tahun & Titik Impas (Timeline) -->
      <div id="result-timeline-slot">
        ${getTimelineHtml({ mode, input, result })}
      </div>

      <!-- 6. Aksi Konversi WhatsApp & Barcode (Conversion CTA) -->
      <div id="result-cta-slot">
        ${getConversionCtaHtml({ waUrl })}
      </div>
    `;

  container.innerHTML = html;

  // Bind QR button event
  const btnQr = container.querySelector('#btn-result-qr');
  if (btnQr && typeof onOpenQr === 'function') {
    btnQr.addEventListener('click', (e) => {
      e.preventDefault();
      onOpenQr();
    });
  }
}
