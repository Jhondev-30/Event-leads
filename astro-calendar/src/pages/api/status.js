export const prerender = false;

// Fallback in-memory store for dev or when KV is not yet bound
let inMemoryStore = {};

function getKV(env) {
  if (!env) return null;
  return env.STATUS || env.STATUS_STORE || null;
}

async function getStore(env) {
  const kv = getKV(env);
  if (kv) {
    try {
      const data = await kv.get('lead_status_store', 'json');
      if (data && typeof data === 'object') {
        return data;
      }
    } catch (e) {
      console.error('Error reading from Cloudflare KV:', e);
    }
  }
  return inMemoryStore;
}

async function saveStore(env, data) {
  inMemoryStore = data;
  const kv = getKV(env);
  if (kv) {
    try {
      await kv.put('lead_status_store', JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Error saving to Cloudflare KV:', e);
      return false;
    }
  }
  return true;
}

export async function GET(context) {
  const env = context.locals?.runtime?.env || process.env;
  const store = await getStore(env);

  return new Response(JSON.stringify({ ok: true, store }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

export async function POST(context) {
  try {
    const payload = await context.request.json();
    const { leadId, status, agentName, note } = payload;

    if (!leadId) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing leadId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const env = context.locals?.runtime?.env || process.env;
    const store = await getStore(env);
    
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
    await saveStore(env, store);

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
