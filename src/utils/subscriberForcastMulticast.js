const path = require('path');
const fs = require('fs');
const Screenshot = require('./screenshot');
const subscriberMulticastJob = require('./subscriberMulticastJob');

const logger = require('../logger/telegramLogger')('app_forcastbot');

const {
  isBlockBotError,
  handleUserBlockBot,
} = require('./user');

const { getSpotFromCommand } = require('./spots');
const {
  saveDirPath,
} = require('./consts');

const executeMulticastReq = require('./executeMulticastReq');

async function subscriberForcastMulticast(bot) {
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

  await executeMulticastReq(bot, msgHandler);
}

function startSubscriberForcastMulticastJob(botInstance) {
  logger.debug('setup cron job');
  subscriberMulticastJob.setup(botInstance, subscriberForcastMulticast);
  // subscriberForcastMulticast();
}

module.exports = { startSubscriberForcastMulticastJob };
