

module.exports = {
    drNvar: [{
        value: 0,
        dref: 'laminar/B738/annunciator/right_gear_transit',
        process: (profile, value) => value >= 0.2,
        freq:1,
    },{
        value: 0,
        dref: 'laminar/B738/annunciator/left_gear_transit',
        process: (profile, value) => value >= 0.2,
        freq:1,
    },{
        value: 0,
        dref: 'laminar/B738/annunciator/nose_gear_transit',
        process: (profile, value) => value >= 0.2,
        freq:1,
    },{
        value: 0,
        dref: 'laminar/B738/annunciator/right_gear_safe',
        process: (profile, value) => value >= 0.2,
        freq:1,
    },{
        value: 0,
        dref: 'laminar/B738/annunciator/left_gear_safe',
        process: (profile, value) => value >= 0.2,
        freq:1,
    },{
        value: 0,
        dref: 'laminar/B738/annunciator/nose_gear_safe',
        process: (profile, value) => value >= 0.2,
        freq:1,
    },{
        value: 1,
        dref: 'laminar/B738/controls/gear_handle_down',
        process: (profile, value) => {
            return (value * 2 - 1)
        },
        freq:1,
    },
    {
        value: -1,
        process: (profile) => {
            return (2 * profile.drNvar[0].value * profile.drNvar[1].value * profile.drNvar[2].value) + (profile.drNvar[3].value * profile.drNvar[4].value * profile.drNvar[5].value) 
        },
        execute: (profile, vjDevice, wsClient, drNvar) => {
            // console.log(drNvar.value)
            if (drNvar.value === 2) {
                wsClient.gearPanel.ws.send("IN TRANSIT");
            } else if (drNvar.value === 1) {
                wsClient.gearPanel.ws.send("DN&LOCKED");
            } else if (drNvar.value === 3) {
                wsClient.gearPanel.ws.send("OFF&UNLCKD");
            } else {
                if (profile.drNvar[6].value === -1) wsClient.gearPanel.ws.send("UP&LOCKED");
                else if (profile.drNvar[6].value === 0) wsClient.gearPanel.ws.send("")
            }
        },
        device: 'gearPanel',
        counter: 10,
        n: 0
    }
    ],
    command: [
        'sim/flight_controls/landing_gear_off',
        'sim/flight_controls/landing_gear_up',
        'sim/flight_controls/landing_gear_down',
    ]
}