const dgram = require('dgram');
const config = require('./config');

class XplaneUDPClient {
  async init () {
    // should be initialized after this.onMessage is set
    this.host = config.XPLANE_UDP_HOST;
    this.srcPort = config.XPLANE_UDP_SRC_PORT;
    this.connected = false;

    this.destPort = config.XPLANE_UDP_DEST_PORT;
    this.sendSocket = dgram.createSocket('udp4');
    await new Promise((resolve, reject) => {
      this.sendSocket.on('error', err => {
        console.log(`sendSocket error:\n${err.stack}`);
        reject(err);
      });
      this.sendSocket.on('connect', () => {
        console.log('sendSocket connected on: ' + this.destPort);
        resolve();
      });
      this.sendSocket.connect(this.destPort, this.host);
    });

    this.recvSocket = dgram.createSocket('udp4');
    this.recvSocket.on('message', (msg, rinfo) => {
      if (
        rinfo.address !== this.host ||
        rinfo.port !== this.srcPort ||
        msg.toString('utf8', 0, 4) !== 'RREF'
      ) { return; }
      this.onMessage(this._readRREF(msg));
    });
    this.recvPort = this.sendSocket.address().port;
    await new Promise((resolve, reject) => {
      this.recvSocket.on('error', err => {
        console.log(`recvSocket error:\n${err.stack}`);
        reject(err);
      });
      this.recvSocket.bind(this.recvPort, this.host, () => {
        this.connected = true;
        console.log('recvSocket bound on: ' + this.recvPort);
        resolve();
      });
    });

    this.subscribed = [];
  }

  _readRREF (msg) {
    const data = {};
    for (let i = 5; i < msg.length; i += 8) {
      data[msg.readInt32LE(i)] = msg.readFloatLE(i + 4);
    }
    return data;
  }

  executeCommand (command) {
    const buf = Buffer.alloc(5 + command.length);
    buf.write('CMND\0');
    buf.write(command, 5);
    this.sendSocket.send(buf);
  }

  setDataref (dref, value) {
    if (!this.connected) return;
    const buf = Buffer.alloc(509);
    buf.write('DREF\0');
    buf.writeFloatLE(value, 5);
    buf.write(dref, 9);
    this.sendSocket.send(buf);
  }

  _RREF (dref, index, freq) {
    const buf = Buffer.alloc(413);
    buf.write('RREF\0');
    buf.writeInt32LE(freq, 5);
    buf.writeInt32LE(index, 9);
    buf.write(dref + '\0', 13);
    this.sendSocket.send(buf);
  }

  subscribe (dref, index, freq = 1) {
    if (!this.connected) return;
    this._RREF(dref, index, freq);
    this.subscribed.push({ dref, index });
  }

  unsubscribe (dref, index) {
    if (!this.connected) return;
    this._RREF(dref, index, 0);
  }

  async close (autoUnsub = true) {
    if (autoUnsub) {
      for (const sub of this.subscribed) {
        this.unsubscribe(sub.dref, sub.index);
      }
    }
    this.sendSocket.close();
    this.recvSocket.close();
  }
}
module.exports = XplaneUDPClient;
