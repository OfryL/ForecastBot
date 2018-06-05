const config = require('config');
const Screenshot = require('./screenshot/screenshot');
const fs = require('fs');
const log4js = require('log4js');
const subscribeDao = require('./subscribeDao/subscribeDao');
const subscriberMulticastJob = require('./subscriberMulticastJob');

const logger = log4js.getLogger("forcastbot");
const telegramLogger = require('./telegramLogger');

const getForcastCmd = 'getforcast';
const subscribeCmd = 'subscribe';

const subscriberListCmd = 'subscriberList';
const subscriberMulticastCmd = 'postToSubscribers';

const savePath = process.cwd() + '/lib/screenshots';
// const savePath = __dirname;

const urls = {
  'TelAviv': {
    name: 'Tel-Aviv - Hilton',
    url: 'https://magicseaweed.com/Hilton-Surf-Report/3658/',
    filename: 'forcastTelAviv'
  },
  'Haifa': {
    name: 'Haifa - The Peak',
    url: 'https://magicseaweed.com/Haifa-The-Peak-Surf-Report/3671/',
    filename: 'forcastHaifa'
  },
  'Ashqelon': {
    name: 'Ashqelon',
    url: 'https://magicseaweed.com/Ashqelon-Surf-Report/3811/',
    filename: 'forcastAshqelon'
  },
  'Ashdod': {
    name: 'Ashdod',
    url: 'https://magicseaweed.com/Ashdod-Surf-Report/4219/',
    filename: 'forcastAshdod'
  }
};

const START_MSG = 'Welcome to Israel`s first waves forcast telegram bot.\n' +
  'send me /getforcast to see more!\n' +
  '<b>New</b> - you can /subscribe for every day forcast, stay tuned!';

module.exports = function() {
  var _bot;
  var botUsername;

  function logError(ctx, err) {
    logger.error(err);
    if (err && err.stack) {
      logger.error(err.stack);
    }
    telegramLogger.logErr(err);
  }

  function getSpotFromCommand(text) {
    let args = text.split(" ");
    if (args.length > 0) {
      let spot = urls[args[1]];
      if (spot) {
        return spot;
      }
    }
    return urls.TelAviv;
  }

  function executeMulticastReq(func) {
    subscribeDao.getAllSubscribers().then((subscribers) => {
      subscribers.forEach((s) => {
        func(_bot.telegram, s);
      });
    });
  }

  function handleStartCmd(ctx) {
    logger.debug(ctx.message.text);
    ctx.telegram.sendMessage(ctx.message.chat.id, START_MSG, {parse_mode:'HTML'} );
  }

  function handleForcastReq(ctx) {
    logger.info("processing request (ChatID: " + ctx.message.chat.id + ")");

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

    Screenshot.getScreenshot(spot.url, spot.filename, savePath).then(
      (path) => {
        ctx.replyWithPhoto({
          source: fs.readFileSync(path)
        }, {
          caption: 'Wave forcast notification for ' + spot.name + '\n<a href="' + spot.url + '">More Info</a>\n@' + botUsername + ' to subscribe me!',
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
    let chatId = ctx.message.chat.id;
    subscribeDao.getSubscriber(chatId).then((subscriber) => {
      if (subscriber.length) {
        subscribeDao.removeSubscriber(chatId).then(() => {
          ctx.reply('You are now un-register :( ');
          telegramLogger.logInfo("Someone left as :(");
        }).catch((err) => {
          ctx.reply('Failed to un-register!');
          logError(err);
        });
      } else {
        subscribeDao.addSubscriber(chatId, 'TelAviv').then(() => {
          ctx.reply('You are now register to forcast updates!');
          telegramLogger.logInfo("Someone join as :)");
        }).catch((err) => {
          ctx.reply('Failed to register!');
          logError(err);
        });
      }
    }).catch((err) => {
      ctx.reply('Failed!');
    });
  }

  function handleSubscribeListReq(ctx) {
    subscribeDao.getAllSubscribers().then((subscribers) => {
      let chatIds = subscribers.map((s) => s.chatId);
      ctx.reply('subscribers: ' + chatIds);
    });
  }

  function handleSubscriberMulticastReq(ctx) {
    executeMulticastReq((bot, subscriber) => {
      bot.sendMessage(subscriber.chatId, "test").catch((err) => {
        logError(ctx, 'Error sending podcast: ' + err);
      });
    });
  }

  function subscriberForcastMulticast() {
    executeMulticastReq((bot, subscriber) => {
      const spot = getSpotFromCommand(subscriber.spot);

      Screenshot.getScreenshot(spot.url, spot.filename, savePath).then(
        (path) => {
          bot.sendPhoto(subscriber.chatId, {
            source: fs.readFileSync(path)
          }, {
            caption: 'Wave forcast notification for ' + spot.name + '\n<a href="' + spot.url + '">More Info</a>',
            parse_mode: 'HTML'
          }).catch((error) => {
            logError(error.code);
            logError(error.response.description);
          }).then((ctx) => {
            logger.debug('done');
          });
        }).catch((err) => {
        logError('error while getting the screenshot: ' + err);
      });
    });
  }

  function startSubscriberForcastMulticastJob() {
    logger.debug('setup cron job');
    subscriberMulticastJob.setup(subscriberForcastMulticast);
  }

  function registerManagerCmd(bot, command, func) {
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

    registerCmd(bot, command, (ctx) => authUser(ctx, func));
  }

  function registerCmd(bot, command, func) {
    bot.command('/' + command, (ctx) => func(ctx));
  }

  function setupForcastBot(bot) {
    _bot = bot;
    logger.debug("seting up bot");

    bot.catch((err) => {
      logError('Ooops', err);
    });

    bot.start((ctx) => handleStartCmd(ctx));
    bot.telegram.getMe().then(function(me) {
      bot.options.username = me.username;
      botUsername = me.username;
      logger.info("bot name: " + me.username);
    });

    startSubscriberForcastMulticastJob();

    registerCmd(bot, getForcastCmd, handleForcastReq);
    registerCmd(bot, subscribeCmd, handleSubscribeReq);

    registerManagerCmd(bot, subscriberListCmd, handleSubscribeListReq);
    registerManagerCmd(bot, subscriberMulticastCmd, handleSubscriberMulticastReq);

  }

  return {
    setupForcastBot
  };
}();
