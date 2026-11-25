/**
 * PT. Indogreen Technology And Management
 * Utilities: Number, Currency, and Technical Unit Formatters
 * 
 * Uses Indonesian locale standard:
 * - Currency: Rp 1.500.000 (titik sebagai pemisah ribuan)
 * - Decimals: Koma sebagai pemisah desimal (misal: 2,40 kWp)
 */

/**
 * Format angka ke format mata uang Rupiah Indonesia (IDR)
 * @param {number|string} value - Nilai angka
 * @param {boolean} [withPrefix=true] - Menyertakan prefix "Rp "
 * @returns {string} String Rupiah terformat (misal: "Rp 1.500.000")
 */
export function formatRupiah(value, withPrefix = true) {
  const num = Math.round(Number(value) || 0);
  const formatted = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0
  }).format(num);

  return withPrefix ? `Rp ${formatted}` : formatted;
}

/**
 * Format angka umum dengan kontrol jumlah desimal (locale id-ID)
 * @param {number|string} value - Nilai angka
 * @param {number} [decimals=0] - Jumlah digit desimal
 * @returns {string} Angka terformat (misal: "1.038,25")
 */
export function formatNumber(value, decimals = 0) {
  const num = Number(value) || 0;
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
}

/**
 * Format kapasitas daya surya dalam satuan kWp
 * @param {number|string} value - Nilai kWp
 * @param {number} [decimals=2] - Digit desimal (default: 2)
 * @returns {string} String terformat (misal: "2.40 kWp" atau "2,40 kWp" dengan suffix)
 */
export function formatKwp(value, decimals = 2) {
  const num = Number(value) || 0;
  return `${num.toFixed(decimals)} kWp`;
}

/**
 * Format energi listrik dalam satuan kWh
 * @param {number|string} value - Nilai kWh
 * @param {number} [decimals=1] - Digit desimal
 * @returns {string} String terformat (misal: "253.4 kWh")
 */
export function formatKwh(value, decimals = 1) {
  const num = Number(value) || 0;
  return `${formatNumber(num, decimals)} kWh`;
}

/**
 * Format nilai persentase dengan suffix "%"
 * @param {number|string} value - Nilai persentase (0-100)
 * @param {number} [decimals=1] - Digit desimal
 * @returns {string} String terformat (misal: "32.0%")
 */
export function formatPercent(value, decimals = 1) {
  const num = Number(value) || 0;
  return `${num.toFixed(decimals)}%`;
}

/**
 * Parsing string berformat Rupiah/angka kembali ke angka murni (number)
 * @param {string} str - String angka (misal: "Rp 1.500.000")
 * @returns {number} Angka murni integer
 */
export function parseRupiah(str) {
  if (typeof str !== 'string') return Math.round(Number(str) || 0);
  const cleaned = str.replace(/[^\d-]/g, '');
  return parseInt(cleaned, 10) || 0;
}
