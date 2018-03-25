const path = require('path');
const wxOAuthConfig = require('./wxoauth.json');

module.exports = appInfo => {
  const baseAppDir = appInfo.baseDir;
  const exports = {};

  exports.proxy = true;

  exports.middleware = [
    'responseWrapper',
  ];

  // 密钥
  exports.keys = appInfo.name + '_1513135006467';

  exports.view = {
    defaultViewEngine: 'nunjucks',
    mapping: {
      '.html': 'nunjucks',
    },
  };

  exports.notfound = {
    pageUrl: '/404.html',
  };

  exports.static = {
    prefix: '/',
    dir: path.join(baseAppDir, 'app/public'),
  };

  exports.siteFile = {
    '/favicon.ico': '',
  };

  exports.wxOAuth = {
    appid: wxOAuthConfig.appid,
    redirect_uri: wxOAuthConfig.redirect_uri,
  };

  exports.assetsUrl = '//cdn-dolphinwit.oss-cn-beijing.aliyuncs.com/lucky-guys/jscss';

  return exports;
};
