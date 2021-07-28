import { DataType, MessageData, SignalData } from "../type";

import { getSocket } from "./socket";

const sendData = (type: DataType, data: any) => {
  const socket = getSocket();
  socket?.emit(type, data);
};

const sendMessage = (data: MessageData) => {
  const socket = getSocket();
  socket?.emit(DataType.MESSAGE, data);
};

const sendSignal = (data: SignalData) => {
  const socket = getSocket();
  socket?.emit(DataType.SIGNAL, data);
};

export { sendMessage, sendSignal };
