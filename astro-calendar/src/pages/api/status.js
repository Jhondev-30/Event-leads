import fs from 'node:fs';
import path from 'node:path';

export const prerender = false;

// Store status-store.json in data directory or root
const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const STATUS_FILE = path.join(DATA_DIR, 'status-store.json');

// Initialize if absent
if (!fs.existsSync(STATUS_FILE)) {
  fs.writeFileSync(STATUS_FILE, JSON.stringify({}, null, 2), 'utf8');
}

function getStore() {
  try {
    const raw = fs.readFileSync(STATUS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

function saveStore(data) {
  try {
    fs.writeFileSync(STATUS_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('Failed to write status store:', e);
    return false;
  }
}

export async function GET({ request }) {
  const store = getStore();
  return new Response(JSON.stringify({ ok: true, store }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

export async function POST({ request }) {
  try {
    const payload = await request.json();
    const { leadId, status, agentName, note } = payload;

    if (!leadId) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing leadId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const store = getStore();
    const current = store[leadId] || {
      status: 'pending',
      history: []
    };

    if (status) {
      current.status = status;
    }

    if (!current.history) current.history = [];

    const author = agentName || current.lastAgent || 'Equipo';

    if (note || status) {
      current.history.push({
        timestamp: new Date().toISOString(),
        agentName: author,
        status: status || current.status,
        note: note || (status ? `Estado cambiado a ${status}` : '')
      });
    }

    current.lastUpdated = new Date().toISOString();
    current.lastAgent = author;

    store[leadId] = current;
    saveStore(store);

    return new Response(JSON.stringify({ ok: true, leadData: current, store }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
