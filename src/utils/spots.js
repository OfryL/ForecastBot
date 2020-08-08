const urls = {
  TelAviv: {
    name: 'Tel-Aviv - Hilton',
    url: 'https://magicseaweed.com/Hilton-Surf-Report/3658/',
    filename: 'forcastTelAviv',
  },
  Haifa: {
    name: 'Haifa - The Peak',
    url: 'https://magicseaweed.com/Haifa-The-Peak-Surf-Report/3671/',
    filename: 'forcastHaifa',
  },
  Ashqelon: {
    name: 'Ashqelon',
    url: 'https://magicseaweed.com/Ashqelon-Surf-Report/3811/',
    filename: 'forcastAshqelon',
  },
  Ashdod: {
    name: 'Ashdod',
    url: 'https://magicseaweed.com/Ashdod-Surf-Report/4219/',
    filename: 'forcastAshdod',
  },
};

const getSpotFromCommand = (text) => {
  const args = text.split(' ');
  if (args.length > 0) {
    const spot = urls[args[1]];
    if (spot) {
      return spot;
    }
  }
  return urls.TelAviv;
};

module.exports = {
  getSpotFromCommand,
};
