/**
 * PT. Indogreen Technology And Management
 * Main Application Orchestrator & Reactive State Controller (app.js)
 * 
 * Orchestrates:
 * 1. Reactive State Management across 4 simulation modes (state retention across tab switching)
 * 2. Bi-directional data flow: Form Inputs (Phase 5) -> Calculation Engine (Phase 2) -> Visualizations (Phase 6)
 * 3. Barcode Sales Modal Dialog (modalQr.js) with live WhatsApp QR Code SVG
 * 4. Header Actions: Simulation Reset & Browser Fullscreen API (kiosk presentation mode)
 * 5. Automatic WhatsApp link synchronization with latest simulation payload
 */

import { initHeader } from './components/header.js';
import { initTabs, setActiveTab } from './components/tabs.js';
import { initModalQr, openModalQr, updateModalQrSvg, closeModalQr } from './components/modalQr.js';

import { renderHybridForm } from './components/forms/hybridForm.js';
import { renderResidentialForm } from './components/forms/residentialForm.js';
import { renderCommercialForm } from './components/forms/commercialForm.js';
import { renderBatteryForm } from './components/forms/batteryForm.js';
import { renderPjutsForm } from './components/forms/pjutsForm.js';

import { renderResults } from './components/results/index.js';

import { calculateHybridOffGrid } from './calculator/hybrid.js';
import { calculateResidential } from './calculator/residential.js';
import { calculateCommercial } from './calculator/commercial.js';
import { calculateBattery } from './calculator/battery.js';
import { calculatePjuts } from './calculator/pjuts.js';

import { generateWhatsAppUrl } from './utils/whatsapp.js';

/**
 * Calibrated default parameters (Active: Hybrid Off-Grid; Archived: residential, commercial, battery, pjuts)
 */
export const DEFAULT_APP_STATE = Object.freeze({
  activeMode: 'hybrid',
  modes: {
    hybrid: {
      kategori: 'Residential',
      dayaId: 'R1-1300',
      biayaBulanan: 1000000,
      persenSiang: 40,
      persenMalam: 60,
      sistem: 'Hybrid Offgrid',
      persenCover: 100,
      panelWp: 615,
      batteryUnitKwh: 5
    },
    residential: {
      powerVa: 2200,
      monthlyBill: 1500000,
      daytimePercent: 30,
      nighttimePercent: 70,
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

// Deep clone application state
let appState = JSON.parse(JSON.stringify(DEFAULT_APP_STATE));

// Debounce timer for smooth typing experience
let debounceTimer = null;

/**
 * Get deep clone of current application state
 * @returns {Object}
 */
export function getAppState() {
  return JSON.parse(JSON.stringify(appState));
}

/**
 * Get active simulator mode ('residential' | 'commercial' | 'battery' | 'pjuts')
 * @returns {string}
 */
export function getActiveMode() {
  return appState.activeMode;
}

/**
 * Switch active simulator mode and retain previous state values
 * @param {string} mode - Mode name
 */
export function setActiveMode(mode) {
  if (!appState.modes[mode]) return;
  appState.activeMode = mode;
  mountActiveForm();
}

/**
 * Update parameters for active simulator mode
 * @param {Object} updatedState - Partial or full updated state
 */
export function updateActiveModeState(updatedState) {
  const mode = appState.activeMode;
  appState.modes[mode] = { ...appState.modes[mode], ...updatedState };
  updateCalculation();
}

/**
 * Reset active simulation mode to calibrated defaults
 */
export function resetActiveModeState() {
  const mode = appState.activeMode;
  appState.modes[mode] = JSON.parse(JSON.stringify(DEFAULT_APP_STATE.modes[mode]));
  mountActiveForm();
}

/**
 * Calculate current simulation results
 * @returns {Object|null}
 */
export function calculateCurrentResult() {
  const mode = appState.activeMode;
  const input = appState.modes[mode];

  if (mode === 'hybrid') return calculateHybridOffGrid(input);
  if (mode === 'residential') return calculateResidential(input);
  if (mode === 'commercial') return calculateCommercial(input);
  if (mode === 'battery') return calculateBattery(input);
  if (mode === 'pjuts') return calculatePjuts(input);
  return null;
}

/**
 * Render active form into #form-slot
 */
export function mountActiveForm() {
  if (typeof document === 'undefined') return;
  const formSlot = document.getElementById('form-slot');
  if (!formSlot) return;

  const mode = appState.activeMode;
  const currentState = appState.modes[mode];

  // Update badge indikator mode pada header panel form
  const badgeMode = document.getElementById('active-mode-badge');
  if (badgeMode) {
    const labels = {
      hybrid: 'PLTS HYBRID OFF-GRID',
      residential: 'PLTS ATAP RESIDENSIAL',
      commercial: 'PLTS BISNIS & INDUSTRI',
      battery: 'BATERAI CADANGAN (BESS)',
      pjuts: 'PENERANGAN JALAN (PJUTS)'
    };
    badgeMode.textContent = labels[mode] || mode.toUpperCase();
  }

  // Update accessible label pada kontainer form
  const formContainer = document.getElementById('form-container');
  if (formContainer && mode !== 'hybrid') {
    formContainer.setAttribute('aria-labelledby', `tab-${mode}`);
  }

  // Callback debounced state updater
  const handleFormChange = (updatedState) => {
    appState.modes[mode] = updatedState;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      updateCalculation();
    }, 30);
  };

  // Render form spesifik
  if (mode === 'hybrid') {
    renderHybridForm(formSlot, currentState, handleFormChange);
  } else if (mode === 'residential') {
    renderResidentialForm(formSlot, currentState, handleFormChange);
  } else if (mode === 'commercial') {
    renderCommercialForm(formSlot, currentState, handleFormChange);
  } else if (mode === 'battery') {
    renderBatteryForm(formSlot, currentState, handleFormChange);
  } else if (mode === 'pjuts') {
    renderPjutsForm(formSlot, currentState, handleFormChange);
  }

  // Trigger recalculation immediately
  updateCalculation();
}

/**
 * Eksekusi kalkulasi real-time dan sinkronkan tautan WhatsApp, panel visualisasi, serta modal QR
 */
export function updateCalculation() {
  const mode = appState.activeMode;
  const input = appState.modes[mode];
  const result = calculateCurrentResult();

  if (!result) return;

  // 1. Generate live WhatsApp consultation URL
  const waUrl = generateWhatsAppUrl(mode, input, result);

  if (typeof document !== 'undefined') {
    // 2. Update QR Code SVG di modal dialog (modalQr.js)
    updateModalQrSvg(waUrl);

    // 3. Render Right Panel Visualizations (Phase 6)
    const resultsContainer = document.getElementById('results-container');
    if (resultsContainer) {
      renderResults(resultsContainer, {
        mode,
        input,
        result,
        waUrl,
        onOpenQr: () => {
          openModalQr(waUrl);
        }
      });
    }

    // 4. Update CTA WhatsApp Button di seluruh dokumen
    const btnWaResult = document.getElementById('btn-result-wa');
    if (btnWaResult) {
      btnWaResult.setAttribute('href', waUrl);
    }
  }

  // 5. Dispatch global event untuk ekstensi dan integrasi pihak ketiga
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('app:calculation-updated', {
      detail: { mode, input, result, waUrl }
    }));
  }
}

/**
 * Inisialisasi seluruh sistem aplikasi saat DOM siap
 */
export function initApp() {
  // 1. Inisialisasi Modal QR Barcode Sales Controller
  initModalQr({
    dialog: 'modal-qr-dialog',
    closeButton: 'btn-modal-close',
    qrSlot: 'qr-code-svg-slot'
  });

  // 2. Inisialisasi Header Toolbar (Reset, Barcode, Fullscreen)
  initHeader({
    onReset: () => {
      resetActiveModeState();
    },
    onOpenQr: () => {
      const mode = appState.activeMode;
      const input = appState.modes[mode];
      const result = calculateCurrentResult();
      const waUrl = result ? generateWhatsAppUrl(mode, input, result) : 'https://wa.me/628170092221';
      openModalQr(waUrl);
    }
  });

  // 3. Inisialisasi Tab Mode Simulator
  initTabs({
    initialMode: appState.activeMode,
    onTabChange: (newMode) => {
      setActiveMode(newMode);
    }
  });

  // 4. Global listener untuk tombol QR sekunder
  document.addEventListener('click', (e) => {
    const target = e.target.closest('#btn-result-qr, #btn-qr');
    if (target) {
      e.preventDefault();
      const mode = appState.activeMode;
      const input = appState.modes[mode];
      const result = calculateCurrentResult();
      const waUrl = result ? generateWhatsAppUrl(mode, input, result) : 'https://wa.me/628170092221';
      openModalQr(waUrl);
    }
  });

  // 5. Render formulir awal dan jalankan perhitungan perdana
  mountActiveForm();
}

// Auto-run saat dokumen siap di browser
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
}
