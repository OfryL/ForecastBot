const sysDebugger = require('util');
const debug = sysDebugger.debuglog('app.logger');
const sysLogger = console;

const CREATINGNEWLOGGER = 'Creating new logger';
const style = {
    'info': {'title': "info", 'colorCode': 34},
    'warn': {'title': "warn", 'colorCode': 33},
    'error': {'title': "error", 'colorCode': 31},
    'debug': {'title': "debug", 'colorCode': 47}
};

const getFormatHeader = function (namespace,lvl,colorCode) {
    let time = new Date().toLocaleString();
    return `[${time}] [${namespace}] \x1b[${colorCode}m[${lvl}]\x1b[0m `;
};

function Logger(namespace) {
    this.debugger = sysDebugger.debuglog(namespace);
    this.loggerName = namespace;
}

Logger.prototype.log = function (message, ...optionalParams) {
    sysLogger.log(getFormatHeader(this.loggerName, style.info.title, style.info.colorCode) + message, ...optionalParams);
};

Logger.prototype.warn = function (message, ...optionalParams) {
    sysLogger.warn(getFormatHeader(this.loggerName, style.warn.title, style.warn.colorCode) + message, ...optionalParams);
};

Logger.prototype.error = function (message, ...optionalParams) {
    sysLogger.warn(getFormatHeader(this.loggerName, style.error.title, style.error.colorCode) + message, ...optionalParams);
};

Logger.prototype.debug = function (message, ...optionalParams) {
    this.debugger(getFormatHeader(this.loggerName, style.debug.title, style.debug.colorCode) + message, ...optionalParams);
};

const initLogger = function (namespace){
    debug(getFormatHeader(namespace,) + CREATINGNEWLOGGER);
    return new Logger(namespace);
};

module.exports = initLogger;