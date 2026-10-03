const config = require('config');
const bot = require('./appBot');
const logger = require('./logger/telegramLogger')('app');
const { startSubscriberForecastMulticastJob } = require('./utils/subscriberForecastMulticast');

logger.debug(`running on '${process.env.NODE_ENV || 'development'}' env`);

const isTunnelEnabled = config.get('telegramBot.tunnel');
const port = config.get('telegramBot.httpserver.port');

/** Webhook mode behind a localtunnel (handy on machines without a public IP). */
const launchWithTunnel = async () => {
  // eslint-disable-next-line global-require
  const localtunnel = require('localtunnel');
  const tunnel = await localtunnel({ port });
  logger.log(`tunnel opened at ${tunnel.url}`);
  tunnel.on('close', () => logger.warn('tunnel closed - webhook updates will stop arriving'));
  tunnel.on('error', (err) => logger.error(err.stack || `tunnel error: ${err}`));

  await bot.launch({
    webhook: {
      domain: tunnel.url, port, host: '127.0.0.1',
    },
  });
  return () => tunnel.close();
};

const launchWithPolling = async () => {
  logger.debug('starting bot in long-polling mode');
  await bot.launch();
  return () => {};
};

const startApp = async () => {
  const job = startSubscriberForecastMulticastJob(bot.telegram);
  const cleanup = isTunnelEnabled ? await launchWithTunnel() : await launchWithPolling();
  logger.log(`bot @${bot.options.username || '?'} is up`);

  const shutdown = (signal) => {
    logger.log(`received ${signal}, shutting down`);
    job.stop();
    cleanup();
    bot.stop(() => process.exit(0));
    setTimeout(() => process.exit(0), 5000).unref();
  };
  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
};

process.on('unhandledRejection', (reason) => {
  logger.error((reason && reason.stack) || `unhandled rejection: ${reason}`);
});

startApp().catch((err) => {
  logger.error(err.stack || `failed to start: ${err}`);
  process.exit(1);
});
