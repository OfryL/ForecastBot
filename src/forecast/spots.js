const Composer = require('telegraf/composer');
const logger = require('../logger/telegramLogger')('app_forecast_getSpots');
const { spots, spotKeys } = require('../utils/spots');
const { spotsCmd } = require('../utils/consts');
const { getChatDesc } = require('../utils/chatRepo');

const getSpots = async (ctx) => {
  logger.log(`get spots from: ${getChatDesc(ctx)}`);
  const spotsList = spotKeys
    .map((key) => `/spot_${key} - ${ctx.i18n.t(spots[key].name)}`)
    .join('\n');
  await ctx.reply(ctx.i18n.t('botReplays.spots.getSpots', { spotsList }));
};

const bot = new Composer();
bot.command(spotsCmd, getSpots);

module.exports = bot;
