const hours = Array.from({ length: 24 }, (_, i) => `2026-10-04T${String(i).padStart(2, '0')}:00`);

const marine = {
  timezone: 'Asia/Jerusalem',
  utc_offset_seconds: 10800,
  hourly: {
    time: hours,
    wave_height: hours.map((_, i) => Number((0.4 + (i === 14 ? 0.8 : i / 100)).toFixed(2))),
    wave_direction: hours.map(() => 294),
    wave_period: hours.map(() => 5.8),
    swell_wave_height: hours.map(() => 0.4),
    swell_wave_direction: hours.map(() => 294),
    swell_wave_period: hours.map(() => 4.9),
    wind_wave_height: hours.map(() => 0.1),
  },
  daily: {
    time: ['2026-10-04', '2026-10-05', '2026-10-06', '2026-10-07'],
    wave_height_max: [1.2, 0.5, 2.1, 0.2],
    wave_direction_dominant: [294, 301, 180, 303],
    wave_period_max: [6.05, 5.25, 9.1, 5.05],
  },
};

const weather = {
  hourly: {
    time: hours,
    wind_speed_10m: hours.map(() => 8.4),
    wind_direction_10m: hours.map(() => 90),
    temperature_2m: hours.map(() => 27.6),
  },
};

const jsonResponse = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

module.exports = { marine, weather, jsonResponse };
