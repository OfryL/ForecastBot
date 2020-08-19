const spots = {
  TelAviv: {
    name: 'spots.TelAviv.name',
    url: 'https://magicseaweed.com/Hilton-Surf-Report/3658/',
    // liveUrl: 'http://212.179.113.90:1935/live/inter20.stream/playlist.m3u8',
    liveUrl: 'http://212.179.113.90:1935/live/inter10.stream/playlist.m3u8',
    filename: 'forecastTelAviv',
  },
  Haifa: {
    name: 'spots.Haifa.name',
    url: 'https://magicseaweed.com/Haifa-The-Peak-Surf-Report/3671/',
    filename: 'forecastHaifa',
  },
  Ashqelon: {
    name: 'spots.Ashqelon.name',
    url: 'https://magicseaweed.com/Ashqelon-Surf-Report/3811/',
    filename: 'forecastAshqelon',
  },
  Ashdod: {
    name: 'spots.Ashdod.name',
    url: 'https://magicseaweed.com/Ashdod-Surf-Report/4219/',
    filename: 'forecastAshdod',
  },
};

const getSpotFromCommand = (text) => {
  const args = text.split(' ');
  if (args.length > 0) {
    const spot = spots[args[1]];
    if (spot) {
      return spot;
    }
  }
  return spots.TelAviv;
};

module.exports = {
  spots,
  getSpotFromCommand,
};
