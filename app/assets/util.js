function random(n, m) {
  const c = m - n + 1;
  return (Math.random() * c + n).toFixed(2);
}

const magicFn = {
  largefont($dm) {
    const fs = (Math.floor(random(36, 48)) / 100).toFixed(2);
    return $dm.css({
      'font-size': fs + 'rem',
    });
  },
  colorfull($dm) {
    const colors = [
      {
        background: '#b4323291',
      },
      {
        background: '#3ad730c4',
      },
      {
        background: '#101073b8',
      },
      {
        background: '#6060a6d6',
      },
      {
        background: '#3e4606cf',
      },
      {
        background: '#850692c7',
      },
      {
        background: '#850808c2',
      },
    ];
    const len = Math.floor(Math.random() * colors.length);
    const color = colors[ len ];
    return $dm.css({
      background: color.background,
      color: color.color || '#fff',
    });
  },
  animscale($dm) {
    return $dm.addClass('animscale');
  },
};

module.exports = {
  popDm(dm) {
    const m = dm.text.match(/^#(.+)?#/);
    let magics = [];
    if (m) {
      magics = m[1].split(',');
      dm.originText = dm.text;
      dm.text = dm.text.replace(/^#.+#/, '');
    }
    let $dm;
    if (magics.indexOf('redbag') > -1) {
      $dm = jQuery(`<div class="red-bag">
        <img src="${dm.avatar}" />
        <p>${dm.nikename}发来口令红包</p>
        <span>${dm.text}</span>
        <a class="closePop">✕</a>
      </div>`);
      $dm.find('.closePop').on('click', (e) => {
        $(e.target).parent().remove();
      });
      jQuery('body').find('.red-bag').remove();
      $dm.appendTo('body');
    } else {
      $dm = jQuery(`<div class="dm-item">
        <img src="${dm.avatar}" />
        <span>${dm.text}</span>
      </div>`);
      magics.forEach(mgc => {
        if (magicFn[mgc]) {
          magicFn[mgc]($dm);
        }
      });
      const top = random(0, 85);
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
    }
  },
  proxy(evt, ractive) {
    return msgEvt => {
      let data;
      try {
        data = JSON.parse(msgEvt.data);
      } catch (e) {
        console.error(e);
        data = msgEvt.data;
      }
      ractive.fire(evt, data);
    };
  },
};
