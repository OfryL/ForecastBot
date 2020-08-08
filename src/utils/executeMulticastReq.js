const subscribeDao = require('../dao/subscribeDao');

const logger = require('../logger/telegramLogger')('app_forcastbot_executeMulticastReq');

const executeMulticastReq = async (func) => {
  const promises = [];
  try {
    const subscribers = await subscribeDao.getAllSubscribers();
    for (let index = 0; index < subscribers.length; index += 1) {
      const s = subscribers[index];
      promises.push(func(s));
    }
    await Promise.all(promises);
  } catch (error) {
    logger.error(error.stack || `executeMulticastReq - ${error}`);
  }
};

module.exports = executeMulticastReq;
