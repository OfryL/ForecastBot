const config = require('config');
const logger = require('../logger/telegramLogger')('app_forecast');
const {
  getForecastCmd,
  subscribeCmd,
  subscriberListCmd,
  subscriberMulticastCmd,
  getDbFile,
} = require('../utils/consts');
const { initMetadata } = require('../utils/botMetadata');
const { startSubscriberForecastMulticastJob } = require('../utils/subscriberForecastMulticast');

const handleForecastReq = require('./handleForecastReq');
const handleSubscribeReq = require('./handleSubscribeReq');
const handleSubscribeListReq = require('./handleSubscribeListReq');
const handleSubscriberMulticastReq = require('./handleSubscriberMulticastReq');
const handleStartCmd = require('./handleStartCmd');
const handleGetDbFileReq = require('./handleGetDbFileReq');

const registerCmd = (botInstance, command, func) => {
  botInstance.command(`/${command}`, (ctx) => func(ctx));
};

const registerManagerCmd = (botInstance, command, func) => {
  const authUser = (ctx, next) => {
    const user = {
      username: ctx.message.from.username,
    };
    if (user.username !== config.get('telegramBot.managerUsername')) {
      logger.debug(`Unauthorize: ${user.username}`);
      logger.warn(`Unauthorize: ${user.username}`);
      ctx.reply('Unauthorize');
    } else {
      next(ctx);
    }
  };

  registerCmd(botInstance, command, (ctx) => authUser(ctx, func));
};

const setupForecast = async (botInstance) => {
  logger.debug('seting up botInstance');

  botInstance.catch((err) => {
    logger.error(err.stack || `Ooops: ${err}`);
  });

  // eslint-disable-next-line no-param-reassign
  botInstance.context.metadata = await initMetadata(botInstance);

  botInstance.start((ctx) => handleStartCmd(ctx));

  startSubscriberForecastMulticastJob(botInstance);

  registerCmd(botInstance, getForecastCmd, handleForecastReq);
  registerCmd(botInstance, subscribeCmd, handleSubscribeReq);

  registerManagerCmd(botInstance, subscriberListCmd, handleSubscribeListReq);
  registerManagerCmd(botInstance, subscriberMulticastCmd, handleSubscriberMulticastReq);
  registerManagerCmd(botInstance, getDbFile, handleGetDbFileReq);

  logger.log('seting up botInstance finish');
};

module.exports = {
  setupForecast,
};
