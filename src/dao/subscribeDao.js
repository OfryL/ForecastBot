const path = require('path');
const logger = require('../logger/telegramLogger')('app_subscribeDao');
const { openStore } = require('./db');
const { dbDirPath } = require('../utils/consts');

const DB_FILE_NAME = 'subscribers.db';
const dbFilePath = path.join(dbDirPath, DB_FILE_NAME);

const db = () => openStore(DB_FILE_NAME);

// Subscribers are soft-deleted so the history survives.
const notDeleted = { deletedAt: { $exists: false } };

const getSubscriber = async (chatId) => {
  logger.debug(`getting ${chatId}`);
  return db().findOneAsync({ ...notDeleted, chatId });
};

const addSubscriber = async ({
  userDesc, chatId, spot, lang,
}) => {
  logger.debug(`adding ${chatId} (${spot}, ${lang})`);
  const now = new Date();
  return db().insertAsync({
    userDesc,
    chatId,
    spot,
    lang,
    createdAt: now,
    updatedAt: now,
  });
};

const updateSubscriber = async (chatId, patch) => {
  logger.debug(`updating ${chatId}: ${JSON.stringify(patch)}`);
  const { numAffected } = await db().updateAsync(
    { ...notDeleted, chatId },
    { $set: { ...patch, updatedAt: new Date() } },
    { multi: true },
  );
  return numAffected;
};

const removeSubscriber = async (chatId) => {
  logger.debug(`removing ${chatId}`);
  const { numAffected } = await db().updateAsync(
    { ...notDeleted, chatId },
    { $set: { deletedAt: new Date() } },
    { multi: true },
  );
  if (numAffected === 0) {
    throw new Error(`chat ${chatId} is not subscribed`);
  }
  return numAffected;
};

const getAllSubscribers = async () => {
  logger.debug('get all subscribers');
  return db().findAsync(notDeleted);
};

module.exports = {
  dbFilePath,
  getSubscriber,
  addSubscriber,
  updateSubscriber,
  removeSubscriber,
  getAllSubscribers,
};
