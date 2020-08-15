const path = require('path');

const getForecastCmd = 'getforecast';
const subscribeCmd = 'subscribe';
const langHeCmd = 'lang_he';
const langEnCmd = 'lang_en';

const subscriberListCmd = 'subscriberList';
const subscriberMulticastCmd = 'postToSubscribers';
const getDbFile = 'getDbFile';

const saveDirPath = path.join(process.cwd(), 'lib', 'screenshots');
// const saveDirPath = __dirname;

const contextMetadataKeys = {
  BOT_USERNAME: 'botUsername',
};

module.exports = {
  getForecastCmd,
  subscribeCmd,
  subscriberListCmd,
  subscriberMulticastCmd,
  saveDirPath,
  contextMetadataKeys,
  getDbFile,
  langHeCmd,
  langEnCmd,
};
