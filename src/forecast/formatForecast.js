/**
 * Turns a normalized Open-Meteo forecast into a Telegram HTML message.
 * Pure function: no I/O, translation is injected via `t(key, data)`.
 */

const COMPASS_8 = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

const compassPoint = (degrees) => {
  if (degrees === null || degrees === undefined || Number.isNaN(Number(degrees))) {
    return null;
  }
  const index = Math.round((((Number(degrees) % 360) + 360) % 360) / 45) % 8;
  return COMPASS_8[index];
};

// The Israeli coast faces roughly west, so easterly winds blow offshore.
const windType = (degrees) => {
  if (degrees === null || degrees === undefined) {
    return null;
  }
  const d = ((Number(degrees) % 360) + 360) % 360;
  if (d >= 45 && d <= 135) return 'offshore';
  if (d >= 225 && d <= 315) return 'onshore';
  return 'cross';
};

const RATINGS = [
  { max: 0.3, key: 'flat', emoji: '😴' },
  { max: 0.6, key: 'small', emoji: '🤏' },
  { max: 1.0, key: 'fun', emoji: '🙂' },
  { max: 1.8, key: 'good', emoji: '🤙' },
  { max: Infinity, key: 'big', emoji: '🔥' },
];

const rateWaves = (height) => {
  const h = Number(height) || 0;
  return RATINGS.find((r) => h < r.max) || RATINGS[RATINGS.length - 1];
};

const pad2 = (n) => String(n).padStart(2, '0');

/** "YYYY-MM-DDTHH:mm" of `date` in the given IANA time zone. */
const toLocalIso = (date, timeZone) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(date).reduce((acc, p) => ({ ...acc, [p.type]: p.value }), {});
  return `${parts.year}-${parts.month}-${parts.day}T${pad2(parts.hour)}:${parts.minute}`;
};

const weekday = (isoDate, locale, timeZone) => new Intl.DateTimeFormat(locale, {
  weekday: 'short',
  timeZone,
}).format(new Date(`${isoDate}T12:00:00Z`));

const shortDate = (isoDate) => {
  const [, month, day] = isoDate.split('-');
  return `${day}/${month}`;
};

const fmtHeight = (m) => (m === null || m === undefined ? '–' : Number(m).toFixed(1));
const fmtInt = (n) => (n === null || n === undefined ? '–' : String(Math.round(Number(n))));

/** Pick the hourly row closest to (but not after) `now`. */
const pickCurrent = (hourly, nowLocal) => {
  let current = hourly[0];
  hourly.forEach((row) => {
    if (row.time <= nowLocal) {
      current = row;
    }
  });
  return current;
};

/** Daylight max for a given date (05:00-19:00), from hourly rows. */
const daylightPeak = (hourly, isoDate) => hourly
  .filter((row) => row.time.startsWith(isoDate))
  .filter((row) => {
    const hour = Number(row.time.slice(11, 13));
    return hour >= 5 && hour <= 19;
  })
  .reduce((best, row) => (
    best === null || (row.waveHeight || 0) > (best.waveHeight || 0) ? row : best
  ), null);

/**
 * @param {object} forecast normalized forecast (see services/openMeteo)
 * @param {object} spot spot definition
 * @param {(key: string, data?: object) => string} t translator
 * @param {{ now?: Date, locale?: string }} options
 */
function formatForecast(forecast, spot, t, { now = new Date(), locale = 'en' } = {}) {
  const timeZone = forecast.timezone || 'Asia/Jerusalem';
  const nowLocal = toLocalIso(now, timeZone);
  const today = nowLocal.slice(0, 10);

  const current = pickCurrent(forecast.hourly, nowLocal);
  if (!current) {
    throw new Error('forecast has no hourly data');
  }

  const rating = rateWaves(current.waveHeight);
  const dir = compassPoint(current.waveDirection);
  const lines = [];

  lines.push(t('forecast.header', {
    spot: t(spot.name),
    weekday: weekday(today, locale, timeZone),
    date: shortDate(today),
    time: current.time.slice(11),
  }));
  lines.push(t('forecast.conditions', {
    height: fmtHeight(current.waveHeight),
    period: fmtInt(current.wavePeriod),
    direction: dir ? t(`compass.${dir}`) : '–',
    degrees: fmtInt(current.waveDirection),
  }));
  lines.push(`${rating.emoji} ${t(`forecast.rating.${rating.key}`)}`);

  if (current.windSpeed !== null && current.windSpeed !== undefined) {
    const windDir = compassPoint(current.windDirection);
    lines.push(t('forecast.wind', {
      speed: fmtInt(current.windSpeed),
      direction: windDir ? t(`compass.${windDir}`) : '–',
      type: t(`forecast.windType.${windType(current.windDirection)}`),
    }));
  }
  if (current.temperature !== null && current.temperature !== undefined) {
    lines.push(t('forecast.temperature', { temperature: fmtInt(current.temperature) }));
  }

  const peak = daylightPeak(forecast.hourly, today);
  if (peak) {
    lines.push('');
    lines.push(t('forecast.todayPeak', {
      height: fmtHeight(peak.waveHeight),
      time: peak.time.slice(11),
    }));
  }

  const upcoming = forecast.daily.filter((d) => d.date > today).slice(0, 3);
  if (upcoming.length > 0) {
    lines.push('');
    lines.push(t('forecast.nextDaysTitle'));
    upcoming.forEach((d) => {
      const dayRating = rateWaves(d.waveHeightMax);
      const dayDir = compassPoint(d.waveDirectionDominant);
      lines.push(t('forecast.nextDayLine', {
        emoji: dayRating.emoji,
        weekday: weekday(d.date, locale, timeZone),
        date: shortDate(d.date),
        height: fmtHeight(d.waveHeightMax),
        period: fmtInt(d.wavePeriodMax),
        direction: dayDir ? t(`compass.${dayDir}`) : '–',
      }));
    });
  }

  lines.push('');
  lines.push(t('forecast.footer', { url: spot.url }));

  return lines.join('\n');
}

module.exports = {
  formatForecast,
  compassPoint,
  windType,
  rateWaves,
  toLocalIso,
};
