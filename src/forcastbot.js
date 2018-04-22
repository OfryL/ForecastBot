/*jshint esversion: 6 */

const config = require('config');
const Screenshot = require('./screenshot/screenshot');
const fs = require('fs');
const log4js = require('log4js');
const subscribeDao = require('./subscribeDao/subscribeDao');

const logger = log4js.getLogger("forcastbot");

const managerUsername = "RedBeardKnight";

const getForcastCmd = 'getForcast';
const subscribeCmd = 'subscribe';

const subscriberListCmd = 'subscriberList';
const subscriberMulticastCmd = 'postToSubscribers';

const savePath = process.cwd() + '/lib/screenshots';
// const savePath = __dirname;

const urls = {
  'TelAviv': {name: 'Tel-Aviv - Hilton',url: 'https://magicseaweed.com/Hilton-Surf-Report/3658/', filename: 'forcastTelAviv'},
  'Haifa': {name: 'Haifa - The Peak', url: 'https://magicseaweed.com/Haifa-The-Peak-Surf-Report/3671/', filename: 'forcastHaifa'}
};

module.exports = function() {
  var _bot;

  function logError(ctx, err) {
    logger.error(err);
    if (_bot) {
      _bot.telegram.sendMessage(367370312, "#Error: " + err);
    }
  }

  function handleStartCmd(ctx) {
    logger.debug(ctx.message.text);
    ctx.reply('Welcome to Israel`s first waves forcast telegram bot.' +
      ' send me /getForcast to see more! ');
  }

  function handleForcastReq(ctx) {
    logger.info("processing request (ChatID: " + ctx.message.chat.id + ")");

    function getSpotFromCommand(text){
      let args = text.split(" ");
      if (args.length > 0) {
        let spot = urls[args[1]];
        if (spot) {
          return spot;
        }
      }
      return urls.TelAviv;
    }

    const spot = getSpotFromCommand(ctx.message.text);

    var isDone = false;
    var replyWithChatAction = ctx.replyWithChatAction;
    replyWithChatAction("upload_photo");
    const intervalObj = setInterval(() => {
      if (isDone) {
        clearInterval(this);
        replyWithChatAction = null;
        isDone = null;
      } else {
        if (replyWithChatAction) {
          replyWithChatAction("upload_photo");
        }
      }
    }, 3000);

    logger.debug(spot);
    Screenshot.getScreenshot(spot.url, spot.filename, savePath).then(
      (path) => {
        ctx.replyWithPhoto({
          source: fs.readFileSync(path)
        }, {
          caption: 'Wave forcast notification for '+ spot.name +'\n<a href="'+ spot.url +'">More Info</a>',
          parse_mode: 'HTML'
        }).catch((error) => {
          logError(ctx, error.code);
          logError(ctx, error.response.description); // => { ok: false, error_code: 400, description: 'Bad Request: chat not found' }
        }).then((ctx) => {
          logger.debug('done');
        });
      },
      (err) => {
        logError(ctx, 'error while getting the screenshot: ' + err);
      }).catch((error) => {
      logError(ctx, error);
    }).then(() => { //finaly
      isDone = true;
      clearInterval(intervalObj);
    });
  }

  function handleSubscribeReq(ctx) {
    if (subscribeDao.getSubscriber(ctx.message.chat.id) !== -1) {
      subscribeDao.removeSubscriber(ctx.message.chat.id);
      ctx.reply('You are now un-register :( ');
    } else {
      subscribeDao.addSubscriber(ctx.message.chat.id);
      ctx.reply('You are now register to forcast updates!');
    }
  }

  function handleSubscribeListReq(ctx) {
    ctx.reply('subscribers:' + subscribeDao.getAllSubscribers());
  }

  function handleSubscriberMulticastReq(ctx) {
subscribeDao.getAllSubscribers().forEach((v) => {
  _bot.telegram.sendMessage(v, "test").catch((err) => {
    logError(ctx, 'Error sending podcast: ' + err);
  });
});
  }


  function registerManagerCmd(bot, command, func, botUsername) {
    const authUser = function(ctx, func) {
      let user = {
        username: ctx.message.from.username
      };
      if (user.username !== managerUsername) {
        logger.warn("Unauthorize: " + user.username);
        ctx.reply("Unauthorize");
      } else {
        func(ctx);
      }
    };

    registerCmd(bot, command, (ctx) => authUser(ctx, func), botUsername);
  }

  function registerCmd(bot, command, func, botUsername) {
    bot.command('/' + command, (ctx) => func(ctx));
    if (botUsername) {
      bot.command('/' + command + '@' + botUsername, (ctx) => func(ctx));
    }
  }

  function setupForcastBot(bot) {
    _bot = bot;
    logger.debug("seting up bot");

    bot.start((ctx) => handleStartCmd(ctx));
    bot.telegram.getMe().then(function(me) {
      botUsername = me.username;
      bot.botUsername = botUsername;
      logger.info("bot name: " + botUsername);

      registerCmd(bot, getForcastCmd, handleForcastReq, botUsername);
      registerCmd(bot, subscribeCmd, handleSubscribeReq, botUsername);

      registerManagerCmd(bot, subscriberListCmd, handleSubscribeListReq, botUsername);
      registerManagerCmd(bot, subscriberMulticastCmd, handleSubscriberMulticastReq, botUsername);

    });
  }

  return {
    setupForcastBot
  };
}();
