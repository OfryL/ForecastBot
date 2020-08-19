const Composer = require('telegraf/composer');
const path = require('path');
const moment = require('moment');
const logger = require('../logger/telegramLogger')('app_forecast_liveVideo');
const {
  liveVideosSaveDirPath, spotsCmd, liveVideoCmd, botUsername,
} = require('../utils/consts');
const { spots } = require('../utils/spots');
const getLiveStream = require('../utils/getLiveStream');
const { getChatDesc } = require('../utils/chatRepo');
const showUploadStatus = require('../utils/showUploadStatus');

const getSavePath = (filename) => path.join(liveVideosSaveDirPath, `${filename}.${moment().valueOf()}.mp4`);

const liveVideo = async (ctx) => {
  logger.log(`liveVideo from: ${getChatDesc(ctx)}`);

  const spot = spots.TelAviv;
  const savePath = getSavePath(spot.filename);

  const { stop: stopShowUploadVideoStatus } = await showUploadStatus(ctx, 'upload_video');

  await getLiveStream({
    liveUrl: spot.liveUrl,
    savePath,
  });

  await ctx.replyWithVideo(
    { source: savePath },
    {
      caption: ctx.i18n.t('botReplays.liveVideo.liveVideoCaption', {
        spot: { ...spot, tName: ctx.i18n.t(spot.name) },
        spotsCmd,
      }),
    },
  );

  stopShowUploadVideoStatus();
};

const bot = new Composer();

bot.command(`${liveVideoCmd}`, liveVideo);
bot.command(`${liveVideoCmd}@${botUsername}`, liveVideo);

module.exports = bot;
