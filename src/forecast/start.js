const Composer = require('telegraf/composer');
const logger = require('../logger/telegramLogger')('app_forecast_handleStartCmd');
const { botUsername } = require('../utils/consts');

function start(ctx) {
  logger.log(`Start from user: ${ctx.message.from.first_name}(@${ctx.message.from.username})`);
  ctx.telegram.sendMessage(ctx.message.chat.id, ctx.i18n.t('botReplays.start'), { parse_mode: 'HTML' });
}

const bot = new Composer();

bot.start(start);
bot.command(`start@${botUsername}`, start);

module.exports = bot;
