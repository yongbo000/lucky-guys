const egg = require('egg');

module.exports = app => {
  function random(n, m) {
    const c = m - n + 1;
    return Math.floor(Math.random() * c + n);
  }

  const asyncCall = (asyncFn) => {
    asyncFn();
  }

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
      const { ctx } = this;
      const users = await ctx.service.log.joinUserQuery();
      if (users && users.length) {
        asyncCall(async () => {
          await new Promise(resolve => {
            app.eventsource.broadcast('popLuckyUser', JSON.stringify(users[ random(0, users.length - 1) ]));
            resolve();
          });
        });
      }
    }

    async postBless() {
      const { ctx } = this;
      let blessWords = (ctx.request.body.blessWords || '').trim();
      if (!blessWords) {
        ctx.throwBizError('缺少祝福语');
      }
      const clientId = ctx.request.body.clientId;
      if (!clientId) {
        ctx.throwBizError('正在建立连接，请3s后重试');
      }
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

      asyncCall(async () => {
        await Promise.all([
          new Promise(resolve => {
            app.eventsource.broadcast('postBless', JSON.stringify(payload));
            resolve();
          }),
          ctx.service.log.save({ clientId, blessWords, nikename, avatar, openid })
        ]);
      });
    }
  }
  return DispatchController;
};