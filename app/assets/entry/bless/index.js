import './index.less';
import Ractive from 'ractive';
import keys from 'ractive-events-keys';
import EventSource from 'eventsource';
import context from 'context';
import { postBless } from '../../service';
import { popDm, proxy } from '../../util';

const ractive = Ractive({
  target: '#app',
  template: `<div class="bless-block">
    <div class="avatar">
      <img src="{{avatar}}" />
    </div>
    <div class="words">
      <p class="wxname">你好，{{name}}</p>
      <p class="text">感谢来参加婚礼哦～</p>
    </div>
    <div class="input-wrap">
      <input on-enter="@this.postBlessWords()" maxLength="30" class="input" type="text" value="{{blessWords}}" placeholder="发送祝福参与抽奖哦" autofocus tabIndex="1" />
      <a class-disabled="!blessWords" class="post-btn" on-click="@this.postBlessWords()">发送</a>
      <p class="err-tip">{{errMsg}}</p>
    </div>
    <div class="tx-block">
      <h3>特效</h3>
      <label class="option"><input type="checkbox" name="largefont" checked="{{magics.largefont}}" /><span>大字体</span></label>
      <label class="option"><input type="checkbox" name="colorfull" checked="{{magics.colorfull}}" /><span>随机色彩</span></label>
      <label class="option"><input type="checkbox" name="animscale" checked="{{magics.animscale}}" /><span>动画(弹弹)</span></label>
    </div>
    <div class="alivecount">实时在线人数：{{aliveCounts}}</div>
  </div>`,
  events: {
    enter: keys.enter,
  },
  data: {
    dmQueue: [],
    avatar: context.avatar,
    name: context.nickname,
    blessWords: '',
    errMsg: '',
    aliveCounts: '--',
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

    heartbeat(data) {
      this.set({
        aliveCounts: data.aliveClients,
      });
    },
  },
  async postBlessWords() {
    const blessWords = this.get('blessWords').trim();
    if (!blessWords) {
      return this.set({
        errMsg: '输入祝福语，再点发送哦',
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
        errMsg: resp.message || '太火爆了，请再试一次吧',
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
[ 'postBless', 'heartbeat' ].forEach(evtName => {
  es.on(evtName, proxy(evtName, ractive));
});

let hasEsErr = false;
es.on('error', (e) => {
  hasEsErr = true;
  ractive.set({
    errMsg: '连接断开，正在尝试重新连接...',
  });
});

es.on('open', () => {
  console.log('连接成功');
  if (hasEsErr) {
    ractive.set({
      errMsg: '重连成功，去发祝福吧',
    });
  }
  hasEsErr = false;
});