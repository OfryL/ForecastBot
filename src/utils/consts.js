const path = require('path');

const getForecastCmd = 'getforecast';
const subscribeCmd = 'subscribe';

const subscriberListCmd = 'subscriberList';
const subscriberMulticastCmd = 'postToSubscribers';
const getDbFile = 'getDbFile';

const saveDirPath = path.join(process.cwd(), 'lib', 'screenshots');
// const saveDirPath = __dirname;

const START_MSG = 'Welcome to Israel`s first waves forecast telegram bot.\n'
  + 'send me /getforecast to see more!\n'
  + '<b>New</b> - you can /subscribe for every day forecast, stay tuned!';

const contextMetadataKeys = {
  BOT_USERNAME: 'botUsername',
};

module.exports = {
  getForecastCmd,
  subscribeCmd,
  subscriberListCmd,
  subscriberMulticastCmd,
  saveDirPath,
  START_MSG,
  contextMetadataKeys,
  getDbFile,
};
