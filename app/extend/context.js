module.exports = {
  get isAjax() {
    if (this.get('X-Requested-With') === 'XMLHttpRequest') {
      return true;
    }
    const accept = this.get('Accept');
    if (accept === 'application/json' || accept === 'application/vnd.api+json') {
      return true;
    }
    return /\.json$/i.test(this.path);
  },

  renderErrorPage(errorMsg) {
    return this.render('error.html', {
      errorMsg,
    });
  },

  throwBizError(errorMsg) {
    throw new Error(errorMsg);
  },

  throwSlient(errorMsg) {
    const error = new Error(errorMsg);
    error.slient = true;
    throw error;
  },
};
