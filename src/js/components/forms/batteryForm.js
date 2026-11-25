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
    <form id="form-battery" class="flex flex-col gap-lg" onsubmit="return false;">
      
      <!-- 1. Pilihan Sektor Kebutuhan -->
      <div class="flex flex-col gap-xs">
        <label class="type-caption-sm font-bold text-ink uppercase tracking-wider">
          1. Sektor Kebutuhan Fasilitas
        </label>
        <p class="type-caption-xs text-mute">
          Pilih kategori lokasi pemasangan sistem baterai cadangan:
        </p>

        <div class="grid grid-cols-2 gap-xs pt-xxs">
          <button type="button" 
            class="btn-sector h-touch border rounded-sm type-button-sm transition-all select-none ${
              current.sector === 'residential' 
                ? 'border-2 border-primary bg-ink text-on-dark font-bold' 
                : 'border-hairline bg-surface-soft text-ink hover:border-hairline-strong'
            }" 
            data-sector="residential">
            Rumah Tangga
          </button>
          <button type="button" 
            class="btn-sector h-touch border rounded-sm type-button-sm transition-all select-none ${
              current.sector === 'commercial' 
                ? 'border-2 border-primary bg-ink text-on-dark font-bold' 
                : 'border-hairline bg-surface-soft text-ink hover:border-hairline-strong'
            }" 
            data-sector="commercial">
            Bisnis & Industri
          </button>
        </div>
      </div>

      <!-- 2. Daya Beban Kritis (kW) -->
      <div class="flex flex-col gap-xs">
        <div class="flex items-center justify-between">
          <label for="input-bat-critical-load" class="type-caption-sm font-bold text-ink uppercase tracking-wider">
            2. Daya Beban Kritis yang Dibackup
          </label>
          <span id="display-critical-load" class="type-caption-sm font-bold text-primary">
            ${current.criticalLoadKw.toFixed(2)} kW
          </span>
        </div>
        <p class="type-caption-xs text-mute">
          Total daya peralatan esensial yang wajib terus menyala saat listrik PLN padam (AC, lemari pendingin, server, pompa, lampu):
        </p>

        <div class="relative flex items-center">
          <input type="number" 
            id="input-bat-critical-load" 
            name="criticalLoadKw"
            min="0.5" 
            max="100" 
            step="0.5"
            value="${current.criticalLoadKw}" 
            placeholder="2.0"
            class="h-touch w-full border border-hairline bg-canvas px-md py-input-y text-ink font-bold type-body-md rounded-sm focus:border-2 focus:border-primary focus:outline-none">
          <span class="absolute right-md text-mute font-bold type-body-md pointer-events-none select-none">kW</span>
        </div>

        <!-- Range Slider -->
        <div class="pt-xxs">
          <input type="range" 
            id="range-bat-critical-load" 
            min="0.5" 
            max="25" 
            step="0.5" 
            value="${current.criticalLoadKw}" 
            class="w-full accent-primary h-2 bg-surface-soft rounded-sm cursor-pointer">
        </div>

        <!-- Quick Load Chips -->
        <div class="flex flex-wrap items-center gap-xs pt-xxs">
          ${BATTERY_LOAD_CHIPS.map(chip => {
            const isChipActive = Math.abs(current.criticalLoadKw - chip.value) < 0.05;
            return `
              <button type="button" 
                class="btn-load-chip px-sm py-xxs border rounded-sm type-caption-xs font-bold transition-all ${
                  isChipActive 
                    ? 'border-2 border-primary bg-primary text-on-primary' 
                    : 'border-hairline bg-surface-soft text-ink hover:border-hairline-strong'
                }" 
                data-load="${chip.value}">
                ${chip.label}
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 3. Durasi Cadangan Padam (Jam) -->
      <div class="flex flex-col gap-xs">
        <label class="type-caption-sm font-bold text-ink uppercase tracking-wider">
          3. Durasi Cadangan Darurat (Jam Backup)
        </label>
        <p class="type-caption-xs text-mute">
          Berapa jam sistem baterai LiFePO4 diharapkan menopang beban kritis tanpa pasokan PLN:
        </p>

        <div class="grid grid-cols-5 gap-xs pt-xxs">
          ${BATTERY_DURATION_PRESETS.map(hrs => {
            const isActive = current.backupHours === hrs;
            return `
              <button type="button" 
                class="btn-duration-preset h-touch border rounded-sm type-button-sm transition-all select-none ${
                  isActive 
                    ? 'border-2 border-primary bg-ink text-on-dark font-bold' 
                    : 'border-hairline bg-surface-soft text-ink hover:border-hairline-strong'
                }" 
                data-hours="${hrs}">
                ${hrs} Jam
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 4. Integrasi Pengisian Tenaga Surya (Solar PV Charger) -->
      <div class="border border-hairline bg-surface-soft p-md rounded-sm flex items-center justify-between gap-md select-none">
        <div class="flex flex-col gap-xxs max-w-sm">
          <div class="flex items-center gap-xs">
            <span class="type-caption-sm font-bold text-ink uppercase">Integrasi Pengisian Solar PV</span>
            <span class="type-caption-xs px-xs py-xxs bg-surface-elevated text-primary font-bold rounded-sm">MANDIRI</span>
          </div>
          <p class="type-caption-xs text-mute">
            Menambahkan modul surya untuk mengisi ulang baterai secara mandiri saat pemadaman berlangsung berhari-hari.
          </p>
        </div>

        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" 
            id="toggle-solar-charger" 
            name="includeSolarCharger" 
            class="sr-only peer" 
            ${current.includeSolarCharger ? 'checked' : ''}>
          <div class="w-12 h-6 bg-hairline peer-focus:outline-none rounded-sm peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-hairline after:border after:rounded-sm after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
      </div>

      <!-- 5. Dropdown Wilayah Radiasi Matahari -->
      <div id="slot-bat-region" class="flex flex-col gap-xs pt-xxs border-t border-hairline ${current.includeSolarCharger ? '' : 'opacity-60'}">
        <label for="select-bat-region" class="type-caption-sm font-bold text-ink uppercase tracking-wider">
          5. Wilayah Lokasi Pemasangan (PSH Surya)
        </label>
        <p class="type-caption-xs text-mute">
          Diperlukan untuk memperhitungkan kecepatan pengisian ulang surya harian:
        </p>

        <select id="select-bat-region" 
          name="region" 
          class="h-touch border border-hairline bg-canvas px-md py-input-y text-ink font-bold type-body-sm rounded-sm focus:border-2 focus:border-primary focus:outline-none">
          ${Object.values(REGIONS_PSH).map(reg => `
            <option value="${reg.id}" ${current.region === reg.id ? 'selected' : ''}>
              ${reg.label} (${reg.psh} PSH)
            </option>
          `).join('')}
        </select>
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
        b.className = 'btn-sector h-touch border border-hairline bg-surface-soft text-ink rounded-sm type-button-sm transition-all select-none hover:border-hairline-strong';
      });
      btn.className = 'btn-sector h-touch border-2 border-primary bg-ink text-on-dark font-bold rounded-sm type-button-sm transition-all select-none';
      emitChange();
    });
  });

  // 2. Input Beban Kritis + Slider + Chips
  function updateLoad(val) {
    const num = Math.max(0.5, Number(val) || 0.5);
    current.criticalLoadKw = num;
    if (loadInput) loadInput.value = num;
    if (loadRange) loadRange.value = num;
    if (displayLoad) displayLoad.textContent = `${num.toFixed(2)} kW`;

    container.querySelectorAll('.btn-load-chip').forEach(chip => {
      const chipVal = Number(chip.getAttribute('data-load'));
      if (Math.abs(chipVal - num) < 0.05) {
        chip.className = 'btn-load-chip px-sm py-xxs border-2 border-primary bg-primary text-on-primary rounded-sm type-caption-xs font-bold transition-all';
      } else {
        chip.className = 'btn-load-chip px-sm py-xxs border border-hairline bg-surface-soft text-ink rounded-sm type-caption-xs font-bold transition-all hover:border-hairline-strong';
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
        b.className = 'btn-duration-preset h-touch border border-hairline bg-surface-soft text-ink rounded-sm type-button-sm transition-all select-none hover:border-hairline-strong';
      });
      btn.className = 'btn-duration-preset h-touch border-2 border-primary bg-ink text-on-dark font-bold rounded-sm type-button-sm transition-all select-none';
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
