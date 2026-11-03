import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const STATUS_FILE = path.join(__dirname, 'status-store.json');

// Initialize status store if it doesn't exist
if (!fs.existsSync(STATUS_FILE)) {
  fs.writeFileSync(STATUS_FILE, JSON.stringify({}, null, 2), 'utf8');
}

function loadStatusStore() {
  try {
    const raw = fs.readFileSync(STATUS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return {};
  }
}

function saveStatusStore(data) {
  try {
    fs.writeFileSync(STATUS_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving status store:', err);
    return false;
  }
}

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.csv': 'text/csv',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  // CORS Headers for VPS / multi-client access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;

  // API ROUTE: GET /api/status
  if (req.method === 'GET' && pathname === '/api/status') {
    const store = loadStatusStore();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, store }));
    return;
  }

  // API ROUTE: POST /api/status (Save status, notes, agent assignment)
  if (req.method === 'POST' && pathname === '/api/status') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const { leadId, status, agentName, note } = payload;

        if (!leadId) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: 'Missing leadId' }));
          return;
        }

        const store = loadStatusStore();
        const current = store[leadId] || {
          status: 'pending',
          history: []
        };

        if (status) {
          current.status = status;
        }

        if (!current.history) current.history = [];

        // If note or status change is present, log to history
        if (note || status) {
          current.history.push({
            timestamp: new Date().toISOString(),
            agentName: agentName || 'Agente',
            status: status || current.status,
            note: note || (status ? `Estado cambiado a ${status}` : '')
          });
        }

        current.lastUpdated = new Date().toISOString();
        current.lastAgent = agentName || current.lastAgent || 'Equipo';

        store[leadId] = current;
        saveStatusStore(store);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, leadData: current, store }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });
    return;
  }

  // STATIC FILE SERVING
  let reqPath = decodeURI(pathname);
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  const filePath = path.join(__dirname, reqPath);

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  try {
    const data = fs.readFileSync(filePath);
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });
    res.end(data);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Server Error: ' + err.message);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`🚀 SpeakUp Lead Command Center (Multi-User API Enabled)`);
  console.log(`🔗 Local URL: http://localhost:${PORT}`);
  console.log(`📡 Ready for VPS & Multi-Agent Collaboration`);
  console.log(`======================================================\n`);
});
