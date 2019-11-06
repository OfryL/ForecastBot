const logger = require('./logger/telegramLogger')("app_subscriberMulticastJob");
const cron = require('node-cron');

module.exports = function() {
  'use strict';

  function setup(func) {
    try {
      cron.schedule('30 7 * * *', function () {
        logger.debug('running job');
        func();
      });
    } catch (e) {
      logger.error(e.stack || e);
    }
  }

  return {
    setup
  };
}();
