const logger = require('../logger/telegramLogger')('app_forecast_handleStartCmd');

function handleStartCmd(ctx) {
  logger.log(`Start from user: ${ctx.message.from.first_name}(@${ctx.message.from.username})`);
  ctx.telegram.sendMessage(ctx.message.chat.id, ctx.i18n.t('botReplays.start'), { parse_mode: 'HTML' });
}

module.exports = handleStartCmd;
