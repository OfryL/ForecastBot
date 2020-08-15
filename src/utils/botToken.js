const config = require('config');

const token = config.get('telegramBot.token');

module.exports = {
  token,
};
