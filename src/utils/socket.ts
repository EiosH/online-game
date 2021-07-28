import io from "socket.io-client";
import { DataType, SignalData, SignalType } from "../type";
import { receiveOffer, receiveAnswer, receivedIcecandidate } from "./rtc";

let socket: any;

// const PATH = "http://10.2.237.42:1234";
// const PATH = "http://192.168.1.5:1234";
const PATH = "ws://localhost:1234";
// const PATH = "ws://localhost:8888";

const initSocket = () => {
  socket = io(PATH);

  socket.on("connect", (msg: string) => {
    console.log("connect   websocket 连接完成");
  });

  socket.on("disConnect", (msg: string) => {
    console.log("disConnect websocket 断开完成");
  });

  socket.on("message", (data: any) => {
    console.log("message", data);
  });

  socket.on(DataType.SIGNAL, (origin: SignalData) => {
    const { data, type } = origin || {};
    switch (type) {
      case SignalType.OFFER_CALL:
        return receiveOffer(data);

      case SignalType.OFFER_ANSWER:
        return receiveAnswer(data);

      case SignalType.ICE_CANDIDATE:
        return receivedIcecandidate(data);
    }
  });
};

const getSocket = () => socket;

export { initSocket, getSocket };
