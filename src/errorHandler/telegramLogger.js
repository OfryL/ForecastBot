const http = require('https');
const logger = require('log4js').getLogger("telegramLogger");
const config = require('config');

const token = config.get('telegramBot.token');
const loggerChatId = config.get('telegramBot.loggerChatId');

module.exports = function() {
  'use strict';


  function logInfoProd(msg) {
    if (process.env.NODE_ENV !== 'production') {
      return;
    }
    return logInfo('#info #prod', msg);
  }

  function logInfo(msg) {
    return log('#info', msg);
  }

  function logWarn(msg) {
    return log('#warn', `<b>Warning:</b>\n${msg}`);
  }

  function extLogErr(err, errorDesc) {
    let stack = "";
    try {
      if (err && err.stack) {
        stack = err.stack.toString();
      }
    } catch(exp) {
      log('error gettig stack: ', exp);
    }
    const newErrorDesc = `<i>${errorDesc}</i>\n${err}\n<code>${stack}<code>`;

    return log('#extError #error', `<b>An Error Has Occurred:</b>\n${newErrorDesc}`);
  }

  function logErr(err) {
    let msg = err;
    if (err && err.stack) {
      msg += `\ntrace:\n${err.stack}`;
    }
    return log('#error', `<b>An Error Has Occurred:</b>\n${msg}`);
  }

  function log(lvl, msg) {
    const data = JSON.stringify({
      chat_id: loggerChatId,
      text: `${msg}\n${lvl}`,
      parse_mode: 'HTML'
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
    logInfoProd,
    logInfo,
    logWarn,
    logErr,
    extLogErr,
    log
  };
}();
