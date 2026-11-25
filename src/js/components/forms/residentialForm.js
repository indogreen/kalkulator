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
  const current = {
    powerVa: state.powerVa || 2200,
    monthlyBill: state.monthlyBill || 1500000,
    daytimeActivity: state.daytimeActivity || 'medium',
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

      <!-- 2. Nominal Tagihan Listrik Bulanan (Rp) -->
      <div class="flex flex-col gap-2.5">
        <label for="input-res-monthly-bill" id="label-res-bill" class="text-sm font-semibold text-ink">
          2. Rata-Rata Tagihan Listrik per Bulan (Rp)
        </label>

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

      <!-- 3. Pola Konsumsi Siang Hari (Radio Cards) -->
      <div class="flex flex-col gap-2.5">
        <label id="label-res-daytime" class="text-sm font-semibold text-ink">
          3. Pola Aktivitas Penggunaan Listrik Siang Hari
        </label>

        <div class="grid grid-cols-1 tablet:grid-cols-3 gap-2.5" role="radiogroup" aria-labelledby="label-res-daytime">
          ${Object.values(DAYTIME_ACTIVITY_PATTERNS).map(pattern => {
            const isSelected = current.daytimeActivity === pattern.id;
            return `
              <label class="radio-card cursor-pointer border rounded-sm p-3.5 flex flex-col gap-1 transition-all select-none ${
                isSelected 
                  ? 'border-2 border-primary bg-surface-soft' 
                  : 'border-hairline bg-canvas hover:border-hairline-strong'
              }">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold text-ink">${pattern.label}</span>
                  <input type="radio" 
                    id="radio-daytime-${pattern.id}"
                    name="daytimeActivity" 
                    value="${pattern.id}" 
                    class="accent-primary h-4 w-4" 
                    aria-label="${pattern.label}: ${pattern.description}"
                    ${isSelected ? 'checked' : ''}>
                </div>
                <span class="text-xs text-mute leading-normal">${pattern.description}</span>
              </label>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 4. Opsi Baterai Cadangan Hybrid LiFePO4 -->
      <div class="flex flex-col gap-2.5">
        <label id="label-res-battery" class="text-sm font-semibold text-ink">
          4. Opsi Penyimpanan Baterai Hybrid (LiFePO4)
        </label>

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

      <!-- 5. Wilayah Radiasi Matahari & Luas Atap -->
      <div class="grid grid-cols-1 tablet:grid-cols-2 gap-4 tablet:gap-6 pt-4 border-t border-hairline">
        
        <!-- Dropdown Wilayah -->
        <div class="flex flex-col gap-2.5">
          <label for="select-res-region" class="text-sm font-semibold text-ink">
            5. Wilayah Lokasi Proyek
          </label>
          <select id="select-res-region" 
            name="region" 
            aria-label="Pilih Wilayah Lokasi Proyek"
            class="h-touch border border-hairline bg-canvas px-md py-input-y text-ink font-semibold text-sm rounded-sm focus:border-2 focus:border-primary focus:outline-none">
            ${Object.values(REGIONS_PSH).map(reg => `
              <option value="${reg.id}" ${current.region === reg.id ? 'selected' : ''}>
                ${reg.label} (${reg.psh} PSH)
              </option>
            `).join('')}
          </select>
        </div>

        <!-- Input Luas Atap -->
        <div class="flex flex-col gap-2.5">
          <label for="input-res-roof-area" class="text-sm font-semibold text-ink">
            6. Estimasi Luas Atap (m²)
          </label>
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

  // 3. Radio Card Aktivitas Siang
  container.querySelectorAll('input[name="daytimeActivity"]').forEach(radio => {
    radio.addEventListener('change', () => {
      current.daytimeActivity = radio.value;
      container.querySelectorAll('input[name="daytimeActivity"]').forEach(r => {
        const card = r.closest('.radio-card');
        if (card) {
          if (r.checked) {
            card.className = 'radio-card cursor-pointer border-2 border-primary bg-surface-soft rounded-sm p-sm flex flex-col gap-xxs transition-all select-none';
          } else {
            card.className = 'radio-card cursor-pointer border border-hairline bg-canvas rounded-sm p-sm flex flex-col gap-xxs transition-all select-none hover:border-hairline-strong';
          }
        }
      });
      emitChange();
    });
  });

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
