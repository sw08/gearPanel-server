const XplaneUDPClient = require('./xplane-udp');
const { WebSocketServer } = require('ws');
const config = require('./config');
const vj = require('vjoy');
const fs = require('fs');

const { SerialPort } = require('serialport');
const { ByteLengthParser } = require('@serialport/parser-byte-length');

let miscPanel = null;
let parser = null;
let device = null;
let udpClient = null;
let wsClient = null;

function replaceCharAt(text, i, newChar) { return text.substring(0, i) + newChar + text.substring(i + 1); }

let lastAcft = '    ';
let newAcft = '    ';
let profile = require('./profiles/default.js');
let xpver = 0;
let lastProfile = '';
let newProfile = '';

const deviceNames = ['gearPanel', 'miscPanel'];
const commClient = {};
deviceNames.forEach(x => {
  commClient[x] = {
    connected: false
  };
});

async function initializeApp() {
  const ports = await SerialPort.list();

  const foundPort = ports.find(p => p.serialNumber === config.MISC_PANEL_SERIAL_NUMBER);

  if (foundPort) {
    console.log(`miscPanel port found: ${foundPort.path} / ${foundPort.serialNumber}`);

    miscPanel = new SerialPort({
      path: foundPort.path,
      baudRate: config.MISC_PANEL_BAUDRATE
    });
    commClient.miscPanel = miscPanel;
    commClient.miscPanel.connected = true;
    parser = miscPanel.pipe(new ByteLengthParser({ length: 4 }));
    miscPanel.on('close', () => {
      console.log('misc panel disconnected');
      commClient.miscPanel = { connected: false };
    });
    messageHandler(miscPanel, [0, 2], 3);
    parser.on('data', (data) => {
      const packet = [1];
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 8; j++) {
          if ((data[i] << j) & 0b10000000) {
            packet.push(i * 8 + j);
          }
        }
      }
      if (packet.length > 1) {
        messageHandler(miscPanel, packet, 3);
      }
    });
  }

  device = vj.vJoyDevice.create(2);
  udpClient = new XplaneUDPClient();
  wsClient = new WebSocketServer({
    port: config.WS_SERVER_PORT,
    host: '172.30.1.44'
  });
  console.log('initialized');



  wsClient.on('connection', (ws, req) => {
    ws.on('message', (message) => messageHandler(ws, message, 0));
  });

  udpClient.onMessage = (data) => {
    if (data[4]) {
      xpver = Math.floor(data[4] / 10000);
      udpClient.unsubscribe('sim/version/xplane_internal_version', 4);
    }
    if (xpver === 0) return;

    newAcft = lastAcft;
    for (let i = 0; i <= 3; i++) {
      if (data[i]) {
        newAcft = replaceCharAt(newAcft, i, String.fromCharCode(data[i]));
      }
    }
    if (newAcft !== lastAcft) {
      lastAcft = newAcft;
      console.log(`new acft: ${newAcft}`);

      if (fs.existsSync(`./profiles/${newAcft}xp${xpver}.js`)) {
        newProfile = `./profiles/${newAcft}xp${xpver}`;
        console.log(`using profile found for ${newAcft}/${xpver}`);
      } else if (fs.existsSync(`./profiles/${newAcft}.js`)) {
        newProfile = `./profiles/${newAcft}`;
        console.log(`using profile found for ${newAcft}`);
      } else {
        newProfile = './profiles/default';
        console.log(`no profile found for ${newAcft}/${xpver}, using default`);
      }

      if (lastProfile !== newProfile) {
        udpClient.subscribed.forEach(x => {
          if (x.index >= 5 && x.dref) {
            udpClient.unsubscribe(x.dref, x.index);
          }
        });
        profile = require(newProfile);
        profile.drNvar.forEach((e, i) => {
          e.n = 0;
          e.last = e.value;
          if (!e.counter) e.counter = e.freq * 10;
          if (e.dref) udpClient.subscribe(e.dref, i + 5, e.freq);
        });
        if (lastProfile === '') console.log(`loaded profile ${newProfile}`);
        else console.log(`reloaded changed profile to ${lastProfile} to ${newProfile}`);
        lastProfile = newProfile;
      } else {
        console.log('no profile change, continuing');
      }
    }
    if (newAcft === '    ') return;

    profile.drNvar.forEach((e, i) => {
      let newValue;
      if (e.dref && typeof data[i + 5] === 'undefined') return;
      if (e.process) {
        if (e.dref) {
          newValue = e.process(profile, data[i + 5]);
        } else {
          newValue = e.process(profile);
        }
      } else {
        newValue = data[i + 5];
      }
      if (profile.drNvar[i].value !== newValue) {
        profile.drNvar[i].last = profile.drNvar[i].value;
        profile.drNvar[i].value = newValue;
        if (profile.drNvar[i].execute) {
          if (!profile.drNvar[i].device || commClient[profile.drNvar[i].device].connected) {
            profile.drNvar[i].execute(profile, device, commClient, profile.drNvar[i]);
          }
        }
      }
      if (profile.drNvar[i].execute && profile.drNvar[i].n >= profile.drNvar[i].counter) {
        if (!profile.drNvar[i].device || commClient[profile.drNvar[i].device].connected) {
          profile.drNvar[i].execute(profile, device, commClient, profile.drNvar[i]);
        }
        profile.drNvar[i].n = 0;
      }
      if (!Number.isNaN(profile.drNvar[i].n)) profile.drNvar[i].n++;
    });
  };

  udpClient.init().then(() => {
    udpClient.subscribe('sim/aircraft/view/acf_ICAO[0]', 0, 1);
    udpClient.subscribe('sim/aircraft/view/acf_ICAO[1]', 1, 1);
    udpClient.subscribe('sim/aircraft/view/acf_ICAO[2]', 2, 1);
    udpClient.subscribe('sim/aircraft/view/acf_ICAO[3]', 3, 1);
    udpClient.subscribe('sim/version/xplane_internal_version', 4, 1);
  });

  process.on('exit', (code) => {
    udpClient.close();
    wsClient.close();
    if (miscPanel) miscPanel.close();
    device.free();
    console.log('Application closed');
  });
}

initializeApp();

function messageHandler(comm, message, offset) {
  let cmd;
  switch (message[0]) {
    case 0:
      if (message[1] < deviceNames.length + 1) {
        const device = deviceNames[message[1] - 1];
        commClient[device] = comm;
        commClient[device].connected = true;
        commClient[device].on('close', () => {
          commClient[device] = {
            connected: false
          };
          console.log(`${device} disconnected`);
        });
        console.log(`${device} connected`);
      } else {
        comm.close();
      }
      break;
    case 1:
      for (let i = 1; i < message.length; i++) {
        cmd = profile.command[message[i] + offset];
        if (cmd) cmd(profile, udpClient);
      }
      break;
  }
}
