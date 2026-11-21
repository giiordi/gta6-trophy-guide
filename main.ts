import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repository = fileURLToPath(new URL('.', import.meta.url));
const destination = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');
const limits = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
};

rmSync(destination, { recursive: true, force: true });
mkdirSync(destination, { recursive: true });
for (const name of ['app', 'screenshots']) {
  const source = join(repository, name);
  const target = join(destination, name);
  rmSync(target, { recursive: true, force: true });
  // Never copy dotfiles (e.g. screenshots/.gitkeep) into the dossier: a stray
  // dotfile in the output once failed a whole submission round.
  if (existsSync(source)) cpSync(source, target, { recursive: true, filter: (src) => !basename(src).startsWith('.') });
  else mkdirSync(target, { recursive: true });
}

writeFileSync(join(destination, 'dossier.json'), buildDossier(destination, limits));
console.log(`Built dossier in ${destination}`);
