const Telegraf = require('telegraf');
const { token } = require('./utils/botToken');

const Bot = () => {
  const bot = new Telegraf(token);
  if (process.env.NODE_ENV === 'development') {
    // Skip the backlog of updates that piled up while the dev bot was down.
    bot.polling.offset = -1;
  }
  return bot;
};

module.exports = Bot;
