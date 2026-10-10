/** Local or WebContainer preview of the static site; no external runtime deps. */
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { dirname, extname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT) || 3000;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};
const blocked = /^(?:\/(?:\.git|\.github|scripts|docs|node_modules)(?:\/|$)|\/\.)/;
const send = (res, status, message) => {
  res.writeHead(status, {'Content-Type': 'text/plain; charset=utf-8', 'X-Robots-Tag':'noindex, nofollow','Cache-Control':'no-store'});
  res.end(message);
};
createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res,405,'Method not allowed');
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { return send(res,400,'Invalid URL'); }
  if (pathname.includes('\\') || pathname.includes('\0') || blocked.test(pathname)) return send(res,403,'Forbidden');
  let filename = resolve(ROOT, '.' + pathname);
  const rel = relative(ROOT, filename);
  if (rel === '..' || rel.startsWith('..' + sep) || filename === ROOT && pathname !== '/') return send(res,403,'Forbidden');
  try {
    let fileStat = await stat(filename);
    if (fileStat.isDirectory()) {
      filename = resolve(filename, 'index.html');
      fileStat = await stat(filename);
    }
    if (!fileStat.isFile()) throw new Error('Not a file');
    const mime = MIME[extname(filename).toLowerCase()];
    if (!mime) return send(res,403,'Unsupported asset type');
    res.writeHead(200,{
      'Content-Type':mime,
      'Content-Length':fileStat.size,
      'Cache-Control':'no-store',
      'X-Robots-Tag':'noindex, nofollow',
      'X-Content-Type-Options':'nosniff',
      'Referrer-Policy':'strict-origin-when-cross-origin',
    });
    if (req.method === 'HEAD') return res.end();
    createReadStream(filename).pipe(res);
  } catch {
    const notFound = resolve(ROOT,'404.html');
    if (pathname !== '/404.html') {
      try {
        const bodyStat = await stat(notFound);
        res.writeHead(404, {
          'Content-Type':'text/html; charset=utf-8',
          'Content-Length':bodyStat.size,
          'Cache-Control':'no-store',
          'X-Robots-Tag':'noindex, nofollow',
        });
        if(req.method === 'HEAD')return res.end();
        return createReadStream(notFound).pipe(res);
      } catch {}
    }
    return send(res,404,'Page not found');
  }
}).listen(PORT,'0.0.0.0',()=>console.log('Preview listening on http://0.0.0.0:' + PORT));
