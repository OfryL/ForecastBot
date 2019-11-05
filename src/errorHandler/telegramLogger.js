const util = require('util');
const http = require('https');
const logger = require('../logger')("app.telegramLogger");
const config = require('config');

const token = config.get('telegramBot.token');
const loggerChatId = config.get('telegramBot.loggerChatId');

module.exports = function() {
  'use strict';

  function log(msg) {
    return logToRemote('#info', msg);
  }

  function warn(msg) {
    return logToRemote('#warn', `<b>Warning:</b>\n${msg}`);
  }

  function error(err, errorDesc) {
    logger.debug('Logging to telegramLogger');
    let stack = "";
    try {
      if (err && err.stack) {
        stack = err.stack.toString();
      }
    } catch(exp) {
      logger.error('error gettig stack: ', exp);
    }

    const tagsToReplace = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;'
    };

    stack = stack.replace(/[&<>]/g, (tag) => {
      return tagsToReplace[tag] || tag;
    });

    const newErrorDesc = `<i>${errorDesc}</i>\n${err}\n<code>${stack}</code>`;
    return logToRemote('#extError #error', `<b>An Error Has Occurred:</b>\n${newErrorDesc}`);
  }

  function logErr(err) {
    let msg = err;
    if (err && err.stack) {
      msg += `\ntrace:\n${err.stack}`;
    }
    return logToRemote('#error', `<b>An Error Has Occurred:</b>\n${msg}`);
  }

  function logToRemote(lvl, msg) {
    const msgText = `${msg}\n${lvl}`;
    try {
      logger.debug(`Sending logs to remote chatId#${loggerChatId}`);
      sendMessageViaHttpReq(msgText, function(response) {
        response.setEncoding('utf8');
        if (!util.isNullOrUndefined(response.statusCode) && response.statusCode !== 200){
          try {
            sendMessageViaHttpReq(`<b>An Error Has Occurred During sending telegram logs, read server log for more info</b>`, function(response) {});
          } catch (e) { } //do not log it.
          logger.error(`Error while sending http req, got error ${response.statusCode}: ${response.statusMessage}\nData was:\nInnerData was:\n${msgText}`);
          response.on('data', function (chunk) {
            logger.error('RESPONSE BODY: ' + chunk);
          });
        }
      });
    } catch(err) {
      logger.error('telegram log http req failed\n' + err);
    }
  }

  function sendMessageViaHttpReq (msgText, responseHandler) {
    const data = JSON.stringify({
      chat_id: loggerChatId,
      text: msgText,
      parse_mode: 'HTML'
    });

    const options = {
      // host: '149.154.167.40',
      host: 'api.telegram.org',
      port: 443,
      path: "/bot" + token + "/sendMessage",
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };
      let req = http.request(options, responseHandler);
      req.write(data);
      req.end();
  }

  return {
    log,
    warn,
    error
  };
}();
