const path = require('path');
const TelegrafI18n = require('telegraf-i18n');
const { session } = require('telegraf');

const errorHandlerMiddleware = require('./errorHandler/errorHandlerMiddleware');
const serverToolsWare = require('./serverToolsWare');
const trackActivityMiddleware = require('./trackActivityMiddleware');
const antiFloodMiddleware = require('./antiFloodMiddleware');
const authenticationMw = require('./authenticationMw');
const i18langPatchMw = require('./i18langPatchMw');

const useAll = (bot) => {
  const i18n = new TelegrafI18n({
    useSession: true,
    directory: path.resolve(process.cwd(), 'src', 'locales'),
  });

  bot.use(session());
  bot.use(i18langPatchMw);
  bot.use(i18n.middleware());

  // bot.use(antiFloodMiddleware);
  // bot.use(trackActivityMiddleware);
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
};
