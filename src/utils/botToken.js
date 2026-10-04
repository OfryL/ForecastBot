const config = require('config');

const token = config.has('telegramBot.token') ? config.get('telegramBot.token') : '';

if (!token) {
  throw new Error(
    'Telegram bot token is missing. Set TELEGRAM_BOT_TOKEN or telegramBot.token in config/local.json',
  );
}

module.exports = { token };
