module.exports = () => {
  return async function(ctx, next) {
    if (ctx.app.config.env === 'local') {
      ctx.user = {
        openid: '--',
        nickname: '--',
        avatar: 'http://cdn-dolphinwit.oss-cn-beijing.aliyuncs.com/lucky-guys/images/default_avatar.jpg',
      };
      return await next();
    }
    
    const avatar = ctx.getCookie('u_avatar');
    const nickname = ctx.getCookie('u_nickname');
    const openid = ctx.getCookie('openid');

    if (!avatar || !nickname || !openid) {
      if (ctx.isAjax) {
        return ctx.throwSlient('请登录后再试');
      }
      return ctx.redirect('https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx6a68c545d8e1300a&redirect_uri=http%3A%2F%2Foauth.dolphinwit.com%2Fwx%2FauthCallback&response_type=code&scope=snsapi_login');
    }

    ctx.user = {
      avatar: decodeURIComponent(avatar),
      nickname: decodeURIComponent(nickname),
      openid,
    };

    await next();
  };
};
