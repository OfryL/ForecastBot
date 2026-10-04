const config = require('config');
const logger = require('../logger/telegramLogger')('app_authenticationMw');

const managerUsername = () => config.get('telegramBot.managerUsername');

/** Only the configured manager may run admin commands. */
module.exports = async (ctx, next) => {
  const username = ctx.from && ctx.from.username;
  const manager = managerUsername();
  if (!manager || !username || username.toLowerCase() !== manager.toLowerCase()) {
    logger.warn(`Unauthorized admin command from @${username} (${ctx.from && ctx.from.id})`);
    await ctx.reply('Unauthorized');
    return;
  }
  await next();
};
