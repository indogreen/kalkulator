# Graph Report - kalkulator  (2026-11-27)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 331 nodes · 906 edges · 12 communities (10 shown, 2 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 47 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6b043f16`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- audit-docs.py
- app.js
- qa-accessibility.test.js
- constants.js
- hybridForm.js
- steps
- package.json
- qrcode.js
- module_audit.py
- build.js

## God Nodes (most connected - your core abstractions)
1. `Report` - 29 edges
2. `renderHybridForm()` - 20 edges
3. `diagnostic()` - 17 edges
4. `formatNumber()` - 16 edges
5. `main()` - 14 edges
6. `formatRupiah()` - 14 edges
7. `check_adr()` - 13 edges
8. `check_status_resurrection()` - 13 edges
9. `read_utf8()` - 13 edges
10. `createQrMatrix()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `main()` --calls--> `check_modules()`  [EXTRACTED]
  .agents/skills/docs-governance/scripts/audit-docs.py → .agents/skills/docs-governance/scripts/module_audit.py
- `mountActiveForm()` --calls--> `renderHybridForm()`  [EXTRACTED]
  src/js/app.js → src/js/components/forms/hybridForm.js
- `updateCalculation()` --calls--> `renderResults()`  [EXTRACTED]
  src/js/app.js → src/js/components/results/index.js
- `renderHybridForm()` --calls--> `formatNumber()`  [EXTRACTED]
  src/js/components/forms/hybridForm.js → src/js/utils/formatter.js
- `updateDayaDisplay()` --calls--> `formatNumber()`  [EXTRACTED]
  src/js/components/forms/hybridForm.js → src/js/utils/formatter.js

## Import Cycles
- None detected.

## Communities (12 total, 2 thin omitted)

### Community 0 - "audit-docs.py"
Cohesion: 0.13
Nodes (44): adr_identifier(), apply_custom_roles(), check_adr(), check_adr_lifecycle(), check_artifacts(), check_context(), check_derived_history_index(), check_log() (+36 more)

### Community 1 - "app.js"
Cohesion: 0.07
Nodes (39): appState, DEFAULT_APP_STATE, getActiveMode(), getAppState(), initApp(), mountActiveForm(), resetActiveModeState(), setActiveMode() (+31 more)

### Community 2 - "qa-accessibility.test.js"
Cohesion: 0.13
Nodes (26): getBillBarHtml(), renderBillBar(), getConversionCtaHtml(), renderConversionCta(), getEnergyProfileHtml(), renderEnergyProfile(), getHeroCardHtml(), renderHeroCard() (+18 more)

### Community 3 - "constants.js"
Cohesion: 0.17
Nodes (27): calculateCurrentResult(), calculateBattery(), calculateCommercial(), BATTERY_HYBRID_OPTIONS, BESS_SPECS, COMMERCIAL_OPERATIONAL_HOURS, COMMERCIAL_SCHEMES, DAYTIME_ACTIVITY_PATTERNS (+19 more)

### Community 4 - "hybridForm.js"
Cohesion: 0.15
Nodes (22): getBatteryConfigurationOptions(), getHybridSolarPanel(), getHybridTariffOption(), HYBRID_BATTERY_UNITS, HYBRID_SOLAR_PANELS, HYBRID_TECH_CONFIG, calculateHybridOffGrid(), resolveStandardInverterKw() (+14 more)

### Community 5 - "steps"
Cohesion: 0.09
Nodes (24): name, needs, runs-on, steps, concurrency, cancel-in-progress, group, name (+16 more)

### Community 6 - "package.json"
Cohesion: 0.11
Nodes (20): description, devDependencies, autoprefixer@^10.4.20, postcss@^8.4.49, tailwindcss@^3.4.17, name, private, scripts (+12 more)

### Community 7 - "qrcode.js"
Cohesion: 0.18
Nodes (17): ALIGNMENT_PATTERNS, computeReedSolomon(), createDataCodewords(), createQrMatrix(), placeFinder(), setFunction(), EC_LEVEL, evaluatePenalty() (+9 more)

### Community 8 - "module_audit.py"
Cohesion: 0.15
Nodes (4): AuditReport, carrier_candidates(), check_modules(), LinkChecker

### Community 9 - "build.js"
Cohesion: 0.14
Nodes (9): applyCacheBustingToHtml(), BUNDLE_FILES, computeAssetHash(), isDirectRun, updateHtmlAssetVersions(), applyNoCacheHeaders(), createStaticHandler(), isDirectRun (+1 more)

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `renderHybridForm()` connect `hybridForm.js` to `app.js`, `qa-accessibility.test.js`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Should `audit-docs.py` be split into smaller, more focused modules?**
  _Cohesion score 0.1300563236047107 - nodes in this community are weakly interconnected._
- **Why does `createQrMatrix()` connect `qrcode.js` to `app.js`, `qa-accessibility.test.js`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07207792207792207 - nodes in this community are weakly interconnected._
- **Why does `renderResidentialForm()` connect `app.js` to `qa-accessibility.test.js`, `constants.js`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Should `qa-accessibility.test.js` be split into smaller, more focused modules?**
  _Cohesion score 0.1332099907493062 - nodes in this community are weakly interconnected._
- **Should `steps` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._