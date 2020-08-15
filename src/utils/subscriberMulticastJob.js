const cron = require('node-cron');
const logger = require('../logger/telegramLogger')('app_subscriberMulticastJob');

const setup = (func) => {
  try {
    cron.schedule('30 6 * * *', () => {
      logger.debug('running job');
      func();
    }, {
      scheduled: true,
      timezone: 'Asia/Jerusalem',
    });
  } catch (e) {
    logger.error(e.stack || e);
  }
};

module.exports = {
  setup,
};
