

module.exports = {
    drNvar: [{
        value: 0,
        dref: 'FJS/Q4XP/Annunciators/GearHandle_Lit[0]',
        freq: 1,
    }, {
        value: 0,
        dref: 'FJS/Q4XP/Manips/GearDeployHandle_Ctl[0]',
        freq: 1,
    }, 
    {
        value: 3,
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