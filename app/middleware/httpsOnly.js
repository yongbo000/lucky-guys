module.exports = () => {
  return async (ctx, next) => {
    if (ctx.app.config.env === 'prod') {
      const protocol = ctx.get('x-client-scheme');
      if (protocol !== 'https') {
        const redirect_url = 'https://' + ctx.host + ctx.url;
        return ctx.redirect(redirect_url);
      }
    }
    await next();
  };
};
