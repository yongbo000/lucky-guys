const webpack = require('webpack');

module.exports = function(webpackConfig) {
  webpackConfig.externals = {
    context: 'context',
    ractive: 'Ractive',
    jquery: 'jQuery',
  };
  for (const item of webpackConfig.module.rules) {
    if (item.use && item.use.loader === 'babel-loader') {
      if (!item.use.options.plugins) {
        item.use.options.plugins = [];
      }
      item.use.options.plugins.push('@babel/transform-runtime');
    }
  }
  webpackConfig.plugins.push(
    new webpack.DefinePlugin({
      ENV: '\'local\'',
    })
  );
  return webpackConfig;
};
