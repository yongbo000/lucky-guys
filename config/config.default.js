const path = require('path');

module.exports = appInfo => {
  const baseAppDir = appInfo.baseDir;
  const exports = {};

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

  exports.assetsUrl = '//cdn-dolphinwit.oss-cn-beijing.aliyuncs.com/lucky-guys';

  return exports;
};
