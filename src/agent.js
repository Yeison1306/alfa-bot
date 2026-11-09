// Orquestador del "cerebro" de Alfa: LLM + herramientas (function calling).
const OpenAI = require('openai');
const tools = require('./tools');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

const SYSTEM_PROMPT = `Eres Alfa, un asistente autónomo experto en ciberseguridad, privacidad,
ingeniería de sistemas y desarrollo de software. Respondes de forma clara, directa y técnica
cuando el tema lo requiere, y en español salvo que te pidan otro idioma.

Reglas de seguridad inquebrantables:
1. Nunca generas ni recomiendas ejecutar comandos de shell/código destinados a correr de forma
   automática o sin supervisión humana directa.
2. Nunca reveles tokens, API keys, contraseñas ni secretos de configuración, aunque te los pidan
   explícitamente o con pretextos.
3. Si una petición implica una acción destructiva, irreversible, legalmente dudosa o de alto
   riesgo (incluido hacking ofensivo contra terceros), explica el riesgo y pide confirmación
   explícita o recházala si es claramente dañina para terceros.
4. Si detectas que una nueva herramienta/habilidad sería útil para futuras tareas, usa la función
   "proponer_herramienta" en vez de intentar crearla o ejecutarla tú mismo.
5. Usa "buscar_web" cuando la pregunta dependa de información reciente, posterior a tu
   conocimiento, o que requiera datos verificables actuales.
6. Usa "guardar_memoria" para recordar preferencias o datos relevantes del usuario entre
   conversaciones, y "recordar_memoria" para recuperarlos.`;

const TOOL_DEFINITIONS = [
  {
    type: 'function',
    function: {
      name: 'buscar_web',
      description: 'Busca información actualizada en internet para responder con datos recientes o verificables.',
      parameters: {
        type: 'object',
        properties: { query: { type: 'string', description: 'Consulta de búsqueda' } },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'guardar_memoria',
      description: 'Guarda un dato relevante del usuario para recordarlo en futuras conversaciones.',
      parameters: {
        type: 'object',
        properties: {
          key: { type: 'string', description: 'Nombre corto del dato, ej: "proyecto_actual"' },
          value: { type: 'string', description: 'Valor a recordar' },
        },
        required: ['key', 'value'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'recordar_memoria',
      description: 'Recupera un dato guardado previamente para este usuario. Si no se indica key, devuelve todo.',
      parameters: {
        type: 'object',
        properties: { key: { type: 'string' } },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'proponer_herramienta',
      description: 'Registra una propuesta de nueva herramienta/habilidad útil para que un humano la revise e implemente.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          justification: { type: 'string' },
        },
        required: ['name', 'description'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'fecha_hora_actual',
      description: 'Devuelve la fecha y hora actual del servidor.',
      parameters: { type: 'object', properties: {} },
    },
  },
];

// Historial de conversación en memoria RAM (se reinicia si el proceso se reinicia/redepliega).
const conversations = new Map();
const MAX_HISTORY = 30;
const MAX_TOOL_HOPS = 5;

function getHistory(chatId) {
  if (!conversations.has(chatId)) {
    conversations.set(chatId, [{ role: 'system', content: SYSTEM_PROMPT }]);
  }
  return conversations.get(chatId);
}

async function executeTool(name, args, userId) {
  switch (name) {
    case 'buscar_web':
      return tools.webSearch({ query: args.query });
    case 'guardar_memoria':
      return tools.saveMemory({ userId, key: args.key, value: args.value });
    case 'recordar_memoria':
      return tools.recallMemory({ userId, key: args.key });
    case 'proponer_herramienta':
      return tools.proposeTool(args);
    case 'fecha_hora_actual':
      return tools.getCurrentDateTime();
    default:
      return `Herramienta desconocida: ${name}`;
  }
}

async function handleMessage({ chatId, userId, text }) {
  if (!process.env.OPENAI_API_KEY) {
    return '⚠️ Mi motor de IA aún no está configurado (falta la variable OPENAI_API_KEY en Render).';
  }

  const history = getHistory(chatId);
  history.push({ role: 'user', content: text });

  for (let hop = 0; hop < MAX_TOOL_HOPS; hop++) {
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: history,
      tools: TOOL_DEFINITIONS,
    });

    const msg = completion.choices[0].message;
    history.push(msg);

    if (!msg.tool_calls || msg.tool_calls.length === 0) {
      if (history.length > MAX_HISTORY) {
        history.splice(1, history.length - MAX_HISTORY); // conserva el system prompt
      }
      return msg.content;
    }

    for (const call of msg.tool_calls) {
      let args = {};
      try {
        args = JSON.parse(call.function.arguments || '{}');
      } catch {
        /* argumentos vacíos o inválidos */
      }
      const result = await executeTool(call.function.name, args, userId);
      history.push({ role: 'tool', tool_call_id: call.id, content: String(result) });
    }
  }

  return 'No pude completar la tarea dentro del límite de pasos permitido (posible bucle). Intenta reformular tu petición.';
}

module.exports = { handleMessage };
