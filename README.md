# Kalkulator Energi Surya Interaktif PT. Indogreen Technology And Management

Aplikasi web mandiri (*standalone web application*) berstandar rekayasa (*engineering-grade*) untuk simulasi kapasitas teknis, estimasi penghematan tagihan listrik PLN, kepatuhan batas legal rekening minimum, dan analisis kelayakan investasi PLTS serta sistem baterai cadangan anti-padam di Indonesia.

---

## 1. Ikhtisar & 4 Mode Simulasi

Aplikasi ini dirancang untuk penggunaan publik, konsultasi teknis sales engineer, hingga terminal anjungan pameran (*kiosk booth*) dengan kalkulasi reaktif instan (*real-time*) tanpa memuat ulang halaman.

### 4 Mode Simulasi Utama:
1. **PLTS Atap Residensial:**
   - Rekomendasi kapasitas modul Tier-1 600 Wp Monofacial berdasarkan batas daya PLN (900 VA s.d. 11.000 VA) dan batas luas atap.
   - Optimasi swakonsumsi (*self-consumption*) berdasarkan pola aktivitas siang hari (Rendah 25%, Sedang 35%, Tinggi 50%).
   - Kepatuhan mutlak aturan legal **Rekening Minimum PLN Permen ESDM No. 2/2024** ($40 \times \text{kVA} \times \text{Tarif per kWh}$).
   - Pilihan baterai hybrid LiFePO4 cadangan padam (5.12 kWh / 10.24 kWh).
   - Proyeksi 25 tahun, payback period (ROI), dan reduksi emisi karbon $CO_2$.
2. **PLTS Bisnis & Industri:**
   - Profil beban operasional fasilitas (Kantor 08-17, 1-Shift, 2-Shift, 24-Jam) disinkronkan dengan kurva radiasi matahari.
   - Komparasi 3 skema finansial komersial:
     - **CAPEX Beli Putus:** Kepemilikan aset hari pertama, O&M 1%, payback period ~4-6 tahun.
     - **OPEX PPA (Power Purchase Agreement):** Nol investasi awal (*Zero CAPEX*), diskon tarif 15% dari tarif PLN, O&M ditanggung pengembang, kontrak 20 tahun.
     - **OPEX Sewa Operasional:** Nol investasi awal, cicilan sewa tetap tenor 7 tahun, pengalihan hak milik di tahun ke-8.
3. **BESS / Baterai Cadangan Anti-Padam:**
   - Sizing kapasitas baterai LiFePO4 (90% Depth of Discharge, 95% efisiensi inverter) untuk sektor Rumah Tangga maupun Industri.
   - Sizing Inverter Darurat (*safety margin* 1.25x) dan modul Solar PV Charger mandiri saat listrik padam berhari-hari.
4. **Penerangan Jalan Umum Tenaga Surya (PJUTS):**
   - Perhitungan daya lampu LED (20W s.d. 200W) dan jumlah tiang jalan.
   - Fitur **Smart Dimming otomatis** (100% daya 5 jam awal + 50% daya sisa malam) menghemat hingga 30% kapasitas baterai & panel.
   - Cadangan hari otonomi cuaca mendung/hujan (1–3 hari).
   - Penghematan tagihan listrik setara Tarif P-3 PLN (Rp 1.699,53/kWh).

---

## 2. Arsitektur & Teknologi

Kalkulator dibangun dengan filosofi **performa sekejap mata (< 1 detik)**, **zero external runtime dependency**, dan **kepatuhan visual CAD flat** INDOGREEN:

```
kalkulator/
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
│       │   ├── residential.js       # Mesin hitung PLTS Rumah & Rekening Min
│       │   ├── commercial.js        # Mesin hitung PLTS Industri & 3 Skema
│       │   ├── battery.js           # Mesin hitung BESS LiFePO4
│       │   └── pjuts.js             # Mesin hitung PJUTS Smart Dimming
│       ├── components/              # UI components & form renderers
│       │   ├── header.js            # Header, toolbar aksi, drawer mobile
│       │   ├── tabs.js              # Segmented control 4 mode simulasi
│       │   ├── modalQr.js           # Accessible native dialog QR code
│       │   ├── forms/               # Input form generators (4 mode)
│       │   └── results/             # Visualizations (Hero card, KPI grid, Bill bar, Timeline, Table)
│       └── utils/
│           ├── qrcode.js            # Generator SVG QR Code murni zero-dependency
│           ├── whatsapp.js          # Generator pesan konsultasi WhatsApp terformat
│           └── formatter.js         # Format Rupiah IDR, kWp, persentase, angka
├── dist/
│   ├── css/style.css                # CSS produksi terkompilasi & ter-minifikasi
│   └── js/bundle.js                 # Standalone JS bundle (kompatibel file:// & http://)
├── test/                            # 64 unit test terotomatisasi (Node.js test runner)
└── scripts/                         # Script build & server lokal zero-dependency
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
```
Buka peramban di: `http://localhost:3000`

### Menjalankan Seluruh Automated Test Suite
```bash
npm test
```
Menjalankan 64 pengujian otomatis mencakup:
- Validasi numerik formula kelistrikan (Residensial, Komersial, BESS, PJUTS).
- Validasi proteksi rekening minimum PLN Permen ESDM No. 2/2024.
- Validasi rendering SVG QR Code & enkoding URL WhatsApp.
- Audit aksesibilitas WCAG 2.1 AA (touch target $\ge 44\text{px}$, ARIA, kontras warna).
- Audit responsivitas pada breakpoint 320px, 480px, 768px, 1024px, dan 1440px.
- Verifikasi kebocoran dependensi eksternal.

---

## 4. Panduan Penggunaan Fitur

1. **Simulasi Instan:**
   - Pilih mode simulasi pada tab di atas (PLTS Rumah, Bisnis, Baterai, atau PJUTS).
   - Geser slider atau ubah nominal tagihan/daya: panel kanan akan memperbarui angka penghematan bulanan, bar perbandingan, timeline payback 25 tahun, dan spesifikasi sistem secara seketika (*real-time*).
2. **Konsultasi WhatsApp:**
   - Klik tombol hijau **"Konsultasikan via WhatsApp"**.
   - Sistem membuka aplikasi WhatsApp dengan pesan rekayasa terstruktur yang merangkum parameter teknis dan estimasi investasi Anda ke tim sales engineer PT. Indogreen (+62 813-9916-890).
3. **Barcode Sales (Kiosk Mode):**
   - Klik tombol **"Buka Barcode Sales"** di header atau di kartu konversi hasil.
   - Pindai kode QR vektor SVG yang muncul di layar menggunakan kamera ponsel pengunjung untuk langsung mentransfer hasil simulasi ke WhatsApp ponsel mereka.
4. **Mode Layar Penuh (Kiosk / Booth Pameran):**
   - Tekan tombol **"Layar Penuh"** di header untuk mengubah tampilan menjadi anjungan pameran interaktif tanpa bilah browser.

---

## 5. Hak Cipta & Legalitas

© 2026 PT. Indogreen Technology And Management. Seluruh hak cipta dilindungi.  
Estimasi simulasi mengacu pada data meteorologi radiasi matahari PSH Indonesia dan Tabel Tarif Tenaga Listrik Kementerian ESDM 2026 serta Permen ESDM No. 2/2024.
