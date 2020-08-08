const cron = require('node-cron');
const logger = require('./logger/telegramLogger')('app_subscriberMulticastJob');

module.exports = (function () {
  function setup(func) {
    try {
      cron.schedule('30 7 * * *', () => {
        logger.debug('running job');
        func();
      });
    } catch (e) {
      logger.error(e.stack || e);
    }
  }

  return {
    setup,
  };
}());
