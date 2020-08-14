const Composer = require('telegraf/composer');

const {
  subscriberListCmd,
  subscriberMulticastCmd,
  getDbFile,
} = require('../../utils/consts');

const { authenticationMw } = require('../../middleware');

const handleSubscribeListReq = require('./handleSubscribeListReq');
const handleSubscriberMulticastReq = require('./handleSubscriberMulticastReq');
const handleGetDbFileReq = require('./handleGetDbFileReq');

const bot = new Composer();

bot.use(authenticationMw);

bot.command(`${subscriberListCmd}`, handleSubscribeListReq);
bot.command(`${subscriberMulticastCmd}`, handleSubscriberMulticastReq);
bot.command(`${getDbFile}`, handleGetDbFileReq);

module.exports = bot;
