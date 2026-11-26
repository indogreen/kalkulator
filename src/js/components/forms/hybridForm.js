/**
 * PT. Indogreen Technology And Management
 * Form Component: Unified PLTS Hybrid Off-Grid (6-Step Input)
 *
 * Compliant with:
 * - INDOGREEN Design System (DESIGN.md): 2px radius (rounded-sm), flat CAD styling, >= 44px touch targets
 * - Modern Web Guidance: Semantic <fieldset>/<legend>, type="text" + inputmode="numeric",
 *   post-interaction validation on blur, native labeled <input type="range"> with progress var sync
 * - 6 Steps:
 *   1. Kategori Peruntukan (Residential / Bisnis)
 *   2. Daya PLN (Dynamic PLN 2026 tariffs + Subsidi/Non-Subsidi badge)
 *   3. Biaya Listrik per Bulan (Formatted Rp + Quick chips + Live kWh preview)
 *   4. Persen Pemakaian Siang & Malam (Dual balanced inputs + Slider + CAD bar)
 *   5. Sistem PLTS (Hybrid Offgrid active info card)
 *   6. Support PLTS (25% / 50% / 75% / 100%)
 */

import {
  HYBRID_TECH_CONFIG,
  HYBRID_PLN_TARIFFS,
  getHybridTariffOption
} from '../../calculator/constants.js';
import { formatNumber } from '../../utils/formatter.js';

export const HYBRID_BILL_CHIPS = [
  { label: 'Rp 1 Jt', value: 1000000 },
  { label: 'Rp 2,5 Jt', value: 2500000 },
  { label: 'Rp 5 Jt', value: 5000000 },
  { label: 'Rp 10 Jt', value: 10000000 }
];

export const HYBRID_COVERAGE_OPTIONS = [
  { value: 25, label: '25%', sub: 'dari PLTS' },
  { value: 50, label: '50%', sub: 'dari PLTS' },
  { value: 75, label: '75%', sub: 'dari PLTS' },
  { value: 100, label: '100%', sub: 'dari PLTS' }
];

export const MIN_VALID_MONTHLY_BILL = 50000;

/**
 * Render formulir 6-langkah PLTS Hybrid Off-Grid ke dalam kontainer DOM
 *
 * @param {HTMLElement} container - Kontainer target DOM
 * @param {Object} state - State parameter saat ini
 * @param {Function} onChange - Callback pembaruan state reaktif
 */
export function renderHybridForm(container, state = {}, onChange = () => {}) {
  const kategori = state.kategori === 'Bisnis' ? 'Bisnis' : 'Residential';
  const dayaObj = getHybridTariffOption(kategori, state.dayaId);
  const biayaBulanan = state.biayaBulanan !== undefined && state.biayaBulanan !== null
    ? Math.max(0, Number(state.biayaBulanan) || 0)
    : 2500000;

  let persenSiang = 40;
  if (state.persenSiang !== undefined && state.persenSiang !== null && !isNaN(Number(state.persenSiang))) {
    persenSiang = Math.max(0, Math.min(100, Math.round(Number(state.persenSiang))));
  }
  const persenMalam = 100 - persenSiang;
  const persenCover = [25, 50, 75, 100].includes(Number(state.persenCover))
    ? Number(state.persenCover)
    : 100;

  const current = {
    kategori,
    dayaId: dayaObj.id,
    biayaBulanan,
    persenSiang,
    persenMalam,
    sistem: state.sistem || 'Hybrid Offgrid',
    persenCover
  };

  const tariffList = HYBRID_PLN_TARIFFS[current.kategori];
  const initialKwhMonth = dayaObj.tariff > 0 ? current.biayaBulanan / dayaObj.tariff : 0;
  const initialKwhDay = initialKwhMonth / HYBRID_TECH_CONFIG.DAYS_PER_MONTH;

  container.innerHTML = `
    <form id="form-hybrid" class="flex flex-col gap-6" novalidate>

      <!-- 1. Kategori Peruntukan -->
      <fieldset class="flex flex-col gap-2.5 border-0 p-0 m-0">
        <legend class="text-sm font-semibold text-ink mb-0.5">
          1. Kategori Peruntukan
        </legend>
        <p class="text-xs text-mute">Pilih kategori pelanggan PLN</p>

        <div class="grid grid-cols-2 gap-3">
          ${[
            { id: 'Residential', title: 'Residential', desc: 'R-1 s/d R-3' },
            { id: 'Bisnis', title: 'Bisnis', desc: 'B-1 s/d B-3' }
          ].map(cat => {
            const isSelected = current.kategori === cat.id;
            return `
              <label for="radio-cat-${cat.id}" class="cursor-pointer block">
                <input type="radio"
                  id="radio-cat-${cat.id}"
                  name="kategori"
                  value="${cat.id}"
                  class="sr-only peer"
                  ${isSelected ? 'checked' : ''}>
                <div class="category-card min-h-touch p-3.5 border rounded-sm transition-all select-none peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-primary peer-focus-visible:outline-offset-2 ${
                  isSelected
                    ? 'border-2 border-primary bg-surface-soft'
                    : 'border-hairline bg-canvas hover:border-hairline-strong'
                }">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-sm font-bold text-ink">${cat.title}</span>
                    <span class="w-4 h-4 rounded-sm border border-hairline-strong flex items-center justify-center bg-canvas">
                      <span class="cat-dot w-2 h-2 rounded-xs bg-primary transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0'}"></span>
                    </span>
                  </div>
                  <span class="block text-xs text-mute leading-snug">${cat.desc}</span>
                </div>
              </label>
            `;
          }).join('')}
        </div>
      </fieldset>

      <!-- 2. Daya PLN -->
      <div class="flex flex-col gap-2.5">
        <div class="flex items-center justify-between gap-2">
          <div>
            <label for="select-hybrid-daya" class="text-sm font-semibold text-ink block">
              2. Daya PLN
            </label>
            <span class="text-xs text-mute">
              Golongan <strong id="label-hybrid-kategori" class="text-ink font-semibold">${current.kategori}</strong>
            </span>
          </div>
          <span id="badge-hybrid-daya-status" class="px-2.5 py-0.5 rounded-sm text-[11px] font-bold uppercase tracking-wide border ${
            dayaObj.status === 'Bersubsidi'
              ? 'bg-accent-yellow-pale text-ink border-warning'
              : 'bg-surface-soft text-primary-dark border-primary'
          }">
            ${dayaObj.status}
          </span>
        </div>

        <select id="select-hybrid-daya"
          name="dayaId"
          class="min-h-touch w-full border border-hairline bg-canvas px-md py-2.5 text-ink font-semibold text-xs mobile:text-sm rounded-sm focus:border-2 focus:border-primary focus:outline-none">
          ${tariffList.map(item => `
            <option value="${item.id}" ${item.id === dayaObj.id ? 'selected' : ''}>
              ${item.label}
            </option>
          `).join('')}
        </select>

        <div class="flex items-center justify-between px-3 py-2 rounded-sm bg-surface-soft border border-hairline text-xs">
          <span class="text-mute font-medium">Tarif Dasar Listrik:</span>
          <span id="display-hybrid-tariff" class="font-bold text-primary-dark tabular-nums">
            Rp ${formatNumber(dayaObj.tariff, 2)} / kWh
          </span>
        </div>
      </div>

      <!-- 3. Biaya Listrik per Bulan -->
      <div class="flex flex-col gap-2.5">
        <label for="input-hybrid-bill" class="text-sm font-semibold text-ink">
          3. Biaya Listrik per Bulan (Rp)
        </label>

        <div class="relative flex items-center">
          <span class="absolute left-md text-mute font-bold text-sm pointer-events-none select-none">Rp</span>
          <input type="text"
            id="input-hybrid-bill"
            name="biayaBulanan"
            inputmode="numeric"
            enterkeyhint="next"
            value="${current.biayaBulanan > 0 ? current.biayaBulanan.toLocaleString('id-ID') : ''}"
            placeholder="Contoh: 2.500.000"
            aria-describedby="hint-hybrid-bill"
            aria-invalid="false"
            class="h-touch w-full border border-hairline bg-canvas pl-xxl pr-md py-input-y text-ink font-bold text-sm tabular-nums rounded-sm focus:border-2 focus:border-primary focus:outline-none">
        </div>

        <p id="error-hybrid-bill" class="hidden text-xs font-semibold text-error flex items-center gap-1.5" role="status">
          <span aria-hidden="true">!</span>
          <span>Masukkan biaya listrik per bulan minimal Rp 50.000.</span>
        </p>

        <!-- Quick Chips Preset (44px min touch target) -->
        <div class="flex flex-wrap items-center gap-2" role="group" aria-label="Preset cepat biaya listrik bulanan">
          ${HYBRID_BILL_CHIPS.map(chip => {
            const isChipActive = current.biayaBulanan === chip.value;
            return `
              <button type="button"
                class="btn-hybrid-bill-chip min-h-touch min-w-[44px] px-sm py-xs border rounded-sm text-xs font-semibold tabular-nums transition-all select-none ${
                  isChipActive
                    ? 'border-2 border-primary bg-primary text-on-primary font-bold'
                    : 'border-hairline bg-surface-soft text-ink hover:border-hairline-strong'
                }"
                data-bill="${chip.value}"
                aria-pressed="${isChipActive ? 'true' : 'false'}">
                ${chip.label}
              </button>
            `;
          }).join('')}
        </div>

        <!-- Live kWh Estimate -->
        <div class="grid grid-cols-2 gap-3 p-3 rounded-sm bg-surface-soft border border-hairline">
          <div class="flex flex-col gap-0.5">
            <span class="text-[11px] text-mute font-semibold uppercase tracking-wide">Estimasi / Bulan</span>
            <strong id="preview-hybrid-kwh-month" class="text-sm font-bold text-ink tabular-nums">
              ${formatNumber(initialKwhMonth, 1)} kWh
            </strong>
          </div>
          <div class="flex flex-col gap-0.5 border-l border-hairline pl-3">
            <span class="text-[11px] text-mute font-semibold uppercase tracking-wide">Rata-Rata / Hari</span>
            <strong id="preview-hybrid-kwh-day" class="text-sm font-bold text-primary-dark tabular-nums">
              ${formatNumber(initialKwhDay, 2)} kWh
            </strong>
          </div>
        </div>
      </div>

      <!-- 4. Persen Pemakaian Siang & Malam -->
      <fieldset class="flex flex-col gap-2.5 border-0 p-0 m-0">
        <div class="flex items-center justify-between gap-2">
          <legend class="text-sm font-semibold text-ink">
            4. Persen Pemakaian Siang &amp; Malam
          </legend>
          <span class="text-xs font-semibold px-2 py-0.5 bg-surface-soft border border-hairline rounded-sm text-ink tabular-nums">
            Total 100%
          </span>
        </div>

        <!-- Dual Manual Inputs (Siang & Malam) -->
        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1.5">
            <label for="input-hybrid-day-percent" class="text-xs font-semibold text-ink flex items-center justify-between">
              <span>Siang Hari</span>
              <span class="text-[11px] text-mute font-normal hidden mobile:inline">06:00–18:00</span>
            </label>
            <div class="relative flex items-center">
              <input type="text"
                id="input-hybrid-day-percent"
                name="persenSiang"
                inputmode="numeric"
                enterkeyhint="next"
                value="${current.persenSiang}"
                aria-describedby="hint-hybrid-ratio"
                class="h-touch w-full border border-hairline bg-canvas px-md pr-8 py-input-y text-ink font-bold text-sm tabular-nums rounded-sm focus:border-2 focus:border-primary focus:outline-none">
              <span class="absolute right-md text-mute font-bold text-sm pointer-events-none select-none">%</span>
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="input-hybrid-night-percent" class="text-xs font-semibold text-ink flex items-center justify-between">
              <span>Malam Hari</span>
              <span class="text-[11px] text-mute font-normal hidden mobile:inline">18:00–06:00</span>
            </label>
            <div class="relative flex items-center">
              <input type="text"
                id="input-hybrid-night-percent"
                name="persenMalam"
                inputmode="numeric"
                enterkeyhint="done"
                value="${current.persenMalam}"
                aria-describedby="hint-hybrid-ratio"
                class="h-touch w-full border border-hairline bg-canvas px-md pr-8 py-input-y text-ink font-bold text-sm tabular-nums rounded-sm focus:border-2 focus:border-primary focus:outline-none">
              <span class="absolute right-md text-mute font-bold text-sm pointer-events-none select-none">%</span>
            </div>
          </div>
        </div>

        <!-- Labeled Range Slider -->
        <div class="flex flex-col gap-1">
          <label for="slider-hybrid-day" class="sr-only">Geser persentase pemakaian listrik siang hari</label>
          <input type="range"
            id="slider-hybrid-day"
            min="0"
            max="100"
            step="1"
            value="${current.persenSiang}"
            aria-valuetext="Siang ${current.persenSiang} persen, Malam ${current.persenMalam} persen"
            class="cad-range-slider w-full"
            style="--attr-min: 0; --attr-max: 100; --control-value: ${current.persenSiang};">

          <!-- Stacked Visual Bar (CAD Flat) -->
          <div class="h-2.5 w-full bg-surface-soft rounded-sm overflow-hidden flex border border-hairline" aria-hidden="true">
            <div id="bar-hybrid-day" class="bg-primary h-full transition-all duration-150" style="width: ${current.persenSiang}%"></div>
            <div id="bar-hybrid-night" class="bg-ink h-full transition-all duration-150" style="width: ${current.persenMalam}%"></div>
          </div>
          <div class="flex items-center justify-between text-[11px] text-mute tabular-nums pt-0.5">
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 inline-block bg-primary rounded-xs" aria-hidden="true"></span>
              Siang: <strong id="label-hybrid-day-val" class="text-ink font-semibold">${current.persenSiang}%</strong> (PV Langsung)
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 inline-block bg-ink rounded-xs" aria-hidden="true"></span>
              Malam: <strong id="label-hybrid-night-val" class="text-ink font-semibold">${current.persenMalam}%</strong> (Battery)
            </span>
          </div>
        </div>
      </fieldset>

      <!-- 5. Sistem PLTS -->
      <div class="flex flex-col gap-2.5">
        <div class="flex items-center justify-between">
          <span class="text-sm font-semibold text-ink">5. Sistem PLTS</span>
          <span class="px-2 py-0.5 rounded-sm text-[11px] font-bold uppercase bg-primary text-on-primary">Aktif</span>
        </div>

        <div class="p-3.5 rounded-sm border-2 border-primary bg-surface-soft flex items-start gap-3">
          <div class="w-9 h-9 rounded-sm bg-ink text-primary flex items-center justify-center shrink-0 border border-hairline-strong" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="text-sm font-bold text-ink">Hybrid Offgrid</span>
            <p class="text-xs text-mute leading-relaxed">
              PV + <strong class="text-ink">Hybrid Inverter</strong> + <strong class="text-ink">Baterai LiFePO4</strong> untuk suplai siang &amp; malam hari, dengan PLN sebagai backup otomatis (<em>Zero Export</em>).
            </p>
          </div>
        </div>
      </div>

      <!-- 6. Support PLTS -->
      <div class="pt-4 border-t border-hairline">
        <fieldset class="flex flex-col gap-2.5 border-0 p-0 m-0">
          <legend class="text-sm font-semibold text-ink mb-0.5">
            6. Support PLTS
          </legend>
          <p class="text-xs text-mute">Pemakaian PLTS terhadap kebutuhan listrik</p>

          <div class="grid grid-cols-2 mobile:grid-cols-4 gap-2">
            ${HYBRID_COVERAGE_OPTIONS.map(opt => {
              const isSelected = current.persenCover === opt.value;
              return `
                <label for="radio-cover-${opt.value}" class="cursor-pointer block">
                  <input type="radio"
                    id="radio-cover-${opt.value}"
                    name="persenCover"
                    value="${opt.value}"
                    class="sr-only peer"
                    ${isSelected ? 'checked' : ''}>
                  <div class="coverage-card min-h-touch py-2.5 px-2 rounded-sm border text-center transition-all select-none peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-primary peer-focus-visible:outline-offset-2 ${
                    isSelected
                      ? 'border-2 border-primary bg-ink text-on-dark'
                      : 'border-hairline bg-surface-soft text-ink hover:border-hairline-strong'
                  }">
                    <span class="text-base font-bold block tabular-nums">${opt.label}</span>
                    <span class="coverage-sub text-[11px] font-medium block mt-0.5 ${
                      isSelected ? 'text-primary' : 'text-mute'
                    }">${opt.sub}</span>
                  </div>
                </label>
              `;
            }).join('')}
          </div>
        </fieldset>
      </div>

    </form>
  `;

  // ==========================================
  // Event Bindings & Reactive UI Updates
  // ==========================================
  const form = container.querySelector('#form-hybrid');
  const dayaSelect = container.querySelector('#select-hybrid-daya');
  const labelKategori = container.querySelector('#label-hybrid-kategori');
  const badgeStatus = container.querySelector('#badge-hybrid-daya-status');
  const displayTariff = container.querySelector('#display-hybrid-tariff');
  const billInput = container.querySelector('#input-hybrid-bill');
  const billError = container.querySelector('#error-hybrid-bill');
  const previewKwhMonth = container.querySelector('#preview-hybrid-kwh-month');
  const previewKwhDay = container.querySelector('#preview-hybrid-kwh-day');
  const dayInput = container.querySelector('#input-hybrid-day-percent');
  const nightInput = container.querySelector('#input-hybrid-night-percent');
  const daySlider = container.querySelector('#slider-hybrid-day');

  if (form) {
    form.addEventListener('submit', (e) => e.preventDefault());
  }

  function emitChange() {
    onChange({ ...current });
  }

  function updateBillErrorState(show) {
    if (!billInput || !billError) return;
    if (show) {
      billInput.setAttribute('aria-invalid', 'true');
      billInput.setAttribute('aria-describedby', 'hint-hybrid-bill error-hybrid-bill');
      billError.classList.remove('hidden');
    } else {
      billInput.setAttribute('aria-invalid', 'false');
      billInput.setAttribute('aria-describedby', 'hint-hybrid-bill');
      billError.classList.add('hidden');
    }
  }

  function updateKwhPreview() {
    const activeDaya = getHybridTariffOption(current.kategori, current.dayaId);
    const kwhMonth = activeDaya.tariff > 0 ? current.biayaBulanan / activeDaya.tariff : 0;
    const kwhDay = kwhMonth / HYBRID_TECH_CONFIG.DAYS_PER_MONTH;
    if (previewKwhMonth) previewKwhMonth.textContent = `${formatNumber(kwhMonth, 1)} kWh`;
    if (previewKwhDay) previewKwhDay.textContent = `${formatNumber(kwhDay, 2)} kWh`;
  }

  function updateDayaDisplay(selectedObj) {
    if (displayTariff) {
      displayTariff.textContent = `Rp ${formatNumber(selectedObj.tariff, 2)} / kWh`;
    }
    if (badgeStatus) {
      badgeStatus.textContent = selectedObj.status;
      badgeStatus.className = selectedObj.status === 'Bersubsidi'
        ? 'px-2.5 py-0.5 rounded-sm text-[11px] font-bold uppercase tracking-wide border bg-accent-yellow-pale text-ink border-warning'
        : 'px-2.5 py-0.5 rounded-sm text-[11px] font-bold uppercase tracking-wide border bg-surface-soft text-primary-dark border-primary';
    }
    updateKwhPreview();
  }

  function populateDayaDropdown(kategoriVal) {
    if (!dayaSelect) return;
    const list = HYBRID_PLN_TARIFFS[kategoriVal] || HYBRID_PLN_TARIFFS.Residential;
    const defaultOpt = getHybridTariffOption(kategoriVal, null);
    current.dayaId = defaultOpt.id;

    dayaSelect.innerHTML = list.map(item => `
      <option value="${item.id}" ${item.id === defaultOpt.id ? 'selected' : ''}>
        ${item.label}
      </option>
    `).join('');

    if (labelKategori) labelKategori.textContent = kategoriVal;
    updateDayaDisplay(defaultOpt);
  }

  // 1. Kategori Radio Cards
  container.querySelectorAll('input[name="kategori"]').forEach(radio => {
    radio.addEventListener('change', () => {
      current.kategori = radio.value === 'Bisnis' ? 'Bisnis' : 'Residential';
      container.querySelectorAll('input[name="kategori"]').forEach(r => {
        const card = r.parentElement?.querySelector('.category-card');
        const dot = r.parentElement?.querySelector('.cat-dot');
        if (card) {
          card.className = `category-card min-h-touch p-3.5 border rounded-sm transition-all select-none peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-primary peer-focus-visible:outline-offset-2 ${
            r.checked
              ? 'border-2 border-primary bg-surface-soft'
              : 'border-hairline bg-canvas hover:border-hairline-strong'
          }`;
        }
        if (dot) {
          dot.classList.toggle('opacity-100', r.checked);
          dot.classList.toggle('opacity-0', !r.checked);
        }
      });
      populateDayaDropdown(current.kategori);
      emitChange();
    });
  });

  // 2. Dropdown Daya PLN
  if (dayaSelect) {
    dayaSelect.addEventListener('change', () => {
      current.dayaId = dayaSelect.value;
      const chosen = getHybridTariffOption(current.kategori, current.dayaId);
      updateDayaDisplay(chosen);
      emitChange();
    });
  }

  // 3. Biaya Listrik Input & Chips
  function syncBillChips(val) {
    container.querySelectorAll('.btn-hybrid-bill-chip').forEach(chip => {
      const chipVal = Number(chip.getAttribute('data-bill'));
      const active = chipVal === val;
      chip.className = `btn-hybrid-bill-chip min-h-touch min-w-[44px] px-sm py-xs border rounded-sm text-xs font-semibold tabular-nums transition-all select-none ${
        active
          ? 'border-2 border-primary bg-primary text-on-primary font-bold'
          : 'border-hairline bg-surface-soft text-ink hover:border-hairline-strong'
      }`;
      chip.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  if (billInput) {
    billInput.addEventListener('input', () => {
      const rawDigits = billInput.value.replace(/\D/g, '');
      const numVal = parseInt(rawDigits, 10) || 0;
      current.biayaBulanan = numVal;
      billInput.value = numVal > 0 ? numVal.toLocaleString('id-ID') : '';
      if (numVal >= MIN_VALID_MONTHLY_BILL) {
        updateBillErrorState(false);
      }
      syncBillChips(numVal);
      updateKwhPreview();
      emitChange();
    });

    billInput.addEventListener('blur', () => {
      if (current.biayaBulanan < MIN_VALID_MONTHLY_BILL) {
        updateBillErrorState(true);
      } else {
        updateBillErrorState(false);
      }
    });
  }

  container.querySelectorAll('.btn-hybrid-bill-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const val = Number(chip.getAttribute('data-bill')) || 2500000;
      current.biayaBulanan = val;
      if (billInput) billInput.value = val.toLocaleString('id-ID');
      updateBillErrorState(false);
      syncBillChips(val);
      updateKwhPreview();
      emitChange();
    });
  });

  // 4. Persen Siang & Malam (Input Manual + Range Slider + Visual Bar)
  function syncRatioUI(dayVal, source) {
    const clampedDay = Math.max(0, Math.min(100, Math.round(dayVal)));
    const nightVal = 100 - clampedDay;

    current.persenSiang = clampedDay;
    current.persenMalam = nightVal;

    const isDayFocused = typeof document !== 'undefined' && document.activeElement === dayInput;
    const isNightFocused = typeof document !== 'undefined' && document.activeElement === nightInput;

    if (dayInput && source !== 'day-input' && !isDayFocused) {
      dayInput.value = String(clampedDay);
    }
    if (nightInput && source !== 'night-input' && !isNightFocused) {
      nightInput.value = String(nightVal);
    }
    if (daySlider) {
      daySlider.value = String(clampedDay);
      daySlider.setAttribute('aria-valuetext', `Siang ${clampedDay} persen, Malam ${nightVal} persen`);
      daySlider.style?.setProperty('--attr-min', '0');
      daySlider.style?.setProperty('--attr-max', '100');
      daySlider.style?.setProperty('--control-value', String(clampedDay));
    }

    const barDay = container.querySelector('#bar-hybrid-day');
    const barNight = container.querySelector('#bar-hybrid-night');
    const lblDay = container.querySelector('#label-hybrid-day-val');
    const lblNight = container.querySelector('#label-hybrid-night-val');
    if (barDay) barDay.style.width = `${clampedDay}%`;
    if (barNight) barNight.style.width = `${nightVal}%`;
    if (lblDay) lblDay.textContent = `${clampedDay}%`;
    if (lblNight) lblNight.textContent = `${nightVal}%`;

    emitChange();
  }

  if (dayInput) {
    dayInput.addEventListener('input', (e) => {
      const cleaned = String(e.target.value || '').replace(/\D/g, '');
      const val = cleaned === '' ? 0 : parseInt(cleaned, 10);
      syncRatioUI(val, 'day-input');
    });
    dayInput.addEventListener('blur', () => {
      const cleaned = String(dayInput.value || '').replace(/\D/g, '');
      const val = cleaned === '' ? current.persenSiang : Math.max(0, Math.min(100, parseInt(cleaned, 10)));
      dayInput.value = String(val);
      syncRatioUI(val, 'blur');
    });
  }

  if (nightInput) {
    nightInput.addEventListener('input', (e) => {
      const cleaned = String(e.target.value || '').replace(/\D/g, '');
      const nightVal = cleaned === '' ? 0 : Math.max(0, Math.min(100, parseInt(cleaned, 10)));
      syncRatioUI(100 - nightVal, 'night-input');
    });
    nightInput.addEventListener('blur', () => {
      const cleaned = String(nightInput.value || '').replace(/\D/g, '');
      const nightVal = cleaned === '' ? current.persenMalam : Math.max(0, Math.min(100, parseInt(cleaned, 10)));
      nightInput.value = String(nightVal);
      syncRatioUI(100 - nightVal, 'blur');
    });
  }

  if (daySlider) {
    daySlider.addEventListener('input', (e) => {
      syncRatioUI(parseInt(e.target.value, 10) || 0, 'slider');
    });
  }

  // 6. Support PLTS Radio Cards
  container.querySelectorAll('input[name="persenCover"]').forEach(radio => {
    radio.addEventListener('change', () => {
      current.persenCover = Number(radio.value) || 100;
      container.querySelectorAll('input[name="persenCover"]').forEach(r => {
        const card = r.parentElement?.querySelector('.coverage-card');
        const sub = r.parentElement?.querySelector('.coverage-sub');
        if (card) {
          card.className = `coverage-card min-h-touch py-2.5 px-2 rounded-sm border text-center transition-all select-none peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-primary peer-focus-visible:outline-offset-2 ${
            r.checked
              ? 'border-2 border-primary bg-ink text-on-dark'
              : 'border-hairline bg-surface-soft text-ink hover:border-hairline-strong'
          }`;
        }
        if (sub) {
          sub.className = `coverage-sub text-[11px] font-medium block mt-0.5 ${
            r.checked ? 'text-primary' : 'text-mute'
          }`;
        }
      });
      emitChange();
    });
  });
}
