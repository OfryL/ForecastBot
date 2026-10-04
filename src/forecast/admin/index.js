const Composer = require('telegraf/composer');
const consts = require('../../utils/consts');
const authenticationMw = require('../../middleware/authenticationMw');

const handleSubscribeListReq = require('./handleSubscribeListReq');
const handleSubscriberMulticastReq = require('./handleSubscriberMulticastReq');
const handleGetDbFileReq = require('./handleGetDbFileReq');
const handleSendForecastNowReq = require('./handleSendForecastNowReq');
const serverTools = require('./serverTools');

const bot = new Composer();

const adminCommand = (cmd, handler) => bot.command(cmd, authenticationMw, handler);

adminCommand(consts.subscriberListCmd, handleSubscribeListReq);
adminCommand(consts.subscriberMulticastCmd, handleSubscriberMulticastReq);
adminCommand(consts.getDbFileCmd, handleGetDbFileReq);
adminCommand(consts.sendForecastNowCmd, handleSendForecastNowReq);
adminCommand(consts.opHelpCmd, serverTools.opHelp);
adminCommand(consts.getOsInfoCmd, serverTools.getOsInfo);
adminCommand(consts.getUptimeCmd, serverTools.getUptime);
adminCommand(consts.getWanIpCmd, serverTools.getWanIp);
adminCommand(consts.getIpCmd, serverTools.getIp);

module.exports = bot;
