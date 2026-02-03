

module.exports = {
    drNvar: [{
        value: 0,
        dref: 'FJS/732/Annun/SysAnnunLIT_50',
        process: (profile, value) => value >= 0.5,
        freq:1,
    },{
        value: 0,
        dref: 'FJS/732/Annun/SysAnnunLIT_52',
        process: (profile, value) => value >= 0.5,
        freq:1,
    },{
        value: 0,
        dref: 'FJS/732/Annun/SysAnnunLIT_53',
        process: (profile, value) => value >= 0.5,
        freq:1,
    },{
        value: 0,
        dref: 'FJS/732/Annun/SysAnnunLIT_51',
        process: (profile, value) => value >= 0.5,
        freq:1,
    },{
        value: 0,
        dref: 'FJS/732/Annun/SysAnnunLIT_54',
        process: (profile, value) => value >= 0.5,
        freq:1,
    },{
        value: 0,
        dref: 'FJS/732/Annun/SysAnnunLIT_55',
        process: (profile, value) => value >= 0.5,
        freq:1,
    },{
        value: 1,
        dref: 'FJS/727/Hyd/GearHandleMo',
        process: (profile, value) => {
            return Math.floor(value + 0.5) - 1
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
                if (profile.drNvar[6].value === 1) wsClient.gearPanel.ws.send("UP&LOCKED");
                else if (profile.drNvar[6].value === 0) wsClient.gearPanel.ws.send("OFF&LOCKED")
            }
        },
        device: 'gearPanel',
        counter: 10,
        n: 0
    }

    ],
    command: [
        [['FJS/727/Hyd/Com/GearHandleTuggle', (profile) => profile.drNvar[6].value === 1]],
        'sim/flight_controls/landing_gear_up',
        'sim/flight_controls/landing_gear_down',
    ]
}