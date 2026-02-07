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
let xpver = 0;
let lastProfile = '';
let newProfile = '';

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
                                if (typeof x === 'object') {
                                    if (x[1](profile)) {
                                        udpClient.executeCommand(x[0]);
                                        return false;
                                    } else {
                                        return true;
                                    }
                                } else {
                                    udpClient.executeCommand(x);
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

    if (data[4]) {
        xpver = Math.floor(data[4] / 10000);
        udpClient.unsubscribe('sim/version/xplane_internal_version', 4);
    }
    if (xpver === 0) return;
    newAcft = lastAcft;
    for (let i = 0; i <= 3; i++) {
        if (data[i]) {
            newAcft = replaceCharAt(newAcft, i, String.fromCharCode(data[i]))
        }
    }
    if (newAcft !== lastAcft) {
        lastAcft = newAcft;
        console.log(`new acft: ${newAcft}`)

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
                if (e.dref) udpClient.subscribe(e.dref, i + 5, e.freq);
            });
            if (lastProfile === '') console.log(`loaded profile ${newProfile}`);
            else console.log(`reloaded changed profile to ${lastProfile} to ${newProfile}`);
            lastProfile = newProfile;
        } else {
            console.log('no profile change, continuing');
        }
    }
    if (newAcft === "    ") return; // not ready to process -> profile is not loaded.

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
    udpClient.subscribe('sim/version/xplane_internal_version', 4, 1);
})


process.on('exit', (code) => {
    udpClient.close();
    device.free()
    console.log('d');
});
