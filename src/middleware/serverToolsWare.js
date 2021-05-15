const os = require('os');
const http = require('http');
const config = require('config');
const moment = require('moment');
const logger = require('../logger/telegramLogger')('app_serverToolsWare');

function authUser(ctx) {
  const user = {
    username: ctx.message.from.username,
  };
  if (user.username !== config.get('telegramBot.managerUsername')) {
    logger.debug(`Unauthorize: ${user.username}`);
    logger.warn(`Unauthorize: ${user.username}`);
    // todo this replay to evry msg? ctx.reply("Unauthorize");
    return false;
  }
  return true;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} Bytes`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(3)} KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(3)} MB`;
  return `${(bytes / 1073741824).toFixed(3)} GB`;
}

function getWanIp() {
  return new Promise((resolve) => {
    http.get('http://bot.whatismyipaddress.com', (res) => {
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        resolve(chunk);
      });
    });
  });
}

async function parseMsg(ctx) {
  if (ctx.message.text.includes('getIp') && authUser(ctx)) {
    const ifaces = os.networkInterfaces();
    ctx.reply(JSON.stringify(ifaces));
  } else if (ctx.message.text.includes('getWanIp') && authUser(ctx)) {
    ctx.reply(await getWanIp());
  } else if (ctx.message.text.includes('getUptime') && authUser(ctx)) {
    ctx.reply(moment()
      .subtract(os.uptime(), 'seconds')
      .toString());
  } else if (ctx.message.text.includes('getOsInfo') && authUser(ctx)) {
    ctx.reply(
      `platform: ${os.platform()
      }\nhostname: ${os.hostname()
      }\nprocess freemem: ${formatBytes(os.freemem())}`,
    );
  } else if (ctx.message.text.includes('ophelp') && authUser(ctx)) {
    ctx.reply('Available cmds:\n'
        + '/getOsInfo\n'
        + '/getUptime\n'
        + '/getWanIp\n'
        + '/getIp');
  }
}

module.exports = async (ctx, next) => {
  try {
    if (ctx.message && ctx.message.text) {
      await parseMsg(ctx);
    }
  } catch (err) {
    const ctxData = JSON.stringify(ctx.message);
    logger.debug(`${err}\nData: ${ctxData}`);
    logger.error(err.stack || err);
  }
  next(ctx);
};
