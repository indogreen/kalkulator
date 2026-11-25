# Pedoman Agen Pengembangan & Git Workflow (AGENTS.md)
**Proyek:** Website Kalkulator Energi Surya Interaktif PT. Indogreen Technology And Management  
**Repositori:** Standalone Web Application (`src/`, `test/`, `assets/`, `docs/`)  
**Basis Perencanaan:** Master Implementation Plan (`docs/IMPLEMENTATION_PLAN.md`)  
**Sumber Kebenaran Desain:** INDOGREEN Design System (`DESIGN.md`)

File ini adalah **instruksi repository-level** yang mengikat seluruh AI coding assistant (termasuk **Antigravity, Codex, Claude Code, Qoder, OpenClaw, dan Hermes**) yang bekerja di repositori ini. Baca file ini secara menyeluruh sebelum mengerjakan task apapun.

---

## 1. Blok Konteks Global Proyek

PT. Indogreen Technology And Management adalah perusahaan rekayasa dan pengembang Energi Baru dan Terbarukan (EBT) terkemuka di Indonesia. Proyek ini adalah pembangunan aplikasi web mandiri **Kalkulator Energi Surya Interaktif** yang presisi, instan, dan siap pakai baik untuk pengguna publik maupun tim penjualan teknis (sales engineer / booth kiosk).

### 4 Mode Utama Simulasi:
1. **PLTS Atap Residensial:** Optimasi swakonsumsi (*self-consumption*), proteksi legal rekening minimum PLN, rekomendasi kapasitas modul Tier-1 600 Wp, opsi baterai hybrid LiFePO4 (5.12 kWh / 10.24 kWh), proyeksi 25 tahun, payback period, dan reduksi emisi karbon.
2. **PLTS Bisnis & Industri:** Analisis kurva beban operasional (Kantor 08–17, 1-Shift, 2-Shift, 24-Jam) vs radiasi matahari, komparasi 3 skema finansial (CAPEX Beli Putus, OPEX PPA Diskon 15%, dan OPEX Sewa 7 Tahun).
3. **BESS / Baterai Cadangan Anti-Padam:** Sizing kapasitas baterai LiFePO4 (90% DoD, 95% efisiensi inverter) berdasarkan beban kritis kW dan durasi backup, sizing inverter darurat (safety margin 1.25x), serta opsi solar charger.
4. **Penerangan Jalan Umum Tenaga Surya (PJUTS):** Perhitungan daya lampu LED (20W–200W), fitur Smart Dimming otomatis (hemat 30% baterai & panel), durasi otonomi cuaca mendung/hujan (1–3 hari), dan penghematan biaya listrik setara Tarif P-3 PLN.

### Batasan Arsitektur & Teknologi:
- **Teknologi Utama:**
  - **HTML5:** Struktur semantik, aksesibel (WCAG 2.1 AA), dan ramah SEO.
  - **Tailwind CSS:** Sistem styling utilitas terkalibrasi 100% dengan token resmi INDOGREEN via Tailwind CLI.
  - **Modern Vanilla JavaScript (ES Modules):** Mesin kalkulasi murni dan manajemen state reaktif instan *zero external runtime dependency*.
- **Kebijakan Zero-Dependency Runtime:**
  - Dilarang menginstal atau mengimpor framework runtime berat (React, Vue, Svelte, Angular).
  - Dilarang menginstal library grafik eksternal (Chart.js, D3, dll.). Seluruh visualisasi batang (bill bar), grid metrik, dan timeline dibangun dengan HTML/CSS murni.
  - Generator Barcode QR diimplementasikan mandiri berbasis SVG murni dalam Vanilla JS (`src/js/utils/qrcode.js`) tanpa library npm pihak ketiga.
- **Kepatuhan Regulasi Kelistrikan Indonesia:**
  - **Permen ESDM No. 2/2024:** Aturan legal mutlak **Rekening Minimum PLN** ($40 \times \text{kVA} \times \text{Tarif per kWh}$). Tagihan setelah PLTS **tidak boleh lebih rendah** dari batas rekening minimum ini.
  - **Jam Matahari Puncak (PSH) 9 Wilayah:** DKI/Jabar/Banten (4.4), Jateng/DIY (4.6), Jatim (4.8), Sumatera (4.3), Kalimantan (4.4), Sulawesi (4.9), Bali/NTB (5.1), NTT (5.4), Maluku/Papua (4.7).
  - **Tabel Tarif PLN 2026:** R-1 900 (Rp 1.352), R-1 1300/2200 (Rp 1.444,70), R-2/R-3 (Rp 1.699,53), B-2 (Rp 1.444,70), B-3 (Rp 1.114,74), I-3 (Rp 1.114,74), I-4 (Rp 996,74), P-1 (Rp 1.699,53), P-3 (Rp 1.699,53).
- **Bahasa & Konten:**
  - Teks antarmuka (UI) berbahasa Indonesia yang baik, formal, dan profesional.
  - Kode program, penamaan berkas, git commit, dan identifier berbahasa Inggris.
  - Dilarang mengarang angka bisnis tanpa dasar teknis. Gunakan nilai terkalibrasi dari `docs/IMPLEMENTATION_PLAN.md` atau penanda `TODO-CONTENT`.

---

## 2. Sumber Kebenaran (Source of Truth Hierarchy)

Sebelum melakukan perubahan, pahami hierarki kepercayaan berikut:
1. **Source Code Aktual:** Kebenaran utama untuk implementasi yang sedang berjalan di repositori.
2. **`DESIGN.md`:** Kebenaran mutlak (*frozen specification*) untuk semua keputusan visual, token warna, tipografi Inter, dan geometri antarmuka.
3. **`docs/IMPLEMENTATION_PLAN.md`:** Kebenaran mutlak untuk formula matematika, spesifikasi modul, arsitektur data, dan urutan fase pengerjaan (Fase 1 s.d. 8).
4. **Dokumentasi Pendukung:**
   - `test/`: Uji numerik formula dan utilitas sebagai verifikasi perilaku matematis.

> **Aturan Diskrepansi:** Jika kode dan rencana berbeda, verifikasi dengan formula matematis di `docs/IMPLEMENTATION_PLAN.md`. Jika dokumentasi perlu disesuaikan, perbarui dokumentasi dalam task yang sama.

---

## 3. Struktur Direktori Proyek

Seluruh pekerjaan wajib mengikuti struktur modular berikut:

```text
kalkulator/
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
├── assets/
│   ├── images/
│   │   └── indogreen.png            # Logo resmi PT. Indogreen Technology And Management
│   └── icons/                       # SVG icon symbols (Lucide/FA6 clean SVGs)
├── docs/
│   └── IMPLEMENTATION_PLAN.md       # Master Implementation Plan (8 Fase lengkap)
├── .agents/
│   └── skills/                      # Pustaka skill lokal
├── .github/
│   └── workflows/
│       └── ci.yml                   # CI Quality Gate (Docs, Build, Test)
├── .gitignore                       # File pengecualian git
├── AGENTS.md                        # Pedoman operasi utama seluruh AI agent
├── CLAUDE.md                        # Pointer ke AGENTS.md
└── DESIGN.md                        # Sumber kebenaran sistem desain resmi
```

---

## 4. Alur Kerja Wajib & Git Workflow

### 4.1 Strategi Percabangan Git (Branching Strategy)
Proyek ini mengadopsi pola **GitHub Flow** yang disederhanakan untuk eksekusi berbasis fase:
- **`main`**: Cabang utama yang dilindungi (*protected*), selalu dalam kondisi stabil, dapat di-build, dan siap dideploy.
- **`phase/<nomor>-<deskripsi>`**: Cabang kerja untuk pengerjaan fase implementasi (contoh: `phase/1-tooling-tailwind`, `phase/2-core-calculator`).
- **`fix/<deskripsi>`**: Cabang perbaikan bug untuk menangani regresi numerik atau layout.

```text
main (stabil & deployable)
  │
  ├── [First Commit: foundation & blueprint]
  │
  ├── phase/1-tooling-tailwind   → PR / Merge ke main
  ├── phase/2-core-calculator    → PR / Merge ke main
  └── phase/3-utils-qr-wa        → PR / Merge ke main
```

### 4.2 Prosedur First Commit (Komit Perdana)
Ketika repositori baru diinisialisasi atau sebelum pengerjaan kode Fase 1 dimulai:
1. Pastikan file fondasi telah lengkap di workspace:
   - `AGENTS.md` (Pedoman agen & workflow ini)
   - `DESIGN.md` (Spesifikasi design system resmi)
   - `docs/IMPLEMENTATION_PLAN.md` (Master blueprint implementasi)
   - `CLAUDE.md` (Pointer agen)
   - `.gitignore` (Konfigurasi filter berkas)
   - `.agents/skills/` (Pustaka skill lokal)
   - `.github/workflows/ci.yml` (Pipeline CI quality gate)
2. Jalankan `git status` untuk memastikan tidak ada berkas OS sampah (seperti `.DS_Store`) atau file rahasia yang ter-stage.
3. Format commit message untuk **First Commit** wajib mematuhi standar Conventional Commits:

```text
chore(foundation): initial commit for indogreen solar energy calculator

Initialize repository structure, INDOGREEN design system tokens (DESIGN.md),
master implementation plan (docs/IMPLEMENTATION_PLAN.md), agent guidelines
(AGENTS.md), local skill libraries, and CI quality gates.
```

### 4.3 Disiplin Git Staging & Kebersihan File (File Hygiene)
- **File yang WAJIB Di-ignore:**
  - `node_modules/` (dependensi dev)
  - `dist/` (hasil kompilasi CSS produksi)
  - `.DS_Store`, `Thumbs.db` (file metadata OS)
  - `.env`, `.env.local` (konfigurasi lingkungan rahasia)
- **Aturan Verifikasi Staging:** Selalu jalankan `git status` dan `git diff --staged` sebelum melakukan commit untuk memastikan hanya file relevan yang masuk ke changeset.

### 4.4 Alur Pengerjaan Fase (Fase 1 s.d. 8)
1. **Pilih satu fase pada satu waktu** sesuai urutan di `docs/IMPLEMENTATION_PLAN.md`.
2. Buat branch baru dari `main` (misal: `git checkout -b phase/1-tooling-tailwind`).
3. Terapkan instruksi teknis dan prompt fase tersebut.
4. Lakukan verifikasi menyeluruh terhadap kriteria keberhasilan fase.
5. Jalankan build dan test.
6. Buat commit menggunakan Conventional Commit format yang sesuai.
7. Merge ke `main` setelah terverifikasi.

### 4.5 Verifikasi Sebelum Memberikan Tanggapan Akhir
1. Jalankan build CSS: `npm run build:css` (jika tooling Tailwind sudah aktif).
2. Jalankan test suite: `node test/calculator.test.js` atau `node test/utils.test.js` jika relevan.
3. Pastikan tidak ada syntax error, broken import, atau missing asset.
4. Siapkan **Suggested Conventional Commit Message** dalam Bahasa Inggris.

---

## 5. Standar Penulisan Kode (Coding Standards)

### 5.1 HTML5 & Tailwind CSS
- **Semantic HTML:** Gunakan tag semantik (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`, `<dialog>`).
- **Aksesibilitas (WCAG 2.1 AA):**
  - Sertakan atribut ARIA yang tepat (`role="tablist"`, `role="tab"`, `aria-selected="true"`, `aria-controls="panel-id"`, `role="dialog"`, `aria-modal="true"`).
  - Seluruh tombol dan input wajib memiliki label yang jelas (`aria-label` jika ikon murni).
  - Focus indicator: 2px solid `#00b100` dengan offset 2px, hapus outline biru bawaan browser.
- **Geometri Sudut Ketat:** Seluruh elemen interaktif dan kontainer menggunakan **radius 2px (`rounded-sm`)**. Dilarang memakai `rounded-full` atau `rounded-xl` pada tombol/kartu (kecuali icon/avatar lingkaran).
- **Estetika Flat CAD:** Pemisah visual mengandalkan garis hairline 1px solid (`#cccccc` pada canvas putih, `#5e5e5e` pada kanvas gelap). **Dilarang menambahkan soft drop shadow kabur atau gradien dekoratif.**

### 5.2 Modern Vanilla JavaScript (ES Modules)
- **Modularitas ES Modules:** Pisahkan fungsi per modul menggunakan `export` dan `import`.
- **Pure Calculation Engine (`src/js/calculator/`):**
  - Menerima object parameter input dan mengembalikan object hasil kalkulasi terstruktur.
  - Wajib memiliki proteksi pembagian nol (*divide-by-zero protection*).
  - Wajib menerapkan proteksi batas legal Rekening Minimum PLN Permen ESDM No. 2/2024.
  - Deterministic dan mudah diuji secara otomatis via unit test.
- **Zero-Dependency Utilities (`src/js/utils/`):**
  - Generator QR Code SVG murni (`qrcode.js`): Mengembalikan elemen atau string SVG terukur dan tajam tanpa dependensi npm pihak ketiga.
  - Generator URL WhatsApp (`whatsapp.js`): Menyusun ringkasan kalkulasi teknis dan estimasi investasi ke nomor WhatsApp sales resmi PT. Indogreen (+62 817-0092-221 / 08170092221).
  - Formatter (`formatter.js`): Memformat mata uang IDR (`Rp 1.450.000`), desimal kWp (`3.60 kWp`), unit modul, dan angka persentase.
- **State Management Reaktif (`src/js/app.js`):**
  - Memperbarui hasil kalkulasi dan tampilan secara real-time pada event input (`input`, `change`, `click`).
  - Terapkan debouncing ringan (50ms) untuk input teks angka.
  - Sinkronkan link WhatsApp dan data modal QR secara instan setiap parameter berubah.

---

## 6. Kontrak Desain Antarmuka (Design Contract & UI Checklist)

**WAJIB dipatuhi sebelum menyentuh berkas UI apapun.**  
Sistem desain mengacu mutlak pada `DESIGN.md`:

### 6.1 Token Kunci Desain:
- **Warna Brand:** INDOGREEN Green (`#00b100`) untuk CTA utama, active tab/state, dan motif corner square. Teks di atas warna ini **wajib warna hitam pekat (`#000000`)** demi kontras tinggi WCAG AA.
- **Aksen Sekunder:** Accent Yellow (`#ffff00`) hanya sebagai highlight teks/eyebrow pada kanvas gelap (`surface-dark`). Dilarang digunakan sebagai background tombol CTA.
- **Kanvas Permukaan:**
  - Kanvas Hitam (`#000000`): Top utility bar, primary navigation, hero chapter, hero result card, dan footer.
  - Kanvas Putih (`#ffffff`): Badan utama halaman dan kartu form input.
- **Geometri Sudut (Border Radius):** **Wajib `rounded-sm` (2px)** untuk seluruh tombol, kartu, input, dan badge. **Dilarang memakai `rounded-full` (pill) atau `rounded-xl`** pada tombol/kartu.
- **Tipografi:** Font **Inter** (Regular 400 dan Bold 700). Hirarki utility classes:
  - `.type-display-xl` (48px, bold, lh 1.25)
  - `.type-display-lg` (36px, bold, lh 1.25)
  - `.type-heading-xl` (24px, bold, lh 1.25)
  - `.type-heading-md` (18px, bold, lh 1.25)
  - `.type-body-md` (16px, regular, lh 1.5)
  - `.type-caption-md` (14px, bold, uppercase, tracking +0.05em)
  - `.type-caption-sm` (12px, regular, lh 1.5)
- **Elevasi & Shadow:** **FLAT.** Dilarang menambahkan soft drop shadow. Garis batas hairline 1px solid (`#cccccc` pada canvas putih, `#5e5e5e` pada kanvas gelap).
- **Motif Khas:** Sematkan `{component.corner-square}` (kotak solid hijau 12 × 12 px) di salah satu sudut kartu utama (form card dan hero result card).

### 6.2 Checklist Sebelum Submit Perubahan UI:
- [ ] Tombol CTA utama menggunakan hijau `#00b100`, teks hitam pekat (`#000000`), dan radius 2px (`rounded-sm`).
- [ ] Tidak ada drop shadow berlebih pada kartu (default: flat dengan border hairline 1px).
- [ ] Menggunakan font Inter tanpa font pengganti yang tidak sah.
- [ ] Seluruh warna menggunakan token Tailwind yang valid dari `DESIGN.md`.
- [ ] Indikator fokus aksesibilitas 2px outline offset `#00b100` berfungsi pada navigasi keyboard.
- [ ] Responsif teruji dari layar mobile 320px hingga desktop ultrawide 1440px+.
- [ ] Seluruh target ketuk (*touch targets*) berukuran minimal 44 × 44 piksel.
- [ ] Teks antarmuka sepenuhnya berbahasa Indonesia yang baik dan profesional.

---

## 7. Kontrak Pembaruan Dokumentasi (Documentation Contract)

Setiap task wajib mematuhi dokumentasi gate ini:

| Area Perubahan | Dokumen yang Wajib Dicek & Diperbarui |
|---|---|
| Penyesuaian rumus, konstanta, atau penambahan skenario | `docs/IMPLEMENTATION_PLAN.md` & `test/calculator.test.js` |
| Panduan instalasi, build script, dan petunjuk operasional | `README.md` |
| Token desain baru atau deviasi visual yang disetujui | `DESIGN.md` |
| Penyelesaian fase pekerjaan (Fase 1 s.d. 8) | Tandai checklist / status di `docs/IMPLEMENTATION_PLAN.md` |

---

## 8. Batasan Wewenang Agen (Scope Guard)

Tabel berikut membatasi apa yang boleh dikerjakan agen secara mandiri versus tindakan yang membutuhkan persetujuan manusia:

| Tindakan Operasional | Status Wewenang |
|---|---|
| Membaca, menganalisis, dan mencari file di workspace | ✅ **Mandiri** |
| Menulis/mengubah kode HTML5, CSS Tailwind, dan Vanilla JavaScript | ✅ **Mandiri** |
| Membuat dan menjalankan unit test (`test/calculator.test.js`, dll.) | ✅ **Mandiri** |
| Mengonfigurasi skrip build Tailwind (`package.json`, `tailwind.config.js`) | ✅ **Mandiri** |
| Menandai status progres fase di `docs/IMPLEMENTATION_PLAN.md` | ✅ **Mandiri** |
| Menambah dependensi runtime eksternal di bundle produksi | ❌ **Butuh Konfirmasi Eksplisit** (kebijakan zero-dependency) |
| Menghapus file struktural atau membatalkan fase yang telah selesai | ❌ **Butuh Konfirmasi Eksplisit** |
| Mengubah rumus legal rekening minimum PLN tanpa regulasi resmi | 🛑 **Dilarang Keras** |
| Mengubah warna brand atau token resmi di `DESIGN.md` | 🛑 **Dilarang Keras** |
| Menambahkan library UI berat (React, Vue, Svelte, Bootstrap) | 🛑 **Dilarang Keras** |
| Membuat commit Git otomatis tanpa instruksi user | 🛑 **Dilarang Keras** |

---

## 9. Standar Pesan Commit (Commit Message Contract)

Setiap akhir pekerjaan wajib menyertakan usulan pesan commit (**Suggested Conventional Commit**) dalam **Bahasa Inggris** dengan format:

```text
<type>(<scope>): <short imperative description in English>

<Explain the technical change in concrete terms>
<Mention files changed, formulas implemented, or docs updated when relevant>
```

### Tipe yang Diizinkan:
- `feat`: Penambahan fitur kalkulator, modul komponen, atau visualisasi baru.
- `fix`: Perbaikan bug numerik, formula, layout, atau glitch UI.
- `docs`: Pembaruan dokumentasi atau panduan agen.
- `refactor`: Restrukturisasi kode tanpa mengubah output matematika atau tampilan.
- `test`: Penambahan atau pembaruan unit test formula / utilitas.
- `chore`: Konfigurasi tooling build, first commit, gitignore, tailwind config, atau npm scripts.
- `perf`: Optimasi performa render atau eksekusi kalkulasi.

### Scope yang Diizinkan:
`foundation`, `setup`, `calculator`, `forms`, `results`, `components`, `utils`, `ui`, `test`, `design`, `docs`, `ci`.

### Contoh Standar Commit:

#### 1. First Commit (Inisialisasi Proyek):
```text
chore(foundation): initial commit for indogreen solar energy calculator

Initialize repository structure, INDOGREEN design system tokens (DESIGN.md),
master implementation plan (docs/IMPLEMENTATION_PLAN.md), agent guidelines
(AGENTS.md), local skill libraries, and CI quality gates.
```

#### 2. Commit Fase 1 (Setup Tooling):
```text
chore(setup): configure tailwind css tooling and design tokens

Initialize package.json with Tailwind CSS CLI and PostCSS.
Configure tailwind.config.js with INDOGREEN 2px radius, colors, and Inter typography.
Add base style.css and verification build script.
```

#### 3. Commit Fase 2 (Core Calculator Engine):
```text
feat(calculator): implement residential solar calculation engine

Add residential calculation module with self-consumption optimization,
PLN minimum billing protection (Permen ESDM 2/2024), and LiFePO4 battery options.
Include unit tests in test/calculator.test.js.
```

---

## 10. Struktur Laporan Akhir Tugas (Final Response Contract)

Setiap penyelesaian tugas **harus ditutup** dengan struktur pelaporan terstandarisasi berikut:

```markdown
## Summary
[Ringkasan teknis apa yang dikerjakan, fase berapa yang diselesaikan, dan dampaknya]

## Files Changed
- path/to/file — [deskripsi singkat perubahan]

## Validation
- [Hasil eksekusi build Tailwind, unit test Node.js, atau audit tampilan]

## Documentation Updated
- docs/xxx.md — [apa yang diperbarui dan status fase]
- atau: "Tidak ada dokumentasi yang perlu diperbarui karena [alasan teknis]."

## Suggested Commit
```text
type(scope): summary in English

Detailed technical body...
```

## Next Implementation Steps
- [Langkah fase berikutnya dari docs/IMPLEMENTATION_PLAN.md yang siap dieksekusi]
```

---

## 11. Integrasi Pustaka Skill Agen (`.agents/skills/`)

Repositori ini memuat pustaka skill agenik lokal pada direktori `.agents/skills/`. Agen yang bekerja pada task terkait disarankan membaca panduan skill berikut:
- **`git-workflow`**: Panduan pengelolaan branch, commit conventions, dan kolaborasi Git yang bersih.
- **`modern-web-guidance`**: Panduan praktik terbaik HTML5 semantik, CSS modern, dan JavaScript clientside.
- **`conventional-commit-review`**: Standardisasi format pesan commit Git.
- **`karpathy-guidelines`**: Panduan membuat perubahan kode secara presisi (*surgical changes*) tanpa overkomplikasi.

*(Catatan: Skill backend/Laravel yang ada di repositori lama tidak berlaku pada proyek kalkulator web statis mandiri ini).*

---

_Dokumen ini adalah pedoman hidup (living document). Perbarui jika terdapat perubahan arsitektur atau keputusan teknis yang disepakati bersama user._
