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
      const appid = ctx.app.config.wxOAuth.appid;
      const redirect_uri = ctx.app.config.wxOAuth.redirect_uri;
      return ctx.redirect(`https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${encodeURIComponent(redirect_uri)}&response_type=code&scope=snsapi_userinfo`);
    }

    ctx.user = {
      avatar: decodeURIComponent(avatar),
      nickname: decodeURIComponent(nickname),
      openid,
    };

    await next();
  };
};
