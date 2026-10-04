const Composer = require('telegraf/composer');

const admin = require('./admin');
const start = require('./start');
const getForecast = require('./getForecast');
const subscribe = require('./subscribe');
const langSet = require('./langSet');
const spots = require('./spots');
const liveVideo = require('./liveVideo');

const bot = new Composer();

bot.use(admin);
bot.use(start);
bot.use(getForecast);
bot.use(subscribe);
bot.use(langSet);
bot.use(spots);
bot.use(liveVideo);

module.exports = bot;
