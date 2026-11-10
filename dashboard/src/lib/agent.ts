// Agent core logic - shared with the Telegram bot
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
4. Usa "buscar_web" cuando la pregunta dependa de información reciente, posterior a tu
   conocimiento, o que requiera datos verificables actuales.`;

const TOOL_DEFINITIONS = [
  {
    type: 'function' as const,
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
    type: 'function' as const,
    function: {
      name: 'fecha_hora_actual',
      description: 'Devuelve la fecha y hora actual del servidor.',
      parameters: { type: 'object', properties: {} },
    },
  },
];

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_call_id?: string;
  tool_calls?: any[];
}

export async function handleAgentMessage(
  messages: ChatMessage[],
  userId: string
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    return '⚠️ Motor de IA no configurado (falta OPENAI_API_KEY).';
  }

  const history: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages,
  ];

  const MAX_TOOL_HOPS = 5;

  for (let hop = 0; hop < MAX_TOOL_HOPS; hop++) {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: history as any,
      tools: TOOL_DEFINITIONS,
    });

    const msg = completion.choices[0].message;
    history.push(msg as any);

    if (!msg.tool_calls || msg.tool_calls.length === 0) {
      return msg.content || 'Sin respuesta.';
    }

    for (const call of msg.tool_calls) {
      let args = {};
      try {
        args = JSON.parse(call.function.arguments || '{}');
      } catch {
        // empty
      }
      let result = '';
      switch (call.function.name) {
        case 'buscar_web':
          result = await webSearch(args.query as string);
          break;
        case 'fecha_hora_actual':
          result = new Date().toISOString();
          break;
        default:
          result = `Herramienta desconocida: ${call.function.name}`;
      }
      history.push({
        role: 'tool',
        tool_call_id: call.id,
        content: String(result),
      });
    }
  }

  return 'Límite de pasos alcanzado. Intenta reformular tu petición.';
}

async function webSearch(query: string): Promise<string> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    return 'Búsqueda web no disponible: falta TAVILY_API_KEY.';
  }
  try {
    const resp = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey, query, max_results: 5 }),
    });
    if (!resp.ok) return `Error en búsqueda web (HTTP ${resp.status}).`;
    const data = await resp.json();
    const results = (data.results || []).map((r: any) => ({
      title: r.title,
      url: r.url,
      content: r.content,
    }));
    return JSON.stringify(results);
  } catch (err: any) {
    return `Error en búsqueda web: ${err.message}`;
  }
}