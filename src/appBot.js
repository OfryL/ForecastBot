const logger = require('./logger/telegramLogger')('bot');

const { useAll: useAllMw } = require('./middleware');
const Bot = require('./bot');
const forecastBot = require('./forecast');

const initBot = () => {
  logger.debug('connecting telegram api');
  const bot = Bot();
  useAllMw(bot);
  bot.use(forecastBot);

  bot.catch((err) => {
    logger.error(err.stack || `Ooops: ${err}`);
  });

  return bot;
};

module.exports = initBot();
