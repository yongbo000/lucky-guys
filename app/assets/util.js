function random(n , m) {
  const c = m - n + 1;  
  return (Math.random() * c + n).toFixed(2);
};

module.exports = {
  popDm(dm) {
    const $dm = jQuery(`<div class="dm-item">
      <img src="${dm.avatar}" />
      <span>${dm.text}</span>
    </div>`);
    const top = random(0, 80);
    const left = random(90, 110);
    const speed = random(5, 10); 
    const time = Math.floor(left * 1000 / speed);
    $dm
      .css({
        left: left + '%',
        top: top + '%',
      })
      .appendTo('body')
      .animate({
        left: '-50%',
      }, time, 'linear', () => {
        $dm.remove();
      });
  },
  proxy(evt, ractive) {
    return (msgEvt) => {
      let data;
      try {
        data = JSON.parse(msgEvt.data)
      } catch (e) {
        console.error(e);
        data = msgEvt.data;
      }
      ractive.fire(evt, data);
    }
  },
};