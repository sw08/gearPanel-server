

module.exports = {
    drNvar: [{
        value: 0,
        dref: 'sim/cockpit2/annunciators/gear_unsafe',
        freq: 1,
    }, {
        value: 0,
        dref: 'sim/cockpit/switches/gear_handle_status',
        freq: 1,
    }, 
    {
        value: -1,
        process: (profile) => {
            if (profile.drNvar[0].value) {
                return 2;
            } else {
                return profile.drNvar[1].value;
            }
        },
        execute: (profile, vjDevice, wsClient, drNvar) => {
            // console.log(drNvar.value)
            switch (drNvar.value) {
                case 0:
                    wsClient.gearPanel.ws.send("");
                    break;
                case 1:
                    wsClient.gearPanel.ws.send("DOWN&GREEN");
                    break;
                case 2:
                    wsClient.gearPanel.ws.send("IN TRANSIT");
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