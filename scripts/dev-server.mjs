import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { browserBundle } from './runtime-app.mjs';

const port = Number(process.env.PORT ?? 5173);
const root = process.cwd();
const mime = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
]);

async function readStatic(pathname) {
  if (pathname === '/src/main.ts') {
    return { body: browserBundle(), type: 'text/javascript; charset=utf-8' };
  }
  if (pathname === '/src/styles.css') {
    return { body: await readFile(join(root, 'src/styles.css')), type: mime.get('.css') };
  }

  const filePath = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
  const normalized = normalize(filePath);
  const candidates = normalized.startsWith('public/')
    ? [normalized]
    : [normalized, join('public', normalized)];

  for (const candidate of candidates) {
    try {
      const body = await readFile(join(root, candidate));
      return { body, type: mime.get(extname(candidate)) ?? 'application/octet-stream' };
    } catch {
      // Try next candidate.
    }
  }

  return { body: await readFile(join(root, 'index.html')), type: mime.get('.html') };
}

createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', `http://${request.headers.host}`);
    const asset = await readStatic(url.pathname);
    response.writeHead(200, { 'Content-Type': asset.type, 'Cache-Control': 'no-store' });
    response.end(asset.body);
  } catch (error) {
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end(error instanceof Error ? error.message : 'Unknown server error');
  }
}).listen(port, '0.0.0.0', () => {
  console.log(`ManRPG dev server running at http://localhost:${port}`);
});
