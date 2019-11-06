const config = require('config');
const logger = require("./logger/telegramLogger")("app");
const Telegraf = require('telegraf');
const errorHandlerMiddleware = require('./errorHandler/errorHandlerMiddleware');
const serverToolsWare = require('./serverToolsWare');
const forcastbot = require('./forcastbot');

logger.debug("running on '"+ process.env.NODE_ENV +"' env");

const isTunnelEnable = config.get('telegramBot.tunnel');

let fastify, localtunnel, tunnelPort;
if (isTunnelEnable) {
  tunnelPort = config.get('telegramBot.httpserver.localtunnelport');
  localtunnel = require('localtunnel');
  fastify = require('fastify')({logger: {level: config.get('logger.level.fastify'), prettyPrint: true}});
}

module.exports = function() {
  async function setupTunnel(onCloseCallback) {
      const tunnel = await localtunnel(tunnelPort, function(err, tunnel) {
        if (err) {
          throw err;
        }
        logger.debug(tunnel.url);
      });

      tunnel.on('close', function() {
        logger.debug('tunnel closed');
        onCloseCallback();
      });

      return tunnel.url;
  }

  function setupFastisyServer(telegramBot) {
    fastify.log.debug("seting up fastify");
    fastify.get('/', function(request, reply) {
      reply.send({
        hello: 'world'
      });
    });

    fastify.use(telegramBot.webhookCallback('/secret-path'));

    fastify.listen(tunnelPort, '127.0.0.1', function(err) {
      if (err) {
        logger.trace(err);
        throw err;
      }
      logger.debug(`server listening on ${fastify.server.address().port}`);
    });
  }

  async function startApp() {
    logger.debug("connecting telegram api");
    const bot = new Telegraf(config.get('telegramBot.token'));
    bot.use(serverToolsWare);
    bot.use(errorHandlerMiddleware);
    forcastbot.setupForcastBot(bot);

    if (isTunnelEnable){
      try {
        const tunnelUrl = await setupTunnel(() => {});
        bot.telegram.setWebhook(tunnelUrl + '/secret-path');
        setupFastisyServer(bot);
      } catch(err) {
        logger.error("Error on tunnel: " + err);
      }
    } else {
      logger.debug("clearing old webhook");
      let success = false;
      try {
        success = await bot.telegram.deleteWebhook();
      } catch(e) {
        logger.error(e.stack || "error clearing old webhook\n" + e);
      }

      if (success) {
        logger.debug("start bot on polling mode");
        try {
          bot.startPolling();
        } catch(err) {
          logger.error(err.stack || "error polling " + err);
        }
      } else {
        logger.error("error clearing old webhook");
      }
    }
  }

  startApp();
}();