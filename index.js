// Bot de Telegram "Alfa" - agente con IA (OpenAI + tools), listo para Render (web service 24/7)
const http = require('http');
const TelegramBot = require('node-telegram-bot-api');
const agent = require('./src/agent');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ACCESS_USERS = (process.env.ACCESS_USERS || '')
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean);

if (!TOKEN) {
  console.error('ERROR: Falta la variable de entorno TELEGRAM_BOT_TOKEN');
  process.exit(1);
}

const bot = new TelegramBot(TOKEN, { polling: true });

function isAuthorized(userId) {
  // Si ACCESS_USERS está vacío, el bot queda abierto a cualquiera (no recomendado en prod)
  if (ACCESS_USERS.length === 0) return true;
  return ACCESS_USERS.includes(String(userId));
}

bot.on('polling_error', (err) => {
  console.error('Polling error:', err.message);
});

bot.onText(/^\/start$/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isAuthorized(userId)) {
    bot.sendMessage(chatId, '🚫 No tienes autorización para usar este bot.');
    return;
  }

  bot.sendMessage(
    chatId,
    '🤖 Hola, soy Alfa. Experto en ciberseguridad, sistemas y software, con memoria y búsqueda web en tiempo real.\n\nEscríbeme cualquier cosa y te ayudaré.'
  );
});

bot.on('message', async (msg) => {
  if (!msg.text || msg.text.startsWith('/start')) return;

  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isAuthorized(userId)) {
    bot.sendMessage(chatId, '🚫 No tienes autorización para usar este bot.');
    return;
  }

  bot.sendChatAction(chatId, 'typing');

  try {
    const reply = await agent.handleMessage({ chatId, userId, text: msg.text });
    bot.sendMessage(chatId, reply || 'No obtuve respuesta, intenta de nuevo.');
  } catch (err) {
    console.error('Error en agent.handleMessage:', err);
    bot.sendMessage(chatId, '⚠️ Ocurrió un error procesando tu mensaje. Intenta de nuevo en un momento.');
  }
});

console.log('Alfa bot iniciado en modo polling...');

// Render (tipo "web") exige un puerto HTTP abierto para considerar el deploy saludable.
// También sirve para que un servicio externo (UptimeRobot/cron-job.org) lo "pingee"
// y evite que el plan free lo ponga a dormir por inactividad.
const PORT = process.env.PORT || 10000;
http
  .createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Alfa bot activo (OK)');
  })
  .listen(PORT, () => {
    console.log(`Health check HTTP escuchando en el puerto ${PORT}`);
  });
