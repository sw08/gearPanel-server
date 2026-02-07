

module.exports = {
    drNvar: [{
        value: 0,
        dref: 'sim/flightmodel2/gear/deploy_ratio[0]',
        freq: 1,
    }, {
        value: 0,
        dref: 'sim/flightmodel2/gear/deploy_ratio[1]',
        freq: 1,
    }, {
        value: 0,
        dref: 'sim/flightmodel2/gear/deploy_ratio[3]',
        freq: 1,
    },
    {
        value: -1,
        process: (profile) => {
            if (profile.drNvar[0].value === profile.drNvar[1].value && profile.drNvar[1].value === profile.drNvar[2].value) {
                if (profile.drNvar[0].value === 1) {
                    return 1;
                } else {
                    if (profile.drNvar[3].value === 3 || (profile.drNvar[3].value === -1 && !profile.drNvar[0].value)) {
                        return 3;
                    } else {
                        return 0;
                    }
                }
            } else {
                return 2;
            }
        },
        execute: (profile, vjDevice, wsClient, drNvar) => {
            // console.log(drNvar.value)
            switch (drNvar.value) {
                case 0:
                    wsClient.gearPanel.ws.send("UP");
                    profile.drNvar[3].delay = setTimeout(() => {
                        wsClient.gearPanel.ws.send("");
                        profile.drNvar[3].value = 3;
                        profile.drNvar[3].delay = undefined;
                    }, 10000);
                    break;
                case 1:
                    clearTimeout(profile.drNvar[3].delay)
                    profile.drNvar[3].delay = undefined;
                    wsClient.gearPanel.ws.send("DOWN&GREEN");
                    break;
                case 2:
                    clearTimeout(profile.drNvar[3].delay)
                    profile.drNvar[3].delay = undefined;
                    wsClient.gearPanel.ws.send("IN TRANSIT");
                    break;
                case 3:
                    clearTimeout(profile.drNvar[3].delay)
                    profile.drNvar[3].delay = undefined;
                    wsClient.gearPanel.ws.send("");
                    break;
            }
        },
        device: 'gearPanel',
        counter: 10,
        n: 0
    }

    ],
    command: [
        null,
        'sim/flight_controls/landing_gear_up',
        'sim/flight_controls/landing_gear_down',
    ]
}