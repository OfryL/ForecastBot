var http = require('https');
const logger = require('log4js').getLogger("telegramLogger");
const config = require('config');

const token = config.get('telegramBot.token');
const loggerChatId = config.get('telegramBot.loggerChatId');

module.exports = function() {
  'use strict';

  function logInfo(msg) {
    return log('info', msg);
  }

  function logWarn(msg) {
    return log('warn', msg);
  }

  function extLogErr(localLogger, err, errorDesc) {
    let stack = "";
    try {
      if (err && err.stack) {
        stack = err.stack.toString();
      }
    } catch(exp) {
      log('error gettig stack: ', exp);
    }
    const newErrorDesc = errorDesc + '\n' + err + '\n' + stack;

    localLogger.error(newErrorDesc);
    return log('extError', newErrorDesc);
  }

  function logErr(err) {
    let msg = err;
    if (err && err.stack) {
      msg += "\ntrace:\n" + err.stack;
    }
    return log('error', msg);
  }

  function log(lvl, msg) {
    const data = JSON.stringify({
      chat_id: loggerChatId,
      text: lvl + ' : ' + msg
    });

    // host: '149.154.167.40',

    const options = {
      host: 'api.telegram.org',
      port: 443,
      path: "/bot" + token + "/sendMessage",
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    try {
      let req = http.request(options, function(res) {
        res.setEncoding('utf8'); //// TODO: Catch here
        // res.on('data', function(chunk) {
        //   // logger.debug("body: " + chunk);
        // });
      });

      req.write(data);
      req.end();
    } catch(err) {
      logger.error('telegram log failed' + err);
    }
  }

  return {
    logInfo,
    logWarn,
    logErr,
    extLogErr,
    log
  };
}();
