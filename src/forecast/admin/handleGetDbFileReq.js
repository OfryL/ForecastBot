const fs = require('fs');
const logger = require('../../logger/telegramLogger')('app_forecast_handleGetDbFileReq');
const { dbFilePath } = require('../../dao/subscribeDao');

const handleGetDbFileReq = async (ctx) => {
  logger.log('Sending db file');
  if (!fs.existsSync(dbFilePath)) {
    await ctx.reply('No subscribers db file yet.');
    return;
  }
  await ctx.replyWithDocument({ source: dbFilePath });
};

module.exports = handleGetDbFileReq;
