import { sendSignal } from "./sendData";
import { SignalType } from "../type";

let localConnection: RTCPeerConnection;
let receiveConnection = new RTCPeerConnection();

let dataChannel: RTCDataChannel;
let receiveChannel: RTCDataChannel;

const receiveChannelCallback = (event: RTCDataChannelEvent) => {
  receiveChannel = event.channel;
  receiveChannel.onmessage = (e) => {
    console.log("dataChannel onmessage", e);
  };
  receiveChannel.onopen = (e) => {
    console.log("dataChannel onopen", e);
  };

  receiveChannel.onclose = (e) => {
    console.log("dataChannel onclose", e);
  };
};

const onIcecandidate = (event: RTCPeerConnectionIceEvent) => {
  // if (!e.candidate) return;
  const candidate = event.candidate;
  if (candidate) {
    console.log("sent icecandidate");

    sendSignal({
      type: SignalType.ICE_CANDIDATE,
      data: candidate,
    });
  }
};

const receivedIcecandidate = (receivedSDP: RTCIceCandidateInit) => {
  if (localConnection) {
    localConnection.addIceCandidate(receivedSDP);
    console.log("localConnection receivedIcecandidate", receivedSDP);
  } else {
    receiveConnection.addIceCandidate(receivedSDP);
    console.log("receiveConnection receivedIcecandidate", receivedSDP);
  }
};

const createOffer = async (localConnection: RTCPeerConnection) => {
  const offer = await localConnection.createOffer();

  return offer;
};

const sendOfferCall = (offer: RTCSessionDescriptionInit) => {
  sendSignal({
    type: SignalType.OFFER_CALL,
    data: offer,
  });
};

const creatDataChannel = (localConnection: RTCPeerConnection) => {
  dataChannel = localConnection.createDataChannel("111");

  dataChannel.onopen = (e) => {
    console.log("dataChannel onopen", e);
    dataChannel.send("你好，我准备好了");
  };

  dataChannel.onclose = (event) => {
    console.log("dataChannel onclose", event);
  };

  dataChannel.onerror = (event) => {
    console.log("dataChannel onerror", event);
  };

  dataChannel.onmessage = (e) => {
    console.log("dataChannel onmessage", e);
  };
};

const sendData = (value: string) => {
  if (dataChannel) {
    dataChannel.send(value);
  } else if (receiveChannel) {
    receiveChannel.send(value);
  }
};

const init = async () => {
  localConnection = new RTCPeerConnection();
  console.log("创建 RTCPeerConnection 完成", localConnection);

  creatDataChannel(localConnection);

  const offer = await createOffer(localConnection);

  await localConnection.setLocalDescription(offer);

  localConnection.onicecandidate = onIcecandidate;
  localConnection.onconnectionstatechange = (data) => {
    console.log("onconnectionstatechange", data);
  };

  sendOfferCall(offer);

  return offer;
};

const receiveOffer = async (offer: RTCSessionDescriptionInit) => {
  await receiveConnection.setRemoteDescription(offer);
  const answer = await receiveConnection.createAnswer();
  await receiveConnection.setLocalDescription(answer);

  receiveConnection.ondatachannel = receiveChannelCallback;

  receiveConnection.onicecandidate = onIcecandidate;
  receiveConnection.onconnectionstatechange = (data) => {
    console.log("receiveConnection - onconnectionstatechange", data);
  };
  console.log("receiveOffer");

  sendAnswer(answer);

  return answer;
};

const sendAnswer = (answer: RTCSessionDescriptionInit) => {
  console.log("sendAnswer");
  sendSignal({
    type: SignalType.OFFER_ANSWER,
    data: answer,
  });
};

const receiveAnswer = async (answer: RTCSessionDescriptionInit) => {
  console.log("receiveAnswer", answer);

  await localConnection.setRemoteDescription(new RTCSessionDescription(answer));
};

const getConnectionState = () => {
  console.log("getConnectionState", localConnection);
};

export {
  init,
  receiveOffer,
  receiveAnswer,
  getConnectionState,
  sendData,
  receivedIcecandidate,
};
