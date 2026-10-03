const path = require('path');

// Public commands
const getForecastCmd = 'getforecast';
const liveVideoCmd = 'liveVideo';
const spotsCmd = 'spots';
const subscribeCmd = 'subscribe';
const langHeCmd = 'lang_he';
const langEnCmd = 'lang_en';
const helpCmd = 'help';

// Admin commands
const subscriberListCmd = 'subscriberList';
const subscriberMulticastCmd = 'postToSubscribers';
const getDbFileCmd = 'getDbFile';
const sendForecastNowCmd = 'sendForecastNow';
const opHelpCmd = 'ophelp';
const getOsInfoCmd = 'getOsInfo';
const getUptimeCmd = 'getUptime';
const getWanIpCmd = 'getWanIp';
const getIpCmd = 'getIp';

const libDirPath = path.join(process.cwd(), 'lib');
const dbDirPath = path.join(libDirPath, 'db');
const liveVideosSaveDirPath = path.join(libDirPath, 'liveVideos');

const DEFAULT_LANG = 'he';
const SUPPORTED_LANGS = ['he', 'en'];

module.exports = {
  getForecastCmd,
  liveVideoCmd,
  spotsCmd,
  subscribeCmd,
  langHeCmd,
  langEnCmd,
  helpCmd,
  subscriberListCmd,
  subscriberMulticastCmd,
  getDbFileCmd,
  sendForecastNowCmd,
  opHelpCmd,
  getOsInfoCmd,
  getUptimeCmd,
  getWanIpCmd,
  getIpCmd,
  libDirPath,
  dbDirPath,
  liveVideosSaveDirPath,
  DEFAULT_LANG,
  SUPPORTED_LANGS,
};
