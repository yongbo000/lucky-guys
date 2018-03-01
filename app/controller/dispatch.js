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
      await ctx.render('bless.html');
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
