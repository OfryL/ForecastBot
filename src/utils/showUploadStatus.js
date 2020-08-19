const logger = require('../logger/telegramLogger')('app_forecast_showUploadStatus');

async function showUploadStatus(ctx, status = 'upload_photo') {
  let { replyWithChatAction } = ctx;
  await replyWithChatAction(status);

  const intervalObj = setInterval(() => {
    if (replyWithChatAction) {
      replyWithChatAction(status);
    }
  }, 3000);

  const stop = () => {
    logger.debug(`clearing ${status} replyWithChatAction...`);
    clearInterval(intervalObj);
    replyWithChatAction = null;
  };
  return { stop };
}

module.exports = showUploadStatus;
