import './index.less';
import Ractive from 'ractive';
import EventSource from 'eventsource';
import { popDm, proxy } from '../../util';
import { lottery } from '../../service';

const ractive = Ractive({
  target: '#app',
  template: `<div class="blessWall">
    {{#if luckyUser}}
    <div class="luckyUser">
      <img src="{{luckyUser.avatar}}" />
      <p class="nikename">{{luckyUser.nikename}}</p>
      <a class="closePop" on-click="@this.closePop()">✕</a>
    </div>
    {{/if}}
    <a class="lotteryBtn" on-click="@this.startLottery()">抽奖</a>
  </div>`,
  data: {
    show: false,
    luckyUser: null,
    dmQueue: [
      {
        text: '我是弹幕啦啦啦啦',
        avatar: 'http://cdn-dolphinwit.oss-cn-beijing.aliyuncs.com/images/pc/default_avatar.png',
      },
      {
        text: '我啦啦啦',
        avatar: 'http://cdn-dolphinwit.oss-cn-beijing.aliyuncs.com/images/pc/default_avatar.png',
      },
      {
        text: '我是啦啦啦',
        avatar: 'http://cdn-dolphinwit.oss-cn-beijing.aliyuncs.com/images/pc/default_avatar.png',
      },
      {
        text: '我是弹幕啦啦啦啦啦啦啦啦啦啦',
        avatar: 'http://cdn-dolphinwit.oss-cn-beijing.aliyuncs.com/images/pc/default_avatar.png',
      },
    ],
  },
  on: {
    init() {
      this.fire('popDm');
    },
    popDm() {
      const dmQueue = this.get('dmQueue');
      while (dmQueue.length) {
        popDm(dmQueue.shift());
      }
    },
    joined() {

    },
    postBless(data) {
      const dmQueue = this.get('dmQueue');
      dmQueue.push(data);
      if (dmQueue.length) {
        this.fire('popDm');
      }
    },
    popLuckyUser(data) {
      this.set({
        show: true,
        luckyUser: data,
      });
    },
  },
  showLoading() {
    console.log('showLoading');
  },
  hideLoading() {
    console.log('hideLoading');
  },
  closePop() {
    this.set({
      show: false,
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
    this.hideLoading();
    this.isLoading = false;
  },
});

const es = new EventSource('/__eventsource');
[ 'postBless', 'popLuckyUser' ].forEach(evtName => {
  es.on(evtName, proxy(evtName, ractive));
});
