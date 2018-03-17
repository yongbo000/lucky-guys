const egg = require('egg');

module.exports = app => {


  class DispatchController extends egg.Controller {
    async bigscreen() {
      const { ctx } = this;
      await ctx.render('bigScreen.html');
    }

    async bless() {
      const { ctx } = this;
      const user = {
        avatar: ctx.user.avatar || 'http://cdn-dolphinwit.oss-cn-beijing.aliyuncs.com/lucky-guys/images/default_avatar.jpg',
        nickname: ctx.user.nickname || '--',
      };
      const logs = await ctx.service.log.topQuery();
      await ctx.render('bless.html', {
        context: {
          user,
          logs,
        },
      });
    }

    async lottery() {

    }

    async postBless() {
      const { ctx } = this;
      let blessWords = (ctx.request.body.blessWords || '').trim();
      if (!blessWords) {
        ctx.throwBizError('缺少祝福语');
      }
      const clientId = ctx.request.body.clientId;
      const nikename = ctx.user.nickname;
      const avatar = ctx.user.avatar;
      const openid = ctx.user.openid;
      blessWords = ctx.helper.escape(blessWords);
      const payload = {
        nikename,
        avatar,
        text: blessWords,
        time: Date.now(),
      };
      app.eventsource.broadcast('postBless', JSON.stringify(payload));
      await ctx.service.log.save({ clientId, blessWords, nikename, avatar, openid });
    }
  }
  return DispatchController;
};