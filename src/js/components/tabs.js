/**
 * PT. Indogreen Technology And Management
 * Segmented Pill Tabs Component (4 Simulation Modes)
 * 
 * Compliant with:
 * - WAI-ARIA tablist & tab specification (role="tablist", role="tab", aria-selected)
 * - Keyboard navigation (ArrowLeft, ArrowRight, Home, End)
 * - INDOGREEN Angular 2px styling (.pill-tab, .pill-tab.active)
 */

export const SIMULATION_MODES = Object.freeze([
  { id: 'residential', label: 'PLTS Atap Residensial' },
  { id: 'commercial', label: 'PLTS Bisnis & Industri' },
  { id: 'battery', label: 'Baterai Cadangan (BESS)' },
  { id: 'pjuts', label: 'Penerangan Jalan (PJUTS)' }
]);

/**
 * Mengubah tab aktif secara programatis
 * @param {string} mode - Mode id ('residential', 'commercial', 'battery', 'pjuts')
 */
export function setActiveTab(mode) {
  const tabs = document.querySelectorAll('.pill-tab[data-mode]');
  tabs.forEach(tab => {
    const isTarget = tab.getAttribute('data-mode') === mode;
    if (isTarget) {
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      tab.setAttribute('tabindex', '0');
    } else {
      tab.classList.remove('active');
      tab.setAttribute('aria-selected', 'false');
      tab.setAttribute('tabindex', '-1');
    }
  });
}

/**
 * Inisialisasi event listener tab segmented control
 * @param {Object} options
 * @param {string} [options.initialMode='residential'] - Mode awal
 * @param {Function} [options.onTabChange] - Callback saat tab berganti
 */
export function initTabs(options = {}) {
  const tablist = document.querySelector('[role="tablist"]');
  const tabs = Array.from(document.querySelectorAll('.pill-tab[data-mode]'));

  if (!tabs.length) return;

  const currentMode = options.initialMode || 'residential';
  setActiveTab(currentMode);

  function selectTab(tab) {
    const mode = tab.getAttribute('data-mode');
    setActiveTab(mode);
    tab.focus();

    if (typeof options.onTabChange === 'function') {
      options.onTabChange(mode);
    }
    window.dispatchEvent(new CustomEvent('app:mode-change', { detail: { mode } }));
  }

  // Event Click
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      selectTab(tab);
    });
  });

  // WAI-ARIA Keyboard Navigation
  if (tablist) {
    tablist.addEventListener('keydown', (e) => {
      const activeElement = document.activeElement;
      const currentIndex = tabs.indexOf(activeElement);
      if (currentIndex === -1) return;

      let nextIndex = currentIndex;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        nextIndex = (currentIndex + 1) % tabs.length;
        selectTab(tabs[nextIndex]);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        selectTab(tabs[nextIndex]);
      } else if (e.key === 'Home') {
        e.preventDefault();
        selectTab(tabs[0]);
      } else if (e.key === 'End') {
        e.preventDefault();
        selectTab(tabs[tabs.length - 1]);
      }
    });
  }
}
