const logger = require('./logger')("app.subscriberMulticastJob");
const cron = require('node-cron');

module.exports = function() {
  'use strict';

  function setup(func) {
    cron.schedule('30 7 * * *', function(){
      logger.debug('running job');
      func();
    });
  }

  return {
    setup
  };
}();
