const egg = require('egg');
const moment = require('moment');

module.exports = app => {
  function random(n, m) {
    const c = m - n + 1;
    return Math.floor(Math.random() * c + n);
  }

  const asyncCall = asyncFn => {
    asyncFn();
  };

  const luckyUserCache = [];

  class DispatchController extends egg.Controller {
    async bigscreen() {
      const { ctx } = this;
      const logs = await ctx.service.log.topQuery();
      await ctx.render('bigScreen.html', {
        context: {
          logs,
        },
      });
    }

    async bless() {
      const { ctx } = this;
      const user = {
        avatar: ctx.user.avatar || 'https://cdn-dolphinwit.oss-cn-beijing.aliyuncs.com/lucky-guys/images/default_avatar.jpg',
        nickname: ctx.user.nickname || '--',
      };
      const [ logs, list, blessCount ] = await Promise.all([
        ctx.service.log.topQuery(),
        ctx.service.log.joinUserQuery(),
        ctx.service.log.blessCount(),
      ]);
      await ctx.render('bless.html', {
        context: {
          user,
          logs,
          blessCount: blessCount || '--',
          joinedUserCount: list && list.length || '--',
        },
      });
    }

    async lottery() {
      const { ctx } = this;
      let users = await ctx.service.log.joinUserQuery();
      users = users.filter(u => {
        return moment(u.createdAt).format('YYYYMMDD') === moment().format('YYYYMMDD');
      });
      users = users.filter(u => {
        return luckyUserCache.indexOf(u.openid) === -1;
      });
      if (users && users.length) {
        const luckyGuy = users[ random(0, users.length - 1) ];
        ctx.logger.info('[lottery] luckyguys=%j', luckyGuy);
        if (luckyGuy) {
          luckyUserCache.indexOf(luckyGuy.openid) === -1 && luckyUserCache.push(luckyGuy.openid);
          asyncCall(async () => {
            await new Promise(resolve => {
              app.eventsource.broadcast('popLuckyUser', JSON.stringify(luckyGuy));
              resolve();
            });
          });
          ctx.body = luckyGuy;
          return;
        }
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
          ctx.service.log.save({ clientId, blessWords, nikename, avatar, openid }),
        ]);
      });
    }
  }
  return DispatchController;
};
