module.exports = async (ctx, next) => {
  if (ctx.session) {
    // eslint-disable-next-line no-underscore-dangle
    ctx.session.__language_code = ctx.session.__language_code || 'he';
    // todo get per user from db
  }
  next();
};
