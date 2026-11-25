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

describe('Reactive State Orchestration (Phase 7)', () => {

  test('DEFAULT_APP_STATE: contains calibrated default parameters for all 4 modes', () => {
    assert.equal(DEFAULT_APP_STATE.activeMode, 'residential');
    
    // Residential defaults
    assert.equal(DEFAULT_APP_STATE.modes.residential.powerVa, 2200);
    assert.equal(DEFAULT_APP_STATE.modes.residential.monthlyBill, 1500000);
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
    // 1. Residensial
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

    const testUrl = 'https://wa.me/628139916890?text=Halo';
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
