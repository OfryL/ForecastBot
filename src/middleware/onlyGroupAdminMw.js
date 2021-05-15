const logger = require('../logger/telegramLogger')('app_onlyGroupAdminMw');
const { isNotPrivateChat } = require('../utils/chatRepo');

const validateGroupAdmin = async (ctx) => {
  const { chat } = ctx;
  if (isNotPrivateChat(chat)) {
    logger.debug(`getting admins for ${JSON.stringify(chat)}`);
    const ChatMember = await ctx.telegram.getChatAdministrators(chat.id);
    const admin = ChatMember.find(({ user }) => user.id === ctx.from.id);
    return !!admin;
  }
  return true;
};

module.exports = async (ctx, next) => {
  if (await validateGroupAdmin(ctx)) {
    next(ctx);
  } else {
    logger.log('no admin rights');
    ctx.reply('Only admins can do that :( ');
  }
};
