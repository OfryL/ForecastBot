const Composer = require('telegraf/composer');
const { botUsername, langEnCmd, langHeCmd } = require('../utils/consts');

function handleSetEnCmd(ctx) {
  ctx.i18n.locale('en');
  // eslint-disable-next-line no-underscore-dangle
  ctx.session.__language_code = 'en';
  ctx.reply(ctx.i18n.t('botReplays.langChanged'));
}

function handleSetHeCmd(ctx) {
  ctx.i18n.locale('he');
  // eslint-disable-next-line no-underscore-dangle
  ctx.session.__language_code = 'he';
  ctx.reply(ctx.i18n.t('botReplays.langChanged'));
}

const bot = new Composer();

bot.command(`${langHeCmd}`, handleSetHeCmd);
bot.command(`${langHeCmd}@${botUsername}`, handleSetHeCmd);

bot.command(`${langEnCmd}`, handleSetEnCmd);
bot.command(`${langEnCmd}@${botUsername}`, handleSetEnCmd);

module.exports = bot;
