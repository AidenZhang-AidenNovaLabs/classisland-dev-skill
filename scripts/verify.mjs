// Verify the classisland-dev skill: every doc source is mirrored, and every
// path routed from SKILL.md exists. Exits non-zero on any gap.
import { readdirSync, statSync, readFileSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const skillDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const refDir = join(skillDir, 'references');

const mirrored = [];
(function walk(d) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.md')) mirrored.push(relative(refDir, p).replaceAll('\\', '/'));
  }
})(refDir);

// 1) all 32 doc sources present (dev/** plus app/profile/attached-settings)
const srcs = mirrored.filter(p => p !== 'SKILL.md');
if (srcs.length !== 32) { console.error(`FAIL: expected 32 mirrored files, got ${srcs.length}`); process.exit(1); }
if (!srcs.every(p => p.startsWith('dev/') || p === 'app/profile/attached-settings.md')) {
  console.error('FAIL: unexpected paths:', srcs.filter(p => !p.startsWith('dev/') && !p.startsWith('app/')));
  process.exit(1);
}

// 2) every `references/...` path mentioned in SKILL.md exists on disk
const skill = readFileSync(join(skillDir, 'SKILL.md'), 'utf8');
const routed = [...skill.matchAll(/`references\/([^`]+)`/g)].map(m => m[1]);
const missing = routed.filter(p => !srcs.includes(p));
if (missing.length) { console.error('FAIL: SKILL.md routes to missing files:', missing); process.exit(1); }

// 3) no empty reference file (stub pages are tiny but must have their heading)
const empty = srcs.filter(p => statSync(join(refDir, p)).size < 20);
if (empty.length) { console.error('FAIL: empty files:', empty); process.exit(1); }

console.log(`OK: ${srcs.length} mirrored files, ${routed.length} SKILL.md routes all resolve`);
