/**
 * PT. Indogreen Technology And Management
 * Form Component: BESS / Baterai Cadangan Anti-Padam
 * 
 * Compliant with:
 * - INDOGREEN Design System: 2px radius (rounded-sm), flat CAD styling, 44px touch targets
 * - Toggle Sektor (Rumah Tangga vs Bisnis & Industri)
 * - Input Daya Beban Kritis (kW) + Range Slider + Chips Cepat
 * - Durasi Cadangan Padam (2, 4, 8, 12, 24 Jam)
 * - Switch Integrasi Solar PV Charger
 * - Dropdown 9 Wilayah PSH
 */

import { REGIONS_PSH } from '../../calculator/constants.js';

export const BATTERY_LOAD_CHIPS = [
  { label: '1 kW', value: 1.0 },
  { label: '2 kW', value: 2.0 },
  { label: '5 kW', value: 5.0 },
  { label: '10 kW', value: 10.0 },
  { label: '20 kW', value: 20.0 }
];

export const BATTERY_DURATION_PRESETS = [2, 4, 8, 12, 24];

/**
 * Render formulir parameter BESS Anti-Padam
 * 
 * @param {HTMLElement} container - Kontainer target DOM
 * @param {Object} state - State parameter saat ini
 * @param {Function} onChange - Callback pembaruan state
 */
export function renderBatteryForm(container, state = {}, onChange = () => {}) {
  const current = {
    sector: state.sector || 'residential',
    criticalLoadKw: state.criticalLoadKw !== undefined ? Number(state.criticalLoadKw) : 2.0,
    backupHours: state.backupHours || 4,
    includeSolarCharger: Boolean(state.includeSolarCharger),
    region: state.region || 'dki_jabar_banten'
  };

  container.innerHTML = `
    <form id="form-battery" class="flex flex-col gap-6" onsubmit="return false;">
      
      <!-- 1. Pilihan Sektor Kebutuhan -->
      <div class="flex flex-col gap-2.5">
        <label id="label-bat-sector" class="text-sm font-semibold text-ink">
          1. Sektor Kebutuhan Fasilitas
        </label>

        <div class="pl-4">
          <div class="grid grid-cols-2 gap-2" role="group" aria-labelledby="label-bat-sector">
            <button type="button" 
              class="btn-sector h-touch border rounded-sm text-sm font-semibold transition-all select-none ${
                current.sector === 'residential' 
                  ? 'border-2 border-primary bg-ink text-on-dark font-bold' 
                  : 'border-hairline bg-surface-soft text-ink hover:border-hairline-strong'
              }" 
              data-sector="residential"
              aria-pressed="${current.sector === 'residential' ? 'true' : 'false'}"
              aria-label="Pilih Sektor Rumah Tangga">
              Rumah Tangga
            </button>
            <button type="button" 
              class="btn-sector h-touch border rounded-sm text-sm font-semibold transition-all select-none ${
                current.sector === 'commercial' 
                  ? 'border-2 border-primary bg-ink text-on-dark font-bold' 
                  : 'border-hairline bg-surface-soft text-ink hover:border-hairline-strong'
              }" 
              data-sector="commercial"
              aria-pressed="${current.sector === 'commercial' ? 'true' : 'false'}"
              aria-label="Pilih Sektor Bisnis dan Industri">
              Bisnis & Industri
            </button>
          </div>
        </div>
      </div>

      <!-- 2. Daya Beban Kritis (kW) -->
      <div class="flex flex-col gap-2.5">
        <div class="flex items-center justify-between">
          <label for="input-bat-critical-load" id="label-bat-load" class="text-sm font-semibold text-ink">
            2. Daya Beban Kritis yang Dibackup
          </label>
          <span id="display-critical-load" class="text-sm font-bold text-primary-dark tabular-nums">
            ${current.criticalLoadKw.toFixed(2)} kW
          </span>
        </div>

        <div class="pl-4 flex flex-col gap-2.5">
          <div class="relative flex items-center">
            <input type="number" 
              id="input-bat-critical-load" 
              name="criticalLoadKw"
              min="0.5" 
              max="100" 
              step="0.5"
              value="${current.criticalLoadKw}" 
              placeholder="2.0"
              class="h-touch w-full border border-hairline bg-canvas px-md py-input-y text-ink font-semibold text-sm tabular-nums rounded-sm focus:border-2 focus:border-primary focus:outline-none">
            <span class="absolute right-md text-mute font-bold text-sm pointer-events-none select-none">kW</span>
          </div>

          <!-- Range Slider -->
          <div class="pt-1">
            <input type="range" 
              id="range-bat-critical-load" 
              min="0.5" 
              max="25" 
              step="0.5" 
              value="${current.criticalLoadKw}" 
              aria-label="Slider Daya Beban Kritis (kW)"
              aria-valuemin="0.5"
              aria-valuemax="25"
              aria-valuenow="${current.criticalLoadKw}"
              aria-valuetext="${current.criticalLoadKw.toFixed(1)} kW"
              class="w-full accent-primary h-2 bg-surface-soft rounded-sm cursor-pointer">
          </div>

          <!-- Quick Load Chips (44px min touch target) -->
          <div class="flex flex-wrap items-center gap-2" role="group" aria-label="Preset cepat daya beban kritis">
            ${BATTERY_LOAD_CHIPS.map(chip => {
              const isChipActive = Math.abs(current.criticalLoadKw - chip.value) < 0.05;
              return `
                <button type="button" 
                  class="btn-load-chip min-h-touch min-w-[44px] px-sm py-xs border rounded-sm text-xs font-semibold tabular-nums transition-all select-none ${
                    isChipActive 
                      ? 'border-2 border-primary bg-primary text-on-primary' 
                      : 'border-hairline bg-surface-soft text-ink hover:border-hairline-strong'
                  }" 
                  data-load="${chip.value}"
                  aria-pressed="${isChipActive ? 'true' : 'false'}"
                  aria-label="Preset beban ${chip.label}">
                  ${chip.label}
                </button>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- 3. Durasi Cadangan Padam (Jam) -->
      <div class="flex flex-col gap-2.5">
        <label id="label-bat-hours" class="text-sm font-semibold text-ink">
          3. Durasi Cadangan Darurat (Jam Backup)
        </label>

        <div class="pl-4">
          <div class="grid grid-cols-3 mobile:grid-cols-5 gap-2" role="group" aria-labelledby="label-bat-hours">
            ${BATTERY_DURATION_PRESETS.map(hrs => {
              const isActive = current.backupHours === hrs;
              return `
                <button type="button" 
                  class="btn-duration-preset h-touch border rounded-sm text-xs font-semibold tabular-nums transition-all select-none ${
                    isActive 
                      ? 'border-2 border-primary bg-ink text-on-dark font-bold' 
                      : 'border-hairline bg-surface-soft text-ink hover:border-hairline-strong'
                  }" 
                  data-hours="${hrs}"
                  aria-pressed="${isActive ? 'true' : 'false'}"
                  aria-label="Pilih cadangan ${hrs} Jam">
                  ${hrs} Jam
                </button>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- 4. Integrasi Pengisian Tenaga Surya (Solar PV Charger) -->
      <div class="flex flex-col gap-2.5">
        <div class="flex items-center justify-between">
          <span class="text-sm font-semibold text-ink">4. Integrasi Pengisian Solar PV</span>
          <span class="text-[11px] px-2 py-0.5 bg-surface-elevated text-primary font-bold rounded-sm uppercase">Mandiri</span>
        </div>

        <div class="pl-4">
          <div class="border border-hairline bg-surface-soft p-4 rounded-sm flex items-center justify-between gap-4 select-none">
            <p class="text-xs text-mute leading-normal max-w-sm">
              Menambahkan modul surya untuk mengisi ulang baterai secara mandiri saat pemadaman.
            </p>

            <label class="relative min-h-touch min-w-touch inline-flex items-center justify-center cursor-pointer p-1">
              <input type="checkbox" 
                id="toggle-solar-charger" 
                name="includeSolarCharger" 
                class="sr-only peer" 
                aria-label="Integrasi Pengisian Solar PV Charger"
                ${current.includeSolarCharger ? 'checked' : ''}>
              <div class="w-12 h-6 bg-hairline peer-focus:outline-none rounded-sm peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[13px] after:left-[7px] after:bg-white after:border-hairline after:border after:rounded-sm after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>

      <!-- 5. Dropdown Wilayah Radiasi Matahari -->
      <div id="slot-bat-region" class="flex flex-col gap-2.5 pt-4 border-t border-hairline ${current.includeSolarCharger ? '' : 'opacity-60'}">
        <label for="select-bat-region" class="text-sm font-semibold text-ink">
          5. Wilayah Lokasi Pemasangan (PSH Surya)
        </label>

        <div class="pl-4">
          <select id="select-bat-region" 
              name="region" 
              aria-label="Pilih Wilayah Lokasi Pemasangan BESS"
              class="h-touch w-full border border-hairline bg-canvas px-md py-input-y text-ink font-semibold text-sm rounded-sm focus:border-2 focus:border-primary focus:outline-none">
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
  const loadInput = container.querySelector('#input-bat-critical-load');
  const loadRange = container.querySelector('#range-bat-critical-load');
  const displayLoad = container.querySelector('#display-critical-load');
  const toggleSolar = container.querySelector('#toggle-solar-charger');
  const regionSlot = container.querySelector('#slot-bat-region');
  const regionSelect = container.querySelector('#select-bat-region');

  function emitChange() {
    onChange({ ...current });
  }

  // 1. Tombol Sektor
  container.querySelectorAll('.btn-sector').forEach(btn => {
    btn.addEventListener('click', () => {
      const sec = btn.getAttribute('data-sector');
      current.sector = sec;
      container.querySelectorAll('.btn-sector').forEach(b => {
        b.className = 'btn-sector h-touch border border-hairline bg-surface-soft text-ink rounded-sm text-sm font-semibold transition-all select-none hover:border-hairline-strong';
        b.setAttribute('aria-pressed', 'false');
      });
      btn.className = 'btn-sector h-touch border-2 border-primary bg-ink text-on-dark font-bold rounded-sm text-sm transition-all select-none';
      btn.setAttribute('aria-pressed', 'true');
      emitChange();
    });
  });

  // 2. Input Beban Kritis + Slider + Chips
  function updateLoad(val) {
    const num = Math.max(0.5, Number(val) || 0.5);
    current.criticalLoadKw = num;
    if (loadInput) loadInput.value = num;
    if (loadRange) {
      loadRange.value = num;
      loadRange.setAttribute('aria-valuenow', num);
      loadRange.setAttribute('aria-valuetext', `${num.toFixed(1)} kW`);
    }
    if (displayLoad) displayLoad.textContent = `${num.toFixed(2)} kW`;

    container.querySelectorAll('.btn-load-chip').forEach(chip => {
      const chipVal = Number(chip.getAttribute('data-load'));
      if (Math.abs(chipVal - num) < 0.05) {
        chip.className = 'btn-load-chip min-h-touch min-w-[44px] px-sm py-xs border-2 border-primary bg-primary text-on-primary rounded-sm text-xs font-semibold tabular-nums transition-all select-none';
        chip.setAttribute('aria-pressed', 'true');
      } else {
        chip.className = 'btn-load-chip min-h-touch min-w-[44px] px-sm py-xs border border-hairline bg-surface-soft text-ink rounded-sm text-xs font-semibold tabular-nums transition-all select-none hover:border-hairline-strong';
        chip.setAttribute('aria-pressed', 'false');
      }
    });
    emitChange();
  }

  if (loadInput) {
    loadInput.addEventListener('input', () => updateLoad(loadInput.value));
  }
  if (loadRange) {
    loadRange.addEventListener('input', () => updateLoad(loadRange.value));
  }

  container.querySelectorAll('.btn-load-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const val = Number(chip.getAttribute('data-load')) || 2.0;
      updateLoad(val);
    });
  });

  // 3. Tombol Durasi Backup
  container.querySelectorAll('.btn-duration-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const hrs = Number(btn.getAttribute('data-hours')) || 4;
      current.backupHours = hrs;
      container.querySelectorAll('.btn-duration-preset').forEach(b => {
        b.className = 'btn-duration-preset h-touch border border-hairline bg-surface-soft text-ink rounded-sm text-xs font-semibold tabular-nums transition-all select-none hover:border-hairline-strong';
        b.setAttribute('aria-pressed', 'false');
      });
      btn.className = 'btn-duration-preset h-touch border-2 border-primary bg-ink text-on-dark font-bold rounded-sm text-xs tabular-nums transition-all select-none';
      btn.setAttribute('aria-pressed', 'true');
      emitChange();
    });
  });

  // 4. Toggle Solar Charger
  if (toggleSolar) {
    toggleSolar.addEventListener('change', () => {
      current.includeSolarCharger = toggleSolar.checked;
      if (regionSlot) {
        if (toggleSolar.checked) {
          regionSlot.classList.remove('opacity-60');
        } else {
          regionSlot.classList.add('opacity-60');
        }
      }
      emitChange();
    });
  }

  // 5. Select Wilayah
  if (regionSelect) {
    regionSelect.addEventListener('change', () => {
      current.region = regionSelect.value;
      emitChange();
    });
  }
}
