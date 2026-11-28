# Kalkulator Energi Surya Interaktif PT. Indogreen Technology And Management

Aplikasi web mandiri (*standalone web application*) berstandar rekayasa (*engineering-grade*) untuk simulasi kapasitas teknis, estimasi penghematan tagihan listrik PLN, kepatuhan batas legal rekening minimum, dan analisis kelayakan investasi PLTS serta sistem baterai cadangan anti-padam di Indonesia.

---

## 1. Ikhtisar & Mode Simulasi

Aplikasi ini dirancang untuk penggunaan publik, konsultasi teknis sales engineer, hingga terminal anjungan pameran (*kiosk booth*) dengan kalkulasi reaktif instan (*real-time*) tanpa memuat ulang halaman.

### Mode Utama Aktif: Kalkulator PLTS Hybrid Off-Grid
Antarmuka utama saat ini berfokus pada alur simulasi **PLTS Hybrid Off-Grid** 6 langkah yang terkalibrasi dengan **Tarif PLN 2026**:
1. **Kategori Pelanggan:** Pilihan sektor **Residential** (Rumah Tangga) atau **Business / Commercial** (Bisnis & Industri).
2. **Golongan Daya & Tarif PLN 2026:** Pilihan kapasitas daya dan tarif resmi PLN (subsidi & non-subsidi).
3. **Biaya Listrik Bulanan:** Input nominal tagihan listrik bulanan untuk menghitung estimasi konsumsi energi harian (kWh/hari).
4. **Proporsi Pemakaian Siang vs Malam:** Pengisian seimbang otomatis (total 100%) antara beban siang hari dan beban malam hari.
5. **Sistem Hybrid Off-Grid:** Kalkulasi kebutuhan kapasitas panel surya (PV kWp), Hybrid Inverter (kW), dan kapasitas Baterai LiFePO4 (kWh).
6. **Target Cakupan (Cover %):** Penyesuaian persentase kebutuhan energi yang ingin ditanggung oleh sistem PLTS.

### Modul Mesin Hitung Tersedia (Modular / Diarsipkan dari UI Tab)
Selain mesin utama `hybrid.js`, repositori ini juga tetap mempertahankan 4 modul kalkulator spesialis beserta komponen form dan unit test-nya:
- **PLTS Atap Residensial (`residential.js`):** Optimasi swakonsumsi, proteksi **Rekening Minimum PLN Permen ESDM No. 2/2024** ($40 \times \text{kVA} \times \text{Tarif per kWh}$), dan opsi baterai hybrid LiFePO4.
- **PLTS Bisnis & Industri (`commercial.js`):** Analisis kurva beban operasional (Kantor 08–17, 1-Shift, 2-Shift, 24-Jam) dan komparasi 3 skema finansial (CAPEX Beli Putus, OPEX PPA Diskon 15%, OPEX Sewa 7 Tahun).
- **BESS / Baterai Cadangan Anti-Padam (`battery.js`):** Sizing kapasitas baterai LiFePO4 (90% DoD, 95% efisiensi inverter), inverter darurat (*safety margin* 1.25x), dan opsi Solar PV Charger.
- **PJUTS (`pjuts.js`):** Perhitungan daya lampu LED (20W–200W), fitur *Smart Dimming*, durasi otonomi cuaca mendung/hujan (1–3 hari), dan penghematan Tarif P-3 PLN.

---

## 2. Arsitektur & Teknologi

Kalkulator dibangun dengan filosofi **performa sekejap mata (< 1 detik)**, **zero external runtime dependency**, dan **kepatuhan visual CAD flat** INDOGREEN:

```
kalkulator/
├── .github/
│   └── workflows/
│       └── ci.yml                   # CI Quality Gate (push & PR ke main)
├── index.html                       # Semantic HTML5, accessible shell, modal dialog
├── package.json                     # Konfigurasi dev tools & build scripts
├── tailwind.config.js               # Token desain resmi INDOGREEN (warna, 2px radius, Inter)
├── postcss.config.js                # PostCSS & Autoprefixer
├── src/
│   ├── css/
│   │   └── style.css                # Tailwind base directives & utility classes
│   └── js/
│       ├── app.js                   # State orchestrator & event controller
│       ├── calculator/              # Pure JavaScript calculation engine
│       │   ├── constants.js         # PSH 9 wilayah, tarif PLN 2026, konstanta teknis
│       │   ├── hybrid.js            # Mesin hitung utama PLTS Hybrid Off-Grid
│       │   ├── residential.js       # Mesin hitung PLTS Rumah & Rekening Min
│       │   ├── commercial.js        # Mesin hitung PLTS Industri & 3 Skema
│       │   ├── battery.js           # Mesin hitung BESS LiFePO4
│       │   └── pjuts.js             # Mesin hitung PJUTS Smart Dimming
│       ├── components/              # UI components & form renderers
│       │   ├── header.js            # Header, toolbar aksi, drawer mobile
│       │   ├── tabs.js              # Segmented control tab simulasi
│       │   ├── modalQr.js           # Accessible native dialog QR code
│       │   ├── forms/               # Input form generators (hybrid & modul arsip)
│       │   │   ├── hybridForm.js
│       │   │   ├── residentialForm.js
│       │   │   ├── commercialForm.js
│       │   │   ├── batteryForm.js
│       │   │   └── pjutsForm.js
│       │   └── results/             # Visualizations & cards
│       │       ├── index.js
│       │       ├── heroCard.js
│       │       ├── kpiGrid.js
│       │       ├── energyProfile.js
│       │       ├── billBar.js
│       │       ├── timeline.js
│       │       ├── schemeTable.js
│       │       ├── conversionCta.js
│       │       └── regulatoryNote.js
│       └── utils/
│           ├── qrcode.js            # Generator SVG QR Code murni zero-dependency
│           ├── whatsapp.js          # Generator pesan konsultasi WhatsApp terformat
│           └── formatter.js         # Format Rupiah IDR, kWp, persentase, angka
├── dist/
│   ├── css/style.css                # CSS produksi terkompilasi & ter-minifikasi
│   └── js/bundle.js                 # Standalone JS bundle (kompatibel file:// & http://)
├── test/                            # 75 unit test terotomatisasi (Node.js test runner)
│   ├── calculator.test.js
│   ├── orchestration.test.js
│   ├── results.test.js
│   ├── utils.test.js
│   └── qa-accessibility.test.js
└── scripts/
    ├── build.js                     # Builder bundle JS & cache-busting hash asset
    └── serve.js                     # Server lokal dev zero-dependency + no-cache headers
```

### Standar Kepatuhan Aksesibilitas (WCAG 2.1 AA) & Desain:
- **Geometri Sudut:** Wajib 2px (`rounded-sm`) pada seluruh tombol, kartu, input, dan tab.
- **Warna Brand:** INDOGREEN Green (`#00b100`) untuk tombol utama dengan **teks wajib Hitam Pekat (`#000000`)** (rasio kontras 7.34:1, lolos WCAG AAA).
- **Touch Target:** Seluruh tombol, chips preset, dan toggle memiliki ukuran target sentuh minimal **$44 \times 44\text{ px}$**.
- **WAI-ARIA:** Dilengkapi atribut semantik `role="tablist"`, `role="tab"`, `role="tabpanel"`, `role="dialog"`, `aria-modal="true"`, `aria-pressed`, dan `aria-describedby`.
- **Zero-Dependency Runtime:** Tidak ada dependensi eksternal (tanpa React, tanpa Vue, tanpa Chart.js). QR Code dihasilkan langsung dalam format vektor SVG oleh algoritma mandiri `qrcode.js`.

---

## 3. Panduan Instalasi & Build

### Prasyarat
- [Node.js](https://nodejs.org/) versi 18 atau lebih baru.

### Instalasi Dependensi Pengembang
```bash
npm install
```
*(Catatan: npm package hanya berisi build tools dev: `tailwindcss`, `postcss`, dan `autoprefixer`).*

### Perintah Build Produksi
```bash
# 1. Build CSS terkompilasi dan ter-minifikasi
npm run build:css

# 2. Build JavaScript bundle standalone mandiri
npm run build:js

# 3. Jalankan kedua build di atas sekaligus
npm run build
```

### Menjalankan Server Lokal Dev / Preview
```bash
npm run serve
# atau
npm start
# atau
npm run dev
```
Buka peramban di: `http://localhost:3000`

### Menjalankan Seluruh Automated Test Suite
```bash
npm test
```
Menjalankan 75 pengujian otomatis (18 suite) mencakup:
- Validasi numerik formula kelistrikan (Hybrid Off-Grid, Residensial, Komersial, BESS, PJUTS).
- Validasi proteksi rekening minimum PLN Permen ESDM No. 2/2024.
- Validasi orkestrasi state reaktif, rendering panel hasil, SVG QR Code & enkoding URL WhatsApp.
- Audit aksesibilitas WCAG 2.1 AA (touch target $\ge 44\text{px}$, ARIA, kontras warna).
- Audit responsivitas pada breakpoint 320px, 480px, 768px, 1024px, dan 1440px.
- Verifikasi build produksi, cache-busting hash aset, header server, dan kebocoran dependensi eksternal.

### CI/CD (GitHub Actions)

Proyek ini dilengkapi pipeline otomasi pengujian dan penyebaran berkesinambungan (CI/CD):

1. **Continuous Integration ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)):**
   - Menjalankan verifikasi dokumen fondasi, kompilasi build aset produksi (`npm run build`), dan seluruh test suite (`npm test`) secara otomatis pada event `push` dan `pull_request` ke branch `main`.
   - Menggunakan concurrency cancel-in-progress untuk membatalkan pengujian lama saat ada commit baru.

2. **Continuous Deployment ([`.github/workflows/cd.yml`](.github/workflows/cd.yml)):**
   - Berjalan pada **GitHub Self-Hosted Runner** di server lokal (`192.168.1.34`).
   - Dilengkapi **Fork Guard** (`if: github.repository == 'indogreen/kalkulator'`) agar tidak menggantung di antrean repo fork.
   - Menggunakan token bawaan `${{ secrets.GITHUB_TOKEN }}` via `x-access-token` dan `safe.directory` untuk sinkronisasi Git otomatis.
   - Alur deployment 4 tahap: Git Sync ➔ `npm ci` & `npm run build` ➔ `sudo systemctl restart kalkulator-idg.service` ➔ Health check (Port sesuai `.env` atau default).
   - **Prasyarat Server (`/etc/sudoers.d/github-actions-runner`):**
     ```bash
     <user-runner> ALL=(ALL) NOPASSWD: /bin/systemctl restart kalkulator-idg.service, /usr/bin/systemctl restart kalkulator-idg.service
     ```
   - **Unit Service Systemd (`/etc/systemd/system/kalkulator-idg.service`):**
     ```ini
     [Unit]
     Description=Indogreen Solar Energy Calculator Service
     After=network.target

     [Service]
     Type=simple
     User=<user-runner>
     WorkingDirectory=/opt/lampp/htdocs/project/indogreen/kalkulator
     ExecStart=/usr/bin/node scripts/serve.js
     Restart=always
     RestartSec=5
     Environment=NODE_ENV=production
     Environment=PORT=3000
     Environment=HOST=0.0.0.0

     [Install]
     WantedBy=multi-user.target
     ```

---

## 4. Panduan Penggunaan Fitur

1. **Simulasi Instan (6 Langkah Hybrid Off-Grid):**
   - Pilih kategori pelanggan (Residential / Business), golongan daya PLN, isi biaya listrik bulanan, atur proporsi pemakaian siang vs malam, dan sesuaikan target persentase cakupan (*cover*).
   - Panel kanan akan memperbarui kebutuhan kapasitas PV (kWp), Hybrid Inverter, Baterai LiFePO4, serta profil energi secara seketika (*real-time*).
2. **Konsultasi WhatsApp:**
   - Klik tombol hijau **"Konsultasikan via WhatsApp"**.
   - Sistem membuka aplikasi WhatsApp dengan pesan rekayasa terstruktur yang merangkum parameter teknis dan hasil sizing sistem Anda ke tim sales engineer PT. Indogreen (+62 817-0092-221 / 08170092221).
3. **Barcode Sales (Kiosk Mode):**
   - Klik tombol **"Buka Barcode Sales"** di header atau di kartu konversi hasil.
   - Pindai kode QR vektor SVG yang muncul di layar menggunakan kamera ponsel pengunjung untuk langsung mentransfer hasil simulasi ke WhatsApp ponsel mereka.
4. **Mode Layar Penuh (Kiosk / Booth Pameran):**
   - Tekan tombol **"Layar Penuh"** di header untuk mengubah tampilan menjadi anjungan pameran interaktif tanpa bilah browser.

---

## 5. Hak Cipta & Legalitas

© 2026 PT. Indogreen Technology And Management. Seluruh hak cipta dilindungi.  
Estimasi simulasi mengacu pada data meteorologi radiasi matahari PSH Indonesia dan Tabel Tarif Tenaga Listrik Kementerian ESDM 2026 serta Permen ESDM No. 2/2024.
