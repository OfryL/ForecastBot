const path = require('path');

const getForcastCmd = 'getforcast';
const subscribeCmd = 'subscribe';

const subscriberListCmd = 'subscriberList';
const subscriberMulticastCmd = 'postToSubscribers';

const saveDirPath = path.join(process.cwd(), 'lib', 'screenshots');
// const saveDirPath = __dirname;

const START_MSG = 'Welcome to Israel`s first waves forcast telegram bot.\n'
  + 'send me /getforcast to see more!\n'
  + '<b>New</b> - you can /subscribe for every day forcast, stay tuned!';

module.exports = {
  getForcastCmd,
  subscribeCmd,
  subscriberListCmd,
  subscriberMulticastCmd,
  saveDirPath,
  START_MSG,
};
