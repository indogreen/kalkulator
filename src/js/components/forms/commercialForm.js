/**
 * PT. Indogreen Technology And Management
 * Form Component: PLTS Bisnis & Industri
 * 
 * Compliant with:
 * - INDOGREEN Design System: 2px radius (rounded-sm), flat CAD styling, 44px touch targets
 * - Dropdown Tarif PLN (B-2, B-3, I-3, I-4, P-1)
 * - Tagihan Listrik Bulanan + Chips Cepat Rp 15jt - 250jt
 * - 4 Radio Cards Jam Operasional (Kantor, 1-Shift, 2-Shift, 24-Jam)
 * - 3 Radio Cards Skema Finansial (CAPEX, OPEX PPA, OPEX Sewa 7 Thn)
 * - Dropdown 9 Wilayah PSH & Luas Atap Industri
 */

import { REGIONS_PSH, PLN_TARIFFS_2026, COMMERCIAL_OPERATIONAL_HOURS, COMMERCIAL_SCHEMES } from '../../calculator/constants.js';

export const COMMERCIAL_TARIFF_OPTIONS = ['B-2', 'B-3', 'I-3', 'I-4', 'P-1'];

export const COMMERCIAL_BILL_CHIPS = [
  { label: 'Rp 15 Jt', value: 15000000 },
  { label: 'Rp 30 Jt', value: 30000000 },
  { label: 'Rp 50 Jt', value: 50000000 },
  { label: 'Rp 100 Jt', value: 100000000 },
  { label: 'Rp 250 Jt', value: 250000000 }
];

/**
 * Render formulir parameter PLTS Bisnis & Industri
 * 
 * @param {HTMLElement} container - Kontainer target DOM
 * @param {Object} state - State parameter saat ini
 * @param {Function} onChange - Callback pembaruan state
 */
export function renderCommercialForm(container, state = {}, onChange = () => {}) {
  const current = {
    tariffGroup: state.tariffGroup || 'B-2',
    monthlyBill: state.monthlyBill || 50000000,
    operationalHours: state.operationalHours || 'office',
    activeScheme: state.activeScheme || 'capex',
    region: state.region || 'dki_jabar_banten',
    roofArea: state.roofArea || 300
  };

  container.innerHTML = `
    <form id="form-commercial" class="flex flex-col gap-lg" onsubmit="return false;">
      
      <!-- 1. Dropdown Golongan Tarif PLN -->
      <div class="flex flex-col gap-xs">
        <label for="select-com-tariff" class="type-caption-sm font-bold text-ink uppercase tracking-wider">
          1. Golongan Tarif Listrik PLN Komersial / Industri
        </label>
        <p class="type-caption-xs text-mute">
          Pilih golongan tarif sesuai rekening tagihan PLN bisnis Anda:
        </p>

        <select id="select-com-tariff" 
          name="tariffGroup"
          class="h-touch border border-hairline bg-canvas px-md py-input-y text-ink font-bold type-body-sm rounded-sm focus:border-2 focus:border-primary focus:outline-none">
          ${COMMERCIAL_TARIFF_OPTIONS.map(code => {
            const tariff = PLN_TARIFFS_2026[code];
            const isSelected = current.tariffGroup === code;
            return `
              <option value="${code}" ${isSelected ? 'selected' : ''}>
                ${tariff.name} — Rp ${tariff.rate.toLocaleString('id-ID', { minimumFractionDigits: 2 })}/kWh
              </option>
            `;
          }).join('')}
        </select>
      </div>

      <!-- 2. Tagihan Listrik Bulanan (Rp) -->
      <div class="flex flex-col gap-xs">
        <label for="input-com-monthly-bill" class="type-caption-sm font-bold text-ink uppercase tracking-wider">
          2. Rata-Rata Tagihan Listrik PLN per Bulan (Rp)
        </label>
        <p class="type-caption-xs text-mute">
          Masukkan nominal rata-rata tagihan rekening listrik bulanan fasilitas Anda:
        </p>

        <div class="relative flex items-center">
          <span class="absolute left-md text-mute font-bold type-body-md pointer-events-none select-none">Rp</span>
          <input type="number" 
            id="input-com-monthly-bill" 
            name="monthlyBill"
            min="1000000" 
            step="1000000"
            value="${current.monthlyBill}" 
            placeholder="Contoh: 50.000.000"
            class="h-touch w-full border border-hairline bg-canvas pl-xxl pr-md py-input-y text-ink font-bold type-body-md rounded-sm focus:border-2 focus:border-primary focus:outline-none">
        </div>

        <!-- Quick Chips Preset -->
        <div class="flex flex-wrap items-center gap-xs pt-xxs">
          ${COMMERCIAL_BILL_CHIPS.map(chip => {
            const isChipActive = current.monthlyBill === chip.value;
            return `
              <button type="button" 
                class="btn-com-bill-chip px-sm py-xxs border rounded-sm type-caption-xs font-bold transition-all ${
                  isChipActive 
                    ? 'border-2 border-primary bg-primary text-on-primary' 
                    : 'border-hairline bg-surface-soft text-ink hover:border-hairline-strong'
                }" 
                data-bill="${chip.value}">
                ${chip.label}
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 3. Profil Jam Operasional Fasilitas (Radio Cards) -->
      <div class="flex flex-col gap-xs">
        <label class="type-caption-sm font-bold text-ink uppercase tracking-wider">
          3. Pola Jam Operasional & Profil Beban
        </label>
        <p class="type-caption-xs text-mute">
          Tingkat sinkronisasi beban fasilitas terhadap kurva radiasi matahari siang hari:
        </p>

        <div class="grid grid-cols-1 tablet:grid-cols-2 gap-xs pt-xxs">
          ${Object.values(COMMERCIAL_OPERATIONAL_HOURS).map(op => {
            const isSelected = current.operationalHours === op.id;
            return `
              <label class="radio-card cursor-pointer border rounded-sm p-sm flex flex-col gap-xxs transition-all select-none ${
                isSelected 
                  ? 'border-2 border-primary bg-surface-soft' 
                  : 'border-hairline bg-canvas hover:border-hairline-strong'
              }">
                <div class="flex items-center justify-between">
                  <span class="type-caption-sm font-bold text-ink">${op.label}</span>
                  <input type="radio" 
                    name="operationalHours" 
                    value="${op.id}" 
                    class="accent-primary" 
                    ${isSelected ? 'checked' : ''}>
                </div>
                <span class="type-caption-xs text-mute">${op.description}</span>
              </label>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 4. Pilihan Skema Pembiayaan Utama (Radio Cards) -->
      <div class="flex flex-col gap-xs">
        <label class="type-caption-sm font-bold text-ink uppercase tracking-wider">
          4. Skema Finansial & Investasi Pilihan
        </label>
        <p class="type-caption-xs text-mute">
          Pilih model pengadaan energi surya yang sesuai dengan strategi keuangan perusahaan:
        </p>

        <div class="grid grid-cols-1 gap-xs pt-xxs">
          ${Object.values(COMMERCIAL_SCHEMES).map(scheme => {
            const isSelected = current.activeScheme === scheme.id;
            return `
              <label class="radio-card cursor-pointer border rounded-sm p-sm flex items-center justify-between gap-sm transition-all select-none ${
                isSelected 
                  ? 'border-2 border-primary bg-surface-soft' 
                  : 'border-hairline bg-canvas hover:border-hairline-strong'
              }">
                <div class="flex flex-col gap-xxs">
                  <div class="flex items-center gap-xs">
                    <span class="type-caption-sm font-bold text-ink">${scheme.name}</span>
                    ${scheme.id === 'opex_ppa' ? '<span class="type-caption-xs px-xs py-xxs bg-surface-elevated text-primary font-bold rounded-sm">ZERO CAPEX</span>' : ''}
                    ${scheme.id === 'capex' ? '<span class="type-caption-xs px-xs py-xxs bg-primary text-on-primary font-bold rounded-sm">HAK MILIK HARI-1</span>' : ''}
                  </div>
                  <span class="type-caption-xs text-mute">${scheme.description}</span>
                </div>
                <input type="radio" 
                  name="activeScheme" 
                  value="${scheme.id}" 
                  class="accent-primary h-4 w-4" 
                  ${isSelected ? 'checked' : ''}>
              </label>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 5. Wilayah Radiasi Matahari & Luas Atap Industri -->
      <div class="grid grid-cols-1 tablet:grid-cols-2 gap-md pt-xxs border-t border-hairline">
        
        <!-- Dropdown Wilayah -->
        <div class="flex flex-col gap-xs">
          <label for="select-com-region" class="type-caption-sm font-bold text-ink uppercase tracking-wider">
            5. Wilayah Lokasi Pabrik / Gedung
          </label>
          <select id="select-com-region" 
            name="region" 
            class="h-touch border border-hairline bg-canvas px-md py-input-y text-ink font-bold type-body-sm rounded-sm focus:border-2 focus:border-primary focus:outline-none">
            ${Object.values(REGIONS_PSH).map(reg => `
              <option value="${reg.id}" ${current.region === reg.id ? 'selected' : ''}>
                ${reg.label} (${reg.psh} PSH)
              </option>
            `).join('')}
          </select>
        </div>

        <!-- Input Luas Atap Pabrik -->
        <div class="flex flex-col gap-xs">
          <div class="flex items-center justify-between">
            <label for="input-com-roof-area" class="type-caption-sm font-bold text-ink uppercase tracking-wider">
              6. Luas Atap Fasilitas
            </label>
            <span class="type-caption-xs text-mute">Min ~5.5 m²/kWp</span>
          </div>
          <div class="relative flex items-center">
            <input type="number" 
              id="input-com-roof-area" 
              name="roofArea" 
              min="0" 
              step="50"
              value="${current.roofArea}" 
              placeholder="300"
              class="h-touch w-full border border-hairline bg-canvas px-md py-input-y text-ink font-bold type-body-sm rounded-sm focus:border-2 focus:border-primary focus:outline-none">
            <span class="absolute right-md text-mute font-bold type-body-sm pointer-events-none">m²</span>
          </div>
        </div>

      </div>

    </form>
  `;

  // ==========================================
  // Event Bindings
  // ==========================================
  const tariffSelect = container.querySelector('#select-com-tariff');
  const billInput = container.querySelector('#input-com-monthly-bill');
  const regionSelect = container.querySelector('#select-com-region');
  const roofInput = container.querySelector('#input-com-roof-area');

  function emitChange() {
    onChange({ ...current });
  }

  if (tariffSelect) {
    tariffSelect.addEventListener('change', () => {
      current.tariffGroup = tariffSelect.value;
      emitChange();
    });
  }

  if (billInput) {
    billInput.addEventListener('input', () => {
      current.monthlyBill = Math.max(0, Number(billInput.value) || 0);
      container.querySelectorAll('.btn-com-bill-chip').forEach(chip => {
        const val = Number(chip.getAttribute('data-bill'));
        if (val === current.monthlyBill) {
          chip.className = 'btn-com-bill-chip px-sm py-xxs border-2 border-primary bg-primary text-on-primary rounded-sm type-caption-xs font-bold transition-all';
        } else {
          chip.className = 'btn-com-bill-chip px-sm py-xxs border border-hairline bg-surface-soft text-ink rounded-sm type-caption-xs font-bold transition-all hover:border-hairline-strong';
        }
      });
      emitChange();
    });
  }

  container.querySelectorAll('.btn-com-bill-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const val = Number(chip.getAttribute('data-bill')) || 50000000;
      current.monthlyBill = val;
      if (billInput) billInput.value = val;
      container.querySelectorAll('.btn-com-bill-chip').forEach(c => {
        c.className = 'btn-com-bill-chip px-sm py-xxs border border-hairline bg-surface-soft text-ink rounded-sm type-caption-xs font-bold transition-all hover:border-hairline-strong';
      });
      chip.className = 'btn-com-bill-chip px-sm py-xxs border-2 border-primary bg-primary text-on-primary rounded-sm type-caption-xs font-bold transition-all';
      emitChange();
    });
  });

  container.querySelectorAll('input[name="operationalHours"]').forEach(radio => {
    radio.addEventListener('change', () => {
      current.operationalHours = radio.value;
      container.querySelectorAll('input[name="operationalHours"]').forEach(r => {
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

  container.querySelectorAll('input[name="activeScheme"]').forEach(radio => {
    radio.addEventListener('change', () => {
      current.activeScheme = radio.value;
      container.querySelectorAll('input[name="activeScheme"]').forEach(r => {
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
