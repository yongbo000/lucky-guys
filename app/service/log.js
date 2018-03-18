const egg = require('egg');
const AV = require('leancloud-storage');
const leancloudConfig = require('../../config/leancloud.json');
AV.init(leancloudConfig);

const Log = AV.Object.extend('Log');
const JoinUser = AV.Object.extend('JoinUser');
const queryLog = new AV.Query('Log');
const joinUserQuery = new AV.Query('JoinUser');

module.exports = (app) => {
  const excptionCallback = (e) => {
    app.logger.error(e);
    return null;
  };
  class LogService extends egg.Service {
    topQuery() {
      queryLog.limit(10);
      queryLog.descending('createdAt');
      return queryLog
          .find()
          .then(logs => {
            return logs.map(log => {
              return {
                clientId: log.get('clientId'),
                blesswords: log.get('blesswords').replace(/#.+?#/g, ''),
                nikename: log.get('nikename'),
                avatar: log.get('avatar'),
              };
            });
          })
          .catch(excptionCallback);
    }
    joinUserQuery() {
      return joinUserQuery
          .find()
          .then(logs => {
            return logs.map(log => {
              return {
                openid: log.get('openid'),
                avatar: log.get('avatar'),
                nikename: log.get('nikename'),
              };
            });
          })
          .catch(excptionCallback);
    }
    save({ clientId, blessWords, openid, nikename, avatar }) {
      const log = new Log();
      log.set('clientId', clientId);
      log.set('blesswords', blessWords);
      log.set('openid', openid);
      log.set('nikename', nikename);
      log.set('avatar', avatar);

      return Promise.all([
        log.save().catch(excptionCallback),
        new Promise(resolve => {
          new AV.Query('JoinUser')
            .equalTo('openid', openid)
            .count()
            .then(count => {
              if (count === 0) {
                const joinUser = new JoinUser();
                joinUser.set('openid', openid);
                joinUser.set('nikename', nikename);
                joinUser.set('avatar', avatar);
                joinUser.set('isLucky', false);
                return joinUser.save().then(resolve).catch(excptionCallback);
              }
              resolve();
          }).catch(excptionCallback);
        }),
      ]).catch(excptionCallback);
    }
  };
  return LogService;
};