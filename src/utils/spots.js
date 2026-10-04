// Surf spots along the Israeli coast.
// `url` points at the public Surfline report (magicseaweed.com, the previous
// source, now redirects there). Coordinates feed the Open-Meteo marine API.
const spots = {
  TelAviv: {
    key: 'TelAviv',
    name: 'spots.TelAviv.name',
    lat: 32.0925,
    lon: 34.7705,
    url: 'https://www.surfline.com/surf-report/hilton-beach/584204204e65fad6a770913b',
    liveUrl: 'http://212.179.113.90:1935/live/inter10.stream/playlist.m3u8',
  },
  Haifa: {
    key: 'Haifa',
    name: 'spots.Haifa.name',
    lat: 32.8285,
    lon: 34.9545,
    url: 'https://www.surfline.com/surf-report/the-peak/584204204e65fad6a7709aa2',
  },
  Ashdod: {
    key: 'Ashdod',
    name: 'spots.Ashdod.name',
    lat: 31.8100,
    lon: 34.6350,
    url: 'https://www.surfline.com/surf-report/ashdod/584204204e65fad6a7709ab5',
  },
  Ashqelon: {
    key: 'Ashqelon',
    name: 'spots.Ashqelon.name',
    lat: 31.6760,
    lon: 34.5530,
    url: 'https://www.surfline.com/surf-report/ashkelon/584204204e65fad6a7709ab6',
  },
};

const DEFAULT_SPOT_KEY = 'TelAviv';
const spotKeys = Object.keys(spots);

const normalizeKey = (key) => String(key).toLowerCase().replace(/[-_\s]/g, '');

/** Case/format-insensitive lookup: "haifa", "Tel-Aviv", "telaviv" all resolve. */
const findSpot = (key) => {
  if (!key) {
    return null;
  }
  const wanted = normalizeKey(key);
  const match = spotKeys.find((k) => normalizeKey(k) === wanted);
  return match ? spots[match] : null;
};

const getDefaultSpot = () => spots[DEFAULT_SPOT_KEY];

/**
 * Resolve a spot from a command message, e.g.
 *   "/getforecast Haifa", "/getforecast@IsraelSurfBot ashdod", "/spot_Haifa".
 * Falls back to the default spot.
 */
const getSpotFromCommand = (text = '') => {
  const [command = '', ...args] = String(text).trim().split(/\s+/);
  const spotCmd = /^\/spot_([^@\s]+)/i.exec(command);
  if (spotCmd) {
    return findSpot(spotCmd[1]) || getDefaultSpot();
  }
  return findSpot(args[0]) || getDefaultSpot();
};

module.exports = {
  spots,
  spotKeys,
  DEFAULT_SPOT_KEY,
  findSpot,
  getDefaultSpot,
  getSpotFromCommand,
};
