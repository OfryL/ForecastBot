const logger = require('./logger/telegramLogger')('bot');
const { useAll: useAllMw } = require('./middleware');
const Bot = require('./bot');
const forecastBot = require('./forecast');

const initBot = () => {
  const bot = Bot();
  useAllMw(bot);
  bot.use(forecastBot);

  bot.catch((err, ctx) => {
    const where = ctx && ctx.updateType ? ` (${ctx.updateType})` : '';
    logger.error(err.stack || `Ooops${where}: ${err}`);
  });

  return bot;
};

module.exports = initBot();
