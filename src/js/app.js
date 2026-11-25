/**
 * PT. Indogreen Technology And Management
 * Main Application Orchestrator & State Controller
 */

import { initHeader } from './components/header.js';
import { initTabs } from './components/tabs.js';

document.addEventListener('DOMContentLoaded', () => {
  // Inisialisasi Header & Toolbar Aksi Cepat
  initHeader({
    onReset: () => {
      console.log('Reset simulasi ke nilai default');
    },
    onOpenQr: () => {
      console.log('Buka modal Barcode Sales');
      const dialog = document.getElementById('modal-qr-dialog');
      if (dialog && typeof dialog.showModal === 'function') {
        dialog.showModal();
      }
    }
  });

  // Inisialisasi Tab Segmented Controls (4 Mode Simulasi)
  initTabs({
    initialMode: 'residential',
    onTabChange: (mode) => {
      console.log('Mode kalkulator aktif:', mode);
      // Update badge mode indicator di panel form jika ada
      const badgeMode = document.getElementById('active-mode-badge');
      if (badgeMode) {
        const labels = {
          residential: 'PLTS ATAP RESIDENSIAL',
          commercial: 'PLTS BISNIS & INDUSTRI',
          battery: 'BATERAI CADANGAN (BESS)',
          pjuts: 'PENERANGAN JALAN (PJUTS)'
        };
        badgeMode.textContent = labels[mode] || mode.toUpperCase();
      }
    }
  });

  // Listener tombol tutup modal dialog jika ada
  const btnCloseModal = document.getElementById('btn-modal-close');
  const dialog = document.getElementById('modal-qr-dialog');
  if (btnCloseModal && dialog) {
    btnCloseModal.addEventListener('click', () => {
      dialog.close();
    });
    // Tutup saat klik backdrop
    dialog.addEventListener('click', (e) => {
      const rect = dialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        dialog.close();
      }
    });
  }
});
