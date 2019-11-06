const util = require('util');
const http = require('https');
const sysLogger = require('./logger');
const logger = sysLogger('telegramLogger');

const CREATINGNEWLOGGER = 'Creating new tgLogger';

const config = require('config');
const token = config.get('telegramBot.token');
const loggerChatId = config.get('telegramBot.loggerChatId');

function formatHtml(str) {
    str = str.toString();
    const tagsToReplace = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;'
    };
    str = str.replace(/[&<>]/g, (tag) => {
        return tagsToReplace[tag] || tag;
    });
    return str;
}

function formatMsgText(namespace, lvl, msg) {
    return `<i>[#${namespace}]</i> <b>[#${lvl}]</b> - <code>${msg}</code>`;
}

const logToRemote = function (namespace, lvl, msg) {
    const msgText = formatMsgText(namespace, lvl, msg);
    try {
        logger.debug(`Sending logs to remote chatId#${loggerChatId}`);
        sendMessageViaHttpReq(msgText, function (response) {
            response.setEncoding('utf8');
            if (response.statusCode !== undefined && response.statusCode !== null && response.statusCode !== 200) {
                try {
                    sendMessageViaHttpReq(`<b>An Error Has Occurred During sending telegram logs, read server log for more info</b>`, function (response) {});
                } catch (e) { } //do not log it.
                logger.error(`Error while sending http req, got error ${response.statusCode}: ${response.statusMessage}\nData was:\nInnerData was:\n${msgText}`);
                response.on('data', function (chunk) {
                    logger.debug('RESPONSE BODY: ' + chunk);
                });
            }
        });
    } catch (err) {
        logger.error(err.stack | 'telegram log http req failed\n' + err);
    }
};

const sendMessageViaHttpReq = function (msgText, responseHandler) {
    const data = JSON.stringify({chat_id: loggerChatId, text: msgText, parse_mode: 'HTML'});
    const options = {host: 'api.telegram.org', port: 443, path: "/bot" + token + "/sendMessage", method: 'POST', headers: {'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data)}};
    let req = http.request(options, responseHandler);
    req.write(data);
    req.end();
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
    let logger = new TelegramLogger(namespace);
    logger.debug(CREATINGNEWLOGGER);
    return logger;
};

module.exports = initLogger;