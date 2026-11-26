/**
 * Zero-dependency local development and preview static HTTP server
 * Runs on http://localhost:3000 with explicit no-cache headers for CDN/Tunnel parity
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST;

export const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

/**
 * Prevent browser and Cloudflare Edge/Tunnel caching during local development
 * @param {import('node:http').ServerResponse} res
 */
export function applyNoCacheHeaders(res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('CDN-Cache-Control', 'no-store');
  res.setHeader('Cloudflare-CDN-Cache-Control', 'no-store');
}

/**
 * Create static file request handler rooted at rootDir
 * @param {string} [rootDir=process.cwd()]
 * @returns {(req: import('node:http').IncomingMessage, res: import('node:http').ServerResponse) => void}
 */
export function createStaticHandler(rootDir = process.cwd()) {
  const resolvedRoot = path.resolve(rootDir);

  return (req, res) => {
    let reqPath;
    try {
      reqPath = decodeURI((req.url || '/').split('?')[0].split('#')[0]);
    } catch {
      res.statusCode = 400;
      applyNoCacheHeaders(res);
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('400 Bad Request');
      return;
    }

    if (reqPath === '/' || reqPath === '') {
      reqPath = '/index.html';
    }

    const normalizedRel = reqPath.replace(/^\/+/, '');
    const filePath = path.resolve(resolvedRoot, normalizedRel);

    // Security check: ensure resolved path stays strictly within rootDir
    if (filePath !== resolvedRoot && !filePath.startsWith(resolvedRoot + path.sep)) {
      res.statusCode = 403;
      applyNoCacheHeaders(res);
      res.end('Access denied');
      return;
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.statusCode = 404;
        applyNoCacheHeaders(res);
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end(`404 Not Found: ${reqPath}`);
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.statusCode = 200;
      applyNoCacheHeaders(res);
      res.setHeader('Content-Type', contentType);
      fs.createReadStream(filePath).pipe(res);
    });
  };
}

const isDirectRun = Boolean(
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
);

if (isDirectRun) {
  const server = http.createServer(createStaticHandler(process.cwd()));
  const onListen = () => {
    console.log(`\n===============================================================`);
    console.log(`  PT. INDOGREEN TECHNOLOGY AND MANAGEMENT`);
    console.log(`  Kalkulator Energi Surya Interaktif`);
    console.log(`===============================================================`);
    console.log(`  > Server lokal aktif di: http://localhost:${PORT}`);
    console.log(`  > Buka tautan di atas pada browser untuk melihat kalkulator.`);
    console.log(`  > Cache-Control: no-store (sinkron real-time dengan Cloudflare Tunnel)`);
    console.log(`  > Tekan Ctrl+C untuk menghentikan server.\n`);
  };

  if (HOST) {
    server.listen(PORT, HOST, onListen);
  } else {
    server.listen(PORT, onListen);
  }
}
