/**
 * PT. Indogreen Technology And Management
 * Form Component: Penerangan Jalan Umum Tenaga Surya (PJUTS)
 * 
 * Compliant with:
 * - INDOGREEN Design System: 2px radius (rounded-sm), flat CAD styling, 44px touch targets
 * - Input Jumlah Tiang + Chips Cepat (5, 10, 25, 50, 100)
 * - Pilihan Daya Lampu LED (20W - 200W)
 * - Durasi Nyala Malam (Jam)
 * - Switch Smart Dimming Otomatis (Hemat ~30% Baterai & Panel)
 * - Pilihan Hari Otonomi Hujan (1, 2, 3 Hari)
 * - Dropdown 9 Wilayah PSH
 */

import { REGIONS_PSH } from '../../calculator/constants.js';

export const PJUTS_POLE_CHIPS = [5, 10, 25, 50, 100];
export const PJUTS_WATT_OPTIONS = [20, 40, 60, 80, 100, 120, 150, 200];
export const PJUTS_AUTONOMY_OPTIONS = [1, 2, 3];

/**
 * Render formulir parameter PJUTS
 * 
 * @param {HTMLElement} container - Kontainer target DOM
 * @param {Object} state - State parameter saat ini
 * @param {Function} onChange - Callback pembaruan state
 */
export function renderPjutsForm(container, state = {}, onChange = () => {}) {
  const current = {
    poleCount: state.poleCount !== undefined ? Number(state.poleCount) : 10,
    lampWattage: state.lampWattage !== undefined ? Number(state.lampWattage) : 60,
    nightHours: state.nightHours !== undefined ? Number(state.nightHours) : 12,
    smartDimming: state.smartDimming !== false, // default true
    autonomyDays: state.autonomyDays || 2,
    region: state.region || 'dki_jabar_banten'
  };

  container.innerHTML = `
    <form id="form-pjuts" class="flex flex-col gap-lg" onsubmit="return false;">
      
      <!-- 1. Jumlah Titik Tiang Lampu -->
      <div class="flex flex-col gap-xs">
        <div class="flex items-center justify-between">
          <label for="input-pjuts-pole-count" id="label-pjuts-pole" class="type-caption-sm font-bold text-ink uppercase tracking-wider">
            1. Jumlah Titik Tiang Lampu Jalan
          </label>
          <span id="display-pole-count" class="type-caption-sm font-bold text-primary-dark">
            ${current.poleCount} Titik Tiang
          </span>
        </div>
        <p id="desc-pjuts-pole" class="type-caption-xs text-mute">
          Masukkan total titik tiang lampu penerangan jalan yang direncanakan:
        </p>

        <div class="relative flex items-center">
          <input type="number" 
            id="input-pjuts-pole-count" 
            name="poleCount"
            min="1" 
            max="1000" 
            step="1"
            value="${current.poleCount}" 
            placeholder="10"
            aria-describedby="desc-pjuts-pole"
            class="h-touch w-full border border-hairline bg-canvas px-md py-input-y text-ink font-bold type-body-md rounded-sm focus:border-2 focus:border-primary focus:outline-none">
          <span class="absolute right-md text-mute font-bold type-body-md pointer-events-none select-none">Tiang</span>
        </div>

        <!-- Quick Pole Chips (44px min touch target) -->
        <div class="flex flex-wrap items-center gap-xs pt-xxs" role="group" aria-label="Preset cepat jumlah tiang lampu jalan">
          ${PJUTS_POLE_CHIPS.map(count => {
            const isChipActive = current.poleCount === count;
            return `
              <button type="button" 
                class="btn-pole-chip min-h-touch min-w-[44px] px-sm py-xs border rounded-sm type-caption-xs font-bold transition-all select-none ${
                  isChipActive 
                    ? 'border-2 border-primary bg-primary text-on-primary' 
                    : 'border-hairline bg-surface-soft text-ink hover:border-hairline-strong'
                }" 
                data-poles="${count}"
                aria-pressed="${isChipActive ? 'true' : 'false'}"
                aria-label="Pilih ${count} Tiang">
                ${count} Tiang
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 2. Daya Lampu LED (Watt) -->
      <div class="flex flex-col gap-xs">
        <label id="label-pjuts-watt" class="type-caption-sm font-bold text-ink uppercase tracking-wider">
          2. Daya Lampu LED PJU (Watt)
        </label>
        <p class="type-caption-xs text-mute">
          Pilih rating lumen efisiensi tinggi lampu LED jalan standar SNI:
        </p>

        <div class="grid grid-cols-4 tablet:grid-cols-8 gap-xs pt-xxs" role="group" aria-labelledby="label-pjuts-watt">
          ${PJUTS_WATT_OPTIONS.map(watt => {
            const isActive = current.lampWattage === watt;
            return `
              <button type="button" 
                class="btn-watt-preset h-touch border rounded-sm type-button-sm transition-all select-none ${
                  isActive 
                    ? 'border-2 border-primary bg-ink text-on-dark font-bold' 
                    : 'border-hairline bg-surface-soft text-ink hover:border-hairline-strong'
                }" 
                data-watt="${watt}"
                aria-pressed="${isActive ? 'true' : 'false'}"
                aria-label="Pilih daya lampu ${watt} Watt">
                ${watt}W
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 3. Fitur Smart Dimming Otomatis -->
      <div class="border border-hairline bg-surface-soft p-md rounded-sm flex items-center justify-between gap-md select-none">
        <div class="flex flex-col gap-xxs max-w-sm">
          <div class="flex items-center gap-xs">
            <span class="type-caption-sm font-bold text-ink uppercase">Smart Dimming Otomatis</span>
            <span class="type-caption-xs px-xs py-xxs bg-primary text-on-primary font-bold rounded-sm">HEMAT ~30%</span>
          </div>
          <p class="type-caption-xs text-mute">
            100% daya pada 5 jam awal (18:00 - 23:00) saat ramai, kemudian otomatis 50% daya (23:00 - 06:00) saat sepi.
          </p>
        </div>

        <label class="relative min-h-touch min-w-touch inline-flex items-center justify-center cursor-pointer p-1">
          <input type="checkbox" 
            id="toggle-smart-dimming" 
            name="smartDimming" 
            class="sr-only peer" 
            aria-label="Aktifkan Fitur Smart Dimming Otomatis"
            ${current.smartDimming ? 'checked' : ''}>
          <div class="w-12 h-6 bg-hairline peer-focus:outline-none rounded-sm peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[13px] after:left-[7px] after:bg-white after:border-hairline after:border after:rounded-sm after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
      </div>

      <!-- 4. Hari Otonomi Cuaca Mendung / Hujan -->
      <div class="flex flex-col gap-xs">
        <label id="label-pjuts-autonomy" class="type-caption-sm font-bold text-ink uppercase tracking-wider">
          4. Cadangan Hari Otonomi (Cuaca Hujan/Mendung)
        </label>
        <p class="type-caption-xs text-mute">
          Menjamin lampu jalan tetap menyala normal saat matahari tertutup awan berturut-turut:
        </p>

        <div class="grid grid-cols-3 gap-xs pt-xxs" role="group" aria-labelledby="label-pjuts-autonomy">
          ${PJUTS_AUTONOMY_OPTIONS.map(days => {
            const isActive = current.autonomyDays === days;
            return `
              <button type="button" 
                class="btn-autonomy-preset h-touch border rounded-sm type-button-sm transition-all select-none ${
                  isActive 
                    ? 'border-2 border-primary bg-ink text-on-dark font-bold' 
                    : 'border-hairline bg-surface-soft text-ink hover:border-hairline-strong'
                }" 
                data-days="${days}"
                aria-pressed="${isActive ? 'true' : 'false'}"
                aria-label="Cadangan ${days} Hari Otonomi">
                ${days} Hari <span class="hidden mobile:inline">Otonomi</span>
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 5. Durasi Operasional Malam & Wilayah PSH -->
      <div class="grid grid-cols-1 tablet:grid-cols-2 gap-md pt-xxs border-t border-hairline">
        
        <!-- Durasi Malam -->
        <div class="flex flex-col gap-xs">
          <label for="input-pjuts-night-hours" class="type-caption-sm font-bold text-ink uppercase tracking-wider">
            5. Durasi Nyala per Malam
          </label>
          <div class="relative flex items-center">
            <input type="number" 
              id="input-pjuts-night-hours" 
              name="nightHours" 
              min="8" 
              max="16" 
              value="${current.nightHours}" 
              placeholder="12"
              aria-label="Durasi Nyala Lampu per Malam dalam jam"
              class="h-touch w-full border border-hairline bg-canvas px-md py-input-y text-ink font-bold type-body-sm rounded-sm focus:border-2 focus:border-primary focus:outline-none">
            <span class="absolute right-md text-mute font-bold type-body-sm pointer-events-none">Jam/Malam</span>
          </div>
        </div>

        <!-- Wilayah Radiasi -->
        <div class="flex flex-col gap-xs">
          <label for="select-pjuts-region" class="type-caption-sm font-bold text-ink uppercase tracking-wider">
            6. Wilayah Lokasi Pemasangan
          </label>
          <select id="select-pjuts-region" 
            name="region" 
            aria-label="Pilih Wilayah Lokasi Pemasangan PJUTS"
            class="h-touch border border-hairline bg-canvas px-md py-input-y text-ink font-bold type-body-sm rounded-sm focus:border-2 focus:border-primary focus:outline-none">
            ${Object.values(REGIONS_PSH).map(reg => `
              <option value="${reg.id}" ${current.region === reg.id ? 'selected' : ''}>
                ${reg.label} (${reg.psh} PSH)
              </option>
            `).join('')}
          </select>
        </div>

      </div>

    </form>
  `;

  // ==========================================
  // Event Bindings
  // ==========================================
  const poleInput = container.querySelector('#input-pjuts-pole-count');
  const displayPoles = container.querySelector('#display-pole-count');
  const toggleDimming = container.querySelector('#toggle-smart-dimming');
  const nightInput = container.querySelector('#input-pjuts-night-hours');
  const regionSelect = container.querySelector('#select-pjuts-region');

  function emitChange() {
    onChange({ ...current });
  }

  // 1. Pole Input + Chips
  function updatePoles(val) {
    const num = Math.max(1, Math.round(Number(val) || 1));
    current.poleCount = num;
    if (poleInput) poleInput.value = num;
    if (displayPoles) displayPoles.textContent = `${num} Titik Tiang`;

    container.querySelectorAll('.btn-pole-chip').forEach(chip => {
      const chipVal = Number(chip.getAttribute('data-poles'));
      if (chipVal === num) {
        chip.className = 'btn-pole-chip min-h-touch min-w-[44px] px-sm py-xs border-2 border-primary bg-primary text-on-primary rounded-sm type-caption-xs font-bold transition-all select-none';
        chip.setAttribute('aria-pressed', 'true');
      } else {
        chip.className = 'btn-pole-chip min-h-touch min-w-[44px] px-sm py-xs border border-hairline bg-surface-soft text-ink rounded-sm type-caption-xs font-bold transition-all select-none hover:border-hairline-strong';
        chip.setAttribute('aria-pressed', 'false');
      }
    });
    emitChange();
  }

  if (poleInput) {
    poleInput.addEventListener('input', () => updatePoles(poleInput.value));
  }

  container.querySelectorAll('.btn-pole-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const count = Number(chip.getAttribute('data-poles')) || 10;
      updatePoles(count);
    });
  });

  // 2. Watt Presets
  container.querySelectorAll('.btn-watt-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const w = Number(btn.getAttribute('data-watt')) || 60;
      current.lampWattage = w;
      container.querySelectorAll('.btn-watt-preset').forEach(b => {
        b.className = 'btn-watt-preset h-touch border border-hairline bg-surface-soft text-ink rounded-sm type-button-sm transition-all select-none hover:border-hairline-strong';
        b.setAttribute('aria-pressed', 'false');
      });
      btn.className = 'btn-watt-preset h-touch border-2 border-primary bg-ink text-on-dark font-bold rounded-sm type-button-sm transition-all select-none';
      btn.setAttribute('aria-pressed', 'true');
      emitChange();
    });
  });

  // 3. Smart Dimming Toggle
  if (toggleDimming) {
    toggleDimming.addEventListener('change', () => {
      current.smartDimming = toggleDimming.checked;
      emitChange();
    });
  }

  // 4. Autonomy Days Presets
  container.querySelectorAll('.btn-autonomy-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const days = Number(btn.getAttribute('data-days')) || 2;
      current.autonomyDays = days;
      container.querySelectorAll('.btn-autonomy-preset').forEach(b => {
        b.className = 'btn-autonomy-preset h-touch border border-hairline bg-surface-soft text-ink rounded-sm type-button-sm transition-all select-none hover:border-hairline-strong';
        b.setAttribute('aria-pressed', 'false');
      });
      btn.className = 'btn-autonomy-preset h-touch border-2 border-primary bg-ink text-on-dark font-bold rounded-sm type-button-sm transition-all select-none';
      btn.setAttribute('aria-pressed', 'true');
      emitChange();
    });
  });

  // 5. Night Hours & Region
  if (nightInput) {
    nightInput.addEventListener('input', () => {
      current.nightHours = Math.max(1, Number(nightInput.value) || 12);
      emitChange();
    });
  }

  if (regionSelect) {
    regionSelect.addEventListener('change', () => {
      current.region = regionSelect.value;
      emitChange();
    });
  }
}
