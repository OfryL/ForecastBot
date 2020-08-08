const util = require('util');
const http = require('https');
const config = require('config');
const sysLogger = require('./logger');

const TELEGRAM_LOGGER = 'telegramLogger';
const debug = util.debuglog(TELEGRAM_LOGGER);
const logger = sysLogger(TELEGRAM_LOGGER);

const token = config.get('telegramBot.token');
const loggerChatId = config.get('telegramBot.loggerChatId');

function formatHtml(obj) {
  let str = obj.toString();
  const tagsToReplace = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
  };
  str = str.replace(/[&<>]/g, (tag) => tagsToReplace[tag] || tag);
  return str;
}

function formatMsgText(namespace, lvl, msg) {
  return `<i>[#${namespace}]</i> <b>[#${lvl}]</b> - <code>${msg}</code>`;
}

const sendMessageViaHttpReq = function (msgText, responseHandler) {
  const data = JSON.stringify({ chat_id: loggerChatId, text: msgText, parse_mode: 'HTML' });
  const options = {
    host: 'api.telegram.org', port: 443, path: `/bot${token}/sendMessage`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
  };
  const req = http.request(options, responseHandler);
  req.write(data);
  req.end();
};

const logToRemote = function (namespace, lvl, msg) {
  const msgText = formatMsgText(namespace, lvl, msg);
  try {
    logger.debug(`Sending logs to remote chatId#${loggerChatId}`);
    sendMessageViaHttpReq(msgText, (response) => {
      response.setEncoding('utf8');
      if (response.statusCode !== undefined
        && response.statusCode !== null
        && response.statusCode !== 200) {
        try {
          sendMessageViaHttpReq(
            '<b>An Error Has Occurred During sending telegram logs, read server log for more info</b>',
            () => {},
          );
        } catch (e) {
          debug(e);
        }
        logger.error(`Error while sending http req, got error ${response.statusCode}: ${response.statusMessage}\nData was:\nInnerData was:\n${msgText}`);
        response.on('data', (chunk) => {
          logger.debug(`RESPONSE BODY: ${chunk}`);
        });
      }
    });
  } catch (err) {
    logger.error(err.stack || `telegram log http req failed\n${err}`);
  }
};

function TelegramLogger(namespace) {
  this.sysLogger = sysLogger(namespace);
  this.loggerName = namespace;
}

TelegramLogger.prototype.log = function (message, ...optionalParams) {
  this.sysLogger.log(message, ...optionalParams);
  logToRemote(this.loggerName, 'info', message);
};

TelegramLogger.prototype.warn = function (message, ...optionalParams) {
  this.sysLogger.warn(message, ...optionalParams);
  logToRemote(this.loggerName, 'warning', message);
};

TelegramLogger.prototype.error = function (message, ...optionalParams) {
  this.sysLogger.error(message, ...optionalParams);
  logToRemote(this.loggerName, 'error', formatHtml(message.stack || message));
};

TelegramLogger.prototype.debug = function (message, ...optionalParams) {
  this.sysLogger.debug(message, ...optionalParams);
};

const initLogger = function (namespace) {
  const loggerInstance = new TelegramLogger(namespace);
  return loggerInstance;
};

module.exports = initLogger;
