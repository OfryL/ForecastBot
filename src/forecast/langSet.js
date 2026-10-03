const Composer = require('telegraf/composer');
const { langEnCmd, langHeCmd } = require('../utils/consts');
const chatPrefsDao = require('../dao/chatPrefsDao');
const subscribeDao = require('../dao/subscribeDao');
const logger = require('../logger/telegramLogger')('app_forecast_langSet');

const setLang = (lang) => async (ctx) => {
  ctx.i18n.locale(lang);
  if (ctx.session) {
    // eslint-disable-next-line no-underscore-dangle
    ctx.session.__language_code = lang;
  }
  try {
    await chatPrefsDao.setLang(ctx.chat.id, lang);
    await subscribeDao.updateSubscriber(ctx.chat.id, { lang });
  } catch (err) {
    logger.error(err.stack || `failed persisting lang for chat ${ctx.chat.id} - ${err}`);
  }
  await ctx.reply(ctx.i18n.t('botReplays.langChanged'));
};

const bot = new Composer();
bot.command(langHeCmd, setLang('he'));
bot.command(langEnCmd, setLang('en'));

module.exports = bot;
