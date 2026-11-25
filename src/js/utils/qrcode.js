/**
 * PT. Indogreen Technology And Management
 * Standalone Zero-Dependency SVG QR Code Generator (ES Modules)
 * 
 * Implements ISO/IEC 18004 QR Code Specification:
 * - Dynamic version selection (Version 1 to 40)
 * - Error correction levels (L, M, Q, H)
 * - Reed-Solomon Error Correction Code via GF(256)
 * - 8 Masking patterns with automatic penalty scoring
 * - Crisp, scalable SVG output with path combining for kiosk / high-DPI displays
 */

// Error Correction Level Definitions
export const EC_LEVEL = Object.freeze({
  L: { id: 1, name: 'L', bits: 0b01, recoveryPercent: 7 },
  M: { id: 0, name: 'M', bits: 0b00, recoveryPercent: 15 },
  Q: { id: 3, name: 'Q', bits: 0b11, recoveryPercent: 25 },
  H: { id: 2, name: 'H', bits: 0b10, recoveryPercent: 30 }
});

// Galois Field GF(256) Tables for Reed-Solomon Code
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(function initGaloisField() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d; // Primitive polynomial x^8 + x^4 + x^3 + x^2 + 1
  }
  for (let i = 255; i < 512; i++) {
    GF_EXP[i] = GF_EXP[i - 255];
  }
})();

function gfMul(x, y) {
  if (x === 0 || y === 0) return 0;
  return GF_EXP[GF_LOG[x] + GF_LOG[y]];
}

function getRsGeneratorPoly(errorCount) {
  let poly = [1];
  for (let i = 0; i < errorCount; i++) {
    const next = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= gfMul(poly[j], GF_EXP[i]);
      next[j + 1] ^= poly[j];
    }
    poly = next;
  }
  return poly;
}

function computeReedSolomon(data, errorCount) {
  const gen = getRsGeneratorPoly(errorCount);
  const res = new Uint8Array(errorCount);
  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ res[0];
    for (let j = 0; j < errorCount - 1; j++) {
      res[j] = res[j + 1] ^ gfMul(gen[j + 1], factor);
    }
    res[errorCount - 1] = gfMul(gen[errorCount], factor);
  }
  return res;
}

// Alignment Pattern Center Positions per Version
const ALIGNMENT_PATTERNS = [
  [], // Ver 0
  [], // Ver 1
  [6, 18],
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
  [6, 24, 42],
  [6, 26, 46],
  [6, 28, 50],
  [6, 30, 54],
  [6, 32, 58],
  [6, 34, 62],
  [6, 26, 46, 66],
  [6, 26, 48, 70],
  [6, 26, 50, 74],
  [6, 30, 54, 78],
  [6, 30, 56, 82],
  [6, 30, 58, 86],
  [6, 34, 62, 90],
  [6, 28, 50, 72, 94],
  [6, 26, 50, 74, 98],
  [6, 30, 54, 78, 102],
  [6, 28, 54, 80, 106],
  [6, 32, 58, 84, 110],
  [6, 30, 58, 86, 114],
  [6, 34, 62, 90, 118],
  [6, 26, 50, 74, 98, 122],
  [6, 30, 54, 78, 102, 126],
  [6, 26, 52, 78, 104, 130],
  [6, 30, 56, 82, 108, 134],
  [6, 34, 60, 86, 112, 138],
  [6, 30, 58, 86, 114, 142],
  [6, 34, 62, 90, 118, 146],
  [6, 30, 54, 78, 102, 126, 150],
  [6, 24, 50, 76, 102, 128, 154],
  [6, 28, 54, 80, 106, 132, 158],
  [6, 32, 58, 84, 110, 136, 162],
  [6, 26, 54, 82, 110, 138, 166],
  [6, 30, 58, 86, 114, 142, 170]
];

// QR Code Specifications Table: [Total Codewords, EC Level Blocks & Codewords]
// Format per level: [ecCodewordsPerBlock, numBlocksGroup1, dataCodewordsGroup1, numBlocksGroup2, dataCodewordsGroup2]
const QR_TABLE = [
  null,
  // Ver 1 (21x21, 26 total)
  { total: 26, L: [7, 1, 19, 0, 0], M: [10, 1, 16, 0, 0], Q: [13, 1, 13, 0, 0], H: [17, 1, 9, 0, 0] },
  // Ver 2 (25x25, 44 total)
  { total: 44, L: [10, 1, 34, 0, 0], M: [16, 1, 28, 0, 0], Q: [22, 1, 22, 0, 0], H: [28, 1, 16, 0, 0] },
  // Ver 3 (29x29, 70 total)
  { total: 70, L: [15, 1, 55, 0, 0], M: [26, 1, 44, 0, 0], Q: [18, 2, 17, 0, 0], H: [22, 2, 13, 0, 0] },
  // Ver 4 (33x33, 100 total)
  { total: 100, L: [20, 1, 80, 0, 0], M: [18, 2, 32, 0, 0], Q: [26, 2, 24, 0, 0], H: [16, 4, 9, 0, 0] },
  // Ver 5 (37x37, 134 total)
  { total: 134, L: [26, 1, 108, 0, 0], M: [24, 2, 43, 0, 0], Q: [18, 2, 15, 2, 16], H: [22, 2, 11, 2, 12] },
  // Ver 6 (41x41, 172 total)
  { total: 172, L: [18, 2, 68, 0, 0], M: [16, 4, 27, 0, 0], Q: [24, 4, 19, 0, 0], H: [28, 4, 15, 0, 0] },
  // Ver 7 (45x45, 196 total)
  { total: 196, L: [20, 2, 78, 0, 0], M: [18, 4, 31, 0, 0], Q: [18, 2, 14, 4, 15], H: [26, 4, 13, 1, 14] },
  // Ver 8 (49x49, 242 total)
  { total: 242, L: [24, 2, 97, 0, 0], M: [22, 2, 38, 2, 39], Q: [22, 4, 18, 2, 19], H: [26, 4, 14, 2, 15] },
  // Ver 9 (53x53, 292 total)
  { total: 292, L: [30, 2, 116, 0, 0], M: [22, 3, 36, 2, 37], Q: [20, 4, 16, 4, 17], H: [24, 4, 12, 4, 13] },
  // Ver 10 (57x57, 346 total)
  { total: 346, L: [18, 2, 68, 2, 69], M: [26, 4, 43, 1, 44], Q: [24, 6, 19, 2, 20], H: [28, 6, 15, 2, 16] },
  // Ver 11 (61x61, 404 total)
  { total: 404, L: [20, 4, 81, 0, 0], M: [30, 1, 50, 4, 51], Q: [28, 4, 22, 4, 23], H: [24, 3, 12, 8, 13] },
  // Ver 12 (65x65, 466 total)
  { total: 466, L: [24, 2, 92, 2, 93], M: [22, 6, 36, 2, 37], Q: [26, 4, 20, 6, 21], H: [28, 7, 14, 4, 15] },
  // Ver 13 (69x69, 532 total)
  { total: 532, L: [26, 4, 107, 0, 0], M: [22, 8, 37, 1, 38], Q: [24, 8, 20, 4, 21], H: [22, 12, 11, 4, 12] },
  // Ver 14 (73x73, 581 total)
  { total: 581, L: [30, 3, 115, 1, 116], M: [24, 4, 40, 5, 41], Q: [20, 11, 16, 5, 17], H: [24, 11, 12, 5, 13] },
  // Ver 15 (77x77, 655 total)
  { total: 655, L: [22, 5, 87, 1, 88], M: [24, 5, 41, 5, 42], Q: [30, 5, 24, 7, 25], H: [24, 11, 12, 7, 13] },
  // Ver 16 (81x81, 733 total)
  { total: 733, L: [24, 5, 98, 1, 99], M: [28, 7, 45, 3, 46], Q: [24, 15, 19, 2, 20], H: [30, 3, 15, 13, 16] },
  // Ver 17 (85x85, 815 total)
  { total: 815, L: [28, 1, 107, 5, 108], M: [28, 10, 46, 1, 47], Q: [28, 1, 22, 15, 23], H: [28, 2, 14, 17, 15] },
  // Ver 18 (89x89, 901 total)
  { total: 901, L: [30, 5, 120, 1, 121], M: [26, 9, 43, 4, 44], Q: [28, 17, 22, 1, 23], H: [28, 2, 14, 19, 15] },
  // Ver 19 (93x93, 991 total)
  { total: 991, L: [28, 3, 113, 4, 114], M: [26, 3, 44, 11, 45], Q: [26, 17, 21, 4, 22], H: [26, 9, 13, 16, 14] },
  // Ver 20 (97x97, 1085 total)
  { total: 1085, L: [28, 3, 107, 5, 108], M: [26, 3, 41, 13, 42], Q: [30, 15, 24, 5, 25], H: [28, 15, 15, 10, 16] },
  // Ver 21 (101x101, 1156 total)
  { total: 1156, L: [28, 4, 116, 4, 117], M: [26, 17, 42, 0, 0], Q: [28, 17, 22, 6, 23], H: [30, 19, 16, 6, 17] },
  // Ver 22 (105x105, 1258 total)
  { total: 1258, L: [28, 2, 111, 7, 112], M: [28, 17, 46, 0, 0], Q: [30, 7, 24, 16, 25], H: [24, 34, 13, 0, 0] },
  // Ver 23 (109x109, 1364 total)
  { total: 1364, L: [30, 4, 121, 5, 122], M: [28, 4, 47, 14, 48], Q: [30, 11, 24, 14, 25], H: [30, 16, 15, 14, 16] },
  // Ver 24 (113x113, 1474 total)
  { total: 1474, L: [30, 6, 117, 4, 118], M: [28, 6, 45, 14, 46], Q: [30, 11, 24, 16, 25], H: [30, 30, 16, 2, 17] },
  // Ver 25 (117x117, 1588 total)
  { total: 1588, L: [26, 8, 106, 4, 107], M: [28, 8, 47, 13, 48], Q: [30, 7, 24, 22, 25], H: [30, 22, 15, 13, 16] },
  // Ver 26 (121x121, 1706 total)
  { total: 1706, L: [28, 10, 114, 2, 115], M: [28, 19, 46, 4, 47], Q: [28, 28, 22, 6, 23], H: [30, 33, 16, 4, 17] },
  // Ver 27 (125x125, 1828 total)
  { total: 1828, L: [30, 8, 122, 4, 123], M: [28, 22, 45, 3, 46], Q: [30, 8, 23, 26, 24], H: [30, 12, 15, 28, 16] },
  // Ver 28 (129x129, 1921 total)
  { total: 1921, L: [30, 3, 117, 10, 118], M: [28, 3, 45, 23, 46], Q: [30, 4, 24, 31, 25], H: [30, 11, 15, 31, 16] },
  // Ver 29 (133x133, 2051 total)
  { total: 2051, L: [30, 7, 116, 7, 117], M: [28, 21, 45, 7, 46], Q: [30, 1, 23, 37, 24], H: [30, 19, 15, 26, 16] },
  // Ver 30 (137x137, 2185 total)
  { total: 2185, L: [30, 5, 115, 10, 116], M: [28, 19, 47, 10, 48], Q: [30, 15, 24, 25, 25], H: [30, 23, 15, 25, 16] },
  // Ver 31 (141x141, 2323 total)
  { total: 2323, L: [30, 13, 115, 3, 116], M: [28, 2, 46, 29, 47], Q: [30, 42, 24, 1, 25], H: [30, 23, 15, 28, 16] },
  // Ver 32 (145x145, 2465 total)
  { total: 2465, L: [30, 17, 115, 0, 0], M: [28, 10, 46, 23, 47], Q: [30, 10, 24, 35, 25], H: [30, 19, 15, 35, 16] },
  // Ver 33 (149x149, 2611 total)
  { total: 2611, L: [30, 17, 115, 1, 116], M: [28, 14, 46, 21, 47], Q: [30, 29, 24, 19, 25], H: [30, 11, 15, 46, 16] },
  // Ver 34 (153x153, 2761 total)
  { total: 2761, L: [30, 13, 115, 6, 116], M: [28, 14, 46, 23, 47], Q: [30, 44, 24, 7, 25], H: [30, 59, 16, 1, 17] },
  // Ver 35 (157x157, 2876 total)
  { total: 2876, L: [30, 12, 121, 7, 122], M: [28, 12, 47, 26, 48], Q: [30, 39, 24, 14, 25], H: [30, 22, 15, 41, 16] },
  // Ver 36 (161x161, 3034 total)
  { total: 3034, L: [30, 6, 121, 14, 122], M: [28, 6, 47, 34, 48], Q: [30, 46, 24, 10, 25], H: [30, 2, 15, 64, 16] },
  // Ver 37 (165x165, 3196 total)
  { total: 3196, L: [30, 17, 122, 4, 123], M: [28, 29, 46, 14, 47], Q: [30, 49, 24, 10, 25], H: [30, 24, 15, 46, 16] },
  // Ver 38 (169x169, 3362 total)
  { total: 3362, L: [30, 4, 122, 18, 123], M: [28, 13, 46, 32, 47], Q: [30, 48, 24, 14, 25], H: [30, 42, 15, 32, 16] },
  // Ver 39 (173x173, 3532 total)
  { total: 3532, L: [30, 20, 117, 4, 118], M: [28, 40, 47, 7, 48], Q: [30, 43, 24, 22, 25], H: [30, 10, 15, 67, 16] },
  // Ver 40 (177x177, 3706 total)
  { total: 3706, L: [30, 19, 118, 6, 119], M: [28, 18, 47, 31, 48], Q: [30, 34, 24, 34, 25], H: [30, 20, 15, 61, 16] }
];

// Format Information BCH Generator: G(x) = x^10 + x^8 + x^5 + x^4 + x^2 + x + 1 (0x537)
const FORMAT_INFO_POLY = 0x537;
const FORMAT_INFO_MASK = 0x5412;

function getFormatBits(ecLevel, mask) {
  const data = (ecLevel.bits << 3) | mask;
  let rem = data << 10;
  for (let i = 14; i >= 10; i--) {
    if (rem & (1 << i)) {
      rem ^= FORMAT_INFO_POLY << (i - 10);
    }
  }
  return ((data << 10) | rem) ^ FORMAT_INFO_MASK;
}

// Version Information BCH Generator for Version >= 7: G(x) = x^12 + x^11 + x^10 + x^9 + x^8 + x^5 + x^2 + 1 (0x1F25)
const VERSION_INFO_POLY = 0x1f25;

function getVersionBits(version) {
  let rem = version << 12;
  for (let i = 17; i >= 12; i--) {
    if (rem & (1 << i)) {
      rem ^= VERSION_INFO_POLY << (i - 12);
    }
  }
  return (version << 12) | rem;
}

/**
 * Konversi string teks ke byte array UTF-8
 * @param {string} str
 * @returns {Uint8Array}
 */
function stringToUtf8ByteArray(str) {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(str);
  }
  const utf8 = [];
  for (let i = 0; i < str.length; i++) {
    let charcode = str.charCodeAt(i);
    if (charcode < 0x80) utf8.push(charcode);
    else if (charcode < 0x800) {
      utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
    } else if (charcode < 0xd800 || charcode >= 0xe000) {
      utf8.push(0xe0 | (charcode >> 12), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
    } else {
      i++;
      charcode = 0x10000 + (((charcode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
      utf8.push(
        0xf0 | (charcode >> 18),
        0x80 | ((charcode >> 12) & 0x3f),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f)
      );
    }
  }
  return new Uint8Array(utf8);
}

/**
 * Mencari versi QR minimum yang mampu menampung panjang data
 * @param {number} dataLength - Panjang byte data
 * @param {Object} ecLevel - Level error correction
 * @returns {number} Nomor versi (1 - 40)
 */
function findMinimalVersion(dataLength, ecLevel) {
  for (let v = 1; v <= 40; v++) {
    const spec = QR_TABLE[v][ecLevel.name];
    const totalDataCodewords = (spec[1] * spec[2]) + (spec[3] * spec[4]);
    // Byte mode header: 4 bits mode + (v < 10 ? 8 bits : 16 bits) length
    const headerBits = 4 + (v < 10 ? 8 : 16);
    const capacityBytes = Math.floor((totalDataCodewords * 8 - headerBits) / 8);
    if (dataLength <= capacityBytes) {
      return v;
    }
  }
  throw new Error(`Data too long for QR Code standard (${dataLength} bytes)`);
}

/**
 * Membuat data bitstream Byte Mode lengkap dengan terminator dan padding
 */
function createDataCodewords(utf8Bytes, version, ecLevel) {
  const spec = QR_TABLE[version][ecLevel.name];
  const totalDataCodewords = (spec[1] * spec[2]) + (spec[3] * spec[4]);
  const bits = [];

  function appendBits(val, numBits) {
    for (let i = numBits - 1; i >= 0; i--) {
      bits.push((val >>> i) & 1);
    }
  }

  // 1. Mode indicator Byte: 0100 (4 bits)
  appendBits(0b0100, 4);

  // 2. Character count indicator: 8 bits for ver 1-9, 16 bits for ver 10-40
  const charCountBits = version < 10 ? 8 : 16;
  appendBits(utf8Bytes.length, charCountBits);

  // 3. Data bytes
  for (let i = 0; i < utf8Bytes.length; i++) {
    appendBits(utf8Bytes[i], 8);
  }

  // 4. Terminator: up to 4 zeros
  const totalDataBits = totalDataCodewords * 8;
  const remainingZeros = Math.min(4, totalDataBits - bits.length);
  for (let i = 0; i < remainingZeros; i++) {
    bits.push(0);
  }

  // 5. Pad to multiple of 8
  while (bits.length % 8 !== 0) {
    bits.push(0);
  }

  // Convert to codewords
  const codewords = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byteVal = 0;
    for (let b = 0; b < 8; b++) {
      byteVal = (byteVal << 1) | bits[i + b];
    }
    codewords.push(byteVal);
  }

  // 6. Alternate padding bytes 0xEC (236) and 0x11 (17)
  let padToggle = false;
  while (codewords.length < totalDataCodewords) {
    codewords.push(padToggle ? 0x11 : 0xec);
    padToggle = !padToggle;
  }

  return codewords;
}

/**
 * Interleaving data & error correction blocks
 */
function interleaveBlocks(codewords, version, ecLevel) {
  const spec = QR_TABLE[version][ecLevel.name];
  const ecPerBlock = spec[0];
  const countG1 = spec[1];
  const dataLenG1 = spec[2];
  const countG2 = spec[3];
  const dataLenG2 = spec[4];

  const totalBlocks = countG1 + countG2;
  const dataBlocks = [];
  const ecBlocks = [];

  let offset = 0;
  for (let b = 0; b < countG1; b++) {
    const blockData = codewords.slice(offset, offset + dataLenG1);
    dataBlocks.push(blockData);
    ecBlocks.push(computeReedSolomon(blockData, ecPerBlock));
    offset += dataLenG1;
  }
  for (let b = 0; b < countG2; b++) {
    const blockData = codewords.slice(offset, offset + dataLenG2);
    dataBlocks.push(blockData);
    ecBlocks.push(computeReedSolomon(blockData, ecPerBlock));
    offset += dataLenG2;
  }

  // Interleave data codewords
  const result = [];
  const maxDataLen = Math.max(dataLenG1, dataLenG2);
  for (let i = 0; i < maxDataLen; i++) {
    for (let b = 0; b < totalBlocks; b++) {
      if (i < dataBlocks[b].length) {
        result.push(dataBlocks[b][i]);
      }
    }
  }

  // Interleave EC codewords
  for (let i = 0; i < ecPerBlock; i++) {
    for (let b = 0; b < totalBlocks; b++) {
      result.push(ecBlocks[b][i]);
    }
  }

  return result;
}

/**
 * Evaluasi penalti mask pattern (Rules 1 - 4)
 */
function evaluatePenalty(matrix, size) {
  let penalty = 0;

  // Rule 1: 5 or more same color in row/column
  for (let r = 0; r < size; r++) {
    let count = 0;
    let last = -1;
    for (let c = 0; c < size; c++) {
      const val = matrix[r][c];
      if (val === last) {
        count++;
        if (count === 5) penalty += 3;
        else if (count > 5) penalty += 1;
      } else {
        last = val;
        count = 1;
      }
    }
  }
  for (let c = 0; c < size; c++) {
    let count = 0;
    let last = -1;
    for (let r = 0; r < size; r++) {
      const val = matrix[r][c];
      if (val === last) {
        count++;
        if (count === 5) penalty += 3;
        else if (count > 5) penalty += 1;
      } else {
        last = val;
        count = 1;
      }
    }
  }

  // Rule 2: 2x2 blocks of same color
  for (let r = 0; r < size - 1; r++) {
    for (let c = 0; c < size - 1; c++) {
      const v = matrix[r][c];
      if (v === matrix[r][c + 1] && v === matrix[r + 1][c] && v === matrix[r + 1][c + 1]) {
        penalty += 3;
      }
    }
  }

  // Rule 3: Finder-like pattern 1:1:3:1:1 with 4 whites
  const p1 = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0];
  const p2 = [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c <= size - 11; c++) {
      let m1 = true;
      let m2 = true;
      for (let k = 0; k < 11; k++) {
        if (matrix[r][c + k] !== p1[k]) m1 = false;
        if (matrix[r][c + k] !== p2[k]) m2 = false;
      }
      if (m1 || m2) penalty += 40;
    }
  }
  for (let c = 0; c < size; c++) {
    for (let r = 0; r <= size - 11; r++) {
      let m1 = true;
      let m2 = true;
      for (let k = 0; k < 11; k++) {
        if (matrix[r + k][c] !== p1[k]) m1 = false;
        if (matrix[r + k][c] !== p2[k]) m2 = false;
      }
      if (m1 || m2) penalty += 40;
    }
  }

  // Rule 4: Balance of dark and light
  let darkCount = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c] === 1) darkCount++;
    }
  }
  const total = size * size;
  const percent = (darkCount * 100) / total;
  const prev5 = Math.abs(Math.floor(percent / 5) * 5 - 50) / 5;
  const next5 = Math.abs(Math.ceil(percent / 5) * 5 - 50) / 5;
  penalty += Math.min(prev5, next5) * 10;

  return penalty;
}

/**
 * Mask pattern condition functions
 */
function isMasked(mask, r, c) {
  switch (mask) {
    case 0: return (r + c) % 2 === 0;
    case 1: return r % 2 === 0;
    case 2: return c % 3 === 0;
    case 3: return (r + c) % 3 === 0;
    case 4: return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0;
    case 5: return ((r * c) % 2) + ((r * c) % 3) === 0;
    case 6: return (((r * c) % 2) + ((r * c) % 3)) % 2 === 0;
    case 7: return (((r + c) % 2) + ((r * c) % 3)) % 2 === 0;
    default: return false;
  }
}

/**
 * Membangun matriks QR Code murni (2D Array)
 */
export function createQrMatrix(text, requestedEcLevel = 'M') {
  const ec = EC_LEVEL[requestedEcLevel] || EC_LEVEL.M;
  const utf8Bytes = stringToUtf8ByteArray(text);
  const version = findMinimalVersion(utf8Bytes.length, ec);
  const size = version * 4 + 17;

  // Matriks: 0 = white, 1 = black, -1 = reserved function pattern
  const matrix = Array.from({ length: size }, () => new Int8Array(size).fill(0));
  const isFunction = Array.from({ length: size }, () => new Uint8Array(size).fill(0));

  function setFunction(r, c, val) {
    matrix[r][c] = val;
    isFunction[r][c] = 1;
  }

  // 1. Finder Patterns (7x7) + Separator
  function placeFinder(top, left) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const nr = top + r;
        const nc = left + c;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
            const isBorder = (r === 0 || r === 6 || c === 0 || c === 6);
            const isCenter = (r >= 2 && r <= 4 && c >= 2 && c <= 4);
            setFunction(nr, nc, isBorder || isCenter ? 1 : 0);
          } else {
            setFunction(nr, nc, 0); // Separator
          }
        }
      }
    }
  }

  placeFinder(0, 0); // Top-left
  placeFinder(0, size - 7); // Top-right
  placeFinder(size - 7, 0); // Bottom-left

  // 2. Alignment Patterns
  const alignCoords = ALIGNMENT_PATTERNS[version];
  for (let i = 0; i < alignCoords.length; i++) {
    for (let j = 0; j < alignCoords.length; j++) {
      const r = alignCoords[i];
      const c = alignCoords[j];
      // Skip if overlapping finder patterns
      if (
        (r < 9 && c < 9) ||
        (r < 9 && c >= size - 9) ||
        (r >= size - 9 && c < 9)
      ) {
        continue;
      }
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const isBorder = (Math.abs(dr) === 2 || Math.abs(dc) === 2);
          const isCenter = (dr === 0 && dc === 0);
          setFunction(r + dr, c + dc, isBorder || isCenter ? 1 : 0);
        }
      }
    }
  }

  // 3. Timing Patterns
  for (let i = 8; i < size - 8; i++) {
    if (!isFunction[6][i]) setFunction(6, i, i % 2 === 0 ? 1 : 0);
    if (!isFunction[i][6]) setFunction(i, 6, i % 2 === 0 ? 1 : 0);
  }

  // 4. Dark Module
  setFunction(size - 8, 8, 1);

  // 5. Reserve Format Info Area
  for (let i = 0; i < 9; i++) {
    if (!isFunction[8][i]) setFunction(8, i, 0);
    if (!isFunction[i][8]) setFunction(i, 8, 0);
  }
  for (let i = 0; i < 8; i++) {
    if (!isFunction[8][size - 1 - i]) setFunction(8, size - 1 - i, 0);
    if (!isFunction[size - 1 - i][8]) setFunction(size - 1 - i, 8, 0);
  }

  // 6. Reserve Version Info Area (Ver >= 7)
  if (version >= 7) {
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 3; j++) {
        setFunction(i, size - 11 + j, 0);
        setFunction(size - 11 + j, i, 0);
      }
    }
  }

  // 7. Codewords Generation & Interleaving
  const dataCodewords = createDataCodewords(utf8Bytes, version, ec);
  const finalCodewords = interleaveBlocks(dataCodewords, version, ec);

  // 8. Place Data Codewords into Non-Function Modules
  let bitIndex = 0;
  const totalBits = finalCodewords.length * 8;
  let upwards = true;

  for (let right = size - 1; right > 0; right -= 2) {
    if (right === 6) right--; // Skip vertical timing column
    const rows = upwards
      ? Array.from({ length: size }, (_, k) => size - 1 - k)
      : Array.from({ length: size }, (_, k) => k);

    for (const r of rows) {
      for (let c of [right, right - 1]) {
        if (!isFunction[r][c]) {
          let bit = 0;
          if (bitIndex < totalBits) {
            const byteVal = finalCodewords[bitIndex >>> 3];
            bit = (byteVal >>> (7 - (bitIndex & 7))) & 1;
            bitIndex++;
          }
          matrix[r][c] = bit;
        }
      }
    }
    upwards = !upwards;
  }

  // 9. Mask Evaluation & Selection
  let bestMask = 0;
  let lowestPenalty = Infinity;
  let bestMatrix = null;

  for (let mask = 0; mask < 8; mask++) {
    // Clone matrix with this mask applied
    const candidate = matrix.map((row, r) =>
      Int8Array.from(row, (val, c) => {
        if (isFunction[r][c]) return val;
        return val ^ (isMasked(mask, r, c) ? 1 : 0);
      })
    );

    // Apply Format Bits for this candidate
    const formatBits = getFormatBits(ec, mask);
    for (let i = 0; i < 15; i++) {
      const bit = (formatBits >>> (14 - i)) & 1;
      // Top-left finder surrounding
      if (i < 6) candidate[8][i] = bit;
      else if (i === 6) candidate[8][7] = bit;
      else if (i === 7) candidate[8][8] = bit;
      else if (i === 8) candidate[7][8] = bit;
      else candidate[14 - i][8] = bit;

      // Split 2nd copy
      if (i < 8) candidate[size - 1 - i][8] = bit;
      else candidate[8][size - 15 + i] = bit;
    }

    // Apply Version Bits if Ver >= 7
    if (version >= 7) {
      const vBits = getVersionBits(version);
      for (let i = 0; i < 18; i++) {
        const bit = (vBits >>> i) & 1;
        const r = Math.floor(i / 3);
        const c = i % 3;
        candidate[size - 11 + c][r] = bit;
        candidate[r][size - 11 + c] = bit;
      }
    }

    const penalty = evaluatePenalty(candidate, size);
    if (penalty < lowestPenalty) {
      lowestPenalty = penalty;
      bestMask = mask;
      bestMatrix = candidate;
    }
  }

  return {
    version,
    size,
    ecLevel: ec.name,
    mask: bestMask,
    matrix: bestMatrix
  };
}

/**
 * Menghasilkan string SVG QR Code murni yang scalable dan tajam
 * 
 * @param {string} text - Teks atau URL yang akan dikonversi ke QR
 * @param {Object} [options={}] - Opsi tampilan
 * @param {number} [options.size=256] - Ukuran piksel SVG (default: 256)
 * @param {number} [options.margin=4] - Quiet zone margin dalam modul (default: 4)
 * @param {string} [options.ecc='M'] - Level error correction ('L', 'M', 'Q', 'H')
 * @param {string} [options.darkColor='#000000'] - Warna modul aktif (default: #000000)
 * @param {string} [options.lightColor='#ffffff'] - Warna latar belakang (default: #ffffff)
 * @returns {string} String elemen <svg> valid
 */
export function generateQrSvg(text, options = {}) {
  const str = String(text || '');
  const margin = options.margin !== undefined ? Math.max(0, Number(options.margin) || 0) : 4;
  const svgSize = options.size || 256;
  const ecc = options.ecc || 'M';
  const darkColor = options.darkColor || '#000000';
  const lightColor = options.lightColor || '#ffffff';

  // Buat matriks
  const { size, matrix } = createQrMatrix(str, ecc);
  const totalGridSize = size + margin * 2;

  // Bangun path SVG gabungan (single path data) untuk performa rendering optimal
  let pathData = '';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c] === 1) {
        const x = c + margin;
        const y = r + margin;
        pathData += `M${x},${y}h1v1h-1z `;
      }
    }
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalGridSize} ${totalGridSize}" width="${svgSize}" height="${svgSize}" shape-rendering="crispEdges" role="img" aria-label="QR Code">`,
    lightColor && lightColor !== 'transparent'
      ? `  <rect width="${totalGridSize}" height="${totalGridSize}" fill="${lightColor}"/>`
      : '',
    `  <path d="${pathData.trim()}" fill="${darkColor}"/>`,
    `</svg>`
  ].filter(Boolean).join('\n');
}
