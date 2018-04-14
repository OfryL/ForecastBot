/*jshint esversion: 6 */

const config = require('config');
const Screenshot = require('./screenshot/screenshot');
const fs = require('fs');
const log4js = require('log4js');

const logger = log4js.getLogger("forcastbot");


function handleForcastReq(ctx) {
  logger.debug("processing request");
  let user = {username: ctx.message.from.username};
  if (user.username !== 'RedBeardKnight') {
    logger.warn("Unauthorize: " + user.username);
    ctx.reply("Unauthorize");
    return;
  }
  var isDone = false;
  var replyWithChatAction = ctx.replyWithChatAction;
  replyWithChatAction("upload_photo");
  const intervalObj = setInterval(() => {
    if (isDone) {
      clearInterval(this);
      replyWithChatAction = null;
      isDone = null;
    } else {
    if (replyWithChatAction) {replyWithChatAction("upload_photo");}
}
  }, 3000);

  Screenshot.getScreenshot('https://magicseaweed.com/Hilton-Surf-Report/3658/', 'forcast', __dirname).then(
    (path) => {
      isDone = true;
      ctx.replyWithPhoto({
        source: fs.readFileSync(path)
      }, {
        caption: 'Wave forcast notification for tel-aviv\n<a href="https://magicseaweed.com/Hilton-Surf-Report/3658/">More Info</a>',
        parse_mode: 'HTML'
      }).catch((error) => {
        logger.error(error.code);
        logger.error(error.response.description); // => { ok: false, error_code: 400, description: 'Bad Request: chat not found' }
      }).then((ctx) => {
        logger.debug('done');
      });
    },
    (err) => {
      logger.error(err);
    }).catch((error) => {
    logger.error(error);
  });
}

module.exports.setupForcastBot = function(bot) {
  logger.debug("seting up bot");

    bot.start((ctx) => ctx.reply('Welcome!'));
    bot.telegram.getMe().then(function(me) {
      botUsername = me.username;
      bot.command('/getForcast@' + botUsername, (ctx) => handleForcastReq(ctx));
      bot.botUsername = botUsername;
      logger.debug("bot name: " + botUsername);
    });
    bot.command('/getForcast', (ctx) => handleForcastReq(ctx));
};
