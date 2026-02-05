

module.exports = {
    drNvar: [
        {
            value: 0,
            dref: 'tu154b2/custom/lights/gears_red_front',
            freq: 1,
        }, {
            value: 0,
            dref: 'tu154b2/custom/lights/gears_red_left',
            freq: 1,
        }, {
            value: 0,
            dref: 'tu154b2/custom/lights/gears_red_right',
            freq: 1,
        }, {
            value: 0,
            dref: 'tu154b2/custom/lights/gears_green_front',
            freq: 1,
        }, {
            value: 0,
            dref: 'tu154b2/custom/lights/gears_green_left',
            freq: 1,
        }, {
            value: 0,
            dref: 'tu154b2/custom/lights/gears_green_right',
            freq: 1,
        }, {
            value: 1,
            dref: 'tu154b2/custom/controll/gear_lever',
            freq: 1,
        }, {
            value: -1,
            process: (profile) => {
                if (profile.drNvar[0].value || profile.drNvar[1].value || profile.drNvar[2].value) {
                    return 3;
                } else if (profile.drNvar[6].value === 1) {
                    if (profile.drNvar[3].value * profile.drNvar[4].value * profile.drNvar[5].value) return 2;
                    else return profile.drNvar[7].value;          
                } else {
                    return profile.drNvar[6].value + 1;
                }
            },
            execute: (profile, vjDevice, wsClient, drNvar) => {
                switch (drNvar.value) {
                    case 0:
                        wsClient.gearPanel.ws.send("UP&LOCKED");
                        break;
                    case 1:
                        wsClient.gearPanel.ws.send("");
                        break;
                    case 2:
                        wsClient.gearPanel.ws.send("DN&LOCKED");
                        break;
                    case 3:
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
        [
            ['sim/flight_controls/landing_gear_up', profile => profile.drNvar[6].value === 1],
            ['sim/flight_controls/landing_gear_down', profile => profile.drNvar[6].value === -1]
        ],
        ['sim/flight_controls/landing_gear_up', 'sim/flight_controls/landing_gear_up'],
        ['sim/flight_controls/landing_gear_down', 'sim/flight_controls/landing_gear_down']
    ]
}