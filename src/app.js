const config = require('config');
const log4js = require('log4js');

const configLogs = function() {
  log4js.configure({
    appenders: {
      appLogs: {
        type: 'file',
        filename: 'app.log'
      },
      console: {
        type: 'console'
      }
    },
    categories: {
      default: {
        appenders: config.get('logger.appenders'),
        level: config.get('logger.level.default')
      }
    },
    "replaceConsole": true
  });
}();

const Telegraf = require('telegraf');
const telegramLogger = require('./errorHandler/telegramLogger');
const errorHandlerMiddleware = require('./errorHandler/errorHandlerMiddleware');
const forcastbot = require('./forcastbot');
const localtunnel = require('localtunnel');
const logger = log4js.getLogger("app");
logger.info("running on '"+ process.env.NODE_ENV +"' env");
logger.debug("logging lvl set to - " + config.get('logger.level.default'));

const fastify = require('fastify')({logger: {level: config.get('logger.level.fastify'), prettyPrint: true}});

const localtunnelport = config.get('telegramBot.httpserver.localtunnelport');

function setupTunnel(onCloseCallback) {
  return new Promise((resolve, reject) => {
    var tunnel = localtunnel(localtunnelport, function(err, tunnel) {
      if (err) {
        logger.error(err);
        reject(err);
      }
      logger.info(tunnel.url);
      resolve(tunnel.url);
    });
    tunnel.on('close', function() {
      logger.warn('tunnel closed');
      onCloseCallback();
    });
  });
}

function setupFastisyServer(telegramBot) {
  fastify.log.debug("seting up fastify");
  fastify.get('/', function(request, reply) {
    reply.send({
      hello: 'world'
    });
  });

  fastify.use(telegramBot.webhookCallback('/secret-path'));

  fastify.listen(localtunnelport, '127.0.0.1', function(err) {
    if (err) {
      logger.trace(err);
      throw err;
    }
    logger.debug(`server listening on ${fastify.server.address().port}`);
  });
}


logger.info("connecting telegram api");
const bot = new Telegraf(config.get('telegramBot.token'));
bot.use(errorHandlerMiddleware());
forcastbot.setupForcastBot(bot);

if (config.get('telegramBot.tunnel')){
  setupTunnel(() => {}).then((tunnelUrl) => {
    bot.telegram.setWebhook(tunnelUrl + '/secret-path');
    setupFastisyServer(bot);
  }).catch((err) => {
    logger.error("Error on tunnel: " + err);
  });
} else {
  logger.debug("clearing old webhook");
  bot.telegram.deleteWebhook().then((success) => {
    if (success) {
      logger.debug("start bot on polling mode");
      bot.startPolling().catch((err) => {
        const errorDesc = "error polling " + err;
        telegramLogger.extLogErr(logger, err, errorDesc);
      });
    } else {
      logger.error("error clearing old webhook");
    }
  }).catch(() => {
    logger.error("error clearing old webhook2");
  });
}
