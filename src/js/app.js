/**
 * PT. Indogreen Technology And Management
 * Main Application Orchestrator & State Controller
 * 
 * Coordinates:
 * - Header toolbar (Reset, QR modal, Fullscreen)
 * - 4-Mode Simulation Tabs (Residential, Commercial, Battery, PJUTS)
 * - Left Panel: Interactive Forms mounting with state retention
 * - Real-time calculation triggers
 */

import { initHeader } from './components/header.js';
import { initTabs, setActiveTab } from './components/tabs.js';

import { renderResidentialForm } from './components/forms/residentialForm.js';
import { renderCommercialForm } from './components/forms/commercialForm.js';
import { renderBatteryForm } from './components/forms/batteryForm.js';
import { renderPjutsForm } from './components/forms/pjutsForm.js';
import { renderResults } from './components/results/index.js';

import { calculateResidential } from './calculator/residential.js';
import { calculateCommercial } from './calculator/commercial.js';
import { calculateBattery } from './calculator/battery.js';
import { calculatePjuts } from './calculator/pjuts.js';

import { generateQrSvg } from './utils/qrcode.js';
import { generateWhatsAppUrl } from './utils/whatsapp.js';
import { formatRupiah, formatKwp, formatNumber, formatPercent } from './utils/formatter.js';

// Default Application State for all 4 Modes
const DEFAULT_APP_STATE = Object.freeze({
  activeMode: 'residential',
  modes: {
    residential: {
      powerVa: 2200,
      monthlyBill: 1500000,
      daytimeActivity: 'medium',
      batteryOption: 'hybrid_5',
      region: 'dki_jabar_banten',
      roofArea: 30
    },
    commercial: {
      tariffGroup: 'B-2',
      monthlyBill: 50000000,
      operationalHours: 'office',
      activeScheme: 'capex',
      region: 'dki_jabar_banten',
      roofArea: 300
    },
    battery: {
      sector: 'residential',
      criticalLoadKw: 2.0,
      backupHours: 4,
      includeSolarCharger: false,
      region: 'dki_jabar_banten'
    },
    pjuts: {
      poleCount: 10,
      lampWattage: 60,
      nightHours: 12,
      smartDimming: true,
      autonomyDays: 2,
      region: 'dki_jabar_banten'
    }
  }
});

// Deep clone default state
let appState = JSON.parse(JSON.stringify(DEFAULT_APP_STATE));

/**
 * Render formulir yang sesuai dengan mode aktif ke dalam #form-slot
 */
function mountActiveForm() {
  const formSlot = document.getElementById('form-slot');
  if (!formSlot) return;

  const mode = appState.activeMode;
  const currentState = appState.modes[mode];

  // Update badge indikator mode pada header form
  const badgeMode = document.getElementById('active-mode-badge');
  if (badgeMode) {
    const labels = {
      residential: 'PLTS ATAP RESIDENSIAL',
      commercial: 'PLTS BISNIS & INDUSTRI',
      battery: 'BATERAI CADANGAN (BESS)',
      pjuts: 'PENERANGAN JALAN (PJUTS)'
    };
    badgeMode.textContent = labels[mode] || mode.toUpperCase();
  }

  // Render form spesifik
  if (mode === 'residential') {
    renderResidentialForm(formSlot, currentState, (updatedState) => {
      appState.modes.residential = updatedState;
      updateCalculation();
    });
  } else if (mode === 'commercial') {
    renderCommercialForm(formSlot, currentState, (updatedState) => {
      appState.modes.commercial = updatedState;
      updateCalculation();
    });
  } else if (mode === 'battery') {
    renderBatteryForm(formSlot, currentState, (updatedState) => {
      appState.modes.battery = updatedState;
      updateCalculation();
    });
  } else if (mode === 'pjuts') {
    renderPjutsForm(formSlot, currentState, (updatedState) => {
      appState.modes.pjuts = updatedState;
      updateCalculation();
    });
  }

  updateCalculation();
}

/**
 * Eksekusi kalkulasi real-time dan sinkronkan tautan WhatsApp serta modal QR
 */
function updateCalculation() {
  const mode = appState.activeMode;
  const input = appState.modes[mode];
  let result = null;

  if (mode === 'residential') {
    result = calculateResidential(input);
  } else if (mode === 'commercial') {
    result = calculateCommercial(input);
  } else if (mode === 'battery') {
    result = calculateBattery(input);
  } else if (mode === 'pjuts') {
    result = calculatePjuts(input);
  }

  if (!result) return;

  // Generate WhatsApp URL terkini
  const waUrl = generateWhatsAppUrl(mode, input, result);

  // Update CTA WhatsApp Buttons
  const btnWaResult = document.getElementById('btn-result-wa');
  if (btnWaResult) {
    btnWaResult.setAttribute('href', waUrl);
  }

  // Update QR Code SVG di slot modal dialog
  const qrSlot = document.getElementById('qr-code-svg-slot');
  if (qrSlot) {
    qrSlot.innerHTML = generateQrSvg(waUrl, { size: 256, ecc: 'L' });
  }

  // Render Right Panel Visualizations (Fase 6)
  const resultsContainer = document.getElementById('results-container');
  if (resultsContainer) {
    renderResults(resultsContainer, {
      mode,
      input,
      result,
      waUrl,
      onOpenQr: () => {
        const dialog = document.getElementById('modal-qr-dialog');
        if (dialog && typeof dialog.showModal === 'function') {
          dialog.showModal();
        }
      }
    });
  }

  // Dispatch global event untuk kesiapan Fase 6 visualisasi
  window.dispatchEvent(new CustomEvent('app:calculation-updated', {
    detail: { mode, input, result, waUrl }
  }));
}

document.addEventListener('DOMContentLoaded', () => {
  // Inisialisasi Header Toolbar
  initHeader({
    onReset: () => {
      // Kembalikan mode aktif ke state default
      appState.modes[appState.activeMode] = JSON.parse(JSON.stringify(DEFAULT_APP_STATE.modes[appState.activeMode]));
      mountActiveForm();
    },
    onOpenQr: () => {
      const dialog = document.getElementById('modal-qr-dialog');
      if (dialog && typeof dialog.showModal === 'function') {
        dialog.showModal();
      }
    }
  });

  // Hubungkan tombol QR pada kartu konversi hasil
  const btnResultQr = document.getElementById('btn-result-qr');
  if (btnResultQr) {
    btnResultQr.addEventListener('click', () => {
      const dialog = document.getElementById('modal-qr-dialog');
      if (dialog && typeof dialog.showModal === 'function') {
        dialog.showModal();
      }
    });
  }

  // Inisialisasi Tab Mode Simulator
  initTabs({
    initialMode: appState.activeMode,
    onTabChange: (newMode) => {
      appState.activeMode = newMode;
      mountActiveForm();
    }
  });

  // Modal QR Dialog close listener
  const btnCloseModal = document.getElementById('btn-modal-close');
  const dialog = document.getElementById('modal-qr-dialog');
  if (btnCloseModal && dialog) {
    btnCloseModal.addEventListener('click', () => {
      dialog.close();
    });
    dialog.addEventListener('click', (e) => {
      const rect = dialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        dialog.close();
      }
    });
  }

  // Render initial form
  mountActiveForm();
});
