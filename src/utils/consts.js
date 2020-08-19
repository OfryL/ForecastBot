const path = require('path');

const getForecastCmd = 'getforecast';
const liveVideoCmd = 'liveVideo';
const spotsCmd = 'spots';
const subscribeCmd = 'subscribe';
const langHeCmd = 'lang_he';
const langEnCmd = 'lang_en';

const subscriberListCmd = 'subscriberList';
const subscriberMulticastCmd = 'postToSubscribers';
const getDbFile = 'getDbFile';

const saveDirPath = path.join(process.cwd(), 'lib', 'screenshots');
const liveVideosSaveDirPath = path.join(process.cwd(), 'lib', 'liveVideos');
// const saveDirPath = __dirname;

const contextMetadataKeys = {
  BOT_USERNAME: 'botUsername',
};

const botUsername = 'Israelsurfbot';

module.exports = {
  getForecastCmd,
  liveVideoCmd,
  spotsCmd,
  subscribeCmd,
  subscriberListCmd,
  subscriberMulticastCmd,
  saveDirPath,
  liveVideosSaveDirPath,
  contextMetadataKeys,
  getDbFile,
  langHeCmd,
  langEnCmd,
  botUsername,
};
