const Composer = require('telegraf/composer');
const fs = require('fs');
const Screenshot = require('../utils/screenshot');

const logger = require('../logger/telegramLogger')('app_forecast_handleForecastReq');

const { botUsername, getForecastCmd } = require('../utils/consts');
const { getSpotFromCommand } = require('../utils/spots');
const showUploadStatus = require('../utils/showUploadStatus');

const { saveDirPath, contextMetadataKeys } = require('../utils/consts');

async function getForecast(ctx) {
  logger.log(`processing request from ${ctx.message.from.first_name}(@${ctx.message.from.username})`);

  const spot = getSpotFromCommand(ctx.message.text);

  const { stop: stopShowUploadPhotoStatus } = await showUploadStatus(ctx);

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
        spot: { ...spot, tName: ctx.i18n.t(spot.name) },
        username: ctx.metadata[contextMetadataKeys.BOT_USERNAME],
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

const bot = new Composer();

bot.command(`${getForecastCmd}`, getForecast);
bot.command(`${getForecastCmd}@${botUsername}`, getForecast);

module.exports = bot;
