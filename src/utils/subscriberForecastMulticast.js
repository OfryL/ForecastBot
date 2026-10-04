const cron = require('node-cron');
const config = require('config');
const logger = require('../logger/telegramLogger')('app_subscriberForecastMulticast');
const { i18Mw: { i18n } } = require('../middleware');
const openMeteo = require('../services/openMeteo');
const { formatForecast } = require('../forecast/formatForecast');
const { findSpot, getDefaultSpot } = require('./spots');
const { forEachSubscriber } = require('./forEachSubscriber');
const { DEFAULT_LANG, SUPPORTED_LANGS } = require('./consts');

const resolveLang = (lang) => (SUPPORTED_LANGS.includes(lang) ? lang : DEFAULT_LANG);

/** Send the daily forecast to every subscriber (in their spot + language). */
const subscriberForecastMulticast = async (telegram) => {
  const messageCache = new Map();

  const buildMessage = async (spot, lang) => {
    const cacheKey = `${spot.key}:${lang}`;
    if (!messageCache.has(cacheKey)) {
      const forecast = await openMeteo.getForecast(spot);
      const t = (key, data) => i18n.t(lang, key, data);
      const text = formatForecast(forecast, spot, t, { locale: lang });
      messageCache.set(cacheKey, `${t('subscriberMulticastJob.title')}\n${text}`);
    }
    return messageCache.get(cacheKey);
  };

  return forEachSubscriber(async (subscriber) => {
    const spot = findSpot(subscriber.spot) || getDefaultSpot();
    const lang = resolveLang(subscriber.lang);
    const text = await buildMessage(spot, lang);
    await telegram.sendMessage(subscriber.chatId, text, {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    });
  });
};

const startSubscriberForecastMulticastJob = (telegram) => {
  const expression = config.get('forecast.dailyBroadcastCron');
  const timezone = config.get('forecast.timezone');
  if (!cron.validate(expression)) {
    throw new Error(`invalid forecast.dailyBroadcastCron: "${expression}"`);
  }
  logger.debug(`scheduling daily forecast broadcast "${expression}" (${timezone})`);
  return cron.schedule(expression, async () => {
    logger.log('running daily forecast broadcast');
    try {
      const { sent, failed } = await subscriberForecastMulticast(telegram);
      logger.log(`daily forecast broadcast done: ${sent} sent, ${failed} failed`);
    } catch (err) {
      logger.error(err.stack || `daily forecast broadcast failed - ${err}`);
    }
  }, { scheduled: true, timezone });
};

module.exports = { subscriberForecastMulticast, startSubscriberForecastMulticastJob };
