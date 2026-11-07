// Bot de Telegram "Alfa" - modo polling, listo para Render (worker 24/7)
const TelegramBot = require('node-telegram-bot-api');

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

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isAuthorized(userId)) {
    bot.sendMessage(chatId, '🚫 No tienes autorización para usar este bot.');
    return;
  }

  bot.sendMessage(
    chatId,
    '🤖 Hola, soy Alfa. Estoy activo 24/7 y listo para ayudarte.\n\nEscribe cualquier mensaje y te responderé.'
  );
});

bot.on('message', (msg) => {
  if (!msg.text || msg.text.startsWith('/start')) return;

  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isAuthorized(userId)) {
    bot.sendMessage(chatId, '🚫 No tienes autorización para usar este bot.');
    return;
  }

  // Lógica de respuesta base (personalizable)
  bot.sendMessage(chatId, `Recibido: "${msg.text}"`);
});

console.log('Alfa bot iniciado en modo polling...');
