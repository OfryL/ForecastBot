const logger = require('log4js').getLogger("middlewareLogger");
const telegramLogger = require('./telegramLogger');

module.exports = function() {
  'use strict';

  function middleware() {
    return (ctx, next) => {
      const ctxData = JSON.stringify(ctx.message);
      return next().catch((err) => {
        const errorDesc = err + '\nData: ' + ctxData;
        telegramLogger.extLogErr(logger, err, errorDesc);
      });
    };
  }

  return middleware;
}();
