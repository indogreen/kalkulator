/**
 * Zero-dependency local development and preview static HTTP server
 * Runs with explicit no-cache headers for CDN/Tunnel parity
 */
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Load environment variables from .env file if available
 * @param {string} [filePath='.env']
 */
export function loadEnv(filePath = '.env') {
  if (typeof process.loadEnvFile === 'function') {
    try {
      process.loadEnvFile(filePath);
      return;
    } catch {}
  }
  try {
    const fullPath = path.resolve(filePath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const k = trimmed.slice(0, eqIdx).trim();
          let v = trimmed.slice(eqIdx + 1).trim();
          if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
            v = v.slice(1, -1);
          }
          if (process.env[k] === undefined) process.env[k] = v;
        }
      }
    }
  } catch {}
}

loadEnv();

export const PORT = process.env.PORT || 5500;
export const HOST = process.env.HOST || '0.0.0.0';

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

/**
 * Detect active IPv4 addresses on non-internal network interfaces
 * @returns {string[]}
 */
export function getLocalIpv4Addresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  return addresses;
}

/**
 * Parse port from CLI arguments or environment variables
 * Supports:
 * - --port=4400 or --port 4400
 * - -p=4400 or -p 4400
 * - positional number: 4400
 * - PORT env var: PORT=4400
 * @param {string[]} [args=process.argv.slice(2)]
 * @param {Record<string, string|undefined>} [env=process.env]
 * @returns {number}
 */
export function parsePort(args = process.argv.slice(2), env = process.env) {
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--port=')) {
      const p = parseInt(arg.split('=')[1], 10);
      if (!isNaN(p) && p > 0 && p <= 65535) return p;
    }
    if (arg === '--port' || arg === '-p') {
      const next = args[i + 1];
      const p = parseInt(next, 10);
      if (!isNaN(p) && p > 0 && p <= 65535) return p;
    }
    if (arg.startsWith('-p=')) {
      const p = parseInt(arg.split('=')[1], 10);
      if (!isNaN(p) && p > 0 && p <= 65535) return p;
    }
    if (/^\d+$/.test(arg)) {
      const p = parseInt(arg, 10);
      if (!isNaN(p) && p > 0 && p <= 65535) return p;
    }
  }

  if (env.PORT) {
    const p = parseInt(env.PORT, 10);
    if (!isNaN(p) && p > 0 && p <= 65535) return p;
  }
  if (env.npm_config_port) {
    const p = parseInt(env.npm_config_port, 10);
    if (!isNaN(p) && p > 0 && p <= 65535) return p;
  }

  return 5500;
}

const isDirectRun = Boolean(
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
);

if (isDirectRun) {
  const activePort = parsePort();
  const server = http.createServer(createStaticHandler(process.cwd()));
  const onListen = () => {
    const localIps = getLocalIpv4Addresses();
    console.log(`\n===============================================================`);
    console.log(`  PT. INDOGREEN TECHNOLOGY AND MANAGEMENT`);
    console.log(`  Kalkulator Energi Surya Interaktif`);
    console.log(`===============================================================`);
    console.log(`  ➜  Local:   http://localhost:${activePort}`);
    if (localIps.length > 0) {
      localIps.forEach(ip => {
        console.log(`  ➜  Network: http://${ip}:${activePort}`);
      });
    } else {
      console.log(`  ➜  Network: (Tidak ada antarmuka jaringan aktif)`);
    }
    console.log(`===============================================================`);
    console.log(`  > Buka tautan Network pada HP/tablet di jaringan Wi-Fi yang sama.`);
    console.log(`  > Cache-Control: no-store (sinkron real-time dengan Cloudflare Tunnel)`);
    console.log(`  > Tekan Ctrl+C untuk menghentikan server.\n`);
  };

  server.listen(activePort, HOST, onListen);
}
