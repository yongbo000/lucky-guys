module.exports = app => {
  const { middleware, router } = app;
  router.get('/bigscreen.html', app.controller.dispatch.bigscreen);
  router.post('/postBless.json', middleware.needLogin(), app.controller.dispatch.postBless);
  router.get('/bless.html', middleware.needLogin(), app.controller.dispatch.bless);
};
