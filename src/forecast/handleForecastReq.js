const fs = require('fs');
const Screenshot = require('../utils/screenshot');

const logger = require('../logger/telegramLogger')('app_forecast_handleForecastReq');

const { getSpotFromCommand } = require('../utils/spots');

const { saveDirPath, contextMetadataKeys } = require('../utils/consts');

async function showUploadPhotoStatus(ctx) {
  let { replyWithChatAction } = ctx;
  await replyWithChatAction('upload_photo');

  const intervalObj = setInterval(() => {
    if (replyWithChatAction) {
      replyWithChatAction('upload_photo');
    }
  }, 3000);

  const stop = () => {
    logger.debug('clearing upload_photo replyWithChatAction...');
    clearInterval(intervalObj);
    replyWithChatAction = null;
  };
  return stop;
}

async function handleForecastReq(ctx) {
  logger.log(`processing request from ${ctx.message.from.first_name}(@${ctx.message.from.username})`);

  const spot = getSpotFromCommand(ctx.message.text);

  ctx.reply(ctx.i18n.t('botReplays.forecastReq.processing'));

  const stopShowUploadPhotoStatus = await showUploadPhotoStatus(ctx);

  let imagePath = '';
  try {
    imagePath = await Screenshot.getScreenshot(spot.url, spot.filename, saveDirPath);
  } catch (error) {
    logger.error(error.stack || `error while getting the screenshot - ${error}`);
  }

  try {
    const fileContent = await fs.readFileSync(imagePath);
    ctx.replyWithPhoto({ source: fileContent }, {
      caption: ctx.i18n.t('botReplays.forecastReq.forecastReqReply', {
        spot, username: ctx.metadata[contextMetadataKeys.BOT_USERNAME],
      }),
      parse_mode: 'HTML',
    });
  } catch (error) {
    const description = !(error.response === undefined || error.response === null) ? error.response.description : '';
    logger.error(error.stack || `while sending forecast msg (#${error.code})\n${description}\n${error}`);
  }
  stopShowUploadPhotoStatus();
  logger.debug('done');
}

module.exports = handleForecastReq;
