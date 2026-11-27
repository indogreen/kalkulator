/**
 * Zero-dependency bundler and cache-busting manifest updater
 * for browser standalone compatibility (works via file:// and http://)
 * PT. Indogreen Technology And Management
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BUNDLE_FILES = [
  'src/js/calculator/constants.js',
  'src/js/utils/formatter.js',
  'src/js/utils/qrcode.js',
  'src/js/utils/whatsapp.js',
  'src/js/calculator/hybrid.js',
  'src/js/calculator/residential.js',
  'src/js/calculator/commercial.js',
  'src/js/calculator/battery.js',
  'src/js/calculator/pjuts.js',
  'src/js/components/header.js',
  'src/js/components/tabs.js',
  'src/js/components/modalQr.js',
  'src/js/components/forms/hybridForm.js',
  'src/js/components/forms/residentialForm.js',
  'src/js/components/forms/commercialForm.js',
  'src/js/components/forms/batteryForm.js',
  'src/js/components/forms/pjutsForm.js',
  'src/js/components/results/heroCard.js',
  'src/js/components/results/kpiGrid.js',
  'src/js/components/results/energyProfile.js',
  'src/js/components/results/billBar.js',
  'src/js/components/results/timeline.js',
  'src/js/components/results/schemeTable.js',
  'src/js/components/results/conversionCta.js',
  'src/js/components/results/regulatoryNote.js',
  'src/js/components/results/index.js',
  'src/js/app.js'
];

/**
 * Compute short deterministic SHA-256 hash (8 hex chars) for cache busting
 * @param {string} filePath
 * @returns {string|null}
 */
export function computeAssetHash(filePath) {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    return null;
  }
  const buffer = fs.readFileSync(resolved);
  return crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 8);
}

/**
 * Inject or refresh ?v=<hash> query strings on static asset URLs in HTML
 * @param {string} html
 * @param {{ css?: string|null, js?: string|null, logo?: string|null }} hashes
 * @returns {string}
 */
export function applyCacheBustingToHtml(html, hashes = {}) {
  let updated = html;

  if (hashes.css) {
    updated = updated.replace(
      /\.\/dist\/css\/style\.css(?:\?v=[a-f0-9]+)?/g,
      `./dist/css/style.css?v=${hashes.css}`
    );
  }

  if (hashes.js) {
    updated = updated.replace(
      /\.\/dist\/js\/bundle\.js(?:\?v=[a-f0-9]+)?/g,
      `./dist/js/bundle.js?v=${hashes.js}`
    );
  }

  if (hashes.logo) {
    updated = updated.replace(
      /\.\/assets\/images\/indogreen\.png(?:\?v=[a-f0-9]+)?/g,
      `./assets/images/indogreen.png?v=${hashes.logo}`
    );
  }

  return updated;
}

/**
 * Update index.html with current asset hashes if any built asset exists
 * @param {string} [htmlPath='index.html']
 * @returns {boolean} True if index.html was modified
 */
export function updateHtmlAssetVersions(htmlPath = 'index.html') {
  const resolvedHtml = path.resolve(htmlPath);
  if (!fs.existsSync(resolvedHtml)) {
    return false;
  }

  const hashes = {
    css: computeAssetHash('dist/css/style.css'),
    js: computeAssetHash('dist/js/bundle.js'),
    logo: computeAssetHash('assets/images/indogreen.png')
  };

  const originalHtml = fs.readFileSync(resolvedHtml, 'utf8');
  const nextHtml = applyCacheBustingToHtml(originalHtml, hashes);

  if (nextHtml === originalHtml) {
    return false;
  }

  fs.writeFileSync(resolvedHtml, nextHtml, 'utf8');
  return true;
}

/**
 * Build standalone bundle at dist/js/bundle.js
 */
export function buildBundle() {
  let bundleContent = '(function() {\n  "use strict";\n\n';

  for (const relPath of BUNDLE_FILES) {
    const fullPath = path.resolve(relPath);
    if (!fs.existsSync(fullPath)) {
      console.error(`Missing file: ${relPath}`);
      continue;
    }

    let code = fs.readFileSync(fullPath, 'utf8');

    // Strip import statements
    code = code.replace(/import\s+[^;]+from\s+['"][^'"]+['"];?/g, '');
    code = code.replace(/import\s+['"][^'"]+['"];?/g, '');

    // Strip export keywords
    code = code.replace(/export\s+const\s+/g, 'const ');
    code = code.replace(/export\s+function\s+/g, 'function ');
    code = code.replace(/export\s+let\s+/g, 'let ');
    code = code.replace(/export\s+default\s+/g, '');
    code = code.replace(/export\s*\{[^}]*\};?/g, '');

    bundleContent += `  // ============================================================\n`;
    bundleContent += `  // MODULE: ${relPath}\n`;
    bundleContent += `  // ============================================================\n`;
    bundleContent += code.split('\n').map(line => '  ' + line).join('\n');
    bundleContent += '\n\n';
  }

  bundleContent += '})();\n';

  fs.mkdirSync('dist/js', { recursive: true });
  fs.writeFileSync('dist/js/bundle.js', bundleContent, 'utf8');
  console.log('✓ Successfully generated standalone bundle at dist/js/bundle.js');
}

const isDirectRun = Boolean(
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
);

if (isDirectRun) {
  buildBundle();

  const updateHtml = process.argv.includes('--update-html-hash');
  if (updateHtml) {
    const htmlUpdated = updateHtmlAssetVersions();
    if (htmlUpdated) {
      console.log('✓ Updated cache-busting asset hashes in index.html');
    }
  }
}
