/**
 * PT. Indogreen Technology And Management
 * Header & Action Toolbar Component
 * 
 * Handles:
 * 1. Reset simulation action
 * 2. Barcode modal trigger
 * 3. Native Fullscreen API toggle (kiosk booth mode)
 */

/**
 * Inisialisasi event listener navigasi header dan toolbar aksi cepat
 * @param {Object} options
 * @param {Function} [options.onReset] - Callback saat tombol reset ditekan
 * @param {Function} [options.onOpenQr] - Callback saat tombol QR ditekan
 */
export function initHeader(options = {}) {
  // 1. Tombol Reset Simulasi
  const btnReset = document.getElementById('btn-reset');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (typeof options.onReset === 'function') {
        options.onReset();
      }
      window.dispatchEvent(new CustomEvent('app:reset'));
    });
  }

  // 2. Tombol Buka Barcode Sales
  const btnQr = document.getElementById('btn-qr');
  if (btnQr) {
    btnQr.addEventListener('click', () => {
      if (typeof options.onOpenQr === 'function') {
        options.onOpenQr();
      }
      window.dispatchEvent(new CustomEvent('app:open-qr'));
    });
  }

  // 3. Tombol Layar Penuh (Fullscreen Kiosk Mode jika ada di DOM)
  const btnFullscreen = document.getElementById('btn-fullscreen');
  const fullscreenText = document.getElementById('fullscreen-text');
  const fullscreenIconSlot = document.getElementById('fullscreen-icon-slot');

  const maximizeIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><polyline points="21 15 21 21 15 21"/><polyline points="3 9 3 3 9 3"/></svg>`;
  const minimizeIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><polyline points="14 20 14 14 20 14"/><polyline points="10 4 10 10 4 10"/></svg>`;

  function updateFullscreenUI() {
    const isFullscreen = Boolean(document.fullscreenElement);
    if (fullscreenText) {
      fullscreenText.textContent = isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh';
    }
    if (fullscreenIconSlot) {
      fullscreenIconSlot.innerHTML = isFullscreen ? minimizeIcon : maximizeIcon;
    }
  }

  if (btnFullscreen) {
    btnFullscreen.addEventListener('click', async () => {
      try {
        if (!document.fullscreenElement) {
          if (document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen();
          }
        } else {
          if (document.exitFullscreen) {
            await document.exitFullscreen();
          }
        }
      } catch (err) {
        console.warn('Fullscreen API error:', err);
      }
    });

    document.addEventListener('fullscreenchange', updateFullscreenUI);
  }
}
