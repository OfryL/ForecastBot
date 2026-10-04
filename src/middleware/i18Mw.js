const path = require('path');
const TelegrafI18n = require('telegraf-i18n');
const { DEFAULT_LANG } = require('../utils/consts');

const localesDir = path.resolve(__dirname, '..', 'locales');

const i18n = new TelegrafI18n({
  useSession: true,
  defaultLanguage: DEFAULT_LANG,
  directory: localesDir,
});

module.exports = {
  i18n,
  localesDir,
  middleware: i18n.middleware(),
};
