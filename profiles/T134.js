

module.exports = {
    drNvar: [{
        value: 0,
        dref: 'sim/cockpit2/annunciators/gear_unsafe',
        freq: 1,
    }, {
        value: 1,
        dref: 'cust/t134/control/gear_hdl_pos',
        freq: 1,
    },
    {
        value: -1,
        process: (profile) => {
            if (profile.drNvar[0].value) {
                return 3;
            } else {
                return profile.drNvar[1].value;
            }
        },
        execute: (profile, vjDevice, wsClient, drNvar) => {
            // console.log(drNvar.value)
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
            ['SCS/t134/commands/gear_hndl_up', profile => profile.drNvar[1].value === 2],
            ['SCS/t134/commands/gear_hndl_down', profile => profile.drNvar[1].value === 0]
        ],
        ['SCS/t134/commands/gear_hndl_up','SCS/t134/commands/gear_hndl_up'],
        ['SCS/t134/commands/gear_hndl_down','SCS/t134/commands/gear_hndl_down']
    ]
}