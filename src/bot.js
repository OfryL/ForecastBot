const Telegraf = require('telegraf');
const { token } = require('./utils/botToken');

const Bot = () => new Telegraf(token);

module.exports = Bot;
