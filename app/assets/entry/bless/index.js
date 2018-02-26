import './index.less';
import Ractive from 'ractive';
import EventSource from 'eventsource';
import { postBless } from '../../service';
import { popDm, proxy } from '../../util';
import jQuery from 'jquery';

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
    <input maxLength="30" class="input" type="text" value="{{blessWords}}" placeholder="发送祝福参与抽奖哦" autofocus tabIndex="1" />
    <p class="err-tip">{{errMsg}}</p>
    <div class="fixed-btm">
      <a class-disabled="!blessWords" class="post-btn" on-click="@this.postBlessBtnClick()">发送</a>
    </div>
  </div>`,
  data: {
    dmQueue: [],
    name: 'jambo',
    blessWords: '',
    errMsg: '',
  },
  on: {
    popDm() {
      const dmQueue = this.get('dmQueue');
      while(dmQueue.length) {
        const dm = dmQueue.shift();
        popDm(dm);
      } 
    },
    postBless(data) {
      const dmQueue = this.get('dmQueue');
      dmQueue.push(data);
      if (dmQueue.length) {
        this.fire('popDm');
      }
    },
  },
  async postBlessBtnClick() {
    const blessWords = this.get('blessWords').trim();
    if (!blessWords) {
      return this.set({
        errMsg: '输入祝福语，才能发送',
      });
    }
    const resp = await postBless({
      blessWords,
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