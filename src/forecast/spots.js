const Composer = require('telegraf/composer');
const logger = require('../logger/telegramLogger')('app_forecast_getSpots');
const { spots } = require('../utils/spots');
const { spotsCmd, botUsername } = require('../utils/consts');
const { getChatDesc } = require('../utils/chatRepo');

const formatCmd = (key, name) => `/spot_${key} - ${name}\n`;

const getSpots = async (ctx) => {
  logger.log(`get spots from: ${getChatDesc(ctx)}`);
  const spotsList = Object.keys(spots)
    .reduce(
      (acc, s) => acc + formatCmd(s, ctx.i18n.t(spots[s].name)),
      '',
    );
  await ctx.reply(ctx.i18n.t('botReplays.spots.getSpots', { spotsList }));
};

const bot = new Composer();

bot.command(`${spotsCmd}`, getSpots);
bot.command(`${spotsCmd}@${botUsername}`, getSpots);

module.exports = bot;
