import './index.less';
import Ractive from 'ractive';
import EventSource from 'eventsource';
import { popDm, proxy } from '../../util';
import { lottery } from '../../service';
import { logs } from 'context';

const dmQueue = logs.map(data => {
  return {
    text: data.blesswords,
    avatar: data.avatar,
  };
});

const ractive = Ractive({
  target: '#app',
  template: `<div class="blessWall">
    {{#if popshow}}
    <div class="luckyUser">
      <img src="{{luckyUser.avatar}}" />
      <p class="nikename">{{luckyUser.nikename}}</p>
      <a class="closePop" on-click="@this.closePop()">✕</a>
    </div>
    {{/if}}
    {{#if loading}}
    <div class="loading">正在抽奖中...</div>
    {{/if}}
    {{#if noGuys}}
    <div class="no-guys">无人中奖，再抽一次吧</div>
    {{/if}}
    <a class="lotteryBtn" on-click="@this.startLottery()">抽奖</a>
  </div>`,
  data: {
    popshow: false,
    luckyUser: null,
    noGuys: false,
    dmQueue,
  },
  on: {
    init() {
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
        popDm(dmQueue.shift());
      }
    },
    postBless(data) {
      const dmQueue = this.get('dmQueue');
      dmQueue.push(data);
    },
    popLuckyUser(data) {
      this.set({
        popshow: true,
        luckyUser: data,
      });
    },
  },
  showLoading() {
    this.set({
      noGuys: false,
      popshow: false,
      loading: true,
    });
  },
  hideLoading() {
    this.set({
      loading: false,
    });
  },
  closePop() {
    this.set({
      popshow: false,
      luckyUser: null,
    });
  },
  async startLottery() {
    if (this.isLoading) {
      return;
    }
    this.isLoading = true;
    this.showLoading();
    const resp = await lottery();
    if (resp.success && resp.result) {
      this.fire('popLuckyUser', resp.result);
    } else {
      this.set({
        noGuys: true,
        popshow: false,
      });
    }
    this.hideLoading();
    this.isLoading = false;
  },
});

const es = new EventSource('/__eventsource');
[ 'postBless' ].forEach(evtName => {
  es.on(evtName, proxy(evtName, ractive));
});
