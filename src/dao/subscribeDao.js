const Datastore = require('nedb');
const logger = require('../logger/telegramLogger')('app_subscribeDao');

const dbDirPath = `${process.cwd()}/lib/db/`;
const dbFileName = 'subscribers.db';

const db = new Datastore({
  filename: dbDirPath + dbFileName,
});

const notDeleted = {
  $not: {
    deletedAt: {
      $exists: true,
    },
  },
};

const getSubscriber = (chatId) => {
  logger.debug(`getting ${chatId}`);
  return new Promise((resolve, reject) => {
    db.loadDatabase((loadErr) => {
      if (loadErr) {
        logger.error(loadErr);
        reject(loadErr);
      }
      db.findOne({
        ...notDeleted,
        chatId,
      }, (err, doc) => {
        logger.debug(`doc ${JSON.stringify(doc)}`);
        if (err) {
          logger.error(err);
          reject(err);
        }
        resolve(doc);
      });
    });
  });
};

const addSubscriber = (userDesc, chatId, spot) => {
  logger.debug(`adding ${chatId}`);
  return new Promise((resolve, reject) => {
    db.loadDatabase((loadErr) => {
      if (loadErr) {
        logger.error(loadErr);
        reject(loadErr);
      }
      const subscriber = {
        userDesc,
        chatId,
        spot,
        createdAt: new Date(),
        updatedAt: new Date(),
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
};

const removeSubscriber = (chatId) => {
  logger.debug(`removing ${chatId}`);
  return new Promise((resolve, reject) => {
    db.loadDatabase((loadErr) => {
      if (loadErr) {
        logger.error(loadErr);
        reject(loadErr);
      }
      db.update({
        ...notDeleted,
        chatId,
      }, {
        $set: {
          deletedAt: new Date(),
        },
      }, {}, (err, numAffected) => {
        if (err) {
          logger.error(err);
          reject(err);
        }
        if (numAffected === 1) {
          resolve();
        } else {
          reject();
        }
      });
    });
  });
};

const getAllSubscribers = () => {
  logger.debug('get all');
  // return getSubscriber('');
  return new Promise((resolve, reject) => {
    db.loadDatabase((loadErr) => {
      if (loadErr) {
        logger.error(loadErr);
        reject(loadErr);
      }
      db.find(notDeleted, (err, docs) => {
        logger.debug(`docs ${JSON.stringify(docs)}`);
        if (err) {
          logger.error(err);
          reject(err);
        }
        resolve(docs);
      });
    });
  });
};

module.exports = {
  getSubscriber,
  addSubscriber,
  removeSubscriber,
  getAllSubscribers,
};
