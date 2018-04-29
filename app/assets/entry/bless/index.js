import './index.less';
import Ractive from 'ractive';
import keys from 'ractive-events-keys';
import EventSource from 'eventsource';
import { user, logs, joinedUserCount, blessCount } from 'context';
import { postBless } from '../../service';
import { popDm, proxy } from '../../util';

const ractive = Ractive({
  target: '#app',
  template: `<div class="bless-block">
    <div class="banner">
      <div class="avatar">
        <img src="{{avatar}}" />
      </div>
      <div class="words">
        <p class="wxname">你好，{{name}}</p>
        <p class="text">感谢来参加婚礼哦～</p>
      </div>
    </div>
    <div class="input-wrap">
      <input on-enter="@this.postBlessWords()" maxLength="30" class="input" type="text" value="{{blessWords}}" placeholder="发送祝福参与抽奖哦" autofocus tabIndex="1" />
      <a class-disabled="!blessWords" class="post-btn" on-click="@this.postBlessWords()">发送</a>
      {{#if errMsg}}
      <p class="err-tip">{{errMsg}}</p>
      {{/if}}
    </div>
    <div class="tx-block fn-clear">
      <h3>特效：</h3>
      <label class="option"><input type="checkbox" name="redbag" checked="{{magics.redbag}}" /><span>口令</span></label>
      <label class="option"><input type="checkbox" name="largefont" checked="{{magics.largefont}}" /><span>大字体</span></label>
      <label class="option"><input type="checkbox" name="colorfull" checked="{{magics.colorfull}}" /><span>随机色彩</span></label>
      <label class="option"><input type="checkbox" name="animscale" checked="{{magics.animscale}}" /><span>动画(弹弹)</span></label>
    </div>
    <div class="dm-logs">
      <ul>
        {{#each dmLogs}}
        <li>
          <img src="{{avatar}}" />
          <div class="kuang">
            <p class-redbagTag="redbagFlag">{{nikename}}</p>
            <p>{{blesswords.replace(/#.+?#/g, '')}}</p>
          </div>
        </li>
        {{/each}}
      </ul>
      <p class="joinedUserCount">参与人数：{{joinedUserCount}}，总祝福数：{{blessCount}}</p>
    </div>
    <div class="alivecount">
      <p>实时在线人数：{{aliveCounts}}</p>
      <p>页面由 <a href="https://h5.dolphinwit.com/invite/register.html?_chinfo=wx_promo_1">注册即送2000美元的海豚外汇</a> 技术支持</p>
    </div>
  </div>`,
  events: {
    enter: keys.enter,
  },
  data: {
    dmQueue: [],
    blessCount,
    joinedUserCount,
    avatar: user.avatar,
    name: user.nickname,
    blessWords: '',
    errMsg: '',
    aliveCounts: '--',
    clientId: '',
    dmLogs: logs.map(log => {
      log.redbagFlag = log.blesswords.indexOf('redbag') > -1;
      return log;
    }),
    magics: {
      redbag: false,
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
      }, 500);
    },
    popDm() {
      const dmQueue = this.get('dmQueue');
      while (dmQueue.length && jQuery('.dm-item').length <= 20) {
        const dm = dmQueue.shift();
        popDm(dm);
      }
    },
    postBless(data) {
      const dmQueue = this.get('dmQueue').slice(0);
      const dmLogs = this.get('dmLogs').slice(0);
      dmLogs.pop();
      dmLogs.unshift({
        nikename: data.nikename,
        avatar: data.avatar,
        blesswords: data.text.replace(/#.+?#/g, ''),
        redbagFlag: data.text.indexOf('redbag') > -1,
      });
      dmQueue.push(data);
      this.set({
        dmLogs,
        dmQueue,
      });
    },
    heartbeat(data) {
      this.set({
        clientId: data.clientId,
        aliveCounts: data.aliveClients,
      });
    },
  },
  showLoading() {
    this.set({
      isLoading: true,
      errMsg: '正在发送...',
    });
  },
  hideLoading() {
    this.set({
      isLoading: false,
      errMsg: '',
    });
  },
  async postBlessWords() {
    if (this.get('isLoading')) {
      return;
    }
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
    this.showLoading();
    const resp = await postBless({
      clientId: this.get('clientId'),
      blessWords: (workMagics.length ? '#' + workMagics.join(',') + '#' : '') + blessWords,
    });
    this.hideLoading();
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
es.on('error', () => {
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
