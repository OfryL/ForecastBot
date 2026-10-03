const test = require('node:test');
const assert = require('node:assert/strict');
const openMeteo = require('../src/services/openMeteo');
const { spots } = require('../src/utils/spots');
const { marine, weather, jsonResponse } = require('./fixtures');

const fakeFetch = (handlers) => {
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(url);
    if (url.startsWith('https://marine-api.open-meteo.com')) return handlers.marine(url);
    if (url.startsWith('https://api.open-meteo.com')) return handlers.weather(url);
    throw new Error(`unexpected url ${url}`);
  };
  return { fetchImpl, calls };
};

test.beforeEach(() => openMeteo.clearCache());

test('normalize merges marine and wind rows by time', () => {
  const forecast = openMeteo.normalize(marine, weather);
  assert.equal(forecast.hourly.length, 24);
  assert.equal(forecast.hasWind, true);
  assert.deepEqual(forecast.hourly[0], {
    time: '2026-10-04T00:00',
    waveHeight: 0.4,
    waveDirection: 294,
    wavePeriod: 5.8,
    swellHeight: 0.4,
    swellDirection: 294,
    swellPeriod: 4.9,
    windWaveHeight: 0.1,
    windSpeed: 8.4,
    windDirection: 90,
    temperature: 27.6,
  });
  assert.equal(forecast.daily.length, 4);
  assert.deepEqual(forecast.daily[2], {
    date: '2026-10-06', waveHeightMax: 2.1, waveDirectionDominant: 180, wavePeriodMax: 9.1,
  });
});

test('normalize tolerates a missing weather payload', () => {
  const forecast = openMeteo.normalize(marine, null);
  assert.equal(forecast.hasWind, false);
  assert.equal(forecast.hourly[3].windSpeed, null);
  assert.equal(forecast.hourly[3].waveHeight, 0.43);
});

test('getForecast requests both apis with the spot coordinates and caches the result', async () => {
  const { fetchImpl, calls } = fakeFetch({
    marine: () => jsonResponse(marine),
    weather: () => jsonResponse(weather),
  });
  const first = await openMeteo.getForecast(spots.Haifa, { fetchImpl, now: 1000 });
  const second = await openMeteo.getForecast(spots.Haifa, { fetchImpl, now: 2000 });

  assert.equal(calls.length, 2);
  assert.ok(calls.every((u) => u.includes('latitude=32.8285') && u.includes('longitude=34.9545')));
  assert.ok(calls.some((u) => u.includes('wind_speed_unit=kn')));
  assert.equal(first, second, 'second call should be served from cache');
  assert.equal(first.hasWind, true);
});

test('getForecast still works when the wind api fails', async () => {
  const { fetchImpl } = fakeFetch({
    marine: () => jsonResponse(marine),
    weather: () => jsonResponse({ error: true }, 503),
  });
  const forecast = await openMeteo.getForecast(spots.TelAviv, { fetchImpl });
  assert.equal(forecast.hasWind, false);
  assert.equal(forecast.hourly.length, 24);
});

test('getForecast rejects when the marine api fails', async () => {
  const { fetchImpl } = fakeFetch({
    marine: () => jsonResponse({}, 500),
    weather: () => jsonResponse(weather),
  });
  await assert.rejects(() => openMeteo.getForecast(spots.TelAviv, { fetchImpl }), /500/);
});
