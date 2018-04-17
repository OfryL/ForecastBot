/*jshint esversion: 6 */

const config = require('config');
const log4js = require('log4js');

function configLogs() {
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
        // process.env.NODE_ENV !== 'production'
        appenders: ['console'],
        level: config.get('logger.level.default')
      }
    },
    "replaceConsole": true
  });
}
configLogs();

const Telegraf = require('telegraf');
const forcastbot = require('./forcastbot');
const localtunnel = require('localtunnel');
const logger = log4js.getLogger("app");

const fastify = require('fastify')({logger: {level: config.get('logger.level.fastify'), prettyPrint: true}});

const localtunnelport = config.get('httpserver.localtunnelport');

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


setupTunnel(() => {}).then((tunnelUrl) => {

  logger.info("connecting telegram api");
  const bot = new Telegraf(config.get('telegramBot.token'));

  forcastbot.setupForcastBot(bot);

  bot.telegram.setWebhook(tunnelUrl + '/secret-path');

  setupFastisyServer(bot);
}).catch((err) => {
  logger.error("Error on tunnel: " + err);
});
