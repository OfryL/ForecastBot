const Composer = require('telegraf/composer');
const {
  getForecastCmd,
  subscribeCmd,
  langHeCmd,
  langEnCmd,
} = require('../utils/consts');

const admin = require('./admin');

const handleForecastReq = require('./handleForecastReq');
const handleSubscribeReq = require('./handleSubscribeReq');
const handleStartCmd = require('./handleStartCmd');
const { handleSetEnCmd, handleSetHeCmd } = require('./langSet');

const bot = new Composer();

bot.use(admin);

bot.start(handleStartCmd);

bot.command(`${getForecastCmd}`, handleForecastReq);
bot.command(`${subscribeCmd}`, handleSubscribeReq);
bot.command(`${langHeCmd}`, handleSetHeCmd);
bot.command(`${langEnCmd}`, handleSetEnCmd);

module.exports = bot;
