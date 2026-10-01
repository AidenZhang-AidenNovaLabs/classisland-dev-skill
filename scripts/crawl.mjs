// Fetch canonical markdown sources of the ClassIsland dev docs from GitHub,
// so the skill's references are complete (mermaid, code tabs, inline links).
// Mimosa constraint: https only, host-validated, no localhost/loopback/private/reserved.
const ALLOWED = ['api.github.com'];

function checkUrl(raw) {
  const u = new URL(raw);
  if (u.protocol !== 'https:') throw new Error(`blocked non-https: ${raw}`);
  if (!ALLOWED.includes(u.hostname)) throw new Error(`blocked host: ${u.hostname}`);
  if (/^(localhost|127\.|10\.|192\.168\.|169\.254\.|0\.|\[::)/.test(u.hostname))
    throw new Error(`blocked reserved address: ${u.hostname}`);
  return u;
}

async function apiJson(path) {
  const u = checkUrl(`https://api.github.com${path}`);
  const res = await fetch(u, { headers: { 'user-agent': 'skill-builder', 'accept': 'application/vnd.github+json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${u.pathname}${u.search}`);
  return res.json();
}

const REPO = 'ClassIsland/classisland-docs-next';
const REF = 'main';

// 1) full tree -> every markdown file under src/dev, plus the attached-settings page used by the dev sidebar
const tree = await apiJson(`/repos/${REPO}/git/trees/${REF}?recursive=1`);
const files = tree.tree
  .filter(f => f.type === 'blob' && f.path.startsWith('src/dev/') && f.path.endsWith('.md'))
  .map(f => f.path);
// attached-settings lives under src/app but is cross-linked from the dev sidebar
files.push('src/app/profile/attached-settings.md');
files.sort();

console.log(`discovered ${files.length} markdown sources under src/dev`);

// 2) fetch each file's content via the contents API (base64)
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const outDir = join(process.cwd(), 'docs-src');
const results = [];
for (const p of files) {
  try {
    const j = await apiJson(`/repos/${REPO}/contents/${p}?ref=${REF}`);
    if (j.encoding !== 'base64') throw new Error(`unexpected encoding ${j.encoding}`);
    const md = Buffer.from(j.content, 'base64').toString('utf8');
    const rel = p.replace(/^src\//, '').replace(/\.md$/, '');
    const file = join(outDir, `${rel}.md`);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, `<!-- 源: https://github.com/${REPO}/blob/${REF}/${p} | 文档页: https://docs.classisland.tech/dev/ -->\n\n${md}`, 'utf8');
    results.push({ path: p, ok: true, bytes: md.length });
  } catch (e) {
    results.push({ path: p, ok: false, error: String(e) });
  }
}
console.table(results.map(r => ({ path: r.path, ok: r.ok, bytes: r.bytes ?? r.error })));
const failed = results.filter(r => !r.ok);
if (failed.length) { console.error('FAILED:', failed.map(f => f.path)); process.exit(1); }
console.log('all sources fetched OK');
