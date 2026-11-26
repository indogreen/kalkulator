/**
 * PT. Indogreen Technology And Management
 * Form Component: PLTS Atap Residensial
 * 
 * Compliant with:
 * - INDOGREEN Design System: 2px radius (rounded-sm), flat CAD styling, 44px touch targets
 * - Preset Daya PLN 900 VA - 11.000 VA
 * - Chip Tagihan Cepat Rp 500rb - 5jt
 * - Radio card Aktivitas Siang 25%, 35%, 50%
 * - Radio card Baterai Hybrid (Tanpa, 5.12 kWh, 10.24 kWh)
 * - Dropdown 9 Wilayah PSH & Luas Atap
 */

import { REGIONS_PSH, DAYTIME_ACTIVITY_PATTERNS, BATTERY_HYBRID_OPTIONS } from '../../calculator/constants.js';

export const RESIDENTIAL_POWER_PRESETS = [900, 1300, 2200, 3500, 4400, 5500, 6600, 7700, 11000];
export const RESIDENTIAL_BILL_CHIPS = [
  { label: 'Rp 500rb', value: 500000 },
  { label: 'Rp 1 Jt', value: 1000000 },
  { label: 'Rp 1.5 Jt', value: 1500000 },
  { label: 'Rp 2 Jt', value: 2000000 },
  { label: 'Rp 3.5 Jt', value: 3500000 },
  { label: 'Rp 5 Jt', value: 5000000 }
];

/**
 * Render formulir parameter PLTS Residensial ke dalam kontainer
 * 
 * @param {HTMLElement} container - Kontainer target DOM
 * @param {Object} state - State parameter saat ini
 * @param {Function} onChange - Callback pembaruan state
 */
export function renderResidentialForm(container, state = {}, onChange = () => {}) {
  let daytimePercent = 30;
  if (state.daytimePercent !== undefined && state.daytimePercent !== null && !isNaN(Number(state.daytimePercent))) {
    daytimePercent = Math.max(0, Math.min(100, Math.round(Number(state.daytimePercent))));
  } else if (state.daytimeRatio !== undefined && state.daytimeRatio !== null && !isNaN(Number(state.daytimeRatio))) {
    daytimePercent = Math.max(0, Math.min(100, Math.round(Number(state.daytimeRatio) * 100)));
  } else if (state.daytimeActivity && DAYTIME_ACTIVITY_PATTERNS[state.daytimeActivity]) {
    daytimePercent = Math.round(DAYTIME_ACTIVITY_PATTERNS[state.daytimeActivity].ratio * 100);
  }
  const nighttimePercent = 100 - daytimePercent;

  const current = {
    powerVa: state.powerVa || 2200,
    monthlyBill: state.monthlyBill || 1500000,
    daytimePercent,
    nighttimePercent,
    daytimeRatio: daytimePercent / 100,
    daytimeActivity: state.daytimeActivity || `${daytimePercent}%`,
    batteryOption: state.batteryOption || 'hybrid_5',
    region: state.region || 'dki_jabar_banten',
    roofArea: state.roofArea || 30
  };

  container.innerHTML = `
    <form id="form-residential" class="flex flex-col gap-6" onsubmit="return false;">
      
      <!-- 1. Preset Daya Listrik PLN (VA) -->
      <div class="flex flex-col gap-2.5">
        <div class="flex items-center justify-between">
          <label id="label-res-power" class="text-sm font-semibold text-ink">
            1. Daya Listrik PLN Terpasang
          </label>
          <span id="display-power-va" class="text-sm font-bold text-primary-dark tabular-nums">
            ${current.powerVa.toLocaleString('id-ID')} VA
          </span>
        </div>

        <div class="pl-4">
          <div class="grid grid-cols-3 tablet:grid-cols-5 gap-2" role="group" aria-labelledby="label-res-power">
            ${RESIDENTIAL_POWER_PRESETS.map(va => {
              const isActive = current.powerVa === va;
              return `
                <button type="button" 
                  class="btn-va-preset h-touch border rounded-sm text-xs font-semibold tabular-nums transition-all select-none ${
                    isActive 
                      ? 'border-2 border-primary bg-ink text-on-dark font-bold' 
                      : 'border-hairline bg-surface-soft text-ink hover:border-hairline-strong'
                  }" 
                  data-va="${va}"
                  aria-pressed="${isActive ? 'true' : 'false'}"
                  aria-label="Pilih daya ${va.toLocaleString('id-ID')} VA">
                  ${va.toLocaleString('id-ID')} VA
                </button>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- 2. Nominal Tagihan Listrik Bulanan (Rp) -->
      <div class="flex flex-col gap-2.5">
        <label for="input-res-monthly-bill" id="label-res-bill" class="text-sm font-semibold text-ink">
          2. Rata-Rata Tagihan Listrik per Bulan (Rp)
        </label>

        <div class="pl-4 flex flex-col gap-2.5">
          <div class="relative flex items-center">
            <span class="absolute left-md text-mute font-bold text-sm pointer-events-none select-none">Rp</span>
            <input type="number" 
              id="input-res-monthly-bill" 
              name="monthlyBill"
              min="100000" 
              step="50000"
              value="${current.monthlyBill}" 
              placeholder="Contoh: 1.500.000"
              class="h-touch w-full border border-hairline bg-canvas pl-xxl pr-md py-input-y text-ink font-semibold text-sm tabular-nums rounded-sm focus:border-2 focus:border-primary focus:outline-none">
          </div>

          <!-- Quick Chips Preset (44px min touch target) -->
          <div class="flex flex-wrap items-center gap-2" role="group" aria-label="Preset cepat tagihan listrik bulanan">
            ${RESIDENTIAL_BILL_CHIPS.map(chip => {
              const isChipActive = current.monthlyBill === chip.value;
              return `
                <button type="button" 
                  class="btn-bill-chip min-h-touch min-w-[44px] px-sm py-xs border rounded-sm text-xs font-semibold tabular-nums transition-all select-none ${
                    isChipActive 
                      ? 'border-2 border-primary bg-primary text-on-primary' 
                      : 'border-hairline bg-surface-soft text-ink hover:border-hairline-strong'
                  }" 
                  data-bill="${chip.value}"
                  aria-pressed="${isChipActive ? 'true' : 'false'}"
                  aria-label="Preset tagihan ${chip.label}">
                  ${chip.label}
                </button>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- 3. Pola Penggunaan Listrik Siang & Malam (Manual Input Berimbang) -->
      <div class="flex flex-col gap-2.5">
        <div class="flex items-center justify-between">
          <label id="label-res-daytime" class="text-sm font-semibold text-ink">
            3. Pola Aktivitas Penggunaan Listrik (Siang & Malam)
          </label>
          <span class="text-xs font-semibold px-2 py-0.5 bg-surface-soft border border-hairline rounded-sm text-ink tabular-nums">
            Total 100%
          </span>
        </div>
        <div class="pl-4 flex flex-col gap-2.5">
          <p class="text-xs text-mute leading-normal">
            Tentukan persentase penggunaan listrik siang dan malam hari (otomatis berimbang total 100%).
          </p>
        </p>

        <!-- Dual Manual Input Fields (Siang & Malam) -->
        <div class="grid grid-cols-2 gap-3 tablet:gap-4">
          
          <!-- Input Siang Hari -->
          <div class="flex flex-col gap-1.5">
            <label for="input-res-daytime-percent" class="text-xs font-semibold text-ink flex items-center justify-between">
              <span class="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-primary shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="4"/>
                  <path d="M12 2v2"/>
                  <path d="M12 20v2"/>
                  <path d="m4.93 4.93 1.41 1.41"/>
                  <path d="m17.66 17.66 1.41 1.41"/>
                  <path d="M2 12h2"/>
                  <path d="M20 12h2"/>
                  <path d="m6.34 17.66-1.41 1.41"/>
                  <path d="m19.07 4.93-1.41 1.41"/>
                </svg>
                Siang Hari
              </span>
              <span class="text-[11px] text-mute font-normal hidden mobile:inline">06:00 - 18:00</span>
            </label>
            <div class="relative flex items-center">
              <input type="number" 
                id="input-res-daytime-percent" 
                name="daytimePercent"
                min="0" 
                max="100" 
                step="1"
                value="${current.daytimePercent}" 
                placeholder="30"
                aria-label="Persentase pemakaian listrik siang hari"
                class="h-touch w-full border border-hairline bg-canvas px-md pr-8 py-input-y text-ink font-semibold text-sm tabular-nums rounded-sm focus:border-2 focus:border-primary focus:outline-none">
              <span class="absolute right-md text-mute font-bold text-sm pointer-events-none select-none">%</span>
            </div>
          </div>

          <!-- Input Malam Hari -->
          <div class="flex flex-col gap-1.5">
            <label for="input-res-nighttime-percent" class="text-xs font-semibold text-ink flex items-center justify-between">
              <span class="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-mute shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
                </svg>
                Malam Hari
              </span>
              <span class="text-[11px] text-mute font-normal hidden mobile:inline">18:00 - 06:00</span>
            </label>
            <div class="relative flex items-center">
              <input type="number" 
                id="input-res-nighttime-percent" 
                name="nighttimePercent"
                min="0" 
                max="100" 
                step="1"
                value="${current.nighttimePercent}" 
                placeholder="70"
                aria-label="Persentase pemakaian listrik malam hari"
                class="h-touch w-full border border-hairline bg-canvas px-md pr-8 py-input-y text-ink font-semibold text-sm tabular-nums rounded-sm focus:border-2 focus:border-primary focus:outline-none">
              <span class="absolute right-md text-mute font-bold text-sm pointer-events-none select-none">%</span>
            </div>
          </div>

        </div>

        <!-- CAD Visual Proportion Distribution Bar -->
        <div class="flex flex-col gap-1.5 pt-1">
          <div class="h-2 w-full bg-surface-elevated rounded-sm overflow-hidden flex border border-hairline" role="progressbar" aria-label="Distribusi pemakaian listrik siang dan malam" aria-valuenow="${current.daytimePercent}" aria-valuemin="0" aria-valuemax="100">
            <div id="bar-daytime-visual" class="bg-primary h-full transition-all duration-150" style="width: ${current.daytimePercent}%" title="Siang Hari: ${current.daytimePercent}%"></div>
            <div id="bar-nighttime-visual" class="bg-ink h-full transition-all duration-150" style="width: ${current.nighttimePercent}%" title="Malam Hari: ${current.nighttimePercent}%"></div>
          </div>
          <div class="flex items-center justify-between text-[11px] text-mute font-mono">
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 inline-block bg-primary rounded-sm"></span>
              Siang: <strong id="label-daytime-val" class="text-ink font-semibold">${current.daytimePercent}%</strong>
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 inline-block bg-ink rounded-sm"></span>
              Malam: <strong id="label-nighttime-val" class="text-ink font-semibold">${current.nighttimePercent}%</strong>
            </span>
          </div>
        </div>
        </div>

      </div>

      <!-- 4. Opsi Baterai Cadangan Hybrid LiFePO4 -->
      <div class="flex flex-col gap-2.5">
        <label id="label-res-battery" class="text-sm font-semibold text-ink">
          4. Opsi Penyimpanan Baterai Hybrid (LiFePO4)
        </label>

        <div class="pl-4">
          <div class="grid grid-cols-1 gap-2.5" role="radiogroup" aria-labelledby="label-res-battery">
            ${Object.values(BATTERY_HYBRID_OPTIONS).map(opt => {
              const isSelected = current.batteryOption === opt.id;
              return `
                <label class="radio-card cursor-pointer border rounded-sm p-3.5 flex items-center justify-between gap-3 transition-all select-none ${
                  isSelected 
                    ? 'border-2 border-primary bg-surface-soft' 
                    : 'border-hairline bg-canvas hover:border-hairline-strong'
                }">
                  <div class="flex flex-col gap-0.5">
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-semibold text-ink">${opt.label}</span>
                      ${opt.capacityKwh > 0 ? '<span class="text-[11px] px-2 py-0.5 bg-surface-elevated text-primary font-bold rounded-sm uppercase">Anti-Padam</span>' : ''}
                    </div>
                    <span class="text-xs text-mute leading-normal">${opt.description}</span>
                  </div>
                  <input type="radio" 
                    id="radio-battery-${opt.id}"
                    name="batteryOption" 
                    value="${opt.id}" 
                    class="accent-primary h-4 w-4" 
                    aria-label="${opt.label}: ${opt.description}"
                    ${isSelected ? 'checked' : ''}>
                </label>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- 5. Wilayah Radiasi Matahari & Luas Atap -->
      <div class="grid grid-cols-1 tablet:grid-cols-2 gap-4 tablet:gap-6 pt-4 border-t border-hairline">
        
        <!-- Dropdown Wilayah -->
        <div class="flex flex-col gap-2.5">
          <label for="select-res-region" class="text-sm font-semibold text-ink">
            5. Wilayah Lokasi Proyek
          </label>
          <div class="pl-4">
            <select id="select-res-region" 
              name="region" 
              aria-label="Pilih Wilayah Lokasi Proyek"
              class="h-touch w-full border border-hairline bg-canvas px-md py-input-y text-ink font-semibold text-sm rounded-sm focus:border-2 focus:border-primary focus:outline-none">
              ${Object.values(REGIONS_PSH).map(reg => `
                <option value="${reg.id}" ${current.region === reg.id ? 'selected' : ''}>
                  ${reg.label} (${reg.psh} PSH)
                </option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- Input Luas Atap -->
        <div class="flex flex-col gap-2.5">
          <label for="input-res-roof-area" class="text-sm font-semibold text-ink">
            6. Estimasi Luas Atap (m²)
          </label>
          <div class="pl-4">
            <div class="relative flex items-center">
              <input type="number" 
                id="input-res-roof-area" 
                name="roofArea" 
                min="0" 
                step="5"
                value="${current.roofArea}" 
                placeholder="30"
                aria-label="Estimasi Luas Atap dalam meter persegi"
                class="h-touch w-full border border-hairline bg-canvas px-md py-input-y text-ink font-semibold text-sm tabular-nums rounded-sm focus:border-2 focus:border-primary focus:outline-none">
              <span class="absolute right-md text-mute font-bold text-sm pointer-events-none">m²</span>
            </div>
          </div>
        </div>

      </div>

    </form>
  `;

  // ==========================================
  // Event Bindings
  // ==========================================
  const form = container.querySelector('#form-residential');
  const billInput = container.querySelector('#input-res-monthly-bill');
  const roofInput = container.querySelector('#input-res-roof-area');
  const regionSelect = container.querySelector('#select-res-region');

  function emitChange() {
    onChange({ ...current });
  }

  // 1. Tombol Preset Daya PLN
  container.querySelectorAll('.btn-va-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const va = Number(btn.getAttribute('data-va')) || 2200;
      current.powerVa = va;
      container.querySelectorAll('.btn-va-preset').forEach(b => {
        b.className = 'btn-va-preset h-touch border border-hairline bg-surface-soft text-ink rounded-sm text-xs font-semibold tabular-nums transition-all select-none hover:border-hairline-strong';
        b.setAttribute('aria-pressed', 'false');
      });
      btn.className = 'btn-va-preset h-touch border-2 border-primary bg-ink text-on-dark font-bold rounded-sm text-xs tabular-nums transition-all select-none';
      btn.setAttribute('aria-pressed', 'true');
      const displayVa = container.querySelector('#display-power-va');
      if (displayVa) displayVa.textContent = `${va.toLocaleString('id-ID')} VA`;
      emitChange();
    });
  });

  // 2. Input Tagihan & Chips
  if (billInput) {
    billInput.addEventListener('input', () => {
      current.monthlyBill = Math.max(0, Number(billInput.value) || 0);
      container.querySelectorAll('.btn-bill-chip').forEach(chip => {
        const val = Number(chip.getAttribute('data-bill'));
        if (val === current.monthlyBill) {
          chip.className = 'btn-bill-chip min-h-touch min-w-[44px] px-sm py-xs border-2 border-primary bg-primary text-on-primary rounded-sm text-xs font-semibold tabular-nums transition-all select-none';
          chip.setAttribute('aria-pressed', 'true');
        } else {
          chip.className = 'btn-bill-chip min-h-touch min-w-[44px] px-sm py-xs border border-hairline bg-surface-soft text-ink rounded-sm text-xs font-semibold tabular-nums transition-all select-none hover:border-hairline-strong';
          chip.setAttribute('aria-pressed', 'false');
        }
      });
      emitChange();
    });
  }

  container.querySelectorAll('.btn-bill-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const val = Number(chip.getAttribute('data-bill')) || 1500000;
      current.monthlyBill = val;
      if (billInput) billInput.value = val;
      container.querySelectorAll('.btn-bill-chip').forEach(c => {
        c.className = 'btn-bill-chip min-h-touch min-w-[44px] px-sm py-xs border border-hairline bg-surface-soft text-ink rounded-sm text-xs font-semibold tabular-nums transition-all select-none hover:border-hairline-strong';
        c.setAttribute('aria-pressed', 'false');
      });
      chip.className = 'btn-bill-chip min-h-touch min-w-[44px] px-sm py-xs border-2 border-primary bg-primary text-on-primary rounded-sm text-xs font-semibold tabular-nums transition-all select-none';
      chip.setAttribute('aria-pressed', 'true');
      emitChange();
    });
  });

  // 3. Input Proporsi Siang & Malam (Otomatis Berimbang 100%)
  const inputDaytime = container.querySelector('#input-res-daytime-percent');
  const inputNighttime = container.querySelector('#input-res-nighttime-percent');

  function updateVisualBar(dayVal, nightVal) {
    const barDay = container.querySelector('#bar-daytime-visual');
    const barNight = container.querySelector('#bar-nighttime-visual');
    const lblDay = container.querySelector('#label-daytime-val');
    const lblNight = container.querySelector('#label-nighttime-val');
    if (barDay) barDay.style.width = `${dayVal}%`;
    if (barNight) barNight.style.width = `${nightVal}%`;
    if (lblDay) lblDay.textContent = `${dayVal}%`;
    if (lblNight) lblNight.textContent = `${nightVal}%`;
  }

  function syncFromDaytime(rawVal) {
    let dayVal = Number(rawVal);
    if (isNaN(dayVal)) dayVal = 0;
    dayVal = Math.max(0, Math.min(100, Math.round(dayVal)));
    const nightVal = 100 - dayVal;

    current.daytimePercent = dayVal;
    current.nighttimePercent = nightVal;
    current.daytimeRatio = dayVal / 100;
    current.daytimeActivity = `${dayVal}%`;

    const isNightActive = typeof document !== 'undefined' && document.activeElement === inputNighttime;
    if (inputNighttime && !isNightActive) {
      inputNighttime.value = nightVal;
    }
    updateVisualBar(dayVal, nightVal);
    emitChange();
  }

  function syncFromNighttime(rawVal) {
    let nightVal = Number(rawVal);
    if (isNaN(nightVal)) nightVal = 0;
    nightVal = Math.max(0, Math.min(100, Math.round(nightVal)));
    const dayVal = 100 - nightVal;

    current.nighttimePercent = nightVal;
    current.daytimePercent = dayVal;
    current.daytimeRatio = dayVal / 100;
    current.daytimeActivity = `${dayVal}%`;

    const isDayActive = typeof document !== 'undefined' && document.activeElement === inputDaytime;
    if (inputDaytime && !isDayActive) {
      inputDaytime.value = dayVal;
    }
    updateVisualBar(dayVal, nightVal);
    emitChange();
  }

  if (inputDaytime) {
    inputDaytime.addEventListener('input', (e) => {
      syncFromDaytime(e.target.value);
    });
    inputDaytime.addEventListener('blur', () => {
      if (inputDaytime.value === '' || isNaN(Number(inputDaytime.value))) {
        inputDaytime.value = current.daytimePercent;
      } else {
        const clamped = Math.max(0, Math.min(100, Math.round(Number(inputDaytime.value))));
        inputDaytime.value = clamped;
        syncFromDaytime(clamped);
      }
    });
  }

  if (inputNighttime) {
    inputNighttime.addEventListener('input', (e) => {
      syncFromNighttime(e.target.value);
    });
    inputNighttime.addEventListener('blur', () => {
      if (inputNighttime.value === '' || isNaN(Number(inputNighttime.value))) {
        inputNighttime.value = current.nighttimePercent;
      } else {
        const clamped = Math.max(0, Math.min(100, Math.round(Number(inputNighttime.value))));
        inputNighttime.value = clamped;
        syncFromNighttime(clamped);
      }
    });
  }

  // 4. Radio Card Baterai Hybrid
  container.querySelectorAll('input[name="batteryOption"]').forEach(radio => {
    radio.addEventListener('change', () => {
      current.batteryOption = radio.value;
      container.querySelectorAll('input[name="batteryOption"]').forEach(r => {
        const card = r.closest('.radio-card');
        if (card) {
          if (r.checked) {
            card.className = 'radio-card cursor-pointer border-2 border-primary bg-surface-soft rounded-sm p-sm flex items-center justify-between gap-sm transition-all select-none';
          } else {
            card.className = 'radio-card cursor-pointer border border-hairline bg-canvas rounded-sm p-sm flex items-center justify-between gap-sm transition-all select-none hover:border-hairline-strong';
          }
        }
      });
      emitChange();
    });
  });

  // 5. Dropdown Wilayah & Luas Atap
  if (regionSelect) {
    regionSelect.addEventListener('change', () => {
      current.region = regionSelect.value;
      emitChange();
    });
  }

  if (roofInput) {
    roofInput.addEventListener('input', () => {
      current.roofArea = Math.max(0, Number(roofInput.value) || 0);
      emitChange();
    });
  }
}
