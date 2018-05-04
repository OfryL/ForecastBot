/*jshint esversion: 6 */
const log4js = require('log4js');
const logger = log4js.getLogger("subscriberMulticastJob");
const cron = require('node-cron');

module.exports = function() {
  'use strict';

  function setup(func) {
    // cron.schedule('30 7 * * *', function(){
    cron.schedule('30 7 * * *', function(){
      logger.info('running job');
      func();
    });
  }

  return {
    setup
  };
}();
