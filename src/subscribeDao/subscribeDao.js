const logger = require('../logger/telegramLogger')("app_subscribeDao");

const dbDirPath = process.cwd() + '/lib/db/';
const dbFileName = 'subscribers.db';

const Datastore = require('nedb');
var db = new Datastore({
  filename: dbDirPath + dbFileName
});

module.exports = function() {
  'use strict';

  function getSubscriber(chatId) {
    logger.debug('getting ' + chatId);
    return new Promise(function(resolve, reject) {
      db.loadDatabase(function(err) {
        if (err) {
          logger.error(err);
          reject(err);
        }
        let exp = {chatId};
        if (!chatId) {
          exp = {};
        }
        db.find(exp, function(err, docs) {
          logger.debug('docs ' + JSON.stringify(docs));
          if (err) {
            logger.error(err);
            reject(err);
          }
          resolve(docs);
        });
      });
    });
  }

  function addSubscriber(chatId, spot) {
    logger.debug('adding ' + chatId);
    return new Promise(function(resolve, reject) {
      db.loadDatabase(function(err) {
        if (err) {
          logger.error(err);
          reject(err);
        }
        let subscriber = {
          chatId,
          spot
        };
        db.insert(subscriber, function(err, newDoc) {
          if (err) {
            logger.error(err);
            reject(err);
          }
          resolve(newDoc);
        });
      });
    });
  }

  function removeSubscriber(chatId) {
    logger.debug('removing ' + chatId);
    return new Promise(function(resolve, reject) {
      db.loadDatabase(function(err) {
        if (err) {
          logger.error(err);
          reject(err);
        }
        db.remove({ chatId }, function(err, numRemoved) {
          if (err) {
            logger.error(err);
            reject(err);
          }
          if (numRemoved === 1) {
            resolve();
          } else {
            reject();
          }
        });
      });
    });
  }

  function getAllSubscribers() {
    logger.debug('get all');
    return getSubscriber('');
  }


  return {
    getSubscriber,
    addSubscriber,
    removeSubscriber,
    getAllSubscribers
  };
}();
