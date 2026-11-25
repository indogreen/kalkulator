/**
 * Zero-dependency bundler for browser standalone compatibility (works via file:// and http://)
 * PT. Indogreen Technology And Management
 */
import fs from 'node:fs';
import path from 'node:path';

const files = [
  'src/js/calculator/constants.js',
  'src/js/utils/formatter.js',
  'src/js/utils/qrcode.js',
  'src/js/utils/whatsapp.js',
  'src/js/calculator/residential.js',
  'src/js/calculator/commercial.js',
  'src/js/calculator/battery.js',
  'src/js/calculator/pjuts.js',
  'src/js/components/header.js',
  'src/js/components/tabs.js',
  'src/js/components/modalQr.js',
  'src/js/components/forms/residentialForm.js',
  'src/js/components/forms/commercialForm.js',
  'src/js/components/forms/batteryForm.js',
  'src/js/components/forms/pjutsForm.js',
  'src/js/components/results/heroCard.js',
  'src/js/components/results/kpiGrid.js',
  'src/js/components/results/billBar.js',
  'src/js/components/results/timeline.js',
  'src/js/components/results/schemeTable.js',
  'src/js/components/results/conversionCta.js',
  'src/js/components/results/regulatoryNote.js',
  'src/js/components/results/index.js',
  'src/js/app.js'
];

let bundleContent = '(function() {\n  "use strict";\n\n';

for (const relPath of files) {
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
