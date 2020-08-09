const logger = require('../logger/telegramLogger')('app_forecast_chatRepo');

const isNotPrivateChat = (chat) => chat.type !== 'private';

const validateGroupAdmin = async (ctx) => {
  const { chat } = ctx;
  if (isNotPrivateChat(chat)) {
    logger.log(`getting admins for ${JSON.stringify(chat)}`);
    const ChatMember = await ctx.telegram.getChatAdministrators(chat.id);
    const admin = ChatMember.find(({ user }) => user.id === ctx.from.id);
    return !!admin;
  }
  return true;
};

const getChatDesc = (ctx) => {
  if (isNotPrivateChat(ctx.chat)) {
    return `${ctx.chat.type}:${ctx.chat.title}, ${ctx.message.from.first_name}(@${ctx.message.from.username})`;
  }
  return `${ctx.message.from.first_name}(@${ctx.message.from.username})`;
};

module.exports = {
  isNotPrivateChat,
  validateGroupAdmin,
  getChatDesc,
};
