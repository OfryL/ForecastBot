const path = require('path');
const config = require('config');
const fs = require('fs');
const Screenshot = require('./screenshot/screenshot');
const subscribeDao = require('./subscribeDao/subscribeDao');
const subscriberMulticastJob = require('./subscriberMulticastJob');

const logger = require('./logger/telegramLogger')('app_forcastbot');

const getForcastCmd = 'getforcast';
const subscribeCmd = 'subscribe';

const subscriberListCmd = 'subscriberList';
const subscriberMulticastCmd = 'postToSubscribers';

const saveDirPath = path.join(process.cwd(), 'lib', 'screenshots');
// const saveDirPath = __dirname;

const urls = {
  TelAviv: {
    name: 'Tel-Aviv - Hilton',
    url: 'https://magicseaweed.com/Hilton-Surf-Report/3658/',
    filename: 'forcastTelAviv',
  },
  Haifa: {
    name: 'Haifa - The Peak',
    url: 'https://magicseaweed.com/Haifa-The-Peak-Surf-Report/3671/',
    filename: 'forcastHaifa',
  },
  Ashqelon: {
    name: 'Ashqelon',
    url: 'https://magicseaweed.com/Ashqelon-Surf-Report/3811/',
    filename: 'forcastAshqelon',
  },
  Ashdod: {
    name: 'Ashdod',
    url: 'https://magicseaweed.com/Ashdod-Surf-Report/4219/',
    filename: 'forcastAshdod',
  },
};

const START_MSG = 'Welcome to Israel`s first waves forcast telegram bot.\n'
  + 'send me /getforcast to see more!\n'
  + '<b>New</b> - you can /subscribe for every day forcast, stay tuned!';

module.exports = (function () {
  let bot;
  let botUsername;

  function getSpotFromCommand(text) {
    const args = text.split(' ');
    if (args.length > 0) {
      const spot = urls[args[1]];
      if (spot) {
        return spot;
      }
    }
    return urls.TelAviv;
  }

  async function showUploadPhotoStatus(ctx) {
    let { replyWithChatAction } = ctx;
    await replyWithChatAction('upload_photo');

    const intervalObj = setInterval(() => {
      if (replyWithChatAction) {
        replyWithChatAction('upload_photo');
      }
    }, 3000);

    const stop = () => {
      logger.debug('clearing upload_photo replyWithChatAction...');
      clearInterval(intervalObj);
      replyWithChatAction = null;
    };
    return stop;
  }

  function isBlockBotError(error) {
    return (error.code === 403 && error.response.description === 'Forbidden: bot was blocked by the user');
  }

  function handleUserBlockBot(chatId) {
    const logStr = `User#${chatId} was block bot, removing from db...`;
    logger.log(logStr);
    logger.log(logStr);

    try {
      subscribeDao.removeSubscriber(chatId);
    } catch (e) {
      logger.error(e.stack || `Failed to unregister #blocked user#${chatId} - ${e}`);
    }
  }

  async function executeMulticastReq(func) {
    const promises = [];
    try {
      const subscribers = await subscribeDao.getAllSubscribers();
      for (let index = 0; index < subscribers.length; index += 1) {
        const s = subscribers[index];
        promises.push(func(bot, s));
      }
      await Promise.all(promises);
    } catch (error) {
      logger.error(error.stack || `executeMulticastReq - ${error}`);
    }
  }

  function handleStartCmd(ctx) {
    logger.log(`Start from user: ${ctx.message.from.first_name}(@${ctx.message.from.username})`);
    ctx.telegram.sendMessage(ctx.message.chat.id, START_MSG, { parse_mode: 'HTML' });
  }

  async function handleForcastReq(ctx) {
    logger.log(`processing request from ${ctx.message.from.first_name}(@${ctx.message.from.username})`);

    const spot = getSpotFromCommand(ctx.message.text);

    const stopShowUploadPhotoStatus = await showUploadPhotoStatus(ctx);

    let imagePath = '';
    try {
      imagePath = await Screenshot.getScreenshot(spot.url, spot.filename, saveDirPath);
    } catch (error) {
      logger.error(error.stack || `error while getting the screenshot - ${error}`);
    }

    try {
      const fileContent = await fs.readFileSync(imagePath);
      ctx.replyWithPhoto({ source: fileContent }, {
        caption: `Wave forcast notification for ${spot.name}\n<a href="${spot.url}">More Info</a>\n@${botUsername} to subscribe me!`,
        parse_mode: 'HTML',
      });
    } catch (error) {
      const description = !(error.response === undefined || error.response === null) ? error.response.description : '';
      logger.error(error.stack || `while sending forcast msg (#${error.code})\n${description}\n${error}`);
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
        logger.log(`${userDesc} #unregister`);
      } catch (e) {
        ctx.reply('Failed to un-register!');
        logger.error(e.stack || `Failed to #unregister ${userDesc} - ${e}`);
      }
    } else {
      try {
        await subscribeDao.addSubscriber(chatId, 'TelAviv');
        ctx.reply(`You are now register to forcast updates!\nTo un-register sent /${subscribeCmd} again any time.`);
        logger.log(`${userDesc} #register`);
      } catch (e) {
        ctx.reply('Failed to register!');
        logger.error(e.stack || `Failed to #register ${userDesc} - ${e}`);
      }
    }
  }

  async function handleSubscribeListReq(ctx) {
    try {
      const subscribers = await subscribeDao.getAllSubscribers();
      const chatIds = subscribers.map((s) => s.chatId);
      ctx.reply(`subscribers: ${chatIds}`);
    } catch (error) {
      logger.error(error.stack || `handleSubscribeListReq - ${error}`);
    }
  }

  function handleSubscriberMulticastReq(ctx) {
    let text = ctx.message.text.replace(`/${subscriberMulticastCmd}`, '');
    text = text.replace('/ ', '');
    if (!text) {
      ctx.reply('Cant send blank msg!');
    } else {
      executeMulticastReq((botInstance, subscriber) => {
        botInstance.telegram.sendMessage(subscriber.chatId, text).catch((err) => {
          logger.error(err.stack || `Error sending podcast to: ${JSON.stringify(subscriber)} - ${err}`);
        });
      });
    }
  }

  async function subscriberForcastMulticast() {
    const spotsToPath = {};

    const msgHandler = async function (botInstance, subscriber) {
      const spot = getSpotFromCommand(subscriber.spot);
      const pathToImage = path.join(saveDirPath, `${spot.filename}.png`);
      if (!spotsToPath[subscriber.spot]) {
        try {
          await Screenshot.getScreenshot(spot.url, spot.filename, saveDirPath);
        } catch (err) {
          logger.error(err.stack || `subscriberForcastMulticast - ${err}`);
        }
        spotsToPath[subscriber.spot] = pathToImage;
      }

      try {
        logger.debug(`pathToImage: ${pathToImage}`);
        const fileContent = await fs.readFileSync(pathToImage);
        await botInstance.telegram.sendPhoto(subscriber.chatId, {
          source: fileContent,
        }, {
          caption: `Wave forcast notification for ${spot.name}\n<a href="${spot.url}">More Info</a>`,
          parse_mode: 'HTML',
        });
      } catch (error) {
        if (isBlockBotError(error)) {
          handleUserBlockBot(subscriber.chatId);
        } else {
          logger.error(error.stack || `error sendPhoto to subscriber: ${JSON.stringify(subscriber)} on spot :${JSON.stringify(spot)} - ${error}`);
        }
      }
      logger.debug('done');
    };

    await executeMulticastReq(msgHandler);
  }

  function startSubscriberForcastMulticastJob() {
    logger.debug('setup cron job');
    subscriberMulticastJob.setup(subscriberForcastMulticast);
  }

  function registerCmd(botInstance, command, func) {
    botInstance.command(`/${command}`, (ctx) => func(ctx));
  }

  function registerManagerCmd(botInstance, command, func) {
    const authUser = (ctx, next) => {
      const user = {
        username: ctx.message.from.username,
      };
      if (user.username !== config.get('telegramBot.managerUsername')) {
        logger.debug(`Unauthorize: ${user.username}`);
        logger.warn(`Unauthorize: ${user.username}`);
        ctx.reply('Unauthorize');
      } else {
        next(ctx);
      }
    };

    registerCmd(botInstance, command, (ctx) => authUser(ctx, func));
  }

  function setupForcastBot(newBot) {
    bot = newBot;
    logger.debug('seting up newBot');

    newBot.catch((err) => {
      logger.error(err.stack || `Ooops: ${err}`);
    });

    newBot.start((ctx) => handleStartCmd(ctx));
    newBot.telegram.getMe().then((me) => {
      // newBot.options.username = me.username;
      botUsername = me.username;
      logger.debug(`bot name: ${me.username}`);
      logger.log('Bot has started');
    }).catch((error) => {
      logger.error(error.stack || `#error getMe: ${error}`);
    });

    startSubscriberForcastMulticastJob();

    registerCmd(newBot, getForcastCmd, handleForcastReq);
    registerCmd(newBot, subscribeCmd, handleSubscribeReq);

    registerManagerCmd(newBot, subscriberListCmd, handleSubscribeListReq);
    registerManagerCmd(newBot, subscriberMulticastCmd, handleSubscriberMulticastReq);
  }

  return {
    setupForcastBot,
  };
}());
