const XplaneUDPClient = require('./xplane-udp');
const { WebSocketServer } = require('ws');
const config = require('./config');
const vj = require('vjoy');
const fs = require('fs');

const device = vj.vJoyDevice.create(2);
const udpClient = new XplaneUDPClient();
const wsClient = new WebSocketServer({ port: config.WS_SERVER_PORT, host: '172.30.1.44' })

function replaceCharAt(text, i, newChar) { return text.substring(0, i) + newChar + text.substring(i + 1); };

let lastAcft = "    ";
let newAcft = "    ";
let profile = require(`./profiles/default.js`);

wsClient.gearPanel = {
    connected: false
};
wsClient.on('connection', (ws, req) => {
    ws.on('message', (message) => {
        switch (message[0]) {
            case 0:
                if (message[1] === 1) {
                    wsClient.gearPanel.connected = true;
                    wsClient.gearPanel.ws = ws;
                    console.log('gearPanel connected')
                } else {
                    ws.close();
                }
                break;
            case 1:
                for (let i = 1; i < message.length; i++) {
                    if (profile.command[message[i]]) {
                        if (typeof profile.command[message[i]] === 'string') { // single command without condition
                            udpClient.executeCommand(profile.command[message[i]]);
                        } else { // single command / possibly multiple commands with condition.
                            
                            profile.command[message[i]].every(x => {
                                if (x[1](profile)) {
                                    udpClient.executeCommand(x[0]);
                                    return false;
                                } else {
                                    return true;
                                }
                            })
                        }
                    }
                }
                break;
        }
    })
});
// wsClient.on('close', (ws, ))

udpClient.onMessage = (data) => {
    newAcft = lastAcft;
    for (let i = 0; i < 4; i++) {
        if (data[i]) {
            newAcft = replaceCharAt(newAcft, i, String.fromCharCode(data[i]))
        }
    }
    if (newAcft !== lastAcft) {
        lastAcft = newAcft;
        udpClient.subscribed.forEach(x => {
            if (x.index > 3 && x.dref) {
                udpClient.unsubscribe(x.dref, x.index);
            }
        });
        console.log(`new acft: ${newAcft}`)
        if (fs.existsSync(`./profiles/${newAcft}.js`)) {
            profile = require(`./profiles/${newAcft}`);
            console.log(`profile changed to ${newAcft}`);
        }
        else {
            profile = require('./profiles/default.js');
            console.log(`no profile found for ${newAcft}, changing to default`);
        }
        profile.drNvar.forEach((e, i) => {
            if (e.dref) udpClient.subscribe(e.dref, i + 4, e.freq);
        });
    }
    if (newAcft === "    ") return; // not ready to process -> profile is not loaded.

    profile.drNvar.forEach((e, i) => {
        let newValue;
        if (e.dref && typeof data[i + 4] === 'undefined') return;
        if (e.process) {
            if (e.dref) {
                newValue = e.process(profile, data[i + 4]);
            } else {
                newValue = e.process(profile);
            }
        } else {
            newValue = data[i + 4];
        }
        if (profile.drNvar[i].value != newValue) { // value is changed.
            profile.drNvar[i].value = newValue;
            if (profile.drNvar[i].execute) {
                if (!profile.drNvar[i].device || wsClient[profile.drNvar[i].device].connected) {// && vj.isEnabled()) {
                    profile.drNvar[i].execute(profile, device, wsClient, profile.drNvar[i]);
                }
            }
        }
        if (profile.drNvar[i].n >= profile.drNvar[i].counter) {
            if (!profile.drNvar[i].device || wsClient[profile.drNvar[i].device].connected) {// && vj.isEnabled()) {
                profile.drNvar[i].execute(profile, device, wsClient, profile.drNvar[i]);
            }
            profile.drNvar[i].n = 0;
        }
        if (!Number.isNaN(profile.drNvar[i].n)) profile.drNvar[i].n++;
    });
}

udpClient.init().then(() => {
    udpClient.subscribe('sim/aircraft/view/acf_ICAO[0]', 0, 1);
    udpClient.subscribe('sim/aircraft/view/acf_ICAO[1]', 1, 1);
    udpClient.subscribe('sim/aircraft/view/acf_ICAO[2]', 2, 1);
    udpClient.subscribe('sim/aircraft/view/acf_ICAO[3]', 3, 1);
})


process.on('exit', (code) => {
    udpClient.close();
    device.free()
    console.log('d');
});
