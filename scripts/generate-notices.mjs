import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
const inventory = JSON.parse(
  execFileSync('pnpm', ['licenses', 'list', '--prod', '--json'], {
    encoding: 'utf8',
  }),
);
const sections = [
  'Third-party runtime dependency notices. Generated from the installed lockfile dependency tree.',
];
for (const [license, packages] of Object.entries(inventory)) {
  for (const item of packages) {
    const directory = item.paths[0];
    const files = readdirSync(directory).filter((name) =>
      /^(license|copying|notice)(\.|$)/i.test(name),
    );
    if (!files.length) throw new Error(`Missing license text for ${item.name}`);
    sections.push(`${item.name} ${item.versions.join(', ')} — ${license}`);
    for (const file of files.sort())
      sections.push(readFileSync(path.join(directory, file), 'utf8'));
  }
}
const output = 'apps/showcase/public/third-party';
mkdirSync(output, { recursive: true });
writeFileSync(
  path.join(output, 'dependencies.txt'),
  sections
    .join('\n\n--------------------\n\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trimEnd() + '\n',
);
