const path = require('path');
const TelegrafI18n = require('telegraf-i18n');

const getI18mw = () => {
  const i18n = new TelegrafI18n({
    useSession: true,
    directory: path.resolve(process.cwd(), 'src', 'locales'),
  });

  return {
    i18n,
    middleware: i18n.middleware(),
  };
};

module.exports = getI18mw();
