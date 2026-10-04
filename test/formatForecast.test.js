const test = require('node:test');
const assert = require('node:assert/strict');
const TelegrafI18n = require('telegraf-i18n');
const {
  formatForecast, compassPoint, windType, rateWaves, toLocalIso,
} = require('../src/forecast/formatForecast');
const { normalize } = require('../src/services/openMeteo');
const { spots } = require('../src/utils/spots');
const { localesDir } = require('../src/middleware/i18Mw');
const { marine, weather } = require('./fixtures');

const i18n = new TelegrafI18n({ directory: localesDir, allowMissing: false });
const translator = (lang) => (key, data) => i18n.t(lang, key, data);

// 12:30 Israel time on the fixture day
const now = new Date('2026-10-04T09:30:00Z');

test('compassPoint maps degrees to 8 points', () => {
  assert.equal(compassPoint(0), 'N');
  assert.equal(compassPoint(294), 'NW');
  assert.equal(compassPoint(359), 'N');
  assert.equal(compassPoint(180), 'S');
  assert.equal(compassPoint(null), null);
});

test('windType classifies against a west-facing coast', () => {
  assert.equal(windType(90), 'offshore');
  assert.equal(windType(270), 'onshore');
  assert.equal(windType(0), 'cross');
  assert.equal(windType(null), null);
});

test('rateWaves buckets wave heights', () => {
  assert.equal(rateWaves(0.1).key, 'flat');
  assert.equal(rateWaves(0.5).key, 'small');
  assert.equal(rateWaves(0.8).key, 'fun');
  assert.equal(rateWaves(1.5).key, 'good');
  assert.equal(rateWaves(2.5).key, 'big');
  assert.equal(rateWaves(null).key, 'flat');
});

test('toLocalIso renders the time in the requested zone', () => {
  assert.equal(toLocalIso(now, 'Asia/Jerusalem'), '2026-10-04T12:30');
  assert.equal(toLocalIso(new Date('2026-10-04T23:30:00Z'), 'Asia/Jerusalem'), '2026-10-05T02:30');
});

['en', 'he'].forEach((lang) => {
  test(`formatForecast renders a complete ${lang} message`, () => {
    const forecast = normalize(marine, weather);
    const text = formatForecast(forecast, spots.TelAviv, translator(lang), { now, locale: lang });

    assert.ok(text.includes(i18n.t(lang, spots.TelAviv.name)), 'spot name');
    assert.ok(text.includes('0.5 m') || text.includes('0.5 מ׳'), 'current height (12:00 row)');
    assert.ok(text.includes('1.2'), 'today peak at 14:00');
    assert.ok(text.includes('05/10') && text.includes('06/10') && text.includes('07/10'), 'next 3 days');
    assert.ok(!text.includes('04/10:'), 'today is not repeated in next days');
    assert.ok(text.includes(spots.TelAviv.url), 'report link');
    assert.ok(text.includes('8 '), 'wind speed');
    assert.ok(text.includes('28°C'), 'temperature rounded');
    assert.ok(!text.includes('${'), 'no unrendered template');
    assert.ok(!/forecast\.|compass\./.test(text), 'no missing translation keys');
  });
});

test('formatForecast omits wind lines when wind data is missing', () => {
  const forecast = normalize(marine, null);
  const text = formatForecast(forecast, spots.Haifa, translator('en'), { now, locale: 'en' });
  assert.ok(!text.includes('💨'));
  assert.ok(!text.includes('🌡'));
  assert.ok(text.includes('Haifa'));
});

test('formatForecast throws on empty data', () => {
  assert.throws(
    () => formatForecast({ hourly: [], daily: [] }, spots.Haifa, translator('en'), { now }),
    /no hourly data/,
  );
});
