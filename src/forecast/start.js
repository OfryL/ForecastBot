const Composer = require('telegraf/composer');
const logger = require('../logger/telegramLogger')('app_forecast_start');
const { getChatDesc } = require('../utils/chatRepo');
const {
  helpCmd, getForecastCmd, subscribeCmd, spotsCmd, liveVideoCmd, langEnCmd, langHeCmd,
} = require('../utils/consts');

const commands = {
  getForecastCmd, subscribeCmd, spotsCmd, liveVideoCmd, langEnCmd, langHeCmd,
};

async function start(ctx) {
  logger.log(`Start from: ${getChatDesc(ctx)}`);
  await ctx.replyWithHTML(ctx.i18n.t('botReplays.start', commands));
}

async function help(ctx) {
  await ctx.replyWithHTML(ctx.i18n.t('botReplays.help', commands));
}

const bot = new Composer();
bot.start(start);
bot.command(helpCmd, help);

module.exports = bot;
