const path = require('path');
const fs = require('fs');
const logger = require('../logger/telegramLogger')('app_forecast');

const Bot = require('../bot');
const { i18Mw: { i18n } } = require('../middleware');

const Screenshot = require('./screenshot');
const subscriberMulticastJob = require('./subscriberMulticastJob');
const { isBlockBotError, handleUserBlockBot } = require('./user');
const { getSpotFromCommand } = require('./spots');
const { saveDirPath } = require('./consts');
const executeMulticastReq = require('./executeMulticastReq');

const bot = Bot();

const subscriberForecastMulticast = async () => {
  const spotsToPath = {};

  const msgHandler = async (subscriber) => {
    const spot = getSpotFromCommand(subscriber.spot);
    const pathToImage = path.join(saveDirPath, `${spot.filename}.png`);
    if (!spotsToPath[subscriber.spot]) {
      try {
        await Screenshot.getScreenshot(spot.url, spot.filename, saveDirPath);
      } catch (err) {
        logger.error(err.stack || `subscriberForecastMulticast - ${err}`);
      }
      spotsToPath[subscriber.spot] = pathToImage;
    }

    try {
      logger.debug(`pathToImage: ${pathToImage}`);
      const fileContent = await fs.readFileSync(pathToImage);
      await bot.telegram.sendPhoto(subscriber.chatId, {
        source: fileContent,
      }, {
        caption: i18n.t('he', 'subscriberMulticastJob.caption', { spot }),
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
};

const startSubscriberForecastMulticastJob = () => {
  logger.debug('setup cron job');
  subscriberMulticastJob.setup(subscriberForecastMulticast);
  // subscriberForecastMulticast();
};

module.exports = { startSubscriberForecastMulticastJob };
