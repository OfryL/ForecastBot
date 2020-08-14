const Composer = require('telegraf/composer');
const {
  getForecastCmd,
  subscribeCmd,
} = require('../utils/consts');

const admin = require('./admin');

const handleForecastReq = require('./handleForecastReq');
const handleSubscribeReq = require('./handleSubscribeReq');
const handleStartCmd = require('./handleStartCmd');

const bot = new Composer();

bot.use(admin);

bot.start(handleStartCmd);

bot.command(`${getForecastCmd}`, handleForecastReq);
bot.command(`${subscribeCmd}`, handleSubscribeReq);

module.exports = bot;
