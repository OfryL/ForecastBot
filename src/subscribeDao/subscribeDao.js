/*jshint esversion: 6 */

const log4js = require('log4js');

const logger = log4js.getLogger("subscribeDao");

module.exports = function() {

const subscribers = [];

function getSubscriber(chatID){
  logger.debug('getting ' + chatID);
  return subscribers.indexOf(chatID);
}

function addSubscriber(chatID){
  logger.debug('adding ' + chatID);
  subscribers.push(chatID);
}

function removeSubscriber(chatID){
  logger.debug('removing ' + chatID);
  subscribers.splice(getSubscriber(chatID), 1);
}

function getAllSubscribers(){
  logger.debug('get all');
  return subscribers;
}


  return {
    getSubscriber,
    addSubscriber,
    removeSubscriber,
    getAllSubscribers
  };
}();
