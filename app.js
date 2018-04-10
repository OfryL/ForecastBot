/*jshint esversion: 6 */

const config = require('config');
const Telegraf = require('telegraf');
const Screenshot = require('./src/screenshot/screenshot');
const fs = require('fs');

const handleForcastReq = function(ctx) {
  Screenshot.getScreenshot('https://magicseaweed.com/Hilton-Surf-Report/3658/', 'forcast', __dirname).then(
    (path) => {
      ctx.replyWithPhoto({
        source: fs.readFileSync('./forcast.png')
      }, {
        caption: 'Caption text'
      }).catch((error) => {
        console.log(error.code);
        console.log(error.response.description); // => { ok: false, error_code: 400, description: 'Bad Request: chat not found' }
      }).then((ctx) => {
        console.log('done');
      });
    },
    (err) => {
      console.log(err);
    }).catch((error) => {
    console.log(error);
  });
};

var botUsername;
const bot = new Telegraf(config.get('telegramBot.token'));
bot.start((ctx) => ctx.reply('Welcome!'));
bot.telegram.getMe().then(function(me)
{
    botUsername = me.username;
    bot.command('/getForcast@' + botUsername, (ctx) => handleForcastReq(ctx));
});
bot.command('/getForcast', (ctx) => handleForcastReq(ctx));
bot.startPolling();
