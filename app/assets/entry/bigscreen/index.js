import './index.less';
import Ractive from 'ractive';
import EventSource from 'eventsource';
import { popDm, proxy } from '../../util';

const ractive = Ractive({
  target: '#app',
  template: `<div class="blessWall">
    <a on-click="@this.choujiang()">抽奖</a>
  </div>`,
  data: {
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
  },
  choujiang() {
    
  },
});

const es = new EventSource('/__eventsource');
[ 'joined', 'postBless' ].forEach(evtName => {
  es.on(evtName, proxy(evtName, ractive));
});
