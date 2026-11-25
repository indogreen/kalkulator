/**
 * PT. Indogreen Technology And Management
 * Test Suite: QA, Accessibility (WCAG 2.1 AA), and Responsive Audit (Phase 8)
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { renderResidentialForm } from '../src/js/components/forms/residentialForm.js';
import { renderCommercialForm } from '../src/js/components/forms/commercialForm.js';
import { renderBatteryForm } from '../src/js/components/forms/batteryForm.js';
import { renderPjutsForm } from '../src/js/components/forms/pjutsForm.js';
import { getConversionCtaHtml } from '../src/js/components/results/conversionCta.js';
import { getKpiGridHtml } from '../src/js/components/results/kpiGrid.js';
import { getHeroCardHtml } from '../src/js/components/results/heroCard.js';
import { calculateResidential } from '../src/js/calculator/residential.js';

describe('Phase 8: Accessibility & WCAG 2.1 AA Audit', () => {
  const indexHtml = fs.readFileSync(path.resolve('index.html'), 'utf8');

  test('1. WAI-ARIA tab semantics: tablist, tab, aria-selected, aria-controls, and tabpanel exist', () => {
    assert.ok(indexHtml.includes('role="tablist"'), 'Must have role="tablist"');
    assert.ok(indexHtml.includes('aria-label="Mode Simulasi Kalkulator Energi"'), 'Tablist must have accessible label');
    
    // Tab items
    const tabModes = ['residential', 'commercial', 'battery', 'pjuts'];
    for (const mode of tabModes) {
      assert.ok(indexHtml.includes(`data-mode="${mode}"`), `Must contain tab for ${mode}`);
      assert.ok(indexHtml.includes(`id="tab-${mode}"`), `Must have id="tab-${mode}"`);
    }
    assert.ok(indexHtml.includes('role="tab"'), 'Tab buttons must have role="tab"');
    assert.ok(indexHtml.includes('aria-selected="true"'), 'Active tab must have aria-selected="true"');
    assert.ok(indexHtml.includes('role="tabpanel"'), 'Form container must have role="tabpanel"');
  });

  test('2. Modal Dialog accessibility: native dialog with role="dialog", aria-modal="true", labelledby & describedby', () => {
    assert.ok(indexHtml.includes('id="modal-qr-dialog"'), 'Dialog must exist with id="modal-qr-dialog"');
    assert.ok(indexHtml.includes('role="dialog"'), 'Dialog must have explicit role="dialog"');
    assert.ok(indexHtml.includes('aria-modal="true"'), 'Dialog must have aria-modal="true"');
    assert.ok(indexHtml.includes('aria-labelledby="modal-qr-title"'), 'Dialog must reference title');
    assert.ok(indexHtml.includes('aria-describedby="modal-qr-desc"'), 'Dialog must reference description');
    assert.ok(indexHtml.includes('aria-label="Tutup Dialog Modal"'), 'Close buttons must have accessible label');
  });

  test('3. Header action toolbar: accessible reset, barcode, and WhatsApp hotline buttons', () => {
    assert.ok(indexHtml.includes('id="btn-reset"'), 'Must have reset button');
    assert.ok(indexHtml.includes('id="btn-qr"'), 'Must have barcode sales button');
    assert.ok(indexHtml.includes('id="btn-header-wa"'), 'Must have header WhatsApp button');
    assert.ok(indexHtml.includes('0817-0092-221'), 'Must display official hotline number');
    assert.ok(indexHtml.includes('aria-label="Reset parameter formulir ke nilai awal"'), 'Reset button must have accessible label');
  });

  test('4. Color contrast: primary buttons strictly use black text (#000000 / text-on-primary) on green (#00b100)', () => {
    const styleCss = fs.readFileSync(path.resolve('src/css/style.css'), 'utf8');
    
    // Button primary css definition
    assert.ok(styleCss.includes('.btn-primary {'), 'Must define .btn-primary');
    assert.ok(styleCss.includes('background-color: #00b100;'), 'Primary button background must be #00b100');
    assert.ok(styleCss.includes('color: #000000;'), 'Primary button text color must be jet black #000000');
    
    // Active chips
    const mockContainer = { innerHTML: '', querySelectorAll: () => [], querySelector: () => null };
    renderResidentialForm(mockContainer, {});
    assert.ok(mockContainer.innerHTML.includes('bg-primary text-on-primary'), 'Active chips must use text-on-primary (black on green)');
  });

  test('5. Touch Target Audit: all form chips and preset buttons satisfy minimum 44x44px touch requirements', () => {
    const mockContainer = { innerHTML: '', querySelectorAll: () => [], querySelector: () => null };
    
    // Residential form
    renderResidentialForm(mockContainer, {});
    assert.ok(mockContainer.innerHTML.includes('min-h-touch min-w-[44px]'), 'Residential chips must have min 44px touch target');
    assert.ok(mockContainer.innerHTML.includes('btn-va-preset h-touch'), 'VA presets must have 44px height (h-touch)');
    assert.ok(mockContainer.innerHTML.includes('role="radiogroup"'), 'Residential options must use role="radiogroup"');

    // Commercial form
    renderCommercialForm(mockContainer, {});
    assert.ok(mockContainer.innerHTML.includes('min-h-touch min-w-[44px]'), 'Commercial chips must have min 44px touch target');
    assert.ok(mockContainer.innerHTML.includes('role="radiogroup"'), 'Commercial options must use role="radiogroup"');

    // Battery form
    renderBatteryForm(mockContainer, {});
    assert.ok(mockContainer.innerHTML.includes('min-h-touch min-w-[44px]'), 'Battery chips must have min 44px touch target');
    assert.ok(mockContainer.innerHTML.includes('grid-cols-3 mobile:grid-cols-5'), 'Battery duration presets must use 3 cols on 320px mobile to prevent squishing');
    assert.ok(mockContainer.innerHTML.includes('min-h-touch min-w-touch'), 'Solar toggle must have 44x44px touch wrapper');

    // PJUTS form
    renderPjutsForm(mockContainer, {});
    assert.ok(mockContainer.innerHTML.includes('min-h-touch min-w-[44px]'), 'PJUTS chips must have min 44px touch target');
    assert.ok(mockContainer.innerHTML.includes('btn-watt-preset h-touch'), 'Watt presets must have 44px height (h-touch)');
    assert.ok(mockContainer.innerHTML.includes('min-h-touch min-w-touch'), 'Smart dimming toggle must have 44x44px touch wrapper');
  });
});

describe('Phase 8: Responsive Layout & Viewport Audit', () => {
  const indexHtml = fs.readFileSync(path.resolve('index.html'), 'utf8');

  test('1. Body has overflow-x-hidden to prevent global page horizontal scroll', () => {
    assert.ok(indexHtml.includes('overflow-x-hidden'), 'Body must contain overflow-x-hidden');
  });

  test('2. Navigation adapts smoothly: labels adapt on mobile to prevent navbar overflow', () => {
    assert.ok(indexHtml.includes('hidden tablet:inline'), 'Navbar text must adapt smoothly on mobile screens');
  });

  test('3. Header action buttons adapt cleanly on mobile', () => {
    assert.ok(indexHtml.includes('hidden mobile:inline'), 'Header action buttons must adapt label on mobile');
  });

  test('4. Segmented tabs stack cleanly on narrow mobile without clipping text', () => {
    assert.ok(indexHtml.includes('pill-tab active w-full mobile:w-auto text-center justify-center'), 'Tabs must be full-width on mobile');
  });

  test('5. KPI Metric Grid stacks cleanly: 1 column on 320px mobile, 2 on 480px mobile, 4 on tablet+', () => {
    const res = calculateResidential({ powerVa: 2200, monthlyBill: 1500000 });
    const kpiHtml = getKpiGridHtml({ mode: 'residential', input: {}, result: res });
    assert.ok(kpiHtml.includes('grid-cols-1 mobile:grid-cols-2 tablet:grid-cols-4'), 'KPI grid must be responsive for 320px mobile');
  });

  test('6. Commercial 3-Scheme table has internal overflow-x-auto with min-width and scroll hint', () => {
    const schemeTablePath = path.resolve('src/js/components/results/schemeTable.js');
    const schemeTableJs = fs.readFileSync(schemeTablePath, 'utf8');
    assert.ok(schemeTableJs.includes('overflow-x-auto'), 'Must have internal scroll container');
    assert.ok(schemeTableJs.includes('min-w-[560px]'), 'Table must have minimum width to maintain structure');
    assert.ok(schemeTableJs.includes('tablet:hidden'), 'Must show mobile swipe hint');
  });
});

describe('Phase 8: Build Verification & Zero External Dependency Leak Check', () => {
  test('1. index.html does not load third-party runtime JS libraries or frameworks', () => {
    const indexHtml = fs.readFileSync(path.resolve('index.html'), 'utf8');
    
    // Check forbidden libraries
    assert.ok(!indexHtml.includes('react'), 'Must not include React runtime');
    assert.ok(!indexHtml.includes('vue'), 'Must not include Vue runtime');
    assert.ok(!indexHtml.includes('chart.js'), 'Must not include Chart.js');
    assert.ok(!indexHtml.includes('bootstrap'), 'Must not include Bootstrap');
    assert.ok(!indexHtml.includes('jquery'), 'Must not include jQuery');
    assert.ok(!indexHtml.includes('cdn.jsdelivr.net'), 'Must not link to external JS CDN');
    assert.ok(!indexHtml.includes('unpkg.com'), 'Must not link to external JS CDN');
  });

  test('2. Standalone bundle dist/js/bundle.js exists and is valid self-contained JS', () => {
    const bundlePath = path.resolve('dist/js/bundle.js');
    assert.ok(fs.existsSync(bundlePath), 'dist/js/bundle.js must exist');
    const content = fs.readFileSync(bundlePath, 'utf8');
    assert.ok(content.length > 10000, 'Bundle must contain compiled code');
    assert.ok(content.includes('PT. Indogreen Technology And Management'), 'Bundle must contain Indogreen header');
    assert.ok(!content.includes('from \''), 'Bundle must have ES module imports resolved/stripped');
  });

  test('3. Minified CSS dist/css/style.css exists and has content', () => {
    const cssPath = path.resolve('dist/css/style.css');
    assert.ok(fs.existsSync(cssPath), 'dist/css/style.css must exist');
    const content = fs.readFileSync(cssPath, 'utf8');
    assert.ok(content.length > 5000, 'Compiled CSS must have substantive rules');
    assert.ok(content.includes('#00b100'), 'Compiled CSS must contain INDOGREEN primary green #00b100');
  });
});
