const Datastore = require('nedb');
const logger = require('../logger/telegramLogger')('app_subscribeDao');

const dbDirPath = `${process.cwd()}/lib/db/`;
const dbFileName = 'subscribers.db';

const db = new Datastore({
  filename: dbDirPath + dbFileName,
});

module.exports = (function () {
  function getSubscriber(chatId) {
    logger.debug(`getting ${chatId}`);
    return new Promise((resolve, reject) => {
      db.loadDatabase((loadErr) => {
        if (loadErr) {
          logger.error(loadErr);
          reject(loadErr);
        }
        let exp = { chatId };
        if (!chatId) {
          exp = {};
        }
        db.find(exp, (err, docs) => {
          logger.debug(`docs ${JSON.stringify(docs)}`);
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
    logger.debug(`adding ${chatId}`);
    return new Promise((resolve, reject) => {
      db.loadDatabase((loadErr) => {
        if (loadErr) {
          logger.error(loadErr);
          reject(loadErr);
        }
        const subscriber = {
          chatId,
          spot,
        };
        db.insert(subscriber, (err, newDoc) => {
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
    logger.debug(`removing ${chatId}`);
    return new Promise((resolve, reject) => {
      db.loadDatabase((loadErr) => {
        if (loadErr) {
          logger.error(loadErr);
          reject(loadErr);
        }
        db.remove({ chatId }, (err, numRemoved) => {
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
    getAllSubscribers,
  };
}());
