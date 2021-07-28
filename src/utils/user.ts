import { sendSignal } from "./sendData";
import { SignalType } from "../type";

const login = (userName: string) => {
  sendSignal({
    data: userName,
    type: SignalType.LOGIN,
  });
};

export { login };
