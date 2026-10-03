const { session } = require('telegraf');

const errorHandlerMiddleware = require('./errorHandler/errorHandlerMiddleware');
const trackActivityMiddleware = require('./trackActivityMiddleware');
const antiFloodMiddleware = require('./antiFloodMiddleware');
const authenticationMw = require('./authenticationMw');
const i18langPatchMw = require('./i18langPatchMw');
const i18Mw = require('./i18Mw');

const useAll = (bot) => {
  bot.use(errorHandlerMiddleware);
  bot.use(session());
  bot.use(i18langPatchMw);
  bot.use(i18Mw.middleware);
  bot.use(antiFloodMiddleware);
  bot.use(trackActivityMiddleware);
};

module.exports = {
  useAll,
  errorHandlerMiddleware,
  trackActivityMiddleware,
  antiFloodMiddleware,
  authenticationMw,
  i18langPatchMw,
  i18Mw,
  session,
};
