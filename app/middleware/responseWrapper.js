const os = require('os');
const hostname = os.hostname();

module.exports = () => {
  return async function responseWrapper(ctx, next) {
    const start = Date.now();
    try {
      await next();
      if (ctx.isAjax) {
        ctx.body = {
          success: true,
          result: ctx.body,
        };
      }
    } catch (e) {
      if (!e.slient) {
        ctx.logger.error(e);
      }
      if (ctx.isAjax) {
        ctx.body = {
          success: false,
          message: e.message || '未知异常',
        };
      } else {
        ctx.body = '未知异常';
      }
    }
    ctx.set('x-response-time', Date.now() - start);
    ctx.set('serverhost', hostname);
  };
};
