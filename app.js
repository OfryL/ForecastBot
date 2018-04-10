/*jshint esversion: 6 */

const config = require('config');
const Telegraf = require('telegraf');
const Screenshot = require('./src/screenshot/screenshot');
const fs = require('fs');

// Screenshot.getScreenshot('https://magicseaweed.com/Hilton-Surf-Report/3658/', 'forcast', __dirname).then(
//   (path) => {
//     console.log(path);
//   }, (err) => {
//     console.log(err);
//   });

const handleForcastReq = function(ctx) {
  // ctx.reply("Working...");
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
bot.command('/getme', (ctx) => { ctx.reply("username: " + botUsername); });

// bot.command('/getForcast', (ctx) => {
//   ctx.telegram.sendPhoto(ctx.message.chat.id , fs.readFileSync('./forcast.png'), {
//     caption: 'Caption *text*',
//     parse_mode: 'Markdown'
//   }).catch((error) => {
//     console.log(error.code);  // => 'ETELEGRAM'
//     console.log(error.response.description); // => { ok: false, error_code: 400, description: 'Bad Request: chat not found' }
//     process.exit();
//     });
// });

// bot.command('/getForcast', (ctx) => {
//   const buffer = fs.readFileSync('./forcast.png');
//   ctx.replyWithPhoto(buffer, {
//     caption: 'Caption *text*',
//     parse_mode: 'Markdown'
//   }, {
//     filename: 'forcast.png',
//     contentType: 'image/png'
//   }
// ).catch((error) => {
//   console.log(error.code);  // => 'ETELEGRAM'
//   console.log(error.response.description); // => { ok: false, error_code: 400, description: 'Bad Request: chat not found' }
//   process.exit();
//   });
// });

// sendPhoto(msg.chat.id,"https://www.somesite.com/image.jpg",{caption : "Here we go ! \nThis is just a caption "} );
// bot.command('/getForcast', (ctx) => {
//   ctx.telegram.sendPhoto({
//     chatId: ctx.message.chat.id,
//     caption: 'Test caption',
//     photo: './forcast.png',
//     // photo: fs.createReadStream('./forcast.png')
//   }, function(err, msg) {
//     console.log(err);
//     console.log(msg);
//   });
// });

//
// replyWithPhoto({
//   source: fs.createReadStream('./forcast.png'),
//   caption: 'test',
//   parse_mode: 'Markdown'
// }));
bot.startPolling();
