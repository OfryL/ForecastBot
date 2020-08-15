function handleSetEnCmd(ctx) {
  ctx.i18n.locale('en');
  // eslint-disable-next-line no-underscore-dangle
  ctx.session.__language_code = 'en';
  ctx.reply(ctx.i18n.t('botReplays.langChanged'));
}

function handleSetHeCmd(ctx) {
  ctx.i18n.locale('he');
  // eslint-disable-next-line no-underscore-dangle
  ctx.session.__language_code = 'he';
  ctx.reply(ctx.i18n.t('botReplays.langChanged'));
}

module.exports = {
  handleSetEnCmd,
  handleSetHeCmd,
};
