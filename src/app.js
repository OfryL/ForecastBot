const config = require('config');
const fastify = require('fastify');
const localtunnel = require('localtunnel');
const bot = require('./appBot');
const logger = require('./logger/telegramLogger')('app');
const { startSubscriberForecastMulticastJob } = require('./utils/subscriberForecastMulticast');

logger.debug(`running on '${process.env.NODE_ENV}' env`);

const isTunnelEnable = config.get('telegramBot.tunnel');
const tunnelPort = config.get('telegramBot.httpserver.localtunnelport');

let server;
if (isTunnelEnable) {
  server = fastify({ logger: { level: config.get('logger.level.server'), prettyPrint: true } });
}

const setupTunnel = async (onCloseCallback) => {
  const tunnel = await localtunnel(tunnelPort, (err, t) => {
    if (err) {
      throw err;
    }
    logger.debug(t.url);
  });

  tunnel.on('close', () => {
    logger.debug('tunnel closed');
    onCloseCallback();
  });

  return tunnel.url;
};

const setupFastisyServer = (telegramBot) => {
  server.log.debug('seting up server');
  server.get('/', (request, reply) => {
    reply.send({
      hello: 'world',
    });
  });

  server.use(telegramBot.webhookCallback('/secret-path'));

  server.listen(tunnelPort, '127.0.0.1', (err) => {
    if (err) {
      logger.trace(err);
      throw err;
    }
    logger.debug(`server listening on ${server.server.address().port}`);
  });
};

const startApp = async () => {
  startSubscriberForecastMulticastJob();

  if (isTunnelEnable) {
    try {
      const tunnelUrl = await setupTunnel(() => {});
      bot.telegram.setWebhook(`${tunnelUrl}/secret-path`);
      setupFastisyServer(bot);
    } catch (err) {
      logger.error(`Error on tunnel: ${err}`);
    }
  } else {
    logger.debug('clearing old webhook');
    let success = false;
    try {
      success = await bot.telegram.deleteWebhook();
    } catch (e) {
      logger.error(e.stack || `error clearing old webhook\n${e}`);
    }

    if (success) {
      logger.debug('start bot on polling mode');
      try {
        bot.startPolling();
      } catch (err) {
        logger.error(err.stack || `error polling ${err}`);
      }
    } else {
      logger.error('error clearing old webhook');
    }
  }
};

startApp();
