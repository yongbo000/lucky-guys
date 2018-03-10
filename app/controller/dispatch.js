const egg = require('egg');

module.exports = app => {
  class DispatchController extends egg.Controller {
    async bigscreen() {
      const { ctx } = this;
      await ctx.render('bigScreen.html');
    }

    async bless() {
      const { ctx } = this;
      await ctx.render('bless.html', {
        context: {
          avatar: ctx.user.avatar || 'http://cdn-dolphinwit.oss-cn-beijing.aliyuncs.com/lucky-guys/images/default_avatar.jpg',
          nickname: ctx.user.nickname || '--',
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
        name: ctx.user.nickname,
        avatar: ctx.user.avatar,
        text: blessWords,
        time: Date.now(),
      };
      app.eventsource.broadcast('postBless', JSON.stringify(payload));
    }
  }
  return DispatchController;
};