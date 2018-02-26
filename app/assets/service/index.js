import axios from 'axios';

function getCookie(name) {
  const reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)');
  const arr = window.document.cookie.match(reg);
  if (arr) {
    return window.unescape(arr[2]);
  }
  return null;
}

module.exports = {
  postBless({ blessWords }) {
    return axios
      .post('/postBless.json', {
        blessWords,
        _csrf: getCookie('csrfToken'),
      })
      .then(resp => {
        return resp.data;
      })
      .catch(e => {
        console.error(e);
        return {};
      });
  },
};