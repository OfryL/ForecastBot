const chatPrefsDao = require('../dao/chatPrefsDao');
const logger = require('../logger/telegramLogger')('app_i18langPatchMw');
const { DEFAULT_LANG } = require('../utils/consts');

/**
 * Seeds the session language (read by telegraf-i18n) from the chat's
 * persisted preference, falling back to the default language.
 */
module.exports = async (ctx, next) => {
  // eslint-disable-next-line no-underscore-dangle
  if (ctx.session && !ctx.session.__language_code) {
    let lang = null;
    if (ctx.chat) {
      try {
        lang = await chatPrefsDao.getLang(ctx.chat.id);
      } catch (err) {
        logger.error(err.stack || `failed loading lang for chat ${ctx.chat.id} - ${err}`);
      }
    }
    // eslint-disable-next-line no-underscore-dangle
    ctx.session.__language_code = lang || DEFAULT_LANG;
  }
  return next();
};
