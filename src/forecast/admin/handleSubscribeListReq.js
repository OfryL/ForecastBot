const subscribeDao = require('../../dao/subscribeDao');

const handleSubscribeListReq = async (ctx) => {
  const subscribers = await subscribeDao.getAllSubscribers();
  if (subscribers.length === 0) {
    await ctx.reply('No subscribers yet.');
    return;
  }
  const list = subscribers
    .map((s) => `• ${s.userDesc || s.chatId} [${s.spot || '-'}/${s.lang || '-'}]`)
    .join('\n');
  await ctx.reply(`${subscribers.length} subscribers:\n${list}`);
};

module.exports = handleSubscribeListReq;
