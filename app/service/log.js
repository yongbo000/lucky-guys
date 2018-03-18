const egg = require('egg');
const AV = require('leancloud-storage');
const leancloudConfig = require('../../config/leancloud.json');
AV.init(leancloudConfig);

const Log = AV.Object.extend('Log');
const queryLog = new AV.Query('Log');

module.exports = (app) => {
  const excptionCallback = (e) => {
    app.logger.error(e);
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
    save({ clientId, blessWords, openid, nikename, avatar }) {
      const log = new Log();
      log.set('clientId', clientId);
      log.set('blesswords', blessWords);
      log.set('openid', openid);
      log.set('nikename', nikename);
      log.set('avatar', avatar);
      return log.save().catch(excptionCallback);
    }
  };
  return LogService;
};
