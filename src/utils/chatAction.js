const logger = require('../logger/telegramLogger')('app_chatAction');

// Telegram shows a chat action ("typing...", "uploading video...") for ~5s,
// so keep re-sending it until the caller is done.
const REFRESH_MS = 4000;

async function showChatAction(ctx, action = 'typing') {
  const send = () => ctx.replyWithChatAction(action)
    .catch((err) => logger.debug(`chat action failed: ${err.message || err}`));

  await send();
  const interval = setInterval(send, REFRESH_MS);

  const stop = () => clearInterval(interval);
  return { stop };
}

module.exports = showChatAction;
