// Local production preview that applies the same static headers as Pages.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve('apps/showcase/dist');
const headerFile = await readFile(path.join(root, '_headers'), 'utf8');
const headers = Object.fromEntries(
  headerFile
    .split('\n')
    .filter((line) => line.startsWith('  '))
    .map((line) => {
      const separator = line.indexOf(':');
      return [
        line.slice(0, separator).trim(),
        line.slice(separator + 1).trim(),
      ];
    }),
);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json',
};
createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(
      new URL(request.url ?? '/', 'http://localhost').pathname,
    );
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405).end();
      return;
    }
    let file = path.resolve(root, '.' + pathname);
    if (file !== root && !file.startsWith(root + path.sep)) {
      response.writeHead(403).end();
      return;
    }
    let exists = false;
    try {
      exists = (await stat(file)).isFile();
    } catch {
      /* SPA fallback below */
    }
    if (!exists) {
      if (path.extname(pathname)) {
        response.writeHead(404).end();
        return;
      }
      file = path.join(root, 'index.html');
    }
    const content = await readFile(file);
    response.writeHead(200, {
      ...headers,
      'Content-Type': types[path.extname(file)] ?? 'application/octet-stream',
    });
    response.end(request.method === 'HEAD' ? undefined : content);
  } catch {
    response.writeHead(400).end();
  }
}).listen(3056, '127.0.0.1', () =>
  console.log('Production preview: http://127.0.0.1:3056'),
);
