const config = require('config');
const logger = require('../logger/telegramLogger')('app_authenticationMw');

module.exports = async (ctx, next) => {
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
