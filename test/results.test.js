/**
 * Unit Test Suite: Results & Financial Visualization Components (Phase 6)
 * PT. Indogreen Technology And Management
 * 
 * Verifies:
 * 1. heroCard.js: CAD black canvas, corner square, display-xl green savings, 4-item specs
 * 2. kpiGrid.js: 4-card metric grid (turnkey investment, % savings, payback/hours, CO2)
 * 3. billBar.js: Baseline vs post-solar comparison bars & Permen ESDM 2/2024 marker
 * 4. timeline.js: 25-year horizontal timeline, BEP marker, milestone ticks
 * 5. schemeTable.js: 3-scheme commercial comparison table & active scheme highlighting
 * 6. conversionCta.js: WhatsApp button (btn-primary) & Barcode button (btn-outline)
 * 7. regulatoryNote.js: Permen ESDM No. 2/2024 compliance & technical standards
 * 8. index.js: Results orchestrator rendering all components into DOM container
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { calculateResidential } from '../src/js/calculator/residential.js';
import { calculateCommercial } from '../src/js/calculator/commercial.js';
import { calculateBattery } from '../src/js/calculator/battery.js';
import { calculatePjuts } from '../src/js/calculator/pjuts.js';

import { getHeroCardHtml } from '../src/js/components/results/heroCard.js';
import { getKpiGridHtml } from '../src/js/components/results/kpiGrid.js';
import { getBillBarHtml } from '../src/js/components/results/billBar.js';
import { getTimelineHtml } from '../src/js/components/results/timeline.js';
import { getSchemeTableHtml } from '../src/js/components/results/schemeTable.js';
import { getConversionCtaHtml } from '../src/js/components/results/conversionCta.js';
import { getRegulatoryNoteHtml } from '../src/js/components/results/regulatoryNote.js';
import { renderResults } from '../src/js/components/results/index.js';

describe('Results Panel Visualizations (Phase 6)', () => {
  // Test data for 4 modes
  const resInput = {
    powerVa: 2200,
    monthlyBill: 1500000,
    region: 'dki_jabar_banten',
    daytimeActivity: 'medium',
    batteryOption: 'hybrid_5',
    roofArea: 30
  };
  const resResult = calculateResidential(resInput);

  const comInput = {
    tariffGroup: 'B-2',
    monthlyBill: 50000000,
    operationalHours: 'office',
    region: 'dki_jabar_banten',
    roofArea: 300,
    activeScheme: 'capex'
  };
  const comResult = calculateCommercial(comInput);

  const batInput = {
    sector: 'residential',
    criticalLoadKw: 2.0,
    backupHours: 4,
    includeSolarCharger: false,
    region: 'dki_jabar_banten'
  };
  const batResult = calculateBattery(batInput);

  const pjuInput = {
    poleCount: 10,
    lampWattage: 60,
    nightHours: 12,
    smartDimming: true,
    autonomyDays: 2,
    region: 'dki_jabar_banten'
  };
  const pjuResult = calculatePjuts(pjuInput);

  test('heroCard.js: renders CAD black hero card with green display-xl for all 4 modes', () => {
    // 1. Residensial
    const resHtml = getHeroCardHtml({ mode: 'residential', input: resInput, result: resResult });
    assert.ok(resHtml.includes('bg-surface-dark'), 'Hero card must have CAD black background');
    assert.ok(resHtml.includes('corner-square'), 'Must contain signature corner square');
    assert.ok(resHtml.includes('type-display-xl'), 'Must contain display-xl typography');
    assert.ok(resHtml.includes('text-primary'), 'Savings number must be in primary green');
    assert.ok(resHtml.includes('KAPASITAS SURYA'), 'Must include capacity spec');
    assert.ok(resHtml.includes('JUMLAH MODUL'), 'Must include module count spec');
    assert.ok(resHtml.includes('BATERAI LIFEPO4'), 'Must include battery spec');
    assert.ok(resHtml.includes('LUAS ATAP MIN.'), 'Must include roof area spec');

    // 2. Komersial
    const comHtml = getHeroCardHtml({ mode: 'commercial', input: comInput, result: comResult });
    assert.ok(comHtml.includes('PENGHEMATAN BULANAN — CAPEX'), 'Must show commercial scheme title');
    assert.ok(comHtml.includes('bg-surface-dark'), 'Must have CAD black canvas');

    // 3. Baterai
    const batHtml = getHeroCardHtml({ mode: 'battery', input: batInput, result: batResult });
    assert.ok(batHtml.includes('DURASI CADANGAN ANTI-PADAM'), 'Must display battery backup headline');
    assert.ok(batHtml.includes('4 Jam'), 'Must display backup hours');

    // 4. PJUTS
    const pjuHtml = getHeroCardHtml({ mode: 'pjuts', input: pjuInput, result: pjuResult });
    assert.ok(pjuHtml.includes('PENGHEMATAN BIAYA LISTRIK SETARA TARIF P-3 PLN'), 'Must display PJUTS P-3 avoided cost title');
  });

  test('kpiGrid.js: renders 4 metric cards for all 4 modes', () => {
    const resHtml = getKpiGridHtml({ mode: 'residential', input: resInput, result: resResult });
    assert.ok(resHtml.includes('TOTAL INVESTASI'), 'Must include Total Investment card');
    assert.ok(resHtml.includes('% HEMAT LISTRIK'), 'Must include Bill Reduction card');
    assert.ok(resHtml.includes('PAYBACK PERIOD'), 'Must include Payback card');
    assert.ok(resHtml.includes('REDUKSI CO₂'), 'Must include Carbon Reduction card');

    const batHtml = getKpiGridHtml({ mode: 'battery', input: batInput, result: batResult });
    assert.ok(batHtml.includes('DURASI CADANGAN'), 'Battery mode must show Backup Duration');
    assert.ok(batHtml.includes('EFISIENSI DOD'), 'Battery mode must show DoD Efficiency');
  });

  test('billBar.js: renders comparison bars and Permen ESDM 2/2024 marker', () => {
    const resHtml = getBillBarHtml({ mode: 'residential', input: resInput, result: resResult });
    assert.ok(resHtml.includes('Sebelum PLTS'), 'Must include before PLTS legend/bar');
    assert.ok(resHtml.includes('Setelah PLTS'), 'Must include after PLTS legend/bar');
    assert.ok(resHtml.includes('bg-mute'), 'Before bar must use gray background');
    assert.ok(resHtml.includes('bg-primary'), 'After bar must use green background');
    assert.ok(resHtml.includes('Permen ESDM No. 2/2024') || resHtml.includes('Rekening Minimum PLN'), 'Must include minimum billing reference');
  });

  test('timeline.js: renders 25-year horizontal payback timeline', () => {
    const resHtml = getTimelineHtml({ mode: 'residential', input: resInput, result: resResult });
    assert.ok(resHtml.includes('PROYEKSI TIMELINE 25 TAHUN'), 'Must have 25-year timeline header');
    assert.ok(resHtml.includes('BEP:'), 'Must show Break-Even Point marker');
    assert.ok(resHtml.includes('Tahun 0') && resHtml.includes('Tahun 25'), 'Must include 25-year tick milestones');
    assert.ok(resHtml.includes('AKUMULASI NETTO 25 TAHUN'), 'Must show cumulative 25-year net profit');
  });

  test('schemeTable.js: renders 3-scheme comparison for commercial mode only', () => {
    // Komersial: renders full comparison table
    const comHtml = getSchemeTableHtml({ mode: 'commercial', input: comInput, result: comResult });
    assert.ok(comHtml.includes('CAPEX Beli Putus'), 'Must include CAPEX scheme');
    assert.ok(comHtml.includes('OPEX PPA'), 'Must include OPEX PPA scheme');
    assert.ok(comHtml.includes('OPEX Sewa 7 Thn'), 'Must include OPEX Lease scheme');
    assert.ok(comHtml.includes('AKTIF'), 'Active scheme must have active badge');

    // Non-komersial: returns empty string
    const resHtml = getSchemeTableHtml({ mode: 'residential', input: resInput, result: resResult });
    assert.equal(resHtml, '', 'Non-commercial mode must return empty string');
  });

  test('conversionCta.js: renders WhatsApp primary button and Sales Barcode outline button', () => {
    const ctaHtml = getConversionCtaHtml({ waUrl: 'https://wa.me/test' });
    assert.ok(ctaHtml.includes('btn-primary'), 'WhatsApp CTA must use btn-primary');
    assert.ok(ctaHtml.includes('btn-outline'), 'Sales Barcode CTA must use btn-outline');
    assert.ok(ctaHtml.includes('Konsultasikan via WhatsApp'), 'Must have correct WhatsApp text');
    assert.ok(ctaHtml.includes('Buka Barcode Sales'), 'Must have correct Barcode button text');
    assert.ok(ctaHtml.includes('https://wa.me/test'), 'Must link to WhatsApp URL');
  });

  test('regulatoryNote.js: includes Permen ESDM 2/2024 and technical standards', () => {
    const regHtml = getRegulatoryNoteHtml({ mode: 'residential' });
    assert.ok(regHtml.includes('PERMEN ESDM 2/2024'), 'Must mention Permen ESDM 2/2024');
    assert.ok(regHtml.includes('40 jam nyala'), 'Must explain 40 operating hours minimum bill');
    assert.ok(regHtml.includes('Zero-Export Grid Protection'), 'Must explain zero-export policy');
    assert.ok(regHtml.includes('SNI / SLO'), 'Must reference official certification');
  });

  test('renderResults: mounts all modules into container and attaches event handlers', () => {
    // Mock DOM container
    let qrOpened = false;
    const listeners = {};
    const mockContainer = {
      innerHTML: '',
      querySelector(selector) {
        if (selector === '#btn-result-qr') {
          return {
            addEventListener(event, cb) {
              listeners[event] = cb;
            }
          };
        }
        return null;
      }
    };

    renderResults(mockContainer, {
      mode: 'commercial',
      input: comInput,
      result: comResult,
      waUrl: 'https://wa.me/628139916890',
      onOpenQr: () => {
        qrOpened = true;
      }
    });

    assert.ok(mockContainer.innerHTML.includes('result-hero-slot'), 'Must include hero slot');
    assert.ok(mockContainer.innerHTML.includes('result-kpi-slot'), 'Must include KPI slot');
    assert.ok(mockContainer.innerHTML.includes('result-billbar-slot'), 'Must include bill bar slot');
    assert.ok(mockContainer.innerHTML.includes('result-schemes-slot'), 'Commercial mode must include schemes slot');
    assert.ok(mockContainer.innerHTML.includes('result-timeline-slot'), 'Must include timeline slot');
    assert.ok(mockContainer.innerHTML.includes('result-cta-slot'), 'Must include CTA slot');
    assert.ok(mockContainer.innerHTML.includes('result-regulatory-slot'), 'Must include regulatory slot');

    // Simulate clicking Buka Barcode
    assert.ok(listeners['click'], 'Click listener must be registered on #btn-result-qr');
    listeners['click']({ preventDefault() {} });
    assert.equal(qrOpened, true, 'onOpenQr callback must be executed on click');
  });
});
