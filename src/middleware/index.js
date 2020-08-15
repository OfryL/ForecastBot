const { session } = require('telegraf');

const errorHandlerMiddleware = require('./errorHandler/errorHandlerMiddleware');
const serverToolsWare = require('./serverToolsWare');
const trackActivityMiddleware = require('./trackActivityMiddleware');
const antiFloodMiddleware = require('./antiFloodMiddleware');
const authenticationMw = require('./authenticationMw');
const i18langPatchMw = require('./i18langPatchMw');
const i18Mw = require('./i18Mw');
const metadataMw = require('./metadataMw');

const useAll = (bot) => {
  bot.use(session());
  bot.use(i18langPatchMw);
  bot.use(i18Mw.middleware);

  // bot.use(antiFloodMiddleware);
  // bot.use(trackActivityMiddleware);
  bot.use(metadataMw);

  bot.use(serverToolsWare);
  bot.use(errorHandlerMiddleware);

  bot.use(errorHandlerMiddleware);
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
};
