# MASTER IMPLEMENTATION PLAN
## Website Kalkulator Energi Surya Interaktif PT. Indogreen Technology And Management
**Teknologi:** HTML5, Tailwind CSS, Modern Vanilla JavaScript (ES Modules)  
**Kepatuhan Desain:** INDOGREEN Design System (`DESIGN.md`, `05-design-decisions.md`)  
**Basis Fungsional:** Reverse Engineering `energymart.id/calculator-energy` (`kalkulator_energi_plan.md`)  
**Status:** Frozen Specification / Implementation Ready

---

## 1. Ringkasan Eksekutif & Analisis Kebutuhan

Rencana implementasi ini dirancang khusus untuk memandu AI coding agent (Codex, Claude Code, Antigravity, dll.) dalam membangun portal web **Kalkulator Energi Surya Interaktif** secara bertahap, terkontrol, dan presisi.

### 1.1. Filosofi & Batasan Arsitektur
1. **Tech Stack Murni & Mandiri:**
   - **HTML5:** Struktur semantik, aksesibel (WCAG 2.1 AA), dan ramah SEO.
   - **Tailwind CSS:** Sistem styling utilitas terkalibrasi 100% dengan token resmi INDOGREEN.
   - **Modern Vanilla JavaScript (ES Modules):** Mesin kalkulasi dan manajemen state reaktif instan *zero external runtime dependency*.
2. **Kepatuhan Mutlak Sistem Desain INDOGREEN (Bukan energymart.id):**
   - **Geometri Hyper-Angular:** Semua kartu, tombol, input, tab, dan badge **wajib ber-radius 2px (`rounded-sm` / 2px)**. Dilarang keras menggunakan tombol lonjong atau kartu ber-radius besar (`rounded-2xl`, `rounded-full`).
   - **Estetika Flat CAD:** Menggunakan garis batas hairline 1px solid (`#cccccc` pada kanvas putih, `#5e5e5e` pada kanvas gelap). **Dilarang menambahkan soft drop shadow dekoratif atau gradien visual.**
   - **Warna Tunggal yang Kuat:** Warna primer adalah **INDOGREEN Green (`#00b100`)** dengan teks tombol wajib **Hitam Pekat (`#000000`)** demi kontras AA.
   - **Ornamen Khas (Signature Motif):** Kotak aksen hijau padat ukuran 12×12px (`corner-square`) pada sudut kartu.
3. **Kebijakan Zero-Dependency:**
   - Generator QR Code diimplementasikan mandiri dalam JavaScript murni berbasis SVG tanpa paket npm eksternal.
   - Tanpa framework besar (React/Vue/Svelte) untuk implementasi web statis ini agar kode ringkas, loading sekejap mata (< 1 detik), dan mudah diaudit.

---

## 2. Struktur Direktori Proyek

```
/Users/kupzed/Code/indogreen/kalkulator/
├── index.html                       # Halaman utama kalkulator (Semantic HTML5)
├── package.json                     # Konfigurasi npm build scripts & dev tools
├── tailwind.config.js               # Konfigurasi token desain resmi INDOGREEN
├── postcss.config.js                # Konfigurasi PostCSS / Autoprefixer
├── src/
│   ├── css/
│   │   └── style.css                # Base Tailwind directives, typography, & input styling
│   └── js/
│       ├── app.js                   # Application entry point & reactive state orchestrator
│       ├── calculator/
│       │   ├── constants.js         # Konstanta wilayah PSH, tarif PLN, efisiensi, dan patokan harga
│       │   ├── residential.js       # Algoritma PLTS Atap Residensial (Self-Consumption & Rekening Min)
│       │   ├── commercial.js        # Algoritma PLTS Bisnis/Industri (Kurva Beban & 3 Skema Finansial)
│       │   ├── battery.js           # Algoritma BESS / Anti-Padam (LiFePO4 DoD 90% & Sizing Inverter)
│       │   └── pjuts.js             # Algoritma PJUTS (Smart Dimming, Otonomi Hujan, & Tarif P-3)
│       ├── components/
│       │   ├── header.js            # Header, badge simulator, & aksi cepat (Reset, QR, Fullscreen)
│       │   ├── tabs.js              # Segmented control 4 mode simulasi
│       │   ├── forms/
│       │   │   ├── residentialForm.js # Form input parameter PLTS Rumah
│       │   │   ├── commercialForm.js  # Form input PLTS Bisnis/Industri
│       │   │   ├── batteryForm.js     # Form input BESS / Baterai
│       │   │   └── pjutsForm.js       # Form input PJUTS
│       │   ├── results/
│       │   │   ├── heroCard.js        # Hero card penghematan bulanan (kanvas hitam CAD)
│       │   │   ├── kpiGrid.js         # Grid 4 metrik finansial/teknis
│       │   │   ├── billBar.js         # Visualisasi bar perbandingan tagihan sebelum vs sesudah
│       │   │   ├── timeline.js        # Visualisasi timeline 25 tahun & break-even point
│       │   │   └── schemeTable.js     # Tabel perbandingan 3 skema (CAPEX, PPA, Sewa)
│       │   └── modalQr.js           # Modal popup render SVG QR Code
│       └── utils/
│           ├── qrcode.js            # Generator SVG QR Code mandiri (zero-dependency)
│           ├── whatsapp.js          # Generator format pesan konsultasi sales WhatsApp
│           └── formatter.js         # Format mata uang IDR, desimal kWp, & angka
├── test/
│   ├── calculator.test.js           # Validasi numerik seluruh formula matematika
│   └── utils.test.js                # Validasi output SVG QR & URL WhatsApp
└── assets/
    ├── images/
    │   └── indogreen.png            # Logo resmi PT. Indogreen Technology And Management
    └── icons/                       # SVG icon symbols (Lucide/FA6 clean SVGs)
```

---

## 3. Tahapan Implementasi (Phase by Phase Breakdown)

Setiap fase berikut dirancang agar memiliki batasan scope yang jelas, dapat diverifikasi secara mandiri, dan dilengkapi dengan **Prompt AI Coding Agent** yang siap disalin untuk dieksekusi.

---

### FASE 1: Project Setup, Tooling & Tailwind Design System Configuration
**Status:** Selesai (Completed) ✅

#### 1. Tujuan
Mempersiapkan infrastruktur dasar proyek, build tools, dan mengonfigurasi Tailwind CSS agar seluruh token warna, tipografi Inter, spacing, dan geometri dari `DESIGN.md` tersedia sebagai kelas utilitas.

#### 2. Scope Pekerjaan
- Menginisialisasi `package.json` dengan Tailwind CSS CLI dan skrip `npm run build` / `npm run dev`.
- Mengonfigurasi `tailwind.config.js` dengan palet warna resmi (`primary: #00b100`, `ink: #000000`, `canvas: #ffffff`, `surface-dark: #000000`, `hairline: #cccccc`, `hairline-strong: #5e5e5e`, dll.).
- Mengatur skala tipografi Inter (18 tingkat hierarki dari `type-display-xl` hingga `type-utility-xs`).
- Mengatur token radius ketat: `rounded-sm: 2px`, `rounded-none: 0px`.
- Mengatur spacing 8px base grid dan tinggi minimum interaktif 44px (`h-touch`).
- Menyiapkan file `src/css/style.css` berisi import font Inter, base styles, dan reset border box.
- Menyiapkan aset logo `assets/images/indogreen.png`.

#### 3. Detail File & Task Teknis
- **`package.json`**:
  - `devDependencies`: `tailwindcss`, `postcss`, `autoprefixer`.
  - `scripts`: `"build:css": "tailwindcss -i ./src/css/style.css -o ./dist/css/style.css --minify"`, `"dev": "tailwindcss -i ./src/css/style.css -o ./dist/css/style.css --watch"`.
- **`tailwind.config.js`**:
  - Mendaftarkan token warna sesuai `DESIGN.md`:
    - `primary`: `#00b100` (on-primary: `#000000`)
    - `primary-dark`: `#008a00`
    - `accent-yellow`: `#ffff00`
    - `surface-dark`: `#000000`
    - `canvas`: `#ffffff`
    - `surface-soft`: `#f7f7f7`
    - `surface-elevated`: `#1a1a1a`
    - `hairline`: `#cccccc`
    - `hairline-strong`: `#5e5e5e`
    - `mute`: `#757575`
    - `stone`: `#898989`
    - `ash`: `#a7a7a7`
  - Font family: `sans: ['Inter', 'Arial', 'sans-serif']`.
  - Border radius: `{ 'none': '0px', 'xs': '1px', 'sm': '2px', 'full': '9999px' }`.
- **`src/css/style.css`**:
  - `@tailwind base; @tailwind components; @tailwind utilities;`
  - Definisi utility classes tipografi resmi: `.type-display-xl` (48px, bold, lh 1.25), `.type-display-lg` (36px, bold, lh 1.25), `.type-heading-xl` (24px, bold), `.type-body-md` (16px), `.type-caption-md` (14px, bold, uppercase), dll.
  - Form focus rule: fokus input hanya 2px solid `#00b100` tanpa browser default blue ring.

#### 4. Kriteria Keberhasilan & Verifikasi
- Perintah `npm run build:css` selesai tanpa error dan menghasilkan `./dist/css/style.css`.
- File HTML uji coba sederhana dapat menggunakan kelas `bg-primary text-on-primary rounded-sm border border-hairline` dan menghasilkan elemen hijau presisi dengan sudut 2px.

#### 5. Prompt AI Coding Agent (Siap Pakai untuk Fase 1)
```text
PROMPT FASE 1:
Anda adalah web developer ahli. Kerjakan Fase 1 untuk website Kalkulator Energi Surya Indogreen:
1. Inisialisasi package.json dengan tooling Tailwind CSS CLI.
2. Buat tailwind.config.js yang mengimplementasikan 100% token dari DESIGN.md:
   - Warna: primary (#00b100), on-primary (#000000), primary-dark (#008a00), ink (#000000), canvas (#ffffff), surface-dark (#000000), surface-soft (#f7f7f7), hairline (#cccccc), hairline-strong (#5e5e5e), mute (#757575), stone (#898989), accent-yellow (#ffff00), error (#e52020), warning (#df6500).
   - Radius: sm adalah 2px, none adalah 0px. DILARANG menambahkan radius selain 2px untuk elemen UI.
   - Font: Inter dengan fallback Arial.
   - Spacing: 8px base system (sm: 8px, md: 12px, lg: 16px, xl: 24px, xxl: 32px, section: 64px, touch: 44px).
3. Buat src/css/style.css dengan Tailwind directives dan kelas tipografi resmi (type-display-xl, type-display-lg, type-heading-xl, type-heading-md, type-body-md, type-caption-md, dll.).
4. Siapkan placeholder logo assets/images/indogreen.png atau SVG logo INDOGREEN.
5. Jalankan build CSS untuk memastikan tidak ada syntax error.
```

---

### FASE 2: Core Calculation Engine (Pure JavaScript & Zero Dependencies)
**Status:** Selesai (Completed) ✅

#### 1. Tujuan
Membangun seluruh logika matematika dan rekayasa kelistrikan energi surya dalam JavaScript murni (ES Modules) yang terisolasi dari DOM, akurat sesuai regulasi Indonesia (Permen ESDM No. 2/2024), dan teruji dengan unit test.

#### 2. Scope Pekerjaan
- **`src/js/calculator/constants.js`**:
  - Jam Matahari Puncak (PSH) 9 wilayah Indonesia: DKI/Jabar/Banten (4.4), Jateng/DIY (4.6), Jatim (4.8), Sumatera (4.3), Kalimantan (4.4), Sulawesi (4.9), Bali/NTB (5.1), NTT (5.4), Maluku/Papua (4.7).
  - Tabel tarif PLN 2026 (Penetapan Tarif Penyesuaian Okt–Des 2026): R-1 900 (Rp 1.352), R-1 1300/2200 (Rp 1.444,70), R-2/R-3 (Rp 1.699,53), B-2 (Rp 1.444,70), B-3 (Rp 1.035,78 LWBP), I-3 (Rp 1.035,78 LWBP), I-4 (Rp 996,74), P-1 (Rp 1.699,53), P-2 (Rp 1.415,01 LWBP), P-3 (Rp 1.699,53). (Catatan: Rp 1.114,74 pada B-3/I-3 adalah tarif kelebihan daya reaktif/kVArh, sedangkan produksi PLTS siang hari menggantikan energi aktif di blok LWBP Rp 1.035,78/kWh).
  - Spesifikasi teknis: Modul Tier-1 600 Wp, Performance Ratio (PR) 0.80, Emisi Karbon 0.87 kg CO₂/kWh, rasio luas atap (6.0 m²/kWp rumah, 5.5 m²/kWp industri).
  - Biaya acuan turnkey per Wp bergradasi kapasitas + PPN 11%, biaya baterai LiFePO4 per kWh.
- **`src/js/calculator/residential.js`**:
  - Algoritma pencarian kWp optimal (2 modul s.d batas daya VA/atap).
  - Perhitungan proteksi Rekening Minimum PLN: $40 \times \text{kVA} \times \text{Tarif per kWh}$.
  - Tagihan sebelum vs sesudah, penghematan bulanan, payback period, proyeksi 25 tahun (degradasi modul 0.5%/tahun), jam cadangan baterai LiFePO4 (5.12 kWh / 10.24 kWh), reduksi CO₂ & pohon.
- **`src/js/calculator/commercial.js`**:
  - Profil konsumsi 24 jam (Kantor 08-17, 1-Shift, 2-Shift, 24-Jam) vs kurva sinusoidal radiasi matahari.
  - Komparasi 3 skema finansial:
    1. **CAPEX Beli Putus:** Turnkey penuh, O&M 1%, 100% penghematan dinikmati pemilik, payback period ~4-6 tahun.
    2. **OPEX PPA (Zero CAPEX):** Nol investasi awal, diskon tarif 15% dari tarif PLN, O&M ditanggung pengembang, kontrak 20 tahun.
    3. **OPEX Sewa Operasional:** Nol investasi awal, sewa bulanan tetap tenor 7 tahun, hak milik berpindah di akhir tenor.
- **`src/js/calculator/battery.js`**:
  - Sizing BESS LiFePO4 (90% DoD, 95% Inverter Efficiency) untuk beban kritis kW dan durasi backup jam.
  - Sizing Inverter Darurat (safety margin 1.25x) dan Solar PV Charger.
- **`src/js/calculator/pjuts.js`**:
  - Konsumsi Wh harian (lampu 20W - 200W).
  - Fitur Smart Dimming otomatis (100% daya 5 jam awal + 50% sisa malam) menghemat hingga 30% kapasitas baterai & panel.
  - Otonomi hari hujan (1–3 hari).
  - Avoided cost tagihan listrik PLN Tarif P-3 (Rp 1.699,53/kWh).
- **`test/calculator.test.js`**:
  - Script pengujian mandiri menggunakan Node.js assert atau test runner untuk memvalidasi seluruh fungsi matematis.

#### 3. Detail File & Task Teknis
- Memastikan seluruh perhitungan matematis tidak pernah membagi dengan angka nol (*divide-by-zero protection*).
- Memastikan tagihan setelah PLTS tidak pernah turun di bawah nilai legal rekening minimum PLN.
- Menjamin fungsi bersifat murni (*pure functions*): menerima object input dan mengembalikan object output terstruktur.

#### 4. Kriteria Keberhasilan & Verifikasi
- Menjalankan `node test/calculator.test.js` dan seluruh uji logika (Residensial, Bisnis, Baterai, PJUTS) lulus 100% tanpa error.
- Validasi numerik: Rumah 2.200 VA tagihan Rp 1.500.000 menghasilkan rekomendasi modul dan kWp yang masuk akal (~2.4 - 3.0 kWp) dengan payback period realistis (4-6 tahun).

#### 5. Prompt AI Coding Agent (Siap Pakai untuk Fase 2)
```text
PROMPT FASE 2:
Anda adalah computational engineer energi terbarukan. Kerjakan Fase 2 untuk Kalkulator Energi Surya Indogreen:
1. Buat folder src/js/calculator/ dan file:
   - constants.js: Wilayah radiasi PSH Indonesia (9 area), tabel tarif PLN ESDM (R1, R2, B2, B3, I3, I4, P1, P3), modul 600 Wp, PR 80%, emisi 0.87 kg CO2/kWh, batas harga turnkey per-Wp.
   - residential.js: Algoritma kalkulasi PLTS rumah tangga, self-consumption optimizer, aturan mutlak rekening minimum PLN (40 x kVA x tarif), payback period, proyeksi 25 tahun, opsi baterai 5.12/10.24 kWh.
   - commercial.js: Algoritma PLTS industri/komersial, analisis kurva beban 24 jam vs radiasi, komparasi 3 skema (CAPEX Beli Putus, OPEX PPA Diskon 15%, OPEX Sewa 7 thn).
   - battery.js: Algoritma sizing BESS LiFePO4 (90% DoD, efisiensi inverter 95%) berdasarkan beban kW dan jam backup.
   - pjuts.js: Algoritma PJUTS (lampu 20-200W, smart dimming 50%, hari otonomi 1-3 hari, penghematan tarif P-3).
2. Buat file test/calculator.test.js untuk menguji semua fungsi kalkulasi dengan berbagai variasi input (edge cases, beban nol, nilai ekstrem).
3. Jalankan "node test/calculator.test.js" dan pastikan semua pengujian lulus 100%.
```

---

### FASE 3: Generator Barcode QR Mandiri & Generator Pesan WhatsApp
**Status:** Selesai (Completed) ✅

#### 1. Tujuan
Menyediakan utilitas *zero-dependency* untuk menghasilkan QR Code berbasis SVG murni serta generator format pesan WhatsApp konsultasi penjualan rekayasa EBT.

#### 2. Scope Pekerjaan
- **`src/js/utils/qrcode.js`**:
  - Implementasi generator QR Code matriks mandiri dalam JavaScript murni tanpa ketergantungan npm library pihak ketiga (seperti `qrcode` atau `qrcode.react`), sesuai ketentuan mutlak INDOGREEN.
  - Menghasilkan string atau node `<svg>` yang dapat diskalakan (*scalable*), tajam di layar Retina/kiosk, dan ringan.
- **`src/js/utils/whatsapp.js`**:
  - Membuat format pesan terstruktur yang merangkum hasil kalkulasi untuk setiap mode (Residensial, Komersial, Baterai, PJUTS).
  - Menghasilkan URL `https://wa.me/628170092221?text=...` dengan teks yang di-encode URI secara aman.
- **`src/js/utils/formatter.js`**:
  - Fungsi utilitas untuk memformat Rupiah (`Rp 1.450.000`), desimal kWp (`3.60 kWp`), unit modul, dan persentase.
- **`test/utils.test.js`**:
  - Pengujian pembuatan SVG QR Code dan format pesan WhatsApp.

#### 3. Detail File & Task Teknis
- **Struktur Pesan WhatsApp Contoh (Residensial)**:
  ```text
  Halo Tim Engineering PT. Indogreen Technology And Management,
  Saya ingin konsultasi teknis sistem PLTS Atap Residensial:
  - Daya PLN: 2.200 VA (Tarif R-1)
  - Tagihan Bulanan: Rp 1.500.000 / bulan
  - Wilayah: DKI Jakarta & Jabar (PSH 4.4)
  - Rekomendasi Sistem: 2.40 kWp (4 Modul 600 Wp)
  - Opsi Baterai: Hybrid LiFePO4 5.12 kWh
  - Estimasi Penghematan: Rp 480.000 / bulan (32%)
  - Estimasi Investasi Turnkey: Rp 38.500.000
  Mohon dapat dibantu survei lokasi dan penawaran teknis resminya. Terima kasih.
  ```

#### 4. Kriteria Keberhasilan & Verifikasi
- Menjalankan `node test/utils.test.js` memastikan string SVG QR valid memiliki elemen `<rect>` modul hitam dan putih.
- Link WhatsApp yang dihasilkan dapat didecode kembali dan memuat seluruh data teknis dengan format rapi.

#### 5. Prompt AI Coding Agent (Siap Pakai untuk Fase 3)
```text
PROMPT FASE 3:
Anda adalah web developer spesialis utilitas. Kerjakan Fase 3 untuk Kalkulator Energi Surya Indogreen:
1. Buat src/js/utils/qrcode.js:
   - Implementasikan QR Code generator berbasis SVG murni dalam Vanilla JS (ES Modules) tanpa dependensi eksternal apa pun (zero npm dependencies).
   - Fungsi generateQrSvg(text, options) mengembalikan string SVG yang valid, scalable, dan tajam.
2. Buat src/js/utils/whatsapp.js:
   - Fungsi generateWhatsAppUrl(mode, input, result) yang merangkum hasil kalkulasi menjadi pesan WhatsApp teknis terformat rapi dan ditargetkan ke nomor sales Indogreen (+62 817-0092-221 / 08170092221).
3. Buat src/js/utils/formatter.js:
   - Fungsi formatRupiah(number), formatNumber(number, decimals), formatKwp(number).
4. Buat test/utils.test.js untuk memvalidasi bahwa SVG QR terbentuk sempurna dan URL WA ter-encode dengan benar.
5. Jalankan test dan pastikan semua berhasil.
```

---

### FASE 4: Shell Halaman & Komponen Global (Header, Navigasi, Hero Chapter, Tabs, Footer)
**Status:** Selesai (Completed) ✅

#### 1. Tujuan
Membangun kerangka dasar antarmuka halaman web statis `index.html` lengkap dengan sistem navigasi resmi, hero chapter kanvas hitam, segmented control 4 tab, dan footer teknis INDOGREEN.

#### 2. Scope Pekerjaan
- **Top Utility Bar (32px)**: Kanvas hitam `#000000`, teks caption 12px putih/abu-abu, informasi hotline EBT resmi.
- **Primary Navigation (64px)**: Kanvas hitam `#000000`, logo resmi INDOGREEN, link navigasi ("Solusi", "Kalkulator", "Tentang Kami"), tombol CTA konsultasi hijau `#00b100`, dan menu burger mobile.
- **Hero Chapter (`hero-card-dark`)**: Kanvas hitam CAD pekat, badge status `SIMULATOR INTERAKTIF`, headline `type-display-xl` ("Kalkulator Energi Surya Interaktif"), subhead `type-heading-lg`, dan bilah aksi cepat:
  1. Tombol *Reset Simulasi* (Icon RotateCcw).
  2. Tombol *Barcode Sales* (Icon QrCode).
  3. Tombol *Layar Penuh* (Icon Maximize2 untuk kiosk booth).
- **Segmented Control Tabs (`pill-tab`)**:
  - 4 Mode: PLTS Rumah Tangga, PLTS Bisnis & Industri, Baterai Cadangan, PJUTS.
  - Gaya: Batas hairline 1px `#cccccc` saat inaktif, latar solid `#000000` dengan border `#00b100` saat aktif, sudut 2px `rounded-sm`.
- **Footer Section**:
  - Kanvas hitam `#000000`, 3 kolom link rekayasa EBT, disclaimer regulasi, dan baris hak cipta resmi dengan logo kecil.

#### 3. Detail File & Task Teknis
- File target: `index.html`, `src/js/components/header.js`, `src/js/components/tabs.js`.
- Kepatuhan Desain:
  - Header dan footer menggunakan kanvas hitam `#000000`.
  - Body menggunakan kanvas putih `#ffffff`.
  - Border pemisah menggunakan hairline 1px `#cccccc` di kanvas terang dan `#5e5e5e` di kanvas gelap.
  - Tanpa soft shadow, tanpa pill-button rounded-full.

#### 4. Kriteria Keberhasilan & Verifikasi
- Tampilan web dibuka di browser lokal menampilkan header, hero section, tab selector, placeholder content, dan footer.
- Responsivitas teruji: di desktop menu tampil horizontal, di layar tablet/mobile menu menciut rapi dengan tombol navigasi sentuh minimal 44px.

#### 5. Prompt AI Coding Agent (Siap Pakai untuk Fase 4)
```text
PROMPT FASE 4:
Anda adalah frontend designer and engineer. Kerjakan Fase 4 untuk Kalkulator Energi Surya Indogreen:
1. Buat struktur utama index.html menggunakan HTML5 semantik dan kelas Tailwind dari DESIGN.md.
2. Implementasikan:
   - Utility Bar (32px, bg-surface-dark, text-caption-sm).
   - Primary Nav (64px, bg-surface-dark, logo INDOGREEN di kiri, navigasi di tengah, tombol CTA hijau di kanan, hamburger drawer untuk mobile).
   - Hero Chapter (bg-surface-dark, badge SIMULATOR INTERAKTIF, headline display-xl, subhead heading-lg, bilah 3 tombol aksi: Reset, Barcode Sales, Layar Penuh).
   - Segmented Pill Tabs untuk 4 mode (Residensial, Komersial, Baterai, PJUTS) dengan gaya 2px radius, hairline border, dan active state solid hitam beraksen hijau.
   - Footer Chapter resmi INDOGREEN (bg-surface-dark, kolom informasi, legal fine-print).
3. Pastikan semua elemen interaktif memenuhi tinggi touch target 44px dan radius tepat 2px (rounded-sm). DILARANG menggunakan rounded-full atau soft shadow.
4. Pastikan tata letak responsif dari layar 320px hingga desktop ultrawide.
```

---

### FASE 5: Form Input Interaktif (Panel Kiri untuk 4 Mode)
**Status:** Selesai (Completed) ✅

#### 1. Tujuan
Membangun seluruh komponen input formulir pada panel sisi kiri (~42% lebar desktop) untuk keempat mode simulasi, lengkap dengan validasi visual, chip preset interaktif, dan kepatuhan desain INDOGREEN.

#### 2. Scope Pekerjaan
- Tata letak kontainer utama 2 kolom responsif:
  - Desktop (`lg:grid-cols-12`): Panel input kiri (5 kolom), Panel hasil kanan (7 kolom).
  - Tablet/Mobile: 1 kolom bertumpuk (Form di atas, Hasil di bawah).
- Container kartu form: Latar kanvas putih `#ffffff`, border hairline 1px `#cccccc`, sudut 2px `rounded-sm`, dan ornamen `corner-square` 12px hijau di sudut kiri atas.
- **Form Mode 1 (Residensial)**:
  - Grid tombol preset daya listrik PLN (900 VA s.d 11.000 VA) dengan active indicator border hijau.
  - Input nominal tagihan listrik bulanan (angka langsung) + Chip preset cepat (Rp 500rb, 1jt, 2jt, 3.5jt, 5jt).
  - Dual manual input persentase pemakaian listrik Siang Hari & Malam Hari (otomatis berimbang 100%, misal Siang 30% maka Malam 70%) disertai visual CAD distribution bar.
  - Radio card pilihan Opsi Baterai Hybrid (Tanpa Baterai / On-Grid, Hybrid 5.12 kWh, Hybrid 10.24 kWh).
  - Dropdown pilihan Wilayah Radiasi Matahari (9 wilayah PSH).
  - Input estimasi luas atap rumah (m²).
- **Form Mode 2 (Bisnis & Industri)**:
  - Dropdown Golongan Tarif PLN (B-2, B-3, I-3, I-4, P-1).
  - Input nominal tagihan bulanan (angka Rp).
  - Radio card Jam Operasional (Kantor 08-17, 1-Shift, 2-Shift, 24-Jam Non-Stop).
  - Radio card Skema Pembiayaan Utama (CAPEX Beli Putus, OPEX PPA Diskon 15%, OPEX Sewa 7 Thn).
  - Dropdown wilayah radiasi & input luas atap bangunan komersial.
- **Form Mode 3 (Baterai Cadangan / BESS)**:
  - Toggle sektor (Rumah Tangga vs Bisnis/Industri).
  - Input beban kritis yang dibackup (kW) dengan slider + input angka presisi.
  - Chip/Slider durasi cadangan darurat (2, 4, 8, 12, 24 jam).
  - Checkbox/Toggle integrasi pengisian Tenaga Surya (Solar PV Charging).
- **Form Mode 4 (PJUTS)**:
  - Input jumlah titik tiang lampu jalan.
  - Dropdown daya lampu LED (20W, 40W, 60W, 80W, 100W, 120W, 150W, 200W).
  - Input durasi nyala malam (default 12 jam).
  - Toggle Smart Dimming otomatis (ON/OFF).
  - Selector hari otonomi cuaca hujan/mendung (1, 2, atau 3 hari).
  - Dropdown wilayah radiasi.

#### 3. Detail File & Task Teknis
- File target:
  - `src/js/components/forms/residentialForm.js`
  - `src/js/components/forms/commercialForm.js`
  - `src/js/components/forms/batteryForm.js`
  - `src/js/components/forms/pjutsForm.js`
- Gaya input:
  - Input field: tinggi 44px, latar `#ffffff`, teks `#000000`, border 1px solid `#cccccc`, padding 12px 16px, radius 2px (`rounded-sm`).
  - State focus: border 2px solid `#00b100` tanpa shadow atau outline bawaan browser.
  - Preset chips & buttons: latar `#f7f7f7`, teks `#000000`, border 1px `#cccccc`, saat aktif border 2px `#00b100` dan teks tebal.

#### 4. Kriteria Keberhasilan & Verifikasi
- Formulir merender dengan rapi di panel kiri dan berganti secara mulus saat tab mode diklik.
- Seluruh kontrol input mudah diakses, label terhubung dengan input (`for`/`id`), touch target minimal 44x44px.

#### 5. Prompt AI Coding Agent (Siap Pakai untuk Fase 5)
```text
PROMPT FASE 5:
Anda adalah UI/UX form specialist. Kerjakan Fase 5 untuk Kalkulator Energi Surya Indogreen:
1. Buat folder src/js/components/forms/ dan implementasikan modul form generator untuk 4 mode:
   - residentialForm.js (Preset daya VA, chip tagihan Rp, radio card aktivitas siang 25/35/50%, radio card baterai hybrid, dropdown wilayah, input luas atap).
   - commercialForm.js (Tarif B2/B3/I3/I4/P1, tagihan bulanan, preset jam kerja, skema pembiayaan, wilayah, luas atap).
   - batteryForm.js (Sektor rumah/bisnis, input beban kritis kW, durasi backup jam, opsi solar charger).
   - pjutsForm.js (Jumlah tiang, watt lampu LED, jam operasional, toggle smart dimming, hari otonomi).
2. Terapkan kontainer form di panel kiri (desktop: 5 kolom dari 12 kolom grid) dengan 1px hairline border #cccccc, 2px radius (rounded-sm), dan corner square 12px hijau di sudut atas.
3. Seluruh elemen input harus 44px height, 2px radius, border hairline, dan focus border 2px solid #00b100.
4. Pastikan form berganti dinamis berdasarkan tab yang dipilih tanpa merusak tata letak.
```

---

### FASE 6: Panel Hasil Kalkulasi & Visualisasi Grafis (Panel Kanan)
**Status:** Selesai (Completed) ✅

#### 1. Tujuan
Membangun panel sisi kanan penampil hasil perhitungan reaktif (~58% lebar desktop), lengkap dengan Hero Card penghematan kanvas hitam CAD, grid metrik KPI, visual breakdown (bar chart tagihan, timeline 25 tahun, tabel komparasi 3 skema), dan kartu konversi WhatsApp/QR.

#### 2. Scope Pekerjaan
- **Hero Card Penghematan Bulanan (`heroCard.js`)**:
  - Kanvas hitam pekat `#000000`, border hairline kuat `#5e5e5e`, sudut 2px `rounded-sm`, dan ornamen `corner-square` 12px hijau.
  - Label eyebrow: `ESTIMASI PENGHEMATAN BULANAN`.
  - Nilai rupiah besar (`type-display-xl`) berwarna hijau `#00b100` (misal: `Rp 480.000 / bln`).
  - Strip spesifikasi ringkas: Kapasitas kWp, Jumlah Modul 600Wp, Baterai LiFePO4 kWh, dan Kebutuhan Luas Atap m².
- **Grid Metrik KPI (`kpiGrid.js`)**:
  - 4 kartu metrik presisi:
    1. Total Investasi Turnkey + PPN 11% (Rp).
    2. Persentase Pemotongan Tagihan Listrik (%).
    3. Titik Impas / Payback Period (Tahun) atau Durasi Cadangan Padam (Jam).
    4. Reduksi Emisi Karbon (kg CO₂ / tahun) & Ekuivalen Pohon Ditanam.
- **Komponen Visualisasi Grafis Dinamis**:
  - `billBar.js`: Batang perbandingan visual horizontal membandingkan tagihan sebelum pasang PLTS (warna abu-abu `#757575`) vs setelah pasang PLTS (warna hijau `#00b100`), mencerminkan dasar rekening minimum PLN.
  - `timeline.js`: Garis waktu horizontal 25 tahun yang menandai break-even point dan akumulasi laba bersih sistem surya.
  - `schemeTable.js`: Tabel komparasi teknis & finansial 3 skema (CAPEX Beli Putus vs OPEX PPA vs OPEX Sewa) khusus mode Bisnis & Industri.
- **Kartu Aksi Konversi & Disclaimer**:
  - Box *"Bawa Pulang Hasil Simulasi"*:
    - Tombol utama `button-primary` hijau: *"Konsultasikan via WhatsApp"* (membuka chat WhatsApp terformat).
    - Tombol sekunder `button-outline`: *"Buka Barcode Sales"* (membuka modal QR).
  - Catatan regulasi: Penjelasan teknis batas rekening minimum Permen ESDM No. 2/2024 dan disclaimer estimasi rekayasa.

#### 3. Detail File & Task Teknis
- File target:
  - `src/js/components/results/heroCard.js`
  - `src/js/components/results/kpiGrid.js`
  - `src/js/components/results/billBar.js`
  - `src/js/components/results/timeline.js`
  - `src/js/components/results/schemeTable.js`
- Gaya visual:
  - Seluruh visualisasi dibangun menggunakan HTML semantik dan Tailwind (div bars persentase) tanpa ketergantungan library grafik eksternal (Chart.js ditiadakan) agar performa sekejap mata dan gaya tetap konsisten dengan CAD flat styling INDOGREEN.

#### 4. Kriteria Keberhasilan & Verifikasi
- Panel kanan merender seluruh data kalkulasi secara rapi dan proporsional.
- Kontras warna teks memenuhi standar WCAG (teks putih di atas hero card hitam, teks hijau kontras tinggi).

#### 5. Prompt AI Coding Agent (Siap Pakai untuk Fase 6)
```text
PROMPT FASE 6:
Anda adalah data visualization and UI engineer. Kerjakan Fase 6 untuk Kalkulator Energi Surya Indogreen:
1. Buat folder src/js/components/results/ dan implementasikan modul visualisasi panel kanan:
   - heroCard.js: Hero card hitam CAD (#000000) dengan border #5e5e5e, 2px radius, corner square hijau, angka penghematan display-xl hijau #00b100, dan strip spesifikasi kWp/modul/baterai/atap.
   - kpiGrid.js: Grid 4 kartu metrik (Investasi Turnkey, % Potongan Tagihan, Payback Period / Backup Hours, Reduksi CO2).
   - billBar.js: Visual perbandingan tagihan sebelum vs sesudah PLTS (bar abu-abu vs bar hijau).
   - timeline.js: Visualisasi horizontal 25 tahun payback timeline dengan marker break-even.
   - schemeTable.js: Tabel flat komparasi 3 skema untuk mode komersial.
2. Tambahkan seksi aksi konversi: tombol utama WhatsApp (button-primary hijau, teks hitam pekat) dan tombol Barcode Sales (button-outline 2px hijau).
3. Tambahkan catatan kepatuhan regulasi Permen ESDM No. 2/2024 (rekening minimum PLN).
4. Gunakan HTML & Tailwind murni tanpa external chart library.
```

---

### FASE 7: State Management Reaktif & Orkestrasi Event (Interaktivitas Real-Time)
**Status:** Selesai (Completed) ✅

#### 1. Tujuan
Menghubungkan formulir input (Fase 5) dengan mesin kalkulasi (Fase 2) dan panel hasil (Fase 6) menggunakan pengontrol state reaktif instan *real-time* di `src/js/app.js`, serta mengaktifkan modal QR Code dan mode Layar Penuh.

#### 2. Scope Pekerjaan
- **Reactive State Controller (`src/js/app.js`)**:
  - Menyimpan state aktif untuk masing-masing tab (default parameters terkalibrasi).
  - Mendaftarkan event listeners (`input`, `change`, `click`) pada seluruh form inputs dan chip presets.
  - Setiap terjadi perubahan input, fungsi reaktif langsung menjalankan kalkulasi dan memperbarui seluruh elemen panel kanan dalam hitungan milidetik tanpa reload/submit.
- **Sinkronisasi Link WhatsApp**:
  - Tombol WhatsApp selalu memperbarui atribut `href`-nya secara dinamis mengikuti data kalkulasi terkini.
- **Modal QR Code (`src/js/components/modalQr.js`)**:
  - Dialog modal popup yang merender SVG QR Code dari payload URL WhatsApp.
  - Dilengkapi tombol tutup (X), backdrop klik-untuk-menutup, dan penutupan dengan tombol keyboard `Escape`.
- **Mode Layar Penuh (Kiosk / Booth Mode)**:
  - Menggunakan native Fullscreen API (`document.documentElement.requestFullscreen()`).
  - Menyesuaikan padding antarmuka untuk presentasi pameran / layar sentuh tablet, dengan tombol terapung untuk keluar dari layar penuh.
- **Tombol Reset Simulasi**:
  - Mengembalikan parameter formulir tab aktif ke nilai default terkalibrasi.

#### 3. Detail File & Task Teknis
- Memastikan performa interaksi 60 FPS tanpa jeda input (*debouncing* ringan 50ms untuk input teks angka).
- Memastikan pergantian tab mempertahankan nilai input pengguna sebelumnya jika pengguna kembali ke tab tersebut.

#### 4. Kriteria Keberhasilan & Verifikasi
- Menggeser slider, mengubah daya PLN, atau mengetik angka tagihan langsung mengubah angka penghematan, bar perbandingan, dan estimasi biaya seketika.
- Menekan tombol "Buka Barcode Sales" memunculkan modal dengan SVG QR Code tajam yang dapat dipindai kamera ponsel.
- Menekan tombol "Layar Penuh" mengaktifkan mode fullscreen browser.

#### 5. Prompt AI Coding Agent (Siap Pakai untuk Fase 7)
```text
PROMPT FASE 7:
Anda adalah senior fullstack JavaScript engineer. Kerjakan Fase 7 untuk Kalkulator Energi Surya Indogreen:
1. Buat src/js/app.js sebagai orkestrator aplikasi utama:
   - Definisikan state reaktif untuk 4 mode kalkulator dengan default parameters yang realistis.
   - Hubungkan input form (Fase 5) dengan mesin kalkulator (Fase 2) dan panel hasil (Fase 6).
   - Pastikan setiap perubahan input langsung memperbarui seluruh tampilan hasil secara instan (real-time) tanpa reload halaman.
2. Implementasikan src/js/components/modalQr.js:
   - Modal popup dialog yang merender SVG QR Code mandiri dari URL WhatsApp simulasi saat tombol Barcode ditekan.
   - Sediakan tombol tutup, backdrop click close, dan keyboard Escape key listener.
3. Hubungkan tombol Reset Simulasi agar mengembalikan form aktif ke state default.
4. Hubungkan tombol Layar Penuh dengan Fullscreen API browser.
5. Pastikan URL WhatsApp selalu ter-update secara otomatis dengan payload hasil simulasi terkini.
```

---

### FASE 8: Accessibility, Responsiveness, Cross-Browser Audit & Final Optimization
**Status:** Selesai (Completed) ✅

#### 1. Tujuan
Melakukan audit menyeluruh terhadap aspek aksesibilitas (WCAG 2.1 AA), responsivitas di 5 breakpoint, optimasi aset, performa loading, dan verifikasi akhir kepatuhan desain INDOGREEN.

#### 2. Scope Pekerjaan
- **Audit Aksesibilitas (WCAG 2.1 AA)**:
  - Memastikan kontras warna teks: teks hitam pekat `#000000` di atas tombol hijau `#00b100` (lolos rasio kontras AA), teks putih `#ffffff` di atas kanvas gelap `#000000`.
  - Memastikan seluruh kontrol interaktif memiliki touch target minimal 44×44px (`h-touch`).
  - Navigasi keyboard: urutan Tab logis, focus outline 2px solid `#00b100` terlihat jelas, ARIA attributes pada tab list (`role="tablist"`, `role="tab"`, `aria-selected`), modal dialog (`role="dialog"`, `aria-modal="true"`), dan form inputs.
- **Audit Responsivitas**:
  - Menguji pada 5 viewport:
    1. Mobile narrow (320px – 375px)
    2. Mobile (480px)
    3. Tablet (768px)
    4. Desktop (1024px – 1280px)
    5. Ultrawide (1440px+)
- **Optimasi Build & Kinerja**:
  - Build produksi CSS Tailwind (`npm run build:css`) dengan minifikasi dan penghapusan kelas tidak terpakai (*purge/content scan*).
  - Memastikan zero external script calls, zero console warning/error.
- **Verifikasi Kepatuhan Desain Akhir**:
  - Memastikan radius konsisten 2px (`rounded-sm`) pada semua komponen.
  - Memastikan tidak ada soft shadow atau gradien dekoratif yang menyimpang dari `DESIGN.md`.

#### 3. Detail File & Task Teknis
- Melakukan verifikasi manual pada browser Chrome, Firefox, dan Safari/WebKit.
- Menuliskan dokumentasi singkat cara menjalankan dan memelihara proyek di `README.md`.

#### 4. Kriteria Keberhasilan & Verifikasi
- Skor audit Lighthouse: Performa > 95, Aksesibilitas 100, Best Practices 100, SEO 100.
- Tidak ada horizontal overflow/scroll pada resolusi mobile terkecil (320px).
- Fitur interaktif (kalkulasi reaktif, modal QR, WhatsApp CTA) berjalan mulus di semua browser modern.

#### 5. Prompt AI Coding Agent (Siap Pakai untuk Fase 8)
```text
PROMPT FASE 8:
Anda adalah QA & performance optimization engineer. Kerjakan Fase 8 untuk Kalkulator Energi Surya Indogreen:
1. Lakukan audit aksesibilitas (WCAG 2.1 AA):
   - Tambahkan atribut ARIA pada tab, input form, modal dialog, dan tombol.
   - Pastikan semua touch target minimal 44x44px.
   - Verifikasi kontras warna (teks pada tombol hijau wajib hitam pekat #000000).
2. Lakukan audit responsivitas pada viewport 320px, 480px, 768px, 1024px, dan 1440px. Pastikan tidak ada horizontal scroll dan layout bertumpuk rapi di mobile.
3. Jalankan build produksi CSS ter-minifikasi (npm run build:css) dan pastikan tidak ada dependensi eksternal yang bocor.
4. Periksa console browser dan bersihkan semua error atau warning.
5. Buat README.md ringkas yang mendokumentasikan arsitektur, cara build, dan panduan penggunaan.
```

---

## 4. Matriks Verifikasi & Kriteria Kesiapan Produksi (Definition of Done)

| Aspek | Standar yang Wajib Dipenuhi |
|---|---|
| **Teknologi** | HTML5 semantik, Tailwind CSS terkompilasi, Vanilla JavaScript ES Modules murni. Tanpa framework berat tambahan. |
| **Geometri UI** | Seluruh tombol, kartu, input, dan tab ber-radius **tepat 2px (`rounded-sm`)**. Dilarang menggunakan tombol lonjong atau kartu ber-radius besar. |
| **Gaya Permukaan** | Flat CAD tanpa soft drop shadow. Garis pemisah hairline 1px solid (`#cccccc` pada kanvas putih, `#5e5e5e` pada kanvas gelap). |
| **Warna Brand** | Hijau primer `#00b100`, teks tombol wajib hitam pekat `#000000`, kanvas hero/footer hitam pekat `#000000`. |
| **Akurasi Matematika** | Memperhitungkan batas Rekening Minimum PLN Permen ESDM No. 2/2024 ($40 \times \text{kVA} \times \text{Tarif}$). Hasil kalkulasi 100% konsisten. |
| **Fitur QR Code** | Menggunakan generator SVG QR murni *zero-dependency* (`qrcode.js`), tajam dan dapat dipindai kamera HP. |
| **Integrasi WhatsApp** | URL WhatsApp terformat rapi merangkum seluruh parameter teknis dan estimasi investasi. |
| **Aksesibilitas** | Memenuhi standar WCAG 2.1 AA dengan touch target $\ge 44\times 44\text{ px}$. |
| **Responsivitas** | Tampilan adaptif sempurna dari ponsel (320px) hingga monitor desktop ultrawide. |

---

## 5. Panduan Penggunaan Implementation Plan untuk User

Ketika Anda siap memulai proses implementasi kode:
1. **Pilih satu fase pada satu waktu**, dimulai dari **Fase 1**.
2. Berikan prompt yang telah disediakan pada sub-bab *Prompt AI Coding Agent* untuk fase tersebut kepada AI coding agent pilihan Anda.
3. Periksa dan verifikasi hasil pengerjaan berdasarkan *Kriteria Keberhasilan & Verifikasi* fase tersebut.
4. Lanjutkan ke fase berikutnya hanya setelah fase sebelumnya selesai dan terverifikasi sempurna.

---

## 6. Pembaruan Arsitektur: Overhaul Kalkulator PLTS Hybrid Off-Grid (Tahap 1 — Sizing Teknis)

> **Status:** Aktif Diimplementasikan | **Mode Arsip:** BESS, PJUTS, dan Modul Residensial/Komersial Lama (tetap tersimpan di repositori & teruji)

1. **Mode Tunggal Terpadu (`hybrid.js`, `hybridForm.js`)**:
   - Menggabungkan kalkulasi **Residential (R-1 s/d R-3)** dan **Bisnis (B-1 s/d B-3)** dalam satu alur 6 langkah **PLTS Hybrid Off-Grid**.
   - Konstanta sizing teknis baru (`HYBRID_TECH_CONFIG`): `PSH 3.8 jam/hari`, `PR 82%`, `Panel 550 Wp`, `DoD 85%`, `Efisiensi Baterai 95%`, `Modul Baterai 5.12 kWh`, serta katalog inverter standar `[3..100 kW]`.
   - Formula sizing:
     - `totalKwhBulan = biayaBulanan / tariff`, `totalKwhHari = totalKwhBulan / 30`
     - `targetKwhHari = totalKwhHari * (persenCover / 100)`
     - `jumlahPanel = Math.ceil((targetKwhHari / (3.8 * 0.82) * 1000) / 550)`
     - `minInverterReq = Math.max(kapasitasPvKwp * 0.85, targetKwhHari / 4.5)` -> di-snap ke `STANDARD_INVERTER_KW`
     - `jumlahModulBattery = kwhMalamHari > 0 ? Math.ceil((kwhMalamHari / (0.85 * 0.95)) / 5.12) : 1`
2. **Penundaan Perhitungan Biaya & Fitur Tambahan**:
   - Perhitungan biaya perangkat & instalasi (`pricing`) serta modul tambahan (Timeline 25 Tahun, Bill Comparison Bar, Rekening Min. PLN) ditunda untuk iterasi lanjutan.
   - Panel hasil aktif menampilkan Hero Card kapasitas sistem, 3 Kartu Sizing Teknis (`Kapasitas PV`, `Kapasitas Inverter`, `Kapasitas Battery`), Rincian Teknis `Profil Energi Pelanggan` (`energyProfile.js`), serta CTA WhatsApp & Barcode QR.
3. **Pengarsipan Modul Sebelumnya**:
   - Tab navigasi 4 mode pada `index.html` dinonaktifkan sementara (diarsipkan dalam komentar HTML), sedangkan berkas `residential.js`, `commercial.js`, `battery.js`, `pjuts.js` beserta form dan test unitnya tetap dipertahankan agar sewaktu-waktu dapat diaktifkan kembali.

---

## 7. Pembaruan Arsitektur: Field ke-7 Pilihan Solar Panel & Kalkulasi Kebutuhan Luas Atap

> **Status:** Selesai Diimplementasikan (Completed) ✅

1. **Penambahan Field ke-7 pada Formulir Hybrid Off-Grid (`hybridForm.js`)**:
   - Menambahkan langkah ke-7 setelah Support PLTS dengan 5 pilihan modul surya Tier-1:
     1. **550 Wp** (Dimensi: 1.2 m × 2.4 m)
     2. **610 Wp** (Dimensi: 1.2 m × 2.4 m)
     3. **615 Wp** (**Default**, Dimensi: 1.2 m × 2.4 m)
     4. **620 Wp** (Dimensi: 1.2 m × 2.4 m)
     5. **720 Wp** (Dimensi: 1.2 m × 2.4 m)
   - Disertai badge `(Def)` pada opsi 615 Wp dan tampilan dimensi $1.2\text{m} \times 2.4\text{m}$ ($2.88\text{ m}^2$) pada masing-masing kartu.
2. **Kalkulasi Teknis Modul & Luas Atap (`hybrid.js`, `constants.js`)**:
   - Menambahkan tabel katalog `HYBRID_SOLAR_PANELS` dan konstanta `ROOF_MARGIN_FACTOR: 1.01` (margin 1%).
   - Rumus Jumlah Panel:
     $$\text{Jumlah Panel} = \left\lceil \frac{\text{Target kWh/hari}}{3.8 \times 0.82} \times \frac{1000}{\text{Wp terpilih}} \right\rceil$$
   - Rumus Kapasitas Terpasang:
     $$\text{Kapasitas PV (kWp)} = \frac{\text{Jumlah Panel} \times \text{Wp terpilih}}{1000}$$
   - Rumus Kebutuhan Luas Atap:
     $$\text{Luas Bersih} = \text{Jumlah Panel} \times (1.2 \times 2.4)$$
     $$\text{Kebutuhan Luas Atap (m²)} = \text{Luas Bersih} \times 1.01$$
3. **Pembaruan Panel Hasil & Jalur Konversi**:
   - **Hero Card (`heroCard.js`)**: Menampilkan estimasi luas atap pada subtext utama serta kartu spesifikasi ke-2 (`2. KEBUTUHAN LUAS ATAP: ± X m²`).
   - **KPI Grid (`kpiGrid.js`)**: Menampilkan luas atap dan dimensi per lembar pada Card 1 (KAPASITAS PV).
   - **Profil Energi (`energyProfile.js`)**: Menambahkan baris `Spesifikasi Modul Surya` dan `Kebutuhan Panel & Luas Atap`.
   - **WhatsApp Hotline (`whatsapp.js`)**: Menyertakan detail tipe modul dan estimasi luas atap secara otomatis pada payload konsultasi sales.
4. **Verifikasi Kualitas & Aksesibilitas**:
   - Seluruh 76 unit test lulus tanpa peringatan.
   - Penghapusan label/badge `DEF` pada kartu pilihan solar panel agar tampilan antarmuka lebih bersih dan profesional.
   - Touch target radio card $\ge 44\text{px}$, ber-radius ketat 2px (`rounded-sm`), flat CAD styling 100% patuh `DESIGN.md`.

---

## 8. Pembaruan Presets Biaya Bulanan & Rekomendasi Baterai Modular Simetris

> **Status:** Selesai Diimplementasikan (Completed) ✅

1. **Penyesuaian Opsi Cepat Biaya Listrik Bulanan (`HYBRID_BILL_CHIPS`)**:
   - Opsi chip preset biaya listrik disederhanakan menjadi 4 nilai:
     - **Rp 1 Jt** (Rp 1.000.000 — **Default Terkalibrasi**)
     - **Rp 1,5 Jt** (Rp 1.500.000)
     - **Rp 2 Jt** (Rp 2.000.000)
     - **Rp 5 Jt** (Rp 5.000.000)
   - Nilai default awal state aplikasi diatur ke **Rp 1.000.000** (`biayaBulanan: 1000000`).

2. **Database Unit Baterai LiFePO4 (`HYBRID_BATTERY_DATABASE`)**:
   - Disediakan 4 pilihan kapasitas unit modul baterai resmi dalam database:
     - **5 kWh** (**Default**, LiFePO4 51.2V 100Ah nominal)
     - **10 kWh** (LiFePO4 51.2V 200Ah nominal)
     - **15 kWh** (LiFePO4 51.2V 300Ah nominal)
     - **20 kWh** (LiFePO4 51.2V 400Ah nominal)
   - Input radio interaktif ditempatkan pada Step 5 (Sistem PLTS & Baterai) di `hybridForm.js` yang secara dinamis menyajikan kombinasi modular simetris yang valid.

3. **Logika Output Rekomendasi Baterai Modular Simetris (`hybrid.js`, `getBatteryConfigurationOptions`)**:
   - Menghitung kapasitas rekomendasi baterai bulat kelipatan 5 kWh:
     $$\text{Kebutuhan Bersih Baterai (kWh)} = \frac{\text{kWh Malam Hari}}{0.85 \times 0.95}$$
     $$\text{Kapasitas Baterai Bank (kWh)} = \max\left(5, \left\lceil \frac{\text{Kebutuhan Bersih Baterai}}{5} \right\rceil \times 5\right)$$
   - Menghasilkan opsi konfigurasi yang habis membagi kapasitas target ($K \pmod{u} == 0$) dari database {5, 10, 15, 20 kWh}:
     - Contoh jika output **20 kWh**:
       - **4 unit @ 5kWh** ($4 \times 5 = 20\text{ kWh}$)
       - **2 unit @ 10kWh** ($2 \times 10 = 20\text{ kWh}$)
       - **1 unit @ 20kWh** ($1 \times 20 = 20\text{ kWh}$)
       *(15 kWh tidak ditampilkan sebagai opsi karena bukan pembagi simetris dari 20 kWh).*
     - Contoh jika output **30 kWh**:
       - **6 unit @ 5kWh**, **3 unit @ 10kWh**, **2 unit @ 15kWh**
     - Contoh jika output **45 kWh**:
       - **9 unit @ 5kWh**, **3 unit @ 15kWh**

4. **Visualisasi Hasil & Integrasi WhatsApp**:
   - **Hero Card & KPI Grid**: Menampilkan total kapasitas baterai beserta unit terpilih dan ringkasan opsi tersedia (misal: `20 kWh (4 Unit @ 5 kWh)` atau `2 Unit @ 10 kWh` atau `1 Unit @ 20 kWh`).
   - **Profil Energi Pelanggan**: Menyertakan detail unit terpilih dan daftar opsi konfigurasi simetris yang tersedia.
   - **WhatsApp Hotline Generator**: Mengirim rincian rekomendasi baterai simetris terpilih beserta opsi alternatif simetrisnya ke tim sales engineering PT. Indogreen.

