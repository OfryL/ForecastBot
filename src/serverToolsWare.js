const logger = require('./logger')("app.serverToolsWare");
const telegramLogger = require('./errorHandler/telegramLogger');
const config = require('config');
var moment = require('moment');

const os = require('os');
const http = require('http');

function authUser(ctx) {
  let user = {
    username: ctx.message.from.username
  };
  if (user.username !== config.get('telegramBot.managerUsername')) {
    logger.warn("Unauthorize: " + user.username);
    telegramLogger.logWarn("Unauthorize: " + user.username);
    ctx.reply("Unauthorize");
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
  if (!authUser(ctx)){
    return;
  }

	if (ctx.message.text.includes('getIp')) {
	  const ifaces = os.networkInterfaces();
		ctx.reply(JSON.stringify(ifaces));
	}
  if (ctx.message.text.includes('getWanIp')) {
    ctx.reply(await getWanIp());
  }
  if (ctx.message.text.includes('getUptime')) {
    ctx.reply(moment()
          .subtract('seconds', os.uptime())
          .toString());
  }
  if (ctx.message.text.includes('getOsInfo')) {
    ctx.reply(
        "platform: " + os.platform()
      + "\nhostname: " + os.hostname()
      + "\nos freemem: " + formatBytes(os.freemem())
      );
  }
}

module.exports = async function(ctx, next) {
  try {
  	await parseMsg(ctx);
  } catch(err) {
    const ctxData = JSON.stringify(ctx.message);
    logger.error(err + '\nData: ' + ctxData);
    telegramLogger.extLogErr(err, 'serverToolsWare');
  }
  next();
}