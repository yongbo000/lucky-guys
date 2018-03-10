const egg = require('egg');

module.exports = app => {
  const cacheStore = new Map();
  class DispatchController extends egg.Controller {
    async bigscreen() {
      const { ctx } = this;
      await ctx.render('bigScreen.html');
    }

    async joined() {
      // TODO: 通过accessToken获取用户信息
      const user = {
        id: 'xxxx',
        name: 'Jambo',
        avatar: 'http://cdn-dolphinwit.oss-cn-beijing.aliyuncs.com/images/pc/default_avatar.png',
      };
      if (!cacheStore.get(user.id)) {
        cacheStore.set(user.id, user);
      }
      app.eventsource.broadcast('joined', JSON.stringify(user));
    }

    async bless() {
      const { ctx } = this;
      const avatar = ctx.getCookie('u_avatar');
      const nickname = ctx.getCookie('u_nickname');
      if (!avatar || !nickname) {
        return ctx.redirect('https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx6a68c545d8e1300a&redirect_uri=http%3A%2F%2Foauth.dolphinwit.com%2Fwx%2FauthCallback&response_type=code&scope=snsapi_login');
      }
      await ctx.render('bless.html', {
        context: {
          avatar,
          nickname,
        },
      });
    }

    async postBless() {
      const { ctx } = this;
      const blessWords = (ctx.request.body.blessWords || '').trim();
      if (!blessWords) {
        ctx.throwBizError('缺少祝福语');
      }
      const payload = {
        name: 'jambo',
        avatar: 'http://cdn-dolphinwit.oss-cn-beijing.aliyuncs.com/images/pc/default_avatar.png',
        text: blessWords,
        time: Date.now(),
      };
      app.eventsource.broadcast('postBless', JSON.stringify(payload));
    }
  }
  return DispatchController;
};