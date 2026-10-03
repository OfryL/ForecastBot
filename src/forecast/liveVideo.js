const Composer = require('telegraf/composer');
const fs = require('fs');
const path = require('path');
const logger = require('../logger/telegramLogger')('app_forecast_liveVideo');
const { liveVideosSaveDirPath, liveVideoCmd, spotsCmd } = require('../utils/consts');
const { getDefaultSpot } = require('../utils/spots');
const getLiveStream = require('../utils/getLiveStream');
const { getChatDesc } = require('../utils/chatRepo');
const showChatAction = require('../utils/chatAction');

const CAPTURE_TIMEOUT_MS = 90 * 1000;

const withTimeout = (promise, ms, message) => Promise.race([
  promise,
  new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
]);

const liveVideo = async (ctx) => {
  logger.log(`liveVideo from: ${getChatDesc(ctx)}`);
  const spot = getDefaultSpot();

  if (!spot.liveUrl) {
    await ctx.reply(ctx.i18n.t('botReplays.liveVideo.unavailable'));
    return;
  }

  fs.mkdirSync(liveVideosSaveDirPath, { recursive: true });
  const savePath = path.join(liveVideosSaveDirPath, `${spot.key}.${Date.now()}.mp4`);
  const { stop } = await showChatAction(ctx, 'upload_video');

  try {
    await withTimeout(
      getLiveStream({ liveUrl: spot.liveUrl, savePath }),
      CAPTURE_TIMEOUT_MS,
      `live stream capture timed out after ${CAPTURE_TIMEOUT_MS}ms`,
    );
    await ctx.replyWithVideo({ source: savePath }, {
      caption: ctx.i18n.t('botReplays.liveVideo.liveVideoCaption', {
        spot: ctx.i18n.t(spot.name),
        spotsCmd,
      }),
    });
  } catch (error) {
    logger.error(error.stack || `liveVideo failed - ${error}`);
    await ctx.reply(ctx.i18n.t('botReplays.liveVideo.unavailable'));
  } finally {
    stop();
    fs.promises.unlink(savePath).catch(() => {});
  }
};

const bot = new Composer();
bot.command(liveVideoCmd, liveVideo);

module.exports = bot;
