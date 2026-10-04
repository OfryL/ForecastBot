const logger = require('../../logger/telegramLogger')('app_forecast_handleSendForecastNowReq');
const { subscriberForecastMulticast } = require('../../utils/subscriberForecastMulticast');

/** /sendForecastNow - run the daily forecast broadcast immediately. */
async function handleSendForecastNowReq(ctx) {
  logger.log('manual forecast broadcast requested');
  await ctx.reply('Sending forecast to all subscribers...');
  const { sent, failed } = await subscriberForecastMulticast(ctx.telegram);
  await ctx.reply(`Forecast broadcast done: ${sent} sent, ${failed} failed.`);
}

module.exports = handleSendForecastNowReq;
