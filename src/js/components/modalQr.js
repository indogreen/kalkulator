/**
 * PT. Indogreen Technology And Management
 * Component: Sales Barcode QR Modal Dialog (modalQr.js)
 * 
 * Accessible, zero-dependency HTML5 <dialog> controller:
 * - Renders crisp SVG QR Code from live WhatsApp simulation payload URL
 * - Native dialog.showModal() & dialog.close()
 * - Backdrop click-to-close detection
 * - Keyboard Escape key listener
 * - Clean focus management
 */

import { generateQrSvg } from '../utils/qrcode.js';

let dialogElement = null;
let closeButtonElement = null;
let closeBottomButtonElement = null;
let qrSlotElement = null;
let currentPayloadUrl = '';
let currentBoundDialog = null;
let previousActiveElement = null;

/**
 * Inisialisasi modal dialog QR Code Barcode Sales
 * @param {Object} options
 * @param {string|HTMLDialogElement} [options.dialog='modal-qr-dialog'] - Element atau ID modal dialog
 * @param {string|HTMLElement} [options.closeButton='btn-modal-close'] - Element atau ID tombol tutup
 * @param {string|HTMLElement} [options.qrSlot='qr-code-svg-slot'] - Element atau ID slot injeksi SVG QR
 * @returns {Object} Controller API { open, close, update, isOpen }
 */
export function initModalQr(options = {}) {
  const dialogId = typeof options.dialog === 'string' ? options.dialog : 'modal-qr-dialog';
  const closeBtnId = typeof options.closeButton === 'string' ? options.closeButton : 'btn-modal-close';
  const qrSlotId = typeof options.qrSlot === 'string' ? options.qrSlot : 'qr-code-svg-slot';

  dialogElement = typeof options.dialog === 'object' && options.dialog !== null
    ? options.dialog
    : (typeof document !== 'undefined' ? document.getElementById(dialogId) : null);

  closeButtonElement = typeof options.closeButton === 'object' && options.closeButton !== null
    ? options.closeButton
    : (typeof document !== 'undefined' ? document.getElementById(closeBtnId) : null);

  closeBottomButtonElement = typeof document !== 'undefined'
    ? document.getElementById('btn-modal-close-bottom')
    : null;

  qrSlotElement = typeof options.qrSlot === 'object' && options.qrSlot !== null
    ? options.qrSlot
    : (typeof document !== 'undefined' ? document.getElementById(qrSlotId) : null);

  if (!dialogElement) {
    return {
      open: openModalQr,
      close: closeModalQr,
      update: updateModalQrSvg,
      isOpen: isModalQrOpen
    };
  }

  // Bind event listeners whenever a new dialog element is provided
  if (currentBoundDialog !== dialogElement) {
    currentBoundDialog = dialogElement;

    // 1. Tombol Tutup (X) & Tombol Tutup Bawah
    if (closeButtonElement) {
      closeButtonElement.addEventListener('click', () => {
        closeModalQr();
      });
    }

    if (closeBottomButtonElement) {
      closeBottomButtonElement.addEventListener('click', () => {
        closeModalQr();
      });
    }

    // 2. Backdrop Click Close (Klik area luar dialog)
    dialogElement.addEventListener('click', (event) => {
      if (!dialogElement || !dialogElement.open) return;
      const rect = dialogElement.getBoundingClientRect();
      const isInDialog = (
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width
      );

      if (!isInDialog) {
        closeModalQr();
      }
    });

    // 3. Native Escape key handling via 'cancel' event
    dialogElement.addEventListener('cancel', () => {
      // Browser native dialog emits 'cancel' before closing on Escape
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('app:modal-qr-closed'));
      }
    });

    // 4. Defensive global Escape listener
    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isModalQrOpen()) {
          closeModalQr();
        }
      });
    }
  }

  return {
    open: openModalQr,
    close: closeModalQr,
    update: updateModalQrSvg,
    isOpen: isModalQrOpen
  };
}

/**
 * Perbarui konten SVG QR Code di dalam slot modal
 * @param {string} payloadUrl - URL WhatsApp dengan payload simulasi lengkap
 */
export function updateModalQrSvg(payloadUrl) {
  currentPayloadUrl = String(payloadUrl || '');
  if (!qrSlotElement && typeof document !== 'undefined') {
    qrSlotElement = document.getElementById('qr-code-svg-slot');
  }

  if (qrSlotElement && currentPayloadUrl) {
    try {
      const svg = generateQrSvg(currentPayloadUrl, {
        size: 256,
        margin: 4,
        ecc: 'L',
        darkColor: '#000000',
        lightColor: '#ffffff'
      });
      qrSlotElement.innerHTML = svg;
    } catch (err) {
      console.warn('Gagal merender QR Code SVG:', err);
    }
  }

  // Sinkronkan link tombol Buka di WhatsApp jika ada di dalam modal
  if (typeof document !== 'undefined') {
    const directWaBtn = document.getElementById('btn-modal-wa-direct');
    if (directWaBtn && currentPayloadUrl) {
      directWaBtn.setAttribute('href', currentPayloadUrl);
    }
  }
}

/**
 * Buka modal QR Code dan pastikan SVG ter-update
 * @param {string} [payloadUrl] - URL WhatsApp opsional jika ingin langsung diperbarui
 */
export function openModalQr(payloadUrl) {
  if (typeof document !== 'undefined') {
    previousActiveElement = document.activeElement;
  }

  if (payloadUrl) {
    updateModalQrSvg(payloadUrl);
  } else if (!qrSlotElement?.querySelector('svg') && currentPayloadUrl) {
    updateModalQrSvg(currentPayloadUrl);
  }

  if (!dialogElement && typeof document !== 'undefined') {
    dialogElement = document.getElementById('modal-qr-dialog');
  }

  if (dialogElement && typeof dialogElement.showModal === 'function') {
    if (!dialogElement.open) {
      dialogElement.showModal();
      if (closeButtonElement && typeof closeButtonElement.focus === 'function') {
        closeButtonElement.focus();
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('app:modal-qr-opened', {
          detail: { payloadUrl: currentPayloadUrl }
        }));
      }
    }
  }
}

/**
 * Tutup dialog modal QR Code
 */
export function closeModalQr() {
  if (!dialogElement && typeof document !== 'undefined') {
    dialogElement = document.getElementById('modal-qr-dialog');
  }

  if (dialogElement && typeof dialogElement.close === 'function') {
    if (dialogElement.open) {
      dialogElement.close();
      if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
        try {
          previousActiveElement.focus();
        } catch (_) {}
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('app:modal-qr-closed'));
      }
    }
  }
}

/**
 * Cek apakah modal dialog sedang dalam kondisi terbuka
 * @returns {boolean}
 */
export function isModalQrOpen() {
  if (!dialogElement && typeof document !== 'undefined') {
    dialogElement = document.getElementById('modal-qr-dialog');
  }
  return Boolean(dialogElement && dialogElement.open);
}
