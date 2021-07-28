//@ts-nocheck
import Peer from "./pure-rtc";
import ws from "./ws";

const peer = new Peer({ isManual: true });

peer.on("signal", (signal: any) => {
  ws.sendData({
    type: "signal",
    data: signal,
  });
});

const getSignal = (data: any) => {
  peer.signal(data);
};

peer.on("dataChannelReady", () => {
  peer.send("im ready");
});

peer.on("data", (originData: any) => {
  // got a data channel message
  console.log("收到 peer 信息", originData);

  const move = (data) => {
    const { id, left, top } = data;
    let mouse = document?.getElementById(id);
    if (mouse) {
      mouse.style.left = `${left}px`;
      mouse.style.top = `${top}px`;
    } else {
      mouse = document.createElement("div");

      mouse.setAttribute("id", id);
      mouse.setAttribute("class", "mouse");
      document.getElementById("root").append(mouse);
    }
  };

  const { type, data } = originData;
  if (type === "move") {
    move(data);
  }
});

ws.addOnMessage((originData) => {
  const { data, type } = originData;

  console.log("收到信息类型", type, "内容:", data);

  switch (type) {
    case "create":
      return;

    case "signal":
      getSignal(data);
      return;

    case "establish":
      peer.start();
      return;
  }
});

const createRoom = () => {
  ws.sendData({
    type: "create",
  });
};

const joinRoom = (roomId: string) => {
  ws.sendData({
    type: "join",
    data: roomId,
  });
};

const chatInRoom = (data: string) => {
  ws.sendData({
    type: "chat",
    data,
  });
};

const startGame = (data: string) => {
  ws.sendData({
    type: "start",
    data,
  });
};

const sendToPeer = (data: string) => {
  peer?.send(data);
};

export { createRoom, joinRoom, chatInRoom, startGame, sendToPeer };
