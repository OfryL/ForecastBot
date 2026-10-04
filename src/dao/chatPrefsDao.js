const logger = require('../logger/telegramLogger')('app_chatPrefsDao');
const { openStore } = require('./db');

const DB_FILE_NAME = 'chatPrefs.db';
const db = () => openStore(DB_FILE_NAME);

// Small in-memory cache so every incoming message doesn't hit the disk.
const langCache = new Map();

const getLang = async (chatId) => {
  if (langCache.has(chatId)) {
    return langCache.get(chatId);
  }
  const doc = await db().findOneAsync({ chatId });
  const lang = doc ? doc.lang : null;
  langCache.set(chatId, lang);
  return lang;
};

const setLang = async (chatId, lang) => {
  logger.debug(`chat ${chatId} lang -> ${lang}`);
  await db().updateAsync(
    { chatId },
    { $set: { chatId, lang, updatedAt: new Date() } },
    { upsert: true },
  );
  langCache.set(chatId, lang);
};

module.exports = { getLang, setLang };
