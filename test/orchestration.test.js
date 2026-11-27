/**
 * Unit Test Suite: Reactive State Management & Application Orchestration (Phase 7)
 * PT. Indogreen Technology And Management
 * 
 * Verifies:
 * 1. DEFAULT_APP_STATE: Realistic default parameters for all 4 modes
 * 2. getAppState & setActiveMode: Mode switching and state retention across tabs
 * 3. updateActiveModeState: Instant calculation triggers and parameter updates
 * 4. resetActiveModeState: Reset active mode to calibrated defaults
 * 5. calculateCurrentResult: Calculation engine coordination
 * 6. modalQr.js: QR code SVG updates, dialog open/close, backdrop detection, Escape handling
 * 7. Live WhatsApp URL payload synchronization
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_APP_STATE,
  getAppState,
  getActiveMode,
  setActiveMode,
  updateActiveModeState,
  resetActiveModeState,
  calculateCurrentResult,
  updateCalculation
} from '../src/js/app.js';

import {
  initModalQr,
  openModalQr,
  closeModalQr,
  updateModalQrSvg,
  isModalQrOpen
} from '../src/js/components/modalQr.js';

import { renderResidentialForm } from '../src/js/components/forms/residentialForm.js';
import { renderHybridForm } from '../src/js/components/forms/hybridForm.js';

describe('Reactive State Orchestration (Phase 7)', () => {

  test('DEFAULT_APP_STATE: contains calibrated default parameters for Hybrid Off-Grid and archived modes', () => {
    assert.equal(DEFAULT_APP_STATE.activeMode, 'hybrid');

    // Active Hybrid Off-Grid defaults
    assert.equal(DEFAULT_APP_STATE.modes.hybrid.kategori, 'Residential');
    assert.equal(DEFAULT_APP_STATE.modes.hybrid.dayaId, 'R1-1300');
    assert.equal(DEFAULT_APP_STATE.modes.hybrid.biayaBulanan, 1000000);
    assert.equal(DEFAULT_APP_STATE.modes.hybrid.persenSiang, 40);
    assert.equal(DEFAULT_APP_STATE.modes.hybrid.persenMalam, 60);
    assert.equal(DEFAULT_APP_STATE.modes.hybrid.sistem, 'Hybrid Offgrid');
    assert.equal(DEFAULT_APP_STATE.modes.hybrid.persenCover, 100);
    assert.equal(DEFAULT_APP_STATE.modes.hybrid.panelWp, 615);
    assert.equal(DEFAULT_APP_STATE.modes.hybrid.batteryUnitKwh, 5);

    // Archived Residential defaults
    assert.equal(DEFAULT_APP_STATE.modes.residential.powerVa, 2200);
    assert.equal(DEFAULT_APP_STATE.modes.residential.monthlyBill, 1500000);
    assert.equal(DEFAULT_APP_STATE.modes.residential.daytimePercent, 30);
    assert.equal(DEFAULT_APP_STATE.modes.residential.nighttimePercent, 70);
    assert.equal(DEFAULT_APP_STATE.modes.residential.daytimeActivity, 'medium');
    assert.equal(DEFAULT_APP_STATE.modes.residential.batteryOption, 'hybrid_5');
    assert.equal(DEFAULT_APP_STATE.modes.residential.region, 'dki_jabar_banten');
    assert.equal(DEFAULT_APP_STATE.modes.residential.roofArea, 30);

    // Commercial defaults
    assert.equal(DEFAULT_APP_STATE.modes.commercial.tariffGroup, 'B-2');
    assert.equal(DEFAULT_APP_STATE.modes.commercial.monthlyBill, 50000000);
    assert.equal(DEFAULT_APP_STATE.modes.commercial.operationalHours, 'office');
    assert.equal(DEFAULT_APP_STATE.modes.commercial.activeScheme, 'capex');
    assert.equal(DEFAULT_APP_STATE.modes.commercial.region, 'dki_jabar_banten');
    assert.equal(DEFAULT_APP_STATE.modes.commercial.roofArea, 300);

    // Battery defaults
    assert.equal(DEFAULT_APP_STATE.modes.battery.sector, 'residential');
    assert.equal(DEFAULT_APP_STATE.modes.battery.criticalLoadKw, 2.0);
    assert.equal(DEFAULT_APP_STATE.modes.battery.backupHours, 4);
    assert.equal(DEFAULT_APP_STATE.modes.battery.includeSolarCharger, false);

    // PJUTS defaults
    assert.equal(DEFAULT_APP_STATE.modes.pjuts.poleCount, 10);
    assert.equal(DEFAULT_APP_STATE.modes.pjuts.lampWattage, 60);
    assert.equal(DEFAULT_APP_STATE.modes.pjuts.nightHours, 12);
    assert.equal(DEFAULT_APP_STATE.modes.pjuts.smartDimming, true);
    assert.equal(DEFAULT_APP_STATE.modes.pjuts.autonomyDays, 2);
  });

  test('calculateCurrentResult: calculates result according to active mode', () => {
    // 0. Unified Hybrid Off-Grid (Active Default)
    setActiveMode('hybrid');
    const hybridResult = calculateCurrentResult();
    assert.equal(hybridResult.mode, 'hybrid');
    assert.equal(hybridResult.pv.jumlahPanel, 13);
    assert.equal(hybridResult.pv.panelWp, 615);
    assert.equal(hybridResult.inverter.kapasitasInverterKw, 8);
    assert.equal(hybridResult.battery.jumlahModulBattery, 4);

    // 1. Residensial (Arsip)
    setActiveMode('residential');
    const resResult = calculateCurrentResult();
    assert.equal(resResult.mode, 'residential');
    assert.ok(resResult.billing.monthlySavings > 0);

    // 2. Komersial
    setActiveMode('commercial');
    const comResult = calculateCurrentResult();
    assert.equal(comResult.mode, 'commercial');
    assert.ok(comResult.activeScheme.monthlyNetSavings > 0);

    // 3. Baterai
    setActiveMode('battery');
    const batResult = calculateCurrentResult();
    assert.equal(batResult.mode, 'battery');
    assert.ok(batResult.battery.actualBackupHours >= 4, 'Actual backup hours must meet or exceed target');

    // 4. PJUTS
    setActiveMode('pjuts');
    const pjuResult = calculateCurrentResult();
    assert.equal(pjuResult.mode, 'pjuts');
    assert.ok(pjuResult.financial.avoidedCostMonthlyRp > 0);
  });

  test('updateActiveModeState: updates active mode parameters without mutating defaults', () => {
    setActiveMode('residential');
    updateActiveModeState({ monthlyBill: 3000000, powerVa: 3500 });
    
    const state = getAppState();
    assert.equal(state.modes.residential.monthlyBill, 3000000);
    assert.equal(state.modes.residential.powerVa, 3500);
    
    // Default state remains pristine
    assert.equal(DEFAULT_APP_STATE.modes.residential.monthlyBill, 1500000);
    assert.equal(DEFAULT_APP_STATE.modes.residential.powerVa, 2200);

    const updatedResult = calculateCurrentResult();
    assert.ok(updatedResult.billing.monthlySavings > 0);
  });

  test('resetActiveModeState: restores active mode to default parameters', () => {
    setActiveMode('residential');
    updateActiveModeState({ monthlyBill: 5000000, powerVa: 5500 });
    assert.equal(getAppState().modes.residential.monthlyBill, 5000000);

    resetActiveModeState();
    const restored = getAppState();
    assert.equal(restored.modes.residential.monthlyBill, 1500000);
    assert.equal(restored.modes.residential.powerVa, 2200);
  });

  test('State retention across tab switching: retains previous inputs when returning to a mode', () => {
    // Set custom value on residential
    setActiveMode('residential');
    updateActiveModeState({ monthlyBill: 2500000 });

    // Switch to commercial and set custom value
    setActiveMode('commercial');
    updateActiveModeState({ monthlyBill: 80000000 });

    // Switch back to residential: verify value was preserved
    setActiveMode('residential');
    assert.equal(getAppState().modes.residential.monthlyBill, 2500000);

    // Switch back to commercial: verify value was preserved
    setActiveMode('commercial');
    assert.equal(getAppState().modes.commercial.monthlyBill, 80000000);
  });
});

describe('Modal QR Component (modalQr.js)', () => {
  let mockDialog;
  let mockCloseBtn;
  let mockQrSlot;
  let listeners;

  beforeEach(() => {
    listeners = {};
    mockDialog = {
      open: false,
      showModal() {
        this.open = true;
      },
      close() {
        this.open = false;
      },
      getBoundingClientRect() {
        return { top: 100, bottom: 400, left: 100, right: 400, width: 300, height: 300 };
      },
      addEventListener(event, cb) {
        listeners[event] = cb;
      }
    };

    mockCloseBtn = {
      addEventListener(event, cb) {
        listeners['closeBtn:' + event] = cb;
      }
    };

    mockQrSlot = {
      innerHTML: '',
      querySelector(selector) {
        return this.innerHTML.includes('<svg') ? {} : null;
      }
    };
  });

  test('initModalQr: initializes controller and binds events', () => {
    const controller = initModalQr({
      dialog: mockDialog,
      closeButton: mockCloseBtn,
      qrSlot: mockQrSlot
    });

    assert.ok(typeof controller.open === 'function');
    assert.ok(typeof controller.close === 'function');
    assert.ok(typeof controller.update === 'function');
    assert.ok(typeof controller.isOpen === 'function');
  });

  test('openModalQr & closeModalQr: opens dialog and updates QR SVG', () => {
    initModalQr({
      dialog: mockDialog,
      closeButton: mockCloseBtn,
      qrSlot: mockQrSlot
    });

    const testUrl = 'https://wa.me/628170092221?text=Halo';
    openModalQr(testUrl);

    assert.equal(mockDialog.open, true, 'Dialog must be open');
    assert.ok(mockQrSlot.innerHTML.includes('<svg'), 'QR slot must contain SVG');
    assert.ok(mockQrSlot.innerHTML.includes('viewBox='), 'SVG must have viewBox');

    closeModalQr();
    assert.equal(mockDialog.open, false, 'Dialog must be closed');
  });

  test('updateModalQrSvg: updates SVG without opening dialog', () => {
    initModalQr({
      dialog: mockDialog,
      closeButton: mockCloseBtn,
      qrSlot: mockQrSlot
    });

    assert.equal(mockDialog.open, false);
    updateModalQrSvg('https://indogreen.id/test');
    assert.ok(mockQrSlot.innerHTML.includes('<svg'), 'QR slot must contain generated SVG');
    assert.equal(mockDialog.open, false, 'Dialog must remain closed');
  });

  test('Backdrop click closes dialog when click is outside bounding box', () => {
    initModalQr({
      dialog: mockDialog,
      closeButton: mockCloseBtn,
      qrSlot: mockQrSlot
    });

    mockDialog.open = true;
    assert.ok(listeners['click'], 'Dialog click listener must exist');

    // Click inside: (clientX 200, clientY 200) -> should not close
    listeners['click']({ clientX: 200, clientY: 200 });
    assert.equal(mockDialog.open, true, 'Dialog should stay open when clicked inside');

    // Click outside: (clientX 50, clientY 50) -> should close
    listeners['click']({ clientX: 50, clientY: 50 });
    assert.equal(mockDialog.open, false, 'Dialog should close when clicked outside (backdrop)');
  });

  test('Close button click closes dialog', () => {
    initModalQr({
      dialog: mockDialog,
      closeButton: mockCloseBtn,
      qrSlot: mockQrSlot
    });

    mockDialog.open = true;
    assert.ok(listeners['closeBtn:click'], 'Close button listener must exist');

    listeners['closeBtn:click']();
    assert.equal(mockDialog.open, false, 'Dialog must be closed on button click');
  });
});

describe('Residential Form Component (residentialForm.js)', () => {
  test('Pengisian manual siang & malam otomatis berimbang 100%', () => {
    let capturedState = null;
    const listeners = {};
    const elements = {};

    function createElement(id, val = '') {
      return {
        id,
        value: val,
        style: {},
        textContent: '',
        addEventListener(event, handler) {
          listeners[`${id}:${event}`] = handler;
        }
      };
    }

    elements['input-res-daytime-percent'] = createElement('input-res-daytime-percent', '30');
    elements['input-res-nighttime-percent'] = createElement('input-res-nighttime-percent', '70');
    elements['bar-daytime-visual'] = createElement('bar-daytime-visual');
    elements['bar-nighttime-visual'] = createElement('bar-nighttime-visual');
    elements['label-daytime-val'] = createElement('label-daytime-val');
    elements['label-nighttime-val'] = createElement('label-nighttime-val');

    const mockContainer = {
      innerHTML: '',
      querySelector(selector) {
        const id = selector.replace('#', '');
        return elements[id] || null;
      },
      querySelectorAll(selector) {
        return [];
      }
    };

    renderResidentialForm(mockContainer, { daytimePercent: 30 }, (state) => {
      capturedState = state;
    });

    // 1. Verifikasi render awal
    assert.ok(mockContainer.innerHTML.includes('id="input-res-daytime-percent"'));
    assert.ok(mockContainer.innerHTML.includes('id="input-res-nighttime-percent"'));

    // 2. Simulasi input siang diubah menjadi 30%
    listeners['input-res-daytime-percent:input']({ target: { value: '30' } });
    assert.equal(elements['input-res-nighttime-percent'].value, 70);
    assert.equal(capturedState.daytimePercent, 30);
    assert.equal(capturedState.nighttimePercent, 70);

    // 3. Simulasi input malam diubah menjadi 60%
    listeners['input-res-nighttime-percent:input']({ target: { value: '60' } });
    assert.equal(elements['input-res-daytime-percent'].value, 40);
    assert.equal(capturedState.daytimePercent, 40);
    assert.equal(capturedState.nighttimePercent, 60);
  });
});

describe('Hybrid Form Component (hybridForm.js)', () => {
  test('Sinkronisasi 6 langkah Hybrid Off-Grid: kategori, daya, biaya, siang/malam & slider, dan cover %', () => {
    let capturedState = null;
    const listeners = {};
    const elements = {};
    const radioGroups = { kategori: [], persenCover: [] };

    function createMockEl(id, val = '') {
      return {
        id,
        value: val,
        innerHTML: '',
        className: '',
        textContent: '',
        checked: false,
        style: { setProperty() {} },
        classList: {
          add() {},
          remove() {},
          toggle() {}
        },
        setAttribute() {},
        addEventListener(event, handler) {
          listeners[`${id}:${event}`] = handler;
        },
        parentElement: {
          querySelector() {
            return {
              className: '',
              classList: { toggle() {} }
            };
          }
        }
      };
    }

    elements['form-hybrid'] = createMockEl('form-hybrid');
    elements['select-hybrid-daya'] = createMockEl('select-hybrid-daya', 'R1-1300');
    elements['label-hybrid-kategori'] = createMockEl('label-hybrid-kategori');
    elements['badge-hybrid-daya-status'] = createMockEl('badge-hybrid-daya-status');
    elements['display-hybrid-tariff'] = createMockEl('display-hybrid-tariff');
    elements['input-hybrid-bill'] = createMockEl('input-hybrid-bill', '1.000.000');
    elements['error-hybrid-bill'] = createMockEl('error-hybrid-bill');
    elements['preview-hybrid-kwh-month'] = createMockEl('preview-hybrid-kwh-month');
    elements['preview-hybrid-kwh-day'] = createMockEl('preview-hybrid-kwh-day');
    elements['input-hybrid-day-percent'] = createMockEl('input-hybrid-day-percent', '40');
    elements['input-hybrid-night-percent'] = createMockEl('input-hybrid-night-percent', '60');
    elements['slider-hybrid-day'] = createMockEl('slider-hybrid-day', '40');
    elements['bar-hybrid-day'] = createMockEl('bar-hybrid-day');
    elements['bar-hybrid-night'] = createMockEl('bar-hybrid-night');
    elements['label-hybrid-day-val'] = createMockEl('label-hybrid-day-val');
    elements['label-hybrid-night-val'] = createMockEl('label-hybrid-night-val');

    const catRes = createMockEl('radio-cat-Residential', 'Residential');
    const catBiz = createMockEl('radio-cat-Bisnis', 'Bisnis');
    radioGroups.kategori = [catRes, catBiz];

    const cov50 = createMockEl('radio-cover-50', '50');
    const cov100 = createMockEl('radio-cover-100', '100');
    radioGroups.persenCover = [cov50, cov100];

    const panel610 = createMockEl('radio-panel-610', '610');
    const panel615 = createMockEl('radio-panel-615', '615');
    radioGroups.panelWp = [panel610, panel615];

    const bat5 = createMockEl('radio-bat-5', '5');
    const bat10 = createMockEl('radio-bat-10', '10');
    const bat20 = createMockEl('radio-bat-20', '20');
    radioGroups.batteryUnitKwh = [bat5, bat10, bat20];

    const mockContainer = {
      innerHTML: '',
      querySelector(selector) {
        const id = selector.replace('#', '');
        return elements[id] || null;
      },
      querySelectorAll(selector) {
        if (selector === 'input[name="kategori"]') return radioGroups.kategori;
        if (selector === 'input[name="persenCover"]') return radioGroups.persenCover;
        if (selector === 'input[name="panelWp"]') return radioGroups.panelWp;
        if (selector === 'input[name="batteryUnitKwh"]') return radioGroups.batteryUnitKwh;
        return [];
      }
    };

    renderHybridForm(mockContainer, { biayaBulanan: 1000000, persenSiang: 40 }, (state) => {
      capturedState = state;
    });

    assert.ok(mockContainer.innerHTML.includes('1. Kategori Peruntukan'));
    assert.ok(mockContainer.innerHTML.includes('5. Sistem PLTS'));
    assert.ok(mockContainer.innerHTML.includes('6. Support PLTS'));
    assert.ok(mockContainer.innerHTML.includes('7. Pilihan Solar Panel'));

    // Test input siang 30% -> malam otomatis 70%, slider 30
    listeners['input-hybrid-day-percent:input']({ target: { value: '30' } });
    assert.equal(elements['input-hybrid-night-percent'].value, '70');
    assert.equal(elements['slider-hybrid-day'].value, '30');
    assert.equal(capturedState.persenSiang, 30);
    assert.equal(capturedState.persenMalam, 70);

    // Test slider digeser ke 55% -> siang 55, malam 45
    listeners['slider-hybrid-day:input']({ target: { value: '55' } });
    assert.equal(elements['input-hybrid-day-percent'].value, '55');
    assert.equal(elements['input-hybrid-night-percent'].value, '45');
    assert.equal(capturedState.persenSiang, 55);

    // Test pilih solar panel 610 Wp
    panel610.checked = true;
    panel615.checked = false;
    listeners['radio-panel-610:change']();
    assert.equal(capturedState.panelWp, 610);

    // Test pindah kategori ke Bisnis -> daya otomatis B2-6600
    catBiz.checked = true;
    catRes.checked = false;
    listeners['radio-cat-Bisnis:change']();
    assert.equal(capturedState.kategori, 'Bisnis');
    assert.equal(capturedState.dayaId, 'B2-6600');

    // Test ganti cover PLTS ke 50%
    cov50.checked = true;
    cov100.checked = false;
    listeners['radio-cover-50:change']();
    assert.equal(capturedState.persenCover, 50);

    // Test pilih unit baterai 10 kWh (output modular simetris)
    bat10.checked = true;
    bat5.checked = false;
    listeners['radio-bat-10:change']();
    assert.equal(capturedState.batteryUnitKwh, 10);
  });
});
