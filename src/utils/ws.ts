type ConstructorParameters<T> = T extends new (...args: infer P) => any
  ? P
  : never;

type WSParams = ConstructorParameters<typeof WebSocket>;

type TaskQueue = {
  data: any;
  createTime: number;
  retry: number;
};

enum ReadyState {
  CONNECTING,
  OPEN,
  CLOSING,
  CLOSED,
}

const expireTime = 10000;
const maxRetryTime = 3;

class WS extends WebSocket {
  taskQueue: TaskQueue[] = [];
  constructor(...arg: WSParams) {
    super(...arg);

    this.onopen = () => {
      const taskQueue = this.taskQueue;

      while (taskQueue.length) {
        const task = taskQueue.shift();
        const { createTime, data, retry } = task;

        const isExpire = createTime && Date.now() - createTime > expireTime;
        if (!isExpire) {
          this.sendData(data, retry + 1);
        }
      }
    };

    // return new WS(...arg);
  }

  addOnMessage(callback: (arg: any) => void) {
    if (!callback) return;
    this.onmessage = function (message) {
      const { data } = message;
      callback(JSON.parse(data));
    };
  }

  isOpen = () => this.readyState === ReadyState.OPEN;
  isConnecting = () => this.readyState === ReadyState.CONNECTING;

  sendData = (data: any, retry = 0) => {
    if (this.isOpen()) {
      ws.send(JSON.stringify(data));
    } else if (this.isConnecting()) {
      if (retry > maxRetryTime) return;
      ws.taskQueue.push({
        data,
        createTime: Date.now(),
        retry,
      });
    }
  };
}

const ws = new WS("ws://localhost:8888");

export default ws;
