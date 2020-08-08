const logger = require('../logger/telegramLogger')('app_forecast_handleStartCmd');

const { START_MSG } = require('../utils/consts');

function handleStartCmd(ctx) {
  logger.log(`Start from user: ${ctx.message.from.first_name}(@${ctx.message.from.username})`);
  ctx.telegram.sendMessage(ctx.message.chat.id, START_MSG, { parse_mode: 'HTML' });
}

module.exports = handleStartCmd;
