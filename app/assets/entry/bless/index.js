import './index.less';
import Ractive from 'ractive';
import keys from 'ractive-events-keys';
import EventSource from 'eventsource';
import { postBless } from '../../service';
import { popDm, proxy } from '../../util';

const ractive = Ractive({
  target: '#app',
  template: `<div class="bless-block">
    <div class="avatar">
      <img src="http://cdn-dolphinwit.oss-cn-beijing.aliyuncs.com/images/pc/default_avatar.png" />
    </div>
    <div class="words">
      <p class="wxname">你好，{{name}}</p>
      <p class="text">感谢来参加婚礼哦～</p>
    </div>
    <input on-enter="@this.postBlessWords()" maxLength="30" class="input" type="text" value="{{blessWords}}" placeholder="发送祝福参与抽奖哦" autofocus tabIndex="1" />
    <p class="err-tip">{{errMsg}}</p>
    <div class="tx-block">
      <h3>特效</h3>
      <label class="option"><input type="checkbox" name="largefont" checked="{{magics.largefont}}" /><span>大字体</span></label>
      <label class="option"><input type="checkbox" name="colorfull" checked="{{magics.colorfull}}" /><span>随机色彩</span></label>
      <label class="option"><input type="checkbox" name="animscale" checked="{{magics.animscale}}" /><span>动画(弹弹)</span></label>
    </div>
  </div>`,
  events: {
    enter: keys.enter,
  },
  data: {
    dmQueue: [],
    name: 'jambo',
    blessWords: '',
    errMsg: '',
    magics: {
      largefont: false,
      colorfull: false,
      animscale: false,
    },
  },
  on: {
    render() {
      setInterval(() => {
        const dmQueue = this.get('dmQueue');
        if (dmQueue.length) {
          this.fire('popDm');
        }
      }, 1000);
    },
    popDm() {
      const dmQueue = this.get('dmQueue');
      while (dmQueue.length) {
        const dm = dmQueue.shift();
        popDm(dm);
      }
    },
    postBless(data) {
      const dmQueue = this.get('dmQueue');
      dmQueue.push(data);
    },
  },
  async postBlessWords() {
    const blessWords = this.get('blessWords').trim();
    if (!blessWords) {
      return this.set({
        errMsg: '输入祝福语，才能发送',
      });
    }
    const magics = this.get('magics');
    const workMagics = [];
    for (const k in magics) {
      if (magics[k]) {
        workMagics.push(k);
      }
    }
    const resp = await postBless({
      blessWords: (workMagics.length ? '#' + workMagics.join(',') + '#' : '') + blessWords,
    });
    if (!resp.success) {
      this.set({
        errMsg: resp.message || '系统繁忙',
      });
      return;
    }
    this.set({
      blessWords: '',
      errMsg: '',
    });
  },
});

const es = new EventSource('/__eventsource');
[ 'postBless' ].forEach(evtName => {
  es.on(evtName, proxy(evtName, ractive));
});
