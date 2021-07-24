import io from "socket.io-client";

let socket: any;

const initSocket = () => {
  socket = io("ws://localhost:1234");

  socket.on("connect", (msg: string) => {
    console.log("connect");
  });

  socket.on("disConnect", (msg: string) => {
    console.log("disConnect");
  });
};

const getSocket = () => socket;

export { initSocket, getSocket };
