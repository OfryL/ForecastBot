const bluebird = require('bluebird');
const subscribeDao = require('../dao/subscribeDao');

const logger = require('../logger/telegramLogger')('app_forecast_executeMulticastReq');

const executeMulticastReq = async (func) => {
  try {
    const subscribers = await subscribeDao.getAllSubscribers();
    await bluebird.mapSeries(subscribers, async (subscriber) => {
      logger.debug('subscriber', subscriber.userDesc, subscriber.chatId);
      await func(subscriber);
      logger.debug('done subscriber');
    });
  } catch (error) {
    logger.error(error.stack || `executeMulticastReq - ${error}`);
  }
};

module.exports = executeMulticastReq;
