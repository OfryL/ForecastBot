/* eslint-disable no-underscore-dangle */
const logger = require('../logger/telegramLogger')('app_i18langPatchMw');

module.exports = async (ctx, next) => {
  if (ctx.session) {
    if (!ctx.session.__language_code) {
      logger.debug('patching i18');
      ctx.session.__language_code = 'he';
      // todo get per user from db
    }
  }
  next(ctx);
};
