const Composer = require('telegraf/composer');

const errorHandlerMiddleware = require('../middleware/errorHandler/errorHandlerMiddleware');

const admin = require('./admin');

const getForecast = require('./getForecast');
const subscribe = require('./subscribe');
const start = require('./start');
const liveVideo = require('./liveVideo');
const spots = require('./spots');
const langSet = require('./langSet');

const bot = new Composer();

bot.use(errorHandlerMiddleware);
bot.use(admin);
bot.use(start);
bot.use(getForecast);
bot.use(subscribe);
bot.use(langSet);
bot.use(spots);
bot.use(liveVideo);

module.exports = bot;
