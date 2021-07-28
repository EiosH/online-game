import { once } from "lodash";
// @ts-ignore
import getBrowserRTC from "get-browser-rtc";
import EventEmitter from "events";
import wrtc from "wrtc";

const webRTC = typeof window === "undefined" ? wrtc : getBrowserRTC();

const RTCPeerConnection = webRTC.RTCPeerConnection;
const RTCSessionDescription = webRTC.RTCSessionDescription;
const RTCIceCandidate = webRTC.RTCIceCandidate;

const CONFIG = {
  iceServers: [{ urls: "stun:23.21.150.121" }],
};

const CONSTRAINTS = {};

const CHANNEL_NAME = "instant.io";

interface PeerProps {
  isManual?: boolean;
}

class Peer extends EventEmitter {
  ready = false;
  dataChannelReady = false;
  _pc: RTCPeerConnection | null | undefined;
  dataChannel: RTCDataChannel;
  constructor(opts?: PeerProps) {
    //@ts-ignore
    opts = opts || {};
    super();
    const peer = this;

    const peerConnection = new RTCPeerConnection(CONFIG, CONSTRAINTS);

    peerConnection.oniceconnectionstatechange = function () {
      const { iceGatheringState, iceConnectionState } = peer._pc || {};

      peer.emit("iceconnectionstatechange", {
        iceGatheringState,
        iceConnectionState,
      });

      if (
        iceConnectionState === "connected" ||
        iceConnectionState === "completed"
      ) {
        if (!peer.ready) {
          peer.ready = true;
          peer.emit("ready", { ready: true });
        }
      }

      if (iceConnectionState === "disconnected") {
        peer.close();
        peer.emit("close");
      }
    };

    peerConnection.onsignalingstatechange = function () {
      const { signalingState } = peer._pc || {};

      peer.emit("signalingstatechange", {
        signalingState,
      });
    };

    peerConnection.onicecandidate = function (
      event: RTCPeerConnectionIceEvent
    ) {
      const candidate = event.candidate;
      candidate && peer.emit("signal", { candidate });
    };

    peerConnection.ondatachannel = (event: RTCDataChannelEvent) => {
      peer.setupDataChannel(event);
    };

    peer._pc = peerConnection;

    // if (opts.stream) {
    //   this._setupVideo(opts.stream);
    // }

    if (!opts?.isManual) {
      peer.start();
    }
  }
  close() {
    const peer = this;

    if (peer._pc) {
      try {
        peer._pc.close();
      } catch (err) {}

      peer._pc.oniceconnectionstatechange = null;
      peer._pc.onsignalingstatechange = null;
      peer._pc.onicecandidate = null;
    }

    if (peer.dataChannel) {
      try {
        peer.dataChannel.close();
      } catch (err) {}

      peer.dataChannel.onmessage = null;
    }

    peer._pc = null;
    peer.dataChannel = null;
  }

  setupDataChannel(event: { channel: RTCDataChannel }) {
    const peer = this;

    peer.dataChannel = event.channel;

    peer.dataChannel.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      peer.emit("data", data);
    };

    peer.dataChannel.onopen = (event: MessageEvent) => {
      if (!peer.dataChannelReady) {
        peer.dataChannelReady = true;
        peer.emit("dataChannelReady", { ready: true }, event);
      }
    };

    peer.dataChannel.onclose = () => {
      if (peer.dataChannelReady) {
        peer.dataChannelReady = false;
        peer.close();
      }
    };
  }

  async signal(data: {
    candidate?: RTCPeerConnectionIceEvent;
    offer?: RTCSessionDescriptionInit;
    answer?: RTCSessionDescriptionInit;
  }) {
    const peer = this;
    if (!peer._pc) {
      throw new Error("signal error");
      return;
    }

    if (data?.offer || data?.answer) {
      const value = data?.offer || data?.answer;
      await peer._pc.setRemoteDescription(new RTCSessionDescription(value));

      const needsAnswer = data.offer && !data.answer;

      if (!needsAnswer) return;
      const answer = await peer._pc.createAnswer();
      await peer._pc.setLocalDescription(answer);

      peer.emit("signal", { answer });
    } else if (data?.candidate) {
      await peer._pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    } else {
      throw new Error("signal`s param is invalid signal type'");
    }
  }

  send(data: Object) {
    const peer = this;
    try {
      if (
        !peer._pc ||
        !peer.dataChannel ||
        peer.dataChannel.readyState !== "open"
      ) {
        return;
      }

      peer.dataChannel.send(JSON.stringify(data));
    } catch (e) {
      throw new Error("not ready to send" + e);
    }
  }

  start() {
    const peer = this;
    if (!peer?._pc) return;

    if (!peer.ready) {
      peer.setupDataChannel({
        channel: peer._pc.createDataChannel(CHANNEL_NAME),
      });

      peer._pc.onnegotiationneeded = once(async function () {
        if (!peer?._pc) return;

        const offer = await peer._pc.createOffer();
        await peer._pc.setLocalDescription(offer);
        peer.emit("signal", { offer });
      });
    }
  }
}

// Peer.prototype._setupVideo = function (stream) {
//   peer._pc.addStream(stream);
//
//   var peer = this;
//   peer._pc.onaddstream = function (event) {
//     var stream = event.stream;
//     peer.emit("stream", stream);
//   };
// };

export default Peer;
