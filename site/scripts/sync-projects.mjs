import { readFileSync, writeFileSync } from 'node:fs';
const source = new URL('../../data/GitHub项目公开快照-2026-10-04.json', import.meta.url);
const target = new URL('../src/content/project-snapshot.json', import.meta.url);
const snapshot = JSON.parse(readFileSync(source, 'utf8'));
const names = new Set();
for (const repo of snapshot.repositories) {
  if (names.has(repo.name)) throw new Error(`Duplicate repository: ${repo.name}`);
  if (new URL(repo.url).hostname !== 'github.com') throw new Error('Invalid repository URL');
  names.add(repo.name);
}
writeFileSync(target, JSON.stringify(snapshot, null, 2) + '\n');
console.log(`Synced ${names.size} public repositories to the standalone site.`);
