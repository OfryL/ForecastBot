const path = require('path');
const config = require('config');
const Screenshot = require('./screenshot/screenshot');
const fs = require('fs');
const log4js = require('log4js');
const subscribeDao = require('./subscribeDao/subscribeDao');
const subscriberMulticastJob = require('./subscriberMulticastJob');

const logger = log4js.getLogger("forcastbot");
const telegramLogger = require('./errorHandler/telegramLogger');

const getForcastCmd = 'getforcast';
const subscribeCmd = 'subscribe';

const subscriberListCmd = 'subscriberList';
const subscriberMulticastCmd = 'postToSubscribers';

const saveDirPath = path.join(process.cwd(), 'lib', 'screenshots');
// const saveDirPath = __dirname;

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

  function logError(err, desc = null) {
    logger.error(err);
    telegramLogger.extLogErr(err, desc);
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

  async function showUploadPhotoStatus(ctx) {
    var replyWithChatAction = ctx.replyWithChatAction;
    await replyWithChatAction("upload_photo");

    const intervalObj = setInterval(() => {
      if (replyWithChatAction) {
        replyWithChatAction("upload_photo");
      }
    }, 3000);

    const stop = () => {
        logger.debug('clearing upload_photo replyWithChatAction...');
        clearInterval(intervalObj);
        delete replyWithChatAction;
        delete isDone;
    };
    return stop;
  }

  async function executeMulticastReq(func) {
    try {
      const subscribers = await subscribeDao.getAllSubscribers();
      for (let index = 0; index < subscribers.length; index++) {
        let s = subscribers[index];
        await func(_bot.telegram, s);
      }
    } catch(error) {
      logError(error, 'executeMulticastReq');
    }
  }

  function handleStartCmd(ctx) {
    telegramLogger.logInfo(`Start from user: ${ctx.message.from.first_name}(@${ctx.message.from.username})`);
    ctx.telegram.sendMessage(ctx.message.chat.id, START_MSG, {parse_mode:'HTML'} );
  }

  async function handleForcastReq(ctx) {
    logger.info(`processing request from ${ctx.message.from.first_name}(@${ctx.message.from.username})`);

    const spot = getSpotFromCommand(ctx.message.text);

    const stopShowUploadPhotoStatus = await showUploadPhotoStatus(ctx);

    let path = ''
    try {
      path = await Screenshot.getScreenshot(spot.url, spot.filename, saveDirPath);
    } catch (error) {
        logError(error, 'error while getting the screenshot');
    }

    try {
      ctx.replyWithPhoto({ source: fs.readFileSync(path) }, {
          caption: 'Wave forcast notification for ' + spot.name + '\n<a href="' + spot.url + '">More Info</a>\n@' + botUsername + ' to subscribe me!',
          parse_mode: 'HTML'
        });
    } catch (error) {
      logError(error, `while sending forcast msg (#${error.code})\n${error.response.description}`);  // => { ok: false, error_code: 400, description: 'Bad Request: chat not found' }
    }
    stopShowUploadPhotoStatus();
    logger.debug('done');
  }

  async function handleSubscribeReq(ctx) {
    const chatId = ctx.message.chat.id;
    const userDesc = `${ctx.message.from.first_name}(@${ctx.message.from.username})`;
    const subscriber = await subscribeDao.getSubscriber(chatId);
    if (subscriber.length) {
      try {
        await subscribeDao.removeSubscriber(chatId);
        ctx.reply('You are now un-register :( ');
        telegramLogger.logInfo(`${userDesc} #unregister`);
      } catch (e) {
        ctx.reply('Failed to un-register!');
        logError(e, `Failed to #unregister ${userDesc}`);
      }
    } else {
      try {
        await subscribeDao.addSubscriber(chatId, 'TelAviv');
        ctx.reply('You are now register to forcast updates!');
        telegramLogger.logInfo(`${userDesc} #register`);
      } catch (e) {
        ctx.reply('Failed to register!');
        logError(e, `Failed to #register ${userDesc}`);
      }
    }
  }

  async function handleSubscribeListReq(ctx) {
    try {
      const subscribers = await subscribeDao.getAllSubscribers();
      let chatIds = subscribers.map((s) => s.chatId);
      ctx.reply('subscribers: ' + chatIds);
    } catch(error) {
      logError(error, 'handleSubscribeListReq');
    }
  }

  function handleSubscriberMulticastReq(ctx) {
    let text = ctx.message.text.replace('/' + subscriberMulticastCmd,'');
    text = text.replace('/ ','');
    if (!text) {
      ctx.reply('Cant send blank msg!');
    } else {
      executeMulticastReq((bot, subscriber) => {
        bot.sendMessage(subscriber.chatId, text).catch((err) => {
          logError(err, 'Error sending podcast to: ' + JSON.stringify(subscriber));
        });
      });
    }
  }

  async function subscriberForcastMulticast() {
    const spotsToPath = {};

    const msgHandler = async function(bot, subscriber) {
      const spot = getSpotFromCommand(subscriber.spot);
      const pathToImage = path.join(saveDirPath , spot.filename + '.png')
      if(!spotsToPath[subscriber.spot]) {
        try {
          await Screenshot.getScreenshot(spot.url, spot.filename, saveDirPath);
        }
        catch(err) {
          logError('subscriberForcastMulticast - error: ' + err);
        }
        spotsToPath[subscriber.spot] = pathToImage;
      }

      try {
        logger.debug("pathToImage: "+pathToImage);
        await bot.sendPhoto(subscriber.chatId, {
          source: fs.readFileSync(pathToImage)
        }, {
          caption: 'Wave forcast notification for ' + spot.name + '\n<a href="' + spot.url + '">More Info</a>',
          parse_mode: 'HTML'
        });
      } catch(error) {
        logError(error ,"error sendPhoto to subscriber: " + JSON.stringify(subscriber) + " on spot :" + JSON.stringify(spot));
      }
      logger.debug('done');
    }

    await executeMulticastReq(msgHandler);
  }

  function startSubscriberForcastMulticastJob() {
    logger.info('setup cron job');
    subscriberMulticastJob.setup(subscriberForcastMulticast);
  }

  function registerManagerCmd(bot, command, func) {
    const authUser = function(ctx, func) {
      let user = {
        username: ctx.message.from.username
      };
      if (user.username !== config.get('telegramBot.managerUsername')) {
        logger.warn("Unauthorize: " + user.username);
        telegramLogger.logWarn("Unauthorize: " + user.username);
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
      telegramLogger.logInfoProd(`Bot has started`);
    }).catch((error) => {
      logError('#error getMe: ' + error);
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
