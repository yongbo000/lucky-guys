module.exports = app => {
  app.get('/bigscreen.html', app.controller.dispatch.bigscreen);
  app.post('/postBless.json', app.controller.dispatch.postBless);
  app.get('/bless.html', app.controller.dispatch.bless);

  app.get('/oauth/callback', app.controller.dispatch.joined);
};
