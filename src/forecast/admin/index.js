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

const useMw = (next) => (ctx) => authenticationMw(ctx, next);

bot.command(`${subscriberListCmd}`, useMw(handleSubscribeListReq));
bot.command(`${subscriberMulticastCmd}`, useMw(handleSubscriberMulticastReq));
bot.command(`${getDbFile}`, useMw(handleGetDbFileReq));

module.exports = bot;
