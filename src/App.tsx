// @ts-nocheck
//
import React, { useEffect, useState } from "react";
import "./App.css";

// import { initSocket } from "../src/utils/socket";

import { createRoom, joinRoom, chatInRoom, sendToPeer } from "./utils/test";

// import { sendMessage, sendSignal } from "../src/utils/sendData";
// import { login } from "../src/utils/user";
// import { init, getConnectionState, sendData } from "../src/utils/rtc";
//
// initSocket();

const id = Math.ceil(Math.random() * 100).toString();

function App() {
  const [userName, setUserName] = useState<string>("");
  const [data, setData] = useState<string>("");
  const [data1, setData1] = useState<string>("");
  const [data2, setData2] = useState<string>("");

  const test1 = (
    <header className="App-header">
      <p>
        Edit <code>src/App.tsx </code> and save to reload.
      </p>
      <a
        className="App-link"
        href="https://reactjs.org"
        target="_blank"
        rel="noopener noreferrer"
      >
        Learn React
      </a>
      <span
        onClick={() => {
          sendMessage("你好");
        }}
      >
        test
      </span>
      <input
        type="text"
        onChange={(e) => {
          setUserName(e.target.value);
        }}
        defaultValue={userName}
      />
      <button
        onClick={() => {
          login(userName);
        }}
      >
        提交
      </button>

      <button
        onClick={async () => {
          await init();
          console.log("发送 offer");
        }}
      >
        发送 offer
      </button>
      <button
        onClick={() => {
          getConnectionState();
        }}
      >
        链接状态
      </button>
      <input
        type="text"
        onChange={(e) => {
          setData(e.target.value);
        }}
        defaultValue={data}
      />

      <button
        onClick={() => {
          sendData(data);
        }}
      >
        发送消息
      </button>
    </header>
  );

  const test2 = (
    <div>
      <button
        onClick={() => {
          createRoom();
        }}
      >
        创建房间
      </button>

      <input
        type="text"
        onChange={(e) => {
          setData(e.target.value);
        }}
        defaultValue={data}
      />

      <button
        onClick={() => {
          joinRoom(data);
        }}
      >
        加入房间
      </button>

      <input
        type="text"
        onChange={(e) => {
          setData1(e.target.value);
        }}
        defaultValue={data1}
      />

      <button
        onClick={() => {
          chatInRoom(data1);
        }}
      >
        发送消息
      </button>

      <input
        type="text"
        onChange={(e) => {
          setData2(e.target.value);
        }}
        defaultValue={data2}
      />

      <button
        onClick={() => {
          sendToPeer(data2);
        }}
      >
        发送到 peer
      </button>
    </div>
  );
  useEffect(() => {
    function getElementLeft(element) {
      var actualLeft = element.offsetLeft;
      var current = element.offsetParent;

      while (current !== null) {
        actualLeft += current.offsetLeft;
        current = current.offsetParent;
      }

      return actualLeft;
    }

    function getElementTop(element) {
      var actualTop = element.offsetTop;
      var current = element.offsetParent;

      while (current !== null) {
        actualTop += current.offsetTop;
        current = current.offsetParent;
      }

      return actualTop;
    }

    const mouse = document?.getElementById(id);

    let left = getElementLeft(mouse);
    let top = getElementTop(mouse);

    document.onkeydown = function (e) {
      //对整个页面监听
      var keyNum = window.event ? e.keyCode : e.which; //获取被按下的键值
      //判断如果用户按下了回车键（keycody=13）
      if (keyNum == 37) {
        left -= 50;
      }
      if (keyNum == 38) {
        top -= 50;
      }
      if (keyNum == 39) {
        left += 50;
      }
      if (keyNum == 40) {
        top += 50;
      }

      // mouse.style.left = `${left}px`;
      // mouse.style.top = `${top}px`;

      sendToPeer({
        type: "move",
        data: {
          left,
          top,
          id,
        },
      });
    };
  }, []);

  return (
    <>
      <div className="App">{test2}</div>
      <div
        className="mouse"
        id={id}
        style={{
          left: `${Math.ceil(Math.random() * 1000)}px`,
          top: `${Math.ceil(Math.random() * 1000)}px`,
          backgroundColor: `#${Math.ceil(Math.random() * 1000)}`,
        }}
      />
    </>
  );
}

export default App;
