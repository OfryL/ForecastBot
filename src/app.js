const config = require('config');
const logger = require("./logger")("app");
const Telegraf = require('telegraf');
const localtunnel = require('localtunnel');
const errorHandlerMiddleware = require('./errorHandler/errorHandlerMiddleware');
const serverToolsWare = require('./serverToolsWare');
const forcastbot = require('./forcastbot');

logger.debug("running on '"+ process.env.NODE_ENV +"' env");

const fastify = require('fastify')({logger: {level: config.get('logger.level.fastify'), prettyPrint: true}});

const localtunnelport = config.get('telegramBot.httpserver.localtunnelport');

module.exports = function() {

  async function setupTunnel(onCloseCallback) {

      const tunnel = await localtunnel(localtunnelport, function(err, tunnel) {
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

    fastify.listen(localtunnelport, '127.0.0.1', function(err) {
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

    if (config.get('telegramBot.tunnel')){
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
        logger.error("error clearing old webhook");
      }

      if (success) {
        logger.debug("start bot on polling mode");
        try {
          bot.startPolling();
        } catch(err) {
          logger.error(err, "error polling " + err);
        }
      } else {
        logger.error("error clearing old webhook");
      }
    }
  }

  startApp();
}();