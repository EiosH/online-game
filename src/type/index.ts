export type DataFormat<T, Y = string> = {
  data?: Y;
  type: T;
};

export enum DataType {
  MESSAGE = "message",
  SIGNAL = "signal",
}

export enum SignalType {
  LOGIN = "login",
  LOGOUT = "logout",
  OFFER_CALL = "offer_call",
  OFFER_ANSWER = "offer_answer",
  ICE_CANDIDATE = "ice_candidate",
  TEST = "test",
}

export type SignalData = DataFormat<SignalType, any>;
export type MessageData = string;
