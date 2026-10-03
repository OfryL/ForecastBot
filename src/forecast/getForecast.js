const Composer = require('telegraf/composer');
const logger = require('../logger/telegramLogger')('app_forecast_getForecast');
const openMeteo = require('../services/openMeteo');
const { formatForecast } = require('./formatForecast');
const { spots, spotKeys, getSpotFromCommand } = require('../utils/spots');
const { getForecastCmd, subscribeCmd, spotsCmd } = require('../utils/consts');
const { getChatDesc } = require('../utils/chatRepo');
const showChatAction = require('../utils/chatAction');

const t = (ctx) => (key, data) => ctx.i18n.t(key, data);

async function replyWithForecast(ctx, spot) {
  logger.log(`forecast ${spot.key} for ${getChatDesc(ctx)}`);
  const { stop } = await showChatAction(ctx, 'typing');
  try {
    const forecast = await openMeteo.getForecast(spot);
    const text = formatForecast(forecast, spot, t(ctx), { locale: ctx.i18n.locale() });
    const hint = ctx.i18n.t('botReplays.forecastReq.hint', { subscribeCmd, spotsCmd });
    await ctx.replyWithHTML(`${text}\n\n${hint}`, { disable_web_page_preview: true });
  } catch (error) {
    logger.error(error.stack || `forecast for ${spot.key} failed - ${error}`);
    await ctx.reply(ctx.i18n.t('botReplays.forecastReq.failed'));
  } finally {
    stop();
  }
}

const bot = new Composer();

bot.command(getForecastCmd, (ctx) => replyWithForecast(ctx, getSpotFromCommand(ctx.message.text)));
// /spot_TelAviv, /spot_Haifa, ... as listed by /spots
spotKeys.forEach((key) => {
  bot.command(`spot_${key}`, (ctx) => replyWithForecast(ctx, spots[key]));
});

module.exports = bot;
