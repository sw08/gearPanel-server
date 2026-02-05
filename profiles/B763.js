

module.exports = {
    drNvar: [{
        value: 0,
        dref: 'sim/cockpit2/annunciators/gear_unsafe',
        // execute: (profile, vjDevice, )
        freq:3,
    },{
        value: 0,
        dref: 'sim/cockpit/switches/gear_handle_status',
        freq:3,
    },
    {
        value: -1,
        process: (profile) => {
            return profile.drNvar[0].value === 1 ? 1 : profile.drNvar[1].value * 2;
        },
        execute: (profile, vjDevice, wsClient, drNvar) => {
            // console.log(profile.drNvar[0].value)
            switch (drNvar.value) {
                case 0:
                    wsClient.gearPanel.ws.send("");
                    break;
                case 1:
                    wsClient.gearPanel.ws.send("IN TRANSIT");
                    break;
                case 2:
                    wsClient.gearPanel.ws.send("DN&LOCKED");
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
        [['sim/flight_controls/landing_gear_up', (profile) => profile.drNvar[1].value === 1]],
        [['sim/flight_controls/landing_gear_down', (profile) => profile.drNvar[1].value === 0]]
    ]
}