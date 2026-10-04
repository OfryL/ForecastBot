const logger = require('../logger/telegramLogger')('app_forecast_chatRepo');

const isNotPrivateChat = (chat) => !!chat && chat.type !== 'private';

/** In groups only admins may change subscriptions; in private chats anyone. */
const validateGroupAdmin = async (ctx) => {
  const { chat, from } = ctx;
  if (!isNotPrivateChat(chat)) {
    return true;
  }
  logger.debug(`getting admins for ${chat.id}`);
  const admins = await ctx.telegram.getChatAdministrators(chat.id);
  return admins.some(({ user }) => user.id === from.id);
};

const describeUser = (from = {}) => `${from.first_name || ''}${from.username ? `(@${from.username})` : `#${from.id}`}`;

const getChatDesc = (ctx) => {
  const { chat, from } = ctx;
  if (isNotPrivateChat(chat)) {
    return `${chat.type}:${chat.title}, ${describeUser(from)}`;
  }
  return describeUser(from);
};

module.exports = {
  isNotPrivateChat,
  validateGroupAdmin,
  getChatDesc,
};
