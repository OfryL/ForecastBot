const { session } = require('telegraf');

const logger = require('../logger/telegramLogger')('app_initMw');

const errorHandlerMiddleware = require('./errorHandler/errorHandlerMiddleware');
const serverToolsWare = require('./serverToolsWare');
const trackActivityMiddleware = require('./trackActivityMiddleware');
const antiFloodMiddleware = require('./antiFloodMiddleware');
const authenticationMw = require('./authenticationMw');
const i18langPatchMw = require('./i18langPatchMw');
const i18Mw = require('./i18Mw');
const metadataMw = require('./metadataMw');

const useAll = (bot) => {
  logger.debug('init mw');
  bot.use(errorHandlerMiddleware);
  bot.use(session());
  bot.use(i18langPatchMw);
  bot.use(i18Mw.middleware);

  bot.use(antiFloodMiddleware);
  bot.use(trackActivityMiddleware);

  bot.use(serverToolsWare);
};

module.exports = {
  useAll,
  errorHandlerMiddleware,
  serverToolsWare,
  trackActivityMiddleware,
  antiFloodMiddleware,
  authenticationMw,
  i18langPatchMw,
  i18Mw,
  session,
  metadataMw,
};
