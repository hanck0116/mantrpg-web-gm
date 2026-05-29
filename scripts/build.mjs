import { mkdir, readFile, writeFile, cp } from 'node:fs/promises';
import { join } from 'node:path';
import { browserBundle } from './runtime-app.mjs';

const root = process.cwd();
const dist = join(root, 'dist');
await mkdir(dist, { recursive: true });

let html = await readFile(join(root, 'index.html'), 'utf8');
html = html.replace('<script type="module" src="/src/main.ts"></script>', '<script type="module" src="/assets/main.js"></script>');
html = html.replace('<link rel="stylesheet" href="/src/styles.css" />', '<link rel="stylesheet" href="/assets/styles.css" />');

await mkdir(join(dist, 'assets'), { recursive: true });
await writeFile(join(dist, 'index.html'), html);
await writeFile(join(dist, 'assets/main.js'), browserBundle());
await writeFile(join(dist, 'assets/styles.css'), await readFile(join(root, 'src/styles.css')));
await cp(join(root, 'public'), dist, { recursive: true });
console.log('Built static app to dist/');
