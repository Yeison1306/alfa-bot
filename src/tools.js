// Herramientas (tools) que el agente Alfa puede invocar.
// Diseño deliberado: solo acciones SEGURAS, de solo lectura/almacenamiento local o búsqueda web.
// NO se expone ejecución de shell/código arbitrario ni auto-modificación del propio bot:
// un agente con esa capacidad, accesible por Telegram, sería un vector de ataque crítico.

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const MEMORY_FILE = path.join(DATA_DIR, 'memory.json');
const PENDING_TOOLS_FILE = path.join(DATA_DIR, 'pending_tools.json');

function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(MEMORY_FILE)) fs.writeFileSync(MEMORY_FILE, '{}');
  if (!fs.existsSync(PENDING_TOOLS_FILE)) fs.writeFileSync(PENDING_TOOLS_FILE, '[]');
}
ensureDataFiles();

function readJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return file === MEMORY_FILE ? {} : [];
  }
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// --- Memoria persistente simple por usuario ---
// NOTA: en el plan free de Render el disco es efímero (se borra en cada redeploy).
// Para memoria duradera a largo plazo habría que sumar una base de datos externa
// (ej. Render Postgres free o Upstash Redis free) — mejora recomendada a futuro.
function saveMemory({ userId, key, value }) {
  const mem = readJSON(MEMORY_FILE);
  if (!mem[userId]) mem[userId] = {};
  mem[userId][key] = value;
  writeJSON(MEMORY_FILE, mem);
  return `Guardado: ${key} = ${value}`;
}

function recallMemory({ userId, key }) {
  const mem = readJSON(MEMORY_FILE);
  const userMem = mem[userId] || {};
  if (key) return userMem[key] ?? 'No tengo ese dato guardado.';
  return JSON.stringify(userMem);
}

// --- Búsqueda web en tiempo real (Tavily, tiene plan gratuito) ---
async function webSearch({ query }) {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    return 'Búsqueda web no disponible: falta configurar TAVILY_API_KEY.';
  }
  try {
    const resp = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey, query, max_results: 5 }),
    });
    if (!resp.ok) return `Error en la búsqueda web (HTTP ${resp.status}).`;
    const data = await resp.json();
    const results = (data.results || []).map((r) => ({
      title: r.title,
      url: r.url,
      content: r.content,
    }));
    return JSON.stringify(results);
  } catch (err) {
    return `Error ejecutando la búsqueda web: ${err.message}`;
  }
}

// --- Propuesta de nuevas herramientas/habilidades ---
// El agente puede detectar que necesita una capacidad nueva y REGISTRARLA para
// revisión humana. Nunca se auto-implementa ni se auto-despliega: eso requiere
// siempre que Yeison apruebe y pase por el flujo normal de GitHub -> Render.
function proposeTool({ name, description, justification }) {
  const pending = readJSON(PENDING_TOOLS_FILE);
  pending.push({
    name,
    description,
    justification: justification || '',
    date: new Date().toISOString(),
  });
  writeJSON(PENDING_TOOLS_FILE, pending);
  return `Propuesta registrada: "${name}". Quedará pendiente de revisión humana antes de implementarse.`;
}

function getCurrentDateTime() {
  return new Date().toString();
}

module.exports = {
  ensureDataFiles,
  saveMemory,
  recallMemory,
  webSearch,
  proposeTool,
  getCurrentDateTime,
  PENDING_TOOLS_FILE,
};
