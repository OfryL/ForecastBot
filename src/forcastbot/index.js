const config = require('config');
const logger = require('../logger/telegramLogger')('app_forcastbot');
const {
  getForcastCmd,
  subscribeCmd,
  subscriberListCmd,
  subscriberMulticastCmd,
} = require('../utils/consts');
const { startSubscriberForcastMulticastJob } = require('../utils/subscriberForcastMulticast');

const handleForcastReq = require('./handleForcastReq');
const handleSubscribeReq = require('./handleSubscribeReq');
const handleSubscribeListReq = require('./handleSubscribeListReq');
const handleSubscriberMulticastReq = require('./handleSubscriberMulticastReq');
const handleStartCmd = require('./handleStartCmd');

module.exports = (function () {
  // let bot;

  function registerCmd(botInstance, command, func) {
    botInstance.command(`/${command}`, (ctx) => func(ctx));
  }

  function registerManagerCmd(botInstance, command, func) {
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
  }

  function setupForcastBot(botInstance) {
    // bot = botInstance;
    logger.debug('seting up botInstance');

    botInstance.catch((err) => {
      logger.error(err.stack || `Ooops: ${err}`);
    });

    botInstance.start((ctx) => handleStartCmd(ctx));
    botInstance.telegram.getMe().then((me) => {
      // botInstance.options.username = me.username;
      // botUsername = me.username;
      logger.debug(`bot name: ${me.username}`);
      logger.log('Bot has started');
    }).catch((error) => {
      logger.error(error.stack || `#error getMe: ${error}`);
    });

    startSubscriberForcastMulticastJob(botInstance);

    registerCmd(botInstance, getForcastCmd, handleForcastReq);
    registerCmd(botInstance, subscribeCmd, handleSubscribeReq);

    registerManagerCmd(botInstance, subscriberListCmd, handleSubscribeListReq);
    registerManagerCmd(botInstance, subscriberMulticastCmd, handleSubscriberMulticastReq);
  }

  return {
    setupForcastBot,
  };
}());
