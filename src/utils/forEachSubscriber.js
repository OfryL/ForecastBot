const subscribeDao = require('../dao/subscribeDao');
const logger = require('../logger/telegramLogger')('app_forEachSubscriber');
const { isBlockBotError, handleUserBlockBot } = require('./user');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Telegram allows ~30 messages/sec overall; keep broadcasts gentle.
const DELAY_BETWEEN_SENDS_MS = 50;

/**
 * Run `fn(subscriber)` sequentially for every active subscriber.
 * One failing subscriber never aborts the rest; chats that blocked/removed
 * the bot are unsubscribed automatically.
 */
const forEachSubscriber = async (fn) => {
  const subscribers = await subscribeDao.getAllSubscribers();
  let sent = 0;
  let failed = 0;

  // eslint-disable-next-line no-restricted-syntax
  for (const subscriber of subscribers) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await fn(subscriber);
      sent += 1;
    } catch (error) {
      failed += 1;
      if (isBlockBotError(error)) {
        // eslint-disable-next-line no-await-in-loop
        await handleUserBlockBot(subscriber.chatId);
      } else {
        logger.error(error.stack || `failed for subscriber ${JSON.stringify(subscriber)} - ${error}`);
      }
    }
    // eslint-disable-next-line no-await-in-loop
    await sleep(DELAY_BETWEEN_SENDS_MS);
  }

  logger.debug(`forEachSubscriber done: ${sent} ok, ${failed} failed`);
  return { sent, failed, total: subscribers.length };
};

module.exports = { forEachSubscriber };
