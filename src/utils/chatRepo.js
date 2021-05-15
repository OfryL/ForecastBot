// const logger = require('../logger/telegramLogger')('app_forecast_chatRepo');

const isNotPrivateChat = (chat) => chat.type !== 'private';

const getChatDesc = (ctx) => {
  if (isNotPrivateChat(ctx.chat)) {
    return `${ctx.chat.type}:${ctx.chat.title}, ${ctx.message.from.first_name}(@${ctx.message.from.username})`;
  }
  return `${ctx.message.from.first_name}(@${ctx.message.from.username})`;
};

module.exports = {
  isNotPrivateChat,
  getChatDesc,
};
