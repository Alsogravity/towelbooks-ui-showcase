import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
const manifest = JSON.parse(readFileSync('docs/source-manifest.json', 'utf8'));
const allowed = new Set(
  JSON.parse(readFileSync('docs/demo-adaptations.json', 'utf8')),
);
const changed = [];
const failures = [];
for (const file of manifest) {
  if (!existsSync(file.path)) {
    failures.push(file.path + ' missing');
    continue;
  }
  const actual = createHash('sha256')
    .update(readFileSync(file.path))
    .digest('hex');
  if (actual !== file.sha256) {
    if (allowed.has(file.path)) changed.push(file.path);
    else failures.push(file.path + ' differs from original');
  }
}
if (failures.length) throw new Error(failures.join('\n'));
console.log(
  JSON.stringify({
    originalFiles: manifest.length,
    unchangedFiles: manifest.length - changed.length,
    adaptedIntegrationFiles: changed,
  }),
);
