const logger = require('./logger/telegramLogger')("app_serverToolsWare");
const config = require('config');
var moment = require('moment');

const os = require('os');
const http = require('http');

function authUser(ctx) {
  let user = {
    username: ctx.message.from.username
  };
  if (user.username !== config.get('telegramBot.managerUsername')) {
    logger.debug("Unauthorize: " + user.username);
    logger.warn("Unauthorize: " + user.username);
    //todo this replay to evry msg? ctx.reply("Unauthorize");
    return false;
  } else {
    return true;
  }
}

function formatBytes(bytes) {
    if(bytes < 1024) return bytes + " Bytes";
    else if(bytes < 1048576) return(bytes / 1024).toFixed(3) + " KB";
    else if(bytes < 1073741824) return(bytes / 1048576).toFixed(3) + " MB";
    else return(bytes / 1073741824).toFixed(3) + " GB";
}

function getWanIp() {
	return new Promise(function(resolve) {
    http.get('http://bot.whatismyipaddress.com', function(res){
      res.setEncoding('utf8');
      res.on('data', function(chunk){
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
        "platform: " + os.platform() +
        "\nhostname: " + os.hostname() +
        "\nprocess freemem: " + formatBytes(os.freemem())
      );
  } else if (ctx.message.text.includes('ophelp') && authUser(ctx)) {
    ctx.reply("Available cmds:\n" +
        "/getOsInfo\n" +
        "/getUptime\n" +
        "/getWanIp\n" +
        "/getIp");
  }
}

module.exports = async function(ctx, next) {
  try {
  	await parseMsg(ctx);
  } catch(err) {
    const ctxData = JSON.stringify(ctx.message);
    logger.debug(err + '\nData: ' + ctxData);
    logger.error(err.stack || err);
  }
  next();
};