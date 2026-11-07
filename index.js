const TelegramBot = require('node-telegram-bot-api');
const http = require('http');

const token = process.env.TELEGRAM_BOT_TOKEN;
const accessUsers = process.env.ACCESS_USERS 
  ? process.env.ACCESS_USERS.split(',').map(id => id.trim()) 
  : [];

if (!token) {
  console.error('Error: TELEGRAM_BOT_TOKEN no está configurado.');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

// Servidor HTTP básico para satisfacer el requisito de tipo 'web' en Render
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Alfa Bot is running!\n');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor HTTP escuchando en el puerto ${PORT}`);
});

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id.toString();
  
  if (accessUsers.length > 0 && !accessUsers.includes(chatId)) {
    bot.sendMessage(chatId, '⛔ No tienes autorización para usar este bot.');
    return;
  }
  
  bot.sendMessage(chatId, '🤖 Hola, soy Alfa. ¡Estoy operativo 24/7 en Render!');
});

console.log('Bot Alfa iniciado correctamente...');
