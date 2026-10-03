const config = require('config');
const logger = require('../logger/telegramLogger')('app_openMeteo');

const MARINE_URL = 'https://marine-api.open-meteo.com/v1/marine';
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

const HOURLY_MARINE = [
  'wave_height', 'wave_direction', 'wave_period',
  'swell_wave_height', 'swell_wave_direction', 'swell_wave_period',
  'wind_wave_height',
];
const DAILY_MARINE = ['wave_height_max', 'wave_direction_dominant', 'wave_period_max'];
const HOURLY_WEATHER = ['wind_speed_10m', 'wind_direction_10m', 'temperature_2m'];

const settings = () => ({
  timezone: config.get('forecast.timezone'),
  forecastDays: config.get('forecast.forecastDays'),
  timeoutMs: config.get('forecast.requestTimeoutMs'),
  cacheTtlMs: config.get('forecast.cacheTtlMinutes') * 60 * 1000,
});

const cache = new Map();

const buildUrl = (base, params) => {
  const url = new URL(base);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, Array.isArray(value) ? value.join(',') : String(value));
  });
  return url.toString();
};

async function fetchJson(url, { fetchImpl, timeoutMs }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchImpl(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'IsraelSurfBot (https://github.com/OfryL/ForecastBot)' },
    });
    if (!res.ok) {
      throw new Error(`Open-Meteo responded ${res.status} for ${url}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

const rows = (series, keys) => (series && Array.isArray(series.time) ? series.time : [])
  .map((time, i) => keys.reduce((row, key) => ({
    ...row,
    [key]: series[key] ? series[key][i] : null,
  }), { time }));

/** Merge the marine + (optional) weather payloads into one plain structure. */
function normalize(marine, weather) {
  const windByTime = new Map(
    rows(weather && weather.hourly, HOURLY_WEATHER).map((w) => [w.time, w]),
  );

  const hourly = rows(marine.hourly, HOURLY_MARINE).map((m) => {
    const w = windByTime.get(m.time) || {};
    return {
      time: m.time,
      waveHeight: m.wave_height,
      waveDirection: m.wave_direction,
      wavePeriod: m.wave_period,
      swellHeight: m.swell_wave_height,
      swellDirection: m.swell_wave_direction,
      swellPeriod: m.swell_wave_period,
      windWaveHeight: m.wind_wave_height,
      windSpeed: w.wind_speed_10m === undefined ? null : w.wind_speed_10m,
      windDirection: w.wind_direction_10m === undefined ? null : w.wind_direction_10m,
      temperature: w.temperature_2m === undefined ? null : w.temperature_2m,
    };
  });

  const daily = rows(marine.daily, DAILY_MARINE).map((d) => ({
    date: d.time,
    waveHeightMax: d.wave_height_max,
    waveDirectionDominant: d.wave_direction_dominant,
    wavePeriodMax: d.wave_period_max,
  }));

  return {
    timezone: marine.timezone,
    utcOffsetSeconds: marine.utc_offset_seconds,
    hasWind: windByTime.size > 0,
    hourly,
    daily,
  };
}

/**
 * Fetch (and cache) the forecast for a spot.
 * The marine request is mandatory; wind/temperature is best-effort.
 */
async function getForecast(spot, { fetchImpl = globalThis.fetch, now = Date.now() } = {}) {
  const {
    timezone, forecastDays, timeoutMs, cacheTtlMs,
  } = settings();

  const cached = cache.get(spot.key);
  if (cached && now - cached.fetchedAt < cacheTtlMs) {
    return cached.forecast;
  }

  const common = {
    latitude: spot.lat, longitude: spot.lon, timezone, forecast_days: forecastDays,
  };
  const marineUrl = buildUrl(MARINE_URL, { ...common, hourly: HOURLY_MARINE, daily: DAILY_MARINE });
  const weatherUrl = buildUrl(WEATHER_URL, { ...common, hourly: HOURLY_WEATHER, wind_speed_unit: 'kn' });

  logger.debug(`fetching forecast for ${spot.key}`);
  const [marine, weather] = await Promise.all([
    fetchJson(marineUrl, { fetchImpl, timeoutMs }),
    fetchJson(weatherUrl, { fetchImpl, timeoutMs }).catch((err) => {
      logger.warn(`wind data unavailable for ${spot.key}: ${err.message}`);
      return null;
    }),
  ]);

  const forecast = { ...normalize(marine, weather), fetchedAt: new Date(now).toISOString() };
  cache.set(spot.key, { fetchedAt: now, forecast });
  return forecast;
}

const clearCache = () => cache.clear();

module.exports = {
  getForecast,
  clearCache,
  normalize,
  buildUrl,
};
